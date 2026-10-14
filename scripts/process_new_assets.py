import os
import shutil
from PIL import Image
import numpy as np

def ensure_dirs():
    os.makedirs('public/tha_dieu/obstacles', exist_ok=True)
    os.makedirs('public/tha_dieu_backup', exist_ok=True)

def backup_existing():
    src_dir = 'public/tha_dieu'
    bak_dir = 'public/tha_dieu_backup'
    for f in os.listdir(src_dir):
        p = os.path.join(src_dir, f)
        if os.path.isfile(p):
            shutil.copy2(p, os.path.join(bak_dir, f))
    obs_dir = os.path.join(src_dir, 'obstacles')
    if os.path.exists(obs_dir):
        obs_bak = os.path.join(bak_dir, 'obstacles')
        os.makedirs(obs_bak, exist_ok=True)
        for f in os.listdir(obs_dir):
            p = os.path.join(obs_dir, f)
            if os.path.isfile(p):
                shutil.copy2(p, os.path.join(obs_bak, f))
    print("Backup completed into public/tha_dieu_backup")

def clean_watermark(arr):
    # If there is a small AI watermark at the bottom right, remove it
    h, w = arr.shape[:2]
    # Check bottom-right 60x60
    # Any isolated opaque pixels near bottom-right corner surrounded by transparency
    # For background layers with sky at top and content at bottom, watermark is usually near bottom right
    pass

def process_isolated_sprite(img_path, threshold=240, sat_thresh=25, trim_bbox=True):
    img = Image.open(img_path).convert('RGBA')
    arr = np.array(img)
    r = arr[:, :, 0].astype(int)
    g = arr[:, :, 1].astype(int)
    b = arr[:, :, 2].astype(int)
    
    max_c = np.maximum(np.maximum(r, g), b)
    min_c = np.minimum(np.minimum(r, g), b)
    saturation = max_c - min_c
    
    # White background mask
    is_bg = (min_c >= threshold) & (saturation <= sat_thresh)
    arr[is_bg, 3] = 0
    
    # Remove AI watermark star in bottom right corner if present
    h, w = arr.shape[:2]
    # Check bottom right 65x65
    corner = arr[h-65:h, w-65:w]
    # In corner, find if there's a watermark surrounded by empty space
    # For safety on isolated sprites, crop bounding box of the main object:
    if trim_bbox:
        # Clear bottom-right 60x60 if it's disconnected or wipe watermark
        # The watermark star has specific grey value around (220, 220, 225)
        wm_mask = (corner[:, :, 0] > 190) & (corner[:, :, 1] > 190) & (corner[:, :, 2] > 190)
        corner[wm_mask, 3] = 0
        arr[h-65:h, w-65:w] = corner
        
        opaque_mask = arr[:, :, 3] > 0
        coords = np.argwhere(opaque_mask)
        if len(coords) > 0:
            y0, x0 = coords.min(axis=0)
            y1, x1 = coords.max(axis=0) + 1
            arr = arr[y0:y1, x0:x1]
            
    return Image.fromarray(arr)

def process_music_note(img_path):
    img = Image.open(img_path).convert('RGBA')
    arr = np.array(img).astype(float)
    r, g, b = arr[:, :, 0], arr[:, :, 1], arr[:, :, 2]
    
    # Calculate distance from pure white
    diff = 255.0 - np.minimum(r, np.minimum(g, b))
    alpha = np.clip(diff * (255.0 / 28.0), 0, 255)
    
    # Preserve warm golden glow
    is_colored = (r - b) > 15
    alpha[is_colored] = np.maximum(alpha[is_colored], np.clip((r[is_colored] - b[is_colored]) * 3.5, 40, 255))
    
    arr[:, :, 3] = alpha
    res = arr.astype(np.uint8)
    
    # Crop
    opaque_mask = res[:, :, 3] > 10
    coords = np.argwhere(opaque_mask)
    if len(coords) > 0:
        y0, x0 = coords.min(axis=0)
        y1, x1 = coords.max(axis=0) + 1
        res = res[y0:y1, x0:x1]
        
    return Image.fromarray(res)

def process_parallax_layer(img_path, threshold=242, sat_thresh=25):
    img = Image.open(img_path).convert('RGBA')
    arr = np.array(img)
    r = arr[:, :, 0].astype(int)
    g = arr[:, :, 1].astype(int)
    b = arr[:, :, 2].astype(int)
    
    max_c = np.maximum(np.maximum(r, g), b)
    min_c = np.minimum(np.minimum(r, g), b)
    saturation = max_c - min_c
    
    is_white = (min_c >= threshold) & (saturation <= sat_thresh)
    arr[is_white, 3] = 0
    
    h, w = arr.shape[:2]
    # Wipe bottom-right watermark star if present
    wm_corner = arr[h-55:h, w-55:w]
    wm_mask = (wm_corner[:, :, 0] > 180) & (wm_corner[:, :, 1] > 180) & (wm_corner[:, :, 2] > 180)
    wm_corner[wm_mask, 3] = 0
    arr[h-55:h, w-55:w] = wm_corner
    
    # Trim top and bottom transparent margins, but KEEP FULL WIDTH for seamless tiling
    opaque_mask = arr[:, :, 3] > 0
    coords = np.argwhere(opaque_mask)
    if len(coords) > 0:
        y0 = coords[:, 0].min()
        y1 = coords[:, 0].max() + 1
        arr = arr[y0:y1, :]
        
    return Image.fromarray(arr)

def process_ground_tile(img_path, threshold=240):
    img = Image.open(img_path).convert('RGBA')
    arr = np.array(img)
    r = arr[:, :, 0].astype(int)
    g = arr[:, :, 1].astype(int)
    b = arr[:, :, 2].astype(int)
    min_c = np.minimum(np.minimum(r, g), b)
    max_c = np.maximum(np.maximum(r, g), b)
    
    is_white = (min_c >= threshold) & (max_c - min_c <= 25)
    arr[is_white, 3] = 0
    
    # Trim top sky while keeping full width
    opaque_mask = arr[:, :, 3] > 0
    coords = np.argwhere(opaque_mask)
    if len(coords) > 0:
        y0 = coords[:, 0].min()
        y1 = coords[:, 0].max() + 1
        arr = arr[y0:y1, :]
        
    return Image.fromarray(arr)

def main():
    ensure_dirs()
    backup_existing()
    new_dir = 'public/new'
    
    files = os.listdir(new_dir)
    print(f"Found {len(files)} files in {new_dir}")
    
    # 1. Haystack
    for f in files:
        if f.startswith('Haystack'):
            out = process_isolated_sprite(os.path.join(new_dir, f))
            out.save('public/tha_dieu/obstacles/hay_stack.png')
            print(f"Saved: public/tha_dieu/obstacles/hay_stack.png ({out.size})")
            
        elif f.startswith('Bamboo_thicket'):
            out = process_isolated_sprite(os.path.join(new_dir, f))
            out.save('public/tha_dieu/obstacles/bamboo_pole.png')
            print(f"Saved: public/tha_dieu/obstacles/bamboo_pole.png ({out.size})")
            
        elif f.startswith('Wooden_handcart'):
            out = process_isolated_sprite(os.path.join(new_dir, f))
            out.save('public/tha_dieu/obstacles/wooden_cart.png')
            print(f"Saved: public/tha_dieu/obstacles/wooden_cart.png ({out.size})")
            
        elif f.startswith('Laterite_stone'):
            out = process_isolated_sprite(os.path.join(new_dir, f))
            out.save('public/tha_dieu/stone.png')
            out.save('public/tha_dieu/move_stone.png')
            out.save('public/tha_dieu/bigger_move_stone.png')
            print(f"Saved: public/tha_dieu/stone.png & move_stone.png ({out.size})")
            
        elif f.startswith('Pixel_art_concrete_utility_pole'):
            out = process_isolated_sprite(os.path.join(new_dir, f))
            out.save('public/tha_dieu/obstacles/low_powerline.png')
            out.save('public/tha_dieu/chuongngaivat.png')
            print(f"Saved: public/tha_dieu/obstacles/low_powerline.png ({out.size})")
            
        elif f.startswith('Glowing_bamboo_musical_note'):
            out = process_music_note(os.path.join(new_dir, f))
            out.save('public/tha_dieu/item_flute_note.png')
            print(f"Saved: public/tha_dieu/item_flute_note.png ({out.size})")
            
        elif f.startswith('Pixel_art_wind_current'):
            out = process_isolated_sprite(os.path.join(new_dir, f), threshold=238)
            out.save('public/tha_dieu/gio.png')
            out.save('public/tha_dieu/obstacles/storm_gust.png')
            print(f"Saved: public/tha_dieu/gio.png & storm_gust.png ({out.size})")
            
        elif f.startswith('Pixel_art_silk_kite_ribbon'):
            out = process_isolated_sprite(os.path.join(new_dir, f), threshold=240, trim_bbox=True)
            out.save('public/tha_dieu/day_dieu.png')
            print(f"Saved: public/tha_dieu/day_dieu.png ({out.size})")
            
        elif f.startswith('Vietnamese_landscape_pixel_art_b'):
            out = process_parallax_layer(os.path.join(new_dir, f))
            out.save('public/tha_dieu/far_mountain.png')
            print(f"Saved: public/tha_dieu/far_mountain.png ({out.size})")
            
        elif f.startswith('Vietnamese_countryside_pixel_art') and f.endswith('_2.jpg'):
            out = process_parallax_layer(os.path.join(new_dir, f))
            out.save('public/tha_dieu/nearest_moutain.png')
            out.save('public/tha_dieu/village_treeline.png')
            print(f"Saved: public/tha_dieu/nearest_moutain.png ({out.size})")
            
        elif f.startswith('Pixel_art_rice_paddy'):
            out = process_parallax_layer(os.path.join(new_dir, f))
            out.save('public/tha_dieu/rice_paddy.png')
            print(f"Saved: public/tha_dieu/rice_paddy.png ({out.size})")
            
        elif f.startswith('Pixel_art_river_dyke_tile'):
            out = process_ground_tile(os.path.join(new_dir, f))
            out.save('public/tha_dieu/ground.png')
            print(f"Saved: public/tha_dieu/ground.png ({out.size})")
            
        elif f.startswith('Reed_grass'):
            out = process_parallax_layer(os.path.join(new_dir, f))
            out.save('public/tha_dieu/fg_reed_grass.png')
            print(f"Saved: public/tha_dieu/fg_reed_grass.png ({out.size})")
            
        elif f.startswith('Vietnamese_countryside_pixel_art') and not f.endswith('_2.jpg'):
            img = Image.open(os.path.join(new_dir, f))
            img.save('public/tha_dieu/bg_sunset_village.png')
            print(f"Saved full scene: public/tha_dieu/bg_sunset_village.png ({img.size})")

    print("\nAll assets successfully processed and installed into public/tha_dieu!")

if __name__ == '__main__':
    main()
