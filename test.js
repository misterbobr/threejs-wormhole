import gsap from 'gsap';
import * as THREE from 'three';
import { Clock } from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
const { createNoise3D } = require('simplex-noise');
import * as dat from 'dat.gui';
import { randFloat, randInt } from 'three/src/math/mathutils';

const gui = new dat.GUI();
const scene = new THREE.Scene();

const renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0);
document.body.appendChild(renderer.domElement);
renderer.domElement.style.opacity = 1;

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
})


// const   space_length        = 1000,
//         wormhole_length     = 400,
//         space_velocity      = 3 * 0.001,
//         space_rotation      = -2 * 0.0001,
//         wormhole_rotation   = 1 * 0.001,
//         wormhole_velocity   = 5 * 0.001,
//         wormhole_freq       = 6;

const   space_length        = 1000
        // wormhole_length     = 1000,
        // space_velocity      = 8 * 0.001,
        // space_rotation      = -10 * 0.0001,
        // wormhole_rotation   = 15 * 0.001,
        // wormhole_velocity   = 8 * 0.001,
        // wormhole_freq       = 6,
        // star_density        = 400,
        // star_size           = 2;

const camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 0.01, 2000 );
camera.position.x = 0;
camera.position.y = 500;
camera.position.z = 300;

const loader = new THREE.TextureLoader();

const background = loader.load('./image/stars_milky_way.jpg', function ( background ) {
    background.wrapT = THREE.MirroredRepeatWrapping;
    background.wrapS = THREE.MirroredRepeatWrapping;
    background.offset.set( 0, 0 );
    background.repeat.set( 1, 1 );
    background.anisotropy = renderer.capabilities.getMaxAnisotropy();
})

// const spaceTexture = loader.load('./image/space2.jpg', function ( texture ) {
//     texture.wrapT = THREE.MirroredRepeatWrapping;
//     texture.wrapS = THREE.MirroredRepeatWrapping;
//     texture.offset.set( 0, 0 );
//     texture.repeat.set( 2, Math.round(space_length / 40) );
//     texture.anisotropy = renderer.capabilities.getMaxAnisotropy() / 2;
// })

// const whAlphaMap = loader.load('./image/alpha-map.jpg', function ( whAlphaMap ) {
//     whAlphaMap.wrapS = whAlphaMap.wrapT = THREE.MirroredRepeatWrapping;
//     whAlphaMap.offset.set( 0, 0 );
//     whAlphaMap.repeat.set( 1, 3 );
// })

// const spAlphaMap = loader.load('./image/alpha-map2.jpg')

const sunTexture = loader.load('./image/sun.jpg', function ( sun ) {
    sun.anisotropy = renderer.capabilities.getMaxAnisotropy();
});

const mercuryTexture = loader.load('./image/mercury.jpg');
const venusTexture = loader.load('./image/venus.jpg');
const venusAtmosphereTexture = loader.load('./image/venus_atmosphere.jpg', function ( atm ) {
    atm.anisotropy = renderer.capabilities.getMaxAnisotropy() / 2;
});
const venusAtmosphereAlpha = loader.load('./image/venus_atmosphere_alpha_map.jpg');
const earthDayTexture = loader.load('./image/earth_day.jpg', function ( day ) {
    day.offset.set( 0.2, 0.1 );
});
const earthNightTexture = loader.load('./image/earth_night.jpg', function ( night ) {
    // night.offset.set( 0.5, 0.5 );
});
const uranusTexture = loader.load('./image/uranus.jpg');
const uranusRingTexture = loader.load('./image/uranus_ring_alpha_polar.png');

const planetsGroup      = new THREE.Group();
const mercuryOrbit      = new THREE.Group();
const venusOrbit        = new THREE.Group();
const earthOrbit        = new THREE.Group();
const marsOrbit         = new THREE.Group();
const jupiterOrbit      = new THREE.Group();
const saturnOrbit       = new THREE.Group();
const saturnRingOrbit   = new THREE.Group();
const uranusOrbit       = new THREE.Group();
const uranusRingOrbit   = new THREE.Group();
const neptuneOrbit      = new THREE.Group();
planetsGroup.add(
    mercuryOrbit,
    venusOrbit,
    earthOrbit,
    marsOrbit,
    jupiterOrbit,
    saturnOrbit,
    saturnRingOrbit,
    uranusOrbit,
    uranusRingOrbit,
    neptuneOrbit
);

const gmBack = new THREE.SphereGeometry(space_length * 1.1, 100, 100, 1, Math.PI * 2);
const matBack = new THREE.MeshBasicMaterial({ map: background, side: THREE.BackSide, transparent: true, opacity: 1 });
const backgr = new THREE.Mesh(gmBack, matBack);
// backgr.rotateZ(-1);
// backgr.position.z = -space_length * 0.9;
scene.add(backgr);

const planets = {};

const gmSun = new THREE.SphereGeometry(20, 80, 60);
const matSun = new THREE.MeshBasicMaterial({ side: THREE.FrontSide, map: sunTexture, transparent: true, opacity: 1 });
planets['sun'] = new THREE.Mesh(gmSun, matSun);
planets['sun'].position.set(0, 0, 0);
scene.add(planets['sun']);

planetsGroup.position.copy(planets['sun'].position);

const gmMercury = new THREE.SphereGeometry(2, 32, 16);
const matMercury = new THREE.MeshStandardMaterial({ side: THREE.FrontSide, map: mercuryTexture, transparent: true, opacity: 1 });
planets['mercury'] = new THREE.Mesh(gmMercury, matMercury);
mercuryOrbit.add(planets['mercury']);

const gmVenus = new THREE.SphereGeometry(3.8, 32, 36);
const matVenus = new THREE.MeshStandardMaterial({ side: THREE.FrontSide, map: venusTexture, transparent: true, opacity: 1 });
planets['venus'] = new THREE.Mesh(gmVenus, matVenus);
venusOrbit.add(planets['venus']);

const gmVenusAtmosphere = new THREE.SphereGeometry(4.2, 32, 32);
const matVenusAtmosphere = new THREE.MeshStandardMaterial({ side: THREE.FrontSide, map: venusAtmosphereTexture, transparent: true, alphaMap: venusAtmosphereAlpha, opacity: 1 });
planets['venusAtmosphere'] = new THREE.Mesh(gmVenusAtmosphere, matVenusAtmosphere);
venusOrbit.add(planets['venusAtmosphere']);

const earthPosition = new THREE.Vector3(100, 0, 100);
const zVect = new THREE.Vector3(0, 0, -1);
const earthShader = {
    dayTexture: {
        value: earthDayTexture
    },
    nightTexture: {
        value: earthNightTexture
    },
    angle: {
        type: 'f',
        value: zVect.angleTo(earthPosition) * (earthPosition.x < 0 ? -1 : 1)
    },
    rotY: {
        type: 'f',
        value: -2 * Math.PI
    },
    tilt: {
        type: 'f',
        value: 0.5
    }
}

// const folder = gui.addFolder('vars');
// folder.add(earthShader.tilt, 'value', 0, 1);
// folder.open();
// console.log(new THREE.Vector3(0, 0, -1).angleTo(earthPosition) * (earthPosition.x < 0 ? -1 : 1))

const gmEarth = new THREE.SphereGeometry(4, 32, 36);
// const matEarth = new THREE.MeshStandardMaterial({ side: THREE.FrontSide, map: earthDayTexture, transparent: true, opacity: 1 });
function uv_translation(u, v, du, dv) {
    if (v + dv > 1) {
        u = (u + 0.5 > 1) ? u - 0.5 : u + 0.5;
    };
    u = (u + du > 1)
        ? u + du - 1
        : ((u + du < 0)
        ? u + du + 1
        : u + du);
    v = (v + dv > 1)
    ? 2 - v - dv
    : ((v + dv < 0)
    ? -v - dv
    : v + dv);
    return new THREE.Vector2(u, v);
}
// console.log(uv_translation(0.6, 0.85, -0.7, 0.25))

const matEarth = new THREE.ShaderMaterial({
    uniforms: earthShader,
    vertexShader: `
        out vec2 vUv;
        void main() {
            vUv = uv;
            gl_Position =   projectionMatrix * 
                            modelViewMatrix * 
                            vec4(position,1.0);
        }`,
    fragmentShader: `
        uniform sampler2D dayTexture;
        uniform sampler2D nightTexture;
        uniform float angle;
        uniform float rotY;
        uniform float tilt;

        in vec2 vUv;

        // vec2 rotateUV(vec2 uv, vec2 pivot, float rotation) {
        //     float cosa = cos(rotation);
        //     float sina = sin(rotation);
        //     uv -= pivot;
        //     return vec2(
        //         cosa * uv.x - sina * uv.y,
        //         cosa * uv.y + sina * uv.x 
        //     ) + pivot;
        // }

        float addLight(vec2 vUv_) {
            float result = min(1.1, max(-0.1, (-sin(vUv_.x * ${Math.PI * 2} + angle + rotY) + 1.0) * 1.8 / 2.0 * (cos((vUv_.y - tilt / ${Math.PI}) * ${Math.PI / 2}) + 0.7) / 1.5));
            return result;
            // return (-sin(vUv.x * ${Math.PI * 2} + angle) + 1.0) / 2.0;
            // return -sin(vUv.y * ${Math.PI / 2}) + 0.5) / 2.0;
        }

        void main() {
            // vec2 pivot = vec2(0.5, 0.5);
            // vec2 vUv_tilt = rotateUV(vUv, pivot, 0.4);
            vec4 t0 = texture(dayTexture, vUv);
            vec4 t1 = texture(nightTexture, vUv);
            gl_FragColor = mix(t0, t1, addLight(vUv));
            // gl_FragColor = mix(t0, t1, (-sin(vUv.x * ${Math.PI * 2} + angle) + 1.0) / 2.0 * (cos((vUv.y - tilt) * ${Math.PI / 2}) + 0.7) / 1.5);
            // gl_FragColor = mix(t0, t1, (-sin(vUv.x * ${Math.PI * 2} + angle) + 1.0) / 2.0 * (cos((vUv.y - 0.2) * ${Math.PI / 2}) + 0.7) / 1.5);
            // gl_FragColor = texture2D(dayTexture, vUv);
        }
    `
});
planets['earth'] = new THREE.Mesh(gmEarth, matEarth);
planets['earth'].rotateX(Math.PI / 2 * 24 / 90);
earthOrbit.add(planets['earth']);

const gmUranus = new THREE.SphereGeometry(8, 60, 40);
const matUranus = new THREE.MeshStandardMaterial({ side: THREE.FrontSide, map: uranusTexture, transparent: true, opacity: 1 });
planets['uranus'] = new THREE.Mesh(gmUranus, matUranus);
planets['uranus'].rotateY(Math.PI / 2);
planets['uranus'].rotateX(Math.PI / 2 * 98 / 90);
uranusOrbit.add(planets['uranus']);

const gmUranusRing = new THREE.RingGeometry(16, 23, 64);
const matUranusRing = new THREE.MeshStandardMaterial({ side: THREE.DoubleSide, transparent: true, map: uranusRingTexture, opacity: 1 });
planets['uranusRing'] = new THREE.Mesh(gmUranusRing, matUranusRing);
uranusRingOrbit.rotateY(Math.PI / 2);
uranusRingOrbit.rotateX(Math.PI / 2 * 8 / 90);
uranusRingOrbit.add(planets['uranusRing']);
uranusOrbit.add(uranusRingOrbit);


scene.add(planetsGroup);

// const gmSp = new THREE.CylinderGeometry(22, 22, space_length, 60, 1, true);
// const matSp = new THREE.MeshBasicMaterial({ map: spaceTexture, side: THREE.BackSide, wireframe: false, transparent: true, alphaMap: spAlphaMap, opacity: 0});
// // const matSp = new THREE.MeshStandardMaterial({ map: spaceTexture, side: THREE.BackSide, wireframe: false });
// const Sp = new THREE.Mesh(gmSp, matSp);
// Sp.rotateX(Math.PI * 0.5);
// Sp.position.z = -space_length * 0.45;
// scene.add(Sp);

// const gmWh = new THREE.CylinderGeometry(15, 15, wormhole_length, 60, 100, true);
// const matWh = new THREE.MeshBasicMaterial({ color: 0x3399cc, side: THREE.DoubleSide, wireframe: true, transparent: true, alphaMap: whAlphaMap, opacity: 0 });
// const Wh = new THREE.Mesh(gmWh, matWh);
// Wh.rotateX(Math.PI * 0.5);
// Wh.position.z = -wormhole_length * 0.45;
// scene.add(Wh);

// const gmStar = new THREE.SphereGeometry(star_size * 0.01, 15, 15);
// const matStar = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide, transparent: true, opacity: 0 });
// const stars = Array(star_density).fill(0);
// for (let n = 0; n < stars.length; n++) {
//     stars[n] = new THREE.Mesh(gmStar, matStar);
//     stars[n].position.set(randFloat(-15, 15), randFloat(-15, 15), randFloat(-150, 0));
//     scene.add(stars[n]);
// }

const pLight = new THREE.PointLight(0xffffff, 1);
pLight.position.copy(planets['sun'].position);
pLight.position.set(0, 0, 0);
// pLight.target.position.set(0, 0, -10);
planetsGroup.add(pLight);
// const helper = new THREE.SpotLightHelper(pLight, 0xff0000);
// scene.add(helper);
let flag = true;
const controls = new OrbitControls( camera, renderer.domElement );
const clock = new Clock();

// window.addEventListener('mousemove', (e) => {
//     let point = new THREE.Vector3;
//     point.copy(camera.position);
//     let cam_dx = (e.clientX - window.innerWidth / 2) / window.innerWidth / 2,
//     cam_dy = (e.clientY - window.innerHeight / 2) / window.innerHeight / 2;
//     point.z -= 1;
//     point.x += cam_dx;
//     point.y -= cam_dy;
//     camera.lookAt(point);
// })

const noise = createNoise3D();

const revolveSpeed = 10;
function rotateOrbit(orbit, start, time) {
    let bias = Math.atan2(start.z, start.x);
    // let biasY = Math.acos(start.y / start.length());
    orbit.position.x = start.length() * -Math.cos((time + bias / revolveSpeed * start.length()) * revolveSpeed / start.length());
    orbit.position.z = start.length() * Math.sin((time + bias / revolveSpeed * start.length()) * revolveSpeed / start.length());
    // console.log(start.x, start.z);
    // console.log(bias);
}

function rotatePlanet(planet, rotSpeed) {
    planet.rotateOnAxis(new THREE.Vector3(0, 1, 0), rotSpeed);
}

const       mercuryStart = new THREE.Vector3(50, 0, 0),
            venusStart = new THREE.Vector3(-70, 0, 70),
            earthStart = new THREE.Vector3().copy(earthPosition),
            marsStart = new THREE.Vector3(),
            jupiterStart = new THREE.Vector3(),
            saturnStart = new THREE.Vector3(),
            uranusStart = new THREE.Vector3(-180, 0, 150),
            neptuneStart = new THREE.Vector3();

// console.log(planets.uranusRing.worldToLocal(new THREE.Vector3(0, 1, 0)))
// const arrowHelper = new THREE.ArrowHelper( planets.uranusRing.worldToLocal(new THREE.Vector3(0, 1, 0)), uranusStart, 100, 0xff0000 );
// scene.add( arrowHelper );

mercuryOrbit.position.copy(mercuryStart);
venusOrbit.position.copy(venusStart);
earthOrbit.position.copy(earthStart);
uranusOrbit.position.copy(uranusStart);
// planets['uranus'].position.copy(uranusStart);
// planets['uranusRing'].position.copy(uranusStart);

const rotSpeed = 2;
const       mercuryRot  = 0.01 * rotSpeed,
            venusRot    = -0.001 * rotSpeed,
            earthRot    = 0.01 * rotSpeed,
            uranusRot   = -0.005 * rotSpeed,
            uranusRingRot   = -0.0002 * rotSpeed;

function anim() {
    let time = clock.getElapsedTime();
    // console.log(earthOrbit.position)
    // console.log(uranusOrbit.position)
    // const position = Wh.geometry.attributes.position;
    // const position2 = cyl2.geometry.attributes.position;
    // const v = new THREE.Vector3();
    // const v2 = new THREE.Vector3();
    // let time = performance.now() * 0.0003;
    // for ( let k = 0; k < position.count; k++ ) {

    //     v.fromBufferAttribute( position, k );
    //     let y_ = v.y;
    //     let dist = Math.hypot(v.y, Wh.geometry.parameters.radiusTop);
    //     v.normalize();
    //     let d = dist + noise(
    //         v.x + time,
    //         v.y + time,
    //         v.z + time) * 0.8;
    //     position.setXYZ(k, v.x * d, y_, v.z * d);
    // }

    // whAlphaMap.offset.y -= wormhole_velocity
    // spaceTexture.offset.y -= space_velocity
    // spAlphaMap.offset.y += space_velocity
    // Wh.geometry.verticesNeedUpdate = true;
    // Wh.geometry.attributes.position.needsUpdate = true;
    // Wh.geometry.normalsNeedUpdate = true;
    // Wh.rotateY(wormhole_rotation);
    // Sp.rotateY(space_rotation);

    earthPosition.copy(earthOrbit.position);
    earthShader.angle.value = zVect.angleTo(earthPosition) * (earthPosition.x < 0 ? -1 : 1);
    earthShader.tilt.value = (Math.sin(Math.atan2(earthPosition.z, earthPosition.x)) + 1) / 2;
    
    earthShader.rotY.value = (earthShader.rotY.value + earthRot > Math.PI * 2)
                            ? -2 * Math.PI
                            : earthShader.rotY.value + earthRot;
    rotateOrbit(mercuryOrbit, mercuryStart, time);
    rotateOrbit(venusOrbit, venusStart, time);
    rotateOrbit(earthOrbit, earthStart, time);
    rotateOrbit(uranusOrbit, uranusStart, time);
    rotatePlanet(planets['mercury'], mercuryRot);
    rotatePlanet(planets['venus'], venusRot);
    rotatePlanet(planets['venusAtmosphere'], venusRot);
    rotatePlanet(planets['earth'], earthRot);
    rotatePlanet(planets['uranus'], uranusRot);
    planets['venusAtmosphere'].rotateOnAxis(new THREE.Vector3(-1, 1, 1).normalize(), 0.001);
    uranusRingOrbit.rotateOnAxis(new THREE.Vector3(0, 0, 1), 0.003);
    // planetsGroup.rotateY(0.001);
    // planets['uranusRing'].rotateZ(0.001)

    requestAnimationFrame(anim);
    renderer.render(scene, camera);
}

anim();
