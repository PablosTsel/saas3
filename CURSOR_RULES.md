# Template Editing Guidelines

## Common Pitfalls and Best Practices

When editing or modifying portfolio templates in this application, please be mindful of the following issues that can cause problems:

### 1. Template Override Issues

**Problem:** Different templates may have overlapping code sections with conditional logic that can cause unexpected overrides.

**Example:** In our case, template2's laptop-style project cards were being overridden by a generic "else" clause at the end of the file which applied a different style.

**Solution:** 
- Always check for existing template-specific code before adding new template implementations
- Use explicit conditionals like `if (templateId === 'template2')` instead of catch-all `else` blocks
- Add exclusion conditions: `else if (templateId !== 'template2')` when using fall-back code

### 2. CSS Specificity Issues

**Problem:** CSS specificity rules can cause styles to be unexpectedly overridden.

**Best Practices:**
- Use template-specific CSS classes (e.g., `.template2 .project-card`)
- Be cautious with !important flags which can make debugging difficult
- Maintain a consistent specificity pattern throughout your CSS
- Be careful with global styles that might affect all templates

### 3. Responsive Design Considerations

**Problem:** Template changes may break responsive behavior on smaller screens.

**Best Practices:**
- Test all changes at multiple screen sizes
- Remember to update media queries when changing core component sizing
- Maintain proportion relationships when resizing elements (like we did with the laptop displays)
- Don't forget to update padding, margins, and spacing along with width/height

### 4. File Structure and Templating Logic

**Problem:** The portfolio generation code uses a mix of server-side templating and client-side rendering.

**Best Practices:**
- Be aware of where template generation happens (in route.ts files)
- Understand how conditional template code works before modifying it
- Check both template HTML files AND the JavaScript code that generates dynamic content
- Keep CSS in the appropriate files for each template

### 5. Dual Template Folder Structure

**Problem:** Templates exist in two separate locations that both need to be kept in sync:
1. `/templates/template3/` - Source templates used by the server for portfolio generation 
2. `/public/templates/template3/` - Preview templates used for thumbnails and frontend display

**Best Practices:**
- Always edit the source templates in the root `/templates/` directory first
- After making changes to source templates, sync them to the `/public/templates/` directory
- Be aware that changes to only the public templates won't affect portfolio generation
- If a user reports changes not showing up, check both locations to ensure they're in sync
- Any new template should be added to both locations with identical structure

### 6. Image and Asset Handling

**Problem:** Templates may have hardcoded image paths or placeholder logic that needs to be preserved.

**Best Practices:**
- Preserve image fallback patterns (onerror handlers)
- Don't remove placeholder image logic
- Be careful when changing image dimensions as they may affect aspect ratios

### 7. HTML Structure Integrity

**Problem:** Breaking the HTML structure can cause layout and functional issues.

**Best Practices:**
- Maintain proper nesting when editing HTML templates
- Don't remove important semantic elements
- Be careful with elements that have JavaScript event handlers attached

### 8. Template-specific Features

**Problem:** Each template may have unique features that require special handling.

**Example:** Template2 has laptop-style project cards that require specific CSS and HTML structure.

**Best Practices:**
- Understand the special features of each template before modifying
- Preserve unique visual elements that define each template's identity
- Test template-specific interactions after making changes

## Testing Guidelines

After making changes to templates:

1. **Visual Testing:** Check template appearance at multiple screen sizes
2. **Functional Testing:** Ensure all links, hover effects, and interactions work
3. **Cross-template Testing:** Make sure changes to shared code don't affect other templates
4. **Content Variation Testing:** Test with different amounts of content (many/few projects, long/short descriptions)

## Development Process

When developing new features for templates:

1. **Isolate Changes:** Work on one template at a time
2. **Use Version Control:** Commit changes frequently with descriptive messages
3. **Document Special Cases:** Add comments for any unusual handling or workarounds
4. **Consider Reusability:** Design components that can be shared across templates where appropriate
5. **Avoid Magic Numbers:** Use CSS variables for values that might need to be adjusted

By following these guidelines, you can avoid common pitfalls when editing and extending portfolio templates. 