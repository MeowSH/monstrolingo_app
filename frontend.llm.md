# Monstrolingo Backend Integration Guide (Frontend Agent)

This file is the frontend-facing source of truth for the current backend API.

Follow it strictly to avoid contract drift.

## 1) Base rules

- Backend exposes public JSON APIs.
- Language params are always language codes (`en`, `fr`, `ja`, etc.), never UUIDs.
- Call `GET /languages` at startup and build language selectors from it.
- For category list screens, use table endpoints with pagination.
- For entity pages, use detail endpoints with `external_key`.
- For simulator-link translation, use `POST /linkbuild/translate`.
- Error handling must branch on backend `code`, not on free-text messages.

## 2) Core endpoints

### Health

- `GET /health`
- Success response:
  - `{ "status": "ok" }`

### Languages (dynamic enum)

- `GET /languages`
- Success response:
  - `{ "languages": [{ "code": "en", "label": "English" }, ...] }`

### Game version

- `GET /game/version`
- Success response:
  - `{ "game_version": "1.040" }`
- Treat `game_version` as an opaque string (do not parse to float/number).

## 3) Complete public route list (copy/paste)

### Utility routes

- `GET /health`
  - Use: service health check.
  - Example: `GET /health`
- `GET /languages`
  - Use: fetch dynamic language enum for the UI.
  - Example: `GET /languages`
- `GET /game/version`
  - Use: display current game version.
  - Example: `GET /game/version`

### Category table routes

All table routes use:

- Required query params: `source_lang`, `target_lang`
- Optional: `page` (default `1`), `limit` (default `25`, max `100`)

Routes:

- `GET /items/table`
- `GET /weapons/table`
- `GET /armor/table`
- `GET /skills/table`
- `GET /decorations/table`
- `GET /charms/table`
- `GET /food-skills/table`
- `GET /kinsects/table`

Examples:

- `GET /items/table?source_lang=en&target_lang=fr&page=1&limit=25`
- `GET /weapons/table?source_lang=en&target_lang=ja&page=1&limit=10`
- `GET /food-skills/table?source_lang=fr&target_lang=en&page=2&limit=25`

### Category detail routes

All detail routes use:

- Path param: `:external_key`
- Required query param: `target_lang`

Routes:

- `GET /items/detail/:external_key`
- `GET /weapons/detail/:external_key`
- `GET /armor/detail/:external_key`
- `GET /skills/detail/:external_key`
- `GET /decorations/detail/:external_key`
- `GET /charms/detail/:external_key`
- `GET /food-skills/detail/:external_key`
- `GET /kinsects/detail/:external_key`

Examples:

- `GET /items/detail/potion?target_lang=fr`
- `GET /armor/detail/gore-a-head?target_lang=en`
- `GET /skills/detail/attack-boost?target_lang=ja`

### Link-build translation route

- `POST /linkbuild/translate`
  - Body fields:
    - `url` required
    - `target_lang` required
  - Example body:
    - `{ "url": "https://simulator.example/sim/#skills=Attack%20Boost%20Lv2", "target_lang": "fr" }`

## 4) Category endpoints

Supported category path segments:

- `items`
- `weapons`
- `armor`
- `skills`
- `decorations`
- `charms`
- `food-skills`
- `kinsects`

For each category `<cat>`:

- Table endpoint: `GET /<cat>/table`
- Detail endpoint: `GET /<cat>/detail/:external_key`

Examples:

- `GET /items/table?source_lang=en&target_lang=fr&page=1&limit=25`
- `GET /items/detail/potion?target_lang=fr`
- `GET /food-skills/table?source_lang=en&target_lang=ja&page=1&limit=25`

## 5) Table contract

### Request

`GET /<cat>/table?source_lang=<code>&target_lang=<code>&page=<n>&limit=<n>`

Query params:

- `source_lang` required
- `target_lang` required
- `page` optional (default `1`)
- `limit` optional (default `25`, max `100`)

### Response

```json
{
  "items": [
    {
      "external_key": "potion",
      "source": {
        "language": "en",
        "name": "Potion",
        "description": "Restores a small amount of health."
      },
      "target": {
        "language": "fr",
        "name": "Potion",
        "description": "Restaure une petite quantite de vie."
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 25,
    "total": 763,
    "total_pages": 31,
    "has_next": true
  }
}
```

Frontend notes:

- Use `external_key` as stable route key.
- Do not assume `description` is always non-empty.

## 6) Detail contract

### Request

`GET /<cat>/detail/:external_key?target_lang=<code>`

Query params:

- `target_lang` required

### Response shape

All detail payloads are wrapped in `data`:

```json
{
  "data": {
    "external_key": "potion",
    "...": "category-specific canonical fields",
    "translation": {
      "language_code": "fr",
      "name": "Potion",
      "description": "Restaure une petite quantite de vie.",
      "slug": "potion"
    }
  }
}
```

Important:

- On success, `data` is always present.
- Canonical fields vary by category.
- `translation` falls back to English when target translation is unavailable.

## 7) Link build translation contract

### Request

`POST /linkbuild/translate`

Body:

```json
{
  "url": "https://simulator.example/sim/#skills=Attack%20Boost%20Lv2",
  "target_lang": "fr"
}
```

Validation rules:

- `url` required
- `url` must target a supported simulator host and `/sim/` path
- `url` fragment must include `skills=...`
- `target_lang` required and must exist in `GET /languages`

### Response shape (translation-only)

```json
{
  "source_lang_detected": "en",
  "target_lang": "fr",
  "translation_mode": "partial",
  "skills_original": [
    {
      "text": "Attack Boost Lv2",
      "name": "Attack Boost",
      "requested_level": 2
    }
  ],
  "skills_translated": [
    {
      "original_text": "Attack Boost Lv2",
      "original_name": "Attack Boost",
      "requested_level": 2,
      "name": "Attaque +",
      "translated": true,
      "skill_external_key": "attack-boost"
    }
  ],
  "unmatched_elements": [
    {
      "kind": "skill_translation",
      "value": "Attack Boost Lv2",
      "reason": "target_translation_missing"
    }
  ]
}
```

Important:

- `translation_mode` is `full` or `partial`.
- There is no equipment recomposition object in this API.
- Keep rendering translated results even when `unmatched_elements` is non-empty.
- Common `unmatched_elements.reason` values:
  - `skill_not_found`
  - `target_translation_missing`

## 8) Recommended frontend init flow

1. Optional: `GET /health`
2. `GET /languages`
3. Select default `source_lang` and `target_lang`
4. Load first category table
5. Navigate to detail using `external_key`
6. Optional: `GET /game/version` for display

## 9) Error contract

Typical error payload:

```json
{
  "code": "invalid_argument",
  "message": "unsupported language: xx",
  "details": null
}
```

Known codes:

- `invalid_argument` (HTTP 400)
- `not_found` (HTTP 404)
- `internal` (HTTP 500)

Frontend policy:

- Switch behavior by `code`.
- Show user-safe messaging.
- Retry only where meaningful (typically `internal`, with backoff).

## 10) Anti-error checklist

- Never hardcode language options.
- Never send language UUIDs.
- Always include `target_lang` on detail requests.
- Always include `target_lang` in `POST /linkbuild/translate`.
- Do not use legacy route `POST /simbuild/translate`.
- Do not expect any `equipment_recomposed` field in linkbuild response.
- Keep `limit <= 100`.
- Use `food-skills` (with hyphen), not `foodskills`.
