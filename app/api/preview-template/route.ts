import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const templateId = searchParams.get('template') || 'template1'
  const editable = searchParams.get('editable') === 'true'
  
  try {
    // Load the HTML template based on template ID
    let templatePath = path.join(process.cwd(), 'templates', templateId, 'index.html')
    
    // Check if the template file exists
    if (!fs.existsSync(templatePath)) {
      return NextResponse.json(
        { error: `Template ${templateId} not found` },
        { status: 404 }
      )
    }
    
    // Read the template file
    let templateHTML = fs.readFileSync(templatePath, 'utf-8')
    
    // If editable, inject our editing script
    if (editable) {
      // Add editing overlay and interaction JavaScript
      const editScript = `
        <style>
          .editable {
            position: relative;
            cursor: pointer;
            transition: outline 0.2s ease;
          }
          .editable:hover {
            outline: 2px dashed rgba(99, 102, 241, 0.5);
          }
          .editable::after {
            content: "✏️";
            position: absolute;
            right: -20px;
            top: 0;
            font-size: 14px;
            opacity: 0;
            transition: opacity 0.2s ease;
          }
          .editable:hover::after {
            opacity: 1;
          }
          .add-button, .remove-button {
            cursor: pointer;
            padding: 4px 8px;
            background: rgba(99, 102, 241, 0.9);
            color: white;
            border-radius: 4px;
            margin: 5px;
            font-size: 12px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            z-index: 9999;
          }
          .remove-button {
            background: rgba(239, 68, 68, 0.9);
          }
          .upload-trigger {
            cursor: pointer;
            border: 2px dashed rgba(99, 102, 241, 0.5);
            padding: 10px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            transition: background-color 0.2s ease;
            z-index: 10;
            position: relative;
          }
          .upload-trigger:hover {
            background-color: rgba(99, 102, 241, 0.1);
          }
          .upload-icon {
            font-size: 24px;
            margin-bottom: 8px;
          }
          
          /* Make sure edit controls appear above template elements */
          #interactive-edit-controls {
            z-index: 9999;
            position: relative;
          }
          
          /* Template-specific styling corrections */
          .skill {
            display: inline-block;
            margin: 5px;
            position: relative;
            padding: 8px 12px;
            background: rgba(99, 102, 241, 0.2);
            border-radius: 4px;
            font-size: 14px;
          }
          
          .project {
            position: relative;
            margin-bottom: 20px;
            padding: 15px;
            border: 1px solid rgba(99, 102, 241, 0.2);
            border-radius: 8px;
          }
          
          .project-image {
            width: 100%;
            height: 200px;
            background: rgba(99, 102, 241, 0.1);
            border-radius: 4px;
            overflow: hidden;
            margin-bottom: 10px;
          }
          
          #skills-container, #projects-container {
            position: relative;
            padding: 10px;
            border: 1px dashed rgba(99, 102, 241, 0.3);
            border-radius: 8px;
            margin: 15px 0;
          }
        </style>
        
        <script>
          // Function to make an element editable
          function makeEditable(element, field, index) {
            if (!element) return;
            
            element.classList.add('editable');
            
            element.addEventListener('click', function() {
              // Send message to parent window
              window.parent.postMessage({
                type: 'edit',
                field: field,
                index: index
              }, '*');
            });
          }
          
          // Function to create an upload trigger
          function createUploadTrigger(element, field, index) {
            if (!element) return;
            
            element.classList.add('upload-trigger');
            
            // Create upload icon
            const icon = document.createElement('div');
            icon.classList.add('upload-icon');
            icon.innerText = '📤';
            
            // Create upload text
            const text = document.createElement('div');
            text.innerText = 'Upload ' + field.charAt(0).toUpperCase() + field.slice(1);
            
            // Clear element and append icon and text
            element.innerHTML = '';
            element.appendChild(icon);
            element.appendChild(text);
            
            element.addEventListener('click', function() {
              // Send message to parent window
              window.parent.postMessage({
                type: 'upload',
                field: field,
                index: index
              }, '*');
            });
          }
          
          // Function to add buttons for variable elements
          function addItemButtons(containerElement, itemType) {
            if (!containerElement) return;
            
            // Create add button
            const addButton = document.createElement('div');
            addButton.classList.add('add-button');
            addButton.innerHTML = '+ Add ' + itemType;
            addButton.setAttribute('id', 'interactive-edit-controls');
            
            addButton.addEventListener('click', function() {
              // Send message to parent window
              window.parent.postMessage({
                type: 'add',
                field: itemType.toLowerCase()
              }, '*');
            });
            
            // Append button
            containerElement.appendChild(addButton);
          }
          
          // Function to add remove button to an item
          function addRemoveButton(element, itemType, index) {
            if (!element) return;
            
            // Create remove button
            const removeButton = document.createElement('div');
            removeButton.classList.add('remove-button');
            removeButton.innerHTML = '✕ Remove';
            removeButton.setAttribute('id', 'interactive-edit-controls');
            
            removeButton.addEventListener('click', function(e) {
              e.stopPropagation(); // Prevent bubbling
              
              // Send message to parent window
              window.parent.postMessage({
                type: 'remove',
                field: itemType.toLowerCase(),
                index: index
              }, '*');
            });
            
            // Append button
            element.appendChild(removeButton);
          }
          
          // Wait for the DOM to be fully loaded
          document.addEventListener('DOMContentLoaded', function() {
            // Make fields editable
            // Personal info
            makeEditable(document.getElementById('full-name'), 'fullName');
            makeEditable(document.getElementById('title'), 'title');
            makeEditable(document.getElementById('small-intro'), 'smallIntro');
            makeEditable(document.getElementById('about'), 'about');
            makeEditable(document.getElementById('email'), 'email');
            makeEditable(document.getElementById('phone'), 'phone');
            makeEditable(document.getElementById('github-profile'), 'githubProfile');
            
            // Profile picture
            if (document.getElementById('profile-picture')) {
              createUploadTrigger(document.getElementById('profile-picture'), 'profilePicture');
            }
            
            // CV
            if (document.getElementById('cv-download')) {
              createUploadTrigger(document.getElementById('cv-download'), 'cv');
            }
            
            // Skills
            const skillsContainer = document.getElementById('skills-container');
            if (skillsContainer) {
              const skills = skillsContainer.querySelectorAll('.skill');
              skills.forEach((skill, index) => {
                makeEditable(skill, 'skill', index);
                addRemoveButton(skill, 'skill', index);
              });
              
              // Add the "Add Skill" button
              addItemButtons(skillsContainer, 'Skill');
            }
            
            // Projects
            const projectsContainer = document.getElementById('projects-container');
            if (projectsContainer) {
              const projects = projectsContainer.querySelectorAll('.project');
              projects.forEach((project, index) => {
                const projectName = project.querySelector('.project-name');
                if (projectName) {
                  makeEditable(projectName, 'project-name', index);
                }
                
                const projectDescription = project.querySelector('.project-description');
                if (projectDescription) {
                  makeEditable(projectDescription, 'project-description', index);
                }
                
                const projectImage = project.querySelector('.project-image');
                if (projectImage) {
                  createUploadTrigger(projectImage, 'projectImage', index);
                }
                
                // Add remove button to the project
                addRemoveButton(project, 'project', index);
              });
              
              // Add the "Add Project" button
              addItemButtons(projectsContainer, 'Project');
            }
          });
          
          // Listen for messages from the parent window
          window.addEventListener('message', function(event) {
            // Make sure the message is from our parent
            if (event.origin !== window.location.origin) return;
            
            const { type, data } = event.data;
            
            if (type === 'update') {
              // Update the template with the new data
              updateTemplate(data);
            }
          });
          
          // Function to update the template with new data
          function updateTemplate(data) {
            console.log("Updating template with data:", data);
            
            // Update personal info
            if (document.getElementById('full-name')) {
              document.getElementById('full-name').textContent = data.fullName;
            }
            
            if (document.getElementById('title')) {
              document.getElementById('title').textContent = data.title;
            }
            
            if (document.getElementById('small-intro')) {
              document.getElementById('small-intro').textContent = data.smallIntro;
            }
            
            if (document.getElementById('about')) {
              document.getElementById('about').textContent = data.about;
            }
            
            if (document.getElementById('email')) {
              document.getElementById('email').textContent = data.email;
            }
            
            if (document.getElementById('phone')) {
              document.getElementById('phone').textContent = data.phone;
            }
            
            if (document.getElementById('github-profile')) {
              document.getElementById('github-profile').textContent = data.githubProfile;
            }
            
            // Update profile picture if available
            if (data.profilePicture && document.getElementById('profile-picture')) {
              // If we have a File object, create a data URL
              if (data.profilePicture instanceof File) {
                const reader = new FileReader();
                reader.onload = function(e) {
                  document.getElementById('profile-picture').innerHTML = \`
                    <img src="\${e.target.result}" alt="\${data.fullName}" class="w-full h-full object-cover" />
                  \`;
                };
                reader.readAsDataURL(data.profilePicture);
              }
            }
            
            // Update skills
            const skillsContainer = document.getElementById('skills-container');
            if (skillsContainer && data.skills) {
              // Clear existing skills
              skillsContainer.innerHTML = '';
              
              // Add new skills
              data.skills.forEach((skill, index) => {
                const skillElement = document.createElement('div');
                skillElement.classList.add('skill');
                skillElement.textContent = skill.name;
                
                makeEditable(skillElement, 'skill', index);
                addRemoveButton(skillElement, 'skill', index);
                
                skillsContainer.appendChild(skillElement);
              });
              
              // Add the "Add Skill" button
              addItemButtons(skillsContainer, 'Skill');
            }
            
            // Update projects
            const projectsContainer = document.getElementById('projects-container');
            if (projectsContainer && data.projects) {
              // Clear existing projects
              projectsContainer.innerHTML = '';
              
              // Add new projects
              data.projects.forEach((project, index) => {
                const projectElement = document.createElement('div');
                projectElement.classList.add('project');
                
                // Project image
                const imageElement = document.createElement('div');
                imageElement.classList.add('project-image');
                
                if (project.image) {
                  // If we have a File object, create a data URL
                  if (project.image instanceof File) {
                    const reader = new FileReader();
                    reader.onload = function(e) {
                      imageElement.innerHTML = \`
                        <img src="\${e.target.result}" alt="\${project.name}" class="w-full h-full object-cover" />
                      \`;
                    };
                    reader.readAsDataURL(project.image);
                  }
                } else {
                  createUploadTrigger(imageElement, 'projectImage', index);
                }
                
                // Project name
                const nameElement = document.createElement('h3');
                nameElement.classList.add('project-name');
                nameElement.textContent = project.name;
                makeEditable(nameElement, 'project-name', index);
                
                // Project description
                const descElement = document.createElement('p');
                descElement.classList.add('project-description');
                descElement.textContent = project.description;
                makeEditable(descElement, 'project-description', index);
                
                // Add elements to project
                projectElement.appendChild(imageElement);
                projectElement.appendChild(nameElement);
                projectElement.appendChild(descElement);
                
                // Add remove button
                addRemoveButton(projectElement, 'project', index);
                
                // Add to container
                projectsContainer.appendChild(projectElement);
              });
              
              // Add the "Add Project" button
              addItemButtons(projectsContainer, 'Project');
            }
          }
          
          // Auto-trigger update with parent data on page load
          window.addEventListener('load', function() {
            // Send a message to parent requesting initial data
            window.parent.postMessage({
              type: 'requestInitialData'
            }, '*');
          });
        </script>
      `
      
      // Inject the edit script before the closing </body> tag
      templateHTML = templateHTML.replace('</body>', `${editScript}</body>`)
      
      // Replace any remaining unprocessed Handlebars template variables with placeholders
      templateHTML = templateHTML
        .replace(/\{\{fullName\}\}/g, 'John Doe')
        .replace(/\{\{title\}\}/g, 'AI Engineer')
        .replace(/\{\{smallIntro\}\}/g, 'I\'m a skilled AI Engineer with a passion for developing innovative solutions.')
        .replace(/\{\{about\}\}/g, 'Hello! I\'m John Doe, a dedicated AI Engineer with expertise in machine learning, deep learning, and natural language processing...')
        .replace(/\{\{email\}\}/g, 'johndoe@gmail.com')
        .replace(/\{\{phone\}\}/g, '+34 607980731')
        .replace(/\{\{profilePictureUrl\}\}/g, 'https://placehold.co/400x400/4169e1/ffffff?text=JD')
        .replace(/\{\{projects\}\}/g, '<div class="project"><h3 class="project-name">NBA Dashboard</h3><p class="project-description">Developed an Excel file containing various data and statistics from the NBA seasons...</p></div>')
        .replace(/\{\{skills\}\}/g, '<div class="skill">Python</div><div class="skill">Machine Learning</div><div class="skill">TensorFlow</div>')
        .replace(/\{\{current-year\}\}/g, new Date().getFullYear().toString())
        .replace(/\{\{#each skills\}\}[\s\S]*?\{\{\/each\}\}/g, '<div class="skill">Python</div><div class="skill">Machine Learning</div><div class="skill">TensorFlow</div>')
        .replace(/\{\{#each projects\}\}[\s\S]*?\{\{\/each\}\}/g, '<div class="project"><h3 class="project-name">NBA Dashboard</h3><p class="project-description">Developed an Excel file containing various data and statistics from the NBA seasons...</p></div>')
        .replace(/\{\{#if[\s\S]*?\{\{\/if\}\}/g, '') // Remove any remaining conditional blocks
      
      // More comprehensive replacements to ensure template elements have proper IDs
      
      // Replace all h1 tags that look like they contain the name
      templateHTML = templateHTML.replace(/<h1[^>]*>(.*?)<\/h1>/gi, (match, content) => {
        // Skip if it already has an id or doesn't look like a name
        if (match.includes(' id=') || content.length > 50) return match;
        return `<h1 id="full-name">${content}</h1>`;
      });
      
      // Replace all h2 tags that look like they could be a title
      templateHTML = templateHTML.replace(/<h2[^>]*>(.*?)<\/h2>/gi, (match, content) => {
        // Skip if it already has an id or too long to be a title
        if (match.includes(' id=') || content.length > 50) return match;
        return `<h2 id="title">${content}</h2>`;
      });
      
      // Replace intro paragraph
      templateHTML = templateHTML.replace(/<p[^>]*(?:class="[^"]*intro[^"]*"|class="[^"]*tagline[^"]*")[^>]*>(.*?)<\/p>/gi, 
        '<p id="small-intro" class="intro">$1</p>');
      
      // Replace about section
      templateHTML = templateHTML.replace(/<div[^>]*(?:class="[^"]*about[^"]*"|id="[^"]*about[^"]*")[^>]*>([\s\S]*?)<\/div>/gi, (match, content) => {
        // Look for a paragraph within the about section
        const aboutParagraph = content.match(/<p[^>]*>([\s\S]*?)<\/p>/i);
        if (aboutParagraph) {
          return match.replace(aboutParagraph[0], `<p id="about">${aboutParagraph[1]}</p>`);
        }
        return `<div id="about" class="about-text">${content}</div>`;
      });
      
      // Replace email
      templateHTML = templateHTML.replace(/([^@\s]+@[^@\s]+\.[^@\s]+)/gi, (match) => {
        // Skip if it's already in a span with id or part of a link
        const previousChars = templateHTML.substring(templateHTML.indexOf(match) - 30, templateHTML.indexOf(match));
        if (previousChars.includes('id="email"') || previousChars.includes('mailto:')) return match;
        return `<span id="email">${match}</span>`;
      });
      
      // Replace phone
      templateHTML = templateHTML.replace(/(\+?\d+[\s\-\(\)]*\d+[\s\-\(\)]*\d+[\s\-\(\)]*\d+)/gi, (match) => {
        // Skip if it's already in a span with id
        const previousChars = templateHTML.substring(templateHTML.indexOf(match) - 30, templateHTML.indexOf(match));
        if (previousChars.includes('id="phone"')) return match;
        return `<span id="phone">${match}</span>`;
      });
      
      // Replace GitHub profile
      templateHTML = templateHTML.replace(/(https:\/\/github\.com\/[\w\-]+)/gi, (match) => {
        // Skip if it's already in a span with id
        const previousChars = templateHTML.substring(templateHTML.indexOf(match) - 30, templateHTML.indexOf(match));
        if (previousChars.includes('id="github-profile"')) return match;
        return `<span id="github-profile">${match}</span>`;
      });
      
      // Replace profile picture
      templateHTML = templateHTML.replace(/<img[^>]*(?:class="[^"]*(?:profile|avatar)[^"]*"|alt="[^"]*(?:profile|avatar)[^"]*")[^>]*src="([^"]+)"[^>]*>/gi, 
        '<div id="profile-picture" class="profile-pic-container"><img src="$1" class="profile-pic" alt="Profile" /></div>');
      
      // Replace CV download link
      templateHTML = templateHTML.replace(/<a[^>]*(?:class="[^"]*(?:cv|resume)[^"]*"|href="[^"]*\.pdf")[^>]*>(.*?)<\/a>/gi, 
        '<div id="cv-download" class="cv-download-container">Download CV</div>');
      
      // Replace skills section
      
      // First, try to find a skills section with a container
      if (!templateHTML.includes('id="skills-container"')) {
        templateHTML = templateHTML.replace(/(<section[^>]*(?:id="[^"]*skills[^"]*"|class="[^"]*skills[^"]*")[^>]*>[\s\S]*?)(<div[^>]*>)([\s\S]*?)(<\/div>[\s\S]*?<\/section>)/gi, 
          '$1<div id="skills-container" class="skills-container">$3</div>$4');
      }
      
      // Replace individual skill items
      templateHTML = templateHTML.replace(/<(span|div)[^>]*class="[^"]*(?:skill|tag)[^"]*"[^>]*>(.*?)<\/\1>/gi, 
        '<div class="skill">$2</div>');
      
      // Replace projects section
      
      // First, try to find a projects section with a container
      if (!templateHTML.includes('id="projects-container"')) {
        templateHTML = templateHTML.replace(/(<section[^>]*(?:id="[^"]*projects[^"]*"|class="[^"]*projects[^"]*")[^>]*>[\s\S]*?)(<div[^>]*class="[^"]*(?:grid|container|projects)[^"]*"[^>]*>)([\s\S]*?)(<\/div>[\s\S]*?<\/section>)/gi, 
          '$1$2<div id="projects-container" class="projects-container">$3</div>$4');
      }
      
      // Replace individual project items
      templateHTML = templateHTML.replace(/<(div|article)[^>]*class="[^"]*(?:project|card)[^"]*"[^>]*>([\s\S]*?)<\/\1>/gi, 
        '<div class="project">$2</div>');
      
      // Replace project names
      templateHTML = templateHTML.replace(/<h3[^>]*>(.*?)<\/h3>/gi, 
        '<h3 class="project-name">$1</h3>');
      
      // Replace project descriptions
      templateHTML = templateHTML.replace(/<p[^>]*class="[^"]*(?:project-description|description|project-desc)[^"]*"[^>]*>(.*?)<\/p>/gi, 
        '<p class="project-description">$1</p>');
      
      // If no specific project-description found, try to target paragraphs within project divs
      templateHTML = templateHTML.replace(/(<div[^>]*class="project"[^>]*>[\s\S]*?)(<p[^>]*>)(.*?)(<\/p>)/gi, 
        '$1<p class="project-description">$3</p>');
      
      // Replace project images
      templateHTML = templateHTML.replace(/<img[^>]*class="[^"]*(?:project|card)-img[^"]*"[^>]*src="([^"]+)"[^>]*>/gi, 
        '<div class="project-image"><img src="$1" class="w-full h-full object-cover" alt="Project" /></div>');
    }
    
    // Return the HTML template
    return new NextResponse(templateHTML, {
      headers: {
        'Content-Type': 'text/html',
      },
    })
  } catch (error) {
    console.error('Error generating template preview:', error)
    return NextResponse.json(
      { error: 'Failed to generate template preview' },
      { status: 500 }
    )
  }
} 