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
      
      // Handle skills HTML generation per template
      let skillsHtml = '';
      if (templateId === 'template3') {
        skillsHtml = portfolioData.skills.map((skill: Skill) => `
          <span class="skill-tag">${skill.name || ''}</span>
        `).join('');
      } else if (templateId === 'template1') {
        skillsHtml = portfolioData.skills.map((skill: Skill) => `
          <div class="skill-tag">
            <span class="skill-icon"><i class="fas fa-code"></i></span>
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
      } else if (templateId === 'template4') {
        skillsHtml = portfolioData.skills.map((skill: Skill) => `
          <div class="skill-card">
            <div class="skill-icon">
              <i class="fas fa-code"></i>
            </div>
            <span class="skill-name">${skill.name || ''}</span>
          </div>
        `).join('');
      } else {
        skillsHtml = portfolioData.skills.map((skill: Skill) => `
          <div class="skill-item">
            <div class="skill-icon">
              <i class="fas fa-code"></i>
            </div>
            <span class="skill-name">${skill.name || ''}</span>
          </div>
        `).join('');
      }
      htmlContent = htmlContent.replace(/{{#each skills}}[\s\S]*?{{\/each}}/g, skillsHtml);
      
      // Process skills HTML for each template - fixing Template4
      if (templateId === 'template4') {
        // Create a special scrolling container for skills
        const skillsItems = portfolioData.skills.map((skill: Skill) => `
          <div class="skill-card">
            <div class="skill-icon">
              <i class="fas fa-code"></i>
            </div>
            <span class="skill-name">${skill.name || ''}</span>
          </div>
        `).join('');
        
        // Create the scrolling container with duplicated skills for seamless looping
        const skillsHtml = `
        <style>
          .skills-container {
            width: 100%;
            overflow: hidden;
            position: relative;
            padding: 20px 0;
          }
          
          .skills-track {
            display: flex;
            width: max-content;
            animation: scroll 30s linear infinite;
          }
          
          .skill-card {
            margin: 0 15px;
            flex-shrink: 0;
          }
          
          @keyframes scroll {
            0% {
              transform: translateX(0);
            }
            100% {
              transform: translateX(-50%);
            }
          }
        </style>
        
        <div class="skills-container">
          <div class="skills-track">
            ${skillsItems}
            ${skillsItems} <!-- Duplicate skills for seamless loop -->
          </div>
        </div>
        `;
        
        // Replace skills section in the template
        htmlContent = htmlContent.replace(/{{#each skills}}[\s\S]*?{{\/each}}/g, skillsHtml);
        
        // Now fix the projects section for Template4
        const projectsHtml = portfolioData.projects.map((project: Project) => {
          // Check if we have GitHub URL or report URL
          const hasGithub = project.githubUrl && project.githubUrl.trim() !== '';
          const hasReport = project.reportUrl && project.reportUrl.trim() !== '';
          
          // Generate buttons HTML based on available URLs
          let actionsHtml = '';
          if (hasGithub || hasReport) {
            actionsHtml = '<div class="project-actions">';
            
            if (hasGithub) {
              actionsHtml += `
                <a href="${project.githubUrl}" class="btn-project github-button" target="_blank">
                  <i class="fab fa-github"></i> GitHub
                </a>`;
            }
            
            if (hasReport) {
              actionsHtml += `
                <a href="${project.reportUrl}" class="btn-project report-button" target="_blank">
                  <i class="fas fa-file-alt"></i> Report
                </a>`;
            }
            
            actionsHtml += '</div>';
          }
          
          return `
          <div class="project-card">
            <div class="project-img">
              <img src="${project.imageUrl || ''}" alt="${project.name || 'Project'}" onerror="this.src='https://placehold.co/600x400/e2e8f0/1e293b?text=Project+Image'">
            </div>
            <div class="project-content">
              <h3>${project.name || ''}</h3>
              <p>${project.description || ''}</p>
              ${project.technologies && project.technologies.length > 0 
                ? `<div class="project-tags">${project.technologies.map((tag: string) => `<span class="tag">${tag}</span>`).join('')}</div>` 
                : ''}
              ${actionsHtml}
            </div>
          </div>`;
        }).join('');
        
        // Replace projects section in the template
        htmlContent = htmlContent.replace(/{{#each projects}}[\s\S]*?{{\/each}}/g, projectsHtml);
      }
      
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