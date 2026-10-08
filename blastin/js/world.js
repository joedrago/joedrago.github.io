// The shooting range: floor, a cinder-block backstop, side berms, crates, swinging steel plates, a
// training dummy with health, and day/dusk/night lighting. All textures are drawn procedurally on
// canvases so there's nothing extra to download.

import * as THREE from "three"
import { values as P } from "./params.js"

// The dummy line, 30 m behind the spawn point (spawn is at z = 4, facing the backstop at -Z).
export const DUMMY_Z = 34

function canvasTexture(size, draw, repeat = [1, 1]) {
    const c = document.createElement("canvas")
    c.width = c.height = size
    draw(c.getContext("2d"), size)
    const tex = new THREE.CanvasTexture(c)
    tex.colorSpace = THREE.SRGBColorSpace
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping
    tex.repeat.set(...repeat)
    tex.anisotropy = 8
    return tex
}

function speckle(g, size, count, alpha, light) {
    for (let i = 0; i < count; i++) {
        const v = light ? 255 : 0
        g.fillStyle = `rgba(${v},${v},${v},${Math.random() * alpha})`
        const r = Math.random() * 2.2 + 0.4
        g.fillRect(Math.random() * size, Math.random() * size, r, r)
    }
}

// Equirectangular vertical gradient from zenith to nadir, optionally sprinkled with stars.
function skyTexture(stops, stars = 0) {
    const c = document.createElement("canvas")
    c.width = stars ? 4096 : 2
    c.height = stars ? 1024 : 256
    const g = c.getContext("2d")
    const grad = g.createLinearGradient(0, 0, 0, c.height)
    for (const [at, color] of stops) grad.addColorStop(at, color)
    g.fillStyle = grad
    g.fillRect(0, 0, c.width, c.height)
    for (let i = 0; i < stars; i++) {
        const y = Math.pow(Math.random(), 1.6) * c.height * 0.46
        g.fillStyle = `rgba(255,255,255,${0.3 + Math.random() * 0.7})`
        const r = Math.random() < 0.08 ? 2 : 1
        g.fillRect(Math.random() * c.width, y, r, r)
    }
    const tex = new THREE.CanvasTexture(c)
    tex.colorSpace = THREE.SRGBColorSpace
    tex.mapping = THREE.EquirectangularReflectionMapping
    return tex
}

function concreteTexture() {
    return canvasTexture(
        512,
        (g, s) => {
            g.fillStyle = "#8a8782"
            g.fillRect(0, 0, s, s)
            speckle(g, s, 9000, 0.12, false)
            speckle(g, s, 5000, 0.1, true)
            // Large soft stains.
            for (let i = 0; i < 18; i++) {
                const x = Math.random() * s
                const y = Math.random() * s
                const r = 30 + Math.random() * 90
                const grad = g.createRadialGradient(x, y, 0, x, y, r)
                grad.addColorStop(0, "rgba(40,36,30,0.12)")
                grad.addColorStop(1, "rgba(40,36,30,0)")
                g.fillStyle = grad
                g.fillRect(x - r, y - r, r * 2, r * 2)
            }
            // Expansion joints.
            g.strokeStyle = "rgba(30,30,30,0.5)"
            g.lineWidth = 2
            g.strokeRect(1, 1, s - 2, s - 2)
        },
        [30, 70]
    )
}

// A painted ground marker: a stripe across the lane with the distance written along it, at the
// ends and between the dummies' lanes.
function distanceMarker(scene, z, metres) {
    const stripe = new THREE.Mesh(
        new THREE.PlaneGeometry(19, 0.14),
        new THREE.MeshStandardMaterial({ color: 0xe8e4d8, roughness: 0.9, polygonOffset: true, polygonOffsetFactor: -2 })
    )
    stripe.rotation.x = -Math.PI / 2
    stripe.position.set(0, 0.005, z)
    stripe.receiveShadow = true
    scene.add(stripe)
    const label = canvasTexture(256, (g, s) => {
        g.clearRect(0, 0, s, s)
        g.fillStyle = "#f2eee2"
        g.font = "bold 120px ui-sans-serif, system-ui, sans-serif"
        g.textAlign = "center"
        g.textBaseline = "middle"
        g.fillText(`${metres}`, s / 2, s * 0.42)
        g.font = "bold 56px ui-sans-serif, system-ui, sans-serif"
        g.fillText("m", s / 2, s * 0.8)
    })
    label.wrapS = label.wrapT = THREE.ClampToEdgeWrapping
    for (const x of [-8.6, -3, 3, 8.6]) {
        const m = new THREE.Mesh(
            new THREE.PlaneGeometry(1.8, 1.8),
            new THREE.MeshStandardMaterial({ map: label, transparent: true, roughness: 0.9, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 })
        )
        // Flat on the ground, reading upright for someone walking toward the dummies (+Z).
        m.rotation.set(-Math.PI / 2, 0, Math.PI)
        m.position.set(x, 0.006, z - 0.9)
        scene.add(m)
    }
}

function blockTexture() {
    return canvasTexture(
        512,
        (g, s) => {
            g.fillStyle = "#6e6c68"
            g.fillRect(0, 0, s, s)
            const rows = 8
            const bh = s / rows
            const bw = s / 4
            for (let r = 0; r < rows; r++) {
                const off = r % 2 ? bw / 2 : 0
                for (let c = -1; c < 5; c++) {
                    const x = c * bw + off
                    const tone = 150 + Math.random() * 30
                    g.fillStyle = `rgb(${tone},${tone - 3},${tone - 8})`
                    g.fillRect(x + 3, r * bh + 3, bw - 6, bh - 6)
                }
            }
            speckle(g, s, 14000, 0.16, false)
            speckle(g, s, 6000, 0.12, true)
        },
        [6, 2]
    )
}

function woodTexture() {
    return canvasTexture(256, (g, s) => {
        g.fillStyle = "#8a6239"
        g.fillRect(0, 0, s, s)
        for (let y = 0; y < s; y += 2) {
            g.fillStyle = `rgba(60,35,15,${Math.random() * 0.25})`
            g.fillRect(0, y, s, 1 + Math.random() * 2)
        }
        g.strokeStyle = "#4a3018"
        g.lineWidth = 10
        g.strokeRect(5, 5, s - 10, s - 10)
        g.beginPath()
        g.moveTo(10, 10)
        g.lineTo(s - 10, s - 10)
        g.stroke()
    })
}

function plateTexture() {
    return canvasTexture(256, (g, s) => {
        g.fillStyle = "#e8e4dc"
        g.fillRect(0, 0, s, s)
        g.fillStyle = "#d4462c"
        g.beginPath()
        g.arc(s / 2, s / 2, s * 0.22, 0, Math.PI * 2)
        g.fill()
        speckle(g, s, 1500, 0.12, false)
    })
}

export function createWorld(scene) {
    const collidables = []
    const targets = []

    scene.fog = new THREE.Fog(0xc9d6de, 45, 160)

    const hemi = new THREE.HemisphereLight(0xbcd4f0, 0x4a4038, 0.75)
    scene.add(hemi)
    const sun = new THREE.DirectionalLight(0xffecd0, 3.2)
    // The shadow frustum spans both ends of the range: the backstop lane and the dummy field.
    sun.target.position.set(0, 0, 20)
    sun.position.set(-12, 22, 22).add(sun.target.position)
    sun.castShadow = true
    sun.shadow.mapSize.set(4096, 4096)
    Object.assign(sun.shadow.camera, { left: -50, right: 50, top: 50, bottom: -50, near: 1, far: 160 })
    sun.shadow.bias = -0.0004
    sun.shadow.normalBias = 0.02
    scene.add(sun, sun.target)

    const concrete = new THREE.MeshStandardMaterial({ map: concreteTexture(), roughness: 0.92 })
    // The floor runs from the backstop wall out past the dummy field behind the spawn point.
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(60, 140), concrete)
    floor.rotation.x = -Math.PI / 2
    floor.position.z = 10
    floor.receiveShadow = true
    floor.userData.surface = "concrete"
    scene.add(floor)
    collidables.push(floor)

    const blockMat = new THREE.MeshStandardMaterial({ map: blockTexture(), roughness: 0.95 })
    const addBox = (w, h, d, x, y, z, mat, surface) => {
        const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat)
        m.position.set(x, y, z)
        m.castShadow = m.receiveShadow = true
        m.userData.surface = surface
        scene.add(m)
        collidables.push(m)
        return m
    }

    // Backstop wall 25 m downrange, with low side walls framing the lane.
    addBox(30, 7, 1, 0, 3.5, -25.5, blockMat, "concrete")
    const sideMat = blockMat.clone()
    sideMat.map = blockMat.map.clone()
    sideMat.map.repeat.set(5, 0.6)
    addBox(1, 2.2, 26, -9, 1.1, -12.5, sideMat, "concrete")
    addBox(1, 2.2, 26, 9, 1.1, -12.5, sideMat, "concrete")

    // Painted stripes on the backstop help read recoil patterns against it.
    const stripeMat = new THREE.MeshStandardMaterial({ color: 0xe0b030, roughness: 0.8 })
    for (const x of [-6, 6]) {
        const s = new THREE.Mesh(new THREE.PlaneGeometry(0.25, 7), stripeMat)
        s.position.set(x, 3.5, -24.99)
        scene.add(s)
    }
    const grid = new THREE.Mesh(
        new THREE.PlaneGeometry(4, 4),
        new THREE.MeshStandardMaterial({
            map: canvasTexture(256, (g, s) => {
                g.fillStyle = "#f2efe6"
                g.fillRect(0, 0, s, s)
                g.strokeStyle = "#333"
                g.lineWidth = 2
                for (let i = 0; i <= 8; i++) {
                    g.beginPath()
                    g.moveTo((i * s) / 8, 0)
                    g.lineTo((i * s) / 8, s)
                    g.moveTo(0, (i * s) / 8)
                    g.lineTo(s, (i * s) / 8)
                    g.stroke()
                }
                g.fillStyle = "#d4462c"
                g.beginPath()
                g.arc(s / 2, s / 2, 10, 0, Math.PI * 2)
                g.fill()
            }),
            roughness: 0.9
        })
    )
    grid.position.set(0, 2.2, -24.98)
    grid.userData.surface = "paper"
    scene.add(grid)
    collidables.push(grid)

    const wood = new THREE.MeshStandardMaterial({ map: woodTexture(), roughness: 0.85 })
    addBox(1.2, 1.2, 1.2, -4.5, 0.6, -18, wood, "wood")
    addBox(1.2, 1.2, 1.2, -3.2, 0.6, -18.4, wood, "wood").rotation.y = 0.4
    addBox(1, 1, 1, -3.9, 1.7, -18.1, wood, "wood").rotation.y = -0.2
    addBox(1.2, 1.2, 1.2, 5, 0.6, -21, wood, "wood").rotation.y = 0.15

    // Steel plates hanging from a frame: each pivots on its top edge and swings when hit.
    const steel = new THREE.MeshStandardMaterial({ map: plateTexture(), roughness: 0.45, metalness: 0.3 })
    const postMat = new THREE.MeshStandardMaterial({ color: 0x3a3c40, roughness: 0.6, metalness: 0.5 })
    const frame = (z, xs, h) => {
        const x0 = Math.min(...xs) - 0.8
        const x1 = Math.max(...xs) + 0.8
        addBox(0.1, h, 0.1, x0, h / 2, z, postMat, "metal")
        addBox(0.1, h, 0.1, x1, h / 2, z, postMat, "metal")
        addBox(x1 - x0, 0.08, 0.08, (x0 + x1) / 2, h, z, postMat, "metal")
        for (const x of xs) {
            const pivot = new THREE.Group()
            pivot.position.set(x, h - 0.05, z)
            scene.add(pivot)
            const chain = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.35, 0.02), postMat)
            chain.position.y = -0.17
            pivot.add(chain)
            const plate = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.03, 40), steel)
            plate.rotation.x = Math.PI / 2
            plate.position.y = -0.62
            plate.castShadow = true
            plate.userData.surface = "metal"
            plate.userData.target = { pivot, angle: 0, vel: 0, yaw: 0, yawVel: 0, flash: 0, mat: null }
            pivot.add(plate)
            collidables.push(plate)
            targets.push(plate.userData.target)
            // Each plate gets its own material instance so it can flash on hit.
            plate.material = steel.clone()
            plate.userData.target.mat = plate.material
        }
    }
    frame(-10, [-2.5, 0, 2.5], 1.9)
    frame(-16, [-1.2, 1.2, 3.6], 2.2)
    frame(-22, [-2, 0.4], 2.6)

    function hitTarget(plate, point, dir) {
        const t = plate.userData.target
        if (!t) return
        const local = t.pivot.worldToLocal(point.clone())
        // Torque from a push along the bullet direction, applied below the pivot.
        const push = 6 * P.targetPush
        t.vel += -dir.z * push * Math.min(1, -local.y / 0.6)
        t.yawVel += -local.x * dir.z * push * 4
        t.flash = 1
    }

    // --- dummy field: behind the spawn point, turn around to face it. Three dummies (×1, ×10 and
    // ×100 health, left to right as you face them) stand on one line, with distance markers painted on the ground in front of them
    // and an earth berm behind to catch misses.
    const dummies = [
        createDummy(scene, collidables, { x: 6, z: DUMMY_Z, mult: 1, scale: 1, tint: 0xffffff }),
        createDummy(scene, collidables, { x: 0, z: DUMMY_Z, mult: 10, scale: 1.1, tint: 0xb8c4d8 }),
        createDummy(scene, collidables, { x: -6, z: DUMMY_Z, mult: 100, scale: 1.3, tint: 0xd89080 })
    ]
    for (const d of [5, 10, 15, 20, 25, 30]) distanceMarker(scene, DUMMY_Z - d, d)
    const dirt = new THREE.MeshStandardMaterial({ map: concrete.map.clone(), color: 0x8a6a48, roughness: 1 })
    dirt.map.repeat.set(8, 1)
    dirt.map.needsUpdate = true
    addBox(30, 4, 3, 0, 2, DUMMY_Z + 9, dirt, "dirt")

    // --- range lamps (lit at dusk and night) -------------------------------------------------------
    const lampHeadMat = new THREE.MeshStandardMaterial({ color: 0x222222, emissive: 0xffc070, emissiveIntensity: 0 })
    const lamps = []
    // [x, z, aim x, aim z]: two pairs down the shooting lane, two pairs over the dummy field.
    for (const [x, z, tx, tz] of [
        [-8.3, -5, -8.3, -11],
        [8.3, -5, 8.3, -11],
        [-8.3, -17, -8.3, -23],
        [8.3, -17, 8.3, -23],
        [-10.5, DUMMY_Z - 18, -4, DUMMY_Z - 10],
        [10.5, DUMMY_Z - 18, 4, DUMMY_Z - 10],
        [-10.5, DUMMY_Z - 7, -4, DUMMY_Z],
        [10.5, DUMMY_Z - 7, 4, DUMMY_Z]
    ]) {
        addBox(0.12, 4.2, 0.12, x, 2.1, z, postMat, "metal")
        const head = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.12, 0.3), lampHeadMat)
        head.position.set(x - Math.sign(x) * 0.25, 4.15, z)
        scene.add(head)
        const light = new THREE.SpotLight(0xffc27a, 0, 34, 0.95, 0.6, 1.6)
        light.position.set(x - Math.sign(x) * 0.3, 4.05, z)
        light.target.position.set(tx, 0, tz)
        scene.add(light, light.target)
        lamps.push(light)
    }

    // Lighting per time of day. `vm` is mirrored onto the viewmodel scene by main.js.
    const TIMES = {
        day: {
            sky: skyTexture([[0, "#3d6fa8"], [0.42, "#9ec0de"], [0.5, "#d9e2e6"], [0.56, "#8d8a84"], [1, "#4a4844"]]),
            fog: 0xc9d6de, hemi: 0.75, hemiSky: 0xbcd4f0, hemiGround: 0x4a4038, sun: 3.2, sunColor: 0xffecd0,
            sunPos: [-12, 22, 8], lamps: 0, env: 0.35
        },
        dusk: {
            sky: skyTexture([[0, "#232a52"], [0.3, "#6a4a7a"], [0.44, "#e0805a"], [0.5, "#ffc27a"], [0.56, "#4a3a36"], [1, "#221c1a"]], 120),
            fog: 0x7a5a5a, hemi: 0.4, hemiSky: 0xc8a0b0, hemiGround: 0x3a2c28, sun: 1.6, sunColor: 0xff9a5a,
            sunPos: [-30, 7, -6], lamps: 0.6, env: 0.18
        },
        night: {
            sky: skyTexture([[0, "#03050c"], [0.4, "#0c1428"], [0.5, "#1c2440"], [0.56, "#0a0a0e"], [1, "#050506"]], 900),
            fog: 0x0c1020, hemi: 0.12, hemiSky: 0x6070a0, hemiGround: 0x101018, sun: 0.35, sunColor: 0x9fb0ff,
            sunPos: [14, 26, 4], lamps: 1, env: 0.05
        }
    }
    const lighting = { hemi: 0.75, sun: 3.2, sunColor: new THREE.Color(), env: 0.35 }

    function setTime(name) {
        const t = TIMES[name] ?? TIMES.day
        scene.background = t.sky
        scene.fog.color.set(t.fog)
        hemi.intensity = t.hemi
        hemi.color.set(t.hemiSky)
        hemi.groundColor.set(t.hemiGround)
        sun.intensity = t.sun
        sun.color.set(t.sunColor)
        // Sun positions are offsets from the shadow target, i.e. directions.
        sun.position.set(...t.sunPos).add(sun.target.position)
        for (const l of lamps) l.intensity = 90 * t.lamps
        lampHeadMat.emissiveIntensity = 3 * t.lamps
        Object.assign(lighting, { hemi: t.hemi * 1.3, sun: t.sun * 0.7, env: t.env })
        lighting.sunColor.set(t.sunColor)
    }
    setTime(P.time)

    function update(dt) {
        for (const d of dummies) d.update(dt)
        for (const t of targets) {
            t.vel += (-60 * t.angle - 2.2 * t.vel) * dt
            t.angle += t.vel * dt
            t.angle = Math.max(-1.2, Math.min(1.2, t.angle))
            t.yawVel += (-30 * t.yaw - 2 * t.yawVel) * dt
            t.yaw += t.yawVel * dt
            t.pivot.rotation.set(t.angle, t.yaw, 0)
            t.flash = Math.max(0, t.flash - dt * 6)
            t.mat.emissive.setRGB(t.flash * 0.6, t.flash * 0.45, t.flash * 0.2)
        }
    }

    return { collidables, targets, sun, dummies, lighting, setTime, hitTarget, update }
}

// A burlap training dummy on a sprung post. It wobbles when hit, tracks health, falls over when
// emptied, and heals back to full once it's been left alone for a moment. Its max health is
// P.dummyHp × mult.
function createDummy(scene, collidables, { x, z, mult, scale, tint }) {
    // Dummies face down-field toward the player (-Z).
    const api = {}
    const weave = (g, s) => {
        g.fillStyle = "#b89a68"
        g.fillRect(0, 0, s, s)
        for (let i = 0; i < s; i += 3) {
            g.fillStyle = `rgba(90,70,40,${0.08 + Math.random() * 0.1})`
            g.fillRect(i, 0, 1, s)
            g.fillRect(0, i, s, 1)
        }
        speckle(g, s, 3000, 0.12, false)
    }
    // Plain burlap for the arms; the torso and head also get a painted target.
    const plain = canvasTexture(256, weave)
    const burlap = canvasTexture(256, (g, s) => {
        weave(g, s)
        for (const [r, c] of [
            [56, "#c23a2a"],
            [40, "#e8dcc0"],
            [24, "#c23a2a"]
        ]) {
            g.fillStyle = c
            g.beginPath()
            g.arc(s / 2, s * 0.42, r, 0, Math.PI * 2)
            g.fill()
        }
    })
    const mat = new THREE.MeshStandardMaterial({ map: burlap, color: tint, roughness: 0.95 })
    const armMat = new THREE.MeshStandardMaterial({ map: plain, color: tint, roughness: 0.95 })
    const metal = new THREE.MeshStandardMaterial({ color: 0x3a3c40, roughness: 0.6, metalness: 0.5 })

    const base = new THREE.Group()
    base.position.set(x, 0, z)
    base.rotation.y = Math.PI
    base.scale.setScalar(scale)
    scene.add(base)
    const foot = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.42, 0.1, 24), metal)
    foot.position.y = 0.05
    foot.castShadow = foot.receiveShadow = true
    base.add(foot)

    // Everything above the foot rocks on a spring.
    const body = new THREE.Group()
    base.add(body)
    const part = (mesh, y, partName, surface = "dummy") => {
        mesh.position.y = y
        mesh.castShadow = true
        mesh.userData.surface = surface
        mesh.userData.dummy = partName
        mesh.userData.owner = api
        body.add(mesh)
        collidables.push(mesh)
        return mesh
    }
    part(new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.95, 10), metal), 0.55, "body", "metal")
    const torso = part(new THREE.Mesh(new THREE.CapsuleGeometry(0.24, 0.5, 6, 16), mat.clone()), 1.3, "body")
    torso.rotation.y = -Math.PI / 2
    const head = part(new THREE.Mesh(new THREE.SphereGeometry(0.14, 20, 14), mat.clone()), 1.86, "head")
    // Sphere and capsule UVs put the middle of the texture on +X; turn both to face the front (+Z).
    head.rotation.y = -Math.PI / 2
    for (const side of [-1, 1]) {
        const arm = part(new THREE.Mesh(new THREE.CapsuleGeometry(0.07, 0.36, 4, 10), armMat.clone()), 1.42, "body")
        arm.position.x = side * 0.33
        arm.rotation.z = side * 0.35
    }
    const flashMats = []
    body.traverse((o) => o.isMesh && o.material !== metal && flashMats.push(o.material))

    const state = {
        mult,
        hp: P.dummyHp * mult,
        max: P.dummyHp * mult,
        sinceHit: 99,
        dead: false,
        deadTime: 0,
        fall: 0,
        ax: 0,
        vx: 0,
        az: 0,
        vz: 0,
        flash: 0,
        headPos: new THREE.Vector3()
    }

    // Returns the damage actually dealt (0 if it's already down).
    function hit(mesh, point, dir, amount) {
        if (state.dead) return { dealt: 0, killed: false }
        const dealt = Math.min(state.hp, amount)
        state.hp -= dealt
        state.sinceHit = 0
        state.flash = 1
        // Rock away from the shot, more for hits high up.
        const local = base.worldToLocal(point.clone())
        const d = dir.clone().applyQuaternion(base.quaternion.clone().invert())
        const lever = Math.min(1.5, Math.max(0.2, local.y / 1.5))
        state.vx += d.z * 2.2 * P.targetPush * lever
        state.vz -= d.x * 2.2 * P.targetPush * lever
        const killed = state.hp <= 0
        if (killed) {
            state.dead = true
            state.deadTime = 0
        }
        return { dealt, killed }
    }

    function update(dt) {
        if (P.dummyHp * mult !== state.max) {
            state.max = P.dummyHp * mult
            state.hp = Math.min(state.hp, state.max)
            if (!state.dead && state.hp <= 0) state.hp = state.max
        }
        state.sinceHit += dt
        if (state.dead) {
            state.deadTime += dt
            state.fall = Math.min(1, state.fall + dt * 3)
            if (state.deadTime > 2.2) {
                state.dead = false
                state.hp = state.max
            }
        } else {
            state.fall = Math.max(0, state.fall - dt * 2.5)
            if (state.sinceHit > P.regenDelay) state.hp = Math.min(state.max, state.hp + (state.max * P.regenPct * dt) / 100)
        }
        for (const [a, v] of [
            ["ax", "vx"],
            ["az", "vz"]
        ]) {
            state[v] += (-90 * state[a] - 5 * state[v]) * dt
            state[a] = Math.max(-0.6, Math.min(0.6, state[a] + state[v] * dt))
        }
        // Topple backwards (away from the player) when emptied.
        const fallEase = state.fall * state.fall * (3 - 2 * state.fall)
        body.rotation.set(state.ax - fallEase * 1.35, 0, state.az)
        state.flash = Math.max(0, state.flash - dt * 8)
        for (const m of flashMats) m.emissive.setRGB(state.flash * 0.5, state.flash * 0.08, state.flash * 0.04)
        body.updateMatrixWorld(true)
        state.headPos.set(0, 0.32, 0)
        head.localToWorld(state.headPos)
    }

    return Object.assign(api, { state, hit, update })
}
