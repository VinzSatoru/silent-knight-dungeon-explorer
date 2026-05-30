const fs = require('fs');

// 1. Fix EnemyLvl2 HP bar visibility
let entities = fs.readFileSync('js/entities.js', 'utf-8');
entities = entities.replace(/if \(!this.isDead\) \{[\s\n]*let hpRatio/g, 'if (!this.isDead && this.health < this.maxHealth) {\n            let hpRatio');
fs.writeFileSync('js/entities.js', entities);

// 2. Fix environment.js
let env = fs.readFileSync('js/environment.js', 'utf-8');

// A. Fix ImageDecorationLvl2 draw offset (shift visual up by 15px)
env = env.replace(/let sy = this\.y - camY;/g, 'let sy = this.y - camY - 15;');

// B. Modify createLevel2 content
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
    addTile(1, 0, 200);           
    addTile(2, 310, 200);         
    addTile(2, 480, 200);         
    addTile(4, 650, 200);         
    
    // ==========================================
    // ZONA 2: DESCENT & HORIZONTAL GAP
    // ==========================================
    addTile(3, 850, 300);         
    addTile(6, 1100, 300);        
    addTile(7, 1500, 300);        
    addTile(7, 1740, 400);        
    
    // MP Horizontal Bridge - slower and range fixed to avoid penetrating visuals
    movingPlatforms.push(new MovingPlatform(1870, 420, 80, 16, 250, 0, 0.35));
    
    addTile(4, 2220, 400);        
    addTile(5, 2420, 300);        

    // ==========================================
    // ZONA 3: THE SPIKED ABYSS
    // ==========================================
    addTile(6, 2720, 500);        
    addTile(2, 3090, 450);        
    addTile(6, 3250, 500);        

    // ==========================================
    // ZONA 4: ASCENSION TO SKY BRIDGE
    // ==========================================
    // Elevator slower
    movingPlatforms.push(new MovingPlatform(3590, 510, 80, 16, 0, -220, 0.3));
    addTile(7, 3700, 250);        
    addTile(5, 3900, 150);        
    movingPlatforms.push(new MovingPlatform(4200, 230, 80, 16, 0, -100, 0.3));
    
    addTile(6, 4340, 100);        

    // ==========================================
    // ZONA 5: FINAL DESCENT
    // ==========================================
    addTile(4, 4740, 280);        
    addTile(1, 4970, 450);        

    // --- SPIKE TRAPS ---
    // Y offsets corrected: Platform Y - 15 (Spike Height)
    // 2-block at 650 -> Top is 211. Spike Y = 196
    spikes.push(new SpikeTrap(700, 196, 24));    
    // 4-block at 1100 -> Top is 307. Spike Y = 292
    spikes.push(new SpikeTrap(1200, 292, 48));   
    // 4-block at 2720 -> Top is 507. Spike Y = 492
    spikes.push(new SpikeTrap(2840, 492, 48));   
    // 4-block at 3250 -> Top is 507. Spike Y = 492
    spikes.push(new SpikeTrap(3370, 492, 48));   

    // --- ENEMIES ---
    // X coordinates shifted +5 px to avoid falling off edges
    enemies.push(new EnemyLvl2(490, 160, "ice_slime"));  
    enemies.push(new EnemyLvl2(745, 160, "anomaly"));    
    enemies.push(new EnemyLvl2(1005, 270, "ice_slime")); 
    enemies.push(new EnemyLvl2(1305, 260, "anomaly"));   
    enemies.push(new EnemyLvl2(2260, 360, "ice_slime")); 
    enemies.push(new EnemyLvl2(2530, 340, "anomaly"));   
    enemies.push(new EnemyLvl2(2910, 460, "ice_slime")); 
    enemies.push(new EnemyLvl2(3440, 460, "anomaly"));   
    enemies.push(new EnemyLvl2(4000, 180, "ice_slime")); 
    enemies.push(new EnemyLvl2(4410, 60, "anomaly"));    
    enemies.push(new EnemyLvl2(4510, 60, "ice_slime"));  
    enemies.push(new EnemyLvl2(4770, 240, "anomaly"));   
    
    // --- CHESTS ---
    chests.push(new Chest(150, 185, 'coins'));
    chests.push(new Chest(1030, 285, 'coins'));
    chests.push(new Chest(1530, 282, 'key'));   
    chests.push(new Chest(2570, 352, 'key'));   
    chests.push(new Chest(3095, 428, 'key'));   
    chests.push(new Chest(4040, 202, 'key'));   
    chests.push(new Chest(5120, 432, 'key'));   

    // --- COINS (Target > 1200) ---
    coins.push(new Coin(40, 185), new Coin(60, 185), new Coin(80, 185), new Coin(100, 185), new Coin(120, 185));
    coins.push(new Coin(250, 160), new Coin(270, 140), new Coin(290, 140)); 
    coins.push(new Coin(420, 160), new Coin(440, 140), new Coin(460, 140)); 
    coins.push(new Coin(690, 150), new Coin(705, 140), new Coin(720, 150));
    coins.push(new Coin(900, 360), new Coin(920, 360), new Coin(940, 360), new Coin(960, 360));
    coins.push(new Coin(1190, 240), new Coin(1210, 230), new Coin(1230, 240));
    coins.push(new Coin(1400, 250), new Coin(1425, 230), new Coin(1450, 230)); 
    coins.push(new Coin(1630, 330), new Coin(1650, 310), new Coin(1670, 310));
    coins.push(new Coin(1760, 380), new Coin(1780, 380));
    coins.push(new Coin(1900, 390), new Coin(1950, 390), new Coin(2000, 390), new Coin(2050, 390), new Coin(2100, 390));
    coins.push(new Coin(2770, 480), new Coin(2800, 480), new Coin(2870, 480));
    coins.push(new Coin(3170, 420), new Coin(3190, 410), new Coin(3210, 420), new Coin(3230, 440));
    coins.push(new Coin(3610, 400), new Coin(3610, 350), new Coin(3610, 300));
    coins.push(new Coin(4220, 200), new Coin(4220, 180), new Coin(4220, 160));
    coins.push(new Coin(4370, 70), new Coin(4400, 70), new Coin(4470, 70), new Coin(4500, 70), new Coin(4550, 70), new Coin(4580, 70));
    coins.push(new Coin(4650, 180), new Coin(4670, 200), new Coin(4690, 220), new Coin(4710, 240));

    // --- HEALTH POTIONS ---
    healthPotions.push(new HealthPotion(1250, 280)); 
    healthPotions.push(new HealthPotion(2900, 480)); 
    healthPotions.push(new HealthPotion(4800, 260)); 

    let portal = new Portal(5070, 360);

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
