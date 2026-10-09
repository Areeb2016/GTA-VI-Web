# GTA VI Web — Cinematic Fan Concepts

A versioned archive of the GTA VI cinematic fan websites built in this project.

> **Unofficial fan project.** This repository is not affiliated with, endorsed by, or sponsored by Rockstar Games or Take-Two Interactive. Grand Theft Auto, GTA VI, characters, names, and official imagery are the property of their respective owners.

## Versions

| Version | Folder | Summary |
|---|---|---|
| **V1 — Cinematic Concept** | [`versions/v1`](./versions/v1/) | Original single-file cinematic landing experience with parallax, character rail, Leonida map panel, gallery, trailer modal, and simulated edition flow. |
| **V2 — Interactive Experience** | [`versions/v2`](./versions/v2/) | Expanded build with boot sequence, VICE/LINK phone, dynamic sunset/night mode, procedural radio, wanted/heat system, random events, interactive map, mission planner, synchronized state, gallery viewer, and more. |

## Recommended version

**V2 is the current and most feature-rich build.** Open [`versions/v2/index.html`](./versions/v2/index.html) or serve the `versions/v2` folder with any static web server.

```bash
cd versions/v2
python -m http.server 8080
```

Then visit `http://localhost:8080`.

## Live deployments

| Version | Live link | Notes |
|---|---|---|
| **V1 — Cinematic Concept** | [Open V1 live preview](https://raw.githack.com/Areeb2016/GTA-VI-Web/main/versions/v1/index.html) | Version-preserved browser preview served directly from the GitHub source. |
| **V2 — Interactive Experience** | [Open V2 on Netlify](https://gta6-cinematic-concept.netlify.app) | Current production Netlify deployment and recommended version. |

The live links above are kept separate so older builds remain accessible instead of being overwritten by the newest version.

## Repository layout

```text
GTA-VI-Web/
├── README.md
├── NOTICE.md
├── index.html                  # convenience redirect to V2
├── versions/
│   ├── v1/
│   │   ├── README.md
│   │   └── index.html
│   └── v2/
│       ├── README.md
│       ├── index.html
│       ├── styles.css
│       └── app.js
└── archives/
    ├── GTA6_Cinematic_Fan_Concept_v1.zip
    └── GTA6_Cinematic_Fan_Concept_v2.zip
```

## V2 keyboard controls

- `M` — open / close VICE/LINK phone
- `R` — toggle procedural ambient radio
- `N` — toggle sunset / night mode
- `H` — increase heat level
- `Esc` — close phone / gallery viewer
- `← / →` — navigate the gallery while the viewer is open

## Tech

Both versions are intentionally lightweight static builds. V1 is self-contained HTML/CSS/JavaScript. V2 separates its HTML, CSS, and JavaScript while remaining dependency-free at runtime aside from externally loaded web fonts and referenced media.

## Preservation

Older versions are kept intact under `versions/` instead of being overwritten. ZIP snapshots under `archives/` preserve the original packages created during development.
