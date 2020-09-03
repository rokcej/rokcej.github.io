import * as RC from '../../src/RenderCore.js'
import {Float32Attribute} from "../../src/RenderCore.js";
import {Vector3} from "../../src/RenderCore.js";


const predef_width = document.body.clientWidth;
const predef_height = document.body.clientHeight;
const nearPlane = 0.0625;
const farPlane = 8192;
let scene;
let camera;
function iterateSceneR(object, callback) {
    if (object === null || object === undefined) {
        return;
    }

    if(object.children.length > 0){
        for (let i = 0; i < object.children.length; i++) {
            iterateSceneR(object.children[i], callback);
        }
    }

    callback(object);
}


export default class MeshCore{
    constructor(shaderPath = "./src/shaders"){
        this._canvas = new RC.Canvas(undefined, "rc-canvas-mesh");

        this._renderer = new RC.MeshRenderer(this._canvas.canvas, RC.WEBGL2, {antialias: false, stencil: true});
        this._renderer.clearColor = "#ffffffff";
        this._renderer.addShaderLoaderUrls(shaderPath);
        this._renderQueue = this._initializeRenderQueue(this._renderer);

        this._scene = new RC.Scene();
        this._scene.name = "Mesh";
        this._populateScene(this._scene);

        this._camera = new RC.PerspectiveCamera(75, this._canvas.canvas.width/this._canvas.canvas.height, nearPlane, farPlane);
        this._camera.position = new RC.Vector3(0, 0, 8);
        this._camera.lookAt(new RC.Vector3(0, 0, 0), new RC.Vector3(0, 1, 0));


        window.app = this;
        scene = this._scene;
        camera = this._camera;
    }


    get canvas(){
        return this._canvas;
    }
    get renderer(){
        return this._renderer;
    }
    get renderQueue(){
        return this._renderQueue;
    }
    get scene(){
        return this._scene;
    }
    get camera(){
        return this._camera;
    }


    _initializeRenderQueue(renderer){
        const renderQueue = new RC.RenderQueue(renderer);
        

        //Seperate:
        /*
        //Bloom
        //renderQueue.pushRenderPass(MainRenderPass);
        //renderQueue.pushRenderPass(PostprocessingPass_HighPass);
        //renderQueue.pushRenderPass(PostprocessingPass_Gauss1);
        //renderQueue.pushRenderPass(PostprocessingPass_Gauss2);
        //renderQueue.pushRenderPass(PostprocessingPass_Bloom);

        //Outline
        //renderQueue.pushRenderPass(OutlineMainRenderPass);
        //renderQueue.pushRenderPass(OutlineMultiRenderPass);
        //renderQueue.pushRenderPass(OutlineRenderPass);

        //FXAA
        //renderQueue.pushRenderPass(FXAAMainRenderPass);
        //renderQueue.pushRenderPass(FXAALumaConversionPass);
        //renderQueue.pushRenderPass(FXAARenderPass);

        //SSAA
        renderQueue.pushRenderPass(SSAASupersampleRenderPass);
        renderQueue.pushRenderPass(SSAADownsampleRenderPass);

        //SCR
        renderQueue.pushRenderPass(ScreenshotPass);
        */


        //Combined:
        //SSAA
        renderQueue.pushRenderPass(RenderPass_MainSSAASupersample);
        renderQueue.pushRenderPass(RenderPass_MainMulti);
        renderQueue.pushRenderPass(RenderPass_HighPass);
        renderQueue.pushRenderPass(RenderPass_Gauss1);
        renderQueue.pushRenderPass(RenderPass_Gauss2);
        renderQueue.pushRenderPass(RenderPass_Bloom);
        renderQueue.pushRenderPass(RenderPass_Outline);
        renderQueue.pushRenderPass(RenderPass_Fog);
        renderQueue.pushRenderPass(RenderPass_SSAADownsample);

        //SCR
        renderQueue.pushRenderPass(RenderPass_Screenshot);
    

        return renderQueue;
    }
    _populateScene(scene){
        //OPTIONAL LIGHTS
        ////////////////////////////////////////////////////////////////////////////////////////////////////////////
        const aLight = new RC.AmbientLight(new RC.Color("#aa0040"), 0.1);
        const dLight = new RC.DirectionalLight(new RC.Color("#FFFFFF"), 0.4);
        const pLight = new RC.PointLight(new RC.Color("#FFFFFF"), 4);
        pLight.color = new RC.Color("#ffffbb");
        pLight.position = new RC.Vector3(0, 4, 0);
        scene.add(aLight);
        scene.add(dLight);
        scene.add(pLight);
        ////////////////////////////////////////////////////////////////////////////////////////////////////////////


        //GRID
        ////////////////////////////////////////////////////////////////////////////////////////////////////////////
        const grid1 = new RC.Grid(undefined, undefined, 1.0, 10.0);
        grid1.geometry.computeVertexNormals();
        //grid1.material.setUniform("LColor", [1.0, 0.0, 0.0]);
        //grid1.material.setUniform("UColor", [1.0, 0.0, 0.0]);
        scene.add(grid1);

        const grid2 = new RC.Grid(undefined, undefined, 1.0, 10.0);
        grid2.rotateX(Math.PI/2.0);
        grid2.geometry.computeVertexNormals();
        //grid2.material.setUniform("LColor", [0.0, 1.0, 0.0]);
        //grid2.material.setUniform("UColor", [0.0, 1.0, 0.0]);
        //scene.add(grid2);

        const grid3 = new RC.Grid(undefined, undefined, 1.0, 10.0);
        grid3.rotateZ(Math.PI/2.0);
        grid3.geometry.computeVertexNormals();
        //grid3.material.setUniform("LColor", [0.0, 0.0, 1.0]);
        //grid3.material.setUniform("UColor", [0.0, 0.0, 1.0]);
        //scene.add(grid3);
        ////////////////////////////////////////////////////////////////////////////////////////////////////////////


        //SKYBOX/SPHERE
        ////////////////////////////////////////////////////////////////////////////////////////////////////////////
        const skyboxImgLoader = new RC.ImageLoader();
        skyboxImgLoader.load("./textures/UV_Grid_Sm.jpg", function (image) {
            const skyboxTexture = new RC.Texture(
                image, 
                RC.Texture.ClampToEdgeWrapping, 
                RC.Texture.ClampToEdgeWrapping,
                RC.Texture.LinearFilter, 
                RC.Texture.LinearFilter,
                RC.Texture.RGBA, 
                RC.Texture.RGBA, 
                RC.Texture.UNSIGNED_BYTE
                );

                const dome = new RC.SkyDome(skyboxTexture, undefined, 1000000, 4, new RC.Color(1, 1, 1), 1, undefined);
                dome.mySkyDome.material = new RC.MeshBasicMaterial();
                dome.mySkyDome.material.color = new RC.Color(1, 1, 1);
                dome.mySkyDome.material.addMap(skyboxTexture);
                //scene.add(dome.GetMySkyDome);
        });
        ////////////////////////////////////////////////////////////////////////////////////////////////////////////


        //FONT
        ////////////////////////////////////////////////////////////////////////////////////////////////////////////
        const fontImgLoader = new RC.ImageLoader();
        fontImgLoader.load("./textures/font.jpg", function (image) {
            const fontTexture = new RC.Texture(
                image, 
                RC.Texture.ClampToEdgeWrapping, 
                RC.Texture.ClampToEdgeWrapping,
                RC.Texture.LinearFilter, 
                RC.Texture.LinearFilter,
                RC.Texture.RGBA, 
                RC.Texture.RGBA, 
                RC.Texture.UNSIGNED_BYTE
                );

                const text2D = new RC.Text2D(new Date().toLocaleString(), fontTexture, 10, 10, 32);
                setInterval(function(){
                    text2D.string = new Date().toLocaleString();
                }, 1000);
                
                scene.add(text2D);
        });
        ////////////////////////////////////////////////////////////////////////////////////////////////////////////


        //GEO
        //tri
        let tri_position = new Float32Array(3 * 3);
        tri_position[0] = -1; tri_position[1] = -1; tri_position[2] = +1;
        tri_position[3] = +1; tri_position[4] = -1; tri_position[5] = +1;
        tri_position[6] = -1; tri_position[7] = +1; tri_position[8] = +1;

        let tri_geometry = new RC.Geometry();
        tri_geometry.vertices = new RC.BufferAttribute(tri_position, 3);
        tri_geometry.computeVertexNormals();
        //tri_geometry.drawWireframe = true;

        let tri_material = new RC.MeshBasicMaterial();
        tri_material.color = new RC.Color(0x283f23);
        tri_material.side = RC.FRONT_AND_BACK_SIDE;

        let tri_object = new RC.Mesh(tri_geometry, tri_material);
        tri_object.position = new RC.Vector3(-8, 0, 0);


        //quad
        let quad_geometry = new RC.Geometry();

        let quad_material = new RC.MeshBasicMaterial();
        quad_material.color = new RC.Color(0x440011);
        quad_material.side = RC.FRONT_AND_BACK_SIDE;

        let quad_object = new RC.Quad({x: -1, y: 1}, {x: 1, y: 0}, quad_material, undefined);
        //quad_object.geometry.drawWireframe = true;
        quad_object.position = new RC.Vector3(-4, 0, 0);


        //cube
        //NON-INDEXED: 6sides, 2 tris per side, 3 vertices per tri, 3 components(x, y, z)
        let cube_n_position = new Float32Array(6 * 2 * 3 * 3);
        cube_n_position[0  ] = -1; cube_n_position[1  ] = -1; cube_n_position[2  ] = +1; //vertex 0 //front
        cube_n_position[3  ] = +1; cube_n_position[4  ] = -1; cube_n_position[5  ] = +1; //vertex 1
        cube_n_position[6  ] = -1; cube_n_position[7  ] = +1; cube_n_position[8  ] = +1; //vertex 2

        cube_n_position[9  ] = -1; cube_n_position[10 ] = +1; cube_n_position[11 ] = +1; //vertex 2
        cube_n_position[12 ] = +1; cube_n_position[13 ] = -1; cube_n_position[14 ] = +1; //vertex 1
        cube_n_position[15 ] = +1; cube_n_position[16 ] = +1; cube_n_position[17 ] = +1; //vertex 3


        cube_n_position[18 ] = +1; cube_n_position[19 ] = -1; cube_n_position[20 ] = +1; //vertex 1 //right
        cube_n_position[21 ] = +1; cube_n_position[22 ] = -1; cube_n_position[23 ] = -1; //vertex 5
        cube_n_position[24 ] = +1; cube_n_position[25 ] = +1; cube_n_position[26 ] = +1; //vertex 3

        cube_n_position[27 ] = +1; cube_n_position[28 ] = +1; cube_n_position[29 ] = +1; //vertex 3
        cube_n_position[30 ] = +1; cube_n_position[31 ] = -1; cube_n_position[32 ] = -1; //vertex 5
        cube_n_position[33 ] = +1; cube_n_position[34 ] = +1; cube_n_position[35 ] = -1; //vertex 7


        cube_n_position[36 ] = +1; cube_n_position[37 ] = -1; cube_n_position[38 ] = -1; //vertex 5 //back
        cube_n_position[39 ] = -1; cube_n_position[40 ] = -1; cube_n_position[41 ] = -1; //vertex 4
        cube_n_position[42 ] = +1; cube_n_position[43 ] = +1; cube_n_position[44 ] = -1; //vertex 7

        cube_n_position[45 ] = +1; cube_n_position[46 ] = +1; cube_n_position[47 ] = -1; //vertex 7
        cube_n_position[48 ] = -1; cube_n_position[49 ] = -1; cube_n_position[50 ] = -1; //vertex 4
        cube_n_position[51 ] = -1; cube_n_position[52 ] = +1; cube_n_position[53 ] = -1; //vertex 6


        cube_n_position[54 ] = -1; cube_n_position[55 ] = -1; cube_n_position[56 ] = -1; //vertex 4 //left
        cube_n_position[57 ] = -1; cube_n_position[58 ] = -1; cube_n_position[59 ] = +1; //vertex 0
        cube_n_position[60 ] = -1; cube_n_position[61 ] = +1; cube_n_position[62 ] = -1; //vertex 6

        cube_n_position[63 ] = -1; cube_n_position[64 ] = +1; cube_n_position[65 ] = -1; //vertex 6
        cube_n_position[66 ] = -1; cube_n_position[67 ] = -1; cube_n_position[68 ] = +1; //vertex 0
        cube_n_position[69 ] = -1; cube_n_position[70 ] = +1; cube_n_position[71 ] = +1; //vertex 2


        cube_n_position[72 ] = -1; cube_n_position[73 ] = +1; cube_n_position[74 ] = +1; //vertex 2 //up
        cube_n_position[75 ] = +1; cube_n_position[76 ] = +1; cube_n_position[77 ] = +1; //vertex 3
        cube_n_position[78 ] = -1; cube_n_position[79 ] = +1; cube_n_position[80 ] = -1; //vertex 6

        cube_n_position[81 ] = -1; cube_n_position[82 ] = +1; cube_n_position[83 ] = -1; //vertex 6
        cube_n_position[84 ] = +1; cube_n_position[85 ] = +1; cube_n_position[86 ] = +1; //vertex 3
        cube_n_position[87 ] = +1; cube_n_position[88 ] = +1; cube_n_position[89 ] = -1; //vertex 7


        cube_n_position[90 ] = -1; cube_n_position[91 ] = -1; cube_n_position[92 ] = -1; //vertex 4 //down
        cube_n_position[93 ] = +1; cube_n_position[94 ] = -1; cube_n_position[95 ] = -1; //vertex 5
        cube_n_position[96 ] = -1; cube_n_position[97 ] = -1; cube_n_position[98 ] = +1; //vertex 0

        cube_n_position[99 ] = -1; cube_n_position[100] = -1; cube_n_position[101] = +1; //vertex 0
        cube_n_position[102] = +1; cube_n_position[103] = -1; cube_n_position[104] = -1; //vertex 5
        cube_n_position[105] = +1; cube_n_position[106] = -1; cube_n_position[107] = +1; //vertex 1

        let cube_n_geometry = new RC.Geometry(); // Add position of vertices
        cube_n_geometry.vertices = new RC.BufferAttribute(cube_n_position, 3); // Check if normals are specified. Otherwise calculate them
        cube_n_geometry.computeVertexNormals();
        //cube_geometry.drawWireframe = true;

        let cube_n_material = new RC.MeshPhongMaterial();
        cube_n_material.color = new RC.Color(0x110044);
        cube_n_material.side = RC.FRONT_AND_BACK_SIDE;

        let cube_n_object = new RC.Mesh(cube_n_geometry, cube_n_material); //let object = new RC.Cube(2, "#330022");
        cube_n_object.position = new RC.Vector3(0, 0, 0);


        //cube
        //INDEXED: 8 vertices for a cube, 3 components(x, y, z)
        let cube_position = new Float32Array(8 * 3);
        let cube_normal = new Float32Array(8 * 3);
        let cube_index = [];
        cube_position[0 ] = -1; cube_position[1 ] = -1; cube_position[2 ] = +1; //vertex 0
        cube_position[3 ] = +1; cube_position[4 ] = -1; cube_position[5 ] = +1; //vertex 1
        cube_position[6 ] = +1; cube_position[7 ] = +1; cube_position[8 ] = +1; //vertex 2
        cube_position[9 ] = -1; cube_position[10] = +1; cube_position[11] = +1; //vertex 3
        cube_position[12] = -1; cube_position[13] = -1; cube_position[14] = -1; //vertex 4
        cube_position[15] = +1; cube_position[16] = -1; cube_position[17] = -1; //vertex 5
        cube_position[18] = +1; cube_position[19] = +1; cube_position[20] = -1; //vertex 6
        cube_position[21] = -1; cube_position[22] = +1; cube_position[23] = -1; //vertex 7

        cube_normal[0 ] = -1; cube_normal[1 ] = -1; cube_normal[2 ] = +1; //vertex 0
        cube_normal[3 ] = +1; cube_normal[4 ] = -1; cube_normal[5 ] = +1; //vertex 1
        cube_normal[6 ] = +1; cube_normal[7 ] = +1; cube_normal[8 ] = +1; //vertex 2
        cube_normal[9 ] = -1; cube_normal[10] = +1; cube_normal[11] = +1; //vertex 3
        cube_normal[12] = -1; cube_normal[13] = -1; cube_normal[14] = -1; //vertex 4
        cube_normal[15] = +1; cube_normal[16] = -1; cube_normal[17] = -1; //vertex 5
        cube_normal[18] = +1; cube_normal[19] = +1; cube_normal[20] = -1; //vertex 6
        cube_normal[21] = -1; cube_normal[22] = +1; cube_normal[23] = -1; //vertex 7

        cube_index.push(0, 1, 2, 0, 2, 3); //front
        cube_index.push(1, 5, 6, 1, 6, 2); //right
        cube_index.push(5, 4, 7, 5, 7, 6); //back
        cube_index.push(4, 0, 3, 4, 3, 7); //left
        cube_index.push(3, 2, 6, 3, 6, 7); //up
        cube_index.push(4, 5, 1, 4, 1, 0); //down

        let cube_i_geometry = new RC.Geometry(); // Add position of vertices
        cube_i_geometry.vertices = new RC.BufferAttribute(cube_position, 3); //index
        cube_i_geometry.indices = new RC.BufferAttribute(new Uint32Array(cube_index), 1); // Check if normals are specified. Otherwise calculate them
        cube_i_geometry.computeVertexNormals();

        let cube_i_material = new RC.MeshPhongMaterial();
        cube_i_material.color = new RC.Color(0x110044);
        cube_i_material.side = RC.FRONT_AND_BACK_SIDE;

        let cube_i_object = new RC.Mesh(cube_i_geometry, cube_i_material); //let object = new RC.Cube(2, "#330022");
        cube_i_object.position = new RC.Vector3(4, 0, 0);


        //const l_cube = new RC.Mesh(cube_n_geometry);
        //const l_cube = new RC.Circle();
        const l_cube = new RC.GeoidSphere(4, 32, 32, 1.0, pLight.color);;
        //const l_cube = new RC.IcoSphere(4, 4, 1.0, pLight.color, false);
        l_cube.material.color = pLight.color;
        l_cube.material.side = RC.FRONT_AND_BACK_SIDE;
        pLight.add(l_cube);


        //CUBE CLUSTER
        ////////////////////////////////////////////////////////////////////////////////////////////////////////////
        const mult = 4*2;
        const matCube = new RC.MeshBasicMaterial();
        matCube.color = new RC.Color(0x111111);
        matCube.specular = new RC.Color(0xff5733);
        matCube.shininess = 8;
        const MMatArray = [];
        let cubeInstanceCount = 0;
        for(let i = -1*mult; i <= 1*mult; i+=1){
            for(let j = -1*mult; j <= 1*mult; j+=1){
                for(let k = -1*mult; k <= 1*mult; k+=1){
                    const cube_n_object = new RC.Mesh(cube_n_geometry, matCube);
                    cube_n_object.scale.setScalar(0.25); //original
                    cube_n_object.scale.setScalar(0.25/2); //dispersed
                    cube_n_object.scale.setScalar(0.25*1.9); //squashed
                    //cube_n_object.scale.setScalar(0.25*2.0); //super
                    cube_n_object.position.set(i, j, k);
                    //cube_n_object.rotate(new RC.Vector3(Math.random()*Math.PI, Math.random()*Math.PI, Math.random()*Math.PI));
                    cube_n_object.rotate(new RC.Vector3(Math.random()*Math.PI/8, Math.random()*Math.PI/8, Math.random()*Math.PI/8));
                    //cube_n_object.rotate(new RC.Vector3(Math.round(Math.random())*Math.PI, Math.round(Math.random())*Math.PI, Math.round(Math.random())*Math.PI));
                    //scene.add(cube_n_object);

                    cube_n_object.updateMatrix();
                    //MMatArray = MMatArray.concat(cube_n_object.matrix.elements); //SLOW
                    MMatArray.push(...cube_n_object.matrix.elements); //FAST
                    cubeInstanceCount++;
                }
            }
        }

        //instanced duality
        const cube_instanced_geo = new RC.Geometry();
        cube_instanced_geo.vertices = new RC.BufferAttribute(cube_n_position, 3);
        cube_instanced_geo.vertices.divisor = 0;
        cube_instanced_geo.computeVertexNormals();
        cube_instanced_geo.normals.divisor = 0;

        cube_instanced_geo.MMat = new RC.BufferAttribute(new Float32Array(MMatArray), 16);
        cube_instanced_geo.MMat.divisor = 1;


        const cube_instanced_mat = new RC.MeshPhongMaterial();
        cube_instanced_mat.color = new RC.Color(0x111111);
        cube_instanced_mat.specular = new RC.Color(0xff5733);
        cube_instanced_mat.shininess = 8;
        cube_instanced_mat.shadingType = RC.SmoothShading;
        cube_instanced_mat.side = RC.FRONT_AND_BACK_SIDE;
        //cube_instanced_mat.instanced = true;


        const cube_instanced_obj = new RC.Mesh(cube_instanced_geo, cube_instanced_mat);
        cube_instanced_obj.instanced = true;
        cube_instanced_obj.instanceCount = cubeInstanceCount;
        cube_instanced_obj.pickable = false;

        //cube_instanced_obj.scale.setScalar(4);

        scene.add(cube_instanced_obj);
        //cube_instanced_obj.pickingMaterial.instanced = true;
        ////////////////////////////////////////////////////////////////////////////////////////////////////////////



        const imgLoader = new RC.ImageLoader();
        for(let i = 0; i < 100; i++){
            let cube_i_geometry = new RC.Geometry(); // Add position of vertices
            cube_i_geometry.vertices = new RC.BufferAttribute(cube_position, 3); //index
            cube_i_geometry.indices = new RC.BufferAttribute(new Uint32Array(cube_index), 1); // Check if normals are specified. Otherwise calculate them
            //cube_i_geometry.computeVertexNormals();
            cube_i_geometry.normals = new RC.BufferAttribute(cube_normal, 3);

            let cube_i_material = new RC.MeshBasicMaterial();
            cube_i_material.shadingType = RC.FlatShading;
            //cube_i_material.lights = false;
            cube_i_material.color = new RC.Color(this._getRandomColor());
            cube_i_material.side = RC.FRONT_AND_BACK_SIDE;
            if(i >= 50) {
                cube_i_material.color = new RC.Color(1, 0, 0);
                cube_i_material.specular = new RC.Color(1, 0, 0);
                cube_i_material.transparent = true;
                cube_i_material.opacity = 0.5;
            }else{
                cube_i_material.color = new RC.Color(0, 0, 1);
                cube_i_material.specular = new RC.Color(0, 0, 1);
            }

            let cube_i_object = new RC.Mesh(cube_i_geometry, cube_i_material, new RC.PickingShaderMaterial("TRIANGLES")); //let object = new RC.Cube(2, "#330022");
            cube_i_object.position.set(Math.random()*100-50, Math.random()*100-50, Math.random()*100-50);
            cube_i_object.position.multiplyScalar(0.5);
            cube_i_object.scale.set(Math.random()*4, Math.random()*4, Math.random()*4);


            //cube_i_object.useOutline = true;
            cube_i_object.outline.material.offset = 0.1;
            cube_i_object.outline.material.color.setScalar(0);

            //textures
            /*imgLoader.load("./textures/UV_Grid_Sm.jpg", function (image) {
                cube_i_object.geometry.uv = new RC.BufferAttribute(new Float32Array([0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1]), 2);

                const tex = new RC.Texture(image, RC.Texture.ClampToEdgeWrapping, RC.Texture.ClampToEdgeWrapping,
                    RC.Texture.LinearFilter, RC.Texture.LinearFilter,
                    RC.Texture.RGBA, RC.Texture.RGBA, RC.Texture.UNSIGNED_BYTE);

                cube_i_object.material.addMap(tex);
            });*/

            //const normCH = new RC.VertexNormal(cube_i_object, true);
            //cube_i_object.add(normCH);
            //scene.add(cube_i_object);
        }


        //orbit center - circle
        let circle_geometry = new RC.Geometry();

        let circle_material = new RC.MeshBasicMaterial();
        circle_material.color = new RC.Color(0x640022);
        circle_material.side = RC.FRONT_AND_BACK_SIDE;

        let circle_object = new RC.Circle(0.2, 32, circle_material, undefined);
        circle_object.position = new RC.Vector3(8, 0, 0);
        //RC.CoreControl.cameraControl.orbitalCameraControl.marker = circle_object;


        /*
        //QUAD - TEXTURED
        ////////////////////////////////////////////////////////////////////////////////////////////////////////////
        //quad texture
        var imgLoader = new RC.ImageLoader();

        imgLoader.load("test/textures/cookie.png", function (image) {
            let tex = new RC.Texture(image);

            imgLoader.load("test/textures/test.jpg", function (image) {
                let tex2 = new RC.Texture(image);


                let quad_T_geometry = new RC.Geometry();

                let quad_T_material = new RC.MeshBasicMaterial();
                quad_T_material.color = new RC.Color(0xffffff);
                quad_T_material.addMap(tex);
                quad_T_material.side = RC.FRONT_AND_BACK_SIDE;

                let quad_T_object = new RC.Quad({x: -1, y: 1}, {x: 1, y: -1}, quad_T_material, undefined);
                quad_T_object.position = new RC.Vector3(-4, 4, 0);
                scene.add(quad_T_object);

                let currentTex = tex;

                document.addEventListener('keydown', function(event) {
                    if(event.keyCode === 54){//key 6
                        quad_T_material.removeMap(currentTex);

                        if(currentTex === tex){
                            currentTex = tex2;
                        }else if(currentTex === tex2){
                            currentTex = tex;
                        }
                        quad_T_material.addMap(currentTex);
                    }
                });
            });

        });*/
        ////////////////////////////////////////////////////////////////////////////////////////////////////////////





        //scene.add(tri_object);
        //scene.add(quad_object);
        //scene.add(cube_n_object);

        //scene.add(cube_i_object);
        //scene.add(circle_object);


        //CUBE
        let CG1 = new RC.Geometry();
        CG1.vertices = new RC.Float32Attribute(cube_n_position, 3);
        CG1.computeVertexNormals();

        let CM1 = new RC.MeshBasicMaterial();
        CM1.color = new RC.Color(0x882266);
        CM1.side = RC.FRONT_AND_BACK_SIDE;
        //CM1.transparent = true;
        CM1.opacity = 0.5;
        CM1.shadingType = RC.FlatShading;

        const CO1 = new RC.Mesh(CG1, CM1);
        CO1.position.setScalar(0);
        CO1.useOutline = true;
        CO1.outline.scale.setScalar(1.02);
        CO1.outline.material.color.set(0);

        CO1.add(new RC.VertexNormal(CO1));
        //scene.add(CO1);


        //PLANE
        const plane = new RC.Quad({x: -10, y: 10}, {x: 10, y: -10}, new RC.MeshBasicMaterial(), undefined);
        //plane.geometry.computeVertexNormals();
        plane.material.color =  new RC.Color(0xccbbdd);
        plane.material.lights = true;
        plane.material.side = RC.FRONT_AND_BACK_SIDE;
        plane.material.shadingType = RC.SmoothShading;
        plane.material.transparent = true;
        plane.material.opacity = 0.8;
        plane.translateY(-4);
        //plane.rotateX(Math.PI/2);
        plane.position.setY(16);

        //plane.add(new RC.VertexNormal(plane));//todo texture error

        imgLoader.load("./textures/UV_Grid_Sm.jpg", function (image) {
            let tex = new RC.Texture(image);
            tex = new RC.Texture(image, RC.Texture.ClampToEdgeWrapping, RC.Texture.ClampToEdgeWrapping,
                RC.Texture.LinearFilter, RC.Texture.LinearFilter,
                RC.Texture.RGBA, RC.Texture.RGBA, RC.Texture.UNSIGNED_BYTE);

            plane.material.addMap(tex);
            //scene.add(plane);
        });


        //PLANES
        let planePosY = -4;
        planePosY = 0;

        /*const plane1 = new RC.Quad({x: -1024, y: 1024}, {x: 0, y: 0}, new RC.MeshPhongMaterial(), undefined);
        plane1.material.color =  new RC.Color(0xcc1111);
        plane1.material.lights = true;
        plane1.material.side = RC.FRONT_AND_BACK_SIDE;
        plane1.material.shadingType = RC.SmoothShading;
        plane1.material.transparent = false;
        plane1.material.opacity = 0.5;
        plane1.translateY(planePosY);
        plane1.rotateX(Math.PI/2);
        scene.add(plane1);
        const plane2 = new RC.Quad({x: 0, y: 0}, {x: 1024, y: -1024}, new RC.MeshPhongMaterial(), undefined);
        plane2.material.color =  new RC.Color(0xcc1111);
        plane2.material.lights = true;
        plane2.material.side = RC.FRONT_AND_BACK_SIDE;
        plane2.material.shadingType = RC.SmoothShading;
        plane2.material.transparent = true;
        plane2.material.opacity = 0.5;
        plane2.translateY(planePosY);
        plane2.rotateX(Math.PI/2);
        scene.add(plane2);
        const plane3 = new RC.Quad({x: -1024, y: 0}, {x: 0, y: -1024}, new RC.MeshPhongMaterial(), undefined);
        plane3.material.color =  new RC.Color(0x1111cc);
        plane3.material.lights = true;
        plane3.material.side = RC.FRONT_AND_BACK_SIDE;
        plane3.material.shadingType = RC.SmoothShading;
        plane3.material.transparent = false;
        plane3.material.opacity = 0.5;
        plane3.translateY(planePosY);
        plane3.rotateX(Math.PI/2);
        scene.add(plane3);
        const plane4 = new RC.Quad({x: 0, y: 1024}, {x: 1024, y: 0}, new RC.MeshPhongMaterial(), undefined);
        plane4.material.color =  new RC.Color(0x1111cc);
        plane4.material.lights = true;
        plane4.material.side = RC.FRONT_AND_BACK_SIDE;
        plane4.material.shadingType = RC.SmoothShading;
        plane4.material.transparent = true;
        plane4.material.opacity = 0.5;
        plane4.translateY(planePosY);
        plane4.rotateX(Math.PI/2);
        scene.add(plane4);*/


        //PLANE CLUSTER
        ////////////////////////////////////////////////////////////////////////////////////////////////////////////
        const multPlane = 8*4;
        const stepPlane = 100*0.1;
        const matPlane = new RC.MeshPhongMaterial();
        let PlaneMMatArray = [];
        let PlaneInstanceCount = 0;
        for(let i = -stepPlane*multPlane; i <= stepPlane*multPlane; i+=stepPlane){
            for(let j = -stepPlane*multPlane; j <= stepPlane*multPlane; j+=stepPlane){

                const plane = new RC.Quad({x: -1, y: 1}, {x: 1, y: -1}, matPlane, undefined);
                plane.material.color =  new RC.Color(0xcc1111);
                plane.specular = new RC.Color(0xff5733);
                plane.shininess = 8;
                plane.material.lights = true;
                plane.material.side = RC.FRONT_AND_BACK_SIDE;
                plane.material.shadingType = RC.SmoothShading;
                plane.material.transparent = false;
                plane.material.opacity = 0.5;
                //plane.translateY(planePosY);
                //plane.rotateX(-Math.PI/2);
                //scene.add(plane);

                plane.scale.setScalar(0.5*stepPlane);
                plane.scale.setScalar(0.5*stepPlane*0.9);
                plane.position.set(i, j, planePosY);


                plane.updateMatrix();
                //PlaneMMatArray = PlaneMMatArray.concat(plane.matrix.elements); //SLOW
                PlaneMMatArray.push(...plane.matrix.elements); //FAST
                PlaneInstanceCount++;
            }
        }

        //instanced duality
        const plane_instanced_geo = new RC.Quad({x: -1, y: 1}, {x: 1, y: -1}, matPlane, undefined).geometry;
        plane_instanced_geo.indices = RC.Uint32Attribute([1, 2, 0, 1, 0, 3], 1);
        plane_instanced_geo.indices.divisor = 0;
        plane_instanced_geo.vertices.divisor = 0;
        plane_instanced_geo.computeVertexNormals();
        plane_instanced_geo.normals.divisor = 0;

        plane_instanced_geo.MMat = new RC.BufferAttribute(new Float32Array(PlaneMMatArray), 16);
        plane_instanced_geo.MMat.divisor = 1;


        const plane_instanced_mat = new RC.MeshPhongMaterial();
        plane_instanced_mat.color = new RC.Color(0x881111);
        plane_instanced_mat.specular = new RC.Color(0xff5733);
        plane_instanced_mat.shininess = 8;
        plane_instanced_mat.side = RC.FRONT_AND_BACK_SIDE;
        plane_instanced_mat.shadingType = RC.FlatShading;
        //plane_instanced_mat.instanced = true;


        const plane_instanced_obj = new RC.Mesh(plane_instanced_geo, plane_instanced_mat);
        plane_instanced_obj.instanced = true;
        plane_instanced_obj.instanceCount = PlaneInstanceCount;

        plane_instanced_obj.rotateX(-Math.PI/2);
        plane_instanced_obj.pickable = false;

        scene.add(plane_instanced_obj);
        //plane_instanced_obj.pickingMaterial.instanced = true;
        ////////////////////////////////////////////////////////////////////////////////////////////////////////////


        //POINT
        ////////////////////////////////////////////////////////////////////////////////////////////////////////////
        const PG = new RC.Geometry();
        PG.vertices = Float32Attribute([10, 10, 10, 0, 0, 0, 1, 2, 3, 2.4, 4, 6.4, 2, 3, 6], 3);
        PG.normals = Float32Attribute([0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1], 3);

        const PO = new RC.Point(PG);
        //PO.points = [10, 10, 10, 0, 0, 0, 1, 2, 3, 2.4, 4, 6.4, 2, 3, 6]; //alternative
        PO.pickable = true;


        //PO.position.setScalar(1.2);
        PO.useOutline = true;
        PO.outline.scale.setScalar(1);
        PO.outline.material.color.set(0);
        PO.outline.material.pointSize = 128.0 * 1.1;
        PO.outline.material.drawCircles = true;

        PO.material = new RC.MeshPhongMaterial();
        PO.material.usePoints = true;
        PO.material.pointSize = 128.0;
        PO.material.drawCircles = true;

        //PO.material.transparent = true;
        PO.material.opacity = 0.75;

        //scene.add(PO);
        ////////////////////////////////////////////////////////////////////////////////////////////////////////////


        //SPRITE
        ////////////////////////////////////////////////////////////////////////////////////////////////////////////
        /*const SO = new RC.Sprite({x: -1, y: 1}, {x: 1, y: -1});
        SO.translateY(4);
        SO.useOutline = true;
        SO.outline.material.color.set(0);
        SO.scale.setScalar(0.4);
        SO.outline.scale.setScalar(0.4 * 1.1);

        //scene.add(SO);*/
        const spritePosition = new RC.Float32Attribute([10, 10, 10, 0, 0, 0, 1, 2, 3, 2, 3, 6, 2.4, 4, 6.4], 3);

        const spriteGeometry = new RC.Geometry();
        spriteGeometry.vertices = spritePosition;
        spriteGeometry.computeVertexNormals();

        const sprite = new RC.Sprite(spriteGeometry);
        sprite.scale.setScalar(1);
        //scene.add(sprite);
        ////////////////////////////////////////////////////////////////////////////////////////////////////////////




        //STRIPE (TRACK)
        ////////////////////////////////////////////////////////////////////////////////////////////////////////////
        const points = [0.00336601, 0.00217315, 10.2654, -30.2632, -12.1114, -59.5, -30.2886, -12.12, -59, -30.4911, -12.1898, -60, -35.3212, -13.8129, -69.5, -35.3467, -13.8212, -69, -35.55, -13.8878, -70, -41.4273, -15.7759, -81.5, -41.4528, -15.7839, -81, -41.6584, -15.8482, -82, -48.7005, -18.0017, -95, -48.9088, -18.0631, -96, -56.0212, -20.1092, -109, -56.2306, -20.168, -110, -66.5059, -22.9384, -129, -66.7176, -22.9918, -130, -77.2327, -25.4656, -149, -77.4491, -25.5124, -150];
        const stripe = new RC.Stripe(points, undefined, undefined, true, 1024*8);
        stripe.material.lineWidth = 4.0;
        //stripe.material.shadingType = RC.FlatShading;
        stripe.outline.material.lineWidth = stripe.material.lineWidth * 1.1;
        stripe.outline.material.color.set(0);
        stripe.useOutline = true;
        stripe.translateY(-32);
        //stripe.geometry.computeVertexNormals();

        //stripe.add(new RC.VertexNormal(stripe));
        //scene.add(stripe);
        ////////////////////////////////////////////////////////////////////////////////////////////////////////////
    }
    update(stopwatch){
        for(let i = 0; i < this._scene.children.length; i++){
            if(this._scene.children[i].type === "PointLight"){
                //this._scene.children[i].translateX( 8/100*Math.sin(stopwatch.currTime/10000));
                //this._scene.children[i].translateZ( 8/100*Math.cos(stopwatch.currTime/10000));
                this._scene.children[i].position.x = 32*Math.sin(stopwatch.currTime/10000);
                this._scene.children[i].position.z = 32*Math.cos(stopwatch.currTime/10000);
                this._scene.children[i].intensity = 8*Math.abs(Math.sin(stopwatch.currTime/10000));

                gb1.setUniform("power", this._scene.children[i].intensity/2);
                gb2.setUniform("power", this._scene.children[i].intensity/2);
            }

        }
    }

    _getRandomColor() {
        const letters = '0123456789ABCDEF';
        let color = '#';
        for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }

}


/***************************************************/ //BLOOM
/*const MainRenderPass = new RC.RenderPass(
    // Rendering pass type
    RC.RenderPass.BASIC,

    // Initialize function
    function (textureMap, additionalData) {
        //runs once 
    },

    // Preprocess function
    function (textureMap, additionalData) {
        return { scene: scene, camera: camera };
    },

    // Target
    RC.RenderPass.TEXTURE,

    // Viewport
    { width: predef_width, height: predef_height },

    // Bind depth texture to this ID
    "dt",

    [
        {id: "color0", textureConfig: RC.RenderPass.DEFAULT_RGBA_TEXTURE_CONFIG}
    ]
);
const hp = new RC.CustomShaderMaterial("highPass");
hp.lights = false;
const PostprocessingPass_HighPass = new RC.RenderPass(
    // Rendering pass type
    RC.RenderPass.POSTPROCESS,

    // Initialize function
    function (textureMap, additionalData) {
    },

    // Preprocess function
    function (textureMap, additionalData) {
        return {material: hp, textures: [textureMap["color0"]]};
    },

    // Target
    RC.RenderPass.TEXTURE,

    // Viewport
    { width: predef_width, height: predef_height },

    // Bind depth texture to this ID
    "dt",

    [
        {id: "color10", textureConfig: RC.RenderPass.DEFAULT_RGBA_TEXTURE_CONFIG},
        {id: "color11", textureConfig: RC.RenderPass.DEFAULT_RGBA_TEXTURE_CONFIG}
    ]
);
const gb1 = new RC.CustomShaderMaterial("gaussBlur", {"horizontal": true});
gb1.lights = false;
const PostprocessingPass_Gauss1 = new RC.RenderPass(
    // Rendering pass type
    RC.RenderPass.POSTPROCESS,

    // Initialize function
    function (textureMap, additionalData) {
    },

    // Preprocess function
    function (textureMap, additionalData) {
        return {material: gb1, textures: [textureMap["color10"], textureMap["color11"]]};
    },

    // Target
    RC.RenderPass.TEXTURE,

    // Viewport
    { width: predef_width, height: predef_height },

    // Bind depth texture to this ID
    "dt",

    [
        {id: "color20", textureConfig: RC.RenderPass.DEFAULT_RGBA_TEXTURE_CONFIG},
        {id: "color21", textureConfig: RC.RenderPass.DEFAULT_RGBA_TEXTURE_CONFIG}
    ]
);
const gb2 = new RC.CustomShaderMaterial("gaussBlur", {"horizontal": false});
gb2.lights = false;
const PostprocessingPass_Gauss2 = new RC.RenderPass(
    // Rendering pass type
    RC.RenderPass.POSTPROCESS,

    // Initialize function
    function (textureMap, additionalData) {
    },

    // Preprocess function
    function (textureMap, additionalData) {
        return {material: gb2, textures: [textureMap["color20"], textureMap["color21"]]};
    },

    // Target
    RC.RenderPass.TEXTURE,

    // Viewport
    { width: predef_width, height: predef_height },

    // Bind depth texture to this ID
    "dt",

    [
        {id: "color30", textureConfig: RC.RenderPass.DEFAULT_RGBA_TEXTURE_CONFIG},
        {id: "color31", textureConfig: RC.RenderPass.DEFAULT_RGBA_TEXTURE_CONFIG}
    ]
);
const bloom = new RC.CustomShaderMaterial("bloom");
bloom.lights = false;
const PostprocessingPass_Bloom = new RC.RenderPass(
    // Rendering pass type
    RC.RenderPass.POSTPROCESS,

    // Initialize function
    function (textureMap, additionalData) {
    },

    // Preprocess function
    function (textureMap, additionalData) {
        return {material: bloom, textures: [textureMap["color30"], textureMap["color31"]]};
    },

    // Target
    RC.RenderPass.TEXTURE,

    // Viewport
    { width: predef_width, height: predef_height },

    // Bind depth texture to this ID
    "dt",

    [
        {id: "color_out", textureConfig: RC.RenderPass.DEFAULT_RGBA_TEXTURE_CONFIG}
    ]
);*/



/***************************************************/ //Outline
/*const OriginalMats = [];
const MultiMats = [];
const OutlineMainRenderPass = new RC.RenderPass(
    // Rendering pass type
    RC.RenderPass.BASIC,

    // Initialize function
    function (textureMap, additionalData) {
        iterateSceneR(scene, function(object){
            if(object instanceof RC.Text2D || object instanceof RC.IcoSphere) return;
            OriginalMats.push(object.material);
        });
    },

    // Preprocess function
    function (textureMap, additionalData) {
        let m_index = 0;

        iterateSceneR(scene, function(object){
            if(object instanceof RC.Text2D || object instanceof RC.IcoSphere) return;
            object.material = OriginalMats[m_index];
            m_index++;
        });

        return { scene: scene, camera: camera };
    },

    // Target
    RC.RenderPass.TEXTURE,

    // Viewport
    { width: predef_width, height: predef_height },

    // Bind depth texture to this ID
    "dt",

    [
        {id: "color", textureConfig: RC.RenderPass.DEFAULT_RGBA_TEXTURE_CONFIG},
    ]
);
const OutlineMultiRenderPass = new RC.RenderPass(
    // Rendering pass type
    RC.RenderPass.BASIC,

    // Initialize function
    function (textureMap, additionalData) {
        iterateSceneR(scene, function(object){
            if(object instanceof RC.Text2D || object instanceof RC.IcoSphere) return;
            MultiMats.push(new RC.CustomShaderMaterial("multi", {near: nearPlane, far: farPlane}));
        });
    },

    // Preprocess function
    function (textureMap, additionalData) {
        let m_index = 0;

        iterateSceneR(scene, function(object){
            if(object instanceof RC.Text2D || object instanceof RC.IcoSphere) return;
            object.material = MultiMats[m_index];
            m_index++;
        });


        return { scene: scene, camera: camera };
    },

    // Target
    RC.RenderPass.TEXTURE,

    // Viewport
    { width: predef_width, height: predef_height },

    // Bind depth texture to this ID
    "depthDefault",

    [
        {id: "depth", textureConfig: RC.RenderPass.DEFAULT_RGBA_TEXTURE_CONFIG},
        {id: "normal", textureConfig: RC.RenderPass.DEFAULT_RGBA_TEXTURE_CONFIG},
        {id: "viewDir", textureConfig: RC.RenderPass.DEFAULT_RGBA_TEXTURE_CONFIG}
    ]
);
const outline = new RC.CustomShaderMaterial("outline", {scale: 1.0, edgeColor: [1.0, 1.0, 1.0, 1.0]});
outline.lights = false;
const OutlineRenderPass = new RC.RenderPass(
    // Rendering pass type
    RC.RenderPass.POSTPROCESS,

    // Initialize function
    function (textureMap, additionalData) {
    },

    // Preprocess function
    function (textureMap, additionalData) {
        //return { scene: scene, camera: camera };
        return {material: outline, textures: [textureMap["depthDefault"], textureMap["normal"], textureMap["viewDir"], textureMap["color"]]};
    },

    // Target
    RC.RenderPass.TEXTURE,

    // Viewport
    { width: predef_width, height: predef_height },

    // Bind depth texture to this ID
    "dt",

    [
        {id: "color_out", textureConfig: RC.RenderPass.DEFAULT_RGBA_TEXTURE_CONFIG}
    ]
);*/



/***************************************************/ //FXAA
const FXAAMainRenderPass = new RC.RenderPass(
    // Rendering pass type
    RC.RenderPass.BASIC,

    // Initialize function
    function (textureMap, additionalData) {
    },

    // Preprocess function
    function (textureMap, additionalData) {
        return { scene: scene, camera: camera };
    },

    // Target
    RC.RenderPass.TEXTURE,

    // Viewport
    { width: predef_width, height: predef_height },

    // Bind depth texture to this ID
    "dt",

    [
        {id: "color", textureConfig: RC.RenderPass.DEFAULT_RGBA_TEXTURE_CONFIG},
    ]
);
const lumaConversion = new RC.CustomShaderMaterial("lumaConversion");
lumaConversion.lights = false;
const FXAALumaConversionPass = new RC.RenderPass(
    // Rendering pass type
    RC.RenderPass.POSTPROCESS,

    // Initialize function
    function (textureMap, additionalData) {
    },

    // Preprocess function
    function (textureMap, additionalData) {
        return {material: lumaConversion, textures: [textureMap["color"]]};
    },

    // Target
    RC.RenderPass.TEXTURE,

    // Viewport
    { width: predef_width, height: predef_height },

    // Bind depth texture to this ID
    null,

    [
        {id: "RGBL", textureConfig: RC.RenderPass.DEFAULT_RGBA_TEXTURE_CONFIG}
    ]
);
const FXAA = new RC.CustomShaderMaterial("FXAA");
FXAA.lights = false;
const FXAARenderPass = new RC.RenderPass(
    // Rendering pass type
    RC.RenderPass.POSTPROCESS,

    // Initialize function
    function (textureMap, additionalData) {
    },

    // Preprocess function
    function (textureMap, additionalData) {
        return {material: FXAA, textures: [textureMap["RGBL"]]};
    },

    // Target
    RC.RenderPass.TEXTURE,

    // Viewport
    { width: predef_width, height: predef_height },

    // Bind depth texture to this ID
    null,

    [
        {id: "color_out", textureConfig: RC.RenderPass.DEFAULT_RGBA_TEXTURE_CONFIG}
    ]
);


/***************************************************/ //SSAA
/*const SSAA_value = 4;
const SSAASupersampleRenderPass = new RC.RenderPass(
    // Rendering pass type
    RC.RenderPass.BASIC,

    // Initialize function
    function (textureMap, additionalData) {
    },

    // Preprocess function
    function (textureMap, additionalData) {
        return { scene: scene, camera: camera };
    },

    // Target
    RC.RenderPass.TEXTURE,

    // Viewport
    { width: predef_width*SSAA_value, height: predef_height*SSAA_value },

    // Bind depth texture to this ID
    "dt",

    [
        {id: "color_supersample", textureConfig: RC.RenderPass.DEFAULT_RGBA_TEXTURE_CONFIG},
    ]
);
//LERP DOWNSAMPLE
//const SSAA = new RC.CustomShaderMaterial("copyTexture");
//SSAA.lights = false;
//TRUE DOWNSAMPLE
const SSAA = new RC.CustomShaderMaterial("SSAA", {SSAA_X: SSAA_value, MODE: 2, JITTER: false});
SSAA.lights = false;
SSAA.addSBFlag("KERNEL_BOX");
SSAA.addSBFlag("SSAAx" + SSAA_value);
const SSAADownsampleRenderPass = new RC.RenderPass(
    // Rendering pass type
    RC.RenderPass.POSTPROCESS,

    // Initialize function
    function (textureMap, additionalData) {
    },

    // Preprocess function
    function (textureMap, additionalData) {
        return {material: SSAA, textures: [textureMap["color_supersample"]]};
    },

    // Target
    RC.RenderPass.TEXTURE,

    // Viewport
    { width: predef_width, height: predef_height },

    // Bind depth texture to this ID
    "why?",

    [
        {id: "color_out", textureConfig: RC.RenderPass.DEFAULT_RGBA_TEXTURE_CONFIG}
    ]
);*/


/***************************************************/ //Screenshot
/*const copy = new RC.CustomShaderMaterial("copyTexture");
copy.lights = false;
const ScreenshotPass = new RC.RenderPass(
    // Rendering pass type
    RC.RenderPass.POSTPROCESS,

    // Initialize function
    function (textureMap, additionalData) {
    },

    // Preprocess function
    function (textureMap, additionalData) {
        return {material: copy, textures: [textureMap["color_out"]]};
    },

    // Target
    RC.RenderPass.SCREEN,

    // Viewport
    { width: predef_width, height: predef_height },

    // Bind depth texture to this ID
    null,

    [
        {id: "color_out_final", textureConfig: RC.RenderPass.DEFAULT_RGBA_TEXTURE_CONFIG}
    ]
);*/

const SSAA_value = 2;
const OriginalMats = [];
const MultiMats = [];

const RenderPass_MainSSAASupersample = new RC.RenderPass(
    // Rendering pass type
    RC.RenderPass.BASIC,

    // Initialize function
    function (textureMap, additionalData) {
        iterateSceneR(scene, function(object){
            if(object.pickable === false || object instanceof RC.Text2D || object instanceof RC.IcoSphere) {
                object.visible = true;
                return;
            }
            OriginalMats.push(object.material);
        });
    },

    // Preprocess function
    function (textureMap, additionalData) {
        let m_index = 0;

        iterateSceneR(scene, function(object){
            if(object.pickable === false || object instanceof RC.Text2D || object instanceof RC.IcoSphere) {
                object.visible = true;
                return;
            }
            object.material = OriginalMats[m_index];
            m_index++;
        });

        return { scene: scene, camera: camera };
    },

    // Target
    RC.RenderPass.TEXTURE,

    // Viewport
    { width: predef_width*SSAA_value, height: predef_height*SSAA_value },

    // Bind depth texture to this ID
    "depthDefaultDefaultMaterials",

    [
        {id: "color_supersample", textureConfig: RC.RenderPass.DEFAULT_RGBA_TEXTURE_CONFIG},
    ]
);
const RenderPass_MainMulti = new RC.RenderPass(
    // Rendering pass type
    RC.RenderPass.BASIC,

    // Initialize function
    function (textureMap, additionalData) {
        iterateSceneR(scene, function(object){
            if(object.pickable === false || object instanceof RC.Text2D || object instanceof RC.IcoSphere) {
                object.visible = false; 
                //GL_INVALID_OPERATION : glDrawElementsInstancedANGLE: buffer format and fragment output variable type incompatible
                //Program has no frag output at location 1, but destination draw buffer has an attached image.
                return;
            }
            const multi = new RC.CustomShaderMaterial("multi", {near: nearPlane, far: farPlane});
            multi.side = RC.FRONT_AND_BACK_SIDE; //reather use depth from default materials
            MultiMats.push(multi);
        });
    },

    // Preprocess function
    function (textureMap, additionalData) {
        let m_index = 0;

        iterateSceneR(scene, function(object){
            if(object.pickable === false || object instanceof RC.Text2D || object instanceof RC.IcoSphere) {
                object.visible = false;
                return;
            }
            object.material = MultiMats[m_index];
            m_index++;
        });


        return { scene: scene, camera: camera };
    },

    // Target
    RC.RenderPass.TEXTURE,

    // Viewport
    { width: predef_width*SSAA_value, height: predef_height*SSAA_value },

    // Bind depth texture to this ID
    "depthDefaultMultiMaterials",

    [
        {id: "depth", textureConfig: RC.RenderPass.DEFAULT_RGBA_TEXTURE_CONFIG},
        {id: "normal", textureConfig: RC.RenderPass.DEFAULT_RGB_TEXTURE_CONFIG},
        {id: "viewDir", textureConfig: RC.RenderPass.DEFAULT_RGB_TEXTURE_CONFIG},
        {id: "camDist", textureConfig: RC.RenderPass.DEFAULT_RGBA16F_TEXTURE_CONFIG}
    ]
);
const hp = new RC.CustomShaderMaterial("highPass");
hp.lights = false;
const RenderPass_HighPass = new RC.RenderPass(
    // Rendering pass type
    RC.RenderPass.POSTPROCESS,

    // Initialize function
    function (textureMap, additionalData) {
    },

    // Preprocess function
    function (textureMap, additionalData) {
        return {material: hp, textures: [textureMap["color_supersample"]]};
    },

    // Target
    RC.RenderPass.TEXTURE,

    // Viewport
    { width: predef_width*SSAA_value, height: predef_height*SSAA_value },

    // Bind depth texture to this ID
    "dt",

    [
        {id: "high_pass", textureConfig: RC.RenderPass.DEFAULT_RGBA_TEXTURE_CONFIG}
    ]
);

const gb1 = new RC.CustomShaderMaterial("gaussBlur", {horizontal: true, power: 1.0});
gb1.lights = false;
const RenderPass_Gauss1 = new RC.RenderPass(
    // Rendering pass type
    RC.RenderPass.POSTPROCESS,

    // Initialize function
    function (textureMap, additionalData) {
    },

    // Preprocess function
    function (textureMap, additionalData) {
        return {material: gb1, textures: [textureMap["high_pass"]]};
    },

    // Target
    RC.RenderPass.TEXTURE,

    // Viewport
    { width: predef_width*SSAA_value, height: predef_height*SSAA_value },

    // Bind depth texture to this ID
    null,

    [
        {id: "gauss_half", textureConfig: RC.RenderPass.DEFAULT_RGBA_TEXTURE_CONFIG}
    ]
);
const gb2 = new RC.CustomShaderMaterial("gaussBlur", {horizontal: false, power: 1.0});
gb2.lights = false;
const RenderPass_Gauss2 = new RC.RenderPass(
    // Rendering pass type
    RC.RenderPass.POSTPROCESS,

    // Initialize function
    function (textureMap, additionalData) {
    },

    // Preprocess function
    function (textureMap, additionalData) {
        return {material: gb2, textures: [textureMap["gauss_half"]]};
    },

    // Target
    RC.RenderPass.TEXTURE,

    // Viewport
    { width: predef_width*SSAA_value, height: predef_height*SSAA_value },

    // Bind depth texture to this ID
    null,

    [
        {id: "gauss_full", textureConfig: RC.RenderPass.DEFAULT_RGBA_TEXTURE_CONFIG}
    ]
);
const bloom = new RC.CustomShaderMaterial("bloom");
bloom.lights = false;
const RenderPass_Bloom = new RC.RenderPass(
    // Rendering pass type
    RC.RenderPass.POSTPROCESS,

    // Initialize function
    function (textureMap, additionalData) {
    },

    // Preprocess function
    function (textureMap, additionalData) {
        return {material: bloom, textures: [textureMap["gauss_full"], textureMap["color_supersample"]]};
    },

    // Target
    RC.RenderPass.TEXTURE,

    // Viewport
    { width: predef_width*SSAA_value, height: predef_height*SSAA_value },

    // Bind depth texture to this ID
    null,

    [
        {id: "color_bloom", textureConfig: RC.RenderPass.DEFAULT_RGBA_TEXTURE_CONFIG}
    ]
);
const outline = new RC.CustomShaderMaterial("outline", {scale: 1.0*SSAA_value, edgeColor: [1.0, 1.0, 1.0, 1.0]});
outline.lights = false;
const RenderPass_Outline = new RC.RenderPass(
    // Rendering pass type
    RC.RenderPass.POSTPROCESS,

    // Initialize function
    function (textureMap, additionalData) {
    },

    // Preprocess function
    function (textureMap, additionalData) {
        return {material: outline, textures: [textureMap["depthDefaultMultiMaterials"], textureMap["normal"], textureMap["viewDir"], textureMap["color_bloom"]]};
    },

    // Target
    RC.RenderPass.TEXTURE,

    // Viewport
    { width: predef_width*SSAA_value, height: predef_height*SSAA_value },

    // Bind depth texture to this ID
    null,

    [
        {id: "color_outline", textureConfig: RC.RenderPass.DEFAULT_RGBA_TEXTURE_CONFIG}
    ]
);
const fog = new RC.CustomShaderMaterial("fog", {MODE: 1, fogColor: [0.5, 0.4, 0.45, 0.8]});
fog.lights = false;
const RenderPass_Fog = new RC.RenderPass(
    // Rendering pass type
    RC.RenderPass.POSTPROCESS,

    // Initialize function
    function (textureMap, additionalData) {
    },

    // Preprocess function
    function (textureMap, additionalData) {
        //return {material: fog, textures: [textureMap["color_outline"], textureMap["depthDefaultDefaultMaterials"]]}; //grid jumps on depth buffer
        return {material: fog, textures: [textureMap["color_outline"], textureMap["camDist"]]}; //grid has specific shader for extruding geometry, even if implemented, it would jump around
    },

    // Target
    RC.RenderPass.TEXTURE,

    // Viewport
    { width: predef_width*SSAA_value, height: predef_height*SSAA_value },

    // Bind depth texture to this ID
    null,

    [
        {id: "color_fog", textureConfig: RC.RenderPass.DEFAULT_RGBA_TEXTURE_CONFIG}
    ]
);
//LERP DOWNSAMPLE
const SSAA = new RC.CustomShaderMaterial("copyTexture");
SSAA.lights = false;
//TRUE DOWNSAMPLE
//const SSAA = new RC.CustomShaderMaterial("SSAA", {SSAA_X: SSAA_value, MODE: 2, JITTER: false});
//SSAA.lights = false;
//SSAA.addSBFlag("KERNEL_BOX");
//SSAA.addSBFlag("SSAAx" + SSAA_value);
const RenderPass_SSAADownsample = new RC.RenderPass(
    // Rendering pass type
    RC.RenderPass.POSTPROCESS,

    // Initialize function
    function (textureMap, additionalData) {
    },

    // Preprocess function
    function (textureMap, additionalData) {
        return {material: SSAA, textures: [textureMap["color_fog"]]};
    },

    // Target
    RC.RenderPass.TEXTURE,

    // Viewport
    { width: predef_width, height: predef_height },

    // Bind depth texture to this ID
    "null",

    [
        {id: "color_out", textureConfig: RC.RenderPass.DEFAULT_RGBA_TEXTURE_CONFIG}
    ]
);

/***************************************************/ //Screenshot
const copy = new RC.CustomShaderMaterial("copyTexture");
copy.lights = false;
const RenderPass_Screenshot = new RC.RenderPass(
    // Rendering pass type
    RC.RenderPass.POSTPROCESS,

    // Initialize function
    function (textureMap, additionalData) {
    },

    // Preprocess function
    function (textureMap, additionalData) {
        return {material: copy, textures: [textureMap["color_out"]]};
    },

    // Target
    RC.RenderPass.SCREEN,

    // Viewport
    { width: predef_width, height: predef_height },

    // Bind depth texture to this ID
    null,

    [
        {id: "color_out_final", textureConfig: RC.RenderPass.DEFAULT_RGBA_TEXTURE_CONFIG}
    ]
);