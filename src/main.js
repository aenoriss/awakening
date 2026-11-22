import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js'
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js'

// Awakening: a lattice of a thousand spheres and a thousand cubes, ten to a side. Every
// sphere swells and shrinks on a sine wave offset by its place in the lattice, so the swell
// travels through it; every cube turns. The camera pushes in once and then circles, to a
// soundtrack.

const canvas = document.querySelector('canvas.webgl')
const scene = new THREE.Scene()
// The camera sees 130 units. The far side of the lattice fades into the dark before that
// limit, where it used to be cut off in a flat plane.
scene.fog = new THREE.Fog(0x000000, 62, 128)

// ---- Textures. The spheres wear the fire, the cubes the mud.
const textures = new THREE.TextureLoader()
const fire = textures.load('/textures/fire.jpg')
const mud = textures.load('/textures/mud.jpg')
fire.colorSpace = mud.colorSpace = THREE.SRGBColorSpace
mud.minFilter = THREE.LinearFilter

// ---- The lattice. Each kind is one instanced mesh: a thousand copies in a single draw,
// where a mesh apiece was two thousand draws and eight million triangles.
const SIDE = 10, SPACE = 8, COUNT = SIDE ** 3
const spheres = new THREE.InstancedMesh(new THREE.SphereGeometry(2, 32, 24), new THREE.MeshBasicMaterial({ map: fire }), COUNT)
const cubes = new THREE.InstancedMesh(new THREE.BoxGeometry(3, 3, 3), new THREE.MeshBasicMaterial({ map: mud }), COUNT)
spheres.frustumCulled = cubes.frustumCulled = false
scene.add(spheres, cubes)

const spherePlace = [], cubePlace = []
for (let i = -5; i < 5; i++) for (let v = -5; v < 5; v++) for (let z = -5; z < 5; z++) {
  cubePlace.push(new THREE.Vector3(i * SPACE, v * SPACE, z * SPACE))
  spherePlace.push(new THREE.Vector3(v * SPACE, i * SPACE, z * SPACE))
}

// ---- The title, under the lattice.
new FontLoader().load('/fonts/helvetiker_regular.typeface.json', (font) => {
  const line = (words, size, y) => {
    const shape = new TextGeometry(words, { font, size, height: 0.2, curveSegments: 5, bevelEnabled: true, bevelThickness: 0.03, bevelSize: 0.02, bevelOffset: 0, bevelSegments: 4 })
    shape.center()
    const text = new THREE.Mesh(shape, new THREE.MeshMatcapMaterial())
    text.position.set(0, y, 40)
    scene.add(text)
  }
  line('Awakening', 10, -65)
  line('By Aenoris', 5, -80)
})

// ---- Camera. It starts far back and is pushed in once the piece begins.
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 130)
camera.position.set(-4, 0, 160)
scene.add(camera)

const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true
controls.autoRotate = true

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true })
const fit = () => {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
}
fit()
window.addEventListener('resize', fit)

// ---- Sound. Loaded at once, started by the click that begins the piece.
const listener = new THREE.AudioListener()
camera.add(listener)
const sound = new THREE.Audio(listener)
let wanted = false
new THREE.AudioLoader().load('/music/soundtrack.mp3', (buffer) => {
  sound.setBuffer(buffer)
  sound.setLoop(true)
  sound.setVolume(0.5)
  if (wanted) sound.play()
})

const begin = document.querySelector('.begin'), keys = document.querySelector('.keys')
let started = null                               // the moment the piece began, in seconds
begin.addEventListener('click', () => {
  listener.context.resume()
  wanted = true
  if (sound.buffer && !sound.isPlaying) sound.play()
  started = performance.now() / 1000
  begin.classList.add('is-gone')
  keys.classList.add('is-on')
  setTimeout(() => keys.classList.remove('is-on'), 9000)
})
window.addEventListener('keydown', (e) => {
  if (e.code !== 'KeyM' || started === null) return
  listener.setMasterVolume(listener.getMasterVolume() > 0 ? 0 : 1)
})

// ---- Each frame.
const place = new THREE.Object3D()
let last = performance.now() / 1000
const tick = () => {
  const now = performance.now() / 1000, dt = Math.min(0.1, now - last)
  last = now
  const t = started === null ? 0 : now - started

  for (let n = 0; n < COUNT; n++) {
    // A sphere's size follows a sine wave offset by its number, one radian a step.
    place.position.copy(spherePlace[n])
    place.rotation.set(0, 0, 0)
    place.scale.setScalar(Math.sin(t + n))
    place.updateMatrix()
    spheres.setMatrixAt(n, place.matrix)
    // A cube turns at the rate it always did: a hundredth of a radian a frame at 60 a second.
    place.position.copy(cubePlace[n])
    place.rotation.set(0, t * 0.6, 0)
    place.scale.setScalar(1)
    place.updateMatrix()
    cubes.setMatrixAt(n, place.matrix)
  }
  spheres.instanceMatrix.needsUpdate = cubes.instanceMatrix.needsUpdate = true

  // The push-in: from 160 to 90 in the first seconds, measured in time, not in frames.
  if (started !== null && t < 8) {
    const away = camera.position.length()
    if (away > 90) camera.position.multiplyScalar(Math.max(90, away - 60 * dt) / away)
  }
  controls.update(dt)
  renderer.render(scene, camera)
  window.requestAnimationFrame(tick)
}
tick()
