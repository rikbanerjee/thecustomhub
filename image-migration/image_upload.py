#!/usr/bin/env python3
"""
Shopify to Firebase Image Migration Tool

This script migrates product images from Shopify CDN to Firebase Storage.
It processes products.json, extracts image URLs, downloads them, and uploads
to Firebase Storage while maintaining a mapping of old to new URLs.

Requirements:
- Firebase service account JSON file
- products.json file in the parent directory (or specify path)
- Python packages: firebase-admin, requests

Author: Image Migration Tool
Date: 2024
"""

import os
import json
import sys
import tempfile
import shutil
from pathlib import Path
from urllib.parse import urlparse, parse_qs
from typing import Dict, List, Set, Tuple
import time

try:
    import firebase_admin
    from firebase_admin import credentials, storage
    import requests
except ImportError as e:
    print(f"Error: Missing required package. Please install: pip install firebase-admin requests")
    print(f"Details: {e}")
    sys.exit(1)


# ============================================================================
# CONFIGURATION
# ============================================================================

# Path to Firebase service account JSON file
SERVICE_ACCOUNT_FILE = "serviceAccountKey.json"

# Path to products.json (default: parent directory)
PRODUCTS_JSON_PATH = "../src/data/products.json"

# Firebase Storage bucket name (default: 'thecustomhub.appspot.com' from config)
FIREBASE_STORAGE_BUCKET = "thecustomhub-efb8a.firebasestorage.app"

# Firebase Storage folder path for images
STORAGE_FOLDER = "images/"

# Output mapping file
MAPPING_FILE = "shopify_to_firebase_image_map.json"

# Temporary directory for downloaded images
TEMP_DIR = tempfile.mkdtemp(prefix="shopify_images_")


# ============================================================================
# UTILITY FUNCTIONS
# ============================================================================

def extract_filename_from_url(url: str) -> str:
    """
    Extract filename from URL, removing query parameters.
    
    Example:
        https://cdn.shopify.com/.../image.jpg?v=123456
        -> image.jpg
    """
    parsed = urlparse(url)
    filename = os.path.basename(parsed.path)
    return filename or "image.jpg"


def sanitize_filename(filename: str) -> str:
    """
    Sanitize filename for Firebase Storage (remove special chars if needed).
    Currently preserves original filename, but can be extended.
    """
    # Remove any problematic characters (optional - currently preserves original)
    # filename = filename.replace(" ", "_").replace("&", "and")
    return filename


def get_all_image_urls(products: List[Dict]) -> Set[str]:
    """
    Extract all unique image URLs from products.json.
    
    Searches both:
    - product['images'] array
    - variant['variantImg'] field in all variants
    
    Returns:
        Set of unique image URLs
    """
    image_urls: Set[str] = set()
    
    for product in products:
        # Extract from main images array
        if "images" in product and isinstance(product["images"], list):
            for img_url in product["images"]:
                if img_url and isinstance(img_url, str):
                    image_urls.add(img_url)
        
        # Extract from variant images
        if "variants" in product and isinstance(product["variants"], list):
            for variant in product["variants"]:
                if "variantImg" in variant and variant["variantImg"]:
                    if isinstance(variant["variantImg"], str):
                        image_urls.add(variant["variantImg"])
    
    return image_urls


def download_image(url: str, local_path: str, timeout: int = 30) -> bool:
    """
    Download image from URL to local path.
    
    Args:
        url: Image URL to download
        local_path: Local file path to save image
        timeout: Request timeout in seconds
        
    Returns:
        True if successful, False otherwise
    """
    try:
        response = requests.get(url, timeout=timeout, stream=True)
        response.raise_for_status()
        
        # Ensure directory exists
        os.makedirs(os.path.dirname(local_path), exist_ok=True)
        
        # Write file
        with open(local_path, 'wb') as f:
            for chunk in response.iter_content(chunk_size=8192):
                f.write(chunk)
        
        return True
    except requests.exceptions.RequestException as e:
        print(f"  ⚠️  Download failed: {e}")
        return False
    except Exception as e:
        print(f"  ⚠️  Unexpected error during download: {e}")
        return False


def upload_to_firebase_storage(
    local_path: str,
    storage_path: str,
    bucket_name: str
) -> Tuple[bool, str]:
    """
    Upload image file to Firebase Storage.
    
    Args:
        local_path: Path to local image file
        storage_path: Path in Firebase Storage (e.g., 'images/filename.jpg')
        bucket_name: Firebase Storage bucket name
        
    Returns:
        Tuple of (success: bool, public_url: str or error_message: str)
    """
    try:
        bucket = storage.bucket(bucket_name)
        blob = bucket.blob(storage_path)
        
        # Set metadata for public access
        blob.metadata = {"migrated_from": "shopify"}
        
        # Upload file
        blob.upload_from_filename(local_path)
        
        # Make blob publicly accessible (optional - uncomment if needed)
        # blob.make_public()
        
        # Get public URL
        public_url = blob.public_url
        
        return True, public_url
    except Exception as e:
        return False, str(e)


def check_file_exists_in_storage(storage_path: str, bucket_name: str) -> bool:
    """
    Check if file already exists in Firebase Storage to avoid duplicates.
    
    Args:
        storage_path: Path in Firebase Storage
        bucket_name: Firebase Storage bucket name
        
    Returns:
        True if file exists, False otherwise
    """
    try:
        bucket = storage.bucket(bucket_name)
        blob = bucket.blob(storage_path)
        return blob.exists()
    except Exception:
        return False


# ============================================================================
# MAIN MIGRATION LOGIC
# ============================================================================

def initialize_firebase(service_account_path: str, bucket_name: str) -> bool:
    """
    Initialize Firebase Admin SDK with service account.
    
    Args:
        service_account_path: Path to service account JSON file
        bucket_name: Firebase Storage bucket name
        
    Returns:
        True if successful, False otherwise
    """
    try:
        # Check if already initialized
        if firebase_admin._apps:
            print("✓ Firebase already initialized")
            return True
        
        # Initialize with service account
        if not os.path.exists(service_account_path):
            print(f"❌ Error: Service account file not found: {service_account_path}")
            print("   Please download your service account key from Firebase Console:")
            print("   Project Settings > Service Accounts > Generate New Private Key")
            return False
        
        cred = credentials.Certificate(service_account_path)
        firebase_admin.initialize_app(cred, {
            'storageBucket': bucket_name
        })
        
        print(f"✓ Firebase initialized with bucket: {bucket_name}")
        return True
    except Exception as e:
        print(f"❌ Error initializing Firebase: {e}")
        return False


def load_products(products_path: str) -> List[Dict]:
    """
    Load products.json file.
    
    Args:
        products_path: Path to products.json file
        
    Returns:
        List of product dictionaries
    """
    try:
        if not os.path.exists(products_path):
            print(f"❌ Error: products.json not found at: {products_path}")
            return []
        
        with open(products_path, 'r', encoding='utf-8') as f:
            products = json.load(f)
        
        print(f"✓ Loaded {len(products)} products from {products_path}")
        return products
    except json.JSONDecodeError as e:
        print(f"❌ Error: Invalid JSON in products.json: {e}")
        return []
    except Exception as e:
        print(f"❌ Error loading products.json: {e}")
        return []


def migrate_images(
    image_urls: Set[str],
    bucket_name: str,
    storage_folder: str,
    temp_dir: str,
    skip_existing: bool = True
) -> Dict[str, Dict]:
    """
    Main migration function: download and upload all images.
    
    Args:
        image_urls: Set of image URLs to migrate
        bucket_name: Firebase Storage bucket name
        storage_folder: Folder path in Firebase Storage
        temp_dir: Temporary directory for downloads
        skip_existing: Whether to skip files that already exist in storage
        
    Returns:
        Dictionary mapping original URLs to migration results
    """
    url_mapping: Dict[str, Dict] = {}
    total = len(image_urls)
    
    print(f"\n📦 Starting migration of {total} unique images...")
    print(f"   Temporary directory: {temp_dir}")
    print(f"   Storage folder: {storage_folder}\n")
    
    for idx, url in enumerate(sorted(image_urls), 1):
        print(f"[{idx}/{total}] Processing: {url}")
        
        # Extract filename
        filename = extract_filename_from_url(url)
        filename = sanitize_filename(filename)
        storage_path = os.path.join(storage_folder, filename).replace("\\", "/")
        
        # Check if already exists
        if skip_existing and check_file_exists_in_storage(storage_path, bucket_name):
            print(f"  ⏭️  Already exists in storage, skipping...")
            # Get existing URL
            try:
                bucket = storage.bucket(bucket_name)
                blob = bucket.blob(storage_path)
                public_url = blob.public_url
                url_mapping[url] = {
                    "status": "skipped_existing",
                    "firebase_url": public_url,
                    "storage_path": storage_path,
                    "filename": filename
                }
            except Exception as e:
                url_mapping[url] = {
                    "status": "error",
                    "error": f"Failed to get existing URL: {e}",
                    "storage_path": storage_path,
                    "filename": filename
                }
            continue
        
        # Download image
        local_path = os.path.join(temp_dir, filename)
        print(f"  📥 Downloading...")
        if not download_image(url, local_path):
            url_mapping[url] = {
                "status": "download_failed",
                "storage_path": storage_path,
                "filename": filename
            }
            continue
        
        # Upload to Firebase
        print(f"  📤 Uploading to Firebase Storage...")
        success, result = upload_to_firebase_storage(local_path, storage_path, bucket_name)
        
        if success:
            print(f"  ✅ Success! Firebase URL: {result}")
            url_mapping[url] = {
                "status": "success",
                "firebase_url": result,
                "storage_path": storage_path,
                "filename": filename
            }
        else:
            print(f"  ❌ Upload failed: {result}")
            url_mapping[url] = {
                "status": "upload_failed",
                "error": result,
                "storage_path": storage_path,
                "filename": filename
            }
        
        # Clean up local file (optional - keep for debugging)
        # os.remove(local_path)
        
        # Small delay to avoid rate limiting (optional)
        time.sleep(0.1)
    
    return url_mapping


def save_mapping(mapping: Dict[str, Dict], output_file: str):
    """
    Save URL mapping to JSON file.
    
    Args:
        mapping: Dictionary mapping original URLs to migration results
        output_file: Output file path
    """
    try:
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(mapping, f, indent=2, ensure_ascii=False)
        print(f"\n✓ URL mapping saved to: {output_file}")
    except Exception as e:
        print(f"❌ Error saving mapping file: {e}")


def print_summary(mapping: Dict[str, Dict]):
    """
    Print summary of migration results.
    
    Args:
        mapping: Dictionary mapping original URLs to migration results
    """
    total = len(mapping)
    success = sum(1 for v in mapping.values() if v.get("status") == "success")
    skipped = sum(1 for v in mapping.values() if v.get("status") == "skipped_existing")
    download_failed = sum(1 for v in mapping.values() if v.get("status") == "download_failed")
    upload_failed = sum(1 for v in mapping.values() if v.get("status") == "upload_failed")
    errors = sum(1 for v in mapping.values() if v.get("status") == "error")
    
    print("\n" + "="*60)
    print("MIGRATION SUMMARY")
    print("="*60)
    print(f"Total images processed:     {total}")
    print(f"✅ Successfully uploaded:   {success}")
    print(f"⏭️  Skipped (existing):     {skipped}")
    print(f"❌ Download failed:         {download_failed}")
    print(f"❌ Upload failed:           {upload_failed}")
    print(f"⚠️  Other errors:            {errors}")
    print("="*60)
    
    # Show failed URLs if any
    failed = [
        (url, info) for url, info in mapping.items()
        if info.get("status") not in ("success", "skipped_existing")
    ]
    if failed:
        print("\n⚠️  Failed Images:")
        for url, info in failed[:10]:  # Show first 10
            print(f"  - {url}")
            print(f"    Status: {info.get('status')}, Error: {info.get('error', 'N/A')}")
        if len(failed) > 10:
            print(f"  ... and {len(failed) - 10} more (see mapping file for details)")


# ============================================================================
# MAIN EXECUTION
# ============================================================================

def main():
    """Main entry point for the migration script."""
    print("="*60)
    print("SHOPIFY TO FIREBASE IMAGE MIGRATION TOOL")
    print("="*60)
    print()
    
    # Resolve paths relative to script location
    script_dir = Path(__file__).parent.absolute()
    service_account_path = script_dir / SERVICE_ACCOUNT_FILE
    products_path = script_dir / PRODUCTS_JSON_PATH
    
    # Allow override via environment variables or command line args
    if len(sys.argv) > 1:
        products_path = Path(sys.argv[1])
    
    # Initialize Firebase
    if not initialize_firebase(str(service_account_path), FIREBASE_STORAGE_BUCKET):
        print("\n❌ Failed to initialize Firebase. Exiting.")
        sys.exit(1)
    
    # Load products
    products = load_products(str(products_path))
    if not products:
        print("\n❌ No products loaded. Exiting.")
        sys.exit(1)
    
    # Extract image URLs
    print("\n🔍 Extracting image URLs from products...")
    image_urls = get_all_image_urls(products)
    print(f"✓ Found {len(image_urls)} unique image URLs")
    
    if not image_urls:
        print("\n⚠️  No image URLs found in products.json. Exiting.")
        sys.exit(0)
    
    # Migrate images
    try:
        url_mapping = migrate_images(
            image_urls,
            FIREBASE_STORAGE_BUCKET,
            STORAGE_FOLDER,
            TEMP_DIR,
            skip_existing=True
        )
    except KeyboardInterrupt:
        print("\n\n⚠️  Migration interrupted by user.")
        url_mapping = {}
    except Exception as e:
        print(f"\n❌ Unexpected error during migration: {e}")
        import traceback
        traceback.print_exc()
        url_mapping = {}
    
    # Save mapping
    if url_mapping:
        mapping_file = script_dir / MAPPING_FILE
        save_mapping(url_mapping, str(mapping_file))
        print_summary(url_mapping)
    
    # Cleanup (optional - comment out to keep temp files for debugging)
    try:
        print(f"\n🧹 Cleaning up temporary directory: {TEMP_DIR}")
        shutil.rmtree(TEMP_DIR)
        print("✓ Cleanup complete")
    except Exception as e:
        print(f"⚠️  Warning: Could not clean up temp directory: {e}")
        print(f"   Manual cleanup needed: {TEMP_DIR}")
    
    print("\n✅ Migration process completed!")
    print(f"   Check '{MAPPING_FILE}' for the complete URL mapping.")


if __name__ == "__main__":
    main()

