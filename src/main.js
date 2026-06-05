import "./styles.css";

import { CLUBS, GAME_SECONDS, duplicateClubs, resolvePair, shuffle } from "./game.js";

const STORAGE_KEY = "football-link-best-score";

const state = {
  deck: [],
  first: null,
  second: null,
  lock: false,
  score: 0,
  matches: 0,
  combo: 0,
  time: GAME_SECONDS,
  timerId: null,
  playing: false
};

function $(id) {
  return document.getElementById(id);
}

function getBestScore() {
  return Number(localStorage.getItem(STORAGE_KEY) || 0);
}

function setBestScore(score) {
  if (score > getBestScore()) {
    localStorage.setItem(STORAGE_KEY, String(score));
  }
}

function renderHud() {
  $("score").textContent = state.score;
  $("time").textContent = state.time;
  $("remaining").textContent = CLUBS.length - state.matches;
  $("best").textContent = getBestScore();
  document.querySelector(".timer").classList.toggle("warning", state.time <= 15);
}

function createCard(club) {
  const card = document.createElement("button");
  card.className = "card";
  card.type = "button";
  card.dataset.uid = club.uid;
  card.dataset.clubId = club.id;
  card.style.setProperty("--club-a", club.a);
  card.style.setProperty("--club-b", club.b);
  card.style.setProperty("--club-glow", `${club.a}99`);
  card.setAttribute("aria-label", `翻开${club.name}队徽卡`);

  card.innerHTML = `
    <span class="card-inner">
      <span class="card-face card-back" aria-hidden="true"></span>
      <span class="card-face card-front">
        <span class="badge" aria-hidden="true">${club.icon}</span>
        <span class="club-name">${club.name}</span>
      </span>
    </span>
  `;

  card.addEventListener("click", () => chooseCard(card));
  return card;
}

function renderBoard() {
  const board = $("board");
  board.replaceChildren(...state.deck.map(createCard));
}

function showCombo() {
  if (state.combo < 2) return;
  const pop = $("comboPop");
  pop.textContent = `连击 x${state.combo}`;
  pop.classList.remove("show");
  void pop.offsetWidth;
  pop.classList.add("show");
}

function startTimer() {
  clearInterval(state.timerId);
  state.timerId = setInterval(() => {
    state.time -= 1;
    renderHud();
    if (state.time <= 0) {
      finishGame(false);
    }
  }, 1000);
}

function chooseCard(card) {
  if (!state.playing || state.lock || card.disabled || card === state.first) {
    return;
  }

  card.classList.add("is-open");

  if (!state.first) {
    state.first = card;
    return;
  }

  state.second = card;
  state.lock = true;

  const result = resolvePair(
    state.deck.find((club) => club.uid === state.first.dataset.uid),
    state.deck.find((club) => club.uid === state.second.dataset.uid),
    state.score,
    state.combo
  );

  state.score = result.score;
  state.combo = result.combo;

  if (result.matched) {
    state.matches += 1;
    state.first.classList.add("is-matched");
    state.second.classList.add("is-matched");
    state.first.disabled = true;
    state.second.disabled = true;
    showCombo();
    resetSelection(520);
    if (state.matches === CLUBS.length) {
      window.setTimeout(() => finishGame(true), 620);
    }
  } else {
    state.first.classList.add("is-wrong");
    state.second.classList.add("is-wrong");
    resetSelection(720);
  }

  renderHud();
}

function resetSelection(delay) {
  window.setTimeout(() => {
    if (state.first && !state.first.classList.contains("is-matched")) {
      state.first.classList.remove("is-open", "is-wrong");
    }
    if (state.second && !state.second.classList.contains("is-matched")) {
      state.second.classList.remove("is-open", "is-wrong");
    }
    state.first = null;
    state.second = null;
    state.lock = false;
  }, delay);
}

function finishGame(won) {
  if (!state.playing) return;
  state.playing = false;
  clearInterval(state.timerId);
  setBestScore(state.score);

  $("resultKicker").textContent = won ? "冠军时刻" : "全场结束";
  $("resultTitle").textContent = won ? "冠军到手" : "时间到";
  $("resultText").textContent = won
    ? `最终得分 ${state.score}，这场绿茵记忆赛完美收官。`
    : `最终得分 ${state.score}，调整阵型后再冲一次。`;
  $("resultPanel").hidden = false;
  renderHud();
}

function newGame(random = Math.random) {
  clearInterval(state.timerId);
  state.deck = shuffle(duplicateClubs(CLUBS), random);
  state.first = null;
  state.second = null;
  state.lock = false;
  state.score = 0;
  state.matches = 0;
  state.combo = 0;
  state.time = GAME_SECONDS;
  state.playing = true;
  $("resultPanel").hidden = true;
  renderBoard();
  renderHud();
  startTimer();
}

function bindControls() {
  $("restart").addEventListener("click", () => newGame());
  $("playAgain").addEventListener("click", () => newGame());
}

bindControls();
newGame();
