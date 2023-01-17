import * as THREE from 'three';
import { Clock } from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { randFloat } from 'three/src/math/mathutils';

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera( 50, window.innerWidth / window.innerHeight, 0.01, 2000 );
camera.position.x = 0;
camera.position.y = 0;
camera.position.z = 70;

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

window.addEventListener('resize', () =>
{
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
})

// let camY = 0;
// window.addEventListener('wheel', (e) => 
// {
//     camY = e.deltaY * 0.002;
// })

const loader = new THREE.TextureLoader();

const geometry = new THREE.BoxGeometry(16, 16, 16, 16, 16, 16);

const clock = new Clock();

const speed = 3.0; // overall animation speed
const freq = 30.0; // basically, determines cube's stiffness
const movement = 60.0; // cube's horizontal movement speed
const color_freq = 1.0; // color change speed

const uniformData = {
    jump_time: {
        type: 'f',
        value: Math.PI * freq,
        // value: 0,
    },
    move_time: {
        type: 'f',
        value: Math.PI * movement,
        // value: 0,
    },
    spd_multiplier : {
        type: 'f',
        value: speed,
    },
    freq_multiplier: {
        type: 'f',
        value: freq,
    },
    mvt_multiplier: {
        type: 'f',
        value: movement,
    },
    color_freq: {
        type: 'f',
        value: color_freq,
    },
    r: {
        type: 'f',
        value: (Math.cos(clock.getElapsedTime())) + 1 / 2,
    },
    g: {
        type: 'f',
        value: (Math.cos(clock.getElapsedTime() + Math.PI*2/3)) + 1 / 2,
    },
    b: {
        type: 'f',
        value: (Math.cos(clock.getElapsedTime() + Math.PI/3)) + 1 / 2,
    },
};

const material = new THREE.ShaderMaterial({
    wireframe: true,
    uniforms: uniformData,
    vertexShader: `
    uniform float jump_time;
    uniform float move_time;
    uniform float freq_multiplier;
    void main() {        
        gl_Position = projectionMatrix
        * modelViewMatrix
        * vec4(-50.0 + position.x + (move_time*0.03), min(12.7, max(-9.0, position.y + 5.0 * cos((position.x + jump_time) / freq_multiplier))), position.z, 1.0);
    }
    `,
    fragmentShader: `
    uniform float r;
    uniform float g;
    uniform float b;

    void main() {
        gl_FragColor = vec4(r,
                            g,
                            b,
                            1.0);
    }
    `,
});

const mesh = new THREE.Mesh(geometry, material);
scene.add(mesh);

// const pLight = new THREE.PointLight(0xffffff, 1);
// pLight.position.set(2, 2, 5);
// scene.add(pLight);

const controls = new OrbitControls( camera, renderer.domElement );
// scene.add(pLight);
function anim() {
    let delta = clock.getDelta();
    uniformData.jump_time.value += Math.PI * uniformData.freq_multiplier.value * uniformData.spd_multiplier.value * delta * Math.abs(Math.cos(clock.getElapsedTime() * uniformData.spd_multiplier.value));
    uniformData.move_time.value += Math.PI * uniformData.mvt_multiplier.value * uniformData.spd_multiplier.value * delta * Math.abs(Math.sin(clock.getElapsedTime() * uniformData.spd_multiplier.value));
    uniformData.r.value = (Math.cos(clock.getElapsedTime()*uniformData.color_freq.value) + 1) / 2;
    uniformData.g.value = (Math.cos(clock.getElapsedTime()*uniformData.color_freq.value + Math.PI*4/3) + 1) / 2;
    uniformData.b.value = (Math.cos(clock.getElapsedTime()*uniformData.color_freq.value + Math.PI*2/3) + 1) / 2;
    // console.log('j' + uniformData.jump_time.value);
    // console.log('mmmm' + uniformData.move_time.value);
    // console.log(uniformData.b.value);
    requestAnimationFrame(anim);
    renderer.render(scene, camera);
}
anim();