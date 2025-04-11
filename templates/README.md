# Portfolio Templates

This directory contains the portfolio templates used by the PortfolioMaker application. Each template is a self-contained directory with HTML, CSS, and JavaScript files that define the structure and appearance of a portfolio.

## Directory Structure

Each template follows this structure:
```
templates/
  ├── template1/
  │   ├── index.html      # Main template file with placeholders
  │   ├── css/
  │   │   └── styles.css  # Styles for the template
  │   ├── js/
  │   │   └── script.js   # JavaScript for the template (e.g., progressive disclosure)
  │   └── preview.html    # Preview version for template selection
  ├── template2/
  │   └── ...
  └── ...
```

## How Templates Work

Templates use a simple placeholder system with `{{placeholder}}` syntax. These placeholders are replaced with actual portfolio data when a portfolio is generated.

### Available Placeholders

- Basic information:
  - `{{name}}` - The portfolio owner's name
  - `{{title}}` - The professional title
  - `{{about}}` - The about me section
  - `{{initials}}` - Generated initials (e.g., "JD" for "John Doe")
  - `{{currentYear}}` - The current year (for copyright notices)

- CV link (with conditional rendering):
  ```html
  {{#if hasCv}}
  <a href="{{cvUrl}}">Download CV</a>
  {{/if}}
  ```

- Arrays (using each loops):
  ```html
  {{#each skills}}
  <div class="skill-item">
    <div class="skill-name">{{name}}</div>
  </div>
  {{/each}}
  ```

- Similarly for experience, education, and projects sections.

## Template Design Requirements

All templates should:

1. Be fully responsive
2. Implement progressive disclosure design (sections reveal as the user scrolls)
3. Include all portfolio sections (about, skills, experience, education, projects)
4. Use semantic HTML5 markup
5. Be cross-browser compatible

## How to Create a New Template

1. Create a new directory under `templates/` (e.g., `template7/`)
2. Create the following files:
   - `index.html` - Main template with placeholders
   - `css/styles.css` - Stylesheet
   - `js/script.js` - JavaScript for interactions
   - `preview.html` - A simplified preview version

3. Ensure your template correctly uses all the required placeholders
4. Test your template with different sets of data (varying amounts of skills, projects, etc.)
5. Update the dashboard template selection UI to include your new template

## Single-Page Progressive Disclosure

All templates follow a single-page progressive disclosure pattern where:

1. The portfolio loads with an initial visible section (typically about)
2. As the user scrolls, new sections are revealed with smooth animations
3. The navigation links allow jumping to specific sections
4. The active section is highlighted in the navigation

This provides a modern, engaging user experience while making all portfolio information accessible.

## Customization

Templates are designed to be visually distinct but share a common foundation. Each template has its own color scheme, typography, and layout that's appropriate for different industries and personal styles.

When extending the template system, consider adding customization options such as:
- Color scheme selection
- Alternate section layouts
- Typography options
- Animation preferences 