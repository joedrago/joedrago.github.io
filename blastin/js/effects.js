// World-space effects: bullet-hole decals, spark streaks, dust and smoke puffs, tracers and brass.
// Everything is pooled so sustained fire never allocates.

import * as THREE from "three"
import { values as P } from "./params.js"
import { playShell } from "./audio.js"

function canvas(size, draw) {
    const c = document.createElement("canvas")
    c.width = c.height = size
    draw(c.getContext("2d"), size)
    const t = new THREE.CanvasTexture(c)
    t.colorSpace = THREE.SRGBColorSpace
    return t
}

// A crater: dark core, chipped rim, a few radial cracks.
function holeTexture(rim, core) {
    return canvas(128, (g, s) => {
        const c = s / 2
        const grad = g.createRadialGradient(c, c, 0, c, c, c)
        grad.addColorStop(0, core)
        grad.addColorStop(0.16, core)
        grad.addColorStop(0.24, rim)
        grad.addColorStop(0.55, rim.replace(/[\d.]+\)$/, "0.25)"))
        grad.addColorStop(1, "rgba(0,0,0,0)")
        g.fillStyle = grad
        g.fillRect(0, 0, s, s)
        g.strokeStyle = core
        g.lineWidth = 1.5
        for (let i = 0; i < 7; i++) {
            const a = Math.random() * Math.PI * 2
            const r0 = s * 0.12
            const r1 = s * (0.25 + Math.random() * 0.2)
            g.beginPath()
            g.moveTo(c + Math.cos(a) * r0, c + Math.sin(a) * r0)
            g.lineTo(c + Math.cos(a + 0.2) * r1, c + Math.sin(a + 0.2) * r1)
            g.stroke()
        }
    })
}

// The energy palette shared by muzzle flashes, lights, tracers, beams and impact pops.
const PALETTE = {
    fire: [1, 0.55, 0.22],
    blue: [0.3, 0.6, 1],
    red: [1, 0.16, 0.12],
    green: [0.35, 1, 0.3],
    purple: [0.72, 0.32, 1]
}

export function energyColor(out) {
    return out.setRGB(...(PALETTE[P.fxColor] ?? PALETTE.fire))
}

export function softTexture() {
    return canvas(64, (g, s) => {
        const grad = g.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2)
        grad.addColorStop(0, "rgba(255,255,255,1)")
        grad.addColorStop(0.4, "rgba(255,255,255,0.5)")
        grad.addColorStop(1, "rgba(255,255,255,0)")
        g.fillStyle = grad
        g.fillRect(0, 0, s, s)
    })
}

export function createEffects(scene) {
    const holeTex = {
        concrete: holeTexture("rgba(60,56,50,0.85)", "rgba(10,10,10,1)"),
        wood: holeTexture("rgba(70,42,20,0.9)", "rgba(15,8,4,1)"),
        metal: holeTexture("rgba(225,225,230,0.9)", "rgba(60,60,64,1)"),
        paper: holeTexture("rgba(40,40,40,0.5)", "rgba(5,5,5,1)"),
        dummy: holeTexture("rgba(70,52,30,0.85)", "rgba(20,12,6,1)")
    }
    const soft = softTexture()

    // --- decals -------------------------------------------------------------------------------
    const decalGeo = new THREE.PlaneGeometry(1, 1)
    const decals = []
    let decalNext = 0
    for (let i = 0; i < 300; i++) {
        const mat = new THREE.MeshStandardMaterial({
            transparent: true,
            depthWrite: false,
            polygonOffset: true,
            polygonOffsetFactor: -4,
            polygonOffsetUnits: -4,
            roughness: 1
        })
        const m = new THREE.Mesh(decalGeo, mat)
        m.visible = false
        m.renderOrder = 1
        m.userData.age = 0
        decals.push(m)
        scene.add(m)
    }
    const tmpQ = new THREE.Quaternion()
    const zAxis = new THREE.Vector3(0, 0, 1)

    function addDecal(object, point, normal, surface) {
        const d = decals[decalNext]
        decalNext = (decalNext + 1) % decals.length
        scene.attach(d)
        d.material.map = holeTex[surface] ?? holeTex.concrete
        d.material.opacity = 1
        d.material.needsUpdate = true
        d.position.copy(point).addScaledVector(normal, 0.002)
        d.quaternion.setFromUnitVectors(zAxis, normal)
        d.quaternion.multiply(tmpQ.setFromAxisAngle(zAxis, Math.random() * Math.PI * 2))
        const size = 0.11 * P.decalSize * (surface === "metal" ? 0.7 : 1) * (0.85 + Math.random() * 0.3)
        d.scale.set(size, size, size)
        d.visible = true
        d.userData.age = 0
        // Ride along with things that move (the swinging plates).
        if (object.userData.target) object.attach(d)
    }

    // --- sparks (line streaks) ----------------------------------------------------------------
    const SPARKS = 600
    const sparkPos = new Float32Array(SPARKS * 6)
    const sparkCol = new Float32Array(SPARKS * 6)
    const sparkGeo = new THREE.BufferGeometry()
    sparkGeo.setAttribute("position", new THREE.BufferAttribute(sparkPos, 3).setUsage(THREE.DynamicDrawUsage))
    sparkGeo.setAttribute("color", new THREE.BufferAttribute(sparkCol, 3).setUsage(THREE.DynamicDrawUsage))
    const sparkLines = new THREE.LineSegments(
        sparkGeo,
        new THREE.LineBasicMaterial({ vertexColors: true, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false, toneMapped: false })
    )
    sparkLines.frustumCulled = false
    scene.add(sparkLines)
    const sparks = Array.from({ length: SPARKS }, () => ({ p: new THREE.Vector3(), v: new THREE.Vector3(), life: 0, max: 1, color: new THREE.Color() }))
    let sparkNext = 0

    const WHITE = new THREE.Color(1, 1, 1)

    function addSparks(point, normal, dir, surface, scale = 1) {
        addPop(point, normal, surface)
        const n = Math.round(P.sparks * scale * (surface === "metal" ? 1.6 : surface === "concrete" ? 1 : 0.35))
        const reflect = dir.clone().reflect(normal)
        for (let i = 0; i < n; i++) {
            const s = sparks[sparkNext]
            sparkNext = (sparkNext + 1) % SPARKS
            s.p.copy(point).addScaledVector(normal, 0.01)
            s.v.set(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5)
                .multiplyScalar(1.4)
                .add(normal)
                .add(reflect)
                .normalize()
                .multiplyScalar(P.sparkSpeed * (0.3 + Math.random()))
            s.max = s.life = 0.15 + Math.random() * 0.35
            if (P.fxColor === "fire") s.color.setRGB(1, 0.75, 0.35)
            else energyColor(s.color).lerp(WHITE, 0.3)
        }
    }

    // --- puffs (dust and smoke sprites) -------------------------------------------------------
    const puffs = []
    for (let i = 0; i < 160; i++) {
        const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: soft, transparent: true, depthWrite: false, fog: true }))
        sp.visible = false
        sp.userData = { v: new THREE.Vector3(), life: 0, max: 1, grow: 1, alpha: 1, size: 1 }
        puffs.push(sp)
        scene.add(sp)
    }
    let puffNext = 0

    function addPuff(pos, vel, size, grow, life, alpha, color) {
        const sp = puffs[puffNext]
        puffNext = (puffNext + 1) % puffs.length
        sp.position.copy(pos)
        Object.assign(sp.userData, { life, max: life, grow, alpha, size })
        sp.userData.v.copy(vel)
        sp.material.color.set(color)
        sp.material.rotation = Math.random() * Math.PI * 2
        sp.visible = true
    }

    function addDust(point, normal, surface, count = 3) {
        if (P.dust <= 0) return
        const color = { wood: 0x6e5236, metal: 0xb8b8b8, dummy: 0xc2a878, dirt: 0x7a6248 }[surface] ?? 0x7a756c
        for (let i = 0; i < count; i++) {
            const v = normal.clone().multiplyScalar(0.6 + Math.random()).add(new THREE.Vector3(Math.random() - 0.5, Math.random() * 0.4, Math.random() - 0.5))
            addPuff(point.clone().addScaledVector(normal, 0.05), v, 0.18 * P.dust, 1.1 * P.dust, 0.6 + Math.random() * 0.6, Math.min(1, 0.7 * P.dust), color)
        }
    }

    function addSmoke(pos, forward) {
        if (P.smoke <= 0) return
        const v = forward.clone().multiplyScalar(0.4 + Math.random() * 0.4).add(new THREE.Vector3((Math.random() - 0.5) * 0.2, 0.25, (Math.random() - 0.5) * 0.2))
        addPuff(pos, v, 0.05, 0.5 * P.smoke, 0.7 + Math.random() * 0.6, 0.18 * Math.min(1.5, P.smoke), 0xdddddd)
    }

    // --- impact flashes: a brief additive pop so hits read even at 25 m -------------------------
    const pops = []
    for (let i = 0; i < 24; i++) {
        const sp = new THREE.Sprite(
            new THREE.SpriteMaterial({ map: soft, color: new THREE.Color(3, 2, 1), blending: THREE.AdditiveBlending, transparent: true, depthWrite: false, toneMapped: false, fog: false })
        )
        sp.visible = false
        sp.userData.life = 0
        pops.push(sp)
        scene.add(sp)
    }
    let popNext = 0

    function addPop(point, normal, surface) {
        if (P.sparks <= 0) return
        const sp = pops[popNext]
        popNext = (popNext + 1) % pops.length
        sp.position.copy(point).addScaledVector(normal, 0.05)
        const s = (surface === "metal" ? 0.45 : 0.3) * (0.8 + Math.random() * 0.4)
        sp.scale.set(s, s, s)
        sp.material.rotation = Math.random() * Math.PI
        sp.userData.life = 0.06
        energyColor(sp.material.color)
        if (P.fxColor === "fire") sp.material.color.setRGB(3, 2, 1)
        else sp.material.color.multiplyScalar(3)
        sp.visible = true
    }

    // --- tracers: streaks, glowing bolts, and lingering beams ------------------------------------
    const tracerGeo = new THREE.BoxGeometry(1, 1, 1).translate(0, 0, 0.5)
    const tracers = []
    for (let i = 0; i < 96; i++) {
        const m = new THREE.Mesh(
            tracerGeo,
            new THREE.MeshBasicMaterial({ blending: THREE.AdditiveBlending, transparent: true, depthWrite: false, toneMapped: false, fog: false })
        )
        m.visible = false
        const glow = new THREE.Sprite(
            new THREE.SpriteMaterial({ map: soft, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false, toneMapped: false, fog: false })
        )
        glow.visible = false
        scene.add(glow)
        m.userData = { from: new THREE.Vector3(), dir: new THREE.Vector3(), dist: 0, travelled: 0, age: 0, style: "streak", glow, arrive: null }
        tracers.push(m)
        scene.add(m)
    }
    let tracerNext = 0
    const tint = new THREE.Color()

    // onArrive (optional) runs when a streak or bolt reaches its target, so slow projectiles land
    // their impact when they visibly hit rather than the instant the trigger is pulled.
    function addTracer(from, to, onArrive = null) {
        const t = tracers[tracerNext]
        tracerNext = (tracerNext + 1) % tracers.length
        // A recycled tracer still in flight lands its impact now rather than never.
        t.userData.arrive?.()
        const u = t.userData
        u.from.copy(from)
        u.dir.subVectors(to, from)
        u.dist = u.dir.length()
        u.dir.normalize()
        u.travelled = 0
        u.age = 0
        u.style = P.tracerStyle
        u.arrive = u.style === "beam" ? null : onArrive
        energyColor(tint)
        if (u.style === "beam") {
            t.material.color.copy(tint).multiplyScalar(P.fxColor === "fire" ? 3 : 1.5)
            // A railgun beam leaves a wisp of ionised smoke along its path.
            if (P.smoke > 0)
                for (let d = 1.5; d < u.dist; d += 1.2 + Math.random())
                    addPuff(
                        tmpP.copy(from).addScaledVector(u.dir, d),
                        tmpV2.set((Math.random() - 0.5) * 0.15, 0.1, (Math.random() - 0.5) * 0.15),
                        0.05,
                        0.35 * P.smoke,
                        1.2 + Math.random() * 0.8,
                        0.1 * Math.min(1.5, P.smoke),
                        0xcfd4dc
                    )
        } else {
            t.material.color.copy(tint).multiplyScalar(P.fxColor === "fire" ? 4 : 1.6)
        }
        t.material.opacity = 1
        u.glow.visible = u.style === "bolt"
        u.glow.material.color.copy(tint).multiplyScalar(1.5)
        t.visible = true
        t.lookAt(to)
        if (u.dist < 0.01 && u.arrive) {
            const arrive = u.arrive
            u.arrive = null
            arrive()
        }
    }
    const tmpP = new THREE.Vector3()
    const tmpV2 = new THREE.Vector3()

    // --- shells --------------------------------------------------------------------------------
    const shellGeo = new THREE.CylinderGeometry(0.004, 0.004, 0.028, 8).rotateZ(Math.PI / 2)
    const shellMat = new THREE.MeshStandardMaterial({ color: 0xc8963c, metalness: 0.9, roughness: 0.3 })
    const shells = []
    for (let i = 0; i < 80; i++) {
        const m = new THREE.Mesh(shellGeo, shellMat)
        m.visible = false
        m.castShadow = true
        m.userData = { v: new THREE.Vector3(), spin: new THREE.Vector3(), life: 0, bounces: 0 }
        shells.push(m)
        scene.add(m)
    }
    let shellNext = 0

    function addShell(pos, right, up, forward, cameraRight) {
        if (!P.shells) return
        const s = shells[shellNext]
        shellNext = (shellNext + 1) % shells.length
        s.position.copy(pos)
        s.userData.v
            .copy(right)
            .multiplyScalar(P.shellSpeed * (0.8 + Math.random() * 0.4))
            .addScaledVector(up, P.shellSpeed * (0.5 + Math.random() * 0.3))
            .addScaledVector(forward, -0.3 + Math.random() * 0.4)
        s.userData.spin.set(Math.random() * 30, Math.random() * 30, Math.random() * 30)
        s.userData.life = 4
        s.userData.bounces = 0
        s.userData.cameraRight = cameraRight
        s.quaternion.random()
        s.visible = true
    }

    const tmpE = new THREE.Euler()
    const tmpQ2 = new THREE.Quaternion()

    function update(dt, camera) {
        // Decal fade.
        if (P.decalLife > 0) {
            for (const d of decals) {
                if (!d.visible) continue
                d.userData.age += dt
                const fade = 1 - (d.userData.age - P.decalLife) / 1.5
                if (fade <= 0) d.visible = false
                else d.material.opacity = Math.min(1, fade)
            }
        }

        // Sparks: gravity + drag, drawn as a streak from current position back along velocity.
        for (let i = 0; i < SPARKS; i++) {
            const s = sparks[i]
            const o = i * 6
            if (s.life <= 0) {
                sparkCol.fill(0, o, o + 6)
                continue
            }
            s.life -= dt
            s.v.y -= 9.8 * dt
            s.v.multiplyScalar(1 - 2.5 * dt)
            s.p.addScaledVector(s.v, dt)
            const k = Math.max(0, s.life / s.max)
            sparkPos[o] = s.p.x
            sparkPos[o + 1] = s.p.y
            sparkPos[o + 2] = s.p.z
            sparkPos[o + 3] = s.p.x - s.v.x * 0.025
            sparkPos[o + 4] = s.p.y - s.v.y * 0.025
            sparkPos[o + 5] = s.p.z - s.v.z * 0.025
            const c = s.color
            sparkCol[o] = c.r * k
            sparkCol[o + 1] = c.g * k * k
            sparkCol[o + 2] = c.b * k * k
            sparkCol[o + 3] = c.r * 0.6 * k
            sparkCol[o + 4] = c.g * 0.35 * k * k
            sparkCol[o + 5] = c.b * 0.2 * k
        }
        sparkGeo.attributes.position.needsUpdate = true
        sparkGeo.attributes.color.needsUpdate = true

        for (const sp of puffs) {
            if (!sp.visible) continue
            const u = sp.userData
            u.life -= dt
            if (u.life <= 0) {
                sp.visible = false
                continue
            }
            const t = 1 - u.life / u.max
            sp.position.addScaledVector(u.v, dt)
            u.v.multiplyScalar(1 - 2 * dt)
            const size = u.size + u.grow * Math.sqrt(t)
            sp.scale.set(size, size, size)
            sp.material.opacity = u.alpha * (1 - t) * Math.min(1, t * 8)
        }

        for (const sp of pops) {
            if (!sp.visible) continue
            sp.userData.life -= dt
            if (sp.userData.life <= 0) sp.visible = false
            else sp.material.opacity = sp.userData.life / 0.06
        }

        const width = P.tracerWidth / 100
        for (const t of tracers) {
            if (!t.visible) continue
            const u = t.userData
            u.age += dt
            if (u.style === "beam") {
                const k = 1 - u.age / P.beamFade
                if (k <= 0) {
                    t.visible = false
                    continue
                }
                t.position.copy(u.from)
                const w = width * (0.4 + 0.6 * k)
                t.scale.set(w, w, u.dist)
                t.material.opacity = k * k
                continue
            }
            u.travelled += P.tracerSpeed * dt
            const head = Math.min(u.travelled, u.dist)
            const tail = Math.max(0, u.travelled - P.tracerLength)
            if (u.arrive && u.travelled >= u.dist) {
                const arrive = u.arrive
                u.arrive = null
                arrive()
            }
            if (tail >= u.dist) {
                t.visible = false
                u.glow.visible = false
                continue
            }
            t.position.copy(u.from).addScaledVector(u.dir, tail)
            t.scale.set(width, width, Math.max(0.01, head - tail))
            if (u.style === "bolt") {
                u.glow.position.copy(u.from).addScaledVector(u.dir, head)
                u.glow.scale.setScalar(width * 6)
                u.glow.visible = u.travelled < u.dist
            }
        }

        for (const s of shells) {
            if (!s.visible) continue
            const u = s.userData
            u.life -= dt
            if (u.life <= 0) {
                s.visible = false
                continue
            }
            u.v.y -= 9.8 * dt
            s.position.addScaledVector(u.v, dt)
            tmpQ2.setFromEuler(tmpE.set(u.spin.x * dt, u.spin.y * dt, u.spin.z * dt))
            s.quaternion.multiply(tmpQ2)
            if (s.position.y < 0.006) {
                s.position.y = 0.006
                if (u.v.y < -0.4) {
                    if (u.bounces < 3) {
                        const rel = s.position.clone().sub(camera.position)
                        playShell(Math.max(-1, Math.min(1, rel.dot(u.cameraRight) * 2)))
                    }
                    u.bounces++
                }
                u.v.y *= -0.35
                u.v.x *= 0.6
                u.v.z *= 0.6
                u.spin.multiplyScalar(0.6)
            }
            if (u.life < 0.5) s.scale.setScalar(u.life * 2)
            else s.scale.setScalar(1)
        }
    }

    return { addDecal, addSparks, addDust, addSmoke, addTracer, addShell, update }
}
