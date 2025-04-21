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

## Template4 Specific Issues to Avoid

When working with Template4 (or any template), be aware of these specific issues encountered:

1. **Handlebars Template Tag Rendering:** If you see raw template tags like `{{#each skills}}` or `{{/each}}` in the output, it means the replacement logic isn't working properly. Always make specific overrides for each template when changing structure.

2. **CSS Class Inconsistencies:** Pay careful attention to CSS class names in the template HTML vs. your generated code. For example, using `project-img` when the template expects `project-image` will break styling.

3. **Targeted Edits vs. Global Changes:** When fixing template-specific issues, make targeted edits that only affect that template rather than changing global code that might affect other templates.

4. **Variable Redeclaration:** Avoid adding duplicate variable declarations when fixing template-specific sections. If adding specialized handling for a template, check if the variable is already declared elsewhere.

5. **HTML Structure Alignment:** Ensure the HTML structure you're generating exactly matches what the template expects, including the nesting of elements and their classes.

By following these guidelines, you can avoid common pitfalls when editing and extending portfolio templates. 



Dont include the technologies used in the project in the project cards.

## Common Mistakes

Here are specific mistakes that have occurred during template development and maintenance:

### 1. Dual Template Directory Sync Failures

**Problem:** Changes were made to only one of the template directories, causing inconsistencies between preview and actual generation.

**Example:** Template modifications were made to the root `/templates/` directory but not synchronized to the corresponding `/public/templates/` directory.

**Solution:**
- Always check and update both template versions when making any changes
- Use a checklist to verify all changes are synchronized across both directories
- Consider implementing automated sync tools for template changes

### 2. Display Size Inconsistencies

**Problem:** Computer display sizes in templates (especially template2) were too small at 40% width, causing visual issues.

**Example:** Project cards with computer displays appeared too small at 40% width and descriptions did not align properly with the display width.

**Solution:**
- Maintain proportional sizing (50% was the right compromise between too large and too small)
- Ensure that related elements (like description boxes) maintain consistent widths with their parent elements
- Test display sizes across various screen resolutions to ensure they look good at all sizes

### 3. HTML Comment Markers Around Template Tags

**Problem:** HTML comment markers (`<!-- -->`) incorrectly surrounded Handlebars/template closing tags, causing rendering issues.

**Example:** Code like `<!--{{/if}}-->` resulted in the closing comment tag (`-->`) being rendered as `--&gt;` in the final HTML.

**Solution:**
- Never enclose template tags inside HTML comments
- Use template-specific commenting features if provided
- Keep template logic clean and separate from HTML comments
- If you need to comment out template logic, comment out the entire block including opening and closing tags

### 4. CSS Selector Alignment Issues

**Problem:** Selectors for underline decorations used absolute positioning that didn't work consistently across elements.

**Example:** The `.section-title::after` pseudo-element used `left: 0` which caused underlines to align left instead of center.

**Solution:**
- Use percentage-based positioning for decorative elements
- Test alignment across different text lengths and container widths
- Consider using flexbox or grid for more predictable alignment
- Apply transforms like `translateX(-50%)` when centering is needed

### 5. Restrictive Content Widths

**Problem:** Fixed width constraints on content elements limited text display inappropriately.

**Example:** Bio text in the About Me section was limited to `max-width: 500px` which was too restrictive.

**Solution:**
- Use relative units and flexible sizing where appropriate
- Add proper text wrapping styles (`overflow-wrap: break-word; word-wrap: break-word;`)
- Test content containers with various text lengths
- Consider responsive approaches instead of fixed widths

### 6. Unused Template Sections

**Problem:** Templates contained sections that weren't needed or didn't fit the intended design.

**Example:** An "interests" section was included in a template but wasn't necessary for the portfolio display.

**Solution:**
- Regularly review templates for unnecessary or redundant sections
- Remove unused sections completely rather than hiding them with CSS
- Ensure removal of sections doesn't break template structure or responsive behavior

### 7. Script Reference Errors

**Problem:** HTML templates referenced incorrect JavaScript file names.

**Example:** Templates referenced `script.js` when the actual implementation file was named `main.js`.

**Solution:**
- Maintain consistent file naming conventions across templates
- Update all references when renaming files
- Test that all script references resolve correctly
- Consider using relative paths that work in both development and production

By being aware of these specific mistakes, you can prevent them from recurring in future template development and maintenance work.