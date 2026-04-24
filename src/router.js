export function createRouter(store) {
  function parseHash() {
    const raw = window.location.hash.replace(/^#/, "");
    if (!raw) {
      return { scene: "home", params: {} };
    }

    const [sceneSegment, queryString = ""] = raw.split("?");
    const searchParams = new URLSearchParams(queryString);
    return {
      scene: sceneSegment || "home",
      params: Object.fromEntries(searchParams.entries()),
    };
  }

  function syncFromHash() {
    const parsed = parseHash();
    store.setState((current) => ({ ...current, scene: parsed.scene, routeParams: parsed.params }));
  }

  window.addEventListener("hashchange", syncFromHash);

  return {
    start() {
      if (!window.location.hash) {
        this.go("home");
        return;
      }
      syncFromHash();
    },
    go(scene, params = {}) {
      const query = new URLSearchParams(params).toString();
      window.location.hash = query ? `${scene}?${query}` : scene;
    },
  };
}
