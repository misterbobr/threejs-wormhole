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
// renderer.shadowMap.enabled = true;
// renderer.shadowMap.type = THREE.PCFSoftShadowMap;
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
    // console.log(camZ);
});

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
        star_size           = 2,
        camera_pos          = new THREE.Vector3(0, 300, 400);

const camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 0.01, 2000 );

let controls = null;
camera.position.x = 0;
camera.position.y = 0;
camera.position.z = -space_length * 1.8;

const loader = new THREE.TextureLoader();

const background = loader.load('./image/stars_milky_way.jpg', function ( background ) {
    background.wrapT = THREE.MirroredRepeatWrapping;
    background.wrapS = THREE.MirroredRepeatWrapping;
    background.offset.set( 0, 0 );
    background.repeat.set( 1, 1 );
    background.anisotropy = renderer.capabilities.getMaxAnisotropy();
});

const spaceTexture = loader.load('./image/space2.jpg', function ( texture ) {

    texture.wrapT = THREE.MirroredRepeatWrapping;
    texture.wrapS = THREE.MirroredRepeatWrapping;
    texture.offset.set( 0, 0 );
    texture.repeat.set( 2, Math.round(space_length / 40) );
    texture.anisotropy = 8;
});

const whAlphaMap = loader.load('./image/alpha-map.jpg', function ( whAlphaMap ) {
    whAlphaMap.wrapS = whAlphaMap.wrapT = THREE.MirroredRepeatWrapping;
    whAlphaMap.offset.set( 0, 0 );
    whAlphaMap.repeat.set( 1, 3 );
});

const spAlphaMap = loader.load('./image/alpha-map2.jpg', function ( map ) {

});

const sunTexture = loader.load('./image/sun.jpg', function ( sun ) {
    sun.anisotropy = renderer.capabilities.getMaxAnisotropy();
});
const mercuryTexture = loader.load('./image/mercury.jpg');
const venusTexture = loader.load('./image/venus.jpg');
const venusAtmosphereTexture = loader.load('./image/venus_atmosphere.jpg', function ( atm ) {
    atm.anisotropy = renderer.capabilities.getMaxAnisotropy() / 2;
});
const venusAtmosphereAlpha = loader.load('./image/venus_atmosphere_alpha_map.jpg');
const earthDayTexture = loader.load('./image/earth_day.jpg');
const earthNightTexture = loader.load('./image/earth_night.jpg');
const earthCloudsTexture = loader.load('./image/4k_earth_clouds.jpg');
const earthCloudsNormal = loader.load('./image/4k_earth_clouds_normal.png');
const earthCloudsSpecular = loader.load('./image/4k_earth_clouds_specular.png');
const earthCloudsAmbient = loader.load('./image/4k_earth_clouds_ao.png');
const marsTexture = loader.load('./image/mars.jpg');
const jupiterTexture = loader.load('./image/jupiter.jpg');
const saturnTexture = loader.load('./image/saturn.jpg');
const saturnRingTexture = loader.load('./image/saturn_ring_alpha_polar.png');
const uranusTexture = loader.load('./image/uranus.jpg');
const uranusRingTexture = loader.load('./image/uranus_ring_alpha_polar.png');
const neptuneTexture = loader.load('./image/neptune.jpg');
const buttonTexture = loader.load('./image/button.png');
const buttonPressedTexture = loader.load('./image/button_press.png');

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
    uranusOrbit,
    neptuneOrbit
);
planetsGroup.position.z = -space_length * 0.9;
let planets = {};

const raycaster = new THREE.Raycaster()

const gmBtn = new THREE.RingGeometry(0, 10, 100);
const matBtn = new THREE.MeshBasicMaterial({ side: THREE.FrontSide, transparent: true, map: buttonTexture, opacity: 0.7 });
const btn = new THREE.Mesh(gmBtn, matBtn);
btn.position.copy(camera.position);
btn.position.z -= 20;
scene.add(btn);

const matBtnPressed = new THREE.MeshBasicMaterial({ side: THREE.FrontSide, transparent: true, map: buttonPressedTexture, opacity: 0 });
const btnPressed = new THREE.Mesh(gmBtn, matBtnPressed);
btnPressed.position.copy(camera.position);
btnPressed.position.z -= 20;
scene.add(btnPressed);

const gmBack = new THREE.SphereGeometry(space_length * 1.1, 100, 100, 1, Math.PI * 2);
const matBack = new THREE.MeshBasicMaterial({ map: background, side: THREE.BackSide, transparent: true, opacity: 0 });
const backgr = new THREE.Mesh(gmBack, matBack);
backgr.rotateZ(-1);
// backgr.position.z = -space_length * 0.9;
scene.add(backgr);

const gmSp = new THREE.CylinderGeometry(22, 22, space_length, 60, 1, true);
const matSp = new THREE.MeshBasicMaterial({ map: spaceTexture, side: THREE.BackSide, wireframe: false, transparent: true, alphaMap: spAlphaMap, opacity: 0});
// const matSp = new THREE.MeshStandardMaterial({ map: spaceTexture, side: THREE.BackSide, wireframe: false });
const Sp = new THREE.Mesh(gmSp, matSp);
Sp.rotateX(Math.PI * 0.5);
Sp.position.z = -space_length * 1.45;
scene.add(Sp);

const gmWh = new THREE.CylinderGeometry(15, 15, wormhole_length, 60, 100, true);
const matWh = new THREE.MeshBasicMaterial({ color: 0x3399cc, side: THREE.DoubleSide, wireframe: true, transparent: true, alphaMap: whAlphaMap, opacity: 0 });
const Wh = new THREE.Mesh(gmWh, matWh);
Wh.rotateX(Math.PI * 0.5);
Wh.position.z = -wormhole_length * 1.45;
scene.add(Wh);

const gmStar = new THREE.SphereGeometry(star_size * 0.01, 15, 15);
const matStar = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide, transparent: true, opacity: 0 });
const stars = Array(star_density).fill(0);
for (let n = 0; n < stars.length; n++) {
    stars[n] = new THREE.Mesh(gmStar, matStar);
    stars[n].position.set(randFloat(-15, 15), randFloat(-15, 15), randFloat(-150, 0));
    scene.add(stars[n]);
}

const gmSun = new THREE.SphereGeometry(25, 80, 60);
const matSun = new THREE.MeshBasicMaterial({ side: THREE.FrontSide, map: sunTexture, transparent: true, opacity: 1 });
planets['sun'] = new THREE.Mesh(gmSun, matSun);
planets['sun'].position.copy(backgr.position);
planetsGroup.add(planets['sun']);

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

// const earthPosition = new THREE.Vector3(0, 0, -40);
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
        value: 0
    },
    tilt: {
        type: 'f',
        value: 0.0
    },
    opacity: {
        type: 'f',
        value: 1.0
    }
}

// const folder = gui.addFolder('vars');
// folder.add(earthShader.tilt, 'value', 0, 1);
// folder.open();
// console.log(new THREE.Vector3(0, 0, -1).angleTo(earthPosition) * (earthPosition.x < 0 ? -1 : 1))

const gmEarth = new THREE.SphereGeometry(4, 100, 100);
// const matEarth = new THREE.MeshStandardMaterial({ side: THREE.FrontSide, map: earthDayTexture, transparent: true, opacity: 1 });
// function uv_translation(u, v, du, dv) {
//     if (v + dv > 1) {
//         u = (u + 0.5 > 1) ? u - 0.5 : u + 0.5;
//     };
//     u = (u + du > 1)
//         ? u + du - 1
//         : ((u + du < 0)
//         ? u + du + 1
//         : u + du);
//     v = (v + dv > 1)
//     ? 2 - v - dv
//     : ((v + dv < 0)
//     ? -v - dv
//     : v + dv);
//     return new THREE.Vector2(u, v);
// }

const matEarth = new THREE.ShaderMaterial({
    uniforms: earthShader,
    vertexShader: `
		out vec2 vUv;
		
		void main() {
			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
		}
	`,
    fragmentShader: `
        uniform sampler2D dayTexture;
        uniform sampler2D nightTexture;
        uniform float angle;
        uniform float rotY;
        uniform float tilt;
        uniform float opacity;

		in vec2 vUv;

        float addLight(vec2 vUv_) {
            float result = min(1.1, max(-0.1, (-sin(vUv_.x * ${Math.PI * 2} + angle + rotY) + 1.0) * 1.8 / 2.0 * (cos((vUv_.y - tilt / ${Math.PI}) * ${Math.PI / 2}) + 0.7) / 1.5));
            return result;
            // return (-sin(vUv.x * ${Math.PI * 2} + angle) + 1.0) / 2.0;
            // return -sin(vUv.y * ${Math.PI / 2}) + 0.5) / 2.0;
        }

        void main() {
            vec4 t0 = texture(dayTexture, vUv);
            vec4 t1 = texture(nightTexture, vUv);
            t0.a = opacity;
            t1.a = opacity;

            gl_FragColor = mix(t0, t1, addLight(vUv));
            // gl_FragColor = texture2D(dayTexture, vUv);
        }
    `,
    transparent: true,
});
planets['earth'] = new THREE.Mesh(gmEarth, matEarth);
planets['earth'].rotateX(Math.PI / 2 * 24 / 90);
earthOrbit.add(planets['earth']);

const gmEarthAtmosphere = new THREE.SphereGeometry(4, 32, 36);
const matEarthAtmosphere = new THREE.MeshPhongMaterial({ side: THREE.FrontSide, map: earthCloudsTexture, transparent: true, 
        alphaMap: earthCloudsTexture, normalMap: earthCloudsNormal, specular: earthCloudsSpecular, aoMap: earthCloudsAmbient  });
planets['earthAtmosphere'] = new THREE.Mesh(gmEarthAtmosphere, matEarthAtmosphere);
planets['earthAtmosphere'].scale.multiplyScalar(1.01);
planets['earthAtmosphere'].rotateX(Math.PI / 2 * 24 / 90);
earthOrbit.add(planets['earthAtmosphere']);

const gmMars = new THREE.SphereGeometry(3, 40, 32);
const matMars = new THREE.MeshStandardMaterial({ side: THREE.FrontSide, map: marsTexture, transparent: true, opacity: 1 });
planets['mars'] = new THREE.Mesh(gmMars, matMars);
marsOrbit.add(planets['mars']);

const gmJupiter = new THREE.SphereGeometry(13, 80, 60);
const matJupiter = new THREE.MeshStandardMaterial({ side: THREE.FrontSide, map: jupiterTexture, transparent: true, opacity: 1 });
planets['jupiter'] = new THREE.Mesh(gmJupiter, matJupiter);
jupiterOrbit.add(planets['jupiter']);

const gmSaturn = new THREE.SphereGeometry(12, 80, 60);
const matSaturn = new THREE.MeshStandardMaterial({ side: THREE.FrontSide, map: saturnTexture, transparent: true, opacity: 1 });
planets['saturn'] = new THREE.Mesh(gmSaturn, matSaturn);
saturnOrbit.add(planets['saturn']);

const gmSaturnRing = new THREE.RingGeometry(13.5, 24, 64);
const matSaturnRing = new THREE.MeshStandardMaterial({ side: THREE.DoubleSide, map: saturnRingTexture, transparent: true, opacity: 1 });
planets['saturnRing'] = new THREE.Mesh(gmSaturnRing, matSaturnRing);
saturnRingOrbit.rotateX(Math.PI / 2 * 100 / 90);
saturnRingOrbit.add(planets['saturnRing']);
saturnOrbit.add(saturnRingOrbit);

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

const gmNeptune = new THREE.SphereGeometry(8, 60, 40);
const matNeptune = new THREE.MeshStandardMaterial({ side: THREE.FrontSide, map: neptuneTexture, transparent: true, opacity: 1 });
planets['neptune'] = new THREE.Mesh(gmNeptune, matNeptune);
neptuneOrbit.add(planets['neptune']);

scene.add(planetsGroup);
planetsGroup.visible = false;

const pLight = new THREE.PointLight(0xffffff, 1);
pLight.position.copy(planets['sun'].position);
pLight.castShadow = true;
planetsGroup.add(pLight);

const earthLight = new THREE.SpotLight(0xffffff, 5, 20, 0.4, 0);
earthLight.position.copy(earthOrbit.localToWorld(new THREE.Vector3(5 * Math.sin(earthShader.angle.value + earthShader.rotY.value), 0, 5 * Math.cos(earthShader.angle.value + earthShader.rotY.value))));
earthLight.target = planets['earth'];
// const helper = new THREE.SpotLightHelper(earthLight, 0xff0000);
scene.add(earthLight);

const aLight = new THREE.AmbientLight(0xffffff, 0.05);
scene.add(aLight);

let flag = true;
let btnActive = {
    value: 0
}

const mouse = new THREE.Vector2();

window.addEventListener('mousemove', (e) => {
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

    // if (!flag) {
    //     let point = new THREE.Vector3;
    //     point.copy(camera.position);
    //     let cam_dx = (e.clientX - window.innerWidth / 2) / window.innerWidth / 2,
    //     cam_dy = (e.clientY - window.innerHeight / 2) / window.innerHeight / 2;
    //     point.z -= 1;
    //     point.x += cam_dx;
    //     point.y -= cam_dy;
    //     camera.lookAt(point);
    //     // console.log(e.clientX, e.clientY);
    // }
});


window.addEventListener('mousedown', (e) => {
    if (e.button === 0 && btnActive.value === 1 && raycaster.intersectObjects(scene.children)[1].object === btnPressed) {
        gsap.to(btnPressed.material, {opacity: 1, duration: 0.1});
    }
});

window.addEventListener('mouseup', (e) => {
    if (e.button === 0 && btnActive.value === 1 && raycaster.intersectObjects(scene.children)[1].object === btnPressed) {
        buttonTl2.play();
    }
});



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

const       mercuryStart = new THREE.Vector3(55, 0, 0).multiplyScalar(0.6),
            venusStart = new THREE.Vector3(-60, 0, 70).multiplyScalar(0.6),
            earthStart = new THREE.Vector3().copy(earthPosition).multiplyScalar(0.6),
            marsStart = new THREE.Vector3(130, 0, -150).multiplyScalar(0.6),
            jupiterStart = new THREE.Vector3(-220, 0, -300).multiplyScalar(0.6),
            saturnStart = new THREE.Vector3(150, 0, -520).multiplyScalar(0.6),
            uranusStart = new THREE.Vector3(-800, 0, 300).multiplyScalar(0.6),
            neptuneStart = new THREE.Vector3(700, 0, 700).multiplyScalar(0.6);

mercuryOrbit.position.copy(mercuryStart);
venusOrbit.position.copy(venusStart);
earthOrbit.position.copy(earthStart);
marsOrbit.position.copy(marsStart);
jupiterOrbit.position.copy(jupiterStart);
saturnOrbit.position.copy(saturnStart);
uranusOrbit.position.copy(uranusStart);
neptuneOrbit.position.copy(neptuneStart);

const rotSpeed = 2;
const       mercuryRot  = 0.0003 * rotSpeed,
            venusRot    = -0.00005 * rotSpeed,
            earthRot    = 0.003 * rotSpeed,
            marsRot    = 0.003 * rotSpeed,
            jupiterRot    = 0.005 * rotSpeed,
            saturnRot    = 0.004 * rotSpeed,
            uranusRot   = -0.0015 * rotSpeed,
            uranusRingRot   = -0.0002 * rotSpeed,
            neptuneRot   = 0.0015 * rotSpeed;

// const controls = new OrbitControls( camera, renderer.domElement );
const clock = new Clock();
const noise = createNoise3D();

function solarSystem () {
    let time = clock.getElapsedTime();
    earthLight.position.copy(earthOrbit.localToWorld(new THREE.Vector3(15 * Math.sin(-earthShader.angle.value), 0, 15 * Math.cos(-earthShader.angle.value))));
    
    earthShader.angle.value = zVect.angleTo(earthOrbit.position) * (earthOrbit.position.x < 0 ? -1 : 1);
    earthShader.rotY.value = (earthShader.rotY.value + earthRot > Math.PI * 2)
                            ? 0
                            : earthShader.rotY.value + earthRot;
                            
    rotateOrbit(mercuryOrbit, mercuryStart, time);
    rotateOrbit(venusOrbit, venusStart, time);
    rotateOrbit(earthOrbit, earthStart, time);
    rotateOrbit(marsOrbit, marsStart, time);
    rotateOrbit(jupiterOrbit, jupiterStart, time);
    rotateOrbit(saturnOrbit, saturnStart, time);
    rotateOrbit(uranusOrbit, uranusStart, time);
    rotateOrbit(neptuneOrbit, neptuneStart, time);
    rotatePlanet(planets['mercury'], mercuryRot);
    rotatePlanet(planets['venus'], venusRot);
    rotatePlanet(planets['venusAtmosphere'], venusRot);
    rotatePlanet(planets['earth'], earthRot);
    rotatePlanet(planets['earthAtmosphere'], earthRot * 1.05);
    rotatePlanet(planets['mars'], marsRot);
    rotatePlanet(planets['jupiter'], jupiterRot);
    rotatePlanet(planets['saturn'], saturnRot);
    rotatePlanet(planets['uranus'], uranusRot);
    rotatePlanet(planets['neptune'], neptuneRot);
    planets['venusAtmosphere'].rotateOnAxis(new THREE.Vector3(-0.5, 1.5, 1).normalize(), 0.001);
    planets['earthAtmosphere'].rotateOnAxis(new THREE.Vector3(0, 0, 1), earthRot * 0.1);
    uranusRingOrbit.rotateOnAxis(new THREE.Vector3(0, 0, 1), 0.003);
    saturnRingOrbit.rotateOnAxis(new THREE.Vector3(0, 0, 1), saturnRot);
}

function anim() {
    raycaster.setFromCamera( mouse, camera );
    const intersects = raycaster.intersectObjects( scene.children );

    if (btnActive.value === 0 && intersects[0]) {
        if (intersects[0].object === btn) {
            buttonTl1.play();
        }
    }
    else if (btnActive.value === 1 && intersects[1].object !== btnPressed) {
        buttonTl1.reverse();
    }

    if (flag) {
        // camera.position.z += camZ;
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

        if (camera.position.length() < space_length) {
            flag = false;
            gsap.to(renderer.domElement.style, {opacity: 0, duration: 0.5});
            gsap.to(camera.position, {x: camera_pos.x, y: camera_pos.y, z: camera_pos.z, duration: 0}, '>0');
            gsap.to(planetsGroup, {visible: true, duration: 0}, '<0');
            gsap.to(renderer.domElement.style, {opacity: 1, duration: 3}, '>6');
            // camera.lookAt(planetsGroup.position);
        }

        if (btnActive.value === 2 && !controls)
            controls = new OrbitControls(camera, renderer.domElement);

    }
    else {
        console.log(planetsGroup.position, backgr.position)
        scene.remove(Sp, Wh);
        stars.forEach((star) => {
            scene.remove(star);
        });
        if (!controls)
            controls = new OrbitControls(camera, renderer.domElement);
    }
    
    const position = Wh.geometry.attributes.position;
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
    console.log(btnActive.value)

    whAlphaMap.offset.y -= wormhole_velocity
    // spaceTexture.offset.y -= space_velocity
    // spAlphaMap.offset.y += space_velocity
    Wh.geometry.verticesNeedUpdate = true;
    Wh.geometry.attributes.position.needsUpdate = true;
    Wh.geometry.normalsNeedUpdate = true;
    Wh.rotateY(wormhole_rotation);
    Sp.rotateY(space_rotation);

    solarSystem();
    requestAnimationFrame(anim);
    renderer.render(scene, camera);
}

const buttonTl1 = gsap.timeline();
const buttonTl2 = gsap.timeline();
function gsapInit() {
    let startTime = 2;
    // const tlMain = gsap.timeline();
    // tlMain.to(matWh, {opacity: 0.8, duration: 0.5}, startTime)
    // .to(matWh, {opacity: 0, duration: 0.3}, '>0.5')
    // // .to(camera.position, {z: -800, duration: 0})
    // .to(whAlphaMap.repeat, {x: 1, y: wormhole_freq, duration: 1}, '<0')
    // .to(matWh, {opacity: 0.7, duration: 0.5}, '<2')
    // .to(matStar, {opacity: 0.8, duration: 2}, '<1')
    // .to(matSp, {opacity: 1, duration: 0.5}, '<0');
    // for (let k in planets) {
    //     tlMain.to(planets[k].material, {opacity: 1, duration: 0.5}, '<0');
    //     // console.log(obj)
    // }
    
    // tlMain.to(matBack, {opacity: 1, duration: 0.5}, '<0')
    // .to(matBack, {transparent: false, duration: 0});
    // gsap.to([matBack, matSp, matWh], {opacity: 1, duration: 3});
    // gsap.to(pLight, {intensity: 1, duration: 5});
    gsap.to(renderer.domElement.style, {opacity: 1, duration: 1}, startTime);

    buttonTl1.to(btn.material, {opacity: 0, duration: 0.2})
            .to(btnPressed.material, {opacity: 0.7, duration: 0.2}, '<0')
            .to(btn.scale, {x: 1.1, y: 1.1, duration: 0.2}, '<0')
            .to(btnPressed.scale, {x: 1.1, y: 1.1, duration: 0.2}, '<0')
            .to(btnPressed.material, {opacity: 0.7, duration: 0.2}, '<0')
            .to(btnActive, {value: 1, duration: 0}, '>0');
    buttonTl1.pause();

    buttonTl2.to(btnPressed.position, {z: camera.position.z + 5, duration: 0.2}, 0.01)
            .to(btnActive, {value: 2, duration: 0}, '<0')
            .to(btnPressed.material, {opacity: 0, duration: 0.2}, '<0')
            .to(btnPressed.material, {opacity: 0, duration: 0.2}, '<0')
            .to(matWh, {opacity: 0.8, duration: 0.5}, '<0')
            .to(matWh, {opacity: 0, duration: 0.3}, '>0.5')
            // .to(camera.position, {z: -800, duration: 0})
            .to(whAlphaMap.repeat, {x: 1, y: wormhole_freq, duration: 1}, '<0')
            .to(matWh, {opacity: 0.7, duration: 0.5}, '<2')
            .to(matStar, {opacity: 0.8, duration: 2}, '<1')
            .to(matSp, {opacity: 1, duration: 0.5}, '<0');
    // for (let k in planets) {
    //     buttonTl2.to(planets[k].material, {opacity: 1, duration: 0.5}, '<0');
    // }
    buttonTl2.to(matBack, {opacity: 1, duration: 0.5}, '<0')
            .to(matBack, {transparent: false, duration: 0});
    buttonTl2.pause();
}

gsapInit();
anim();

