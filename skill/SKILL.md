---
name: excalidraw-diagram
description: Create, render and restyle Excalidraw diagrams that explain workflows, architectures, and concepts. Use when creating or editing .excalidraw diagrams.
---

# Excalidraw Diagram

Create `.excalidraw` files that show relationships and flow through their structure. In the commands below, `<skill>` is this skill's directory (`skill/` in this repository). Run them from the project root.

## Workflow

1. Pick the diagram type from the index below and read its guide before writing anything.
2. Generate the draft from a spec, for example `node <skill>/scripts/generate_sequence.js spec.yaml` for sequence diagrams.
3. Render the diagram: `node <skill>/references/render_excalidraw.js diagram.excalidraw` writes a PNG and an SVG beside it. Open the PNG, check it against the guide's checklist, fix the spec or the file, and render again until it passes. If rendering fails, see [references/README.md](references/README.md).
4. After changing `DESIGN.md`, restyle the file with `node <skill>/scripts/restyle.js diagram.excalidraw`, then render again. Restyling changes only the look; it keeps meaning and layout.

The `.excalidraw` file is the source of truth. Generate it once; edit it by hand afterwards instead of regenerating it from the spec.

## Diagram types

| Type | Use it for | Guide |
| --- | --- | --- |
| Sequence | Messages exchanged between participants over time: API calls, login flows, retries | [references/sequence.md](references/sequence.md) |

Load only the guide for the type you need. For a type without a generator, draw the file by hand with [references/element-templates.md](references/element-templates.md) and [references/json-schema.md](references/json-schema.md).

## Design rules

- Give every element a role. Colors and strokes come from the design tokens of its role, never from hand-picked values. The design file is the first that exists of: the one passed with `--design`, the project's `DESIGN.md` (or `docs/DESIGN.md`), and the base `<skill>/DESIGN.md`.
- Verify names, formats and examples against the real source before drawing a technical diagram.
- Default to free-floating text. Add a shape only when it carries meaning, groups content, or anchors a connection.
- Keep labels short enough to read at the rendered size.
