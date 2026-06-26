# Amazon Feed Generator - Quick Start Guide

## Step 1: Update Your Product Data

Open `src/data/products.json` and add Amazon-specific data to your product:

```json
{
  "id": "dil-se-valentines-heart-mug",
  "sku": "dil-se-valentines-heart-mug",
  "title": "\"Dil Se\" Custom Photo Mug with Heart Handle",
  "price": 19.99,
  "images": ["url1", "url2"],
  "description": "Your product description...",
  
  "marketplace": {
    "amazon": "active"
  },
  
  "amazonData": {
    "brandName": "The CustomHub",
    "title": "Personalized Valentine's Day Mug – Custom Photo Ceramic Coffee Cup with Red Heart Shaped Handle & Rim – Romantic Unique Gift for Couples, Him, Her, Boyfriend, Girlfriend - 11oz",
    "bulletPoints": [
      "UNIQUE HEART-SHAPED HANDLE - A signature red sculpted heart handle that makes every sip feel like a warm embrace",
      "PERSONALIZE WITH YOUR PHOTO - Upload your favorite memory to create a one-of-a-kind keepsake",
      "PREMIUM CERAMIC CONSTRUCTION - High-gloss white ceramic with romantic red rim",
      "PERFECT CAPACITY - 11oz size ideal for coffee, tea, or hot chocolate",
      "IDEAL ROMANTIC GIFT - Perfect for Valentine's Day, anniversaries, or birthdays"
    ],
    "keywords": "coffee mug, valentines gift, custom photo mug, ceramic cup, romantic gift",
    "specialFeatures": ["Microwave Safe", "Dishwasher Safe", "Heat Resistant"],
    "capacity": 11,
    "material": "Ceramic",
    "color": "White, Red",
    "countryOfOrigin": "US"
  },
  
  "specifications": {
    "capacity": { "value": 11, "unit": "fl oz" },
    "material": "Ceramic",
    "color": "White, Red",
    "hasHandle": true,
    "dishwasherSafe": true,
    "numberOfItems": 1,
    "includedComponents": "1 Mug"
  },
  
  "dimensions": {
    "item": { "height": 4, "width": 3.5, "unit": "inches" },
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

## Step 2: Test Your Data

Run the test script to validate your product data:

```bash
node src/amazon/test.js
```

This will show you:
- ✅ All mapped fields and their values
- ❌ Any missing required fields
- ⚠️  Any missing recommended fields

## Step 3: Generate Amazon Feed

Run the generator:

```bash
npm run amazon:generate
```

Or directly:

```bash
node src/amazon/generator.js
```

## Step 4: Upload to Amazon

1. Go to **Amazon Seller Central**
2. Navigate to: **Catalog > Add Products via Upload**
3. Click **Upload Your File**
4. Select: `output/amazon/amazon_upload_ready.tsv`
5. Click **Upload**

## Output Files

The generator creates two files in `output/amazon/`:

- **amazon_upload_ready.xlsx** - Full Excel template (for review)
- **amazon_upload_ready.tsv** - Upload file for Amazon (use this one)

## Required Fields Checklist

Make sure your product has these fields:

- [x] **SKU/ID** - Unique identifier
- [x] **Title** - Product name (max 200 chars)
- [x] **Brand Name** - Your brand
- [x] **Price** - Selling price
- [x] **Images** - At least 1 image URL
- [x] **Quantity** - Inventory count

## Recommended Fields Checklist

For better listings, add these:

- [x] **Bullet Points** - 5 key features (highly recommended!)
- [x] **Description** - Detailed product description
- [x] **Keywords** - Search terms
- [x] **Special Features** - Product attributes
- [x] **Capacity** - Size specification
- [x] **Material** - Product material
- [x] **Color** - Product color(s)
- [x] **Dimensions** - Item and package sizes

## Example Bullet Points

Good bullet points are:
- **ALL CAPS PREFIX** - Clear benefit or feature description
- Concise (under 200 characters)
- Focus on benefits, not just features
- Include key search terms naturally

Examples:
```
✅ UNIQUE HEART-SHAPED HANDLE - Makes every sip feel like a warm embrace
✅ PERSONALIZE WITH YOUR PHOTO - Create a one-of-a-kind keepsake
✅ PREMIUM CERAMIC CONSTRUCTION - High-gloss finish with romantic red rim
✅ PERFECT 11OZ CAPACITY - Ideal for coffee, tea, or hot chocolate
✅ IDEAL ROMANTIC GIFT - Perfect for Valentine's Day or anniversaries
```

## Troubleshooting

### "No products found for Amazon"

Add this to your product:
```json
"marketplace": {
  "amazon": "active"
}
```

### "Missing required field: Brand Name"

Add to your product:
```json
"amazonData": {
  "brandName": "Your Brand Name"
}
```

### "Template not found"

Ensure `docs/amazon/DRINKING_CUP.xlsm` exists in your project.

### TSV Upload Fails on Amazon

1. Check the TSV file starts with technical headers (not instructions)
2. Verify all required fields have values
3. Check for special characters in product data
4. Ensure image URLs are accessible

## Next Steps

After successful upload:

1. **Monitor Processing** - Check Amazon Seller Central for processing status
2. **Fix Errors** - Address any validation errors from Amazon
3. **Optimize Listing** - Add more images, enhance bullet points
4. **Add More Products** - Repeat for other products

## Need Help?

- See `src/amazon/README.md` for detailed documentation
- Check `src/amazon/example-product.json` for a complete example
- Review `docs/amazon/AMAZON_FEED_TROUBLESHOOTING.md` for common issues
