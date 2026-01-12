from PIL import Image, ImageDraw, ImageFont
import os

def create_gradient(width, height, start_color, end_color):
    base = Image.new('RGB', (width, height), start_color)
    top = Image.new('RGB', (width, height), end_color)
    mask = Image.new('L', (width, height))
    mask_data = []
    for y in range(height):
        mask_data.extend([int(255 * (y / height))] * width)
    mask.putdata(mask_data)
    base.paste(top, (0, 0), mask)
    return base

def create_banner():
    # Dimensions
    width = 1200
    height = 400
    
    # Colors
    bg_start = (20, 30, 60)   # Deep Blue
    bg_end = (40, 20, 60)     # Deep Purple
    text_white = (255, 255, 255)
    text_accent = (0, 255, 150) # Cyan/Green accent
    btn_color = (0, 122, 255)   # Apple Blue
    
    # Create Background
    banner = create_gradient(width, height, bg_start, bg_end)
    draw = ImageDraw.Draw(banner)
    
    # Load Product Image
    try:
        product_img = Image.open("/home/ubuntu/hdmobil/client/public/images/iphone17_retail.png").convert("RGBA")
        # Resize product to fit nicely on the right
        product_height = 350
        aspect = product_img.width / product_img.height
        product_width = int(product_height * aspect)
        product_img = product_img.resize((product_width, product_height), Image.Resampling.LANCZOS)
        
        # Paste product on the right side
        banner.paste(product_img, (width - product_width - 50, 25), product_img)
    except FileNotFoundError:
        print("Product image not found, skipping.")

    # Fonts
    try:
        font_headline = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 60)
        font_subhead = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 40)
        font_body = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 24)
        font_btn = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 28)
    except OSError:
        font_headline = ImageFont.load_default()
        font_subhead = ImageFont.load_default()
        font_body = ImageFont.load_default()
        font_btn = ImageFont.load_default()

    # Text Content
    margin_x = 60
    current_y = 60
    
    # 1. Tagline (Small, Accent)
    draw.text((margin_x, current_y), "NOVINKA V PONUKE", font=font_body, fill=text_accent)
    current_y += 40
    
    # 2. Headline (Big)
    draw.text((margin_x, current_y), "iPhone 17 Pro", font=font_headline, fill=text_white)
    current_y += 70
    
    # 3. Subheadline
    draw.text((margin_x, current_y), "Budúcnosť je tu.", font=font_subhead, fill=text_white)
    current_y += 60
    
    # 4. Features (Bullet points)
    features = ["• Titánové telo", "• Čip A19 Bionic", "• 200 MPx Fotoaparát"]
    for feature in features:
        draw.text((margin_x, current_y), feature, font=font_body, fill=(200, 200, 200))
        current_y += 35
        
    # 5. CTA Button
    btn_x = margin_x
    btn_y = current_y + 20
    btn_w = 220
    btn_h = 60
    
    draw.rounded_rectangle([(btn_x, btn_y), (btn_x + btn_w, btn_y + btn_h)], radius=10, fill=btn_color)
    
    # Center text in button
    btn_text = "Predobjednať"
    text_bbox = draw.textbbox((0, 0), btn_text, font=font_btn)
    text_w = text_bbox[2] - text_bbox[0]
    text_h = text_bbox[3] - text_bbox[1]
    
    draw.text((btn_x + (btn_w - text_w) / 2, btn_y + (btn_h - text_h) / 2 - 4), btn_text, font=font_btn, fill=text_white)

    # Save
    output_path = "/home/ubuntu/hdmobil/client/public/images/marketing_banner_final.jpg"
    banner.save(output_path, quality=95)
    print(f"Banner saved to {output_path}")

if __name__ == "__main__":
    create_banner()
