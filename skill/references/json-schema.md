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

An element has a unique string `id`, a `type`, position (`x`, `y`), size (`width`, `height`), style properties, a `seed`, and in this skill a role in `customData.role`. Preserve per-element IDs and binding references when editing a diagram. Array order is drawing order: later elements are drawn on top.

## Common element types

- `rectangle`: process, action, or component
- `ellipse`: entry, exit, or external system
- `diamond`: decision or condition
- `arrow`: directed relationship
- `line`: structural or non-directed connection
- `text`: label or annotation
- `frame`: Excalidraw's own grouping frame. The `alt` and `opt` frames of a sequence diagram are rectangles with the `frame` role instead.

## Text

Text elements use `text` and `originalText`, `fontSize`, `fontFamily`, `textAlign`, `verticalAlign`, and optionally `containerId`. Keep `text` limited to visible words. `fontFamily` takes 1, 2, 3 or 5 to 10; 5 (Excalifont) is the skill's default and `restyle.js` sets it from `DESIGN.md`.

## Lines and bindings

Line and arrow `points` are `[x, y]` coordinates relative to the element's `x` and `y`. An arrow can bind to shapes with `startBinding` and `endBinding`:

```json
{
  "elementId": "shape-id",
  "focus": 0,
  "gap": 2
}
```

Use `startArrowhead` and `endArrowhead` to select the arrow direction and style. A rounded rectangle specifies `"roundness": { "type": 3, "value": 8 }`, where `value` is the corner radius; `null` keeps the corners sharp. `roughness` takes 0, 1 or 2.
