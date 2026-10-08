# blastin'

A first-person shooting range with eight guns (AKM, Glock, SMG, pump shotgun, sawed-off, pulse rifle,
coil railgun, ray gun), a training dummy with a health bar, and a pile of sliders for tuning how each
gun *feels* to shoot. The weapon and every slider you touch are written into the query string, so the
address bar is always a link to that exact gun.

## Running it

There's no build step. It's static files plus a vendored three.js, but ES modules and `fetch` won't
work from `file://`, so serve the folder over HTTP:

```sh
npm start                    # node tools/serve.js → http://localhost:8080/
# or
python3 -m http.server 8080
```

To share it, drop the folder on any static host (GitHub Pages, Netlify, an S3 bucket). All paths are
relative.

## Controls

| Input         | Action                                                                   |
| ------------- | ------------------------------------------------------------------------ |
| Click         | Capture the mouse (with a free cursor, clicking the range test-fires)    |
| LMB           | Fire                                                                     |
| RMB (hold)    | Aim down sights                                                          |
| Space         | Swap between controlling the gun and a free cursor for the tuner         |
| R             | Reload                                                                   |
| WASD          | Walk (to feel the bob)                                                   |
| Shift (hold)  | Sprint (forward only; lowers the gun, and firing or aiming cancels it)   |
| Ctrl          | Toggle crouch (tighter spread, lower eye height)                         |
| F             | Toggle fullscreen (also a button in the tuner)                           |
| `/`           | Focus the tuner's filter box                                             |
| Double-click a slider | Reset it to the weapon's baseline                                |

Picking a weapon loads its model and its *baseline*: the defaults plus that gun's loadout (a shotgun
gets pellets and a big kick, the railgun gets a charge-up and a beam, and so on). Shared links store
the weapon plus only the dials that differ from its baseline. Changed dials are highlighted, and the
white tick on each track marks the baseline.

The tuner also has feel presets that apply on top of the current weapon (*Wet noodle*, *Arcade
boomstick*, *Mil-sim*, *Laser beam*, *Heavy LMG*, *Minigun*), plus **Randomize**, **Reset** (back to
the weapon's baseline) and **Copy link**. Hover a dial's label to see what it does.

## What the dials cover

"Gun feel" is many small effects firing together on each shot. The tuner exposes over 100 of them,
grouped by layer:

- **Weapon**: which gun (model, sound and baseline dials).
- **Firing**: fire rate, auto/burst/semi, magazine, charge/spin-up time, hip/ADS spread, bloom per
  shot and recovery, and first-shot accuracy.
- **Pellets**: pellets per shot, cone size, and pattern (random scatter, centre + rings, or a fixed
  sunflower pattern that's the same every shot), plus pattern jitter.
- **Damage**: damage per pellet, headshot multiplier, and distance falloff.
- **Aim recoil**: recoil that really moves your aim, so you have to pull against it. Climb,
  horizontal jitter and bias (a learnable spray), a first-shot multiplier, a ramp-up, how quickly
  each kick is applied, and how much drifts back on release.
- **View punch**: a visual-only camera kick on damped springs (pitch, yaw, roll, stiffness,
  damping). Damping below 1 overshoots.
- **Screen shake**: trauma-based (shake = trauma²), with noise frequency, decay, positional jitter,
  and how much shake reaches the viewmodel.
- **FOV**: base FOV, per-shot FOV punch and its cap/recovery, ADS zoom and time, and a separate
  viewmodel FOV.
- **Gun kick**: viewmodel push-back, muzzle rise, roll and side jitter on springs, blended with the
  model's own fire animation (bolt cycling, arm recoil).
- **Sway & bob**: look-lag sway, idle breathing, walk bob, and the gun's resting offset.
- **Movement**: walk, sprint and crouch speeds, sprint-to-fire delay, sprint pose, crouch eye height
  and transition time, and a crouch spread multiplier.
- **Muzzle flash**: energy colour (gunpowder, blue, red, green, purple), size, duration, how often it
  appears, dynamic light, whole-screen exposure punch, and barrel smoke.
- **Tracers & shells**: tracer style (fast streak, a glowing bolt whose impact lands when it arrives,
  or a lingering beam), frequency, speed, length, width and beam fade, plus brass ejection.
- **Impacts**: bullet-hole size and lifetime, sparks, dust, how far steel targets swing, and the
  hitmarker.
- **Audio**: gun sound type (recorded rifle, pistol, SMG or shotgun; synthesized laser, plasma or
  railgun), layered with a synthesized sub thump and bolt clack. Also variant rotation (set it to 1 to
  hear the "machine-gun effect"), pitch and pitch variance, a charge/spin-up whine, reverb tail,
  impact sounds delayed by the speed of sound, and shell tinkles.
- **Crosshair**: style, size, gap, how much it opens to show the real spread cone, and whether it
  hides while aiming down sights (off by default).
- **Range**: time of day (day, dusk, or night with range lamps), and three training dummies with
  500, 5,000 and 50,000 health (the base value is a dial; the others are ×10 and ×100): damage
  numbers (one per hit, a stacking tally, or off), regen delay (20 s by default, so a reload doesn't
  undo your damage), and regen speed as a percentage of max health per second. A dummy falls over when
  emptied and gets back up at full health.

  The dummies stand in an open field 30 m behind the spawn point (turn around), with distance
  markers painted on the ground every 5 m; spawn is on the 30 m line. Walk up to
  a marker to test falloff and pellet spread at that range. Weapon switches and presets leave these
  alone.
- **Controls**: mouse and ADS sensitivity. These are personal: they're saved in your browser's
  localStorage, never written to shared links, and left alone by presets, Reset and Randomize.

## Layout

- `index.html`, `style.css`: page, HUD, menu styles.
- `js/params.js`: every dial (defaults, ranges, tooltips), presets, and query-string sync.
- `js/main.js`: input, the firing model, recoil/punch/shake/FOV, and the frame loop.
- `js/viewmodel.js`: arms + gun in their own scene and FOV, springs, sway, ADS, muzzle flash. Two
  rigs have arms and animations (AKM, Glock); the other guns are props seated in those rigs' hands
  (see `WEAPONS` for each prop's measured trigger, bore, sight and muzzle).
- `js/effects.js`: decals, sparks, dust/smoke, tracers/bolts/beams, brass, the energy palette.
- `js/world.js`: the range (procedural canvas textures, swinging steel plates, training dummy,
  time-of-day lighting).
- `js/audio.js`: the Web Audio graph.
- `js/menu.js`: the generated tuning panel.
- `tools/serve.js`: static dev server. `tools/snap.js` takes headless-Chrome screenshots
  (`--fire 800`, `--ads`, `--url "...?rpm=900"`); it needs `npm install` for puppeteer-core.

## Credits

All models come from [Poly Pizza](https://poly.pizza). They're unmodified, apart from material
roughness/metalness set at runtime and the props being re-seated in the rigs' hands.

- **Arms + AKM, with Idle/Shoot/Reload animations**: [Fps Rig AKM](https://poly.pizza/m/U6l6wjxFhC) by
  J-Toastie, [CC-BY 3.0](https://creativecommons.org/licenses/by/3.0/).
- **Arms + Glock 19, with Idle/Shoot/Reload animations**: [Fps Rig](https://poly.pizza/m/uxko5LkGia)
  by J-Toastie, CC-BY 3.0.
- **Mossberg 590**: [Mossberg 590A1](https://poly.pizza/m/eAh1oHY32T) by J-Toastie, CC-BY 3.0.
- **Sawed-off**: [Double Barrel Shotgun](https://poly.pizza/m/Emvvx56omx) by J-Toastie, CC-BY 3.0.
- **Coil railgun**: [Coil Gun](https://poly.pizza/m/6uFWxPXtwYO) by Vas Pupin, CC-BY 3.0.
- **SMG**, **Pulse rifle**, **Ray gun**: [Submachine Gun](https://poly.pizza/m/7ehatxr7FY),
  [Scifi Assault Rifle](https://poly.pizza/m/j40c8VDdAQ) and [Ray Gun](https://poly.pizza/m/DIcib0mihf)
  by Quaternius, CC0.
- **Gunshot recordings**: [The Free Firearm Sound Library](https://opengameart.org/content/the-free-firearm-sound-library)
  by Ben Jaszczak et al., CC0. Single shots were cut into `assets/sfx/`: rifle (AK-47, AR-15), pistol
  (Walther PPQ, 1911), SMG (Carl Gustav M45) and shotgun (Benelli Nova, Charles Daly pump).
- **three.js** r186, MIT (`vendor/three/LICENSE`).
- Every other sound, texture and effect is generated procedurally at runtime.
