export function createOrderWhatsAppUrl({ gallery, order, items, subtotal, origin }) {
  const phoneDigits = String(gallery?.phone || '').replace(/\D/g, '')
  const whatsappPhone = phoneDigits.startsWith('00')
    ? phoneDigits.slice(2)
    : phoneDigits.startsWith('0')
      ? `20${phoneDigits.slice(1)}`
      : phoneDigits

  if (!whatsappPhone) return null

  const productLines = items.map((item, index) => {
    const product = item.product || {}
    const productId = product.id || product._id || item.productId
    const productUrl = productId ? new URL(`/products/${productId}`, origin).href : ''
    const arabicIndex = new Intl.NumberFormat('ar-EG').format(index + 1)
    const arabicQuantity = new Intl.NumberFormat('ar-EG').format(item.quantity)
    return `${arabicIndex}. ${product.name || item.productName || 'منتج'} — الكمية: ${arabicQuantity}${productUrl ? `\n${productUrl}` : ''}`
  })
  const arabicSubtotal = new Intl.NumberFormat('ar-EG', {
    style: 'currency',
    currency: 'EGP',
    maximumFractionDigits: 2,
  }).format(subtotal)
  const orderReference = order?.orderNumber || order?.id || 'غير متاح'
  const message = [
    `مرحباً ${gallery?.name || 'المعرض'}،`,
    `أرسلت للتو الطلب رقم ${orderReference}.`,
    '',
    'أرجو تأكيد توفر المنتجات التالية:',
    ...productLines,
    '',
    `المجموع الفرعي: ${arabicSubtotal}`,
    'يرجى الرد في أقرب وقت ممكن لتأكيد الطلب وترتيب الخطوات التالية. شكراً لكم!',
  ].join('\n')

  return `https://wa.me/${whatsappPhone}?text=${encodeURIComponent(message)}`
}
