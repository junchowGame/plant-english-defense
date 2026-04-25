export function attachDragSystem({ root, onDrop, onHover }) {
  const draggables = root.querySelectorAll("[data-draggable-id]");
  const cleanups = [];

  draggables.forEach((node) => {
    const itemId = node.dataset.draggableId;
    let activeId = null;
    let activeMode = null;
    let originRect = null;
    let activeDropZone = null;
    let offsetX = 0;
    let offsetY = 0;

    const getPoint = (event) => {
      const touch =
        activeId === null
          ? event.changedTouches?.[0] ?? event.touches?.[0]
          : [...(event.changedTouches ?? []), ...(event.touches ?? [])].find((item) => item.identifier === activeId);

      if (touch) {
        return {
          id: touch.identifier,
          clientX: touch.clientX,
          clientY: touch.clientY,
        };
      }

      return {
        id: event.pointerId ?? "mouse",
        clientX: event.clientX,
        clientY: event.clientY,
      };
    };

    const moveNode = (point) => {
      const left = point.clientX - offsetX;
      const top = point.clientY - offsetY;
      node.style.position = "fixed";
      node.style.left = `${left}px`;
      node.style.top = `${top}px`;
      node.style.width = `${originRect.width}px`;
      node.style.height = `${originRect.height}px`;
      node.style.margin = "0";
      node.style.zIndex = "1000";
      node.classList.add("is-dragging");
    };

    const getDropZoneAtPoint = (point) => {
      node.style.pointerEvents = "none";
      const hoveredZone = document.elementFromPoint(point.clientX, point.clientY)?.closest("[data-dropzone-id]");
      node.style.pointerEvents = "";
      return hoveredZone;
    };

    const setActiveDropZone = (zone) => {
      if (activeDropZone === zone) {
        return;
      }
      activeDropZone?.classList.remove("is-hover");
      activeDropZone = zone;
      activeDropZone?.classList.add("is-hover");
      onHover(zone?.dataset.dropzoneId ?? null);
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
      setActiveDropZone(null);
    };

    const finishDrag = (event, shouldDrop) => {
      const point = getPoint(event);
      if (activeId !== point.id || !originRect) {
        return;
      }

      event.preventDefault();
      const hoveredZone = shouldDrop ? getDropZoneAtPoint(point) : null;
      const zoneId = hoveredZone?.dataset.dropzoneId ?? null;
      const success = zoneId ? onDrop({ itemId, zoneId }) : false;

      if (!success) {
        resetPosition();
      } else {
        setActiveDropZone(null);
      }

      removeMoveListeners();
      activeId = null;
      activeMode = null;
      originRect = null;
      activeDropZone = null;
    };

    const continueDrag = (event) => {
      const point = getPoint(event);
      if (activeId !== point.id || !originRect) {
        return;
      }

      event.preventDefault();
      moveNode(point);
      setActiveDropZone(getDropZoneAtPoint(point));
    };

    function addMoveListeners() {
      window.addEventListener("pointermove", continueDrag, { passive: false, capture: true });
      window.addEventListener("pointerup", onPointerUp, { passive: false, capture: true });
      window.addEventListener("pointercancel", onPointerCancel, { passive: false, capture: true });
      window.addEventListener("touchmove", continueDrag, { passive: false, capture: true });
      window.addEventListener("touchend", onTouchEnd, { passive: false, capture: true });
      window.addEventListener("touchcancel", onTouchCancel, { passive: false, capture: true });
      window.addEventListener("mousemove", continueDrag, { passive: false, capture: true });
      window.addEventListener("mouseup", onMouseUp, { passive: false, capture: true });
    }

    function removeMoveListeners() {
      window.removeEventListener("pointermove", continueDrag, { capture: true });
      window.removeEventListener("pointerup", onPointerUp, { capture: true });
      window.removeEventListener("pointercancel", onPointerCancel, { capture: true });
      window.removeEventListener("touchmove", continueDrag, { capture: true });
      window.removeEventListener("touchend", onTouchEnd, { capture: true });
      window.removeEventListener("touchcancel", onTouchCancel, { capture: true });
      window.removeEventListener("mousemove", continueDrag, { capture: true });
      window.removeEventListener("mouseup", onMouseUp, { capture: true });
    }

    const beginDrag = (event, mode) => {
      if (activeMode || node.classList.contains("is-matched")) {
        return;
      }
      if (mode === "pointer" && event.button !== 0 && event.pointerType === "mouse") {
        return;
      }

      event.preventDefault();
      const point = getPoint(event);
      activeMode = mode;
      activeId = point.id;
      originRect = node.getBoundingClientRect();
      offsetX = point.clientX - originRect.left;
      offsetY = point.clientY - originRect.top;
      node.setPointerCapture?.(event.pointerId);
      moveNode(point);
      addMoveListeners();
    };

    function onPointerDown(event) {
      beginDrag(event, "pointer");
    }

    function onTouchStart(event) {
      beginDrag(event, "touch");
    }

    function onMouseDown(event) {
      beginDrag(event, "mouse");
    }

    function onPointerUp(event) {
      finishDrag(event, true);
    }

    function onPointerCancel(event) {
      finishDrag(event, false);
    }

    function onTouchEnd(event) {
      finishDrag(event, true);
    }

    function onTouchCancel(event) {
      finishDrag(event, false);
    }

    function onMouseUp(event) {
      finishDrag(event, true);
    }

    node.addEventListener("pointerdown", onPointerDown, { passive: false });
    node.addEventListener("touchstart", onTouchStart, { passive: false });
    node.addEventListener("mousedown", onMouseDown);

    cleanups.push(() => {
      node.removeEventListener("pointerdown", onPointerDown);
      node.removeEventListener("touchstart", onTouchStart);
      node.removeEventListener("mousedown", onMouseDown);
      removeMoveListeners();
      activeDropZone?.classList.remove("is-hover");
    });
  });

  return () => cleanups.forEach((cleanup) => cleanup());
}
