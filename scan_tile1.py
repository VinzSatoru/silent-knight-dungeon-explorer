from PIL import Image

img = Image.open('assets/tileset_lvl_2/tile_1.png').convert('RGBA')
w, h = img.size
scale = 0.55
pixels = img.load()

# Scan column x=150 (middle of bottom platform) from top to bottom
# to find exact Y of bottom surface
test_x = int(150 / scale)  # unscale
print(f"Scanning column x=150 (orig x={test_x}):")
in_solid = False
for orig_y in range(h):
    is_solid = pixels[test_x, orig_y][3] > 50
    sy = int(orig_y * scale)
    if is_solid and not in_solid:
        print(f"  Solid starts at scaled y={sy} (orig y={orig_y})")
        in_solid = True
    elif not is_solid and in_solid:
        print(f"  Solid ends at scaled y={sy} (orig y={orig_y})")
        in_solid = False

# Also scan x=100 (in the left wall area)
print()
test_x2 = int(100 / scale)
print(f"Scanning column x=100 (orig x={test_x2}):")
in_solid = False
for orig_y in range(h):
    is_solid = pixels[test_x2, orig_y][3] > 50
    sy = int(orig_y * scale)
    if is_solid and not in_solid:
        print(f"  Solid starts at scaled y={sy} (orig y={orig_y})")
        in_solid = True
    elif not is_solid and in_solid:
        print(f"  Solid ends at scaled y={sy} (orig y={orig_y})")
        in_solid = False

# Scan x=30 (left wall only)
print()
test_x3 = int(30 / scale)
print(f"Scanning column x=30 (orig x={test_x3}):")
in_solid = False
for orig_y in range(h):
    is_solid = pixels[test_x3, orig_y][3] > 50
    sy = int(orig_y * scale)
    if is_solid and not in_solid:
        print(f"  Solid starts at scaled y={sy} (orig y={orig_y})")
        in_solid = True
    elif not is_solid and in_solid:
        print(f"  Solid ends at scaled y={sy} (orig y={orig_y})")
        in_solid = False

# Scan the BOTTOM platform more carefully
# Find first row where pixel coverage spans the full bottom width
print("\n--- Bottom platform top edge detection ---")
for orig_y in range(int(80/scale), int(180/scale)):
    count = 0
    for orig_x in range(int(80/scale), int(250/scale)):
        if pixels[orig_x, orig_y][3] > 50:
            count += 1
    sy = int(orig_y * scale)
    if count > 50:
        print(f"  Wide solid row at scaled y={sy} (orig y={orig_y}, solid pixels={count})")
        break
