import os
from PIL import Image

assets_dir = 'assets'
out_dir = 'assets/fixed'
os.makedirs(out_dir, exist_ok=True)

SPRITE_DATA = {
    'knight_idle.png': 4,
    'knight_run.png': 8,
    'knight_jump.png': 4,
    'knight_attack.png': 4,
    'knight_dead.png': 4
}

for filename, frames in SPRITE_DATA.items():
    path = os.path.join(assets_dir, filename)
    if not os.path.exists(path): 
        print(f"Missing {filename}")
        continue
    
    img = Image.open(path).convert("RGBA")
    w, h = img.size
    
    # Gunakan integer division (//) jika w/frames menghasilkan float
    fw = int(w / frames)
    
    extracted = []
    max_w = 0
    max_h = 0
    bboxes = []
    
    for i in range(frames):
        # Potong setiap frame berdasarkan perhitungan lebar
        frame_img = img.crop((i*fw, 0, (i+1)*fw, h))
        # Cari kotak pembatas pixel yang tidak transparan
        bbox = frame_img.getbbox() 
        bboxes.append(bbox)
        
        if bbox:
            cropped = frame_img.crop(bbox)
            extracted.append(cropped)
            max_w = max(max_w, cropped.width)
            max_h = max(max_h, cropped.height)
        else:
            extracted.append(None)
            
    # Buat ukuran frame baru yang konsisten
    new_fw = max_w + 20
    new_fh = max_h + 20
    
    new_sheet = Image.new("RGBA", (new_fw * frames, new_fh), (0,0,0,0))
    
    for i, cropped in enumerate(extracted):
        if cropped:
            bbox = bboxes[i]
            # Alignment X: Center horizontal
            x_offset = (i * new_fw) + (new_fw // 2) - (cropped.width // 2)
            
            # Alignment Y
            if "jump" in filename:
                # Untuk lompat, pertahankan jarak aslinya dari tanah
                original_bottom_dist = h - bbox[3]
                y_offset = new_fh - cropped.height - original_bottom_dist
                # Jangan sampai keluar batas atas
                y_offset = max(0, y_offset) 
            else:
                # Animasi lain diselaraskan di dasar (tanah)
                y_offset = new_fh - cropped.height - 5 
                
            new_sheet.paste(cropped, (int(x_offset), int(y_offset)))
            
    # Timpa ke folder fixed
    new_sheet.save(os.path.join(out_dir, filename))
    print(f"Fixed {filename}: New frame size {new_fw}x{new_fh}")
