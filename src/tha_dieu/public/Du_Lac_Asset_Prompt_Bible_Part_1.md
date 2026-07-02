# Du Lạc: Tuổi Thơ - Asset Prompt Bible (Part 1)

> Đây là phần mở đầu của bộ Prompt Bible dùng để tạo asset AI nhất quán
> cho toàn bộ game.

## Global Style Bible

**Visual Identity**

-   Pixel art 2D point-and-click puzzle game.
-   Inspiration: Tiny Room Stories, Cube Escape, Eastward (chỉ tham khảo
    chất lượng).
-   Camera: top-down, nghiêng khoảng 20°.
-   Bối cảnh: Làng quê Bắc Bộ Việt Nam 1995--2005.
-   Không fantasy, không Nhật, không Trung Hoa, không medieval.

**Palette**

-   Earth brown
-   Moss green
-   Clay red
-   Muted yellow
-   Soft blue shadow

**Lighting**

-   Ánh sáng tự nhiên mềm.
-   Interactive object sáng hơn nền khoảng 15--20%.
-   Không dùng bloom mạnh.

------------------------------------------------------------------------

## Master Prompt Prefix (copy vào đầu mọi prompt)

``` text
Pixel art for a 2D point-and-click puzzle adventure game.
Inspired by the production quality of Tiny Room Stories and Eastward,
but set in an authentic Northern Vietnamese countryside around 1995–2005.

Camera:
fixed top-down with a slight 20 degree angle.

Rendering:
professional handcrafted pixel art,
soft painterly pixel shading,
clean silhouettes,
consistent scale,
AAA indie quality,
game-ready.

Architecture:
real Vietnamese architecture,
weathered wood,
aged stone,
moss,
traditional ceramic roof tiles,
bamboo,
brick,
lime plaster.

Palette:
warm earthy colors,
olive green,
aged brown wood,
soft gray stone,
muted vegetation,
subtle sunlight.

Lighting:
soft ambient lighting,
gentle shadows,
interactive objects slightly brighter.

Gameplay:
leave negative space,
easy click readability,
no overlapping clutter.

Output:
no UI,
no text,
no watermark,
no character unless specified.
```

------------------------------------------------------------------------

## Production Rules

1.  Luôn sinh Background trước.
2.  Sau đó mới sinh Object.
3.  Object phải cùng góc nhìn.
4.  Inventory dùng nền trong suốt.
5.  Không đổi palette giữa các scene.
6.  Không dùng AI tự thêm người hoặc động vật nếu prompt không yêu cầu.

------------------------------------------------------------------------

## Naming Convention

``` text
bg_temple_day.png
bg_temple_night.png
obj_bucket.png
obj_mirror.png
item_bread.png
fx_firefly.png
anim_fish_swim.png
```

------------------------------------------------------------------------

Đây là **Phần 1**. Các phần tiếp theo sẽ bao gồm: - Chùa (background,
object, item, FX) - Giếng - Ao làng - Inventory - Animation - Effect -
Negative prompts - Consistency checklist
