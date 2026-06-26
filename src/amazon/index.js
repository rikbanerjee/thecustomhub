/**
 * Amazon Feed Generator - Main Export
 * 
 * Usage:
 *   import { generateAmazonFeed } from './src/amazon/index.js';
 *   
 *   const result = await generateAmazonFeed({
 *     productsPath: './src/data/products.json',
 *     outputExcelPath: './output/amazon/feed.xlsx',
 *     outputTsvPath: './output/amazon/feed.tsv',
 *     generateTsv: true,
 *     verbose: true
 *   });
 */

export { generateAmazonFeed, runCLI } from './generator.js';
export { getAllFieldMappings, getFieldValue } from './fieldMapping.js';
export {
  readTemplate,
  getHeaders,
  clearDataRows,
  injectProducts,
  updateSheetRange,
  writeWorkbook,
  convertToTSV
} from './templateHandler.js';
