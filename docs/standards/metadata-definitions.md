# Metadata Definitions & Gemini AI Extraction Standards

This document establishes the schema and guidelines for metadata extraction, AI analysis, indexing, and custom user fields in StickerVault.

---

## 1. Standard Metadata Taxonomy

Sticker search relies on five core contextual dimensions:

| Field | Type | Description | Example |
|---|---|---|---|
| `character` | String or `null` | Name of the character depicted | `"Anya Forger"`, `"Pepe"`, `"Hatsune Miku"` |
| `source` | String or `null` | Franchise, game, anime, VTuber, or meme universe | `"Spy x Family"`, `"Genshin Impact"`, `"Hololive"` |
| `action` | String | Physical action or gesture being performed | `"crying"`, `"smug grin"`, `"thumbs up"`, `"drinking coffee"` |
| `feeling` | String | Emotional mood, vibe, or reaction state | `"shocked"`, `"defeated"`, `"celebratory"`, `"confused"` |
| `tags` | Array of Strings | Searchable semantic keywords (synonyms, slang, categories) | `["anya", "heh", "smug", "waku-waku", "anime", "reaction"]` |
| `description` | String | Concise natural-language summary (1 sentence) | `"Anya making her iconic smug face while trying to look confident."` |

---

## 2. Gemini AI Extraction Contract

StickerVault uses the Google Gemini 2.5 Flash Vision model to analyze incoming stickers.

### 2.1 Prompt Directive
```text
You are an expert anime, gaming, pop-culture, and internet meme archivist specializing in stickers, reaction images, and emojis.
Analyze this sticker/reaction image and return a strictly valid JSON object matching this schema:
{
  "character": string or null (name of the specific fictional character or real-world personality if identifiable, else null),
  "source": string or null (name of the anime, manga, video game, vtuber group, or meme origin, else null),
  "action": string (the visible physical gesture, expression, or activity, e.g. "saluting", "drinking tea", "screaming into pillow"),
  "feeling": string (the emotional vibe or conversational reaction, e.g. "sarcastic approval", "despair", "pure joy", "exhaustion"),
  "tags": list of lowercase single-word or hyphenated keywords for search indexing (include slang, reactions, feelings, character aliases),
  "description": string (one concise sentence describing the sticker)
}
Do not output markdown codeblocks, only valid JSON.
```

### 2.2 Expected JSON Schema
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "required": ["character", "source", "action", "feeling", "tags", "description"],
  "properties": {
    "character": { "type": ["string", "null"] },
    "source": { "type": ["string", "null"] },
    "action": { "type": "string" },
    "feeling": { "type": "string" },
    "tags": {
      "type": "array",
      "items": { "type": "string" }
    },
    "description": { "type": "string" }
  },
  "additionalProperties": false
}
```

---

## 3. Custom Configured Metadata

Users can augment or override AI-generated tags with custom attributes:

### 3.1 Supported Custom Field Types
- **Custom Tags**: User-added keywords (flagged as `is_ai_generated = 0` to prevent being overwritten during AI vision re-scans).
- **Categories / Packs**: e.g., `"Work Appropriate"`, `"Gaming Reactions"`, `"Tier 1 Memes"`.
- **NSFW / SFW Toggle**: Flags sensitive stickers to hide or blur them in public settings.
- **Rating / Priority**: Star rating (`1` to `5`) to influence search ordering.
- **Custom Key-Value Attributes**: Arbitrary key-value pairs stored in the `custom_attributes` table (e.g. `artist: "Kei"`, `lore_event: "Summer 2024"`).

### 3.2 User Edits & AI Overwrite Protection Guarantee
When users edit tags or metadata fields (`character`, `sourceOrigin`, `action`, `feeling`, `description`) via the Desktop Manager:
1. **User Lock**: The edited fields are recorded in `metadata.user_locked_fields` JSON array and flagged with `is_user_edited = 1`.
2. **AI Protection**: Any subsequent AI vision processing (initial batch tagging, model changes, or manual re-tagging) **strictly respects** user edits:
   - Locked metadata fields are never overwritten with AI model predictions.
   - Non-locked fields (empty or not edited by the user) can still receive AI enrichment.
   - User-created tags (`is_ai_generated = 0`) are permanently preserved. AI tag generation merges new tags alongside user tags without deleting or replacing user tags.
3. **Visual Indicators**: The desktop Inspector drawer displays a padlock badge next to user-locked fields, a "User Edit — Protected from AI overwrite" banner, and visually distinguishes user tags (blue pill with lock icon) from AI-generated tags (purple/sparkle icon).

---

## 4. Search Ranking Logic

Search queries utilize SQLite FTS5 with BM25 ranking and custom weights:
- **Title / Character Match**: 3.0× weight.
- **Feeling / Reaction Match**: 2.5× weight (critical for reaction picker usage).
- **Action Match**: 2.0× weight.
- **Custom Tags / AI Tags**: 1.8× weight.
- **Usage Boost**: Frequently used stickers (`copy_count`) and favorited stickers (`is_favorite = 1`) receive a ranking boost in search results.

---

## 5. Library Facets & Frequency Ranking

The desktop manager features dynamic facet filters in the left sidebar aggregated directly from the database:
- **Franchises**: Unique `source_origin` entries ordered by sticker count descending.
- **Characters**: Unique `character` entries ordered by sticker count descending.
- **Tags**: Unique tag names joined from `item_tags` and `tags` tables ordered by sticker count descending.
- **Surface Upwards**: The most common entries appear at the top with numeric count badges, with "+N more" expanders for large libraries. Active filter chips in the header allow removing individual filters or clearing all with a single click.

