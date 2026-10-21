# 0001. The `.excalidraw` file is the source of truth

- Status: Accepted. Decision 2 superseded by ADR 0003.
- Date: 2026-10-20

## Context

The skill creates Excalidraw diagrams that must follow a project's visual identity. Diagrams can be drafted from a textual spec, but people then edit them by hand in Excalidraw, and the styling must stay consistent with the project's design system (DESIGN.md) without overwriting those manual edits.

## Decision

1. The `.excalidraw` file is the source of truth. Edits made in Excalidraw are the authoritative state of the diagram.
2. Specs only generate a first draft. Generating from a spec creates the initial `.excalidraw` file; it is not re-run to rebuild a diagram that already exists.
3. Every element carries a `role` (for example, a process step, a decision, or a boundary). The role states what the element means, independently of how it looks.
4. `restyle` applies DESIGN.md tokens by role. It changes the visual style of elements based on their role and leaves their meaning and layout unchanged.
5. Diagram tokens live in a `## Diagrams` YAML block inside DESIGN.md.
6. DESIGN.md precedence is explicit: an explicit path given in the request wins, then the project's DESIGN.md, then the skill base defaults.

## Consequences

- Manual edits in Excalidraw are preserved, because nothing regenerates the file from the spec after the first draft.
- Restyling is safe to run repeatedly, because the role determines the style and the file keeps the diagram's content.
- Teams can change the look of all diagrams by editing one YAML block, and the precedence rule makes it clear which tokens apply to a given diagram.

## Out of scope

- MCP server.
- Bidirectional sync between the `.excalidraw` file and a spec or other source.
- Mermaid conversion.
- Automatic layout.
