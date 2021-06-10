const container = document.body;

/**
 * Wrapper to create a scene associated with a panoramic picture
 * @param image - the panoramic picture
 */
class CustomSceneObject {
  constructor(image) {
    this.image = image;
    this.scene = null;
    this.points = [];
    this.sprites = [];
  }

  addPoint(point) {
    this.points.push(point);
  }

  addTooltip(point) {
    const spriteMap = new THREE.TextureLoader().load('../img/arrow-up.svg');
    const spriteMaterial = new THREE.SpriteMaterial({ map: spriteMap });
    const sprite = new THREE.Sprite(spriteMaterial);
    sprite.name = point.name;
    sprite.position.copy(point.position.clone().normalize().multiplyScalar(15));
    sprite.scale.multiplyScalar(0.85);
    this.scene.add(sprite);
    this.sprites.push(sprite);
  }

  createScene(scene) {
    this.scene = scene;
    const geometry = new THREE.SphereGeometry(50, 32, 32);
    const texture = new THREE.TextureLoader().load(this.image);
    texture.wrapS = THREE.RepeatWrapping;
    texture.repeat.x = -1;
    const material = new THREE.MeshBasicMaterial({
      map: texture,
      side: THREE.DoubleSide,
    });
    material.transparent = true;
    this.sphere = new THREE.Mesh(geometry, material);
    this.scene.add(this.sphere);
    this.points.forEach(this.addTooltip.bind(this));
  }
}

// Scenes
const s1 = new CustomSceneObject('../img/outside.jpeg');
const s2 = new CustomSceneObject('../img/inside.jpeg');
const scene = new THREE.Scene();

s1.addPoint({
  position: new THREE.Vector3(47.64980841395977, -7.69998581077531, 12.086053677672625),
  name: 'Entrance',
  scene: s2
});
s2.addPoint({
  position: new THREE.Vector3(47.64980841395977, -7.69998581077531, 12.086053677672625),
  name: 'Exit',
  scene: s1
});
s1.createScene(scene);

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

const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.rotateSpeed = 0.35;
camera.position.set(-1, 0, 0);
controls.update();

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
animate();

function onResize() {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
}

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
      TweenLite.to(sphere.material, 1, {
        opacity: 0
      });
    }
  });

  // const intersects = raycaster.intersectObject(sphere);
  // if (intersects.length > 0) {
  //   console.log(intersects[0].point);
  //   addTooltip(intersects[0].point);
  // }
}

window.addEventListener('resize', onResize);
window.addEventListener('click', onClick);
