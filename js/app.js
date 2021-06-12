import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { gsap } from "gsap";

const container = document.body;

/**
 * Wrapper for the scene with methods to add a sphere and direction buttons
 * @param image - the panoramic picture
 */
class CustomSceneObject {
  constructor(image) {
    this.image = image;
    this.points = [];
    this.scene = null;
    this.sphere = null;
    this.sprites = [];
  }

  addPoint(point) {
    this.points.push(point);
  }

  addDirectionButton(point) {
    const spriteMap = new THREE.TextureLoader().load('../img/arrow-up.svg');
    const spriteMaterial = new THREE.SpriteMaterial({ map: spriteMap });
    const sprite = new THREE.Sprite(spriteMaterial);
    sprite.name = point.name;
    sprite.position.copy(point.position.clone().normalize().multiplyScalar(15));
    sprite.scale.multiplyScalar(0.85);
    sprite.onClick = () => {
      this.destroy();
      point.nextCustomSceneObject.createSphere(this.scene);
      point.nextCustomSceneObject.appear();
    };
    this.scene.add(sprite);
    this.sprites.push(sprite);
  }

  createSphere(scene) {
    this.scene = scene;
    const geometry = new THREE.SphereGeometry(50, 32, 32);
    const texture = new THREE.TextureLoader().load(this.image);
    texture.wrapS = THREE.RepeatWrapping;
    texture.repeat.x = -1;
    const material = new THREE.MeshBasicMaterial({
      map: texture,
      side: THREE.DoubleSide
    });
    material.transparent = true;
    this.sphere = new THREE.Mesh(geometry, material);
    this.scene.add(this.sphere);
    this.points.forEach(this.addDirectionButton.bind(this));
  }

  appear() {
    this.sphere.material.opacity = 0;
    gsap.to(this.sphere.material, {
      duraction: 1,
      opacity: 1
    });

    this.sprites.forEach((sprite) => {
      sprite.scale.set(0, 0, 0);
      gsap.to(sprite.scale, {
        duration: 1,
        x: 1,
        y: 1,
        z: 1
      });
    });
  }

  destroy() {
    gsap.to(this.sphere.material, {
      duration: 1,
      opacity: 0,
      onComplete: () => {
        this.scene.remove(this.sphere);
      }
    });

    this.sprites.forEach((sprite) => {
      gsap.to(sprite.scale, {
        duration: 1,
        x: 0,
        y: 0,
        z: 0,
        onComplete: () => {
          this.scene.remove(sprite);
        }
      });
    });
  }
}

// Scene
const scene = new THREE.Scene();
const CustomSceneObject1 = new CustomSceneObject('../img/outside.jpeg');
const CustomSceneObject2 = new CustomSceneObject('../img/inside.jpeg');

CustomSceneObject1.addPoint({
  position: new THREE.Vector3(
    47.64980841395977,
    -7.69998581077531,
    12.086053677672625
  ),
  name: 'Entrance',
  nextCustomSceneObject: CustomSceneObject2
});
CustomSceneObject2.addPoint({
  position: new THREE.Vector3(
    47.64980841395977,
    -20,
    120
  ),
  name: 'Exit',
  nextCustomSceneObject: CustomSceneObject1
});
CustomSceneObject1.createSphere(scene);

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

// Render
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
container.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.rotateSpeed = 0.35;
camera.position.set(-1, 0, 0);
controls.update();

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
animate();

// Makes the website responsive
function onResize() {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
}

// Triggers the sprite's onClick callback
function onClick(e) {
  const mouse = new THREE.Vector2(
    (e.clientX / window.innerWidth) * 2 - 1,
    -(e.clientY / window.innerHeight) * 2 + 1
  );
  const raycaster = new THREE.Raycaster();
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(scene.children);
  intersects.forEach((intersect) => {
    if (intersect.object.type === 'Sprite') {
      intersect.object.onClick();
    }
  });
}

window.addEventListener('resize', onResize);
window.addEventListener('click', onClick);
