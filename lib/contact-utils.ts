// Implementation of phone number extraction for CV processing
export const extractPhoneNumber = (text: string): string | null => {
  // Pre-processing: normalize text (remove extra spaces, lowercase for pattern matching)
  const normalizedText = text.replace(/\s+/g, ' ').toLowerCase();
  
  // Common keywords that might appear near phone numbers
  const phoneKeywords = ['phone', 'mobile', 'cell', 'tel', 'telephone', 'contact', 'call'];
  
  // Regular expressions for various phone number formats
  const phonePatterns = [
    // International format with country code (handles spaces, dots, or dashes as separators)
    /(?:\+|00)[1-9]\d{0,2}[\s.-]?\(?\d{1,4}\)?[\s.-]?\d{1,4}[\s.-]?\d{1,4}[\s.-]?\d{1,9}/g,
    
    // Spanish format (like +34 XXX XX XX XX or +34 XXX XXX XXX)
    /\+34[\s.-]?\d{3}[\s.-]?\d{2}[\s.-]?\d{2}[\s.-]?\d{2}/g,
    /\+34[\s.-]?\d{3}[\s.-]?\d{3}[\s.-]?\d{3}/g,
    
    // US/Canada format (XXX) XXX-XXXX or XXX-XXX-XXXX
    /\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/g,
    
    // UK format +44 XXXX XXXXXX
    /\+44[\s.-]?\d{4}[\s.-]?\d{6}/g,
    
    // Generic formats (7-15 digits with various separators)
    /\d{3}[\s.-]?\d{3,4}[\s.-]?\d{3,4}/g,
    /\d{2}[\s.-]?\d{2}[\s.-]?\d{2}[\s.-]?\d{2}[\s.-]?\d{2}/g,
    
    // Catch-all for sequences of digits that look like phone numbers (7+ digits)
    /[\d\s.()+\-]{7,20}/g
  ];
  
  // Check for phone numbers near keywords first (higher accuracy)
  for (const keyword of phoneKeywords) {
    // Look for keyword followed by potential phone number
    const keywordIndex = normalizedText.indexOf(keyword);
    if (keywordIndex !== -1) {
      // Extract text around the keyword (30 chars before and 30 chars after)
      const start = Math.max(0, keywordIndex - 30);
      const end = Math.min(normalizedText.length, keywordIndex + 30);
      const contextText = normalizedText.substring(start, end);
      
      // Try each pattern on the context text
      for (const pattern of phonePatterns) {
        const matches = contextText.match(pattern);
        if (matches && matches.length > 0) {
          return normalizePhoneNumber(matches[0]);
        }
      }
    }
  }
  
  // If no phone number found near keywords, try scanning the entire text
  for (const pattern of phonePatterns) {
    const matches = text.match(pattern);
    if (matches && matches.length > 0) {
      return normalizePhoneNumber(matches[0]);
    }
  }
  
  return null;
};

// Helper function to clean and normalize phone numbers
export const normalizePhoneNumber = (phoneNumber: string): string => {
  // Remove all non-digit characters except + at the start
  let normalized = phoneNumber.trim();
  
  // Keep only digits, plus sign, spaces and some separators for readability
  normalized = normalized.replace(/[^\d+\s.-]/g, '');
  
  // Remove extra whitespace
  normalized = normalized.replace(/\s+/g, ' ').trim();
  
  // Make sure it has at least 7 digits to be a valid phone number
  const digitCount = (normalized.match(/\d/g) || []).length;
  if (digitCount < 7) {
    return '';
  }
  
  return normalized;
};

// Implementation of email extraction for CV processing
export const extractEmailAddress = (text: string): string | null => {
  // Pre-processing: normalize text
  const normalizedText = text.replace(/\s+/g, ' ');
  
  // Common keywords that might appear near email addresses
  const emailKeywords = ['email', 'e-mail', 'mail', 'correo', 'contact', 'contacto'];
  
  // Basic email regex pattern
  const emailPattern = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  
  // Check for email near keywords first (higher accuracy)
  for (const keyword of emailKeywords) {
    // Look for keyword
    const keywordIndex = normalizedText.toLowerCase().indexOf(keyword);
    if (keywordIndex !== -1) {
      // Extract text around the keyword (50 chars before and 50 chars after)
      const start = Math.max(0, keywordIndex - 50);
      const end = Math.min(normalizedText.length, keywordIndex + 50);
      const contextText = normalizedText.substring(start, end);
      
      // Find email in context
      const matches = contextText.match(emailPattern);
      if (matches && matches.length > 0) {
        return matches[0].trim();
      }
    }
  }
  
  // If no email found near keywords, try scanning the entire text
  const matches = normalizedText.match(emailPattern);
  if (matches && matches.length > 0) {
    return matches[0].trim();
  }
  
  return null;
}; 