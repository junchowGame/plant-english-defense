export function getCurrentQuestion(level, battleState) {
  return level?.questions?.[battleState.questionIndex] ?? null;
}

export function evaluateTapQuestion(question, optionId) {
  return question.correctOptionId === optionId;
}

export function evaluateDragQuestion(question, itemId, zoneId) {
  return question.correctPairs?.[itemId] === zoneId;
}

export function getQuestionProgress(level, battleState) {
  return {
    total: level?.questions?.length ?? 0,
    current: battleState.questionIndex + 1,
  };
}
