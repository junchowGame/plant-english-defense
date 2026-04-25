# Figma 新手操作说明书

适用文件：

Plant English Defense UI Export

Figma 链接：

https://www.figma.com/design/AbjkLt1PtuKeaJYs09B8ni

这份说明书只教你完成一个目标：在 Figma 里修改当前游戏界面，然后把修改后的页面链接发给开发者回填到代码里。

你不需要先学完整 Figma。先会点选、拖动、改文字、改颜色、换图片，就够用了。

## 一、打开 Figma 文件

1. 打开浏览器。
2. 访问这个链接：

```text
https://www.figma.com/design/AbjkLt1PtuKeaJYs09B8ni
```

3. 如果 Figma 要求登录，就用你的 Figma 账号登录。
4. 打开后，你会看到一个很大的画布。
5. 左侧是页面和图层列表。
6. 中间是设计画布。
7. 右侧是属性面板，用来改颜色、大小、图片、圆角、阴影等。

## 二、先认识这个 Figma 文件

左侧通常会看到两个页面：

```text
Screens
Components
```

### Screens 是什么

`Screens` 是游戏页面区。

里面有 5 个大画板：

```text
Home/Page
LevelSelect/Page
Battle/Page
Result/Page
ParentSettings/Page
```

你主要改这里。

### Components 是什么

`Components` 是组件参考区。

里面有按钮、卡片、面板、弹窗等通用 UI：

```text
Button/Main
Button/Secondary
Card/Level
Panel/Task
Panel/Feedback
Modal/Speak
Toggle/Switch
```

如果你刚开始用 Figma，先不要改 `Components`。先直接改 `Screens` 里的页面更简单。

## 三、最常用的 8 个操作

### 1. 移动画布视野

按住键盘空格键，然后拖动鼠标。

如果没有键盘：

按住鼠标中键拖动，或用触控板双指拖动。

### 2. 放大和缩小

用鼠标滚轮。

也可以在右上角找到缩放比例，比如 `100%`，手动改成：

```text
50%
75%
100%
```

### 3. 选中一个元素

用鼠标点击它。

选中后，元素周围会出现蓝色边框。

### 4. 进入组里面选元素

如果你点一次只能选中整个大区域，可以双击。

常见情况：

第一次点击选中整个 `Battle/Page`。

第二次双击可以选中里面的 `Panel/Task`、按钮、文字或图片。

### 5. 移动元素

选中元素后，直接拖动。

也可以用键盘方向键微调：

```text
↑ ↓ ← →
```

按住 `Shift` 再按方向键，可以移动更大的距离。

### 6. 改大小

选中元素后，拖动四周的小点。

如果想保持比例缩放图片：

按住 `Shift` 再拖动角上的小点。

### 7. 改文字

双击文字。

直接输入新文字。

输入完成后，点画布空白处退出编辑。

### 8. 撤销

按：

```text
Ctrl + Z
```

如果你改错了，先撤销，不要慌。

## 四、推荐你先改哪个页面

建议先改：

```text
Battle/Page
```

原因：

这是孩子真正玩游戏时看到最多的页面。

只要 `Battle/Page` 改好，游戏的视觉体验会立刻提升很多。

## 五、如何找到 Battle/Page

1. 看左侧页面列表。
2. 点 `Screens`。
3. 在画布中找到名为 `Battle/Page` 的大画板。
4. 如果看不到，可以缩小到 `25%` 或 `50%`。
5. 找到后，双击画板内部开始编辑。

## 六、Battle/Page 里有哪些东西

`Battle/Page` 里主要有这些区域：

```text
TopBar
Battle/Stage
Panel/Task
Panel/Feedback
Back Button
Replay Button
Drag Card Background
Drag Card Label
char_plant_peashooter_idle
char_zombie_basic_idle
obj_sun
Drop Zone
Projectile
```

你可以理解成：

`TopBar` 是顶部栏。

`Battle/Stage` 是左侧战场。

`Panel/Task` 是右侧任务面板。

`Panel/Feedback` 是底部反馈栏。

`Drag Card Background` 是可拖拽卡牌底图。

`Drag Card Label` 是卡牌文字。

`char_plant_peashooter_idle` 是豌豆射手。

`char_zombie_basic_idle` 是僵尸。

## 七、第一步：修改战斗背景

1. 进入 `Battle/Page`。
2. 点击左侧战场区域。
3. 如果选中了整个战场，继续双击，直到选中：

```text
bg_battle_yard_day
```

4. 看右侧属性面板。
5. 找到 `Fill`。
6. 如果要换图片，点击图片预览区域。
7. 选择新的图片。
8. 调整图片显示方式。

常用显示方式：

```text
Fill
Fit
Crop
Tile
```

建议先用：

```text
Fill
```

如果图片被裁得太多，再试：

```text
Fit
```

## 八、第二步：修改右侧任务面板

1. 在 `Battle/Page` 中点击右侧蓝色任务面板。
2. 找到图层名：

```text
Panel/Task
```

3. 右侧面板里可以改：

```text
Fill
Stroke
Corner radius
Effects
Width
Height
X
Y
```

你可以先改这些：

```text
Fill：面板背景颜色
Corner radius：圆角
Effects：阴影
Width / Height：面板尺寸
```

建议：

任务面板要足够清楚，不要太花。

可以用浅蓝、浅黄、浅绿，但文字区域要保持高对比。

## 九、第三步：修改播放按钮

1. 找到右侧任务面板里的按钮：

```text
Replay Button
```

2. 点击按钮外框。
3. 右侧改按钮颜色、圆角、阴影。
4. 双击按钮文字。
5. 可以把文字改成：

```text
播放
再听一次
Listen
```

如果给 5 岁孩子用，建议按钮上文字少一点。

例如：

```text
听一听
```

## 十、第四步：修改拖拽卡片

拖拽卡片由两个部分组成：

```text
Drag Card Background
Drag Card Label
```

### 改卡片底图

1. 点击：

```text
Drag Card Background
```

2. 右侧找到 `Fill`。
3. 替换图片或修改透明度。
4. 调整卡片大小。

### 改卡片文字

1. 双击：

```text
Drag Card Label
```

2. 修改文字。

例如：

```text
Hi
Hello
Water
3
```

3. 右侧可以改字号、颜色、加粗。

建议：

卡片文字要大，最好 28px 以上。

## 十一、第五步：移动植物、僵尸、太阳

### 移动豌豆射手

1. 点击：

```text
char_plant_peashooter_idle
```

2. 直接拖到你想要的位置。
3. 如果太大或太小，拖动角点缩放。

### 移动僵尸

1. 点击：

```text
char_zombie_basic_idle
```

2. 拖动位置。
3. 让它离植物有一点距离，不要贴得太近。

### 移动太阳

1. 点击：

```text
obj_sun
```

2. 拖动到画面上方或任务相关位置。

建议：

战场里不要放太多东西。

5 岁儿童需要一眼看懂当前要点什么、拖什么。

## 十二、第六步：修改底部反馈栏

底部反馈栏叫：

```text
Panel/Feedback
```

里面有：

```text
Feedback Title
Feedback Body
```

你可以改：

```text
背景颜色
圆角
文字大小
鼓励文案
```

建议文案短一点：

```text
Great!
Good job!
Try again!
```

如果写中文提示，也要短：

```text
真棒！
再试一次！
```

## 十三、第七步：修改首页

首页叫：

```text
Home/Page
```

可以改：

```text
Title
Subtitle
Description
Button/Main
Button/Secondary
bg_home_garden_day
```

建议首页重点只放三件事：

```text
游戏标题
开始游戏按钮
家长入口按钮
```

不要放太多说明。

## 十四、第八步：修改选关页

选关页叫：

```text
LevelSelect/Page
```

里面有 10 个关卡卡片：

```text
Card/Level 1
Card/Level 2
...
Card/Level 10
```

可以改：

```text
卡片颜色
卡片圆角
关卡数字
星星显示
锁定状态
背景图
```

建议：

每个关卡按钮要足够大。

iPad 上孩子点击区域不要太小。

## 十五、第九步：修改结算页

结算页叫：

```text
Result/Page
```

可以改：

```text
Result Title
Stars
Next Button
Replay Button
Reward Plant
```

建议：

结算页要有奖励感。

可以让星星更大，让贴纸或奖励图更明显。

## 十六、第十步：修改家长设置页

家长页叫：

```text
ParentSettings/Page
```

可以改：

```text
Settings Panel
Phrase Panel
Toggle/BGM
Toggle/Voice
Toggle/Auto
```

家长页可以比儿童页面更清爽，不需要太多装饰。

## 十七、如何替换图片

1. 选中一个图片图层。
2. 看右侧 `Fill`。
3. 点击当前图片预览。
4. 选择 `Choose image` 或替换图片。
5. 选择你的新图片。
6. 调整显示模式。

常用建议：

背景图用：

```text
Fill
```

角色立绘用：

```text
Fit
```

卡牌图用：

```text
Fill
```

## 十八、如何改颜色

1. 选中元素。
2. 右侧找到 `Fill`。
3. 点击颜色块。
4. 输入颜色值，或手动选择颜色。

推荐颜色方向：

```text
主按钮：绿色
奖励：黄色
信息面板：浅蓝
错误提示：浅红
底板：米白或浅色
```

注意：

文字和背景要有明显对比。

不要用太浅的字放在浅色背景上。

## 十九、如何改圆角

1. 选中按钮、卡片或面板。
2. 右侧找到圆角输入框。
3. 输入数值。

建议：

```text
按钮：20 到 28
卡片：16 到 24
大面板：24 到 32
```

如果太圆，会像糖果。

如果太方，会不像儿童游戏。

## 二十、如何改阴影

1. 选中元素。
2. 右侧找到 `Effects`。
3. 添加或修改 `Drop shadow`。

建议：

儿童 UI 的阴影不要太黑。

可以用浅一点的阴影：

```text
X: 0
Y: 10
Blur: 20
Opacity: 10% 到 20%
```

## 二十一、如何保持 iPad 横屏尺寸

当前每个页面是：

```text
1366 x 1024
```

你不要随便改整个 Page 的尺寸。

可以改里面的元素，但尽量保持外层 Frame 不变。

这些外层 Frame 不建议改尺寸：

```text
Home/Page
LevelSelect/Page
Battle/Page
Result/Page
ParentSettings/Page
```

如果你误改了外层尺寸，可以在右侧手动改回：

```text
W: 1366
H: 1024
```

## 二十二、如何把改好的页面发给开发者

改完以后，按这个流程发链接：

1. 点击你改好的整个页面，比如：

```text
Battle/Page
```

2. 确保选中的是整个大画板，不是里面某个小元素。
3. 右键。
4. 选择：

```text
Copy/Paste as
Copy link to selection
```

如果你看不到这个选项，也可以直接点右上角 `Share`，复制链接。

然后把链接发给开发者。

链接大概长这样：

```text
https://www.figma.com/design/AbjkLt1PtuKeaJYs09B8ni/...?node-id=2-57
```

## 二十三、推荐修改顺序

第一次改 UI，建议按这个顺序：

1. 改 `Battle/Page` 背景。
2. 改 `Panel/Task` 任务面板。
3. 改 `Replay Button` 播放按钮。
4. 改 `Drag Card Background` 拖拽卡片。
5. 调整植物、僵尸、太阳位置。
6. 改 `Panel/Feedback` 底部反馈栏。
7. 改 `Home/Page`。
8. 改 `LevelSelect/Page`。
9. 改 `Result/Page`。
10. 改 `ParentSettings/Page`。

不要一开始就全改。

先把 `Battle/Page` 改顺眼，再改其他页面。

## 二十四、儿童游戏 UI 检查清单

每改完一页，看一遍这个清单：

```text
孩子能一眼看到要点哪里吗？
按钮够大吗？
文字够大吗？
颜色是否太乱？
植物和僵尸是否不恐怖？
任务面板是否清楚？
错误提示是否温和？
奖励是否明显？
页面是否太拥挤？
```

如果答案不确定，就减少元素。

5 岁儿童界面宁可简单一点，也不要信息太多。

## 二十五、不要做的事情

刚开始不要做这些：

```text
不要改太多页面尺寸
不要把文字改得太小
不要堆很多装饰
不要把按钮做得很小
不要用太暗的背景
不要把僵尸做得恐怖
不要把重要元素放到角落
```

## 二十六、你改完后我需要什么

你只需要发我三样东西：

```text
1. Figma 页面链接
2. 你主要改了哪些地方
3. 哪个页面优先回填代码
```

例如：

```text
我改好了 Battle/Page。
主要改了背景、任务面板、按钮、卡片。
请先把 Battle/Page 回填到代码。
链接：https://www.figma.com/design/AbjkLt1PtuKeaJYs09B8ni/...?node-id=2-57
```

收到后，我会按你的 Figma 设计修改项目代码。
