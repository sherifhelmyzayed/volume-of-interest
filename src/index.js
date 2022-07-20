import * as THREE from 'three';
import { OrbitControls } from 'OrbitControls';
import { GLTFLoader } from 'GLTFLoader';
import { ConvexGeometry } from 'ConvexGeometry';



/////////////////////////////////////////////////////////////////////
//////////////////// THREEJS SCENE PREP STARTS //////////////////////
/////////////////////////////////////////////////////////////////////

let camera, controls, scene, renderer, raycaster, objData;

let target = {
    x: null,
    y: null,
    z: null
}
let zoomCondition
let newOffset = 300
let maxOffset;




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


    // loader
    const loader = new GLTFLoader();
    loader.load('../glb/scene.gltf', (gltf) => {

        // updates actual dimensions after object scaling 
        gltf.scene.updateMatrixWorld(true)

        // traverse to get object dimensions
        gltf.scene.traverse((child) => {
            if (child.isMesh) {
                objData = child
            }
        })
        const obj = gltf.scene.children[0];
        obj.position.set(22, 0, 0);
        createCouvexHull(objData)
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
    maxOffset = parseInt(document.querySelector('#offset').value)
}

document.querySelector('#offset').addEventListener('change', () => offsetChange())



document.addEventListener('wheel', () => {
    zoomCondition = true;
});


const goToTarget = (camera, target) => {
    camera.position.x += (target.x - camera.position.x) * 0.1;
    camera.position.y += (target.y - camera.position.y) * 0.1;
    camera.position.z += (target.z - camera.position.z) * 0.1;
}


const createCouvexHull = (objData) => {
    const position = objData.geometry.attributes.position.array
    const points = []
    
    for (let i = 0; i < position.length; i += 3) {
        const vertex = new THREE.Vector3(position[i], position[i + 1], position[i + 2]);
        points.push(vertex);
    }

    const ConvexGeo = new ConvexGeometry(points)
    const convexHull = new THREE.Mesh(
        ConvexGeo,
        new THREE.MeshBasicMaterial({
            color: 0x00ff00,
            wireframe: true,
            transparent: true
        })
    )
    objData.add(convexHull)
}