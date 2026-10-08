// blastin': boot, input, the firing model, camera feel (recoil, punch, shake, FOV) and the frame loop.

import * as THREE from "three"
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js"
import * as params from "./params.js"
import { values as P } from "./params.js"
import { createWorld, DUMMY_Z } from "./world.js"
import { createEffects, energyColor } from "./effects.js"
import { createViewmodel } from "./viewmodel.js"
import { createMenu } from "./menu.js"
import * as audio from "./audio.js"

const DEG = Math.PI / 180
const EYE = 1.62

const debug = { frames: 0, error: null, input: { fire: false, ads: false } }
window.__blastin = debug

const $ = (id) => document.getElementById(id)

function fail(err) {
    console.error(err)
    debug.error = String(err?.message ?? err)
    $("loading").hidden = true
    $("error").hidden = false
    $("error").textContent = `Something broke: ${debug.error}`
}

async function boot() {
    params.loadFromQuery()

    const canvas = $("view")
    const stage = $("stage")
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: "high-performance" })
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2))
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.shadowMap.enabled = true
    renderer.autoClear = false

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(P.fov, 1, 0.05, 300)
    const vmScene = new THREE.Scene()
    const vmCamera = new THREE.PerspectiveCamera(P.vmFov, 1, 0.01, 10)

    const pmrem = new THREE.PMREMGenerator(renderer)
    const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
    scene.environment = env
    scene.environmentIntensity = 0.35
    vmScene.environment = env
    vmScene.environmentIntensity = 0.6

    const world = createWorld(scene)
    const fx = createEffects(scene)
    const vm = await createViewmodel(vmScene, vmCamera)

    function applyTime() {
        world.setTime(P.time)
        scene.environmentIntensity = world.lighting.env
        vmScene.environmentIntensity = world.lighting.env * 1.7
    }
    applyTime()

    // Muzzle light in the world, positioned at the viewmodel muzzle's world-space equivalent.
    const worldFlash = new THREE.PointLight(0xffa860, 0, 14, 2)
    scene.add(worldFlash)

    const menu = createMenu($("menu"), { toggleFullscreen: () => toggleFullscreen() })

    // ---------------------------------------------------------------------------------------
    // State

    // speedRatio: current speed relative to walking, which scales the bob.
    const player = { pos: new THREE.Vector3(0, 0, 4), yaw: 0, pitch: 0, walkPhase: 0, move: 0, speedRatio: 1 }

    // Aim recoil: accumulated offset on top of the player's aim, plus the part still being applied.
    const recoil = { pitch: 0, yaw: 0, pendPitch: 0, pendYaw: 0, recovering: true }

    // View punch springs (radians) and trauma shake.
    const punch = { pitch: spring(), yaw: spring(), roll: spring() }
    let trauma = 0
    const shakeSeed = Array.from({ length: 6 }, () => Math.random() * 1000)

    let fovKick = 0
    let exposureKick = 0
    let bloom = 0
    let adsT = 0
    let fireTimer = 0
    let lastShotTime = -10
    let shotIndex = 0
    let burstLeft = 0
    let triggerWasDown = false
    let ammo = P.mag || Infinity
    let reloading = false
    let shotsFired = 0
    let shotsHit = 0
    let hitmarkerT = 0
    // 0 = normal hit, 1 = headshot, 2 = kill; picks the hitmarker colour.
    let hitmarkerKind = 0
    // Seconds the trigger has been held toward P.chargeTime.
    let charge = 0
    // Sprint and crouch blends (0..1). The gun can't fire or aim until sprintT is back to 0.
    let sprintT = 0
    let crouched = false
    let crouchT = 0
    let time = 0
    const look = { x: 0, y: 0 }

    function spring() {
        return { x: 0, v: 0 }
    }
    function stepSpring(s, dt, k, zeta) {
        let rem = dt
        const c = 2 * zeta * Math.sqrt(k)
        while (rem > 0) {
            const h = Math.min(rem, 1 / 240)
            s.v += (-k * s.x - c * s.v) * h
            s.x += s.v * h
            rem -= h
        }
    }

    // ---------------------------------------------------------------------------------------
    // Input

    const input = { fire: false, ads: false, keys: new Set() }
    // The panel is always visible; Space swaps between the gun owning the mouse (pointer lock) and a
    // free cursor for the sliders. `started` hides the click-to-play screen after the first capture.
    let started = false
    // Set when the browser refuses pointer lock (e.g. inside some iframes); clicks then fire directly.
    let lockRefused = false
    const locked = () => document.pointerLockElement === canvas

    function lock() {
        audio.startAudio().catch(fail)
        const req = canvas.requestPointerLock?.({ unadjustedMovement: true })
        // Raw input isn't available everywhere; fall back to plain pointer lock.
        req?.catch?.(() => canvas.requestPointerLock()?.catch?.(() => {}))
    }

    function toggleControl() {
        if (locked()) document.exitPointerLock()
        else lock()
    }

    function updateOverlay() {
        const playing = locked()
        document.body.classList.toggle("playing", playing)
        $("start").hidden = started || playing || lockRefused
        $("mode-hint").innerHTML = !started
            ? ""
            : playing
              ? "<kbd>Space</kbd> free the cursor to tune"
              : "<kbd>Space</kbd> take the gun &nbsp;·&nbsp; or click here to test-fire"
    }

    canvas.addEventListener("mousedown", (e) => {
        audio.startAudio().catch(fail)
        if (!locked() && !started && !lockRefused) {
            lock()
            return
        }
        if (e.button === 0) input.fire = true
        if (e.button === 2) input.ads = true
    })
    $("start").addEventListener("mousedown", (e) => {
        e.preventDefault()
        lock()
    })
    window.addEventListener("mouseup", (e) => {
        if (e.button === 0) input.fire = false
        if (e.button === 2) input.ads = false
    })
    window.addEventListener("contextmenu", (e) => {
        if (!e.target.closest?.("#menu")) e.preventDefault()
    })
    document.addEventListener("pointerlockerror", () => {
        lockRefused = true
        updateOverlay()
    })
    document.addEventListener("pointerlockchange", () => {
        if (locked()) {
            lockRefused = false
            started = true
        }
        input.fire = false
        input.ads = false
        updateOverlay()
    })
    window.addEventListener("mousemove", (e) => {
        if (!locked()) return
        const sens = P.sens * 0.0022 * THREE.MathUtils.lerp(1, P.adsSens, ease(adsT))
        player.yaw -= e.movementX * sens
        player.pitch = THREE.MathUtils.clamp(player.pitch - e.movementY * sens, -1.5, 1.5)
        look.x -= e.movementX * sens
        look.y -= e.movementY * sens
    })
    window.addEventListener(
        "keydown",
        (e) => {
            const typing = e.target.matches?.("input[type=number], input[type=search], input[type=text]")
            if (e.code === "Space" && !typing) {
                e.preventDefault()
                e.stopPropagation()
                if (!e.repeat) toggleControl()
                return
            }
            if (typing) return
            input.keys.add(e.code)
            if (e.code === "KeyR") startReload()
            if ((e.code === "ControlLeft" || e.code === "ControlRight") && !e.repeat) {
                e.preventDefault()
                crouched = !crouched
            }
            if (e.code === "KeyF" && !e.repeat) toggleFullscreen()
            if (e.code === "Slash" && !locked()) {
                e.preventDefault()
                menu.focusFilter()
            }
        },
        true
    )
    window.addEventListener("keyup", (e) => input.keys.delete(e.code))
    window.addEventListener("blur", () => {
        input.keys.clear()
        input.fire = false
        input.ads = false
    })

    let relockAfterFullscreen = false
    function toggleFullscreen() {
        audio.startAudio().catch(fail)
        relockAfterFullscreen = locked()
        if (document.fullscreenElement) document.exitFullscreen()
        // Keyboard lock (Chromium, fullscreen only) keeps Ctrl+W and friends from closing the tab
        // mid-crouch; Esc then needs a long press to leave fullscreen.
        else
            document.documentElement
                .requestFullscreen?.()
                .then(() => navigator.keyboard?.lock?.())
                .catch(() => {})
    }

    // Switching fullscreen can drop pointer lock; grab it back while the keypress still counts as a gesture.
    document.addEventListener("fullscreenchange", () => {
        menu.setFullscreen(!!document.fullscreenElement)
        if (relockAfterFullscreen && !locked()) lock()
    })

    params.onChange((key) => {
        if (key === null || key === "volume") audio.setVolume(P.volume)
        if (key === null || key === "mag") {
            ammo = P.mag || Infinity
            updateHud()
        }
        if (key === null || key === "time") applyTime()
        if (key === null || key === "weapon") {
            charge = 0
            audio.stopCharge()
            vm.setWeapon(P.weapon).catch(fail)
        }
    })

    debug.debugInput = (v) => Object.assign(debug.input, v)
    debug.player = player

    // ---------------------------------------------------------------------------------------
    // Firing

    const raycaster = new THREE.Raycaster()
    raycaster.far = 300
    const aimQuat = new THREE.Quaternion()
    const aimEuler = new THREE.Euler(0, 0, 0, "YXZ")
    const tmp = new THREE.Vector3()
    const camRight = new THREE.Vector3()
    const camUp = new THREE.Vector3()
    const camFwd = new THREE.Vector3()
    const pelletTmp = new THREE.Vector2()

    function ease(t) {
        return t * t * (3 - 2 * t)
    }

    function currentSpread(adsE) {
        const crouchMul = THREE.MathUtils.lerp(1, P.crouchSpread, ease(crouchT))
        return (THREE.MathUtils.lerp(P.spreadHip, P.spreadAds, adsE) + bloom) * crouchMul
    }

    // Map a point in viewmodel camera space to the world point that appears at the same pixel and
    // depth, so tracers, smoke and brass appear to leave the gun drawn with a different FOV.
    const vmToWorld = (() => {
        const p = new THREE.Vector3()
        return (obj, out) => {
            obj.getWorldPosition(p)
            const depth = -p.z
            p.project(vmCamera)
            out.set(p.x, p.y, 0.5).unproject(camera).sub(camera.position).normalize()
            const along = out.dot(camFwd)
            return out.multiplyScalar(depth / along).add(camera.position)
        }
    })()

    function startReload() {
        if (reloading || !P.mag || ammo === P.mag) return
        if (vm.startReload(() => {
            ammo = P.mag
            reloading = false
            updateHud()
        })) {
            reloading = true
            audio.playReload()
        }
    }

    // Where pellet i of n lands inside the unit disk, for the chosen pattern.
    function pelletOffset(i, n, out) {
        if (n === 1) return out.set(0, 0)
        let r
        let th
        if (P.pelletPattern === "random") {
            r = Math.sqrt(Math.random())
            th = Math.random() * Math.PI * 2
        } else if (P.pelletPattern === "ring") {
            // One centre pellet, then an inner ring (big loads only) and an outer ring.
            const inner = n > 8 ? Math.floor((n - 1) / 3) : 0
            if (i === 0) r = th = 0
            else if (i <= inner) {
                r = 0.5
                th = ((i - 1) / inner) * Math.PI * 2 + 0.4
            } else {
                r = 1
                th = ((i - 1 - inner) / (n - 1 - inner)) * Math.PI * 2
            }
        } else {
            // Sunflower spiral: evenly filled and identical every shot.
            r = Math.sqrt((i + 0.5) / n)
            th = i * 2.39996
        }
        const j = P.pelletPattern !== "random" ? P.pelletJitter : 0
        return out.set(Math.cos(th) * r + (Math.random() - 0.5) * j, Math.sin(th) * r + (Math.random() - 0.5) * j)
    }

    function falloff(distance) {
        const min = P.falloffMin / 100
        if (distance <= P.falloffStart) return 1
        if (distance >= P.falloffEnd) return min
        return THREE.MathUtils.lerp(1, min, (distance - P.falloffStart) / (P.falloffEnd - P.falloffStart))
    }

    // Everything that happens where a bullet lands. shot tracks per-trigger-pull hit accounting.
    function applyImpact(hit, dir, pellet, pellets, shot) {
        const surface = hit.object.userData.surface ?? "concrete"
        const normal = hit.face.normal.clone().transformDirection(hit.object.matrixWorld)
        if (normal.dot(dir) > 0) normal.negate()
        fx.addDecal(hit.object, hit.point, normal, surface)
        fx.addSparks(hit.point, normal, dir, surface, pellets > 1 ? 1.5 / Math.sqrt(pellets) : 1)
        fx.addDust(hit.point, normal, surface, pellets > 1 ? 1 : 3)
        if (pellet < 3) {
            const panX = THREE.MathUtils.clamp(tmp.subVectors(hit.point, camera.position).normalize().dot(camRight) * 1.5, -1, 1)
            audio.playImpact(surface === "paper" ? "concrete" : surface, hit.distance, panX)
        }
        const markHit = (strength) => {
            if (!shot.counted) {
                shot.counted = true
                shotsHit++
            }
            if (P.hitmarker) {
                hitmarkerT = 1
                hitmarkerKind = Math.max(hitmarkerKind, strength)
            }
        }
        if (hit.object.userData.target) {
            world.hitTarget(hit.object, hit.point, dir.clone().multiplyScalar(pellets > 1 ? 1.5 / Math.sqrt(pellets) : 1))
            markHit(0)
        }
        const part = hit.object.userData.dummy
        if (part) {
            const head = part === "head"
            const amount = P.damage * falloff(hit.distance) * (head ? P.headMult : 1)
            const dummy = hit.object.userData.owner
            const { dealt, killed } = dummy.hit(hit.object, hit.point, dir, amount)
            if (dealt > 0) {
                showDamage(dummy, hit.point, dealt, head, killed)
                markHit(killed ? 2 : head ? 1 : 0)
            }
        }
    }

    function fireShot() {
        const adsE = ease(adsT)
        const sinceLast = time - lastShotTime
        const interval = 60 / P.rpm
        if (sinceLast > interval * 1.6 + 0.04) shotIndex = 0
        lastShotTime = time
        shotsFired++
        ammo--

        // Accuracy: one random offset for the whole trigger pull, uniform over the spread cone.
        let spread = currentSpread(adsE)
        if (P.firstShot && shotIndex === 0) spread = 0
        const r = Math.tan(spread * DEG) * Math.sqrt(Math.random())
        const th = Math.random() * Math.PI * 2
        const ax = Math.cos(th) * r
        const ay = Math.sin(th) * r
        aimEuler.set(player.pitch + recoil.pitch, player.yaw + recoil.yaw, 0)
        aimQuat.setFromEuler(aimEuler)

        const muzzleWorld = vmToWorld(vm.muzzle, new THREE.Vector3())
        const tracerShot = P.tracerEvery > 0 && shotsFired % P.tracerEvery === 0
        const pellets = P.pellets
        const cone = Math.tan(P.pelletSpread * DEG)
        const shot = { counted: false }
        for (let i = 0; i < pellets; i++) {
            pelletOffset(i, pellets, pelletTmp)
            const dir = new THREE.Vector3(ax + pelletTmp.x * cone, ay + pelletTmp.y * cone, -1).normalize().applyQuaternion(aimQuat)
            raycaster.set(camera.position, dir)
            const hit = raycaster.intersectObjects(world.collidables, false)[0]
            const end = hit ? hit.point : camera.position.clone().addScaledVector(dir, 200)
            const impact = hit ? () => applyImpact(hit, dir, i, pellets, shot) : null
            if (tracerShot && i < 16) {
                // Bolts are visible projectiles, so their impact waits until they arrive.
                const delayed = P.tracerStyle === "bolt" && impact
                fx.addTracer(muzzleWorld, end, delayed ? impact : null)
                if (!delayed) impact?.()
            } else impact?.()
        }

        fx.addSmoke(muzzleWorld, camFwd)
        const ejectWorld = vmToWorld(vm.eject, new THREE.Vector3())
        fx.addShell(ejectWorld, camRight, camUp, camFwd, camRight.clone())

        // Aim recoil: first-shot multiplier, then a ramp up to full strength over recoilRamp shots.
        let mult = P.recoilRamp > 0 ? Math.min(1, 0.45 + (0.55 * shotIndex) / P.recoilRamp) : 1
        if (shotIndex === 0) mult = P.recoilFirst
        mult *= THREE.MathUtils.lerp(1, P.recoilAds, adsE)
        recoil.pendPitch += P.recoilUp * DEG * mult
        recoil.pendYaw -= P.recoilSide * DEG * mult * (Math.random() * 2 - 1 + P.recoilBias * 1.5)
        recoil.recovering = false

        // View punch (spring impulses scaled by sqrt(k) so the dial reads as peak degrees).
        const pk = Math.sqrt(P.punchStiff)
        const pm = THREE.MathUtils.lerp(1, P.punchAds, adsE)
        punch.pitch.v += P.punchPitch * DEG * pk * pm * (0.8 + Math.random() * 0.4)
        punch.yaw.v += P.punchYaw * DEG * pk * pm * (Math.random() * 2 - 1)
        punch.roll.v += P.punchRoll * DEG * pk * pm * (Math.random() * 2 - 1)

        trauma = Math.min(1, trauma + P.shake * THREE.MathUtils.lerp(1, P.shakeAds, adsE))
        fovKick = THREE.MathUtils.clamp(fovKick + P.fovPunch, -P.fovMax, P.fovMax)
        exposureKick = Math.min(1.2, exposureKick + P.exposure)
        bloom = Math.min(P.bloomMax, bloom + P.bloom)

        vm.fire(adsE)
        if (vm.flashing()) {
            energyColor(worldFlash.color)
            worldFlash.intensity = 40 * P.flashLight
            worldFlash.position.copy(muzzleWorld)
        }
        // A charged shot releases its whine; a spun-up automatic keeps humming.
        if (P.mode !== "auto") audio.stopCharge()
        audio.playShot()
        shotIndex++
    }

    function updateFiring(dt) {
        const fireDown = (input.fire || debug.input.fire) && !reloading && sprintT === 0
        const interval = 60 / P.rpm
        fireTimer = Math.max(fireTimer - dt, -dt)

        // A burst runs to completion even if the trigger is released partway; reloading cancels it.
        if (reloading) burstLeft = 0
        const pressed = fireDown && !triggerWasDown
        triggerWasDown = fireDown
        if (pressed && P.mode === "burst") burstLeft = 3
        if (pressed && P.mode === "semi") burstLeft = 1
        const wants = P.mode === "auto" ? fireDown : burstLeft > 0

        if (wants && ammo <= 0) {
            if (pressed) audio.playDryFire()
            if (pressed || fireTimer <= 0) startReload()
            return
        }

        // Charge / spin-up: the trigger must be held for chargeTime before anything fires, and
        // letting go starts over.
        if (P.chargeTime > 0) {
            if (fireDown && ammo > 0) {
                if (charge === 0) audio.startCharge(P.chargeTime)
                charge = Math.min(P.chargeTime, charge + dt)
            } else if (charge > 0) {
                charge = 0
                audio.stopCharge()
            }
            if (charge < P.chargeTime) return
        }

        // Several shots may fall in one frame at high RPM or low frame rate.
        while (wants && fireTimer <= 0 && ammo > 0 && (P.mode === "auto" || burstLeft > 0)) {
            fireShot()
            fireTimer += interval
            if (P.mode !== "auto") burstLeft--
        }
        if (P.mag && ammo <= 0 && !reloading && time - lastShotTime > 0.25) startReload()
    }

    // ---------------------------------------------------------------------------------------
    // Camera feel

    function noise(seed, t) {
        // Cheap smooth noise: three incommensurate sines.
        return (Math.sin(t * 1.0 + seed) + Math.sin(t * 2.17 + seed * 1.3) * 0.5 + Math.sin(t * 4.31 + seed * 0.7) * 0.25) / 1.75
    }

    const shakeRot = new THREE.Vector3()

    function updateCamera(dt) {
        // Apply pending aim recoil over recoilSmooth seconds (exponential approach).
        const a = P.recoilSmooth > 0 ? 1 - Math.exp(-dt / (P.recoilSmooth / 3)) : 1
        recoil.pitch += recoil.pendPitch * a
        recoil.yaw += recoil.pendYaw * a
        recoil.pendPitch *= 1 - a
        recoil.pendYaw *= 1 - a

        // Once the trigger has been released for a beat, bake the non-recovering share of the climb
        // into the aim and let the rest drift back.
        if (time - lastShotTime > 60 / P.rpm + 0.06) {
            if (!recoil.recovering) {
                const keep = 1 - P.recoilRecover / 100
                player.pitch += recoil.pitch * keep
                player.yaw += recoil.yaw * keep
                recoil.pitch *= 1 - keep
                recoil.yaw *= 1 - keep
                recoil.recovering = true
            }
            const k = 1 - Math.exp(-P.recoilRecoverSpeed * dt)
            recoil.pitch -= recoil.pitch * k
            recoil.yaw -= recoil.yaw * k
            bloom = Math.max(0, bloom - P.bloomRecover * dt)
        }

        for (const s of Object.values(punch)) stepSpring(s, dt, P.punchStiff, P.punchDamp)
        trauma = Math.max(0, trauma - P.shakeDecay * dt)
        const sh = trauma * trauma
        const ft = time * P.shakeFreq
        shakeRot.set(
            noise(shakeSeed[0], ft) * P.shakeAngle * DEG * sh,
            noise(shakeSeed[1], ft) * P.shakeAngle * DEG * sh,
            noise(shakeSeed[2], ft) * P.shakeAngle * DEG * sh * 0.7
        )
        const shakePos = (P.shakePos / 100) * sh

        fovKick -= fovKick * (1 - Math.exp(-P.fovRecover * dt))
        exposureKick -= exposureKick * (1 - Math.exp(-22 * dt))

        // Walking, sprinting (Shift, forward only) and crouching (Ctrl toggles). Pulling the trigger
        // or aiming cancels a sprint; sprinting stands you up.
        const fwd = (input.keys.has("KeyW") ? 1 : 0) - (input.keys.has("KeyS") ? 1 : 0)
        const strafe = (input.keys.has("KeyD") ? 1 : 0) - (input.keys.has("KeyA") ? 1 : 0)
        const moving = fwd !== 0 || strafe !== 0
        const shift = input.keys.has("ShiftLeft") || input.keys.has("ShiftRight")
        const triggerOrAim = input.fire || input.ads || debug.input.fire || debug.input.ads
        const sprinting = shift && fwd > 0 && !triggerOrAim && !reloading
        if (sprinting) crouched = false
        sprintT = sprinting ? Math.min(1, sprintT + dt / 0.2) : P.sprintToFire > 0 ? Math.max(0, sprintT - dt / P.sprintToFire) : 0
        crouchT = THREE.MathUtils.clamp(crouchT + (crouched ? 1 : -1) * (dt / P.crouchTime), 0, 1)
        const crouchE = ease(crouchT)
        const sprintE = ease(sprintT)
        let speed = THREE.MathUtils.lerp(P.walkSpeed, P.sprintSpeed, sprinting ? sprintE : 0)
        speed = THREE.MathUtils.lerp(speed, P.crouchSpeed, crouchE)
        speed *= THREE.MathUtils.lerp(1, 0.5, ease(adsT))
        if (moving) {
            const len = Math.hypot(fwd, strafe)
            const sy = Math.sin(player.yaw)
            const cy = Math.cos(player.yaw)
            player.pos.x += ((-sy * fwd + cy * strafe) / len) * speed * dt
            player.pos.z += ((-cy * fwd - sy * strafe) / len) * speed * dt
            player.pos.x = THREE.MathUtils.clamp(player.pos.x, -8, 8)
            player.pos.z = THREE.MathUtils.clamp(player.pos.z, -7, DUMMY_Z - 2)
        }
        player.move += ((moving ? 1 : 0) - player.move) * (1 - Math.exp(-10 * dt))
        player.walkPhase += dt * speed * 2.4 * player.move

        // Bob grows with speed, so a sprint really bounces.
        player.speedRatio = Math.min(2, speed / P.walkSpeed)
        const bob = P.walkBob * player.move * (1 - ease(adsT) * 0.7) * player.speedRatio
        camera.position.set(
            player.pos.x + noise(shakeSeed[3], ft) * shakePos,
            THREE.MathUtils.lerp(EYE, P.crouchHeight, crouchE) + Math.abs(Math.sin(player.walkPhase)) * 0.035 * bob + noise(shakeSeed[4], ft) * shakePos,
            player.pos.z + noise(shakeSeed[5], ft) * shakePos
        )
        camera.rotation.set(
            player.pitch + recoil.pitch + punch.pitch.x + shakeRot.x + Math.sin(player.walkPhase * 2) * 0.004 * bob,
            player.yaw + recoil.yaw + punch.yaw.x + shakeRot.y,
            punch.roll.x + shakeRot.z + Math.cos(player.walkPhase) * 0.005 * bob,
            "YXZ"
        )

        const adsE = ease(adsT)
        camera.fov = THREE.MathUtils.lerp(P.fov, P.adsFov, adsE) + fovKick
        vmCamera.fov = P.vmFov
        camera.updateProjectionMatrix()
        vmCamera.updateProjectionMatrix()
        camera.updateMatrixWorld()
        camRight.set(1, 0, 0).applyQuaternion(camera.quaternion)
        camUp.set(0, 1, 0).applyQuaternion(camera.quaternion)
        camFwd.set(0, 0, -1).applyQuaternion(camera.quaternion)
        renderer.toneMappingExposure = 1 + exposureKick
    }

    // ---------------------------------------------------------------------------------------
    // HUD

    const xh = $("crosshair")
    function updateHud() {
        $("ammo").textContent = P.mag ? `${Math.max(0, ammo)} / ${P.mag}` : "∞"
        $("ammo").classList.toggle("low", P.mag > 0 && ammo <= Math.ceil(P.mag * 0.2))
        $("reloading").hidden = !reloading
        $("stats").textContent = shotsFired ? `hits ${shotsHit} / ${shotsFired} (${Math.round((shotsHit / shotsFired) * 100)}%)` : ""
    }

    // Project a world point into #stage pixels; null when it's behind the camera.
    const projTmp = new THREE.Vector3()
    function toScreen(p) {
        projTmp.copy(p).project(camera)
        if (projTmp.z > 1) return null
        return [(projTmp.x * 0.5 + 0.5) * stage.clientWidth, (0.5 - projTmp.y * 0.5) * stage.clientHeight]
    }

    // Damage numbers: anchored to where they were dealt, flung outward in screen space.
    const numbersEl = $("numbers")
    const numbers = []
    // Stacked tallies, one per dummy.
    const stacks = new Map(world.dummies.map((d) => [d, { el: null, total: 0, age: 9, crit: false }]))
    function showDamage(dummy, point, amount, crit, killed) {
        if (P.dmgNumbers === "off") return
        if (P.dmgNumbers === "stack") {
            const stack = stacks.get(dummy)
            if (!stack.el || stack.age > 0.9) {
                stack.el?.remove()
                stack.el = document.createElement("div")
                stack.el.className = "dmg stack"
                numbersEl.append(stack.el)
                stack.total = 0
                stack.crit = false
            }
            stack.total += amount
            stack.crit ||= crit
            stack.age = 0
            stack.el.textContent = Math.round(stack.total)
            stack.el.classList.toggle("crit", stack.crit)
            stack.el.classList.toggle("kill", killed)
            stack.el.animate([{ scale: 1.35 }, { scale: 1 }], { duration: 120 })
            return
        }
        const el = document.createElement("div")
        el.className = "dmg" + (crit ? " crit" : "") + (killed ? " kill" : "")
        el.textContent = Math.round(amount)
        numbersEl.append(el)
        numbers.push({ el, anchor: point.clone(), x: 0, y: 0, vx: (Math.random() * 2 - 1) * 110, vy: -170 - Math.random() * 120, age: 0 })
        if (numbers.length > 80) numbers.shift().el.remove()
    }

    // A health bar per dummy, with a white trail that catches up after a beat.
    const hpBars = world.dummies.map((dummy) => {
        const el = document.createElement("div")
        el.className = "dummy-hp"
        el.innerHTML = '<div class="bar"><div class="trail"></div><div class="fill"></div></div><div class="text"></div>'
        numbersEl.before(el)
        return { dummy, el, fill: el.querySelector(".fill"), trail: el.querySelector(".trail"), text: el.querySelector(".text"), trailValue: 1 }
    })
    const fmt = new Intl.NumberFormat()

    function updateDamageHud(dt) {
        for (let i = numbers.length - 1; i >= 0; i--) {
            const n = numbers[i]
            n.age += dt
            n.vy += 520 * dt
            n.x += n.vx * dt
            n.y += n.vy * dt
            const at = toScreen(n.anchor)
            if (n.age > 1.1 || !at) {
                n.el.remove()
                numbers.splice(i, 1)
                continue
            }
            n.el.style.transform = `translate(${at[0] + n.x}px, ${at[1] + n.y}px) translate(-50%, -50%) scale(${n.age < 0.08 ? 1.4 : 1})`
            n.el.style.opacity = String(Math.min(1, (1.1 - n.age) / 0.35))
        }

        for (const [dummy, stack] of stacks) {
            if (!stack.el) continue
            stack.age += dt
            const at = toScreen(dummy.state.headPos)
            if (stack.age > 1.4 || !at) {
                stack.el.remove()
                stack.el = null
            } else {
                stack.el.style.transform = `translate(${at[0] + 50}px, ${at[1] - 26}px) translate(-50%, -50%)`
                stack.el.style.opacity = String(Math.min(1, (1.4 - stack.age) / 0.4))
            }
        }

        for (const bar of hpBars) {
            const d = bar.dummy.state
            const at = toScreen(d.headPos)
            bar.el.hidden = !at
            if (!at) continue
            const frac = Math.max(0, d.hp / d.max)
            if (d.sinceHit > 0.35 || frac > bar.trailValue) bar.trailValue += (frac - bar.trailValue) * Math.min(1, dt * 8)
            // Shrink with distance so bars on far-apart dummies don't pile up.
            const scale = THREE.MathUtils.clamp(14 / camera.position.distanceTo(d.headPos), 0.45, 1)
            bar.el.style.transform = `translate(${at[0]}px, ${at[1]}px) translate(-50%, -100%) scale(${scale})`
            bar.el.style.transformOrigin = "50% 100%"
            bar.fill.style.width = `${frac * 100}%`
            bar.trail.style.width = `${bar.trailValue * 100}%`
            bar.text.textContent = d.dead ? "DOWN" : `${fmt.format(Math.ceil(d.hp))} / ${fmt.format(d.max)}`
            bar.el.classList.toggle("dead", d.dead)
            bar.el.classList.toggle("regen", !d.dead && d.sinceHit > P.regenDelay && frac < 1)
        }
    }

    function updateCrosshair() {
        const adsE = ease(adsT)
        const spread = P.firstShot && time - lastShotTime > 60 / P.rpm * 1.6 + 0.04 ? 0 : currentSpread(adsE)
        const spreadPx = (Math.tan(spread * DEG) / Math.tan((camera.fov * DEG) / 2)) * (stage.clientHeight / 2)
        const gap = P.xhairGap + spreadPx * P.xhairDynamic
        xh.dataset.style = P.xhair
        xh.style.setProperty("--gap", `${gap}px`)
        xh.style.setProperty("--size", `${P.xhairSize}px`)
        xh.style.opacity = P.xhairAds ? String(1 - Math.min(1, adsE * 1.6)) : "1"
        const hm = $("hitmarker")
        hm.dataset.kind = ["hit", "head", "kill"][hitmarkerKind]
        if (hitmarkerT === 0) hitmarkerKind = 0
        hm.style.opacity = String(hitmarkerT)
        const cf = P.chargeTime > 0 ? charge / P.chargeTime : 0
        const ce = $("charge")
        ce.hidden = cf === 0
        ce.firstElementChild.style.width = `${cf * 100}%`
        ce.classList.toggle("full", cf >= 1)
        hm.style.transform = `translate(-50%, -50%) scale(${1 + (1 - hitmarkerT) * 0.4})`
    }

    // ---------------------------------------------------------------------------------------
    // Loop

    function resize() {
        const w = Math.max(1, stage.clientWidth)
        const h = Math.max(1, stage.clientHeight)
        renderer.setSize(w, h, false)
        camera.aspect = vmCamera.aspect = w / h
    }
    new ResizeObserver(resize).observe(stage)
    resize()

    const timer = new THREE.Timer()
    const sunDir = new THREE.Vector3()
    const invCam = new THREE.Quaternion()
    let hudTimer = 0

    function frame() {
        timer.update()
        const dt = Math.min(timer.getDelta(), 0.05)
        time += dt

        const adsWanted = (input.ads || debug.input.ads) && !reloading && sprintT === 0
        adsT = THREE.MathUtils.clamp(adsT + (adsWanted ? 1 : -1) * (dt / P.adsTime), 0, 1)

        updateFiring(dt)
        updateCamera(dt)

        // Sun direction in camera space, so the arms are lit consistently with the world.
        sunDir.copy(world.sun.position).sub(world.sun.target.position).normalize()
        sunDir.applyQuaternion(invCam.copy(camera.quaternion).invert())
        vm.update(dt, {
            adsE: ease(adsT),
            look,
            move: player.move * player.speedRatio,
            walkPhase: player.walkPhase,
            sprint: ease(sprintT),
            shakeRot,
            sunDir,
            charge: P.chargeTime > 0 ? charge / P.chargeTime : 0,
            light: world.lighting
        })
        look.x = look.y = 0

        if (!vm.flashing()) worldFlash.intensity = 0
        world.update(dt)
        fx.update(dt, camera)
        hitmarkerT = Math.max(0, hitmarkerT - dt * 4)

        renderer.clear()
        renderer.render(scene, camera)
        renderer.clearDepth()
        renderer.render(vmScene, vmCamera)

        updateCrosshair()
        updateDamageHud(dt)
        hudTimer -= dt
        if (hudTimer <= 0) {
            updateHud()
            hudTimer = 0.05
        }
        debug.frames++
        requestAnimationFrame(frame)
    }

    $("loading").hidden = true
    updateOverlay()
    updateHud()
    requestAnimationFrame(frame)
}

boot().catch(fail)
