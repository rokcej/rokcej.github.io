/** IMPORTS */
import * as RC from '../../src/RenderCore.js';
import {HEP} from './hep/HEP.js';
import {Utility} from './hep/Utility.js';
import DetectorLoader from './hep/DetectorLoader.js'
import CollisionEventLoader from './hep/CollisionEventLoader.js'


const predef_width = document.body.clientWidth;
const predef_height = document.body.clientHeight;
const nearPlane = 0.1;
const farPlane = 100000;
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


export default class HighEnergyPhysicsCore{
    constructor(shaderPath = "./src/shaders"){
        this._canvas = new RC.Canvas(undefined, "rc-canvas-hep");

        this._renderer = new RC.MeshRenderer(this._canvas.canvas, RC.WEBGL2, {antialias: false});
        this._renderer.clearColor = "#000000ff";
        this._renderer.addShaderLoaderUrls(shaderPath);
        this._renderQueue = this._initializeRenderQueue(this._renderer);

        this._scene = new RC.Scene();
        this._scene.name = "HEP";
        this._populateScene(this._scene);

        this._camera = new RC.PerspectiveCamera(90, this._canvas.canvas.width/this._canvas.canvas.height, nearPlane, farPlane);
        //this._camera = new RC.XRPerspectiveCamera(90, this._canvas.canvas.width/this._canvas.canvas.height, 0.1, 100000);
        this._camera.position = new RC.Vector3(-1820/2, 1020/2, 3820/2);
        //this._camera.position = new RC.Vector3(0, 0, 50);
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
        /*let pLightFirst = new RC.PointLight(new RC.Color("#FF0000"), 1, 0);
        let pLightSecond = new RC.PointLight(new RC.Color("#FF0000"), 1, 0);
        let pLightThird = new RC.PointLight(new RC.Color("#FF0000"), 1, 0);
        let pLightForth = new RC.PointLight(new RC.Color("#0000FF"), 1, 0);
        let pLightFifth = new RC.PointLight(new RC.Color("#0000FF"), 1, 0);
        let pLightSixth = new RC.PointLight(new RC.Color("#0000FF"), 1, 0);*/
        let pLightFirst = new RC.PointLight(new RC.Color("#FFFFFF"), 1, 0);
        let pLightSecond = new RC.PointLight(new RC.Color("#FFFFFF"), 1, 0);
        let pLightThird = new RC.PointLight(new RC.Color("#FFFFFF"), 1, 0);
        let pLightForth = new RC.PointLight(new RC.Color("#FFFFFF"), 1, 0);
        let pLightFifth = new RC.PointLight(new RC.Color("#FFFFFF"), 1, 0);
        let pLightSixth = new RC.PointLight(new RC.Color("#FFFFFF"), 1, 0);

        pLightFirst.position = new RC.Vector3(10000, 0, 0);
        pLightSecond.position = new RC.Vector3(-10000, 0, 0);
        pLightThird.position = new RC.Vector3(0, 10000, 0);
        pLightForth.position = new RC.Vector3(0, -10000, 0);
        pLightFifth.position = new RC.Vector3(0, 0, 10000);
        pLightSixth.position = new RC.Vector3(0, 0, -10000);

        scene.add(pLightFirst);
        scene.add(pLightSecond);
        scene.add(pLightThird);
        scene.add(pLightForth);
        scene.add(pLightFifth);
        scene.add(pLightSixth);


        let detectorGroupFront = new RC.Group();
        let detectorGroupBack = new RC.Group();
        let modelsMinMaxPositions = {};

        //OBJ coll
        const scope = this;
        let HEPDetectorLoadingManager = new RC.LoadingManager(
            function(){
                //loadingProgressText.innerHTML = "Loaded Volume";
                //loadingProgressBar.setAttribute("style", "width: 100%");
                console.log("HEP detector load complete.");

                scope._loadHEPCollisionEvent(scene, modelsMinMaxPositions);
            },
            function(){
                //loadingProgressBar.setAttribute("style", "width: " + percent.toFixed(2) + "%");
            },
            function(){
                //loadingProgressText.innerHTML = "Error Loading Volume";
                //loadingProgressBar.setAttribute("style", "width: 0%");
                console.log("HEP detector load error.");
            }
        );

        let HEPDetectorOBJLoader = new RC.ObjLoader(HEPDetectorLoadingManager);
        HEPDetectorOBJLoader.load(
            "hep/data/obj/BeamPipe.obj",
            function (data) {
                console.log("HEP OBJ detector load complete.");


                for (let i = 0; i < data.length; i++) {

                    let beamPipeATTRUNIObject = {
                        "attributes": {},
                        "uniforms": {
                            "material.diffuse": new RC.Color(HEP.params.colorBeamPipe).toArray(),
                            "material.emissive": new RC.Color(HEP.params.ecolorBeamPipe).toArray(),
                            "material.alpha": HEP.params.opacityBeamPipe
                        }
                    };
                    let materialBeamPipeF = new RC.CustomShaderMaterial("lambert", beamPipeATTRUNIObject.uniforms);
                    materialBeamPipeF.transparent = true;
                    materialBeamPipeF.side = RC.BACK_SIDE;
                    materialBeamPipeF.depthTest = false;
                    materialBeamPipeF.depthWrite = true;
                    materialBeamPipeF.useClippingPlanes = true;
                    materialBeamPipeF.clippingPlanes = [HEP.params.planeX, HEP.params.planeY, HEP.params.planeZ];

                    let BeamPipeF = data[i];
                    BeamPipeF.material = materialBeamPipeF;
                    BeamPipeF.renderOrder = HEP.params.beamPipeFRenderOrder;
                    BeamPipeF.isStatic = true;
                    //BeamPipeF.staticStateDirty = true;


                    let materialBeamPipeB = new RC.CustomShaderMaterial("lambert", beamPipeATTRUNIObject.uniforms);
                    materialBeamPipeB.transparent = true;
                    materialBeamPipeB.side = RC.FRONT_SIDE;
                    materialBeamPipeB.depthTest = true;
                    materialBeamPipeB.depthWrite = true;
                    materialBeamPipeB.useClippingPlanes = true;
                    materialBeamPipeB.clippingPlanes = [HEP.params.planeX, HEP.params.planeY, HEP.params.planeZ];

                    let BeamPipeB = new RC.Mesh(BeamPipeF.geometry, materialBeamPipeB);
                    BeamPipeB.renderOrder = HEP.params.beamPipeBRenderOrder;
                    BeamPipeB.isStatic = true;
                    //BeamPipeB.staticStateDirty = true;


                    modelsMinMaxPositions["BeamPipe"] = Utility.getObjectMinMaxPosition(BeamPipeF);


                    detectorGroupFront.add(BeamPipeF);
                    detectorGroupBack.add(BeamPipeB);
                }
            },
            function (xhr){
                console.log( "HEP OBJ detector " + (xhr.loaded / xhr.total * 100) + "% loaded." );
            },
            function (err){
                console.error("HEP OBJ detector load error.");
            });
        HEPDetectorOBJLoader.load(
            "hep/data/obj/PST.obj",
            function (data) {
                console.log("HEP OBJ detector load complete.");


                for (let i = 0; i < data.length; i++) {

                    let PSTATTRUNIObject = {
                        "attributes": {},
                        "uniforms": {
                            "material.diffuse": new RC.Color(HEP.params.colorPST).toArray(),
                            "material.emissive": new RC.Color(HEP.params.ecolorPST).toArray(),
                            "material.alpha": HEP.params.opacityPST
                            //"clippingPlanes": []
                        }
                    };
                    let materialPSTF = new RC.CustomShaderMaterial("lambert", PSTATTRUNIObject.uniforms);
                    materialPSTF.transparent = true;
                    materialPSTF.side = RC.BACK_SIDE;
                    materialPSTF.depthTest = false;
                    materialPSTF.depthWrite = true;
                    materialPSTF.useClippingPlanes = true;
                    materialPSTF.clippingPlanes = [HEP.params.planeX, HEP.params.planeY, HEP.params.planeZ];

                    let PSTF = data[i];
                    PSTF.material = materialPSTF;
                    PSTF.renderOrder = HEP.params.PSTFRenderOrder;
                    PSTF.isStatic = true;
                    //PSTF.staticStateDirty = true;


                    let materialPSTB = new RC.CustomShaderMaterial("lambert", PSTATTRUNIObject.uniforms);
                    materialPSTB.transparent = true;
                    materialPSTB.side = RC.FRONT_SIDE;
                    materialPSTB.depthTest = true;
                    materialPSTB.depthWrite = true;
                    materialPSTB.useClippingPlanes = true;
                    materialPSTB.clippingPlanes = [HEP.params.planeX, HEP.params.planeY, HEP.params.planeZ];

                    let PSTB = new RC.Mesh(PSTF.geometry, materialPSTB);
                    PSTB.renderOrder = HEP.params.PSTBRenderOrder;
                    PSTB.isStatic = true;
                    //PSTB.staticStateDirty = true;


                    modelsMinMaxPositions["PST"] = Utility.getObjectMinMaxPosition(PSTF);


                    detectorGroupFront.add(PSTF);
                    detectorGroupBack.add(PSTB);
                }
            },
            function (xhr){
                console.log( "HEP OBJ detector " + (xhr.loaded / xhr.total * 100) + "% loaded." );
            },
            function (err){
                console.error("HEP OBJ detector load error.");
            });


        //CSV coll
        let HEPDetectorLoader = new DetectorLoader(HEPDetectorLoadingManager);
        HEPDetectorLoader.load(
            "hep/data/csv/detectors.csv",
            function (data) {
                console.log("HEP CSV detector load complete.");


                for (let i = 0; i < data.length; i++) {


                    switch(i) {
                        case 0:
                            // Pix code block
                            let PixATTRUNIObject = {
                                "attributes": {},
                                "uniforms": {
                                    "material.diffuse": new RC.Color(HEP.params.colorPix).toArray(),
                                    "material.emissive": new RC.Color(HEP.params.ecolorPix).toArray(),
                                    "material.alpha": HEP.params.opacityPix
                                }
                            };
                            let materialPixF = new RC.CustomShaderMaterial("lambert", PixATTRUNIObject.uniforms);
                            materialPixF.transparent = true;
                            materialPixF.side = RC.FRONT_SIDE;
                            materialPixF.depthTest = true;
                            materialPixF.depthWrite = true;
                            materialPixF.useClippingPlanes = true;
                            materialPixF.clippingPlanes = [HEP.params.planeX, HEP.params.planeY, HEP.params.planeZ];

                            let PixF = data[0];
                            PixF.material = materialPixF;
                            PixF.renderOrder = HEP.params.pixFRenderOrder;
                            PixF.isStatic = true;
                            //PixF.staticStateDirty = true;


                            let materialPixB = new RC.CustomShaderMaterial("lambert", PixATTRUNIObject.uniforms);
                            materialPixB.transparent = true;
                            materialPixB.side = RC.FRONT_AND_BACK_SIDE;
                            materialPixB.depthTest = false;
                            materialPixB.depthWrite = true;
                            materialPixB.useClippingPlanes = true;
                            materialPixB.clippingPlanes = [HEP.params.planeX, HEP.params.planeY, HEP.params.planeZ];

                            let PixB = new RC.Mesh(PixF.geometry, materialPixB);
                            PixB.renderOrder = HEP.params.pixBRenderOrder;
                            PixB.isStatic = true;
                            //PixB.staticStateDirty = true;


                            modelsMinMaxPositions["Pix"] = Utility.getObjectMinMaxPosition(PixF);


                            detectorGroupFront.add(PixF);
                            detectorGroupBack.add(PixB);
                            break;
                        case 1:
                            // SStrip code block
                            let SStripATTRUNIObject = {
                                "attributes": {},
                                "uniforms": {
                                    "material.diffuse": new RC.Color(HEP.params.colorSStrip).toArray(),
                                    "material.emissive": new RC.Color(HEP.params.ecolorSStrip).toArray(),
                                    "material.alpha": HEP.params.opacitySStrip
                                }
                            };
                            let materialSStripF = new RC.CustomShaderMaterial("lambert", SStripATTRUNIObject.uniforms);
                            materialSStripF.transparent = true;
                            materialSStripF.side = RC.FRONT_SIDE;
                            materialSStripF.depthTest = true;
                            materialSStripF.depthWrite = true;
                            materialSStripF.useClippingPlanes = true;
                            materialSStripF.clippingPlanes = [HEP.params.planeX, HEP.params.planeY, HEP.params.planeZ];

                            let SStripF = data[1];
                            SStripF.material = materialSStripF;
                            SStripF.renderOrder = HEP.params.SStripFRenderOrder;
                            SStripF.isStatic = true;
                            //SStripF.staticStateDirty = true;


                            let materialSStripB = new RC.CustomShaderMaterial("lambert", SStripATTRUNIObject.uniforms);
                            materialSStripB.transparent = true;
                            materialSStripB.side = RC.FRONT_AND_BACK_SIDE;
                            materialSStripB.depthTest = false;
                            materialSStripB.depthWrite = true;
                            materialSStripB.useClippingPlanes = true;
                            materialSStripB.clippingPlanes = [HEP.params.planeX, HEP.params.planeY, HEP.params.planeZ];

                            let SStripB = new RC.Mesh(SStripF.geometry, materialSStripB);
                            SStripB.renderOrder = HEP.params.SStripBRenderOrder;
                            SStripB.isStatic = true;
                            //SStripB.staticStateDirty = true;


                            modelsMinMaxPositions["SStrip"] = Utility.getObjectMinMaxPosition(SStripF);


                            detectorGroupFront.add(SStripF);
                            detectorGroupBack.add(SStripB);
                            break;
                        case 2:
                            // LStrip code block
                            let LStripATTRUNIObject = {
                                "attributes": {},
                                "uniforms": {
                                    "material.diffuse": new RC.Color(HEP.params.colorLStrip).toArray(),
                                    "material.emissive": new RC.Color(HEP.params.ecolorLStrip).toArray(),
                                    "material.alpha": HEP.params.opacityLStrip
                                    //"clippingPlanes": [HEP.params.planeX, HEP.params.planeY, HEP.params.planeZ]
                                }
                            };
                            let materialLStripF = new RC.CustomShaderMaterial("lambert", LStripATTRUNIObject.uniforms);
                            materialLStripF.transparent = true;
                            materialLStripF.side = RC.FRONT_SIDE;
                            materialLStripF.depthTest = true;
                            materialLStripF.depthWrite = true;
                            materialLStripF.useClippingPlanes = true;
                            materialLStripF.clippingPlanes = [HEP.params.planeX, HEP.params.planeY, HEP.params.planeZ];

                            let LStripF = data[2];
                            LStripF.material = materialLStripF;
                            LStripF.renderOrder = HEP.params.LStripFRenderOrder;
                            LStripF.isStatic = true;
                            //LStripF.staticStateDirty = true;


                            let materialLStripB = new RC.CustomShaderMaterial("lambert", LStripATTRUNIObject.uniforms);
                            materialLStripB.transparent = true;
                            materialLStripB.side = RC.FRONT_AND_BACK_SIDE;
                            materialLStripB.depthTest = false;
                            materialLStripB.depthWrite = true;
                            materialLStripB.useClippingPlanes = true;
                            materialLStripB.clippingPlanes = [HEP.params.planeX, HEP.params.planeY, HEP.params.planeZ];

                            let LStripB = new RC.Mesh(LStripF.geometry, materialLStripB);
                            LStripB.renderOrder = HEP.params.LStripBRenderOrder;
                            LStripB.isStatic = true;
                            //LStripB.staticStateDirty = true;


                            modelsMinMaxPositions["LStrip"] = Utility.getObjectMinMaxPosition(LStripF);


                            detectorGroupFront.add(LStripF);
                            detectorGroupBack.add(LStripB);
                            break;
                        default:
                            console.warn("Unknown detector index!");
                    }

                }
            },
            function (xhr){
                console.log("HEP CSV detector " + (xhr.loaded / xhr.total * 100) + "% loaded.");
            },
            function (err){
                console.error("HEP CSV detector load error.");
            }
        );


        //scene.add(detectorGroupFront);
        //scene.add(detectorGroupBack);
    }
    _loadHEPCollisionEvent(scene, modelsMinMaxPositions){
        let particlesData, hitsData, cellsData, truthData;


        let HEPCollisionEventLoadingManager = new RC.LoadingManager(
            function(){
                //loadingProgressText.innerHTML = "Loaded Volume";
                //loadingProgressBar.setAttribute("style", "width: 100%");
                console.log("HEP collision event load complete.");

                /*if (loadedCollisionDataFiles === numCollisionDataFiles) {
                    loadedCollisionDataFiles = 0;


                    progressCircle.remove();
                    progressBar.style.width = 100 + "%";
                    progressBar.style.background = params.colorOK;

                    loadCollisionDataV2(particlesData, hitsData, cellsData, truthData);
                }*/
                let object = HEPCollisionEventLoader.loadCollisionDataV2(particlesData, hitsData, cellsData, truthData, modelsMinMaxPositions); //TODO na return vrni znotraj loaderja?
                object[0].isStatic = true;
                //object[0].staticStateDirty = true;
                object[1].isStatic = true;
                //object[1].staticStateDirty = true;
                object[2].isStatic = true;
                //object[2].staticStateDirty = true;
                object[3].isStatic = true;
                //object[3].staticStateDirty = true;
                scene.add(object[0]);
                scene.add(object[1]);
                ////scene.add(object[2]);//unindexed TODO performance
                //scene.add(object[3]); //indeed
                scene.add(object[4]); //indexed + wide
            },
            function(){
                //loadingProgressBar.setAttribute("style", "width: " + percent.toFixed(2) + "%");
            },
            function(){
                //loadingProgressText.innerHTML = "Error Loading Volume";
                //loadingProgressBar.setAttribute("style", "width: 0%");
                console.log("HEP collision event load error.");
            }
        );

        let HEPCollisionEventLoader = new CollisionEventLoader(HEPCollisionEventLoadingManager);
        HEPCollisionEventLoader.load(
            "hep/data/csv/train_sample/event000001000-particles.csv",
            function (data) {
                console.log("HEP particles load complete.");

                particlesData = data;
            },
            function (xhr){
                console.log("HEP particles " + (xhr.loaded / xhr.total * 100) + "% loaded.");
            },
            function (err){
                console.error("HEP particles load error.");
            }
        );
        HEPCollisionEventLoader.load(
            "hep/data/csv/train_sample/event000001000-hits.csv",
            function (data) {
                console.log("HEP hits load complete.");

                hitsData = data;
            },
            function (xhr){
                console.log("HEP hits " + (xhr.loaded / xhr.total * 100) + "% loaded.");
            },
            function (err){
                console.error("HEP hits load error.");
            }
        );
        HEPCollisionEventLoader.load(
            "hep/data/csv/train_sample/event000001000-truth.csv",
            function (data) {
                console.log("HEP truth load complete.");

                truthData = data;
            },
            function (xhr){
                console.log("HEP truth " + (xhr.loaded / xhr.total * 100) + "% loaded.");
            },
            function (err){
                console.error("HEP truth load error.");
            }
        );
    }
    _initializeRenderQueue(renderer){
        const renderQueue = new RC.RenderQueue(renderer);
        

        /*renderQueue.pushRenderPass(new RC.RenderPass(
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
        ));*/

        //SSAA
        renderQueue.pushRenderPass(RenderPass_MainSSAASupersample);
        //renderQueue.pushRenderPass(RenderPass_MainMulti);
        renderQueue.pushRenderPass(RenderPass_HighPass);
        renderQueue.pushRenderPass(RenderPass_Gauss1);
        renderQueue.pushRenderPass(RenderPass_Gauss2);
        renderQueue.pushRenderPass(RenderPass_Bloom);
        //renderQueue.pushRenderPass(RenderPass_Outline);
        //renderQueue.pushRenderPass(RenderPass_Fog);
        renderQueue.pushRenderPass(RenderPass_SSAADownsample);

        //SCR
        renderQueue.pushRenderPass(RenderPass_Screenshot);
    

        return renderQueue;
    }
}



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
        return {material: SSAA, textures: [textureMap["color_bloom"]]};
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