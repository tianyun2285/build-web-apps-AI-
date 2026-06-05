import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import {
  CLUBS,
  COMBO_BONUS,
  MISMATCH_PENALTY,
  POINTS_PER_MATCH,
  calculateMatchScore,
  duplicateClubs,
  resolvePair,
  shuffle
} from "../src/game.js";

const textFiles = {
  "index.html": readFileSync("index.html", "utf8"),
  "src/main.js": readFileSync("src/main.js", "utf8"),
  "src/game.js": readFileSync("src/game.js", "utf8")
};

const mojibakePattern = new RegExp(
  [
    String.fromCharCode(0xfffd),
    String.fromCharCode(0x00c3),
    String.fromCharCode(0x00c2),
    "\\\\u" + "FFFD"
  ].join("|"),
  "u"
);

for (const [file, source] of Object.entries(textFiles)) {
  assert.doesNotMatch(source, mojibakePattern, `${file} should not contain mojibake`);
}

assert.match(textFiles["index.html"], /绿茵记忆赛/, "index keeps the Chinese match-day subtitle");
assert.match(textFiles["index.html"], /再踢一场/, "result panel keeps the play-again label");
assert.match(textFiles["src/main.js"], /连击 x\$\{state\.combo\}/, "combo popup uses Chinese copy");
assert.match(textFiles["src/main.js"], /冠军时刻/, "win panel uses Chinese football copy");
assert.match(textFiles["src/game.js"], /海港竞技/, "club names remain readable Chinese");

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
