import * as THREE from 'three';
import { ConvexGeometry } from 'ConvexGeometry';

import { OrbitControls } from 'OrbitControls';


export class OrbitControlsExtended extends OrbitControls {
    constructor(camera, domElement) {
        super(camera, domElement)
    }

    zoomCondition = false;
    maxOffset;


    






    createCouvexHull = (objData) => {
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
        return convexHull
    }
    
}



export const offsetCam = (scene, camera, controls, raycaster, target, newOffset, zoomCondition) => {

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

    return newOffset
}



const goToTarget = (camera, target) => {
    camera.position.x += (target.x - camera.position.x) * 0.1;
    camera.position.y += (target.y - camera.position.y) * 0.1;
    camera.position.z += (target.z - camera.position.z) * 0.1;
}


