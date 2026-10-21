# Excalidraw Diagram Renderer

This skill adapts the diagram design workflow and reference material from [coleam00/excalidraw-diagram-skill](https://github.com/coleam00/excalidraw-diagram-skill). Its renderer project has been migrated from Python to JavaScript. The upstream repository did not include a license file when reviewed, so no license is asserted for the upstream material.

## Setup

Install the dependencies from the repository root:

```bash
npm install
```

The renderer needs a local Google Chrome or Chromium. It looks for the browser in this order: the `CHROME_PATH` environment variable, the default install locations, then `PATH`. If none is found, the error names `CHROME_PATH`; set it to the browser executable.

Rendering needs no network access and does not download a browser.

## Render

Run it from the project root; `<skill>` is the skill directory:

```bash
node <skill>/references/render_excalidraw.js <path-to-file.excalidraw>
```

The PNG and the SVG are written beside the input by default. Optional arguments:

```text
--output, -o <path>   PNG destination; the SVG takes the same base name with a .svg extension
--scale, -s <number>  Device scale factor for the PNG (default: 2)
--width, -w <number>  Maximum PNG width in CSS pixels; wider diagrams are scaled down to fit (default: 1920)
```

The PNG is for visual review; the SVG is for documentation and the web.

`render_excalidraw.js` replaces the upstream Python renderer. Its dependencies are declared in the repository's root `package.json`.
