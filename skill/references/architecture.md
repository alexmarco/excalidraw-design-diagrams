# Architecture Diagrams

Use this guide for the components of a system and how they connect: a web application with its edge, services, queues and databases. You write the `.excalidraw` file directly: geometry, bindings and a role on every element. `restyle.js` then applies colors and fonts from `DESIGN.md`. The reference result is [`examples/web-app-architecture/`](../examples/web-app-architecture/), drawn with its own Blueprint `DESIGN.md`; open its PNG before drawing.

## Workflow

`<skill>` is the skill directory. Each step ends when its check passes.

1. **Plan the system.** List the components, the layer each belongs to, and every connection with its direction and protocol. Keep one level of abstraction (services and stores, not classes) and one story per diagram. Done when every connection has a caller, a callee and a protocol label.
2. **Lay out the grid** following [Layout](#layout): bands, columns, and the position of every box. Done when each connection can be drawn as a straight line or a single bend.
3. **Draw the file.** A throwaway script that writes fixed coordinates is fine; keep it outside the project. Templates are in [element-templates.md](element-templates.md).
4. **Apply the design:** `node <skill>/scripts/restyle.js diagram.excalidraw`.
5. **Validate:** `node <skill>/scripts/validate.js diagram.excalidraw`. Done when it prints `No problems found.`
6. **Render and review:** `node <skill>/references/render_excalidraw.js diagram.excalidraw`, open the PNG, and go through both checklists below. Fix and repeat from step 4. Done when every item passes.

## Layout

All sizes are in pixels. `padding` is the `## Diagrams` token of `DESIGN.md` (24 in the base design).

- **Header:** title at the top left (30, role `title`); below it one line (16, role `subtitle`) that says the diagram is illustrative or names its source, and how to read the arrows. Verify protocols and ports against the real source, or write "Illustrative".
- **Layers as zones:** one dashed `zone` rectangle per layer (clients, edge, application, data, background jobs), stacked top to bottom in the order a request travels. Zones share the same x and width, are `padding` away from each other and at least 90 apart when arrows with labels cross the gap. The label (18, role `zone`) sits `padding` from the zone's top left corner.
- **Components:** rectangles 220 × 72, with a two-line label (18): the component name, then what it is (`Database` / `PostgreSQL`). The text is bound inside the box (`containerId`, centered). A box sits `padding` from its zone edge and at least 68 below the zone's top, so the zone label has room.
- **Columns:** boxes snap to shared columns, 340 apart, so connections run straight and every arrow between bands is vertical. Place a component in the column of its main caller.
- **Roles:** `actor` for people and outside callers, `secondary` for entry points (CDN, load balancer), `primary` for services you build, `store` for anything that holds state (database, cache, queue). Use one color per role and no other color.
- **Notes:** at most one sticky note (see Notes in [sequence.md](sequence.md)), in a free spot of the zone it explains.
- **Draw order** (array order is z-order): zones, arrows, shapes and the note's rectangle, then all text.

## Arrows

- **Direction:** the arrow points from the caller to the callee, or along the message for a queue. A request and its response are one arrow.
- **Roles:** `message-sync` for a call that waits for an answer (filled head), `message-async` for a hop through a queue or any fire-and-forget message (open head).
- **Bindings:** every arrow is bound at both ends. Set `startBinding` and `endBinding` with `elementId`, `focus` 0 and `gap` 2, and list the arrow in the `boundElements` of both shapes. Draw the arrow from the midpoint of a box edge, 2 away from it, so moving a box keeps its arrows attached.
- **Routing:** a straight line when the boxes share a column or a row; otherwise one bend, leaving the side of the box and entering the other box from above or below. Arrows never cross a box and cross each other as little as possible.
- **Labels:** the protocol and, when it helps, the port (`HTTPS`, `SQL :5432`), font 16, role `text-on-light`. Put the label to the right of a vertical arrow, centered in the gap between two zones, or above a horizontal arrow, centered between the boxes. A label never crosses a zone edge. One protocol per arrow; shorten rather than wrap.

## Communication checklist

- [ ] The title says what the system is and the line below says it is illustrative or names the source.
- [ ] Layers read top to bottom in request order, and each component is in the zone of its layer.
- [ ] Every connection has an arrow with a protocol label, pointing from caller to callee.
- [ ] Synchronous and asynchronous hops use their own role, and the line below the title explains the arrowheads.
- [ ] Each component label says what it is, not only its name.
- [ ] The note, if any, explains a why the arrows cannot show.

## Visual checklist

`validate.js` checks overlaps, padding and structure; this list covers what it cannot see.

- [ ] No clipped text: every label is fully inside its box or zone and readable at the rendered size.
- [ ] Arrows reach their targets: each starts and ends on the edge of its boxes with the head visible, and none passes through a box.
- [ ] Every arrow is bound at both ends and listed in the `boundElements` of both shapes.
- [ ] Labels sit beside their arrow, outside every zone edge, and cannot be mistaken for the label of a neighboring arrow.
- [ ] Boxes line up on shared columns; zones have equal width and equal gaps.
- [ ] Roles are visible: services, stores, entry points and outside callers each look different, and the text contrasts with its background.
- [ ] Restyled with the base design (`restyle.js diagram.excalidraw --design <skill>/DESIGN.md` on a copy), the diagram stays valid and readable.
