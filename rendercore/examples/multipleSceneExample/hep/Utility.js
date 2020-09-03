import * as RC from '../../../src/RenderCore.js';
import {Outline} from "../../../src/RenderCore.js";

export const Utility = {
    csvToJSON(csv){
        let lines = csv.split('\n');
        let header = lines[0].split(',');
        let currentLine;
        let result = [];


        for(let i = 1; i < lines.length; i++){
            let object = {};
            currentLine = lines[i].split(',');

            //check for splitting an empty line
            if(currentLine.length < header.length) {
                //console.log(currentLine);
                continue;
            }

            for(let j = 0; j < header.length; j++){
                if(header[j].includes("id")) {
                    object[header[j]] = currentLine[j];
                }else {
                    object[header[j]] = JSON.parse(currentLine[j]); //JSON.parse() remove "" quotes
                }
            }

            result.push(object);
        }

        //return result; //JavaScript object
        return JSON.stringify(result); //JSON object
    },

    getObjectMinMaxPosition(object){
        //console.log(object); ///child[0], geometry, attributes
        //console.log(object.children[0].geometry.attributes.position);
        var positionObject;
        if(object.children[0] !== undefined && !(object.children[0] instanceof Outline)){ //check because if mixed object types
            positionObject = object.children[0].geometry.attributes.position;
        }else{
            //positionObject = object.geometry.attributes.position;
            positionObject = object._geometry._vertices;
        }
        var positions = positionObject._array;
        var count = positionObject._array.length/positionObject._itemSize;
        var itemSize = positionObject._itemSize; // itemSize = 3
        var min = Number.POSITIVE_INFINITY, max = Number.NEGATIVE_INFINITY;
        var current = new RC.Vector2();

        for(var i = 0; i < count; i++){
            current.x = positions[i*itemSize + 0];
            current.y = positions[i*itemSize + 1];

            if(current.length() > max) max = current.length();
            if(current.length() < min) min = current.length();
        }

        return {min: min, max: max};
    },

    findMin(data){
        let dataMin = Number.POSITIVE_INFINITY;

        for(let i = 0; i < data.length; i++){
            let value = data[i];

            if(value < dataMin){
                dataMin = value;
            }
        }

        return dataMin;
    },

    findMax(data){
        let dataMax = Number.NEGATIVE_INFINITY;

        for(let i = 0; i < data.length; i++){
            let value = data[i];

            if(value > dataMax){
                dataMax = value;
            }
        }

        return dataMax;
    },

    mean(data) {
        let total = 0;

        for (let i = 0; i < data.length; i++) {
            total += data[i];
        }

        return total / data.length;
    },

    std(data, mean){
        let total = 0;

        for(let i = 0; i < data.length; i++){
            total += ((data[i] - mean)*(data[i] - mean));
        }

        return Math.sqrt(total / (data.length-1));
    },

    clamp(data, minVal, maxVal){
        let newData = new Array(data.length);

        for(let i = 0; i < data.length; i++){
            newData[i] = Math.min(Math.max(data[i], minVal), maxVal);
        }

        return newData;
    },

    vector3ToRGB(data){
        const newData = new Array(data.length);
        let vector = new RC.Vector3();

        for(let i = 0; i < data.length; i+=3){
            vector[0] = data[i + 0];
            vector[1] = data[i + 1];
            vector[2] = data[i + 2];

            vector = vector.normalize();
            vector = vector.multiplyScalar(0.5);
            vector = vector.addScalar(0.5);

            newData[i + 0] = vector[0];
            newData[i + 1] = vector[1];
            newData[i + 2] = vector[2];
        }

        return newData;
    },

    map(data, in_min, in_max, out_min, out_max) {
        let newData = new Array(data.length);

        for(let i = 0; i < data.length; i++){
            if(in_min === in_max) {
                newData[i] = (out_min + out_max) / 2;
            }else{
                newData[i] = (data[i] - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
            }
        }

        return newData;
    },

    perp(data, ns){
        let newData = [];

        for(let t = 0.0; t <= 1.0; t += (1.0/ns)){
            let pt = { //data[i]
                //hit_id: "",
                particle_id: "",
                tx: 0,
                ty: 0,
                tz: 0,
                tpx: 0,
                tpy: 0,
                tpz: 0,
                weight: 0,
                nhits: 0
            };

            for(let i = 0; i < data.length; i++){
                const bint = this._Bint(i, data.length-1, t);

                if(t === 0) {
                    pt.hit_id = data[t].hit_id;
                    pt.nhits = data[t].nhits;
                }else{
                    pt.hit_id = "X";
                }
                pt.particle_id = data[i].particle_id;

                pt.tx += data[i].tx * bint;
                pt.ty += data[i].ty * bint;
                pt.tz += data[i].tz * bint;

                pt.tpx += data[i].tpx * bint;
                pt.tpy += data[i].tpy * bint;
                pt.tpz += data[i].tpz * bint;

                pt.weight += data[i].weight * bint;

            }

            newData.push(pt);
        }

        return newData;
    },
    _Bint(i, n, t){
        return this._binomial(n, i) * Math.pow(t, i) * Math.pow((1 - t), (n - i));
    },
    _binomial(n, k) {
        if ((typeof n !== 'number') || (typeof k !== 'number'))
            return false;
        var coeff = 1;
        for (var x = n-k+1; x <= n; x++) coeff *= x;
        for (x = 1; x <= k; x++) coeff /= x;
        return coeff;
    }
};