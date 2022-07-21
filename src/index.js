import * as THREE from 'three';
import { GLTFLoader } from 'GLTFLoader';
import { OrbitControlsExtended } from './orbit-control-extendid/index.js'



/////////////////////////////////////////////////////////////////////
//////////////////// THREEJS SCENE PREP STARTS //////////////////////
/////////////////////////////////////////////////////////////////////

let camera, controls, scene, renderer, raycaster, objData


const init = () => {
    // scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xcccccc);

    // camera
    camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 1, 5000);
    camera.position.set(400, 200, 0);

    // lights
    const directionalLight = new THREE.DirectionalLight(0xffffff, 5)
    directionalLight.position.set(0, 10, 0)
    directionalLight.castShadow = true;
    scene.add(directionalLight)


    // renderer
    renderer = new THREE.WebGLRenderer({
        antialias: true
    });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // raycaster
    raycaster = new THREE.Raycaster()

    // create new class
    controls = new OrbitControlsExtended(camera, renderer.domElement)

    // controls
    // controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = false;
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = false;
    controls.minDistance = 50;
    controls.maxDistance = 500;
    controls.maxPolarAngle = Math.PI / 2;

    // loader
    const loader = new GLTFLoader();
    loader.load('../glb/scene.gltf', (gltf) => {

        // updates actual dimensions after object scaling 
        gltf.scene.updateMatrixWorld(true);

        // traverse to get object dimensions
        gltf.scene.traverse((child) => {
            if (child.isMesh) {
                objData = child;
            }
        })
        const obj = gltf.scene.children[0];
        obj.position.set(22, 0, 0);

        // couvex geometry is added over the GLTF model 
        objData.add(controls.createCouvexHull(objData));

        scene.add(gltf.scene);
        animate();
    })


    // window resize event
    window.addEventListener('resize', onWindowResize);


}

const onWindowResize = () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

const animate = () => {
    requestAnimationFrame(animate);

    if (controls.zoomCondition) {
        setTimeout(() => {
            controls.zoomCondition = false;
        }, 600);
    }


    controls.offsetCam(scene, raycaster);

    render();
}

const render = () => {
    renderer.render(scene, camera);
}


init();
render();



/////////////////////////////////////////////////////////////////////
//////////////////// THREEJS SCENE PREP ends ////////////////////////
/////////////////////////////////////////////////////////////////////



// event listener to changing offset input
document.querySelector('#offset').addEventListener('change', () => {
    document.getElementById('offsetLabel').innerText = `offset: ${document.querySelector('#offset').value}`;
    controls.maxDistance = parseInt(document.querySelector('#offset').value);
})


// event listener to zoom 
document.addEventListener('wheel', () => {
    controls.zoomCondition = true;
});