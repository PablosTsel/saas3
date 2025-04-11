import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { getPortfolioById } from '@/lib/firebase';
import os from 'os';

// Define interfaces for portfolio data
interface Skill {
  name: string;
}

interface Experience {
  company: string;
  position: string;
  description: string;
}

interface Education {
  institution: string;
  degree: string;
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
                              .replace(/{{title}}/g, portfolioData.title || '')
                              .replace(/{{about}}/g, portfolioData.about || '')
                              .replace(/{{currentYear}}/g, new Date().getFullYear().toString());
      
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
      
      // Handle arrays (skills, experience, education, projects)
      
      // Skills
      const skillsHtml = portfolioData.skills.map((skill: Skill) => `
        <div class="skill-item">
          <div class="skill-name">${skill.name || ''}</div>
        </div>
      `).join('');
      htmlContent = htmlContent.replace(/{{#each skills}}[\s\S]*?{{\/each}}/g, skillsHtml);
      
      // Experience
      const experienceHtml = portfolioData.experience.map((exp: Experience) => `
        <div class="timeline-item">
          <div class="timeline-content">
            <h3 class="position">${exp.position || ''}</h3>
            <h4 class="company">${exp.company || ''}</h4>
            <p class="description">${exp.description || ''}</p>
          </div>
        </div>
      `).join('');
      htmlContent = htmlContent.replace(/{{#each experience}}[\s\S]*?{{\/each}}/g, experienceHtml);
      
      // Education
      const educationHtml = portfolioData.education.map((edu: Education) => `
        <div class="timeline-item">
          <div class="timeline-content">
            <h3 class="degree">${edu.degree || ''}</h3>
            <h4 class="institution">${edu.institution || ''}</h4>
          </div>
        </div>
      `).join('');
      htmlContent = htmlContent.replace(/{{#each education}}[\s\S]*?{{\/each}}/g, educationHtml);
      
      // Projects
      const projectsHtml = portfolioData.projects.map((project: Project) => `
        <div class="project-item">
          <div class="project-image">
            <img src="${project.imageUrl || ''}" alt="${project.name || ''}">
          </div>
          <div class="project-info">
            <h3 class="project-name">${project.name || ''}</h3>
            <p class="project-description">${project.description || ''}</p>
          </div>
        </div>
      `).join('');
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