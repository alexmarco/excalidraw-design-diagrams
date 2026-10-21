---
name: excalidraw-diagram
description: Draw Excalidraw diagrams that explain flows and architectures, such as sequence diagrams, styled from DESIGN.md and rendered to PNG and SVG. Use when creating, editing, restyling or reviewing an .excalidraw file.
---

# Excalidraw Diagram

You write the `.excalidraw` file yourself: the geometry, and a role on every element. The scripts do the mechanical parts: apply the design, check the file, and render it so you can see it. `<skill>` is this skill's directory; run the commands from the project root.

## Workflow

1. Pick the diagram type below and read its guide. Done when you have read the whole guide and opened its example.
2. Draw the file following the guide. Done when every element has a `customData.role`.
3. Apply the design: `node <skill>/scripts/restyle.js diagram.excalidraw`. It sets colors, fonts, roughness and corner radius from each element's role and keeps geometry and text.
4. Validate: `node <skill>/scripts/validate.js diagram.excalidraw`. Done when it prints `No problems found.`
5. Render: `node <skill>/references/render_excalidraw.js diagram.excalidraw` writes a PNG and an SVG beside the file. Open the PNG and go through the guide's checklists. Fix and repeat from step 3 until every item passes. If rendering fails, see [references/README.md](references/README.md).

The `.excalidraw` file is the source of truth: later changes are edits to it. After changing `DESIGN.md`, run steps 3 to 5 again.

## Diagram types

| Type | Use it for | Guide |
| --- | --- | --- |
| Sequence | Messages between participants over time: API calls, login flows, retries | [references/sequence.md](references/sequence.md) |
| Architecture | Components and connections of a system: services, queues, databases, grouped by layer | [references/architecture.md](references/architecture.md) |

For a type without a guide, draw with [references/element-templates.md](references/element-templates.md) and [references/json-schema.md](references/json-schema.md), and keep the same workflow.

## Design rules

- Every element has a role; its look comes from that role's tokens in the design file, never from hand-picked values. The design file is the first that exists of: the one passed with `--design`, the project's `DESIGN.md` (or `docs/DESIGN.md`) next to the diagram, and the base `<skill>/DESIGN.md`.
- Verify names, endpoints and formats against the real source before drawing a technical diagram; when there is no real source, label the diagram as illustrative.
- Keep labels short enough to read at the rendered size.
