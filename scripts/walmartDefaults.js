/**
 * Walmart bulk-upload defaults & column map.
 *
 * Mirrors the Amazon `src/amazon/productDefaults.js` pattern: the generic
 * injector (`inject_walmart_feed.js`) merges COMMON_DEFAULTS + the matching
 * TYPE_DEFAULTS + per-product overrides (`walmartData.fields`) for every row.
 *
 * All values here were confirmed through live Walmart upload testing — see
 * docs/walmart/WALMART_UPLOAD_GUIDE.md for the full reference and error→fix table.
 */

// ── Column map ────────────────────────────────────────────────────────────────
// Indices come from row 5 (API names) of `walmart_template.xlsx`, sheet
// "Product Content And Site Exp". These are the BASE template positions BEFORE
// the second `variantAttributeNames` column is inserted at 114. The injector
// shifts any index >= INSERT_COL by +1 at runtime when that column is inserted.
export const COL = {
  sku:                 3,
  specProductType:     4,
  productIdType:       5,
  productId:           6,
  productName:         7,
  brand:               8,
  price:               9,
  ShippingWeight:      10,
  country:             11,
  fulfillmentCenterID: 12,
  quantity:            13,
  shortDescription:    15,
  keyFeatures1:        16,
  keyFeatures2:        17,
  keyFeatures3:        18,
  mainImageUrl:        19,
  countPerPack:        20,
  multipackQuantity:   21,
  isProp65:            22,
  color:               23,
  condition:           24,
  has_warranty:        25,
  netContentUnit:      26,
  netContentMeasure:   27,
  ageGroup:            28,
  shirtNeckStyle:      37,
  clothingSize:        38,
  clothingSizeGroup:   39,
  clothingStyle:       40,
  clothingTopStyle:    41,
  colorCategory:       42,
  cupAndMugType:       43,
  fabricCare:          44,
  materialPct:         45,
  materialName:        46,
  gender:              47,
  material:            48,
  sleeveLengthStyle:   49,
  smallParts:          50,
  stateChemical:       51,
  count:               53,
  volumeMeasure:       54,
  volumeUnit:          55,
  zippered:            56,
  extraImg1:           60,
  extraImg2:           61,
  extraImg3:           62,
  manufacturer:        82,
  tShirtType:          106,
  variantGroupId:      112,
  variantAttrNames:    113, // "color"
  isPrimaryVariant:    114, // shifts → 115 when the size column is inserted
  swatchVariantAttr:   115, // shifts → 116 when the size column is inserted
  startDate:           128, // shifts → 129 when the size column is inserted
};

// The second `variantAttributeNames` column ("clothingSize") is inserted here
// for size-variant products. See WALMART_UPLOAD_GUIDE.md golden rule #5.
export const INSERT_COL = 114;

// ── Defaults applied to every row, any product type ──────────────────────────
export const COMMON_DEFAULTS = {
  productIdType:       'GTIN',                       // GTIN exemption
  productId:           'custom',                     // confirmed exemption format
  country:             'United States',
  fulfillmentCenterID: '10002931712',                // TheCustomHub's confirmed FC ID
  quantity:            10,
  countPerPack:        1,
  multipackQuantity:   1,
  isProp65:            'No',
  condition:           'New',
  has_warranty:        'No',
  ageGroup:            'Adult',
  netContentUnit:      'Each',
  netContentMeasure:   1,
  smallParts:          '0 - No warning applicable',  // full string — "0" alone errors
  stateChemical:       'None',
  count:               1,
};

// ── Per-product-type defaults (keyed by Walmart specProductType) ─────────────
export const TYPE_DEFAULTS = {
  'T-Shirts': {
    shirtNeckStyle:    'Crew Neck',
    clothingSizeGroup: 'Men',                         // "Men" for unisex adult; "Regular" is invalid
    clothingStyle:     'Streetwear',                  // ONE value only in bulk upload
    clothingTopStyle:  'Cocoon',                      // valid value for a standard crew-neck tee
    fabricCare:        'Machine Wash Cold; Tumble Dry Low; Do Not Bleach; Do Not Iron Directly on Print',
    materialPct:       100,
    materialName:      'Cotton',
    gender:            'Unisex',
    material:          'Cotton',
    sleeveLengthStyle: 'Short Sleeve',
    tShirtType:        'Graphic Tees',                // plural — "Graphic Tee" is invalid
    zippered:          'N',
    ShippingWeight:    0.5,
  },
  'Cups & Mugs': {
    cupAndMugType:     'Mug',
    material:          'Ceramic',
    volumeMeasure:     11,
    volumeUnit:        'fl oz',
    ShippingWeight:    1,
  },
};

// Maps the site's product `type` field → Walmart `specProductType`.
const TYPE_TO_SPEC = {
  'T-Shirts':            'T-Shirts',
  'Sweatshirts':         'Sweatshirts & Hoodies',
  'Coffee and Tea Cups': 'Cups & Mugs',
};

/**
 * Resolve the Walmart specProductType for a product.
 * `walmartData.specProductType` wins; otherwise derive from the site `type`.
 */
export function detectSpecProductType(product) {
  return product.walmartData?.specProductType || TYPE_TO_SPEC[product.type] || product.type;
}
