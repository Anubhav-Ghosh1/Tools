export type ToolCategory =
  | "Encode / Decode"
  | "Crypto & Hashing"
  | "Generators"
  | "Formatters"
  | "Converters"
  | "Files & Documents"
  | "Text";

export interface Tool {
  slug: string;
  name: string;
  category: ToolCategory;
  description: string;
}

export const tools: Tool[] = [
  // Encode / Decode
  { slug: "base64", name: "Base64 Encode / Decode", category: "Encode / Decode", description: "Encode text to Base64 or decode Base64 back to text. Supports URL-safe variant." },
  { slug: "base32", name: "Base32 Encode / Decode", category: "Encode / Decode", description: "Encode and decode Base32 strings (RFC 4648, A–Z + 2–7)." },
  { slug: "url-encode", name: "URL Encode / Decode", category: "Encode / Decode", description: "Percent-encode or decode URLs and query parameters." },
  { slug: "html-entities", name: "HTML Entities Encode / Decode", category: "Encode / Decode", description: "Escape or unescape HTML entities like &amp;, &lt;, and &#39;." },
  { slug: "jwt-decoder", name: "JWT Decoder", category: "Encode / Decode", description: "Decode the header and payload of a JSON Web Token. Signature is not verified." },
  { slug: "image-data-url", name: "Image ↔ Data URL", category: "Encode / Decode", description: "Drop an image to get a base64 data URL, or paste a data URL to preview it." },

  // Crypto & Hashing
  { slug: "hash-generator", name: "Hash Generator", category: "Crypto & Hashing", description: "Compute SHA-1, SHA-256, SHA-384 and SHA-512 digests of any text. Powered by Web Crypto." },
  { slug: "hmac-generator", name: "HMAC Generator", category: "Crypto & Hashing", description: "Sign messages with HMAC-SHA-256/384/512/SHA-1 using a shared secret. Hex + base64 output." },
  { slug: "aes-gcm", name: "AES-256-GCM Encrypt / Decrypt", category: "Crypto & Hashing", description: "Encrypt or decrypt text with a passphrase. PBKDF2-derived key, fresh salt + IV per message." },
  { slug: "rsa-keypair", name: "RSA Keypair Generator", category: "Crypto & Hashing", description: "Generate 2048 / 3072 / 4096-bit RSA keypairs and export them as PEM (PKCS#8 + SPKI)." },
  { slug: "ed25519-keypair", name: "Ed25519 Keypair Generator", category: "Crypto & Hashing", description: "Generate modern, fast Ed25519 keypairs and export them as PEM (PKCS#8 + SPKI)." },

  // Generators
  { slug: "uuid-generator", name: "UUID Generator", category: "Generators", description: "Generate one or many cryptographically-random UUIDv4 identifiers." },
  { slug: "password-generator", name: "Password Generator", category: "Generators", description: "Generate cryptographically random passwords with configurable length and character sets." },
  { slug: "qr-generator", name: "QR Code Generator", category: "Generators", description: "Generate QR codes from any text or URL, with custom size, error correction, and colors." },
  { slug: "lorem-ipsum", name: "Lorem Ipsum Generator", category: "Generators", description: "Generate placeholder text in paragraphs, sentences, or words." },

  // Formatters
  { slug: "json-format", name: "JSON Format & Validate", category: "Formatters", description: "Pretty-print, minify, and validate JSON. Errors point to the broken character." },
  { slug: "markdown-preview", name: "Markdown Preview", category: "Formatters", description: "Render GitHub-flavored markdown live, side-by-side with the source. Toggle to view HTML." },
  { slug: "sql-validator", name: "SQL Validator", category: "Formatters", description: "Validate SQL syntax across MySQL / PostgreSQL / SQLite dialects. Errors pinpointed." },

  // Converters
  { slug: "hex-text", name: "Hex ↔ Text", category: "Converters", description: "Convert any UTF-8 text to hex bytes and back. Whitespace is ignored when decoding." },
  { slug: "yaml-json", name: "YAML ↔ JSON", category: "Converters", description: "Convert between YAML and JSON in either direction." },
  { slug: "csv-json", name: "CSV ↔ JSON", category: "Converters", description: "Convert between CSV and a JSON array of objects, with proper handling of quoted fields." },
  { slug: "unix-timestamp", name: "Unix Timestamp Converter", category: "Converters", description: "Convert between Unix timestamps and human-readable dates, in your local zone and UTC." },
  { slug: "color-converter", name: "Color Converter", category: "Converters", description: "Convert colors between HEX, RGB(A) and HSL(A) with a live preview." },
  { slug: "number-base", name: "Number Base Converter", category: "Converters", description: "Convert numbers between binary, octal, decimal, and hexadecimal — instantly, all four at once." },
  { slug: "cron-explainer", name: "Cron Explainer", category: "Converters", description: "Translate cron expressions into plain English, with handy presets you can click." },

  // Files & Documents
  { slug: "image-format", name: "Image Format Converter", category: "Files & Documents", description: "Convert between PNG, JPEG and WebP. Adjustable quality, optional resize, side-by-side preview, no upload." },
  { slug: "image-compressor", name: "Image Compressor", category: "Files & Documents", description: "Squeeze any image down to a target file size in KB or MB. Picks the highest quality that fits, auto-resizes if it has to." },
  { slug: "image-pdf", name: "Image → PDF", category: "Files & Documents", description: "Combine one or many images into a single PDF. Reorder pages, choose A4 / Letter / image-sized, set margins." },
  { slug: "pdf-images", name: "PDF → Images", category: "Files & Documents", description: "Render every page of a PDF to PNG or JPEG, fully in your browser. Tweak DPI / quality, click any page to download." },
  { slug: "file-compressor", name: "File Compressor", category: "Files & Documents", description: "Compress or decompress any file with the browser's native gzip / deflate. Live ratio + savings readout." },
  { slug: "spreadsheet", name: "Spreadsheet Converter", category: "Files & Documents", description: "Drop CSV, TSV or XLSX and export as CSV / TSV / JSON / XLSX / HTML / PDF. Sheet picker, header detection, live preview." },

  // Text
  { slug: "regex-tester", name: "Regex Tester", category: "Text", description: "Test JavaScript-flavored regular expressions with live highlighting and match details." },
  { slug: "case-converter", name: "Case Converter", category: "Text", description: "Convert text between camelCase, PascalCase, snake_case, kebab-case, CONSTANT_CASE and more." },
  { slug: "slugify", name: "Slugify", category: "Text", description: "Convert any title or sentence into a clean URL-safe slug. Handles accents and punctuation." },
  { slug: "diff-viewer", name: "Diff Viewer", category: "Text", description: "Compare two blocks of text line-by-line. Added lines are green; removed lines are red." },
  { slug: "text-stats", name: "Text Statistics", category: "Text", description: "Count words, characters, lines, sentences, and estimate reading time as you type." },
  { slug: "stringify-parse", name: "Stringify / Parse", category: "Text", description: "Escape any text — even huge multi-line input — into a JSON or JS string literal, or parse one back to raw text." },
  { slug: "command-teller", name: "Command Teller", category: "Text", description: "Describe what you want to do in plain English and get the matching shell or git command, with variants." },
];

export const categories: ToolCategory[] = [
  "Encode / Decode",
  "Crypto & Hashing",
  "Generators",
  "Formatters",
  "Converters",
  "Files & Documents",
  "Text",
];

export function bySlug(slug: string): Tool | undefined {
  return tools.find((t) => t.slug === slug);
}
