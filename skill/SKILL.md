---
name: excalidraw-diagram
description: Create and visually validate Excalidraw diagrams that explain workflows, architectures, and concepts. Use when creating or editing .excalidraw diagrams.
---

# Excalidraw Diagram Creator

Create `.excalidraw` JSON files that communicate relationships, causality, and flow through their visual structure, not just through labels. This skill is adapted from [coleam00/excalidraw-diagram-skill](https://github.com/coleam00/excalidraw-diagram-skill).

## Design the diagram

1. Decide whether the request calls for a simple conceptual diagram or a comprehensive technical diagram.
2. For a technical diagram, research the real formats, event names, API methods, and relationships before drawing. Show concrete examples such as code, payloads, or actual interface content where they teach the reader.
3. Map each concept to a fitting visual pattern: fan-out, convergence, tree, timeline, cycle, transformation, comparison, or phase break. Use distinct patterns for distinct concepts instead of a uniform grid of cards.
4. Plan the eye's path and use layers of detail for a comprehensive diagram: summary flow, section boundaries, and concrete details.
5. Default to free-floating text. Add a shape only when the shape itself communicates meaning, groups related content, or provides a useful connection point.
6. Read `references/color-palette.md` and use it as the sole source for colors.
7. For large diagrams, build one coherent section at a time. Use descriptive IDs, avoid duplicate IDs, and check bindings between sections.

## Create Excalidraw JSON

Use `references/element-templates.md` for element examples and `references/json-schema.md` for the file and element structure. Keep `text` and `originalText` limited to readable text. Set `fontFamily` to `3`, prefer `roughness: 0` for technical diagrams, and use `opacity: 100`. Connect related elements explicitly with lines or arrows; position alone does not express a relationship.

## Render and inspect

Rendering and visual inspection are required after creating or changing a diagram. From this skill's `references` directory, run:

```bash
node render_excalidraw.js <path-to-file.excalidraw>
```

The renderer writes a PNG beside the input file by default. Use `--output`, `--scale`, and `--width` to set the output path, device scale, and maximum viewport width. Open the PNG and compare it with the intended visual story. Check for clipped or unreadable text, unintended overlaps, arrows crossing or missing targets, unclear labels, uneven spacing, and an unbalanced composition. Fix the JSON and render again until those issues are resolved.

If the renderer is not installed, follow `references/README.md`.

## Final review

- Does the visual structure mirror the concepts and show a clear reading order?
- For technical diagrams, are names, formats, and examples accurate and concrete?
- Do all intended relationships have clear connections?
- Are colors drawn from the palette and text readable at the rendered size?
- Does the rendered image have balanced spacing, no unintended overlaps, and no clipping?
