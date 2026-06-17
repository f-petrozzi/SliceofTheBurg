# Toast Menu Source of Truth Plan

This document describes the future menu workflow for Slice of The Burg. The goal is to let Toast remain the source of truth for menu names, descriptions, prices, modifiers, and availability, while giving the business owner an easy way to decide which Toast items appear on `sliceoftheburg.com`.

## Goals

- Use Toast as the main menu database.
- Keep Toast API credentials private on the server.
- Let the owner hide or show website menu items without editing code.
- Avoid pulling from Toast on every page view.
- Keep the public website fast, simple, and SEO-friendly.
- Leave room for future website-only controls such as featured items, custom sorting, and homepage highlights.

## Non-Technical Owner Workflow

The owner should not need to understand Toast API data, GitHub, Cloudflare, JSON, or code.

The owner experience should look like this:

1. Log in to a simple private admin page.
2. Click `Sync From Toast`.
3. See the current Toast menu grouped by category.
4. Use clear toggles:
   - `Show on website`
   - `Hide from website`
5. Optionally use future controls:
   - `Feature this item`
   - `Use custom website description`
   - `Use custom website image`
   - `Move up`
   - `Move down`
6. Click `Publish Website Menu`.
7. The public site updates from the saved website menu.

Important behavior:

- Hiding an item from the website does not remove it from Toast.
- Hiding an item from the website does not stop Toast ordering from selling it.
- Toast remains the place where prices, real menu item names, modifiers, and core availability are managed.
- The website admin only controls website presentation.

## Recommended Architecture

```txt
Toast API
  |
  v
Cloudflare Pages Function or Worker
  |
  v
Cached Toast menu data
  |
  v
Website override layer
  |
  v
Published public menu JSON
  |
  v
sliceoftheburg.com menu page
```

The public site should not call Toast directly from browser JavaScript. Toast credentials must stay server-side.

## Cloudflare Pieces

Recommended production pieces:

- Cloudflare Pages for the static website.
- Cloudflare Pages Functions or a Worker for server-side API routes.
- Cloudflare D1 for menu overrides and admin data.
- Cloudflare KV or R2 for cached published menu JSON if needed.

For an early prototype, this can be simpler:

- Pages site.
- One protected sync endpoint.
- One JSON file or KV value for website menu overrides.

As the admin workflow grows, move to D1.

## Data Sources

### Toast Data

Toast should provide:

- Menus
- Menu groups/categories
- Menu items
- Descriptions
- Prices
- Modifier groups
- Item images when available
- Published menu state
- Toast GUIDs for stable item identity

Toast GUIDs should be treated as the stable IDs. Do not match items by name because names can change and duplicates can exist.

### Website Override Data

The website should store only presentation-specific overrides.

Example:

```json
{
  "hiddenItemGuids": [
    "toast-item-guid-1",
    "toast-item-guid-2"
  ],
  "hiddenGroupGuids": [],
  "featuredItemGuids": [],
  "customSortOrder": [],
  "customDescriptions": {
    "toast-item-guid-3": "Website-only description."
  },
  "customImages": {
    "toast-item-guid-4": "/assets/food/large/example.webp"
  }
}
```

The first version only needs `hiddenItemGuids`. Everything else can come later.

## Sync Flow

The sync should be manual at first.

```txt
Owner clicks Sync From Toast
  |
  v
Server checks Toast /metadata
  |
  v
If Toast menu changed, server fetches Toast /menus
  |
  v
Server normalizes Toast data into website-friendly shape
  |
  v
Server applies website overrides
  |
  v
Server saves published menu JSON
  |
  v
Website renders the saved menu
```

Manual sync is preferred because it avoids unnecessary Toast API calls and gives the owner control over when website changes go live.

## Public Website Rendering

The public website should render from the saved published menu JSON, not directly from Toast.

Recommended public data shape:

```json
{
  "lastSyncedAt": "2026-06-17T12:00:00.000Z",
  "categories": [
    {
      "guid": "toast-menu-group-guid",
      "name": "Pizza The Burg",
      "items": [
        {
          "guid": "toast-item-guid",
          "name": "Sweet Heat Pizza",
          "description": "Description from Toast or website override.",
          "price": 18.99,
          "image": "/assets/food/large/sweetheat-large.webp",
          "toastOrderUrl": "https://order.toasttab.com/..."
        }
      ]
    }
  ]
}
```

This gives the static site a stable, fast menu source while still letting Toast drive the actual business data.

## Admin Page Requirements

The admin page should be private and simple.

Recommended screens:

### Dashboard

- Last Toast sync time.
- Last website publish time.
- `Sync From Toast` button.
- `Publish Website Menu` button.
- Warning if Toast has newer data than the website cache.

### Menu Visibility

Grouped by Toast category:

```txt
Starters
  [x] Garlic Knots
  [x] Meatballs
  [ ] Test Item Not For Website

Pizza The Burg
  [x] Sweet Heat Pizza
  [x] Big Kahuna
```

Controls should use plain language:

- Checked means `Shown on website`.
- Unchecked means `Hidden from website`.

Avoid technical labels like GUID, API, JSON, or sync payload in the owner interface.

### Item Detail

Optional future screen for each item:

- Toast item name, read-only.
- Toast price, read-only.
- Toast description, read-only.
- Toggle: `Show on website`.
- Optional website-only description.
- Optional website-only image.
- Optional featured item toggle.

## Authentication

The admin page needs authentication before it is used by the owner.

Good options:

- Cloudflare Access in front of `/admin`.
- A simple password-protected admin route for prototype only.
- Later, owner accounts with roles if needed.

Cloudflare Access is likely the best first production-quality option because it avoids building a full login system.

## Important Toast Rules

- Toast credentials must never be placed in frontend JavaScript.
- Toast menu changes must be published in Toast before the API returns them.
- Toast Menus API is for data retrieval. Website visibility overrides should live in our app, not in Toast.
- The menu sync should check Toast metadata before fetching the full menu when possible.
- Cache the normalized menu so public visitors do not trigger Toast API calls.

Reference docs:

- Toast Menus API overview: https://doc.toasttab.com/doc/devguide/apiGettingMenuInformationFromTheMenusAPI.html
- Toast authentication API: https://doc.toasttab.com/openapi/authentication/operation/authenticationLoginPost/
- Toast Menus V3 API: https://doc.toasttab.com/openapi/menusv3/overview/
- Toast menu freshness guidance: https://doc.toasttab.com/doc/devguide/apiEnsuringYourMenuDataIsUpToDate.html

## Suggested Implementation Phases

### Phase 1: Read-Only Toast Sync Prototype

- Add server-side Toast authentication.
- Add a manual sync endpoint.
- Fetch Toast `/metadata`.
- Fetch Toast `/menus`.
- Save the normalized menu as cached JSON.
- Render the website menu from cached JSON.

Success criteria:

- No Toast credentials in the browser.
- Website menu renders from Toast data.
- Public visitors do not call Toast.

### Phase 2: Website Visibility Controls

- Add admin page.
- Show Toast categories and items.
- Add `Show on website` toggles.
- Store hidden item GUIDs.
- Apply hidden-item overrides when publishing the website menu.

Success criteria:

- Owner can hide a Toast item from the public website without changing Toast.
- Hidden items remain untouched in Toast.
- Public site updates after clicking publish.

### Phase 3: Better Owner Controls

- Add featured item controls.
- Add custom website descriptions.
- Add custom website images.
- Add category/item sort controls if Toast order is not ideal for the website.

Success criteria:

- Owner can shape the website menu presentation without breaking Toast as the source of truth.

### Phase 4: Workflow Hardening

- Add sync logs.
- Add publish history.
- Add rollback to previous published menu JSON.
- Add validation for missing prices/images/descriptions.
- Add admin status messages that explain what changed after sync.

Success criteria:

- Sync and publish are understandable and recoverable.
- Owner can see what changed before publishing.

## Open Questions

- Which Toast environment will be used first: sandbox or production?
- Does the restaurant have item images in Toast, or should website images stay managed separately?
- Should hidden website items still be reachable by direct link, or fully excluded from generated menu data?
- Should the website menu link each item to Toast ordering, or should category-level order buttons be enough?
- Should modifier choices display on the website, or only item names/descriptions/prices?

## Recommended First Version

Build the first version with only these controls:

- `Sync From Toast`
- `Show on website` toggle per item
- `Publish Website Menu`

Everything else can wait. This keeps the workflow easy for the owner and keeps the technical surface area small.
