# Solar System Explorer & Asteroid Mining Concepts

An interactive, browser-based solar system visualisation with animated planetary orbits, an asteroid belt, selectable celestial bodies, camera focusing, simulation controls and an educational overview of hypothetical space-resource extraction.

**Developer:** Matibini Handiya  
**Field:** Computer Systems Engineering  
**Project type:** Independent portfolio project  
**Status:** Prototype / ongoing development

## Preview

Run the project locally or deploy it with GitHub Pages. The simulation uses a dark interface and a stylised 3D scene to make the solar system easier to explore.

## Features

- 3D solar-system scene rendered with Three.js and WebGL.
- Animated orbital motion for the eight planets.
- Illustrative asteroid belt between Mars and Jupiter.
- Click-to-focus camera transitions and mouse/touch orbit controls.
- Adjustable simulation speed and pause/resume.
- Toggleable orbital paths and planet labels.
- Planet information panels with diameter, distance, orbital period, temperature and resource notes.
- Educational resource cards covering water ice, iron-nickel, platinum-group metals, silicates, carbon compounds and rare-earth elements.
- A simplified hypothetical asteroid-mining workflow.

## Run locally

This project uses browser ES modules and an import map. Open it through a local HTTP server rather than directly with `file://`.

### Option 1: Python

```bash
python3 -m http.server 8000
```

Then visit `http://localhost:8000`.

### Option 2: VS Code

Use the Live Server extension and open `index.html`.

## Deploy with GitHub Pages

1. Create a public repository, for example `solar-system-explorer-asteroid-mining`.
2. Upload the project files while preserving the folder structure.
3. Open **Settings → Pages**.
4. Under Build and deployment, select **Deploy from a branch**.
5. Select the `main` branch and `/ (root)` folder, then save.
6. Wait for GitHub Pages to publish the site.

The Three.js modules are loaded from jsDelivr, so the deployed site needs an internet connection.

## Project structure

```text
solar-system-explorer-asteroid-mining/
├── index.html
├── README.md
├── LICENSE
├── .gitignore
├── docs/
│   └── ARCHITECTURE.md
└── src/
    ├── data.js
    ├── main.js
    └── styles.css
```

## Controls

| Action | How |
|---|---|
| Rotate the scene | Drag inside the 3D viewport |
| Zoom | Scroll or pinch |
| Focus a planet | Click a planet or use the body buttons |
| Pause / resume | Pause button |
| Change simulation speed | Speed slider |
| Show / hide orbit paths | Trails button |
| Show / hide labels | Labels button |
| Return to the Sun | Reset camera |

## Scientific and engineering limitations

This is an educational visualisation, not a precision ephemeris or orbital-mechanics tool.

- Planet sizes and orbital distances are compressed and are **not to scale**.
- Orbital speeds are stylised for visual clarity; they are not a calibrated time model.
- The asteroid belt is illustrative, not a map of actual asteroid positions or density.
- The scene does not calculate gravitational perturbations, orbital transfers, collision probabilities or spacecraft trajectories.
- Resource notes describe possible materials and research concepts. They do not claim that deposits are confirmed, accessible or economically recoverable.
- Mining methods are conceptual. Real missions would require detailed prospecting, mission design, thermal and mechanical engineering, autonomy, power, communications and economic analysis.

## Technology

- HTML5
- CSS
- JavaScript ES modules
- [Three.js](https://threejs.org/) for 3D rendering
- WebGL through the browser

## Roadmap

- [ ] Replace stylised orbital rates with validated orbital elements.
- [ ] Add a date/time control and a documented simulation-time model.
- [ ] Add a search/filter for celestial bodies and resource types.
- [ ] Add asteroid target profiles with clearly labelled hypothetical composition data.
- [ ] Prototype a simple mission-planning view for prospecting and rendezvous.
- [ ] Add automated checks and performance testing on lower-powered devices.
- [ ] Improve accessibility, keyboard navigation and reduced-motion support.

## Credits

Built independently by **Matibini Handiya** as a learning and portfolio project exploring interactive 3D visualisation, planetary science and the engineering challenges of future space-resource utilisation.
