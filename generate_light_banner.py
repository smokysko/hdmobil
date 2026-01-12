from PIL import Image, ImageDraw, ImageFont
import os

def create_light_banner():
    # Canvas setup (1200x628 - standard social media size)
    width, height = 1200, 628
    # Light background (off-white/light gray)
    bg_color = (248, 250, 252)  # slate-50
    img = Image.new('RGB', (width, height), bg_color)
    draw = ImageDraw.Draw(img)

    # Colors
    primary_green = (94, 156, 118) # #5E9C76
    text_dark = (15, 23, 42)       # slate-900
    text_gray = (100, 116, 139)    # slate-500
    white = (255, 255, 255)

    # Load fonts (using DejaVuSans as fallback)
    try:
        font_bold = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 60)
        font_title = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 80)
        font_price = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 90)
        font_old_price = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 50)
        font_text = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 36)
        font_badge = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 30)
    except:
        font_bold = ImageFont.load_default()
        font_title = ImageFont.load_default()
        font_price = ImageFont.load_default()
        font_old_price = ImageFont.load_default()
        font_text = ImageFont.load_default()
        font_badge = ImageFont.load_default()

    # Draw Background Shapes (Subtle Green Accents)
    # Top right circle
    draw.ellipse((width-400, -200, width+200, 400), fill=(240, 253, 244)) # green-50
    # Bottom left circle
    draw.ellipse((-100, height-300, 300, height+100), fill=(240, 253, 244))

    # Load Product Image
    try:
        product_path = "/home/ubuntu/hdmobil/client/public/images/banner_headphones.png"
        if os.path.exists(product_path):
            product_img = Image.open(product_path).convert("RGBA")
            # Resize product to fit right side
            product_height = 500
            aspect_ratio = product_img.width / product_img.height
            product_width = int(product_height * aspect_ratio)
            product_img = product_img.resize((product_width, product_height), Image.Resampling.LANCZOS)
            
            # Paste product on right side
            img.paste(product_img, (width - product_width - 50, (height - product_height) // 2), product_img)
    except Exception as e:
        print(f"Error loading product image: {e}")

    # Draw Content (Left Side)
    margin_left = 80
    current_y = 100

    # Badge: VÍKENDOVÁ AKCIA
    badge_text = "VÍKENDOVÁ AKCIA"
    badge_padding = 15
    bbox = draw.textbbox((0, 0), badge_text, font=font_badge)
    badge_w = bbox[2] - bbox[0] + 2 * badge_padding
    badge_h = bbox[3] - bbox[1] + 2 * badge_padding
    
    draw.rounded_rectangle(
        (margin_left, current_y, margin_left + badge_w, current_y + badge_h),
        radius=10,
        fill=primary_green
    )
    draw.text((margin_left + badge_padding, current_y + badge_padding - 5), badge_text, font=font_badge, fill=white)
    
    # Discount Text
    draw.text((margin_left + badge_w + 20, current_y + badge_padding - 5), "-30% ZĽAVA", font=font_badge, fill=primary_green)
    
    current_y += 80

    # Title
    draw.text((margin_left, current_y), "HD Sound", font=font_title, fill=text_dark)
    current_y += 90
    draw.text((margin_left, current_y), "Elite", font=font_title, fill=primary_green)
    
    current_y += 100

    # Description
    desc = "Prémiový zvuk. Aktívne potlačenie hluku.\n40h výdrž batérie."
    draw.text((margin_left, current_y), desc, font=font_text, fill=text_gray, spacing=15)
    
    current_y += 120

    # Price
    price = "139 €"
    old_price = "199 €"
    
    draw.text((margin_left, current_y), price, font=font_price, fill=text_dark)
    
    # Old Price (Strikethrough)
    price_bbox = draw.textbbox((0, 0), price, font=font_price)
    price_width = price_bbox[2] - price_bbox[0]
    
    old_price_x = margin_left + price_width + 30
    old_price_y = current_y + 35
    
    draw.text((old_price_x, old_price_y), old_price, font=font_old_price, fill=text_gray)
    
    # Strikethrough line
    old_price_bbox = draw.textbbox((old_price_x, old_price_y), old_price, font=font_old_price)
    draw.line(
        (old_price_bbox[0], old_price_bbox[1] + (old_price_bbox[3]-old_price_bbox[1])//2 + 5, 
         old_price_bbox[2], old_price_bbox[1] + (old_price_bbox[3]-old_price_bbox[1])//2 + 5),
        fill=text_gray,
        width=3
    )

    # Save
    output_path = "/home/ubuntu/hdmobil/client/public/images/promo_banner_light_final.jpg"
    img.save(output_path, quality=95)
    print(f"Banner saved to {output_path}")

if __name__ == "__main__":
    create_light_banner()
