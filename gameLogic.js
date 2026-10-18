const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const scoreEl = document.getElementById("score");
const msgEl = document.getElementById("msg");

const CELL_SIZE = 20;

let wasm;
let initGame, setDirection, updateGame;
let getHeadX, getHeadY, getFruitX, getFruitY;
let getScore, isGameOver, getBodyLength, getBodyX, getBodyY;

// Initialize WebAssembly module exported by Emscripten
createSnakeModule().then((module) => {
  wasm = module;

  initGame = wasm.cwrap('initGame', null, []);
  setDirection = wasm.cwrap('setDirection', null, ['number']);
  updateGame = wasm.cwrap('updateGame', null, []);
  getHeadX = wasm.cwrap('getHeadX', 'number', []);
  getHeadY = wasm.cwrap('getHeadY', 'number', []);
  getFruitX = wasm.cwrap('getFruitX', 'number', []);
  getFruitY = wasm.cwrap('getFruitY', 'number', []);
  getScore = wasm.cwrap('getScore', 'number', []);
  isGameOver = wasm.cwrap('isGameOver', 'number', []);
  getBodyLength = wasm.cwrap('getBodyLength', 'number', []);
  getBodyX = wasm.cwrap('getBodyX', 'number', ['number']);
  getBodyY = wasm.cwrap('getBodyY', 'number', ['number']);

  resetGame();
  setInterval(gameTick, 130);
}).catch((err) => {
  console.error("Wasm engine failed to initialize:", err);
  msgEl.innerText = "ENGINE FAULT";
});

function sendDirection(dir) {
  if (setDirection) setDirection(dir);
}

function resetGame() {
  if (initGame) {
    initGame();
    msgEl.innerText = "RUNNING";
  }
}

// Button Click Bindings
document.getElementById("btn-reset").addEventListener("click", resetGame);
document.getElementById("btn-play").addEventListener("click", resetGame);
document.getElementById("key-ok").addEventListener("click", resetGame);

document.getElementById("key-up").addEventListener("click", () => sendDirection(1));
document.getElementById("key-down").addEventListener("click", () => sendDirection(2));
document.getElementById("key-left").addEventListener("click", () => sendDirection(3));
document.getElementById("key-right").addEventListener("click", () => sendDirection(4));

// Desktop & Numpad Keyboard Support
window.addEventListener("keydown", (e) => {
  const k = e.key.toLowerCase();
  if (k === 'w' || k === 'arrowup' || k === '2') sendDirection(1);
  else if (k === 's' || k === 'arrowdown' || k === '8') sendDirection(2);
  else if (k === 'a' || k === 'arrowleft' || k === '4') sendDirection(3);
  else if (k === 'd' || k === 'arrowright' || k === '6') sendDirection(4);
  else if (k === 'r' || k === '5' || k === 'enter') resetGame();
});

// Touch Screen Swipes (Direct LCD Interaction)
let touchX = 0;
let touchY = 0;

canvas.addEventListener("touchstart", (e) => {
  touchX = e.touches[0].clientX;
  touchY = e.touches[0].clientY;
}, { passive: true });

canvas.addEventListener("touchend", (e) => {
  const dx = e.changedTouches[0].clientX - touchX;
  const dy = e.changedTouches[0].clientY - touchY;

  if (Math.abs(dx) > Math.abs(dy)) {
    if (Math.abs(dx) > 20) sendDirection(dx > 0 ? 4 : 3);
  } else {
    if (Math.abs(dy) > 20) sendDirection(dy > 0 ? 2 : 1);
  }
}, { passive: true });

// Main Render & Tick Loop
function gameTick() {
  if (!updateGame) return;

  updateGame();

  const score = getScore();
  const over = isGameOver();
  scoreEl.innerText = String(score).padStart(4, '0');

  if (over) {
    msgEl.innerText = "DEAD! [5]";
  }

  // Draw Retro Monochrome LCD Background
  ctx.fillStyle = "#97b538";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // LCD Border Line
  ctx.strokeStyle = "#162607";
  ctx.lineWidth = 3;
  ctx.strokeRect(1, 1, canvas.width - 2, canvas.height - 2);

  // Draw Pixelated Fruit
  const fx = getFruitX() * CELL_SIZE;
  const fy = getFruitY() * CELL_SIZE;
  ctx.fillStyle = "#162607";
  ctx.fillRect(fx + 4, fy + 4, CELL_SIZE - 8, CELL_SIZE - 8);
  ctx.clearRect(fx + 7, fy + 7, CELL_SIZE - 14, CELL_SIZE - 14);

  // Draw Snake Body Modules
  const bodyLen = getBodyLength();
  for (let i = 0; i < bodyLen; ++i) {
    const bx = getBodyX(i) * CELL_SIZE;
    const by = getBodyY(i) * CELL_SIZE;
    ctx.fillStyle = "#162607";
    ctx.fillRect(bx + 1, by + 1, CELL_SIZE - 2, CELL_SIZE - 2);
  }

  // Draw Snake Head with Pixel Cutout Eyes
  const hx = getHeadX() * CELL_SIZE;
  const hy = getHeadY() * CELL_SIZE;
  ctx.fillStyle = "#162607";
  ctx.fillRect(hx, hy, CELL_SIZE, CELL_SIZE);
  ctx.fillStyle = "#97b538";
  ctx.fillRect(hx + 4, hy + 4, 3, 3);
  ctx.fillRect(hx + 13, hy + 4, 3, 3);
}