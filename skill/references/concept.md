# Concept Diagrams

Use this guide to explain how an idea or a pipeline works: boxes grouped into stages, read in one direction (how RAG answers a question, how a build pipeline turns code into an image). You write the `.excalidraw` file directly: geometry and a role on every element. `restyle.js` then applies colors and fonts from the design file. The reference result is [`examples/concept-rag/`](../examples/concept-rag/), drawn with its own whiteboard `DESIGN.md`; its PNG is an optional reference for the intended result.

## Workflow

`<skill>` is the skill directory. Each step ends when its check passes.

1. **Plan the story.** Write down the stages, the steps in each stage in order, each place where a stage hands data to another (usually one), and the fact a reader would ask "why?" about. One idea per diagram. Done when every step has a verb-first or noun label of at most four words and a stage.
2. **Lay out the grid** following [Layout](#layout). Done when every box, zone and gap has its coordinates before any arrow is drawn.
3. **Draw the file.** A throwaway script that writes fixed coordinates is fine; keep it outside the project. Templates are in [element-templates.md](element-templates.md).
4. **Apply the design:** `node <skill>/scripts/restyle.js diagram.excalidraw`.
5. **Validate:** `node <skill>/scripts/validate.js diagram.excalidraw`. Done when it prints `No problems found.`
6. **Render and review:** `node <skill>/references/render_excalidraw.js diagram.excalidraw`, open the PNG, and go through both checklists. Fix and repeat from step 4. Done when every item passes.

## Layout

Sizes are in pixels. `padding` is the `## Diagrams` token of the design file.

- **Header:** title at the top left (font size 30, role `title`), one line below it (16, role `body`) naming the source and how to read the diagram. A diagram with no real source says "Illustrative ...".
- **Group into zones:** one dashed `zone` rectangle per stage (for RAG: indexing and answering). A zone holds one row of boxes read left to right; stack zones top to bottom in the order the stages happen. A zone label (font 22, role `subtitle`, prefixed `A.`, `B.`) sits `padding` from the zone's top left corner, with the box row below it. Zones keep at least `padding`, preferably 80, from each other so a link between them has room for its label.
- **Boxes:** equal size per diagram, about 160 × 90, one column pitch apart (box width + 64). Align boxes that link two zones in the same column, so the link runs straight; the zone then keeps free room on the side of the row, and every zone has the same width; the free room may be on either side, and the note or the legend may fill it.
- **Reading order:** left to right inside a zone, top to bottom across zones. Number the steps of each zone from 1 with a `step` badge (role `step`, a 26 × 26 ellipse centered on the box's top edge, 10 from its left edge; its number is bound text). A link between zones is a solid arrow with a short label to its right on a `label-background`, inside the gap between the zones.
- **How much text a shape holds:** at most four words in two lines of about twelve characters, one sentence never. A parenthetical counts as words: move it to the legend or a note. Put the detail in the subtitle or a note, not in the box. For the hand-drawn look, keep a margin of at least 12 between the text and the shape edge.
- **Arrows:** role `structure`, from the edge of one box to the edge of the next, bound to both, with `endArrowhead` set to `arrow` on the element. One arrow per hand-off.
- **Roles by meaning:** `start` for the question or trigger that starts the flow, `end` for the last step, which delivers the result, `primary` for the step that stores or publishes an artifact (skip it when no step does), `secondary` for plain processing, `tertiary` for the raw source material of the first step, `error` and `warning` only for failures.
- **The `ai` role:** use it for every step that a model performs (an embedding model, an LLM, a classifier), and for no step that plain code does. When a diagram has `ai` steps, add a legend at the right end of the header row: a small swatch with the `ai` role and "= step run by a model" (name the color in words only through the swatch, since the design file decides it); otherwise omit the legend.
- **Notes:** a `note` of at most three short lines for one why the boxes cannot show, in a free slot (the empty tail or a gap of a zone's row, where no box or arrow is, at least 80 wide) next to the step it explains and naming its step numbers with the zone letter (A3, B2), rotated by −0.03 radians (box and every line). Use one or two.
- **Draw order:** zones, arrows, shapes and badges, label backgrounds, notes, then all text.

## Communication checklist

- [ ] The title says what the diagram explains and the line below names the source or says "Illustrative".
- [ ] Each stage is one zone, and the zones read in the order the stages happen.
- [ ] The steps of each zone are numbered in reading order.
- [ ] Every box holds at most four words in two lines.
- [ ] Steps run by a model use the `ai` role, and only those.
- [ ] Each hand-off between zones is an arrow with a short label.
- [ ] Each note explains a why and covers no arrow or label.

## Visual checklist

`validate.js` checks overlaps, padding and structure; this list covers what it cannot see.

- [ ] No clipped text: every label sits fully inside its box with a margin, readable at the rendered size.
- [ ] Arrows reach their targets: each starts and ends on a box edge with its head visible.
- [ ] Boxes in a row share one baseline and one size; linked boxes across zones share a column.
- [ ] Contrast: dark text on every fill, and no label is lost on the canvas color.
- [ ] No large empty region unexplained: space left in a zone is on the side of the row, never between linked boxes.
- [ ] Roughness does not blur: text, badges and arrowheads stay legible.
