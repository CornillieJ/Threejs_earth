import './style.css';
//=========================
//INITIALIZE THREE
//=========================
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
window.addEventListener('load',initialize)
let angle =0;
let lookAtMoon = false;
let moved = false
let turned = false;
const moonDistance = 40 
let navigationButtons;
function initialize(){
  navigationButtons = document.querySelectorAll('.navigation li');

  navigationButtons.forEach(btn=>{
    btn.addEventListener('click',changeFocus)});  

  window.addEventListener('keydown', (e) => {
    if (e.key === 'e' || e.key === 'E') {
      focusEarth()
    } else if (e.key === 'm' || e.key === 'M') { 
      lookAtMoon = true;
    }
  });
}
//need 3 things => scene, camera, renderer
//initialize scene
const scene = new THREE.Scene();

//initialize camera, constructor arguments: FOV, Aspect ratio, shortest view, furthest view
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);

//initialize renderer, needs to know dom element to show in
const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector('#bg'),
});
renderer.useLegacyLights = false;

//Set renderer options pixelratio and size equal to window,
// position moved back on Z to show the elements better
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
camera.position.setZ(50);

//start rendering with scene and camera
renderer.render(scene, camera);
//=========================
//Add object to scene
//=========================

//a geometry = the {x,y,z} points that make up a shape. three.js has buit in geometries
const Geometry = new THREE.TorusGeometry(15, 0.8, 16, 100);
//geometry needs a material, most materials need light source to bounce off and show itself
//but here we use basic material which does not use this
// const material = new THREE.MeshBasicMaterial({color:0xFF6347, wireframe: true})
const material = new THREE.MeshStandardMaterial({ color: 0xe5a508 });
//now we create a mesh. this is combination of the geometry and material,
// and this is what we will add to the scene
const torus = new THREE.Mesh(Geometry, material);
// scene.add(torus);
//after this the scene needs to be rendered again so we create the animate function at this point

//=========================
//Add lighting
//=========================
// const pointLight = new THREE.PointLight(0xffff00);
// pointLight.position.set(40, 0, 40);
// pointLight.lookAt(0,0,0);
const sunLight = new THREE.DirectionalLight(0xffffff,1.5);
sunLight.position.set(900, 0, 900);
sunLight.target.position.set(0,0,0);
// scene.add(ambientLight);
scene.add(sunLight);
// scene.add(sunLight.target);
const ambientLight = new THREE.AmbientLight(0x333333, 1);  // Soft light to brighten the dark side
scene.add(ambientLight);
//lighting is hard but there are helpers to make it easier
// const lighthelper = new THREE.PointLightHelper(pointLight);
const lighthelper = new THREE.DirectionalLightHelper(sunLight);
// scene.add(lighthelper);
const gridhelper = new THREE.GridHelper(200, 50);
// scene.add(gridhelper);

//=========================
//random generation using math helpers
//=========================
const stargeometry = new THREE.SphereGeometry(0.1, 24, 24);
// const geometry = new THREE.DodecahedronGeometry(.25,24);
const starmaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });

function addStar() {
  const star = new THREE.Mesh(stargeometry, starmaterial);
  const [x, y, z] = Array(3)
    .fill()
    .map(() => THREE.MathUtils.randFloatSpread(100));
  star.position.set(x, y, z);
  scene.add(star);
  return star;
}
function moveStar(star) {
  let distance = 0;
  let direction = 1;
  const random = THREE.MathUtils.randInt(0, 1);
  if (random === 0) direction = -1;
  setInterval(() => {
    distance++;
    star.position.z += direction * 0.003;
    star.position.x += direction * 0.003;
    star.position.y -= direction * 0.003;
    if (distance > 500) {
      direction = -direction;
      distance = 0;
    }
  }, 10);
}
const stars = Array(200).fill().map(addStar);
stars.forEach(moveStar);

//=========================
//Background
//=========================
const textureLoader = new THREE.TextureLoader();
const spaceTexture = textureLoader.load('/milky_way.jpg');
spaceTexture.colorSpace = THREE.SRGBColorSpace;
scene.background = spaceTexture;

//=========================
//Texture mapping
//=========================
const boxTexture = textureLoader.load('/moon.jpg');
const moonBox = new THREE.Mesh(new THREE.BoxGeometry(3, 3, 3), new THREE.MeshBasicMaterial({ map: boxTexture }));
// scene.add(moonBox);

const moonTexture = textureLoader.load('/moon.jpg');
moonTexture.colorSpace = THREE.SRGBColorSpace;
const normalTexture = textureLoader.load('/normal.jpg');
const moon = new THREE.Mesh(
  new THREE.SphereGeometry(6, 32, 32),
  new THREE.MeshStandardMaterial({
    map: moonTexture,
    //adding normalMap to the texture will make it appear to have depth
    normalMap: normalTexture,
  })
);
moon.position.x = moonDistance;
moon.position.y = moonDistance;
moon.position.z = moonDistance;
scene.add(moon);

const earthGroup = new THREE.Group();

const earthTexture = textureLoader.load('/earth.jpg');
earthTexture.colorSpace = THREE.SRGBColorSpace;
const earthNormal = textureLoader.load('/earthNormal.tif');
earthNormal.colorSpace = THREE.SRGBColorSpace;
const earthBump = textureLoader.load('/Bump.jpg');
earthBump.colorSpace = THREE.SRGBColorSpace;
const earthGeometry = new THREE.SphereGeometry(20, 32, 32);
const cloudGeometry = new THREE.SphereGeometry(20.1, 32, 32);
const earth = new THREE.Mesh(
  earthGeometry,
  new THREE.MeshStandardMaterial({
    map: earthTexture,
    // normalMap: earthNormal,
    bumpMap: earthBump,
    bumpScale: 0.03,
    metalness: 0.5,
    roughness: 0.8,
  })
);
const cloudsTexture = textureLoader.load('/clouds.jpg');
const clouds =  new THREE.Mesh(
  cloudGeometry,
  new THREE.MeshStandardMaterial({alphaMap:cloudsTexture, transparent:true})
);
earthGroup.add(earth)
earthGroup.add(clouds)
earthGroup.rotation.z = 23.5 / 360 * 2 * Math.PI
scene.add(earthGroup);


const sunTexture = textureLoader.load('/sun.jpg');
const sun = new THREE.Mesh(
  new THREE.SphereGeometry(200, 32, 32),
  new THREE.MeshBasicMaterial({
    map: sunTexture,
  })
);
sun.position.set(900,0,900);
scene.add(sun);
//=========================
//Interaction
//=========================
const controls = new OrbitControls(camera, renderer.domElement);
window.addEventListener('keydown', (e) => {
  if (e.key === 'w') torus.position.setZ(torus.position.z - 1);
  if (e.key === 's') torus.position.setZ(torus.position.z + 1);
});

//=========================
//Auto animation
//=========================
//to avoid having to write the render multiple times
// we can create a function that just renders automatically infinitely
function animate() {
  requestAnimationFrame(animate); //this tells the browser we want to animate something, so it runs on the device's framerate
  controls.update();
  logic();
  renderer.render(scene, camera);
}
function logic() {
  // torus.rotation.x += 0.01;
  // torus.rotation.y += 0.005;
  // torus.rotation.z += 0.01;
  angle += 0.005;
  moon.rotation.x = angle;
  // moon.rotation.y = angle;
  moon.position.x = Math.cos(angle) * moonDistance;
  moon.position.y = Math.cos(angle) * moonDistance;
  moon.position.z = Math.sin(angle) * moonDistance;
  sun.rotation.y += 0.001;
  earthGroup.rotation.y += 0.001;
  clouds.rotation.y += 0.0001;
  clouds.rotation.z += 0.0003;
  clouds.rotation.x += 0.0001;
  sun.position.x = Math.cos(angle*0.08) * 900;
  if(lookAtMoon)
    lookAtTheMoon();
}
animate();

function lookAtTheMoon(){
  controls.enabled = false;
  camera.lookAt(moon.position);
  camera.position.set(moon.position.x + 10, moon.position.y, moon.position.z + 10);
  controls.enabled = true;
}
function changeFocus(){
  const value = this.innerText.toLowerCase();
  if (value ==='earth'){
    focusEarth();
  }else if (value === 'moon'){
    lookAtMoon = true;
  }else{
    lookAtMoon = false;
    camera.position.set(-200,-100,100);
    camera.lookAt(0,0,0);
    controls.target.set(0,0,0)
  }
}
function focusEarth(){
      controls.enabled = false;
      lookAtMoon = false;
      camera.lookAt(0,0,0);
      camera.position.set(0,0,50);
      camera.rotation.s
      controls.target.set(0,0,0)
      controls.enabled = true;
}