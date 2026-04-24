export function attachDragSystem({ root, onDrop, onHover }) {
  const draggables = root.querySelectorAll("[data-draggable-id]");
  const cleanups = [];

  draggables.forEach((node) => {
    const itemId = node.dataset.draggableId;
    const startRect = () => node.getBoundingClientRect();
    let pointerId = null;
    let originRect = null;
    let offsetX = 0;
    let offsetY = 0;

    const onPointerMove = (event) => {
      if (pointerId !== event.pointerId || !originRect) {
        return;
      }

      const left = event.clientX - offsetX;
      const top = event.clientY - offsetY;
      node.style.position = "fixed";
      node.style.left = `${left}px`;
      node.style.top = `${top}px`;
      node.style.margin = "0";
      node.style.zIndex = "60";
      node.classList.add("is-dragging");

      const hoveredZone = document.elementFromPoint(event.clientX, event.clientY)?.closest("[data-dropzone-id]");
      onHover(hoveredZone?.dataset.dropzoneId ?? null);
    };

    const resetPosition = () => {
      node.style.position = "";
      node.style.left = "";
      node.style.top = "";
      node.style.margin = "";
      node.style.zIndex = "";
      node.classList.remove("is-dragging");
      onHover(null);
    };

    const onPointerUp = (event) => {
      if (pointerId !== event.pointerId) {
        return;
      }

      const hoveredZone = document.elementFromPoint(event.clientX, event.clientY)?.closest("[data-dropzone-id]");
      const zoneId = hoveredZone?.dataset.dropzoneId ?? null;
      const success = zoneId ? onDrop({ itemId, zoneId }) : false;

      if (!success) {
        resetPosition();
      }

      node.releasePointerCapture(pointerId);
      pointerId = null;
      originRect = null;
    };

    const onPointerDown = (event) => {
      if (event.button !== 0 && event.pointerType === "mouse") {
        return;
      }
      event.preventDefault();
      pointerId = event.pointerId;
      originRect = startRect();
      offsetX = event.clientX - originRect.left;
      offsetY = event.clientY - originRect.top;
      node.setPointerCapture(pointerId);
    };

    node.addEventListener("pointerdown", onPointerDown);
    node.addEventListener("pointermove", onPointerMove);
    node.addEventListener("pointerup", onPointerUp);
    node.addEventListener("pointercancel", resetPosition);

    cleanups.push(() => {
      node.removeEventListener("pointerdown", onPointerDown);
      node.removeEventListener("pointermove", onPointerMove);
      node.removeEventListener("pointerup", onPointerUp);
      node.removeEventListener("pointercancel", resetPosition);
    });
  });

  return () => cleanups.forEach((cleanup) => cleanup());
}
