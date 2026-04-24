function renderStageTarget(target, question, battle) {
  const isDropZone = target.kind === "drop-zone";
  const isMainPlant = target.id === "plant-main";
  const isMainZombie = target.id === "zombie-main";
  const isHover = battle.dragHoverZoneId && battle.dragHoverZoneId === target.id;
  const matchedItem = battle.dragMatchedItemId && question?.correctPairs?.[battle.dragMatchedItemId] === target.id;

  const dataAttrs = isDropZone
    ? `data-dropzone-id="${target.id}"`
    : `data-action="tap-target" data-target-id="${target.id}"`;

  const classNames = [
    "stage-object",
    target.kind,
    isDropZone ? "drop-zone" : "tap-target",
    isMainPlant ? "plant-main" : "",
    isMainZombie ? `zombie-main ${battle.zombieHit ? "is-hit" : ""}` : "",
    isHover ? "is-hover" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const label = matchedItem ? `<div class="speak-status-badge is-finished">${question.draggables?.find((item) => item.id === battle.dragMatchedItemId)?.label ?? "Matched"}</div>` : target.label;

  return `
    <div class="${classNames}" style="left:${target.x}%; top:${target.y}%;" ${dataAttrs}>
      <div class="stage-sprite" data-asset-id="${target.assetId}">
        <span>${label}</span>
      </div>
    </div>
  `;
}

export function BattleStage({ level, question, battle }) {
  const dragZones = question?.dropZones ?? [];
  const stageTargets = [...(question?.stageTargets ?? []), ...dragZones];
  const bubbleText = question?.type === "drag" ? "Drag to the glowing place." : question?.type === "speak" ? "Open the mic and speak." : "Tap the correct target.";

  return `
    <section class="cmp_battle_stage cmp-battle-stage ${battle.isPlantGlow ? "is-plant-glow" : ""} ${battle.isAttacking ? "is-attacking" : ""} ${battle.isWrong ? "is-wrong" : ""}" data-component="cmp_battle_stage">
      <div class="battle-stage-ground"></div>
      <div class="battle-bubble">${bubbleText}</div>
      ${stageTargets.map((target) => renderStageTarget(target, question, battle)).join("")}
      <div class="battle-projectile"></div>
    </section>
  `;
}
