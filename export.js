// export.js — prepares canvas with annotations and sends to backend to get flattened PDF

document.querySelector('[data-action="export"]').addEventListener('click', async () => {
  const canvases = document.querySelectorAll(".pdf-canvas");
  const annotations = Array.from(document.querySelectorAll(".annotation"));

  // Create offscreen canvases with annotations merged
  const pages = [];

  for (let i = 0; i < canvases.length; i++) {
    const baseCanvas = canvases[i];
    const copy = document.createElement("canvas");
    copy.width = baseCanvas.width;
    copy.height = baseCanvas.height;
    const ctx = copy.getContext("2d");
    ctx.drawImage(baseCanvas, 0, 0);

    const baseRect = baseCanvas.getBoundingClientRect();

    annotations.forEach(a => {
      const aRect = a.getBoundingClientRect();
      const style = getComputedStyle(a);
      const left = aRect.left - baseRect.left;
      const top = aRect.top - baseRect.top;

      if (a.tagName === "DIV" && a.textContent.trim()) {
        ctx.font = style.fontStyle + " " + style.fontWeight + " " + style.fontSize + " " + style.fontFamily;
        ctx.fillStyle = style.color || "black";
        ctx.fillText(a.textContent.trim(), left, top + 16);
      } else if (a.tagName === "IMG") {
        const img = new Image();
        img.onload = () => ctx.drawImage(img, left, top, a.width, a.height);
        img.src = a.src;
      }
    });

    pages.push(copy.toDataURL("image/jpeg", 0.9)); // compress for small size
  }

  // Send to backend for PDF assembly
  const res = await fetch("https://pdf-om45.onrender.com/export", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ images: pages })
  });

  const blob = await res.blob();
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "TurboSign_Annotated.pdf";
  link.click();
});
