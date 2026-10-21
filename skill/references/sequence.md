# Sequence Diagrams

Use this guide for messages exchanged between participants over time: API calls, login flows, retries. You write the `.excalidraw` file directly: geometry and a role on every element. `restyle.js` then applies colors and fonts from `DESIGN.md`. The reference result is [`examples/oauth-pkce/`](../examples/oauth-pkce/); open its PNG before drawing.

## Workflow

`<skill>` is the skill directory. Each step ends when its check passes.

1. **Plan the story.** Write down the participants in the order they first interact, the messages in order, the conditional parts (`alt`, `opt`, `loop`) and the one or two facts a reader would ask "why?" about. Keep one story per diagram and one level of abstraction (components or methods, not both). Done when every message has a sender, a receiver and a short label.
2. **Lay out the grid** following [Layout](#layout): columns, zones with their reserved room, rows. Done when every column and zone edge is fixed before any message is drawn.
3. **Draw the file.** A throwaway script that writes fixed coordinates is fine; keep it outside the project. Templates for each element are in [element-templates.md](element-templates.md).
4. **Apply the design:** `node <skill>/scripts/restyle.js diagram.excalidraw`.
5. **Validate:** `node <skill>/scripts/validate.js diagram.excalidraw`. Fix every reported problem and run it again. Done when it prints `No problems found.`
6. **Render and review:** `node <skill>/references/render_excalidraw.js diagram.excalidraw`, open the PNG, and go through both checklists at the end of this guide. Fix and repeat from step 4. Done when every item passes.

## Layout

All sizes are in pixels. `padding` is the `## Diagrams` token of `DESIGN.md` (24 in the base design): the space between the edge of a zone or frame and anything inside it, and between zones.

- **Header:** title at the top left (font size 30, role `title`), one line below it naming the source and how to read the diagram (16, role `body`), for example "RFC 6749 · numbers follow the order of the requests · dashed arrows are responses". A diagram with no real source says so: "Illustrative flow · …".
- **Participants:** boxes 210 × 56, rounded, label font 18, in the order they first interact so arrows cross as few lifelines as possible. Role `participant` for the system the diagram explains, `participant-external` for the services and tools it calls, `actor` for people and outside callers.
- **Columns:** at least 300 apart, more where a label must fit between two lifelines. A label is about `0.5 × font size` pixels per character in Excalifont, plus 26 for its step badge.
- **Zones (optional):** a dashed box that groups participants by where they run ("User's device", "Identity provider"), role `zone`, label at `padding` from its top left corner. Size each zone before drawing messages: it wraps its participant boxes plus the room its notes and self-message labels need, plus `padding` on every side, and stays `padding` away from the next zone.
- **Rows:** one message every 58, and 66 after a self message. Lifelines (role `lifeline`) run from the bottom of the header box to below the last message.
- **Activation bars:** 14 wide, centered on the lifeline, role `activation`. A participant is active while it handles a call: from the row of the call to the row of its reply. Arrows start and end at the edge of the bar (lifeline ± 7), not at its center.
- **Messages:** role `message-sync` (solid, filled head), `message-async` (solid, open head) or `message-return` (dashed, open head) for every reply. Number every message, replies included, in reading order: a 22 × 22 ellipse with role `step` and its number bound inside.
- **Message labels:** font 16, above the arrow. Center the label in the widest free stretch of the arrow: between the lifelines and zone edges it crosses, with the whole label at least 16 from any lifeline or bar and `padding` from any zone edge. When the label does not fit the widest stretch, shorten it ("GET /resource (Bearer token)", not the full header).
- **Label backgrounds:** put an opaque rectangle behind every message label: role `label-background`, or `label-background-in-frame` inside a tinted frame. It is 22 high with its top 30 above the arrow and as wide as the label text plus 38; the badge sits 4 from its left edge and the text starts 33 from it. For a self message the background starts 1 below the arrow's row.
- **Text roles:** a message label is `text-on-light`; the number in a badge is `step` (font 14, bound to its ellipse); a participant label takes the role of its box; the text in a frame tag takes `frame-tag`. Bound texts go with the other texts at the end of the draw order.
- **Lifeline tail:** lifelines end 70 below the last message.
- **Self messages:** an arrow out of the bar, 44 to the right, 26 down and back. Its badge and label go to its right.
- **Calls and replies:** every reply answers a call drawn above it, in the same frame branch. A participant that sends a new request, such as a browser following a redirect, makes a call, not a reply.
- **Errors:** a call that carries an error takes the role `error`, a reply that carries one takes `error-return`, on both the arrow and its label. Use color only for errors and the critical path.
- **Draw order** (array order is z-order): zones, frame areas, lifelines, frame dividers, activation bars, arrows, shapes and backgrounds, then all text.

## Frames

A frame is a combined fragment: `alt` (one branch runs), `opt` (runs only if its condition holds), `loop` (repeats), `break` (exits early), `ref` (points to another diagram).

- **Area:** a rectangle with role `frame`, covering every column that takes part in any of its branches, with `padding` between its edges and everything inside.
- **Operator tag:** in the top left corner, flush with the frame edges, role `frame-tag`, text `alt`, `opt`, `loop`, sized to its text plus 12 on each side.
- **Guards:** the condition of each branch in brackets, `[user approved]`, role `frame`, font 15, on a transparent background so the frame tint shows through. The first guard sits on the tag's row, `padding` to the right of the tag; when a lifeline would run under any guard, move the column right until the guards sit at least 16 past that lifeline. The guards of later branches sit just below their divider, in the same column as the first guard.
- **Size and spacing:** the tag is 26 high with font 16. The frame's top edge is 66 above its first message and its bottom edge 38 below its last arrow (below the end of the bar for a self message). The next message after a frame is 58 below its bottom edge.
- **Dividers:** a dashed line across the frame between two `alt` branches, role `frame-divider`.
- **Nesting:** an inner frame sits `padding` inside its parent.
- **Where an `alt` starts:** after the reply that carries the outcome it branches on ("Redirect to callback", "authorization result"), so each call and its reply stay together and no bar starts without a call.

## Asynchronous messages

Use `message-async` when the sender does not wait for the answer: a webhook, an event, an e-mail. [`examples/card-payment/`](../examples/card-payment/) shows both cases.

- **Look:** a solid line with an open head, never dashed: dashed means a reply.
- **Sender:** it is busy only while it works, so its bar covers that work and nothing more; a sender that just emits the message has no bar, and its arrow starts on the lifeline. A sender that then waits for a reply keeps its bar until the reply arrives.
- **Receiver:** its bar starts at the arrow, as for any call, and ends at its reply, if it sends one. An async message with no reply gets a bar only when the receiver does work you draw; with no bar, the arrow ends on the lifeline.
- **Frame edges:** a bar may not cross the edge of a frame; end it at the last reply inside and start a new one outside.
- **Label:** the name of the event or payload (`payment_intent.succeeded`), not a verb. A confirmation such as `200 OK` is a separate `message-return` numbered after it.

## Loop frames

A `loop` repeats its body until a condition holds.

- **Columns:** the frame covers only the participants that exchange the repeated messages, not all columns. Its left edge sits 130 left of the first covered lifeline, and the guard starts 16 right of that lifeline when it would otherwise run under it (tag, `padding` and guard together are wider than 130).
- **Guard:** one guard, the exit condition (`[until 2xx]`), on the tag's row.
- **Body:** draw one pass: the message and the reply that decides whether it repeats. Do not draw the retries.
- **Position:** the frame starts after the messages that trigger the loop, with the same space above its first message as an `alt` frame.
- **Note:** say what the repetition implies for the reader in a note beside the frame, never inside it.

## Notes

A note explains a why the arrows cannot show ("state ties the callback to this request and blocks CSRF"). Use one or two per diagram.

- A sticky note: rectangle with role `note`, one text element per line with role `note`, font 15, at most three short lines, all rotated by −0.03 radians.
- Place it in the free gap nearest the step it explains, inside its zone with `padding`. It may cross a lifeline only where no message or label passes.
- When no gap is wide enough, move the later columns to the right to open one, and size the zones for it; or place the note in the right margin, outside every zone.

## Communication checklist

- [ ] The title says what the diagram explains and the line below names the source.
- [ ] Every message is numbered in reading order, replies included.
- [ ] Each note explains a why next to its step, and covers no arrow, label or guard.
- [ ] Zones, if used, group participants by where they run and keep `padding` from their content and from each other.
- [ ] Errors use the `error` role on the arrow and the label; the rest of the diagram uses no extra color.
- [ ] The system being explained uses `participant`; the services it calls use `participant-external`.

## Visual checklist

`validate.js` checks overlaps, padding and structure; this list covers what it cannot see.

- [ ] No clipped text: every label is fully inside its box, frame or zone, and fully readable at the rendered size.
- [ ] Arrows reach their targets: each starts and ends on the edge of a lifeline or bar, with its head visible.
- [ ] Dashed returns: every reply is dashed with an open head; every call is solid.
- [ ] Lifelines span all messages, including those inside frames.
- [ ] Activation bars start at the call and end at the reply of the call they handle; every reply has its call above it in the same branch.
- [ ] Each frame tag is in the corner, its guards are in one column, and its dividers are dashed.
- [ ] Labels are short verbs or payloads (`POST /token`, `401`, `access_token`).
