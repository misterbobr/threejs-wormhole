import gsap from 'gsap';
import * as THREE from 'three';
import { Clock } from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
const { createNoise3D } = require('simplex-noise');
import { randFloat, randInt } from 'three/src/math/mathutils';

const scene = new THREE.Scene();

const renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0);
document.body.appendChild(renderer.domElement);
renderer.domElement.style.opacity = 0;

window.addEventListener('resize', () =>
{
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
})

let camZ = 0;
window.addEventListener('wheel', (e) => 
{
    camZ += e.deltaY * 0.001;
    console.log(camZ);
})


// const   space_length        = 1000,
//         wormhole_length     = 400,
//         space_velocity      = 3 * 0.001,
//         space_rotation      = -2 * 0.0001,
//         wormhole_rotation   = 1 * 0.001,
//         wormhole_velocity   = 5 * 0.001,
//         wormhole_freq       = 6;

const   space_length        = 1000,
        wormhole_length     = 1000,
        space_velocity      = 8 * 0.001,
        space_rotation      = -10 * 0.0001,
        wormhole_rotation   = 15 * 0.001,
        wormhole_velocity   = 8 * 0.001,
        wormhole_freq       = 6,
        star_density        = 400,
        star_size           = 2;

const camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 0.01, 2000 );
camera.position.x = 0;
camera.position.y = 0;
camera.position.z = -space_length * 0.6;

const loader = new THREE.TextureLoader();

const background = loader.load('./image/space2_cut.jpg', function ( background ) {

    background.wrapT = THREE.MirroredRepeatWrapping;
    background.wrapS = THREE.MirroredRepeatWrapping;
    background.offset.set( 0, 0 );
    background.repeat.set( 4, 5 );
    background.anisotropy = 16;
})

const spaceTexture = loader.load('./image/space2.jpg', function ( texture ) {

    texture.wrapT = THREE.MirroredRepeatWrapping;
    texture.wrapS = THREE.MirroredRepeatWrapping;
    texture.offset.set( 0, 0 );
    texture.repeat.set( 2, Math.round(space_length / 40) );
    texture.anisotropy = 8;
})

const whAlphaMap = loader.load('./image/alpha-map.jpg', function ( whAlphaMap ) {
    whAlphaMap.wrapS = whAlphaMap.wrapT = THREE.MirroredRepeatWrapping;
    whAlphaMap.offset.set( 0, 0 );
    whAlphaMap.repeat.set( 1, 3 );
})

const spAlphaMap = loader.load('./image/alpha-map2.jpg', function ( map ) {

})

const uranusTexture = loader.load('./image/uranus.jpg', function ( map ) {

})

const uranusRingTexture = loader.load('./image/uranus_ring_alpha_polar.png', function ( map ) {

})

// const whGroup = new THREE.Group();
// const planetsGroup = new THREE.Group();

const gmBack = new THREE.SphereGeometry(space_length * 1.1 / 2, 100, 100, 1, Math.PI * 2);
const matBack = new THREE.MeshBasicMaterial({ map: background, side: THREE.BackSide, transparent: true, opacity: 0 });
const backgr = new THREE.Mesh(gmBack, matBack);
backgr.rotateZ(-1);
backgr.position.z = -space_length * 0.9;
scene.add(backgr);

const planets = {};

const gmUranus = new THREE.SphereGeometry(5, 32, 32);
const matUranus = new THREE.MeshStandardMaterial({ side: THREE.FrontSide, map: uranusTexture, transparent: true, opacity: 0 });
planets['uranus'] = new THREE.Mesh(gmUranus, matUranus);
planets['uranus'].position.set(-50, 0, -space_length - 80);
planets['uranus'].rotateZ(Math.PI / 2 * 98 / 90);
scene.add(planets['uranus']);

const gmUranusRing = new THREE.RingGeometry(10, 15, 64);
const matUranusRing = new THREE.MeshStandardMaterial({ side: THREE.DoubleSide, transparent: true, map: uranusRingTexture, opacity: 0 });
planets['uranusRing'] = new THREE.Mesh(gmUranusRing, matUranusRing);
planets['uranusRing'].position.set(-50, 0, -space_length - 80);
// uranusRing.rotateX(Math.PI/2);
scene.add(planets['uranusRing']);

const gmSp = new THREE.CylinderGeometry(22, 22, space_length, 60, 1, true);
const matSp = new THREE.MeshBasicMaterial({ map: spaceTexture, side: THREE.BackSide, wireframe: false, transparent: true, alphaMap: spAlphaMap, opacity: 0});
// const matSp = new THREE.MeshStandardMaterial({ map: spaceTexture, side: THREE.BackSide, wireframe: false });
const Sp = new THREE.Mesh(gmSp, matSp);
Sp.rotateX(Math.PI * 0.5);
Sp.position.z = -space_length * 0.45;
scene.add(Sp);

const gmWh = new THREE.CylinderGeometry(15, 15, wormhole_length, 60, 100, true);
const matWh = new THREE.MeshBasicMaterial({ color: 0x3399cc, side: THREE.DoubleSide, wireframe: true, transparent: true, alphaMap: whAlphaMap, opacity: 0 });
const Wh = new THREE.Mesh(gmWh, matWh);
Wh.rotateX(Math.PI * 0.5);
Wh.position.z = -wormhole_length * 0.45;
scene.add(Wh);

const gmStar = new THREE.SphereGeometry(star_size * 0.01, 15, 15);
const matStar = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide, transparent: true, opacity: 0 });
const stars = Array(star_density).fill(0);
for (let n = 0; n < stars.length; n++) {
    stars[n] = new THREE.Mesh(gmStar, matStar);
    stars[n].position.set(randFloat(-15, 15), randFloat(-15, 15), randFloat(-150, 0));
    scene.add(stars[n]);
}

const pLight = new THREE.PointLight(0xffffff, 1);
pLight.position.set(0, 40, -space_length);
// pLight.target.position.set(0, 0, -10);
scene.add(pLight);
// const helper = new THREE.SpotLightHelper(pLight, 0xff0000);
// scene.add(helper);
let flag = true;
// const controls = new OrbitControls( camera, renderer.domElement );
// const c = new Clock();

window.addEventListener('mousemove', (e) => {
    if (!flag) {
        let point = new THREE.Vector3;
        point.copy(camera.position);
        let cam_dx = (e.clientX - window.innerWidth / 2) / window.innerWidth / 2,
        cam_dy = (e.clientY - window.innerHeight / 2) / window.innerHeight / 2;
        point.z -= 1;
        point.x += cam_dx;
        point.y -= cam_dy;
        camera.lookAt(point);
        // console.log(e.clientX, e.clientY);
    }
})

const noise = createNoise3D();
function anim() {
    if (flag) {
        camera.position.z += camZ;
        camZ *= 0.995;

        stars.forEach((star) => {
            let dist;
            if ((dist = camera.position.z - star.position.z) < 150 && dist > 0) {
                star.position.z += 0.1;
            }
            else {
                star.position.z = randFloat(-150, -25) + camera.position.z;
            }
        })

        if (camera.position.z < -space_length * 0.95) {
            flag = false;
            gsap.to(renderer.domElement.style, {opacity: 0, duration: 0.5});
            gsap.to(camera.position, {z: 0, duration: 0}, '>0');
            gsap.to(renderer.domElement.style, {opacity: 1, duration: 2}, '>2');
        }
    }
    else {
        scene.remove(Sp, Wh);
    }
    
    const position = Wh.geometry.attributes.position;
    // const position2 = cyl2.geometry.attributes.position;
    const v = new THREE.Vector3();
    const v2 = new THREE.Vector3();
    let time = performance.now() * 0.0003;
    for ( let k = 0; k < position.count; k++ ) {

        v.fromBufferAttribute( position, k );
        let y_ = v.y;
        let dist = Math.hypot(v.y, Wh.geometry.parameters.radiusTop);
        v.normalize();
        let d = dist + noise(
            v.x + time,
            v.y + time,
            v.z + time) * 0.8;
        position.setXYZ(k, v.x * d, y_, v.z * d);
    }

    whAlphaMap.offset.y -= wormhole_velocity
    // spaceTexture.offset.y -= space_velocity
    // spAlphaMap.offset.y += space_velocity
    Wh.geometry.verticesNeedUpdate = true;
    Wh.geometry.attributes.position.needsUpdate = true;
    Wh.geometry.normalsNeedUpdate = true;
    Wh.rotateY(wormhole_rotation);
    Sp.rotateY(space_rotation);

    planets['uranus'].rotateY(0.001)
    planets['uranusRing'].rotateZ(0.001)

    requestAnimationFrame(anim);
    renderer.render(scene, camera);
}

function gsapInit() {
    let startTime = 1;
    const tlMain = gsap.timeline();
    tlMain.to(matWh, {opacity: 0.8, duration: 0.5}, startTime)
    .to(matWh, {opacity: 0, duration: 0.3}, '>0.5')
    .to(camera.position, {z: -800, duration: 0})
    .to(whAlphaMap.repeat, {x: 1, y: wormhole_freq, duration: 1}, '<0')
    .to(matWh, {opacity: 0.7, duration: 0.5}, '<2')
    .to(matStar, {opacity: 0.8, duration: 2}, '<1')
    .to(matSp, {opacity: 1, duration: 0.5}, '<0');
    for (let k in planets) {
        tlMain.to(planets[k].material, {opacity: 1, duration: 0.5}, '<0');
        // console.log(obj)
    }
    tlMain.to(matBack, {opacity: 1, duration: 0.5}, '<0')
    .to(matBack, {transparent: false, duration: 0});
    // gsap.to([matBack, matSp, matWh], {opacity: 1, duration: 3});
    gsap.to(pLight, {intensity: 1, duration: 5});
    gsap.to(renderer.domElement.style, {opacity: 1, duration: 1}, startTime);
}

anim();
gsapInit();

