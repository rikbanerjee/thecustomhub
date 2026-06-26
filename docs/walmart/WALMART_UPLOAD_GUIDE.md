# Walmart Bulk Upload Guide – The CustomHub

This document captures everything learned from uploading Mugs and T-Shirts to Walmart Seller Center via bulk Excel. Read this before generating any new Walmart upload file.

---

## The Golden Rules (Apply to ALL product types)

1. **Always inject into `walmart_template.xlsx`** — never create a standalone Excel file with custom headers. Walmart's system requires the official template with all its hidden sheets and macros intact.
2. **Data starts at row 7 (index 6)** — rows 1–6 are Walmart's header metadata. Never overwrite them.
3. **GTIN Exemption**: Set `productIdType = "GTIN"` and `productId = "custom"` on every row. This is the approved exemption pattern for TheCustomHub.
4. **`(+)` fields accept only ONE value per cell in bulk upload.** Do NOT comma-separate multiple values (e.g. `"Streetwear,Casual"` will error). If you need multiple values (e.g. Clothing Style), upload with one value and add the rest manually in Seller Center after the listing is live.
5. **`variantAttributeNames` requires one column per variant dimension.** For color+size products, you need TWO columns — col 113 = `"color"`, col 114 = `"clothingSize"`. The second column must be **inserted into the template** by shifting all cells at col 114+ one step right (for the 6 header rows), copying the `variantAttributeNames` header from col 113 to col 114, and updating all merge ranges. The hidden sheet (`Hidden_product_content_and_sit`) is a data dictionary — it does NOT reference column positions, so insertion is safe. After insertion: `isPrimaryVariant`=115, `swatchVariantAttribute`=116, `startDate`=129. Without both columns, Walmart treats all sizes of the same color as duplicate listings.
6. **`fulfillmentCenterID`** = `10002931712` (TheCustomHub's confirmed Walmart FC ID). Do NOT leave blank or use `"0"` — both will error.
7. **Closed-list fields must use exact strings** — always check this guide or the Data Definitions sheet for valid values. Even small differences like `"Graphic Tee"` vs `"Graphic Tees"` will fail.
8. **Image URLs must use Firebase Hosting** — Walmart rejects both Firebase Storage URL formats (`firebasestorage.googleapis.com/v0/b/...?alt=media` has encoded path + query param; `storage.googleapis.com/...` returns 403). Instead, copy product images to `public/product-images/{product-folder}/` and deploy (`npm run deploy`). Use the custom domain: `https://thecustomhub.com/product-images/{folder}/{filename.jpg}`

---

## Column Map (Template Version 5.0, Sheet: "Product Content And Site Exp")

These column indices come from row 5 (API names) of the official template. They are stable as long as the template version doesn't change.

| Col | API Field Name | Notes |
|-----|---------------|-------|
| 3   | `sku` | Unique SKU per variant |
| 4   | `specProductType` | **Product-type-specific** — see table below |
| 5   | `productIdType` | Always `"GTIN"` (exemption) |
| 6   | `productId` | Always `"custom"` (exemption) |
| 7   | `productName` | Max 199 chars. Include color+size in name for SEO |
| 8   | `brand` | `"The CustomHub"` |
| 9   | `price` | Selling price (decimal) |
| 10  | `ShippingWeight` | In lbs |
| 11  | `country_of_origin_substantial_transformation` | `"United States"` |
| 12  | `fulfillmentCenterID` | `10002931712` — TheCustomHub's confirmed FC ID. Never blank or `"0"`. |
| 13  | `quantity` | Inventory count |
| 15  | `shortDescription` | Max 100,000 chars. This is the main description on item page |
| 16  | `keyFeatures` | Key Feature bullet 1 |
| 17  | `keyFeatures` | Key Feature bullet 2 |
| 18  | `keyFeatures` | Key Feature bullet 3 |
| 19  | `mainImageUrl` | MAIN image URL — must be first/best image |
| 20  | `countPerPack` | `1` |
| 21  | `multipackQuantity` | `1` |
| 22  | `isProp65WarningRequired` | `"No"` |
| 23  | `color` | Exact color name (e.g. `"Black"`, `"White"`) |
| 24  | `condition` | `"New"` |
| 25  | `has_written_warranty` | `"No"` |
| 26  | `productNetContentUnit` | **Product-type-specific** — see table below |
| 27  | `productNetContentMeasure` | **Product-type-specific** — see table below |
| 28  | `ageGroup` | `"Adult"` |
| 37  | `shirtNeckStyle` | T-Shirts only |
| 38  | `clothingSize` | T-Shirts only — `S`, `M`, `L`, `XL`, `2XL` |
| 39  | `clothingSizeGroup` | T-Shirts only — see valid values |
| 40  | `clothingStyle` | T-Shirts only — ONE value only |
| 41  | `clothingTopStyle` | T-Shirts only — see valid values |
| 42  | `colorCategory` | Same as color (e.g. `"Black"`) |
| 43  | `cup_and_mug_type` | Mugs only — `"Mug"` |
| 44  | `fabricCareInstructions` | T-Shirts only |
| 45  | `materialPercentage` | T-Shirts only — `100` |
| 46  | `materialName` | T-Shirts only — `"Cotton"` |
| 47  | `gender` | T-Shirts only — `"Unisex"` |
| 48  | `material` | Material string — `"Cotton"`, `"Ceramic"`, etc. |
| 49  | `sleeveLengthStyle` | T-Shirts only — `"Short Sleeve"` |
| 50  | `smallPartsWarnings` | Full string: `"0 - No warning applicable"` |
| 51  | `state_chemical_disclosure` | `"None"` |
| 53  | `count` (Total Count) | `1` |
| 54  | `measure` (Volume Capacity) | Mugs only — `11` |
| 55  | `unit` (Volume Capacity) | Mugs only — `"fl oz"` |
| 56  | `zippered` | `"N"` (required for T-Shirts) |
| 60  | `productSecondaryImageURL` | Additional image 1 |
| 61  | `productSecondaryImageURL` | Additional image 2 |
| 62  | `productSecondaryImageURL` | Additional image 3 |
| 82  | `manufacturer` | `"The CustomHub"` |
| 106 | `t_shirt_type` | T-Shirts only — see valid values |
| 112 | `variantGroupId` | Same value for all variants in group |
| 113 | `variantAttributeNames` | `"color"` |
| 114 | `variantAttributeNames` | `"clothingSize"` — **inserted column** (shifts 114+ right by 1) |
| 115 | `isPrimaryVariant` | `"Yes"` for one row per group, `"No"` for rest (was 114) |
| 116 | `swatchVariantAttribute` | `"color"` (was 115) |
| 128 | `startDate` | Today's date `YYYY-MM-DD` |

---

## Product-Type Field Reference

### Mugs (`specProductType = "Cups & Mugs"`)

| Field | Value |
|-------|-------|
| `specProductType` | `"Cups & Mugs"` |
| `cup_and_mug_type` (col 43) | `"Mug"` |
| `material` (col 48) | `"Ceramic"` |
| `productNetContentUnit` (col 26) | `"Each"` |
| `productNetContentMeasure` (col 27) | `1` |
| Volume Capacity measure (col 54) | `11` |
| Volume Capacity unit (col 55) | `"fl oz"` |
| `ShippingWeight` (col 10) | `1` (lbs) |
| `zippered` | Not required |
| Clothing fields (cols 37–49) | Leave blank |

### T-Shirts (`specProductType = "T-Shirts"`)

| Field | Confirmed Valid Value | Notes |
|-------|-----------------------|-------|
| `specProductType` | `"T-Shirts"` | Exact — not "Shirts", not "T-Shirt" |
| `t_shirt_type` (col 106) | `"Graphic Tees"` | Not "Graphic Tee" |
| `clothingTopStyle` (col 41) | `"Cocoon"` | Valid: Crop, Pullover, Raglan, Ringer, Cutout, Cocoon, Muscle, High-Low |
| `clothingSizeGroup` (col 39) | `"Men"` | For unisex adult. "Regular" is INVALID |
| `clothingStyle` (col 40) | `"Streetwear"` | ONE value only in bulk. Add more via Seller Center UI |
| `shirtNeckStyle` (col 37) | `"Crew Neck"` | |
| `sleeveLengthStyle` (col 49) | `"Short Sleeve"` | |
| `gender` (col 47) | `"Unisex"` | |
| `clothingSize` (col 38) | `S`, `M`, `L`, `XL`, `2XL` | One per row |
| `material` (col 48) | `"Cotton"` | |
| `materialName` (col 46) | `"Cotton"` | |
| `materialPercentage` (col 45) | `100` | |
| `fabricCareInstructions` (col 44) | `"Machine Wash Cold; Tumble Dry Low; Do Not Bleach; Do Not Iron Directly on Print"` | |
| `productNetContentUnit` (col 26) | `"Each"` | Required — blank = error |
| `productNetContentMeasure` (col 27) | `1` | Required — blank = error |
| `count` Total Count (col 53) | `1` | Required — blank = error |
| `zippered` (col 56) | `"N"` | Required — blank = error |
| `smallPartsWarnings` (col 50) | `"0 - No warning applicable"` | Full string — `"0"` alone is INVALID |
| `ShippingWeight` (col 10) | `0.5` (lbs) | |

### Sweatshirts (`specProductType = "Sweatshirts & Hoodies"`)

Not yet tested. Expected to share most T-Shirt clothing fields. Key differences:
- `t_shirt_type` → not applicable, use `sweatshirt_and_hoodie_type` (col 52) instead
- `clothingTopStyle` → likely `"Pullover"` or `"Hoodie"`
- `zippered` → `"Y"` if hoodie with zip, `"N"` otherwise

---

## Variant Grouping Pattern

For any product with color and/or size variants:

```
variantGroupId    → same unique ID for ALL rows in the group (e.g. "TCH-DHURANDER-TEE-GRP")
variantAttrNames  → "color"  (single value — Walmart infers size from clothingSize)
isPrimaryVariant  → "Yes" for exactly ONE row, "No" for all others
swatchVariantAttr → "color"
```

The primary variant row controls the image shown in search results. Always make it the most popular/hero color+size (e.g. Black/S or Black/M).

---

## SKU Naming Convention

```
TCH-[PRODUCT-CODE]-[COLOR-CODE]-[SIZE]

Examples:
  TCH-DHURANDER-TEE-BLK-S
  TCH-DHURANDER-TEE-BLK-2XL
  TCH-DHURANDER-TEE-WHT-M
```

For variant group ID append `-GRP`:
```
  TCH-DHURANDER-TEE-GRP
```

---

## How to Generate a New Upload File

1. Copy `scripts/inject_dhurander_walmart.mjs` and rename it for the new product.
2. Update: images, product name, SKUs, description, key features, variant list, prices.
3. Set `specProductType` from the table above based on product type.
4. Fill in the product-type-specific fields from the table above.
5. Run: `node scripts/inject_[product-name]_walmart.mjs`
6. Output saved to `output/walmart/[product-name]-walmart-upload.xlsx`.
7. Upload to Walmart Seller Center → Item Setup → Bulk Item Upload.
8. If error file is returned, save it to `output/walmart/` and ask the agent to read and fix it.

---

## Common Errors & Fixes

| Error | Cause | Fix |
|-------|-------|-----|
| `Product Identifiers is a required attribute` | `productIdType` and `productId` blank | Set to `"GTIN"` and `"custom"` |
| `'X' is not a valid Unit for 'T-Shirt Type'` | Wrong value | Must be exactly `"Graphic Tees"` (plural) |
| `'T-Shirt' is not a valid Unit for 'Clothing Top Style'` | Wrong value | Use `"Cocoon"` for standard crew-neck tees |
| `'Regular' is not a valid Unit for 'Clothing Size Group'` | Wrong value | Use `"Men"` for unisex adult |
| `'Graphic' is not a valid Unit for 'Clothing Style'` | Wrong value | Use `"Streetwear"` |
| `'Leisure,Loungewear,...' is not valid for 'Clothing Style'` | Comma-separated list | Only ONE value allowed per cell in bulk upload |
| `'0' is not a valid Unit for 'Small Parts Warning Code'` | Wrong format | Must be full string: `"0 - No warning applicable"` |
| `Fulfillment Center ID is invalid` | Set to `"0"` | Leave **blank** — `"0"` is invalid. Blank = self-fulfilled. |
| Sizes M/L/XL/2XL are duplicates of S | Only `"color"` in `variantAttributeNames` | Insert a second `variantAttributeNames` column at 114 = `"clothingSize"`. The hidden sheet is a data dictionary (not column-position-based), so insertion is safe. See `inject_dhurander_walmart.mjs` for the exact shifting logic. |
| `Total Count is a required attribute` | Field blank | Set to `1` |
| `Net Content is a required attribute` | Fields blank | Set unit=`"Each"`, measure=`1` |
| `Zippered is a required attribute` | Field blank | Set to `"N"` |
