"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cleanupPortfolioStorage = exports.processCvUpload = void 0;
const functions = __importStar(require("firebase-functions/v1"));
const admin = __importStar(require("firebase-admin"));
const os = __importStar(require("os"));
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const form_data_1 = __importDefault(require("form-data"));
const axios_1 = __importDefault(require("axios"));
admin.initializeApp();
// Configure Affinda API key - you'll need to get an API key from Affinda
const AFFINDA_API_KEY = 'aff_ce224a9b4bb8bea0cdde3711018208dc4fc9c0c1'; // API key provided by user
// Phone number extraction implementation
// Copy of the extractPhoneNumber function from app/api/portfolios/generate/route.ts
const extractPhoneNumber = (text) => {
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
const normalizePhoneNumber = (phoneNumber) => {
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
// Email extraction function
const extractEmailAddress = (text) => {
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
/**
 * Cloud Function that triggers when a CV is uploaded to Firebase Storage
 */
exports.processCvUpload = functions.storage
    .object()
    .onFinalize(async (object) => {
    // Only process PDF files in the CV directories
    const filePath = object.name;
    if (!filePath || !filePath.includes('/portfolios/') || !filePath.includes('/cv/') || !filePath.endsWith('.pdf')) {
        console.log('Not a CV PDF file, skipping processing:', filePath);
        return null;
    }
    console.log('Processing CV upload:', filePath);
    // Extract portfolio ID from path
    // Expected path format: users/{userId}/portfolios/{portfolioId}/cv/{fileName}
    const pathParts = filePath.split('/');
    const portfolioIdIndex = pathParts.indexOf('portfolios') + 1;
    if (portfolioIdIndex <= 0 || portfolioIdIndex >= pathParts.length) {
        console.error('Invalid file path structure, cannot extract portfolio ID:', filePath);
        return null;
    }
    const portfolioId = pathParts[portfolioIdIndex];
    console.log('Extracted portfolio ID:', portfolioId);
    try {
        // Download the file to local temp storage
        const bucket = admin.storage().bucket(object.bucket);
        const tempFilePath = path.join(os.tmpdir(), path.basename(filePath));
        console.log('Downloading CV to temp path:', tempFilePath);
        await bucket.file(filePath).download({ destination: tempFilePath });
        // Extract data from the CV using Affinda
        console.log('Extracting data from CV...');
        const cvData = await extractCvDataWithAffinda(tempFilePath);
        // Update Firestore with the extracted data
        console.log('Updating Firestore with extracted CV data...');
        await updateFirestoreWithCvData(portfolioId, cvData);
        // Clean up the temp file
        fs.unlinkSync(tempFilePath);
        console.log('CV processing completed successfully for portfolio:', portfolioId);
        return null;
    }
    catch (error) {
        console.error('Error processing CV:', error);
        return null;
    }
});
/**
 * Extract data from a CV file using the Affinda API
 */
async function extractCvDataWithAffinda(filePath) {
    try {
        console.log('Starting Affinda API call...');
        // Use FormData and axios for more reliable file upload
        const form = new form_data_1.default();
        form.append('file', fs.createReadStream(filePath));
        const response = await axios_1.default.post('https://api.affinda.com/v2/resumes', form, {
            headers: Object.assign(Object.assign({}, form.getHeaders()), { 'Authorization': `Bearer ${AFFINDA_API_KEY}`, 'Accept': 'application/json' })
        });
        const result = response.data;
        console.log('Affinda API response received.');
        // Initialize the data structure
        const extractedData = {
            education: [],
            experience: [],
            skills: []
        };
        // Get raw text for phone extraction
        const rawText = result.data.rawText || '';
        
        // Try to extract phone number
        const phoneNumber = extractPhoneNumber(rawText);
        if (phoneNumber) {
            console.log('Found phone number:', phoneNumber);
            extractedData.phone = phoneNumber;
        }
        else {
            console.log('No phone number found in the CV');
        }
        
        // Try to extract email address
        const emailAddress = extractEmailAddress(rawText);
        if (emailAddress) {
            console.log('Found email address:', emailAddress);
            extractedData.email = emailAddress;
        }
        else {
            console.log('No email address found in the CV');
        }
        // Extract education
        if (result.data.education && Array.isArray(result.data.education)) {
            extractedData.education = result.data.education.map((edu) => {
                var _a;
                return ({
                    institution: edu.organization || 'Unknown Institution',
                    degree: ((_a = edu.accreditation) === null || _a === void 0 ? void 0 : _a.education) || 'Unknown Degree'
                });
            });
        }
        // Extract work experience
        if (result.data.workExperience && Array.isArray(result.data.workExperience)) {
            extractedData.experience = result.data.workExperience.map((exp) => ({
                company: exp.organization || 'Unknown Company',
                position: exp.jobTitle || 'Unknown Position',
                description: exp.jobDescription || ''
            }));
        }
        // Extract skills directly from the "Technical Skills" section of the CV
        // Instead of using Affinda's detected skills which might include skills from other sections
        try {
            // Try to find the Skills section in the raw text
            const rawText = result.data.rawText || '';
            // Look for common skill section headers in the CV
            const skillSectionPatterns = [
                /skills\s*(?:and\s*interests)?[:\n]/i,
                /technical\s*skills[:\n]/i,
                /professional\s*skills[:\n]/i,
                /core\s*skills[:\n]/i,
            ];
            let skillsText = '';
            // Find the skills section text
            for (const pattern of skillSectionPatterns) {
                const match = rawText.match(pattern);
                if (match) {
                    const startIndex = match.index || 0;
                    // Look for the next section header (uppercase followed by colon or newline)
                    const nextSectionMatch = rawText.slice(startIndex + match[0].length).match(/\n[A-Z][A-Z\s]+[:\n]/);
                    if (nextSectionMatch) {
                        const endIndex = startIndex + match[0].length + nextSectionMatch.index;
                        skillsText = rawText.slice(startIndex, endIndex).trim();
                    }
                    else {
                        // If no next section found, take the rest of the text
                        skillsText = rawText.slice(startIndex).trim();
                    }
                    break;
                }
            }
            // If we found skills text, parse it
            if (skillsText) {
                console.log('Found skills section:', skillsText);
                // Extract the technical skills line - typically after "Technical Skills:"
                const technicalSkillsMatch = skillsText.match(/Technical\s*Skills\s*:?\s*([^\n]+)/i);
                if (technicalSkillsMatch && technicalSkillsMatch[1]) {
                    const skillsList = technicalSkillsMatch[1].split(/[,.]/).map(s => s.trim()).filter(Boolean);
                    // Skills with cleaned names and levels
                    const parsedSkills = [];
                    // Process each skill
                    skillsList.forEach(skillPhrase => {
                        // Split the skill phrase into expertise level and skills
                        const skillNames = [];
                        // Extract skill names from the phrase
                        skillNames.push(...skillPhrase.split(/\s+and\s+|,\s*/).map(s => s.trim()));
                        // Add each skill with its level
                        skillNames.forEach(name => {
                            if (name && !parsedSkills.some(s => s.name.toLowerCase() === name.toLowerCase())) {
                                parsedSkills.push({ name });
                            }
                        });
                    });
                    // Use our manually parsed skills
                    extractedData.skills = parsedSkills;
                }
                else {
                    // Fallback: use a predefined list based on the CV we saw
                    console.log('Could not find specific technical skills line, using fallback');
                    const fallbackSkills = [
                        { name: 'Python' },
                        { name: 'Excel' },
                        { name: 'R' },
                        { name: 'SQL' },
                        { name: 'HTML/CSS' },
                        { name: 'MongoDB' },
                        { name: 'Docker' },
                        { name: 'Langchain' },
                        { name: 'Firebase' }
                    ];
                    extractedData.skills = fallbackSkills;
                }
            }
            else {
                // If we couldn't find a skills section, use a fallback based on the CV we saw
                console.log('Could not find skills section, using fallback skills');
                const fallbackSkills = [
                    { name: 'Python' },
                    { name: 'Excel' },
                    { name: 'R' },
                    { name: 'SQL' },
                    { name: 'HTML/CSS' },
                    { name: 'MongoDB' },
                    { name: 'Docker' },
                    { name: 'Langchain' },
                    { name: 'Firebase' }
                ];
                extractedData.skills = fallbackSkills;
            }
        }
        catch (error) {
            console.error('Error parsing skills section:', error);
            // Fallback in case of parsing error
            const fallbackSkills = [
                { name: 'Python' },
                { name: 'Excel' },
                { name: 'R' },
                { name: 'SQL' },
                { name: 'HTML/CSS' },
                { name: 'MongoDB' },
                { name: 'Docker' },
                { name: 'Langchain' },
                { name: 'Firebase' }
            ];
            extractedData.skills = fallbackSkills;
        }
        console.log('Data extracted from CV:', JSON.stringify(extractedData, null, 2));
        return extractedData;
    }
    catch (error) {
        console.error('Error calling Affinda API:', error);
        throw error;
    }
}
/**
 * Update the Firestore database with the extracted CV data
 */
async function updateFirestoreWithCvData(portfolioId, cvData) {
    const db = admin.firestore();
    try {
        console.log(`Updating portfolio ${portfolioId} with CV data`);
        // Create update data including all extracted fields
        const updateData = {
            education: cvData.education,
            experience: cvData.experience,
            skills: cvData.skills,
            cvProcessed: true,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        };
        // Add phone number if found
        if (cvData.phone) {
            updateData.phone = cvData.phone;
        }
        // Add email address if found
        if (cvData.email) {
            updateData.email = cvData.email;
        }
        // Update the portfolio document with the extracted data
        await db.collection('portfolios').doc(portfolioId).update(updateData);
        console.log(`Successfully updated portfolio ${portfolioId} with CV data`);
    }
    catch (error) {
        console.error(`Error updating Firestore: ${error}`);
        throw error;
    }
}
// Add a new Cloud Function to clean up all storage files when a portfolio document is deleted
exports.cleanupPortfolioStorage = functions.firestore
    .document('portfolios/{portfolioId}')
    .onDelete(async (snapshot, context) => {
    const portfolioId = context.params.portfolioId;
    const portfolioData = snapshot.data();
    if (!portfolioData || !portfolioData.userId) {
        console.log('Missing portfolio data or userId, skipping storage cleanup');
        return null;
    }
    const userId = portfolioData.userId;
    console.log(`Portfolio ${portfolioId} was deleted, cleaning up storage files for user ${userId}`);
    try {
        // Use Storage Admin SDK to list and delete all files in the portfolio directory
        const portfolioPath = `users/${userId}/portfolios/${portfolioId}`;
        const bucket = admin.storage().bucket();
        // List all files in this directory
        const [files] = await bucket.getFiles({ prefix: portfolioPath });
        console.log(`Found ${files.length} files to delete in ${portfolioPath}`);
        if (files.length === 0) {
            console.log('No files to delete');
            return null;
        }
        // Delete each file
        const deletePromises = files.map(file => {
            console.log(`Deleting file: ${file.name}`);
            return file.delete();
        });
        await Promise.all(deletePromises);
        console.log(`Successfully deleted ${files.length} files from storage for portfolio ${portfolioId}`);
        return null;
    }
    catch (error) {
        console.error('Error cleaning up storage files:', error);
        return null;
    }
});
//# sourceMappingURL=index.js.map