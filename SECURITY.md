# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 0.1.x   | :white_check_mark: |

## Security Architecture & Best Practices

Lumière implements defense-in-depth principles:

1. **Row Level Security (RLS)**:
   - Supabase PostgreSQL tables strictly enforce tenant-isolated RLS.
   - Users can only query, modify, or delete events where `auth.uid() = owner_id`.
   - Anonymous celebrant sessions are secured with UUID tokens.

2. **Zero-Knowledge API Secrets**:
   - `GEMINI_API_KEY` and database service credentials are strictly managed server-side.
   - Client-side code only receives public anon keys (`NEXT_PUBLIC_SUPABASE_ANON_KEY`).
   - Automated git checks verify that `.env` files are never tracked or committed.

3. **Input Sanitization & Output Encoding**:
   - All user inputs are sanitized against SQL injection and cross-site scripting (XSS).
   - Markdown parser implements strict HTML entity escaping and verified tokenization.

4. **Reporting Vulnerabilities**:
   - Please report suspected security issues responsibly via GitHub Security Advisories or by emailing mukulvyas19@gmail.com.
