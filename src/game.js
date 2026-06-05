export const CLUBS = [
  { id: "lion", name: "雄狮FC", icon: "♛", a: "#ff365f", b: "#6d1029" },
  { id: "galaxy", name: "星河联", icon: "✦", a: "#5ce1ff", b: "#1b3cff" },
  { id: "flame", name: "烈焰城", icon: "◆", a: "#ff9f1c", b: "#d62828" },
  { id: "forest", name: "森林流浪", icon: "✚", a: "#8cff66", b: "#0b6f43" },
  { id: "harbor", name: "海港竞技", icon: "⚓", a: "#55d6be", b: "#005f73" },
  { id: "royal", name: "皇家星冠", icon: "♔", a: "#ffd166", b: "#7b2cbf" },
  { id: "meteor", name: "陨石前锋", icon: "●", a: "#f72585", b: "#3a0ca3" },
  { id: "thunder", name: "雷霆十一", icon: "ϟ", a: "#d9ed92", b: "#184e77" }
];

export const GAME_SECONDS = 90;
export const POINTS_PER_MATCH = 120;
export const COMBO_BONUS = 35;
export const MISMATCH_PENALTY = 15;

export function duplicateClubs(clubs) {
  return clubs.flatMap((club) => [
    { ...club, uid: `${club.id}-a` },
    { ...club, uid: `${club.id}-b` }
  ]);
}

export function shuffle(items, random = Math.random) {
  const output = [...items];
  for (let index = output.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [output[index], output[swapIndex]] = [output[swapIndex], output[index]];
  }
  return output;
}

export function calculateMatchScore(combo) {
  return POINTS_PER_MATCH + combo * COMBO_BONUS;
}

export function resolvePair(first, second, currentScore, combo) {
  if (!first || !second || first.uid === second.uid) {
    return { matched: false, score: currentScore, combo, invalid: true };
  }

  if (first.id === second.id) {
    const nextCombo = combo + 1;
    return {
      matched: true,
      score: currentScore + calculateMatchScore(nextCombo),
      combo: nextCombo,
      invalid: false
    };
  }

  return {
    matched: false,
    score: Math.max(0, currentScore - MISMATCH_PENALTY),
    combo: 0,
    invalid: false
  };
}
