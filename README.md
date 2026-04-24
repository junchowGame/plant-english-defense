# Plant English Defense

一个面向 5 岁儿童、适配 iPad 横屏 Safari 的英语启蒙小游戏原型。当前版本使用 `HTML + CSS + 原生 JavaScript` 构建，支持首页、选关、主游戏、跟读弹层、结算页、家长设置页，以及本地存档、10 关示例数据和配置化内容管理。

## 如何本地运行

本项目是纯静态资源，但使用了 ES Module，所以不要直接双击 `index.html`。建议在项目根目录启动一个本地静态服务器。

### 方式一：Node 临时静态服务器

```powershell
cd "D:\OneDrive\AI项目\幼儿版植物大战僵尸"
node -e "const http=require('http');const fs=require('fs');const path=require('path');const root=process.cwd();const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8'};http.createServer((req,res)=>{const urlPath=req.url==='/'?'/index.html':decodeURIComponent(req.url.split('?')[0]);const filePath=path.join(root,urlPath.replace(/^\//,''));fs.readFile(filePath,(err,data)=>{if(err){res.writeHead(404);res.end('not found');return;}res.writeHead(200,{'Content-Type':mime[path.extname(filePath)]||'text/plain; charset=utf-8'});res.end(data);});}).listen(4173,'0.0.0.0',()=>console.log('http://127.0.0.1:4173'));"
```

然后在浏览器打开：

`http://127.0.0.1:4173`

如果要在同一 Wi-Fi 下的 iPad 访问，请把地址替换成电脑的局域网 IPv4 地址，例如：

`http://192.168.1.23:4173`

## GitHub Pages 部署

项目已经补齐了 GitHub Pages 所需的基础配置：

- `index.html` 作为静态入口
- 全部资源使用相对路径
- 路由使用 hash 形式，适合 Pages 静态托管
- `.github/workflows/deploy-pages.yml` 自动发布
- `.nojekyll` 禁用 Jekyll 处理

### 部署条件

1. 一个 GitHub 账号
2. 一个 GitHub 仓库
3. 把当前项目推送到该仓库的默认分支

### 部署步骤

1. 新建 GitHub 仓库
2. 将本地项目推送到仓库
3. 在 GitHub 仓库中打开 `Settings > Pages`
4. 在 `Build and deployment` 中选择 `GitHub Actions`
5. 推送代码后，GitHub Actions 会自动发布

发布完成后，站点地址通常是：

`https://<你的用户名>.github.io/<仓库名>/`

### 注意事项

- 本项目是纯静态页面，不依赖 Node/Python 后端，所以可以直接部署到 Pages
- 本地存档使用浏览器 `localStorage`，会保存在访问设备本地，不会跨设备同步
- 麦克风权限在 GitHub Pages 的 HTTPS 环境下可以正常请求，但仍取决于浏览器授权

## 项目目录说明

```text
plant-english-defense/
  index.html
  README.md
  progress.md
  .nojekyll
  .gitignore
  .github/
    workflows/
      deploy-pages.yml
  docs/
    figma_mapping.md
    asset_placeholder_guide.md
  src/
    main.js
    app.js
    router.js
    core/
      state.js
      storage.js
      audio.js
      events.js
      theme.js
    data/
      levels.js
      phrases.js
      settings.js
      uiText.js
    scenes/
      homeScene.js
      levelSelectScene.js
      battleScene.js
      resultScene.js
      parentScene.js
    systems/
      questionSystem.js
      dragSystem.js
      speakSystem.js
      rewardSystem.js
    ui/
      MainButton.js
      SecondaryButton.js
      LevelCard.js
      TaskPanel.js
      BattleStage.js
      SpeakModal.js
      FeedbackBar.js
      ProgressIndicator.js
      ToggleSwitch.js
  styles/
    reset.css
    app.css
    scenes.css
    components.css
    tokens.css
  assets/
    images/
    audio/
    icons/
```

## 当前实现内容

- 首页 `HomePage`
- 选关页 `LevelSelectPage`
- 游戏主页面 `BattlePage`
- 跟读弹层 `SpeakModal`
- 结算页 `ResultPage`
- 家长页 `ParentSettingsPage`
- 三种题型：听音点选、拖拽配对、跟读触发
- 基础战斗演出：植物发光、发射攻击、僵尸受击退场
- 本地存档：解锁关卡、关卡星级、贴纸、已学句子、设置项
- 配置化关卡与文案数据
- Figma 对照文档与资源替换说明

## 如何新增关卡

关卡数据位于 `src/data/levels.js`。

每一关建议包含：

- `id`
- `title`
- `subtitle`
- `rewardSticker`
- `questions`

每个题目可以使用以下结构：

```js
{
  id: "11-1",
  type: "tap", // tap | drag | speak
  promptText: "Tap the sun.",
  promptAudioId: "vo_prompt_tap_the_sun",
  guideText: "Tap the sun",
  correctOptionId: "sun-object",
  learnedPhraseIds: ["sun"],
  stageTargets: [
    { id: "sun-object", label: "Sun", kind: "sun", x: 54, y: 25, assetId: "obj_sun" }
  ]
}
```

拖拽题额外需要：

- `draggables`
- `dropZones`
- `correctPairs`

跟读题额外需要：

- `phraseId`
- 可选 `exampleTextOverride`

如果要新增真正的语音资源或图像资源，也应同步维护 `src/data/phrases.js` 和 `docs/asset_placeholder_guide.md`。

## 如何替换图片和音频

当前原型主要使用 CSS 占位图形和浏览器语音播报，方便快速试玩。替换资源时建议：

1. 图片放入 `assets/images/`
2. 图标放入 `assets/icons/`
3. 音频放入 `assets/audio/`
4. 保持现有命名规范，例如 `char_plant_sunflower_idle`、`icon_audio_on`、`vo_word_hello`
5. 在 `src/data/levels.js` 和 `src/data/phrases.js` 中替换对应 `assetId` 或 `audio`

详细替换规则见 [docs/asset_placeholder_guide.md](./docs/asset_placeholder_guide.md)。

## 如何调整 design token

所有核心 token 集中在 `styles/tokens.css`，包含：

- `colors`
- `typography`
- `spacing`
- `radius`
- `shadow`

如果要整体调整视觉风格，优先改 token，不要直接散改组件样式。代码里的设计映射在 `src/core/theme.js`，方便后续与 Figma 双向同步。

## 如何与 Figma 协作整理界面

1. 页面和组件已经使用接近 Figma 的命名，例如 `data-page="page_home"`、`data-component="cmp_task_panel"`
2. 页面与组件对照关系见 [docs/figma_mapping.md](./docs/figma_mapping.md)
3. 先在 Figma 中维护 Frame、Component、Variant 和 Design Token
4. 再按 `styles/tokens.css` 与 `src/ui/*` 的结构回填代码
5. 资源替换时保持相同命名，减少设计稿与实现之间的映射成本

## 实现说明

- 为了保证 MVP 可跑通，战场角色与物件目前使用 CSS 图形占位
- 音频优先使用浏览器 `speechSynthesis` 做示范播报
- 麦克风流程使用浏览器录音权限作为轻量占位，不做严格发音评分
- 拖拽系统基于 Pointer Events，更适合 iPad 触控而不是依赖原生 HTML5 Drag API

## 后续建议

- 接入真实插画、图标和配音资源
- 用更细的动画状态替换当前 CSS 演出
- 引入题目难度标记和更细的关卡反馈统计
- 与 Figma 进一步对齐组件尺寸、状态和变量体系
