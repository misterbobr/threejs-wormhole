import gsap from 'gsap';
import * as THREE from 'three';
import { Clock } from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
const { createNoise3D } = require('simplex-noise');
import { randFloat, randInt } from 'three/src/math/mathutils';

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 0.01, 1000 );
camera.position.x = 0;
camera.position.y = 0;
camera.position.z = 5;

const renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0);
document.body.appendChild(renderer.domElement);
renderer.domElement.style.opacity = 0;

window.addEventListener('resize', () =>
{
    // camera.aspect = window.innerWidth / window.innerHeight;
    // camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
})

// let camY = 0;
// window.addEventListener('wheel', (e) => 
// {
//     camY = e.deltaY * 0.002;
// })

// let r = 40;
// let g = 10;
// let b = 90;
// let color = new THREE.Color(`rgb(${r}%, ${g}%, ${b}%)`);
// for (let i = 0; i < 100; i++) {   
//     let gm = new THREE.RingGeometry(9.9, 10, 20, 1);
//     let mat = new THREE.MeshBasicMaterial({ color: color, side: THREE.DoubleSide });
//     let circle = new THREE.Mesh(gm, mat);
//     circle.position.z = i * -0.5;
//     scene.add(circle);
//     let dr = randInt(-2, 2), dg = randInt(-1, 1), db = randInt(-4, 4);
//     console.log(dr, dg, db)
//     r = (r + dr > 65) ? r - dr : (r + dr <  10 ? r - dr : r + dr);
//     g = (g + dg > 40) ? g - dg : (g + dg <  0 ? g - dg : g + dg);
//     b = (b + db > 100) ? b - db : (b + db <  40 ? b - db : b + db);
//     color = new THREE.Color(`rgb(${r}%, ${g}%, ${b}%)`);
//     console.log(dr, dg, db)
//     console.log(r, g, b)
// }

// const   space_length        = 1000,
//         wormhole_length     = 400,
//         space_velocity      = 3 * 0.001,
//         space_rotation      = -2 * 0.0001,
//         wormhole_rotation   = 1 * 0.001,
//         wormhole_velocity   = 5 * 0.001,
//         wormhole_freq       = 6;

const   space_length        = 1000,
        wormhole_length     = 600,
        space_velocity      = 15 * 0.001,
        space_rotation      = -10 * 0.0001,
        wormhole_rotation   = 15 * 0.001,
        wormhole_velocity   = 15 * 0.001,
        wormhole_freq       = 6;

const loader = new THREE.TextureLoader();

const background = loader.load('./image/space2.jpg', function ( texture ) {

    // texture.wrapT = THREE.MirroredRepeatWrapping;
    // texture.wrapS = THREE.MirroredRepeatWrapping;
    // texture.offset.set( 0, 0 );
    // texture.repeat.set( 2, 8 );

})

const spaceTexture = loader.load('./image/space2.jpg', function ( texture ) {

    texture.wrapT = THREE.MirroredRepeatWrapping;
    texture.wrapS = THREE.MirroredRepeatWrapping;
    texture.offset.set( 0, 0 );
    texture.repeat.set( 2, Math.round(space_length / 40) );

})

const alphaMap = loader.load('./image/alpha-map.jpg', function ( texture ) {
    texture.wrapS = texture.wrapT = THREE.MirroredRepeatWrapping;
    texture.offset.set( 0, 0 );
    texture.repeat.set( 1, wormhole_freq );
})

// texture.wrapS = THREE.MirroredRepeatWrapping
// texture.wrapT = THREE.MirroredRepeatWrapping

const gmPlane = new THREE.PlaneGeometry(70, 70);
const matPlane = new THREE.MeshBasicMaterial({ map: background, transparent: true, opacity: 0.7 });
const plane = new THREE.Mesh(gmPlane, matPlane);
plane.rotateZ(Math.PI / 2);
plane.position.z = -space_length * 0.5;
scene.add(plane);

const gmWh = new THREE.CylinderGeometry(15, 15, wormhole_length, 60, 100, true);
const matWh = new THREE.MeshBasicMaterial({ color: 0x3399cc, side: THREE.DoubleSide, transparent: true, alphaMap: alphaMap, wireframe: true, opacity: 0.7 });
const Wh = new THREE.Mesh(gmWh, matWh);
Wh.rotateX(Math.PI * 0.5);
// cyl.position.z = -wormhole_length * 0.2;
scene.add(Wh);

const gmSp = new THREE.CylinderGeometry(20, 20, space_length, 60, 1, true);
const matSp = new THREE.MeshBasicMaterial({ map: spaceTexture, side: THREE.BackSide, wireframe: false });
// const matSp = new THREE.MeshStandardMaterial({ map: spaceTexture, side: THREE.BackSide, wireframe: false });
const Sp = new THREE.Mesh(gmSp, matSp);
Sp.rotateX(Math.PI * 0.5);
// cyl2.position.z = -160;
scene.add(Sp);

const gmStar = new THREE.SphereGeometry(0.05, 15, 15);
const matStar = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide, transparent: true, opacity: 0 });
const stars = Array(250).fill(0);
for (let n = 0; n < stars.length; n++) {
    stars[n] = new THREE.Mesh(gmStar, matStar);
    stars[n].position.set(randFloat(-15, 15), randFloat(-15, 15), randFloat(-150, 150));
    scene.add(stars[n]);
}

const noise = createNoise3D();

const pLight = new THREE.PointLight(0xffffff, 0, space_length);
// pLight.position.set(0, 0, 0);
// pLight.target.position.set(0, 0, -10);
scene.add(pLight);
// const helper = new THREE.SpotLightHelper(pLight, 0xff0000);
// scene.add(helper);

const controls = new OrbitControls( camera, renderer.domElement );
// var c = 0;
const c = new Clock();
function anim() {
    // console.log("========================================")
    // console.log(c)
    // console.log("========================================")
    // camera.position.y += camY;
    // camY *= 0.92;
    
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

    // for ( let k = 0; k < position2.count; k++ ) {
    //     v2.fromBufferAttribute( position2, k );
    //     let y2_ = v2.y;
    //     let dist2 = Math.hypot(v2.y, cyl2.geometry.parameters.radiusTop);
    //     v2.normalize();
    //     let d2 = dist2 + noise(
    //         v2.x + time,
    //         v2.y + time,
    //         v2.z + time) * 0.5;
    //     position2.setXYZ(k, v2.x * d2, y2_, v2.z * d2);
    // }

    alphaMap.offset.y -= wormhole_velocity
    spaceTexture.offset.y -= space_velocity
    Wh.geometry.verticesNeedUpdate = true;
    Wh.geometry.attributes.position.needsUpdate = true;
    Wh.geometry.normalsNeedUpdate = true;
    // Sp.geometry.verticesNeedUpdate = true;
    // Sp.geometry.attributes.position.needsUpdate = true;
    // Sp.geometry.normalsNeedUpdate = true;
    Wh.rotateY(wormhole_rotation);
    Sp.rotateY(space_rotation);
    // camera.position.z -= 0.3
    // cyl.position.z -= 0.3
    stars.forEach((star) => {
        if (Math.abs(star.position.z - camera.position.z) < 150) {
            star.position.z += 0.1;
        }
        else if (scene.children.includes(star)) {
            star.position.z = -150 + camera.position.z + 1;
        }
    })
    // console.log(stars[0].position.z - camera.position.z)
    requestAnimationFrame(anim);
    renderer.render(scene, camera);
    // console.log(noise(0.00001 * t, 0.00003 * t, 0.00005 * t));
}

function gsapInit() {
    gsap.to(pLight, {intensity: 1, duration: 5});
    gsap.to(renderer.domElement.style, {opacity: 1, duration: 3}, 1);
    gsap.to(matStar, {opacity: 0.8, duration: 3});
}

anim();
gsapInit();

