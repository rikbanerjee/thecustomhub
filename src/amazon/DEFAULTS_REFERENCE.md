# Default Configuration Reference Card

## Quick Reference - Coffee Mugs

### 🏷️ Brand & Manufacturing
```
Brand Name: Green-Chili
Manufacturer: The CustomHub
Country of Origin: US
```

### 📏 Specifications
```
Capacity: 11 fl oz
Material: Ceramic
Has Handle: Yes
Dishwasher Safe: Yes
Microwave Safe: Yes
Number of Items: 1
Included Components: 1 Mug
```

### ⭐ Special Features (Auto-filled)
```
1. Microwave Safe
2. Dishwasher Safe
3. Heat Resistant
4. Durable
```

### 📐 Item Dimensions
```
Height: 3.76 inches
Width: 4.7 inches
```

### 📦 Package Dimensions
```
Length: 6 inches
Width: 5 inches
Height: 4 inches
Weight: 0.4 pounds
```

### 🚚 Fulfillment
```
Method: DEFAULT (Merchant Fulfilled)
Default Inventory: 20 units
Item Type Keyword: coffee-mugs
Product Type: drinking_cup
```

### 💰 Pricing
```
Default Price: $19.99
```

---

## What You Need to Provide

### ✅ Required (5 fields)
1. **ID/SKU** - Unique identifier
2. **Title** - Product name
3. **Amazon Title** - Optimized title with 11oz
4. **Bullet Points** - 5 feature/benefit statements
5. **Images** - At least 1 image URL

### ⭐ Recommended (3 fields)
6. **Description** - Detailed product description
7. **Keywords** - Search terms
8. **Color** - If different from white

### 🔧 Optional Overrides
- Price (if different from $19.99)
- Capacity (if different from 11oz)
- Dimensions (if different sizes)
- Special features (if additional features)

---

## Minimal Product Example

```json
{
  "id": "my-mug-id",
  "title": "My Mug Title",
  "price": 19.99,
  "images": ["https://..."],
  "marketplace": { "amazon": "active" },
  "amazonData": {
    "title": "Optimized Title - 11oz",
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

**Everything else auto-fills!**

---

## Override Example

```json
{
  "id": "large-mug",
  "amazonData": {
    "capacity": 15,     // Override: 15oz
    "price": 24.99      // Override: $24.99
  },
  "dimensions": {
    "item": {
      "height": 5,      // Override: Larger
      "width": 5
    }
  }
}
```

---

## Testing Commands

```bash
# Test defaults configuration
node src/amazon/test-defaults.js

# Test your product data
node src/amazon/test.js

# Generate Amazon feed
npm run amazon:generate
```

---

## Files

- **Configuration**: `src/amazon/productDefaults.js`
- **Guidance**: `src/amazon/AGENT_GUIDANCE.md`
- **This Reference**: `src/amazon/DEFAULTS_REFERENCE.md`
