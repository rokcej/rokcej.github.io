import * as RC from "../../../src/RenderCore.js";

export default class XR {
    constructor(CoreControl, renderer, mode = "immersive-vr") {
        // XR globals.
        this._xr = navigator.xr;

        this._xrButton = null;
        this._xrRefSpace = null;

        this._xrLController = this._initializeController();
        this._xrRController = this._initializeController();
        this._laserPointer = this._initializeLaserPointer();


        this._initializeXR(this._xr, mode, CoreControl, renderer);
    }


    get referenceSpace () { return this._xrRefSpace; }
    get leftController () { return this._xrLController; }
    get rightController () { return this._xrRController; }
    get laserPointer () { return this._laserPointer; }


    _initializeController(){
        const controller = new RC.Cube(1, new RC.Color(0.4, 0, 0.2));
        controller.material.lights = false;
        controller.material.transparent = true;
        controller.material.depthTest = false;
        controller.material.depthWrite = false;

        return controller;
    }
    _initializeLaserPointer(){
        const laserGeometry = new RC.Geometry();
        laserGeometry.vertices = new RC.Float32Attribute([0, 0, 0, 0, 8, 0], 3);

        const laserMaterial = new RC.MeshBasicMaterial();
        laserMaterial.color = new RC.Color(1, 0, 0.1);
        laserMaterial.lights = false;
        laserMaterial.transparent = true;
        laserMaterial.depthTest = false;
        laserMaterial.depthWrite = false;

        const laser = new RC.Line(laserGeometry, laserMaterial);
        laser.renderingPrimitive = RC.LINES;

        return laser;
    }

    _initializeXR(XR, mode, CoreControl, renderer){


        XR.isSessionSupported(mode).then((supported) => {
            if (supported) {
                // "mode" sessions are supported.
                // Page should advertise support to the user.

                //BUTTON
                let xrSession;

                if(!xrSession) {
                    XR.requestSession(mode).then((session) => {
                        xrSession = session;


                        //REND
                        // Use the new WebGL context to create a XRWebGLLayer and set it as the
                        // sessions baseLayer. This allows any content rendered to the layer to
                        // be displayed on the XRDevice.
                        session.updateRenderState({ baseLayer: new XRWebGLLayer(session, renderer.gl) });

                        // Get a frame of reference, which is required for querying poses. In
                        // this case an 'local' frame of reference means that all poses will
                        // be relative to the location where the XRDevice was first detected.
                        session.requestReferenceSpace('local').then((refSpace) => {
                            this._xrRefSpace = refSpace;

                            // Inform the session that we're ready to begin drawing.
                            session.requestAnimationFrame(CoreControl.renderXR);
                        });
                    });
                }else{
                    xrSession.end();
                }
            } else {
                // "mode" sessions are not supported.
            }
        });
    }


}