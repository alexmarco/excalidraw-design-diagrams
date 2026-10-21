---
name: excalidraw-diagram
description: Draw Excalidraw diagrams that explain flows and architectures, such as sequence diagrams, styled from DESIGN.md and rendered to PNG and SVG. Use when creating, editing, restyling or reviewing an .excalidraw file.
---

# Excalidraw Diagram

You write the `.excalidraw` file yourself: the geometry, and a role on every element. The scripts do the mechanical parts: apply the design, check the file, and render it so you can see it. `<skill>` is this skill's directory; run the commands from the project root.

## Workflow

1. Pick the diagram type below and read its guide. Done when you have read the whole guide. Opening the guide's example is optional, for reference.
2. Draw the file following the guide. Done when every element has a `customData.role`.
3. Apply the design: `node <skill>/scripts/restyle.js diagram.excalidraw` (add `--design path/to/DESIGN.md` for a style outside the project). It sets colors, fonts, roughness and corner radius from each element's role and keeps geometry and text. It also sets the canvas background from the design.
4. Validate: `node <skill>/scripts/validate.js diagram.excalidraw` (with the same `--design` if you used it). Done when it prints `No problems found.`
5. Render: `node <skill>/references/render_excalidraw.js diagram.excalidraw` writes a PNG and an SVG beside the file. Open the PNG and go through the guide's checklists. Fix and repeat from step 3 until every item passes. If rendering fails, see [references/README.md](references/README.md).

The `.excalidraw` file is the source of truth: later changes are edits to it. After changing `DESIGN.md`, run steps 3 to 5 again.

## Diagram types

| Type | Use it for | Guide |
| --- | --- | --- |
| Sequence | Messages between participants over time: API calls, login flows, retries | [references/sequence.md](references/sequence.md) |
| Concept | How an idea or pipeline works, in grouped stages: RAG, a build pipeline | [references/concept.md](references/concept.md) |
| Architecture | Components and connections of a system: services, queues, databases, grouped by layer | [references/architecture.md](references/architecture.md) |
| Data model | Tables, keys and relationships with cardinalities: database schemas, entity-relationship diagrams | [references/data-model.md](references/data-model.md) |
| State | The life cycle of one thing: states, transitions with events and guards | [references/state.md](references/state.md) |
| Decision flow | Steps with choices: pipelines, approvals, retry and error paths | [references/flow.md](references/flow.md) |
| Icons (add-on) | Lucide and Simple Icons on the components of an architecture or concept diagram, when they help identify them | [references/icons.md](references/icons.md) |

For a type without a guide, draw with [references/element-templates.md](references/element-templates.md) and [references/json-schema.md](references/json-schema.md), and keep the same workflow.

## Design rules

- Every element has a role; its look comes from that role's tokens in the design file, never from hand-picked values. The base `<skill>/DESIGN.md` always applies; the file passed with `--design`, else the project's `DESIGN.md` (or `docs/DESIGN.md`) next to the diagram, overrides it token by token, so it may define only what changes.
- Verify names, endpoints and formats against the real source before drawing a technical diagram; when there is no real source, label the diagram as illustrative.
- Keep labels short enough to read at the rendered size.
