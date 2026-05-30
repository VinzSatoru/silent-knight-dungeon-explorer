// js/environment.js
// Berisi class untuk Platform, Koin, Portal, Chest, dan Map Level

// Memuat Assets Tileset Baru
const TILE_SCALE = 0.55;
const tileImages = {};
const TILE_SOURCES = {
    1: 'assets/tileset/tile_1.png',
    2: 'assets/tileset/tile_2.png',
    3: 'assets/tileset/tile_3.png',
    4: 'assets/tileset/tile_4.png',
    5: 'assets/tileset/tile_5.png',
    6: 'assets/tileset/tile_6.png',
    7: 'assets/tileset/tile_7.png'
};
for (let key in TILE_SOURCES) {
    let img = new Image();
    img.src = TILE_SOURCES[key];
    tileImages[key] = img;
}

const tileImagesLvl2 = {};
for (let i = 1; i <= 7; i++) {
    let img = new Image();
    img.src = "assets/tileset_lvl_2/tile_" + i + ".png";
    tileImagesLvl2[i] = img;
}

class ImageDecoration {
    constructor(imgId, x, y) {
        this.imgId = imgId;
        this.x = x;
        this.y = y;
    }

    draw(ctx, camX, camY) {
        let img = tileImages[this.imgId];
        if (!img || !img.complete) return;
        let w = img.width * TILE_SCALE;
        let h = img.height * TILE_SCALE;
        let sx = this.x - camX;
        let sy = this.y - camY;
        if (sx + w < -100 || sx > logicalWidth() + 100) return;
        if (sy + h < -100 || sy > logicalHeight() + 100) return;
        ctx.drawImage(img, sx, sy, w, h);
    }
}

class ImageDecorationLvl2 {
    constructor(imgId, x, y) {
        this.imgId = imgId;
        this.x = x;
        this.y = y;
    }

    draw(ctx, camX, camY) {
        let img = tileImagesLvl2[this.imgId];
        if (!img || !img.complete) return;
        let w = img.width * TILE_SCALE;
        let h = img.height * TILE_SCALE;
        let sx = this.x - camX;
        let sy = this.y - camY;
        if (sx + w < -100 || sx > logicalWidth() + 100) return;
        if (sy + h < -100 || sy > logicalHeight() + 100) return;
        ctx.drawImage(img, sx, sy, w, h);
    }
}

class Platform {
    constructor(x, y, width, height, invisible = false, img = null) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.invisible = invisible;
        this.img = img;
    }

    draw(ctx, camX, camY) {
        if (this.invisible) return; // Tidak digambar, hanya fisika

        let sx = this.x - camX;
        let sy = this.y - camY;
        if (sx + this.width < -50 || sx > logicalWidth() + 50) return;
        if (sy + this.height < -50 || sy > logicalHeight() + 50) return;

        if (this.img && this.img.complete && this.img.naturalWidth > 0) {
            let drawH = this.height; // Sesuaikan tinggi dengan tinggi logika platform
            let drawW = (this.img.naturalWidth / this.img.naturalHeight) * drawH; // Pertahankan rasio aspek gambar

            // SAFETY CHECK MENCEGAH INFINITE LOOP
            if (drawW <= 0 || isNaN(drawW)) {
                drawW = this.width;
            }

            ctx.save();
            ctx.beginPath();
            ctx.rect(sx, sy, this.width, this.height);
            ctx.clip(); // Potong gambar yang melewati batas lebar platform

            // Gambar berulang-ulang ke kanan agar tidak melar
            for (let dx = 0; dx < this.width; dx += drawW) {
                ctx.drawImage(this.img, sx + dx, sy, drawW, drawH);
            }

            ctx.restore();
        } else {
            // Fallback drawing if needed
            ctx.fillStyle = '#2b1c10';
            ctx.fillRect(sx, sy + 8, this.width, this.height - 8);
            ctx.fillStyle = '#3a661a';
            ctx.fillRect(sx, sy, this.width, 10);
        }
    }
}

class PlatformLvl3 extends Platform {
    constructor(x, y, width, height, invisible = false) {
        super(x, y, width, height, invisible, null);
        // Menghasilkan retakan acak (organik) sekali saat platform dibuat
        this.cracks = [];
        let numCracks = Math.max(1, Math.floor(width / 35));
        for (let i = 0; i <= numCracks; i++) {
            let startX = (width / Math.max(1, numCracks)) * i + (Math.random() * 20 - 10);
            let crack = [{ x: startX, y: 0 }];
            let curX = startX;
            let curY = 0;
            while (curY < height) {
                curY += Math.random() * 15 + 10;
                curX += Math.random() * 25 - 12.5; // Menyebar kiri kanan (zigzag natural)
                crack.push({ x: curX, y: curY });
            }
            this.cracks.push(crack);
        }
    }

    draw(ctx, camX, camY) {
        if (this.invisible) return;
        let sx = this.x - camX, sy = this.y - camY;
        if (sx + this.width < -50 || sx > logicalWidth() + 50) return;
        if (sy + this.height < -50 || sy > logicalHeight() + 50) return;

        // Base dark purple obsidian color
        ctx.fillStyle = '#0f0514';
        ctx.fillRect(sx, sy, this.width, this.height);

        // Dynamic glow animation based on time and position
        let time = performance.now() * 0.0025; // kecepatan denyut
        // Offset gelombang berdasarkan posisi X agar tidak berdenyut serentak
        let glowIntensity = (Math.sin(time + this.x * 0.02) + 1) / 2; // Nilai 0 hingga 1

        ctx.save();
        // Batasi gambar hanya di dalam area balok ini (Clip)
        ctx.beginPath();
        ctx.rect(sx, sy, this.width, this.height);
        ctx.clip();

        // Gambar retakan organik menyala
        ctx.strokeStyle = `rgba(180, 0, 255, ${0.3 + glowIntensity * 0.7})`;
        ctx.lineWidth = 1.5 + glowIntensity;
        ctx.shadowBlur = 5 + glowIntensity * 12;
        ctx.shadowColor = '#d800ff';

        for (let crack of this.cracks) {
            ctx.beginPath();
            ctx.moveTo(sx + crack[0].x, sy + crack[0].y);
            for (let j = 1; j < crack.length; j++) {
                ctx.lineTo(sx + crack[j].x, sy + crack[j].y);
            }
            ctx.stroke();
        }

        ctx.restore(); // Hapus bayangan/glow agar tidak mempengaruhi sisi lainnya

        // Garis atas api ungu
        ctx.fillStyle = `rgba(138, 43, 226, ${0.7 + glowIntensity * 0.3})`;
        ctx.fillRect(sx, sy, this.width, 3);

        // Gradasi bayangan gelap di bagian bawah untuk kedalaman 3D
        let gradient = ctx.createLinearGradient(0, sy + this.height - 25, 0, sy + this.height);
        gradient.addColorStop(0, 'rgba(0,0,0,0)');
        gradient.addColorStop(1, 'rgba(0,0,0,0.85)');
        ctx.fillStyle = gradient;
        ctx.fillRect(sx, sy + this.height - 25, this.width, 25);
    }
}

class CrumblingPlatform extends PlatformLvl3 {
    constructor(x, y, width, height) {
        super(x, y, width, height, false);
        this.originalY = y;
        this.isCrumbling = false;
        this.crumbleTimer = 0;
        this.isDestroyed = false;
        this.respawnTimer = 0;
    }

    update(player, deltaTime) {
        if (this.isDestroyed) {
            this.respawnTimer += deltaTime;
            if (this.respawnTimer >= 3000) { // Respawn after 3 seconds
                this.isDestroyed = false;
                this.isCrumbling = false;
                this.crumbleTimer = 0;
                this.y = this.originalY;
                this.invisible = false;
            }
            return;
        }

        if (this.isCrumbling) {
            this.crumbleTimer += deltaTime;
            // Shake effect
            if (this.crumbleTimer < 1000) {
                this.y = this.originalY + (Math.random() * 4 - 2);
            } else {
                // Destroy
                this.isDestroyed = true;
                this.invisible = true; // No physics
                this.respawnTimer = 0;
                if (typeof audioManager !== 'undefined') audioManager.playSFX('break'); // assuming you have a sound, or just rely on visual
            }
        } else {
            // Check if player is standing on it
            if (player.grounded &&
                player.x + player.width > this.x &&
                player.x < this.x + this.width &&
                Math.abs((player.y + player.height) - this.y) < 4) {
                this.isCrumbling = true;
            }
        }
    }

    draw(ctx, camX, camY) {
        if (this.isDestroyed) return;
        super.draw(ctx, camX, camY);
        if (this.isCrumbling) {
            // Draw warning purple overlay
            let sx = this.x - camX, sy = this.y - camY;
            ctx.fillStyle = `rgba(180, 0, 255, ${(this.crumbleTimer / 1000) * 0.6})`;
            ctx.fillRect(sx, sy, this.width, this.height);
        }
    }
}

class Coin {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 16;
        this.height = 16;
        this.collected = false;
        this.value = 25;
        this.bobTimer = Math.random() * Math.PI * 2;
    }

    draw(ctx, camX, camY) {
        if (this.collected) return;
        let sx = this.x - camX;
        let sy = this.y - camY;
        if (sx + this.width < -20 || sx > logicalWidth() + 20) return;
        if (sy + this.height < -20 || sy > logicalHeight() + 20) return;

        this.bobTimer += 0.04;
        let bobY = sy + Math.sin(this.bobTimer) * 2;

        ctx.fillStyle = '#c8960c';
        ctx.beginPath();
        ctx.arc(sx + this.width / 2, bobY + this.height / 2, this.width / 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffd700';
        ctx.beginPath();
        ctx.arc(sx + this.width / 2 - 1, bobY + this.height / 2 - 1, this.width / 2 - 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.beginPath();
        ctx.arc(sx + this.width / 2 - 3, bobY + this.height / 2 - 3, 2, 0, Math.PI * 2);
        ctx.fill();
    }
}

class Chest {
    constructor(x, y, contents = 'coins') {
        this.x = x;
        this.y = y;
        this.width = 24;
        this.height = 20;
        this.opened = false;
        this.contents = contents;
        this.coinValue = 100;
        this.glowTimer = 0;
    }

    draw(ctx, camX, camY) {
        let sx = this.x - camX;
        let sy = this.y - camY;
        if (sx + this.width < -20 || sx > logicalWidth() + 20) return;
        if (sy + this.height < -20 || sy > logicalHeight() + 20) return;

        this.glowTimer += 0.03;

        if (!this.opened) {
            let glow = Math.abs(Math.sin(this.glowTimer));
            ctx.fillStyle = `rgba(255, 215, 0, ${0.1 + glow * 0.15})`;
            ctx.fillRect(sx - 3, sy + this.height - 2, this.width + 6, 5);

            ctx.fillStyle = '#6a3810';
            ctx.fillRect(sx, sy + 6, this.width, this.height - 6);
            ctx.fillStyle = '#4a2808';
            ctx.fillRect(sx, sy, this.width, 8);
            ctx.fillStyle = '#5a3010';
            ctx.beginPath();
            ctx.ellipse(sx + this.width / 2, sy + 4, this.width / 2, 5, 0, Math.PI, 0);
            ctx.fill();
            ctx.fillStyle = this.contents === 'key' ? '#ffd700' : '#c0c0c0';
            ctx.fillRect(sx + this.width / 2 - 3, sy + 5, 6, 6);
            ctx.fillStyle = '#333';
            ctx.fillRect(sx + this.width / 2 - 1, sy + 7, 2, 3);
            ctx.strokeStyle = '#8B7355';
            ctx.lineWidth = 1;
            ctx.strokeRect(sx, sy + 6, this.width, this.height - 6);
        } else {
            ctx.fillStyle = '#4a2808';
            ctx.fillRect(sx, sy + 8, this.width, this.height - 8);
            ctx.fillStyle = '#5a3010';
            ctx.fillRect(sx, sy - 2, this.width, 6);
            ctx.fillStyle = '#2a1808';
            ctx.fillRect(sx + 2, sy + 10, this.width - 4, this.height - 12);
        }
    }
}

class Portal {
    constructor(x, y, keysRequired = 5) {
        this.x = x;
        this.y = y;
        this.width = 40;
        this.height = 60;
        this.glowTimer = 0;
        this.keysRequired = keysRequired; // Minimal kunci untuk tamat
        this.showWarning = 0; // Timer untuk notifikasi peringatan
    }

    draw(ctx, camX, camY) {
        let sx = this.x - camX;
        let sy = this.y - camY;
        if (sx + this.width < -20 || sx > logicalWidth() + 20) return;
        if (sy + this.height < -20 || sy > logicalHeight() + 20) return;

        this.glowTimer += 0.03;
        let glow = Math.abs(Math.sin(this.glowTimer));

        ctx.shadowBlur = 15 + glow * 10;
        ctx.shadowColor = 'rgba(255, 215, 0, 0.5)';

        ctx.fillStyle = '#333';
        ctx.beginPath();
        ctx.roundRect(sx - 4, sy - 4, this.width + 8, this.height + 8, 10);
        ctx.fill();

        ctx.fillStyle = '#555';
        ctx.beginPath();
        ctx.roundRect(sx, sy, this.width, this.height, 8);
        ctx.fill();

        ctx.fillStyle = `rgba(255, 215, 0, ${0.5 + glow * 0.5})`;
        ctx.beginPath();
        ctx.roundRect(sx + 5, sy + 5, this.width - 10, this.height - 10, 5);
        ctx.fill();

        ctx.shadowBlur = 0;

        // Draw Warning Notification
        if (this.showWarning > 0) {
            this.showWarning--;
            ctx.fillStyle = 'white';
            ctx.font = '10px "Press Start 2P", monospace';
            ctx.textAlign = 'center';
            // Background teks agar mudah dibaca
            ctx.fillStyle = 'rgba(0,0,0,0.7)';
            ctx.fillRect(sx + this.width / 2 - 80, sy - 35, 160, 20);

            ctx.fillStyle = '#ff4444';
            ctx.fillText("NOT ENOUGH KEYS!", sx + this.width / 2, sy - 22);
            ctx.textAlign = 'left'; // Reset
        }
    }
}

const spikeImgLvl2 = new Image();
spikeImgLvl2.src = 'assets/tileset_lvl_2/spike_lvl2.png';

// =============== SPIKE TRAP ===============
class SpikeTrap {
    constructor(x, y, width = 60) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = 16;
        this.damage = 200;
        this.cooldown = 0;
    }
    draw(ctx, camX, camY) {
        let sx = this.x - camX, sy = this.y - camY;
        if (sx + this.width < -20 || sx > logicalWidth() + 20) return;

        if (typeof currentLevel !== 'undefined' && currentLevel === 2 && spikeImgLvl2.complete && spikeImgLvl2.naturalWidth > 0) {
            let spikeW = spikeImgLvl2.naturalWidth * 0.5;
            let spikeH = spikeImgLvl2.naturalHeight * 0.5;
            ctx.save();
            ctx.beginPath();
            ctx.rect(sx, sy, this.width, this.height);
            ctx.clip();
            for (let dx = 0; dx < this.width; dx += spikeW) {
                ctx.drawImage(spikeImgLvl2, sx + dx, sy + this.height - spikeH, spikeW, spikeH);
            }
            ctx.restore();
            return;
        } else if (typeof currentLevel !== 'undefined' && currentLevel === 3) {
            // Level 3: Purple Fire Spikes
            let time = performance.now() * 0.005;
            let spikesCount = Math.floor(this.width / 15);
            ctx.save();
            ctx.shadowBlur = 10;
            ctx.shadowColor = '#d800ff';
            for (let i = 0; i < spikesCount; i++) {
                let bx = sx + i * 15 + 7.5; // center of flame
                let heightVariance = Math.sin(time + i) * 6;
                let flameHeight = this.height + heightVariance + 4;

                // Outer flame
                ctx.fillStyle = 'rgba(138, 43, 226, 0.9)'; // Purple
                ctx.beginPath();
                ctx.moveTo(bx - 6, sy + this.height);
                ctx.quadraticCurveTo(bx - 3, sy + this.height - flameHeight / 2, bx, sy - heightVariance);
                ctx.quadraticCurveTo(bx + 3, sy + this.height - flameHeight / 2, bx + 6, sy + this.height);
                ctx.fill();

                // Inner core
                ctx.fillStyle = '#ff66ff'; // Bright pink/purple
                ctx.beginPath();
                ctx.moveTo(bx - 3, sy + this.height);
                ctx.quadraticCurveTo(bx - 1.5, sy + this.height - flameHeight / 3, bx, sy + this.height - flameHeight / 1.5);
                ctx.quadraticCurveTo(bx + 1.5, sy + this.height - flameHeight / 3, bx + 3, sy + this.height);
                ctx.fill();
            }
            ctx.restore();
            return;
        }

        let spikes = Math.floor(this.width / 12);
        for (let i = 0; i < spikes; i++) {
            let bx = sx + i * 12;
            ctx.fillStyle = '#8a2020';
            ctx.beginPath();
            ctx.moveTo(bx, sy + this.height);
            ctx.lineTo(bx + 6, sy);
            ctx.lineTo(bx + 12, sy + this.height);
            ctx.fill();
            ctx.fillStyle = '#cc3333';
            ctx.beginPath();
            ctx.moveTo(bx + 2, sy + this.height);
            ctx.lineTo(bx + 6, sy + 4);
            ctx.lineTo(bx + 10, sy + this.height);
            ctx.fill();
        }
    }
}

const movingPlatformLvl2 = new Image();
movingPlatformLvl2.src = 'assets/tileset_lvl_2/moving_platform_lvl2.png';

// =============== MOVING PLATFORM ===============
class MovingPlatform {
    constructor(x, y, width, height, rangeX, rangeY, speed = 0.5) {
        this.x = x; this.y = y;
        this.startX = x; this.startY = y;
        this.width = width; this.height = height;
        this.rangeX = rangeX; this.rangeY = rangeY;
        this.speed = speed; this.timer = 0;
        this.invisible = false;
        this.dx = 0; this.dy = 0; // Delta movement per frame
    }
    update() {
        let prevX = this.x, prevY = this.y;
        this.timer += this.speed * 0.02;
        this.x = this.startX + Math.sin(this.timer) * this.rangeX;
        this.y = this.startY + Math.sin(this.timer * 0.7) * this.rangeY;
        this.dx = this.x - prevX;
        this.dy = this.y - prevY;
    }
    draw(ctx, camX, camY) {
        let sx = this.x - camX, sy = this.y - camY;
        if (sx + this.width < -50 || sx > logicalWidth() + 50) return;

        if (typeof currentLevel !== 'undefined' && currentLevel === 2 && movingPlatformLvl2.complete && movingPlatformLvl2.naturalWidth > 0) {
            ctx.drawImage(movingPlatformLvl2, sx, sy, this.width, this.height);
        } else if (typeof currentLevel !== 'undefined' && currentLevel === 3) {
            ctx.fillStyle = '#110022';
            ctx.fillRect(sx, sy, this.width, this.height);
            ctx.fillStyle = '#8a2be2';
            ctx.fillRect(sx, sy, this.width, 6);
            ctx.fillStyle = '#4b0082';
            ctx.fillRect(sx + 4, sy + 8, this.width - 8, this.height - 10);
        } else {
            ctx.fillStyle = '#4a6a4a';
            ctx.fillRect(sx, sy, this.width, this.height);
            ctx.fillStyle = '#6a9a5a';
            ctx.fillRect(sx, sy, this.width, 6);
            ctx.fillStyle = '#3a5a3a';
            ctx.fillRect(sx + 4, sy + 8, this.width - 8, this.height - 10);
        }
        // Chain lines
        ctx.strokeStyle = 'rgba(150,150,100,0.4)';
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.moveTo(sx + this.width / 2, sy);
        ctx.lineTo(sx + this.width / 2, sy - 30);
        ctx.stroke();
        ctx.setLineDash([]);
    }
}

// =============== HEALTH POTION ===============
class HealthPotion {
    constructor(x, y) {
        this.x = x; this.y = y;
        this.width = 14; this.height = 18;
        this.collected = false;
        this.healAmount = 250;
        this.glowTimer = Math.random() * Math.PI * 2;
    }
    draw(ctx, camX, camY) {
        if (this.collected) return;
        let sx = this.x - camX, sy = this.y - camY;
        if (sx + this.width < -20 || sx > logicalWidth() + 20) return;
        this.glowTimer += 0.05;
        let glow = Math.abs(Math.sin(this.glowTimer));
        ctx.shadowBlur = 6 + glow * 6;
        ctx.shadowColor = 'rgba(0, 255, 100, 0.6)';
        // Bottle body
        ctx.fillStyle = '#2a6a3a';
        ctx.beginPath();
        ctx.roundRect(sx + 2, sy + 6, 10, 12, 3);
        ctx.fill();
        // Liquid
        ctx.fillStyle = `rgba(0, 220, 80, ${0.6 + glow * 0.4})`;
        ctx.fillRect(sx + 3, sy + 10, 8, 7);
        // Neck
        ctx.fillStyle = '#3a3a3a';
        ctx.fillRect(sx + 4, sy + 2, 6, 5);
        // Cork
        ctx.fillStyle = '#8B6914';
        ctx.fillRect(sx + 5, sy, 4, 3);
        ctx.shadowBlur = 0;
    }
}

// =============== LEVEL DESIGN ===============
function createLevel1() {
    let images = [];
    let platforms = [];
    let coins = [];
    let enemies = [];
    let chests = [];
    let spikes = [];
    let movingPlatforms = [];
    let healthPotions = [];

    function addTile(id, x, y) {
        images.push(new ImageDecoration(id, x, y));
        if (id === 1) {
            platforms.push(new Platform(x, y + 10, 210, 20, true));
            platforms.push(new Platform(x, y + 30, 50, 122, true));
            platforms.push(new Platform(x, y + 124, 255, 30, true));
        } else if (id === 2) {
            platforms.push(new Platform(x + 5, y + 7, 45, 91, true));
        } else if (id === 3) {
            platforms.push(new Platform(x, y + 90, 160, 60, true));
            platforms.push(new Platform(x + 160, y + 13, 65, 138, true));
        } else if (id === 4) {
            platforms.push(new Platform(x + 5, y + 11, 125, 58, true));
        } else if (id === 5) {
            platforms.push(new Platform(x + 5, y + 10, 58, 128, true));
            platforms.push(new Platform(x + 63, y + 81, 155, 65, true));
        } else if (id === 6) {
            platforms.push(new Platform(x + 5, y + 7, 255, 61, true));
        } else if (id === 7) {
            platforms.push(new Platform(x + 5, y + 10, 90, 86, true));
        }
    }

    // ==========================================
    // ZONA 1: THE ANCIENT RUINS
    // ==========================================
    addTile(1, 0, 200);           // Top y=210, Bot y=324, Right x=210
    addTile(2, 320, 260);         // Pillar Top y=267, Right x=370 (Drop 57, Gap 110)
    addTile(3, 470, 250);         // L-low Left y=340, Right y=263, Right x=695 (Drop 73)
    addTile(4, 800, 250);         // 2-block Top y=261, Right x=930 (Flat, Gap 105)
    addTile(6, 1030, 250);        // 4-block Top y=257, Right x=1290 (Flat, Gap 100)
    // Gap 1290 -> 1450. Height 257 -> 160. Need Elevator MP.
    addTile(5, 1450, 150);        // L-high Left y=160, Right y=231, Right x=1668

    // ==========================================
    // ZONA 2: THE DEEP ABYSS
    // ==========================================
    addTile(7, 1760, 200);        // Float Top y=210, Right x=1855 (UP 21, Gap 92)
    addTile(7, 2000, 350);        // Float Top y=360, Right x=2095 (Drop 150)
    addTile(4, 2200, 500);        // 2-block Top y=511, Right x=2330 (Drop 151)
    addTile(6, 2400, 650);        // 4-block Top y=657, Right x=2660 (Abyss 1)
    // Gap 2660 -> 3050. Need Flat MP.
    addTile(6, 3050, 650);        // 4-block Top y=657, Right x=3310 (Abyss 2)
    addTile(2, 3380, 570);        // Pillar Top y=577, Right x=3430 (UP 80)
    addTile(3, 3530, 430);        // L-low Left y=520, Right y=443, Right x=3755 (UP 57)

    // ==========================================
    // ZONA 3: THE SKY BRIDGE
    // ==========================================
    // Gap 3755 -> 4050. Need Elevator MP.
    addTile(6, 4050, 300);        // 4-block Top y=307, Right x=4310
    addTile(7, 4430, 300);        // Float Top y=310, Right x=4520 (Gap 120)
    // Gap 4520 -> 4750. Need Flat MP.
    addTile(4, 4750, 300);        // 2-block Top y=311, Right x=4880
    // Gap 4880 -> 5100. Need Elevator MP.
    addTile(5, 5100, 200);        // L-high Left y=210, Right y=281, Right x=5318
    addTile(6, 5350, 200);        // Portal Platform Top y=207, Right x=5610 (UP 74)

    // --- COINS ---
    // Zona 1
    coins.push(new Coin(40, 185), new Coin(60, 185), new Coin(80, 185), new Coin(100, 185), new Coin(120, 185)); // Start
    coins.push(new Coin(235, 160), new Coin(250, 160), new Coin(265, 180), new Coin(285, 180)); // Arc to pillar
    coins.push(new Coin(320, 240), new Coin(340, 240), new Coin(360, 240)); // On pillar
    coins.push(new Coin(385, 210), new Coin(400, 210), new Coin(420, 240), new Coin(440, 240)); // Arc to L-low
    coins.push(new Coin(470, 315), new Coin(490, 315), new Coin(510, 315), new Coin(530, 315)); // On L-low
    coins.push(new Coin(705, 180), new Coin(725, 180), new Coin(745, 180), new Coin(765, 180)); // Arc to 2-block
    coins.push(new Coin(940, 180), new Coin(960, 180), new Coin(980, 180), new Coin(1000, 180)); // Arc to 4-block
    coins.push(new Coin(1080, 230), new Coin(1100, 230), new Coin(1125, 230), new Coin(1150, 230), new Coin(1175, 230), new Coin(1200, 230)); // On 4-block
    coins.push(new Coin(1325, 140), new Coin(1350, 140), new Coin(1375, 100), new Coin(1400, 100)); // Arc above elevator MP

    // Zona 2
    coins.push(new Coin(1525, 205), new Coin(1550, 205), new Coin(1575, 205), new Coin(1600, 205)); // L-high right floor
    coins.push(new Coin(1670, 140), new Coin(1700, 140), new Coin(1730, 140)); // Arc to float
    coins.push(new Coin(1780, 185), new Coin(1805, 185), new Coin(1830, 185)); // On float 1
    coins.push(new Coin(1880, 180), new Coin(1900, 180), new Coin(1925, 230), new Coin(1950, 230)); // Drop to float 2
    coins.push(new Coin(2020, 335), new Coin(2045, 335), new Coin(2070, 335)); // On float 2
    coins.push(new Coin(2110, 360), new Coin(2130, 360), new Coin(2150, 420), new Coin(2170, 420)); // Drop to 2-block
    coins.push(new Coin(2240, 485), new Coin(2260, 485), new Coin(2280, 485)); // On 2-block
    coins.push(new Coin(2340, 500), new Coin(2360, 500)); // Drop to abyss
    coins.push(new Coin(2540, 630), new Coin(2580, 630), new Coin(2620, 630)); // Abyss 1 safe zone
    coins.push(new Coin(2780, 580), new Coin(2820, 580), new Coin(2860, 580)); // Over MP bridge
    coins.push(new Coin(3040, 630), new Coin(3080, 630), new Coin(3120, 630)); // Abyss 2 safe zone
    coins.push(new Coin(3320, 530), new Coin(3350, 530), new Coin(3380, 530)); // Jump to pillar
    coins.push(new Coin(3450, 480), new Coin(3470, 480)); // Jump to L-low
    coins.push(new Coin(3520, 495), new Coin(3550, 495), new Coin(3580, 495)); // On L-low

    // Zona 3
    coins.push(new Coin(3870, 360), new Coin(3900, 360), new Coin(3930, 360)); // On elevator MP 1
    coins.push(new Coin(4060, 280), new Coin(4100, 280), new Coin(4150, 280), new Coin(4200, 280)); // 4-block
    coins.push(new Coin(4320, 240), new Coin(4350, 240), new Coin(4380, 240)); // Arc to float
    coins.push(new Coin(4450, 285), new Coin(4475, 285), new Coin(4500, 285)); // On float
    coins.push(new Coin(4600, 250), new Coin(4630, 250), new Coin(4660, 250)); // Over MP bridge
    coins.push(new Coin(4780, 285), new Coin(4810, 285), new Coin(4840, 285)); // On 2-block
    coins.push(new Coin(4950, 240), new Coin(4980, 240), new Coin(5010, 240)); // On elevator MP 2
    coins.push(new Coin(5100, 185), new Coin(5130, 185), new Coin(5160, 185)); // On L-high wall
    coins.push(new Coin(5180, 255), new Coin(5200, 255), new Coin(5225, 255), new Coin(5250, 255)); // On L-high right floor
    coins.push(new Coin(5375, 150), new Coin(5400, 150), new Coin(5425, 150), new Coin(5450, 150), new Coin(5475, 150)); // To Portal

    // --- CHESTS ---
    chests.push(new Chest(150, 185, 'coins'));
    chests.push(new Chest(640, 238, 'coins')); // L-low right wall
    chests.push(new Chest(1250, 232, 'key'));  // Key 1: End of 4-block Z1
    chests.push(new Chest(1620, 206, 'key'));  // Key 2: End of L-high Z1 (Diubah dari coins)
    chests.push(new Chest(2600, 632, 'key'));  // Key 3: Abyss 1 safe zone
    chests.push(new Chest(4250, 282, 'key'));  // Key 4: Sky bridge 4-block (Diubah dari coins)
    chests.push(new Chest(5500, 182, 'key'));  // Key 5: Next to portal

    // --- ENEMIES ---
    enemies.push(new Enemy(150, 210, 'snail')); // Snail di start
    enemies.push(new Enemy(500, 315, 'snail'));
    // enemies.push(new Enemy(800, 150, 'bee'));   // Dihapus agar tidak terlalu sulit di awal
    enemies.push(new Enemy(1150, 235, 'boar'));
    enemies.push(new Enemy(1600, 210, 'snail'));
    // enemies.push(new Enemy(1800, 100, 'bee'));  // Dihapus
    enemies.push(new Enemy(2020, 360, 'snail')); // Snail di Float 2
    // enemies.push(new Enemy(2500, 450, 'bee'));  // Dihapus
    enemies.push(new Enemy(3200, 450, 'bee'));   // Hanya sisa 1 Bee terbang di area Abyss 2 (sebagai perkenalan mekanik)
    enemies.push(new Enemy(3650, 445, 'boar'));  // Boar di Z2 akhir
    enemies.push(new Enemy(4200, 285, 'boar'));
    // enemies.push(new Enemy(4600, 150, 'bee'));  // Dihapus
    enemies.push(new Enemy(5250, 260, 'snail'));

    // --- SPIKE TRAPS (Placed fairly with ample landing room) ---
    // Z1: On 2-block (x=805..930). Spike at 850 (width 36).
    spikes.push(new SpikeTrap(850, 245, 36));
    // Z2: Abyss Floor 1 (x=2405..2660). Spike at 2500 (width 48). Landing zone 2405..2500 is safe.
    spikes.push(new SpikeTrap(2500, 641, 48));
    // Z2: Abyss Floor 2 (x=3005..3310). Spike at 3170 (width 48).
    spikes.push(new SpikeTrap(3170, 641, 48));
    // Z3: 2-block (x=4750..4880). Spike at 4810 (width 36).
    spikes.push(new SpikeTrap(4810, 295, 36));

    // --- MOVING PLATFORMS ---
    // Z1: Elevate to L-high
    movingPlatforms.push(new MovingPlatform(1330, 250, 80, 16, 50, -50, 0.5));

    // Z2: Elevator back from Float 2 to 2-block
    movingPlatforms.push(new MovingPlatform(2100, 435, 80, 16, 0, 75, 0.4));
    // Z2: Elevator back from Abyss 1 to 2-block
    movingPlatforms.push(new MovingPlatform(2335, 584, 80, 16, 0, 73, 0.4));

    // Z2: Flat bridge between Abyss 1 and 2
    movingPlatforms.push(new MovingPlatform(2800, 657, 100, 16, 80, 0, 0.4));
    // Z3: Elevate to Sky Bridge 4-block
    movingPlatforms.push(new MovingPlatform(3850, 430, 80, 16, 50, -80, 0.5));
    // Z3: Flat bridge between Float and 2-block
    movingPlatforms.push(new MovingPlatform(4580, 311, 70, 16, 40, 0, 0.4));
    // Z3: Elevate to L-high
    movingPlatforms.push(new MovingPlatform(4950, 310, 80, 16, 60, -50, 0.5));

    // --- HEALTH POTIONS ---
    healthPotions.push(new HealthPotion(100, 300)); // Hidden under start
    healthPotions.push(new HealthPotion(3280, 640)); // End of Abyss 2
    healthPotions.push(new HealthPotion(5280, 260)); // L-high right floor

    let portal = new Portal(5550, 140);

    return {
        images,
        platforms,
        coins,
        enemies,
        chests,
        portal,
        spikes,
        movingPlatforms,
        healthPotions
    };
}


function createLevel2() {
    let images = [];
    let platforms = [];
    let coins = [];
    let enemies = [];
    let chests = [];
    let spikes = [];
    let movingPlatforms = [];
    let healthPotions = [];

    function addTile(id, x, y) {
        images.push(new ImageDecorationLvl2(id, x, y));
        if (id === 1) {
            platforms.push(new Platform(x + 7, y + 20, 201, 20, true)); // Top platform
            platforms.push(new Platform(x + 46, y + 40, 40, 77, true)); // Left wall
            platforms.push(new Platform(x + 46, y + 117, 216, 40, true)); // Bottom platform (y=117 matches visual)
        } else if (id === 2) {
            platforms.push(new Platform(x + 10, y + 8, 48, 96, true));
        } else if (id === 3) {
            platforms.push(new Platform(x + 20, y + 93, 148, 65, true));
            platforms.push(new Platform(x + 170, y + 12, 47, 146, true));
        } else if (id === 4) {
            platforms.push(new Platform(x + 9, y + 13, 136, 55, true));
        } else if (id === 5) {
            platforms.push(new Platform(x + 20, y + 12, 48, 146, true));
            platforms.push(new Platform(x + 69, y + 93, 148, 65, true));
        } else if (id === 6) {
            platforms.push(new Platform(x + 13, y + 20, 245, 70, true));
        } else if (id === 7) {
            platforms.push(new Platform(x + 9, y + 9, 82, 92, true));
        }
    }

    // ==========================================
    // ZONA 1: PILLAR HOPS
    // ==========================================
    addTile(1, 0, 200);
    addTile(2, 340, 230);
    addTile(2, 480, 230);
    addTile(4, 650, 230);

    // ==========================================
    // ZONA 2: DESCENT & HORIZONTAL GAP
    // ==========================================
    addTile(3, 870, 250);
    addTile(6, 1120, 280);
    addTile(7, 1480, 280);
    addTile(7, 1680, 350);

    movingPlatforms.push(new MovingPlatform(1930, 370, 80, 16, 130, 0, 0.5));

    addTile(4, 2150, 350);
    addTile(5, 2400, 280);

    // ==========================================
    // ZONA 3: THE SPIKED ABYSS
    // ==========================================
    addTile(6, 2720, 400);
    addTile(2, 3100, 370);
    addTile(6, 3260, 400);

    movingPlatforms.push(new MovingPlatform(3580, 335, 80, 16, 0, 85, 0.5));

    // ==========================================
    // ZONA 3B: THE FROZEN DEPTHS
    // ==========================================
    addTile(4, 3680, 530);
    addTile(7, 3930, 530);
    addTile(6, 4120, 530);

    movingPlatforms.push(new MovingPlatform(4450, 400, 80, 16, 0, 150, 0.5));

    // ==========================================
    // ZONA 4: ASCENSION TO SKY BRIDGE
    // ==========================================
    addTile(7, 3680, 210);
    addTile(5, 3880, 150);

    movingPlatforms.push(new MovingPlatform(4180, 185, 80, 16, 0, 55, 0.5));

    // ==========================================
    // ZONA 4B: THE DEEP ABYSS
    // ==========================================
    addTile(4, 4550, 530);
    addTile(6, 4780, 530);
    addTile(7, 5140, 530);

    movingPlatforms.push(new MovingPlatform(5240, 335, 80, 16, 0, 215, 0.5));

    // ==========================================
    // ZONA 5: FINAL DESCENT
    // ==========================================
    addTile(6, 4270, 100);
    addTile(4, 4640, 250);
    addTile(1, 4890, 350);

    // --- SPIKE TRAPS ---
    spikes.push(new SpikeTrap(700, 227, 24));    // Z1: tile_4 top y=243
    spikes.push(new SpikeTrap(1220, 284, 48));   // Z2: tile_6 top y=300
    spikes.push(new SpikeTrap(2840, 404, 48));   // Z3: tile_6 top y=420
    spikes.push(new SpikeTrap(3380, 404, 48));   // Z3: tile_6 top y=420
    spikes.push(new SpikeTrap(4220, 534, 36));   // Z3B: tile_6 top y=550

    // --- ENEMIES ---
    // Z1 (tile_1 bottom platform y=317)
    enemies.push(new EnemyLvl2(120, 250, "ice_slime"));
    // Main path
    enemies.push(new EnemyLvl2(700, 200, "anomaly"));     // Z1: tile_4
    enemies.push(new EnemyLvl2(920, 300, "ice_slime"));   // Z2: tile_3
    enemies.push(new EnemyLvl2(1270, 260, "anomaly"));    // Z2: tile_6
    enemies.push(new EnemyLvl2(2200, 320, "ice_slime"));  // Z2: tile_4
    enemies.push(new EnemyLvl2(2520, 330, "anomaly"));    // Z2: tile_5
    enemies.push(new EnemyLvl2(2870, 380, "ice_slime"));  // Z3: tile_6
    enemies.push(new EnemyLvl2(3400, 380, "anomaly"));    // Z3: tile_6
    // Frozen Depths (Z3B)
    enemies.push(new EnemyLvl2(3730, 500, "ice_slime"));  // Z3B: tile_4
    enemies.push(new EnemyLvl2(4250, 510, "anomaly"));    // Z3B: tile_6
    // Sky Bridge (Z4)
    enemies.push(new EnemyLvl2(3950, 200, "ice_slime"));  // Z4: tile_5
    enemies.push(new EnemyLvl2(4360, 80, "anomaly"));     // Z5: tile_6
    // Deep Abyss (Z4B)
    enemies.push(new EnemyLvl2(4830, 510, "anomaly"));    // Z4B: tile_6
    // Final (Z5)
    enemies.push(new EnemyLvl2(4690, 220, "anomaly"));    // Z5: tile_4

    // --- CHESTS ---
    chests.push(new Chest(100, 200, 'coins'));    // Z1: tile_1 
    chests.push(new Chest(1300, 280, 'coins'));   // Z2: tile_6 
    chests.push(new Chest(1510, 269, 'key'));     // Z2: tile_7 KEY 1
    chests.push(new Chest(2520, 353, 'key'));     // Z2: tile_5 KEY 2
    chests.push(new Chest(3115, 358, 'key'));     // Z3: tile_2 KEY 3
    chests.push(new Chest(3960, 519, 'key'));     // Z3B: tile_7 KEY 4
    chests.push(new Chest(4280, 530, 'key'));     // Z3B: tile_6 KEY 5
    chests.push(new Chest(4980, 530, 'key'));     // Z4B: tile_6 KEY 6

    // --- COINS ---
    // Z1
    coins.push(new Coin(40, 194), new Coin(60, 194), new Coin(80, 194), new Coin(100, 194), new Coin(120, 194));
    coins.push(new Coin(270, 160), new Coin(290, 140), new Coin(310, 140));
    coins.push(new Coin(420, 160), new Coin(440, 140), new Coin(460, 140));
    coins.push(new Coin(690, 170), new Coin(710, 150), new Coin(730, 170));
    // Z2
    coins.push(new Coin(900, 310), new Coin(920, 310), new Coin(940, 310), new Coin(960, 310));
    coins.push(new Coin(1170, 260), new Coin(1190, 250), new Coin(1210, 260));
    coins.push(new Coin(1400, 220), new Coin(1425, 200), new Coin(1450, 220));
    coins.push(new Coin(1600, 270), new Coin(1620, 250), new Coin(1640, 250));
    coins.push(new Coin(1700, 310), new Coin(1720, 310));
    // MP bridge
    coins.push(new Coin(1880, 340), new Coin(1930, 340), new Coin(1980, 340), new Coin(2030, 340));
    // Z3
    coins.push(new Coin(2790, 380), new Coin(2820, 380), new Coin(2890, 380));
    coins.push(new Coin(3140, 340), new Coin(3170, 330), new Coin(3200, 340), new Coin(3230, 350));
    // Z3B
    coins.push(new Coin(3700, 510), new Coin(3720, 510), new Coin(3750, 510));
    coins.push(new Coin(3950, 510), new Coin(3980, 510));
    coins.push(new Coin(4160, 510), new Coin(4190, 510), new Coin(4220, 510));
    coins.push(new Coin(4470, 450), new Coin(4470, 380), new Coin(4470, 310));
    // Z4
    coins.push(new Coin(3600, 350), new Coin(3600, 310), new Coin(3600, 270));
    coins.push(new Coin(3740, 160), new Coin(3770, 140), new Coin(3800, 140));
    coins.push(new Coin(4200, 200), new Coin(4200, 170), new Coin(4200, 140));
    // Z4B
    coins.push(new Coin(4580, 510), new Coin(4610, 510));
    coins.push(new Coin(4810, 510), new Coin(4840, 510), new Coin(4870, 510));
    coins.push(new Coin(5260, 450), new Coin(5260, 350), new Coin(5260, 250));
    // Z5
    coins.push(new Coin(4300, 80), new Coin(4330, 80), new Coin(4400, 80), new Coin(4430, 80), new Coin(4480, 80), new Coin(4510, 80));
    coins.push(new Coin(4560, 170), new Coin(4580, 190), new Coin(4600, 210), new Coin(4620, 230));

    // --- HEALTH POTIONS ---
    // Added more potions after anomaly mob encounters
    healthPotions.push(new HealthPotion(770, 200));  // Z1 end
    healthPotions.push(new HealthPotion(1350, 275)); // Z2 after first anomaly
    healthPotions.push(new HealthPotion(2580, 275)); // Z2 after second anomaly
    healthPotions.push(new HealthPotion(2920, 395)); // Z3 start safe zone
    healthPotions.push(new HealthPotion(3490, 395)); // Z3 after anomaly
    healthPotions.push(new HealthPotion(4100, 510)); // Z3B Frozen Depths
    healthPotions.push(new HealthPotion(4350, 510)); // Z3B after anomaly
    healthPotions.push(new HealthPotion(4500, 80));  // Z5 top bridge
    healthPotions.push(new HealthPotion(4980, 510)); // Z4B after anomaly
    healthPotions.push(new HealthPotion(4760, 220)); // Z5 mid descent

    let portal = new Portal(5300, 270, 6);

    return {
        images,
        platforms,
        coins,
        enemies,
        chests,
        portal,
        spikes,
        movingPlatforms,
        healthPotions
    };
}

function createLevel3() {
    let images = [];
    let platforms = [];
    let coins = [];
    let enemies = [];
    let chests = [];
    let spikes = [];
    let movingPlatforms = [];
    let healthPotions = [];

    const addPlat = (x, y, w, h) => platforms.push(new PlatformLvl3(x, y, w, h));
    const addCrumble = (x, y, w, h) => platforms.push(new CrumblingPlatform(x, y, w, h));

    // ==========================================
    // 1. THE CALDERA EDGE (X: 0 - 1500)
    // ==========================================
    addPlat(0, 300, 300, 1200);
    addPlat(400, 350, 100, 40);
    addCrumble(600, 400, 100, 40);
    addPlat(800, 400, 200, 1100);

    enemies.push(new EnemyLvl3(850, 360, 'ice_slime'));
    chests.push(new Chest(900, 382, 'key')); // KEY 1

    addPlat(1100, 450, 400, 1050);
    healthPotions.push(new HealthPotion(1250, 420));

    // Elevator memisahkan rute (naik ke Upper Path)
    // Rute bawah bisa dicapai dengan melompat turun ke X: 1550, Y: 700
    movingPlatforms.push(new MovingPlatform(1520, 300, 100, 16, 0, 150, 0.5));

    // ==========================================
    // 2. UPPER PATH: THE ASHEN PEAKS (X: 1600 - 4500)
    // ==========================================
    addPlat(1650, 150, 200, 40);
    addCrumble(1920, 150, 80, 40);
    addCrumble(2080, 200, 80, 40);
    addPlat(2240, 200, 300, 40);

    enemies.push(new EnemyLvl3(2300, 160, 'ice_slime'));
    chests.push(new Chest(2400, 182, 'key')); // KEY 2

    // Moving Platform Horizontal
    movingPlatforms.push(new MovingPlatform(2610, 200, 100, 16, 120, 0, 0.4));

    addCrumble(2900, 200, 100, 40);
    addPlat(3060, 150, 400, 40);

    chests.push(new Chest(3150, 132, 'key')); // KEY 3
    healthPotions.push(new HealthPotion(3250, 120));

    addCrumble(3530, 150, 80, 40);
    addCrumble(3700, 250, 80, 40);
    addPlat(3880, 300, 300, 40);

    enemies.push(new EnemyLvl3(3950, 260, 'ice_slime'));
    chests.push(new Chest(4050, 282, 'key')); // KEY 4

    // ==========================================
    // 3. LOWER PATH: THE MAGMA CORE (X: 1600 - 4500)
    // ==========================================
    addPlat(1550, 700, 250, 800);
    enemies.push(new EnemyLvl3(1650, 630, 'anomaly'));
    healthPotions.push(new HealthPotion(1750, 670)); // Potion setelah Anomaly

    movingPlatforms.push(new MovingPlatform(1850, 750, 100, 16, 100, 0, 0.5));

    addPlat(2050, 750, 300, 750);
    enemies.push(new EnemyLvl3(2150, 710, 'ice_slime'));
    chests.push(new Chest(2200, 732, 'key')); // KEY 5

    addPlat(2450, 850, 100, 40);
    addPlat(2650, 850, 100, 40);
    addPlat(2850, 800, 300, 700);

    spikes.push(new SpikeTrap(2900, 784, 90));
    enemies.push(new EnemyLvl3(3050, 730, 'anomaly'));
    healthPotions.push(new HealthPotion(3120, 770)); // Potion setelah Anomaly

    movingPlatforms.push(new MovingPlatform(3200, 800, 100, 16, 100, 0, 0.5));

    addPlat(3400, 750, 250, 750);
    chests.push(new Chest(3500, 732, 'key')); // KEY 6
    healthPotions.push(new HealthPotion(3600, 720));

    addCrumble(3750, 750, 100, 40);
    addCrumble(3950, 700, 100, 40);
    addPlat(4150, 650, 250, 850);

    enemies.push(new EnemyLvl3(4250, 610, 'ice_slime'));

    // Elevator untuk menyusul Upper Path (turun ke bawah)
    // Tambahkan pijakan kecil sebagai batu loncatan agar pemain bisa menggapai elevator
    addPlat(4300, 350, 60, 40);
    movingPlatforms.push(new MovingPlatform(4450, 500, 100, 16, 0, 150, 0.5));

    // ==========================================
    // 4. THE GREAT ASCENT & MEETING POINT (X: 4500 - 5200)
    // ==========================================
    // Pertemuan rute atas dan bawah
    addPlat(4600, 350, 200, 1150);

    addCrumble(4850, 350, 80, 40);
    addCrumble(5000, 300, 80, 40);
    addCrumble(5150, 250, 80, 40);

    // ==========================================
    // 5. THE ALTAR OF FIRE (X: 5300 - 6500) (REDESIGNED GAUNTLET)
    // ==========================================
    // Pintu masuk altar (Aman)
    addPlat(5300, 250, 150, 1250);
    healthPotions.push(new HealthPotion(5400, 220));

    // Area 1: Lompatan Duri Panjang
    addPlat(5520, 250, 250, 40);
    spikes.push(new SpikeTrap(5550, 246, 100)); // Pemain harus melompati duri 100px
    enemies.push(new EnemyLvl3(5680, 210, 'ice_slime')); 

    // Area 2: Pijakan Runtuh ke Atas
    addCrumble(5820, 200, 60, 40);
    addCrumble(5920, 150, 60, 40);
    chests.push(new Chest(5920, 128, 'key')); // KEY 7 berada di pijakan runtuh!

    // Area 3: Lorong Sempit Berduri
    addPlat(6030, 250, 250, 40);
    spikes.push(new SpikeTrap(6070, 246, 50));
    spikes.push(new SpikeTrap(6180, 246, 50));
    enemies.push(new EnemyLvl3(6130, 190, 'anomaly')); // Anomaly berpatroli di antara duri
    healthPotions.push(new HealthPotion(6250, 220)); // Potion setelah Anomaly

    // Portal Area (Final Guard)
    addPlat(6350, 250, 300, 1250);
    enemies.push(new EnemyLvl3(6420, 190, 'anomaly')); // Penjaga portal terakhir
    healthPotions.push(new HealthPotion(6470, 220)); // Potion bonus depan portal
    let portal = new Portal(6500, 170, 7);

    // --- COINS (Total 50 = 500 Poin) ---
    // Start area (10 coins)
    for (let i = 0; i < 5; i++) {
        coins.push(new Coin(100 + i * 40, 250));
        coins.push(new Coin(1200 + i * 40, 400));
    }
    // Upper path (15 coins)
    for (let i = 0; i < 5; i++) {
        coins.push(new Coin(1700 + i * 40, 100));
        coins.push(new Coin(3300 + i * 40, 100));
        coins.push(new Coin(4200 + i * 40, 250));
    }
    // Lower path (15 coins)
    for (let i = 0; i < 5; i++) {
        coins.push(new Coin(1600 + i * 40, 650));
        coins.push(new Coin(2100 + i * 40, 700));
        coins.push(new Coin(3450 + i * 40, 700));
    }
    // Meeting & Final (10 coins)
    for (let i = 0; i < 5; i++) {
        coins.push(new Coin(4600 + i * 40, 300));
        coins.push(new Coin(5600 + i * 40, 150));
    }

    // Fallback bounds
    platforms.push(new Platform(-50, -1000, 50, 2500, true)); // Kiri
    platforms.push(new Platform(7000, -1000, 50, 2500, true)); // Kanan

    return {
        images,
        platforms,
        coins,
        enemies,
        chests,
        portal,
        spikes,
        movingPlatforms,
        healthPotions
    };
}
