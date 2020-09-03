/** IMPORTS */
import * as RC from '../../../src/RenderCore.js';
import {HEP} from './HEP.js';
import {Utility} from './Utility.js';
import Tracks from './data/Tracks.js';


export default class CollisionEventLoader {
    constructor (manager = new RC.LoadingManager()) {
        this._manager = (manager !== undefined) ? manager : new RC.LoadingManager();
    }


    load (url, onLoad, onProgress, onError) {

        let loader = new RC.XHRLoader(this._manager);
        let scope = this;

        //loader.setPath(this._path);
        loader.load(
            url,
            function (text) {
                onLoad(scope.parse(text));
            },
            onProgress,
            onError
        );
    }


    //FUNC
    parse(data){
        let parsedData = JSON.parse(Utility.csvToJSON(data));

        console.log(this._manager.itemsLoaded);
        //console.log(parsedData);

        return parsedData;
    }



    loadCollisionDataV2(particlesData, hitsData, cellsData, truthData, modelsMinMaxPositions) {
        //collision event == one collision of bunched protons near detector center)
        let initial_particles = particlesData;
        let detected_hits = hitsData;
        let cells = cellsData;
        let truth = truthData;
        let tracks = {};

        let g_trackIDMap = {};

        truth.forEach(function(currentValue, index, arr){
            /*for(var i = index+1; i < truthData.length; i++){
                if(currentValue.particle_id == truthData[i].particle_id){

                }
            }*/

            if(currentValue.particle_id === "0") return; //add to tracks if its not noise (noise id = 0)
            if(tracks[currentValue.particle_id] === undefined) tracks[currentValue.particle_id] = new Array();
            tracks[currentValue.particle_id].push(currentValue);
        });

        //add initial particle position into tracks
        initial_particles.forEach(function(currentValue, index, arr) {
            var Particle = {
                //hit_id: undefined, //no hit id, its a collision origin
                hit_id: -1,
                particle_id: currentValue.particle_id,
                tx: currentValue.vx,
                ty: currentValue.vy,
                tz: currentValue.vz,
                tpx: currentValue.px,
                tpy: currentValue.py,
                tpz: currentValue.pz,
                nhits: currentValue.nhits
            };

            //if initial particle has a track, add to beginning of an array (function unshift)
            if(tracks[currentValue.particle_id] !== undefined){
                tracks[currentValue.particle_id].unshift(Particle);
            } else{
                //LONE PARTICLE (no corresponding hits, therefore no tracks)
                //console.log("ALONE: " + currentValue.particle_id);
            }
        });


        for(let key in tracks){

            if(true && tracks[key].length <= 16){
                delete tracks[key];
            }else {

                tracks[key].sort(function (a, b) {
                    //return (new RC.Vector3(b.tx, b.ty, b.tz).length()) - (new RC.Vector3(a.tx, a.ty, a.tz).length());
                    return (new RC.Vector3(b.tpx, b.tpy, b.tpz).length()) - (new RC.Vector3(a.tpx, a.tpy, a.tpz).length());
                });

                //tracks[key] = Utility.perp(tracks[key], tracks[key].length * 8);
            }
        }


        //TRACK SIZE MANIPULATION
        /*let track_ID_keys = Object.keys(tracks).map(Number);
        let max_track_ID = Number.NEGATIVE_INFINITY;
        for(let i = 0; i < track_ID_keys.length; i++){
            if(track_ID_keys[i] > max_track_ID) max_track_ID = track_ID_keys[i];
        }

        let desired_track_size = 60000;
        let new_tracks = {};
        let padd = 0;
        for(let i = 0; i < desired_track_size; i++){
            if(i >= track_ID_keys.length) padd = max_track_ID + 1;

            new_tracks[i] = tracks[track_ID_keys[i%track_ID_keys.length]];
        }
        tracks = new_tracks;*/
        //TRACK SIZE MANIPULATION 2
        /*let track_ID_keys = Object.keys(tracks);
        let desired_track_size = 60000;
        let new_tracks = {};

        for(let i = 0; i < desired_track_size; i++){

            new_tracks[i] = tracks[track_ID_keys[i%track_ID_keys.length]];
        }
        tracks = new_tracks;*/


        //calculate length needed later for attribute buffers
        var numTracks = 0;
        var tracksVertexSize = 0;
        var pairedTracksVertexSize = 0;
        /*for(var key in tracks){
            tracksVertexSize += tracks[key].length;
            pairedTracksVertexSize += tracks[key].length + tracks[key].length - 2;
            numTracks++;
        }*/
        let tracksKeys = Object.keys(tracks);
        for(let i = 0; i < tracksKeys.length; i++){
            tracksVertexSize += tracks[tracksKeys[i]].length;
            pairedTracksVertexSize += tracks[tracksKeys[i]].length + tracks[tracksKeys[i]].length - 2;

            g_trackIDMap[tracksKeys[i]] = i;
        }numTracks = tracksKeys.length;


        //event info stats
        console.log("N Particles: " + initial_particles.length);
        console.log("N Hits: " + detected_hits.length);
        console.log("N Tracks: " + Object.keys(tracks).length);






        /*************************************** INITIAL PARTICLES ********************************************/
        //console.log("Particles: " ); console.log(initial_particles);

        /*var attributes = new Float32Array(initial_particles.length * 7); //will save 7 values from each object of initial_particles
        for(var i = 0; i < initial_particles.length; i++){
            attributes[i*7 + 0] = initial_particles[i].particle_id;
            attributes[i*7 + 1] = initial_particles[i].vx;
            attributes[i*7 + 2] = initial_particles[i].vy;
            attributes[i*7 + 3] = initial_particles[i].vz;
            attributes[i*7 + 4] = initial_particles[i].px;
            attributes[i*7 + 5] = initial_particles[i].py;
            attributes[i*7 + 6] = initial_particles[i].pz;
        }
        particlesGeometry.addAttribute("attributes", new RC.BufferAttribute(attributes, 7));
        console.log("Particles attributes: "); console.log(attributes);*/

        var position = new Array(initial_particles.length * 3);
        for(var i = 0; i < initial_particles.length; i++){
            position[i*3 + 0] = initial_particles[i].vx;
            position[i*3 + 1] = initial_particles[i].vy;
            position[i*3 + 2] = initial_particles[i].vz;
        }

        const momentum = new Array(initial_particles.length * 3);
        const momentumMagnitude = new Array(initial_particles.length);
        let momentumMagnitudeClamped, momentumMagnitudeMapped;
        let momentumMagnitudeMean, momentumMagnitudeStd;
        let momentumMagnitudeClampedMin, momentumMagnitudeClampedMax;
        let momentumVec = new RC.Vector3();

        const NHits = new Array(initial_particles.length);
        let NHitsClamped, NHitsMapped;
        let NHitsClampedMin, NHitsClampedMax;
        let NHitsMean, NHitsStd;

        /*let maxMomentumNorm = 0;
        for(var i = 0; i < initial_particles.length; i++) {
            momentumVec.x = initial_particles[i].px;
            momentumVec.y = initial_particles[i].py;
            momentumVec.z = initial_particles[i].pz;

            if(momentumVec.length() > maxMomentumNorm) maxMomentumNorm = momentumVec.length();
        }*/
        for(let i = 0; i < initial_particles.length; i++){
            momentumVec.x = initial_particles[i].px;
            momentumVec.y = initial_particles[i].py;
            momentumVec.z = initial_particles[i].pz;

            momentumMagnitude[i] = momentumVec.length();

            NHits[i] = initial_particles[i].nhits;


            momentumVec.normalize();
            //momentumVec.divideScalar(maxMomentumNorm);
            momentumVec.multiplyScalar(0.5);
            momentumVec.addScalar(0.5);


            momentum[i*3 + 0] = momentumVec.x;
            momentum[i*3 + 1] = momentumVec.y;
            momentum[i*3 + 2] = momentumVec.z;
        }


        momentumMagnitudeMean = Utility.mean(momentumMagnitude);
        momentumMagnitudeStd = Utility.std(momentumMagnitude, momentumMagnitudeMean);
        momentumMagnitudeClamped = Utility.clamp(momentumMagnitude, momentumMagnitudeMean - momentumMagnitudeStd, momentumMagnitudeMean + momentumMagnitudeStd);

        momentumMagnitudeClampedMin = Utility.findMin(momentumMagnitudeClamped);
        momentumMagnitudeClampedMax = Utility.findMax(momentumMagnitudeClamped);
        momentumMagnitudeMapped = Utility.map(momentumMagnitudeClamped, momentumMagnitudeClampedMin, momentumMagnitudeClampedMax, 0.125, 1);


        NHitsMean = Utility.mean(NHits);
        NHitsStd = Utility.std(NHits, NHitsMean);
        NHitsClamped = Utility.clamp(NHits, NHitsMean - NHitsStd, NHitsMean + NHitsStd);

        NHitsClampedMin = Utility.findMin(NHitsClamped);
        NHitsClampedMax = Utility.findMax(NHitsClamped);
        NHitsMapped = Utility.map(NHitsClamped, NHitsClampedMin, NHitsClampedMax, 0.125, 8);


        var particle_id = new Array(initial_particles.length);
        for(var i = 0; i < initial_particles.length; i++){
            //particle_id[i] = initial_particles[i].particle_id;
            if(g_trackIDMap[ initial_particles[i].particle_id ] !== undefined) {
                particle_id[i] = g_trackIDMap[initial_particles[i].particle_id];
            }else{
                particle_id[i] = g_trackIDMap[initial_particles[i].particle_id];
            }
        }


        //GEOMETRY
        var particlesGeometry = new RC.Geometry();
        particlesGeometry.vertices = new RC.Float32Attribute(position, 3);
        //particlesGeometry.computeVertexNormals();


        //MATERIAL
        let particleATTRUNIObject = {
            "attributes": {
                "momentum": new RC.Float32Attribute(momentum, 3),
                "momentumMagnitude": new RC.Float32Attribute(momentumMagnitudeMapped, 1),
                "nhits": new RC.Float32Attribute(NHitsMapped, 1),
                "particle_id": new RC.Uint32Attribute(particle_id, 1)
            },

            "uniforms": {
                "selectedTrackVisible": +HEP.params.visibleSelectedTrack,
                "selectedTrackID": HEP.params.selectedTrackID,
                "particle_size": HEP.params.particlesSize,

                "particle_color_type": HEP.params.particlesColorType,
                "particle_color": new RC.Color(HEP.params.particlesColor).toArray(),
                "particle_alpha": HEP.params.opacityParticles
            }
        };


        let particleMaterial = new RC.CustomShaderMaterial("initialParticle", particleATTRUNIObject.uniforms, particleATTRUNIObject.attributes);
        particleMaterial.transparent = true;
        particleMaterial.depthTest = false;
        particleMaterial.depthWrite = false;
        const particlePickingMaterial = new RC.PickingShaderMaterial("particle");


        //OBJECT
        let particlesObject = new RC.Point(particlesGeometry, particleMaterial, particlePickingMaterial);
        //let particlesObject = new RC.Mesh(particlesGeometry, particleMaterial);
        //particlesObject.usePoints = true;

        //return particlesObject;


        /************************************** DETECTED HITS *************************************************/
        //console.log("Hits: " ); console.log(detected_hits);

        var hitsPositions = new Array(detected_hits.length * 3);
        var hitsIDs = new Array(detected_hits.length);
        var hitsParticleID = new Array(detected_hits.length);

        //var submittedHitsParticleID = new Float32Array(detected_hits.length);
        //let el;
        for(var i = 0; i < detected_hits.length; i++){
            hitsPositions[i*3 + 0] = detected_hits[i].x;
            hitsPositions[i*3 + 1] = detected_hits[i].y;
            hitsPositions[i*3 + 2] = detected_hits[i].z;

            hitsIDs[i] = detected_hits[i].hit_id;

            //hitsParticleID[i] = truth[i].particle_id;
            hitsParticleID[i] = g_trackIDMap[ truth[i].particle_id ];
            /*el = truth.find(function (hit) {
                return hit.hit_id === detected_hits[i].hit_id;
            });
            hitsParticleID[i] = el.particle_id;*/


            //if(params.compareSubmissionData) submittedHitsParticleID[i] = submissionData[i].track_id;
        }


        //GEOMETRY
        let hitsGeometry = new RC.Geometry();
        hitsGeometry.vertices = new RC.Float32Attribute(hitsPositions, 3);
        //hitsGeometry.computeVertexNormals();


        //MATERIAL
        let hitATTRUNIObject = {
            "attributes": {
                "hit_id": new RC.Uint32Attribute(hitsIDs, 1),
                "hit_particle_id": new RC.Uint32Attribute(hitsParticleID, 1)
            },

            "uniforms": {
                //"cameraPosition": g_camera.position,

                selectedHitVisible: +HEP.params.visibleSelectedHit,
                selectedHitID: HEP.params.selectedHitID,
                selected_hit_size: HEP.params.sizeSelectedHit,
                selected_hit_alpha: HEP.params.opacitySelectedHit,
                selected_hit_color: new RC.Color(HEP.params.selectedHitColor).toArray(),
                selected_hit_color_type: HEP.params.selectedHitColorType,

                selectedTrackVisible: +HEP.params.visibleSelectedTrack,
                selectedTrackID: HEP.params.selectedTrackID,

                //submissionTesting: {type: "i", value: +params.compareSubmissionData},

                hit_size: HEP.params.hitsSize,
                hit_color: new RC.Color(HEP.params.hitsColor).toArray(),
                hit_alpha: HEP.params.opacityHits,
                hit_color_type: HEP.params.hitsColorType,

                minMaxBeamPipe: [modelsMinMaxPositions["BeamPipe"].min, modelsMinMaxPositions["BeamPipe"].max],
                minMaxPix: [modelsMinMaxPositions["Pix"].min, modelsMinMaxPositions["Pix"].max],
                minMaxPST: [modelsMinMaxPositions["PST"].min, modelsMinMaxPositions["PST"].max],
                minMaxSStrip: [modelsMinMaxPositions["SStrip"].min, modelsMinMaxPositions["SStrip"].max],
                minMaxLStrip: [modelsMinMaxPositions["LStrip"].min, modelsMinMaxPositions["LStrip"].max],

                colorBeamPipe: new RC.Color(HEP.params.colorBeamPipe).add(new RC.Color(HEP.params.ecolorBeamPipe)).toArray(),
                colorPix: new RC.Color(HEP.params.colorPix).add(new RC.Color(HEP.params.ecolorPix)).toArray(),
                colorPST: new RC.Color(HEP.params.colorPST).add(new RC.Color(HEP.params.ecolorPST)).toArray(),
                colorSStrip: new RC.Color(HEP.params.colorSStrip).add(new RC.Color(HEP.params.ecolorSStrip)).toArray(),
                colorLStrip: new RC.Color(HEP.params.colorLStrip).add(new RC.Color(HEP.params.ecolorLStrip)).toArray()
            }
        };

        let hitMaterial = new RC.CustomShaderMaterial("hit", hitATTRUNIObject.uniforms, hitATTRUNIObject.attributes);
        hitMaterial.transparent = true;
        hitMaterial.depthTest = false;
        hitMaterial.depthWrite = false;
        //hitMaterial.side = RC.FRONT_AND_BACK_SIDE;
        const hitPickingMaterial = new RC.PickingShaderMaterial("hit", {hit_size: HEP.params.hitsSize});


        //OBJECT
        let hitsObject = new RC.Point(hitsGeometry, hitMaterial, hitPickingMaterial);
        //let hitsObject = new RC.Mesh(hitsGeometry, hitMaterial);
        //hitsObject.usePoints = true;


        //return [particlesObject, hitsObject];


        /******************************************* DETECTED TRACKS ******************************************/
        //console.log("Tracks: " ); console.log(tracks);

        //NON-INDEXED
        var trackPairPositionsNonIndexed = new Array(pairedTracksVertexSize * 3);
        var trackPairMomentumsNonIndexed = new Array(pairedTracksVertexSize * 3);
        let trackMomentumVecNonIndexed = new RC.Vector3();
        var tracksIDsNonIndexed = new Array(pairedTracksVertexSize);
        var i = 0;
        var k = 0;
        for(var key in tracks){
            for(var j = 0; j < tracks[key].length; j++) { //preverjeno za pare dela in za ID //a jih uredu concatenata?
                trackPairPositionsNonIndexed[i + 0] = tracks[key][j].tx;
                trackPairPositionsNonIndexed[i + 1] = tracks[key][j].ty;
                trackPairPositionsNonIndexed[i + 2] = tracks[key][j].tz;
                //trackPairMomentumsNonIndexed[i + 0] = tracks[key][j].tpx;
                //trackPairMomentumsNonIndexed[i + 1] = tracks[key][j].tpy;
                //trackPairMomentumsNonIndexed[i + 2] = tracks[key][j].tpz;

                trackMomentumVecNonIndexed.x = tracks[key][j].tpx;
                trackMomentumVecNonIndexed.y = tracks[key][j].tpy;
                trackMomentumVecNonIndexed.z = tracks[key][j].tpz;
                trackMomentumVecNonIndexed.normalize();
                trackMomentumVecNonIndexed.multiplyScalar(0.5);
                trackMomentumVecNonIndexed.addScalar(0.5);
                trackPairMomentumsNonIndexed[i + 0] = trackMomentumVecNonIndexed.x;
                trackPairMomentumsNonIndexed[i + 1] = trackMomentumVecNonIndexed.y;
                trackPairMomentumsNonIndexed[i + 2] = trackMomentumVecNonIndexed.z;

                //tracksIDs[k + 0] = key;
                tracksIDsNonIndexed[k + 0] = g_trackIDMap[ key ];


                if(j > 0 && j < tracks[key].length-1){
                    trackPairPositionsNonIndexed[i + 3] = tracks[key][j].tx;
                    trackPairPositionsNonIndexed[i + 4] = tracks[key][j].ty;
                    trackPairPositionsNonIndexed[i + 5] = tracks[key][j].tz;
                    //trackPairMomentumsNonIndexed[i + 3] = tracks[key][j].tpx;
                    //trackPairMomentumsNonIndexed[i + 4] = tracks[key][j].tpy;
                    //trackPairMomentumsNonIndexed[i + 5] = tracks[key][j].tpz;

                    trackMomentumVecNonIndexed.x = tracks[key][j].tpx;
                    trackMomentumVecNonIndexed.y = tracks[key][j].tpy;
                    trackMomentumVecNonIndexed.z = tracks[key][j].tpz;
                    trackMomentumVecNonIndexed.normalize();
                    trackMomentumVecNonIndexed.multiplyScalar(0.5);
                    trackMomentumVecNonIndexed.addScalar(0.5);
                    trackPairMomentumsNonIndexed[i + 3] = trackMomentumVecNonIndexed.x;
                    trackPairMomentumsNonIndexed[i + 4] = trackMomentumVecNonIndexed.y;
                    trackPairMomentumsNonIndexed[i + 5] = trackMomentumVecNonIndexed.z;

                    //tracksIDs[k + 1] = key;
                    tracksIDsNonIndexed[k + 1] = g_trackIDMap[ key ];


                    i += 3; k++;
                }


                i += 3; k++;
            }
        }


        //GEOMETRY + DOUBLE
        //var tracksGeometry = new RC.BufferGeometry();
        let tracksGeometryNonIndexed = new RC.Geometry();
        tracksGeometryNonIndexed.vertices = new RC.Float32Attribute(trackPairPositionsNonIndexed, 3);
        //tracksGeometry.computeVertexNormals();


        //MATERIAL
        let trackATTRUNIObjectNonIndexed = {
            "attributes": {
                "momentum": new RC.Float32Attribute(trackPairMomentumsNonIndexed, 3),
                "track_id": new RC.Uint32Attribute(tracksIDsNonIndexed, 1)
            },

            "uniforms": {
                //cameraPosition: g_camera.position,

                selectedTrackVisible: +HEP.params.visibleSelectedTrack,
                selectedTrackID: HEP.params.selectedTrackID,
                numTracks: Object.keys(tracks).length,
                track_size: HEP.params.tracksSize,
                track_color: new RC.Color(HEP.params.tracksColor*0.4).toArray(),
                track_alpha: HEP.params.opacityTracks,
                track_color_type: HEP.params.tracksColorType,

                minMaxBeamPipe: [modelsMinMaxPositions["BeamPipe"].min, modelsMinMaxPositions["BeamPipe"].max],
                minMaxPix: [modelsMinMaxPositions["Pix"].min, modelsMinMaxPositions["Pix"].max],
                minMaxPST: [modelsMinMaxPositions["PST"].min, modelsMinMaxPositions["PST"].max],
                minMaxSStrip: [modelsMinMaxPositions["SStrip"].min, modelsMinMaxPositions["SStrip"].max],
                minMaxLStrip: [modelsMinMaxPositions["LStrip"].min, modelsMinMaxPositions["LStrip"].max],

                colorBeamPipe: new RC.Color(HEP.params.colorBeamPipe).add(new RC.Color(HEP.params.ecolorBeamPipe)).toArray(),
                colorPix: new RC.Color(HEP.params.colorPix).add(new RC.Color(HEP.params.ecolorPix)).toArray(),
                colorPST: new RC.Color(HEP.params.colorPST).add(new RC.Color(HEP.params.ecolorPST)).toArray(),
                colorSStrip: new RC.Color(HEP.params.colorSStrip).add(new RC.Color(HEP.params.ecolorSStrip)).toArray(),
                colorLStrip: new RC.Color(HEP.params.colorLStrip).add(new RC.Color(HEP.params.ecolorLStrip)).toArray()
            }
        };

        let trackMaterialNonIndexed = new RC.CustomShaderMaterial("track", trackATTRUNIObjectNonIndexed.uniforms, trackATTRUNIObjectNonIndexed.attributes);
        trackMaterialNonIndexed.transparent = true;
        trackMaterialNonIndexed.depthTest = false;
        trackMaterialNonIndexed.depthWrite = false;
        //trackMaterialNonIndexed.side = RC.FRONT_AND_BACK_SIDE;



        //OBJECT
        let tracksObjectNonIndexed = new RC.Line(tracksGeometryNonIndexed, trackMaterialNonIndexed);
        tracksObjectNonIndexed.renderingPrimitive = RC.LINES;



        //INDEXED
        var tracksIndices = [];

        var trackPairPositions = new Array(tracksVertexSize * 3);

        var trackPairMomentums = new Array(tracksVertexSize * 3);
        const trackPairMomentumMagnitude = new Array(tracksVertexSize);
        let trackPairMomentumMagnitudeClamped, trackPairMomentumMagnitudeMapped;
        let trackPairMomentumMagnitudeMean, trackPairMomentumMagnitudeStd;
        let trackPairMomentumMagnitudeClampedMin, trackPairMomentumMagnitudeClampedMax;

        const trackPairNHits = new Array(tracksVertexSize);
        let trackPairNHitsClamped, trackPairNHitsMapped;
        let trackPairNHitsClampedMin, trackPairNHitsClampedMax;
        let trackPairNHitsMean, trackPairNHitsStd;
        let nhitsTemp;

        let trackMomentumVec = new RC.Vector3();
        var tracksIDs = new Array(tracksVertexSize);
        var i = 0;
        var k = 0;
        for(var key in tracks){
            for (let j = 0; j < tracks[key].length; j++) {
                if (tracks[key][j].nhits !== undefined) {
                    nhitsTemp = tracks[key][j].nhits;
                    break;
                }
            }

            for(var j = 0; j < tracks[key].length; j++) { //preverjeno za pare dela in za ID //a jih uredu concatenata?
                trackPairPositions[i + 0] = tracks[key][j].tx;
                trackPairPositions[i + 1] = tracks[key][j].ty;
                trackPairPositions[i + 2] = tracks[key][j].tz;

                //trackPairMomentums[i + 0] = tracks[key][j].tpx;
                //trackPairMomentums[i + 1] = tracks[key][j].tpy;
                //trackPairMomentums[i + 2] = tracks[key][j].tpz;

                trackMomentumVec.x = tracks[key][j].tpx;
                trackMomentumVec.y = tracks[key][j].tpy;
                trackMomentumVec.z = tracks[key][j].tpz;


                trackPairMomentumMagnitude[k] = trackMomentumVec.length();


                trackMomentumVec.normalize();
                trackMomentumVec.multiplyScalar(0.5);
                trackMomentumVec.addScalar(0.5);


                trackPairMomentums[i + 0] = trackMomentumVec.x;
                trackPairMomentums[i + 1] = trackMomentumVec.y;
                trackPairMomentums[i + 2] = trackMomentumVec.z;


                trackPairNHits[k] = nhitsTemp;


                //tracksIDs[k + 0] = key;
                tracksIDs[k + 0] = g_trackIDMap[ key ];

                tracksIndices.push(k);

                if(j > 0 && j < tracks[key].length-1){
                    tracksIndices.push(k);
                }


                i += 3; k += 1;
            }

        }


        trackPairMomentumMagnitudeMean = Utility.mean(trackPairMomentumMagnitude);
        trackPairMomentumMagnitudeStd = Utility.std(trackPairMomentumMagnitude, trackPairMomentumMagnitudeMean);
        trackPairMomentumMagnitudeClamped = Utility.clamp(trackPairMomentumMagnitude, trackPairMomentumMagnitudeMean - trackPairMomentumMagnitudeStd, trackPairMomentumMagnitudeMean + trackPairMomentumMagnitudeStd);

        trackPairMomentumMagnitudeClampedMin = Utility.findMin(trackPairMomentumMagnitudeClamped);
        trackPairMomentumMagnitudeClampedMax = Utility.findMax(trackPairMomentumMagnitudeClamped);
        trackPairMomentumMagnitudeMapped = Utility.map(trackPairMomentumMagnitudeClamped, trackPairMomentumMagnitudeClampedMin, trackPairMomentumMagnitudeClampedMax, 0.0625, 1*2.0);

        trackPairNHitsMean = Utility.mean(trackPairNHits);
        trackPairNHitsStd = Utility.std(trackPairNHits, trackPairNHitsMean);
        trackPairNHitsClamped = Utility.clamp(trackPairNHits, trackPairNHitsMean - trackPairNHitsStd, trackPairNHitsMean + trackPairNHitsStd);

        trackPairNHitsClampedMin = Utility.findMin(trackPairNHitsClamped);
        trackPairNHitsClampedMax = Utility.findMax(trackPairNHitsClamped);
        trackPairNHitsMapped = Utility.map(trackPairNHitsClamped, trackPairNHitsClampedMin, trackPairNHitsClampedMax, 0.125, 8);


        //GEOMETRY + INDICES
        let tracksGeometry = new RC.Geometry();
        tracksGeometry.indices = new RC.Uint32Attribute(tracksIndices, 1);
        tracksGeometry.vertices = new RC.Float32Attribute(trackPairPositions, 3);
        //tracksGeometry.computeVertexNormals();




        //MATERIAL
        let trackATTRUNIObject = {
            "attributes": {
                "momentum": new RC.Float32Attribute(trackPairMomentums, 3),
                "momentumMagnitude": new RC.Float32Attribute(trackPairMomentumMagnitudeMapped, 1),
                "nhits": new RC.Float32Attribute(trackPairNHitsMapped, 1),
                "track_id": new RC.Uint32Attribute(tracksIDs, 1)
            },

            "uniforms": {
                //cameraPosition: g_camera.position,

                selectedTrackVisible: +HEP.params.visibleSelectedTrack,
                selectedTrackID: HEP.params.selectedTrackID,
                numTracks: Object.keys(tracks).length,
                track_size: HEP.params.tracksSize,
                track_color: new RC.Color(HEP.params.tracksColor).toArray(),
                track_alpha: HEP.params.opacityTracks,
                track_color_type: HEP.params.tracksColorType,

                minMaxBeamPipe: [modelsMinMaxPositions["BeamPipe"].min, modelsMinMaxPositions["BeamPipe"].max],
                minMaxPix: [modelsMinMaxPositions["Pix"].min, modelsMinMaxPositions["Pix"].max],
                minMaxPST: [modelsMinMaxPositions["PST"].min, modelsMinMaxPositions["PST"].max],
                minMaxSStrip: [modelsMinMaxPositions["SStrip"].min, modelsMinMaxPositions["SStrip"].max],
                minMaxLStrip: [modelsMinMaxPositions["LStrip"].min, modelsMinMaxPositions["LStrip"].max],

                colorBeamPipe: new RC.Color(HEP.params.colorBeamPipe).add(new RC.Color(HEP.params.ecolorBeamPipe)).toArray(),
                colorPix: new RC.Color(HEP.params.colorPix).add(new RC.Color(HEP.params.ecolorPix)).toArray(),
                colorPST: new RC.Color(HEP.params.colorPST).add(new RC.Color(HEP.params.ecolorPST)).toArray(),
                colorSStrip: new RC.Color(HEP.params.colorSStrip).add(new RC.Color(HEP.params.ecolorSStrip)).toArray(),
                colorLStrip: new RC.Color(HEP.params.colorLStrip).add(new RC.Color(HEP.params.ecolorLStrip)).toArray()
            }
        };


        let trackMaterial = new RC.CustomShaderMaterial("track", trackATTRUNIObject.uniforms, trackATTRUNIObject.attributes);
        trackMaterial.transparent = true;
        trackMaterial.depthTest = false;
        trackMaterial.depthWrite = false;
        //trackMaterial.side = RC.FRONT_AND_BACK_SIDE;




        //OBJECT
        //tracksObject = new RC.LineSegments(tracksGeometry, trackMaterial);
        let tracksObject = new RC.Line(tracksGeometry, trackMaterial);
        tracksObject.renderingPrimitive = RC.LINES;




        for(let key in tracks){
            tracks[key] = Utility.perp(tracks[key], tracks[key].length * 8);
        }
        const PP = new Tracks(tracksVertexSize, tracks, modelsMinMaxPositions);
        const tracksObject2 = PP.object;


        particlesObject.renderOrder = HEP.params.particlesRenderOrder;
        hitsObject.renderOrder = HEP.params.hitsRenderOrder;
        tracksObjectNonIndexed.renderOrder = HEP.params.tracksRenderOrder;
        tracksObject.renderOrder = HEP.params.tracksRenderOrder;

        particlesObject.name = "Particles";
        hitsObject.name = "Hits";
        tracksObjectNonIndexed.name = "Tracks";
        tracksObject.name = "Tracks";

        particlesObject.visible = HEP.params.visibleParticles;
        hitsObject.visible = HEP.params.visibleHits;
        tracksObjectNonIndexed.visible = HEP.params.visibleTracks;
        tracksObject.visible = HEP.params.visibleTracks;

        //scene.add(particlesObject);
        //scene.add(hitsObject);
        //scene.add(tracksObject);

        /*
        var group = new RC.Group();
        group.add(particlesObject);
        group.add(hitsObject);
        group.add(tracksObject);
        */

        return [particlesObject, hitsObject, tracksObjectNonIndexed, tracksObject, tracksObject2];
    }
};