// Every tunable dial lives here. The menu is generated from PARAMS. Each weapon has a baseline (the
// defaults plus that weapon's loadout), and the query string stores the weapon plus only the dials
// that differ from its baseline, so a shared link is exactly "this gun + these tweaks".
//
// Each entry: [key, label, default, min, max, step, tip]. Selects use { options: [...], labels } in
// place of min/max/step, and booleans use a min/max of 0/1 with step 1 (rendered as a checkbox).
//
// Group flags:
//   personal: saved in localStorage, never shared, untouched by weapons, presets and Reset.
//   scene:    describes the range, not the gun; weapon switches and presets leave it alone.

const GROUPS = [
    {
        name: "Weapon",
        tip: "Picking a weapon loads its model, sound and a matching set of dials (its baseline).",
        params: [
            [
                "weapon",
                "Model",
                "akm",
                {
                    options: ["akm", "glock", "smg", "mossberg", "sawedoff", "pulse", "coilgun", "raygun"],
                    labels: {
                        akm: "AKM",
                        glock: "Glock 19",
                        smg: "SMG",
                        mossberg: "Mossberg 590 (pump)",
                        sawedoff: "Sawed-off double barrel",
                        pulse: "Pulse rifle",
                        coilgun: "Coil railgun",
                        raygun: "Ray gun"
                    }
                },
                "Which gun is in your hands."
            ]
        ]
    },
    {
        name: "Firing",
        params: [
            ["rpm", "Fire rate (RPM)", 650, 30, 1500, 10, "Rounds per minute. The single biggest 'personality' dial."],
            ["mode", "Fire mode", "auto", { options: ["auto", "burst", "semi"] }, "Hold to spray, 3-round burst, or one per click."],
            ["mag", "Magazine (0 = infinite)", 30, 0, 150, 1, "Rounds before a reload. R reloads early."],
            ["chargeTime", "Charge / spin-up (s)", 0, 0, 3, 0.05, "Hold the trigger this long before the first shot: a railgun charge or a minigun spin-up."],
            ["spreadHip", "Hip spread (°)", 1.0, 0, 8, 0.05, "Radius of the random cone when firing from the hip."],
            ["spreadAds", "ADS spread (°)", 0.1, 0, 4, 0.05, "Radius of the random cone when aiming down sights."],
            ["bloom", "Bloom per shot (°)", 0.2, 0, 2, 0.01, "Extra spread added by each shot while spraying."],
            ["bloomMax", "Max bloom (°)", 2.5, 0, 10, 0.1, "Ceiling on accumulated bloom."],
            ["bloomRecover", "Bloom recovery (°/s)", 8, 0.5, 40, 0.5, "How fast bloom shrinks back when you stop."],
            ["firstShot", "First shot perfect", 1, 0, 1, 1, "First shot after a pause ignores spread entirely (tap-fire reward)."]
        ]
    },
    {
        name: "Pellets",
        tip: "More than one pellet per shot turns any gun into a shotgun.",
        params: [
            ["pellets", "Pellets per shot", 1, 1, 24, 1, "Projectiles fired by each trigger pull."],
            ["pelletSpread", "Pellet cone (°)", 4, 0, 15, 0.1, "Radius of the pellet pattern, on top of the accuracy cone."],
            [
                "pelletPattern",
                "Pattern",
                "random",
                { options: ["random", "ring", "fixed"] },
                "random: uniform scatter. ring: one centre pellet plus a ring. fixed: the same sunflower pattern every shot (learnable, like Valorant)."
            ],
            ["pelletJitter", "Pattern jitter", 0.15, 0, 1, 0.01, "Randomness added to ring/fixed patterns."]
        ]
    },
    {
        name: "Damage",
        params: [
            ["damage", "Damage per hit", 25, 1, 300, 1, "Per pellet, before falloff."],
            ["headMult", "Headshot multiplier", 2, 1, 5, 0.05, "Damage scale for head hits on the dummy."],
            ["falloffStart", "Falloff start (m)", 20, 0, 200, 1, "Full damage up to this range."],
            ["falloffEnd", "Falloff end (m)", 50, 1, 200, 1, "Damage reaches the minimum here."],
            ["falloffMin", "Falloff minimum (%)", 60, 0, 100, 1, "Damage left at long range."]
        ]
    },
    {
        name: "Aim recoil",
        tip: "Recoil that actually moves where you're aiming; you counter it with the mouse.",
        params: [
            ["recoilUp", "Vertical (° / shot)", 0.45, 0, 8, 0.01, "How far each shot climbs your aim."],
            ["recoilSide", "Horizontal jitter (°)", 0.18, 0, 3, 0.01, "Random left/right wander per shot."],
            ["recoilBias", "Horizontal bias", 0.15, -1, 1, 0.05, "Pulls the wander consistently left (-) or right (+), like a learnable spray."],
            ["recoilFirst", "First-shot multiplier", 1.4, 0, 4, 0.05, "Extra (or less) kick on the first round of a burst."],
            ["recoilRamp", "Climb ramp (shots)", 6, 0, 30, 1, "Shots until recoil reaches full strength (0 = full immediately)."],
            ["recoilSmooth", "Apply time (s)", 0.05, 0, 0.2, 0.005, "Recoil is pushed in over this long. 0 = instant snap, higher = a shove."],
            ["recoilRecover", "Auto-recovery (%)", 70, 0, 100, 1, "How much of the climb drifts back after you let go."],
            ["recoilRecoverSpeed", "Recovery speed", 7, 0.5, 30, 0.5, "How quickly that drift-back happens."],
            ["recoilAds", "ADS multiplier", 0.7, 0, 2, 0.05, "Scale on aim recoil while aiming down sights."]
        ]
    },
    {
        name: "View punch",
        tip: "Visual-only camera kick that springs back to where you were aiming.",
        params: [
            ["punchPitch", "Pitch (°)", 0.7, 0, 8, 0.05, "Upward camera snap per shot."],
            ["punchYaw", "Yaw (°)", 0.25, 0, 3, 0.05, "Random sideways snap per shot."],
            ["punchRoll", "Roll (°)", 0.9, 0, 6, 0.05, "Random camera roll per shot. Small values read as 'heavy'."],
            ["punchStiff", "Spring stiffness", 260, 20, 1200, 10, "Higher = snappier return."],
            ["punchDamp", "Spring damping", 0.6, 0.05, 1.5, 0.01, "Below 1 overshoots and wobbles; 1 is critically damped."],
            ["punchAds", "ADS multiplier", 0.5, 0, 2, 0.05, "Scale on view punch while aiming down sights."]
        ]
    },
    {
        name: "Screen shake",
        tip: "Noise-driven trauma shake: each shot adds trauma, shake strength is trauma².",
        params: [
            ["shake", "Trauma per shot", 0.18, 0, 1, 0.01, "How much each shot adds. Shake ramps up during a spray."],
            ["shakeAngle", "Max angle (°)", 1.2, 0, 6, 0.05, "Rotation at full trauma."],
            ["shakePos", "Max offset (cm)", 1.5, 0, 10, 0.1, "Positional jitter at full trauma."],
            ["shakeFreq", "Frequency (Hz)", 24, 2, 60, 1, "Low = rolling sway, high = buzzy rattle."],
            ["shakeDecay", "Decay (/s)", 2.5, 0.2, 10, 0.1, "How fast trauma drains."],
            ["shakeVm", "Shake the gun too", 0.4, 0, 1, 0.05, "How much of the shake also rattles the viewmodel."],
            ["shakeAds", "ADS multiplier", 0.5, 0, 2, 0.05, "Scale on shake while aiming down sights."]
        ]
    },
    {
        name: "Field of view",
        params: [
            ["fov", "FOV (°)", 80, 50, 120, 1, "Vertical-ish feel: wider makes speed and kick feel bigger."],
            ["fovPunch", "FOV punch (° / shot)", 0.5, -4, 4, 0.05, "Momentary zoom per shot. Positive = zoom out (whump), negative = zoom in."],
            ["fovMax", "FOV punch cap (°)", 3, 0, 15, 0.1, "Limit on accumulated FOV punch during a spray."],
            ["fovRecover", "FOV recovery (/s)", 14, 1, 60, 1, "How fast FOV punch settles."],
            ["adsFov", "ADS FOV (°)", 58, 20, 100, 1, "Zoom while aiming down sights."],
            ["adsTime", "ADS time (s)", 0.18, 0.02, 0.8, 0.01, "Time to raise the sights."],
            ["vmFov", "Viewmodel FOV (°)", 58, 30, 100, 1, "Separate FOV for the arms; lower = bigger, closer gun."]
        ]
    },
    {
        name: "Gun kick",
        tip: "Spring-driven viewmodel motion per shot, layered on the model's own fire animation.",
        params: [
            ["kickBack", "Push back (cm)", 4, 0, 20, 0.1, "Gun slams back toward you."],
            ["kickUp", "Muzzle rise (°)", 4, 0, 25, 0.1, "Gun tips upward."],
            ["kickRoll", "Roll (°)", 2.5, 0, 15, 0.1, "Random roll each shot."],
            ["kickSide", "Side jitter (cm)", 0.5, 0, 5, 0.05, "Random sideways shove."],
            ["kickStiff", "Spring stiffness", 300, 20, 1500, 10, "Higher = snappier return."],
            ["kickDamp", "Spring damping", 0.55, 0.05, 1.5, 0.01, "Below 1 bounces; 1 is critically damped."],
            ["kickAds", "ADS multiplier", 0.45, 0, 2, 0.05, "Scale on gun kick while aiming down sights."],
            ["animWeight", "Fire animation weight", 0.7, 0, 1, 0.05, "Blend of the model's hand-authored bolt/arm fire animation."]
        ]
    },
    {
        name: "Sway & bob",
        params: [
            ["sway", "Look sway", 1, 0, 4, 0.05, "Gun lags behind mouse movement."],
            ["swaySmooth", "Sway smoothing", 9, 1, 30, 0.5, "Higher = tighter follow."],
            ["idle", "Idle breathing", 1, 0, 3, 0.05, "The model's idle animation plus a slow drift."],
            ["walkBob", "Walk bob", 1, 0, 3, 0.05, "Viewmodel and camera bob while walking (WASD)."],
            ["vmX", "Hip offset X (cm)", 0, -15, 15, 0.5, "Nudge the gun's resting spot sideways."],
            ["vmY", "Hip offset Y (cm)", 0, -15, 15, 0.5, "Nudge it up/down."],
            ["vmZ", "Hip offset Z (cm)", 0, -15, 15, 0.5, "Nudge it toward/away from you."]
        ]
    },
    {
        name: "Movement",
        tip: "Shift sprints (forward only), Ctrl toggles crouch.",
        params: [
            ["walkSpeed", "Walk speed (m/s)", 4.2, 1, 10, 0.1, "Normal movement speed. Aiming down sights halves it."],
            ["sprintSpeed", "Sprint speed (m/s)", 7, 1, 15, 0.1, "Speed while holding Shift. Sprinting lowers the gun, so you can't fire or aim."],
            ["sprintToFire", "Sprint-to-fire (s)", 0.2, 0, 1, 0.01, "Time to bring the gun back up after a sprint before it can fire."],
            ["sprintTilt", "Sprint pose", 1, 0, 2, 0.05, "How far the gun tilts away while sprinting."],
            ["crouchHeight", "Crouch eye height (m)", 1.05, 0.5, 1.5, 0.01, "Standing eye height is 1.62 m."],
            ["crouchTime", "Crouch time (s)", 0.18, 0.02, 0.8, 0.01, "Time to drop into or rise out of a crouch."],
            ["crouchSpeed", "Crouch speed (m/s)", 2.2, 0.5, 6, 0.1, "Movement speed while crouched."],
            ["crouchSpread", "Crouch spread multiplier", 0.7, 0, 1.5, 0.05, "Scale on hip/ADS spread while crouched."]
        ]
    },
    {
        name: "Muzzle flash",
        params: [
            [
                "fxColor",
                "Energy colour",
                "fire",
                { options: ["fire", "blue", "red", "green", "purple"] },
                "Tint for the flash, its light, tracers and beams. 'fire' is ordinary gunpowder."
            ],
            ["flashSize", "Size", 1, 0, 3, 0.05, "Scale of the flash sprite."],
            ["flashTime", "Duration (s)", 0.045, 0.01, 0.15, 0.005, "How long each flash stays lit."],
            ["flashChance", "Chance per shot", 1, 0, 1, 0.05, "Skip some flashes for a flickery strobe."],
            ["flashLight", "Light intensity", 1, 0, 4, 0.05, "Dynamic light thrown on the hands and the range."],
            ["exposure", "Exposure punch", 0.12, 0, 1, 0.01, "Brief whole-screen brightening per shot."],
            ["smoke", "Barrel smoke", 0.6, 0, 2, 0.05, "Wisps drifting from the muzzle."]
        ]
    },
    {
        name: "Tracers & shells",
        params: [
            [
                "tracerStyle",
                "Tracer style",
                "streak",
                { options: ["streak", "bolt", "beam"] },
                "streak: a fast bullet trace. bolt: a glowing projectile you can watch fly. beam: an instant line that lingers and fades."
            ],
            ["tracerEvery", "Tracer every N (0 = off)", 3, 0, 10, 1, "One tracer per N rounds."],
            ["tracerSpeed", "Tracer speed (m/s)", 350, 20, 1500, 10, "Faster reads as hitscan, slower as visible rounds. Not used by beams."],
            ["tracerLength", "Tracer length (m)", 5, 0.2, 20, 0.1, "Streak length."],
            ["tracerWidth", "Tracer width (cm)", 1.5, 0.3, 8, 0.1, "Streak, bolt or beam thickness."],
            ["beamFade", "Beam fade (s)", 0.35, 0.03, 2, 0.01, "How long a beam lingers."],
            ["shells", "Shell ejection", 1, 0, 1, 1, "Spent brass flying out the right side."],
            ["shellSpeed", "Shell speed (m/s)", 2.5, 0.5, 8, 0.1, "How hard brass is flung."]
        ]
    },
    {
        name: "Impacts",
        params: [
            ["decalSize", "Bullet hole size", 1, 0.2, 4, 0.05, "Decal scale."],
            ["decalLife", "Hole lifetime (s, 0 = forever)", 0, 0, 30, 0.5, "Fade decals out after this long."],
            ["sparks", "Sparks", 8, 0, 40, 1, "Spark streaks per impact."],
            ["sparkSpeed", "Spark speed", 6, 1, 20, 0.5, "How far sparks fly."],
            ["dust", "Dust puff", 1, 0, 3, 0.05, "Size/opacity of the impact dust cloud."],
            ["targetPush", "Target swing", 1, 0, 4, 0.05, "How hard steel plates and the dummy react to hits."],
            ["hitmarker", "Hitmarker", 1, 0, 1, 1, "Show an X when you hit a steel target or the dummy."]
        ]
    },
    {
        name: "Audio",
        params: [
            [
                "sound",
                "Gun sound",
                "rifle",
                { options: ["rifle", "pistol", "smg", "shotgun", "laser", "plasma", "railgun"] },
                "rifle/pistol/smg/shotgun are recordings; laser/plasma/railgun are synthesized."
            ],
            ["volume", "Master volume", 0.7, 0, 1, 0.01, "Everything."],
            ["gunVol", "Gunshot volume", 0.8, 0, 1.5, 0.01, "The main shot sound (recording or synth)."],
            ["variants", "Sample variants", 6, 1, 6, 1, "Distinct recordings rotated through. 1 = 'machine-gun effect'."],
            ["pitch", "Pitch", 1, 0.5, 1.6, 0.01, "Base playback rate of the shot."],
            ["pitchVar", "Pitch variance", 0.05, 0, 0.3, 0.005, "Random ± per shot so sprays don't sound robotic."],
            ["bass", "Sub thump", 0.6, 0, 2, 0.01, "Synthesized low-end punch layered under each shot."],
            ["mech", "Mechanical clack", 0.35, 0, 2, 0.01, "Synthesized bolt/action click layer."],
            ["chargeVol", "Charge whine", 0.5, 0, 1.5, 0.01, "Rising whine while charging or spinning up."],
            ["tail", "Reverb tail", 0.35, 0, 1.5, 0.01, "Room echo that blooms during sustained fire."],
            ["impactVol", "Impact sounds", 0.5, 0, 1.5, 0.01, "Thuds on concrete, dings on steel."],
            ["soundDelay", "Speed-of-sound delay", 1, 0, 1, 1, "Delay impact sounds by distance / 343 m/s."],
            ["shellVol", "Shell tinkle", 0.35, 0, 1.5, 0.01, "Brass bouncing on concrete."]
        ]
    },
    {
        name: "Crosshair",
        params: [
            ["xhair", "Style", "cross", { options: ["cross", "dot", "circle", "none"] }, "Reticle style."],
            ["xhairSize", "Size (px)", 8, 2, 30, 1, "Line length."],
            ["xhairGap", "Gap (px)", 5, 0, 30, 1, "Minimum gap at zero spread."],
            ["xhairDynamic", "Shows spread", 1, 0, 1, 0.05, "How much the gap opens to match the real spread cone."],
            ["xhairAds", "Hide when aiming", 0, 0, 1, 1, "Fade the reticle out while aiming down sights, leaving just the iron sights."]
        ]
    },
    {
        name: "Range",
        tip: "The range itself. Weapon switches and presets leave these alone.",
        scene: true,
        params: [
            ["time", "Time of day", "day", { options: ["day", "dusk", "night"] }, "Lighting for the range. Night makes muzzle flashes the star."],
            ["dmgNumbers", "Damage numbers", "each", { options: ["each", "stack", "off"] }, "each: a number per hit sprays off the dummy. stack: one number that tallies a burst."],
            ["dummyHp", "Dummy health (×1/×10/×100)", 500, 50, 5000, 10, "Hit points on the small dummy; the other two have 10× and 100× as much."],
            ["regenDelay", "Regen delay (s)", 20, 0, 60, 0.5, "Time without damage before a dummy heals. Long enough by default to reload and keep going."],
            ["regenPct", "Regen speed (% / s)", 120, 1, 1000, 1, "How fast a dummy heals, as a share of its max health per second."]
        ]
    },
    {
        name: "Controls",
        tip: "Saved in this browser only and never put in shared links, since it depends on your mouse.",
        personal: true,
        params: [
            ["sens", "Mouse sensitivity", 1, 0.1, 4, 0.05, "Look speed."],
            ["adsSens", "ADS sensitivity", 0.7, 0.1, 2, 0.05, "Multiplier while aiming down sights."]
        ]
    }
]

// Each weapon's loadout: the dials it changes from the defaults. Together they form its baseline.
export const LOADOUTS = {
    akm: {},
    glock: {
        rpm: 450, mode: "semi", mag: 15, spreadHip: 0.8, bloom: 0.3, recoilUp: 0.9, recoilSide: 0.12, recoilFirst: 1,
        recoilRecover: 95, recoilRecoverSpeed: 12, punchPitch: 1.2, punchRoll: 0.6, kickBack: 3, kickUp: 9, kickRoll: 1.5,
        kickStiff: 420, sound: "pistol", damage: 30, bass: 0.4, adsFov: 66, tracerEvery: 0, shellSpeed: 2, flashSize: 0.7,
        smoke: 0.4
    },
    smg: {
        rpm: 950, mag: 32, spreadHip: 1.6, bloom: 0.22, recoilUp: 0.22, recoilSide: 0.22, recoilFirst: 1, punchPitch: 0.35,
        punchRoll: 0.6, shake: 0.12, kickBack: 2.5, kickUp: 2, kickStiff: 420, sound: "smg", damage: 18, pitch: 1.05,
        falloffStart: 12, falloffEnd: 30, flashSize: 0.8, bass: 0.45
    },
    mossberg: {
        rpm: 70, mode: "semi", mag: 7, pellets: 9, pelletSpread: 4.5, pelletPattern: "ring", spreadHip: 0.6, spreadAds: 0.3,
        bloom: 0, firstShot: 0, recoilUp: 3, recoilSide: 0.5, recoilFirst: 1, recoilRecover: 90, recoilSmooth: 0.04,
        punchPitch: 3.5, punchRoll: 2, punchStiff: 160, shake: 0.45, shakeFreq: 16, fovPunch: 2, kickBack: 10, kickUp: 12,
        kickStiff: 160, kickDamp: 0.6, sound: "shotgun", damage: 14, falloffStart: 8, falloffEnd: 25, falloffMin: 20,
        bass: 1.4, tail: 0.5, tracerEvery: 1, tracerWidth: 0.8, tracerLength: 3, sparks: 4, shellSpeed: 1.8, flashSize: 1.8,
        smoke: 1.4, decalSize: 0.7
    },
    sawedoff: {
        rpm: 240, mode: "semi", mag: 2, pellets: 12, pelletSpread: 7, spreadHip: 1, spreadAds: 0.6, bloom: 0, firstShot: 0,
        recoilUp: 4, recoilSide: 0.8, recoilFirst: 1, recoilRecover: 85, punchPitch: 4.5, punchRoll: 3, punchStiff: 140,
        shake: 0.6, shakeFreq: 14, fovPunch: 3, fovMax: 6, kickBack: 12, kickUp: 16, kickStiff: 140, kickDamp: 0.6,
        sound: "shotgun", pitch: 0.9, damage: 11, falloffStart: 5, falloffEnd: 18, falloffMin: 10, bass: 1.8, tail: 0.6,
        flashSize: 2.4, flashLight: 2, exposure: 0.3, smoke: 1.8, shells: 0, tracerEvery: 1, tracerWidth: 0.8,
        tracerLength: 2.5, sparks: 3, decalSize: 0.6, adsFov: 70
    },
    pulse: {
        rpm: 720, mag: 40, fxColor: "blue", tracerStyle: "bolt", tracerEvery: 1, tracerSpeed: 120, tracerLength: 1.2,
        tracerWidth: 3, shells: 0, smoke: 0, flashSize: 0.8, flashLight: 1.6, recoilUp: 0.3, recoilFirst: 1, punchPitch: 0.5,
        sound: "plasma", mech: 0.15, bass: 0.8, damage: 22, sparks: 10, adsFov: 55
    },
    coilgun: {
        rpm: 50, mode: "semi", mag: 5, chargeTime: 0.6, fxColor: "purple", tracerStyle: "beam", tracerEvery: 1,
        tracerWidth: 2.5, beamFade: 0.9, damage: 150, headMult: 2.5, falloffStart: 200, falloffEnd: 200, spreadHip: 0.3,
        spreadAds: 0, firstShot: 1, recoilUp: 2.5, recoilFirst: 1, recoilSmooth: 0.08, punchPitch: 3, punchRoll: 1.5,
        punchStiff: 120, shake: 0.6, fovPunch: 3, fovMax: 6, kickBack: 14, kickUp: 6, kickStiff: 120, kickDamp: 0.65,
        shells: 0, smoke: 1, exposure: 0.5, flashLight: 3, sound: "railgun", bass: 1.5, mech: 0, sparks: 30, sparkSpeed: 10,
        dust: 2, adsFov: 35, adsTime: 0.28, targetPush: 3, decalSize: 1.6
    },
    raygun: {
        rpm: 300, mag: 20, fxColor: "green", tracerStyle: "bolt", tracerEvery: 1, tracerSpeed: 60, tracerLength: 0.8,
        tracerWidth: 5, shells: 0, smoke: 0, flashSize: 0.9, flashLight: 2, recoilUp: 0.2, recoilFirst: 1, punchPitch: 0.6,
        kickBack: 2, kickUp: 5, kickStiff: 380, sound: "laser", mech: 0, bass: 0.3, damage: 20, sparks: 12, adsFov: 66,
        falloffStart: 200, falloffEnd: 200
    }
}

export const PARAMS = []
export const BY_KEY = {}
export const GROUP_LIST = GROUPS.map((g) => {
    const params = g.params.map((row) => {
        const [key, label, def] = row
        const p =
            typeof row[3] === "object"
                ? { key, label, def, type: "select", options: row[3].options, labels: row[3].labels ?? {}, tip: row[4] }
                : { key, label, def, min: row[3], max: row[4], step: row[5], tip: row[6] }
        if (!p.type) p.type = p.min === 0 && p.max === 1 && p.step === 1 ? "bool" : "range"
        p.personal = !!g.personal
        p.scene = !!g.scene
        PARAMS.push(p)
        BY_KEY[key] = p
        return p
    })
    return { name: g.name, tip: g.tip, params }
})

// Named feel presets. Each is applied on top of the current weapon's baseline.
export const PRESETS = {
    Default: {},
    "Wet noodle": {
        recoilUp: 0.05, recoilSide: 0, recoilFirst: 1, punchPitch: 0, punchYaw: 0, punchRoll: 0, shake: 0, fovPunch: 0,
        kickBack: 0.4, kickUp: 0.3, kickRoll: 0, kickSide: 0, animWeight: 0, flashSize: 0.3, flashLight: 0, exposure: 0,
        smoke: 0, tracerEvery: 0, shells: 0, sparks: 0, dust: 0.2, decalSize: 0.5, gunVol: 0.25, variants: 1, pitch: 1.3,
        pitchVar: 0, bass: 0, mech: 0, tail: 0, impactVol: 0, shellVol: 0, targetPush: 0.2, hitmarker: 0
    },
    "Arcade boomstick": {
        rpm: 720, recoilUp: 0.3, punchPitch: 2.2, punchRoll: 2.5, punchDamp: 0.4, shake: 0.35, shakeAngle: 2.5, shakePos: 4,
        fovPunch: 1.6, fovMax: 6, kickBack: 9, kickUp: 9, kickRoll: 6, kickDamp: 0.4, flashSize: 1.8, flashLight: 2.5,
        exposure: 0.35, smoke: 1.4, tracerEvery: 1, tracerWidth: 3, sparks: 24, sparkSpeed: 10, dust: 2, bass: 1.6,
        mech: 0.8, tail: 0.7, targetPush: 2.5
    },
    "Mil-sim": {
        rpm: 600, spreadHip: 3, bloom: 0.35, recoilUp: 0.9, recoilSide: 0.35, recoilRecover: 20, recoilSmooth: 0.03,
        punchPitch: 0.4, punchRoll: 0.4, shake: 0.08, fovPunch: 0, kickBack: 3, kickUp: 2.5, flashSize: 0.7, flashChance: 0.6,
        exposure: 0.05, tracerEvery: 5, xhair: "none", adsTime: 0.3, bass: 0.5, tail: 0.6, soundDelay: 1
    },
    "Laser beam": {
        rpm: 1200, spreadHip: 0.3, bloom: 0, recoilUp: 0.04, recoilSide: 0.02, recoilFirst: 1, punchPitch: 0.15, punchRoll: 0.1,
        shake: 0.04, fovPunch: 0.1, kickBack: 1.2, kickUp: 0.8, kickRoll: 0.3, kickStiff: 900, flashSize: 0.6, tracerEvery: 1,
        tracerSpeed: 1500, tracerLength: 12, tracerWidth: 0.8, pitch: 1.25, pitchVar: 0.02, bass: 0.2, mech: 0.6
    },
    "Heavy LMG": {
        rpm: 520, mag: 100, spreadHip: 2, recoilUp: 0.6, recoilSide: 0.4, recoilFirst: 1, recoilRamp: 0, recoilSmooth: 0.09,
        recoilRecover: 40, punchPitch: 1.4, punchRoll: 1.6, punchStiff: 140, punchDamp: 0.7, shake: 0.22, shakeAngle: 1.8,
        shakeFreq: 14, fovPunch: 0.9, kickBack: 7, kickUp: 5, kickStiff: 160, kickDamp: 0.6, flashSize: 1.5, flashLight: 1.8,
        smoke: 1.3, pitch: 0.85, bass: 1.4, tail: 0.6, adsTime: 0.35, sway: 2, swaySmooth: 5, sparks: 14
    },
    "Minigun": {
        rpm: 1500, mag: 0, chargeTime: 0.8, spreadHip: 2.2, bloom: 0, recoilUp: 0.08, recoilSide: 0.12, recoilFirst: 1,
        recoilRamp: 0, punchPitch: 0.3, punchRoll: 0.5, shake: 0.06, shakeFreq: 40, kickBack: 1.5, kickUp: 0.8,
        kickStiff: 700, tracerEvery: 2, sound: "smg", variants: 4, pitch: 0.9, pitchVar: 0.03, chargeVol: 0.8, tail: 0.5
    }
}

export const values = {}
const listeners = new Set()

export function onChange(fn) {
    listeners.add(fn)
}

function emit(key) {
    for (const fn of listeners) fn(key, key ? values[key] : undefined)
}

function decimals(step) {
    const s = String(step)
    return s.includes(".") ? s.length - s.indexOf(".") - 1 : 0
}

function coerce(p, raw) {
    if (p.type === "select") return p.options.includes(raw) ? raw : p.def
    const v = Number(raw)
    if (!Number.isFinite(v)) return p.def
    const snapped = Math.round(v / p.step) * p.step
    return Number(Math.min(p.max, Math.max(p.min, snapped)).toFixed(decimals(p.step)))
}

// The value a dial falls back to for the current weapon.
export function baseline(key) {
    const p = BY_KEY[key]
    if (p.personal || p.scene || key === "weapon") return p.def
    const v = LOADOUTS[values.weapon]?.[key]
    return v === undefined ? p.def : coerce(p, v)
}

export function set(key, raw, { silent = false } = {}) {
    const p = BY_KEY[key]
    if (!p) return
    if (key === "weapon") return selectWeapon(raw, { silent })
    values[key] = coerce(p, raw)
    if (p.personal) savePersonal()
    if (!silent) emit(key)
    scheduleQueryWrite()
}

// Switching weapons resets every gun dial to the new weapon's baseline.
export function selectWeapon(name, { silent = false } = {}) {
    values.weapon = coerce(BY_KEY.weapon, name)
    for (const p of PARAMS) if (!p.personal && !p.scene && p.key !== "weapon") values[p.key] = baseline(p.key)
    if (!silent) emit(null)
    scheduleQueryWrite()
}

export function applyPreset(name) {
    const preset = PRESETS[name] ?? {}
    for (const p of PARAMS) {
        if (p.personal || p.scene || p.key === "weapon") continue
        values[p.key] = p.key in preset ? coerce(p, preset[p.key]) : baseline(p.key)
    }
    emit(null)
    scheduleQueryWrite()
}

// Reset: the current weapon's baseline, and the default range.
export function reset() {
    for (const p of PARAMS) if (!p.personal && p.key !== "weapon") values[p.key] = baseline(p.key)
    emit(null)
    scheduleQueryWrite()
}

// Randomize around the baseline: log-normal-ish wobble for positive values, so results stay in a
// playable neighbourhood rather than uniformly across each slider's full range.
export function randomize() {
    for (const p of PARAMS) {
        if (p.type !== "range" || p.personal || p.scene || groupOf(p.key) === "Crosshair") continue
        if (["vmX", "vmY", "vmZ", "mag", "volume", "fov", "pellets", "chargeTime"].includes(p.key)) continue
        const b = baseline(p.key)
        let v
        if (b > 0) v = b * Math.pow(2, (Math.random() * 2 - 1) * 1.3)
        else if (p.min < 0) v = (Math.random() * 2 - 1) * Math.min(-p.min, p.max) * 0.5
        else v = Math.random() * p.max * 0.3
        values[p.key] = coerce(p, v)
    }
    emit(null)
    scheduleQueryWrite()
}

function groupOf(key) {
    return GROUP_LIST.find((g) => g.params.some((p) => p.key === key))?.name
}

export function isDefault(key) {
    return values[key] === baseline(key)
}

export function shareURL() {
    const q = new URLSearchParams()
    for (const p of PARAMS) if (!p.personal && !isDefault(p.key)) q.set(p.key, String(values[p.key]))
    const s = q.toString()
    return location.origin + location.pathname + (s ? "?" + s : "")
}

let queryTimer = 0
function scheduleQueryWrite() {
    clearTimeout(queryTimer)
    queryTimer = setTimeout(() => history.replaceState(null, "", shareURL()), 120)
}

// Personal dials (mouse sensitivity) live in localStorage; everything else comes from the link.
// Personal keys in an incoming link are ignored and dropped from the address bar.
const PERSONAL_KEY = "blastin.personal"

export function loadFromQuery() {
    const q = new URLSearchParams(location.search)
    const saved = loadPersonal()
    values.weapon = coerce(BY_KEY.weapon, q.get("weapon") ?? BY_KEY.weapon.def)
    for (const p of PARAMS) {
        if (p.key === "weapon") continue
        if (p.personal) values[p.key] = p.key in saved ? coerce(p, saved[p.key]) : p.def
        else values[p.key] = q.has(p.key) ? coerce(p, q.get(p.key)) : baseline(p.key)
    }
    if (PARAMS.some((p) => p.personal && q.has(p.key))) history.replaceState(null, "", shareURL())
}

function loadPersonal() {
    try {
        return JSON.parse(localStorage.getItem(PERSONAL_KEY) ?? "{}") ?? {}
    } catch {
        return {}
    }
}

function savePersonal() {
    const out = {}
    for (const p of PARAMS) if (p.personal) out[p.key] = values[p.key]
    try {
        localStorage.setItem(PERSONAL_KEY, JSON.stringify(out))
    } catch {
        // Storage unavailable (private mode): sensitivity just won't survive a reload.
    }
}
