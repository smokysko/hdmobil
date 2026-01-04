from PIL import Image
import numpy as np

def remove_background(input_path, output_path):
    try:
        img = Image.open(input_path).convert("RGBA")
        datas = img.getdata()

        new_data = []
        for item in datas:
            # Change all white (also shades of whites) to transparent
            # Adjust threshold as needed
            if item[0] > 240 and item[1] > 240 and item[2] > 240:
                new_data.append((255, 255, 255, 0))
            else:
                new_data.append(item)

        img.putdata(new_data)
        
        # Crop to content
        bbox = img.getbbox()
        if bbox:
            img = img.crop(bbox)
            
        img.save(output_path, "PNG")
        print(f"Processed logo saved to {output_path}")
    except Exception as e:
        print(f"Error processing logo: {e}")

if __name__ == "__main__":
    remove_background("/home/ubuntu/upload/hdmobil_logo.jpg", "/home/ubuntu/hdmobil/client/public/images/logo_final.png")
