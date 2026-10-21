# 0003. Agents draw sequence diagrams directly, without a generator

- Status: Accepted
- Date: 2026-10-21
- Supersedes: decision 2 of ADR 0001 ("Specs only generate a first draft")

## Context

The first version of the skill included a sequence generator: a YAML spec format, a parser, a deterministic layout engine and an Excalidraw writer, about 525 lines plus their tests. Each new diagram type would have needed its own generator.

Two observations led to this decision:

- An agent with only the sequence guide and the renderer, without the generator, drew the same authentication diagram to the same checklist in two render iterations. The generator added no quality.
- The weaknesses of the generated diagrams were about communication (no title, no notes, no grouping, errors not highlighted, unreadable frames). These are judgements about what to show; they belong in a guide that the agent applies, not in a layout algorithm.

What the agent cannot do reliably by eye is mechanical: applying design tokens, and spotting text that collides with lines or sits too close to an edge.

## Decision

1. The sequence generator and its spec format are removed. The agent writes the `.excalidraw` file directly, with geometry and a role on every element, following `skill/references/sequence.md`.
2. Scripts cover only the mechanical work: `restyle.js` applies the `DESIGN.md` tokens by role, `validate.js` checks structure, overlapping text and padding, and `render_excalidraw.js` renders the file for visual review.
3. The guide carries the drawing rules (grid, zones, frames, notes, numbering) and two checklists, one for communication and one for what `validate.js` cannot see. `skill/examples/oauth-pkce/` is the reference result (the examples now live in `examples/` at the repository root, outside the skill).

## Consequences

- Adding a diagram type means writing a guide and an example, not a generator.
- Decisions 1 and 3 to 6 of ADR 0001 still hold: the `.excalidraw` file is the source of truth, every element has a role, and `restyle` applies the tokens.
- Layout quality depends on the agent following the guide. `validate.js` and the checklists are the safety net, and a guide change should be checked by having an agent draw a diagram with it.
- The `restyle` tests use a static fixture instead of generated diagrams.
