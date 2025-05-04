// signatures.js — capture and store user-drawn signatures, allow reuse

const modal = document.getElementById("signature-modal");
const pad = document.getElementById("signature-pad");
const clearBtn = document.getElementById("sign-clear");
const saveBtn = document.getElementById("sign-save");
const ctx = pad.getContext("2d");
let drawing = false;
let signatures = JSON.parse(localStorage.getItem("savedSignatures") || "[]");

// Open modal when user clicks "sign"
document.querySelector('[data-action="sign"]').addEventListener("click", () => {
  modal.classList.remove("hidden");
  ctx.clearRect(0, 0, pad.width, pad.height);
});

// Draw signature on canvas
pad.addEventListener("mousedown", () => { drawing = true; });
pad.addEventListener("mouseup", () => { drawing = false; ctx.beginPath(); });
pad.addEventListener("mouseout", () => { drawing = false; ctx.beginPath(); });
pad.addEventListener("mousemove", draw);

function draw(e) {
  if (!drawing) return;
  const rect = pad.getBoundingClientRect();
  ctx.lineWidth = 2;
  ctx.lineCap = "round";
  ctx.strokeStyle = "black";
  ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
}

// Clear button
clearBtn.addEventListener("click", () => {
  ctx.clearRect(0, 0, pad.width, pad.height);
});

// Save signature
saveBtn.addEventListener("click", () => {
  const data = pad.toDataURL("image/png");
  if (signatures.length >= 3) signatures.shift(); // keep only 3
  signatures.push(data);
  localStorage.setItem("savedSignatures", JSON.stringify(signatures));
  modal.classList.add("hidden");
});

// Reuse saved signatures
window.addEventListener("load", () => {
  const toolbar = document.getElementById("toolbar");
  signatures.forEach((sigData, i) => {
    const btn = document.createElement("button");
    btn.textContent = "Sig " + (i + 1);
    btn.addEventListener("click", () => {
      const img = document.createElement("img");
      img.src = sigData;
      img.style.width = "150px";
      img.className = "annotation";
      makeDraggable(img);
      document.getElementById("viewer-container").appendChild(img);
    });
    toolbar.appendChild(btn);
  });
});
