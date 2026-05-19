const placementStorageKey = "plant-english-defense.yard-home.placements.v1";
const stickerSeenStorageKey = "plant-english-defense.yard-home.sticker-seen.v1";

const defaultPlacements = {
  peashooter: { x: 34, y: 55 },
  bucket: { x: 59, y: 57 },
  flag: { x: 45, y: 68 },
  flowerpot: { x: 58, y: 70 },
  mailbox: { x: 15, y: 67 },
  stoneA: { x: 19, y: 84 },
  stoneB: { x: 63, y: 86 },
};

function loadPlacements() {
  try {
    return { ...defaultPlacements, ...JSON.parse(localStorage.getItem(placementStorageKey) || "{}") };
  } catch {
    return defaultPlacements;
  }
}

function isStickerNew() {
  try {
    return localStorage.getItem(stickerSeenStorageKey) !== "1";
  } catch {
    return true;
  }
}

function posStyle(id) {
  const pos = loadPlacements()[id] ?? defaultPlacements[id];
  return `left:${pos.x}%; top:${pos.y}%;`;
}

export const homeScene = {
  render({ state }) {
    const nextLevel = state.save.unlockedLevel || 1;
    const stickerNew = isStickerNew();

    return `
      <section class="page-shell scene-home yard-home" data-page="page_home" aria-label="庭院首页">
        <div class="yard-home-bg" aria-hidden="true"></div>
        <div class="yard-home-place-area" aria-hidden="true"></div>

        <button class="yard-audio-toggle" data-action="toggle-master-audio" aria-label="声音开关">
          <span>${state.save.settings.masterAudioEnabled ? "声音开" : "声音关"}</span>
        </button>

        <button class="yard-encourage" data-action="home-play-encourage" aria-label="播放每日鼓励">
          <span>Hello! 一起守护小院吧！</span>
        </button>

        <div class="yard-shadow plant-shadow" style="${posStyle("peashooter")}"></div>
        <img class="yard-object yard-character peashooter" data-home-drag="peashooter" data-idle-src="./assets/images/yard_home/home/art_char/art_home_peashooter_idle_001.png" data-drag-src="./assets/images/yard_home/home/art_char/art_home_peashooter_drag_001.png" src="./assets/images/yard_home/home/art_char/art_home_peashooter_idle_001.png" alt="豌豆射手" style="${posStyle("peashooter")}" />

        <div class="yard-shadow zombie-shadow" style="${posStyle("bucket")}"></div>
        <img class="yard-object yard-character bucket" data-home-drag="bucket" data-idle-src="./assets/images/yard_home/home/art_char/art_home_bucket_zombie_idle_001.png" data-drag-src="./assets/images/yard_home/home/art_char/art_home_bucket_zombie_drag_001.png" src="./assets/images/yard_home/home/art_char/art_home_bucket_zombie_idle_001.png" alt="铁桶僵尸访客" style="${posStyle("bucket")}" />

        <img class="yard-object decor mailbox" data-home-drag="mailbox" src="./assets/images/yard_home/home/art_decor/art_home_decor_mailbox_001.png" alt="小邮箱" style="${posStyle("mailbox")}" />
        <img class="yard-object decor flag" data-home-drag="flag" src="./assets/images/yard_home/home/art_decor/art_home_decor_flag_001.png" alt="小太阳旗帜" style="${posStyle("flag")}" />
        <img class="yard-object decor flowerpot" data-home-drag="flowerpot" src="./assets/images/yard_home/home/art_decor/art_home_decor_flowerpot_001.png" alt="小花盆" style="${posStyle("flowerpot")}" />
        <img class="yard-object decor stone-a" data-home-drag="stoneA" src="./assets/images/yard_home/home/art_decor/art_home_decor_stone_001.png" alt="小石头花丛" style="${posStyle("stoneA")}" />
        <img class="yard-object decor stone-b" data-home-drag="stoneB" src="./assets/images/yard_home/home/art_decor/art_home_decor_stone_002.png" alt="小石头花丛" style="${posStyle("stoneB")}" />
        <img class="yard-object decor sticker-sign" src="./assets/images/yard_home/home/art_decor/art_home_decor_sticker_sign_001.png" alt="" aria-hidden="true" />
        <img class="yard-object decor birdhouse" src="./assets/images/yard_home/home/art_decor/art_home_decor_birdhouse_001.png" alt="" aria-hidden="true" />

        <section class="yard-next-panel" aria-label="下一关提示">
          <span>下一关</span>
          <strong>第一关</strong>
          <em>Hello / Hi / Good morning</em>
        </section>

        <div class="yard-primary-action">
          <img class="yard-guard-highlight" src="./assets/images/yard_home/home/ui/btn/ui_home_guard_btn_highlight_001.png" alt="" aria-hidden="true" />
          <button class="yard-guard-btn" data-action="open-level" data-level-id="${nextLevel}" aria-label="继续守护">
            <span>继续守护</span>
          </button>
        </div>

        <div class="yard-secondary-actions" aria-label="次级入口">
          <button class="yard-map-btn" data-action="go-level-select" aria-label="小路地图">
            <span>小路地图</span>
          </button>
          <button class="yard-sticker-btn" data-action="home-open-stickers" aria-label="贴纸册">
            <span>贴纸册</span>
            <img class="yard-new-badge${stickerNew ? "" : " hidden"}" src="./assets/images/yard_home/home/ui/badge/ui_home_sticker_badge_new_001.png" alt="新" />
          </button>
        </div>

        <div class="yard-status-panel" aria-live="polite">
          <span>拖动植物和小装扮，布置自己的小院。</span>
        </div>

        <div class="yard-drop-ring" aria-hidden="true"></div>
        <div class="yard-toast hidden" aria-live="polite"></div>
      </section>
    `;
  },
};
