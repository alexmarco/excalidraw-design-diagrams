import { exportScene } from "@excalidraw/utils";

// Margin around the diagram in CSS pixels, matching the previous Playwright renderer.
const EXPORT_PADDING = 80;

function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(",")[1]);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

/**
 * Runs inside the browser page. Returns the SVG markup and the PNG bytes (base64).
 * The PNG is scaled down when the diagram is wider than maxWidth CSS pixels.
 */
export async function renderDiagram({ elements, appState, files }, { scale, maxWidth }) {
  const diagram = { elements, appState: appState ?? {}, files: files ?? {} };
  await document.fonts.ready;

  const svgElement = await exportScene({
    type: "svg",
    data: diagram,
    config: { padding: EXPORT_PADDING },
  });
  const diagramWidth = Number(svgElement.getAttribute("width"));
  const pngScale = scale * Math.min(1, maxWidth / diagramWidth);

  const pngBlob = await exportScene({
    type: "png",
    data: diagram,
    config: { padding: EXPORT_PADDING, scale: pngScale },
  });

  return { svg: svgElement.outerHTML, pngBase64: await blobToBase64(pngBlob) };
}
