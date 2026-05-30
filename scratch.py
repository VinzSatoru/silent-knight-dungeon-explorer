from PIL import Image
import os

def make_sheet(folder, output, frame_w, frame_h):
    """Buat sprite sheet dari frame individual, sejajarkan kaki ke bawah dan center horizontal."""
    files = sorted([f for f in os.listdir(folder) if f.endswith('.png')])
    num_frames = len(files)
    
    sheet = Image.new("RGBA", (frame_w * num_frames, frame_h), (0, 0, 0, 0))
    
    for i, f in enumerate(files):
        img = Image.open(os.path.join(folder, f)).convert("RGBA")
        # Center horizontal
        x_offset = (frame_w - img.width) // 2
        # Align kaki ke bawah
        y_offset = frame_h - img.height
        sheet.paste(img, (i * frame_w + x_offset, y_offset))
    
    sheet.save(output)
    print(f"Created {output}: {sheet.size[0]}x{sheet.size[1]}, {num_frames} frames, {frame_w}x{frame_h}/frame")

# Attack: max width 328, height 300
make_sheet('assets/mainchar_attack', 'assets/knight_attack_new.png', 328, 300)

# Jump: 360x400 (sudah konsisten)
make_sheet('assets/mainchar_jump', 'assets/knight_jump_new.png', 360, 400)

# Idle: max width 441, height 574
make_sheet('assets/kinght_idle', 'assets/knight_idle_new.png', 441, 574)
