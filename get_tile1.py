from PIL import Image
import os

img_path = 'assets/tileset_lvl_2/tile_1.png'
img = Image.open(img_path).convert('RGBA')
w, h = img.size

scale = 0.55
scaled_w = int(w * scale)
scaled_h = int(h * scale)

pixels = img.load()

# For each X, find ALL continuous non-transparent Y segments.
# We care about the TOP edge of each Y segment.
columns = []
for sx in range(scaled_w):
    orig_x = int(sx / scale)
    if orig_x >= w: orig_x = w - 1
    
    platforms_in_col = []
    in_platform = False
    start_y = None
    
    for orig_y in range(h):
        is_solid = pixels[orig_x, orig_y][3] > 50
        if is_solid and not in_platform:
            in_platform = True
            platforms_in_col.append(int(orig_y * scale))
        elif not is_solid and in_platform:
            in_platform = False
            
    columns.append(platforms_in_col)

# Now, track horizontal lines
# A horizontal line is a platform.
# We'll group them by similar Y value.
active_platforms = []
completed_platforms = []

for sx, cols in enumerate(columns):
    # Match active platforms with cols
    next_active = []
    for y in cols:
        matched = False
        for ap in active_platforms:
            if abs(ap['y'] - y) < 15:
                # Extend this platform
                ap['end_x'] = sx
                ap['y'] = min(ap['y'], y) # Keep highest point
                next_active.append(ap)
                active_platforms.remove(ap)
                matched = True
                break
        if not matched:
            # New platform starts
            next_active.append({'start_x': sx, 'end_x': sx, 'y': y})
            
    # Any active platforms that didn't match are completed
    for ap in active_platforms:
        completed_platforms.append(ap)
        
    active_platforms = next_active

for ap in active_platforms:
    completed_platforms.append(ap)

print("tile_1.png complete platforms:")
for p in completed_platforms:
    width = p['end_x'] - p['start_x']
    if width > 15: # Ignore very narrow noise
        print(f"  Platform from x={p['start_x']} to {p['end_x']}, width={width}, y={p['y']}")

