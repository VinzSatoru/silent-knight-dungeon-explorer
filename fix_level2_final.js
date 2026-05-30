const fs = require('fs');

let env = fs.readFileSync('js/environment.js', 'utf-8');

// 1. Revert the sy hack
env = env.replace(/let sy = this\.y - camY - 15;/g, 'let sy = this.y - camY;');

// 2. Replace createLevel2 completely
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
            platforms.push(new Platform(x + 7, y + 20, 201, 20, true));
            platforms.push(new Platform(x + 209, y + 116, 53, 63, true));
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
    // Lower platform ends at x=262, y=316. 
    // Make sure next tile is reachable from BOTH top and bottom.
    // If top is y=220, x=208. 
    addTile(2, 330, 200);  // Platform at x=340, y=208. Gap from top is 340-208 = 132. Jumpable!
    addTile(2, 480, 200);  // Platform at x=490, y=208.       
    addTile(4, 650, 200);  // Platform at x=659, y=213.
    
    // ==========================================
    // ZONA 2: DESCENT & HORIZONTAL GAP
    // ==========================================
    // 2-block ends at x=795.
    addTile(3, 870, 300);  // Left side at x=890, y=393. Drop down 180px. Right side x=1040, y=312.
    addTile(6, 1100, 300); // Top y=320, x=1113. Right x=1358.
    addTile(7, 1460, 300); // Float at x=1469, y=309. Right x=1551.
    addTile(7, 1680, 400); // Float at x=1689, y=409. Right x=1771.
    
    // MP Horizontal Bridge 
    movingPlatforms.push(new MovingPlatform(1830, 420, 80, 16, 230, 0, 0.35)); // x=1830 to 2060
    
    addTile(4, 2150, 400); // Platform at x=2159, y=413. Right x=2295.
    addTile(5, 2370, 300); // Left x=2390, y=312. Right x=2439, y=393. Right x=2587.

    // ==========================================
    // ZONA 3: THE SPIKED ABYSS
    // ==========================================
    addTile(6, 2700, 500); // Platform x=2713, y=520. Right x=2958.
    addTile(2, 3080, 450); // Pillar x=3090, y=458. Right x=3138.
    addTile(6, 3250, 500); // Platform x=3263, y=520. Right x=3508.

    // ==========================================
    // ZONA 4: ASCENSION TO SKY BRIDGE
    // ==========================================
    movingPlatforms.push(new MovingPlatform(3610, 520, 80, 16, 0, -220, 0.3)); // 520 to 300
    addTile(7, 3720, 250); // Float x=3729, y=259. Right x=3811.
    addTile(5, 3940, 150); // Left x=3960, y=162. Right x=4009, y=243. Right x=4157.
    movingPlatforms.push(new MovingPlatform(4220, 250, 80, 16, 0, -120, 0.3)); // 250 to 130
    
    addTile(6, 4360, 100); // Platform x=4373, y=120. Right x=4618.

    // ==========================================
    // ZONA 5: FINAL DESCENT
    // ==========================================
    addTile(4, 4740, 280); // Platform x=4749, y=293. Right x=4885.
    addTile(1, 5000, 450); // Top x=5007, y=470. Right x=5208.

    // --- SPIKE TRAPS ---
    // Platform Y - 15 (Spike Height)
    spikes.push(new SpikeTrap(700, 198, 24));    // 2-block at 650 -> Top is 213. Spike Y = 198
    spikes.push(new SpikeTrap(1200, 305, 48));   // 4-block at 1100 -> Top is 320. Spike Y = 305
    spikes.push(new SpikeTrap(2820, 505, 48));   // 4-block at 2700 -> Top is 520. Spike Y = 505
    spikes.push(new SpikeTrap(3370, 505, 48));   // 4-block at 3250 -> Top is 520. Spike Y = 505

    // --- ENEMIES ---
    enemies.push(new EnemyLvl2(495, 160, "ice_slime"));  
    enemies.push(new EnemyLvl2(735, 160, "anomaly"));    
    enemies.push(new EnemyLvl2(1010, 270, "ice_slime")); 
    enemies.push(new EnemyLvl2(1310, 260, "anomaly"));   
    enemies.push(new EnemyLvl2(2200, 360, "ice_slime")); 
    enemies.push(new EnemyLvl2(2490, 340, "anomaly"));   
    enemies.push(new EnemyLvl2(2900, 460, "ice_slime")); 
    enemies.push(new EnemyLvl2(3440, 460, "anomaly"));   
    enemies.push(new EnemyLvl2(4060, 180, "ice_slime")); 
    enemies.push(new EnemyLvl2(4450, 60, "anomaly"));    
    enemies.push(new EnemyLvl2(4550, 60, "ice_slime"));  
    enemies.push(new EnemyLvl2(4800, 240, "anomaly"));   
    
    // --- CHESTS ---
    chests.push(new Chest(150, 194, 'coins'));
    chests.push(new Chest(1050, 292, 'coins'));
    chests.push(new Chest(1490, 289, 'key'));   
    chests.push(new Chest(2520, 373, 'key'));   
    chests.push(new Chest(3095, 438, 'key'));   
    chests.push(new Chest(4060, 223, 'key'));   
    chests.push(new Chest(5120, 450, 'key'));   

    // --- COINS (Target > 1200) ---
    coins.push(new Coin(40, 194), new Coin(60, 194), new Coin(80, 194), new Coin(100, 194), new Coin(120, 194));
    coins.push(new Coin(270, 160), new Coin(290, 140), new Coin(310, 140)); 
    coins.push(new Coin(420, 160), new Coin(440, 140), new Coin(460, 140)); 
    coins.push(new Coin(690, 150), new Coin(705, 140), new Coin(720, 150));
    coins.push(new Coin(900, 360), new Coin(920, 360), new Coin(940, 360), new Coin(960, 360));
    coins.push(new Coin(1190, 240), new Coin(1210, 230), new Coin(1230, 240));
    coins.push(new Coin(1380, 250), new Coin(1405, 230), new Coin(1430, 230)); 
    coins.push(new Coin(1580, 330), new Coin(1600, 310), new Coin(1620, 310));
    coins.push(new Coin(1760, 380), new Coin(1780, 380));
    coins.push(new Coin(1850, 390), new Coin(1900, 390), new Coin(1950, 390), new Coin(2000, 390), new Coin(2050, 390));
    coins.push(new Coin(2770, 480), new Coin(2800, 480), new Coin(2870, 480));
    coins.push(new Coin(3170, 420), new Coin(3190, 410), new Coin(3210, 420), new Coin(3230, 440));
    coins.push(new Coin(3630, 400), new Coin(3630, 350), new Coin(3630, 300));
    coins.push(new Coin(4240, 200), new Coin(4240, 180), new Coin(4240, 160));
    coins.push(new Coin(4390, 70), new Coin(4420, 70), new Coin(4490, 70), new Coin(4520, 70), new Coin(4570, 70), new Coin(4600, 70));
    coins.push(new Coin(4660, 180), new Coin(4680, 200), new Coin(4700, 220), new Coin(4720, 240));

    // --- HEALTH POTIONS ---
    healthPotions.push(new HealthPotion(1250, 290)); 
    healthPotions.push(new HealthPotion(2900, 490)); 
    healthPotions.push(new HealthPotion(4800, 260)); 

    let portal = new Portal(5070, 370);

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

const startIndex = env.indexOf('function createLevel2() {');
if (startIndex !== -1) {
    env = env.substring(0, startIndex) + newFunc;
    fs.writeFileSync('js/environment.js', env);
    console.log('done');
} else {
    console.log('function createLevel2 not found');
}
