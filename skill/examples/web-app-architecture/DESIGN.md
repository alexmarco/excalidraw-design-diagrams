---
version: alpha
name: Blueprint
colors:
  blueprint-sheet: "#0b2a4a"
  blueprint-panel: "#134074"
  blueprint-panel-light: "#2b6cb0"
  blueprint-line: "#e8f1fb"
  blueprint-guide: "#7ea6d3"
  blueprint-muted: "#a9c7ea"
  blueprint-cyan: "#67e8f9"
  blueprint-amber: "#fcd34d"
  blueprint-white: "#ffffff"
components:
  primary:
    backgroundColor: "{colors.blueprint-panel}"
    strokeColor: "{colors.blueprint-line}"
    textColor: "{colors.blueprint-white}"
  secondary:
    backgroundColor: "{colors.blueprint-panel-light}"
    strokeColor: "{colors.blueprint-line}"
    textColor: "{colors.blueprint-white}"
  store:
    backgroundColor: "{colors.blueprint-sheet}"
    strokeColor: "{colors.blueprint-cyan}"
    textColor: "{colors.blueprint-cyan}"
  actor:
    backgroundColor: "{colors.blueprint-sheet}"
    strokeColor: "{colors.blueprint-amber}"
    textColor: "{colors.blueprint-amber}"
  zone:
    backgroundColor: "transparent"
    strokeColor: "{colors.blueprint-guide}"
    strokeStyle: dashed
    textColor: "{colors.blueprint-line}"
  message-sync:
    strokeColor: "{colors.blueprint-line}"
    endArrowhead: triangle
  message-async:
    strokeColor: "{colors.blueprint-line}"
    endArrowhead: arrow
  note:
    backgroundColor: "{colors.blueprint-line}"
    strokeColor: "{colors.blueprint-line}"
    textColor: "{colors.blueprint-sheet}"
  title:
    textColor: "{colors.blueprint-white}"
  subtitle:
    textColor: "{colors.blueprint-muted}"
  body:
    textColor: "{colors.blueprint-muted}"
  text-on-light:
    textColor: "{colors.blueprint-line}"
  text-on-dark:
    textColor: "{colors.blueprint-white}"
---

# Blueprint

A complete override of the base design: a dark blue canvas, light lines, a monospaced font, sharp corners and no roughness, like a technical drawing. It restyles every element of the diagram through its role, so the diagram file does not change.

## Roles

Only the roles an architecture diagram uses are redefined; the rest come from the base design.

- Services are `primary` (white lines on blue panels) and `secondary` (a lighter panel for the entry points).
- Stores are `store` (cyan outline on the canvas color), so state stands apart from code.
- Outside callers are `actor` (amber), and the layers are dashed `zone` boxes.
- Connections use light lines: `message-sync` has a filled head, `message-async` an open head.

## Diagrams

`fontFamily` 3 is Cascadia, a monospaced font. `cornerRadius` 0 and `roughness` 0 give square, precise shapes.

```yaml
roughness: 0
cornerRadius: 0
padding: 24
fontFamily: 3
strokeWidth: 2
strokeStyle: solid
fillStyle: solid
endArrowhead: arrow
viewBackgroundColor: "{colors.blueprint-sheet}"
```
