import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { getPortfolioById } from '@/lib/firebase';
import os from 'os';
import { minify } from 'html-minifier';
import sharp from 'sharp';
import { ImageResponse } from '@vercel/og';
import { updatePortfolio } from '@/lib/firebase';
import { promises as fsPromises } from 'fs';

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
      
      // Read the template files asynchronously
      const templatePath = path.join(process.cwd(), 'templates', templateId, 'index.html');
      const cssPath = path.join(process.cwd(), 'templates', templateId, 'css', 'styles.css');
      const jsPath = path.join(process.cwd(), 'templates', templateId, 'js', 'script.js');
      
      console.log('Template paths:', {
        templatePath,
        cssPath,
        jsPath,
        cwd: process.cwd()
      });

      // Verify file existence before reading
      await Promise.all([
        fsPromises.access(templatePath),
        fsPromises.access(cssPath),
        fsPromises.access(jsPath)
      ]).catch(error => {
        console.error('File access error:', error);
        throw new Error(`Template files not accessible: ${error.message}`);
      });
      
      // Use Promise.all to read all files concurrently
      const [htmlContent, cssContent, jsContent] = await Promise.all([
        fsPromises.readFile(templatePath, 'utf-8').catch(error => {
          console.error('Error reading HTML template:', error);
          throw error;
        }),
        fsPromises.readFile(cssPath, 'utf-8').catch(error => {
          console.error('Error reading CSS file:', error);
          throw error;
        }),
        fsPromises.readFile(jsPath, 'utf-8').catch(error => {
          console.error('Error reading JS file:', error);
          throw error;
        })
      ]);

      console.log('Successfully read all template files');

      // Create a modified version of the HTML content
      let modifiedHtml = htmlContent
        .replace(/{{name}}/g, portfolioData.name || '')
        .replace(/{{fullName}}/g, portfolioData.fullName || portfolioData.name || '')
        .replace(/{{title}}/g, portfolioData.title || '')
        .replace(/{{about}}/g, portfolioData.about || '')
        .replace(/{{email}}/g, portfolioData.email || '')
        .replace(/{{phone}}/g, portfolioData.phone || '')
        .replace(/{{currentYear}}/g, new Date().getFullYear().toString());

      // Handle profile picture URL
      if (portfolioData.profilePictureUrl) {
        modifiedHtml = modifiedHtml.replace(/{{profilePictureUrl}}/g, portfolioData.profilePictureUrl);
        // Handle conditional for profile picture
        modifiedHtml = modifiedHtml.replace(/{{#if profilePictureUrl}}([\s\S]*?){{else}}[\s\S]*?{{\/if}}/g, '$1');
      } else {
        // If no profile picture URL, use the else condition if available
        modifiedHtml = modifiedHtml.replace(/{{#if profilePictureUrl}}[\s\S]*?{{else}}([\s\S]*?){{\/if}}/g, '$1');
        // Or just remove the placeholder
        modifiedHtml = modifiedHtml.replace(/{{profilePictureUrl}}/g, '');
      }
      
      // Handle CV link
      if (portfolioData.hasCv && portfolioData.cvUrl) {
        modifiedHtml = modifiedHtml.replace(/{{#if hasCv}}([\s\S]*?){{\/if}}/g, '$1');
        modifiedHtml = modifiedHtml.replace(/{{cvUrl}}/g, portfolioData.cvUrl);
      } else {
        modifiedHtml = modifiedHtml.replace(/{{#if hasCv}}[\s\S]*?{{\/if}}/g, '');
      }
      
      // Handle user initials for avatar
      const nameParts = portfolioData.name.split(' ');
      let initials = 'P';
      if (nameParts.length >= 2) {
        initials = `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase();
      } else if (nameParts.length === 1 && nameParts[0].length > 0) {
        initials = nameParts[0][0].toUpperCase();
      }
      modifiedHtml = modifiedHtml.replace(/{{initials}}/g, initials);
      
      // Handle template-specific logic
      if (templateId === 'template3') {
        // Format code snippets properly for code highlighting in template3
        // Convert newlines in about text for the code snippet
        const formattedAbout = portfolioData.about.replace(/\n/g, '\n  ');
        modifiedHtml = modifiedHtml.replace(/```{{about}}```/g, formattedAbout);
        
        // Add line breaks to description in timeline items for template3
        if (portfolioData.experience && portfolioData.experience.length > 0) {
          portfolioData.experience.forEach((exp: Experience, index: number) => {
            if (exp.description) {
              const formattedDescription = exp.description.replace(/\n/g, '<br>').replace(/\r/g, '<br>');
              modifiedHtml = modifiedHtml.replace(
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
      modifiedHtml = modifiedHtml.replace(/{{#each skills}}[\s\S]*?{{\/each}}/g, skillsHtml);
      
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
      modifiedHtml = modifiedHtml.replace(/{{#each experience}}[\s\S]*?{{\/each}}/g, experienceHtml);
      
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
      modifiedHtml = modifiedHtml.replace(/{{#each education}}[\s\S]*?{{\/each}}/g, educationHtml);
      
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
      modifiedHtml = modifiedHtml.replace(/{{#each projects}}[\s\S]*?{{\/each}}/g, projectsHtml);
      
      // Inline CSS and JS directly into the HTML
      modifiedHtml = modifiedHtml.replace(/<link rel="stylesheet" href="css\/styles.css">/, `<style>\n${cssContent}\n</style>`);
      modifiedHtml = modifiedHtml.replace(/<script src="js\/script.js"><\/script>/, `<script>\n${jsContent}\n</script>`);
      
      // Adding SEO and Social Media meta tags
      const metaTags = `
      <!-- SEO Meta Tags -->
      <meta name="description" content="${portfolioData.about ? portfolioData.about.substring(0, 160) : `${portfolioData.fullName || portfolioData.name} - ${portfolioData.title}`}">
      <meta name="keywords" content="${portfolioData.skills ? portfolioData.skills.map((s: Skill) => s.name).join(', ') : 'portfolio, professional, resume'}">
      <meta name="author" content="${portfolioData.fullName || portfolioData.name}">
      
      <!-- Open Graph / Facebook -->
      <meta property="og:type" content="website">
      <meta property="og:url" content="${process.env.NEXT_PUBLIC_SITE_URL || 'https://yoursite.com'}/portfolio/${portfolioData.id}">
      <meta property="og:title" content="${portfolioData.fullName || portfolioData.name} - ${portfolioData.title}">
      <meta property="og:description" content="${portfolioData.about ? portfolioData.about.substring(0, 160) : `Professional portfolio of ${portfolioData.fullName || portfolioData.name}`}">
      <meta property="og:image" content="${process.env.NEXT_PUBLIC_SITE_URL || 'https://yoursite.com'}/portfolios/${portfolioData.id}/og-image.png">
      
      <!-- Twitter -->
      <meta property="twitter:card" content="summary_large_image">
      <meta property="twitter:url" content="${process.env.NEXT_PUBLIC_SITE_URL || 'https://yoursite.com'}/portfolio/${portfolioData.id}">
      <meta property="twitter:title" content="${portfolioData.fullName || portfolioData.name} - ${portfolioData.title}">
      <meta property="twitter:description" content="${portfolioData.about ? portfolioData.about.substring(0, 160) : `Professional portfolio of ${portfolioData.fullName || portfolioData.name}`}">
      <meta property="twitter:image" content="${process.env.NEXT_PUBLIC_SITE_URL || 'https://yoursite.com'}/portfolios/${portfolioData.id}/og-image.png">
      `;
      
      // Insert meta tags right before the closing </head> tag
      modifiedHtml = modifiedHtml.replace('</head>', `${metaTags}\n</head>`);
      
      // Minify HTML
      const minifiedHtml = minify(modifiedHtml, {
        collapseWhitespace: true,
        removeComments: true,
        minifyCSS: true,
        minifyJS: true
      });
      
      // Create output directory with improved error handling
      const publicOutputDir = path.join(process.cwd(), 'public', 'portfolios', portfolioData.id);
      
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
        fs.writeFileSync(outputPath, minifiedHtml, { mode: 0o666 });
        console.log(`Successfully wrote HTML to: ${outputPath}`);
        
        // Copy all assets from the template directory to the public directory
        await copyTemplateAssets(path.join(process.cwd(), 'templates', templateId), publicOutputDir);
        
        // Generate SEO files (robots.txt, sitemap.xml)
        await generateSEOFiles(portfolioData.id, portfolioData);
        
        // Generate social preview image
        await generateOGImage(portfolioData.id, portfolioData);
        
        // Update portfolio with published status
        await updatePortfolio(portfolioData.id, {
          published: true,
          publishedAt: new Date().toISOString(),
          publicUrl: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://yoursite.com'}/portfolio/${portfolioData.id}`
        });
        
        // Return success with the public URL
        return NextResponse.json({ 
          success: true, 
          url: `/portfolios/${portfolioData.id}/index.html`,
          message: 'Portfolio generated successfully' 
        });
      } catch (fsError: any) {
        console.error('Filesystem error with public directory:', fsError);
        
        // If we can't write to the public directory, return HTML content directly
        console.log('Falling back to returning HTML content directly...');
        
        return NextResponse.json({ 
          success: true, 
          htmlContent: minifiedHtml,
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

// Helper function to process Handlebars-like arrays
function processHandlebarsArrays(html: string, portfolio: Portfolio) {
  // ... existing implementation ...
}

// Function to copy template assets
async function copyTemplateAssets(sourceDir: string, targetDir: string) {
  try {
    // Copy CSS files
    const cssDir = path.join(sourceDir, "css");
    const targetCssDir = path.join(targetDir, "css");
    await fsPromises.mkdir(targetCssDir, { recursive: true });
    
    const cssFiles = await fsPromises.readdir(cssDir);
    for (const file of cssFiles) {
      const sourcePath = path.join(cssDir, file);
      const targetPath = path.join(targetCssDir, file);
      await fsPromises.copyFile(sourcePath, targetPath);
    }
    
    // Copy JS files
    const jsDir = path.join(sourceDir, "js");
    const targetJsDir = path.join(targetDir, "js");
    await fsPromises.mkdir(targetJsDir, { recursive: true });
    
    const jsFiles = await fsPromises.readdir(jsDir);
    for (const file of jsFiles) {
      const sourcePath = path.join(jsDir, file);
      const targetPath = path.join(targetJsDir, file);
      await fsPromises.copyFile(sourcePath, targetPath);
    }
    
    // Copy images directory if it exists
    try {
      const imgDir = path.join(sourceDir, "img");
      const targetImgDir = path.join(targetDir, "img");
      await fsPromises.mkdir(targetImgDir, { recursive: true });
      
      const imgFiles = await fsPromises.readdir(imgDir);
      for (const file of imgFiles) {
        const sourcePath = path.join(imgDir, file);
        const targetPath = path.join(targetImgDir, file);
        await fsPromises.copyFile(sourcePath, targetPath);
      }
    } catch (error) {
      // Images directory might not exist, that's okay
      console.log("No images directory found in template, skipping...");
    }
    
    // Copy any other files in the root
    const rootFiles = await fsPromises.readdir(sourceDir);
    for (const file of rootFiles) {
      // Skip directories we've already handled
      if (file === "css" || file === "js" || file === "img" || file === "index.html") {
        continue;
      }
      
      const sourcePath = path.join(sourceDir, file);
      const stat = await fsPromises.stat(sourcePath);
      
      // Skip directories
      if (stat.isDirectory()) {
        continue;
      }
      
      const targetPath = path.join(targetDir, file);
      await fsPromises.copyFile(sourcePath, targetPath);
    }
    
    console.log("All assets copied successfully");
  } catch (error) {
    console.error("Error copying template assets:", error);
    throw error;
  }
}

// Generate SEO files
async function generateSEOFiles(portfolioId: string, portfolio: Portfolio) {
  const publicPortfolioDir = path.join(process.cwd(), "public", "portfolios", portfolioId);
  
  // Generate robots.txt
  const robotsTxt = `User-agent: *
Allow: /
Sitemap: ${process.env.NEXT_PUBLIC_SITE_URL || 'https://yoursite.com'}/portfolios/${portfolioId}/sitemap.xml`;
  
  await fsPromises.writeFile(path.join(publicPortfolioDir, "robots.txt"), robotsTxt);
  
  // Generate sitemap.xml
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${process.env.NEXT_PUBLIC_SITE_URL || 'https://yoursite.com'}/portfolio/${portfolioId}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>`;
  
  await fsPromises.writeFile(path.join(publicPortfolioDir, "sitemap.xml"), sitemap);
  
  console.log("SEO files generated successfully");
}

// Generate social preview image
async function generateOGImage(portfolioId: string, portfolio: Portfolio) {
  const publicPortfolioDir = path.join(process.cwd(), "public", "portfolios", portfolioId);
  
  try {
    // Use a fallback method with sharp since ImageResponse requires React JSX
    // Create a simple SVG image
    const width = 1200;
    const height = 630;
    
    const svgImage = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#f0f4f8"/>
      <text x="50%" y="40%" font-family="Arial" font-size="60" text-anchor="middle" fill="#333">${portfolio.fullName || portfolio.name}</text>
      <text x="50%" y="50%" font-family="Arial" font-size="40" text-anchor="middle" fill="#666">${portfolio.title}</text>
      <text x="50%" y="70%" font-family="Arial" font-size="30" text-anchor="middle" fill="#999">${process.env.NEXT_PUBLIC_SITE_URL || 'yoursite.com'}</text>
    </svg>`;
    
    const svgBuffer = Buffer.from(svgImage);
    
    // Use sharp to convert SVG to PNG
    await sharp(svgBuffer)
      .png()
      .toFile(path.join(publicPortfolioDir, "og-image.png"));
    
    console.log("OG image generated successfully");
  } catch (error) {
    console.error("Error generating OG image:", error);
  }
} 