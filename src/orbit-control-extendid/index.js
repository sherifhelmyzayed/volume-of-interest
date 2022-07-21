import * as THREE from 'three';
import { ConvexGeometry } from 'ConvexGeometry';
import { OrbitControls } from 'OrbitControls';


export class OrbitControlsExtended extends OrbitControls {
    constructor(camera, domElement) {
        super(camera, domElement)

        this.camera = camera
    }

    // starter variables
    zoomCondition = false;
    camTo0;
    camFromObj = 300;
    targetPosition = { x: null, y: null, z: null };


    offsetCam = (scene, raycaster) => {
        console.log(this.maxDistance);
        raycaster.setFromCamera({ x: 0, y: 0 }, this.camera);
        this.camTo0 = this.camFromObj + (this.camera.position.distanceTo(this.target) - raycaster.intersectObjects(scene.children)[0].distance);
        if (this.camTo0 > this.maxDistance) this.camTo0 = this.maxDistance
        this.targetPosition = {
            x: this.camTo0 * Math.sin(this.getAzimuthalAngle()) * Math.sin(this.getPolarAngle()),
            y: this.camTo0 * Math.cos(this.getPolarAngle()),
            z: this.camTo0 * Math.cos(this.getAzimuthalAngle()) * Math.sin(this.getPolarAngle())
        }

        if (!this.zoomCondition) {
            this.goToTarget()
        } else {
            this.camFromObj = raycaster.intersectObjects(scene.children)[0].distance
        }
    }


    goToTarget = () => {
        this.camera.position.x += (this.targetPosition.x - this.camera.position.x) * 0.1;
        this.camera.position.y += (this.targetPosition.y - this.camera.position.y) * 0.1;
        this.camera.position.z += (this.targetPosition.z - this.camera.position.z) * 0.1;
    }


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