// First-person arms + gun, rendered in their own scene with their own camera and FOV so they never
// clip into the world. Procedural springs, sway, bob and ADS are layered on top of each rig's
// authored Idle/Shoot/Reload animations.
//
// Two rigs come with arms and animations (J-Toastie's AKM and Glock 19 rigs). Every other weapon is
// a prop model seated in one of those rigs: the rig's own gun is hidden and the prop is attached to
// its "Root" bone, lined up so the prop's trigger sits where the rig's trigger was.

import * as THREE from "three"
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js"
import { clone as cloneSkinned } from "three/addons/utils/SkeletonUtils.js"
import { values as P } from "./params.js"
import { softTexture, energyColor } from "./effects.js"

// Rig model units: 1 unit = 4 cm. Coordinates below are in each rig's model space, where the barrel
// points +X and Y is up. `sight` is the sight height above the bore in metres.
const MODEL_SCALE = 0.04
const UNITS_PER_M = 1 / MODEL_SCALE

const RIGS = {
    akm: {
        url: "assets/models/akm.glb",
        gunMesh: "AKM_model",
        trigger: [-2.22, 0.765],
        boreY: 1.6,
        boreZ: 1.72,
        muzzleX: 12.4,
        sight: 0.066,
        hip: [0.1, -0.11, -0.36],
        adsZ: -0.2
    },
    glock: {
        url: "assets/models/glock.glb",
        gunMesh: "Glock19",
        trigger: [2.77, 1.41],
        boreY: 1.7,
        boreZ: 3.69,
        muzzleX: 5.47,
        sight: 0.019,
        hip: [0.07, -0.1, -0.3],
        adsZ: -0.3,
        // The pistol rig closes its fingers with a one-frame "Grip" pose layered under everything.
        gripPose: true
    }
}

// Props, measured in their own model space. axis: which way the barrel points ("x" or "-z").
// trigger: [along-barrel, height]; bore/sight: heights; muzzle: along-barrel; length: real metres
// for the model's full span along the barrel axis. hip: [x, y, z] metres added to the rig's hip spot,
// to keep chunky props from filling the screen. adsZ: how far ahead of the eye the pivot sits when
// aiming, so bulky receivers don't swallow the view.
const WEAPONS = {
    akm: { rig: "akm" },
    glock: { rig: "glock" },
    smg: { rig: "akm", adsZ: -0.34, prop: { url: "assets/models/smg.glb", axis: "x", trigger: [0.35, 0.2], bore: 0.6, sight: 0.92, muzzle: 2.25, span: 4.044, length: 0.62 } },
    mossberg: { rig: "akm", adsZ: -0.24, prop: { url: "assets/models/mossberg.glb", axis: "x", trigger: [-0.7, 0.6], bore: 0.94, sight: 1.16, muzzle: 3.1, span: 6.025, length: 1.0 } },
    sawedoff: {
        rig: "akm",
        hip: [0.03, -0.05, -0.14],
        adsZ: -0.46,
        prop: { url: "assets/models/sawedoff.glb", axis: "-z", trigger: [-1.15, -1.5], bore: 0.15, sight: 0.85, muzzle: 5.49, span: 10.8, length: 0.5 }
    },
    pulse: {
        rig: "akm",
        hip: [0.02, -0.045, -0.1],
        adsZ: -0.36,
        prop: { url: "assets/models/pulse.glb", axis: "x", trigger: [0.16, 0.05], bore: 0.3, sight: 0.385, muzzle: 0.895, span: 1.792, length: 0.8 }
    },
    coilgun: {
        rig: "akm",
        hip: [0.02, -0.045, -0.1],
        prop: { url: "assets/models/coilgun.glb", axis: "x", trigger: [-0.55, -0.15], bore: 0.1, sight: 0.2, muzzle: 1.005, span: 2.495, length: 1.1 }
    },
    raygun: {
        rig: "glock",
        hip: [0.035, -0.045, -0.08],
        prop: { url: "assets/models/raygun.glb", axis: "-z", trigger: [0.65, 0.3], bore: 0.85, sight: 1.25, muzzle: 2.96, span: 3.363, length: 0.28 }
    }
}

const EJECT = new THREE.Vector3(0.02, 0.008, -0.03)

// A damped spring per channel: x'' = -k x - c x'. Impulses are scaled by sqrt(k), so each kick
// slider reads roughly as the peak displacement no matter how stiff the spring is.
class Spring {
    constructor() {
        this.x = 0
        this.v = 0
    }
    kick(amount, k) {
        this.v += amount * Math.sqrt(k)
    }
    step(dt, k, zeta) {
        const c = 2 * zeta * Math.sqrt(k)
        this.v += (-k * this.x - c * this.v) * dt
        this.x += this.v * dt
    }
}

// Grayscale flash sprites; the energy colour tints them (overdriven, so the core still clips white).
function flashTexture(stretch) {
    const c = document.createElement("canvas")
    c.width = c.height = 128
    const g = c.getContext("2d")
    g.translate(64, 64)
    g.scale(stretch ? 0.45 : 1, 1)
    const spikes = stretch ? 5 : 9
    for (let i = 0; i < spikes; i++) {
        const a = (i / spikes) * Math.PI * 2 + Math.random() * 0.3
        const len = (stretch ? 60 : 44) + Math.random() * 18
        const grad = g.createLinearGradient(0, 0, Math.cos(a) * len, Math.sin(a) * len)
        grad.addColorStop(0, "rgba(255,255,255,1)")
        grad.addColorStop(0.35, "rgba(180,180,180,0.8)")
        grad.addColorStop(1, "rgba(90,90,90,0)")
        g.fillStyle = grad
        g.beginPath()
        g.moveTo(Math.cos(a - 0.2) * 8, Math.sin(a - 0.2) * 8)
        g.lineTo(Math.cos(a) * len, Math.sin(a) * len)
        g.lineTo(Math.cos(a + 0.2) * 8, Math.sin(a + 0.2) * 8)
        g.fill()
    }
    const core = g.createRadialGradient(0, 0, 0, 0, 0, 30)
    core.addColorStop(0, "rgba(255,255,255,1)")
    core.addColorStop(0.4, "rgba(200,200,200,0.8)")
    core.addColorStop(1, "rgba(120,120,120,0)")
    g.fillStyle = core
    g.beginPath()
    g.arc(0, 0, 30, 0, Math.PI * 2)
    g.fill()
    const tex = new THREE.CanvasTexture(c)
    tex.colorSpace = THREE.SRGBColorSpace
    return tex
}

// The source rig materials are all 40% metallic; give skin, cloth and wood believable values.
function tuneMaterials(root) {
    root.traverse((o) => {
        if (!o.isMesh) return
        o.frustumCulled = false
        const m = o.material
        const name = m.name
        if (["Skin", "Shirt", "Glove", "Wood", "BakeliteMag", "DarkPlastic"].includes(name)) m.metalness = 0
        if (name === "Skin") m.roughness = 0.6
        if (name === "Glove") m.roughness = 0.75
        if (name === "Shirt") m.roughness = 0.95
        if (name === "Wood") m.roughness = 0.5
        if (name.startsWith("Metal") || name === "Black.002") {
            m.metalness = 0.8
            m.roughness = 0.38
        }
        if (name.startsWith("Bullet")) m.metalness = 0.9
        m.envMapIntensity = 0.7
    })
}

const loader = new GLTFLoader()
const gltfCache = new Map()
function loadGLTF(url) {
    if (!gltfCache.has(url)) gltfCache.set(url, loader.loadAsync(url))
    return gltfCache.get(url)
}

// Build one weapon instance: a cloned rig (with its own mixer) plus an optional seated prop.
async function buildWeapon(id) {
    const def = WEAPONS[id] ?? WEAPONS.akm
    const rig = RIGS[def.rig]
    const [rigGltf, propGltf] = await Promise.all([loadGLTF(rig.url), def.prop ? loadGLTF(def.prop.url) : null])
    const model = cloneSkinned(rigGltf.scene)
    tuneMaterials(model)

    let boreY = rig.boreY
    let muzzleX = rig.muzzleX
    let sight = rig.sight
    if (propGltf) {
        const pr = def.prop
        model.traverse((o) => {
            if (o.isMesh && o.name.startsWith(rig.gunMesh)) o.visible = false
        })
        const prop = cloneSkinned(propGltf.scene)
        prop.traverse((o) => {
            if (!o.isMesh) return
            o.frustumCulled = false
            o.material = o.material.clone()
            o.material.envMapIntensity = 0.7
        })
        // Rig units per prop unit, then seat the prop's trigger on the rig's trigger.
        const k = (pr.length / pr.span) * UNITS_PER_M
        prop.scale.setScalar(k)
        if (pr.axis === "-z") prop.rotation.y = -Math.PI / 2
        prop.position.set(rig.trigger[0] - pr.trigger[0] * k, rig.trigger[1] - pr.trigger[1] * k, rig.boreZ)
        model.add(prop)
        model.updateMatrixWorld(true)
        model.getObjectByName("Root").attach(prop)

        boreY = rig.trigger[1] + (pr.bore - pr.trigger[1]) * k
        muzzleX = rig.trigger[0] + (pr.muzzle - pr.trigger[0]) * k
        sight = (pr.sight - pr.bore) * (pr.length / pr.span)
    }

    // After the rotation, model +Z becomes view +X; shift so the bore runs through the pivot origin.
    model.rotation.y = Math.PI / 2
    model.scale.setScalar(MODEL_SCALE)
    model.position.set(-rig.boreZ * MODEL_SCALE, -boreY * MODEL_SCALE, 0)

    const mixer = new THREE.AnimationMixer(model)
    const clip = (n) => rigGltf.animations.find((a) => a.name.endsWith(n))
    const idle = mixer.clipAction(clip("Idle"))
    idle.play()
    if (rig.gripPose && clip("Grip")) mixer.clipAction(clip("Grip")).play()
    const shoot = mixer.clipAction(clip("Shoot"))
    shoot.setLoop(THREE.LoopOnce, 1)
    const reload = mixer.clipAction(clip("Reload"))
    reload.setLoop(THREE.LoopOnce, 1)
    reload.clampWhenFinished = false

    return {
        id,
        model,
        mixer,
        idle,
        shoot,
        reload,
        muzzleZ: -muzzleX * MODEL_SCALE,
        hip: new THREE.Vector3(...rig.hip).add(new THREE.Vector3(...(def.hip ?? [0, 0, 0]))),
        ads: new THREE.Vector3(0, -sight, def.adsZ ?? rig.adsZ)
    }
}

export async function createViewmodel(vmScene, vmCamera) {
    // root: hip/ADS placement; pivot: kick, sway and bob rotations happen around the receiver.
    const root = new THREE.Group()
    const pivot = new THREE.Group()
    root.add(pivot)
    vmScene.add(root)

    const muzzle = new THREE.Object3D()
    pivot.add(muzzle)
    const eject = new THREE.Object3D()
    eject.position.copy(EJECT)
    pivot.add(eject)

    // Muzzle flash: a camera-facing star plus two crossed side planes for the flame cone.
    const flash = new THREE.Group()
    muzzle.add(flash)
    const flashMat = (tex) =>
        new THREE.MeshBasicMaterial({ map: tex, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false, toneMapped: false, side: THREE.DoubleSide })
    const starTex = [flashTexture(false), flashTexture(false), flashTexture(false)]
    const sideTex = [flashTexture(true), flashTexture(true)]
    const star = new THREE.Mesh(new THREE.PlaneGeometry(0.16, 0.16), flashMat(starTex[0]))
    star.position.z = -0.01
    flash.add(star)
    const sides = [0, Math.PI / 2].map((rz) => {
        const m = new THREE.Mesh(new THREE.PlaneGeometry(0.1, 0.28).rotateX(-Math.PI / 2).translate(0, 0, -0.12), flashMat(sideTex[0]))
        m.rotation.z = rz
        flash.add(m)
        return m
    })
    const glow = new THREE.Mesh(
        new THREE.PlaneGeometry(0.5, 0.5),
        new THREE.MeshBasicMaterial({ map: softTexture(), blending: THREE.AdditiveBlending, transparent: true, depthWrite: false, toneMapped: false, opacity: 0.35 })
    )
    flash.add(glow)
    flash.visible = false

    const flashLight = new THREE.PointLight(0xffa860, 0, 3, 2)
    muzzle.add(flashLight)
    flashLight.position.set(0, 0.05, 0.1)

    // Lights for the viewmodel scene; main.js keeps them in step with the range's time of day, and
    // the key light is re-aimed each frame to match the sun.
    const hemi = new THREE.HemisphereLight(0xcfe0ff, 0x5a5048, 1.0)
    const key = new THREE.DirectionalLight(0xfff1dc, 2.2)
    vmScene.add(hemi, key, key.target)
    vmScene.add(vmCamera)

    const instances = new Map()
    let cur = null
    let reloadDone = null
    let pending = null

    function onFinished(e) {
        if (cur && e.action === cur.reload) {
            cur.reload.stop()
            const done = reloadDone
            reloadDone = null
            done?.()
        }
    }

    // Swap weapons. Loads lazily; the old gun stays up until the new one is ready.
    async function setWeapon(id) {
        pending = id
        if (!instances.has(id)) instances.set(id, buildWeapon(id))
        const inst = await instances.get(id)
        if (pending !== id) return
        if (cur === inst) return
        if (cur) {
            pivot.remove(cur.model)
            cur.mixer.removeEventListener("finished", onFinished)
            if (cur.reload.isRunning()) cur.reload.stop()
        }
        // Switching guns abandons any reload in progress; the new gun comes up full.
        const done = reloadDone
        reloadDone = null
        done?.()
        cur = inst
        cur.mixer.addEventListener("finished", onFinished)
        pivot.add(cur.model)
        muzzle.position.set(0, 0, cur.muzzleZ)
    }

    await setWeapon(P.weapon)

    const springs = { back: new Spring(), up: new Spring(), roll: new Spring(), side: new Spring(), yaw: new Spring() }
    const sway = { x: 0, y: 0, tx: 0, ty: 0 }
    let flashTimer = 0
    let time = 0
    const tmpV = new THREE.Vector3()
    const hipOffset = new THREE.Vector3()
    const tint = new THREE.Color()

    function fire(adsE) {
        const mul = THREE.MathUtils.lerp(1, P.kickAds, adsE)
        const k = P.kickStiff
        springs.back.kick((P.kickBack / 100) * mul * (0.85 + Math.random() * 0.3), k)
        springs.up.kick(THREE.MathUtils.degToRad(P.kickUp) * mul * (0.85 + Math.random() * 0.3), k)
        springs.roll.kick(THREE.MathUtils.degToRad(P.kickRoll) * mul * (Math.random() * 2 - 1), k)
        springs.side.kick((P.kickSide / 100) * mul * (Math.random() * 2 - 1), k)
        springs.yaw.kick(THREE.MathUtils.degToRad(P.kickRoll) * 0.3 * mul * (Math.random() * 2 - 1), k)

        if (P.animWeight > 0) {
            cur.shoot.reset()
            cur.shoot.setEffectiveWeight(P.animWeight)
            cur.shoot.play()
        }

        if (Math.random() < P.flashChance && P.flashSize > 0) {
            flashTimer = P.flashTime
            flash.visible = true
            const s = P.flashSize * (0.8 + Math.random() * 0.4)
            flash.scale.set(s, s, s * (0.8 + Math.random() * 0.5))
            energyColor(tint)
            star.material.map = starTex[Math.floor(Math.random() * starTex.length)]
            star.material.color.copy(tint).multiplyScalar(2.5)
            star.rotation.z = Math.random() * Math.PI * 2
            for (const m of sides) {
                m.material.map = sideTex[Math.floor(Math.random() * sideTex.length)]
                m.material.color.copy(tint).multiplyScalar(2.2)
            }
            glow.material.color.copy(tint)
            sides[0].rotation.z = Math.random() * 0.5
            sides[1].rotation.z = Math.PI / 2 + Math.random() * 0.5
            flashLight.color.copy(tint)
            flashLight.intensity = 1.5 * P.flashLight
        }
    }

    function startReload(done) {
        if (!cur || cur.reload.isRunning()) return false
        reloadDone = done
        cur.reload.reset()
        cur.reload.setEffectiveWeight(1)
        cur.reload.play()
        return true
    }

    // look: mouse delta this frame (radians), move: 0..1 walk speed fraction, walkPhase in radians,
    // charge: 0..1 while charging, light: { hemi, sun, sunColor } from the range.
    function update(dt, { adsE, look, move, walkPhase, shakeRot, sunDir, charge, light, sprint }) {
        time += dt
        cur.mixer.update(dt)
        cur.idle.setEffectiveWeight(Math.min(1, P.idle) * (1 - adsE * 0.8))

        // Springs integrate in small fixed steps so stiff settings stay stable.
        let rem = dt
        while (rem > 0) {
            const h = Math.min(rem, 1 / 240)
            for (const s of Object.values(springs)) s.step(h, P.kickStiff, P.kickDamp)
            rem -= h
        }

        // Sway: the gun lags opposite to look direction, then catches up.
        const swayMul = P.sway * (1 - adsE * 0.75)
        sway.tx = THREE.MathUtils.clamp(-look.x * 1.6 * swayMul, -0.08, 0.08)
        sway.ty = THREE.MathUtils.clamp(-look.y * 1.6 * swayMul, -0.08, 0.08)
        const a = 1 - Math.exp(-P.swaySmooth * dt)
        sway.x += (sway.tx - sway.x) * a
        sway.y += (sway.ty - sway.y) * a

        // Bob: figure-eight while walking, slow breathing drift at rest.
        const bobAmt = P.walkBob * move * (1 - adsE * 0.85)
        const bx = Math.cos(walkPhase) * 0.012 * bobAmt
        const by = -Math.abs(Math.sin(walkPhase)) * 0.012 * bobAmt
        const breath = P.idle * (1 - adsE * 0.9)
        const ix = Math.sin(time * 0.9) * 0.0018 * breath
        const iy = Math.sin(time * 1.7) * 0.0012 * breath

        // A building buzz while charging.
        const cj = charge * charge * 0.0025
        const cx = (Math.random() * 2 - 1) * cj
        const cy = (Math.random() * 2 - 1) * cj

        const hip = tmpV.copy(cur.hip).add(hipOffset.set(P.vmX / 100, P.vmY / 100, P.vmZ / 100))
        root.position.lerpVectors(hip, cur.ads, adsE)
        root.position.x += bx + ix - sway.x * 0.15 + springs.side.x + cx
        root.position.y += by + iy + sway.y * 0.15 + cy
        root.position.z += springs.back.x

        // Sprint pose: the gun drops, swings across the body and rolls.
        const sp = sprint * P.sprintTilt
        root.position.x -= 0.03 * sp
        root.position.y -= 0.05 * sp
        root.position.z += 0.03 * sp

        pivot.rotation.set(
            springs.up.x + sway.y + shakeRot.x * P.shakeVm - 0.25 * sp,
            springs.yaw.x + sway.x + shakeRot.y * P.shakeVm + 0.55 * sp,
            springs.roll.x + sway.x * 0.6 + bx * 2 + shakeRot.z * P.shakeVm + 0.3 * sp,
            "YXZ"
        )

        if (flashTimer > 0) {
            flashTimer -= dt
            if (flashTimer <= 0) {
                flash.visible = false
                flashLight.intensity = 0
            }
        }

        hemi.intensity = light.hemi
        key.intensity = light.sun
        key.color.copy(light.sunColor)
        key.position.copy(sunDir).multiplyScalar(5)
        key.target.position.set(0, 0, 0)
        root.updateMatrixWorld(true)
    }

    return {
        fire,
        startReload,
        setWeapon,
        update,
        muzzle,
        eject,
        isReloading: () => !!cur?.reload.isRunning(),
        flashing: () => flash.visible
    }
}
