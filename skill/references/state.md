# State Diagrams

Use this guide for the life cycle of one thing: an order, a ticket, a connection. States are boxes, transitions are arrows between them. You write the `.excalidraw` file directly: geometry and a role on every element. `restyle.js` then applies colors and fonts from `DESIGN.md`. The reference result is [`examples/order-lifecycle/`](../examples/order-lifecycle/); its PNG is an optional reference for the intended result.

## Workflow

`<skill>` is the skill directory. Each step ends when its check passes.

1. **Plan the machine.** Write down the states, the one initial state, each final state, and every transition as `from -> to: event [guard]`. Keep one thing and one level of abstraction per diagram. Done when every state has at least one way in and, unless it is final, one way out, and every transition has an event.
2. **Lay out the grid** following [Layout](#layout). Done when every state has a fixed position and no planned transition crosses another.
3. **Draw the file.** A throwaway script that writes fixed coordinates is fine; keep it outside the project. Templates are in [element-templates.md](element-templates.md).
4. **Apply the design:** `node <skill>/scripts/restyle.js diagram.excalidraw`.
5. **Validate:** `node <skill>/scripts/validate.js diagram.excalidraw`. Fix every reported problem and run it again. Done when it prints `No problems found.`
6. **Render and review:** `node <skill>/references/render_excalidraw.js diagram.excalidraw`, open the PNG, and go through both checklists at the end of this guide. Fix and repeat from step 4. Done when every item passes.

## Layout

All sizes are in pixels. `padding` is the `## Diagrams` token of `DESIGN.md`.

- **Header:** title at the top left (font size 30, role `title`), one line below it (16, role `body`) that names the source and how to read the arrows, for example "Illustrative flow, not tied to a real shop · each arrow is event [guard] · red arrows are the failure path". A diagram with no real source says so.
- **Main path:** the happy path runs left to right on one row, states 180 × 64, rounded, label font 18, role `tertiary` (its text takes the same role). The gap between the edges of neighbouring states is at least 260, so the longest transition label fits in it with 16 to spare on each side (about `0.5 × font size` pixels per character).
- **Failure and side paths:** below the main row, under the state they leave, so they do not cross the main path. Plan the grid so that no two transitions cross; when two would, swap the positions of two states.
- **Failure state position:** directly below the state it follows, with at least 100 between their edges. A failure state may lead to its own ring; that arrow keeps `message-async`.
- **Initial state:** a filled dot 20 × 20, role `marker`, left of the first state, with an unlabelled transition to it, 60 to 80 long. The 260 gap applies to labelled arrows only; arrows to a ring or from the initial marker may be shorter. One per diagram.
- **Final state:** a ring 28 × 28 (role `structure`, no fill) with a dot 16 × 16 (role `marker`) centered inside it. Bind arrows to the ring, not to the dot. A diagram may have several, and a ring has no label: the last named state (a box) leads to it with the event that ends the life cycle, such as `delivered`. Draw a ring only where the life cycle ends.
- **Failure state:** role `error` for every state on the failure path, such as "Cancelled". Use color only for the failure path.
- **Transitions:** role `message-async` (solid, open head), an arrow from the edge of one state to the edge of the next. Bind both ends: `startBinding` and `endBinding` name the connected states, and each state lists the arrow in its `boundElements`. The initial marker counts as a state for binding. Set `endArrowhead` to `arrow` in the file. A transition into a failure state takes role `error`, on both the arrow and its label; any other label takes `text-on-light`.
- **Direction:** every arrow is horizontal or vertical. A transition between states that share no row or column bends once at a right angle: out of the bottom or top edge, then into the side edge of the target, with its label above the long segment. When two rows each end in a ring, put both rings in one column.
- **Self-transition:** an arrow that leaves the top edge of a state, goes up 44, right 80 and back down into the same state, centered on the state's top edge (starting 40 left of its center), with `startBinding` and `endBinding` both naming that state. Its label is centered on the state, its bottom edge 10 to 28 above the top of the loop.
- **Transition labels:** font 16, `event [guard]`. The event is a short past-tense name or verb (`payment_received`); the guard is a condition in brackets (`[amount = total]`). Put a long guard on a second line. Place it above its arrow, its bottom edge 20 to 28 from it (text height is lines × 1.25 × font size) and centered on the arrow's longest straight segment; no backing is needed because the arrow does not cross the text. A label that sits on its arrow (a vertical arrow) gets an opaque rectangle behind it (role `label-background`) and is centered on the arrow.
- **Draw order** (array order is z-order): states, markers and rings, arrows, label backgrounds, then all text (state labels included, bound to their box with `containerId`).

## Communication checklist

- [ ] The title names the thing whose life cycle it shows, and the line below names the source or says it is illustrative.
- [ ] There is exactly one initial marker, and every final state has a ring marker.
- [ ] Every transition except the one from the initial marker has an event; a guard is in brackets after the event.
- [ ] Every state can be reached, and every state that is not final has a way out.
- [ ] The failure path uses the `error` role on state, arrows and labels; the rest of the diagram uses no extra color.
- [ ] Every transition is bound at both ends to the states it connects.

## Visual checklist

`validate.js` checks overlaps, padding, structure and that bound states list their arrows; this list covers what it cannot see.

- [ ] No clipped text: every label is fully inside its box and readable at the rendered size.
- [ ] No two transitions cross, and no transition passes through a state.
- [ ] Arrows reach their targets: each starts and ends on the edge of a state or marker, with its head visible.
- [ ] Each label sits on or next to its own arrow, clear of every other arrow, and is not mistaken for the label of a neighbour.
- [ ] A self-transition shows its head entering the same state it left.
- [ ] The reading order is left to right along the main path, failure paths below.
