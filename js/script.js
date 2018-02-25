var container;
var camera, scene, renderer, light;
var x = 0; y = 0, deg = 0, param = 0;
var light_year_control = 0.3;

var planets = new Array();

init();
animate();

document.addEventListener('mousemove', function(event) 
{
	x = parseInt(event.offsetX);
	y = parseInt(event.offsetY);
});

function init()
{
 	container = document.getElementById('container');
 	scene = new THREE.Scene();
 	camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 100000);

 	camera.position.set(0, 1000, 10000);
 	camera.lookAt(new THREE.Vector3(0.0, 500.0, 0.0));
 	camera.rotation.z = Math.PI / 50;

 	renderer = new THREE.WebGLRenderer({antialias: true});
 	renderer.setSize(window.innerWidth, window.innerHeight);
 	
 	renderer.setClearColor(0x000000, 1);
 	container.appendChild(renderer.domElement);
  	window.addEventListener('resize', onWindowResize, false);

  	light = new THREE.PointLight(0xFFFFFF, 1.3, 15000);
  	light.position.set(0, 0, 5000);
  	light.castShadow = true;
  	light.shadow.mapSize.width = 2048;
  	light.shadow.mapSize.height = 2048;
  	scene.add(light);

  	var amb_light = new THREE.HemisphereLight(0xFFFFFF, 0x000000, 0.1);
	scene.add(amb_light);

  	var stars_geometry = new THREE.Geometry();
  	var stars_mat = new THREE.PointsMaterial({
  		color: 0x696969, 
  		size: 1, 
  		sizeAttenuation: false
  	});
  	var stars;

  	for (var i = 0; i < 1000; i++)
  	{
  		var vertex = new THREE.Vector3();
  		vertex.x = Math.random() * 2 - 1;
  		vertex.y = Math.random() * 2 - 1;
  		vertex.z = Math.random() * 2 - 1;
  		vertex.multiplyScalar(10000);
  		stars_geometry.vertices.push(vertex);
  	}

  	stars = new THREE.Points(stars_geometry, stars_mat);
  	scene.add(stars);  

	var Planet = function(radius, distance, self_period, world_period, world_radius, diffuse_tex, bump_tex)
	{
		this.radius = radius;
		this.distance = distance;
		this.self_period = self_period;
		this.world_period = world_period;
		this.world_radius = world_radius;
		this.diffuse_tex = diffuse_tex;
		this.bump_tex = bump_tex;
	}

	Planet.prototype = 
	{
		Create: function() 
		{
			var geometry = new THREE.SphereGeometry(this.radius, 32, 32);
			var texture = new THREE.TextureLoader().load(this.diffuse_tex);
			var material = new THREE.MeshLambertMaterial({
				map: texture,
				side: THREE.DoubleSide
			});
			material.bumpMap = new THREE.TextureLoader().load(this.bump_tex);
			material.bumpScale = 0.05;
			this.sphere = new THREE.Mesh(geometry, material);	
			this.sphere.position.set(this.distance, 0, 0);
			this.sphere.castShadow = true;

			scene.add(this.sphere);
		},
		SelfOrbitMove: function()
		{
			this.sphere.rotation.y += this.self_period;
		},
		WorldOrbitMove: function()
		{

			this.sphere.position.x = Math.sin(deg * this.world_period) * this.world_radius;
			this.sphere.position.z = Math.cos(deg * this.world_period) * this.world_radius;
			deg += Math.PI / 180 * 2 * light_year_control;
		},
		OrbitLineGenerate: function()
		{
			var tracer = new THREE.Line;

   			tracer.geometry = new THREE.Geometry(),
    		tracer.material = new THREE.LineBasicMaterial({ color: 0x606257 });

    		for(var i = 0; i <= 500; i++) {
    			var vector = new THREE.Vector3(Math.sin(Math.PI / 180 * i) * this.world_radius, 0,
      									Math.cos(Math.PI / 180 * i) * this.world_radius);
     			tracer.geometry.vertices.push(vector);
    		}
    		tracer.geometry.computeLineDistances();
			scene.add(tracer);
		}
	}
	planets.push(new Planet(830, 0, 0.001, 0, 0, 'pic/sun/diffuse.jpg')); //Sun
	planets.push(new Planet(64, 2000, 0.001, 0.1, 2200, 'pic/earth/diffuse.jpg', 'pic/earth/bump.jpg')); //Earth
	planets.push(new Planet(300, 5520, 0.0004, 0.021, 5020, 'pic/jupiter/diffuse.jpg')); //Jupiter
	planets.push(new Planet(90, 6820, 0.0007, 0.001, 6520, 'pic/uranus/diffuse.jpg')); //Uranus
	planets.push(new Planet(80, 7220, 0.0006, 0.0005, 7020, 'pic/neptune/diffuse.jpg')); //Neptune
	planets.push(new Planet(60, 1700, 0.007, 0.2, 1700, 'pic/venus/diffuse.jpg','pic/venus/bump.jpg')); //Venus
	planets.push(new Planet(33, 2500, 0.007, 0.1, 2600, 'pic/mars/diffuse.jpg', 'pic/mars/bump.jpg')); //Mars
	planets.push(new Planet(24, 1000, 0.5, 0.3, 1200, 'pic/mercury/diffuse.jpg', 'pic/mercury/bump.jpg')); //Mercury


	
	for (var i = planets.length - 1; i >= 0; i--) {
		planets[i].Create();	
		//planets[i].OrbitLineGenerate();
	}
}

function simulate()
{
	for (var i = planets.length - 1; i >= 0; i--) {
		planets[i].SelfOrbitMove();
		planets[i].WorldOrbitMove();
	}
}

function planet_tracking(param)
{
	if (param == 0) {
		camera.lookAt(x, y, 0);
		camera.position.x = Math.sin(deg * planets[3].world_period * 2) * (planets[3].world_radius + 4000);
		camera.position.z = Math.cos(deg * planets[3].world_period * 2) * (planets[3].world_radius + 4000);
		deg += Math.PI / 180 * 2 * light_year_control;	
	} else {
		camera.lookAt(planets[param].sphere.position.x + x, y, planets[param].sphere.position.z);
		camera.position.x = Math.sin(deg * planets[param].world_period) * planets[param].world_radius + 1000;
		camera.position.z = Math.cos(deg * planets[param].world_period) * planets[param].world_radius + 1000;
		deg += Math.PI / 180 * 2 * light_year_control;				
	}
}

onkeypress = function(event)
{
	if(event.code == "Digit0") {
		param = 0;
	} else if (event.code == "Digit1") {
		param = 1;
	} else if (event.code == "Digit2") {
		param = 2;
	} else if (event.code == "Digit3") {
		param = 3;
	} else if (event.code == "Digit4") {
		param = 4;
	} else if (event.code == "Digit5") {
		param = 5;
	} else if (event.code == "Digit6") {
		param = 6;
	} else if (event.code == "Digit7") {
		param = 7;
	} 
}

function onWindowResize()
{
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate()
{
	requestAnimationFrame(animate);
	planet_tracking(param);
	simulate();
	render();
}

function render()
{
	var clock = new THREE.Clock();
	var delta = clock.getDelta();
	renderer.render(scene, camera);
}

