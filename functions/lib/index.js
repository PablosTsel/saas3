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
exports.processCvUpload = void 0;
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
            skills: [],
            languages: []
        };
        // Extract education
        if (result.data.education && Array.isArray(result.data.education)) {
            extractedData.education = result.data.education.map((edu) => {
                var _a, _b, _c;
                return ({
                    institution: edu.organization || 'Unknown Institution',
                    degree: ((_a = edu.accreditation) === null || _a === void 0 ? void 0 : _a.education) || 'Unknown Degree',
                    period: formatDateRange((_b = edu.dates) === null || _b === void 0 ? void 0 : _b.startDate, (_c = edu.dates) === null || _c === void 0 ? void 0 : _c.endDate)
                });
            });
        }
        // Extract work experience
        if (result.data.workExperience && Array.isArray(result.data.workExperience)) {
            extractedData.experience = result.data.workExperience.map((exp) => {
                var _a, _b;
                return ({
                    company: exp.organization || 'Unknown Company',
                    position: exp.jobTitle || 'Unknown Position',
                    period: formatDateRange((_a = exp.dates) === null || _a === void 0 ? void 0 : _a.startDate, (_b = exp.dates) === null || _b === void 0 ? void 0 : _b.endDate),
                    description: exp.jobDescription || ''
                });
            });
        }
        // Extract skills
        if (result.data.skills && Array.isArray(result.data.skills)) {
            extractedData.skills = result.data.skills.map((skill) => ({
                name: skill.name || '',
                level: 'Intermediate' // Affinda doesn't provide skill levels, so we use a default
            }));
        }
        // Extract languages
        if (result.data.languages && Array.isArray(result.data.languages)) {
            extractedData.languages = result.data.languages.map((lang) => ({
                name: lang.name || '',
                level: lang.level || 'Intermediate'
            }));
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
        // Update the portfolio document with the extracted data
        await db.collection('portfolios').doc(portfolioId).update({
            education: cvData.education,
            experience: cvData.experience,
            skills: cvData.skills,
            languages: cvData.languages,
            // Set a flag to indicate CV data has been processed
            cvProcessed: true,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        console.log(`Successfully updated portfolio ${portfolioId} with CV data`);
    }
    catch (error) {
        console.error(`Error updating Firestore: ${error}`);
        throw error;
    }
}
/**
 * Helper function to format date ranges for display
 */
function formatDateRange(startDate, endDate) {
    if (!startDate && !endDate)
        return 'Unknown period';
    const formatDate = (dateStr) => {
        if (!dateStr)
            return '';
        try {
            const date = new Date(dateStr);
            return `${date.getMonth() + 1}/${date.getFullYear()}`;
        }
        catch (e) {
            return dateStr;
        }
    };
    const start = formatDate(startDate);
    const end = endDate ? formatDate(endDate) : 'Present';
    return `${start} - ${end}`;
}
//# sourceMappingURL=index.js.map