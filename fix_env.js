const fs = require('fs');
let code = fs.readFileSync('js/environment.js', 'utf-8');

// 1. Add tileImagesLvl2 at the top
code = code.replace(/const tileImages = \{\};[\s\S]*?\}\n/, 
`const tileImages = {};
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
`);

// 2. Fix ImageDecorationLvl2
code = code.replace(/class ImageDecorationLvl2 \{[\s\S]*?\}\n\}/, 
`class ImageDecorationLvl2 {
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
}`);

// 3. Extract createLevel1
const level1Match = code.match(/function createLevel1\(\) \{([\s\S]*?)\n\}\n/);
let level1Body = level1Match[1];
level1Body = level1Body.replace(/new Enemy\(/g, 'new EnemyLvl2(');
level1Body = level1Body.replace(/new ImageDecoration\(/g, 'new ImageDecorationLvl2(');

// Alternate ice_slime and anomaly
let toggle = false;
level1Body = level1Body.replace(/new EnemyLvl2\(([^,]+), ([^,]+), '([^']+)'\)/g, (match, p1, p2, oldType) => {
    let type = toggle ? 'anomaly' : 'ice_slime';
    toggle = !toggle;
    return 'new EnemyLvl2(' + p1 + ', ' + p2 + ', "' + type + '")';
});

let newFunc = 'function createLevel2() {' + level1Body + '\n}\n';

// Replace existing createLevel2
code = code.replace(/function createLevel2\(\) \{[\s\S]*?$/m, newFunc);

fs.writeFileSync('js/environment.js', code);
console.log('done');
