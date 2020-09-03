import * as RC from '../../../../src/RenderCore.js';
import {Utility} from '../Utility.js';
import {HEP} from '../HEP.js';


export default class Tracks {//INDEXED + WIDTH
    constructor(tracksVertexSize, tracks, modelsMinMaxPositions) {

        const IO = this._index(tracksVertexSize, tracks);
        const tracksIndices = IO;

        const PO = this._position(tracksVertexSize, tracks);
        const trackPositions = PO[0];
        const trackPrevPositions = PO[1];
        const trackNextPositions = PO[2];
        const trackNormalDirections = PO[3];

        const MO = this._momentum(tracksVertexSize, tracks);
        const trackMomentums = MO[0];
        const trackMomentumMagnitudeMapped = MO[1];

        const HO = this._hit(tracksVertexSize, tracks);
        const trackNHitsMapped = HO;




        //GEOMETRY + INDICES
        const tracksGeometry = new RC.Geometry();
        tracksGeometry.indices = new RC.Uint32Attribute(tracksIndices, 1);
        tracksGeometry.vertices = new RC.Float32Attribute(trackPositions, 3);
        //tracksGeometry.computeVertexNormals();




        //MATERIAL
        const trackATTRUNIObject = {
            "attributes": {
                "prevPosition": new RC.Float32Attribute(trackPrevPositions, 3),
                "nextPosition": new RC.Float32Attribute(trackNextPositions, 3),
                "normalDirection": new RC.Float32Attribute(trackNormalDirections, 1),

                "momentum": new RC.Float32Attribute(trackMomentums, 3),
                "momentumMagnitude": new RC.Float32Attribute(trackMomentumMagnitudeMapped, 1),

                "nhits": new RC.Float32Attribute(trackNHitsMapped, 1),

                //"track_id": new RC.Uint32Attribute(tracksIDs, 1)
            },

            "uniforms": {
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
                colorLStrip: new RC.Color(HEP.params.colorLStrip).add(new RC.Color(HEP.params.ecolorLStrip)).toArray(),

                aspect: window.innerWidth/window.innerHeight
            }
        };


        const trackMaterial = new RC.CustomShaderMaterial("track_width", trackATTRUNIObject.uniforms, trackATTRUNIObject.attributes);
        trackMaterial.transparent = true;
        trackMaterial.depthTest = false;
        trackMaterial.depthWrite = false;
        //trackMaterial.side = RC.FRONT_AND_BACK_SIDE;
        const pickingMaterial = new RC.PickingShaderMaterial("track_width", trackATTRUNIObject.uniforms);




        //OBJECT
        const tracksObject = new RC.Mesh(tracksGeometry, trackMaterial, pickingMaterial);
        this._tracksObject = tracksObject;

        tracksObject.renderOrder = HEP.params.tracksRenderOrder;
        tracksObject.name = "Tracks";
        tracksObject.visible = HEP.params.visibleTracks;
    }

    get object(){
        return this._tracksObject;
    }

    _attribute(){}
    _index(tracksVertexSize, tracks){
        const tracksIndices = [];


        let i = 0;
        let k = 0;
        for(let key in tracks){
            for(let j = 0; j < tracks[key].length*2-2; j++) {
                ////tracksIDs[k + 0] = key;   //key
                //tracksIDs[k + 0] = g_trackIDMap[ key ];  //mapped key


                if (j % 2 === 0){
                    tracksIndices.push(i + 0);
                    tracksIndices.push(i + 1);
                    tracksIndices.push(i + 2);
                }else {
                    tracksIndices.push(i + 0);
                    tracksIndices.push(i + 2);
                    tracksIndices.push(i + 1);
                }


                i++; k += 1;
            }
            i += 3-1;
        }


        return tracksIndices;
    }
    _position(tracksVertexSize, tracks){
        const trackPositions = new Array(tracksVertexSize * 2 * 3);
        const prevPosition = new Array(tracksVertexSize * 2 * 3);
        const nextPosition = new Array(tracksVertexSize * 2 * 3);
        const normalDirection = new Array(tracksVertexSize * 2);


        let i = 0;
        let k = 0;
        for(let key in tracks){

            if(tracks.hasOwnProperty(key))
            for(let j = 0; j < tracks[key].length; j++) {
                trackPositions[i*6 + 0] = tracks[key][j].tx;
                trackPositions[i*6 + 1] = tracks[key][j].ty;
                trackPositions[i*6 + 2] = tracks[key][j].tz;

                trackPositions[i*6 + 3] = tracks[key][j].tx;
                trackPositions[i*6 + 4] = tracks[key][j].ty;
                trackPositions[i*6 + 5] = tracks[key][j].tz;


                /*if(j === 0) {
                    prevPosition[i*6 + 0] = tracks[key][j].tx;
                    prevPosition[i*6 + 1] = tracks[key][j].ty;
                    prevPosition[i*6 + 2] = tracks[key][j].tz;

                    prevPosition[i*6 + 3] = tracks[key][j].tx;
                    prevPosition[i*6 + 4] = tracks[key][j].ty;
                    prevPosition[i*6 + 5] = tracks[key][j].tz;


                    nextPosition[i*6 + 0] = tracks[key][j + 1].tx;
                    nextPosition[i*6 + 1] = tracks[key][j + 1].ty;
                    nextPosition[i*6 + 2] = tracks[key][j + 1].tz;

                    nextPosition[i*6 + 3] = tracks[key][j + 1].tx;
                    nextPosition[i*6 + 4] = tracks[key][j + 1].ty;
                    nextPosition[i*6 + 5] = tracks[key][j + 1].tz;
                } else if (j >= 1 && j <= tracks[key].length-1 - 1) {
                    if(j % 2 === 1) {
                        prevPosition[i * 6 + 0] = tracks[key][j - 1].tx;
                        prevPosition[i * 6 + 1] = tracks[key][j - 1].ty;
                        prevPosition[i * 6 + 2] = tracks[key][j - 1].tz;

                        prevPosition[i * 6 + 3] = tracks[key][j - 1].tx;
                        prevPosition[i * 6 + 4] = tracks[key][j - 1].ty;
                        prevPosition[i * 6 + 5] = tracks[key][j - 1].tz;


                        console.log(j);
                        console.log(tracks[key].length-1);
                        console.log(tracks[key][j]);
                        console.log(tracks[key]);
                        nextPosition[i * 6 + 0] = tracks[key][j + 2].tx;
                        nextPosition[i * 6 + 1] = tracks[key][j + 2].ty;
                        nextPosition[i * 6 + 2] = tracks[key][j + 2].tz;

                        nextPosition[i * 6 + 3] = tracks[key][j + 2].tx;
                        nextPosition[i * 6 + 4] = tracks[key][j + 2].ty;
                        nextPosition[i * 6 + 5] = tracks[key][j + 2].tz;
                    }else{
                        prevPosition[i * 6 + 0] = tracks[key][j - 2].tx;
                        prevPosition[i * 6 + 1] = tracks[key][j - 2].ty;
                        prevPosition[i * 6 + 2] = tracks[key][j - 2].tz;

                        prevPosition[i * 6 + 3] = tracks[key][j - 2].tx;
                        prevPosition[i * 6 + 4] = tracks[key][j - 2].ty;
                        prevPosition[i * 6 + 5] = tracks[key][j - 2].tz;


                        nextPosition[i * 6 + 0] = tracks[key][j + 1].tx;
                        nextPosition[i * 6 + 1] = tracks[key][j + 1].ty;
                        nextPosition[i * 6 + 2] = tracks[key][j + 1].tz;

                        nextPosition[i * 6 + 3] = tracks[key][j + 1].tx;
                        nextPosition[i * 6 + 4] = tracks[key][j + 1].ty;
                        nextPosition[i * 6 + 5] = tracks[key][j + 1].tz;
                    }
                } else if (j === tracks[key].length-1){
                    prevPosition[i*6 + 0] = tracks[key][j - 1].tx;
                    prevPosition[i*6 + 1] = tracks[key][j - 1].ty;
                    prevPosition[i*6 + 2] = tracks[key][j - 1].tz;

                    prevPosition[i*6 + 3] = tracks[key][j - 1].tx;
                    prevPosition[i*6 + 4] = tracks[key][j - 1].ty;
                    prevPosition[i*6 + 5] = tracks[key][j - 1].tz;


                    nextPosition[i*6 + 0] = tracks[key][j].tx;
                    nextPosition[i*6 + 1] = tracks[key][j].ty;
                    nextPosition[i*6 + 2] = tracks[key][j].tz;

                    nextPosition[i*6 + 3] = tracks[key][j].tx;
                    nextPosition[i*6 + 4] = tracks[key][j].ty;
                    nextPosition[i*6 + 5] = tracks[key][j].tz;
                }*/
                if(j === 0) {
                    prevPosition[i*6 + 0] = tracks[key][j].tx;
                    prevPosition[i*6 + 1] = tracks[key][j].ty;
                    prevPosition[i*6 + 2] = tracks[key][j].tz;

                    prevPosition[i*6 + 3] = tracks[key][j].tx;
                    prevPosition[i*6 + 4] = tracks[key][j].ty;
                    prevPosition[i*6 + 5] = tracks[key][j].tz;


                    nextPosition[i*6 + 0] = tracks[key][j + 1].tx;
                    nextPosition[i*6 + 1] = tracks[key][j + 1].ty;
                    nextPosition[i*6 + 2] = tracks[key][j + 1].tz;

                    nextPosition[i*6 + 3] = tracks[key][j + 1].tx;
                    nextPosition[i*6 + 4] = tracks[key][j + 1].ty;
                    nextPosition[i*6 + 5] = tracks[key][j + 1].tz;
                } else if (j > 0 && j < tracks[key].length-1) {
                    prevPosition[i*6 + 0] = tracks[key][j - 1].tx;
                    prevPosition[i*6 + 1] = tracks[key][j - 1].ty;
                    prevPosition[i*6 + 2] = tracks[key][j - 1].tz;

                    prevPosition[i*6 + 3] = tracks[key][j - 1].tx;
                    prevPosition[i*6 + 4] = tracks[key][j - 1].ty;
                    prevPosition[i*6 + 5] = tracks[key][j - 1].tz;


                    nextPosition[i*6 + 0] = tracks[key][j + 1].tx;
                    nextPosition[i*6 + 1] = tracks[key][j + 1].ty;
                    nextPosition[i*6 + 2] = tracks[key][j + 1].tz;

                    nextPosition[i*6 + 3] = tracks[key][j + 1].tx;
                    nextPosition[i*6 + 4] = tracks[key][j + 1].ty;
                    nextPosition[i*6 + 5] = tracks[key][j + 1].tz;
                } else if (j === tracks[key].length-1){
                    prevPosition[i*6 + 0] = tracks[key][j - 1].tx;
                    prevPosition[i*6 + 1] = tracks[key][j - 1].ty;
                    prevPosition[i*6 + 2] = tracks[key][j - 1].tz;

                    prevPosition[i*6 + 3] = tracks[key][j - 1].tx;
                    prevPosition[i*6 + 4] = tracks[key][j - 1].ty;
                    prevPosition[i*6 + 5] = tracks[key][j - 1].tz;


                    nextPosition[i*6 + 0] = tracks[key][j].tx;
                    nextPosition[i*6 + 1] = tracks[key][j].ty;
                    nextPosition[i*6 + 2] = tracks[key][j].tz;

                    nextPosition[i*6 + 3] = tracks[key][j].tx;
                    nextPosition[i*6 + 4] = tracks[key][j].ty;
                    nextPosition[i*6 + 5] = tracks[key][j].tz;
                }


                normalDirection[i*2 + 0] = +1;
                //if(i % 2 === 0) normalDirection[i*2 + 0] *= -1;
                normalDirection[i*2 + 1] = -1;
                //if(i % 2 === 0) normalDirection[i*2 + 1] *= -1;



                i ++; k += 1;
            }
        }


        return [trackPositions, prevPosition, nextPosition, normalDirection];
    }
    _ID(tracksVertexSize){
        const tracksIDs = new Array(tracksVertexSize);
    }
    _momentum(tracksVertexSize, tracks){
        const trackMomentums = new Array(tracksVertexSize * 2 * 3);
        const trackMomentumMagnitude = new Array(tracksVertexSize * 2);
        let trackMomentumMagnitudeClamped, trackMomentumMagnitudeMapped;
        let trackMomentumMagnitudeMean, trackMomentumMagnitudeStd;
        let trackMomentumMagnitudeClampedMin, trackMomentumMagnitudeClampedMax;

        const trackMomentumVec = new RC.Vector3();


        let i = 0;
        let k = 0;
        for(let key in tracks){
            if(tracks.hasOwnProperty(key))
            for(let j = 0; j < tracks[key].length; j++) {

                //trackMomentums[i + 0] = tracks[key][j].tpx;
                //trackMomentums[i + 1] = tracks[key][j].tpy;
                //trackMomentums[i + 2] = tracks[key][j].tpz;

                trackMomentumVec.x = tracks[key][j].tpx;
                trackMomentumVec.y = tracks[key][j].tpy;
                trackMomentumVec.z = tracks[key][j].tpz;


                trackMomentumMagnitude[i*2 + 0] = trackMomentumVec.length();
                trackMomentumMagnitude[i*2 + 1] = trackMomentumVec.length();


                trackMomentumVec.normalize();
                trackMomentumVec.multiplyScalar(0.5);
                trackMomentumVec.addScalar(0.5);


                trackMomentums[i*6 + 0] = trackMomentumVec.x;
                trackMomentums[i*6 + 1] = trackMomentumVec.y;
                trackMomentums[i*6 + 2] = trackMomentumVec.z;

                trackMomentums[i*6 + 3] = trackMomentumVec.x;
                trackMomentums[i*6 + 4] = trackMomentumVec.y;
                trackMomentums[i*6 + 5] = trackMomentumVec.z;
                /*trackMomentums[i*6 + 0] = 1.0;
                trackMomentums[i*6 + 1] = 0.0;
                trackMomentums[i*6 + 2] = 0.0;

                trackMomentums[i*6 + 3] = 0.0;
                trackMomentums[i*6 + 4] = 0.0;
                trackMomentums[i*6 + 5] = 1.0;*/




                i ++; k += 1;
            }
        }


        trackMomentumMagnitudeMean = Utility.mean(trackMomentumMagnitude);
        trackMomentumMagnitudeStd = Utility.std(trackMomentumMagnitude, trackMomentumMagnitudeMean);
        trackMomentumMagnitudeClamped = Utility.clamp(trackMomentumMagnitude, trackMomentumMagnitudeMean - trackMomentumMagnitudeStd, trackMomentumMagnitudeMean + trackMomentumMagnitudeStd);

        trackMomentumMagnitudeClampedMin = Utility.findMin(trackMomentumMagnitudeClamped);
        trackMomentumMagnitudeClampedMax = Utility.findMax(trackMomentumMagnitudeClamped);
        trackMomentumMagnitudeMapped = Utility.map(trackMomentumMagnitudeClamped, trackMomentumMagnitudeClampedMin, trackMomentumMagnitudeClampedMax, 0.0625/2.0/2.0, 1*2.0*2.0*2.0);


        return [trackMomentums, trackMomentumMagnitudeMapped];
    }
    _hit(tracksVertexSize, tracks){
        const trackNHits = new Array(tracksVertexSize * 2);
        let trackNHitsClamped, trackNHitsMapped;
        let trackNHitsClampedMin, trackNHitsClampedMax;
        let trackNHitsMean, trackNHitsStd;


        let nhitsTemp;

        let i = 0;
        let k = 0;
        for(let key in tracks){
            if(tracks.hasOwnProperty(key)) {
                for (let j = 0; j < tracks[key].length; j++) {
                    if (tracks[key][j].nhits !== undefined) {
                        nhitsTemp = tracks[key][j].nhits;
                        break;
                    }
                }
                for (let j = 0; j < tracks[key].length; j++) {
                    trackNHits[i * 2 + 0] = nhitsTemp;
                    trackNHits[i * 2 + 1] = nhitsTemp;


                    i++;
                    k += 1;
                }
            }
        }


        trackNHitsMean = Utility.mean(trackNHits);
        trackNHitsStd = Utility.std(trackNHits, trackNHitsMean);
        trackNHitsClamped = Utility.clamp(trackNHits, trackNHitsMean - trackNHitsStd, trackNHitsMean + trackNHitsStd);

        trackNHitsClampedMin = Utility.findMin(trackNHitsClamped);
        trackNHitsClampedMax = Utility.findMax(trackNHitsClamped);
        trackNHitsMapped = Utility.map(trackNHitsClamped, trackNHitsClampedMin, trackNHitsClampedMax, 0.125*2*2, 8/2/2/2);


        return trackNHitsMapped;
    }
}