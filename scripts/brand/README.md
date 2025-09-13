Brand Asset Extraction (Exact)

Goal: extract the yellow bird mark from the raster logo precisely (no background), and generate DPR variants.

Prerequisite: ImageMagick installed (magick/convert available in your PATH)

How to run

1) From repo root:
   bash scripts/brand/extract_bird.sh /Users/oneearlybird/Desktop/EarlyBirdLogo.png

2) Outputs will appear at:
   apps/web/public/brand/bird.png
   apps/web/public/brand/bird@2x.png
   apps/web/public/brand/bird@3x.png

3) Commit the files. I will switch the header to use the raster mark for 1:1 accuracy.

Notes
- The script auto-detects the bird by color (near #F2C230) and selects the leftmost large component.
- If detection fails, tweak the fuzz in the script (default 15%).
- This preserves the exact shape/colors from the source and avoids any vector approximation.

