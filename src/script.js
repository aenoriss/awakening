import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'dat.gui'
import { DirectionalLight, Scene } from 'three'

/**
 * Base
 */

//TextureLoader
const loadingManager = new THREE.LoadingManager()
const textureLoader = new THREE.TextureLoader(loadingManager)
const mudTexture = textureLoader.load("/textures/mud.jpg")
const fireTexture = textureLoader.load("/textures/fire.jpg")
mudTexture.minFilter = THREE.LinearFilter


// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Lights
 */

const ambientLight = new THREE.AmbientLight();
ambientLight.color = new THREE.Color(0xffffff);
ambientLight.intensity = 0.3;
scene.add(ambientLight);

// gui.add(ambientLight, "intensity");
const directionalLight = new THREE.DirectionalLight("#FDB813", 0.4);
directionalLight.position.set(3, 5, 0);
scene.add(directionalLight);

const hemisphereLight = new THREE.HemisphereLight(0xff0000, 0x0000ff, 1);
// scene.add(hemisphereLight);

const pointLight = new THREE.PointLight("#FDB813", 2);
pointLight.position.set(0, 0, 0)
scene.add(pointLight);


/**
 * Objects
 */
// Material
const material = new THREE.MeshStandardMaterial()
material.roughness = 0.1
const mud = new THREE.MeshBasicMaterial({ map: fireTexture });
const fire = new THREE.MeshBasicMaterial({ map: mudTexture });


// Objects
// const sphere = new THREE.Mesh(
//     new THREE.SphereGeometry(0.5, 32, 32),
//     material
// )
// sphere.position.x = - 1.5

// const cube = new THREE.Mesh(
//     new THREE.BoxGeometry( 0.2, 5,  0.2,  3 ),
//     mud
// )

// cube.position.y = 0

// const torus = new THREE.Mesh(
//     new THREE.TorusGeometry(0.3, 0.2, 32, 64),
//     material
// )
// torus.position.x = 1.5

// const plane = new THREE.Mesh(
//     new THREE.PlaneGeometry(5, 5),
//     material
// )
// plane.rotation.x = - Math.PI * 0.5
// plane.position.y = -2.5

// scene.add(sphere, cube, torus, plane)

const fontLoader = new THREE.FontLoader()
fontLoader.load(
    "/fonts/helvetiker_regular.typeface.json",
    (font) => {
        const textGeometry = new THREE.TextBufferGeometry(
            "Awakening", {
            font,
            size: 10,
            height: 0.2,
            curveSegments: 5,
            bevelEnabled: true,
            bevelThickness: 0.03,
            bevelSize: 0.02,
            bevelOffset: 0,
            bevelSegments: 4,
        })
        textGeometry.computeBoundingBox()
        // textGeometry.translate(
        //     - (textGeometry.boundingBox.max.x - 0.02) * 0.5,
        //     - (textGeometry.boundingBox.max.y - 0.02) * 0.5,
        //     - (textGeometry.boundingBox.max.z - 0.03) * 0.5,
        //  )

        textGeometry.center()
        const Material = new THREE.MeshMatcapMaterial();
        const text = new THREE.Mesh(textGeometry, Material);
        text.position.z = 40;
        text.position.y = -65;
        scene.add(text);
    }
)

fontLoader.load(
    "/fonts/helvetiker_regular.typeface.json",
    (font) => {
        const textGeometry = new THREE.TextBufferGeometry(
            "By Aenoris", {
            font,
            size: 5,
            height: 0.2,
            curveSegments: 5,
            bevelEnabled: true,
            bevelThickness: 0.03,
            bevelSize: 0.02,
            bevelOffset: 0,
            bevelSegments: 4,
        })
        // textGeometry.translate(
        //     - (textGeometry.boundingBox.max.x - 0.02) * 0.5,
        //     - (textGeometry.boundingBox.max.y - 0.02) * 0.5,
        //     - (textGeometry.boundingBox.max.z - 0.03) * 0.5,
        //  )

        textGeometry.center()
        const Material = new THREE.MeshMatcapMaterial();
        const text = new THREE.Mesh(textGeometry, Material);
        text.position.z = 40;
        text.position.y = -80;
        scene.add(text);
    }
)

const space = 8;
const sphereGeo = new THREE.SphereGeometry(2, 64, 64);
const sphereArr = [];
const cubeArr = [];


for (let i = -5; i < 5; i++) {
    for (let v = -5; v < 5; v++) {
        for (let z = -5; z < 5; z++) {
            const sphere = new THREE.Mesh(
                sphereGeo,
                mud,
            )

            const cube = new THREE.Mesh(
                new THREE.BoxGeometry(3, 3, 3),
                fire
            )

            //Cube
            cube.position.x = i * space;
            cube.position.y = v * space;
            cube.position.z = z * space;

            //Sphere
            sphere.position.y = i * space;
            sphere.position.x = v * space;
            sphere.position.z = z * space;
            sphereArr.push(sphere.id);
            cubeArr.push(cube.id);

            scene.add(sphere, cube)
        }
    }
}

console.log("ARR", cubeArr);

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () => {
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

//Axies Helper
// const axesHelper = new THREE.AxesHelper()
// scene.add(axesHelper);

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 130)
camera.position.x = -4
camera.position.y = 0
camera.position.z = 160
scene.add(camera)

//Audio
const listener = new THREE.AudioListener();
const sound = new THREE.Audio( listener );
camera.add( listener );

const audioLoader = new THREE.AudioLoader();
audioLoader.load( 'music/soundtrack.mp3', function( buffer ) {
	sound.setBuffer( buffer );
	sound.setLoop( true );
	sound.setVolume( 0.5 );
	sound.play();
    getAudioContext().resume();
});

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () => {
    const elapsedTime = clock.getElapsedTime()
    sphereArr.forEach( function( item, i) {
        let object = scene.getObjectById( item, true )
        object.scale.y = Math.sin(elapsedTime + i);
        object.scale.x = Math.sin(elapsedTime + i);
        object.scale.z = Math.sin(elapsedTime + i);
    })

    cubeArr.forEach( function( item, i) {
        let object = scene.getObjectById( item, true )
        object.rotateY(0.01);
    })
    
    if(camera.position.z > 90 && elapsedTime < 8 ){
        camera.position.z = camera.position.z - 1;
    }
    
    // const sphereId = scene.getObjectByName( "sphere", true )
    // sphereId.scale.y = Math.sin(0.5 * elapsedTime)
    // sphereId.scale.x = Math.sin(0.5 * elapsedTime)
    // sphereId.scale.z = Math.sin(0.5 * elapsedTime)
    // console.log("sphereId", sphereId)

    // Update objects
    // cube.rotation.y = 0.1 * elapsedTime
    // torus.rotation.y = 0.1 * elapsedTime

    // sphere.rotation.x = 0.15 * elapsedTime
    // cube.rotation.x = 0.15 * elapsedTime
    // torus.rotation.x = 0.15 * elapsedTime

    // Update controls
    controls.autoRotate = true;
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()