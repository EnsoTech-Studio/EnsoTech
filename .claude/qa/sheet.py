import sys, glob
from PIL import Image
src, out = sys.argv[1], sys.argv[2]
cols = int(sys.argv[3]) if len(sys.argv) > 3 else 3
w = int(sys.argv[4]) if len(sys.argv) > 4 else 640
files = sorted(glob.glob(src + '/*.png'))
ims = [Image.open(f).convert('RGB') for f in files]
h = round(ims[0].height * w / ims[0].width)
rows = (len(ims) + cols - 1) // cols
sheet = Image.new('RGB', (cols * w + (cols - 1) * 6, rows * h + (rows - 1) * 6), 'white')
for i, im in enumerate(ims):
    sheet.paste(im.resize((w, h), Image.LANCZOS), ((i % cols) * (w + 6), (i // cols) * (h + 6)))
sheet.save(out)
print(len(ims), sheet.size)
