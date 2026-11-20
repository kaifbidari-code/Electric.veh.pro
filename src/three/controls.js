import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { systemState } from '../simulation/systemState.js';
import { eventBus } from '../simulation/eventBus.js';

export class ControlsManager {
  constructor(camera, domElement, selectableObjects = []) {
    this.camera = camera;
    this.domElement = domElement;
    this.selectableObjects = selectableObjects;

    // OrbitControls
    this.controls = new OrbitControls(this.camera, this.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.minDistance = 0.5;
    this.controls.maxDistance = 12.0;
    this.controls.maxPolarAngle = Math.PI / 2 - 0.02; // Don't go below ground
    this.controls.screenSpacePanning = true;

    // Raycaster for interaction
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();

    this.hoveredObject = null;
    this.selectedObject = null;

    this.initInteractionEvents();
  }

  setSelectables(list) {
    this.selectableObjects = list;
  }

  initInteractionEvents() {
    this.domElement.addEventListener('mousemove', (e) => this.onMouseMove(e));
    this.domElement.addEventListener('click', (e) => this.onClick(e));
  }

  onMouseMove(e) {
    const rect = this.domElement.getBoundingClientRect();
    this.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(this.selectableObjects, true);

    if (intersects.length > 0) {
      const topObj = this.findSelectableAncestor(intersects[0].object);
      if (topObj) {
        this.domElement.style.cursor = 'pointer';
        this.hoveredObject = topObj;
        return;
      }
    }

    this.domElement.style.cursor = 'grab';
    this.hoveredObject = null;
  }

  onClick(e) {
    const rect = this.domElement.getBoundingClientRect();
    this.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(this.selectableObjects, true);

    if (intersects.length > 0) {
      const selected = this.findSelectableAncestor(intersects[0].object);
      if (selected && selected.userData) {
        this.selectedObject = selected;
        systemState.selectComponent(selected.userData);
        return;
      }
    }
  }

  findSelectableAncestor(obj) {
    let curr = obj;
    while (curr) {
      if (curr.userData && (curr.userData.isStationComponent || curr.userData.isScooterComponent)) {
        return curr;
      }
      curr = curr.parent;
    }
    return null;
  }

  update() {
    this.controls.update();
  }
}
