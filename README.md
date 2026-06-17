# Slice of The Burg

Static prototype for Slice of The Burg, built for Cloudflare Pages.

## Local development

```sh
npm run build
npm run dev
```

Open `http://localhost:4173`.

## Cloudflare Pages

- Build command: `npm run build`
- Output directory: `dist`
- Node version: 20 or newer

## Content model

Menu and page content lives in `src/data`. The menu JSON is intentionally structured for a later manual Google Sheets sync workflow:

- menu pages contain sections
- sections contain items
- items can carry names, descriptions, prices, options, and tags

The current build reads local JSON only. A future sync script can update the JSON, then run the same build.
