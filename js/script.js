const typingText = document.querySelector(".typing-text p"),
  inpField = document.querySelector(".input-field"),
  tryAgainBtn = document.querySelector(".btn-try"),
  timeTag = document.querySelector(".time span b"),
  mistakeTag = document.querySelector(".mistake span"),
  wpmTag = document.querySelector(".wpm span"),
  cpmTag = document.querySelector(".cpm span");
let timer,
  maxTime = 60,
  timeLeft = maxTime,
  charIndex = 0,
  mistakes = 0,
  isTyping = false,
  gameDone = false;

/* SCREEN SWITCHER */

function showScreen(id) {
  document.querySelectorAll(".screen").forEach(s => {
    s.classList.remove("active");
    s.style.display = "none";
  });
  const target = document.getElementById(id);
  target.style.display = "flex";
  target.classList.add("active");
}

function startGame() {
  resetGame();
  showScreen("game-screen");
  setTimeout(() => {
    inpField.focus();
  }, 100);
}

function playAgain() {
  resetGame();
  showScreen("game-screen");
  setTimeout(() => {
    inpField.focus();
  }, 100);
}

function toggleHowTo() {
  const box = document.getElementById("howto-box");
  box.style.display =
    box.style.display === "none" ? "block" : "none";
}

/* ON-SCREEN KEYBOARD */

const kbRows = [
  ["`", "1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "-", "=", "Bksp"],
  ["Tab", "q", "w", "e", "r", "t", "y", "u", "i", "o", "p", "[", "]", "\\"],
  ["Caps", "a", "s", "d", "f", "g", "h", "j", "k", "l", ";", "'", "Enter"],
  ["Shift", "z", "x", "c", "v", "b", "n", "m", ",", ".", "/", "Shift"],
  ["Space"]
];
const wideKeys = new Set([
  "Tab",
  "Caps",
  "Enter",
  "Bksp",
  "Shift"
]);
const keyEls = {};

// Create visual keyboard
kbRows.forEach((row, ri) => {
  const container = document.getElementById("kb-r" + (ri + 1));
  row.forEach((keyName, index) => {
    const el = document.createElement("div");
    el.className =
      "key" +
      (keyName === "Space" ? " space-key" : "") +
      (wideKeys.has(keyName) ? " wide" : "");
    el.textContent = keyName;
    container.appendChild(el);
    if (keyName === "Shift") {
      if (!keyEls.shiftLeft) {
        keyEls.shiftLeft = el;
      } else {
        keyEls.shiftRight = el;
      }
    }
    else {
      keyEls[keyName.toLowerCase()] = el;
    }
  });
});

// Special aliases

keyEls[" "] = keyEls.space;
keyEls["backspace"] = keyEls.bksp;
keyEls["capslock"] = keyEls.caps;
keyEls["enter"] = keyEls.enter;
keyEls["tab"] = keyEls.tab;

// KEY CODE → VISUAL KEY

const codeToKey = {
  Backquote: "`",
  Digit1: "1",
  Digit2: "2",
  Digit3: "3",
  Digit4: "4",
  Digit5: "5",
  Digit6: "6",
  Digit7: "7",
  Digit8: "8",
  Digit9: "9",
  Digit0: "0",
  Minus: "-",
  Equal: "=",
  KeyQ: "q",
  KeyW: "w",
  KeyE: "e",
  KeyR: "r",
  KeyT: "t",
  KeyY: "y",
  KeyU: "u",
  KeyI: "i",
  KeyO: "o",
  KeyP: "p",
  BracketLeft: "[",
  BracketRight: "]",
  Backslash: "\\",
  KeyA: "a",
  KeyS: "s",
  KeyD: "d",
  KeyF: "f",
  KeyG: "g",
  KeyH: "h",
  KeyJ: "j",
  KeyK: "k",
  KeyL: "l",
  Semicolon: ";",
  Quote: "'",
  KeyZ: "z",
  KeyX: "x",
  KeyC: "c",
  KeyV: "v",
  KeyB: "b",
  KeyN: "n",
  KeyM: "m",
  Comma: ",",
  Period: ".",
  Slash: "/",
  Space: " ",
  Backspace: "backspace",
  Tab: "tab",
  Enter: "enter",
  CapsLock: "capslock",
  ShiftLeft: "shiftLeft",
  ShiftRight: "shiftRight",
  Numpad0: "0",
  Numpad1: "1",
  Numpad2: "2",
  Numpad3: "3",
  Numpad4: "4",
  Numpad5: "5",
  Numpad6: "6",
  Numpad7: "7",
  Numpad8: "8",
  Numpad9: "9",
  NumpadDecimal: ".",
  NumpadSubtract: "-",
  NumpadAdd: "+",
  NumpadMultiply: "*",
  NumpadDivide: "/"
};

//GET VISUAL KEY

function getVisualKey(e) {
  if (codeToKey[e.code]) {
    return codeToKey[e.code];
  }
  return normalizeKey(e.key);
}
function normalizeKey(key) {
  if (!key) return null;
  const lower = key.toLowerCase();
  const specialKeys = {
    " ": " ",
    "backspace": "backspace",
    "enter": "enter",
    "tab": "tab",
    "capslock": "capslock",
    "shift": "shift"
  };
  if (specialKeys[lower]) {
    return specialKeys[lower];
  }
  return lower;
}

// PRESS

const MIN_FLASH_MS = 90;
const pressStartTime = {};
const releaseTimers = {};
function pressKey(key) {
  if (!key) return;
  let el = keyEls[key];
  if (key === "shiftLeft") {
    el = keyEls.shiftLeft;
  }
  if (key === "shiftRight") {
    el = keyEls.shiftRight;
  }
  if (!el) return;
  if (releaseTimers[key]) {
    clearTimeout(releaseTimers[key]);
    delete releaseTimers[key];
  }
  el.classList.add("pressed");
  pressStartTime[key] = performance.now();
}

// RELEASE

function releaseKey(key) {
  if (!key) return;
  let el = keyEls[key];
  if (key === "shiftLeft") {
    el = keyEls.shiftLeft;
  }
  if (key === "shiftRight") {
    el = keyEls.shiftRight;
  }
  if (!el) return;
  const held =
    performance.now() -
    (pressStartTime[key] || performance.now());
  const remaining =
    Math.max(0, MIN_FLASH_MS - held);
  releaseTimers[key] = setTimeout(() => {
    el.classList.remove("pressed");
    delete releaseTimers[key];
    delete pressStartTime[key];
  }, remaining);
}

// PHYSICAL KEYBOARD

document.addEventListener("keydown", e => {
  const key = getVisualKey(e);
  pressKey(key);
  if (
    !gameDone &&
    document
      .getElementById("game-screen")
      .classList
      .contains("active")
  ) {
    inpField.focus();
  }
});
document.addEventListener("keyup", e => {
  const key = getVisualKey(e);
  releaseKey(key);
});

// MOBILE / VIRTUAL KEYBOARD─

let previousInputValue = "";
inpField.addEventListener("input", e => {
  const currentValue = inpField.value;
  if (currentValue.length > previousInputValue.length) {
    const addedText =
      currentValue.slice(previousInputValue.length);
    for (const char of addedText) {
      const key = normalizeKey(char);
      pressKey(key);
      releaseKey(key);
    }
  }
  else if (
    currentValue.length <
    previousInputValue.length
  ) {
    pressKey("backspace");
    releaseKey("backspace");
  }
  previousInputValue = currentValue;
  initTyping();
});

// PARAGRAPH LOADER

function loadParagraph() {
  const ranIndex =
    Math.floor(Math.random() * paragraphs.length);
  typingText.innerHTML = "";
  paragraphs[ranIndex]
    .split("")
    .forEach(char => {
      const span = document.createElement("span");
      span.textContent = char;
      typingText.appendChild(span);
    });
  const firstCharacter =
    typingText.querySelector("span");
  if (firstCharacter) {
    firstCharacter.classList.add("active");
  }
}

// END GAME

function endGame(won) {
  gameDone = true;
  clearInterval(timer);
  inpField.blur();
  const elapsed =
    (maxTime - timeLeft) || 1;
  const wpm =
    Math.max(
      0,
      Math.round(
        ((charIndex - mistakes) / 5) /
        elapsed *
        60
      )
    );
  const cpm =
    Math.max(
      0,
      charIndex - mistakes
    );
  const totalTyped = charIndex;
  const acc =
    totalTyped > 0
      ? Math.round(
          ((totalTyped - mistakes) /
          totalTyped) *
          100
        )
      : 100;
  document.getElementById("e-wpm").textContent = wpm;
  document.getElementById("e-cpm").textContent = cpm;
  document.getElementById("e-acc").textContent =
    acc + "%";
  document.getElementById("e-mis").textContent =
    mistakes;
  if (won) {
    document.getElementById("end-icon").textContent =
      "🎉";
    document.getElementById("end-title").style.color =
      "#56964f";
    document.getElementById("end-title").textContent =
      "You finished!";
    document.getElementById("end-subtitle").textContent =
      `Completed with ${timeLeft}s to spare. Great typing!`;
  } else {
    document.getElementById("end-icon").textContent =
      "⏱";
    document.getElementById("end-title").style.color =
      "#cb3439";
    document.getElementById("end-title").textContent =
      "Time's up!";
    document.getElementById("end-subtitle").textContent =
      `You typed ${charIndex} of ${typingText.querySelectorAll("span").length} characters. Keep practicing!`;
  }
  showScreen("end-screen");
}

// TYPING LOGIC 
function initTyping() {
  if (gameDone) return;
  const characters =
    typingText.querySelectorAll("span");
  const typedChar =
    inpField.value.split("")[charIndex];
  if (
    charIndex < characters.length &&
    timeLeft > 0
  ) {
    if (!isTyping) {
      document.getElementById(
        "game-hint"
      ).style.visibility = "hidden";
      timer =
        setInterval(
          initTimer,
          1000
        );
      isTyping = true;
    }
    if (typedChar == null) {
      if (charIndex > 0) {
        charIndex--;
        if (
          characters[charIndex]
            .classList
            .contains("incorrect")
        ) {
          mistakes--;
        }
        characters[charIndex]
          .classList
          .remove(
            "correct",
            "incorrect"
          );
      }
    }
    else {
      if (
        characters[charIndex]
          .innerText === typedChar
      ) {
        characters[charIndex]
          .classList
          .add("correct");
      } else {
        characters[charIndex]
          .classList
          .add("incorrect");
        mistakes++;
      }
      charIndex++;
    }
    characters.forEach(s =>
      s.classList.remove("active")
    );
    if (
      charIndex >=
      characters.length
    ) {
      endGame(true);
      return;
    }
    characters[charIndex]
      .classList
      .add("active");
    let wpm =
      Math.round(
        ((charIndex - mistakes) / 5) /
        (maxTime - timeLeft) *
        60
      );
    wpm =
      wpm < 0 ||
      !wpm ||
      wpm === Infinity
        ? 0
        : wpm;
    wpmTag.innerText = wpm;
    mistakeTag.innerText = mistakes;
    cpmTag.innerText =
      charIndex - mistakes;
  }
}

function initTimer() {
  if (timeLeft > 0) {
    timeLeft--;
    timeTag.innerText =
      timeLeft;
    let wpm =
      Math.round(
        ((charIndex - mistakes) / 5) /
        (maxTime - timeLeft) *
        60
      );
    wpm =
      wpm < 0 ||
      !wpm ||
      wpm === Infinity
        ? 0
        : wpm;
  wpmTag.innerText =
      wpm;
  }
  if (timeLeft === 0) {
    clearInterval(timer);
    endGame(false);
  }
}

//RESET 
function resetGame() {
    loadParagraph();
    clearInterval(timer);
    timeLeft = maxTime;
  charIndex = 0;
  mistakes = 0;
  isTyping = false;
  gameDone = false;
  inpField.value = "";
  // Important for mobile visualizer
  previousInputValue = "";
  timeTag.innerText = timeLeft;
  wpmTag.innerText = 0;
  mistakeTag.innerText = 0;
  cpmTag.innerText = 0;
  const hint = document.getElementById("game-hint");
  if (hint) {
    hint.style.visibility = "visible";
  }
}

// BUTTONS
tryAgainBtn.addEventListener("click", () => {
  resetGame();
  inpField.focus();
});
document
  .getElementById("game-screen")
  .addEventListener("click", () => {
    inpField.focus();
  });

// INITIALIZE
loadParagraph();
