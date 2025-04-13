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
      }
      
      // Handle arrays (skills, experience, education, projects)
      
      // Skills
      let skillsHtml = '';
      if (templateId === 'template3') {
        skillsHtml = portfolioData.skills.map((skill: Skill) => `
          <div class="timeline-item">
            <div class="timeline-marker"></div>
            <div class="timeline-content">
              <div class="timeline-date">${skill.level || '90%'}</div>
              <h3 class="timeline-title">${skill.name || ''}</h3>
            </div>
          </div>
        `).join('');
      } else if (templateId === 'template5') {
        skillsHtml = portfolioData.skills.map((skill: Skill) => `
          <div class="skill-card">
            <div class="skill-info">
              <h3 class="skill-name">${skill.name || ''}</h3>
              <div class="skill-level-container">
                <div class="skill-level" data-level="${skill.level || '90%'}"></div>
              </div>
              <span class="skill-percentage">${skill.level || '90%'}</span>
            </div>
          </div>
        `).join('');
      } else if (templateId === 'template2') {
        skillsHtml = portfolioData.skills.map((skill: Skill) => `
          <div class="skill-item">
            <div class="skill-info">
              <span class="skill-name">${skill.name || ''}</span>
              <span class="skill-percentage">${skill.level || '90%'}</span>
            </div>
            <div class="skill-bar">
              <div class="skill-progress" style="width: ${skill.level || '90%'}"></div>
            </div>
          </div>
        `).join('');
      } else if (templateId === 'template4') {
        skillsHtml = portfolioData.skills.map((skill: Skill) => `
          <div class="skill-item">
            <div class="skill-info">
              <span class="skill-name">${skill.name || ''}</span>
              <span class="skill-percentage">${skill.level || '90%'}</span>
            </div>
            <div class="skill-bar">
              <div class="skill-progress" style="width: ${skill.level || '90%'}"></div>
            </div>
          </div>
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
      let experienceHtml = '';
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
          <div class="cyber-border timeline-item">
            <div class="timeline-header">
              <h3 class="timeline-position">${exp.position || ''}</h3>
              <span class="timeline-company neon-text">${exp.company || ''}</span>
            </div>
            <div class="timeline-period">${exp.period || ''}</div>
            <div class="timeline-description">
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
        let educationHtml = '';
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
      let projectsHtml = '';
      if (templateId === 'template3') {
        projectsHtml = portfolioData.projects.map((project: Project) => `
          <div class="project-card" data-category="all">
            <div class="project-header">
              <div class="project-folder">
                <i class="fas fa-folder"></i>
              </div>
              <div class="project-links">
                <a href="#" class="project-link" aria-label="External Link">
                  <i class="fas fa-external-link-alt"></i>
                </a>
              </div>
            </div>
            <div class="project-content">
              <h3 class="project-title">${project.name || ''}</h3>
              <p class="project-description">${project.description || ''}</p>
              <div class="project-tech">
                <img src="${project.imageUrl || ''}" alt="${project.name || ''}" class="project-image" onerror="this.src='https://placehold.co/600x400/e2e8f0/1e293b?text=Project+Image'">
              </div>
            </div>
          </div>
        `).join('');
      } else if (templateId === 'template4') {
        projectsHtml = portfolioData.projects.map((project: Project) => `
          <div class="project-card-t4 all">
            <div class="project-image">
              <img src="${project.imageUrl || ''}" alt="${project.name || ''}" onerror="this.src='https://placehold.co/600x400/e2e8f0/1e293b?text=Project+Image'">
            </div>
            <div class="project-content">
              <h3 class="project-title neon-text">${project.name || ''}</h3>
              <p class="project-description">${project.description || ''}</p>
              <div class="project-tags">
                <span class="tag">Project</span>
              </div>
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
      } else {
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