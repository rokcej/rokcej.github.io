import * as RC from '../../src/RenderCore.js'

class App {

	constructor(canvas) {
		window.RC = RC;
		window.App = this;

		window.addEventListener("resize", () => {this.resize();}, false);


		this.canvas = canvas;

		this.renderer = new RC.MeshRenderer(this.canvas, RC.WEBGL2, {antialias: true});
		this.renderer.clearColor = '#336699ff';
		this.renderer.addShaderLoaderUrls('../../src/shaders');

		this.scene = new RC.Scene();

		this.light = new RC.DirectionalLight(new RC.Color(0.9, 0.6, 0.3), 1.0);
		this.light.position = new RC.Vector3(1,0,0);

		this.cube = new RC.Cube(1, new RC.Color(1.0, 1.0, 1.0));
		this.cube.material = new RC.MeshPhongMaterial();
		this.cube.material.color = new RC.Color(0xff22ff);
		this.scene.add(this.light);
		this.scene.add(this.cube);

		let aspectRatio = this.canvas.width/this.canvas.height;
		this.camera = new RC.PerspectiveCamera(75, this.canvas.width/this.canvas.height, 0.1, 1000.0);
		this.camera.position = new RC.Vector3(0, 0, 8);

		this.resize();
		window.requestAnimationFrame(() => {this.update()});
	}

	update() {
		this.light._position.x = (this.light._position.x + 10 + 0.01) % 20 - 10;
		this.light._position.y = (this.light._position.y + 10 + 0.01) % 20 - 10;
		this.light._position.z = (this.light._position.z + 10 + 0.01) % 20 - 10;
		this.light.updateMatrix();

		this.cube.rotateX(0.01);
		this.cube.rotateY(0.005);

		this.render();
		window.requestAnimationFrame(() => {this.update()});
	}

	render() {
		this.renderer.render(this.scene, this.camera);
	}

	resize() {
		// Make the canvas the same size
		this.canvas.width  = window.innerWidth;
		this.canvas.height = window.innerHeight;

		// Update camera aspect ratio and renderer viewport
		this.camera.aspect = this.canvas.width / this.canvas.height;
		this.renderer.updateViewport(this.canvas.width, this.canvas.height);
	}
}

document.addEventListener('DOMContentLoaded', () => {
	const canvas = document.querySelector('canvas');
	const app = window.app = new App(canvas);
});