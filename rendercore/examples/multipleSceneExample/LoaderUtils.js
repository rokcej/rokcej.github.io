/**
 * @author Don McCurdy / https://www.donmccurdy.com
 * extended by Sebastien
 */
import {Vector3} from '../../src/math/Vector3.js'

var LoaderUtils = {

	decodeText: function ( array ) {

		if ( typeof TextDecoder !== 'undefined' ) {

			return new TextDecoder().decode( array );

		}

		// Avoid the String.fromCharCode.apply(null, array) shortcut, which
		// throws a "maximum call stack size exceeded" error for large arrays.

		var s = '';

		for ( var i = 0, il = array.length; i < il; i ++ ) {

			// Implicitly assumes little-endian.
			s += String.fromCharCode( array[ i ] );

		}

		// Merges multi-byte utf-8 characters.
		return decodeURIComponent( escape( s ) );

	},

	extractUrlBase: function ( url ) {

		var index = url.lastIndexOf( '/' );

		if ( index === - 1 ) return './';

		return url.substr( 0, index + 1 );

	},


    transformToQuad: function(data){//TODO support all attributes for expansion
        //let pointCloudPositions = new Float32Array(data.vertices.array.length * 4);
        //let pointCloudColors = new Float32Array((data.vertColor.array.length + data.vertColor.array.length/3) * 4);
        let pointCloudPositions = new Array(data.vertices.array.length * 4);
        let pointCloudColors = new Array((data.vertColor.array.length + data.vertColor.array.length/3) * 4);
        let pointCloudIndices = [];


        //calc mean
        let mean = new Vector3(0, 0, 0);
        for(let i = 0; i < data.vertices.array.length/3; i++) {
            mean.x += data.vertices.array[i * 3 + 0];
            mean.y += data.vertices.array[i * 3 + 1];
            mean.z += data.vertices.array[i * 3 + 2];
        }
        mean.divideScalar(data.vertices.array.length/3);

        let mult = 20;
        let size = mult/10000;


        for(let i = 0; i < data.vertices.array.length/3; i++){
            pointCloudPositions[i*3*4 + 0 ] = (data.vertices.array[i*3+0]-mean.x -size) * mult;
            pointCloudPositions[i*3*4 + 1 ] = (data.vertices.array[i*3+1]-mean.y -size) * mult;
            pointCloudPositions[i*3*4 + 2 ] = (data.vertices.array[i*3+2]-mean.z      ) * mult;

            pointCloudPositions[i*3*4 + 3 ] = (data.vertices.array[i*3+0]-mean.x +size) * mult;
            pointCloudPositions[i*3*4 + 4 ] = (data.vertices.array[i*3+1]-mean.y +size) * mult;
            pointCloudPositions[i*3*4 + 5 ] = (data.vertices.array[i*3+2]-mean.z      ) * mult;

            pointCloudPositions[i*3*4 + 6 ] = (data.vertices.array[i*3+0]-mean.x -size) * mult;
            pointCloudPositions[i*3*4 + 7 ] = (data.vertices.array[i*3+1]-mean.y +size) * mult;
            pointCloudPositions[i*3*4 + 8 ] = (data.vertices.array[i*3+2]-mean.z      ) * mult;

            pointCloudPositions[i*3*4 + 9 ] = (data.vertices.array[i*3+0]-mean.x +size) * mult;
            pointCloudPositions[i*3*4 + 10] = (data.vertices.array[i*3+1]-mean.y -size) * mult;
            pointCloudPositions[i*3*4 + 11] = (data.vertices.array[i*3+2]-mean.z      ) * mult;


            pointCloudColors[i*4*4 + 0 ] = data.vertColor.array[i*3+0];
            pointCloudColors[i*4*4 + 1 ] = data.vertColor.array[i*3+1];
            pointCloudColors[i*4*4 + 2 ] = data.vertColor.array[i*3+2];
            pointCloudColors[i*4*4 + 3 ] = 1;

            pointCloudColors[i*4*4 + 4 ] = data.vertColor.array[i*3+0];
            pointCloudColors[i*4*4 + 5 ] = data.vertColor.array[i*3+1];
            pointCloudColors[i*4*4 + 6 ] = data.vertColor.array[i*3+2];
            pointCloudColors[i*4*4 + 7 ] = 1;

            pointCloudColors[i*4*4 + 8 ] = data.vertColor.array[i*3+0];
            pointCloudColors[i*4*4 + 9 ] = data.vertColor.array[i*3+1];
            pointCloudColors[i*4*4 + 10] = data.vertColor.array[i*3+2];
            pointCloudColors[i*4*4 + 11] = 1;

            pointCloudColors[i*4*4 + 12] = data.vertColor.array[i*3+0];
            pointCloudColors[i*4*4 + 13] = data.vertColor.array[i*3+1];
            pointCloudColors[i*4*4 + 14] = data.vertColor.array[i*3+2];
            pointCloudColors[i*4*4 + 15] = 1;


            pointCloudIndices.push(i*4 + 0);
            pointCloudIndices.push(i*4 + 1);
            pointCloudIndices.push(i*4 + 2);

            pointCloudIndices.push(i*4 + 0);
            pointCloudIndices.push(i*4 + 3);
            pointCloudIndices.push(i*4 + 1);
        }


        return {pointCloudPositions, pointCloudColors, pointCloudIndices};
    },
    transformToPoint: function(data){
        //let pointCloudPositions = new Float32Array(data.vertices.array.length);
        //let pointCloudColors = new Float32Array((data.vertColor.array.length + data.vertColor.array.length/3));
        let pointCloudPositions = new Array(data.vertices.array.length);
        let pointCloudColors = new Array((data.vertColor.array.length + data.vertColor.array.length/3));


        //calc mean
        let mean = new Vector3(0, 0, 0);
        for(let i = 0; i < data.vertices.array.length/3; i++) {
            mean.x += data.vertices.array[i * 3 + 0];
            mean.y += data.vertices.array[i * 3 + 1];
            mean.z += data.vertices.array[i * 3 + 2];
        }
        mean.divideScalar(data.vertices.array.length/3);

        let mult = 20;


        for(let i = 0; i < data.vertices.array.length/3; i++){
            pointCloudPositions[i*3 + 0] = (data.vertices.array[i*3+0]-mean.x ) * mult;
            pointCloudPositions[i*3 + 1] = (data.vertices.array[i*3+1]-mean.y ) * mult;
            pointCloudPositions[i*3 + 2] = (data.vertices.array[i*3+2]-mean.z ) * mult;


            pointCloudColors[i*4 + 0] = data.vertColor.array[i*3+0];
            pointCloudColors[i*4 + 1] = data.vertColor.array[i*3+1];
            pointCloudColors[i*4 + 2] = data.vertColor.array[i*3+2];
            pointCloudColors[i*4 + 3] = 1;
        }


        return {pointCloudPositions, pointCloudColors};
    }

};

export { LoaderUtils };
