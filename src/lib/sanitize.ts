import DOMPurify from 'isomorphic-dompurify'

/**
 * HTML içeriğini XSS saldırılarına karşı temizler.
 * Yalnızca güvenli etiketlere ve attributelere izin verir.
 * Rich text editörlerinden (React Quill vb.) gelen çıktılar
 * render edilmeden önce bu fonksiyondan geçirilmelidir.
 */
export function sanitizeHtml(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'em', 'u', 's', 'b', 'i',
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'ul', 'ol', 'li',
      'a', 'blockquote', 'pre', 'code',
      'img', 'span', 'div', 'hr', 'sub', 'sup',
    ],
    ALLOWED_ATTR: [
      'href', 'target', 'rel', 'src', 'alt', 'title',
      'class', 'width', 'height',
    ],
    ALLOW_DATA_ATTR: false,
  })
}
