/** IMPORTS */
import * as RC from '../../../src/RenderCore.js';
import {Utility} from './Utility.js';


export default class DetectorLoader {
    //CONSTRUCTOR
    constructor (manager = new RC.LoadingManager()) {
        this._manager = (manager !== undefined) ? manager : new RC.LoadingManager();
    }


    //FUNC
    load (url, onLoad, onProgress, onError) {

        const loader = new RC.XHRLoader(this._manager);
        const scope = this;

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


    parse(data){
        let detectorsData = JSON.parse(Utility.csvToJSON(data));


        //var selectedDetectorData = selectDetectorsData(detectorsData, 6); // 1 - 5, 6 experimental
        let segmentedDetectorData = this.selectDetectorsData(detectorsData);


        let detectorsObjects = [];
        for(let i = 0; i < segmentedDetectorData.length; i++){
            detectorsObjects.push(this.loadDetectorsData(segmentedDetectorData[i], i));
        }
        //combined geometry
        //loadDetectorsDataV2(segmentedDetectorData);


        return detectorsObjects;
        /**V1*/
        //loadModels(detectorsObjects);
        //return this.loadModelsV2(detectorsObjects);
    }


    selectDetectorsData(detectorsData){
        let detectorsVolumeSegments = [['7', '8', '9'], ["12", "13", "14"], ["16", "17", "18"]];
        let segmentedDetectorsData = [[], [], []];


        for(let i = 0; i < detectorsData.length; i++){
            for(let j = 0; j < detectorsVolumeSegments.length; j++){

                for(let k = 0; k < detectorsVolumeSegments[j].length; k++) {
                    if (detectorsData[i].volume_id === detectorsVolumeSegments[j][k]) segmentedDetectorsData[j].push(detectorsData[i]);
                }

            }
        }


        return segmentedDetectorsData;
    }


    loadDetectorsData(detectorsData, detectorIndex) {
        /*************************************** DETECTORS ********************************************/
            //console.log("Detectors: " ); console.log(detectorsData);
            // GEOMETRY
        let position = new Array(detectorsData.length * 8 * 3); //8 vertices per single detector center, 3 components(x, y, z)
        let index = [];

        let pos_xyz = new RC.Vector3();
        let rotation_matrix = new RC.Matrix3();
        let pos_uvw = new RC.Vector3();
        let translation = new RC.Vector3();


        for(let i = 0; i < detectorsData.length; i++){
            //for every detector module:

            rotation_matrix.set(detectorsData[i].rot_xu, detectorsData[i].rot_xv, detectorsData[i].rot_xw,
                                detectorsData[i].rot_yu, detectorsData[i].rot_yv, detectorsData[i].rot_yw,
                                detectorsData[i].rot_zu, detectorsData[i].rot_zv, detectorsData[i].rot_zw);

            translation.x = detectorsData[i].cx;
            translation.y = detectorsData[i].cy;
            translation.z = detectorsData[i].cz;


            pos_uvw.x = -detectorsData[i].module_minhu;
            pos_uvw.y = -detectorsData[i].module_hv;
            pos_uvw.z = +detectorsData[i].module_t;

            pos_xyz = pos_uvw.applyMatrix3(rotation_matrix).add(translation);

            position[i*8*3 +  0] = pos_xyz.x;
            position[i*8*3 +  1] = pos_xyz.y;
            position[i*8*3 +  2] = pos_xyz.z;
            //G.vertices.push(new RC.Vector3(pos_xyz.x, pos_xyz.y, pos_xyz.z) );


            pos_uvw.x = -detectorsData[i].module_maxhu;
            pos_uvw.y = +detectorsData[i].module_hv;
            pos_uvw.z = +detectorsData[i].module_t;

            pos_xyz = pos_uvw.applyMatrix3(rotation_matrix).add(translation);

            position[i*8*3 +  3] = pos_xyz.x;
            position[i*8*3 +  4] = pos_xyz.y;
            position[i*8*3 +  5] = pos_xyz.z;
            //G.vertices.push(new RC.Vector3(pos_xyz.x, pos_xyz.y, pos_xyz.z) );


            pos_uvw.x = +detectorsData[i].module_minhu;
            pos_uvw.y = -detectorsData[i].module_hv;
            pos_uvw.z = +detectorsData[i].module_t;

            pos_xyz = pos_uvw.applyMatrix3(rotation_matrix).add(translation);

            position[i*8*3 +  6] = pos_xyz.x;
            position[i*8*3 +  7] = pos_xyz.y;
            position[i*8*3 +  8] = pos_xyz.z;
            //G.vertices.push(new RC.Vector3(pos_xyz.x, pos_xyz.y, pos_xyz.z) );


            pos_uvw.x = +detectorsData[i].module_maxhu;
            pos_uvw.y = +detectorsData[i].module_hv;
            pos_uvw.z = +detectorsData[i].module_t;

            pos_xyz = pos_uvw.applyMatrix3(rotation_matrix).add(translation);

            position[i*8*3 +  9] = pos_xyz.x;
            position[i*8*3 + 10] = pos_xyz.y;
            position[i*8*3 + 11] = pos_xyz.z;
            //G.vertices.push(new RC.Vector3(pos_xyz.x, pos_xyz.y, pos_xyz.z) );


            pos_uvw.x = -detectorsData[i].module_minhu;
            pos_uvw.y = -detectorsData[i].module_hv;
            pos_uvw.z = -detectorsData[i].module_t;

            pos_xyz = pos_uvw.applyMatrix3(rotation_matrix).add(translation);

            position[i*8*3 +  12] = pos_xyz.x;
            position[i*8*3 +  13] = pos_xyz.y;
            position[i*8*3 +  14] = pos_xyz.z;
            //G.vertices.push(new RC.Vector3(pos_xyz.x, pos_xyz.y, pos_xyz.z) );


            pos_uvw.x = -detectorsData[i].module_maxhu;
            pos_uvw.y = +detectorsData[i].module_hv;
            pos_uvw.z = -detectorsData[i].module_t;

            pos_xyz = pos_uvw.applyMatrix3(rotation_matrix).add(translation);

            position[i*8*3 +  15] = pos_xyz.x;
            position[i*8*3 +  16] = pos_xyz.y;
            position[i*8*3 +  17] = pos_xyz.z;
            //G.vertices.push(new RC.Vector3(pos_xyz.x, pos_xyz.y, pos_xyz.z) );


            pos_uvw.x = +detectorsData[i].module_minhu;
            pos_uvw.y = -detectorsData[i].module_hv;
            pos_uvw.z = -detectorsData[i].module_t;

            pos_xyz = pos_uvw.applyMatrix3(rotation_matrix).add(translation);

            position[i*8*3 +  18] = pos_xyz.x;
            position[i*8*3 +  19] = pos_xyz.y;
            position[i*8*3 +  20] = pos_xyz.z;
            //G.vertices.push(new RC.Vector3(pos_xyz.x, pos_xyz.y, pos_xyz.z) );


            pos_uvw.x = +detectorsData[i].module_maxhu;
            pos_uvw.y = +detectorsData[i].module_hv;
            pos_uvw.z = -detectorsData[i].module_t;

            pos_xyz = pos_uvw.applyMatrix3(rotation_matrix).add(translation);

            position[i*8*3 + 21] = pos_xyz.x;
            position[i*8*3 + 22] = pos_xyz.y;
            position[i*8*3 + 23] = pos_xyz.z;
            //G.vertices.push(new RC.Vector3(pos_xyz.x, pos_xyz.y, pos_xyz.z) );


            index.push(i*8+0, i*8+3, i*8+1, i*8+0, i*8+2, i*8+3); //front
            index.push(i*8+2, i*8+7, i*8+3, i*8+2, i*8+6, i*8+7); //right
            index.push(i*8+6, i*8+5, i*8+7, i*8+6, i*8+4, i*8+5); //back
            index.push(i*8+4, i*8+1, i*8+5, i*8+4, i*8+0, i*8+1); //left
            index.push(i*8+1, i*8+7, i*8+5, i*8+1, i*8+3, i*8+7); //up
            index.push(i*8+4, i*8+2, i*8+0, i*8+4, i*8+6, i*8+2); //down
        }


        // Create new buffer geometry
        let bufferGeometry = new RC.Geometry();// Add position of vertices
        bufferGeometry.vertices = new RC.Float32Attribute(position, 3);//index
        bufferGeometry.indices = new RC.Uint32Attribute(index, 1);// Check if normals are specified. Otherwise calculate them
        bufferGeometry.computeVertexNormals();

        let material = new RC.MeshBasicMaterial();

        // Create new mesh
        let object = new RC.Mesh(bufferGeometry, material);


        return object;
    }
};