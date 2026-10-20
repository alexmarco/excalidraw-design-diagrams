# Excalidraw Diagram Renderer

This skill adapts the diagram design workflow and reference material from [coleam00/excalidraw-diagram-skill](https://github.com/coleam00/excalidraw-diagram-skill). Its renderer project has been migrated from Python to JavaScript. The upstream repository did not include a license file when reviewed, so no license is asserted for the upstream material.

## Setup

Install the JavaScript dependency and Chromium from this directory:

```bash
npm install
npx playwright install chromium
```

The renderer uses Playwright with headless Chromium. Its HTML template imports Excalidraw from `esm.sh`, so rendering also needs network access.

## Render

```bash
node render_excalidraw.js <path-to-file.excalidraw>
```

The PNG is written beside the input by default. Optional arguments:

```text
--output, -o <path>   PNG destination
--scale, -s <number>  Device scale factor (default: 2)
--width, -w <number>  Maximum viewport width (default: 1920)
```

`package.json` replaces the upstream Python project metadata, and `render_excalidraw.js` replaces its Python renderer.
