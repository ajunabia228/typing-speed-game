const typingText  = document.querySelector(".typing-text p"),
      inpField    = document.querySelector(".input-field"),
      tryAgainBtn = document.querySelector(".btn-try"),
      timeTag     = document.querySelector(".time span b"),
      mistakeTag  = document.querySelector(".mistake span"),
      wpmTag      = document.querySelector(".wpm span"),
      cpmTag      = document.querySelector(".cpm span");

let timer, maxTime = 60, timeLeft = maxTime,
    charIndex = 0, mistakes = 0, isTyping = false, gameDone = false;

// ── SCREEN SWITCHER ──────────────────────────────────────────
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => {
    s.classList.remove('active');
    s.style.display = 'none';
  });
  const target = document.getElementById(id);
  target.style.display = 'flex';
  target.classList.add('active');
}

function startGame() {
  resetGame();
  showScreen('game-screen');
  setTimeout(() => inpField.focus(), 100);
}

function playAgain() {
  resetGame();
  showScreen('game-screen');
  setTimeout(() => inpField.focus(), 100);
}

function toggleHowTo() {
  const box = document.getElementById('howto-box');
  box.style.display = box.style.display === 'none' ? 'block' : 'none';
}

// ── KEYBOARD ─────────────────────────────────────────────────
const kbRows = [
  ['`','1','2','3','4','5','6','7','8','9','0','-','=','Bksp'],
  ['Tab','q','w','e','r','t','y','u','i','o','p','[',']','\\'],
  ['Caps','a','s','d','f','g','h','j','k','l',';',"'",'Enter'],
  ['Shift','z','x','c','v','b','n','m',',','.','/','Shift'],
  ['Space']
];
const wideKeys  = new Set(['Tab','Caps','Enter','Bksp','Shift']);
const xwideKeys = new Set([]);
const keyEls    = {};

kbRows.forEach((row, ri) => {
  const container = document.getElementById('kb-r' + (ri + 1));
  row.forEach(k => {
    const el = document.createElement('div');
    el.className = 'key'
      + (k === 'Space'   ? ' space-key' : '')
      + (wideKeys.has(k) ? ' wide'      : '')
      + (xwideKeys.has(k)? ' xwide'     : '');
    el.textContent = k;
    container.appendChild(el);

    const kl = k.toLowerCase();
    keyEls[kl] = el;
    if (k === 'Space') keyEls[' ']         = el;
    if (k === 'Bksp')  keyEls['backspace'] = el;
    if (k === 'Enter') keyEls['enter']     = el;
    if (k === 'Shift') keyEls['shift']     = el;
    if (k === 'Caps')  keyEls['capslock']  = el;
    if (k === 'Tab')   keyEls['tab']       = el;
  });
});

document.addEventListener('keydown', e => {
  const k = e.key.toLowerCase();
  if (keyEls[k]) keyEls[k].classList.add('pressed');
  if (!gameDone && document.getElementById('game-screen').classList.contains('active')) {
    inpField.focus();
  }
});
document.addEventListener('keyup', e => {
  const k = e.key.toLowerCase();
  if (keyEls[k]) keyEls[k].classList.remove('pressed');
});

// ── PARAGRAPH LOADER ─────────────────────────────────────────
function loadParagraph() {
  const ranIndex = Math.floor(Math.random() * paragraphs.length);
  typingText.innerHTML = "";
  paragraphs[ranIndex].split("").forEach(char => {
    typingText.innerHTML += `<span>${char}</span>`;
  });
  typingText.querySelectorAll("span")[0].classList.add("active");
  typingText.addEventListener("click", () => inpField.focus());
}

// ── END GAME (win or lose) ────────────────────────────────────
function endGame(won) {
  gameDone = true;
  clearInterval(timer);
  inpField.blur();

  const elapsed = (maxTime - timeLeft) || 1;
  const wpm = Math.max(0, Math.round(((charIndex - mistakes) / 5) / elapsed * 60));
  const cpm = Math.max(0, charIndex - mistakes);
  const totalTyped = charIndex;
  const acc = totalTyped > 0
    ? Math.round(((totalTyped - mistakes) / totalTyped) * 100)
    : 100;

  document.getElementById('e-wpm').textContent = wpm;
  document.getElementById('e-cpm').textContent = cpm;
  document.getElementById('e-acc').textContent = acc + '%';
  document.getElementById('e-mis').textContent = mistakes;

  if (won) {
    document.getElementById('end-icon').textContent    = '🎉';
    document.getElementById('end-title').style.color   = '#56964f';
    document.getElementById('end-title').textContent   = 'You finished!';
    document.getElementById('end-subtitle').textContent =
      `Completed with ${timeLeft}s to spare. Great typing!`;
  } else {
    document.getElementById('end-icon').textContent    = '⏱';
    document.getElementById('end-title').style.color   = '#cb3439';
    document.getElementById('end-title').textContent   = "Time's up!";
    document.getElementById('end-subtitle').textContent =
      `You typed ${charIndex} of ${typingText.querySelectorAll('span').length} characters. Keep practicing!`;
  }

  showScreen('end-screen');
}

// ── TYPING LOGIC ─────────────────────────────────────────────
function initTyping() {
  if (gameDone) return;
  const characters = typingText.querySelectorAll("span");
  const typedChar  = inpField.value.split("")[charIndex];

  if (charIndex < characters.length && timeLeft > 0) {
    if (!isTyping) {
      document.getElementById('game-hint').style.visibility = 'hidden';
      timer = setInterval(initTimer, 1000);
      isTyping = true;
    }

    if (typedChar == null) {
      if (charIndex > 0) {
        charIndex--;
        if (characters[charIndex].classList.contains("incorrect")) mistakes--;
        characters[charIndex].classList.remove("correct", "incorrect");
      }
    } else {
      if (characters[charIndex].innerText === typedChar)
        characters[charIndex].classList.add("correct");
      else {
        characters[charIndex].classList.add("incorrect");
        mistakes++;
      }
      charIndex++;
    }

    characters.forEach(s => s.classList.remove("active"));

    if (charIndex >= characters.length) {
      endGame(true);
      return;
    }

    characters[charIndex].classList.add("active");

    let wpm = Math.round(((charIndex - mistakes) / 5) / (maxTime - timeLeft) * 60);
    wpm = wpm < 0 || !wpm || wpm === Infinity ? 0 : wpm;

    wpmTag.innerText     = wpm;
    mistakeTag.innerText = mistakes;
    cpmTag.innerText     = charIndex - mistakes;
  }
}

function initTimer() {
  if (timeLeft > 0) {
    timeLeft--;
    timeTag.innerText = timeLeft;
    let wpm = Math.round(((charIndex - mistakes) / 5) / (maxTime - timeLeft) * 60);
    wpmTag.innerText = wpm;
  }
  if (timeLeft === 0) {
    clearInterval(timer);
    endGame(false);
  }
}

// ── RESET ────────────────────────────────────────────────────
function resetGame() {
  loadParagraph();
  clearInterval(timer);
  timeLeft  = maxTime;
  charIndex = mistakes = isTyping = 0;
  gameDone  = false;
  inpField.value       = "";
  timeTag.innerText    = timeLeft;
  wpmTag.innerText     = 0;
  mistakeTag.innerText = 0;
  cpmTag.innerText     = 0;
  const hint = document.getElementById('game-hint');
  if (hint) hint.style.visibility = 'visible';
}

// ── INIT ─────────────────────────────────────────────────────
loadParagraph();
inpField.addEventListener("input", initTyping);
tryAgainBtn.addEventListener("click", () => {
  resetGame();
  inpField.focus();
});
document.getElementById('game-screen').addEventListener('click', () => inpField.focus());