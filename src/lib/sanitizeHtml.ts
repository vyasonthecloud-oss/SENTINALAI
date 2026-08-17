/**
 * Server-side HTML sanitizer for product descriptions and user content.
 * Removes executable script tags, event handlers, and malicious protocols.
 */
export function sanitizeHtml(dirtyHtml: string | null | undefined): string {
  if (!dirtyHtml) return '';

  let sanitized = String(dirtyHtml);

  // 1. Remove dangerous executable tags and contents
  sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  sanitized = sanitized.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');
  sanitized = sanitized.replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '');
  sanitized = sanitized.replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '');
  sanitized = sanitized.replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '');
  sanitized = sanitized.replace(/<applet\b[^<]*(?:(?!<\/applet>)<[^<]*)*<\/applet>/gi, '');

  // 2. Remove inline event handlers (e.g., onload, onerror, onclick, onmouseover)
  sanitized = sanitized.replace(/\son[a-zA-Z]+\s*=\s*(['"]).*?\1/gi, '');
  sanitized = sanitized.replace(/\son[a-zA-Z]+\s*=\s*[^ >]+/gi, '');

  // 3. Remove javascript: and data: (except safe images) protocols
  sanitized = sanitized.replace(/(href|src|action)\s*=\s*(['"])\s*javascript:[^'"]*\2/gi, '$1="#"');
  sanitized = sanitized.replace(/(href|src|action)\s*=\s*javascript:[^\s>]+/gi, '$1="#"');
  sanitized = sanitized.replace(/(href|src|action)\s*=\s*(['"])\s*data:text\/html[^'"]*\2/gi, '$1="#"');

  return sanitized;
}
