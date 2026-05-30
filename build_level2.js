const fs = require('fs');
let code = fs.readFileSync('js/environment.js', 'utf-8');

const level2Body = `
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
    // ZONA 1: PILLAR HOPS
    // ==========================================
    addTile(1, 0, 200);           // Top y=210, Bot y=324, Right x=210
    addTile(2, 310, 200);         // Pillar Top y=207, Right x=355
    addTile(2, 480, 200);         // Pillar Top y=207, Right x=525
    addTile(4, 650, 200);         // 2-block Top y=211, Right x=775
    
    // ==========================================
    // ZONA 2: DESCENT & HORIZONTAL GAP
    // ==========================================
    addTile(3, 850, 300);         // L-low Left y=390, Right y=313, Right x=1075
    addTile(6, 1100, 300);        // 4-block Top y=307, Right x=1355
    addTile(7, 1500, 300);        // Float Top y=310, Right x=1590
    addTile(7, 1740, 400);        // Float Top y=410, Right x=1830
    
    // MP Horizontal Bridge 
    movingPlatforms.push(new MovingPlatform(1870, 420, 80, 16, 200, 0, 0.6));
    
    addTile(4, 2200, 400);        // 2-block Top y=411, Right x=2325
    addTile(5, 2400, 300);        // L-high Left y=310, Right y=381, Right x=2618

    // ==========================================
    // ZONA 3: THE SPIKED ABYSS
    // ==========================================
    addTile(6, 2700, 500);        // 4-block Top y=507, Right x=2955
    addTile(2, 3070, 450);        // Pillar Top y=457, Right x=3115
    addTile(6, 3230, 500);        // 4-block Top y=507, Right x=3485

    // ==========================================
    // ZONA 4: ASCENSION TO SKY BRIDGE
    // ==========================================
    movingPlatforms.push(new MovingPlatform(3570, 510, 80, 16, 0, -220, 0.5));
    addTile(7, 3680, 250);        // Float Top y=260, Right x=3770
    addTile(5, 3880, 150);        // L-high Left y=160, Right y=231, Right x=4098
    movingPlatforms.push(new MovingPlatform(4180, 230, 80, 16, 0, -100, 0.4));
    
    addTile(6, 4320, 100);        // 4-block Top y=107, Right x=4575

    // ==========================================
    // ZONA 5: FINAL DESCENT
    // ==========================================
    addTile(4, 4720, 280);        // 2-block Top y=291, Right x=4845
    addTile(1, 4950, 450);        // Top y=460, Right x=5160

    // --- SPIKE TRAPS ---
    spikes.push(new SpikeTrap(700, 211, 24));    // Zona 1: 2-block
    spikes.push(new SpikeTrap(1200, 307, 48));   // Zona 2: 4-block
    spikes.push(new SpikeTrap(2820, 507, 48));   // Zona 3: 4-block 1
    spikes.push(new SpikeTrap(3350, 507, 48));   // Zona 3: 4-block 2

    // --- ENEMIES ---
    enemies.push(new EnemyLvl2(480, 160, "ice_slime"));  // Pillar 2
    enemies.push(new EnemyLvl2(740, 160, "anomaly"));    // After spike Z1
    enemies.push(new EnemyLvl2(1000, 270, "ice_slime")); // L-low right side
    enemies.push(new EnemyLvl2(1300, 260, "anomaly"));   // After spike Z2
    enemies.push(new EnemyLvl2(2250, 360, "ice_slime")); // Z2 ending 2-block
    enemies.push(new EnemyLvl2(2520, 340, "anomaly"));   // L-high right side
    enemies.push(new EnemyLvl2(2900, 460, "ice_slime")); // Z3 4-block 1
    enemies.push(new EnemyLvl2(3430, 460, "anomaly"));   // Z3 4-block 2
    enemies.push(new EnemyLvl2(3990, 180, "ice_slime")); // Z4 L-high right
    enemies.push(new EnemyLvl2(4400, 60, "anomaly"));    // Sky bridge 1
    enemies.push(new EnemyLvl2(4500, 60, "ice_slime"));  // Sky bridge 2
    enemies.push(new EnemyLvl2(4760, 240, "anomaly"));   // Final 2-block
    
    // --- CHESTS ---
    chests.push(new Chest(150, 185, 'coins'));
    chests.push(new Chest(1030, 285, 'coins'));
    chests.push(new Chest(1530, 282, 'key'));   // Key 1: Z2 Float 1
    chests.push(new Chest(2570, 352, 'key'));   // Key 2: L-high right floor
    chests.push(new Chest(3085, 428, 'key'));   // Key 3: Z3 Pillar
    chests.push(new Chest(4040, 202, 'key'));   // Key 4: Z4 L-high right
    chests.push(new Chest(5100, 432, 'key'));   // Key 5: Near portal

    // --- COINS (Target > 1200. Coin=10, Chest Coins=50. Keys don't give coins directly but needed) ---
    // Start area (50 pts)
    coins.push(new Coin(40, 185), new Coin(60, 185), new Coin(80, 185), new Coin(100, 185), new Coin(120, 185));
    // Pillar hops (60 pts)
    coins.push(new Coin(250, 160), new Coin(270, 140), new Coin(290, 140)); // Arc to P1
    coins.push(new Coin(420, 160), new Coin(440, 140), new Coin(460, 140)); // Arc to P2
    // Over Z1 spike (30 pts)
    coins.push(new Coin(690, 150), new Coin(705, 140), new Coin(720, 150));
    // L-low (40 pts)
    coins.push(new Coin(900, 360), new Coin(920, 360), new Coin(940, 360), new Coin(960, 360));
    // Over Z2 spike (30 pts)
    coins.push(new Coin(1190, 240), new Coin(1210, 230), new Coin(1230, 240));
    // Jump to floats (80 pts)
    coins.push(new Coin(1400, 250), new Coin(1425, 230), new Coin(1450, 230)); 
    coins.push(new Coin(1630, 330), new Coin(1650, 310), new Coin(1670, 310));
    coins.push(new Coin(1760, 380), new Coin(1780, 380));
    // Horizontal MP ride (50 pts)
    coins.push(new Coin(1900, 390), new Coin(1950, 390), new Coin(2000, 390), new Coin(2050, 390), new Coin(2100, 390));
    // Abyss 1 (30 pts)
    coins.push(new Coin(2750, 480), new Coin(2780, 480), new Coin(2850, 480));
    // Jump over Z3 pillar (40 pts)
    coins.push(new Coin(3150, 420), new Coin(3170, 410), new Coin(3190, 420), new Coin(3210, 440));
    // Elevator 1 (30 pts)
    coins.push(new Coin(3590, 400), new Coin(3590, 350), new Coin(3590, 300));
    // Elevator 2 (30 pts)
    coins.push(new Coin(4200, 200), new Coin(4200, 180), new Coin(4200, 160));
    // Sky bridge (60 pts)
    coins.push(new Coin(4350, 70), new Coin(4380, 70), new Coin(4450, 70), new Coin(4480, 70), new Coin(4530, 70), new Coin(4560, 70));
    // Descent (40 pts)
    coins.push(new Coin(4630, 180), new Coin(4650, 200), new Coin(4670, 220), new Coin(4690, 240));

    // --- HEALTH POTIONS ---
    healthPotions.push(new HealthPotion(1250, 280)); // After Z2 spike
    healthPotions.push(new HealthPotion(2880, 480)); // Safe zone Z3
    healthPotions.push(new HealthPotion(4780, 260)); // Safe zone final descent

    let portal = new Portal(5050, 360);

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
`;

let newFunc = 'function createLevel2() {' + level2Body + '\n}\n';

// Replace existing createLevel2
code = code.replace(/function createLevel2\(\) \{[\s\S]*?\}\n$/m, newFunc);
// wait, the previous code ends with exactly "}\n". But just to be sure:
const startIndex = code.indexOf('function createLevel2() {');
if (startIndex !== -1) {
    code = code.substring(0, startIndex) + newFunc;
    fs.writeFileSync('js/environment.js', code);
    console.log('done');
} else {
    console.log('function createLevel2 not found');
}
