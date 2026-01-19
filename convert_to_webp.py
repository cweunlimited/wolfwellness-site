from PIL import Image
import os

# Images to convert with their quality settings
images = [
    ("hero-bg.jpg", 90),  # High quality for hero
    ("WOLF Wellness Logo ChatGPT Image Oct 20, 2025, 06_37_59 PM.png", 95),  # Very high for logo
    ("founder-image1.png", 90),  # High for founder
]

for filename, quality in images:
    if os.path.exists(filename):
        try:
            # Open image
            img = Image.open(filename)

            # Convert to RGB if necessary (WebP doesn't support all modes)
            if img.mode in ('RGBA', 'LA', 'P'):
                # Keep transparency if present
                webp_filename = filename.rsplit('.', 1)[0] + '.webp'
            else:
                img = img.convert('RGB')
                webp_filename = filename.rsplit('.', 1)[0] + '.webp'

            # Save as WebP
            img.save(webp_filename, 'WEBP', quality=quality, method=6)

            # Get file sizes
            original_size = os.path.getsize(filename) / 1024 / 1024  # MB
            webp_size = os.path.getsize(webp_filename) / 1024 / 1024  # MB
            reduction = ((original_size - webp_size) / original_size) * 100

            print(f"[OK] Converted {filename}")
            print(f"  Original: {original_size:.2f}MB -> WebP: {webp_size:.2f}MB")
            print(f"  Reduction: {reduction:.1f}%\n")

        except Exception as e:
            print(f"[ERROR] Error converting {filename}: {e}\n")
    else:
        print(f"[ERROR] File not found: {filename}\n")

print("Conversion complete!")
