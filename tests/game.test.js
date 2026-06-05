const assert = require("node:assert/strict");
const {
  CLUBS,
  duplicateClubs,
  shuffle,
  calculateMatchScore,
  resolvePair,
  POINTS_PER_MATCH,
  COMBO_BONUS,
  MISMATCH_PENALTY
} = require("../script.js");

const deck = duplicateClubs(CLUBS);

assert.equal(deck.length, CLUBS.length * 2, "creates exactly two cards per club");
assert.equal(
  new Set(deck.map((card) => card.uid)).size,
  deck.length,
  "each duplicated card has a unique uid"
);

const sortedCounts = CLUBS.map((club) => deck.filter((card) => card.id === club.id).length);
assert.deepEqual(sortedCounts, CLUBS.map(() => 2), "every club appears as a pair");

let calls = 0;
const shuffled = shuffle([1, 2, 3, 4], () => {
  calls += 1;
  return 0;
});
assert.deepEqual(shuffled, [2, 3, 4, 1], "shuffle supports deterministic random input");
assert.equal(calls, 3, "shuffle calls random once per swap step");

assert.equal(
  calculateMatchScore(3),
  POINTS_PER_MATCH + 3 * COMBO_BONUS,
  "match score includes combo bonus"
);

const first = deck[0];
const matching = deck.find((card) => card.id === first.id && card.uid !== first.uid);
const other = deck.find((card) => card.id !== first.id);

assert.deepEqual(
  resolvePair(first, matching, 200, 1),
  {
    matched: true,
    score: 200 + POINTS_PER_MATCH + 2 * COMBO_BONUS,
    combo: 2,
    invalid: false
  },
  "matching pair increases score and combo"
);

assert.deepEqual(
  resolvePair(first, other, 10, 4),
  {
    matched: false,
    score: 0,
    combo: 0,
    invalid: false
  },
  "wrong pair resets combo and never drops below zero"
);

assert.equal(MISMATCH_PENALTY, 15, "mismatch penalty remains intentional");

console.log("All football link game tests passed.");
