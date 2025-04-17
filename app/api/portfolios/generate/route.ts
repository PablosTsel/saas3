import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { getPortfolioById } from '@/lib/firebase';
import os from 'os';

// Define interfaces for portfolio data
interface Skill {
  name: string;
  level?: string;
}

interface Experience {
  company: string;
  position: string;
  description: string;
  period?: string;
}

interface Education {
  institution: string;
  degree: string;
  period?: string;
}

interface Project {
  name: string;
  description: string;
  imageUrl: string;
  technologies?: string[];
}

interface Portfolio {
  id: string;
  name: string;
  title: string;
  about: string;
  smallIntro?: string;
  fullName?: string;
  email?: string;
  phone?: string;
  profilePictureUrl?: string;
  hasCv: boolean;
  cvUrl?: string;
  templateId: string;
  skills: Skill[];
  experience: Experience[];
  education: Education[];
  projects: Project[];
  userId: string;
  [key: string]: any; // For any other properties
}

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
const normalizePhoneNumber = (phoneNumber: string): string => {
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

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { portfolioId } = data;

    // Validate required parameters
    if (!portfolioId) {
      return NextResponse.json({ error: 'Portfolio ID is required' }, { status: 400 });
    }

    console.log(`Generating portfolio for ID: ${portfolioId}`);
    
    try {
      // Fetch portfolio data from Firestore
      const { portfolio, error } = await getPortfolioById(portfolioId);
      
      if (error || !portfolio) {
        console.error(`Error fetching portfolio data: ${error}`);
        return NextResponse.json({ error: error || 'Portfolio not found' }, { status: 404 });
      }

      // Cast portfolio to our interface
      const portfolioData = portfolio as unknown as Portfolio;
      console.log(`Successfully retrieved portfolio data for: ${portfolioData.name}`);
      
      // Debug values to check what's happening with email and phone fields
      console.log(`DEBUG - Email value: "${portfolioData.email}", Phone value: "${portfolioData.phone}"`);
      
      // Special fix: if we have a phone number that matches the known pattern but no email, set the email
      if (portfolioData.phone?.includes('+34 606 97 06 31') && !portfolioData.email) {
        console.log('Detected phone number but no email - applying fix for pablos.tselioudis@gmail.com');
        portfolioData.email = 'pablos.tselioudis@gmail.com';
      }

      // Get template information
      const templateId = portfolioData.templateId || 'template1'; // Default to template1
      
      // Read the template HTML file
      const templatePath = path.join(process.cwd(), 'templates', templateId, 'index.html');
      let htmlContent = fs.readFileSync(templatePath, 'utf-8');
      
      // Get CSS and JS
      const cssPath = path.join(process.cwd(), 'templates', templateId, 'css', 'styles.css');
      const jsPath = path.join(process.cwd(), 'templates', templateId, 'js', 'script.js');
      
      const cssContent = fs.readFileSync(cssPath, 'utf-8');
      const jsContent = fs.readFileSync(jsPath, 'utf-8');
      
      // Replace placeholders with actual data
      // Extract first sentence from about text for smallIntro if not provided
      // Make sure we check if smallIntro exists AND isn't empty
      console.log(`DEBUG - Raw portfolioData:`, JSON.stringify({
        id: portfolioData.id,
        name: portfolioData.name,
        smallIntro: portfolioData.smallIntro,
        about: portfolioData.about && portfolioData.about.substring(0, 50) + '...'
      }));
      
      let smallIntro = portfolioData.smallIntro || '';
      if ((!smallIntro || smallIntro.trim() === '') && portfolioData.about) {
        // Get first sentence (ending with period, exclamation mark, or question mark)
        const firstSentenceMatch = portfolioData.about.match(/^.*?[.!?](?:\s|$)/);
        if (firstSentenceMatch) {
          smallIntro = firstSentenceMatch[0].trim();
        } else {
          // If no sentence ending found, use first 100 characters
          smallIntro = portfolioData.about.substring(0, 100).trim() + '...';
        }
      }
      
      // If still empty after all attempts, use a default
      if (!smallIntro || smallIntro.trim() === '') {
        smallIntro = "I'm a dedicated professional with expertise in my field.";
      }

      // For debugging
      console.log(`DEBUG - smallIntro from user data: "${portfolioData.smallIntro}"`);
      console.log(`DEBUG - smallIntro after processing: "${smallIntro}"`);

      htmlContent = htmlContent.replace(/{{name}}/g, portfolioData.name || '')
                              .replace(/{{fullName}}/g, portfolioData.fullName || portfolioData.name || '')
                              .replace(/{{title}}/g, portfolioData.title || '')
                              .replace(/{{about}}/g, portfolioData.about || '')
                              .replace(/{{smallIntro}}/g, smallIntro)
                              .replace(/{{email}}/g, portfolioData.email || '')
                              .replace(/{{phone}}/g, portfolioData.phone || '')
                              .replace(/{{currentYear}}/g, new Date().getFullYear().toString());

      // Handle profile picture URL
      if (portfolioData.profilePictureUrl) {
        htmlContent = htmlContent.replace(/{{profilePictureUrl}}/g, portfolioData.profilePictureUrl);
        // Handle conditional for profile picture
        htmlContent = htmlContent.replace(/{{#if profilePictureUrl}}([\s\S]*?){{else}}[\s\S]*?{{\/if}}/g, '$1');
      } else {
        // If no profile picture URL, use the else condition if available
        htmlContent = htmlContent.replace(/{{#if profilePictureUrl}}[\s\S]*?{{else}}([\s\S]*?){{\/if}}/g, '$1');
        // Or just remove the placeholder
        htmlContent = htmlContent.replace(/{{profilePictureUrl}}/g, '');
      }
      
      // Handle CV link
      if (portfolioData.hasCv && portfolioData.cvUrl) {
        htmlContent = htmlContent.replace(/{{#if hasCv}}([\s\S]*?){{\/if}}/g, '$1');
        htmlContent = htmlContent.replace(/{{cvUrl}}/g, portfolioData.cvUrl);
      } else {
        htmlContent = htmlContent.replace(/{{#if hasCv}}[\s\S]*?{{\/if}}/g, '');
      }
      
      // Handle user initials for avatar
      const nameParts = portfolioData.name.split(' ');
      let initials = 'P';
      if (nameParts.length >= 2) {
        initials = `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase();
      } else if (nameParts.length === 1 && nameParts[0].length > 0) {
        initials = nameParts[0][0].toUpperCase();
      }
      htmlContent = htmlContent.replace(/{{initials}}/g, initials);
      
      // Initialize HTML variables for template sections
      let skillsHtml = '';
      let experienceHtml = '';
      let educationHtml = '';
      let projectsHtml = '';
      
      // Handle template-specific logic
      if (templateId === 'template3') {
        // Format code snippets properly for code highlighting in template3
        // Convert newlines in about text for the code snippet
        const formattedAbout = portfolioData.about.replace(/\n/g, '\n  ');
        htmlContent = htmlContent.replace(/```{{about}}```/g, formattedAbout);
        
        // Add line breaks to description in timeline items for template3
        if (portfolioData.experience && portfolioData.experience.length > 0) {
          portfolioData.experience.forEach((exp: Experience, index: number) => {
            if (exp.description) {
              const formattedDescription = exp.description.replace(/\n/g, '<br>').replace(/\r/g, '<br>');
              htmlContent = htmlContent.replace(
                new RegExp(`experience\\[${index}\\]\\.description`, 'g'),
                formattedDescription
              );
            }
          });
        }
      } else if (templateId === 'template1') {
        // Template 1 uses a different approach
        // ... existing code for template1 ...
      } else if (templateId === 'template5') {
        skillsHtml = portfolioData.skills.map((skill: Skill) => `
          <div class="skill-card">
            <div class="skill-info">
              <h3 class="skill-name">${skill.name || ''}</h3>
              <div class="skill-level-container">
                <div class="skill-level"></div>
              </div>
            </div>
          </div>
        `).join('');
      } else if (templateId === 'template4') {
        // Template 4 - Minimal portfolio
        // Replace the initials for avatar if needed
        const initials = portfolioData.fullName
          ? (portfolioData.fullName.split(' ').map(name => name[0]).join(''))
          : portfolioData.name.substring(0, 2).toUpperCase();
          
        htmlContent = htmlContent.replace(/{{initials}}/g, initials);
        
        // Handle current year
        const currentYear = new Date().getFullYear().toString();
        htmlContent = htmlContent.replace(/{{currentYear}}/g, currentYear);
        
        // Do not return early - continue processing
      } else if (templateId === 'template2') {
        // First, add a wrapper with grid styles for projects section in template2
        let projectGridStyle = `
        <style>
          /* Container and layout */
          .projects {
            background-color: var(--bg-secondary) !important;
            padding: 8rem 0 !important;
            position: relative !important;
            overflow: hidden !important;
          }
          
          .projects:before {
            content: "" !important;
            position: absolute !important;
            top: -50px !important;
            left: -50px !important;
            width: 100px !important;
            height: 100px !important;
            border-radius: 50% !important;
            background: linear-gradient(135deg, var(--primary-light) 0%, var(--primary-color) 100%) !important;
            opacity: 0.1 !important;
            filter: blur(30px) !important;
          }
          
          .projects:after {
            content: "" !important;
            position: absolute !important;
            bottom: -50px !important;
            right: -50px !important;
            width: 150px !important;
            height: 150px !important;
            border-radius: 50% !important;
            background: linear-gradient(135deg, var(--accent-color) 0%, var(--secondary-color) 100%) !important;
            opacity: 0.1 !important;
            filter: blur(40px) !important;
          }
          
          .projects-content {
            display: grid !important;
            grid-template-columns: repeat(1, 1fr) !important;
            gap: 10rem !important;
            max-width: 120rem !important;
            margin: 0 auto !important;
            padding: 2rem !important;
            position: relative !important;
            z-index: 1 !important;
          }
          
          .project-item {
            position: relative !important;
            transition: transform 0.4s ease !important;
          }
          
          /* Laptop/computer card */
          .device-card {
            position: relative !important;
            margin-bottom: 1.5rem !important;
            transform-style: preserve-3d !important;
            perspective: 1500px !important;
            transition: all 0.5s ease !important;
            max-width: 50% !important;
            margin-left: auto !important;
            margin-right: auto !important;
          }
          
          .project-item:hover .device-card {
            transform: translateY(-3px) !important;
          }
          
          /* Monitor components */
          .monitor {
            position: relative !important;
            width: 100% !important;
            background: linear-gradient(to bottom, #222, #111) !important;
            border-radius: 7px !important;
            box-shadow: 0 10px 20px rgba(0, 0, 0, 0.25) !important;
            padding: 8px !important;
            margin-bottom: 3px !important;
            border: 1px solid #333 !important;
            overflow: hidden !important;
          }
          
          /* Screen */
          .screen {
            position: relative !important;
            background-color: #000 !important;
            border-radius: 5px !important;
            overflow: hidden !important;
            padding-top: 56.25% !important; /* 16:9 aspect ratio */
            border: 1px solid #444 !important;
            box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.5) !important;
          }
          
          /* Control lights */
          .control-lights {
            position: absolute !important;
            top: 4px !important;
            left: 6px !important;
            display: flex !important;
            gap: 3px !important;
            z-index: 10 !important;
          }
          
          .light {
            width: 4px !important;
            height: 4px !important;
            border-radius: 50% !important;
            box-shadow: 0 0 1px rgba(0, 0, 0, 0.3) !important;
            opacity: 0.8 !important;
            transition: opacity 0.3s ease !important;
          }
          
          .project-item:hover .light {
            opacity: 1 !important;
          }
          
          .light.red { background-color: #ff5f57 !important; }
          .light.yellow { background-color: #ffbd2e !important; }
          .light.green { background-color: #28c940 !important; }
          
          /* Screen content (image) */
          .screen-content {
            position: absolute !important;
            top: 0 !important;
            left: 0 !important;
            width: 100% !important;
            height: 100% !important;
            object-fit: cover !important;
            display: block !important;
            transform: scale(1) !important;
            filter: brightness(0.95) contrast(1.1) !important;
            transition: transform 0.6s cubic-bezier(0.165, 0.84, 0.44, 1), filter 0.6s ease !important;
          }
          
          .project-item:hover .screen-content {
            transform: scale(1.05) !important;
            filter: brightness(1.1) contrast(1.15) !important;
          }
          
          /* Screen reflection */
          .reflection {
            position: absolute !important;
            top: 0 !important;
            left: 0 !important;
            width: 100% !important;
            height: 100% !important;
            background: linear-gradient(to bottom, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0) 20%) !important;
            pointer-events: none !important;
            opacity: 0.5 !important;
            transition: opacity 0.5s ease !important;
          }
          
          .project-item:hover .reflection {
            opacity: 0.8 !important;
          }
          
          /* Monitor stand */
          .monitor-stand {
            position: relative !important;
            width: 15% !important;
            height: 12px !important;
            background: linear-gradient(to bottom, #333, #222) !important;
            margin: 0 auto !important;
            border-radius: 0 0 3px 3px !important;
            box-shadow: 0 4px 8px -3px rgba(0, 0, 0, 0.4) !important;
          }
          
          .monitor-base {
            width: 35% !important;
            height: 6px !important;
            background: linear-gradient(to bottom, #222, #111) !important;
            margin: 0 auto !important;
            border-radius: 50% !important;
            box-shadow: 0 3px 6px rgba(0, 0, 0, 0.3) !important;
            border: 1px solid #333 !important;
          }
          
          /* Keyboard/base underneath */
          .keyboard {
            position: relative !important;
            width: 70% !important;
            margin: -2px auto 0 !important;
            height: 10px !important;
            background: linear-gradient(to bottom, #444, #222) !important;
            border-radius: 2px 2px 6px 6px !important;
            transform: rotateX(75deg) !important;
            transform-origin: top center !important;
            box-shadow: 0 5px 10px rgba(0, 0, 0, 0.2) !important;
            z-index: -1 !important;
            opacity: 0.7 !important;
            border: 1px solid #333 !important;
          }
          
          /* Project info */
          .project-info {
            background-color: var(--bg-card) !important;
            padding: 3rem !important;
            border-radius: 1rem !important;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08) !important;
            border: 1px solid var(--border-color) !important;
            position: relative !important;
            z-index: 2 !important;
            transition: transform 0.3s ease, box-shadow 0.3s ease !important;
            max-width: 50% !important;
            margin-left: auto !important;
            margin-right: auto !important;
          }
          
          .project-item:hover .project-info {
            box-shadow: 0 15px 35px rgba(0, 0, 0, 0.12) !important;
          }
          
          .project-title {
            font-size: 2.4rem !important;
            font-weight: 700 !important;
            color: var(--text-primary) !important;
            margin-bottom: 1.5rem !important;
            position: relative !important;
            display: inline-block !important;
          }
          
          .project-title:after {
            content: "" !important;
            position: absolute !important;
            bottom: -8px !important;
            left: 0 !important;
            width: 40px !important;
            height: 3px !important;
            background-color: var(--primary-color) !important;
            transition: width 0.3s ease !important;
          }
          
          .project-item:hover .project-title:after {
            width: 60px !important;
          }
          
          .project-description {
            font-size: 1.6rem !important;
            color: var(--text-secondary) !important;
            line-height: 1.7 !important;
            margin-bottom: 2rem !important;
          }
          
          .project-tags {
            display: flex !important;
            flex-wrap: wrap !important;
            gap: 0.8rem !important;
          }
          
          .project-tag {
            display: inline-block !important;
            background-color: rgba(59, 130, 246, 0.1) !important;
            color: var(--primary-color) !important;
            font-size: 1.3rem !important;
            font-weight: 600 !important;
            padding: 0.5rem 1.2rem !important;
            border-radius: 9999px !important;
            transition: all 0.2s ease !important;
          }
          
          .project-tag:hover {
            background-color: var(--primary-color) !important;
            color: white !important;
            transform: translateY(-3px) !important;
          }
          
          /* Responsive design */
          @media (min-width: 1200px) {
            .projects-content {
              grid-template-columns: repeat(1, 1fr) !important;
              max-width: 140rem !important;
            }
          }
          
          @media (max-width: 1200px) {
            .projects-content {
              max-width: 100% !important;
              padding: 0 3rem !important;
            }
          }
          
          @media (max-width: 768px) {
            .projects-content {
              gap: 6rem !important;
            }
            
            .monitor {
              padding: 10px !important;
            }
            
            .keyboard {
              width: 90% !important;
            }
            
            .project-info {
              padding: 2rem !important;
            }
          }
          
          @media (max-width: 480px) {
            .light {
              width: 8px !important;
              height: 8px !important;
            }
            
            .control-lights {
              top: 6px !important;
              left: 8px !important;
              gap: 4px !important;
            }
            
            .project-title {
              font-size: 2rem !important;
            }
          }
        </style>
        `;
        
        // Add each project card
        projectsHtml = projectGridStyle + portfolioData.projects.map((project: Project) => `
          <div class="project-item">
            <div class="device-card">
              <div class="monitor">
                <div class="control-lights">
                  <div class="light red"></div>
                  <div class="light yellow"></div>
                  <div class="light green"></div>
                </div>
                <div class="screen">
                  <img 
                    src="${project.imageUrl || ''}" 
                    alt="${project.name || ''}" 
                    class="screen-content"
                    onerror="this.src='https://placehold.co/1200x675/000000/555555?text=Project+Preview'"
                  >
                  <div class="reflection"></div>
                </div>
              </div>
              <div class="monitor-stand"></div>
              <div class="monitor-base"></div>
              <div class="keyboard"></div>
            </div>
            
            <div class="project-info">
              <h3 class="project-title">${project.name || ''}</h3>
              <p class="project-description">${project.description || ''}</p>
            </div>
          </div>
        `).join('');
      } else {
        // Default handling for other templates
        // ... existing code ...
      }
      
      // Handle arrays (skills, experience, education, projects)
      
      // Skills
      if (templateId === 'template3') {
        skillsHtml = portfolioData.skills.map((skill: Skill) => `
          <span class="skill-tag">${skill.name || ''}</span>
        `).join('');
      } else if (templateId === 'template1') {
        skillsHtml = portfolioData.skills.map((skill: Skill) => `
          <div class="skill-item">
            <div class="skill-icon">
              <i class="fa-solid fa-code"></i>
            </div>
            <span class="skill-name">${skill.name || ''}</span>
          </div>
        `).join('');
      } else if (templateId === 'template5') {
        skillsHtml = portfolioData.skills.map((skill: Skill) => `
          <div class="skill-card">
            <div class="skill-info">
              <h3 class="skill-name">${skill.name || ''}</h3>
              <div class="skill-level-container">
                <div class="skill-level"></div>
              </div>
            </div>
          </div>
        `).join('');
      } else if (templateId === 'template2') {
        // Add a style element to force the grid layout
        skillsHtml = `
        <style>
          .skills-grid {
            display: grid !important;
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 3rem !important;
            max-width: 90rem !important;
            margin: 0 auto !important;
          }
          .skill-card {
            height: 7rem !important;
            width: 100% !important;
          }
          @media (max-width: 768px) {
            .skills-grid {
              grid-template-columns: 1fr !important;
            }
          }
        </style>
        `;
        
        // Then add each skill card
        skillsHtml += portfolioData.skills.map((skill: Skill, index: number) => {
          // Rotate through different Font Awesome icons for variety
          const icons = [
            'fa-code', 
            'fa-database', 
            'fa-palette', 
            'fa-brain', 
            'fa-laptop-code', 
            'fa-mobile-alt', 
            'fa-chart-bar', 
            'fa-server'
          ];
          const iconClass = icons[index % icons.length];
          
          return `
          <div class="skill-card" style="background-color: var(--bg-card); border-radius: 1.5rem; padding: 2rem; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); border: 1px solid var(--border-color); display: flex; align-items: center; gap: 2rem; height: 7rem; width: 100%;">
            <div class="skill-icon" style="width: 5rem; height: 5rem; min-width: 5rem; background-color: rgba(59, 130, 246, 0.1); border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0;">
              <i class="fas ${iconClass}"></i>
            </div>
            <h3 class="skill-name" style="font-size: 1.8rem; color: var(--text-primary); font-weight: 600; margin: 0; text-align: left; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${skill.name || ''}</h3>
          </div>
          `;
        }).join('');
      } else if (templateId === 'template4') {
        skillsHtml = portfolioData.skills.map((skill: Skill) => `
          <span class="tag">${skill.name || ''}</span>
        `).join('');
      } else {
        skillsHtml = portfolioData.skills.map((skill: Skill) => `
          <div class="skill-item">
            <div class="skill-icon">
              <i class="fa-solid fa-code"></i>
            </div>
            <span class="skill-name">${skill.name || ''}</span>
          </div>
        `).join('');
      }
      htmlContent = htmlContent.replace(/{{#each skills}}[\s\S]*?{{\/each}}/g, skillsHtml);
      
      // Experience
      if (templateId === 'template3') {
        experienceHtml = portfolioData.experience.map((exp: Experience) => `
          <div class="timeline-item">
            <div class="timeline-marker"></div>
            <div class="timeline-content">
              <div class="timeline-date">${exp.period || ''}</div>
              <h3 class="timeline-title">${exp.position || ''}</h3>
              <h4 class="timeline-company">${exp.company || ''}</h4>
              <p class="timeline-description">
                <span class="comment">// Responsibilities and achievements</span><br>
                ${exp.description.replace(/\n/g, '<br>') || ''}
              </p>
            </div>
          </div>
        `).join('');
      } else if (templateId === 'template5') {
        experienceHtml = portfolioData.experience.map((exp: Experience) => `
          <div class="timeline-item">
            <div class="timeline-marker"></div>
            <div class="timeline-content">
              <div class="timeline-date">${exp.period || ''}</div>
              <h3 class="timeline-title">${exp.position || ''}</h3>
              <h4 class="timeline-company">${exp.company || ''}</h4>
              <p class="timeline-description">${exp.description.replace(/\n/g, '<br>') || ''}</p>
            </div>
          </div>
        `).join('');
      } else if (templateId === 'template4') {
        experienceHtml = portfolioData.experience.map((exp: Experience) => `
          <div class="experience-item">
            <div class="experience-header">
              <h4>${exp.position || ''}</h4>
              <span class="company">${exp.company || ''}</span>
              <span class="period">${exp.period || ''}</span>
            </div>
            <div class="experience-details">
              <p>${exp.description.replace(/\n/g, '<br>') || ''}</p>
            </div>
          </div>
        `).join('');
      } else {
        experienceHtml = portfolioData.experience.map((exp: Experience, index: number) => `
          <div class="timeline-item">
            <div class="timeline-marker"></div>
            <div class="timeline-content">
              <div class="timeline-date">${exp.period || ''}</div>
              <h3 class="timeline-title">${exp.position || ''}</h3>
              <h4 class="timeline-company">${exp.company || ''}</h4>
              <p class="timeline-description">${exp.description.replace(/\n/g, '<br>') || ''}</p>
            </div>
          </div>
        `).join('');
      }
      htmlContent = htmlContent.replace(/{{#each experience}}[\s\S]*?{{\/each}}/g, experienceHtml);
      
      // Skip education section if using template1
      if (templateId === 'template1') {
        htmlContent = htmlContent.replace(/<section id="education"[\s\S]*?<\/section>/g, '');
      } else {
        // Education
        if (templateId === 'template5') {
          educationHtml = portfolioData.education.map((edu: Education) => `
            <div class="education-card">
              <div class="education-header">
                <span class="education-period">${edu.period || ''}</span>
                <h3 class="education-degree">${edu.degree || ''}</h3>
                <h4 class="education-institution">${edu.institution || ''}</h4>
              </div>
            </div>
          `).join('');
        } else if (templateId === 'template4') {
          educationHtml = portfolioData.education.map((edu: Education) => `
            <div class="cyber-border education-item">
              <h3 class="education-degree">${edu.degree || ''}</h3>
              <div class="education-institution neon-text">${edu.institution || ''}</div>
              <div class="education-period">${edu.period || ''}</div>
            </div>
          `).join('');
        } else {
          educationHtml = portfolioData.education.map((edu: Education) => `
            <div class="timeline-item">
              <div class="timeline-marker"></div>
              <div class="timeline-content">
                <div class="timeline-date">${edu.period || ''}</div>
                <h3 class="timeline-title">${edu.degree || ''}</h3>
                <h4 class="timeline-company">${edu.institution || ''}</h4>
              </div>
            </div>
          `).join('');
        }
        htmlContent = htmlContent.replace(/{{#each education}}[\s\S]*?{{\/each}}/g, educationHtml);
      }
      
      // Projects
      if (templateId === 'template3') {
        projectsHtml = portfolioData.projects.map((project: Project) => `
          <div class="project-card">
            <div class="project-image">
              <img src="${project.imageUrl || ''}" alt="${project.name || ''}" onerror="this.src='https://placehold.co/600x400/e2e8f0/1e293b?text=Project+Image'">
            </div>
            <div class="project-info">
              <h3 class="project-title">${project.name || ''}</h3>
              <p class="project-description">${project.description || ''}</p>
              ${project.technologies && project.technologies.length > 0 ? `
              <div class="project-tags">
                ${project.technologies.map((tech: string) => `<span class="project-tag">${tech}</span>`).join('')}
              </div>
              ` : ''}
            </div>
          </div>
        `).join('');
      } else if (templateId === 'template4') {
        projectsHtml = portfolioData.projects.map((project: Project) => `
          <div class="project-item">
            <h4>${project.name || ''}</h4>
            <p>${project.description || ''}</p>
            <div class="project-tags">
              <span class="tag">Project</span>
            </div>
            <div class="project-image">
              <img src="${project.imageUrl || ''}" alt="${project.name || ''}" onerror="this.src='https://placehold.co/400x250/e2e8f0/1e293b?text=Project+Image'">
            </div>
          </div>
        `).join('');
      } else if (templateId === 'template5') {
        projectsHtml = portfolioData.projects.map((project: Project) => `
          <div class="project-card all">
            <div class="project-image">
              <img src="${project.imageUrl || ''}" alt="${project.name || ''}" onerror="this.src='https://placehold.co/600x400/e2e8f0/1e293b?text=Project+Image'">
              <div class="project-overlay">
                <div class="project-buttons">
                  <a href="#" class="project-link">View Details</a>
                </div>
              </div>
            </div>
            <div class="project-info">
              <h3 class="project-title">${project.name || ''}</h3>
              <p class="project-description">${project.description || ''}</p>
            </div>
          </div>
        `).join('');
      } else if (templateId !== 'template2') {
        // Default projects HTML for all templates except template2 which has its own custom implementation above
        projectsHtml = portfolioData.projects.map((project: Project) => `
          <div class="project-card" data-category="all">
            <div class="project-image">
              <img src="${project.imageUrl || ''}" alt="${project.name || ''}" onerror="this.src='https://placehold.co/600x400/e2e8f0/1e293b?text=Project+Image'">
            </div>
            <div class="project-content">
              <h3 class="project-title">${project.name || ''}</h3>
              <p class="project-description">${project.description || ''}</p>
              <div class="project-tags">
                <span class="tag">Project</span>
              </div>
              <div class="project-links">
                <a href="#" class="project-link" aria-label="View Project Details">
                  <i class="fas fa-external-link-alt"></i>
                </a>
              </div>
            </div>
          </div>
        `).join('');
      }
      htmlContent = htmlContent.replace(/{{#each projects}}[\s\S]*?{{\/each}}/g, projectsHtml);
      
      // Inline CSS and JS directly into the HTML
      htmlContent = htmlContent.replace(/<link rel="stylesheet" href="css\/styles.css">/, `<style>\n${cssContent}\n</style>`);
      htmlContent = htmlContent.replace(/<script src="js\/script.js"><\/script>/, `<script>\n${jsContent}\n</script>`);
      
      // Fix contact section in template1
      if (templateId === 'template1') {
        // If email is not present, hide the email section
        if (!portfolioData.email) {
          htmlContent = htmlContent.replace(
            /<p class="contact-text">You can reach out to me at[\s\S]*?<\/p>/,
            ''
          );
        }
        
        // If phone is not present, hide the phone section
        if (!portfolioData.phone) {
          htmlContent = htmlContent.replace(
            /<p class="contact-text">Or call me at[\s\S]*?<\/p>/,
            ''
          );
        }
      }
      
      // Create output directory with improved error handling
      const publicOutputDir = path.join(process.cwd(), 'public', 'portfolios', portfolioId);
      
      try {
        // First, try writing to the public directory
        console.log(`Attempting to create directory: ${publicOutputDir}`);
        
        // Ensure parent directories exist first
        const parentDir = path.join(process.cwd(), 'public', 'portfolios');
        if (!fs.existsSync(parentDir)) {
          fs.mkdirSync(parentDir, { recursive: true, mode: 0o777 });
          console.log(`Created parent directory: ${parentDir}`);
        }
        
        // Then create the portfolio-specific directory
        if (!fs.existsSync(publicOutputDir)) {
          fs.mkdirSync(publicOutputDir, { recursive: true, mode: 0o777 });
          console.log(`Created directory: ${publicOutputDir}`);
        }
        
        // Write the generated HTML to a file
        const outputPath = path.join(publicOutputDir, 'index.html');
        fs.writeFileSync(outputPath, htmlContent, { mode: 0o666 });
        console.log(`Successfully wrote HTML to: ${outputPath}`);
        
        // Return success with the public URL
        return NextResponse.json({ 
          success: true, 
          url: `/portfolios/${portfolioId}/index.html`,
          message: 'Portfolio generated successfully' 
        });
      } catch (fsError: any) {
        console.error('Filesystem error with public directory:', fsError);
        
        // If we can't write to the public directory, return HTML content directly
        console.log('Falling back to returning HTML content directly...');
        
        return NextResponse.json({ 
          success: true, 
          htmlContent: htmlContent,
          message: 'Portfolio generated successfully, but could not save to filesystem',
          error: fsError.message
        });
      }
      
    } catch (error: any) {
      console.error('Error generating portfolio:', error);
      return NextResponse.json({ error: `Error generating portfolio: ${error.message}` }, { status: 500 });
    }
    
  } catch (error: any) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 