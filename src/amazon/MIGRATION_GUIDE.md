# Migration Guide: Adding Amazon Data to Existing Products

## Overview

This guide shows how to enhance your existing products in `products.json` with Amazon-specific data for successful Amazon listings.

## Current Product Structure

Your existing product (dil-se-valentines-heart-mug) currently has:

```json
{
  "id": "dil-se-valentines-heart-mug",
  "title": "\"Dil Se\" Custom Photo Mug with Heart Handle",
  "vendor": "The CustomHub",
  "category": "Home & Garden > Kitchen & Dining > Tableware > Drinkware > Mugs",
  "type": "Coffee and Tea Cups",
  "marketplace": {
    "amazon": "active"
  },
  "price": 19.99,
  "description": "Capture a moment...",
  "isCustomizable": true,
  "images": [...],
  "inStock": true,
  "tags": [...]
}
```

## What to Add

### Step 1: Add Amazon-Specific Data

Add an `amazonData` object with these fields:

```json
{
  "id": "dil-se-valentines-heart-mug",
  "title": "\"Dil Se\" Custom Photo Mug with Heart Handle",
  "vendor": "The CustomHub",
  "price": 19.99,
  "description": "...",
  "images": [...],
  "tags": [...],
  
  "marketplace": {
    "amazon": "active"
  },
  
  "amazonData": {
    "brandName": "The CustomHub",
    "title": "Personalized Valentine's Day Mug – Custom Photo Ceramic Coffee Cup with Red Heart Shaped Handle & Rim – Romantic Unique Gift for Couples, Him, Her, Boyfriend, Girlfriend - 11oz",
    "bulletPoints": [
      "UNIQUE HEART-SHAPED HANDLE - A signature red sculpted heart handle that makes every sip feel like a warm embrace",
      "PERSONALIZE WITH YOUR PHOTO - Upload your favorite memory to create a one-of-a-kind keepsake that celebrates your unique bond",
      "PREMIUM CERAMIC CONSTRUCTION - High-gloss white ceramic with a matching romantic red rim for a polished, boutique aesthetic",
      "PERFECT CAPACITY - 11oz size ideal for your morning coffee, tea, or hot chocolate",
      "IDEAL ROMANTIC GIFT - Perfect for Valentine's Day, anniversaries, birthdays, or just to say \"I love you\""
    ],
    "keywords": "coffee mug, valentines gift, custom photo mug, ceramic cup, romantic gift, heart handle mug, personalized mug, photo mug, couple gift",
    "specialFeatures": [
      "Microwave Safe",
      "Dishwasher Safe",
      "Heat Resistant",
      "Custom Photo Print",
      "Heart-Shaped Handle"
    ],
    "capacity": 11,
    "material": "Ceramic",
    "color": "White, Red",
    "countryOfOrigin": "US",
    "manufacturer": "The CustomHub",
    "itemTypeKeyword": "coffee-mugs",
    "fulfillmentChannel": "DEFAULT",
    "quantity": 100,
    "price": 19.99
  }
}
```

### Step 2: Add Specifications

Add detailed specifications:

```json
{
  "specifications": {
    "capacity": {
      "value": 11,
      "unit": "fl oz"
    },
    "material": "Ceramic",
    "color": "White, Red",
    "hasHandle": true,
    "dishwasherSafe": true,
    "microwaveSafe": true,
    "numberOfItems": 1,
    "includedComponents": "1 Mug"
  }
}
```

### Step 3: Add Dimensions

Add item and package dimensions:

```json
{
  "dimensions": {
    "item": {
      "height": 4,
      "width": 3.5,
      "unit": "inches"
    },
    "package": {
      "length": 5,
      "width": 5,
      "height": 5,
      "weight": 1,
      "weightUnit": "pounds",
      "unit": "inches"
    }
  }
}
```

### Step 4: Add Country of Origin

Add at the top level:

```json
{
  "countryOfOrigin": "US"
}
```

## Complete Enhanced Product

Here's the complete structure:

```json
{
  "id": "dil-se-valentines-heart-mug",
  "sku": "dil-se-valentines-heart-mug",
  "title": "\"Dil Se\" Custom Photo Mug with Heart Handle",
  "vendor": "The CustomHub",
  "category": "Home & Garden > Kitchen & Dining > Tableware > Drinkware > Mugs",
  "type": "Coffee and Tea Cups",
  "price": 19.99,
  "description": "Capture a moment that speaks directly from the heart with our \"Dil Se\" (From the Heart) Personalization Series. \n\n- **Signature Heart Handle:** A unique, sculpted red heart handle that makes every sip feel like a warm embrace.\n- **Premium Ceramic Finish:** High-gloss white ceramic with a matching romantic red rim for a polished, boutique aesthetic.\n- **Your Story, Your Way:** Seamlessly add your favorite photo to create a co-created masterpiece that celebrates your unique bond.\n\nWhether it's for a first Valentine's or a silver anniversary, this isn't just a mug—it's a daily \"Cultural Easter Egg\" of your love story. Add your personal touch below to make this a truly one-of-a-kind piece.",
  "isCustomizable": true,
  "customization": {
    "type": "photo-upload",
    "label": "Upload Your Memory",
    "instructions": "For best results, use a high-resolution square image."
  },
  "images": [
    "https://firebasestorage.googleapis.com/v0/b/thecustomhub-efb8a.firebasestorage.app/o/images%2Fdil-se-valentines-heart-mug-01.jpg?alt=media",
    "https://firebasestorage.googleapis.com/v0/b/thecustomhub-efb8a.firebasestorage.app/o/images%2Fdil-se-valentines-heart-mug-02.jpg?alt=media"
  ],
  "inStock": true,
  "tags": [
    "Valentines Day",
    "Custom Gift",
    "Couple Mug",
    "Heart Handle",
    "Romantic Gift"
  ],
  "marketplace": {
    "amazon": "active",
    "walmart": {
      "price": 19.99
    }
  },
  "amazonData": {
    "brandName": "The CustomHub",
    "title": "Personalized Valentine's Day Mug – Custom Photo Ceramic Coffee Cup with Red Heart Shaped Handle & Rim – Romantic Unique Gift for Couples, Him, Her, Boyfriend, Girlfriend - 11oz",
    "bulletPoints": [
      "UNIQUE HEART-SHAPED HANDLE - A signature red sculpted heart handle that makes every sip feel like a warm embrace",
      "PERSONALIZE WITH YOUR PHOTO - Upload your favorite memory to create a one-of-a-kind keepsake that celebrates your unique bond",
      "PREMIUM CERAMIC CONSTRUCTION - High-gloss white ceramic with a matching romantic red rim for a polished, boutique aesthetic",
      "PERFECT CAPACITY - 11oz size ideal for your morning coffee, tea, or hot chocolate",
      "IDEAL ROMANTIC GIFT - Perfect for Valentine's Day, anniversaries, birthdays, or just to say \"I love you\""
    ],
    "keywords": "coffee mug, valentines gift, custom photo mug, ceramic cup, romantic gift, heart handle mug, personalized mug, photo mug, couple gift",
    "specialFeatures": [
      "Microwave Safe",
      "Dishwasher Safe",
      "Heat Resistant",
      "Custom Photo Print",
      "Heart-Shaped Handle"
    ],
    "capacity": 11,
    "material": "Ceramic",
    "color": "White, Red",
    "countryOfOrigin": "US",
    "manufacturer": "The CustomHub",
    "itemTypeKeyword": "coffee-mugs",
    "fulfillmentChannel": "DEFAULT",
    "quantity": 100,
    "price": 19.99
  },
  "specifications": {
    "capacity": {
      "value": 11,
      "unit": "fl oz"
    },
    "material": "Ceramic",
    "color": "White, Red",
    "hasHandle": true,
    "dishwasherSafe": true,
    "microwaveSafe": true,
    "numberOfItems": 1,
    "includedComponents": "1 Mug"
  },
  "dimensions": {
    "item": {
      "height": 4,
      "width": 3.5,
      "unit": "inches"
    },
    "package": {
      "length": 5,
      "width": 5,
      "height": 5,
      "weight": 1,
      "weightUnit": "pounds",
      "unit": "inches"
    }
  },
  "countryOfOrigin": "US"
}
```

## Field-by-Field Guide

### amazonData.brandName
**What**: Your registered Amazon brand name
**Example**: `"The CustomHub"`
**Required**: Yes
**Tips**: Must match your brand registry

### amazonData.title
**What**: Optimized Amazon product title (max 200 chars)
**Example**: `"Personalized Valentine's Day Mug – Custom Photo Ceramic Coffee Cup with Red Heart Shaped Handle & Rim – Romantic Unique Gift for Couples, Him, Her, Boyfriend, Girlfriend - 11oz"`
**Required**: Yes
**Tips**: 
- Include key features
- Add size/capacity
- Use natural language
- Include main keywords

### amazonData.bulletPoints (Array of 5)
**What**: Key product features/benefits
**Example**: `"UNIQUE HEART-SHAPED HANDLE - A signature red sculpted heart handle that makes every sip feel like a warm embrace"`
**Required**: Highly recommended
**Format**: `"ALL CAPS FEATURE - Benefit description"`
**Tips**:
- Use all 5 slots
- Start with feature name in caps
- Follow with benefit
- Keep under 200 chars each
- Include keywords naturally

### amazonData.keywords
**What**: Search terms (backend keywords)
**Example**: `"coffee mug, valentines gift, custom photo mug, ceramic cup, romantic gift"`
**Required**: Highly recommended
**Tips**:
- Comma-separated
- Include variations
- Add use cases
- Don't repeat title words excessively

### amazonData.specialFeatures (Array)
**What**: Product attributes for filtering
**Example**: `["Microwave Safe", "Dishwasher Safe", "Heat Resistant"]`
**Required**: Recommended
**Tips**: Use standard terms Amazon recognizes

### amazonData.capacity
**What**: Size/volume (numeric)
**Example**: `11`
**Required**: Yes for drinkware
**Unit**: Specified in specifications.capacity.unit

### amazonData.material
**What**: Primary material
**Example**: `"Ceramic"`
**Required**: Recommended
**Tips**: Use standard material names

### amazonData.color
**What**: Product color(s)
**Example**: `"White, Red"`
**Required**: Recommended
**Tips**: Comma-separated if multiple

### amazonData.countryOfOrigin
**What**: Manufacturing country (ISO code)
**Example**: `"US"` or `"CN"`
**Required**: Yes
**Tips**: Use 2-letter country codes

### amazonData.manufacturer
**What**: Manufacturing company name
**Example**: `"The CustomHub"`
**Required**: Recommended

### amazonData.itemTypeKeyword
**What**: Amazon category refinement
**Example**: `"coffee-mugs"`
**Required**: Optional
**Tips**: Use Amazon's standard keywords

### amazonData.fulfillmentChannel
**What**: How you fulfill orders
**Example**: `"DEFAULT"` (Merchant Fulfilled) or `"AMAZON_NA"` (FBA)
**Required**: Yes
**Default**: `"DEFAULT"`

### amazonData.quantity
**What**: Available inventory
**Example**: `100`
**Required**: Yes
**Tips**: Set realistic inventory levels

### amazonData.price
**What**: Selling price (USD)
**Example**: `19.99`
**Required**: Yes
**Tips**: Can override top-level price

## Testing Your Changes

After adding the data:

```bash
# 1. Validate the JSON syntax
node -e "JSON.parse(require('fs').readFileSync('src/data/products.json', 'utf8'))"

# 2. Test the field mapping
node src/amazon/test.js

# 3. Generate the feed
npm run amazon:generate
```

## Common Mistakes to Avoid

### ❌ Don't
- Use generic titles: "Mug"
- Skip bullet points
- Use all lowercase bullets: "has a heart handle"
- Repeat same keyword 10 times
- Leave capacity blank for drinkware
- Use non-standard material names

### ✅ Do
- Use descriptive titles with key features
- Write all 5 bullet points
- Use proper format: "FEATURE - Benefit"
- Use varied, relevant keywords
- Include capacity for all drinkware
- Use standard Amazon terms

## Checklist

Before generating your Amazon feed:

- [ ] Added `marketplace.amazon = "active"`
- [ ] Added `amazonData` object
- [ ] Wrote optimized title (with capacity)
- [ ] Wrote 5 bullet points (ALL CAPS format)
- [ ] Added search keywords
- [ ] Listed special features
- [ ] Specified capacity (11oz)
- [ ] Specified material (Ceramic)
- [ ] Specified color(s)
- [ ] Added country of origin
- [ ] Added specifications object
- [ ] Added dimensions (item + package)
- [ ] Tested with `node src/amazon/test.js`
- [ ] Generated feed with `npm run amazon:generate`

## Next Steps

1. Update your product in `src/data/products.json`
2. Run `node src/amazon/test.js` to validate
3. Run `npm run amazon:generate` to create feed
4. Upload `output/amazon/amazon_upload_ready.tsv` to Amazon

## Need Help?

- See `src/amazon/example-product.json` for a complete example
- Check `src/amazon/QUICKSTART.md` for quick instructions
- Review `docs/amazon/AMAZON_GENERATOR_GUIDE.md` for detailed guide
