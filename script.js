// Inisialisasi awal
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

window.addEventListener("resize", () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});

const shipImage = new Image();
shipImage.src = "assets/spaceship.png";
const enemyImage = new Image();
enemyImage.src = "assets/enemy.png";
const bossImage = new Image();
bossImage.src = "assets/enemybos.png";
const backgroundImage = new Image();
backgroundImage.src = "assets/planet.jpg";

const shootSound = new Audio("assets/shoot.mp3");
const explosionSound = new Audio("assets/explosion.mp3");
const bgMusic = new Audio("assets/bg-music.mp3");
bgMusic.loop = true;
bgMusic.volume = 0.3;

let player, bullets, enemyBullets, score, health, gameOver;
let keys = {};
let keyPressed = false;
let enemies = [];
let explosions = [];
let boss = null;
let bossSpawned = false;
let bossDefeated = false;
let gameStarted = false;
let powerUpActive = false;

function resetGame() {
  player = {
    x: canvas.width / 2,
    y: canvas.height - 100,
    width: 60,
    height: 60,
    speed: 5,
  };
  bullets = [];
  enemyBullets = [];
  enemies = [];
  explosions = [];
  boss = null;
  score = 0;
  health = 3;
  gameOver = false;
  bossSpawned = false;
  bossDefeated = false;
  powerUpActive = false;
  bgMusic.play().catch(() => {});
  spawnEnemy();
}

function drawPlayer() {
  ctx.drawImage(shipImage, player.x, player.y, player.width, player.height);
}

function drawBullets() {
  ctx.fillStyle = powerUpActive ? "cyan" : "red";
  bullets.forEach((b) => ctx.fillRect(b.x, b.y, b.width, b.height));
}

function moveBullets() {
  bullets.forEach((b) => (b.y -= b.speed));
  bullets = bullets.filter((b) => b.y > 0);
}

function drawEnemyBullets() {
  ctx.fillStyle = "yellow";
  enemyBullets.forEach((b) => {
    ctx.beginPath();
    ctx.arc(b.x + b.width / 2, b.y + b.height / 2, 6, 0, Math.PI * 2);
    ctx.fill();
  });
}

function moveEnemyBullets() {
  enemyBullets.forEach((b) => (b.y += b.speed));
  enemyBullets = enemyBullets.filter((b) => b.y < canvas.height);
}

function enemyShoot(enemy) {
  enemyBullets.push({
    x: enemy.x + enemy.width / 2 - 5,
    y: enemy.y + enemy.height,
    width: 10,
    height: 20,
    speed: 4,
  });
}

function drawHUD() {
  ctx.fillStyle = "white";
  ctx.font = "20px Arial";
  ctx.textAlign = "start";
  ctx.fillText(`Health: ${health}`, 20, 30);
  ctx.fillText(`Score: ${score}`, 20, 60);

  ctx.font = "14px Arial";
  ctx.fillText(`Gunakan A / D gerak, Spasi tembak.`, 20, 90);
  ctx.fillText(`DhapaDev`, 20, 110);
}
  

function drawGameOver() {
  ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "red";
  ctx.font = "60px Arial";
  ctx.textAlign = "center";
  ctx.fillText("Dead", canvas.width / 2, canvas.height / 2);

  ctx.font = "30px Arial";
  ctx.fillStyle = "white";
  ctx.fillText("Click to restart", canvas.width / 2, canvas.height / 2 + 60);
  ctx.textAlign = "start";
}

function shootBullet() {
  if (!powerUpActive) {
    bullets.push({
      x: player.x + player.width / 2 - 5,
      y: player.y,
      width: 10,
      height: 20,
      speed: 8,
    });
  } else {
    bullets.push(
      {
        x: player.x + player.width / 2 - 5,
        y: player.y,
        width: 10,
        height: 20,
        speed: 10,
      },
      {
        x: player.x + player.width / 2 - 15,
        y: player.y,
        width: 10,
        height: 20,
        speed: 10,
      },
      {
        x: player.x + player.width / 2 + 5,
        y: player.y,
        width: 10,
        height: 20,
        speed: 10,
      }
    );
  }
  const sfx = shootSound.cloneNode();
  sfx.volume = 0.6;
  sfx.play().catch(() => {});
}

function spawnEnemy() {
  let speed = 0.5 + Math.random();
  if (score >= 8000) speed = 0.3 + Math.random() * 0.5;
  enemies.push({
    x: Math.random() * (canvas.width - 40),
    y: -60,
    width: 40,
    height: 40,
    speed,
    shootCooldown: 0,
  });
}

function moveEnemies() {
  enemies.forEach((e) => {
    e.y += e.speed;
    if (e.y > 0) {
      e.shootCooldown--;
      if (e.shootCooldown <= 0) {
        enemyShoot(e);
        e.shootCooldown = 100 + Math.random() * 100;
      }
    }
  });
  enemies = enemies.filter((e) => e.y < canvas.height);

  let spawnChance = score < 5000 ? 0.01 : score < 10000 ? 0.03 : 0.005;
  if (Math.random() < spawnChance) spawnEnemy();

  if (score >= 10000 && !bossSpawned && !bossDefeated) {
    spawnBoss();
    bossSpawned = true;
    powerUpActive = true;
  }
}

function drawEnemies() {
  enemies.forEach((e) => {
    ctx.drawImage(enemyImage, e.x, e.y, e.width, e.height);
  });
}

function spawnBoss() {
  boss = {
    x: canvas.width / 2 - 100,
    y: -200,
    width: 200,
    height: 150,
    speed: 1,
    health: 30,
    shootCooldown: 0,
  };
}

function drawBoss() {
  if (boss) {
    ctx.drawImage(bossImage, boss.x, boss.y, boss.width, boss.height);
    ctx.fillStyle = "black";
    ctx.fillRect(boss.x, boss.y - 20, boss.width, 10);
    ctx.fillStyle = "green";
    ctx.fillRect(boss.x, boss.y - 20, boss.width * (boss.health / 30), 10);
  }
}

function moveBoss() {
  if (boss) {
    if (boss.y < 50) boss.y += boss.speed;
    boss.shootCooldown--;
    if (boss.shootCooldown <= 0) {
      enemyShoot(boss);
      boss.shootCooldown = 30 + Math.random() * 30;
    }
  }
}

function checkBulletEnemyCollisions() {
  bullets.forEach((b, bi) => {
    enemies.forEach((e, ei) => {
      if (
        b.x < e.x + e.width &&
        b.x + b.width > e.x &&
        b.y < e.y + e.height &&
        b.y + b.height > e.y
      ) {
        explosionSound.currentTime = 0;
        explosionSound.play().catch(() => {});
        explosions.push({ x: e.x, y: e.y, frame: 0 });
        bullets.splice(bi, 1);
        enemies.splice(ei, 1);
        score += 100;
      }
    });

    if (
      boss &&
      b.x < boss.x + boss.width &&
      b.x + b.width > boss.x &&
      b.y < boss.y + boss.height &&
      b.y + b.height > boss.y
    ) {
      explosionSound.currentTime = 0;
      explosionSound.play().catch(() => {});
      bullets.splice(bi, 1);
      boss.health--;
      explosions.push({ x: b.x, y: b.y, frame: 0 });
      if (boss.health <= 0) {
        score += 5000;
        boss = null;
        bossSpawned = false;
        bossDefeated = true;
        powerUpActive = false;
      }
    }
  });
}

function checkPlayerEnemyCollision() {
  enemies.forEach((e) => {
    if (
      player.x < e.x + e.width &&
      player.x + player.width > e.x &&
      player.y < e.y + e.height &&
      player.y + player.height > e.y
    ) {
      health--;
      explosionSound.currentTime = 0;
      explosionSound.play().catch(() => {});
      explosions.push({ x: e.x, y: e.y, frame: 0 });
      enemies = enemies.filter((enemy) => enemy !== e);
      if (health <= 0) {
        gameOver = true;
        bgMusic.pause();
      }
    }
  });
}

function checkPlayerHit() {
  enemyBullets.forEach((b, bi) => {
    if (
      b.x < player.x + player.width &&
      b.x + b.width > player.x &&
      b.y < player.y + player.height &&
      b.y + b.height > player.y
    ) {
      enemyBullets.splice(bi, 1);
      health--;
      explosionSound.currentTime = 0;
      explosionSound.play().catch(() => {});
      explosions.push({ x: player.x, y: player.y, frame: 0 });
      if (health <= 0) {
        gameOver = true;
        bgMusic.pause();
      }
    }
  });
}

function updateExplosions() {
  explosions.forEach((exp) => exp.frame++);
  explosions = explosions.filter((exp) => exp.frame < 10);
}

function drawExplosions() {
  explosions.forEach((exp) => {
    ctx.fillStyle = `rgba(255, 165, 0, ${1 - exp.frame / 10})`;
    ctx.beginPath();
    ctx.arc(exp.x + 20, exp.y + 20, 30 - exp.frame * 2, 0, Math.PI * 2);
    ctx.fill();
  });
}

function update() {
  if (keys["a"] || keys["arrowleft"]) player.x -= player.speed;
  if (keys["d"] || keys["arrowright"]) player.x += player.speed;
  moveBullets();
  moveEnemies();
  moveEnemyBullets();
  moveBoss();
  updateExplosions();
  checkBulletEnemyCollisions();
  checkPlayerEnemyCollision();
  checkPlayerHit();
  score++;
}

function draw() {
  ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
  if (gameStarted) {
    drawPlayer();
    drawBullets();
    drawEnemies();
    drawEnemyBullets();
    drawBoss();
    drawExplosions();
    drawHUD();
    if (gameOver) drawGameOver();
  } else {
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "white";
    ctx.font = "50px Arial";
    ctx.textAlign = "center";
    ctx.fillText("Click to Start", canvas.width / 2, canvas.height / 2);
  }
}

function gameLoop() {
  if (gameStarted && !gameOver) update();
  draw();
  requestAnimationFrame(gameLoop);
}

document.addEventListener("keydown", (e) => {
  keys[e.key.toLowerCase()] = true;
  if (
    e.code === "Space" &&
    !keys["space"] &&
    !gameOver &&
    gameStarted &&
    !keyPressed
  ) {
    shootBullet();
    keyPressed = true;
  }
});

document.addEventListener("keyup", (e) => {
  keys[e.key.toLowerCase()] = false;
  if (e.code === "Space") keyPressed = false;
});

canvas.addEventListener("click", () => {
  if (!gameStarted) {
    gameStarted = true;
    resetGame();
  } else if (gameOver) {
    resetGame();
  }
});

gameLoop();
