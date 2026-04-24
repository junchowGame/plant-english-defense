export const phraseLibrary = {
  hello: { id: "hello", text: "Hello!", zh: "你好！", audio: "assets/audio/vo_word_hello.mp3" },
  hi: { id: "hi", text: "Hi!", zh: "嗨！", audio: "assets/audio/vo_word_hi.mp3" },
  bye_bye: { id: "bye_bye", text: "Bye-bye!", zh: "再见！", audio: "assets/audio/vo_word_bye_bye.mp3" },
  red: { id: "red", text: "red", zh: "红色", audio: "assets/audio/vo_word_red.mp3" },
  green: { id: "green", text: "green", zh: "绿色", audio: "assets/audio/vo_word_green.mp3" },
  blue: { id: "blue", text: "blue", zh: "蓝色", audio: "assets/audio/vo_word_blue.mp3" },
  yellow: { id: "yellow", text: "yellow", zh: "黄色", audio: "assets/audio/vo_word_yellow.mp3" },
  one: { id: "one", text: "one", zh: "一", audio: "assets/audio/vo_word_one.mp3" },
  two: { id: "two", text: "two", zh: "二", audio: "assets/audio/vo_word_two.mp3" },
  three: { id: "three", text: "three", zh: "三", audio: "assets/audio/vo_word_three.mp3" },
  sun: { id: "sun", text: "sun", zh: "太阳", audio: "assets/audio/vo_word_sun.mp3" },
  plant: { id: "plant", text: "plant", zh: "植物", audio: "assets/audio/vo_word_plant.mp3" },
  zombie: { id: "zombie", text: "zombie", zh: "僵尸", audio: "assets/audio/vo_word_zombie.mp3" },
  water: { id: "water", text: "water", zh: "水", audio: "assets/audio/vo_word_water.mp3" },
  thank_you: {
    id: "thank_you",
    text: "Thank you!",
    zh: "谢谢你！",
    audio: "assets/audio/vo_phrase_thank_you.mp3",
  },
  lets_go: {
    id: "lets_go",
    text: "Let's go!",
    zh: "出发吧！",
    audio: "assets/audio/vo_phrase_lets_go.mp3",
  },
  i_want_water: {
    id: "i_want_water",
    text: "I want water.",
    zh: "我想要水。",
    audio: "assets/audio/vo_phrase_i_want_water.mp3",
  },
  prompt_tap_green_plant: {
    id: "prompt_tap_green_plant",
    text: "Tap the green plant.",
    audio: "assets/audio/vo_prompt_tap_the_green_plant.mp3",
  },
  prompt_tap_sun: {
    id: "prompt_tap_sun",
    text: "Tap the sun.",
    audio: "assets/audio/vo_prompt_tap_the_sun.mp3",
  },
  prompt_drag_hi_to_plant: {
    id: "prompt_drag_hi_to_plant",
    text: "Drag Hi to the plant.",
    audio: "assets/audio/vo_prompt_drag_hi_to_the_plant.mp3",
  },
  prompt_say_hello: {
    id: "prompt_say_hello",
    text: "Say: Hello!",
    audio: "assets/audio/vo_prompt_say_hello.mp3",
  },
  feedback_great: {
    id: "feedback_great",
    text: "Great!",
    audio: "assets/audio/vo_feedback_great.mp3",
  },
  feedback_good_job: {
    id: "feedback_good_job",
    text: "Good job!",
    audio: "assets/audio/vo_feedback_good_job.mp3",
  },
  feedback_try_again: {
    id: "feedback_try_again",
    text: "Try again.",
    audio: "assets/audio/vo_feedback_try_again.mp3",
  },
};

export function getPhrase(id) {
  return phraseLibrary[id] ?? { id, text: id, zh: "", audio: "" };
}
