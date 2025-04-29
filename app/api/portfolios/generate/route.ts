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
  githubProfile?: string;
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
                              .replace(/{{githubProfile}}/g, portfolioData.githubProfile || '')
                              .replace(/{{currentYear}}/g, new Date().getFullYear().toString());

      // Handle GitHub profile conditional display
      if (portfolioData.githubProfile) {
        htmlContent = htmlContent.replace(/{{#if githubProfile}}([\s\S]*?){{\/if}}/g, '$1');
      } else {
        htmlContent = htmlContent.replace(/{{#if githubProfile}}[\s\S]*?{{\/if}}/g, '');
      }

      // Handle profile picture URL
      if (portfolioData.profilePictureUrl) {
        // Ensure the profile picture URL is absolute for cross-domain compatibility
        let profilePicUrl = portfolioData.profilePictureUrl;
        
        // Check if the URL is already absolute (starts with http:// or https://)
        if (!profilePicUrl.startsWith('http://') && !profilePicUrl.startsWith('https://')) {
          console.log('Converting relative profile picture URL to absolute');
          // If it's a relative URL, convert it to an absolute URL
          // This ensures images work both in localhost and production environments
          profilePicUrl = new URL(profilePicUrl, 'https://makeportfolio.vercel.app').toString();
        }
        
        htmlContent = htmlContent.replace(/{{profilePictureUrl}}/g, profilePicUrl);
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
        // Enhance profile image fallback mechanism
        const initials = portfolioData.fullName && portfolioData.fullName.length > 0 
          ? portfolioData.fullName.split(' ').map(n => n[0]).join('').toUpperCase()
          : 'U';
        
        // Get the processed profile picture URL
        let profileImgUrl = '';
        if (portfolioData.profilePictureUrl) {
          profileImgUrl = portfolioData.profilePictureUrl;
          // Check if the URL is already absolute
          if (!profileImgUrl.startsWith('http://') && !profileImgUrl.startsWith('https://')) {
            profileImgUrl = new URL(profileImgUrl, 'https://makeportfolio.vercel.app').toString();
          }
        }
            
        // Enhanced image error handling
        const enhancedProfileImageHtml = `
        <div class="hero-image">
          ${portfolioData.profilePictureUrl ? `
            <img 
              src="${profileImgUrl}" 
              alt="${portfolioData.fullName || ''}" 
              onerror="
                try {
                  console.log('Profile image failed to load, using fallback');
                  this.onerror=null; 
                  this.src='https://placehold.co/400x400/4169e1/ffffff?text=${initials}';
                } catch(e) {
                  console.error('Failed to load fallback image, using text fallback', e);
                  this.style.display='none';
                  const fallbackDiv = document.createElement('div');
                  fallbackDiv.className = 'hero-avatar';
                  fallbackDiv.textContent = '${initials}';
                  this.parentNode.appendChild(fallbackDiv);
                }
              "
            >` : `
            <div class="hero-avatar">${initials}</div>
          `}
        </div>`;
        
        // Replace the original hero-image div with our enhanced version
        htmlContent = htmlContent.replace(
          /<div class="hero-image">[\s\S]*?<\/div>/,
          enhancedProfileImageHtml
        );
        
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
        
        // Generate skills HTML specifically for template3 - without </> prefix
        skillsHtml = portfolioData.skills.map((skill: Skill) => {
          // Make sure to remove </> prefix if it exists in the skill name
          const skillName = (skill.name || '').replace(/^<\/>/, '').toUpperCase();
          return `
          <div class="skill-tag">${skillName}</div>
          `;
        }).join('');
        
        // Fix for theme toggle functionality in template3
        // This ensures the theme toggle persists in the generated HTML
        const themeToggleScript = `
        <script>
          // Theme toggle functionality - runs after document is loaded
          document.addEventListener("DOMContentLoaded", () => {
            const themeToggleBtn = document.getElementById("theme-toggle");
            const prefersDarkScheme = window.matchMedia("(prefers-color-scheme: dark)");

            // Set initial theme based on user preference or system preference
            function setInitialTheme() {
              // Get saved theme from localStorage or use system preference
              let theme = localStorage.getItem("theme");
              if (!theme) {
                theme = prefersDarkScheme.matches ? "dark" : "light";
              }
              
              // Apply theme to both html and body elements for maximum compatibility
              document.documentElement.setAttribute("data-theme", theme);
              document.body.setAttribute("data-theme", theme);
            }

            // Call immediately to prevent flash of wrong theme
            setInitialTheme();

            if (themeToggleBtn) {
              themeToggleBtn.addEventListener("click", () => {
                // Check theme from documentElement (html tag)
                const currentTheme = document.documentElement.getAttribute("data-theme") || "light";
                const newTheme = currentTheme === "light" ? "dark" : "light";

                // Apply new theme to both elements
                document.documentElement.setAttribute("data-theme", newTheme);
                document.body.setAttribute("data-theme", newTheme);
                
                // Save user preference
                localStorage.setItem("theme", newTheme);
              });
            }

            // Also listen for system preference changes
            prefersDarkScheme.addEventListener("change", (event) => {
              if (!localStorage.getItem("theme")) {
                const newTheme = event.matches ? "dark" : "light";
                document.documentElement.setAttribute("data-theme", newTheme);
                document.body.setAttribute("data-theme", newTheme);
              }
            });
          });
        </script>
        `;
        
        // Add custom CSS for Template3
        const template3Css = `
        <style>
          /* Fix for hero section positioning */
          #home.container {
            padding-top: 5rem;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          
          .hero-content {
            width: 100%;
            padding: 3rem 0;
          }
          
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
        
        // Insert theme toggle script before the closing body tag
        htmlContent = htmlContent.replace('</body>', `${themeToggleScript}</body>`);
        
        // Replace both html and body tags to have the data-theme attribute
        htmlContent = htmlContent.replace('<html lang="en" data-theme="light">', '<html lang="en" data-theme="light">');
        
        // Insert custom CSS
        htmlContent = htmlContent.replace('</head>', `${template3Css}</head>`);

        // Add a script to set the portfolio title variable
        const titleScript = `<script>window.portfolioTitle = "${portfolioData.title}";</script>`;
        // Add this script right before the closing body tag
        htmlContent = htmlContent.replace('</body>', `${titleScript}</body>`);
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
        skillsHtml = portfolioData.skills.map((skill: Skill) => {
          // Remove </> prefix if it exists in the skill name
          const skillName = (skill.name || '').replace(/^<\/>/, '');
          return `
          <div class="skill-tag">
            <span class="skill-name">${skillName}</span>
          </div>
          `;
        }).join('');
        
        // Append the custom CSS to the HTML content
        htmlContent = htmlContent.replace('</head>', `${buttonCss}</head>`);

        // Add a script to set the portfolio title variable
        const titleScript = `<script>window.portfolioTitle = "${portfolioData.title}";</script>`;
        // Add this script right before the closing body tag
        htmlContent = htmlContent.replace('</body>', `${titleScript}</body>`);
      } else if (templateId === 'template5') {
        // Add skills HTML for Template 5
        skillsHtml = portfolioData.skills.map((skill: Skill) => {
          // Remove </> prefix if it exists in the skill name
          const skillName = (skill.name || '').replace(/^<\/>/, '');
          
          return `
          <div class="skill-card">
            <div class="skill-name">${skillName}</div>
            </div>
          `;
        }).join('');
        
        // Reorganize the about section layout in template 5, completely removing profile picture
        const aboutSectionHtml = `
        <!-- About Section -->
        <section id="about" class="about">
            <div class="container">
                <div class="section-header">
                    <h2>About Me</h2>
                    <div class="section-line"></div>
            </div>
                
                <div class="about-container">
                    <!-- About text and details - full width without any profile image -->
                    <div class="about-content">
                        <div class="about-text">
                            <h3>${portfolioData.fullName || portfolioData.name}</h3>
                            <p class="profile-title">${portfolioData.title || ''}</p>
                            <p>${portfolioData.about || ''}</p>
          </div>
                        
                        <div class="about-details-container">
                            <div class="about-details">
                                ${portfolioData.email ? 
                                `<div class="detail">
                                    <i class="fas fa-envelope"></i>
                                    <span>${portfolioData.email}</span>
                                </div>` : ''}
                                
                                ${portfolioData.phone ? 
                                `<div class="detail">
                                    <i class="fas fa-phone"></i>
                                    <span>${portfolioData.phone}</span>
                                </div>` : ''}
                            </div>
                            
                            ${portfolioData.hasCv && portfolioData.cvUrl ? 
                            `<div class="about-cta">
                                <a href="${portfolioData.cvUrl}" class="btn primary" target="_blank" rel="noopener noreferrer">
                                    <i class="fas fa-download"></i> Download Resume
                                </a>
                            </div>` : ''}
                        </div>
                    </div>
                </div>
            </div>
        </section>
        `;
        
        // Add custom CSS for the redesigned about section without profile picture
        const template5AboutCss = `
        <style>
          /* Reorganized About Section - No profile picture */
          .about-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            width: 100%;
          }
          
          .about-content {
            width: 100%;
            max-width: 900px;
            margin: 0 auto;
            display: flex;
            flex-direction: column;
            gap: 2.5rem;
          }
          
          .about-text {
            text-align: center;
          }
          
          .about-text h3 {
            font-size: 2.5rem;
            margin-bottom: 0.5rem;
            position: relative;
            display: inline-block;
          }
          
          .profile-title {
            color: var(--accent-color);
            font-size: 1.3rem;
            font-weight: 500;
            margin-bottom: 2rem;
            text-align: center;
          }
          
          .about-text h3::after {
            content: '';
            position: absolute;
            bottom: -10px;
            left: 50%;
            transform: translateX(-50%);
            width: 50px;
            height: 3px;
            background-color: var(--accent-color);
            border-radius: 3px;
          }
          
          .about-text p {
            font-size: 1.1rem;
            line-height: 1.8;
          }
          
          .about-details-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 2rem;
          }
          
          .about-details {
            display: flex;
            flex-wrap: wrap;
            justify-content: center;
            gap: 2rem;
            max-width: 800px;
          }
          
          .detail {
            display: flex;
            align-items: center;
            gap: 1rem;
            background-color: var(--card-bg, rgba(255, 255, 255, 0.05));
            padding: 1rem 1.5rem;
            border-radius: var(--border-radius, 8px);
            transition: transform 0.3s ease;
            min-width: 200px;
            box-shadow: var(--shadow, 0 4px 10px rgba(0, 0, 0, 0.1));
          }
          
          .detail:hover {
            transform: translateY(-5px);
          }
          
          .detail i {
            font-size: 1.2rem;
            color: var(--accent-color);
            width: 20px;
            text-align: center;
          }
          
          .about-cta {
            margin-top: 1rem;
          }
          
          /* Responsive adjustments */
          @media (max-width: 768px) {
            .about-details {
              flex-direction: column;
              gap: 1rem;
            }
            
            .detail {
              width: 100%;
            }
          }
        </style>
        `;
        
        // Replace the about section in the HTML
        htmlContent = htmlContent.replace(
          /<section id="about"[\s\S]*?<\/section>/,
          aboutSectionHtml
        );
        
        // Add the custom about section CSS
        htmlContent = htmlContent.replace('</head>', `${template5AboutCss}</head>`);
        
        // Replace the skills section with our scrolling animation
        const template5SkillsSection = `
        <section id="skills" class="skills">
          <div class="container">
            <div class="section-header">
              <h2>My Skills</h2>
              <div class="section-line"></div>
            </div>
          </div>
          
          <!-- Full width skills marquee -->
          <div class="skills-marquee-wrapper">
            <div class="skills-marquee">
              <div class="skills-track">
                ${skillsHtml}
                <!-- Duplicate for seamless loop -->
                ${skillsHtml}
              </div>
            </div>
          </div>
        </section>
        `;
        
        // Add custom CSS for Template 5 skills marquee
        const template5SkillsCss = `
        <style>
          /* Full width skills marquee */
          .skills-marquee-wrapper {
            width: 70%;
            margin: 3rem auto;
            position: relative;
            padding: 2rem 0;
            background-color: var(--card-bg, rgba(255, 255, 255, 0.05));
            border-radius: var(--border-radius, 10px);
            overflow: hidden;
            box-shadow: var(--shadow, 0 4px 10px rgba(0, 0, 0, 0.1));
          }
          
          .skills-marquee {
            width: 100%;
            overflow: hidden;
          }
          
          .skills-track {
            display: flex;
            width: max-content;
            animation: scrollSkills 30s linear infinite;
            gap: 2rem;
            padding: 0 2rem;
          }
          
          .skills-track:hover {
            animation-play-state: paused;
          }
          
          @keyframes scrollSkills {
            0% {
              transform: translateX(0);
            }
            100% {
              transform: translateX(-50%);
            }
          }
          
          .skill-card {
            background-color: var(--accent-color, #f56565);
            color: white;
            border-radius: var(--border-radius, 8px);
            padding: 1.2rem 2rem;
            margin: 0;
            min-width: 180px;
            height: 70px;
            display: flex;
            justify-content: center;
            align-items: center;
            text-align: center;
            transition: transform 0.3s ease, box-shadow 0.3s ease;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
          
          .skill-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
          }
          
          .skill-name {
            font-size: 1.2rem;
            font-weight: 600;
            margin: 0;
            white-space: nowrap;
          }
          
          /* Responsive adjustments */
          @media (max-width: 1200px) {
            .skills-marquee-wrapper {
              width: 85%;
            }
          }
          
          @media (max-width: 768px) {
            .skills-marquee-wrapper {
              width: 90%;
            }
            
            .skill-card {
              padding: 1rem 1.5rem;
              min-width: 150px;
              height: 60px;
            }
            
            .skill-name {
              font-size: 1rem;
            }
            
            .skills-track {
              animation-duration: 25s;
              padding: 0 1rem;
            }
          }
          
          /* Hide the original skills grid */
          .skills-grid {
            display: none !important;
          }
        </style>
        `;
        
        // Add skills-specific JavaScript
        const template5SkillsScript = `
        <script>
          document.addEventListener('DOMContentLoaded', function() {
            // Get the initial number of skill items to adjust animation speed
            const skillItems = document.querySelectorAll('.skill-card');
            const track = document.querySelector('.skills-track');
            
            if (track && skillItems.length > 0) {
              // Adjust animation speed based on number of skills
              let duration = Math.max(25, Math.min(45, 20 + skillItems.length * 2));
              track.style.animationDuration = duration + 's';
              
              // Fix for Safari - force recalculation of animation
              track.style.animationName = 'none';
              setTimeout(() => {
                track.style.animationName = 'scrollSkills';
              }, 10);
            }
          });
        </script>
        `;
        
        // Replace the skills section in the HTML
        htmlContent = htmlContent.replace(
          /<section id="skills"[\s\S]*?<\/section>/,
          template5SkillsSection
        );
        
        // Add the skills CSS and JS
        htmlContent = htmlContent.replace('</head>', `${template5SkillsCss}</head>`);
        htmlContent = htmlContent.replace('</body>', `${template5SkillsScript}</body>`);
        
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
        
        // Customize the contact section for template5 - side by side and centered
        const contactSectionHtml = `
        <section id="contact" class="contact">
            <div class="container">
                <div class="section-header">
                    <h2>Get In Touch</h2>
                    <div class="section-line"></div>
                </div>
                
                <div class="contact-content">
                    <div class="contact-info">
                        ${portfolioData.email ? 
                        `<div class="contact-item">
                            <div class="contact-icon">
                                <i class="fas fa-envelope"></i>
                            </div>
                            <div class="contact-details">
                                <h3>Email</h3>
                                <p><a href="mailto:${portfolioData.email}">${portfolioData.email}</a></p>
                            </div>
                        </div>` : ''}
                        
                        ${portfolioData.phone ? 
                        `<div class="contact-item">
                            <div class="contact-icon">
                                <i class="fas fa-phone"></i>
                            </div>
                            <div class="contact-details">
                                <h3>Phone</h3>
                                <p><a href="tel:${portfolioData.phone}">${portfolioData.phone}</a></p>
                            </div>
                        </div>` : ''}
                    </div>
                </div>
            </div>
            <style>
                #contact .contact-info {
                    display: flex;
                    justify-content: center;
                    flex-wrap: wrap;
                    gap: 2rem;
                }
                
                #contact .contact-item {
                    display: flex;
                    align-items: center;
                    padding: 1.5rem;
                    background-color: var(--bg-secondary);
                    border-radius: 8px;
                    transition: transform 0.3s ease, box-shadow 0.3s ease;
                    min-width: 250px;
                }
                
                #contact .contact-item:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
                }
                
                @media (max-width: 768px) {
                    #contact .contact-info {
                        flex-direction: column;
                        align-items: center;
                    }
                    
                    #contact .contact-item {
                        width: 100%;
                        max-width: 300px;
                    }
                }
            </style>
        </section>
        `;
        
        // Replace the existing contact section
        htmlContent = htmlContent.replace(
          /<section id="contact" class="contact">[\s\S]*?<\/section>/,
          contactSectionHtml
        );
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
        skillsHtml = portfolioData.skills.map((skill: Skill) => {
          // Remove </> prefix if it exists in the skill name
          const skillName = (skill.name || '').replace(/^<\/>/, '');
          
          return `
          <div class="skill-card">
            <div class="skill-name">${skillName}</div>
            </div>
        `;
        }).join('');
        
        // Replace the whole skills section with our custom solution
        // This breaks out of the container constraints
        const fullWidthSkillsSection = `
        <section id="skills" class="skills">
          <div class="container">
            <div class="section-header">
              <span class="section-subtitle">What I Know</span>
              <h2 class="section-title">My Skills</h2>
              <div class="title-line"></div>
          </div>
          </div>
          
          <!-- Full width skills marquee that breaks out of container -->
          <div class="skills-marquee-wrapper">
            <div class="skills-marquee">
              <div class="skills-track">
                ${skillsHtml}
                <!-- Duplicate for seamless loop -->
                ${skillsHtml}
              </div>
            </div>
          </div>
        </section>
        `;
        
        // Replace the skills section in the HTML
        htmlContent = htmlContent.replace(
          /<section id="skills"[\s\S]*?<\/section>/,
          fullWidthSkillsSection
        );
        
        // Add custom CSS for Template 4 skills
        const template4SkillsCss = `
        <style>
          /* Full width skills marquee */
          .skills-marquee-wrapper {
            width: 70%;
            margin: 2rem auto;
            position: relative;
            padding: 2rem 0;
            background-color: rgba(0, 0, 0, 0.1);
            border-radius: 12px;
            overflow: hidden;
          }
          
          .skills-marquee {
            width: 100%;
            overflow: hidden;
          }
          
          .skills-track {
            display: flex;
            width: max-content;
            animation: scrollSkills 30s linear infinite;
            gap: 2rem;
            padding: 0 2rem;
          }
          
          .skills-track:hover {
            animation-play-state: paused;
          }
          
          @keyframes scrollSkills {
            0% {
              transform: translateX(0);
            }
            100% {
              transform: translateX(-50%);
            }
          }
          
          .skill-card {
            background-color: var(--card-bg, #1e1e1e);
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            padding: 1.2rem 2rem;
            margin: 0;
            min-width: 180px;
            height: 80px;
            display: flex;
            justify-content: center;
            align-items: center;
            text-align: center;
            transition: transform 0.3s ease, box-shadow 0.3s ease;
            border: 1px solid var(--border-color, #333);
          }
          
          .skill-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
          }
          
          .skill-name {
            font-size: 1.1rem;
            font-weight: 600;
            color: var(--text-color, #fff);
            margin: 0;
            white-space: nowrap;
          }
          
          /* Responsive adjustments */
          @media (max-width: 1200px) {
            .skills-marquee-wrapper {
              width: 85%;
            }
          }
          
          @media (max-width: 768px) {
            .skills-marquee-wrapper {
              width: 90%;
            }
            
            .skill-card {
              padding: 1.2rem 2rem;
              min-width: 8rem;
            }
            
            .skill-name {
              font-size: 1.4rem;
              letter-spacing: 0.5px;
            }
            
            .skills-container {
              gap: 1.5rem !important;
              animation-duration: 8s;
            }
          }
          
          /* Hide the original skills container */
          .skills-grid {
            display: none !important;
          }
          
          /* Make sure section animation doesn't break our marquee */
          section.skills.active .skills-marquee-wrapper {
            opacity: 1;
            transform: translateY(0);
          }
        </style>
        `;
        
        // Add skills-specific JavaScript
        const skillsScript = `
        <script>
          document.addEventListener('DOMContentLoaded', function() {
            // Get the initial number of skill items to adjust animation speed
            const skillItems = document.querySelectorAll('.skill-card');
            const track = document.querySelector('.skills-track');
            
            if (track && skillItems.length > 0) {
              // Adjust animation speed based on number of skills
              let duration = Math.max(25, Math.min(45, 20 + skillItems.length * 2));
              track.style.animationDuration = duration + 's';
              
              // Fix for Safari - force recalculation of animation
              track.style.animationName = 'none';
              setTimeout(() => {
                track.style.animationName = 'scrollSkills';
              }, 10);
            }
          });
        </script>
        `;
        
        // Add the skills CSS to the HTML content
        htmlContent = htmlContent.replace('</head>', `${template4SkillsCss}</head>`);
        
        // Add the skills script
        htmlContent = htmlContent.replace('</body>', `${skillsScript}</body>`);
        
      } else if (templateId === 'template2') {
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
        skillsHtml = portfolioData.skills.map((skill: Skill) => {
          // Remove </> prefix if it exists in the skill name
          const skillName = (skill.name || '').replace(/^<\/>/, '');
          return `
          <div class="skill-tag">
            <span class="skill-name">${skillName}</span>
            </div>
          `;
        }).join('');
        
        const template2Css = `
        <style>
          /* Override default project styles with laptop display styling */
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
          
          /* Enhanced Skills Styling for Template 2 */
          .skills-container {
            display: flex;
            gap: 2rem !important;
            animation: scrollSkills 12s linear infinite;
            white-space: nowrap;
            padding: 1.5rem 0;
          }
          
          .skill-tag {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            padding: 1.4rem 2.5rem;
            background: linear-gradient(135deg, var(--primary-color) 0%, var(--accent-color) 100%);
            border-radius: 10px;
            box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.1) inset;
            transition: all 0.3s ease;
            flex-shrink: 0;
            margin: 0.8rem 0.3rem;
            border: 2px solid rgba(255, 255, 255, 0.2);
            min-width: 10rem;
            position: relative;
            overflow: hidden;
          }
          
          .skill-tag::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(to bottom right, rgba(255, 255, 255, 0.1), transparent);
            pointer-events: none;
          }
          
          .skill-tag:hover {
            transform: translateY(-10px);
            box-shadow: 0 15px 25px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(255, 255, 255, 0.15) inset;
            border-color: rgba(255, 255, 255, 0.4);
            z-index: 10;
          }
          
          .skill-name {
            font-size: 1.8rem;
            color: var(--text-white);
            font-weight: 700;
            margin: 0;
            text-transform: uppercase;
            letter-spacing: 1px;
            position: relative;
            z-index: 1;
            text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
          }
          
          @keyframes scrollSkills {
            0% {
              transform: translateX(0);
            }
            100% {
              transform: translateX(-50%);
            }
          }
          
          .skills-container:hover {
            animation-play-state: paused;
          }
          
          /* Skills grid refinements */
          .skills-grid {
            position: relative;
            width: 90%;
            max-width: 1200px;
            margin: 3rem auto;
            overflow: hidden;
            padding: 2rem 0;
          }
          
          .skills-grid::before,
          .skills-grid::after {
            content: '';
            position: absolute;
            top: 0;
            height: 100%;
            width: 150px;
            z-index: 2;
            pointer-events: none;
          }
          
          .skills-grid::before {
            left: 0;
            background: linear-gradient(to right, var(--bg-primary), transparent);
          }
          
          .skills-grid::after {
            right: 0;
            background: linear-gradient(to left, var(--bg-primary), transparent);
          }
          
          /* Make sure skills section has proper padding */
          .skills {
            padding: 8rem 0;
            overflow: hidden;
            position: relative;
          }
          
          /* Responsive adjustments */
          @media (max-width: 768px) {
            .skill-tag {
              padding: 1.2rem 2rem;
              min-width: 8rem;
            }
            
            .skill-name {
              font-size: 1.4rem;
              letter-spacing: 0.5px;
            }
            
            .skills-container {
              gap: 1.5rem !important;
              animation-duration: 8s;
            }
          }
        </style>`;
        
        // Insert after the primary CSS but before the closing head tag
        htmlContent = htmlContent.replace('</head>', `${template2Css}</head>`);

        // Add a script to set the portfolio title variable
        const titleScript = `<script>window.portfolioTitle = "${portfolioData.title}";</script>`;
        // Add this script right before the closing body tag
        htmlContent = htmlContent.replace('</body>', `${titleScript}</body>`);

        // Add a script to enhance skills styling for template2
        const skillsEnhancementScript = `
        <script>
          document.addEventListener('DOMContentLoaded', function() {
            // Get all skill tags
            const skillTags = document.querySelectorAll('.skill-tag');
            
            if (skillTags.length === 0) return;
            
            // Add consistent styling to skill tags (no rotation, same color)
            skillTags.forEach((tag, index) => {
              // Add a small delay to the hover animation based on index
              tag.style.transitionDelay = \`\${index * 0.03}s\`;
              
              // Consistent border opacity
              tag.style.borderColor = 'rgba(255, 255, 255, 0.2)';
            });
            
            // Adjust animation speed based on the number of skills
            const skillsContainer = document.querySelector('.skills-container');
            if (skillsContainer) {
              const skillCount = skillTags.length;
              // Faster animation for fewer skills, slower for more skills
              const duration = Math.max(8, Math.min(15, 5 + skillCount * 0.5));
              skillsContainer.style.animationDuration = \`\${duration}s\`;
              
              // Fix for Safari - force recalculation of animation
              setTimeout(() => {
                skillsContainer.style.animationName = 'none';
                setTimeout(() => {
                  skillsContainer.style.animationName = 'scrollSkills';
                }, 10);
              }, 100);
            }
          });
        </script>`;
        
        // Add this script right before the closing body tag, after the title script
        htmlContent = htmlContent.replace('</body>', `${skillsEnhancementScript}\n</body>`);
      } else if (templateId === 'template6') {
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
              ${buttonHtml}
              </div>
            </div>
        `;
        }).join('');
        
        // Generate skills HTML for Template 6 - remove the </> prefix from skill names
        skillsHtml = portfolioData.skills.map((skill: Skill) => {
          // Remove </> prefix if it exists in the skill name
          const skillName = (skill.name || '').replace(/^<\/>/, '');
          return `
          <div class="skill-tag">
            <span class="skill-name">${skillName}</span>
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
        projectsHtml = portfolioData.projects.map((project: Project) => {
          // Check if we have GitHub URL or report URL
          const hasGithub = project.githubUrl && project.githubUrl.trim() !== '';
          const hasReport = project.reportUrl && project.reportUrl.trim() !== '';
          
          // Generate button HTML for template7
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
            <div class="project-content">
              <h3 class="project-title">${project.name || ''}</h3>
              <p class="project-description">${project.description || ''}</p>
              ${buttonHtml}
            </div>
          </div>
        `;
        }).join('');
        
        // Generate skills HTML for Template 7 with clean boxes and no </> prefix
        skillsHtml = portfolioData.skills.map((skill: Skill) => {
          // Remove </> prefix if it exists in the skill name
          const skillName = (skill.name || '').replace(/^<\/>/, '');
          return `
          <div class="skill-card">
            <div class="skill-name">${skillName}</div>
          </div>
          `;
        }).join('');
        
        // Create a full-width scrolling skills section for template7
        const template7SkillsSection = `
        <section id="skills" class="skills-section">
          <div class="section-heading">
            <h2>My Skills</h2>
            <div class="heading-underline"></div>
          </div>
          
          <!-- Full width skills marquee -->
          <div class="skills-marquee-wrapper">
            <div class="skills-marquee">
              <div class="skills-track">
                ${skillsHtml}
                <!-- Duplicate for seamless loop -->
                ${skillsHtml}
              </div>
            </div>
          </div>
        </section>
        `;
        
        // Add custom CSS for Template 7 skills marquee
        const template7SkillsCss = `
        <style>
          /* Skills section with centered heading and 70% width marquee */
          .skills-section {
            text-align: center;
          }
          
          .section-heading {
            margin-bottom: 2rem;
            display: flex;
            flex-direction: column;
            align-items: center;
          }
          
          .section-heading h2 {
            margin-bottom: 0.5rem;
          }
          
          .heading-underline {
            width: 80px;
            height: 4px;
            background-color: #4338ca;
            border-radius: 2px;
            margin: 0 auto;
          }
          
          /* 70% width skills marquee styling for template7 */
          .skills-marquee-wrapper {
            width: 70%;
            margin: 3rem auto;
            position: relative;
            padding: 2rem 0;
            background-color: rgba(30, 41, 59, 0.4);
            overflow: hidden;
            border-radius: 12px;
          }
          
          .skills-marquee {
            width: 100%;
            overflow: hidden;
          }
          
          .skills-track {
            display: flex;
            width: max-content;
            animation: scrollSkills 35s linear infinite;
            gap: 2.5rem;
            padding: 1rem 3rem;
          }
          
          .skills-track:hover {
            animation-play-state: paused;
          }
          
          @keyframes scrollSkills {
            0% {
              transform: translateX(0);
            }
            100% {
              transform: translateX(-50%);
            }
          }
          
          .skill-card {
            background-color: #4338ca;
            color: white;
            border-radius: 12px;
            padding: 1.2rem 2.5rem;
            min-width: 180px;
            height: 70px;
            display: flex;
            justify-content: center;
            align-items: center;
            text-align: center;
            transition: transform 0.3s ease, box-shadow 0.3s ease;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
          }
          
          .skill-card:hover {
            transform: translateY(-5px) scale(1.05);
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
            background-color: #4f46e5;
          }
          
          .skill-name {
            font-size: 1.25rem;
            font-weight: 600;
            margin: 0;
            white-space: nowrap;
          }
          
          /* Responsive adjustments */
          @media (max-width: 1200px) {
            .skills-marquee-wrapper {
              width: 85%;
            }
            
            .skill-card {
              min-width: 160px;
              padding: 1.1rem 2rem;
            }
          }
          
          @media (max-width: 768px) {
            .skills-marquee-wrapper {
              width: 90%;
            }
            
            .skills-track {
              gap: 1.5rem;
              padding: 0.5rem 1.5rem;
              animation-duration: 25s;
            }
            
            .skill-card {
              padding: 1rem 1.5rem;
              min-width: 140px;
              height: 60px;
            }
            
            .skill-name {
              font-size: 1rem;
            }
          }
          
          /* Hide the original skills section */
          #skills:not(.skills-section) {
            display: none !important;
          }
        </style>
        `;
        
        // Add full-page background animation CSS
        const template7BackgroundCss = `
        <style>
          /* Full-page background animation */
          body::before {
            content: "";
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: -2;
            pointer-events: none;
          }
          
          #background-canvas {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: -1;
            opacity: 0.8;
            pointer-events: none;
          }
          
          /* Ensure sections have some background to improve text readability */
          section {
            position: relative;
            z-index: 1;
          }
          
          .container, .section-heading {
            position: relative;
            z-index: 2;
          }
          
          /* Add subtle transparency to section backgrounds to let animation show through */
          section:not(.skills-section):not(.header) {
            background-color: rgba(15, 23, 42, 0.7);
            backdrop-filter: blur(8px);
            border-radius: 8px;
            margin: 30px auto;
            width: 90%;
            max-width: 1200px;
          }
          
          .header {
            background-color: rgba(15, 23, 42, 0.9);
            backdrop-filter: blur(5px);
          }
        </style>
        `;
        
        // Create background animation JS
        const template7BackgroundScript = `
        <script>
          document.addEventListener('DOMContentLoaded', function() {
            // Insert canvas for background animation
            const canvas = document.createElement('canvas');
            canvas.id = 'background-canvas';
            document.body.insertBefore(canvas, document.body.firstChild);
            
            // Initialize canvas and context
            const ctx = canvas.getContext('2d');
            let width = canvas.width = window.innerWidth;
            let height = canvas.height = window.innerHeight;
            
            // Configuration for waves
            const waves = [
              { amplitude: 25, period: 500, phase: 0, color: '#4338ca', speed: 0.02 },
              { amplitude: 30, period: 350, phase: 0, color: '#3730a3', speed: 0.015 },
              { amplitude: 35, period: 450, phase: 0, color: '#6366f1', speed: 0.01 },
              { amplitude: 40, period: 550, phase: 0, color: '#8b5cf6', speed: 0.005 }
            ];
            
            // Handle window resize
            window.addEventListener('resize', () => {
              width = canvas.width = window.innerWidth;
              height = canvas.height = window.innerHeight;
            });
            
            // Animation function
            function animate() {
              // Clear canvas with a semi-transparent background
              ctx.fillStyle = 'rgba(15, 23, 42, 0.1)';
              ctx.fillRect(0, 0, width, height);
              
              // Draw waves
              for (let w of waves) {
                // Update phase
                w.phase += w.speed;
                
                // Start drawing path
                ctx.beginPath();
                ctx.moveTo(0, height/2);
                
                // Create wave points
                for (let x = 0; x <= width; x += 5) {
                  let y = Math.sin(x / w.period + w.phase) * w.amplitude + height/2;
                  ctx.lineTo(x, y);
                }
                
                // Complete path to bottom corners
                ctx.lineTo(width, height);
                ctx.lineTo(0, height);
                ctx.closePath();
                
                // Fill with gradient
                const gradient = ctx.createLinearGradient(0, height/2, 0, height);
                gradient.addColorStop(0, w.color + '80'); // Semi-transparent at top
                gradient.addColorStop(1, w.color + '10'); // Almost transparent at bottom
                ctx.fillStyle = gradient;
                ctx.fill();
              }
              
              // Add subtle particles
              for (let i = 0; i < 3; i++) {
                const x = Math.random() * width;
                const y = Math.random() * height;
                const size = Math.random() * 2 + 1;
                
                ctx.beginPath();
                ctx.arc(x, y, size, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
                ctx.fill();
              }
              
              requestAnimationFrame(animate);
            }
            
            // Start animation
            animate();
          });
        </script>
        `;
        
        // Add skills-specific JavaScript for animation control
        const template7SkillsScript = `
        <script>
          document.addEventListener('DOMContentLoaded', function() {
            // Get the initial number of skill items to adjust animation speed
            const skillItems = document.querySelectorAll('.skill-card');
            const track = document.querySelector('.skills-track');
            
            if (track && skillItems.length > 0) {
              // Adjust animation speed based on number of skills
              let duration = Math.max(25, Math.min(45, 20 + skillItems.length * 2));
              track.style.animationDuration = duration + 's';
              
              // Fix for Safari - force recalculation of animation
              setTimeout(() => {
                track.style.animationName = 'none';
                setTimeout(() => {
                  track.style.animationName = 'scrollSkills';
                }, 10);
              }, 100);
            }
          });
        </script>
        `;
        
        // Insert the skills section into the HTML content
        htmlContent = htmlContent.replace(
          /<section id="skills"[\s\S]*?<\/section>/,
          template7SkillsSection
        );
        
        // Add the CSS and JS for skills and background
        htmlContent = htmlContent.replace('</head>', `${template7SkillsCss}${template7BackgroundCss}</head>`);
        htmlContent = htmlContent.replace('</body>', `${template7SkillsScript}${template7BackgroundScript}</body>`);
        
        // Replace all relevant placeholders in the HTML content
        htmlContent = htmlContent
          .replace(/\{\{initials\}\}/g, initials)
          .replace(/\{\{fullName\}\}/g, portfolioData.fullName || '')
          .replace(/\{\{title\}\}/g, portfolioData.title || '')
          .replace(/\{\{smallIntro\}\}/g, portfolioData.smallIntro || '')
          .replace(/\{\{about\}\}/g, portfolioData.about || '')
          .replace(/\{\{email\}\}/g, portfolioData.email || '')
          .replace(/\{\{phone\}\}/g, portfolioData.phone || '')
          .replace(/\{\{currentYear\}\}/g, new Date().getFullYear().toString());
        
        // Remove the "Connect With Me" div in the contact section - specific to template7
        htmlContent = htmlContent.replace(
          /<div class="social-media">[\s\S]*?<h3>Connect With Me<\/h3>[\s\S]*?<div class="social-icons">[\s\S]*?<\/div>[\s\S]*?<\/div>/,
          ''
        );
        
        // Previous attempts to remove "Connect With Me" section - these weren't specific enough
        // htmlContent = htmlContent.replace(
        //   /<section[^>]*class="[^"]*social-links[^"]*"[^>]*>[\s\S]*?<\/section>/i, 
        //   ''
        // );
        
        // htmlContent = htmlContent.replace(
        //   /<section[^>]*>[\s\S]*?<h2[^>]*>[\s\S]*?Connect With Me[\s\S]*?<\/h2>[\s\S]*?<\/section>/i,
        //   ''
        // );
        
        if (portfolioData.profilePictureUrl) {
          // Ensure the profile picture URL is absolute for cross-domain compatibility
          let profilePicUrl = portfolioData.profilePictureUrl;
          
          // Check if the URL is already absolute (starts with http:// or https://)
          if (!profilePicUrl.startsWith('http://') && !profilePicUrl.startsWith('https://')) {
            console.log('Converting relative profile picture URL to absolute for template7');
            profilePicUrl = new URL(profilePicUrl, 'https://makeportfolio.vercel.app').toString();
          }
          
          htmlContent = htmlContent.replace(/\{\{profilePictureUrl\}\}/g, profilePicUrl);
        }
        
        // Replace CV-related placeholders
        if (portfolioData.hasCv && portfolioData.cvUrl) {
          htmlContent = htmlContent
            .replace(/\{\{hasCv\}\}/g, 'true')
            .replace(/\{\{cvUrl\}\}/g, portfolioData.cvUrl);
      } else {
          // Remove the CV button section
          htmlContent = htmlContent.replace(
            /\{\{#if hasCv\}\}([\s\S]*?)\{\{\/if\}\}/g,
            ''
          );
        }
      } else if (templateId === 'template8') {
        projectsHtml = portfolioData.projects.map((project: Project) => {
          // Check if we have GitHub URL or report URL
          const hasGithub = project.githubUrl && project.githubUrl.trim() !== '';
          const hasReport = project.reportUrl && project.reportUrl.trim() !== '';
          
          // Generate button HTML for template8
          const buttonHtml = (hasGithub || hasReport) ? `
            <div class="project-links">
              ${hasGithub ? `<a href="${project.githubUrl}" class="project-link" target="_blank">
                <i class="fab fa-github"></i>
                <span>GitHub</span>
              </a>` : ''}
              ${hasReport ? `<a href="${project.reportUrl}" class="project-link" target="_blank">
                <i class="fas fa-file-alt"></i>
                <span>Report</span>
              </a>` : ''}
            </div>
          ` : '';
          
          return `
          <div class="project-card">
            <div class="project-image">
              <img src="${project.imageUrl || ''}" alt="${project.name || 'Project'}" onerror="this.src='https://placehold.co/600x400?text=Project+Image'">
          </div>
            <div class="project-content">
              <h3>${project.name || ''}</h3>
              <p>${project.description || ''}</p>
              ${buttonHtml}
              </div>
            </div>
        `;
        }).join('');
        
        // Generate skills HTML for Template 8
        skillsHtml = portfolioData.skills.map((skill: Skill) => {
          // Remove </> prefix if it exists in the skill name
          const skillName = (skill.name || '').replace(/^<\/>/, '');
          return `
          <div class="skill-card">
            <div class="skill-name">${skillName}</div>
          </div>
          `;
        }).join('');
        
        // Create a custom skills section with horizontal scrolling animation
        const template8SkillsSection = `
        <section id="skills" class="skills">
          <div class="container">
            <h2 class="section-title"><span>02</span>Skills</h2>
            
            <!-- Skills marquee wrapper -->
            <div class="skills-marquee-wrapper">
              <div class="skills-marquee">
                <div class="skills-track">
                  ${skillsHtml}
                  <!-- Duplicate for seamless loop -->
                  ${skillsHtml}
                </div>
              </div>
            </div>
          </div>
        </section>
        `;
        
        // Add custom CSS for Template 8 skills marquee
        const template8SkillsCss = `
        <style>
          /* Skills marquee styling for template8 */
          .skills-marquee-wrapper {
            width: 85%;
            margin: 2rem auto 4rem;
            position: relative;
            padding: 1.5rem 0;
            background-color: var(--card-bg, rgba(30, 41, 59, 0.5));
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 8px 32px rgba(31, 38, 135, 0.15);
            border: 1px solid rgba(255, 255, 255, 0.08);
            backdrop-filter: blur(4px);
            -webkit-backdrop-filter: blur(4px);
          }
          
          .skills-marquee {
            width: 100%;
            overflow: hidden;
          }
          
          .skills-track {
            display: flex;
            width: max-content;
            animation: scrollSkills 35s linear infinite;
            gap: 2rem;
            padding: 0.5rem 2rem;
          }
          
          .skills-track:hover {
            animation-play-state: paused;
          }
          
          @keyframes scrollSkills {
            0% {
              transform: translateX(0);
            }
            100% {
              transform: translateX(-50%);
            }
          }
          
          /* Enhanced skill card design */
          .skill-card {
            background-color: var(--accent-color, #4f46e5);
            color: var(--light-text, #ffffff);
            border-radius: 12px;
            padding: 1rem 2rem;
            min-width: 150px;
            height: 60px;
            display: flex;
            justify-content: center;
            align-items: center;
            transition: all 0.3s ease;
            box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
            backdrop-filter: blur(4px);
            border: 1px solid rgba(255, 255, 255, 0.1);
          }
          
          .skill-card:hover {
            transform: translateY(-5px) scale(1.05);
            box-shadow: 0 15px 30px rgba(0, 0, 0, 0.2);
          }
          
          .skill-name {
            font-size: 1.1rem;
            font-weight: 600;
            letter-spacing: 0.5px;
          }
          
          /* Responsive adjustments */
          @media (max-width: 1200px) {
            .skills-marquee-wrapper {
              width: 90%;
            }
            
            .skill-card {
              padding: 0.9rem 1.5rem;
              min-width: 130px;
            }
          }
          
          @media (max-width: 768px) {
            .skills-marquee-wrapper {
              width: 95%;
              margin: 2rem auto 3rem;
            }
            
            .skills-track {
              gap: 1.5rem;
              animation-duration: 25s;
            }
            
            .skill-card {
              padding: 0.8rem 1.2rem;
              min-width: 120px;
              height: 50px;
            }
            
            .skill-name {
              font-size: 0.9rem;
            }
          }
          
          /* Hide original skills section if it exists */
          #skills .skills-container {
            display: none !important;
          }
          
          /* Minimalistic background animation */
          .background-animation {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: -1;
            opacity: 0.7;
          }
          
          /* Ensure proper stacking context for content */
          body {
            position: relative;
            z-index: 1;
          }
          
          section {
            position: relative;
            z-index: 2;
          }
        </style>
        `;
        
        // Add JavaScript for skills animation and minimalistic background
        const template8SkillsScript = `
        <script>
          document.addEventListener('DOMContentLoaded', function() {
            // Get the skills track and all skill cards
            const skillsTrack = document.querySelector('.skills-track');
            const skillCards = document.querySelectorAll('.skill-card');
            
            if (skillsTrack && skillCards.length > 0) {
              // Adjust animation speed based on number of skills
              const duration = Math.max(20, Math.min(40, 15 + skillCards.length * 2));
              skillsTrack.style.animationDuration = duration + 's';
              
              // Fix for Safari browser - force recalculation of animation
              setTimeout(() => {
                skillsTrack.style.animationName = 'none';
                setTimeout(() => {
                  skillsTrack.style.animationName = 'scrollSkills';
                }, 10);
              }, 100);
              
              // Apply random subtle variations to each skill card for visual interest
              skillCards.forEach(card => {
                // Slight hue variation
                const hueShift = Math.floor(Math.random() * 20) - 10; // -10 to +10
                card.style.filter = 'hue-rotate(' + hueShift + 'deg)';
              });
            }
            
            // Create minimalistic animated background
            const canvas = document.createElement('canvas');
            canvas.classList.add('background-animation');
            document.body.insertBefore(canvas, document.body.firstChild);
            
            const ctx = canvas.getContext('2d');
            let width = canvas.width = window.innerWidth;
            let height = canvas.height = window.innerHeight;
            
            // Get theme colors from CSS variables or use defaults
            const getComputedStyle = window.getComputedStyle(document.body);
            const accentColor = getComputedStyle.getPropertyValue('--accent-color') || '#4f46e5';
            const bgColor = getComputedStyle.getPropertyValue('--bg-color') || '#0f172a';
            
            // Configuration
            const dots = [];
            const dotCount = Math.min(Math.floor(width * height / 15000), 100); // Reasonable number of dots
            const dotSize = 1.5;
            const connectionDistance = 150;
            const connectionOpacity = 0.15;
            
            // Create dots
            for (let i = 0; i < dotCount; i++) {
              dots.push({
                x: Math.random() * width,
                y: Math.random() * height,
                vx: (Math.random() - 0.5) * 0.5, // Slow horizontal velocity
                vy: (Math.random() - 0.5) * 0.5, // Slow vertical velocity
              });
            }
            
            // Animation function
            function animate() {
              // Clear canvas with semi-transparent background for trailing effect
              ctx.fillStyle = bgColor;
              ctx.globalAlpha = 0.2;
              ctx.fillRect(0, 0, width, height);
              ctx.globalAlpha = 1;
              
              // Draw and update dots
              for (let i = 0; i < dots.length; i++) {
                const dot = dots[i];
                
                // Move dot
                dot.x += dot.vx;
                dot.y += dot.vy;
                
                // Bounce off edges
                if (dot.x < 0 || dot.x > width) dot.vx *= -1;
                if (dot.y < 0 || dot.y > height) dot.vy *= -1;
                
                // Draw dot
                ctx.beginPath();
                ctx.arc(dot.x, dot.y, dotSize, 0, Math.PI * 2);
                ctx.fillStyle = accentColor;
                ctx.fill();
                
                // Draw connections to nearby dots
                for (let j = i + 1; j < dots.length; j++) {
                  const otherDot = dots[j];
                  const dx = dot.x - otherDot.x;
                  const dy = dot.y - otherDot.y;
                  const distance = Math.sqrt(dx * dx + dy * dy);
                  
                  if (distance < connectionDistance) {
                    ctx.beginPath();
                    ctx.moveTo(dot.x, dot.y);
                    ctx.lineTo(otherDot.x, otherDot.y);
                    ctx.strokeStyle = accentColor;
                    ctx.globalAlpha = connectionOpacity * (1 - distance / connectionDistance);
                    ctx.stroke();
                    ctx.globalAlpha = 1;
                  }
                }
              }
              
              requestAnimationFrame(animate);
            }
            
            // Handle window resize
            window.addEventListener('resize', () => {
              width = canvas.width = window.innerWidth;
              height = canvas.height = window.innerHeight;
            });
            
            // Start animation
            animate();
          });
        </script>
        `;
        
        // Add custom CSS for reduced section spacing in template 8
        const template8SectionSpacingCSS = `
        <style>
          /* Reduce spacing between sections in template 8 */
          section {
            padding: calc(var(--spacing) * 5) 0; /* Reduced from 10x to 5x */
            min-height: unset; /* Remove minimum height requirement */
          }
          
          /* Add some minimal spacing between sections */
          section + section {
            padding-top: calc(var(--spacing) * 3);
          }
          
          /* Maintain full height only for hero section */
          section.hero {
            min-height: 100vh;
          }
          
          /* Adjust section title spacing to match new section spacing */
          .section-title {
            margin-bottom: calc(var(--spacing) * 5); /* Reduced from 8x to 5x */
          }
        </style>
        `;
        
        // Replace the skills section in the HTML
        htmlContent = htmlContent.replace(
          /<section id="skills"[\s\S]*?<\/section>/,
          template8SkillsSection
        );
        
        // Add the custom CSS and JavaScript
        htmlContent = htmlContent.replace('</head>', `${template8SkillsCss}${template8SectionSpacingCSS}</head>`);
        htmlContent = htmlContent.replace('</body>', `${template8SkillsScript}</body>`);
        
        // Replace all relevant placeholders in the HTML content
        htmlContent = htmlContent
          .replace(/\{\{initials\}\}/g, initials)
          .replace(/\{\{fullName\}\}/g, portfolioData.fullName || '')
          .replace(/\{\{title\}\}/g, portfolioData.title || '')
          .replace(/\{\{smallIntro\}\}/g, portfolioData.smallIntro || '')
          .replace(/\{\{about\}\}/g, portfolioData.about || '')
          .replace(/\{\{email\}\}/g, portfolioData.email || '')
          .replace(/\{\{phone\}\}/g, portfolioData.phone || '')
          .replace(/\{\{projects\}\}/g, projectsHtml)
          .replace(/\{\{skills\}\}/g, skillsHtml)
          .replace(/\{\{current-year\}\}/g, new Date().getFullYear().toString());
        
        // Add a hidden data attribute with the title for JavaScript to use
        htmlContent = htmlContent.replace('</head>', `<script>window.portfolioTitle = "${portfolioData.title || ''}";</script></head>`);
        
        if (portfolioData.profilePictureUrl) {
          // Ensure the profile picture URL is absolute for cross-domain compatibility
          let profilePicUrl = portfolioData.profilePictureUrl;
          
          // Check if the URL is already absolute (starts with http:// or https://)
          if (!profilePicUrl.startsWith('http://') && !profilePicUrl.startsWith('https://')) {
            console.log('Converting relative profile picture URL to absolute for template');
            profilePicUrl = new URL(profilePicUrl, 'https://makeportfolio.vercel.app').toString();
          }
          
          htmlContent = htmlContent.replace(/\{\{profilePictureUrl\}\}/g, profilePicUrl);
        }
        
        // Replace CV-related placeholders
        if (portfolioData.hasCv && portfolioData.cvUrl) {
          htmlContent = htmlContent
            .replace(/\{\{hasCv\}\}/g, 'true')
            .replace(/\{\{cvUrl\}\}/g, portfolioData.cvUrl);
      } else {
          // Remove the CV button section
          const cvRegex = /\{\{#if hasCv\}\}([\s\S]*?)\{\{\/if\}\}/g;
          htmlContent = htmlContent.replace(cvRegex, '');
        }
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
        skillsHtml = portfolioData.skills.map((skill: Skill) => {
          // Remove </> prefix if it exists in the skill name
          const skillName = (skill.name || '').replace(/^<\/>/, '');
          return `
          <div class="skill-tag">
            <span class="skill-icon"><i class="fas fa-code"></i></span>
            <span class="skill-name">${skillName}</span>
          </div>
          `;
        }).join('');
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
      
      // Remove "Connect With Me" section from template4
      if (templateId === 'template4') {
        htmlContent = htmlContent.replace(
          /<div class="social-media">[\s\S]*?<h3>Connect With Me<\/h3>[\s\S]*?<\/div>[\s\S]*?<\/div>/,
          '</div>'
        );
      }
      
      // Add auto-scrolling functionality for recording purposes
      const autoScrollScript = `
      <script>
        // Auto-scrolling functionality for recording portfolios
        (function() {
          let isScrolling = false;
          let scrollSpeed = 3.2; // Pixels per frame (adjust for faster/slower scrolling)
          
          // Listen for Shift+S key combination to start/stop scrolling
          document.addEventListener('keydown', (e) => {
            // Shift + S key to toggle scrolling
            if (e.shiftKey && e.key === 'S') {
              e.preventDefault();
              
              if (isScrolling) {
                // Stop scrolling
                isScrolling = false;
                console.log('Auto-scrolling stopped');
              } else {
                // Start scrolling from current position
                isScrolling = true;
                console.log('Auto-scrolling started with speed: ' + scrollSpeed.toFixed(1));
                
                // Smooth scrolling animation using requestAnimationFrame for better performance
                let lastTime = null;
                
                function smoothScroll(timestamp) {
                  if (!isScrolling) return;
                  
                  if (!lastTime) lastTime = timestamp;
                  const elapsed = timestamp - lastTime;
                  
                  // Calculate how much to scroll based on elapsed time for consistent speed
                  const scrollAmount = (scrollSpeed * elapsed) / 16.66; // Normalize to 60fps
                  
                  window.scrollBy(0, scrollAmount);
                  lastTime = timestamp;
                  
                  // Check if we've reached the bottom of the page
                  if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 20) {
                    // We've reached the bottom, stop scrolling
                    isScrolling = false;
                    console.log('Reached bottom of page, auto-scrolling stopped');
                    return;
                  }
                  
                  requestAnimationFrame(smoothScroll);
                }
                
                requestAnimationFrame(smoothScroll);
              }
            }
            
            // Shift + Up Arrow to increase scroll speed
            if (isScrolling && e.shiftKey && e.key === 'ArrowUp') {
              e.preventDefault();
              scrollSpeed += 0.2;
              console.log('Scroll speed increased to ' + scrollSpeed.toFixed(1));
            }
            
            // Shift + Down Arrow to decrease scroll speed
            if (isScrolling && e.shiftKey && e.key === 'ArrowDown') {
              e.preventDefault();
              scrollSpeed = Math.max(0.2, scrollSpeed - 0.2);
              console.log('Scroll speed decreased to ' + scrollSpeed.toFixed(1));
            }
          });
        })();
      </script>
      `;
      
      // Insert the auto-scroll script right before the closing body tag
      htmlContent = htmlContent.replace('</body>', `${autoScrollScript}\n</body>`);
      
      // Create output directory and write file with improved error handling
      const publicOutputDir = path.join(process.cwd(), 'public', 'portfolios', portfolioId);
      
      try {
        // Ensure all parent directories exist (recursive: true handles this)
        fs.mkdirSync(path.join(process.cwd(), 'public', 'portfolios', portfolioId), { recursive: true, mode: 0o777 } as any);
        
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
        console.error('Filesystem error:', fsError);
        
        // If we can't write to the filesystem, return HTML content directly
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