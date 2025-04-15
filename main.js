const COLS = 6;
// ぷよぷよ風パズルゲーム
const ROWS = 12;
const CELL_SIZE = 40;
const COLORS = ['#e74c3c', '#f1c40f', '#2ecc71', '#3498db'];// 赤,黄,緑,青
const EMPTY = 0;
const FALL_SPEED = 30; // フレームごとに落下

let field = [];
let currentPair = null;
let score = 0;
let gameOver = false;
let fallCounter = 0;

const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const scoreValue = document.getElementById('score-value');
const restartBtn = document.getElementById('restart-btn');
const eventLog = document.getElementById('event-log');
let isFirstStart = true;
const startGuide = document.getElementById('start-guide');

function logEvent(msg) {
    if (eventLog) {
        eventLog.textContent += msg + ' [' + new Date().toLocaleTimeString() + ']\n';
    }
}

function initField() {
    field = Array.from({ length: ROWS }, () => Array(COLS).fill(EMPTY));
    logEvent('field[0]: ' + JSON.stringify(field[0]));
}

function randomColor() {
    return Math.floor(Math.random() * COLORS.length) + 1;
}

function spawnPair() {
    // 2つのぷよ（上・下）
    currentPair = {
        x: 2,
        y: 0,
        puyos: [randomColor(), randomColor()], // [上, 下]
        rotation: 0 // 0:縦, 1:右, 2:下, 3:左
    };
    logEvent('spawnPair: x=' + currentPair.x + ', y=' + currentPair.y + ', puyos=' + currentPair.puyos);
    const movable = canMove(currentPair, 0, 0);
    logEvent('canMove on spawn: ' + movable + ', field[0]: ' + JSON.stringify(field[0]));
    if (!movable) {
        gameOver = true;
        logEvent('gameOver set TRUE in spawnPair');
    }
}

function canMove(pair, dx, dy, rot = pair.rotation) {
    const pos = getPairPositions(pair.x + dx, pair.y + dy, rot);
    return pos.every(([y, x]) =>
        (y < 0) || (y < ROWS && x >= 0 && x < COLS && field[y][x] === EMPTY)
    );
}

function getPairPositions(x, y, rotation) {
    // 2つのぷよの座標を返す
    const positions = [[y, x]];
    switch (rotation % 4) {
        case 0: positions.push([y - 1, x]); break; // 上
        case 1: positions.push([y, x + 1]); break; // 右
        case 2: positions.push([y + 1, x]); break; // 下
        case 3: positions.push([y, x - 1]); break; // 左
    }
    return positions;
}

function fixPair() {
    const pos = getPairPositions(currentPair.x, currentPair.y, currentPair.rotation);
    pos.forEach(([y, x], i) => {
        if (y >= 0 && y < ROWS && x >= 0 && x < COLS) {
            field[y][x] = currentPair.puyos[i];
        }
    });
}

function clearChains() {
    let erased = false;
    let visited = Array.from({ length: ROWS }, () => Array(COLS).fill(false));
    for (let y = 0; y < ROWS; y++) {
        for (let x = 0; x < COLS; x++) {
            if (field[y][x] !== EMPTY && !visited[y][x]) {
                let chain = [];
                dfs(y, x, field[y][x], visited, chain);
                if (chain.length >= 4) {
                    erased = true;
                    chain.forEach(([cy, cx]) => field[cy][cx] = EMPTY);
                    score += chain.length * 10;
                }
            }
        }
    }
    return erased;
}

function dfs(y, x, color, visited, chain) {
    if (y < 0 || y >= ROWS || x < 0 || x >= COLS) return;
    if (visited[y][x] || field[y][x] !== color) return;
    visited[y][x] = true;
    chain.push([y, x]);
    dfs(y + 1, x, color, visited, chain);
    dfs(y - 1, x, color, visited, chain);
    dfs(y, x + 1, color, visited, chain);
    dfs(y, x - 1, color, visited, chain);
}

function dropFloating() {
    for (let x = 0; x < COLS; x++) {
        for (let y = ROWS - 2; y >= 0; y--) {
            if (field[y][x] !== EMPTY && field[y + 1][x] === EMPTY) {
                let ny = y;
                while (ny + 1 < ROWS && field[ny + 1][x] === EMPTY) {
                    field[ny + 1][x] = field[ny][x];
                    field[ny][x] = EMPTY;
                    ny++;
                }
            }
        }
    }
}

function update() {
    if (gameOver) return;
    fallCounter++;
    if (fallCounter >= FALL_SPEED) {
        if (canMove(currentPair, 0, 1)) {
            currentPair.y++;
        } else {
            fixPair();
            let chainOccurred = false;
            do {
                chainOccurred = clearChains();
                if (chainOccurred) dropFloating();
            } while (chainOccurred);
            spawnPair();
        }
        fallCounter = 0;
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // フィールド
    for (let y = 0; y < ROWS; y++) {
        for (let x = 0; x < COLS; x++) {
            if (field[y][x] !== EMPTY) {
                ctx.fillStyle = COLORS[field[y][x] - 1];
                ctx.beginPath();
                ctx.arc(x * CELL_SIZE + CELL_SIZE / 2, y * CELL_SIZE + CELL_SIZE / 2, CELL_SIZE / 2 - 2, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    }
    // 操作中のぷよ
    if (!gameOver && currentPair) {
        const pos = getPairPositions(currentPair.x, currentPair.y, currentPair.rotation);
        pos.forEach(([y, x], i) => {
            if (y >= 0 && y < ROWS && x >= 0 && x < COLS) {
                ctx.globalAlpha = 0.85;
                ctx.fillStyle = COLORS[currentPair.puyos[i] - 1];
                ctx.beginPath();
                ctx.arc(x * CELL_SIZE + CELL_SIZE / 2, y * CELL_SIZE + CELL_SIZE / 2, CELL_SIZE / 2 - 2, 0, Math.PI * 2);
                ctx.fill();
                ctx.globalAlpha = 1.0;
            }
        });
    }
    // ゲームオーバー
    if (gameOver) {
        ctx.fillStyle = 'rgba(0,0,0,0.6)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#fff';
        ctx.font = '32px sans-serif';
        ctx.fillText('ゲームオーバー', 30, canvas.height / 2);
    }
}

function gameLoop() {
    update();
    draw();
    scoreValue.textContent = score;
    requestAnimationFrame(gameLoop);
}

function hideStartGuide() {
    if (startGuide) startGuide.style.display = 'none';
}

document.addEventListener('keydown', e => {
    if (isFirstStart) {
        isFirstStart = false;
        hideStartGuide();
        startGame();
        draw();
        return;
    }
    logEvent('keydown: ' + e.key);
    if (gameOver) {
        if (e.key === 'r' || e.key === 'R') {
            logEvent('restart by R key');
            startGame();
            draw();
        }
        return;
    }
    let moved = false;
    if (e.key === 'ArrowLeft' && canMove(currentPair, -1, 0)) {
        currentPair.x--;
        moved = true;
    } else if (e.key === 'ArrowRight' && canMove(currentPair, 1, 0)) {
        currentPair.x++;
        moved = true;
    } else if (e.key === 'ArrowDown' && canMove(currentPair, 0, 1)) {
        currentPair.y++;
        moved = true;
    } else if (e.key === 'z' || e.key === 'Z') {
        let newRot = (currentPair.rotation + 3) % 4;
        if (canMove(currentPair, 0, 0, newRot)) {
            currentPair.rotation = newRot;
            moved = true;
        }
    } else if (e.key === 'x' || e.key === 'X') {
        let newRot = (currentPair.rotation + 1) % 4;
        if (canMove(currentPair, 0, 0, newRot)) {
            currentPair.rotation = newRot;
            moved = true;
        }
    }
    if (moved) {
        draw();
    }
});

restartBtn.addEventListener('click', () => {
    logEvent('restart button clicked');
    startGame();
    draw();
});

function startGame() {
    score = 0;
    gameOver = false;
    fallCounter = 0;
    initField();
    spawnPair();
    draw();
    if (!startGame.loopStarted) {
        startGame.loopStarted = true;
        gameLoop();
    }
}

draw();
if (startGuide) startGuide.style.display = '';
