# Agent Guidance Document - Adding New Products to Amazon

## Overview

This document provides step-by-step guidance for adding new products to Amazon. Most fields are auto-filled from defaults - you only need to provide product-specific information.

## Default Configuration (Coffee Mugs)

The following values are **automatically applied** to all coffee mug products:

### Brand & Manufacturing (Auto-filled)
- ✅ **Brand Name**: Green-Chili
- ✅ **Manufacturer**: The CustomHub
- ✅ **Country of Origin**: US

### Specifications (Auto-filled)
- ✅ **Capacity**: 11 fl oz
- ✅ **Material**: Ceramic
- ✅ **Has Handle**: Yes
- ✅ **Dishwasher Safe**: Yes
- ✅ **Microwave Safe**: Yes
- ✅ **Number of Items**: 1
- ✅ **Included Components**: 1 Mug

### Special Features (Auto-filled)
- ✅ Microwave Safe
- ✅ Dishwasher Safe
- ✅ Heat Resistant
- ✅ Durable

### Dimensions (Auto-filled)
**Item Dimensions:**
- ✅ Height: 3.76 inches
- ✅ Width: 4.7 inches

**Package Dimensions:**
- ✅ Length: 6 inches
- ✅ Width: 5 inches
- ✅ Height: 4 inches
- ✅ Weight: 0.4 pounds

### Fulfillment (Auto-filled)
- ✅ **Fulfillment Method**: DEFAULT (Merchant Fulfilled)
- ✅ **Default Inventory**: 20 units
- ✅ **Item Type Keyword**: coffee-mugs
- ✅ **Product Type**: drinking_cup
- ✅ **Default Price**: $19.99

## What You MUST Provide

For each new product, you only need to provide these **5 essential fields**:

### 1. Product ID/SKU ⚠️ REQUIRED
```json
"id": "unique-product-id",
"sku": "unique-product-id"
```
**Example**: `"dil-se-valentines-heart-mug"`

### 2. Title ⚠️ REQUIRED
```json
"title": "Short descriptive title"
```
**Example**: `"\"Dil Se\" Custom Photo Mug with Heart Handle"`

### 3. Amazon Optimized Title ⚠️ REQUIRED
```json
"amazonData": {
  "title": "Optimized Amazon Title with Key Features - 11oz"
}
```
**Format**: `[Main Feature] – [Secondary Features] – [Use Case/Benefit] - [Size]`

**Example**: 
```
"Personalized Valentine's Day Mug – Custom Photo Ceramic Coffee Cup with Red Heart Shaped Handle & Rim – Romantic Unique Gift for Couples, Him, Her, Boyfriend, Girlfriend - 11oz"
```

**Tips**:
- Include size (11oz)
- Add key features
- Include use case/occasion
- Target audience
- Max 200 characters

### 4. Bullet Points (5) ⚠️ REQUIRED
```json
"amazonData": {
  "bulletPoints": [
    "FEATURE 1 - Benefit description",
    "FEATURE 2 - Benefit description",
    "FEATURE 3 - Benefit description",
    "FEATURE 4 - Benefit description",
    "FEATURE 5 - Benefit description"
  ]
}
```

**Format**: `ALL CAPS FEATURE NAME - Clear benefit or description`

**Example**:
```json
"bulletPoints": [
  "UNIQUE HEART-SHAPED HANDLE - A signature red sculpted heart handle that makes every sip feel like a warm embrace",
  "PERSONALIZE WITH YOUR PHOTO - Upload your favorite memory to create a one-of-a-kind keepsake that celebrates your unique bond",
  "PREMIUM CERAMIC CONSTRUCTION - High-gloss white ceramic with a matching romantic red rim for a polished, boutique aesthetic",
  "PERFECT CAPACITY - 11oz size ideal for your morning coffee, tea, or hot chocolate",
  "IDEAL ROMANTIC GIFT - Perfect for Valentine's Day, anniversaries, birthdays, or just to say \"I love you\""
]
```

### 5. Images ⚠️ REQUIRED
```json
"images": [
  "https://url-to-image-1.jpg",
  "https://url-to-image-2.jpg"
]
```
**Requirements**:
- At least 1 image (main image)
- Recommended: 3-5 images
- Min resolution: 1000x1000px
- White background for main image
- Show product from multiple angles

## What You SHOULD Provide (Highly Recommended)

### 6. Description
```json
"description": "Detailed product description with key features and benefits"
```
**Tips**:
- 2-3 paragraphs
- Include key features
- Mention use cases
- Add emotional appeal

### 7. Keywords
```json
"amazonData": {
  "keywords": "keyword1, keyword2, keyword3, keyword4"
}
```
**Example**: `"coffee mug, valentines gift, custom photo mug, ceramic cup, romantic gift, heart handle mug, personalized mug"`

**Tips**:
- Comma-separated
- Include variations (mug, cup, tumbler)
- Add use cases (gift, valentine, anniversary)
- Include material and features
- Don't repeat title words excessively

### 8. Color (if different from white)
```json
"specifications": {
  "color": "White, Red"
}
```

### 9. Price (if different from $19.99)
```json
"price": 24.99
```

## Minimal Product Structure

Here's the **absolute minimum** you need to add to `products.json`:

```json
{
  "id": "your-product-id",
  "sku": "your-product-id",
  "title": "Your Product Title",
  "price": 19.99,
  "description": "Your product description...",
  "images": [
    "https://your-image-url.jpg"
  ],
  "marketplace": {
    "amazon": "active"
  },
  "amazonData": {
    "title": "Optimized Amazon Title - 11oz",
    "bulletPoints": [
      "FEATURE 1 - Benefit",
      "FEATURE 2 - Benefit",
      "FEATURE 3 - Benefit",
      "FEATURE 4 - Benefit",
      "FEATURE 5 - Benefit"
    ],
    "keywords": "keyword1, keyword2, keyword3"
  }
}
```

**Everything else auto-fills from defaults!**

## Complete Product Structure (Recommended)

For best results, use this structure:

```json
{
  "id": "your-product-id",
  "sku": "your-product-id",
  "title": "Your Product Title",
  "vendor": "The CustomHub",
  "category": "Home & Garden > Kitchen & Dining > Tableware > Drinkware > Mugs",
  "type": "Coffee and Tea Cups",
  "price": 19.99,
  "description": "Detailed product description...",
  "images": [
    "https://image-1.jpg",
    "https://image-2.jpg",
    "https://image-3.jpg"
  ],
  "tags": ["tag1", "tag2", "tag3"],
  "inStock": true,
  "marketplace": {
    "amazon": "active"
  },
  "amazonData": {
    "title": "Optimized Amazon Title - 11oz",
    "bulletPoints": [
      "FEATURE 1 - Benefit",
      "FEATURE 2 - Benefit",
      "FEATURE 3 - Benefit",
      "FEATURE 4 - Benefit",
      "FEATURE 5 - Benefit"
    ],
    "keywords": "keyword1, keyword2, keyword3",
    "color": "White, Red"
  }
}
```

## Override Defaults (When Needed)

If a specific product has different specs, you can override any default:

```json
{
  "id": "large-mug",
  "amazonData": {
    "capacity": 15,  // Override: 15oz instead of 11oz
    "price": 24.99   // Override: Different price
  },
  "dimensions": {
    "item": {
      "height": 5,   // Override: Larger size
      "width": 5
    }
  }
}
```

## Step-by-Step Process

### Step 1: Create Product Entry
Add to `src/data/products.json`:
```json
{
  "id": "new-mug-id",
  "title": "New Mug Title",
  "price": 19.99,
  "images": ["url"],
  "marketplace": { "amazon": "active" },
  "amazonData": {
    "title": "Optimized Title - 11oz",
    "bulletPoints": ["...", "...", "...", "...", "..."],
    "keywords": "..."
  }
}
```

### Step 2: Test
```bash
node src/amazon/test.js
```
This will show you all fields (including auto-filled defaults).

### Step 3: Generate
```bash
npm run amazon:generate
```

### Step 4: Upload
Upload `output/amazon/amazon_upload_ready.tsv` to Amazon Seller Central.

## Writing Great Bullet Points

### ✅ Good Examples
```
"UNIQUE DESIGN FEATURE - Explains the benefit and emotional appeal"
"PREMIUM QUALITY MATERIAL - Highlights durability and value"
"PERFECT FOR OCCASIONS - Lists specific use cases"
"EASY CARE INSTRUCTIONS - Practical benefit for daily use"
"IDEAL GIFT CHOICE - Target audience and gifting occasions"
```

### ❌ Bad Examples
```
"has a handle"  // Too short, no benefit
"made of ceramic"  // Just a fact, no appeal
"good quality"  // Vague, no specifics
"nice mug"  // Not descriptive
```

### Formula
```
[ALL CAPS FEATURE] - [Specific benefit] + [Emotional appeal/practical value]
```

## Keyword Research Tips

### Include These Keyword Types:
1. **Product Type**: mug, cup, tumbler, drinkware
2. **Material**: ceramic, porcelain
3. **Size**: 11oz, medium, standard
4. **Features**: heart handle, custom photo, personalized
5. **Use Case**: coffee, tea, hot chocolate
6. **Occasion**: valentine, anniversary, birthday, christmas
7. **Audience**: couples, him, her, boyfriend, girlfriend
8. **Benefit**: romantic, unique, custom, personalized

### Example Keyword Set:
```
"coffee mug, ceramic cup, 11oz mug, personalized gift, custom photo mug, valentine gift, anniversary gift, romantic mug, couple gift, heart handle mug, photo mug, custom cup"
```

## Color Naming

Use standard Amazon color names:
- ✅ "White"
- ✅ "Black"
- ✅ "Red"
- ✅ "Blue"
- ✅ "White, Red" (multiple colors)
- ❌ "Off-white" (use "White")
- ❌ "Crimson" (use "Red")

## Image Guidelines

### Main Image (Required)
- White background
- Product centered
- 1000x1000px minimum
- Shows entire product
- No text overlays
- No props

### Additional Images (Recommended)
- Image 2: Side view or detail shot
- Image 3: Lifestyle shot (in use)
- Image 4: Size reference
- Image 5: Packaging or another angle

## Price Guidelines

**Default**: $19.99

**When to adjust**:
- Premium features: +$3-5
- Larger size: +$2-4
- Special materials: +$5-10
- Limited edition: +$3-5

**Competitive Range**: $15.99 - $24.99

## Inventory Management

**Default**: 20 units per product

**Adjust based on**:
- Popular products: 50-100 units
- New/test products: 10-20 units
- Seasonal items: 30-50 units

## Common Mistakes to Avoid

### ❌ Don't
1. Skip bullet points
2. Use generic titles like "Mug"
3. Forget to add images
4. Use non-standard measurements
5. Leave keywords empty
6. Copy-paste same bullets for all products
7. Use special characters in SKU
8. Forget to set `marketplace.amazon = "active"`

### ✅ Do
1. Write all 5 bullet points
2. Create descriptive, keyword-rich titles
3. Add 3-5 high-quality images
4. Use standard units (fl oz, inches, pounds)
5. Research and add relevant keywords
6. Customize bullets for each product
7. Use simple alphanumeric SKUs
8. Mark products for Amazon

## Testing Checklist

Before generating the feed, verify:

- [ ] Product has unique ID/SKU
- [ ] Title is descriptive
- [ ] Amazon title is optimized (with 11oz)
- [ ] All 5 bullet points written
- [ ] At least 1 image URL provided
- [ ] Keywords added
- [ ] `marketplace.amazon = "active"` is set
- [ ] Price is set (or using default $19.99)
- [ ] Run `node src/amazon/test.js` successfully

## Quick Reference

### Minimal Required Fields
1. `id` / `sku`
2. `title`
3. `images` (at least 1)
4. `marketplace.amazon = "active"`
5. `amazonData.title`
6. `amazonData.bulletPoints` (5 items)

### Auto-Filled Fields (60+ fields)
- Brand, manufacturer, country
- Capacity, material, features
- Dimensions (item + package)
- Fulfillment, inventory
- Special features
- Compliance fields
- And more...

## Support

- **Test your data**: `node src/amazon/test.js`
- **Generate feed**: `npm run amazon:generate`
- **Example**: See `src/amazon/example-product.json`
- **Defaults**: See `src/amazon/productDefaults.js`
- **Documentation**: See `src/amazon/README.md`

---

**Remember**: With defaults configured, you only need to provide product-specific info (title, bullets, images, keywords). Everything else is automatic! 🚀
