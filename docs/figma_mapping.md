# Figma Mapping

本文档用于将代码结构与 Figma 设计结构一一对应，便于后续做视觉整理、变体管理和设计回填。

## 页面到 Figma Frame 的映射

| Code Page | Code Name | Figma Frame |
| --- | --- | --- |
| HomePage | `page_home` | `Home/Page` |
| LevelSelectPage | `page_level_select` | `LevelSelect/Page` |
| BattlePage | `page_battle` | `Battle/Page` |
| ResultPage | `page_result` | `Result/Page` |
| ParentSettingsPage | `page_parent_settings` | `ParentSettings/Page` |

## 组件到 Figma Component 的映射

| Code Component | Code Name | Figma Component |
| --- | --- | --- |
| MainButton | `cmp_main_button` | `Button/Main` |
| SecondaryButton | `cmp_secondary_button` | `Button/Secondary` |
| LevelCard | `cmp_level_card` | `Card/Level` |
| TaskPanel | `cmp_task_panel` | `Panel/Task` |
| BattleStage | `cmp_battle_stage` | `Battle/Stage` |
| SpeakModal | `cmp_speak_modal` | `Modal/Speak` |
| FeedbackBar | `cmp_feedback_bar` | `Panel/Feedback` |
| ProgressIndicator | `cmp_progress_indicator` | `Progress/Indicator` |
| ToggleSwitch | `cmp_toggle_switch` | `Toggle/Switch` |

## 建议在 Figma 中制作的 Variants

### Button/Main

- `default`
- `pressed`
- `disabled`

### LevelCard

- `locked`
- `unlocked`
- `completed`

### SpeakModal

- `idle`
- `listening`
- `finished`

### ToggleSwitch

- `on`
- `off`

## 设计 Token 对照

### Colors

| Token | CSS Variable | Suggested Figma Token |
| --- | --- | --- |
| Brand Green / Dark | `--color-brand-green-700` | `colors/brand/green-700` |
| Brand Green / Base | `--color-brand-green-500` | `colors/brand/green-500` |
| Sun / Base | `--color-sun-500` | `colors/reward/sun-500` |
| Sky / Panel | `--color-sky-300` | `colors/panel/sky-300` |
| Danger / Hint | `--color-danger-400` | `colors/feedback/danger-400` |
| Cream / Base | `--color-cream-100` | `colors/base/cream-100` |
| Ink / Text | `--color-ink-900` | `colors/text/ink-900` |

### Radius

| Token | CSS Variable | Suggested Figma Token |
| --- | --- | --- |
| Button Radius | `--radius-button` | `radius/button/lg` |
| Card Radius | `--radius-card` | `radius/card/md` |
| Panel Radius | `--radius-panel` | `radius/panel/lg` |

### Spacing

| Token | CSS Variable | Suggested Figma Token |
| --- | --- | --- |
| 12 | `--space-12` | `spacing/12` |
| 20 | `--space-20` | `spacing/20` |
| 28 | `--space-28` | `spacing/28` |
| 40 | `--space-40` | `spacing/40` |

### Typography

| Token | CSS Variable | Suggested Figma Token |
| --- | --- | --- |
| Display Family | `--font-display` | `typography/display/family` |
| Body Family | `--font-body` | `typography/body/family` |
| Page Title | `--font-size-page-title` | `typography/page-title/size` |
| Panel Title | `--font-size-panel-title` | `typography/panel-title/size` |
| Task Text | `--font-size-task` | `typography/task/size` |
| Button Text | `--font-size-button` | `typography/button/size` |

## Figma 文件组织建议

### Pages

- `01 Foundations`
- `02 Components`
- `03 Pages`
- `04 Prototypes`

### Foundations

- Colors
- Typography
- Radius
- Spacing
- Shadows

### Components

- Button/Main
- Button/Secondary
- Card/Level
- Panel/Task
- Panel/Feedback
- Modal/Speak
- Toggle/Switch

### Pages

- Home/Page
- LevelSelect/Page
- Battle/Page
- Result/Page
- ParentSettings/Page

## 代码与设计结构的对应建议

- `src/scenes/*` 对应 Figma `Pages`
- `src/ui/*` 对应 Figma `Components`
- `styles/tokens.css` 对应 Figma `Foundations`
- `src/data/*` 对应 Figma 中的内容说明、原型注释和资源表

## 协作流程建议

1. 先在 Figma 固化 `Foundations`
2. 再整理 `Components` 的尺寸、圆角、状态与命名
3. 最后将页面 Frame 结构与 `src/scenes/*` 对齐
4. 所有资源命名保持与代码一致，降低交接成本
