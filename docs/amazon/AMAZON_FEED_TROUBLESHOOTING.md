# Amazon Feed Troubleshooting & Requirements

## TSV File Generation for "Flat File" Uploads

**Critical Requirement:**
When generating the final TSV (Tab-Separated Values) file for uploading to Amazon Seller Central (Catalog -> Add Products via Upload), the file must **NOT** contain the instructional metadata rows found in the standard Excel templates.

### The Problem
The raw Excel templates provided by Amazon often contain:
- Row 0: Template Settings / Version info
- Row 1: Instructions
- Row 2: Listings Identity Group headers
- Row 3: Human-readable Field Names
- Row 4: **Technical Field Names** (e.g., `contribution_sku#1.value`)

If the TSV file includes Rows 0-3, Amazon's parser frequently fails to map the columns correctly or rejects the file entirely, as it expects the **Technical Header** to be the very first line of the file.

### The Solution
The conversion script (e.g., `scripts/convert_to_tsv.js`) MUST strip the top 4 rows of metadata.

**Correct TSV Structure:**
- **Line 1:** Technical Headers (`contribution_sku#1.value`, `product_type#1.value`, etc.)
- **Line 2+:** Data Rows

### Verification
Always verify the generated TSV using `head -n 1 amazon_upload_ready.tsv`. It should start immediately with the technical field names.

```bash
# Good Output
contribution_sku#1.value    product_type#1.value    ...

# Bad Output (Do not upload)
TemplateType=fptcustom  Version=2021.1103   ...
```
