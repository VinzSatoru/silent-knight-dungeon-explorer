from PIL import Image
import glob
import os

for img_path in sorted(glob.glob('assets/tileset_lvl_2/tile_*.png')):
    img = Image.open(img_path).convert('RGBA')
    w, h = img.size
    print(f"\n{os.path.basename(img_path)} ({w}x{h}):")
    
    scale = 0.55
    scaled_w = int(w * scale)
    scaled_h = int(h * scale)
    
    pixels = img.load()
    
    segments = []
    current_segment = None
    
    for sx in range(scaled_w):
        orig_x = int(sx / scale)
        if orig_x >= w: orig_x = w - 1
        
        top_y = None
        for orig_y in range(h):
            if pixels[orig_x, orig_y][3] > 50:
                top_y = int(orig_y * scale)
                break
                
        if top_y is not None:
            if current_segment is None:
                current_segment = {'start_x': sx, 'end_x': sx, 'y': top_y}
            else:
                if abs(current_segment['y'] - top_y) < 15:
                    current_segment['end_x'] = sx
                    current_segment['y'] = min(current_segment['y'], top_y)
                else:
                    segments.append(current_segment)
                    current_segment = {'start_x': sx, 'end_x': sx, 'y': top_y}
        else:
            if current_segment is not None:
                segments.append(current_segment)
                current_segment = None
                
    if current_segment is not None:
        segments.append(current_segment)
        
    for seg in segments:
        width = seg['end_x'] - seg['start_x']
        if width > 15:
            print(f"  Platform from x={seg['start_x']} to {seg['end_x']}, width={width}, y={seg['y']}")
