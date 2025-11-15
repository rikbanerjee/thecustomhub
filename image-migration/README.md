# Shopify to Firebase Image Migration Tool

This Python application automates the migration of product images from Shopify CDN to Firebase Storage. It processes `products.json`, extracts all image URLs (from both product images and variant images), downloads them, and uploads them to Firebase Storage while maintaining a mapping of original URLs to new Firebase URLs.

## Features

- ✅ Extracts unique image URLs from `products.json` (both `images` array and `variantImg` fields)
- ✅ Downloads images from Shopify CDN
- ✅ Uploads images to Firebase Storage in the `images/` folder
- ✅ Prevents duplicate uploads (checks if file already exists)
- ✅ Generates URL mapping file (`shopify_to_firebase_image_map.json`)
- ✅ Comprehensive error handling and progress reporting
- ✅ Summary statistics after migration

## Prerequisites

1. **Python 3.7+** installed on your system
2. **Firebase Project** with Storage enabled
3. **Firebase Service Account Key** (JSON file)

## Setup

### 1. Install Python Dependencies

```bash
cd image-migration
pip install -r requirements.txt
```

Or install individually:
```bash
pip install firebase-admin requests
```

### 2. Get Firebase Service Account Key

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project (e.g., `thecustomhub`)
3. Navigate to **Project Settings** (gear icon) > **Service Accounts**
4. Click **Generate New Private Key**
5. Save the downloaded JSON file as `serviceAccountKey.json` in the `image-migration` folder

**Important**: Keep this file secure and never commit it to version control!

### 3. Verify products.json Path

The script expects `products.json` at `../src/data/products.json` (relative to the script location).

You can also specify a custom path as a command-line argument:
```bash
python image_upload.py /path/to/products.json
```

### 4. Configure Settings (Optional)

Edit `image_upload.py` to customize:
- `FIREBASE_STORAGE_BUCKET`: Your Firebase Storage bucket name (default: `thecustomhub.appspot.com`)
- `STORAGE_FOLDER`: Folder path in Firebase Storage (default: `images/`)
- `SERVICE_ACCOUNT_FILE`: Path to service account JSON (default: `serviceAccountKey.json`)

## Usage

### Basic Usage

```bash
cd image-migration
python image_upload.py
```

### Custom products.json Path

```bash
python image_upload.py /path/to/your/products.json
```

### What the Script Does

1. **Initializes Firebase** with your service account
2. **Loads products.json** and extracts all unique image URLs
3. **For each image URL**:
   - Checks if it already exists in Firebase Storage (skips if found)
   - Downloads the image to a temporary directory
   - Uploads to Firebase Storage (`images/` folder)
   - Records the mapping from original URL to Firebase URL
4. **Saves mapping** to `shopify_to_firebase_image_map.json`
5. **Prints summary** of successful/failed uploads

## Output

### URL Mapping File

After successful migration, the script creates `shopify_to_firebase_image_map.json` with the following structure:

```json
{
  "https://cdn.shopify.com/.../image1.jpg": {
    "status": "success",
    "firebase_url": "https://storage.googleapis.com/thecustomhub.appspot.com/images/image1.jpg",
    "storage_path": "images/image1.jpg",
    "filename": "image1.jpg"
  },
  "https://cdn.shopify.com/.../image2.jpg": {
    "status": "skipped_existing",
    "firebase_url": "https://storage.googleapis.com/thecustomhub.appspot.com/images/image2.jpg",
    "storage_path": "images/image2.jpg",
    "filename": "image2.jpg"
  }
}
```

**Status values:**
- `success`: Image uploaded successfully
- `skipped_existing`: Image already existed in storage
- `download_failed`: Failed to download from Shopify
- `upload_failed`: Failed to upload to Firebase
- `error`: Other errors

### Console Output

The script provides real-time progress updates:
```
[1/150] Processing: https://cdn.shopify.com/.../image.jpg
  📥 Downloading...
  📤 Uploading to Firebase Storage...
  ✅ Success! Firebase URL: https://storage.googleapis.com/...
```

At the end, it prints a summary:
```
============================================================
MIGRATION SUMMARY
============================================================
Total images processed:     150
✅ Successfully uploaded:   145
⏭️  Skipped (existing):     3
❌ Download failed:         1
❌ Upload failed:           1
⚠️  Other errors:           0
============================================================
```

## Using the URL Mapping

After migration, you can use `shopify_to_firebase_image_map.json` to update your `products.json` file:

```python
import json

# Load mapping
with open('shopify_to_firebase_image_map.json', 'r') as f:
    mapping = json.load(f)

# Load products
with open('../src/data/products.json', 'r') as f:
    products = json.load(f)

# Update product images
for product in products:
    if 'images' in product:
        product['images'] = [
            mapping.get(url, {}).get('firebase_url', url)
            for url in product['images']
        ]
    
    # Update variant images
    if 'variants' in product:
        for variant in product['variants']:
            if 'variantImg' in variant and variant['variantImg']:
                variant['variantImg'] = mapping.get(
                    variant['variantImg'], {}
                ).get('firebase_url', variant['variantImg'])

# Save updated products
with open('../src/data/products_updated.json', 'w') as f:
    json.dump(products, f, indent=2)
```

## Error Handling

The script handles various error scenarios gracefully:

- **Network errors**: Retries or skips failed downloads
- **Firebase errors**: Logs error details in mapping file
- **Duplicate files**: Automatically skips if file already exists
- **Invalid URLs**: Logs and continues with next image
- **Interruptions**: Saves progress up to interruption point

## Troubleshooting

### "Service account file not found"
- Ensure `serviceAccountKey.json` is in the `image-migration` folder
- Check the filename matches exactly (case-sensitive)

### "products.json not found"
- Verify the path is correct: `../src/data/products.json`
- Or specify custom path: `python image_upload.py /path/to/products.json`

### "Firebase initialization failed"
- Verify your service account JSON is valid
- Check that Firebase Storage is enabled in your Firebase project
- Ensure the bucket name is correct

### "Permission denied" errors
- Ensure your service account has Storage Admin permissions
- Check Firebase Storage rules allow uploads

### Download/Upload failures
- Check internet connection
- Verify image URLs are accessible
- Check Firebase Storage quota/limits
- Review error messages in mapping file

## Future Enhancements

The script includes comments marking areas for potential expansion:

- **Batch uploads**: Upload multiple files in parallel for faster migration
- **Progress bar**: Visual progress indicator (e.g., using `tqdm`)
- **Retry logic**: Automatic retries for failed downloads/uploads
- **Rate limiting**: Configurable delays to avoid hitting API limits
- **Image optimization**: Resize/compress images before upload
- **Resume capability**: Resume migration from last successful upload
- **Public access**: Option to make uploaded images publicly accessible

## File Structure

```
image-migration/
├── image_upload.py          # Main migration script
├── requirements.txt         # Python dependencies
├── README.md               # This file
├── .gitignore              # Git ignore file (excludes sensitive files)
├── serviceAccountKey.json  # Firebase service account (NOT in git)
└── shopify_to_firebase_image_map.json  # Generated mapping file
```

## Security Notes

- ⚠️ **Never commit `serviceAccountKey.json` to version control**
- ⚠️ The `.gitignore` file excludes sensitive files
- ⚠️ Keep your service account key secure and limit its permissions

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review the error messages in the console and mapping file
3. Verify Firebase Storage is properly configured

---

**Note**: This tool is designed to run independently and does not modify the existing codebase. All outputs are in the `image-migration` folder.

