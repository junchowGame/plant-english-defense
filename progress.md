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

TODO
- Verify the full route flow in a browser.
- Verify pointer drag on iPad-style touch simulation.
- Confirm speech synthesis and microphone fallback behavior across Safari variants.
