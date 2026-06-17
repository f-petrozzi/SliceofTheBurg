# Asset Folder Structure

Put downloaded source images here, not in `dist/`.

## Food Carousel Images

Each food item has two files:

- `src/assets/food/large/<slug>.jpg` for the large carousel image.
- `src/assets/food/thumb/<slug>.jpg` for the 70px thumbnail.

Use the slugs listed in `src/data/gallery.json`. If a downloaded file is PNG or WEBP, either rename/convert it to JPG or update the matching `large` and `thumb` paths in `src/data/gallery.json`.

## Brand and Promo Images

- `src/assets/brand/hero-banner.png` replaces the current hero/banner image when present.
- `src/assets/brand/tripadvisor.png` appears in the footer social/review links when present.
- `src/assets/promos/gift-card.png` appears in the gift card section when present.

After adding or replacing assets, run:

```sh
npm run build
```
