---
version: alpha
name: Excalidraw Diagram Base
colors:
  blue-100: "#dbeafe"
  blue-300: "#93c5fd"
  blue-400: "#60a5fa"
  blue-500: "#3b82f6"
  blue-800: "#1e40af"
  navy: "#1e3a5f"
  orange-100: "#fed7aa"
  orange-700: "#c2410c"
  green-100: "#a7f3d0"
  green-500: "#22c55e"
  green-700: "#047857"
  red-100: "#fee2e2"
  red-200: "#fecaca"
  red-600: "#dc2626"
  red-700: "#b91c1c"
  amber-50: "#fffbeb"
  amber-100: "#fef3c7"
  amber-700: "#b45309"
  violet-200: "#ddd6fe"
  violet-700: "#6d28d9"
  slate-500: "#64748b"
  slate-800: "#1e293b"
  gray-700: "#374151"
  slate-300: "#cbd5e1"
  yellow-100: "#fef9c3"
  yellow-600: "#ca8a04"
  teal-100: "#ccfbf1"
  teal-700: "#0f766e"
  white: "#ffffff"
components:
  primary:
    backgroundColor: "{colors.blue-500}"
    strokeColor: "{colors.navy}"
    textColor: "{colors.white}"
  secondary:
    backgroundColor: "{colors.blue-400}"
    strokeColor: "{colors.navy}"
    textColor: "{colors.gray-700}"
  tertiary:
    backgroundColor: "{colors.blue-300}"
    strokeColor: "{colors.navy}"
    textColor: "{colors.gray-700}"
  start:
    backgroundColor: "{colors.orange-100}"
    strokeColor: "{colors.orange-700}"
    textColor: "{colors.gray-700}"
  end:
    backgroundColor: "{colors.green-100}"
    strokeColor: "{colors.green-700}"
    textColor: "{colors.gray-700}"
  warning:
    backgroundColor: "{colors.red-100}"
    strokeColor: "{colors.red-600}"
    textColor: "{colors.gray-700}"
  decision:
    backgroundColor: "{colors.amber-100}"
    strokeColor: "{colors.amber-700}"
    textColor: "{colors.gray-700}"
  ai:
    backgroundColor: "{colors.violet-200}"
    strokeColor: "{colors.violet-700}"
    textColor: "{colors.gray-700}"
  inactive:
    backgroundColor: "{colors.blue-100}"
    strokeColor: "{colors.blue-800}"
    strokeStyle: dashed
    textColor: "{colors.gray-700}"
  error:
    backgroundColor: "{colors.red-200}"
    strokeColor: "{colors.red-700}"
    textColor: "{colors.red-700}"
  error-return:
    strokeColor: "{colors.red-700}"
    textColor: "{colors.red-700}"
    strokeStyle: dashed
    endArrowhead: arrow
  title:
    textColor: "{colors.blue-800}"
  subtitle:
    textColor: "{colors.blue-500}"
  body:
    textColor: "{colors.slate-500}"
  text-on-light:
    textColor: "{colors.gray-700}"
  text-on-dark:
    textColor: "{colors.white}"
  code:
    backgroundColor: "{colors.slate-800}"
    textColor: "{colors.green-500}"
  structure:
    strokeColor: "{colors.navy}"
  marker:
    backgroundColor: "{colors.blue-500}"
    strokeColor: "{colors.blue-500}"
  label-background:
    backgroundColor: "{colors.white}"
    strokeColor: "{colors.white}"
  participant:
    backgroundColor: "{colors.blue-500}"
    strokeColor: "{colors.navy}"
    textColor: "{colors.white}"
  actor:
    backgroundColor: "{colors.orange-100}"
    strokeColor: "{colors.orange-700}"
    textColor: "{colors.gray-700}"
  message-sync:
    strokeColor: "{colors.navy}"
    endArrowhead: triangle
  message-async:
    strokeColor: "{colors.navy}"
    endArrowhead: arrow
  message-return:
    strokeColor: "{colors.slate-500}"
    strokeStyle: dashed
    endArrowhead: arrow
  lifeline:
    strokeColor: "{colors.slate-500}"
    strokeStyle: dashed
  activation:
    backgroundColor: "{colors.blue-300}"
    strokeColor: "{colors.navy}"
  frame:
    backgroundColor: "{colors.amber-50}"
    strokeColor: "{colors.amber-700}"
    textColor: "{colors.amber-700}"
  label-background-in-frame:
    backgroundColor: "{colors.amber-50}"
    strokeColor: "{colors.amber-50}"
  frame-tag:
    backgroundColor: "{colors.amber-700}"
    strokeColor: "{colors.amber-700}"
    textColor: "{colors.white}"
  frame-divider:
    strokeColor: "{colors.amber-700}"
    strokeStyle: dashed
  participant-external:
    backgroundColor: "{colors.blue-100}"
    strokeColor: "{colors.blue-800}"
    textColor: "{colors.gray-700}"
  zone:
    backgroundColor: "transparent"
    strokeColor: "{colors.slate-300}"
    strokeStyle: dashed
    textColor: "{colors.slate-500}"
  note:
    backgroundColor: "{colors.yellow-100}"
    strokeColor: "{colors.yellow-600}"
    textColor: "{colors.gray-700}"
  step:
    backgroundColor: "{colors.navy}"
    strokeColor: "{colors.navy}"
    textColor: "{colors.white}"
  store:
    backgroundColor: "{colors.teal-100}"
    strokeColor: "{colors.teal-700}"
    textColor: "{colors.gray-700}"
  table-row:
    backgroundColor: "{colors.white}"
    strokeColor: "{colors.navy}"
    textColor: "{colors.gray-700}"
  key-badge:
    backgroundColor: "{colors.amber-700}"
    strokeColor: "{colors.amber-700}"
    textColor: "{colors.white}"
  relationship:
    strokeColor: "{colors.navy}"
    textColor: "{colors.gray-700}"
---

# Excalidraw Diagram Base

This is the base design system for the skill. It styles every diagram unless a project DESIGN.md or an explicit `--design` path overrides it. Each element is styled by its role, so a diagram keeps its meaning when its look changes.

## Colors

Colors are defined once under `colors` and referenced from roles with `{colors.<name>}`. Colors encode meaning: pair a dark stroke with a lighter fill.

## Roles

- Shape roles: `primary`, `secondary`, `tertiary` (neutral emphasis), `start` (trigger), `end` (success), `warning` (reset), `decision`, `ai`, `inactive` (dashed stroke), `error`, `error-return` (a reply that carries an error: red and dashed).
- Text roles: `title`, `subtitle`, `body`, `text-on-light`, `text-on-dark`.
- Evidence roles: `code` (code and data examples), `structure` (structural lines), `marker` (marker dots).
- Backing roles: `label-background` (the opaque box behind a free label, so lines do not cross its text) and `label-background-in-frame` (the same box inside a tinted frame).
- Sequence roles: `participant` (the system being explained), `participant-external` (services and tools it calls), `actor`, `message-sync`, `message-async`, `message-return`, `lifeline`, `activation`, `frame` (tinted area of an `alt`, `opt` or `loop` block, with its conditions), `frame-tag` (the operator box in the frame's corner), `frame-divider` (the dashed line between the operands of an `alt`).
- Reading aids: `zone` (background area that groups participants, such as "Local machine"), `note` (a sticky note with a short why, next to the step it explains), `step` (numbered badge on a message).
- Architecture roles: `store` (something that holds state: a database, a cache or a queue). Services use `primary`, `secondary` or `tertiary`, outside systems `participant-external` and `actor`, layers `zone`, and connections `message-sync` and `message-async`.

- Data model roles: `table-row` (a field row under a table's `primary` header), `key-badge` (the `PK` or `FK` tag of a field), `relationship` (the line between two tables).

Arrows use the stroke color of their source concept.

## Diagrams

Diagram-only tokens that are not tied to a role.

`roughness` takes the values Excalidraw offers: 0 (architect), 1 (artist) or 2 (cartoonist). `cornerRadius` is the radius in pixels of rounded shapes; sharp shapes stay sharp. `padding` is the minimum space in pixels between the edge of a zone or frame and the content inside it. `fontFamily` 5 is Excalifont.

```yaml
roughness: 0
cornerRadius: 8
padding: 24
fontFamily: 5
strokeWidth: 2
strokeStyle: solid
fillStyle: solid
endArrowhead: arrow
viewBackgroundColor: "{colors.white}"
```
