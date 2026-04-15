// CANVAS
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// START SCREEN
const startScreen = document.getElementById("startScreen");
const startBtn = document.getElementById("startBtn");

// TILE SIZE
const TILE = 48;

// PLAYER (Adam)
const playerImg = new Image();
playerImg.src = "adam.png";

const player = {
    x: 100,
    y: 0,
    width: 48,
    height: 72,
    vx: 0,
    vy: 0,
    speed: 4,
    jumpForce: 12,
    onGround: false,
    lives: 3,
    money: 0
};

// GRAVITY
const GRAVITY = 0.6;

// MAPA – 50 dlaždic
let map = [];
for (let i = 0; i < 50; i++) {
    if (i < 5 || i > 45) map.push(1);
    else if (i % 9 === 0) map.push(0);
    else map.push(1);
}

// BANKOVKY
let moneyItems = [
    { x: 300, y: 300, collected: false },
    { x: 600, y: 300, collected: false },
    { x: 900, y: 300, collected: false },
    { x: 1200, y: 300, collected: false },
    { x: 1500, y: 300, collected: false },
    { x: 1800, y: 300, collected: false },
    { x: 2100, y: 300, collected: false }
];

// BODLÁKY
let spikes = [
    { x: 700, y: canvas.height - TILE },
    { x: 1600, y: canvas.height - TILE }
];

// OVLÁDÁNÍ
let keys = {};
document.addEventListener("keydown", e => keys[e.key] = true);
document.addEventListener("keyup", e => keys[e.key] = false);

// MOBILNÍ OVLÁDÁNÍ
function bindTouch(btn, key) {
    btn.addEventListener("touchstart", () => keys[key] = true);
    btn.addEventListener("touchend", () => keys[key] = false);
}

bindTouch(document.getElementById("leftBtn"), "ArrowLeft");
bindTouch(document.getElementById("rightBtn"), "ArrowRight");
bindTouch(document.getElementById("jumpBtn"), " ");

// START BUTTON
startBtn.onclick = () => {
    startScreen.style.display = "none";

    setTimeout(() => {
        alert("Osvoboď Ivanku a vem ji na dovču!");
    }, 300);

    requestAnimationFrame(gameLoop);
};

// GAME LOOP
function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// UPDATE
function update() {
    // pohyb
    if (keys["ArrowLeft"]) player.vx = -player.speed;
    else if (keys["ArrowRight"]) player.vx = player.speed;
    else player.vx = 0;

    // skok
    if (keys[" "] && player.onGround) {
        player.vy = -player.jumpForce;
        player.onGround = false;
    }

    // gravitace
    player.vy += GRAVITY;

    // aplikace pohybu
    player.x += player.vx;
    player.y += player.vy;

    // kolize se zemí
    let tileIndex = Math.floor(player.x / TILE);
    if (tileIndex >= 0 && tileIndex < map.length) {
        if (map[tileIndex] === 1) {
            let groundY = canvas.height - TILE;
            if (player.y + player.height >= groundY) {
                player.y = groundY - player.height;
                player.vy = 0;
                player.onGround = true;
            }
        }
    }

    // sbírání bankovek
    moneyItems.forEach(m => {
        if (!m.collected &&
            player.x + player.width > m.x &&
            player.x < m.x + 40 &&
            player.y + player.height > m.y &&
            player.y < m.y + 40) {
            m.collected = true;
            player.money++;
        }
    });

    // bodláky
    spikes.forEach(s => {
        if (player.x + player.width > s.x &&
            player.x < s.x + TILE &&
            player.y + player.height > s.y) {
            player.lives--;
            player.x -= 100;
        }
    });
}

// DRAW
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // zem
    for (let i = 0; i < map.length; i++) {
        if (map[i] === 1) {
            ctx.fillStyle = "#8B4513";
            ctx.fillRect(i * TILE - player.x + 200, canvas.height - TILE, TILE, TILE);
        }
    }

    // bankovky
    ctx.fillStyle = "yellow";
    moneyItems.forEach(m => {
        if (!m.collected) {
            ctx.fillRect(m.x - player.x + 200, m.y, 40, 20);
        }
    });

    // bodláky
    ctx.fillStyle = "red";
    spikes.forEach(s => {
        ctx.beginPath();
        ctx.moveTo(s.x - player.x + 200, s.y + TILE);
        ctx.lineTo(s.x - player.x + 200 + TILE / 2, s.y);
        ctx.lineTo(s.x - player.x + 200 + TILE, s.y + TILE);
        ctx.fill();
    });

    // hráč
    ctx.drawImage(playerImg, 200, player.y, player.width, player.height);

    // HUD
    ctx.fillStyle = "black";
    ctx.font = "24px Arial";
    ctx.fillText(`💸 ${player.money}/5`, 20, 40);
    ctx.fillText(`❤️ ${player.lives}`, 20, 70);
}
