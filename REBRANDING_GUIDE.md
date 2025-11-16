# Rebranding Guide: Bengali → Indian Cultural Merchandise

## Overview
This guide documents the rebranding from "Bengali-focused" to "Indian cultural merchandise" to appeal to a broader audience while preserving cultural authenticity.

---

## ✅ Completed Updates

### Component Files
- ✅ `src/components/Header/index.jsx` - Search placeholder updated
- ✅ `src/components/Footer/index.jsx` - Footer description updated with inclusive language
- ✅ `src/pages/Home/index.jsx` - SEO, hero carousel, about section updated
- ✅ `src/pages/Contact/index.jsx` - SEO and descriptions updated
- ✅ `src/pages/CategoryPage/index.jsx` - SEO and descriptions updated
- ✅ `src/pages/SearchResults/index.jsx` - SEO and descriptions updated
- ✅ `src/pages/ProductDetail/index.jsx` - Keywords updated

### SEO & Meta Tags
- ✅ All page titles updated
- ✅ All meta descriptions updated
- ✅ All og:title and og:description tags updated
- ✅ All keywords updated

### HTML Meta Tags
- ✅ `index.html` - Already uses "Indian" terminology

---

## 📋 Replacement Rules

### General Replacements (Apply Everywhere)

| Old Text | New Text | Context |
|----------|----------|---------|
| "Bengali and Bollywood" | "Indian cultural and Bollywood" | General marketing |
| "Bengali cultural merchandise" | "Indian cultural merchandise" | General product descriptions |
| "Bengali heritage" | "Indian heritage" | General references |
| "Bengali community" | "Indian community" or "Indian diaspora" | Community references |
| "for Bengalis" | "for Indians" or "for the Indian diaspora" | Target audience |
| "Bengali pride" | "Indian pride" | General pride references |
| "Celebrate Bengali culture" | "Celebrate Indian culture" | Marketing language |

### Context-Specific Replacements

#### Product Titles
- ✅ **Update**: "Bengali T-Shirt" → "Indian T-Shirt" (generic)
- ❌ **Keep**: "Bengali Script Design" (specific design element)
- ❌ **Keep**: "Bengali New Year Shirt" (specific festival)
- ❌ **Keep**: "Pohela Boishakh" (specific Bengali festival name)

#### Product Descriptions
- ✅ **Update**: "As Bengalis and Indians..." → "As Indians living across..."
- ✅ **Update**: "for Bengalis in USA" → "for Indians in USA" or "for the Indian diaspora"
- ✅ **Update**: "Bengali-inspired" → "Indian-inspired" (if generic)
- ❌ **Keep**: References to specific Bengali festivals (Durga Puja, Bijoya Dashami, Pohela Boishakh)
- ❌ **Keep**: References to Bengali traditions, food, or cultural practices when describing specific items

#### Tags
- ✅ **Update**: "Bengali cultural t-shirt" → "Indian cultural t-shirt"
- ✅ **Update**: "Bengali merchandise" → "Indian merchandise"
- ❌ **Keep**: "Durga Puja t-shirt" (specific festival)
- ❌ **Keep**: "Bijoya Dashami shirt" (specific festival)
- ❌ **Keep**: "Bengali script" (specific design element)

---

## 🎯 Products.json Update Strategy

### Files to Update
- `src/data/products.json` (7992 lines - large file)

### Update Approach

#### 1. Product Titles
**Update generic references:**
```json
// BEFORE
"title": "Bengali T-Shirt - Cultural Design"

// AFTER
"title": "Indian Cultural T-Shirt - Traditional Design"
```

**Keep specific references:**
```json
// KEEP AS IS
"title": "Durga Puja Bengali Goddess Design T-Shirt"
"title": "Pohela Boishakh Bengali New Year Shirt"
```

#### 2. Product Descriptions
**Update marketing language:**
- "As Bengalis and Indians..." → "As Indians..."
- "for Bengalis in USA" → "for Indians in USA" or "for the Indian diaspora"
- "Bengali pride" → "Indian pride"
- "Bengali culture" → "Indian culture" (when generic)

**Keep specific cultural references:**
- Durga Puja descriptions
- Bijoya Dashami references
- Bengali festival names
- Specific Bengali traditions (when describing that specific tradition)

#### 3. Tags Array
**Update generic tags:**
```json
// BEFORE
"tags": [
  "Bengali cultural t-shirt",
  "Bengali merchandise",
  "gift for Bengali friend"
]

// AFTER
"tags": [
  "Indian cultural t-shirt",
  "Indian merchandise",
  "gift for Indian friend",
  "Indian diaspora"
]
```

**Keep specific tags:**
```json
// KEEP AS IS
"tags": [
  "Durga Puja t-shirt",
  "Bijoya Dashami shirt",
  "Bengali script design",
  "Pohela Boishakh"
]
```

---

## 🔍 Search & Replace Patterns

### Safe Replacements (Can be done globally)
```regex
# In product descriptions and marketing text:
"Bengali and Bollywood" → "Indian cultural and Bollywood"
"Bengali cultural merchandise" → "Indian cultural merchandise"
"for Bengalis" → "for Indians" or "for the Indian diaspora"
"Bengali community" → "Indian community"
"Bengali heritage" → "Indian heritage" (when generic)
```

### Context-Dependent (Review manually)
- Product titles containing "Bengali"
- Tags containing "Bengali"
- Descriptions mentioning specific Bengali festivals (keep as is)

---

## 📝 Example Updates

### Example 1: Generic Product Description
**BEFORE:**
```json
{
  "description": "Celebrate Bengali culture with this unique t-shirt. Perfect for Bengalis in the USA and Canada."
}
```

**AFTER:**
```json
{
  "description": "Celebrate Indian culture with this unique t-shirt. Perfect for Indians in the USA and Canada, and the Indian diaspora worldwide."
}
```

### Example 2: Specific Cultural Product (Keep Specific References)
**BEFORE:**
```json
{
  "title": "Durga Puja T-Shirt - Bengali Goddess Design",
  "description": "For Bengalis celebrating Durga Puja, this t-shirt features the Bengali goddess Durga..."
}
```

**AFTER:**
```json
{
  "title": "Durga Puja T-Shirt - Bengali Goddess Design",
  "description": "For Indians celebrating Durga Puja, this t-shirt features the Bengali goddess Durga. Perfect for the Bengali community and all who celebrate this festival..."
}
```
*Note: Keep "Bengali goddess" and "Bengali community" when referring to the specific cultural context*

### Example 3: Tags Update
**BEFORE:**
```json
{
  "tags": [
    "Bengali cultural t-shirt",
    "Bengali merchandise",
    "gift for Bengali friend in USA",
    "Durga Puja t-shirt"
  ]
}
```

**AFTER:**
```json
{
  "tags": [
    "Indian cultural t-shirt",
    "Indian merchandise",
    "gift for Indian friend in USA",
    "Indian diaspora",
    "Durga Puja t-shirt"
  ]
}
```

---

## ⚠️ Important Notes

### DO Update:
- Generic marketing language
- Target audience references ("for Bengalis" → "for Indians")
- General cultural references ("Bengali culture" → "Indian culture" when generic)
- SEO keywords and meta descriptions
- Site-wide copy and branding

### DO NOT Update:
- Specific festival names (Durga Puja, Bijoya Dashami, Pohela Boishakh)
- Specific cultural practices when describing that practice
- Product names that reference Bengali as a design element
- Authentic cultural references that are Bengali-specific

### Preserve Authenticity:
- If a product is SPECIFICALLY about Bengali culture (e.g., "Bengali New Year Shirt"), keep "Bengali" in the title
- If describing a Bengali-specific tradition, keep the specificity
- Balance inclusivity with authenticity

---

## 🚀 Implementation Checklist

### Phase 1: Component Files ✅ COMPLETE
- [x] Header component
- [x] Footer component
- [x] Home page
- [x] Contact page
- [x] Category page
- [x] Search results page
- [x] Product detail page

### Phase 2: SEO & Meta ✅ COMPLETE
- [x] All page titles
- [x] All meta descriptions
- [x] All og:tags
- [x] All keywords

### Phase 3: Products.json ⏳ IN PROGRESS
- [ ] Review product titles (update generic, keep specific)
- [ ] Update product descriptions (marketing language only)
- [ ] Update tags array (generic tags only)
- [ ] Preserve specific cultural references

### Phase 4: Documentation
- [x] Create rebranding guide
- [ ] Update README.md (if needed)
- [ ] Update any other documentation files

---

## 📊 Statistics

- **Total files updated**: 7 component files
- **SEO updates**: 6 pages
- **Products.json**: ~200+ products (needs careful review)
- **Estimated Bengali references**: 742+ occurrences (from grep)

---

## 🎯 Brand Messaging

### New Brand Positioning
**Before:** "Bengali & Bollywood Cultural Merchandise"
**After:** "Indian Cultural Merchandise & Bollywood Products"

### Key Messages
1. **Inclusive**: "Celebrating the rich diversity of Indian culture"
2. **Authentic**: "From Bengali traditions to Tamil heritage, Punjabi festivals to Marathi celebrations"
3. **Broad Appeal**: "For the Indian diaspora worldwide"
4. **Cultural Heritage**: "Honoring Indian cultural heritage through unique, high-quality merchandise"

---

## 📞 Questions or Issues?

If you encounter a reference that's unclear whether to update:
1. Is it describing a specific Bengali tradition/festival? → **Keep as is**
2. Is it generic marketing language? → **Update to "Indian"**
3. Is it a product name with "Bengali" as a design element? → **Keep as is**
4. Is it targeting "Bengalis" as audience? → **Update to "Indians" or "Indian diaspora"**

---

**Last Updated**: [Current Date]
**Status**: Component files and SEO complete. Products.json needs careful manual review.

