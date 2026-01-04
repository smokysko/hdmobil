from PIL import Image, ImageDraw, ImageFont
import math

def create_logo(output_path):
    # Colors
    # Primary Green from CSS: oklch(0.65 0.1 150) -> approx #5E9C76 (Muted Sage Green)
    # But user asked for "cierno zelenu tak ako je aktualne logo" - let's use a vibrant green for tech look
    # Based on "Tech E-shop" vibe, a sharper green might be better, but let's stick to the brand color.
    # Let's approximate the oklch(0.65 0.1 150) to RGB.
    # Since I cannot do exact OKLCH to RGB conversion easily without libraries, I will use a nice tech green.
    # Actually, let's use a standard tech green: #10B981 (Emerald 500) or similar if we want "tech".
    # However, the user said "tak ako je aktualne logo". The current logo seems to be "Nordic Air" style.
    # Let's use a solid green that looks good.
    
    GREEN = (94, 156, 118) # Approx for oklch(0.65 0.1 150)
    BLACK = (30, 30, 30)   # Dark grey/black
    WHITE = (255, 255, 255)
    TRANSPARENT = (0, 0, 0, 0)

    # Dimensions
    width = 800
    height = 200
    img = Image.new("RGBA", (width, height), TRANSPARENT)
    draw = ImageDraw.Draw(img)

    # Fonts - trying to find a bold sans-serif font
    # In sandbox, we might have DejaVuSans-Bold.ttf
    try:
        font_bold = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 100)
        font_bold_italic = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-BoldOblique.ttf", 100)
    except:
        font_bold = ImageFont.load_default()
        font_bold_italic = ImageFont.load_default()

    # Layout
    # "HD" Box
    hd_text = "HD"
    hd_bbox = draw.textbbox((0, 0), hd_text, font=font_bold_italic)
    hd_w = hd_bbox[2] - hd_bbox[0] + 60
    hd_h = 140
    
    start_x = 50
    start_y = 30
    
    # Draw Green Box for HD (skewed)
    # Polygon for skew effect
    skew = 20
    hd_poly = [
        (start_x + skew, start_y),          # Top Left
        (start_x + hd_w + skew, start_y),   # Top Right
        (start_x + hd_w, start_y + hd_h),   # Bottom Right
        (start_x, start_y + hd_h)           # Bottom Left
    ]
    draw.polygon(hd_poly, fill=GREEN)
    
    # Draw HD Text
    draw.text((start_x + skew + 20, start_y + 10), hd_text, font=font_bold_italic, fill=WHITE)

    # "MOBIL" Box (Outline)
    mobil_text = "MOBIL"
    mobil_bbox = draw.textbbox((0, 0), mobil_text, font=font_bold_italic)
    mobil_w = mobil_bbox[2] - mobil_bbox[0] + 60
    
    mobil_start_x = start_x + hd_w + 10 # Small gap
    
    mobil_poly = [
        (mobil_start_x + skew, start_y),            # Top Left
        (mobil_start_x + mobil_w + skew, start_y),  # Top Right
        (mobil_start_x + mobil_w, start_y + hd_h),  # Bottom Right
        (mobil_start_x, start_y + hd_h)             # Bottom Left
    ]
    
    # Draw Outline
    line_width = 10
    # Top line
    draw.line([mobil_poly[0], mobil_poly[1]], fill=BLACK, width=line_width)
    # Bottom line
    draw.line([mobil_poly[3], mobil_poly[2]], fill=BLACK, width=line_width)
    # Right line
    draw.line([mobil_poly[1], mobil_poly[2]], fill=BLACK, width=line_width)
    # Left line is shared/open? The reference image shows it connected.
    # Actually the reference shows "HD" box overlaps or connects.
    # Let's draw the top and bottom lines extending from the green box.
    
    # Draw MOBIL Text
    draw.text((mobil_start_x + skew + 20, start_y + 10), mobil_text, font=font_bold_italic, fill=BLACK)

    # Decorative Brackets
    # Top Left Bracket
    bracket_len = 40
    bracket_gap = 10
    tl_start = (start_x - 10, start_y - 10)
    # draw.line([tl_start, (tl_start[0] + bracket_len, tl_start[1])], fill=GREEN, width=8) # Horiz
    # draw.line([tl_start, (tl_start[0], tl_start[1] + bracket_len)], fill=GREEN, width=8) # Vert
    
    # Actually, looking at the reference:
    # There is a small cyan bracket on top left of HD box
    # And a small black bracket on bottom right of MOBIL box
    
    # Top Left Accent (Green)
    acc_tl_x = start_x 
    acc_tl_y = start_y - 15
    draw.line([(acc_tl_x, acc_tl_y), (acc_tl_x + 40, acc_tl_y)], fill=GREEN, width=8)
    draw.line([(acc_tl_x, acc_tl_y), (acc_tl_x - 10, acc_tl_y + 30)], fill=GREEN, width=8)

    # Bottom Right Accent (Black)
    acc_br_x = mobil_start_x + mobil_w + 10
    acc_br_y = start_y + hd_h + 15
    draw.line([(acc_br_x, acc_br_y), (acc_br_x - 40, acc_br_y)], fill=BLACK, width=8)
    draw.line([(acc_br_x, acc_br_y), (acc_br_x + 10, acc_br_y - 30)], fill=BLACK, width=8)

    # Crop to content
    bbox = img.getbbox()
    if bbox:
        img = img.crop(bbox)

    img.save(output_path)
    print(f"Logo generated at {output_path}")

if __name__ == "__main__":
    create_logo("/home/ubuntu/hdmobil/client/public/images/logo_new.png")
