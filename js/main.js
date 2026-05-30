// js/main.js
// Game Loop, Canvas, State, Camera, Particles, & New Mechanics

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// === HD Dynamic Resolution ===
// Resolusi internal canvas mengikuti ukuran layar
const BASE_HEIGHT = 450; // Tinggi logis dunia game
let SCALE_FACTOR = 1;

function resizeCanvas() {
    let container = document.getElementById('game-container');
    let w = container.clientWidth;
    let h = container.clientHeight;

    // Gunakan devicePixelRatio untuk HD rendering
    let dpr = window.devicePixelRatio || 1;
    // Batasi dpr agar tidak terlalu berat di layar 4K
    if (dpr > 2) dpr = 2;

    canvas.width = w * dpr;
    canvas.height = h * dpr;

    // Scale factor: berapa kali lebih besar dari base resolution
    SCALE_FACTOR = canvas.height / BASE_HEIGHT;

    // Smooth rendering (bukan pixelated)
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // Jika game di-pause (misal di settings menu), canvas perlu digambar ulang setelah resize
    if (window.gameInitialized && gameState !== 'PLAYING' && gameState !== 'MENU') {
        drawGame();
    }
}

// Helper untuk mendapatkan dimensi logis canvas (untuk kamera, culling, dll.)
function logicalWidth() { return canvas.width / SCALE_FACTOR; }
function logicalHeight() { return canvas.height / SCALE_FACTOR; }

// Resize saat pertama kali dan saat window berubah ukuran
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// === Fullscreen API ===
let btnFullscreenImg = document.getElementById('btn-fullscreen-img');
if (btnFullscreenImg) {
    btnFullscreenImg.addEventListener('click', () => {
        if (typeof audioManager !== 'undefined') audioManager.playSFX('click');
        let container = document.getElementById('game-container') || document.documentElement;

        let isFullscreen = document.fullscreenElement || document.webkitFullscreenElement || document.msFullscreenElement;

        if (!isFullscreen) {
            if (container.requestFullscreen) {
                container.requestFullscreen().catch(e => console.log(e));
            } else if (container.webkitRequestFullscreen) {
                container.webkitRequestFullscreen();
            } else if (container.msRequestFullscreen) {
                container.msRequestFullscreen();
            }
            btnFullscreenImg.classList.add('active-toggle');
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            } else if (document.msExitFullscreen) {
                document.msExitFullscreen();
            }
            btnFullscreenImg.classList.remove('active-toggle');
        }
    });
}

document.addEventListener('fullscreenchange', () => setTimeout(resizeCanvas, 100));
document.addEventListener('webkitfullscreenchange', () => setTimeout(resizeCanvas, 100));
document.addEventListener('msfullscreenchange', () => setTimeout(resizeCanvas, 100));

// Game State
let gameState = 'MENU';
let score = 0;
let keysCollected = 0;
let currentLevel = 1;
let unlockedLevels = parseInt(localStorage.getItem('skde_unlockedLevels')) || 3; // DIBUKA LEVEL 3 UNTUK TESTING

// Kamera
let camX = 0;
let camY = 0;
const LEVEL_WIDTH = 7000;
const LEVEL_HEIGHT = 1500;

// Objek Game
let player;
let images = [];
let platforms = [];
let coins = [];
let enemies = [];
let chests = [];
let portal = null;
let spikes = [];
let movingPlatforms = [];
let healthPotions = [];
let levelCompleted = false;

// Particle System
let particles = [];

// === AUDIO SYSTEM ===
const audioManager = {
    bgm1: new Audio('assets/sound/BGM_level_1.mp3'),
    bgm2: new Audio('assets/sound/BGM_level_2.mp3'),
    bgm3: new Audio('assets/sound/BGM_level_3.mp3'),
    bgm: null, // Track BGM yang sedang aktif
    click: new Audio('assets/sound/button click sound.mp3'),
    dead: new Audio('assets/sound/dead_sound.mp3'),
    coin: new Audio('assets/sound/get_coins_sound.mp3'),
    jump: new Audio('assets/sound/jump.mp3'),
    run: new Audio('assets/sound/kinght_runningsound.mp3'),
    levelComplete: new Audio('assets/sound/level complete_sound.mp3'),
    chest: new Audio('assets/sound/openchest_sound.mp3'),
    attack: new Audio('assets/sound/sword-slash.mp3'),
    isMusicOn: true,
    isSfxOn: true,

    init() {
        this.bgm = this.bgm1;
        this.bgm1.loop = true; this.bgm1.volume = 0.5;
        this.bgm2.loop = true; this.bgm2.volume = 0.5;
        this.bgm3.loop = true; this.bgm3.volume = 0.5;
        this.run.loop = true;
        this.run.volume = 0.3;

        this.coin.volume = 0.6;
        this.jump.volume = 0.4;
        this.attack.volume = 0.5;
        this.chest.volume = 0.8;
        this.dead.volume = 0.7;
        this.levelComplete.volume = 0.8;
        this.click.volume = 1.0;
    },

    playBGM() {
        if (!this.isMusicOn) return;
        if (this.bgm) this.bgm.pause();
        
        if (currentLevel === 1) this.bgm = this.bgm1;
        else if (currentLevel === 2) this.bgm = this.bgm2;
        else if (currentLevel === 3) this.bgm = this.bgm3;
        
        this.bgm.currentTime = 0;
        this.bgm.play().catch(e => console.log('BGM blocked'));
    },

    stopBGM() {
        this.bgm.pause();
        this.bgm.currentTime = 0;
    },

    toggleMusic(state) {
        this.isMusicOn = state;
        this.isSfxOn = state; // Asumsi toggle settings mematikan semua suara
        if (this.isMusicOn && gameState === 'PLAYING') {
            this.bgm.play().catch(e => { });
        } else {
            this.bgm.pause();
        }
    },

    playSFX(name) {
        if (!this.isSfxOn || !this[name]) return;
        if (name === 'coin' || name === 'jump' || name === 'attack') {
            let sound = this[name].cloneNode();
            sound.volume = this[name].volume;
            sound.play().catch(e => { });
        } else {
            this[name].currentTime = 0;
            this[name].play().catch(e => { });
        }
    },

    playRun() {
        if (this.isSfxOn && this.run.paused) {
            this.run.play().catch(e => { });
        }
    },

    stopRun() {
        if (!this.run.paused) {
            this.run.pause();
        }
    }
};
audioManager.init();

class Particle {
    constructor(x, y, vx, vy, size, color, life) {
        this.x = x; this.y = y;
        this.vx = vx; this.vy = vy;
        this.size = size; this.color = color;
        this.life = life; this.maxLife = life;
    }
    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += 0.05; // mini gravity
        this.life--;
    }
    draw(ctx, camX, camY) {
        let alpha = this.life / this.maxLife;
        ctx.globalAlpha = alpha;
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x - camX, this.y - camY, this.size, this.size);
        ctx.globalAlpha = 1;
    }
}

function spawnDust(x, y, count) {
    for (let i = 0; i < count; i++) {
        particles.push(new Particle(
            x + Math.random() * 16 - 8, y,
            (Math.random() - 0.5) * 1.5, -Math.random() * 1.2,
            2 + Math.random() * 2,
            ['#8a7a60', '#6a5a40', '#9a8a70'][Math.floor(Math.random() * 3)],
            15 + Math.random() * 15
        ));
    }
}

function spawnCoinSparkle(x, y) {
    for (let i = 0; i < 6; i++) {
        particles.push(new Particle(
            x, y,
            (Math.random() - 0.5) * 2.5, -Math.random() * 2,
            1 + Math.random() * 2,
            '#ffd700', 12 + Math.random() * 10
        ));
    }
}

// Background Image (Parallax)
const bgImage = new Image();
bgImage.src = 'assets/background/background level1.jpg';

// Referensi DOM UI
const mainMenu = document.getElementById('main-menu');
const levelSelectScreen = document.getElementById('level-select-screen');
const hud = document.getElementById('hud');
const mobileControls = document.getElementById('mobile-controls');
const endScreen = document.getElementById('end-screen');
const endTitle = document.getElementById('end-title');
const btnPlayImg = document.getElementById('btn-play-img');
const btnLevel1Img = document.getElementById('btn-level-1-img');
const btnLevel2Img = document.getElementById('btn-level-2-img'); // New Level 2 button
const btnLevel3Img = document.getElementById('btn-level-3-img'); // New Level 3 button
const btnLevelBackImg = document.getElementById('btn-level-back-img');
const btnRestart = document.getElementById('btn-restart');
const btnNextLevel = document.getElementById('btn-next-level');
const btnHome = document.getElementById('btn-home');
const scoreValue = document.getElementById('score-value');
const keysValue = document.getElementById('keys-value');
const healthFill = document.getElementById('health-fill');
const healthValue = document.getElementById('health-value');

// Referensi DOM Settings
const settingsScreen = document.getElementById('settings-screen');
const btnSettings = document.getElementById('btn-settings');
const btnResume = document.getElementById('btn-resume');
const btnToggleMusic = document.getElementById('btn-toggle-music');
const btnRestartSettings = document.getElementById('btn-restart-settings');
const btnHomeSettings = document.getElementById('btn-home-settings');

// State Musik
let isMusicOn = true;

// Event Listener Tombol Menu
btnPlayImg.addEventListener('click', () => {
    audioManager.playSFX('click');

    // Update level select UI
    if (unlockedLevels >= 2) {
        btnLevel2Img.classList.remove('disabled');
    }
    if (unlockedLevels >= 3) {
        btnLevel3Img.classList.remove('disabled');
    }

    mainMenu.classList.remove('active');
    mainMenu.classList.add('hidden');
    levelSelectScreen.classList.remove('hidden');
    levelSelectScreen.classList.add('active');
});

btnLevelBackImg.addEventListener('click', () => {
    audioManager.playSFX('click');
    levelSelectScreen.classList.remove('active');
    levelSelectScreen.classList.add('hidden');
    mainMenu.classList.remove('hidden');
    mainMenu.classList.add('active');
});

function startLoading() {
    mainMenu.classList.remove('active');
    mainMenu.classList.add('hidden');
    levelSelectScreen.classList.remove('active');
    levelSelectScreen.classList.add('hidden');
    endScreen.classList.remove('active');
    endScreen.classList.add('hidden');

    let loadingScreen = document.getElementById('loading-screen');
    let loadingFill = document.getElementById('loading-fill');
    loadingScreen.classList.remove('hidden');
    loadingScreen.classList.add('active');

    loadingFill.style.width = '0%';

    let progress = 0;
    let interval = setInterval(() => {
        progress += 15;
        loadingFill.style.width = Math.min(progress, 100) + '%';
        if (progress >= 100) {
            clearInterval(interval);
            setTimeout(() => {
                loadingScreen.classList.remove('active');
                loadingScreen.classList.add('hidden');
                startGame();
            }, 300);
        }
    }, 100);
}

btnLevel1Img.addEventListener('click', () => {
    audioManager.playSFX('click');
    currentLevel = 1;
    startLoading();
});

btnLevel2Img.addEventListener('click', () => {
    if (unlockedLevels >= 2) {
        audioManager.playSFX('click');
        currentLevel = 2;
        startLoading();
    }
});

btnLevel3Img.addEventListener('click', () => {
    if (unlockedLevels >= 3) {
        audioManager.playSFX('click');
        currentLevel = 3;
        startLoading();
    }
});

btnRestart.addEventListener('click', () => { audioManager.playSFX('click'); startLoading(); });
btnNextLevel.addEventListener('click', () => {
    audioManager.playSFX('click');
    if (currentLevel < 3) {
        currentLevel++;
        startLoading();
    }
});
btnHome.addEventListener('click', () => { audioManager.playSFX('click'); goToMenu(); });

// Event Listener Settings
btnSettings.addEventListener('click', () => {
    audioManager.playSFX('click');
    gameState = 'PAUSED';
    settingsScreen.classList.remove('hidden');
    settingsScreen.classList.add('active');
    hud.classList.add('hidden');
});

btnResume.addEventListener('click', () => {
    audioManager.playSFX('click');
    settingsScreen.classList.remove('active');
    settingsScreen.classList.add('hidden');
    hud.classList.remove('hidden');
    gameState = 'PLAYING';
    lastTime = performance.now();
    requestAnimationFrame(gameLoop);
});

btnRestartSettings.addEventListener('click', () => {
    audioManager.playSFX('click');
    settingsScreen.classList.remove('active');
    settingsScreen.classList.add('hidden');
    startGame();
});

btnHomeSettings.addEventListener('click', () => {
    audioManager.playSFX('click');
    settingsScreen.classList.remove('active');
    settingsScreen.classList.add('hidden');
    goToMenu();
});

btnToggleMusic.addEventListener('click', () => {
    audioManager.playSFX('click');
    isMusicOn = !isMusicOn;
    btnToggleMusic.innerText = isMusicOn ? 'ON' : 'OFF';
    btnToggleMusic.classList.toggle('active-toggle', isMusicOn);
    audioManager.toggleMusic(isMusicOn);
});

function goToMenu() {
    gameState = 'MENU';
    audioManager.stopBGM();
    audioManager.stopRun();

    // Update level select UI
    if (unlockedLevels >= 2) {
        btnLevel2Img.classList.remove('disabled');
    }
    if (unlockedLevels >= 3) {
        btnLevel3Img.classList.remove('disabled');
    }

    mainMenu.classList.remove('hidden');
    mainMenu.classList.add('active');
    levelSelectScreen.classList.remove('active');
    levelSelectScreen.classList.add('hidden');
    endScreen.classList.remove('active');
    endScreen.classList.add('hidden');
    hud.classList.add('hidden');
    mobileControls.classList.add('hidden');
}

function startGame() {
    gameState = 'PLAYING';
    score = 0;
    keysCollected = 0;
    camX = 0;
    camY = 0;
    levelCompleted = false;
    particles = [];

    let level;
    if (currentLevel === 1) {
        bgImage.src = 'assets/background/background level1.jpg';
        level = createLevel1();
    } else if (currentLevel === 2) {
        bgImage.src = 'assets/background/background level2.jpg';
        level = createLevel2();
    } else {
        bgImage.src = 'assets/background/background level3.jpg';
        level = createLevel3();
    }
    images = level.images;
    platforms = level.platforms;
    coins = level.coins;
    enemies = level.enemies;
    chests = level.chests;
    portal = level.portal;
    spikes = level.spikes;
    movingPlatforms = level.movingPlatforms;
    healthPotions = level.healthPotions;

    player = new Player(30, 150);

    mainMenu.classList.remove('active');
    mainMenu.classList.add('hidden');
    levelSelectScreen.classList.remove('active');
    levelSelectScreen.classList.add('hidden');
    endScreen.classList.remove('active');
    endScreen.classList.add('hidden');

    hud.classList.remove('hidden');
    mobileControls.classList.remove('hidden');

    updateHUD();

    audioManager.playBGM();

    lastTime = performance.now();
    requestAnimationFrame(gameLoop);
}

function resetLevel() {
    score = 0;
    keysCollected = 0;
    particles = [];

    let level;
    if (currentLevel === 1) {
        level = createLevel1();
    } else if (currentLevel === 2) {
        level = createLevel2();
    } else {
        level = createLevel3();
    }

    images = level.images;
    platforms = level.platforms;
    coins = level.coins;
    enemies = level.enemies;
    chests = level.chests;
    portal = level.portal;
    spikes = level.spikes;
    movingPlatforms = level.movingPlatforms;
    healthPotions = level.healthPotions;

    player.x = 30;
    player.y = 150;
    player.health = player.maxHealth;
    player.isDead = false;
    player.state = 'idle';
    player.vx = 0;
    player.vy = 0;

    updateHUD();
}

function updateHUD() {
    scoreValue.innerText = score;
    let required = (typeof portal !== 'undefined' && portal) ? portal.keysRequired : 5;
    keysValue.innerText = keysCollected + "/" + required;
    healthValue.innerText = Math.max(0, player.health);
    let healthPercent = (player.health / player.maxHealth) * 100;
    healthFill.style.width = Math.max(0, healthPercent) + "%";
}

function showEndScreen(title) {
    let stars = 0;
    if (score >= 1200) stars = 3;
    else if (score >= 600) stars = 2;
    else stars = 1;

    endTitle.innerText = title;
    let endPopupBg = document.getElementById('end-popup-bg');
    let starsContainer = document.getElementById('stars-container');
    let scoreDisplay = document.getElementById('score-display');

    if (title === 'YOU DIED') {
        // Mati: tanpa border, tanpa bintang
        starsContainer.classList.add('hidden');
        scoreDisplay.classList.add('hidden');
        endTitle.style.color = '#ff3333';
        endTitle.style.fontSize = '28px';
        endPopupBg.classList.remove('popup-border-bg');
        document.getElementById('btn-next-level').classList.add('hidden');
    } else {
        // Level Complete: pakai border, tampilkan bintang dan skor
        starsContainer.classList.remove('hidden');
        scoreDisplay.classList.remove('hidden');
        endTitle.style.color = '#ffd700';
        endTitle.style.fontSize = '18px';
        endPopupBg.classList.add('popup-border-bg');
        document.getElementById('star-1').classList.toggle('earned', stars >= 1);
        document.getElementById('star-2').classList.toggle('earned', stars >= 2);
        document.getElementById('star-3').classList.toggle('earned', stars >= 3);
        
        if (currentLevel >= 3) {
            document.getElementById('btn-next-level').classList.add('hidden');
        } else {
            document.getElementById('btn-next-level').classList.remove('hidden');
        }
    }

    document.getElementById('final-score').innerText = score;

    hud.classList.add('hidden');
    mobileControls.classList.add('hidden');
    endScreen.classList.remove('hidden');
    endScreen.classList.add('active');
}

function gameOver() {
    gameState = 'GAMEOVER';
    audioManager.stopBGM();
    audioManager.stopRun();
    audioManager.playSFX('dead');
    showEndScreen('YOU DIED');
}

function levelComplete() {
    gameState = 'LEVEL_COMPLETE';
    audioManager.stopBGM();
    audioManager.stopRun();
    audioManager.playSFX('levelComplete');

    if (currentLevel === 1 && unlockedLevels < 2) {
        unlockedLevels = 2;
        localStorage.setItem('skde_unlockedLevels', 2);
    } else if (currentLevel === 2 && unlockedLevels < 3) {
        unlockedLevels = 3;
        localStorage.setItem('skde_unlockedLevels', 3);
    }

    showEndScreen('LEVEL COMPLETE!');
}

function drawBackground() {
    if (bgImage.complete && bgImage.naturalWidth > 0) {
        // Stretch satu gambar penuh menutupi canvas tanpa potongan
        ctx.drawImage(bgImage, 0, 0, logicalWidth(), logicalHeight());
        // Dark overlay untuk kontras dengan tileset
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.fillRect(0, 0, logicalWidth(), logicalHeight());
    } else {
        // Fallback gradient
        let gradient = ctx.createLinearGradient(0, 0, 0, logicalHeight());
        gradient.addColorStop(0, '#08080d');
        gradient.addColorStop(1, '#0d0a08');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, logicalWidth(), logicalHeight());
    }
}

// Track landing for dust particles
let wasGrounded = false;

// Main Game Loop
let lastTime = 0;
let accumulator = 0;
// Menggunakan 144Hz sebagai base time step, karena nilai fisika (speed, gravity) 
// sebelumnya disetel dan terasa pas di monitor 144 FPS.
const TIME_STEP = 1000 / 144;

function gameLoop(timestamp) {
    if (gameState !== 'PLAYING') return;

    let deltaTime = timestamp - lastTime;
    lastTime = timestamp;

    if (deltaTime > 250) deltaTime = 250; // Prevent death spiral on heavy lag

    accumulator += deltaTime;

    while (accumulator >= TIME_STEP) {
        if (!input.map && !levelCompleted && !player.isDead) {
            // --- GAME UPDATE ---
            player.update(TIME_STEP);

            // Gabungkan semua platform (statis + bergerak) untuk fisika
            let allPlatforms = platforms.concat(movingPlatforms);
            applyPhysics(player, allPlatforms);

            // Dust saat mendarat
            if (player.grounded && !wasGrounded) {
                spawnDust(player.x + player.width / 2, player.y + player.height, 6);
            }
            wasGrounded = player.grounded;

            // Update Moving Platforms & carry player
            for (let mp of movingPlatforms) mp.update();
            for (let mp of movingPlatforms) {
                // Cek apakah player berdiri di atas moving platform
                if (player.grounded &&
                    player.x + player.width > mp.x &&
                    player.x < mp.x + mp.width &&
                    Math.abs((player.y + player.height) - mp.y) < 4) {
                    player.x += mp.dx;
                    player.y += mp.dy;
                }
            }

            // Update Camera
            let targetCamX = player.x - logicalWidth() / 3;
            let targetCamY = player.y - logicalHeight() / 2;

            camX += (targetCamX - camX) * 0.08;
            camY += (targetCamY - camY) * 0.08;

            // Batasan kamera agar tidak keluar batas peta. Y limit diubah agar bisa menembus batas atas jika pijakan terlalu tinggi
            camX = Math.max(0, Math.min(camX, LEVEL_WIDTH - logicalWidth()));
            camY = Math.max(-1000, Math.min(camY, LEVEL_HEIGHT - logicalHeight()));

            // Kumpulkan Koin
            for (let coin of coins) {
                if (!coin.collected && checkCollision(player, coin)) {
                    coin.collected = true;
                    score += 10;
                    audioManager.playSFX('coin');
                    spawnCoinSparkle(coin.x + 8, coin.y + 8);
                }
            }

            // Buka Chest
            for (let chest of chests) {
                if (!chest.opened && checkCollision(player, chest)) {
                    chest.opened = true;
                    audioManager.playSFX('chest');
                    if (chest.contents === 'key') {
                        keysCollected++;
                    } else if (chest.contents === 'coins') {
                        score += 50;
                    }
                    spawnCoinSparkle(chest.x + 12, chest.y);
                }
            }

            // Health Potions
            for (let hp of healthPotions) {
                if (!hp.collected && checkCollision(player, hp)) {
                    hp.collected = true;
                    player.health = Math.min(player.maxHealth, player.health + hp.healAmount);
                    // Green sparkle
                    for (let i = 0; i < 8; i++) {
                        particles.push(new Particle(
                            hp.x + 7, hp.y + 9,
                            (Math.random() - 0.5) * 2, -Math.random() * 2,
                            2, '#00ff66', 20
                        ));
                    }
                }
            }

            // Spike Traps
            for (let spike of spikes) {
                // Logic Culling: skip if too far from player
                if (Math.abs(spike.x - player.x) > 1500) continue;
                
                if (spike.cooldown > 0) { spike.cooldown--; continue; }
                if (checkCollision(player, spike)) {
                    player.takeDamage(spike.damage);
                    player.vy = -4; // Knockback ke atas dikurangi sedikit
                    player.knockbackTimer = 15; // Durasi terpelanting dikurangi
                    spike.cooldown = 60; // 1 detik cooldown
                }
            }

            // Update Musuh
            let attackBox = player.getAttackBox();
            for (let enemy of enemies) {
                // Logic Culling: skip physics and AI if too far from player
                if (Math.abs(enemy.x - player.x) > 1500) continue;

                enemy.update(TIME_STEP, player, platforms);

                if (enemy.isDead) continue;

                if (enemy.type !== 'bee') {
                    applyPhysics(enemy, platforms);
                } else {
                    enemy.x += enemy.vx; // Manual x update untuk lebah (tanpa gravitasi/fisika tanah)
                }

                if (enemy.y > LEVEL_HEIGHT) {
                    enemy.isDead = true;
                    // Tidak memberikan skor jika enemy jatuh sendiri
                    continue;
                }

                // Tabrakan dengan pemain (Hanya lebah yang damage saat disentuh)
                // Musuh darat (Boar/Snail) memberi damage lewat fungsi serangannya (attackTimer) di entities.js
                if (!player.isDead && enemy.type === 'bee' && checkCollision(player, enemy)) {
                    if (!player.isInvulnerable) {
                        player.takeDamage(enemy.damage);
                        player.vy = -3;
                        player.vx = player.x < enemy.x ? -2.5 : 2.5;
                        player.knockbackTimer = 15;
                    }
                }

                if (attackBox && !player.attackDealt && checkCollision(attackBox, enemy)) {
                    enemy.takeDamage(player.attackDamage);
                    player.attackDealt = true;
                    enemy.vy = -3;
                    enemy.vx = player.facingRight ? 5 : -5;
                    // Berikan skor saat enemy mati karena serangan player
                    if (enemy.isDead) {
                        score += enemy.pointValue;
                    }
                    // Hit sparks
                    for (let i = 0; i < 4; i++) {
                        particles.push(new Particle(
                            enemy.x + enemy.width / 2, enemy.y + enemy.height / 2,
                            (Math.random() - 0.5) * 3, -Math.random() * 2,
                            2, '#ff4444', 10
                        ));
                    }
                }
            }

            // Cek Portal (Win Condition)
            if (portal && checkCollision(player, portal)) {
                if (keysCollected >= portal.keysRequired) {
                    levelCompleted = true;
                    levelComplete();
                } else {
                    portal.showWarning = 60; // Tampilkan peringatan selama 60 frame (1 detik)
                }
            }
        } // Akhir dari logika update

        // Jatuh ke jurang
        if (player.y > LEVEL_HEIGHT) {
            player.health = 0;
        }

        if (player.health <= 0 && gameState !== 'GAMEOVER') {
            player.health = 0;
            gameOver();
        }

        // Update Particles
        for (let i = particles.length - 1; i >= 0; i--) {
            particles[i].update();
            if (particles[i].life <= 0) particles.splice(i, 1);
        }

        accumulator -= TIME_STEP;
    }

    updateHUD();

    drawGame();

    requestAnimationFrame(gameLoop);
}

function drawGame() {
    // === DRAW ===
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.scale(SCALE_FACTOR, SCALE_FACTOR);
    drawBackground();

    // Frustum Culling Bounding Box (Camera view + padding)
    let cullPadding = 300; // Ekstra 300px agar tidak ada efek pop-in
    let viewLeft = camX - cullPadding;
    let viewRight = camX + logicalWidth() + cullPadding;
    
    // Helper function for culling
    function isVisible(obj) {
        if (!obj) return false;
        let w = obj.width || (obj.radius ? obj.radius * 2 : 0) || obj.size || 50;
        return (obj.x + w >= viewLeft && obj.x <= viewRight);
    }

    // Draw Moving Platforms
    for (let mp of (typeof movingPlatforms !== 'undefined' ? movingPlatforms : [])) {
        if (isVisible(mp)) mp.draw(ctx, camX, camY);
    }

    // Draw Environment
    for (let img of (typeof images !== 'undefined' ? images : [])) {
        if (isVisible(img)) img.draw(ctx, camX, camY);
    }
    for (let p of (typeof platforms !== 'undefined' ? platforms : [])) {
        if (isVisible(p)) p.draw(ctx, camX, camY);
    }
    for (let spike of (typeof spikes !== 'undefined' ? spikes : [])) {
        if (isVisible(spike)) spike.draw(ctx, camX, camY);
    }
    for (let c of (typeof coins !== 'undefined' ? coins : [])) {
        if (isVisible(c)) c.draw(ctx, camX, camY);
    }
    for (let hp of (typeof healthPotions !== 'undefined' ? healthPotions : [])) {
        if (isVisible(hp)) hp.draw(ctx, camX, camY);
    }
    for (let ch of (typeof chests !== 'undefined' ? chests : [])) {
        if (isVisible(ch)) ch.draw(ctx, camX, camY);
    }
    if (typeof portal !== 'undefined' && portal && isVisible(portal)) portal.draw(ctx, camX, camY);

    // Draw Entities
    for (let e of (typeof enemies !== 'undefined' ? enemies : [])) {
        if (isVisible(e)) e.draw(ctx, camX, camY);
    }
    if (typeof player !== 'undefined' && player) player.draw(ctx, camX, camY);

    // Draw Particles
    for (let p of (typeof particles !== 'undefined' ? particles : [])) {
        if (isVisible(p)) p.draw(ctx, camX, camY);
    }

    if (typeof input !== 'undefined' && input && input.map) {
        drawMap(ctx);
    }

    ctx.restore(); // Kembalikan transform dari scale HD
}

// Fitur Peta (World Map)
function drawMap(ctx) {
    let lw = logicalWidth(), lh = logicalHeight();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
    ctx.fillRect(0, 0, lw, lh);

    ctx.fillStyle = '#f0f0f0';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('WORLD MAP', lw / 2, 40);
    ctx.font = '14px Arial';
    ctx.fillStyle = '#aaa';
    ctx.fillText('Press M to close', lw / 2, 65);

    let paddingX = 40, paddingY = 80;
    let mapW = lw - paddingX * 2;
    let mapH = lh - paddingY * 2;

    let scaleX = mapW / LEVEL_WIDTH;
    let scaleY = mapH / LEVEL_HEIGHT;
    let scale = Math.min(scaleX, scaleY);

    let offsetX = (lw - (LEVEL_WIDTH * scale)) / 2;
    let offsetY = (lh - (LEVEL_HEIGHT * scale)) / 2 + 20;

    // Platforms (hijau)
    ctx.fillStyle = '#556b2f';
    for (let p of platforms) {
        ctx.fillRect(offsetX + p.x * scale, offsetY + p.y * scale, Math.max(2, p.width * scale), Math.max(2, p.height * scale));
    }

    // Moving Platforms (biru)
    ctx.fillStyle = '#4488cc';
    for (let mp of movingPlatforms) {
        ctx.fillRect(offsetX + mp.x * scale, offsetY + mp.y * scale, Math.max(3, mp.width * scale), Math.max(2, mp.height * scale));
    }

    // Spikes (merah)
    ctx.fillStyle = '#cc3333';
    for (let s of spikes) {
        ctx.fillRect(offsetX + s.x * scale, offsetY + s.y * scale, Math.max(2, s.width * scale), Math.max(1, s.height * scale));
    }

    // Health Potions (hijau terang)
    ctx.fillStyle = '#00ff66';
    for (let hp of healthPotions) {
        if (!hp.collected) {
            ctx.fillRect(offsetX + hp.x * scale, offsetY + hp.y * scale, 3, 3);
        }
    }

    // Chests (kuning)
    ctx.fillStyle = 'gold';
    for (let ch of chests) {
        if (!ch.opened) {
            ctx.fillRect(offsetX + ch.x * scale, offsetY + ch.y * scale, Math.max(3, ch.width * scale), Math.max(3, ch.height * scale));
        }
    }

    // Portal (cyan neon)
    if (portal) {
        ctx.fillStyle = '#00ffff';
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#00ffff';
        ctx.fillRect(offsetX + portal.x * scale, offsetY + portal.y * scale, Math.max(4, portal.width * scale), Math.max(4, portal.height * scale));
        ctx.shadowBlur = 0;
    }

    // Player (putih berkedip)
    let time = Date.now();
    if (Math.floor(time / 400) % 2 === 0) {
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(offsetX + (player.x + player.width / 2) * scale, offsetY + (player.y + player.height / 2) * scale, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = 'cyan';
        ctx.lineWidth = 1;
        ctx.stroke();
    }

    // Legenda
    ctx.textAlign = 'left';
    ctx.font = '11px Arial';
    let lx = 40, ly = lh - 15;
    ctx.fillStyle = 'white'; ctx.fillText('⚪ You', lx, ly);
    ctx.fillStyle = 'gold'; ctx.fillText('🟨 Chest', lx + 55, ly);
    ctx.fillStyle = '#00ffff'; ctx.fillText('🟦 Portal', lx + 120, ly);
    ctx.fillStyle = '#cc3333'; ctx.fillText('🔺 Spike', lx + 190, ly);
    ctx.fillStyle = '#4488cc'; ctx.fillText('🟪 Moving', lx + 255, ly);
    ctx.fillStyle = '#00ff66'; ctx.fillText('💚 Potion', lx + 325, ly);
}

window.gameInitialized = true;

// Initial Loading Sequence
window.addEventListener('load', () => {
    let initialLoadingFill = document.getElementById('initial-loading-fill');
    let initialLoadingText = document.getElementById('initial-loading-text');
    let initialLoadingScreen = document.getElementById('initial-loading-screen');
    let theMainMenu = document.getElementById('main-menu'); // avoid conflict with global mainMenu var
    
    let progress = 0;
    let loadingInterval = setInterval(() => {
        // Simulasi progres acak agar terlihat natural
        progress += Math.floor(Math.random() * 8) + 4; 
        if (progress > 100) progress = 100;
        
        if(initialLoadingFill) initialLoadingFill.style.width = progress + '%';
        if(initialLoadingText) initialLoadingText.innerText = 'Loading Assets... ' + progress + '%';
        
        if (progress === 100) {
            clearInterval(loadingInterval);
            setTimeout(() => {
                if(initialLoadingScreen) {
                    initialLoadingScreen.classList.remove('active');
                    initialLoadingScreen.classList.add('hidden');
                }
                if(theMainMenu) {
                    theMainMenu.classList.remove('hidden');
                    theMainMenu.classList.add('active');
                }
            }, 600); // Jeda dramatis sebelum menu utama muncul
        }
    }, 150);
});
