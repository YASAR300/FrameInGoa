import os
from PIL import Image, ImageDraw, ImageFont

def prepare_clean_template():
    src_path = os.path.join("public", "templates", "card-hd.png")
    out_path = os.path.join("public", "templates", "card-clean.png")

    if not os.path.exists(src_path):
        print(f"Source file {src_path} does not exist.")
        return

    # Load HD template and resize to standard 1200x1500 canvas resolution
    img = Image.open(src_path).convert("RGBA").resize((1200, 1500), Image.Resampling.LANCZOS)
    draw = ImageDraw.Draw(img)

    w, h = 1200, 1500

    # 1. Clean Top Header Area if needed (y: 40 to 140)
    # 2. Clean Photo Window Inner Slot (x: 185 to 1015, y: 145 to 665)
    # Fill photo window background with dark solid color so photo draws cleanly over it
    photo_x = 185
    photo_y = 145
    photo_w = 830
    photo_h = 520

    draw.rectangle(
        [photo_x, photo_y, photo_x + photo_w, photo_y + photo_h],
        fill=(20, 16, 14, 255)
    )

    # 3. Clean any dark green banner box between photo & yellow signboard
    draw.rectangle(
        [150, 666, 1050, 695],
        fill=(13, 92, 61, 255)
    )

    # 4. Clean Yellow Wooden Signboard Area (y: 700 to 1100)
    # Fill yellow badge container cleanly with Goan Sun Yellow (#F5CE3E) so YASAR, Stack, and Title render 100% crisp on yellow!
    signboard_x = 220
    signboard_w = 760
    signboard_y = 700
    signboard_h = 400

    # Smooth Goan Sun Yellow badge fill with dark border
    draw.rounded_rectangle(
        [signboard_x, signboard_y, signboard_x + signboard_w, signboard_y + signboard_h],
        radius=24,
        fill=(245, 206, 62, 255),
        outline=(20, 16, 14, 255),
        width=8
    )

    # 5. Clean Bottom Metadata & Static #247-XXXX Area (y: 1110 to 1420)
    # Fill bottom section with deep Goan palm green (#0D5C3D) to erase baked static text "#247-XXXX" and "METADATA SECTION"
    draw.rectangle(
        [100, 1110, 1100, 1420],
        fill=(13, 92, 61, 255)
    )

    img.save(out_path, "PNG")
    print(f"Successfully generated pristine clean template: {out_path} (1200x1500)")

if __name__ == "__main__":
    prepare_clean_template()
