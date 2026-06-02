// js/physics.js
// Mengatur konstanta fisika dasar
const GRAVITY = 0.09; // Diperkecil agar lebih lama di udara (hang time)
const TERMINAL_VELOCITY = 20;

function applyPhysics(entity, platforms) {
    // Terapkan gravitasi
    entity.vy += GRAVITY;
    if (entity.vy > TERMINAL_VELOCITY) {
        entity.vy = TERMINAL_VELOCITY;
    }

    // Update posisi X (Horizontal)
    entity.x += entity.vx;

    // Cek tabrakan horizontal dengan platform
    for (let platform of platforms) {
        if (checkCollision(entity, platform)) {
            if (entity.vx > 0) {
                // Menabrak sisi kiri platform
                entity.x = platform.x - entity.width;
            } else if (entity.vx < 0) {
                // Menabrak sisi kanan platform
                entity.x = platform.x + platform.width;
            }
            entity.vx = 0;
        }
    }

    // Update posisi Y (Vertikal)
    entity.y += entity.vy;
    entity.grounded = false;

    // Cek tabrakan vertikal dengan platform
    for (let platform of platforms) {
        if (checkCollision(entity, platform)) {
            if (entity.vy > 0) {
                // Jatuh ke bawah (mendarat)
                let prevBottom = (entity.y - entity.vy) + entity.height;
                if (prevBottom <= platform.y + 10) { // Toleransi 10px
                    entity.grounded = true;
                    entity.vy = 0;
                    entity.y = platform.y - entity.height;
                }
            } else if (entity.vy < 0) {
                // Lompat menabrak langit-langit platform
                let prevTop = entity.y - entity.vy;
                if (prevTop >= platform.y + platform.height - 10) {
                    entity.vy = 0;
                    entity.y = platform.y + platform.height;
                }
            }
        }
    }

    // Batas kiri dunia
    if (entity.x < 0) entity.x = 0;
}

// Axis-Aligned Bounding Box (AABB) Collision Detection
function checkCollision(rect1, rect2) {
    return (
        rect1.x < rect2.x + rect2.width &&
        rect1.x + rect1.width > rect2.x &&
        rect1.y < rect2.y + rect2.height &&
        rect1.y + rect1.height > rect2.y
    );
}
