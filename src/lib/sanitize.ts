import sanitize from 'sanitize-html'

/**
 * HTML içeriğini XSS saldırılarına karşı temizler.
 * JSDOM kullanmadığı için Next.js Server Components ile kusursuz çalışır.
 */
export function sanitizeHtml(dirty: string): string {
  if (!dirty) return ''

  return sanitize(dirty, {
    allowedTags: [
      'p', 'br', 'strong', 'em', 'u', 's', 'b', 'i',
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'ul', 'ol', 'li',
      'a', 'blockquote', 'pre', 'code',
      'img', 'span', 'div', 'hr', 'sub', 'sup',
    ],
    allowedAttributes: {
      '*': ['class', 'title'], // Tüm etiketlerde class ve title serbest
      'a': ['href', 'target', 'rel'],
      'img': ['src', 'alt', 'width', 'height'],
    },
    allowedSchemes: ['http', 'https', 'mailto', 'tel'],
    allowProtocolRelative: false, // data: URI engellemesi (ekstra güvenlik)
  })
}