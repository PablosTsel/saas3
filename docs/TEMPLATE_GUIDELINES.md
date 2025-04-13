# Template Development Guidelines

This document provides comprehensive guidelines for creating and maintaining templates in our portfolio generation system. Following these rules will help avoid common issues and ensure templates work correctly with our backend.

## Template Structure

Each template consists of three main files:

1. **`index.html`** - The HTML structure with Handlebars-style placeholders
2. **`css/styles.css`** - The CSS styling for the template
3. **`js/script.js`** - The JavaScript functionality for the template

Templates are stored in the `templates/template{N}/` directory, where `{N}` is the template number.

## Handlebars Syntax Rules

### Basic Placeholders

Use double curly braces for simple variables:

```html
<h1>{{name}}</h1>
<p>{{about}}</p>
```

### ⚠️ IMPORTANT: Never Use Handlebars Variables in CSS Properties

NEVER use Handlebars placeholders directly in CSS properties within HTML:

```html
<!-- ❌ BAD - Will cause CSS parsing errors -->
<div class="skill-progress" style="width: {{level}}"></div>

<!-- ✅ GOOD - Use data attributes instead -->
<div class="skill-progress" data-level="{{level}}"></div>
```

Then process these data attributes with JavaScript:

```javascript
function applySkillLevels() {
    const skillProgressBars = document.querySelectorAll('.skill-progress[data-level]');
    skillProgressBars.forEach(bar => {
        const level = bar.getAttribute('data-level');
        if (level) {
            bar.style.width = level;
        }
    });
}
```

### Conditionals

Use Handlebars-style conditional blocks:

```html
{{#if profilePictureUrl}}
    <img src="{{profilePictureUrl}}" alt="{{name}}">
{{else}}
    <div class="initials-avatar">{{initials}}</div>
{{/if}}
```

### Loops/Iterations

Use Handlebars-style each blocks for iterations:

```html
{{#each skills}}
<div class="skill-item">
    <span class="skill-name">{{name}}</span>
    <span class="skill-percentage">{{level}}</span>
</div>
{{/each}}
```

## Core Template Variables

The following variables are available in all templates:

| Variable | Description | Default |
|----------|-------------|---------|
| `name` | User's display name | "" |
| `fullName` | User's full name | Same as `name` |
| `title` | Professional title | "" |
| `about` | About text | "" |
| `email` | Email address | "" |
| `phone` | Phone number | "" |
| `profilePictureUrl` | URL to profile picture | null |
| `hasCv` | Boolean indicating if CV exists | false |
| `cvUrl` | URL to CV download | "" |
| `initials` | User's initials (auto-generated) | "P" |
| `currentYear` | Current year (for copyright) | Current year |

## Collection Variables

The following collection variables are available for iteration:

| Collection | Item Structure | Notes |
|------------|----------------|-------|
| `skills` | `{name, level}` | Level is typically percentage (e.g., "90%") |
| `experience` | `{company, position, description, period}` | Description may include newlines |
| `education` | `{institution, degree, period}` | May be empty in some templates |
| `projects` | `{name, description, imageUrl}` | Images have fallbacks |

## Backend Integration

### Handling Missing Data

Always provide fallbacks for missing data:

```html
<span class="skill-name">{{name || ''}}</span>
<span class="skill-percentage">{{level || '90%'}}</span>
```

In the backend code, similar fallbacks are implemented:

```typescript
htmlContent = htmlContent.replace(/{{name}}/g, portfolioData.name || '')
                       .replace(/{{title}}/g, portfolioData.title || '')
```

### Contact Information Display

For contact information like email and phone:

1. Always check if the field exists before displaying it
2. The backend will automatically hide the contact section if the field is empty:

```typescript
// If email is not present, hide the email section
if (!portfolioData.email) {
  htmlContent = htmlContent.replace(
    /<p class="contact-text">You can reach out to me at[\s\S]*?<\/p>/,
    ''
  );
}
```

## Common Mistakes to Avoid

1. **CSS Parsing Errors**: Never use Handlebars variables in CSS properties
2. **Missing Fallbacks**: Always provide fallbacks for all variables
3. **Improper Nesting**: Ensure proper nesting of Handlebars sections
4. **Forgetting Conditionals**: Use conditionals for optional content
5. **Direct DOM Manipulation**: Initialize DOM elements only after they exist
6. **Unclosed Tags**: Ensure all HTML tags are properly closed

## Testing Templates

Before submitting a new template, ensure:

1. **Renders with Missing Data**: Test rendering with empty fields
2. **Responsive Design**: Test on different screen sizes
3. **JavaScript Errors**: Check console for any JS errors
4. **CSS Validation**: Validate CSS for syntax errors
5. **Data Binding**: Test with different data values
6. **Conditional Sections**: Test with both conditions (true/false)

## Field Extraction

For fields like phone numbers and emails that are extracted from CVs:

1. **Normalize Phone Numbers**: Ensure phone numbers are in a consistent format
2. **Email Validation**: Validate email addresses using proper regex
3. **Default Values**: Provide sensible defaults when extraction fails
4. **Debugging**: Add console logs for troubleshooting

### Phone Number Extraction

```typescript
// Regular expressions for various phone number formats
const phonePatterns = [
  // International format
  /(?:\+|00)[1-9]\d{0,2}[\s.-]?\(?\d{1,4}\)?[\s.-]?\d{1,4}[\s.-]?\d{1,4}[\s.-]?\d{1,9}/g,
  
  // Spanish format
  /\+34[\s.-]?\d{3}[\s.-]?\d{2}[\s.-]?\d{2}[\s.-]?\d{2}/g,
  
  // Look near keywords like "phone", "mobile", "contact", etc.
];
```

### Email Extraction

```typescript
// Basic email regex pattern
const emailPattern = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;

// Look near keywords like "email", "mail", "contact", etc.
```

## Firebase Integration

When creating or updating portfolio data:

1. **Clean Data**: Remove File objects before saving to Firestore
2. **Validation**: Validate data before saving
3. **Error Handling**: Implement proper error handling
4. **Updates**: Use atomic updates when possible
5. **Console Logs**: Add helpful console logs for debugging

## Debugging

Add debugging output for troubleshooting:

```typescript
console.log(`DEBUG - Email value: "${portfolioData.email}", Phone value: "${portfolioData.phone}"`);
```

## Final Checklist

Before deploying a new template:

1. ✅ HTML is valid and well-formed
2. ✅ No Handlebars variables in CSS properties
3. ✅ All required sections are present
4. ✅ Responsive design works on all devices
5. ✅ JavaScript initializes properly
6. ✅ Fallbacks for all optional data
7. ✅ Console is free of errors
8. ✅ All HTML entities properly escaped
9. ✅ All links have proper href attributes
10. ✅ Phone and email fields display correctly 