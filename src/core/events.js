export function createEventBus() {
  const listeners = new Map();

  return {
    on(eventName, handler) {
      const current = listeners.get(eventName) ?? new Set();
      current.add(handler);
      listeners.set(eventName, current);
      return () => current.delete(handler);
    },
    emit(eventName, payload) {
      const current = listeners.get(eventName);
      if (!current) {
        return;
      }
      current.forEach((handler) => handler(payload));
    },
  };
}
