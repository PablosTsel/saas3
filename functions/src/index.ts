import * as functions from 'firebase-functions/v1';
import * as admin from 'firebase-admin';
import * as os from 'os';
import * as path from 'path';
import * as fs from 'fs';
import FormData from 'form-data';
import axios from 'axios';

admin.initializeApp();

// Configure Affinda API key - you'll need to get an API key from Affinda
const AFFINDA_API_KEY = 'aff_ce224a9b4bb8bea0cdde3711018208dc4fc9c0c1'; // API key provided by user

// Map Affinda data to our Firestore structure
interface EducationItem {
  institution: string;
  degree: string;
  period: string;
}

interface ExperienceItem {
  company: string;
  position: string;
  period: string;
  description: string;
}

interface Skill {
  name: string;
  level: string;
}

interface Language {
  name: string;
  level: string;
}

// Define the structure for extracted CV data
interface ExtractedCvData {
  education: EducationItem[];
  experience: ExperienceItem[];
  skills: Skill[];
  languages: Language[];
}

/**
 * Cloud Function that triggers when a CV is uploaded to Firebase Storage
 */
export const processCvUpload = functions.storage
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
    } catch (error) {
      console.error('Error processing CV:', error);
      return null;
    }
  });

/**
 * Extract data from a CV file using the Affinda API
 */
async function extractCvDataWithAffinda(filePath: string): Promise<ExtractedCvData> {
  try {
    console.log('Starting Affinda API call...');
    
    // Use FormData and axios for more reliable file upload
    const form = new FormData();
    form.append('file', fs.createReadStream(filePath));
    
    const response = await axios.post('https://api.affinda.com/v2/resumes', form, {
      headers: {
        ...form.getHeaders(),
        'Authorization': `Bearer ${AFFINDA_API_KEY}`,
        'Accept': 'application/json'
      }
    });
    
    const result = response.data;
    console.log('Affinda API response received.');
    
    // Initialize the data structure
    const extractedData: ExtractedCvData = {
      education: [],
      experience: [],
      skills: [],
      languages: []
    };
    
    // Extract education
    if (result.data.education && Array.isArray(result.data.education)) {
      extractedData.education = result.data.education.map((edu: any) => ({
        institution: edu.organization || 'Unknown Institution',
        degree: edu.accreditation?.education || 'Unknown Degree',
        period: formatDateRange(edu.dates?.startDate, edu.dates?.endDate)
      }));
    }
    
    // Extract work experience
    if (result.data.workExperience && Array.isArray(result.data.workExperience)) {
      extractedData.experience = result.data.workExperience.map((exp: any) => ({
        company: exp.organization || 'Unknown Company',
        position: exp.jobTitle || 'Unknown Position',
        period: formatDateRange(exp.dates?.startDate, exp.dates?.endDate),
        description: exp.jobDescription || ''
      }));
    }
    
    // Extract skills
    if (result.data.skills && Array.isArray(result.data.skills)) {
      extractedData.skills = result.data.skills.map((skill: any) => ({
        name: skill.name || '',
        level: 'Intermediate' // Affinda doesn't provide skill levels, so we use a default
      }));
    }
    
    // Extract languages
    if (result.data.languages && Array.isArray(result.data.languages)) {
      extractedData.languages = result.data.languages.map((lang: any) => ({
        name: lang.name || '',
        level: lang.level || 'Intermediate'
      }));
    }
    
    console.log('Data extracted from CV:', JSON.stringify(extractedData, null, 2));
    return extractedData;
  } catch (error) {
    console.error('Error calling Affinda API:', error);
    throw error;
  }
}

/**
 * Update the Firestore database with the extracted CV data
 */
async function updateFirestoreWithCvData(portfolioId: string, cvData: ExtractedCvData): Promise<void> {
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
  } catch (error) {
    console.error(`Error updating Firestore: ${error}`);
    throw error;
  }
}

/**
 * Helper function to format date ranges for display
 */
function formatDateRange(startDate?: string, endDate?: string): string {
  if (!startDate && !endDate) return 'Unknown period';
  
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    
    try {
      const date = new Date(dateStr);
      return `${date.getMonth() + 1}/${date.getFullYear()}`;
    } catch (e) {
      return dateStr;
    }
  };
  
  const start = formatDate(startDate);
  const end = endDate ? formatDate(endDate) : 'Present';
  
  return `${start} - ${end}`;
} 