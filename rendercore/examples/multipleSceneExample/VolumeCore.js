/** IMPORTS */
import * as RC from '../../src/RenderCore.js';


const predef_width = document.body.clientWidth;
const predef_height = document.body.clientHeight;
const nearPlane = 0.1;
const farPlane = 1000;
let scene;
let camera;


export default class VolumeCore{
    constructor(shaderPath = "./src/shaders"){
        this._canvas = new RC.Canvas(undefined, "rc-canvas-volume");

        this._renderer = new RC.MeshRenderer(this._canvas.canvas, RC.WEBGL2, {antialias: false});
        this._renderer.clearColor = "#333333ff";
        this._renderer.addShaderLoaderUrls(shaderPath);
        this._renderQueue = this._initializeRenderQueue(this._renderer);

        this._scene = new RC.Scene();
        this._scene.name = "Volume";
        this._populateScene(this._scene);

        this._camera = new RC.PerspectiveCamera(75, this._canvas.canvas.width/this._canvas.canvas.height, nearPlane, farPlane);
        this._camera.position = new RC.Vector3(0, 0, 1);
        this._camera.lookAt(new RC.Vector3(0, 0, 0), new RC.Vector3(0, 1, 0));


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


    _populateScene(scene){
        //LIGHTS
        // Initialize lights and add them to the scene
        let pLightFirst = new RC.PointLight(new RC.Color("#FF0000"), 1, 0);
        let pLightSecond = new RC.PointLight(new RC.Color("#FF0000"), 1, 0);
        let pLightThird = new RC.PointLight(new RC.Color("#FF0000"), 1, 0);
        let pLightForth = new RC.PointLight(new RC.Color("#0000FF"), 1, 0);
        let pLightFifth = new RC.PointLight(new RC.Color("#0000FF"), 1, 0);
        let pLightSixth = new RC.PointLight(new RC.Color("#0000FF"), 1, 0);

        pLightFirst.position = new RC.Vector3(10, 0, 0);
        pLightSecond.position = new RC.Vector3(-10, 0, 0);
        pLightThird.position = new RC.Vector3(0, 10, 0);
        pLightForth.position = new RC.Vector3(0, -10, 0);
        pLightFifth.position = new RC.Vector3(0, 0, 10);
        pLightSixth.position = new RC.Vector3(0, 0, -10);

        scene.add(pLightFirst);
        scene.add(pLightSecond);
        scene.add(pLightThird);
        scene.add(pLightForth);
        scene.add(pLightFifth);
        scene.add(pLightSixth);


        //LOAD
        let RAWLoader = new RC.RAWLoader();
        RAWLoader.load(
            "models/volume/hydrogen_atom_128x128x128_uint8.raw",
            //"test/models/volume/neghip_64x64x64_uint8.raw",
            //"test/models/volume/mrt_angio_416x512x112_uint16.raw",

            //"test/models/volume/backpack_512x512x373_uint16.raw",
            //"test/models/volume/shockwave_64x64x512_uint8.raw",
            //"test/models/volume/silicium_98x34x34_uint8.raw",
            //"test/models/volume/magnetic_reconnection_512x512x512_float32.raw",

            //"test/models/volume/kingsnake_1024x1024x795_uint8.raw",
            function (data) {
                console.log("RAW load complete.");

                //console.log(data);
                let VPTVolume = new RC.VPTVolume(data, {dimensions: [128, 128, 128], bitSize: 8});
                //let VPTVolume = new RC.VPTVolume(data, {dimensions: [64, 64, 64], bitSize: 8});
                //let VPTVolume = new RC.VPTVolume(data, {dimensions: [416, 512, 112], bitSize: 8}); //let VPTVolume = new RC.VPTVolume(data, {dimensions: [416, 512, 112], bitSize: 16});

                //let VPTVolume = new RC.VPTVolume(data, {dimensions: [512, 512, 373], bitSize: 8});
                //let VPTVolume = new RC.VPTVolume(data, {dimensions: [64, 64, 512], bitSize: 8});
                //let VPTVolume = new RC.VPTVolume(data, {dimensions: [98, 34, 34], bitSize: 8});
                //let VPTVolume = new RC.VPTVolume(data, {dimensions: [512, 512, 512], bitSize: 8});

                //let VPTVolume = new RC.VPTVolume(data, {dimensions: [1024, 1024, 795], bitSize: 8});
                scene.add(VPTVolume);

                //let VPTInterface = new RC.VPTRendInterface();
            },
            function (xhr){
                console.log("RAW " + (xhr.loaded / xhr.total * 100) + "% loaded." );
            },
            function (err){
                console.error("RAW load error.");
            });
    }
    _initializeRenderQueue(renderer){
        const renderQueue = new RC.RenderQueue(renderer);
        

        renderQueue.pushRenderPass(new RC.RenderPass(
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
            RC.RenderPass.SCREEN,

            // Viewport
            { width: predef_width, height: predef_height },

            // Bind depth texture to this ID
            "depthDefaultDefaultMaterials",

            [
                {id: "color_supersample", textureConfig: RC.RenderPass.DEFAULT_RGBA_TEXTURE_CONFIG},
            ]
        ));
    

        return renderQueue;
    }
}