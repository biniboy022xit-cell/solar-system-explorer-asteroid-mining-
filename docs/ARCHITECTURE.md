# Architecture Notes

## 1. Overview

The application is a static browser project. HTML provides the page structure, CSS handles the responsive interface, and JavaScript modules manage simulation data, rendering and interaction.

## 2. Main components

### `index.html`
Defines the page layout, accessible control labels, information panels, resource sections and the import map used to load Three.js modules.

### `src/data.js`
Contains the structured planetary and resource information. Keeping content separate from rendering makes it easier to update facts without rewriting scene logic.

### `src/main.js`
Responsible for:
- Creating the Three.js scene, camera, renderer and lighting.
- Building the Sun, planets, orbital paths, Saturn's rings, asteroid belt and background stars.
- Updating planetary positions during the animation loop.
- Handling body selection and camera focus.
- Connecting pause, speed, labels and trails controls to the simulation.
- Rendering planet and resource information into the interface.

### `src/styles.css`
Defines the dark visual system, typography, panel layout, responsive breakpoints and interactive states.

## 3. Simulation model

Each planet has a simplified circular orbit described by:
- `orbit`: visual orbital radius in scene units.
- `speed`: relative angular speed multiplier.
- `radius`: visual body radius.

The animation loop advances a simulation clock. For a planet with angular-speed multiplier `s`, the scene uses:

```js
const angle = elapsed * s * 0.22;
x = Math.cos(angle) * orbitRadius;
z = Math.sin(angle) * orbitRadius;
```

This creates smooth, repeatable motion. It is deliberately not a physically calibrated ephemeris model.

## 4. Camera and interaction

`OrbitControls` provides interactive camera orbiting, damping and zoom. A raycaster detects clicks on planet meshes. Selecting a body updates the information panel and sets a camera destination; the render loop interpolates the camera and target to create a smooth focus transition.

## 5. Asteroid belt

The belt is represented by a `THREE.Points` object. Each particle has an initial angle, radius, vertical offset and small angular-speed value. Particle positions are updated each frame. The particles are illustrative and should not be interpreted as real asteroid catalogue data.

## 6. Resource information

Resource entries are explanatory content, not measured deposits. The application distinguishes:
- possible material occurrence;
- hypothetical extraction or processing methods;
- possible in-space uses;
- the uncertainty around accessibility and economic viability.

## 7. Future technical improvements

A more advanced version could use validated orbital elements and epoch-based propagation, catalogue-backed small-body targets, mission delta-v estimates, spacecraft transfer windows, and a resource-confidence model. Each addition should include sources, assumptions and units so the simulation does not imply more scientific precision than it has.
