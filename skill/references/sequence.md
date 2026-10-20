# Sequence Diagrams

Use this guide for diagrams that show messages exchanged between participants over time, such as API calls, login flows or retries. The generator reads a YAML spec and writes a first-draft `.excalidraw` file with participants, lifelines, messages, activations and frames already placed.

## Workflow

In the commands below, `<skill>` is the skill directory (`skill/` in this repository). Run them from the project root, because the generator and `restyle.js` look for the project's `DESIGN.md` in the working directory.

1. Write the spec, for example `diagrams/login.yaml`.
2. Generate the draft. The `.excalidraw` file is written beside the spec and is not regenerated afterwards, because the file is the source of truth. Pass `--output <file>` to choose another path:

   ```bash
   node <skill>/scripts/generate_sequence.js diagrams/login.yaml
   ```

3. Render the file and review the PNG against the checklist below:

   ```bash
   node <skill>/references/render_excalidraw.js diagrams/login.excalidraw
   ```

4. Edit the `.excalidraw` file by hand if needed. Do not regenerate it from the spec, or the edits are lost.
5. After changing `DESIGN.md` or applying the role styles again, run `restyle.js` and render again:

   ```bash
   node <skill>/scripts/restyle.js diagrams/login.excalidraw
   ```

Pass `--design <DESIGN.md>` to the generator or to `restyle.js` to use a design file other than the project's.

## Spec format

The spec is YAML with two lists: `participants` and `sequence`.

```yaml
participants:
  - id: user
    label: User
    kind: actor
  - id: api
    label: API
  - id: db
    label: Database
sequence:
  - from: user
    to: api
    text: POST /login
  - activate: api
  - from: api
    to: db
    text: Find user
    type: return
  - deactivate: api
```

### Participants

- `id` (required): unique name that the steps refer to.
- `label`: text in the header. Defaults to `id`. Keep it short; numbers are read as text.
- `kind`: `participant` (default, a rectangle) or `actor` (a person or external caller, drawn in the actor colors).

### Steps

Each entry in `sequence` is one step. Message steps are numbered in order; the diagram reads top to bottom.

| Step | Keys | Meaning |
| --- | --- | --- |
| Message | `from`, `to`, `text`, `type` | An arrow from one participant to another |
| Self message | `self`, `text`, `type` | A call a participant makes to itself |
| Activation | `activate` | Starts an activation bar on a participant's lifeline |
| Deactivation | `deactivate` | Ends the most recent activation bar of a participant |
| Frame | `frame`, `text` | Opens an `alt`, `opt` or `loop` box around the following messages |
| Else | `else`, `text` | Starts the second section of an `alt` frame |
| End | `end` | Closes the innermost frame, which must be of the same kind |

- `type` on messages and self messages: `sync` (default, solid line with a filled head), `async` (solid line with an open head) or `return` (dashed line with an open head). Use `return` for every reply.
- `text` is optional on messages and frames. Frames show it in brackets, for example `alt [valid credentials]`.
- Frames can be nested. A frame must contain at least one message.
- An activation must be closed by a matching `deactivate`, and every frame must be closed by an `end`.

The parser rejects a spec with an unknown participant, an unknown message type, an unmatched frame or activation, or an `else` outside an `alt` frame. The error names the step, so fix the spec and generate again.

## Visual checklist

Review the rendered PNG against every item. Fix the spec (or the `.excalidraw` file) and render again until all items pass.

- [ ] No clipped text: every label is fully inside its header, frame or diagram, and no label overlaps another label, a header or a message arrow.
- [ ] Arrows reach their targets: every message starts on the source lifeline and ends on the target lifeline, with its arrowhead visible.
- [ ] Dashed returns: every `return` message is dashed, and every call is solid.
- [ ] Lifelines span all messages: each lifeline runs from its header down past the last message, including messages inside frames.
- [ ] Frames enclose their messages and their labels, and each `else` divider sits between the sections it separates.
- [ ] Activation bars cover the messages they handle and end at the reply.
- [ ] Reading order: participants run left to right in the order they first interact, and messages run top to bottom in the order of the spec.
- [ ] Labels are short verbs or payloads (`POST /login`, `401`, `Token`), so they fit between two lifelines.
