---
version: alpha
name: Whiteboard
colors:
  ink: "#343a40"
  ink-soft: "#4a3f35"
  paper: "#fffdf5"
  peach: "#ffd8a8"
  peach-line: "#e67700"
  butter: "#ffec99"
  butter-line: "#b08900"
  mint: "#b2f2bb"
  mint-line: "#2b8a3e"
  sky: "#a5d8ff"
  sky-line: "#1971c2"
  lavender: "#d0bfff"
  lavender-line: "#6741d9"
  rose: "#ffc9c9"
  rose-line: "#c92a2a"
  sand: "#ffe8cc"
  stone: "#e9ecef"
  white: "#ffffff"
components:
  primary:
    backgroundColor: "{colors.sky}"
    strokeColor: "{colors.sky-line}"
    textColor: "{colors.ink}"
  secondary:
    backgroundColor: "{colors.butter}"
    strokeColor: "{colors.butter-line}"
    textColor: "{colors.ink}"
  tertiary:
    backgroundColor: "{colors.stone}"
    strokeColor: "{colors.ink}"
    textColor: "{colors.ink}"
  start:
    backgroundColor: "{colors.peach}"
    strokeColor: "{colors.peach-line}"
    textColor: "{colors.ink}"
  end:
    backgroundColor: "{colors.mint}"
    strokeColor: "{colors.mint-line}"
    textColor: "{colors.ink}"
  warning:
    backgroundColor: "{colors.rose}"
    strokeColor: "{colors.rose-line}"
    textColor: "{colors.ink}"
  decision:
    backgroundColor: "{colors.butter}"
    strokeColor: "{colors.butter-line}"
    textColor: "{colors.ink}"
  ai:
    backgroundColor: "{colors.lavender}"
    strokeColor: "{colors.lavender-line}"
    textColor: "{colors.ink}"
  inactive:
    backgroundColor: "{colors.paper}"
    strokeColor: "{colors.ink-soft}"
    strokeStyle: dashed
    textColor: "{colors.ink}"
  error:
    backgroundColor: "{colors.rose}"
    strokeColor: "{colors.rose-line}"
    textColor: "{colors.rose-line}"
  error-return:
    strokeColor: "{colors.rose-line}"
    textColor: "{colors.rose-line}"
    strokeStyle: dashed
    endArrowhead: arrow
  title:
    textColor: "{colors.ink}"
  subtitle:
    textColor: "{colors.ink}"
  body:
    textColor: "{colors.ink-soft}"
  text-on-light:
    textColor: "{colors.ink}"
  text-on-dark:
    textColor: "{colors.white}"
  code:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.mint}"
  structure:
    strokeColor: "{colors.ink}"
  marker:
    backgroundColor: "{colors.ink}"
    strokeColor: "{colors.ink}"
  label-background:
    backgroundColor: "{colors.paper}"
    strokeColor: "{colors.paper}"
  participant:
    backgroundColor: "{colors.sky}"
    strokeColor: "{colors.sky-line}"
    textColor: "{colors.ink}"
  actor:
    backgroundColor: "{colors.peach}"
    strokeColor: "{colors.peach-line}"
    textColor: "{colors.ink}"
  message-sync:
    strokeColor: "{colors.ink}"
    endArrowhead: triangle
  message-async:
    strokeColor: "{colors.ink}"
    endArrowhead: arrow
  message-return:
    strokeColor: "{colors.ink-soft}"
    strokeStyle: dashed
    endArrowhead: arrow
  lifeline:
    strokeColor: "{colors.ink-soft}"
    strokeStyle: dashed
  activation:
    backgroundColor: "{colors.sky}"
    strokeColor: "{colors.sky-line}"
  frame:
    backgroundColor: "{colors.sand}"
    strokeColor: "{colors.peach-line}"
    textColor: "{colors.peach-line}"
  label-background-in-frame:
    backgroundColor: "{colors.sand}"
    strokeColor: "{colors.sand}"
  frame-tag:
    backgroundColor: "{colors.peach-line}"
    strokeColor: "{colors.peach-line}"
    textColor: "{colors.white}"
  frame-divider:
    strokeColor: "{colors.peach-line}"
    strokeStyle: dashed
  participant-external:
    backgroundColor: "{colors.sand}"
    strokeColor: "{colors.peach-line}"
    textColor: "{colors.ink}"
  zone:
    backgroundColor: "transparent"
    strokeColor: "{colors.ink-soft}"
    strokeStyle: dashed
    textColor: "{colors.ink-soft}"
  note:
    backgroundColor: "{colors.white}"
    strokeColor: "{colors.ink-soft}"
    textColor: "{colors.ink}"
  step:
    backgroundColor: "{colors.ink}"
    strokeColor: "{colors.ink}"
    textColor: "{colors.white}"
---

# Whiteboard

A complete override of the base design: a hand-drawn whiteboard look with warm pastel fills, dark ink text and very round corners. It redefines the roles of the concept diagrams; the other roles come from the base design. Shape fills carry the meaning: lavender for steps a model runs (`ai`), blue for the store, yellow for plain processing, peach for the trigger and green for the result.

## Diagrams

`roughness` 2 (cartoonist) wobbles every line, so the diagram needs generous shape sizes and short labels to stay readable. `fontFamily` 1 is Virgil, the handwritten font Excalidraw used before Excalifont.

```yaml
roughness: 2
cornerRadius: 28
padding: 24
fontFamily: 1
strokeWidth: 2
strokeStyle: solid
fillStyle: solid
endArrowhead: arrow
viewBackgroundColor: "{colors.paper}"
```
