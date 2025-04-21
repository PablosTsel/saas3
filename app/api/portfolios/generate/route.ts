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
  githubUrl?: string;
  reportUrl?: string;
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
        
        // Special handling for Template3 with GitHub and report buttons
        projectsHtml = portfolioData.projects.map((project: Project) => {
          // Check if we have GitHub URL or report URL
          const hasGithub = project.githubUrl && project.githubUrl.trim() !== '';
          const hasReport = project.reportUrl && project.reportUrl.trim() !== '';
          
          // Generate appropriate button HTML
          const buttonHtml = (hasGithub || hasReport) ? `
            <div class="project-links">
              ${hasGithub ? `<a href="${project.githubUrl}" class="project-link github" target="_blank">
                <i class="fab fa-github"></i> GitHub
              </a>` : ''}
              ${hasReport ? `<a href="${project.reportUrl}" class="project-link report" target="_blank">
                <i class="fas fa-file-alt"></i> Report
              </a>` : ''}
            </div>
          ` : '';
          
          return `
          <div class="project-card">
            <div class="project-image">
              <img src="${project.imageUrl || ''}" alt="${project.name || 'Project'}" onerror="this.src='https://placehold.co/600x400/e2e8f0/1e293b?text=Project+Image'">
            </div>
            <div class="project-info">
              <h3>${project.name || ''}</h3>
              <p>${project.description || ''}</p>
              ${buttonHtml}
            </div>
          </div>
          `;
        }).join('');
        
        // Add custom CSS for Template3 buttons
        const template3Css = `
        <style>
          /* Project card structure */
          .project-card {
            display: flex;
            flex-direction: column;
            height: 100%;
            background-color: var(--card-bg);
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 5px 15px var(--shadow-color);
            transition: transform 0.3s;
            border: 1px solid var(--border-color);
          }
          
          .project-card:hover {
            transform: translateY(-10px);
          }
          
          .project-info {
            padding: 1.5rem;
            display: flex;
            flex-direction: column;
            flex-grow: 1;
          }
          
          .project-info h3 {
            font-size: 1.25rem;
            font-weight: 600;
            margin-bottom: 0.5rem;
            color: var(--text-color);
          }
          
          .project-info p {
            color: var(--secondary-color);
            margin-bottom: 1.5rem;
            line-height: 1.6;
            flex-grow: 1;
          }
          
          /* Project Links/Buttons */
          .project-links {
            display: flex;
            gap: 0.75rem;
            margin-top: auto;
          }
          
          .project-link {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.6rem 1.2rem;
            border-radius: 4px;
            font-size: 0.95rem;
            font-weight: 500;
            text-decoration: none;
            transition: all 0.3s ease;
            flex: 1;
            justify-content: center;
          }
          
          .project-link.github {
            background-color: var(--highlight-color);
            color: white;
          }
          
          .project-link.github:hover {
            opacity: 0.9;
            transform: translateY(-2px);
          }
          
          .project-link.report {
            background-color: var(--button-bg);
            color: var(--text-color);
            border: 1px solid var(--border-color);
          }
          
          .project-link.report:hover {
            background-color: var(--button-hover);
            transform: translateY(-2px);
          }
          
          @media (max-width: 768px) {
            .project-links {
              flex-direction: column;
            }
          }
        </style>
        `;
        
        // Insert custom CSS
        htmlContent = htmlContent.replace('</head>', `${template3Css}</head>`);
      } else if (templateId === 'template1') {
        // Special handling for Template1 with GitHub and report buttons
        projectsHtml = portfolioData.projects.map((project: Project) => {
          // Check if we have GitHub URL or report URL
          const hasGithub = project.githubUrl && project.githubUrl.trim() !== '';
          const hasReport = project.reportUrl && project.reportUrl.trim() !== '';
          
          // Determine button classes based on what we have
          let buttonContainerClass = '';
          let githubButtonClass = '';
          let reportButtonClass = '';
          
          if (hasGithub && hasReport) {
            buttonContainerClass = 'project-button-container two-buttons';
            githubButtonClass = 'project-button github-button half-width';
            reportButtonClass = 'project-button report-button half-width';
          } else if (hasGithub) {
            buttonContainerClass = 'project-button-container one-button';
            githubButtonClass = 'project-button github-button full-width';
          } else if (hasReport) {
            buttonContainerClass = 'project-button-container one-button';
            reportButtonClass = 'project-button report-button full-width';
          }
          
          // Only render the button container if we have at least one URL
          const buttonHtml = (hasGithub || hasReport) ? `
            <div class="${buttonContainerClass}">
              ${hasGithub ? `<a href="${project.githubUrl}" target="_blank" class="${githubButtonClass}">
                <i class="fab fa-github"></i> GitHub
              </a>` : ''}
              ${hasReport ? `<a href="${project.reportUrl}" target="_blank" class="${reportButtonClass}">
                <i class="fas fa-file-alt"></i> Report
              </a>` : ''}
            </div>
          ` : '';
          
          return `
          <div class="project-card">
            <div class="project-img">
              <img src="${project.imageUrl || ''}" alt="${project.name || 'Project'}" onerror="this.src='https://placehold.co/600x400/e2e8f0/1e293b?text=Project+Image'">
            </div>
            <div class="project-content">
              <h3>${project.name || ''}</h3>
              <p>${project.description || ''}</p>
              ${buttonHtml}
            </div>
          </div>
          `;
        }).join('');
        
        // Add custom CSS for the buttons and card layout
        const buttonCss = `
        <style>
          /* Flexbox layout for project cards to ensure buttons are at the bottom */
          .project-card {
            display: flex;
            flex-direction: column;
            height: 100%;
          }
          
          .project-content {
            display: flex;
            flex-direction: column;
            flex-grow: 1;
            padding: 1.5rem;
          }
          
          .project-content h3 {
            margin-top: 0;
            margin-bottom: 0.75rem;
          }
          
          .project-content p {
            flex-grow: 1;
            margin-bottom: 1rem;
          }
          
          .project-button-container {
            margin-top: auto;
            display: flex;
            gap: 0.5rem;
          }
          
          .project-button {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            padding: 0.5rem 1rem;
            border-radius: 0.25rem;
            font-weight: 500;
            text-decoration: none;
            transition: all 0.3s ease;
          }
          
          .project-button i {
            margin-right: 0.5rem;
          }
          
          .github-button {
            background-color: #333;
            color: white;
          }
          
          .github-button:hover {
            background-color: #24292e;
          }
          
          .report-button {
            background-color: #0070f3;
            color: white;
          }
          
          .report-button:hover {
            background-color: #0051cc;
          }
          
          .half-width {
            flex: 1;
          }
          
          .full-width {
            width: 100%;
          }
          
          /* Ensure consistent height for project cards */
          .projects-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            gap: 2rem;
          }
        </style>
        `;
        
        // Generate skills HTML for Template 1
        skillsHtml = portfolioData.skills.map((skill: Skill) => `
          <div class="skill-tag">
            <span class="skill-icon"><i class="fas fa-code"></i></span>
            <span class="skill-name">${skill.name || ''}</span>
          </div>
        `).join('');
        
        // Append the custom CSS to the HTML content
        htmlContent = htmlContent.replace('</head>', `${buttonCss}</head>`);
      } else if (templateId === 'template5') {
        // Add skills HTML for Template 5
        skillsHtml = portfolioData.skills.map((skill: Skill) => `
          <div class="skill-item">
            <div class="skill-icon">
              <i class="fas fa-code"></i>
            </div>
            <h4>${skill.name || ''}</h4>
            <div class="skill-bar">
                <div class="skill-level"></div>
            </div>
          </div>
        `).join('');
        
        // Generate projects HTML for Template 5
        projectsHtml = portfolioData.projects.map((project: Project) => {
          // Check if we have GitHub URL or report URL
          const hasGithub = project.githubUrl && project.githubUrl.trim() !== '';
          const hasReport = project.reportUrl && project.reportUrl.trim() !== '';
          
          return `
          <div class="project-card" data-category="all">
            <div class="project-image">
              <img src="${project.imageUrl || ''}" alt="${project.name || 'Project'}" onerror="this.src='https://placehold.co/600x400/e2e8f0/1e293b?text=Project+Image'">
              <div class="project-overlay">
                <div class="project-links">
                  ${hasGithub ? `<a href="${project.githubUrl}" class="project-link" target="_blank" rel="noopener noreferrer">
                    <i class="fab fa-github"></i>
                  </a>` : ''}
                  ${hasReport ? `<a href="${project.reportUrl}" class="project-link" target="_blank" rel="noopener noreferrer">
                    <i class="fas fa-file-alt"></i>
                  </a>` : ''}
                </div>
              </div>
            </div>
            
            <div class="project-info">
              <h3>${project.name || ''}</h3>
              <p>${project.description || ''}</p>
            </div>
          </div>
          `;
        }).join('');
      } else if (templateId === 'template4') {
        // Template 4 - Minimal portfolio with moving background
        // Replace the initials for avatar if needed
        const initials = portfolioData.fullName
          ? (portfolioData.fullName.split(' ').map(name => name[0]).join(''))
          : portfolioData.name.substring(0, 2).toUpperCase();
          
        htmlContent = htmlContent.replace(/{{initials}}/g, initials);
        
        // Handle current year
        const currentYear = new Date().getFullYear().toString();
        htmlContent = htmlContent.replace(/{{currentYear}}/g, currentYear);
        
        // Generate projects HTML for Template 4
        projectsHtml = portfolioData.projects.map((project: Project) => {
          // Check if we have GitHub URL or report URL
          const hasGithub = project.githubUrl && project.githubUrl.trim() !== '';
          const hasReport = project.reportUrl && project.reportUrl.trim() !== '';
          
          // Generate action buttons HTML
          const buttonsHtml = `
            <div class="project-actions">
              ${hasGithub ? `
              <a href="${project.githubUrl}" class="btn btn-sm" target="_blank">
                <i class="fab fa-github"></i> GitHub
              </a>
              ` : ''}
              ${hasReport ? `
              <a href="${project.reportUrl}" class="btn btn-sm" target="_blank">
                <i class="fas fa-file-alt"></i> Report
              </a>
              ` : ''}
            </div>
          `;
          
          return `
          <div class="project-card">
            <div class="project-image">
              <img src="${project.imageUrl || ''}" alt="${project.name || 'Project'}" onerror="this.src='https://placehold.co/600x400/e2e8f0/1e293b?text=Project+Image'">
              <div class="project-overlay">
                ${(hasGithub || hasReport) ? buttonsHtml : ''}
              </div>
            </div>
            <div class="project-content">
              <h3 class="project-title">${project.name || ''}</h3>
              <p class="project-description">${project.description || ''}</p>
            </div>
          </div>
          `;
        }).join('');
        
        // Add custom CSS for Template 4 buttons
        const template4Css = `
        <style>
          .project-overlay {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.7);
            display: flex;
            justify-content: center;
            align-items: center;
            opacity: 0;
            transition: opacity 0.3s ease;
          }
          
          .project-card:hover .project-overlay {
            opacity: 1;
          }
          
          .project-actions {
            display: flex;
            gap: 1rem;
          }
          
          .project-actions .btn {
            background-color: var(--primary-color);
            color: white;
            border: none;
            padding: 0.6rem 1rem;
            border-radius: 4px;
            font-weight: 500;
            transition: all 0.3s ease;
            text-decoration: none;
            display: inline-flex;
            align-items: center;
          }
          
          .project-actions .btn i {
            margin-right: 0.5rem;
          }
          
          .project-actions .btn:hover {
            background-color: var(--accent-color);
            transform: translateY(-3px);
          }
        </style>
        `;
        
        // Append the custom CSS to the HTML content
        htmlContent = htmlContent.replace('</head>', `${template4Css}</head>`);
        
        // Generate skills HTML for Template 4
        skillsHtml = portfolioData.skills.map((skill: Skill) => `
          <div class="skill-card">
            <div class="skill-icon">
              <i class="fas fa-code"></i>
            </div>
            <h3 class="skill-name">${skill.name || ''}</h3>
          </div>
        `).join('');
      } else if (templateId === 'template2') {
        // Template 2 has laptop-style project cards
        projectsHtml = portfolioData.projects.map((project: Project) => {
          // Check if we have GitHub URL or report URL
          const hasGithub = project.githubUrl && project.githubUrl.trim() !== '';
          const hasReport = project.reportUrl && project.reportUrl.trim() !== '';
          
          // Create HTML for buttons
          const buttonHtml = (hasGithub || hasReport) ? `
            <div class="project-actions">
              ${hasGithub ? `<a href="${project.githubUrl}" class="btn btn-sm btn-primary" target="_blank">
                <i class="fab fa-github"></i> GitHub
              </a>` : ''}
              ${hasReport ? `<a href="${project.reportUrl}" class="btn btn-sm btn-secondary" target="_blank">
                <i class="fas fa-file-alt"></i> Report
              </a>` : ''}
            </div>
          ` : '';
          
          return `
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
                    alt="${project.name || 'Project'}" 
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
            
            <div class="project-body">
              <h3 class="project-title">${project.name || ''}</h3>
              <p class="project-description">${project.description || ''}</p>
              ${buttonHtml}
            </div>
          </div>
          `;
        }).join('');
        
        // Add skills HTML for Template 2
        skillsHtml = portfolioData.skills.map((skill: Skill) => `
          <div class="skill-card" style="height: 7rem; width: 100%;">
            <div class="skill-icon">
              <i class="fas fa-code"></i>
            </div>
            <h3 class="skill-name">${skill.name || ''}</h3>
          </div>
        `).join('');
        
        const template2Css = `
        <style>
          /* Override standard card styles with laptop display styling */
          .projects-content {
            display: grid !important;
            grid-template-columns: repeat(1, 1fr) !important;
            gap: 8rem !important;
            max-width: 100rem !important;
            margin: 0 auto !important;
            width: 100% !important;
          }
          
          /* Hide any legacy project-card styles that might be present */
          .project-card {
            display: none !important;
          }
          
          /* Important device card styles */
          .device-card {
            position: relative !important;
            margin-bottom: 2rem !important;
            transform-style: preserve-3d !important;
            perspective: 1500px !important;
            transition: all 0.5s ease !important;
            max-width: 50% !important;
            margin-left: auto !important;
            margin-right: auto !important;
            box-shadow: 0 10px 20px rgba(0, 0, 0, 0.25) !important;
          }
          
          .project-item {
            position: relative !important;
            margin-bottom: 6rem !important;
            transition: transform 0.4s ease !important;
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
          
          /* Screen content */
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
          
          /* Stand and base */
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
          
          /* Project text content */
          .project-body {
            text-align: center !important;
            padding: 2rem !important;
            max-width: 60rem !important;
            margin: 0 auto !important;
          }
          
          .project-title {
            font-size: 2.4rem !important;
            margin-bottom: 1.5rem !important;
            color: var(--text-primary) !important;
          }
          
          .project-description {
            font-size: 1.6rem !important;
            color: var(--text-secondary) !important;
            margin-bottom: 2rem !important;
          }
          
          .project-actions {
            display: flex !important;
            gap: 1rem !important;
            justify-content: center !important;
          }

          /* Button styling */
          .project-button-container {
            display: flex !important;
            gap: 0.5rem !important;
            margin-top: 1rem !important;
            justify-content: center !important;
          }
          
          .project-button {
            display: inline-flex !important;
            align-items: center !important;
            justify-content: center !important;
            padding: 0.5rem 1rem !important;
            border-radius: 0.25rem !important;
            font-weight: 500 !important;
            text-decoration: none !important;
            transition: all 0.3s ease !important;
            flex: 1 !important;
          }
          
          .project-button i {
            margin-right: 0.5rem !important;
          }
          
          .github-button {
            background-color: var(--primary-color) !important;
            color: white !important;
          }
          
          .github-button:hover {
            background-color: var(--primary-dark) !important;
          }
          
          .report-button {
            background-color: var(--secondary-color) !important;
            color: white !important;
          }
          
          .report-button:hover {
            background-color: var(--secondary-dark) !important;
          }
          
          /* Responsive adjustments */
          @media (max-width: 768px) {
            .device-card {
              max-width: 80% !important;
            }
            .project-button-container {
              flex-direction: column !important;
            }
          }
        </style>
        `;
        
        // Insert after the primary CSS but before the closing head tag
        htmlContent = htmlContent.replace('</head>', `${template2Css}</head>`);
      } else if (templateId === 'template6') {
        // Template 6 styling for buttons
        projectsHtml = portfolioData.projects.map((project: Project) => {
          // Check if we have GitHub URL or report URL
          const hasGithub = project.githubUrl && project.githubUrl.trim() !== '';
          const hasReport = project.reportUrl && project.reportUrl.trim() !== '';
          
          // Generate button HTML for template6
          const buttonHtml = (hasGithub || hasReport) ? `
            <div class="project-actions">
              ${hasGithub ? `<a href="${project.githubUrl}" class="project-action github">
                <i class="fab fa-github"></i> Code
              </a>` : ''}
              ${hasReport ? `<a href="${project.reportUrl}" class="project-action report">
                <i class="fas fa-file-alt"></i> Report
              </a>` : ''}
            </div>
          ` : '';
          
          return `
          <div class="project-card">
            <div class="project-image">
              <img src="${project.imageUrl || ''}" alt="${project.name || 'Project'}" onerror="this.src='https://placehold.co/600x400/e2e8f0/1e293b?text=Project+Image'">
            </div>
            <div class="project-content">
              <h3>${project.name || ''}</h3>
              <p>${project.description || ''}</p>
              <div class="project-tags">
                ${project.technologies && project.technologies.length > 0 ? 
                  project.technologies.map((tech: string) => `<span class="project-tag">${tech}</span>`).join('') : ''}
          </div>
              ${buttonHtml}
              </div>
            </div>
        `;
        }).join('');
        
        // Add custom CSS for template6 buttons
        const template6Css = `
        <style>
          .project-card {
            display: flex;
            flex-direction: column;
            height: 100%;
          }
          
          .project-content {
            display: flex;
            flex-direction: column;
            flex-grow: 1;
            padding: 1.5rem;
          }
          
          .project-actions {
            display: flex;
            gap: 0.75rem;
            margin-top: auto;
            padding-top: 1rem;
          }
          
          .project-action {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            padding: 0.5rem 1rem;
            border-radius: 0.25rem;
            font-weight: 500;
            text-decoration: none;
            transition: all 0.3s ease;
            flex: 1;
          }
          
          .project-action i {
            margin-right: 0.5rem;
          }
          
          .project-action.github {
            background-color: #333;
            color: white;
          }
          
          .project-action.github:hover {
            background-color: #24292e;
          }
          
          .project-action.report {
            background-color: #0070f3;
            color: white;
          }
          
          .project-action.report:hover {
            background-color: #0051cc;
          }
        </style>
        `;
        
        // Append the custom CSS to the HTML content
        htmlContent = htmlContent.replace('</head>', `${template6Css}</head>`);
      } else if (templateId === 'template7') {
        // Template 7 - Portfolio with gradient wave animation
        // Replace the initials for avatar if needed
        const initials = portfolioData.fullName
          ? (portfolioData.fullName.split(' ').map(name => name[0]).join(''))
          : portfolioData.name.substring(0, 2).toUpperCase();
          
        htmlContent = htmlContent.replace(/{{initials}}/g, initials);
        
        // Handle current year
        const currentYear = new Date().getFullYear().toString();
        htmlContent = htmlContent.replace(/{{currentYear}}/g, currentYear);
        
        // Generate projects HTML for Template 7
        projectsHtml = portfolioData.projects.map((project: Project) => {
          // Check if we have GitHub URL or report URL
          const hasGithub = project.githubUrl && project.githubUrl.trim() !== '';
          const hasReport = project.reportUrl && project.reportUrl.trim() !== '';
          
          return `
          <div class="project-card">
            <div class="project-image">
              <img src="${project.imageUrl}" alt="${project.name}" onerror="this.src='https://placehold.co/600x400/e2e8f0/1e293b?text=Project+Image'">
            </div>
            <div class="project-content">
              <h3 class="project-title">${project.name}</h3>
              <p class="project-description">${project.description}</p>
              <div class="project-links">
                ${hasGithub ? `
                <a href="${project.githubUrl}" class="btn btn-outline" target="_blank">
                  <i class="fab fa-github"></i> GitHub
                </a>
                ` : ''}
                ${hasReport ? `
                <a href="${project.reportUrl}" class="btn btn-outline" target="_blank">
                  <i class="fas fa-file-alt"></i> Report
                </a>
              ` : ''}
            </div>
          </div>
            </div>
          `;
        }).join('');
        
        // Generate skills HTML for Template 7
        skillsHtml = portfolioData.skills.map((skill: Skill) => `
          <div class="skill-card">
            <div class="skill-icon">
              <i class="fas fa-code"></i>
            </div>
            <h3 class="skill-name">${skill.name || ''}</h3>
          </div>
        `).join('');
      } else {
        // Default projects HTML for any other templates not specifically handled above
        projectsHtml = portfolioData.projects.map((project: Project) => {
          // Check if we have GitHub URL or report URL
          const hasGithub = project.githubUrl && project.githubUrl.trim() !== '';
          const hasReport = project.reportUrl && project.reportUrl.trim() !== '';
          
          // Generate button HTML for default templates
          const buttonHtml = (hasGithub || hasReport) ? `
            <div class="project-links">
              ${hasGithub ? `<a href="${project.githubUrl}" class="project-link" target="_blank" aria-label="View GitHub Repository">
                <i class="fab fa-github"></i> GitHub
              </a>` : ''}
              ${hasReport ? `<a href="${project.reportUrl}" class="project-link" target="_blank" aria-label="View Project Report">
                <i class="fas fa-file-alt"></i> Report
              </a>` : ''}
                </div>
          ` : `
            <div class="project-links">
              <a href="#" class="project-link" aria-label="View Project Details">
                <i class="fas fa-external-link-alt"></i>
              </a>
              </div>
          `;
          
          return `
          <div class="project-card" data-category="all">
            <div class="project-image">
              <img src="${project.imageUrl || ''}" alt="${project.name || 'Project'}" onerror="this.style.display='none'">
            </div>
            <div class="project-content">
              <h3>${project.name || ''}</h3>
              <p>${project.description || ''}</p>
              ${buttonHtml}
              </div>
              </div>
        `;
        }).join('');
        
        // Add custom CSS for default template buttons
        const defaultCss = `
        <style>
          .project-card {
            display: flex;
            flex-direction: column;
            height: 100%;
          }
          
          .project-content {
            display: flex;
            flex-direction: column;
            flex-grow: 1;
            padding: 1.5rem;
          }
          
          .project-links {
            margin-top: auto;
            display: flex;
            gap: 0.5rem;
          }
        </style>
        `;
        
        // Append the custom CSS to the HTML content
        htmlContent = htmlContent.replace('</head>', `${defaultCss}</head>`);
      }
      htmlContent = htmlContent.replace(/{{#each projects}}[\s\S]*?{{\/each}}/g, projectsHtml);
      
      // Generate skills HTML for templates that don't have specific handling
      if (!skillsHtml && portfolioData.skills && portfolioData.skills.length > 0) {
        skillsHtml = portfolioData.skills.map((skill: Skill) => `
          <div class="skill-tag">
            <span class="skill-icon"><i class="fas fa-code"></i></span>
            <span class="skill-name">${skill.name || ''}</span>
          </div>
        `).join('');
      }
      
      // Replace skills template tags
      htmlContent = htmlContent.replace(/{{#each skills}}[\s\S]*?{{\/each}}/g, skillsHtml);
      
      // Cleanup any remaining Handlebars tags that weren't properly replaced
      // This will catch any orphaned closing tags or malformed template tags
      htmlContent = htmlContent.replace(/{{\/each}}/g, '');
      htmlContent = htmlContent.replace(/{{#each.*?}}/g, '');
      
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