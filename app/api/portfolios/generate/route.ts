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
      htmlContent = htmlContent.replace(/{{name}}/g, portfolioData.name || '')
                              .replace(/{{fullName}}/g, portfolioData.fullName || portfolioData.name || '')
                              .replace(/{{title}}/g, portfolioData.title || '')
                              .replace(/{{about}}/g, portfolioData.about || '')
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
            <div class="skill-info">
              <span class="skill-name">${skill.name || ''}</span>
              <span class="skill-percentage">${skill.level || '90%'}</span>
            </div>
            <div class="skill-bar">
              <div class="skill-progress" style="width: ${skill.level || '90%'}"></div>
            </div>
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
        experienceHtml = portfolioData.experience.map((exp: Experience) => `
          <div class="timeline-item">
            <div class="timeline-marker"></div>
            <div class="timeline-content">
              <div class="timeline-date">${exp.period || ''}</div>
              <h3 class="timeline-title">${exp.position || ''}</h3>
              <h4 class="timeline-company">${exp.company || ''}</h4>
              <p class="timeline-description">${exp.description || ''}</p>
            </div>
          </div>
        `).join('');
      }
      htmlContent = htmlContent.replace(/{{#each experience}}[\s\S]*?{{\/each}}/g, experienceHtml);
      
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
                <img src="${project.imageUrl || ''}" alt="${project.name || ''}" class="project-image">
              </div>
            </div>
          </div>
        `).join('');
      } else if (templateId === 'template4') {
        projectsHtml = portfolioData.projects.map((project: Project) => `
          <div class="project-card-t4 all">
            <div class="project-image">
              <img src="${project.imageUrl || ''}" alt="${project.name || ''}">
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
              <img src="${project.imageUrl || ''}" alt="${project.name || ''}">
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
              <img src="${project.imageUrl || ''}" alt="${project.name || ''}">
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