var scene = new THREE.Scene();

var camera = new THREE.PerspectiveCamera( 10, window.innerWidth/window.innerHeight, 1, 10000 );
camera.position.z = 20;
//camera.zoom = 5;

var renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

var controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = false;
//controls.dampingFactor = 0.25;
controls.enableZoom = true;
controls.enablePan = true;
controls.enableRotate = true;
controls.zoomSpeed = 10;


ambient = new THREE.AmbientLight(0xffffff,1.);

keyLight = new THREE.DirectionalLight(new THREE.Color('hsl(30, 100%, 75%)'), 1.0);
keyLight.position.set(-100, 0, 100);

fillLight = new THREE.DirectionalLight(new THREE.Color('hsl(240, 100%, 75%)'), 0.75);
fillLight.position.set(100, 0, 100);

backLight = new THREE.DirectionalLight(0xffffff, 1.0);
backLight.position.set(100, 0, -100).normalize();

//scene.add(ambient);
scene.add(keyLight);
scene.add(fillLight);
scene.add(backLight);

//camera.lookAt(scene.position);

var mtlLoader = new THREE.MTLLoader();
mtlLoader.setTexturePath('../website/data/JSH/');
mtlLoader.setPath('../website/data/JSH/');
mtlLoader.load('AVAL.mtl', function (materials) {

    materials.preload();

    var objLoader = new THREE.OBJLoader();
    objLoader.setMaterials(materials);
    objLoader.setPath('../website/data/JSH/');
    objLoader.load('AVAL.obj', function (object) {

        scene.add(object);
	//camera.lookAt(object.position);
        //object.position.y += 100;
	var box = new THREE.Box3().setFromObject(object);
	var boundingBoxSize = box.max.sub(box.min);
	var height = boundingBoxSize.y;
	var width = boundingBoxSize.x;
	var depth = boundingBoxSize.z;
	camera.position.set(width,height,5*depth);


    });

});

mtlLoader.load('AVAR.mtl', function (materials) {

    materials.preload();

    var objLoader = new THREE.OBJLoader();
    objLoader.setMaterials(materials);
    objLoader.setPath('../website/data/JSH/');
    objLoader.load('AVAR.obj', function (object) {

        scene.add(object);
	//camera.lookAt(object.position);
        //object.position.y += 100;
	var box = new THREE.Box3().setFromObject(object);
	var boundingBoxSize = box.max.sub(box.min);
	var height = boundingBoxSize.y;
	var width = boundingBoxSize.x;
	var depth = boundingBoxSize.z;
	camera.position.set(width,height,5*depth);


    });

});

mtlLoader.load('ASHL.mtl', function (materials) {

    materials.preload();

    var objLoader = new THREE.OBJLoader();
    objLoader.setMaterials(materials);
    objLoader.setPath('../website/data/JSH/');
    objLoader.load('ASHL.obj', function (object) {

        scene.add(object);
	//camera.lookAt(object.position);
        //object.position.y += 100;
	var box = new THREE.Box3().setFromObject(object);
	var boundingBoxSize = box.max.sub(box.min);
	var height = boundingBoxSize.y;
	var width = boundingBoxSize.x;
	var depth = boundingBoxSize.z;
	camera.position.set(width,height,5*depth);


    });

});

var animate = function () {
	requestAnimationFrame( animate );
	controls.update();
	renderer.render(scene, camera);
};

animate();
