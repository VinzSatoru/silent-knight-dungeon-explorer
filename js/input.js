// js/input.js
// Menangani input dari keyboard dan tombol sentuh (mobile UI)

const input = {
    left: false,
    right: false,
    up: false,
    attack: false,
    map: false
};

// Keyboard Listeners
window.addEventListener('keydown', (e) => {
    switch(e.code) {
        case 'ArrowLeft': case 'KeyA': input.left = true; break;
        case 'ArrowRight': case 'KeyD': input.right = true; break;
        case 'ArrowUp': case 'KeyW': case 'Space': input.up = true; break;
        case 'KeyZ': case 'KeyJ': input.attack = true; break;
        case 'KeyM': input.map = !input.map; break; // Toggle map
    }
});

window.addEventListener('keyup', (e) => {
    switch(e.code) {
        case 'ArrowLeft': case 'KeyA': input.left = false; break;
        case 'ArrowRight': case 'KeyD': input.right = false; break;
        case 'ArrowUp': case 'KeyW': case 'Space': input.up = false; break;
        case 'KeyZ': case 'KeyJ': input.attack = false; break;
    }
});

// Mobile UI Listeners
document.getElementById('btn-left').addEventListener('mousedown', () => input.left = true);
document.getElementById('btn-left').addEventListener('mouseup', () => input.left = false);
document.getElementById('btn-left').addEventListener('touchstart', (e) => { e.preventDefault(); input.left = true; });
document.getElementById('btn-left').addEventListener('touchend', (e) => { e.preventDefault(); input.left = false; });

document.getElementById('btn-right').addEventListener('mousedown', () => input.right = true);
document.getElementById('btn-right').addEventListener('mouseup', () => input.right = false);
document.getElementById('btn-right').addEventListener('touchstart', (e) => { e.preventDefault(); input.right = true; });
document.getElementById('btn-right').addEventListener('touchend', (e) => { e.preventDefault(); input.right = false; });

document.getElementById('btn-jump').addEventListener('mousedown', () => input.up = true);
document.getElementById('btn-jump').addEventListener('mouseup', () => input.up = false);
document.getElementById('btn-jump').addEventListener('touchstart', (e) => { e.preventDefault(); input.up = true; });
document.getElementById('btn-jump').addEventListener('touchend', (e) => { e.preventDefault(); input.up = false; });

document.getElementById('btn-attack').addEventListener('mousedown', () => input.attack = true);
document.getElementById('btn-attack').addEventListener('mouseup', () => input.attack = false);
document.getElementById('btn-attack').addEventListener('touchstart', (e) => { e.preventDefault(); input.attack = true; });
document.getElementById('btn-attack').addEventListener('touchend', (e) => { e.preventDefault(); input.attack = false; });

// Map UI Button
let btnMap = document.getElementById('btn-map');
if (btnMap) {
    btnMap.addEventListener('click', () => { input.map = !input.map; });
}
