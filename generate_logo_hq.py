from PIL import Image, ImageDraw, ImageFont
import math

def create_logo(output_path):
    # Colors
    # Primary Green from CSS: oklch(0.65 0.1 150)
    # Converting OKLCH(0.65, 0.1, 150) to RGB approx:
    # L=0.65 is mid-lightness
    # C=0.1 is moderate chroma
    # H=150 is green (approx 120-180 range)
    # Approximate RGB: #5E9C76 (Muted Sage Green)
    # Let's use a slightly more vibrant version for the image to look good
    GREEN = (94, 156, 118) 
    BLACK = (30, 30, 30)
    WHITE = (255, 255, 255)
    TRANSPARENT = (0, 0, 0, 0)

    # Dimensions - High Quality
    scale = 4
    width = 800 * scale
    height = 200 * scale
    img = Image.new("RGBA", (width, height), TRANSPARENT)
    draw = ImageDraw.Draw(img)

    # Fonts - Bold Sans Serif
    try:
        # Using DejaVuSans-Bold which is usually available
        font_size = 100 * scale
        font_bold_italic = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-BoldOblique.ttf", font_size)
    except:
        # Fallback if specific font not found
        font_bold_italic = ImageFont.load_default()

    # Layout
    # "HD" Box
    hd_text = "HD"
    # Calculate text size
    left, top, right, bottom = draw.textbbox((0, 0), hd_text, font=font_bold_italic)
    hd_text_w = right - left
    hd_text_h = bottom - top
    
    hd_box_w = hd_text_w + (60 * scale)
    hd_box_h = 140 * scale
    
    start_x = 50 * scale
    start_y = 30 * scale
    
    # Draw Green Box for HD (skewed)
    skew = 20 * scale
    hd_poly = [
        (start_x + skew, start_y),          # Top Left
        (start_x + hd_box_w + skew, start_y),   # Top Right
        (start_x + hd_box_w, start_y + hd_box_h),   # Bottom Right
        (start_x, start_y + hd_box_h)           # Bottom Left
    ]
    draw.polygon(hd_poly, fill=GREEN)
    
    # Draw HD Text
    # Center text in box
    text_x = start_x + (hd_box_w - hd_text_w) / 2 + (skew / 2)
    text_y = start_y + (hd_box_h - hd_text_h) / 2 - (10 * scale) # Adjustment
    draw.text((text_x, text_y), hd_text, font=font_bold_italic, fill=WHITE)

    # "MOBIL" Box (Outline)
    mobil_text = "MOBIL"
    left, top, right, bottom = draw.textbbox((0, 0), mobil_text, font=font_bold_italic)
    mobil_text_w = right - left
    
    mobil_box_w = mobil_text_w + (60 * scale)
    
    mobil_start_x = start_x + hd_box_w + (10 * scale) # Small gap
    
    mobil_poly = [
        (mobil_start_x + skew, start_y),            # Top Left
        (mobil_start_x + mobil_box_w + skew, start_y),  # Top Right
        (mobil_start_x + mobil_box_w, start_y + hd_box_h),  # Bottom Right
        (mobil_start_x, start_y + hd_box_h)             # Bottom Left
    ]
    
    # Draw Outline
    line_width = 10 * scale
    # Top line
    draw.line([mobil_poly[0], mobil_poly[1]], fill=BLACK, width=line_width)
    # Bottom line
    draw.line([mobil_poly[3], mobil_poly[2]], fill=BLACK, width=line_width)
    # Right line
    draw.line([mobil_poly[1], mobil_poly[2]], fill=BLACK, width=line_width)
    
    # Draw MOBIL Text
    text_x = mobil_start_x + (mobil_box_w - mobil_text_w) / 2 + (skew / 2)
    draw.text((text_x, text_y), mobil_text, font=font_bold_italic, fill=BLACK)

    # Decorative Brackets
    # Top Left Accent (Green)
    acc_tl_x = start_x 
    acc_tl_y = start_y - (15 * scale)
    draw.line([(acc_tl_x, acc_tl_y), (acc_tl_x + (40 * scale), acc_tl_y)], fill=GREEN, width=8 * scale)
    draw.line([(acc_tl_x, acc_tl_y), (acc_tl_x - (10 * scale), acc_tl_y + (30 * scale))], fill=GREEN, width=8 * scale)

    # Bottom Right Accent (Black)
    acc_br_x = mobil_start_x + mobil_box_w + (10 * scale)
    acc_br_y = start_y + hd_box_h + (15 * scale)
    draw.line([(acc_br_x, acc_br_y), (acc_br_x - (40 * scale), acc_br_y)], fill=BLACK, width=8 * scale)
    draw.line([(acc_br_x, acc_br_y), (acc_br_x + (10 * scale), acc_br_y - (30 * scale))], fill=BLACK, width=8 * scale)

    # Crop to content
    bbox = img.getbbox()
    if bbox:
        # Add some padding
        padding = 20 * scale
        bbox = (max(0, bbox[0]-padding), max(0, bbox[1]-padding), min(width, bbox[2]+padding), min(height, bbox[3]+padding))
        img = img.crop(bbox)

    # Resize down for antialiasing
    final_width = int(img.width / scale)
    final_height = int(img.height / scale)
    img = img.resize((final_width, final_height), Image.LANCZOS)

    img.save(output_path)
    print(f"Logo generated at {output_path}")

if __name__ == "__main__":
    create_logo("/home/ubuntu/hdmobil/client/public/images/logo_hq.png")
