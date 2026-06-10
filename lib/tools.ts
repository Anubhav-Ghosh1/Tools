export type ToolCategory =
  | "Encode / Decode"
  | "Crypto & Hashing"
  | "Generators"
  | "Formatters"
  | "Converters"
  | "Files & Documents"
  | "Text"
  | "Utilities";

export interface Tool {
  slug: string;
  name: string;
  category: ToolCategory;
  description: string;
  icon: string;
  isNew?: boolean;
}

export const tools: Tool[] = [
  // Encode / Decode
  { slug: "base64", name: "Base64 Encode / Decode", category: "Encode / Decode", icon: "Hash", description: "Encode text to Base64 or decode Base64 back to text. Supports URL-safe variant." },
  { slug: "base32", name: "Base32 Encode / Decode", category: "Encode / Decode", icon: "Binary", description: "Encode and decode Base32 strings (RFC 4648, A–Z + 2–7)." },
  { slug: "url-encode", name: "URL Encode / Decode", category: "Encode / Decode", icon: "Link2", description: "Percent-encode or decode URLs and query parameters." },
  { slug: "html-entities", name: "HTML Entities Encode / Decode", category: "Encode / Decode", icon: "Code", description: "Escape or unescape HTML entities like &amp;, &lt;, and &#39;." },
  { slug: "jwt-decoder", name: "JWT Decoder", category: "Encode / Decode", icon: "Layers", description: "Decode the header and payload of a JSON Web Token. Signature is not verified." },
  { slug: "image-data-url", name: "Image ↔ Data URL", category: "Encode / Decode", icon: "ImageIcon", description: "Drop an image to get a base64 data URL, or paste a data URL to preview it." },
  { slug: "char-codes", name: "Character Codes", category: "Encode / Decode", icon: "Type", description: "Inspect any text character-by-character: Unicode code point, UTF-8 bytes, HTML entity.", isNew: true },

  // Crypto & Hashing
  { slug: "hash-generator", name: "Hash Generator", category: "Crypto & Hashing", icon: "Fingerprint", description: "Compute SHA-1, SHA-256, SHA-384 and SHA-512 digests of any text. Powered by Web Crypto." },
  { slug: "hmac-generator", name: "HMAC Generator", category: "Crypto & Hashing", icon: "Shield", description: "Sign messages with HMAC-SHA-256/384/512/SHA-1 using a shared secret. Hex + base64 output." },
  { slug: "aes-gcm", name: "AES-256-GCM Encrypt / Decrypt", category: "Crypto & Hashing", icon: "Lock", description: "Encrypt or decrypt text with a passphrase. PBKDF2-derived key, fresh salt + IV per message." },
  { slug: "rsa-keypair", name: "RSA Keypair Generator", category: "Crypto & Hashing", icon: "KeyRound", description: "Generate 2048 / 3072 / 4096-bit RSA keypairs and export them as PEM (PKCS#8 + SPKI)." },
  { slug: "ed25519-keypair", name: "Ed25519 Keypair Generator", category: "Crypto & Hashing", icon: "Zap", description: "Generate modern, fast Ed25519 keypairs and export them as PEM (PKCS#8 + SPKI)." },

  // Generators
  { slug: "jwt-builder", name: "JWT Builder", category: "Crypto & Hashing", icon: "Wand2", description: "Build and sign JSON Web Tokens with HS256/384/512. Live preview of header, payload, and signature.", isNew: true },
  { slug: "uuid-generator", name: "UUID Generator", category: "Generators", icon: "Shuffle", description: "Generate one or many cryptographically-random UUIDv4 identifiers." },
  { slug: "nano-id", name: "Nano ID / ULID Generator", category: "Generators", icon: "Sparkles", description: "Generate Nano IDs and ULIDs — compact, URL-safe, sortable unique identifiers.", isNew: true },
  { slug: "password-generator", name: "Password Generator", category: "Generators", icon: "Key", description: "Generate cryptographically random passwords with configurable length and character sets." },
  { slug: "qr-generator", name: "QR Code Generator", category: "Generators", icon: "QrCode", description: "Generate QR codes from any text or URL, with custom size, error correction, and colors." },
  { slug: "lorem-ipsum", name: "Lorem Ipsum Generator", category: "Generators", icon: "FileText", description: "Generate placeholder text in paragraphs, sentences, or words." },
  { slug: "ip-info", name: "IP Info", category: "Generators", icon: "Globe", description: "Look up geolocation, ISP and network info for your current IP or any IP address.", isNew: true },

  // Formatters
  { slug: "json-format", name: "JSON Format & Validate", category: "Formatters", icon: "Braces", description: "Pretty-print, minify, and validate JSON. Errors point to the broken character." },
  { slug: "html-formatter", name: "HTML Formatter", category: "Formatters", icon: "Code2", description: "Pretty-print or minify HTML. Proper indentation for nested tags and inline elements.", isNew: true },
  { slug: "markdown-preview", name: "Markdown Preview", category: "Formatters", icon: "FileCode", description: "Render GitHub-flavored markdown live, side-by-side with the source. Toggle to view HTML." },
  { slug: "markdown-table", name: "Markdown Table Generator", category: "Formatters", icon: "Rows", description: "Build markdown tables visually — add/remove rows and columns, set alignment, copy the result.", isNew: true },
  { slug: "number-formatter", name: "Number Formatter", category: "Formatters", icon: "Sigma", description: "Format numbers with Intl.NumberFormat — locale, currency, percent, scientific notation.", isNew: true },
  { slug: "sql-validator", name: "SQL Validator", category: "Formatters", icon: "Database", description: "Validate SQL syntax across MySQL / PostgreSQL / SQLite dialects. Errors pinpointed." },

  // Converters
  { slug: "hex-text", name: "Hex ↔ Text", category: "Converters", icon: "Terminal", description: "Convert any UTF-8 text to hex bytes and back. Whitespace is ignored when decoding." },
  { slug: "yaml-json", name: "YAML ↔ JSON", category: "Converters", icon: "ArrowLeftRight", description: "Convert between YAML and JSON in either direction." },
  { slug: "csv-json", name: "CSV ↔ JSON", category: "Converters", icon: "Table2", description: "Convert between CSV and a JSON array of objects, with proper handling of quoted fields." },
  { slug: "unix-timestamp", name: "Unix Timestamp Converter", category: "Converters", icon: "Clock", description: "Convert between Unix timestamps and human-readable dates, in your local zone and UTC." },
  { slug: "color-converter", name: "Color Converter", category: "Converters", icon: "Palette", description: "Convert colors between HEX, RGB(A) and HSL(A) with a live preview." },
  { slug: "number-base", name: "Number Base Converter", category: "Converters", icon: "Hash", description: "Convert numbers between binary, octal, decimal, and hexadecimal — instantly, all four at once." },
  { slug: "cron-explainer", name: "Cron Explainer", category: "Converters", icon: "AlarmClock", description: "Translate cron expressions into plain English, with handy presets you can click." },
  { slug: "json-to-typescript", name: "JSON / YAML → TypeScript", category: "Converters", icon: "FileJson", description: "Generate TypeScript interfaces from JSON or YAML. Handles nested objects and arrays.", isNew: true },
  { slug: "json-flattener", name: "JSON Flattener", category: "Converters", icon: "Layers2", description: "Flatten nested JSON to dot-notation keys or unflatten a flat object back to nested. Custom separator.", isNew: true },
  { slug: "css-units", name: "CSS Unit Converter", category: "Converters", icon: "Ruler", description: "Convert px, rem, em, pt, vw, vh, cm, mm instantly. Configurable base font size and viewport.", isNew: true },
  { slug: "date-calculator", name: "Date Calculator", category: "Converters", icon: "CalendarDays", description: "Calculate the difference between two dates or add/subtract duration from a date.", isNew: true },

  // Files & Documents
  { slug: "image-format", name: "Image Format Converter", category: "Files & Documents", icon: "ImageIcon", description: "Convert between PNG, JPEG and WebP. Adjustable quality, optional resize, side-by-side preview, no upload." },
  { slug: "image-compressor", name: "Image Compressor", category: "Files & Documents", icon: "Minimize2", description: "Squeeze any image down to a target file size in KB or MB. Picks the highest quality that fits, auto-resizes if it has to." },
  { slug: "image-pdf", name: "Image → PDF", category: "Files & Documents", icon: "FilePlus", description: "Combine one or many images into a single PDF. Reorder pages, choose A4 / Letter / image-sized, set margins." },
  { slug: "pdf-images", name: "PDF → Images", category: "Files & Documents", icon: "FileImage", description: "Render every page of a PDF to PNG or JPEG, fully in your browser. Tweak DPI / quality, click any page to download." },
  { slug: "file-compressor", name: "File Compressor", category: "Files & Documents", icon: "Archive", description: "Compress or decompress any file with the browser's native gzip / deflate. Live ratio + savings readout." },
  { slug: "spreadsheet", name: "Spreadsheet Converter", category: "Files & Documents", icon: "Table", description: "Drop CSV, TSV or XLSX and export as CSV / TSV / JSON / XLSX / HTML / PDF. Sheet picker, header detection, live preview." },

  // Text
  { slug: "regex-tester", name: "Regex Tester", category: "Text", icon: "Search", description: "Test JavaScript-flavored regular expressions with live highlighting and match details." },
  { slug: "case-converter", name: "Case Converter", category: "Text", icon: "CaseSensitive", description: "Convert text between camelCase, PascalCase, snake_case, kebab-case, CONSTANT_CASE and more." },
  { slug: "slugify", name: "Slugify", category: "Text", icon: "Minus", description: "Convert any title or sentence into a clean URL-safe slug. Handles accents and punctuation." },
  { slug: "diff-viewer", name: "Diff Viewer", category: "Text", icon: "BarChart2", description: "Compare two blocks of text line-by-line. Added lines are green; removed lines are red." },
  { slug: "text-stats", name: "Text Statistics", category: "Text", icon: "BarChart", description: "Count words, characters, lines, sentences, and estimate reading time as you type." },
  { slug: "stringify-parse", name: "Stringify / Parse", category: "Text", icon: "Wrench", description: "Escape any text — even huge multi-line input — into a JSON or JS string literal, or parse one back to raw text." },
  { slug: "command-teller", name: "Command Teller", category: "Text", icon: "Terminal", description: "Describe what you want to do in plain English and get the matching shell or git command, with variants." },
  { slug: "line-sort", name: "Line Sorter", category: "Text", icon: "AlignJustify", description: "Sort, deduplicate, shuffle, or filter lines of text. Case-sensitive or insensitive.", isNew: true },
  { slug: "regex-library", name: "Regex Library", category: "Text", icon: "BookOpen", description: "Browse curated regex patterns for emails, URLs, dates, IPs, and more. Test against input.", isNew: true },

  // Utilities
  { slug: "curl-generator", name: "cURL Generator", category: "Utilities", icon: "SquareCode", description: "Build cURL commands from URL, method, headers, and body. Supports JSON, form data, file upload.", isNew: true },
  { slug: "http-status", name: "HTTP Status Codes", category: "Utilities", icon: "Server", description: "Quick reference for all HTTP status codes — description, category, and common use cases.", isNew: true },
  { slug: "env-parser", name: ".env Parser", category: "Utilities", icon: "Settings", description: "Parse .env files to a table or JSON, and convert JSON/objects back to .env format.", isNew: true },
];

export const categories: ToolCategory[] = [
  "Encode / Decode",
  "Crypto & Hashing",
  "Generators",
  "Formatters",
  "Converters",
  "Files & Documents",
  "Text",
  "Utilities",
];

export function bySlug(slug: string): Tool | undefined {
  return tools.find((t) => t.slug === slug);
}
