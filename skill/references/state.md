# State Diagrams

Use this guide for the life cycle of one thing: an order, a ticket, a connection. States are boxes, transitions are arrows between them. You write the `.excalidraw` file directly: geometry and a role on every element. `restyle.js` then applies colors and fonts from `DESIGN.md`. The reference result is [`examples/order-lifecycle/`](../examples/order-lifecycle/); open its PNG before drawing.

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
- **Main path:** the happy path runs left to right on one row, states 180 × 64, rounded, label font 18, role `primary`. Columns are at least 260 apart so the longest transition label fits in the gap with 16 to spare on each side (about `0.5 × font size` pixels per character).
- **Failure and side paths:** below the main row, under the state they leave, so they do not cross the main path. Plan the grid so that no two transitions cross; when two would, swap the positions of two states.
- **Initial state:** a filled dot 20 × 20, role `marker`, left of the first state, with an unlabelled transition to it. One per diagram.
- **Final state:** a ring 28 × 28 (role `structure`, no fill) with a dot 16 × 16 (role `marker`) centered inside it. A diagram may have several. Transitions into it carry the event that ends the life cycle, or none when the state ends on its own.
- **Failure state:** role `error` for the state a life cycle ends in unsuccessfully, such as "Cancelled". Use color only for the failure path.
- **Transitions:** role `message-async` (solid, open head), an arrow from the edge of one state to the edge of the next. Bind both ends: `startBinding` and `endBinding` name the connected states, and each state lists the arrow in its `boundElements`. A transition on the failure path takes role `error`, on both the arrow and its label.
- **Direction:** every arrow is horizontal or vertical. A transition between states that share no row or column bends once at a right angle: out of the bottom or top edge, then into the side edge of the target, with its label above the long segment. Keep the final markers of all rows in one column.
- **Self-transition:** an arrow that leaves the top edge of a state, goes up 44, right 80 and back down into the same state, with `startBinding` and `endBinding` both naming that state. Its label sits above the loop.
- **Transition labels:** font 16, `event [guard]`. The event is a short past-tense name or verb (`payment_received`); the guard is a condition in brackets (`[amount = total]`). Put a long guard on a second line. Center the label on the widest free stretch of its arrow, with an opaque rectangle behind it (role `label-background`) so the arrow does not cross the text. A label above a horizontal arrow sits 20 to 28 above it and needs no backing. A self-transition label needs none either.
- **Draw order** (array order is z-order): states, markers and rings, arrows, label backgrounds, then all text.

## Communication checklist

- [ ] The title names the thing whose life cycle it shows, and the line below names the source or says it is illustrative.
- [ ] There is exactly one initial marker, and every final state has a ring marker.
- [ ] Every transition except those from the initial marker has an event; a guard is in brackets after the event.
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
