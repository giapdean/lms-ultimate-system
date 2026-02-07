
import os
import shutil

# Backup source
if not os.path.exists("index.html.bak"):
    shutil.copy("index.html", "index.html.bak")

try:
    # Use utf-8-sig to handle/remove BOM if present
    with open("index.html", "r", encoding="utf-8-sig") as f:
        content = f.read()
            
    # Use 'ignore' to skip undefined characters during the reverse encode
    # This usually recovers 99% of the text if the moji-bake pattern matches
    fixed_content = content.encode("cp1252", errors="ignore").decode("utf-8")
    
    with open("index.html", "w", encoding="utf-8") as f:
        f.write(fixed_content)
        
    print("Successfully corrected encoding.")
    
except Exception as e:
    print(f"Error: {e}")
