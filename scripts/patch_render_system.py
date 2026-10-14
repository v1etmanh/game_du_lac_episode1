import os

path = 'src/tha_dieu/src/systems/RenderSystem.ts'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update drawGround with deep soil fill
old_ground = """      const drawHeight = 150;
      const drawWidth = drawHeight * aspect;
      const startX = Math.floor((cameraX - drawWidth) / drawWidth) * drawWidth;
      const endX = cameraX + width + drawWidth;

      for (let x = startX; x <= endX; x += drawWidth) {
        context.drawImage(
          groundImage,
          0,
          sourceY,
          groundImage.naturalWidth,
          sourceHeight,
          x,
          groundY - 12,
          drawWidth,
          drawHeight,
        );
      }
      return;"""

new_ground = """      const drawHeight = 175;
      const drawWidth = drawHeight * aspect;
      const startX = Math.floor((cameraX - drawWidth) / drawWidth) * drawWidth;
      const endX = cameraX + width + drawWidth;

      // Lớp đất ngầm sâu lấp đầy toàn bộ đáy màn hình đảm bảo không bao giờ bị hở
      context.fillStyle = "#5c2a16";
      context.fillRect(startX, groundY + 120, endX - startX, 800);

      for (let x = startX; x <= endX; x += drawWidth) {
        context.drawImage(
          groundImage,
          0,
          sourceY,
          groundImage.naturalWidth,
          sourceHeight,
          x,
          groundY - 14,
          drawWidth,
          drawHeight,
        );
      }
      return;"""

if old_ground in content:
    content = content.replace(old_ground, new_ground, 1)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
    print("RenderSystem.ts drawGround updated successfully!")
else:
    # check CRLF
    old_ground_crlf = old_ground.replace('\n', '\r\n')
    new_ground_crlf = new_ground.replace('\n', '\r\n')
    if old_ground_crlf in content:
        content = content.replace(old_ground_crlf, new_ground_crlf, 1)
        with open(path, 'w', encoding='utf-8') as f:
            f.write(content)
        print("RenderSystem.ts drawGround updated successfully (CRLF)!")
    else:
        print("old_ground already patched or not found.")
