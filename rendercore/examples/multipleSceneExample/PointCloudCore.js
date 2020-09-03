/** IMPORTS */
import * as RC from '../../src/RenderCore.js';
import PLYLoader from "./PLYLoader.js";
import { LoaderUtils } from "./LoaderUtils.js";


const predef_width = document.body.clientWidth;
const predef_height = document.body.clientHeight;
const nearPlane = 0.1;
const farPlane = 100000;
let scene;
let camera;


export default class PointCloudCore{
    constructor(shaderPath = "./src/shaders"){
        this._canvas = new RC.Canvas(undefined, "rc-canvas-pc");

        this._renderer = new RC.MeshRenderer(this._canvas.canvas, RC.WEBGL2, {antialias: false});
        this._renderer.clearColor = "#000000ff";
        this._renderer.addShaderLoaderUrls(shaderPath);
        this._renderQueue = this._initializeRenderQueue(this._renderer);

        this._scene = new RC.Scene();
        this._scene.name = "PC";
        this._populateScene(this._scene);

        this._camera = new RC.PerspectiveCamera(75, this._canvas.canvas.width/this._canvas.canvas.height, nearPlane, farPlane);
        this._camera.position = new RC.Vector3(0, 0, 8);
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
        let pLightFirst = new RC.PointLight(new RC.Color("#AAAAAA"), 1, 10);
        let pLightSecond = new RC.PointLight(new RC.Color("#AAAAAA"), 1, 10);
        let pLightThird = new RC.PointLight(new RC.Color("#AAAAAA"), 1, 10);
        let pLightForth = new RC.PointLight(new RC.Color("#AAAAAA"), 1, 10);
        let pLightFifth = new RC.PointLight(new RC.Color("#AAAAAA"), 1, 10);
        let pLightSixth = new RC.PointLight(new RC.Color("#AAAAAA"), 1, 10);
        let dLight = new RC.DirectionalLight(new RC.Color("#AAAAAA"), 0.4);

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
        scene.add(dLight);



        let rawLoader = new RC.MHDReader();

        //groups
        //var group = new RC.Group();
        //group.add(object);

        /*let as = new RC.XHRStreamer(new RC.LoadingManager(), "arraybuffer", 1024*1024);
        as.load(
            "big_file.rar",
            function(data){
                console.log("AAA load complete.");
            },
            function(xhr){
                console.log( "AAA  " + (xhr.loaded / xhr.total * 100) + "% loaded." );
            },
            function(err){
                console.error("AAA load error.");
            },
            function(){
                console.error("AAA load abort.");
            },
            function(data){
                //HEADER
            },
            function(data){
                //CHUNK
                //console.log(data);
            }
        );*/


        let points = [];
        let colors = [];

        let LAS = new RC.LASLoader(new RC.LoadingManager(), "arraybuffer", true, 1*1024*1024*8);
        LAS.load(
            //url
            //"models/point cloud/NavVisHQ-5thFloor.las",
            //"test/models/point cloud/tile042.las",
            "models/point cloud/bird3.las",
            //set
            //[RC.LASLoader.PDRFormat2.Keys.X, RC.LASLoader.PDRFormat2.Keys.Y, RC.LASLoader.PDRFormat2.Keys.Z, RC.LASLoader.PDRFormat2.Keys.RED, RC.LASLoader.PDRFormat2.Keys.GREEN, RC.LASLoader.PDRFormat2.Keys.BLUE],
            [RC.LASLoader.PDRFormat1.Keys.X, RC.LASLoader.PDRFormat1.Keys.Y, RC.LASLoader.PDRFormat1.Keys.Z],
            //on load complete
            function(data){
                console.log("LAS load complete.");

                points = [];
                colors = [];
            },
            //on progress
            function(xhr){
                //console.log("LAS " + (xhr.loaded / xhr.total * 100) + "% loaded.");
                console.log("LAS " + ((LAS.LASLoaded + xhr.loaded) / LAS.LASSize * 100) + "% loaded.");
            },
            //on error
            function(err){
                console.error("LAS load error.");
            },
            //on abort
            function(){
                console.error("LAS load abort.");
            },
            //on header load
            function(data){
                console.log("The size of LAS is: " + data.size + " " + data.type + ".");
            },
            //on chunk load
            function(data){
                console.log(data);


                //if(data.PDRs) {
                if(true){


                    //if(points.length > data.PDRs.size*3) points.splice(0, data.PDRs.size*3);
                    //if(colors.length > data.PDRs.size*4) colors.splice(0, data.PDRs.size*4);
                    points = [];
                    colors = [];
                    //for(let i = 0; i < data.PDRs.size; i++){
                    for(let i = 0; i < data.X.length; i++){
                        //points[i*3 + 0] = data.PDRs.X[i];
                        //points[i*3 + 1] = data.PDRs.Y[i];
                        //points[i*3 + 2] = data.PDRs.Z[i];
                        //if(i===0)console.log(data.PDRs.X[i] + "::"+(data.PDRs.Y[i])+"::"+(data.PDRs.Z[i]));
                        points[i*3 + 0] = data.X[i];
                        points[i*3 + 1] = data.Y[i];
                        points[i*3 + 2] = data.Z[i];
                        if(i===0)console.log(data.X[i] + "::"+(data.Y[i])+"::"+(data.Z[i]));

                        /*colors[i*4 + 0] = data.PDRs.RED[i];
                        colors[i*4 + 1] = data.PDRs.GREEN[i];
                        colors[i*4 + 2] = data.PDRs.BLUE[i];*/
                        colors[i*4 + 0] = 1.0;
                        colors[i*4 + 1] = 1.0;
                        colors[i*4 + 2] = 1.0;
                        colors[i*4 + 3] = 1.0;
                    }


                    /*let pointCloudGeometry = new RC.Geometry();

                    pointCloudGeometry.vertices = RC.Float32Attribute(points, 3);
                    pointCloudGeometry.vertColor = RC.Float32Attribute(colors, 4);
                    //pointCloudGeometry.indices = RC.Uint32Attribute(Array.from(Array(points.length/3).keys()), 1);
                    pointCloudGeometry.computeVertexNormals();


                    let pointCloudMaterial = new RC.MeshBasicMaterial();

                    pointCloudMaterial.useVertexColors = true;
                    pointCloudMaterial.side = RC.FRONT_SIDE;
                    pointCloudMaterial.usePoints = true;
                    pointCloudMaterial.pointSize = 1.0;


                    let pointCloudObject = new RC.PointCloud(null, null, pointCloudGeometry, pointCloudMaterial);

                    pointCloudObject.rotateX(-Math.PI / 2);
                    pointCloudObject.usePoints = true;
                    pointCloudObject.visible = true;

                    scene.add(pointCloudObject);*/



                    //PREP
                    const geo = new RC.Geometry();
                    geo.vertices = RC.Float32Attribute(points, 3);
                    //geo.computeVertexNormals();


                    //V1
                    const sprite_material = new RC.SpriteBasicMaterial();
                    sprite_material.spriteSize = new RC.Vector3(0.1, 0.1, 0.1);
                    sprite_material.transparent = false;
                    sprite_material.opacity = 0.1;

                    const sprite_object = new RC.Sprite(geo, sprite_material);
                    scene.add(sprite_object);


                    //V2
                    const point_material = new RC.MeshBasicMaterial();
                    point_material.color = new RC.Color(0.444444, 0, 0);
                    point_material.usePoints = true;
                    point_material.pointSize = 16;
                    point_material.drawCircles = false;
                    point_material.transparent = false;
                    point_material.opacity = 0.1;

                    const point_object = new RC.Point(geo, point_material);
                    //scene.add(point_object);


                    //v3
                    const pointCloudObject2 = new RC.PointCloud(null, null, geo, point_material, new RC.PickingShaderMaterial("POINTS", {pointSize: 1.0}));
                    //scene.add(pointCloudObject2);
                }
            }
        );
    }
    _populateScenePLY(scene){
        let loader = document.getElementsByClassName("loader")[0];
        loader.style.display = "block";


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


        let plyLoader = new PLYLoader();
        plyLoader.load(
            "test/models/point cloud/pointcloud_example1.ply",
            function (data) {
                console.log("Ply load complete.");
                document.getElementsByClassName("loader")[0].style.display = "none";
                ///console.log(data);


                let pointCloudGeometry1 = new RC.Geometry();


                //extend points to quads
                let transformedData1 = LoaderUtils.transformToQuad(data);


                pointCloudGeometry1.vertices = new RC.Float32Attribute(transformedData1.pointCloudPositions, 3);
                pointCloudGeometry1.vertColor = new RC.Float32Attribute(transformedData1.pointCloudColors, 4);
                pointCloudGeometry1.indices = RC.Uint32Attribute(transformedData1.pointCloudIndices, 1);
                pointCloudGeometry1.computeVertexNormals();
                ///console.log(pointCloudGeometry1);


                let pointCloudMaterial1 = new RC.MeshBasicMaterial();
                //pointCloudMaterial1.color = new RC.Color(0.444444);
                pointCloudMaterial1.useVertexColors = true;
                pointCloudMaterial1.side = RC.FRONT_AND_BACK_SIDE;
                pointCloudMaterial1.usePoints = true;


                let pointCloudObject1 = new RC.PointCloud(null, null, pointCloudGeometry1, pointCloudMaterial1);
                //pointCloudObject1.position = new RC.Vector3(-52*mult, -16*mult, 110*mult);
                //pointCloudObject1.scale = new RC.Vector3(0.5, 0.5, 0.5);
                //pointCloudObject1.position = new RC.Vector3(-mean.x*mult, -mean.y*mult, -mean.z*mult);
                pointCloudObject1.rotateX(-Math.PI/2);
                pointCloudObject1.usePoints = false;
                pointCloudObject1.visible = false;
                O1_QUAD = pointCloudObject1;


                //scene.add(pointCloudObject1);
                scene.add(pointCloudObject1);




                let pointCloudGeometry = new RC.Geometry();


                //extend points to quads
                let transformedData = LoaderUtils.transformToPoint(data);
                //transformedData = transformToQuad(data);


                pointCloudGeometry.vertices = new RC.Float32Attribute(transformedData.pointCloudPositions, 3);
                pointCloudGeometry.vertColor = new RC.Float32Attribute(transformedData.pointCloudColors, 4);
                pointCloudGeometry.indices = RC.Uint32Attribute(transformedData.pointCloudIndices, 1);
                pointCloudGeometry.computeVertexNormals();
                ///console.log(pointCloudGeometry);


                let pointCloudMaterial = new RC.MeshBasicMaterial();
                //pointCloudMaterial.color = new RC.Color(0.444444);
                pointCloudMaterial.useVertexColors = true;
                pointCloudMaterial.side = RC.FRONT_SIDE;
                pointCloudMaterial.usePoints = true;


                let pointCloudObject = new RC.PointCloud(null, null, pointCloudGeometry, pointCloudMaterial);
                //pointCloudObject.position = new RC.Vector3(-52*mult, -16*mult, 110*mult);
                //pointCloudObject.scale = new RC.Vector3(0.5, 0.5, 0.5);
                //pointCloudObject.position = new RC.Vector3(-mean.x*mult, -mean.y*mult, -mean.z*mult);
                pointCloudObject.rotateX(-Math.PI/2);
                pointCloudObject.usePoints = true;
                pointCloudObject.visible = true;
                O1_POINT = pointCloudObject;


                //scene.add(pointCloudObject);
                scene.add(pointCloudObject);
            },
            function (xhr){
                console.log( "Ply " + (xhr.loaded / xhr.total * 100) + "% loaded." );
            },
            function (err){
                console.error("Ply load error.");
            }
        );
        plyLoader.load(
            "test/models/point cloud/pointcloud_example2.ply",
            function (data) {
                console.log("Ply load complete.");
                document.getElementsByClassName("loader")[0].style.display = "none";
                ///console.log(data);


                //extend points to quads
                let transformedData1 = LoaderUtils.transformToQuad(data);


                let pointCloudGeometry1 = new RC.Geometry();
                //pointCloudGeometry1.vertices = new RC.BufferAttribute(transformedData1.pointCloudPositions, 3);
                //pointCloudGeometry1.vertColor = new RC.BufferAttribute(transformedData1.pointCloudColors, 4);
                pointCloudGeometry1.vertices = RC.Float32Attribute(transformedData1.pointCloudPositions, 3);
                pointCloudGeometry1.vertColor = RC.Float32Attribute(transformedData1.pointCloudColors, 4);
                pointCloudGeometry1.indices = RC.Uint32Attribute(transformedData1.pointCloudIndices, 1);
                pointCloudGeometry1.computeVertexNormals();
                ///console.log(pointCloudGeometry1);


                let pointCloudMaterial1 = new RC.MeshBasicMaterial();
                //pointCloudMaterial1.color = new RC.Color(0.444444);
                pointCloudMaterial1.useVertexColors = true;
                pointCloudMaterial1.side = RC.FRONT_AND_BACK_SIDE;
                pointCloudMaterial1.usePoints = false;


                let pointCloudObject1 = new RC.PointCloud(null, null, pointCloudGeometry1, pointCloudMaterial1);
                //pointCloudObject1.position = new RC.Vector3(-52*mult, -16*mult, 110*mult);
                //pointCloudObject1.scale = new RC.Vector3(0.5, 0.5, 0.5);
                //pointCloudObject1.position = new RC.Vector3(-mean.x*mult, -mean.y*mult, -mean.z*mult);
                pointCloudObject1.rotateX(-Math.PI / 2);
                pointCloudObject1.usePoints = false;
                pointCloudObject1.visible = false;
                O2_QUAD = pointCloudObject1;


                //scene.add(pointCloudObject1);
                scene.add(pointCloudObject1);


                //extend points to quads
                let transformedData = LoaderUtils.transformToPoint(data);
                //transformedData = transformToQuad(data);


                let pointCloudGeometry = new RC.Geometry();
                //pointCloudGeometry.vertices = new RC.BufferAttribute(transformedData.pointCloudPositions, 3);
                //pointCloudGeometry.vertColor = new RC.BufferAttribute(transformedData.pointCloudColors, 4);
                pointCloudGeometry.vertices = RC.Float32Attribute(transformedData.pointCloudPositions, 3);
                pointCloudGeometry.vertColor = RC.Float32Attribute(transformedData.pointCloudColors, 4);
                pointCloudGeometry.indices = RC.Uint32Attribute(transformedData.pointCloudIndices, 1);
                pointCloudGeometry.computeVertexNormals();
                ///console.log(pointCloudGeometry);


                let pointCloudMaterial = new RC.MeshBasicMaterial();
                //pointCloudMaterial.color = new RC.Color(0.444444, 0, 0);
                pointCloudMaterial.useVertexColors = true;
                //pointCloudMaterial.side = RC.FRONT_SIDE;
                pointCloudMaterial.usePoints = true;


                let pointCloudObject = new RC.PointCloud(null, null, pointCloudGeometry, pointCloudMaterial);
                //pointCloudObject.position = new RC.Vector3(-52*mult, -16*mult, 110*mult);
                //pointCloudObject.scale = new RC.Vector3(0.5, 0.5, 0.5);
                //pointCloudObject.position = new RC.Vector3(-mean.x*mult, -mean.y*mult, -mean.z*mult);
                pointCloudObject.rotateX(-Math.PI / 2);
                pointCloudObject.usePoints = true;
                pointCloudObject.visible = true;
                O2_POINT = pointCloudObject;


                //scene.add(pointCloudObject);
                scene.add(pointCloudObject);



                let loader = document.getElementsByClassName("loader")[0];
                loader.style.display = "none";
            },
            function (xhr) {
                console.log("Ply " + (xhr.loaded / xhr.total * 100) + "% loaded.");
            },
            function (err) {
                console.error("Ply load error.");
            }
        );





        /*let w;
        if(typeof(Worker) !== "undefined") {
            if(typeof(w) === "undefined") {
                w = new Worker("demo_workers.js", {type: "module"});
            }
            w.onmessage = function(event) {
                console.log(event.data);
            };
        } else {
            console.log("Sorry, your browser does not support Web Workers...");
        }*/
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