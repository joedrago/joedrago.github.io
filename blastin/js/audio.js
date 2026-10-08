// Gun audio: recorded CC0 gunshots (or a synthesized energy weapon) layered with synthesized low end,
// a mechanical clack and a procedural reverb tail. Impacts, steel dings, shell tinkles, charge whines
// and reload clicks are all synthesized.

import { values as P } from "./params.js"

// Recorded banks; any other P.sound value is synthesized.
const BANKS = { rifle: 6, pistol: 4, smg: 4, shotgun: 4 }

// Download right away; decoding has to wait for the AudioContext, which needs a user gesture.
const bankBytes = Object.fromEntries(
    Object.entries(BANKS).map(([name, n]) => [
        name,
        Promise.all(Array.from({ length: n }, async (_, i) => (await fetch(`assets/sfx/${name}${i}.wav`)).arrayBuffer()))
    ])
)

let ctx = null
let master = null
let reverbSend = null
let noiseBuffer = null
const banks = {}
let lastVariant = -1
let charge = null

export function audioReady() {
    return ctx !== null && ctx.state === "running"
}

// Browsers only allow audio after a user gesture, so this is called from the first click/keypress.
export async function startAudio() {
    if (ctx) {
        if (ctx.state !== "running") await ctx.resume()
        return
    }
    ctx = new AudioContext({ latencyHint: "interactive" })

    // A gentle bus compressor keeps sustained fire loud without clipping into mush.
    const comp = ctx.createDynamicsCompressor()
    comp.threshold.value = -14
    comp.knee.value = 8
    comp.ratio.value = 4
    comp.attack.value = 0.002
    comp.release.value = 0.12
    master = ctx.createGain()
    master.gain.value = P.volume
    master.connect(comp).connect(ctx.destination)

    const convolver = ctx.createConvolver()
    convolver.buffer = makeImpulse(1.6, 2.8)
    reverbSend = ctx.createGain()
    reverbSend.gain.value = 1
    reverbSend.connect(convolver).connect(master)

    noiseBuffer = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate)
    const nd = noiseBuffer.getChannelData(0)
    for (let i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1

    await Promise.all(
        Object.entries(bankBytes).map(async ([name, bytes]) => {
            banks[name] = await Promise.all((await bytes).map((b) => ctx.decodeAudioData(b)))
        })
    )
}

export function setVolume(v) {
    if (master) master.gain.setTargetAtTime(v, ctx.currentTime, 0.02)
}

// Stereo exponentially-decaying noise: a cheap, convincing outdoor-range slapback.
function makeImpulse(seconds, decay) {
    const len = Math.floor(ctx.sampleRate * seconds)
    const buf = ctx.createBuffer(2, len, ctx.sampleRate)
    for (let c = 0; c < 2; c++) {
        const d = buf.getChannelData(c)
        for (let i = 0; i < len; i++) {
            const t = i / len
            // A couple of early reflections, then a diffuse tail.
            const early = (i > ctx.sampleRate * 0.045 && i < ctx.sampleRate * 0.05) || (i > ctx.sampleRate * 0.11 && i < ctx.sampleRate * 0.114)
            d[i] = (Math.random() * 2 - 1) * Math.pow(1 - t, decay) * (early ? 2.2 : 0.6)
        }
    }
    return buf
}

function gainNode(v, dest) {
    const g = ctx.createGain()
    g.gain.value = v
    g.connect(dest)
    return g
}

function noise(t, dur, dest) {
    const src = ctx.createBufferSource()
    src.buffer = noiseBuffer
    src.loop = true
    src.loopStart = Math.random() * 0.5
    src.connect(dest)
    src.start(t, Math.random() * 0.5)
    src.stop(t + dur)
    return src
}

function envelope(param, t, peak, attack, decay) {
    param.setValueAtTime(0.0001, t)
    param.exponentialRampToValueAtTime(Math.max(peak, 0.0002), t + attack)
    param.exponentialRampToValueAtTime(0.0001, t + attack + decay)
}

function pan(x, dest) {
    if (!ctx.createStereoPanner) return dest
    const p = ctx.createStereoPanner()
    p.pan.value = Math.max(-1, Math.min(1, x))
    p.connect(dest)
    return p
}

export function playShot() {
    if (!audioReady()) return
    const t = ctx.currentTime
    const rate = P.pitch * (1 + (Math.random() * 2 - 1) * P.pitchVar)

    const out = gainNode(1, master)
    const send = gainNode(P.tail, reverbSend)
    out.connect(send)

    const bank = banks[P.sound]
    if (P.gunVol > 0 && bank?.length) {
        // Pick a recording, never the same one twice in a row (when there's a choice).
        const n = Math.min(P.variants, bank.length)
        let v = Math.floor(Math.random() * n)
        if (n > 1 && v === lastVariant) v = (v + 1) % n
        lastVariant = v
        const src = ctx.createBufferSource()
        src.buffer = bank[v]
        src.playbackRate.value = rate
        src.connect(gainNode(P.gunVol, out))
        src.start(t)
    } else if (P.gunVol > 0 && SYNTHS[P.sound]) {
        SYNTHS[P.sound](t, rate, gainNode(P.gunVol, out))
    }

    if (P.bass > 0) {
        // Sub thump: a fast downward sine sweep plus a lowpassed noise "air" push.
        const osc = ctx.createOscillator()
        osc.type = "sine"
        osc.frequency.setValueAtTime(140 * rate, t)
        osc.frequency.exponentialRampToValueAtTime(42 * rate, t + 0.09)
        const g = ctx.createGain()
        envelope(g.gain, t, 0.9 * P.bass, 0.003, 0.16)
        osc.connect(g).connect(out)
        osc.start(t)
        osc.stop(t + 0.2)

        const lp = ctx.createBiquadFilter()
        lp.type = "lowpass"
        lp.frequency.value = 380
        const ng = ctx.createGain()
        envelope(ng.gain, t, 0.5 * P.bass, 0.002, 0.07)
        noise(t, 0.1, lp)
        lp.connect(ng).connect(out)
    }

    if (P.mech > 0) {
        // Bolt clack: two short band-passed noise ticks, the second as the bolt returns.
        for (const [dt, freq, amp] of [
            [0.004, 3200, 0.5],
            [0.038 / rate, 2100, 0.35]
        ]) {
            const bp = ctx.createBiquadFilter()
            bp.type = "bandpass"
            bp.frequency.value = freq * rate
            bp.Q.value = 4
            const g = ctx.createGain()
            envelope(g.gain, t + dt, amp * P.mech, 0.001, 0.025)
            noise(t + dt, 0.04, bp)
            bp.connect(g).connect(pan(0.25, out))
        }
    }
}

// Energy weapons. Each draws one shot into `out` starting at time t.
const SYNTHS = {
    // Classic "pew": a square/saw pair diving in pitch, plus a bright click.
    laser(t, rate, out) {
        const g = ctx.createGain()
        envelope(g.gain, t, 0.5, 0.002, 0.2)
        const lp = ctx.createBiquadFilter()
        lp.type = "lowpass"
        lp.frequency.setValueAtTime(7000, t)
        lp.frequency.exponentialRampToValueAtTime(900, t + 0.2)
        for (const [type, mul, detune] of [
            ["square", 1, 0],
            ["sawtooth", 1.5, 12]
        ]) {
            const o = ctx.createOscillator()
            o.type = type
            o.detune.value = detune
            o.frequency.setValueAtTime(2400 * mul * rate, t)
            o.frequency.exponentialRampToValueAtTime(160 * mul * rate, t + 0.2)
            o.connect(lp)
            o.start(t)
            o.stop(t + 0.25)
        }
        lp.connect(g).connect(out)
        const hp = ctx.createBiquadFilter()
        hp.type = "highpass"
        hp.frequency.value = 4000
        const ng = ctx.createGain()
        envelope(ng.gain, t, 0.35, 0.001, 0.02)
        noise(t, 0.04, hp)
        hp.connect(ng).connect(out)
    },
    // Plasma: detuned saws through a wobbling bandpass, with a fizzing noise tail.
    plasma(t, rate, out) {
        const bp = ctx.createBiquadFilter()
        bp.type = "bandpass"
        bp.Q.value = 3
        bp.frequency.setValueAtTime(2200 * rate, t)
        bp.frequency.exponentialRampToValueAtTime(300 * rate, t + 0.22)
        const lfo = ctx.createOscillator()
        lfo.frequency.value = 38
        const lfoGain = ctx.createGain()
        lfoGain.gain.value = 500
        lfo.connect(lfoGain).connect(bp.frequency)
        lfo.start(t)
        lfo.stop(t + 0.3)
        for (const d of [-14, 0, 17]) {
            const o = ctx.createOscillator()
            o.type = "sawtooth"
            o.detune.value = d
            o.frequency.setValueAtTime(320 * rate, t)
            o.frequency.exponentialRampToValueAtTime(70 * rate, t + 0.25)
            o.connect(bp)
            o.start(t)
            o.stop(t + 0.3)
        }
        const g = ctx.createGain()
        envelope(g.gain, t, 0.9, 0.003, 0.24)
        bp.connect(g).connect(out)
        const hp = ctx.createBiquadFilter()
        hp.type = "highpass"
        hp.frequency.value = 2500
        const ng = ctx.createGain()
        envelope(ng.gain, t, 0.25, 0.002, 0.15)
        noise(t, 0.2, hp)
        hp.connect(ng).connect(out)
    },
    // Railgun: a supersonic crack, a ringing metallic body, a descending zap and a long low boom.
    railgun(t, rate, out) {
        const hp = ctx.createBiquadFilter()
        hp.type = "highpass"
        hp.frequency.value = 1800
        const cg = ctx.createGain()
        envelope(cg.gain, t, 1.2, 0.001, 0.05)
        noise(t, 0.08, hp)
        hp.connect(cg).connect(out)

        for (const [ratio, amp, dec] of [
            [1, 0.25, 0.9],
            [2.32, 0.18, 0.7],
            [3.81, 0.12, 0.5],
            [6.1, 0.07, 0.35]
        ]) {
            const o = ctx.createOscillator()
            o.frequency.value = 410 * ratio * rate
            const g = ctx.createGain()
            envelope(g.gain, t, amp, 0.002, dec)
            o.connect(g).connect(out)
            o.start(t)
            o.stop(t + dec + 0.05)
        }

        const zap = ctx.createOscillator()
        zap.type = "sawtooth"
        zap.frequency.setValueAtTime(5200 * rate, t)
        zap.frequency.exponentialRampToValueAtTime(90 * rate, t + 0.45)
        const zg = ctx.createGain()
        envelope(zg.gain, t, 0.22, 0.002, 0.45)
        const zlp = ctx.createBiquadFilter()
        zlp.type = "lowpass"
        zlp.frequency.value = 6000
        zap.connect(zlp).connect(zg).connect(out)
        zap.start(t)
        zap.stop(t + 0.5)

        const boom = ctx.createOscillator()
        boom.frequency.setValueAtTime(90 * rate, t)
        boom.frequency.exponentialRampToValueAtTime(32 * rate, t + 0.6)
        const bg = ctx.createGain()
        envelope(bg.gain, t, 1, 0.004, 0.8)
        boom.connect(bg).connect(out)
        boom.start(t)
        boom.stop(t + 0.9)
    }
}

// A rising whine while a weapon charges or spins up. Returns nothing; stopCharge() ends it.
export function startCharge(seconds) {
    if (!audioReady() || P.chargeVol <= 0) return
    stopCharge()
    const t = ctx.currentTime
    const out = ctx.createGain()
    out.gain.setValueAtTime(0.0001, t)
    out.gain.exponentialRampToValueAtTime(0.35 * P.chargeVol, t + Math.max(0.05, seconds * 0.6))
    out.connect(master)
    const oscs = [
        ["sawtooth", 1],
        ["sine", 2.01]
    ].map(([type, mul]) => {
        const o = ctx.createOscillator()
        o.type = type
        o.frequency.setValueAtTime(120 * mul * P.pitch, t)
        o.frequency.exponentialRampToValueAtTime(1600 * mul * P.pitch, t + Math.max(0.05, seconds))
        const lp = ctx.createBiquadFilter()
        lp.type = "lowpass"
        lp.frequency.value = 3500
        o.connect(lp).connect(out)
        o.start(t)
        return o
    })
    // Tremolo that speeds up as the charge builds.
    const trem = ctx.createOscillator()
    trem.frequency.setValueAtTime(6, t)
    trem.frequency.linearRampToValueAtTime(28, t + Math.max(0.05, seconds))
    const tg = ctx.createGain()
    tg.gain.value = 0.12 * P.chargeVol
    trem.connect(tg).connect(out.gain)
    trem.start(t)
    charge = { out, oscs: [...oscs, trem] }
}

export function stopCharge() {
    if (!charge) return
    const t = ctx.currentTime
    charge.out.gain.cancelScheduledValues(t)
    charge.out.gain.setTargetAtTime(0.0001, t, 0.03)
    for (const o of charge.oscs) o.stop(t + 0.2)
    charge = null
}

export function playDryFire() {
    if (!audioReady()) return
    click(ctx.currentTime, 2600, 0.4)
}

function click(t, freq, amp) {
    const bp = ctx.createBiquadFilter()
    bp.type = "bandpass"
    bp.frequency.value = freq
    bp.Q.value = 6
    const g = ctx.createGain()
    envelope(g.gain, t, amp, 0.001, 0.03)
    noise(t, 0.05, bp)
    bp.connect(g).connect(pan(0.2, master))
}

// Rough mechanical beats for the model's 2.6s reload animation.
export function playReload(speed = 1) {
    if (!audioReady()) return
    const t = ctx.currentTime
    for (const [at, f, a] of [
        [0.45, 1500, 0.5],
        [0.55, 900, 0.3],
        [1.35, 1800, 0.6],
        [1.42, 2600, 0.4],
        [1.95, 2200, 0.55],
        [2.08, 3000, 0.5]
    ])
        click(t + at / speed, f, a)
}

// distance in metres; surface "metal" rings, everything else thuds.
export function playImpact(surface, distance, panX) {
    if (!audioReady() || P.impactVol <= 0) return
    const t = ctx.currentTime + (P.soundDelay ? distance / 343 : 0)
    const att = P.impactVol / (1 + distance * 0.04)
    const out = pan(panX * 0.7, master)
    if (surface === "metal") {
        // Inharmonic partials make a convincing steel-plate "tink".
        const base = 900 + Math.random() * 160
        for (const [ratio, amp, dec] of [
            [1, 0.5, 0.5],
            [2.76, 0.3, 0.3],
            [5.4, 0.18, 0.18],
            [8.93, 0.1, 0.1]
        ]) {
            const osc = ctx.createOscillator()
            osc.frequency.value = base * ratio
            const g = ctx.createGain()
            envelope(g.gain, t, amp * att, 0.001, dec)
            osc.connect(g).connect(out)
            osc.start(t)
            osc.stop(t + dec + 0.05)
        }
        return
    }
    const bp = ctx.createBiquadFilter()
    bp.type = "bandpass"
    // Sandbag thump for the dummy, a knock for wood, a sharp chip for concrete.
    const freq = { dummy: 260, wood: 700 }[surface] ?? 1400 + Math.random() * 600
    const decay = { dummy: 0.14, wood: 0.09 }[surface] ?? 0.06
    bp.frequency.value = freq
    bp.Q.value = 1.2
    const g = ctx.createGain()
    envelope(g.gain, t, (surface === "dummy" ? 1.4 : 0.9) * att, 0.001, decay)
    noise(t, 0.12, bp)
    bp.connect(g).connect(out)
}

export function playShell(panX) {
    if (!audioReady() || P.shellVol <= 0) return
    const t = ctx.currentTime
    const out = pan(panX, master)
    const base = 3800 + Math.random() * 1600
    for (const [ratio, amp] of [
        [1, 0.12],
        [1.53, 0.07],
        [2.31, 0.05]
    ]) {
        const osc = ctx.createOscillator()
        osc.frequency.value = base * ratio
        const g = ctx.createGain()
        envelope(g.gain, t, amp * P.shellVol, 0.001, 0.08 + Math.random() * 0.06)
        osc.connect(g).connect(out)
        osc.start(t)
        osc.stop(t + 0.2)
    }
}
