from PIL import Image, ImageDraw, ImageFont
import os

def create_banner():
    # Paths
    input_path = "/home/ubuntu/hdmobil/client/public/images/cinematic_headphones.png"
    output_path = "/home/ubuntu/hdmobil/client/public/images/final_promo_banner.jpg"
    
    # Load image
    try:
        img = Image.open(input_path).convert("RGB")
    except FileNotFoundError:
        print(f"Error: Input file not found at {input_path}")
        return

    width, height = img.size
    draw = ImageDraw.Draw(img)

    # Fonts - Using DejaVu Sans as a reliable fallback since it's installed
    # We'll use different weights/sizes to create hierarchy
    try:
        font_title = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 120)
        font_subtitle = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 60)
        font_price = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 100)
        font_old_price = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 50)
        font_badge = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 40)
    except OSError:
        print("Error: Fonts not found. Using default.")
        font_title = ImageFont.load_default()
        font_subtitle = ImageFont.load_default()
        font_price = ImageFont.load_default()
        font_old_price = ImageFont.load_default()
        font_badge = ImageFont.load_default()

    # Text Content
    title = "HD Sound Elite"
    subtitle = "Štúdiová kvalita zvuku"
    price = "139 €"
    old_price = "199 €"
    badge_text = "-30%"

    # Layout Configuration
    # Placing text in top-left area where there's likely negative space based on "cinematic" description
    # Adjust coordinates based on visual inspection if needed
    margin_x = 100
    margin_y = 100
    
    # Colors
    text_color_primary = (20, 20, 20) # Dark gray/black for light background
    text_color_accent = (0, 180, 0)   # Green accent matching brand
    text_color_old = (100, 100, 100)  # Grey for old price

    # 1. Title
    draw.text((margin_x, margin_y), title, font=font_title, fill=text_color_primary)
    
    # 2. Subtitle
    subtitle_y = margin_y + 140
    draw.text((margin_x, subtitle_y), subtitle, font=font_subtitle, fill=text_color_primary)

    # 3. Price Block
    price_y = subtitle_y + 120
    
    # Old price (strikethrough)
    draw.text((margin_x, price_y + 40), old_price, font=font_old_price, fill=text_color_old)
    
    # Strikethrough line
    old_price_bbox = draw.textbbox((margin_x, price_y + 40), old_price, font=font_old_price)
    draw.line([(old_price_bbox[0], old_price_bbox[3] - 25), (old_price_bbox[2], old_price_bbox[3] - 25)], fill=text_color_old, width=3)

    # Current Price
    price_x = old_price_bbox[2] + 40
    draw.text((price_x, price_y), price, font=font_price, fill=text_color_primary)

    # 4. Discount Badge (Green pill shape)
    badge_x = price_x + 350
    badge_y = price_y + 15
    badge_padding_x = 30
    badge_padding_y = 15
    
    badge_bbox = draw.textbbox((0, 0), badge_text, font=font_badge)
    badge_w = badge_bbox[2] - badge_bbox[0] + (badge_padding_x * 2)
    badge_h = badge_bbox[3] - badge_bbox[1] + (badge_padding_y * 2)
    
    # Draw pill shape
    draw.rounded_rectangle(
        [(badge_x, badge_y), (badge_x + badge_w, badge_y + badge_h)],
        radius=20,
        fill=text_color_accent
    )
    
    # Draw badge text (white)
    draw.text((badge_x + badge_padding_x, badge_y + badge_padding_y - 5), badge_text, font=font_badge, fill=(255, 255, 255))

    # Save
    img.save(output_path, quality=95)
    print(f"Banner saved to {output_path}")

if __name__ == "__main__":
    create_banner()
