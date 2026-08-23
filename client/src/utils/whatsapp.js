/**
 * Farm2Market WhatsApp Integration Utility
 * Handles WhatsApp direct inquiries, listing sharing, and customer helpline.
 */

// Global configurable support helpline from environment or official default
export const WHATSAPP_SUPPORT_NUMBER = process.env.REACT_APP_WHATSAPP_SUPPORT_NUMBER || '+916006097169';

/**
 * Format phone number to clean E.164 without plus or special chars for wa.me links
 * @param {string} phone 
 * @returns {string} E.164 formatted number (e.g. 916006097169)
 */
export const formatWhatsAppNumber = (phone) => {
  if (!phone) return '916006097169';
  const digitsOnly = String(phone).replace(/\D/g, '');
  
  // If 10-digit Indian number (starts with 6, 7, 8, 9), prefix with 91
  if (digitsOnly.length === 10) {
    return `91${digitsOnly}`;
  }
  // If starts with 0 and 11 digits, strip 0 and prefix with 91
  if (digitsOnly.length === 11 && digitsOnly.startsWith('0')) {
    return `91${digitsOnly.slice(1)}`;
  }
  return digitsOnly;
};

/**
 * Generate direct WhatsApp URL to chat with a farmer regarding a specific crop
 * @param {Object} params
 * @param {string} params.farmerPhone
 * @param {string} params.farmerName
 * @param {string} params.cropName
 * @param {number|string} params.quantity
 * @param {string} params.unit
 * @param {number|string} params.price
 * @param {string} params.cropId
 * @returns {string} WhatsApp URL
 */
export const getFarmerWhatsAppLink = ({
  farmerPhone,
  farmerName = 'Farmer',
  cropName = 'Crop Produce',
  quantity = 1,
  unit = 'kg',
  price = 0,
  cropId = ''
}) => {
  const phone = formatWhatsAppNumber(farmerPhone);
  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://farm2market.in';
  const listingUrl = cropId ? `${currentOrigin}/crop/${cropId}` : currentOrigin;

  const message = `Namaste ${farmerName}! 🌾\n\nI saw your listing for *${cropName}* on Farm2Market.\n\nI would like to inquire about purchasing *${quantity} ${unit}* at *₹${price}/${unit}*.\n\nCould you please confirm availability and harvest location?\n\nListing link: ${listingUrl}\n\nThank you!`;

  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
};

/**
 * Generate WhatsApp share link for a crop listing
 * @param {Object} crop
 * @returns {string} WhatsApp share URL
 */
export const getCropShareWhatsAppLink = (crop) => {
  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://farm2market.in';
  const productUrl = crop?._id ? `${currentOrigin}/crop/${crop._id}` : currentOrigin;
  
  const text = `🌿 *${crop?.name || 'Fresh Crop'}* is now available on Farm2Market!\n\n💰 *Price:* ₹${crop?.price?.perUnit || 0}/${crop?.quantity?.unit || 'kg'}\n📍 *Location:* ${crop?.location?.district || ''}, ${crop?.location?.state || ''}\n👨‍🌾 *Farmer:* ${crop?.farmer?.name || 'Verified Farmer'}\n\n👉 Order directly with zero middlemen here:\n${productUrl}`;

  return `https://wa.me/?text=${encodeURIComponent(text)}`;
};

/**
 * Generate direct WhatsApp support helpline link
 * @param {string} customQuery
 * @returns {string} Support WhatsApp URL
 */
export const getSupportWhatsAppLink = (customQuery = '') => {
  const phone = formatWhatsAppNumber(WHATSAPP_SUPPORT_NUMBER);
  const msg = customQuery || 'Hello Farm2Market Support! I need assistance with my account or agricultural order.';
  return `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
};
