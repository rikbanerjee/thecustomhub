# The CustomHub: Brand Analyst Workflow

Use this guide to add new products using the Gemini CLI Agent.

## 1. Setup: The "Inbox" Method
To add a new product, create a folder in `_inbox/` with your product name.

**Structure:**
```text
/
├── _inbox/
│   └── [product-folder-name]/   (e.g., "desi-vibes-hoodie")
│       ├── info.md              (The details file - see template below)
│       ├── image-01.jpg         (Main image)
│       └── image-02.jpg         (Lifestyle/Detail shot)
```

---

## 2. The `info.md` Template
Copy and paste this into your `info.md` file. The more "raw notes" you provide, the better the Agent can craft the story.

```markdown
# Product: [Insert Product Name]

**Category:** [Mugs | T-Shirts | Sweatshirts | Sports Jerseys]
**Price:** 0.00
**Is Customizable:** [true | false]

**Raw Notes:**
- [Key Feature 1, e.g., "Heavyweight cotton"]
- [Key Feature 2, e.g., "Gold foil print"]
- [Design Context: Explain the Hindi/Bengali pun or Bollywood reference here]
- [Vibe: "Cozy", "Funny", "Sarcastic", "Romantic"]

**SEO Keywords to Target:**
- [e.g., "Diwali Gift", "Shah Rukh Khan Fan", "Bengali Foodie"]
```

### Standard Tags (Mix & Match)
*   **Categories:** `"Men"`, `"Women"`, `"Unisex"`, `"Kids"`
*   **Themes:** `"Bollywood"`, `"Desi Humor"`, `"Foodie"`, `"Travel"`, `"Love & Romance"`
*   **Occasions:** `"Gift for Him"`, `"Gift for Her"`, `"Anniversary"`, `"Diwali"`, `"Durga Puja"`, `"Father's Day"`
*   **Vibe:** `"Trending"`, `"Boutique"`, `"Funny"`, `"Statement Piece"`

---

## 3. The CLI Commands
Once your folder is ready in `_inbox`, use these commands in the chat.

### Phase 1: Analyze & Draft
**Command:**
> "Process the new product in `_inbox/[your-folder-name]`. Analyze the notes and images, rewrite the description for our brand voice, and show me the proposed JSON."

*The Agent will:*
1.  Read your files.
2.  Write the "Boutique Story" description.
3.  Map the Category (e.g., "Mugs" → "Home & Garden > ... > Mugs").
4.  Show you the JSON data for approval.

### Phase 2: Deploy
**Command:**
> "Everything looks good. Upload the images, update the database, and deploy to live."

*The Agent will:*
1.  Upload images to Firebase Storage.
2.  Add the entry to `products.json`.
3.  Run `npm run build` (Safety Check).
4.  Run `firebase deploy`.

---

## 4. Safety & Troubleshooting

**"Wait, I want to see it first!"**
If you want to check the site locally before pushing to the public internet:

**Command:**
> "Upload and update the database, but do NOT deploy yet. Just run a local preview."

*Then, in your own terminal, run:*
```bash
npm run preview
# OR
firebase serve --only hosting
```
---

## 6. Walmart Integration (The "Template Injector")
We use Walmart's official Excel template to ensure 100% compliance with their bulk tool.

**IMPORTANT — Read first:** `docs/walmart/WALMART_UPLOAD_GUIDE.md`
This guide contains the exact column map, confirmed valid values for every closed-list field, product-type-specific field tables (Mugs vs T-Shirts vs Sweatshirts), variant grouping rules, SKU conventions, and a full error→fix reference. An agent must read this before generating any Walmart upload file.

**Reference script:** `scripts/inject_dhurander_walmart.mjs`
This is the working T-shirt injector. Copy and adapt it for new products. It contains the full column map and all correct field values confirmed through live upload testing.

**Setup:**
1.  Download the **"Full Item Spec"** (or specific Category Spec) from Walmart Seller Center.
2.  Save it as `walmart_template.xlsx` in the project root.

**Command:**
> "Generate the Walmart feed for [product name]."

*The Agent will:*
1.  Read `docs/walmart/WALMART_UPLOAD_GUIDE.md` to understand field rules for the product type.
2.  Copy `scripts/inject_dhurander_walmart.mjs` as a base, adapt for the new product.
3.  Inject data into `walmart_template.xlsx` (preserving macros/hidden sheets).
4.  Save to `output/walmart/[product-name]-walmart-upload.xlsx`.
5.  You upload this final file to Seller Center.
6.  If Walmart returns an error file, save it to `output/walmart/` — the agent will read the error column and fix the field.
