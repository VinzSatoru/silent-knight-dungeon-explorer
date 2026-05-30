// Level 2 Generation Script
function generateMap() {
    let code = `    // ==========================================
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
    
    movingPlatforms.push(new MovingPlatform(1930, 370, 80, 16, 130, 0, 0.35));
    
    addTile(4, 2150, 350);        
    addTile(5, 2400, 280);        

    // ==========================================
    // ZONA 3: THE SPIKED ABYSS
    // ==========================================
    addTile(6, 2720, 400);        
    addTile(2, 3100, 370);        
    addTile(6, 3260, 400);        

    movingPlatforms.push(new MovingPlatform(3580, 335, 80, 16, 0, 85, 0.3));

    // ==========================================
    // ZONA 3B: THE FROZEN DEPTHS
    // ==========================================
    addTile(4, 3680, 530);        
    addTile(7, 3930, 530);        
    addTile(6, 4120, 530);        
    
    movingPlatforms.push(new MovingPlatform(4450, 400, 80, 16, 0, 150, 0.3));

    // ==========================================
    // ZONA 4: ASCENSION TO SKY BRIDGE
    // ==========================================
    addTile(7, 3680, 210);        
    addTile(5, 3880, 150);        
    
    movingPlatforms.push(new MovingPlatform(4180, 185, 80, 16, 0, 55, 0.3));

    // ==========================================
    // ZONA 4B: THE DEEP ABYSS
    // ==========================================
    addTile(4, 4550, 530);        
    addTile(6, 4780, 530);        
    addTile(7, 5140, 530);        
    
    movingPlatforms.push(new MovingPlatform(5240, 335, 80, 16, 0, 215, 0.3));

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
    enemies.push(new EnemyLvl2(4300, 510, "ice_slime"));  // Z3B: tile_6
    // Sky Bridge (Z4)
    enemies.push(new EnemyLvl2(3950, 200, "ice_slime"));  // Z4: tile_5
    enemies.push(new EnemyLvl2(4360, 80, "anomaly"));     // Z5: tile_6
    enemies.push(new EnemyLvl2(4460, 80, "ice_slime"));   // Z5: tile_6
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
    healthPotions.push(new HealthPotion(1320, 275)); // Z2
    healthPotions.push(new HealthPotion(2920, 395)); // Z3
    healthPotions.push(new HealthPotion(4100, 510)); // Z3B
    healthPotions.push(new HealthPotion(4950, 240)); // Z5

    let portal = new Portal(5300, 270, 6);`;

    const fs = require('fs');
    let content = fs.readFileSync('js/environment.js', 'utf8');
    
    // Find the replacement boundaries
    let startIndex = content.indexOf("// ZONA 1: PILLAR HOPS");
    // step back to the start of the block
    startIndex = content.lastIndexOf("// ==========================================", startIndex);
    const endStr = "    let portal = new Portal(";
    let endIndex = content.indexOf(endStr);
    
    if (startIndex !== -1 && endIndex !== -1) {
        // find end of portal line
        let portalEnd = content.indexOf(';', endIndex) + 1;
        let newContent = content.substring(0, startIndex) + code + content.substring(portalEnd);
        fs.writeFileSync('js/environment.js', newContent);
        console.log("Successfully replaced map layout.");
    } else {
        console.log("Could not find boundaries.");
    }
}
generateMap();
