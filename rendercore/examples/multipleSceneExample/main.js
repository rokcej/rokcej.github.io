/** IMPORTS */
import * as RC from "../../src/RenderCore.js";
import MeshCore from "./MeshCore.js";
import PointCloudCore from "./PointCloudCore.js";
import HighEnergyPhysicsCore from "./HighEnergyPhysicsCore.js";
import VolumeCore from "./VolumeCore.js";
import XR from "./hep/XR.js";
import {Euler} from "../../src/RenderCore.js";


//const predef_width = 1280;
//const predef_height = 720;
const predef_width = document.body.clientWidth;
const predef_height = document.body.clientHeight;
const nearPlane = 0.1;
const farPlane = 1000000;


/** CONTROL PARAMETERS */
const CoreControl = {
    //plain
    canvas: undefined,
    scene: undefined,
    camera: undefined,
    renderer: undefined,
    renderQueue: undefined,

    //util
    stopwatch: {currTime: 0, prevTime: 0, deltaTime: 0},
    keyboard: {keyboardInput: undefined, keyboardTranslation: {x: 0, y: 0, z: 0}, keyboardRotation: {x: 0, y: 0, z: 0}},
    mouse: {mouseInput: undefined},
    cameraControl: {regularCameraControl: undefined, orbitalCameraControl: undefined, activeCameraControl: true},
    keyMap: {
        ROT_X_NEG: 40,
        ROT_X_POS: 38,
        ROT_Y_NEG: 39,
        ROT_Y_POS: 37,
        //ROT_Z_NEG: 69,
        ROT_Z_NEG: undefined,
        //ROT_Z_POS: 81,
        ROT_Z_POS: undefined,

        MV_X_NEG: 65,
        MV_X_POS: 68,
        //MV_Y_NEG: 17,
        MV_Y_NEG: 81,
        //MV_Y_POS: 32,
        MV_Y_POS: 69,
        MV_Z_NEG: 87,
        MV_Z_POS: 83,
    },

    //managers
    canvasManager: undefined,
    sceneManager: undefined,
    cameraManager: undefined,
    rendererManager: undefined,
    renderQueueManager: undefined,

    //cores
    meshCore: undefined,

    //input object
    input: {
        keyboard: undefined,
        navigators: {
            rotation: undefined,
            translation: undefined
        },
        mouse: undefined,
        gamepads: undefined,
        multiplier: 1
    },

    /** INIT CORE */
    initializeCore: function(){
        this.canvas = this.initializeCanvas();
        this.canvasManager = this.initializeCanvasManager(this.canvas);

        this.renderer = this.initializeRenderer(this.canvas.canvas);
        this.renderQueue = this.initializeRenderQueue(this.renderer);
        this.rendererManager = this.initializeRendererManager(this.renderer);
        this.renderQueueManager = this.initializeRenderQueueManager(this.renderQueue);

        this.scene = this.createDefaultScene();
        this.sceneManager = this.createSceneManager(this.scene);

        this.camera = this.createDefaultCamera(this.canvas.canvas);
        this.cameraManager = this.createCameraManager(this.camera, this.keyMap);
    },

    initializeCanvas: function(){
        const canvasDOM = document.createElement("canvas");
        canvasDOM.id = "rc-canvas-main";
        canvasDOM.width = predef_width;
        canvasDOM.height = predef_height;
        canvasDOM.style.padding = '0';
        canvasDOM.style.margin = '0';

        return new RC.Canvas(canvasDOM);
    },
    initializeCanvasManager(canvas){
        const canvasManager = new RC.CanvasManager(document.getElementsByTagName("body")[0]);
        canvasManager.addCanvas(canvas);
        canvasManager.activeCanvas = canvas;

        return canvasManager;
    },

    initializeRenderer: function(canvas){
        const renderer = new RC.MeshRenderer(canvas, RC.WEBGL2, {antialias: false, stencil: true});
        renderer.clearColor = "#ffffffff";
        renderer.addShaderLoaderUrls("../../src/shaders");

        return renderer;
    },
    initializeRenderQueue: function(renderer){
        const renderQueue = new RC.RenderQueue(renderer);
        renderQueue.pushRenderPass(new RC.RenderPass(
            // Rendering pass type
            RC.RenderPass.BASIC,
        
            // Initialize function
            function (textureMap, additionalData) {
 
            },
        
            // Preprocess function
            function (textureMap, additionalData) {
                return { scene: CoreControl.scene, camera: CoreControl.camera };
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
    },
    initializeRendererManager: function(renderer){
        const rendererManager = new RC.RendererManager();
        rendererManager.addRenderer(renderer);
        rendererManager.activeRenderer = renderer;

        return rendererManager;
    },
    initializeRenderQueueManager: function(renderQueue){
        const renderQueueManager = new RC.RenderQueueManager();
        renderQueueManager.addRenderQueue(renderQueue);
        renderQueueManager.activeRenderQueue = renderQueue;

        return renderQueueManager;
    },

    createDefaultScene: function(){
        const scene = this.createEmptyScene();
        
        const cube = new RC.Cube(2, new RC.Color().setColorName("purple"));
        cube.material = new RC.MeshPhongMaterial();
        scene.add(cube);

        const aLight = new RC.AmbientLight(new RC.Color("#FFFFFF"), 0.2);
        scene.add(aLight);

        const pLight = new RC.PointLight(new RC.Color("#FFFFFF"), 0.5);
        pLight.position.set(4, 4, 4);
        scene.add(pLight);

        return scene;
    },

    createEmptyScene: function(){
        return new RC.Scene();
    },

    createSceneManager: function(scene){
        const sceneManager = new RC.SceneManager();
        sceneManager.addScene(scene);
        sceneManager.activeScene = scene;

        return sceneManager;
    },

    createDefaultCamera: function(canvas){
        const camera = new RC.PerspectiveCamera(75, canvas.width/canvas.height, nearPlane, farPlane);
        camera.position = new RC.Vector3(0, 0, 8);
        camera.position = new RC.Vector3(-10, 10, 10);
        camera.lookAt(new RC.Vector3(0, 0, 0), new RC.Vector3(0, 1, 0));

        return camera;
    },

    createCameraManager: function(camera, keyMap){
        const cameraManager = new RC.CameraManager();
        cameraManager.addFullOrbitCamera(camera, new RC.Vector3(0, 0, 0));
        cameraManager.camerasControls[camera._uuid].keyMap = keyMap;
        cameraManager.activeCamera = camera;

        return cameraManager;
    },


    /** RENDER LOOP */
    render: function () {
        window.requestAnimationFrame(function(){CoreControl.render()});

        this.stopwatch.currTime = performance.now();
        this.stopwatch.deltaTime = (this.stopwatch.currTime - this.stopwatch.prevTime);
        this.stopwatch.prevTime = this.stopwatch.currTime;


        //RUN STAT TEST
        //console.log("FPS:" + 1/deltaTime + ", " + "Frame Time: " + deltaTime);
        //stat.test(this.stopwatch.deltaTime); //stat.initTest(10000, statLI);


        //CAMERA TRANSFORM ANIMATION
        const input = {
            keyboard: this.keyboard.keyboardInput.update(),
            navigators: {
                rotation: this.keyboard.keyboardRotation,
                translation: this.keyboard.keyboardTranslation
            },
            mouse: this.mouse.mouseInput.update(),
            gamepads: undefined,
            multiplier: 1
        };
        /*this.input.keyboard = this.keyboard.keyboardInput.update();
        this.input.navigators.rotation = this.keyboard.keyboardRotation;
        this.input.navigators.translation = this.keyboard.keyboardTranslation;
        this.input.mouse = this.mouse.mouseInput.update();*/

        //camera manager
        this.cameraManager.update(input, this.stopwatch.deltaTime);


        this.meshCore.update(this.stopwatch);


        //RENDER PIPE
        //use renderer manager (single render pass)
        //this.rendererManager.activeRenderer.render(this.sceneManager.activeScene, this.cameraManager.activeCamera);
        
        //use render queue (multiple composite render passes)
        this.renderQueueManager.activeRenderQueue.render();
    },


    xr: undefined,
    // Called every time the XRSession requests that a new frame be drawn.
    renderXR: function (t, frame){


            // Per-frame scene setup. Nothing WebXR specific here.
                //scene.startFrame();
            CoreControl.stopwatch.currTime = performance.now();
            CoreControl.stopwatch.deltaTime = (CoreControl.stopwatch.currTime - CoreControl.stopwatch.prevTime);
            CoreControl.stopwatch.prevTime = CoreControl.stopwatch.currTime;
            const input = {
                keyboard: CoreControl.keyboard.keyboardInput.update(),
                navigators: {
                    rotation: CoreControl.keyboard.keyboardRotation,
                    translation: CoreControl.keyboard.keyboardTranslation
                },
                mouse: CoreControl.mouse.mouseInput.update(),
                gamepads: undefined,
                multiplier: 1
            };
            CoreControl.cameraManager.update(input, CoreControl.stopwatch.deltaTime);



            let session = frame.session;
            CoreControl.updateInputSources(session, frame, CoreControl.xr.referenceSpace);

            // Inform the session that we're ready for the next frame.
            session.requestAnimationFrame(CoreControl.renderXR);
            // Get the XRDevice pose relative to the Frame of Reference we created
            // earlier.
            let pose = frame.getViewerPose(CoreControl.xr.referenceSpace);
            // Getting the pose may fail if, for example, tracking is lost. So we
            // have to check to make sure that we got a valid pose before attempting
            // to render with it. If not in this case we'll just leave the
            // framebuffer cleared, so tracking loss means the scene will simply
            // disappear.
            if (pose) {
                let glLayer = session.renderState.baseLayer;
                // If we do have a valid pose, bind the WebGL layer's framebuffer,
                // which is where any content to be displayed on the XRDevice must be
                // rendered.
                CoreControl.rendererManager.activeRenderer.gl.bindFramebuffer(CoreControl.rendererManager.activeRenderer.gl.FRAMEBUFFER, glLayer.framebuffer);
                // Clear the framebuffer
                CoreControl.rendererManager.activeRenderer.gl.clear(CoreControl.rendererManager.activeRenderer.gl.COLOR_BUFFER_BIT | CoreControl.rendererManager.activeRenderer.gl.DEPTH_BUFFER_BIT);
                // Loop through each of the views reported by the frame and draw them
                // into the corresponding viewport.
                //console.log(pose.views); // 2 viewa
                /*for (let view of pose.views) {

                }*/
                const views = pose.views;
                for(let i = 0; i < views.length; i++){

                    let viewport = glLayer.getViewport(views[i]);
                    CoreControl.rendererManager.activeRenderer.gl.viewport(viewport.x, viewport.y, viewport.width, viewport.height);
                    // Draw this view of the scene. What happens in this function really
                    // isn't all that important. What is important is that it renders
                    // into the XRWebGLLayer's framebuffer, using the viewport into that
                    // framebuffer reported by the current view, and using the
                    // projection matrix and view transform from the current view.
                    // We bound the framebuffer and viewport up above, and are passing
                    // in the appropriate matrices here to be used when rendering.
                    //scene.draw(view.projectionMatrix, view.transform);

                    if(views[i].eye === "left") {
                        //CoreControl.cameraManager.activeCamera.leftCamera.matrixWorldInverse.set(...views[i].transform.matrix).transpose();
                        //CoreControl.cameraManager.activeCamera.leftCamera.matrixWorldInverse.multiplyMatrices(CoreControl.cameraManager.activeCamera.leftCamera.matrixWorldInverse, CoreControl.cameraManager.activeCamera.matrixWorldInverse);
                        //***************************************
                        CoreControl.cameraManager.activeCamera.leftCamera.position = CoreControl.cameraManager.activeCamera.position;
                        CoreControl.cameraManager.activeCamera.leftCamera.rotation = CoreControl.cameraManager.activeCamera.rotation;
                        CoreControl.cameraManager.activeCamera.leftCamera.translate(views[i].transform.position);
                        //CoreControl.cameraManager.activeCamera.leftCamera.rotate(views[i].transform.orientation);
                        CoreControl.cameraManager.activeCamera.leftCamera.quaternion = new RC.Quaternion(views[i].transform.orientation.x, views[i].transform.orientation.y, views[i].transform.orientation.z, views[i].transform.orientation.w);

                        CoreControl.cameraManager.activeCamera.leftCamera.projectionMatrix.set(...views[i].projectionMatrix).transpose();
                        CoreControl.rendererManager.activeRenderer.render(CoreControl.sceneManager.activeScene, CoreControl.cameraManager.activeCamera.leftCamera);
                    }else if(views[i].eye === "right"){
                        //CoreControl.cameraManager.activeCamera.rightCamera.matrixWorldInverse.set(...views[i].transform.matrix).transpose();
                        //CoreControl.cameraManager.activeCamera.rightCamera.matrixWorldInverse.multiplyMatrices(CoreControl.cameraManager.activeCamera.rightCamera.matrixWorldInverse, CoreControl.cameraManager.activeCamera.matrixWorldInverse);
                        //***************************************
                        CoreControl.cameraManager.activeCamera.rightCamera.position = CoreControl.cameraManager.activeCamera.position;
                        CoreControl.cameraManager.activeCamera.rightCamera.rotation = CoreControl.cameraManager.activeCamera.rotation;
                        CoreControl.cameraManager.activeCamera.rightCamera.translate(views[i].transform.position);
                        //CoreControl.cameraManager.activeCamera.rightCamera.rotate(views[i].transform.orientation);
                        CoreControl.cameraManager.activeCamera.rightCamera.quaternion = new RC.Quaternion(views[i].transform.orientation.x, views[i].transform.orientation.y, views[i].transform.orientation.z, views[i].transform.orientation.w);

                        CoreControl.cameraManager.activeCamera.rightCamera.projectionMatrix.set(...views[i].projectionMatrix).transpose();
                        CoreControl.rendererManager.activeRenderer.render(CoreControl.sceneManager.activeScene, CoreControl.cameraManager.activeCamera.rightCamera);
                    }
                    //todo primerno
                    CoreControl.cameraManager.activeCamera.quaternion = new RC.Quaternion(views[0].transform.orientation.x, views[0].transform.orientation.y, views[0].transform.orientation.z, views[0].transform.orientation.w);
                }
            } else {
                // There's several options for handling cases where no pose is given.
                // The simplest, which these samples opt for, is to simply not draw
                // anything. That way the device will continue to show the last frame
                // drawn, possibly even with reprojection. Alternately you could
                // re-draw the scene again with the last known good pose (which is now
                // likely to be wrong), clear to black, or draw a head-locked message
                // for the user indicating that they should try to get back to an area
                // with better tracking. In all cases it's possible that the device
                // may override what is drawn here to show the user it's own error
                // message, so it should not be anything critical to the application's
                // use.
            }
            // Per-frame scene teardown. Nothing WebXR specific here.
                //scene.endFrame();
    },
    updateInputSources: function (session, frame, refSpace) {

        for (let inputSource of session.inputSources) {
            //INPUT NOVO
            if(inputSource.gamepad) {
                //console.log(inputSource.gamepad.buttons.length); //OK
                //console.log(inputSource.gamepad.buttons);
                for (let i = 0; i < inputSource.gamepad.buttons.length; i++) {

                    //FALSE VEDNO console.log(inputSource.gamepad.buttons[i].touched);

                    if (inputSource.gamepad.buttons[i].touched) {
                        console.log(i + " touched");
                    } else {
                        //console.log(inputSource.gamepad.buttons[i]);
                    }

                    if (inputSource.handedness === "left" && inputSource.gamepad.buttons[0].pressed){
                        //CoreControl.cameraManager.activeCamera.translateZ(+0.001 * CoreControl.stopwatch.deltaTime); //move backwards

                        //toggle wireframe
                        if(!wireframe) {
                            iterateSceneR(CoreControl.sceneManager.activeScene, function (object) {
                                if (object.geometry !== undefined) {
                                    object.geometry.drawWireframe = true;
                                }
                            });

                            wireframe = true;
                        }

                    }else{
                        //toggle wireframe
                        if(wireframe) {
                            iterateSceneR(CoreControl.sceneManager.activeScene, function (object) {
                                if (object.geometry !== undefined) {
                                    object.geometry.drawWireframe = false;
                                }
                            });

                            wireframe = false;
                        }
                    }
                    if (inputSource.handedness === "right" && inputSource.gamepad.buttons[0].pressed){
                        CoreControl.cameraManager.activeCamera.translateZ(-0.001 * CoreControl.stopwatch.deltaTime); //move forward
                    }
                }


            }


            //MODEL
            if (inputSource.gripSpace) {
                let gripPose = frame.getPose(inputSource.gripSpace, refSpace);
                if (gripPose) {
                    // If we have a grip pose use it to render a mesh showing the
                    // position of the controller.
                    //scene.inputRenderer.addController(gripPose.transform.matrix, inputSource.handedness);

                    if(inputSource.handedness === "left"){
                        CoreControl.xr.leftController.position = new RC.Vector3(gripPose.transform.position.x, gripPose.transform.position.y, gripPose.transform.position.z);
                        CoreControl.xr.leftController.quaternion = new RC.Quaternion(gripPose.transform.orientation.x, gripPose.transform.orientation.y, gripPose.transform.orientation.z, gripPose.transform.orientation.w);
                    }else if (inputSource.handedness === "right"){
                        CoreControl.xr.rightController.position = new RC.Vector3(gripPose.transform.position.x, gripPose.transform.position.y, gripPose.transform.position.z);
                        CoreControl.xr.rightController.quaternion = new RC.Quaternion(gripPose.transform.orientation.x, gripPose.transform.orientation.y, gripPose.transform.orientation.z, gripPose.transform.orientation.w);
                    }
                }
            }


            //RAY
            let targetRayPose = frame.getPose(inputSource.targetRaySpace, refSpace);
            // We may not get a pose back in cases where the input source has lost
            // tracking or does not know where it is relative to the given frame
            // of reference.
            if (!targetRayPose) {
                continue;
            }

            if (inputSource.targetRayMode == 'tracked-pointer') {
                // If we have a pointer matrix and the pointer origin is the users
                // hand (as opposed to their head or the screen) use it to render
                // a ray coming out of the input device to indicate the pointer
                // direction.
                //scene.inputRenderer.addLaserPointer(targetRayPose.transform);
                CoreControl.xr.laserPointer.position = new RC.Vector3(targetRayPose.transform.position.x, targetRayPose.transform.position.y, targetRayPose.transform.position.z);
                CoreControl.xr.laserPointer.quaternion = new RC.Quaternion(targetRayPose.transform.orientation.x, targetRayPose.transform.orientation.y, targetRayPose.transform.orientation.z, targetRayPose.transform.orientation.w);
            }
            // If we have a pointer matrix we can also use it to render a cursor
            // for both handheld and gaze-based input sources.
            // Statically render the cursor 2 meters down the ray since we're
            // not calculating any intersections in this sample.
            let targetRay = new RC.Ray(targetRayPose.transform);
            let cursorDistance = 2.0;
            let cursorPos = new RC.Vector3(targetRay.origin.x, targetRay.origin.y, targetRay.origin.z);
            cursorPos.add(new RC.Vector3(targetRay.direction.x * cursorDistance, targetRay.direction.y * cursorDistance, targetRay.direction.z * cursorDistance));
            // vec3.transformMat4(cursorPos, cursorPos, inputPose.targetRay.transformMatrix);
            //scene.inputRenderer.addCursor(cursorPos);

        }
    }

};


/** INIT MAIN */
window.onload = function(){
    window.addEventListener("resize", resizeFunction, false);
    window.addEventListener("mouseup", function(event){
        //CoreControl.rendererManager.activeRenderer.pick(RC.MouseInput.instance.cursor.position.x, RC.MouseInput.instance.cursor.position.y);
        CoreControl.rendererManager.activeRenderer.pick(event.clientX, event.clientY, function(pickedColor){
            console.log(pickedColor);
        });
    }, false);

    //INPUT
    CoreControl.keyboard.keyboardInput = RC.KeyboardInput.instance;
    CoreControl.mouse.mouseInput = RC.MouseInput.instance;
    CoreControl.mouse.mouseInput.setSourceObject(window);



    //INIT
    CoreControl.initializeCore();



    //ADD TO (DEFAULT) SCENE
    const shaderPath = "../../src/shaders";
    //const MCore = new MeshCore(shaderPath);
    //MCore._populateScene(CoreControl.sceneManager.activeScene);
    const MCore = new MeshCore(shaderPath);
    CoreControl.meshCore = MCore;
    CoreControl.canvasManager.addCanvas(MCore.canvas);
    CoreControl.rendererManager.addRenderer(MCore.renderer);
    CoreControl.renderQueueManager.addRenderQueue(MCore.renderQueue);
    CoreControl.sceneManager.addScene(MCore.scene);
    CoreControl.cameraManager.addFullOrbitCamera(MCore.camera, new RC.Vector3(0, 0, 0));
    CoreControl.cameraManager.camerasControls[MCore.camera._uuid].keyMap = CoreControl.keyMap;


    //ADD MORE SCENES
    const PCCore = new PointCloudCore(shaderPath);
    CoreControl.canvasManager.addCanvas(PCCore.canvas);
    CoreControl.rendererManager.addRenderer(PCCore.renderer);
    CoreControl.renderQueueManager.addRenderQueue(PCCore.renderQueue);
    CoreControl.sceneManager.addScene(PCCore.scene);
    CoreControl.cameraManager.addFullOrbitCamera(PCCore.camera, new RC.Vector3(0, 0, 0));
    CoreControl.cameraManager.camerasControls[PCCore.camera._uuid].keyMap = CoreControl.keyMap;


    //ADD MORE SCENES
    const HEPCore = new HighEnergyPhysicsCore(shaderPath);
    CoreControl.canvasManager.addCanvas(HEPCore.canvas);
    CoreControl.rendererManager.addRenderer(HEPCore.renderer);
    CoreControl.renderQueueManager.addRenderQueue(HEPCore.renderQueue);
    CoreControl.sceneManager.addScene(HEPCore.scene);
    CoreControl.cameraManager.addFullOrbitCamera(HEPCore.camera, new RC.Vector3(0, 0, 0));
    CoreControl.cameraManager.camerasControls[HEPCore.camera._uuid].keyMap = CoreControl.keyMap;


    //XR
    /*console.log(CoreControl.render);
    console.log(CoreControl.render.glContextAttributes);
    HEPCore.renderer.autoClear = false;
    HEPCore.renderer._glManager.autoClear = false;
    let xr = new XR(CoreControl, HEPCore.renderer, "immersive-vr");
    CoreControl.xr = xr;
    //HEPCore.scene.add(xr.leftController);
    //HEPCore.scene.add(xr.rightController);
    //HEPCore.scene.add(xr.laserPointer);*/


    /*const gui = new dat.GUI();
    const HEPGUI = function() {
        this.VR = function onButtonClicked() {

        }

    };
    const h = new HEPGUI();
    gui.add(h, "VR");*/


    //ADD MORE SCENES
    /*const VCore = new VolumeCore(shaderPath);
    CoreControl.canvasManager.addCanvas(VCore.canvas);
    CoreControl.rendererManager.addRenderer(VCore.renderer);
    CoreControl.renderQueueManager.addRenderQueue(VCore.renderQueue);
    CoreControl.sceneManager.addScene(VCore.scene);
    CoreControl.cameraManager.addFullOrbitCamera(VCore.camera, new RC.Vector3(0, 0, 0));
    CoreControl.cameraManager.camerasControls[VCore.camera._uuid].keyMap = CoreControl.keyMap;*/

    
    //RENDER
    window.requestAnimationFrame(function(){CoreControl.render()});
};


const resizeFunction = function () {
    // Make the canvas the same size
    CoreControl.canvasManager.activeCanvas.canvas.width = document.body.clientWidth;
    CoreControl.canvasManager.activeCanvas.canvas.height = document.body.clientHeight;

    // Update camera aspect ratio and renderer viewport
    if (CoreControl.cameraManager.activeCamera) {
        CoreControl.cameraManager.activeCamera.aspect = CoreControl.canvasManager.activeCanvas.canvas.width / CoreControl.canvasManager.activeCanvas.canvas.height;
    }
    if(CoreControl.rendererManager.activeRenderer){
        CoreControl.rendererManager.activeRenderer.updateViewport(CoreControl.canvasManager.activeCanvas.canvas.width, CoreControl.canvasManager.activeCanvas.canvas.height);
    }
};





let O1_QUAD, O1_POINT, O2_QUAD, O2_POINT, TRACK_I, TRACK_NI; let wireframe = false; let rccode = "#ffffffff";
document.addEventListener('keydown', function(event) {
    //console.log(event);
    //console.log(event.key);
    //console.log(event.keyCode);


    if (event.keyCode === 49) { //key "1"
        iterateSceneR(CoreControl.sceneManager.activeScene, function(object){
            if (object.geometry !== undefined) {
                object.geometry.drawWireframe = !wireframe;
                //if (object.geometry.wireframeIndices === null) object.geometry.buildWireframeBufferV2();
            }
        });

        wireframe = !wireframe;
    }


    //CYCLE SCENE AND CAMERA
    if (event.keyCode === 50){   //key "2"
        CoreControl.canvasManager.cycle();
        CoreControl.rendererManager.cycle();
        CoreControl.renderQueueManager.cycle();
        CoreControl.sceneManager.cycle();
        CoreControl.cameraManager.cycle();
        

        //canvas specific
        resizeFunction();

    }


    //CYCLE BACKGROUND
    if (event.keyCode === 51){   //key "3"
        //cycle renderer?

        if(rccode === "#000000ff"){
            CoreControl.rendererManager.activeRenderer.clearColor = "#ffffffff";
            rccode = "#ffffffff";
        }else{
            CoreControl.rendererManager.activeRenderer.clearColor = "#000000ff";
            rccode = "#000000ff";
        }
    }


    if(event.keyCode === 52){//key "4"
        if(O1_QUAD !== undefined)O1_QUAD.visible = !O1_QUAD.visible;
        if(O1_POINT !== undefined)O1_POINT.visible = !O1_POINT.visible;
        if(O2_QUAD !== undefined)O2_QUAD.visible = !O2_QUAD.visible;
        if(O2_POINT !== undefined)O2_POINT.visible = !O2_POINT.visible;
    }
    if(event.keyCode === 53){//key "5"
        if(TRACK_I !== undefined)TRACK_I.visible = !TRACK_I.visible;
        if(TRACK_NI !== undefined)TRACK_NI.visible = !TRACK_NI.visible;
    }
    if(event.keyCode === 54){//key "6"
        //CoreControl.renderer.takeScreenshot(true, 2);
        //CoreControl.renderQueue.takeScreenshot("color_out", true, 2);
        CoreControl.renderQueueManager.activeRenderQueue.takeScreenshot("color_out", true, 2);
    }

    if (event.keyCode === 67){//key "c"
        CoreControl.cameraControl.activeCameraControl = !CoreControl.cameraControl.activeCameraControl;

        if(CoreControl.cameraControl.activeCameraControl === false) {
            CoreControl.cameraControl.orbitalCameraControl.cancelAllAnimations();


            //CoreControl.cameraControl.orbitalCameraControl.animateTo("reset", new RC.Vector3(0, 0, 8), new RC.Quaternion(), 2000, null);
            //CoreControl.cameraControl.orbitalCameraControl.setPositions(CoreControl.camera.position, CoreControl.cameraControl.orbitalCameraControl._orbitCenter);


            let targetPos = CoreControl.camera.position.clone();
            let targetQ = getLookAtQ(CoreControl.camera, CoreControl.cameraControl.orbitalCameraControl._orbitCenter);
            CoreControl.cameraControl.orbitalCameraControl.animateTo("reset", targetPos, targetQ, 2000, null);


            //
            //TODO napisi funkcijo  (target pos, target center): targetQ
        }
    }
});

function getLookAtQ(object, target){
    let currentQ = object.quaternion.clone();

    object.lookAt(target, object.up.clone().applyQuaternion(currentQ));
    let targetQ = object.quaternion.clone();

    object.quaternion = currentQ;
    return targetQ;
}

function getPosQ(object, target){

}

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