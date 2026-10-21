# Element Templates

Use these compact templates as starting points. Set `customData.role` on every element; `restyle.js` then sets its colors, stroke, roughness, font and corner radius from that role's tokens in `DESIGN.md`, so the style values below are placeholders. Excalidraw files need the enclosing document structure shown in `json-schema.md`.

## Free-floating text

```json
{
  "type": "text",
  "id": "section-title",
  "customData": { "role": "title" },
  "x": 100,
  "y": 100,
  "width": 200,
  "height": 25,
  "text": "Section title",
  "originalText": "Section title",
  "fontSize": 20,
  "fontFamily": 5,
  "textAlign": "left",
  "verticalAlign": "top",
  "strokeColor": "#1e40af",
  "backgroundColor": "transparent",
  "roughness": 0,
  "opacity": 100,
  "seed": 11111,
  "version": 1,
  "versionNonce": 22222,
  "isDeleted": false
}
```

## Shape

```json
{
  "type": "rectangle",
  "id": "process",
  "customData": { "role": "primary" },
  "x": 100,
  "y": 100,
  "width": 180,
  "height": 90,
  "strokeColor": "#1e3a5f",
  "backgroundColor": "#2563eb",
  "fillStyle": "solid",
  "strokeWidth": 2,
  "strokeStyle": "solid",
  "roughness": 0,
  "opacity": 100,
  "angle": 0,
  "seed": 12345,
  "version": 1,
  "versionNonce": 67890,
  "isDeleted": false,
  "groupIds": [],
  "boundElements": [],
  "link": null,
  "locked": false,
  "roundness": {
    "type": 3,
    "value": 8
  }
}
```

## Structural line

```json
{
  "type": "line",
  "id": "timeline",
  "customData": { "role": "structure" },
  "x": 100,
  "y": 100,
  "width": 0,
  "height": 200,
  "strokeColor": "#1e3a5f",
  "backgroundColor": "transparent",
  "strokeWidth": 2,
  "roughness": 0,
  "opacity": 100,
  "seed": 44444,
  "version": 1,
  "versionNonce": 55555,
  "isDeleted": false,
  "points": [
    [0, 0],
    [0, 200]
  ]
}
```

## Arrow

```json
{
  "type": "arrow",
  "id": "flow",
  "customData": { "role": "message-sync" },
  "x": 280,
  "y": 145,
  "width": 120,
  "height": 0,
  "strokeColor": "#1e3a5f",
  "backgroundColor": "transparent",
  "strokeWidth": 2,
  "roughness": 0,
  "opacity": 100,
  "seed": 33333,
  "version": 1,
  "versionNonce": 44444,
  "isDeleted": false,
  "points": [
    [0, 0],
    [120, 0]
  ],
  "startBinding": {
    "elementId": "source",
    "focus": 0,
    "gap": 2
  },
  "endBinding": {
    "elementId": "target",
    "focus": 0,
    "gap": 2
  },
  "startArrowhead": null,
  "endArrowhead": "arrow"
}
```
