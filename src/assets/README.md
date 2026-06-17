# Asset Folder Structure

Put downloaded source images here, not in `dist/`.

## Food Carousel Images

Each food item has two files:

- `src/assets/food/large/<slug>-large.webp` for the large carousel image.
- `src/assets/food/thumb/<slug>-small.webp` for the 70px thumbnail.

Use the paths listed in `src/data/gallery.json`.

## Brand and Promo Images

- `src/assets/brand/hero-banner.webp` replaces the current hero/banner image when present.
- `src/assets/brand/slice-club.webp` replaces the current Slice Club image when present.
- `src/assets/brand/tripadvisor.webp` appears in the footer social/review links when present.
- `src/assets/promos/gift-card.webp` appears in the gift card section when present.

After adding or replacing assets, run:

```sh
npm run build
```
