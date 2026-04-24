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

    const moveNode = (event) => {
      const left = event.clientX - offsetX;
      const top = event.clientY - offsetY;
      node.style.position = "fixed";
      node.style.left = `${left}px`;
      node.style.top = `${top}px`;
      node.style.width = `${originRect.width}px`;
      node.style.height = `${originRect.height}px`;
      node.style.margin = "0";
      node.style.zIndex = "60";
      node.classList.add("is-dragging");
    };

    const getDropZoneAtPoint = (event) => {
      node.style.pointerEvents = "none";
      const hoveredZone = document.elementFromPoint(event.clientX, event.clientY)?.closest("[data-dropzone-id]");
      node.style.pointerEvents = "";
      return hoveredZone;
    };

    const onPointerMove = (event) => {
      if (pointerId !== event.pointerId || !originRect) {
        return;
      }

      event.preventDefault();
      moveNode(event);

      const hoveredZone = getDropZoneAtPoint(event);
      onHover(hoveredZone?.dataset.dropzoneId ?? null);
    };

    const resetPosition = () => {
      node.style.position = "";
      node.style.left = "";
      node.style.top = "";
      node.style.width = "";
      node.style.height = "";
      node.style.margin = "";
      node.style.zIndex = "";
      node.style.pointerEvents = "";
      node.classList.remove("is-dragging");
      onHover(null);
    };

    const onPointerUp = (event) => {
      if (pointerId !== event.pointerId) {
        return;
      }

      event.preventDefault();
      const hoveredZone = getDropZoneAtPoint(event);
      const zoneId = hoveredZone?.dataset.dropzoneId ?? null;
      const success = zoneId ? onDrop({ itemId, zoneId }) : false;

      if (!success) {
        resetPosition();
      }

      document.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("pointerup", onPointerUp);
      document.removeEventListener("pointercancel", onPointerCancel);
      pointerId = null;
      originRect = null;
    };

    const onPointerCancel = (event) => {
      if (pointerId !== event.pointerId) {
        return;
      }
      resetPosition();
      document.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("pointerup", onPointerUp);
      document.removeEventListener("pointercancel", onPointerCancel);
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
      moveNode(event);
      document.addEventListener("pointermove", onPointerMove, { passive: false });
      document.addEventListener("pointerup", onPointerUp, { passive: false });
      document.addEventListener("pointercancel", onPointerCancel, { passive: false });
    };

    node.addEventListener("pointerdown", onPointerDown);

    cleanups.push(() => {
      node.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("pointerup", onPointerUp);
      document.removeEventListener("pointercancel", onPointerCancel);
    });
  });

  return () => cleanups.forEach((cleanup) => cleanup());
}
