import * as THREE from 'three';
import { OrbitControls } from 'OrbitControls';
import { GLTFLoader } from 'GLTFLoader';


/////////////////////////////////////////////////////////////////////
//////////////////// THREEJS SCENE PREP STARTS //////////////////////
/////////////////////////////////////////////////////////////////////

let camera, controls, scene, renderer, boundingObject, raycaster;

let target = {
    x: null,
    y: null,
    z: null
}
let zoomCondition
let newOffset = 300




const init = () => {
    // scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xcccccc);

    // camera
    camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 1, 5000);
    camera.position.set(400, 200, 0);

    // lights
    // hlight = new THREE.AmbientLight(0x404040, 50)
    // scene.add(hlight)

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


    // loader
    const loader = new GLTFLoader();
    loader.load('../glb/scene.gltf', (gltf) => {

        // updates actual dimensions after object scaling 
        gltf.scene.updateMatrixWorld(true)

        // traverse to get object dimensions
        gltf.scene.traverse((child) => {
            if (child.isMesh) {
                const box = new THREE.Box3().setFromObject(child);
                const boxSize = box.getSize(new THREE.Vector3());

                // creating boundingObject
                const geometry = new THREE.BoxGeometry(boxSize.x, boxSize.y, boxSize.z);
                const material = new THREE.MeshBasicMaterial({
                    wireframe: true,
                    color: 0xffff00,
                });
                // material.transparent = true
                boundingObject = new THREE.Mesh(geometry, material);
                scene.add(boundingObject);
            }
        })
        const obj = gltf.scene.children[0];
        obj.position.set(22, 0, 0)
        scene.add(gltf.scene);
        animate();
    })


    // controls
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = false;
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = false;
    controls.minDistance = 50;
    controls.maxDistance = 500;
    controls.maxPolarAngle = Math.PI / 2;


    // window resize event
    window.addEventListener('resize', onWindowResize);

    // raycaster
    raycaster = new THREE.Raycaster()
}

const onWindowResize = () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

const animate = () => {
    requestAnimationFrame(animate);

    if (zoomCondition) {
        setTimeout(() => {
            zoomCondition = false
            console.log(zoomCondition);
            console.log(camera.position.distanceTo(controls.target));
        }, 600);
    }
    raycaster.setFromCamera({ x: 0, y: 0 }, camera);
    const newRadius = newOffset + (camera.position.distanceTo(controls.target) - raycaster.intersectObjects(scene.children)[0].distance)

    target.x = newRadius * Math.sin(controls.getAzimuthalAngle()) * Math.sin(controls.getPolarAngle())
    target.y = newRadius * Math.cos(controls.getPolarAngle())
    target.z = newRadius * Math.cos(controls.getAzimuthalAngle()) * Math.sin(controls.getPolarAngle());

    if (!zoomCondition) {
        goToTarget(camera, target)
    } else {
        newOffset = raycaster.intersectObjects(scene.children)[0].distance
    }
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



const offsetChange = () => {
    document.getElementById('offsetLabel').innerText = `offset: ${document.querySelector('#offset').value}`;
    newOffset1 = parseInt(document.querySelector('#offset').value)
}

document.querySelector('#offset').addEventListener('change', () => offsetChange())



document.addEventListener('wheel', () => {
    zoomCondition = true;
});




/// ******************************************************************* ////
/// ******************** NOTES **************************************** ////


// distance to point zero
// camera.position.distanceTo(controls.target)

// distance to raycaster object
// raycaster.intersectObjects(scene.children)[0].distance


// keep distance while not zooming




// define r =
// x = r cos(azimuth phi) sin (polar theta)
// y = r sin(azimuth phi) cos (polar theta)
// z = r cos (polar theta)


const goToTarget = (camera, target) => {
    camera.position.x += (target.x - camera.position.x) * 0.1;
    camera.position.y += (target.y - camera.position.y) * 0.1;
    camera.position.z += (target.z - camera.position.z) * 0.1;
}

