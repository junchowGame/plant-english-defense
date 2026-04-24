# Asset Placeholder Guide

当前版本为了先跑通原型，使用了两类占位资源：

- CSS 绘制的角色、卡片和场景元素
- 浏览器 `speechSynthesis` 生成的示范播报

后续替换正式资源时，请保持现有命名规范与映射关系。

## 一、目录放置建议

```text
assets/
  images/
    backgrounds/
    characters/
    objects/
  icons/
  audio/
```

如果你希望继续保持扁平目录，也可以直接放在 `assets/images/`、`assets/icons/`、`assets/audio/`，但命名必须一致。

## 二、图片替换规则

### 背景图

建议替换为透明边缘较少、适合 1366 x 1024 横屏构图的图片。

- `bg_home_garden_day`
- `bg_level_select_garden`
- `bg_battle_yard_day`
- `bg_result_reward`
- `bg_parent_settings_plain`

当前代码中背景主要由 CSS 实现。替换为真实图片时可选两种方式：

1. 在对应页面样式里改为 `background-image`
2. 在页面结构中增加 `<img>` 或背景层容器，并保留原有 `data-asset-id`

### 植物角色

- `char_plant_sunflower_idle`
- `char_plant_sunflower_happy`
- `char_plant_peashooter_idle`
- `char_plant_peashooter_attack`
- `char_plant_wallnut_idle`

建议：

- 保持圆润、可爱、低龄友好
- 角色朝向尽量统一，方便后续做状态切换
- 同一角色的 `idle` 和 `attack` 外框尺寸保持接近

### 僵尸角色

- `char_zombie_basic_idle`
- `char_zombie_basic_hit`
- `char_zombie_fast_idle`
- `char_zombie_fast_hit`

建议：

- 不要恐怖化
- `hit` 状态建议只做轻度夸张，不要伤害感过强

### 物件

- `obj_sun`
- `obj_water_can`
- `obj_color_red`
- `obj_color_green`
- `obj_color_blue`
- `obj_color_yellow`
- `obj_number_1`
- `obj_number_2`
- `obj_number_3`
- `obj_gift_box`

建议使用统一透视和描边风格，便于同屏摆放。

## 三、图标替换规则

需要准备的图标：

- `icon_audio_on`
- `icon_audio_off`
- `icon_replay`
- `icon_microphone`
- `icon_lock`
- `icon_star`
- `icon_back`

建议：

- 图标线条不要过细
- 48 x 48 或 64 x 64 作为基础尺寸
- 保留圆角与卡通气质

如果替换为真实图标，可以在 `src/ui/*` 内把按钮文本改为 `<img>` 或内联 SVG。

## 四、音频替换规则

当前语音配置入口位于 `src/data/phrases.js`。每条内容至少包含：

- `id`
- `text`
- `audio`

例如：

```js
hello: {
  id: "hello",
  text: "Hello!",
  zh: "你好！",
  audio: "assets/audio/vo_word_hello.mp3"
}
```

### 需要准备的语音文件

#### 单词

- `vo_word_hello`
- `vo_word_hi`
- `vo_word_bye_bye`
- `vo_word_red`
- `vo_word_green`
- `vo_word_blue`
- `vo_word_yellow`
- `vo_word_one`
- `vo_word_two`
- `vo_word_three`

#### 短句

- `vo_phrase_i_want_water`
- `vo_phrase_thank_you`
- `vo_phrase_lets_go`

#### 提示语

- `vo_prompt_tap_the_green_plant`
- `vo_prompt_tap_the_sun`
- `vo_prompt_drag_hi_to_the_plant`
- `vo_prompt_say_hello`

#### 反馈语

- `vo_feedback_great`
- `vo_feedback_good_job`
- `vo_feedback_try_again`

## 五、代码中如何接入真实资源

### 图片

如果把某个角色替换为 PNG/SVG：

1. 保留原 `assetId`
2. 在 `src/ui/BattleStage.js` 或样式中根据 `assetId` 输出真实图片
3. 逐步移除对应 CSS 占位绘制

### 音频

当前 `src/core/audio.js` 使用浏览器语音播报作为占位。

若接入真实音频：

1. 读取 `phrase.audio`
2. 使用 `new Audio(phrase.audio)` 或统一音频池播放
3. 在 `masterAudioEnabled`、`voiceOverEnabled` 打开时触发
4. 保留 `speechSynthesis` 作为无资源时的 fallback

## 六、与 Figma 的协作建议

- 资源命名和代码里的 `assetId` 保持完全一致
- Figma 中的图层或组件名称也尽量使用同一命名
- 新增资源时，先补 `docs/figma_mapping.md` 和本文件，再改代码

## 七、推荐替换顺序

1. 背景图
2. 主植物与主僵尸
3. 交互物件
4. 图标
5. 语音与提示音

这样可以先保证页面观感，再补充操作反馈。
