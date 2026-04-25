Original prompt: 你现在是这个项目的前端实现负责人，同时需要兼顾可运行原型、可维护代码结构，以及后续与 Figma 的双向协作。从零开始实现一个适配 iPad 横屏 Safari 的 HTML5 儿童英语小游戏原型 Plant English Defense，要求包含首页、选关、主战斗、跟读弹层、结算、家长页，三种题型，本地存档、10 关配置数据、design token 和 Figma 映射文档。

2026-04-24
- Initialized the full static-project structure from scratch in an empty workspace.
- Building a single-page native JavaScript prototype with configuration-driven levels and localStorage persistence.
- Using CSS-generated placeholder visuals so the game is playable before final art/audio replacement.
- Added all requested pages, core UI components, question systems, local save flow, README, Figma mapping, and asset replacement guide.
- Static module import check passed through Node ESM import.
- Added GitHub Pages deployment support with workflow, `.nojekyll`, and repository ignore rules.
- Rewrote README local-run instructions to use a Node static server and documented Pages deployment flow.
- Fixed iPad scroll and 4:3 frame sizing, copied selected source art into `assets/images`, and mapped backgrounds/plant/zombie/sun/projectile sprites through CSS asset IDs.
- Reworked drag cards to use document-level pointer tracking, added the shovel card background asset, and made prompt playback explicitly unlock browser audio/speech on each click.
- Fixed Task 1-2 drag by removing render-on-hover during pointer drag; drop-zone hover is now applied directly to the live DOM. Prompt playback now resolves `promptAudioId` first and falls back to Web Speech when audio files are missing.
- Verified in Chromium with a mocked missing-audio file path: Level 1 Task 1 advances to Task 1-2, clicking play prompt speaks "Drag Hi to the plant.", and dragging the Hi card to the plant zone advances to Task 1-3.
- Reworked drag again for real touch devices: drag cards now listen to pointer, touch, and mouse events on the capture phase, use pointer capture when available, and were verified with Chromium touch emulation from Task 1-2 to Task 1-3.
- Replaced drag gameplay with tap-to-place: drag cards are now normal buttons, the player taps a card and then taps the glowing target zone. Verified Level 1 Task 1-2 advances to Task 1-3 with click-only input.

TODO
- Verify the full route flow in a browser.
- Re-run browser verification after any further drag/audio edits.
- Confirm speech synthesis and microphone fallback behavior across Safari variants.
