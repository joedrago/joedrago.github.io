// The space-bar tuning panel, generated from PARAMS. Every change is written to the query string
// (see params.js), so the address bar is always a shareable link to the current feel.

import * as params from "./params.js"

const { GROUP_LIST, PRESETS, values } = params

// [what, title, url, author, license] for everything downloaded rather than generated.
const CREDITS = [
    ["Arms + AKM", "Fps Rig AKM", "https://poly.pizza/m/U6l6wjxFhC", "J-Toastie", "CC-BY 3.0"],
    ["Arms + Glock 19", "Fps Rig", "https://poly.pizza/m/uxko5LkGia", "J-Toastie", "CC-BY 3.0"],
    ["Mossberg 590", "Mossberg 590A1", "https://poly.pizza/m/eAh1oHY32T", "J-Toastie", "CC-BY 3.0"],
    ["Sawed-off", "Double Barrel Shotgun", "https://poly.pizza/m/Emvvx56omx", "J-Toastie", "CC-BY 3.0"],
    ["Coil railgun", "Coil Gun", "https://poly.pizza/m/6uFWxPXtwYO", "Vas Pupin", "CC-BY 3.0"],
    ["SMG", "Submachine Gun", "https://poly.pizza/m/7ehatxr7FY", "Quaternius", "CC0"],
    ["Pulse rifle", "Scifi Assault Rifle", "https://poly.pizza/m/j40c8VDdAQ", "Quaternius", "CC0"],
    ["Ray gun", "Ray Gun", "https://poly.pizza/m/DIcib0mihf", "Quaternius", "CC0"],
    ["Gunshots", "The Free Firearm Sound Library", "https://opengameart.org/content/the-free-firearm-sound-library", "Ben Jaszczak et al.", "CC0"]
]

function el(tag, props = {}, ...children) {
    const e = document.createElement(tag)
    for (const [k, v] of Object.entries(props)) {
        if (v == null) continue
        if (k === "class") e.className = v
        else if (k.startsWith("on")) e.addEventListener(k.slice(2), v)
        else if (k in e) e[k] = v
        else e.setAttribute(k, v)
    }
    for (const c of children) if (c != null) e.append(c)
    return e
}

function format(p, v) {
    if (p.type !== "range") return String(v)
    const s = String(p.step)
    const d = s.includes(".") ? s.length - s.indexOf(".") - 1 : 0
    return Number(v).toFixed(d)
}

export function createMenu(root, { toggleFullscreen }) {
    const rows = {}
    const collapsed = new Set(JSON.parse(safeGet("blastin.collapsed") ?? "[]"))

    const presetSelect = el(
        "select",
        {
            class: "preset",
            title: "Load a preset on top of the defaults",
            onchange: () => {
                if (presetSelect.value) params.applyPreset(presetSelect.value)
                presetSelect.value = ""
            }
        },
        el("option", { value: "" }, "Presets…"),
        ...Object.keys(PRESETS).map((n) => el("option", { value: n }, n))
    )

    const copyButton = el("button", {
        class: "btn primary",
        title: "Copy a link with these settings",
        onclick: async () => {
            const url = params.shareURL()
            try {
                await navigator.clipboard.writeText(url)
                copyButton.textContent = "Copied!"
            } catch {
                prompt("Copy this link:", url)
            }
            setTimeout(() => (copyButton.textContent = "Copy link"), 1400)
        },
        textContent: "Copy link"
    })

    const ICON_ENTER = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/></svg>'
    const ICON_EXIT = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5"/></svg>'
    const fullscreenButton = el("button", {
        class: "btn icon",
        title: "Fullscreen (F)",
        "aria-label": "Fullscreen",
        onclick: () => toggleFullscreen(),
        innerHTML: ICON_ENTER
    })

    const filter = el("input", {
        class: "filter",
        type: "search",
        placeholder: "Filter dials…",
        oninput: () => applyFilter()
    })
    const changedOnly = el("input", { type: "checkbox", onchange: () => applyFilter() })

    const header = el(
        "div",
        { class: "menu-head" },
        el("div", { class: "menu-title" }, el("h1", {}, "blastin'"), el("span", { class: "hint" }, "gun-feel tuner")),
        el(
            "div",
            { class: "menu-actions" },
            presetSelect,
            fullscreenButton,
            el("button", { class: "btn", title: "Roll the dice on every feel dial", onclick: () => params.randomize(), textContent: "Randomize" }),
            el("button", { class: "btn", title: "Back to this weapon's baseline (keeps your mouse sensitivity)", onclick: () => params.reset(), textContent: "Reset" }),
            copyButton
        ),
        el("div", { class: "menu-filter" }, filter, el("label", { class: "changed-only" }, changedOnly, " changed only"))
    )

    const body = el("div", { class: "menu-body" })
    for (const g of GROUP_LIST) {
        const section = el("section", { class: collapsed.has(g.name) ? "group collapsed" : "group" })
        const h = el(
            "h2",
            {
                title: g.tip ?? null,
                onclick: () => {
                    section.classList.toggle("collapsed")
                    if (section.classList.contains("collapsed")) collapsed.add(g.name)
                    else collapsed.delete(g.name)
                    safeSet("blastin.collapsed", JSON.stringify([...collapsed]))
                }
            },
            el("span", { class: "chev" }, "▾"),
            g.name
        )
        section.append(h)
        if (g.tip) section.append(el("p", { class: "group-tip" }, g.tip))
        for (const p of g.params) {
            const row = buildRow(p)
            rows[p.key] = row
            section.append(row.el)
        }
        section.dataset.group = g.name
        body.append(section)
    }

    const footer = el(
        "div",
        { class: "menu-foot" },
        el("span", {}, el("kbd", {}, "Space"), " gun ⇄ cursor"),
        el("span", {}, el("kbd", {}, "LMB"), " fire"),
        el("span", {}, el("kbd", {}, "RMB"), " aim"),
        el("span", {}, el("kbd", {}, "R"), " reload"),
        el("span", {}, el("kbd", {}, "WASD"), " walk"),
        el("span", {}, el("kbd", {}, "Shift"), " sprint"),
        el("span", {}, el("kbd", {}, "Ctrl"), " crouch"),
        el("span", {}, el("kbd", {}, "F"), " fullscreen"),
        el("span", { class: "foot-note" }, "With the cursor free, click the range to test-fire while you tune."),
        el(
            "details",
            { class: "foot-note credits" },
            el("summary", {}, "Credits"),
            ...CREDITS.map(([what, title, url, who, license]) =>
                el("div", {}, `${what}: `, el("a", { href: url, target: "_blank", rel: "noopener" }, title), ` by ${who} (${license})`)
            ),
            el("div", {}, "three.js (MIT). Everything else is generated in code.")
        )
    )

    root.append(header, body, footer)

    function buildRow(p) {
        const label = el("label", { class: "label", title: p.tip ?? "" }, p.label)
        const reset = el("button", {
            class: "reset",
            title: "Reset to this weapon's baseline",
            textContent: "↺",
            onclick: () => params.set(p.key, params.baseline(p.key))
        })
        let input
        let number = null
        if (p.type === "select") {
            input = el(
                "select",
                { onchange: () => params.set(p.key, input.value) },
                ...p.options.map((o) => el("option", { value: o }, p.labels[o] ?? o))
            )
        } else if (p.type === "bool") {
            input = el("input", { type: "checkbox", onchange: () => params.set(p.key, input.checked ? 1 : 0) })
        } else {
            input = el("input", {
                type: "range",
                min: p.min,
                max: p.max,
                step: p.step,
                oninput: () => params.set(p.key, input.value)
            })
            // Double-click a slider to snap it back to default.
            input.addEventListener("dblclick", () => params.set(p.key, params.baseline(p.key)))
            number = el("input", {
                type: "number",
                class: "num",
                min: p.min,
                max: p.max,
                step: p.step,
                onchange: () => params.set(p.key, number.value)
            })
        }
        const rowEl = el("div", { class: "row", title: p.tip ?? "" }, label, el("div", { class: "control" }, input, number), reset)
        rowEl.dataset.search = `${p.label} ${p.key} ${p.tip ?? ""}`.toLowerCase()
        const row = {
            el: rowEl,
            sync() {
                const v = values[p.key]
                if (p.type === "bool") input.checked = !!v
                else input.value = v
                if (number && document.activeElement !== number) number.value = format(p, v)
                if (p.type === "range") {
                    const t = (v - p.min) / (p.max - p.min)
                    input.style.setProperty("--fill", `${t * 100}%`)
                    const d = (params.baseline(p.key) - p.min) / (p.max - p.min)
                    input.style.setProperty("--def", `${d * 100}%`)
                }
                rowEl.classList.toggle("changed", !params.isDefault(p.key))
            }
        }
        row.sync()
        return row
    }

    function applyFilter() {
        const q = filter.value.trim().toLowerCase()
        for (const section of body.children) {
            let any = false
            for (const row of section.querySelectorAll(".row")) {
                const show = (!q || row.dataset.search.includes(q)) && (!changedOnly.checked || row.classList.contains("changed"))
                row.hidden = !show
                any ||= show
            }
            section.hidden = !any
            section.classList.toggle("filtering", !!q || changedOnly.checked)
        }
    }

    params.onChange((key) => {
        if (key) rows[key]?.sync()
        else for (const r of Object.values(rows)) r.sync()
        if (changedOnly.checked) applyFilter()
    })

    return {
        focusFilter: () => filter.focus(),
        setFullscreen(on) {
            fullscreenButton.innerHTML = on ? ICON_EXIT : ICON_ENTER
            fullscreenButton.title = on ? "Exit fullscreen (F)" : "Fullscreen (F)"
        }
    }
}

function safeGet(k) {
    try {
        return localStorage.getItem(k)
    } catch {
        return null
    }
}

function safeSet(k, v) {
    try {
        localStorage.setItem(k, v)
    } catch {
        // Storage can be unavailable (private mode); collapsing just won't persist.
    }
}
