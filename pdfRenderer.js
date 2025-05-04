// pdfRenderer.js — vertical scrolling PDF renderer for TurboSign

const container = document.getElementById("viewer-container");
const dataUrl = sessionStorage.getItem("uploadData");
const fileName = sessionStorage.getItem("uploadName") || '';

if (dataUrl) {
  if (fileName.endsWith('.pdf')) {
    renderPDF(dataUrl);
  } else {
    renderImage(dataUrl);
  }
}

// Render image on a single canvas
function renderImage(dataUrl) {
  const img = new Image();
  img.onload = () => {
    const canvas = document.createElement("canvas");
    canvas.className = "pdf-canvas";
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);
    container.innerHTML = '';
    container.appendChild(canvas);
  };
  img.src = dataUrl;
}

// Render all pages of the PDF vertically
async function renderPDF(base64Data) {
  const loadingTask = pdfjsLib.getDocument({ data: atob(base64Data.split(',')[1]) });
  const pdfDoc = await loadingTask.promise;
  container.innerHTML = '';

  for (let pageNum = 1; pageNum <= pdfDoc.numPages; pageNum++) {
    const page = await pdfDoc.getPage(pageNum);
    const viewport = page.getViewport({ scale: 1.5 });

    const canvas = document.createElement("canvas");
    canvas.className = "pdf-canvas";
    canvas.width = viewport.width;
    canvas.height = viewport.height;

    const ctx = canvas.getContext("2d");
    await page.render({ canvasContext: ctx, viewport }).promise;

    container.appendChild(canvas);
  }
}
