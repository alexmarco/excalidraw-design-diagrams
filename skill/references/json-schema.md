# Excalidraw JSON Structure

## Document

```json
{
  "type": "excalidraw",
  "version": 2,
  "source": "https://excalidraw.com",
  "elements": [],
  "appState": {
    "viewBackgroundColor": "#ffffff",
    "gridSize": 20
  },
  "files": {}
}
```

An element has a unique string `id`, a `type`, position (`x`, `y`), size (`width`, `height`), style properties, and a `seed`. Preserve per-element IDs and binding references when editing a diagram.

## Common element types

- `rectangle`: process, action, or component
- `ellipse`: entry, exit, or external system
- `diamond`: decision or condition
- `arrow`: directed relationship
- `line`: structural or non-directed connection
- `text`: label or annotation
- `frame`: grouping

## Text

Text elements use `text` and `originalText`, `fontSize`, `fontFamily`, `textAlign`, `verticalAlign`, and optionally `containerId`. Keep `text` limited to visible words; `fontFamily: 3` is the skill's default.

## Lines and bindings

Line and arrow `points` are `[x, y]` coordinates relative to the element's `x` and `y`. An arrow can bind to shapes with `startBinding` and `endBinding`:

```json
{
  "elementId": "shape-id",
  "focus": 0,
  "gap": 2
}
```

Use `startArrowhead` and `endArrowhead` to select the arrow direction and style. A rounded rectangle may specify `"roundness": { "type": 3 }`.
