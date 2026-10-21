# Decision Flow Diagrams

Use this guide for a process with choices: a pipeline, an approval, a triage, a retry loop. You write the `.excalidraw` file directly: geometry and a role on every element. `restyle.js` then applies colors and fonts from the design file. The reference result is [`examples/ci-cd-pipeline/`](../examples/ci-cd-pipeline/), which also shows a project `DESIGN.md` that overrides only colors and the font family; open its PNG before drawing.

## Workflow

`<skill>` is the skill directory. Each step ends when its check passes.

1. **Plan the flow.** Write down the start, the steps in order, every decision with its outcomes, the retry paths, the error paths and the end. Keep one process per diagram and one level of abstraction. Done when every step is a verb phrase, every decision is a question, and every decision has an outcome for each of its answers.
2. **Lay out the grid** following [Layout](#layout). Done when every node has a fixed center before any arrow is drawn.
3. **Draw the file.** A throwaway script that writes fixed coordinates is fine; keep it outside the project. Templates are in [element-templates.md](element-templates.md).
4. **Apply the design:** `node <skill>/scripts/restyle.js diagram.excalidraw`.
5. **Validate:** `node <skill>/scripts/validate.js diagram.excalidraw`. Done when it prints `No problems found.`
6. **Render and review:** `node <skill>/references/render_excalidraw.js diagram.excalidraw`, open the PNG, and go through both checklists at the end of this guide. Fix and repeat from step 4. Done when every item passes.

## Layout

All sizes are in pixels.

- **Header:** title at the top left (font size 30, role `title`), one line below it (16, role `body`) naming the source and how to read the diagram, for example "Illustrative pipeline · read top to bottom · diamonds are decisions · dashed arrows are retry and errors". Name only the dashed arrows the diagram has. A diagram with no real source says so.
- **Reading direction:** top to bottom. The main path, the one a run follows when everything goes well, is a single straight column. Branches leave to the right into a side column. The side column holds the steps of a non-main branch, retry nodes and error nodes. Start at the top of the main column and end at its bottom.
- **Nodes:** steps are rectangles 230 × 64, rounded, font 18, role `primary`. The start is an ellipse 200 × 60, role `start`, labelled with the trigger ("Push to main"). The success end is an ellipse 200 × 60, role `end`. A decision is a diamond 260 × 120, role `decision`. A failure end is a rectangle 230 × 64, role `error`. Every node holds its label as a bound text with the same role: `containerId` is the node, the node lists the text in `boundElements`, `textAlign` is `center`, `verticalAlign` is `middle`, and the text is about `0.55 × font size` pixels wide per character and `1.25 × font size` high per line. Labels, the title and the subtitle are free texts with the roles named below.
- **Rows:** 58 between one node and the next on the main column; arrows run straight between node edges.
- **Side column:** its center sits at least 100 to the right of the main column's diamonds, so a branch arrow between a diamond and a side node is at least 100 long.
- **Arrows:** flow arrows are `message-sync` (solid, filled head), start and end exactly on the node edge (the vertex of a diamond), with binding `gap` 0, and bind to both nodes. An arrow that bends uses `points` with one vertex per turn and no rounding. A retry path that goes back up is `message-return` (dashed grey) with a right-angle bend. A path that ends in a failure is `error-return` (dashed red).
- **Draw order** (array order is z-order): arrows, then shapes, then all text.

## Decisions

- Phrase a decision as a yes-or-no question ("Tests pass?"), at most four words.
- Every decision has one outgoing arrow per answer, and each arrow carries its answer as a label: `Yes` and `No`. Put the answer that continues the main path on the main column, straight down, and the other answer to the side. Arrows that leave a step carry no label.
- Place a label beside its arrow, 10 to the right of a vertical arrow, or on a horizontal segment (the first one of a bending arrow) with its bottom 6 above the line and its left edge 20 past the source node, in role `text-on-light` (or `error-return` on an error arrow), font 16, never on the arrow line and never touching a node or an arrowhead.
- A decision has one arrow in and two arrows out.

## Merging paths

- When two paths lead to the same outcome, draw one node for that outcome and point both arrows at it, each at a different edge ("Fail the run and notify the team" receives the retry exhaustion and the failed smoke test).
- Arrows never cross. When a crossing looks unavoidable, move the side column or reorder the nodes.
- A retry path returns to the step it repeats, enters it at the side facing the side column, and is labelled above its horizontal segment ("Yes, run again").

## Error paths

- A path that ends in failure is drawn with `error-return` arrows into a node with the role `error`. Use red for failure only; the rest of the diagram uses no extra color.
- A failure is a terminal: no arrows leave an `error` node. When a failure triggers a recovery, draw it as a normal step after the `error` node.
- Success and failure ends stay apart: the main `end` at the bottom of the main column, `error` nodes in the side column. A second success end, such as an early exit, goes in the side column with the `end` role.

## Communication checklist

- [ ] The title says what the process achieves and the line below names the source, or says it is illustrative.
- [ ] The diagram has exactly one start, and every path ends in an `end` or an `error` node.
- [ ] Every decision is a question and each of its outgoing arrows is labelled with an answer.
- [ ] Steps are verb phrases of at most four words.
- [ ] Paths that reach the same outcome merge into one node.
- [ ] Retry paths return to the repeated step; error paths end in an `error` node; no extra color is used.

## Visual checklist

`validate.js` checks structure and overlaps; this list covers what it cannot see.

- [ ] No clipped text: every label is fully inside its node and readable at the rendered size.
- [ ] Arrows reach their targets: each starts and ends on a node edge with its head visible, and none crosses another arrow or a node.
- [ ] The main path is one straight column read top to bottom, and the side column holds only non-main branch steps, retry nodes, error nodes and early ends.
- [ ] Start, end, decision and error nodes look different from steps and from each other, by shape and by color.
- [ ] Dashed arrows are retry or error paths only; every other arrow is solid.
- [ ] Every label sits beside its arrow with clear space around it, touching no node and no arrowhead.
- [ ] Spacing is even: the same gap between rows, and the same distance between columns for every branch.
