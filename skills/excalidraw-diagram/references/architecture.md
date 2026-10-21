# Architecture Diagrams

Use this guide for the components of a system and how they connect: a web application with its edge, services, queues and databases. You write the `.excalidraw` file directly: geometry, bindings and a role on every element. `restyle.js` then applies colors and fonts from `DESIGN.md`. The reference result is [`examples/web-app-architecture/`](https://github.com/alexmarco/excalidraw-design-diagrams/tree/main/examples/web-app-architecture/), drawn with its own Blueprint `DESIGN.md`; its PNG shows the intended result, and this guide is enough to draw without opening it. The document wrapper (`type`, `elements`, `appState`, `files`) is in [json-schema.md](json-schema.md).

## Workflow

`<skill>` is the skill directory. Each step ends when its check passes.

1. **Plan the system.** List the components, the layer each belongs to, and every connection with its direction and protocol. Keep one level of abstraction (services and stores, not classes) and one story per diagram. Done when every connection has a caller, a callee and a protocol label.
2. **Lay out the grid** following [Layout](#layout): bands, columns, and the position of every box. Done when each connection can be drawn as a straight line or a single bend.
3. **Draw the file.** A throwaway script that writes fixed coordinates is fine; keep it outside the project. Templates are in [element-templates.md](element-templates.md).
4. **Apply the design:** `node <skill>/scripts/restyle.js diagram.excalidraw`.
5. **Validate:** `node <skill>/scripts/validate.js diagram.excalidraw`. Done when it prints `No problems found.`
6. **Render and review:** `node <skill>/references/render_excalidraw.js diagram.excalidraw`, open the PNG, and go through both checklists below. The validator does not check that arrows reach their boxes: confirm it in the PNG. Fix and repeat from step 4. Done when every item passes.

## Layout

All sizes are in pixels. `padding` is the `## Diagrams` token of `DESIGN.md` (24 in the base design). Free text: height is `1.25 × font size` per line and width about `0.6 × font size × characters`; centered text inside a box takes the box width.

- **Header:** title at the top left (30, role `title`); below it one line (18, role `subtitle`) that says the diagram is illustrative or names its source, and how to read the arrowheads. Verify protocols and ports against the real source, or write "Illustrative".
- **Layers as zones:** one dashed rectangle per layer (clients, edge, application, data, background jobs, external systems), stacked top to bottom in the order a request travels, systems outside your control last. The rectangle and its label (18) both take the role `zone`; the label sits `padding` from the zone's top left corner. Zones share the same x and width, and sit 90 apart so the labels of arrows that cross the gap fit. Zone height is `68 + box height + padding`; zone width is `2 × padding + (columns − 1) × 340 + box width`.
- **Components:** rectangles 220 × 72 inside their zone, 68 below its top so the zone label has room, `padding` from its sides. Each box holds two texts, both in the role of the box and in one group (`groupIds`) with it: the name (20) bound inside it (`containerId` set, the box lists the text in `boundElements`, `textAlign` center, `verticalAlign` middle, the width of the box minus 10), and below it a free text with what it is (15), such as `PostgreSQL` or `static assets`. The name carries the hierarchy: the second line is smaller, never a second name.
- **Columns:** boxes snap to shared columns, 340 apart, so connections run straight and every arrow between bands is vertical. Put a component in the column of its main caller; a caller with several callees sits in the middle column and reaches the side columns with one bend.
- **Roles:** the box and its two texts take the same role. `actor` for people and outside callers, `secondary` for entry points (CDN, load balancer, gateway), `primary` for services you build, `store` for anything that holds state (database, cache, queue). `participant-external` suits systems of other organizations. Each role has its own text color in the design, so use no role and no color beyond these.
- **Notes:** at most one sticky note, role `note`: a rectangle plus one text per line (16, at most three short lines), all rotated by −0.03 radians, in a free spot of the zone it explains with `padding` from the zone edge.
- **Draw order** (array order is z-order): zones, arrows, shapes and the note's rectangle, then all text.

## Arrows

- **Direction:** the arrow points from the caller to the callee, or along the message for a queue. A request and its response are one arrow.
- **Roles:** `message-sync` for a call that waits for an answer (filled head), `message-async` for any message that does not wait for one, through a queue or not (open head).
- **Bindings:** every arrow is bound at both ends. Set `startBinding` and `endBinding` with `elementId`, `focus` 0 and `gap` 2, and list the arrow in the `boundElements` of both shapes. The arrow starts and ends at the midpoint of a box edge, 2 away from it, so moving a box keeps its arrows attached. A vertical arrow from box A (bottom `b`) to box B (top `t`) at x = the center of both starts at `(x, b + 2)` and has `points [[0, 0], [0, t − b − 4]]`; `width` and `height` are the extent of the points. An arrow with a bend lists every corner in `points`, relative to its start.
- **Routing:** a straight line when the boxes share a column or a row; otherwise one bend, leaving the side of the box and entering the other box from above or below. An arrow may cross a zone that holds no box in its way. Arrows never cross a box and cross each other as little as possible.
- **Labels:** the protocol and, when it helps, the port (`HTTPS`, `SQL :5432`), font 16, role `body`. Put the label to the right of a vertical arrow, centered in the gap between two zones nearest the callee, or above a horizontal arrow, centered between the boxes. A label never crosses a zone edge. One protocol per arrow; shorten rather than wrap.

## Communication checklist

- [ ] The title says what the system is and the line below says it is illustrative or names the source.
- [ ] Layers read top to bottom in request order, and each component is in the zone of its layer.
- [ ] Every connection has an arrow with a protocol label, pointing from caller to callee.
- [ ] Synchronous and asynchronous hops use their own role, and the line below the title explains the arrowheads.
- [ ] Each component has its name and a second line saying what it is, and the name stands out.
- [ ] The note, if any, explains a why the arrows cannot show.

## Visual checklist

`validate.js` checks overlaps, padding and structure; this list covers what it cannot see.

- [ ] No clipped text: every label is fully inside its box or zone and readable at the rendered size.
- [ ] Arrows reach their targets: each starts and ends on the edge of its boxes with the head visible, and none passes through a box.
- [ ] Every arrow is bound at both ends and listed in the `boundElements` of both shapes.
- [ ] Labels sit beside their arrow, outside every zone edge, and cannot be mistaken for the label of a neighboring arrow.
- [ ] Boxes line up on shared columns; zones have equal width and equal gaps.
- [ ] Roles are visible: services, stores, entry points and outside callers each look different, and the text contrasts with its background.
- [ ] Only when the diagram has its own `DESIGN.md`: restyling a copy with the base design (`restyle.js copy.excalidraw --design <skill>/DESIGN.md`) still passes `validate.js` and reads well.
