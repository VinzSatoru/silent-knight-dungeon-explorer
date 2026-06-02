// js/entities.js

// Konstanta Ukuran Frame
// speed = jumlah tick sebelum ganti frame (makin besar = makin lambat)
const SPRITE_DATA = {
    idle: { src: 'assets/knight_idle_new.png', frames: 4, width: 441, height: 574, speed: 16 },
    run: { src: 'assets/knight_run_new.png', frames: 7, width: 222, height: 247, speed: 8 },
    jump: { src: 'assets/knight_jump_new.png', frames: 4, width: 360, height: 500, speed: 9 },
    attack: { src: 'assets/knight_attack_new.png', frames: 5, width: 328, height: 300, speed: 14 },
    dead: { src: 'assets/knight_dead.png', frames: 4, width: 600, height: 600, speed: 20 }
};

const ENEMY_SPRITES = {
    boar: { src: 'assets/Mob/Boar/Walk/Walk-Base-Sheet.png', frames: 6, width: 48, height: 32 },
    snail: { src: 'assets/Mob/Snail/walk-Sheet.png', frames: 8, width: 48, height: 32 },
    bee: { src: 'assets/Mob/Small Bee/Fly/Fly-Sheet.png', frames: 4, width: 64, height: 64 }
};

let loadedEnemySprites = {};
for (let key in ENEMY_SPRITES) {
    let img = new Image();
    img.src = ENEMY_SPRITES[key].src;
    loadedEnemySprites[key] = img;
}

const ENEMY_LVL2_SPRITES = {
    ice_slime: {
        idle: ['assets/mobs_lvl_2/ice_slime/ice_slime_idle/iceslimeidle_1.png', 'assets/mobs_lvl_2/ice_slime/ice_slime_idle/iceslimeidle_2.png', 'assets/mobs_lvl_2/ice_slime/ice_slime_idle/iceslimeidle_3.png'],
        run: ['assets/mobs_lvl_2/ice_slime/ice_slime_run/iceslimerun_1.png', 'assets/mobs_lvl_2/ice_slime/ice_slime_run/iceslimerun_2.png', 'assets/mobs_lvl_2/ice_slime/ice_slime_run/iceslimerun_3.png']
    },
    anomaly: {
        idle: ['assets/mobs_lvl_2/anomaly/anomaly idle_1.png', 'assets/mobs_lvl_2/anomaly/anomaly idle_2.png', 'assets/mobs_lvl_2/anomaly/anomaly idle_3.png'],
        run: ['assets/mobs_lvl_2/anomaly/anomaly idle_1.png', 'assets/mobs_lvl_2/anomaly/anomaly idle_2.png', 'assets/mobs_lvl_2/anomaly/anomaly idle_3.png']
    }
};

let loadedLvl2Sprites = {};
for (let key in ENEMY_LVL2_SPRITES) {
    loadedLvl2Sprites[key] = { idle: [], run: [] };
    for (let path of ENEMY_LVL2_SPRITES[key].idle) {
        let img = new Image();
        img.src = path;
        loadedLvl2Sprites[key].idle.push(img);
    }
    for (let path of ENEMY_LVL2_SPRITES[key].run) {
        let img = new Image();
        img.src = path;
        loadedLvl2Sprites[key].run.push(img);
    }
}

class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;

        // Logical Hitbox (diperkecil lagi agar lebih proporsional)
        this.width = 18;
        this.height = 36;

        this.vx = 0;
        this.vy = 0;
        this.speed = 1.2; // Kecepatan lari di darat (diperlambat sedikit)
        this.jumpStrength = -4.4; // Lompatan disesuaikan dengan gravitasi baru agar tinggi max sama
        this.grounded = false;
        this.doubleJumps = 1;
        this.wasUpPressed = false;

        // Stats
        this.maxHealth = 1000;
        this.health = 1000;
        this.isDead = false;
        this.isInvulnerable = false;
        this.invulnerableTimer = 0;
        this.knockbackTimer = 0;

        // Animation State
        this.state = 'idle';
        this.facingRight = true;
        this.frameX = 0;
        this.frameTimer = 0;

        // Attack Data
        this.isAttacking = false;
        this.attackDealt = false;
        this.attackDamage = 50;

        // Load Images
        this.images = {};
        for (let key in SPRITE_DATA) {
            let img = new Image();
            img.src = SPRITE_DATA[key].src;
            this.images[key] = img;
        }
    }

    getAttackBox() {
        if (!this.isAttacking) return null;
        let attackWidth = 45; // Increased range
        let attackX = this.facingRight ? this.x + this.width : this.x - attackWidth;
        return {
            x: attackX,
            y: this.y + 10,
            width: attackWidth,
            height: 40
        };
    }

    update(deltaTime) {
        if (this.isDead) {
            this.updateAnimation();
            return;
        }

        // Invulnerability & Knockback
        if (this.isInvulnerable) {
            this.invulnerableTimer++;
            if (this.invulnerableTimer > 45) {
                this.isInvulnerable = false;
                this.invulnerableTimer = 0;
            }
        }
        if (this.knockbackTimer > 0) {
            this.knockbackTimer--;
        }

        // Movement & Animation
        if (this.isAttacking) {
            this.state = 'attack';
            this.vx = 0;
        } else if (this.knockbackTimer > 0) {
            // Sedang terpelanting, jangan override vx dengan input
            this.state = 'jump';
        } else {
            // Tambahan kecepatan (Air Dash/Boost) sebesar 60% saat di udara agar lompatan jauh
            let currentSpeed = this.grounded ? this.speed : this.speed * 1.4;

            if (input.left) {
                this.vx = -currentSpeed;
                this.facingRight = false;
                this.state = 'run';
            } else if (input.right) {
                this.vx = currentSpeed;
                this.facingRight = true;
                this.state = 'run';
            } else {
                this.vx = 0;
                this.state = 'idle';
            }

            let upPressed = input.up;

            if (upPressed && !this.wasUpPressed) {
                if (this.grounded) {
                    this.vy = this.jumpStrength;
                    this.grounded = false;
                    if (typeof audioManager !== 'undefined') audioManager.playSFX('jump');
                }
            }
            this.wasUpPressed = upPressed;

            if (!this.grounded) {
                this.state = 'jump';
            }
        }

        // Attack Trigger
        if (input.attack && !this.isAttacking && this.grounded) {
            this.isAttacking = true;
            this.frameX = 0;
            this.frameTimer = 0;
            this.attackDealt = false; // Reset attack
            if (typeof audioManager !== 'undefined') audioManager.playSFX('attack');
        }

        // Run audio hook
        if (this.state === 'run' && this.grounded && !this.isAttacking) {
            if (typeof audioManager !== 'undefined') audioManager.playRun();
        } else {
            if (typeof audioManager !== 'undefined') audioManager.stopRun();
        }

        this.updateAnimation();
    }

    updateAnimation() {
        let currentAnim = SPRITE_DATA[this.state];
        this.frameTimer++;

        if (this.frameTimer >= currentAnim.speed) {
            this.frameTimer = 0;
            this.frameX++;

            if (this.frameX >= currentAnim.frames) {
                if (this.state === 'attack') {
                    this.isAttacking = false;
                    this.frameX = 0;
                    this.state = 'idle';
                } else if (this.state === 'dead') {
                    this.frameX = currentAnim.frames - 1;
                } else {
                    this.frameX = 0;
                }
            }
        }
    }

    draw(ctx, camX, camY) {
        if (this.isInvulnerable && this.invulnerableTimer % 6 < 3) {
            return; // Efek berkedip
        }

        let currentAnim = SPRITE_DATA[this.state];
        let img = this.images[this.state];

        if (!img || !img.complete) return;

        ctx.save();

        let targetHeight = 42;
        let scale = targetHeight / currentAnim.height;
        let targetWidth = currentAnim.width * scale;

        let screenX = this.x - camX;
        let screenY = this.y - camY;
        let drawX = screenX + (this.width / 2) - (targetWidth / 2);
        let drawY = (screenY + this.height) - targetHeight;

        if (!this.facingRight) {
            ctx.translate(screenX + this.width / 2, 0);
            ctx.scale(-1, 1);
            drawX = -(targetWidth / 2);
        }

        ctx.drawImage(
            img,
            this.frameX * currentAnim.width, 0, currentAnim.width, currentAnim.height,
            drawX, drawY, targetWidth, targetHeight
        );

        ctx.restore();
    }

    takeDamage(amount) {
        if (!this.isInvulnerable && !this.isDead) {
            // Mekanik Parry: Kurangi damage 50% jika sedang menyerang
            if (this.isAttacking) {
                amount = Math.floor(amount * 0.5);
            }
            this.health -= amount;
            this.isInvulnerable = true;
            this.invulnerableTimer = 0;
            if (this.health <= 0) {
                this.health = 0;
            }
        }
    }
}

class Enemy {
    constructor(x, y, type = 'snail') {
        this.x = x;
        this.y = y;
        this.type = type;
        this.width = type === 'boar' ? 35 : (type === 'bee' ? 30 : 25);
        this.height = type === 'boar' ? 28 : (type === 'bee' ? 30 : 22);
        this.vx = 0;
        this.vy = 0;
        this.speed = type === 'boar' ? 1.2 : (type === 'bee' ? 1.5 : 0.6);
        this.maxHealth = type === 'boar' ? 150 : 100;
        this.health = this.maxHealth;
        this.damage = type === 'boar' ? 75 : (type === 'bee' ? 40 : 50);
        this.pointValue = type === 'bee' ? 30 : 50;
        this.state = 'patrol';
        this.visionRange = 250;
        this.grounded = false;
        this.patrolDir = 1; // 1 (right) or -1 (left)
        this.isDead = false;
        this.deathTimer = 0;

        this.startX = x;
        this.patrolDist = type === 'bee' ? 150 : 100;

        // Untuk lebah terbang
        if (type === 'bee') {
            this.baseY = y;
            this.flyAngle = Math.random() * Math.PI * 2;
        }

        // Animasi berjalan
        this.walkFrame = 0;
        this.walkTimer = 0;
    }

    takeDamage(amount) {
        if (this.isDead) return;
        this.health -= amount;
        if (this.health <= 0) {
            this.health = 0;
            this.isDead = true;
        }
    }

    update(deltaTime, player, platforms) {
        if (this.isDead) {
            this.deathTimer++;
            return;
        }

        // Animasi jalan
        this.walkTimer++;
        let animSpeed = this.type === 'boar' ? 8 : (this.type === 'bee' ? 5 : 12);
        if (this.walkTimer > animSpeed) {
            this.walkTimer = 0;
            let totalFrames = ENEMY_SPRITES[this.type].frames;
            this.walkFrame = (this.walkFrame + 1) % totalFrames;
        }

        if (this.type === 'bee') {
            // Bee flight logic (Sine wave motion)
            this.flyAngle += 0.05;
            this.y = this.baseY + Math.sin(this.flyAngle) * 30; // Melayang naik turun 30px
            this.state = 'patrol'; // Lebah hanya berpatroli (tidak mengejar)
        } else {
            let dist = Math.abs(this.x - player.x);
            let distY = Math.abs(this.y - player.y);

            if (dist < 35 && distY < 40 && !player.isDead) {
                this.state = 'attack';
            } else if (dist < this.visionRange && distY < 100 && !player.isDead) {
                this.state = 'chase';
            } else {
                this.state = 'patrol';
            }
        }

        if (this.state === 'patrol') {
            this.vx = this.speed * 0.4 * this.patrolDir;
            if (this.x > this.startX + this.patrolDist) this.patrolDir = -1;
            if (this.x < this.startX - this.patrolDist) this.patrolDir = 1;
            this.attackTimer = 0;
        } else if (this.state === 'chase') {
            this.attackTimer = 0;
            if (player.x > this.x) {
                this.vx = this.speed * 0.65; // Kecepatan mengejar diperlambat
                this.patrolDir = 1;
            } else {
                this.vx = -this.speed * 0.65;
                this.patrolDir = -1;
            }
        } else if (this.state === 'attack') {
            this.vx = 0; // Berhenti saat akan menyerang
            this.patrolDir = player.x > this.x ? 1 : -1;

            if (this.attackTimer === undefined) this.attackTimer = 0;
            this.attackTimer++;

            // Jika sudah "nge-cast" selama 40 frame, serang
            if (this.attackTimer > 40) {
                this.attackTimer = 0;
                let finalDist = Math.abs(this.x - player.x);
                let finalDistY = Math.abs(this.y - player.y);

                // Pastikan player belum kabur
                if (finalDist < 45 && finalDistY < 40 && !player.isDead && !player.isInvulnerable) {
                    player.takeDamage(this.damage);
                    player.vy = -3;
                    player.vx = player.x < this.x ? -2.5 : 2.5;
                    player.knockbackTimer = 15;
                }
            }
        }

        // === EDGE DETECTION ===
        // Hanya untuk musuh darat (Boar, Snail)
        if (this.type !== 'bee' && this.grounded && platforms) {
            let checkX = this.vx > 0
                ? this.x + this.width + 2
                : this.x - 2;
            let checkY = this.y + this.height + 4;

            let hasFloor = false;
            for (let p of platforms) {
                if (checkX >= p.x && checkX <= p.x + p.width &&
                    checkY >= p.y && checkY <= p.y + p.height) {
                    hasFloor = true;
                    break;
                }
            }

            if (!hasFloor) {
                this.patrolDir *= -1;
                this.vx = 0;
            }
        }
    }

    draw(ctx, camX, camY) {
        if (this.isDead) {
            if (this.deathTimer < 30) {
                // Efek hilang saat mati
                ctx.globalAlpha = 1 - (this.deathTimer / 30);
                this._drawBody(ctx, camX, camY);
                ctx.globalAlpha = 1;
            }
            return;
        }

        this._drawBody(ctx, camX, camY);
    }

    _drawBody(ctx, camX, camY) {
        let sx = this.x - camX;
        let sy = this.y - camY;

        let spriteInfo = ENEMY_SPRITES[this.type];
        let img = loadedEnemySprites[this.type];

        if (img && img.complete) {
            ctx.save();

            let targetHeight = this.height;
            let targetWidth = spriteInfo.width * (this.height / spriteInfo.height);
            let drawY = sy;

            // Sesuaikan skala spesifik per musuh
            if (this.type === 'bee') {
                targetHeight = spriteInfo.height * 0.55;
                targetWidth = spriteInfo.width * 0.55;
                drawY = sy - 8;
            } else if (this.type === 'boar') {
                targetHeight = spriteInfo.height;
                targetWidth = spriteInfo.width;
                drawY = sy - 4;
            } else if (this.type === 'snail') {
                targetHeight = spriteInfo.height * 0.9;
                targetWidth = spriteInfo.width * 0.9;
                drawY = sy;
            }

            let drawX = sx + (this.width / 2) - (targetWidth / 2);

            // Flip gambar jika patrolDir = 1 (ke kanan), karena sprite asli menghadap kiri
            if (this.patrolDir === 1) {
                ctx.translate(sx + this.width / 2, 0);
                ctx.scale(-1, 1);
                drawX = -(targetWidth / 2);
            }

            ctx.drawImage(
                img,
                this.walkFrame * spriteInfo.width, 0, spriteInfo.width, spriteInfo.height,
                drawX, drawY, targetWidth, targetHeight
            );

            ctx.restore();
        } else {
            // Fallback (jika gambar belum loading)
            ctx.fillStyle = this.type === 'bee' ? 'yellow' : (this.type === 'boar' ? 'brown' : 'orange');
            ctx.fillRect(sx, sy, this.width, this.height);
        }

        // Health bar di atas musuh (kecuali lebah)
        if (this.health < this.maxHealth && this.type !== 'bee') {
            ctx.fillStyle = '#333';
            ctx.fillRect(sx, sy - 12, this.width, 6);
            ctx.fillStyle = this.health > this.maxHealth * 0.3 ? '#4caf50' : '#f44336';
            let hpPercent = this.health / this.maxHealth;
            ctx.fillRect(sx + 1, sy - 11, (this.width - 2) * hpPercent, 4);
        }
    }
}

class EnemyLvl2 extends Enemy {
    constructor(x, y, type = 'ice_slime') {
        super(x, y, type);
        this.width = type === 'ice_slime' ? 25 : 30; // Reduced Ice Slime size
        this.height = type === 'ice_slime' ? 18 : 35; // Reduced Ice Slime size
        this.speed = type === 'ice_slime' ? 0.8 : 0.8; // Reduced anomaly speed
        this.maxHealth = type === 'ice_slime' ? 120 : 200;
        this.health = this.maxHealth;
        this.damage = type === 'ice_slime' ? 50 : 80;
        this.pointValue = type === 'ice_slime' ? 60 : 80;
    }

    update(deltaTime, player, platforms) {
        if (this.isDead) {
            this.deathTimer++;
            return;
        }

        this.walkTimer++;
        let animSpeed = 10;
        let animState = (this.state === 'patrol' || this.state === 'attack' || this.state === 'chase') && this.vx !== 0 ? 'run' : 'idle';
        let framesArr = loadedLvl2Sprites[this.type][animState];
        let totalFrames = framesArr.length;

        if (this.walkTimer > animSpeed) {
            this.walkTimer = 0;
            this.walkFrame = (this.walkFrame + 1) % totalFrames;
        }

        let dist = Math.abs(this.x - player.x);
        let distY = Math.abs(this.y - player.y);

        if (dist < 35 && distY < 40 && !player.isDead) {
            this.state = 'attack';
        } else if (dist < this.visionRange && distY < 100 && !player.isDead) {
            this.state = 'chase';
        } else {
            this.state = 'patrol';
        }

        if (this.state === 'attack') {
            this.vx = 0;
            if (this.walkFrame === 1 && this.walkTimer === 1) {
                player.takeDamage(this.damage);
            }
        } else if (this.state === 'chase') {
            this.vx = (player.x > this.x) ? this.speed : -this.speed;
            this.patrolDir = (player.x > this.x) ? 1 : -1;
        } else if (this.state === 'patrol') {
            this.vx = this.speed * this.patrolDir;
            if (Math.abs(this.x - this.startX) > this.patrolDist) {
                this.patrolDir *= -1;
                this.startX = this.x;
            }
        }

        // === EDGE DETECTION ===
        if (this.grounded && platforms) {
            let checkX = this.vx > 0 ? this.x + this.width + 2 : this.x - 2;
            let checkY = this.y + this.height + 4;
            let hasFloor = false;
            for (let p of platforms) {
                if (checkX >= p.x && checkX <= p.x + p.width &&
                    checkY >= p.y && checkY <= p.y + p.height) {
                    hasFloor = true;
                    break;
                }
            }
            if (!hasFloor) {
                this.patrolDir *= -1;
                this.vx = 0;
                if (this.state === 'chase') {
                    this.state = 'patrol';
                    this.startX = this.x;
                }
            }
        }

        // Boids Separation: Mencegah monster saling menumpuk menjadi satu
        if (typeof enemies !== 'undefined') {
            for (let other of enemies) {
                if (other !== this && other.type === this.type && !other.isDead) {
                    if (Math.abs(this.x - other.x) < 20 && Math.abs(this.y - other.y) < 20) {
                        this.x += (this.x > other.x ? 1 : -1) * 0.5;
                    }
                }
            }
        }
    }

    draw(ctx, camX, camY) {
        if (this.isDead) {
            ctx.globalAlpha = Math.max(0, 1 - (this.deathTimer / 30));
        }

        let animState = (this.state === 'patrol' || this.state === 'attack' || this.state === 'chase') && this.vx !== 0 ? 'run' : 'idle';

        let framesArr = loadedLvl2Sprites[this.type][animState];
        if (this.walkFrame >= framesArr.length) {
            this.walkFrame = 0;
        }
        let img = framesArr[this.walkFrame];

        let scale = 1.6;
        let targetHeight = this.height * scale;
        let targetWidth = this.width * scale;

        if (img && img.complete && img.naturalWidth > 0) {
            let aspect = img.naturalWidth / img.naturalHeight;
            targetWidth = targetHeight * aspect;
        }

        ctx.save();

        let screenX = this.x - camX;
        let screenY = this.y - camY;

        let drawX = screenX + (this.width / 2) - (targetWidth / 2);
        let drawY = (screenY + this.height) - targetHeight;

        // Koreksi posisi gambar jika terdapat banyak ruang transparan di bawah kaki monster
        if (this.type === 'anomaly') {
            drawY += 15;
        }

        let facingRight = (this.patrolDir === 1);
        if (!facingRight) {
            ctx.translate(screenX + this.width / 2, 0);
            ctx.scale(-1, 1);
            drawX = -(targetWidth / 2);
        }

        if (img && img.complete && img.naturalWidth > 0) {
            ctx.drawImage(img, drawX, drawY, targetWidth, targetHeight);
        } else {
            ctx.fillStyle = 'red';
            ctx.fillRect(drawX, drawY, targetWidth, targetHeight);
        }

        ctx.restore();

        if (!this.isDead && this.health < this.maxHealth) {
            let hpRatio = this.health / this.maxHealth;
            ctx.fillStyle = 'black';
            ctx.fillRect(screenX, screenY - 10, this.width, 5);
            ctx.fillStyle = hpRatio > 0.5 ? '#00ff00' : (hpRatio > 0.2 ? '#ffff00' : '#ff0000');
            ctx.fillRect(screenX, screenY - 10, this.width * hpRatio, 5);
        }

        ctx.globalAlpha = 1.0;
    }
}

class EnemyLvl3 extends EnemyLvl2 {
    constructor(x, y, type = 'ice_slime') {
        super(x, y, type);
        // Buff stats for level 3
        this.speed = type === 'ice_slime' ? 1.4 : 1.2; 
        this.maxHealth = type === 'ice_slime' ? 150 : 300;
        this.health = this.maxHealth;
        this.damage = type === 'ice_slime' ? 80 : 120;
        this.pointValue = type === 'ice_slime' ? 100 : 150;
        
        // Increase physical size for scary effect
        if (type === 'anomaly') {
            this.width = 40;
            this.height = 60;
        } else {
            this.width = 25;
            this.height = 20;
        }
    }

    draw(ctx, camX, camY) {
        if (this.isDead) {
            if (this.deathTimer < 30) {
                ctx.globalAlpha = 1 - (this.deathTimer / 30);
            } else {
                return;
            }
        }

        let screenX = this.x - camX;
        let screenY = this.y - camY;

        if (this.type === 'ice_slime') {
            // VOID SPARK (Api Ungu Lincah)
            let time = performance.now() * 0.005;
            let centerX = screenX + this.width / 2;
            let centerY = screenY + this.height - 8;
            
            let stretchX = 1 + Math.abs(this.vx) * 0.25;
            let stretchY = 1 - Math.abs(this.vx) * 0.15;
            let bobY = Math.sin(time * 2) * 3;

            ctx.save();
            ctx.translate(centerX, centerY + bobY);
            ctx.scale(stretchX, stretchY);

            if (this.vx !== 0) {
                let skew = (this.vx > 0 ? 1 : -1) * 0.3;
                ctx.transform(1, 0, skew, 1, 0, 0);
            }

            // Fake Outer Aura Glow (Optimized for Mobile)
            ctx.fillStyle = 'rgba(216, 0, 255, 0.3)';
            ctx.beginPath();
            ctx.arc(0, -4, 18 + Math.sin(time)*4, 0, Math.PI*2);
            ctx.fill();
            
            // Lidah Api (Flames)
            for (let i = 0; i < 5; i++) {
                let flamePhase = time + i * (Math.PI * 2 / 5);
                let fx = Math.sin(flamePhase * 1.5) * 10;
                let fy = -12 - Math.abs(Math.cos(flamePhase)) * 15;
                
                ctx.fillStyle = i % 2 === 0 ? 'rgba(138, 43, 226, 0.8)' : 'rgba(216, 0, 255, 0.8)';
                ctx.beginPath();
                ctx.moveTo(-10, 5);
                ctx.quadraticCurveTo(fx, fy, 10, 5);
                ctx.quadraticCurveTo(0, 8, -10, 5);
                ctx.fill();
            }

            // Solid Core
            ctx.fillStyle = '#ff66ff';
            ctx.fillStyle = '#ff66ff';
            ctx.beginPath();
            ctx.arc(0, -4, 7 + Math.sin(time*3)*1.5, 0, Math.PI*2);
            ctx.fill();

            // Mata
            ctx.fillStyle = 'white';
            let eyeOffsetX = (this.vx > 0 ? 3 : (this.vx < 0 ? -3 : 0));
            ctx.beginPath();
            ctx.arc(-3 + eyeOffsetX, -6, 2, 0, Math.PI*2);
            ctx.arc(3 + eyeOffsetX, -6, 2, 0, Math.PI*2);
            ctx.fill();

            ctx.restore();

        } else if (this.type === 'anomaly') {
            // OBSIDIAN REVENANT (Void Walker)
            let time = performance.now() * 0.003;
            let centerX = screenX + this.width / 2;
            let centerY = screenY + this.height / 2 - 15;
            
            ctx.save();
            ctx.translate(centerX, centerY);

            let bobY = Math.sin(time * 1.5) * 6;
            ctx.translate(0, bobY);

            if (this.vx !== 0) {
                let skew = (this.vx > 0 ? 1 : -1) * 0.15;
                ctx.transform(1, 0, skew, 1, 0, 0);
            }

            // Fake Glow (Optimized)
            ctx.fillStyle = 'rgba(216, 0, 255, 0.2)';
            ctx.beginPath();
            ctx.arc(0, 10, 30, 0, Math.PI*2);
            ctx.fill();

            // Tentakel Bayangan (Menggeliat ke bawah)
            ctx.strokeStyle = 'rgba(138, 43, 226, 0.9)';
            ctx.lineCap = 'round';
            for (let i = 0; i < 6; i++) {
                ctx.lineWidth = 4 - i * 0.4;
                ctx.beginPath();
                let startX = (i - 2.5) * 6; // Menyebar
                ctx.moveTo(startX, 10);
                
                let phase = time * 2 + i;
                let cpx1 = startX + Math.sin(phase) * 15;
                let cpy1 = 30;
                let cpx2 = startX + Math.cos(phase * 1.2) * 15;
                let cpy2 = 45;
                let endX = startX + Math.sin(phase * 1.5) * 20;
                let endY = 55 + Math.sin(time + i)*5;
                
                ctx.bezierCurveTo(cpx1, cpy1, cpx2, cpy2, endX, endY);
                ctx.stroke();
            }

            // Inti Energi (Core)
            ctx.fillStyle = 'rgba(216, 0, 255, 0.4)';
            ctx.beginPath();
            ctx.arc(0, 0, 20 + Math.sin(time*2)*3, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#ff66ff';
            ctx.beginPath();
            ctx.arc(0, 0, 14 + Math.sin(time*2)*2, 0, Math.PI * 2);
            ctx.fill();

            // Puing-puing Obsidian (Batu melayang yang berotasi)
            ctx.fillStyle = '#0f0514'; 
            ctx.strokeStyle = '#d800ff';
            ctx.lineWidth = 1.5;
            
            let numRocks = 7;
            for (let i = 0; i < numRocks; i++) {
                let angle = time * 0.8 + (i * Math.PI * 2 / numRocks);
                // Jarak orbit naik turun dan melebar
                let dist = 24 + Math.sin(time * 2 + i) * 4;
                let rx = Math.cos(angle) * dist;
                let ry = Math.sin(angle) * (dist * 0.4) + Math.sin(time + i)*5;
                
                ctx.save();
                ctx.translate(rx, ry);
                ctx.rotate(angle * 2.5);
                ctx.beginPath();
                ctx.moveTo(-6, -6);
                ctx.lineTo(6, -4);
                ctx.lineTo(8, 6);
                ctx.lineTo(-4, 8);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();
                ctx.restore();
            }

            ctx.restore();
        }

        // Draw Health Bar
        if (!this.isDead && this.health < this.maxHealth) {
            let hpRatio = this.health / this.maxHealth;
            ctx.fillStyle = 'black';
            ctx.fillRect(screenX, screenY - 10, this.width, 5);
            ctx.fillStyle = hpRatio > 0.5 ? '#00ff00' : (hpRatio > 0.2 ? '#ffff00' : '#ff0000');
            ctx.fillRect(screenX, screenY - 10, this.width * hpRatio, 5);
        }

        ctx.globalAlpha = 1.0;
    }
}
