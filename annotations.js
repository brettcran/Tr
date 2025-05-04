// annotations.js — manages creation, movement, resizing, and deletion of annotations

let activeTool = null;
let deleteMode = false;

document.querySelectorAll('#toolbar button').forEach(btn => {
  btn.addEventListener('click', () => {
    const action = btn.dataset.action;
    if (action === 'delete') {
      deleteMode = !deleteMode;
      btn.classList.toggle('active', deleteMode);
      return;
    }
    activeTool = action;
  });
});

document.getElementById('viewer-container').addEventListener('click', (e) => {
  if (!activeTool || e.target.tagName === 'CANVAS') return;

  const canvas = e.target.closest('.pdf-canvas');
  if (!canvas) return;

  const container = document.getElementById('viewer-container');
  const rect = canvas.getBoundingClientRect();
  const offsetX = e.clientX - rect.left;
  const offsetY = e.clientY - rect.top;

  const annotation = document.createElement('div');
  annotation.className = 'annotation';
  annotation.contentEditable = (activeTool === 'text');
  annotation.style.left = offsetX + 'px';
  annotation.style.top = offsetY + 'px';

  switch (activeTool) {
    case 'text':
      annotation.textContent = 'Text';
      break;
    case 'check':
      annotation.textContent = '✔';
      break;
    case 'circle':
      annotation.textContent = '⭕';
      break;
    case 'sign':
      annotation.textContent = '[Signature]';
      break;
  }

  makeDraggable(annotation);
  container.appendChild(annotation);
});

// Enable dragging and resizing for annotation elements
function makeDraggable(el) {
  el.setAttribute('draggable', true);
  el.style.position = 'absolute';
  el.style.minWidth = '24px';
  el.style.minHeight = '24px';

  el.addEventListener('dragstart', (e) => {
    e.dataTransfer.setData('text/plain', null);
    e.dataTransfer.effectAllowed = 'move';
    el.dataset.dragOffsetX = e.offsetX;
    el.dataset.dragOffsetY = e.offsetY;
  });

  document.getElementById('viewer-container').addEventListener('dragover', (e) => {
    e.preventDefault();
  });

  document.getElementById('viewer-container').addEventListener('drop', (e) => {
    const offsetX = parseInt(el.dataset.dragOffsetX, 10);
    const offsetY = parseInt(el.dataset.dragOffsetY, 10);
    el.style.left = (e.clientX - offsetX) + 'px';
    el.style.top = (e.clientY - offsetY) + 'px';
  });

  el.addEventListener('click', (e) => {
    if (deleteMode) {
      e.stopPropagation();
      el.remove();
    }
  });

  el.style.resize = 'both';
  el.style.overflow = 'auto';
}

let selectedAnnotation = null;

document.getElementById("viewer-container").addEventListener("click", (e) => {
  if (e.target.classList.contains("annotation") && e.target.isContentEditable) {
    selectedAnnotation = e.target;
  } else if (!e.target.closest("#formatting-controls")) {
    selectedAnnotation = null;
  }
});

document.getElementById("font-select").addEventListener("change", (e) => {
  if (selectedAnnotation) selectedAnnotation.style.fontFamily = e.target.value;
});
document.getElementById("font-size").addEventListener("change", (e) => {
  if (selectedAnnotation) selectedAnnotation.style.fontSize = e.target.value;
});
document.getElementById("bold-btn").addEventListener("click", () => {
  if (selectedAnnotation) {
    selectedAnnotation.style.fontWeight = (selectedAnnotation.style.fontWeight === "bold") ? "normal" : "bold";
  }
});
document.getElementById("italic-btn").addEventListener("click", () => {
  if (selectedAnnotation) {
    selectedAnnotation.style.fontStyle = (selectedAnnotation.style.fontStyle === "italic") ? "normal" : "italic";
  }
});
