const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let player = {
  x: 220,
  y: 550,
  width: 50,
  height: 50
};

let asteroids = [];
let score = 0;
let elapsed = 0;

let keys = {};
let lastTime = 0;
let animationId = null;
let asteroidIntervalId = null;
let gameOver = false;

document.addEventListener("keydown", (e) => {
  keys[e.key] = true;
});

document.addEventListener("keyup", (e) => {
  keys[e.key] = false;
});

function movePlayer(dt) {
  const speed = 300; // pixels per second
  if (keys["ArrowLeft"]) player.x -= speed * (dt / 1000);
  if (keys["ArrowRight"]) player.x += speed * (dt / 1000);

  // boundary checks
  player.x = Math.max(0, Math.min(canvas.width - player.width, player.x));
}

function createAsteroid() {
  const size = 20 + Math.random() * 30; // random size 20-50
  asteroids.push({
    x: Math.random() * (canvas.width - size),
    y: -size,
    size: size,
    speed: 100 + Math.random() * 200 // px/s
  });
}

function drawPlayer() {
  ctx.fillStyle = "cyan";
  ctx.fillRect(player.x, player.y, player.width, player.height);
}

function drawAsteroids(dt) {
  ctx.fillStyle = "red";

  // iterate backwards so we can remove safely
  for (let i = asteroids.length - 1; i >= 0; i--) {
    const a = asteroids[i];
    a.y += a.speed * (dt / 1000);

    ctx.fillRect(a.x, a.y, a.size, a.size);

    // collision
    if (
      a.x < player.x + player.width &&
      a.x + a.size > player.x &&
      a.y < player.y + player.height &&
      a.y + a.size > player.y
    ) {
      endGame();
      return;
    }

    // remove off-screen asteroids
    if (a.y > canvas.height) {
      asteroids.splice(i, 1);
    }
  }
}

function drawScore() {
  ctx.fillStyle = "white";
  ctx.font = "20px Arial";
  ctx.fillText("Score: " + score, 10, 30);
}

function gameLoop(timestamp) {
  if (!lastTime) lastTime = timestamp;
  const dt = timestamp - lastTime;
  lastTime = timestamp;

  if (gameOver) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  movePlayer(dt);
  drawPlayer();
  drawAsteroids(dt);

  elapsed += dt;
  score = Math.floor(elapsed / 1000); // score in seconds survived
  drawScore();

  animationId = requestAnimationFrame(gameLoop);
}

function startGame() {
  // reset state
  asteroids = [];
  score = 0;
  elapsed = 0;
  lastTime = 0;
  gameOver = false;
  player.x = Math.max(0, Math.min(canvas.width - player.width, player.x));

  // spawn asteroids every second
  asteroidIntervalId = setInterval(createAsteroid, 1000);
  animationId = requestAnimationFrame(gameLoop);
}

function endGame() {
  gameOver = true;
  clearInterval(asteroidIntervalId);
  if (animationId) cancelAnimationFrame(animationId);

  // show overlay and restart button
  const overlay = document.createElement("div");
  overlay.id = "game-over-overlay";
  overlay.style.position = "fixed";
  overlay.style.left = "0";
  overlay.style.top = "0";
  overlay.style.width = "100%";
  overlay.style.height = "100%";
  overlay.style.display = "flex";
  overlay.style.flexDirection = "column";
  overlay.style.alignItems = "center";
  overlay.style.justifyContent = "center";
  overlay.style.background = "rgba(0,0,0,0.75)";
  overlay.style.color = "white";
  overlay.style.font = "24px Arial";
  overlay.innerText = `Game Over! Score: ${score}`;

  const btn = document.createElement("button");
  btn.textContent = "Restart";
  btn.style.marginTop = "16px";
  btn.style.padding = "8px 16px";
  btn.style.fontSize = "16px";
  btn.addEventListener("click", () => {
    document.body.removeChild(overlay);
    startGame();
  });

  overlay.appendChild(btn);
  document.body.appendChild(overlay);
}

// start
startGame();