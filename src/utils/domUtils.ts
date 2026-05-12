/**
 * DOM operation utility class
 * Provides safe DOM operation methods, avoiding unsafe APIs like innerHTML
 */

/**
 * Safely set element content, avoiding innerHTML
 * Convert HTML string to DOM nodes and add them to the target element
 * @param targetEl Target element
 * @param htmlContent HTML content string
 */
export function setElementContent(targetEl: HTMLElement, htmlContent: string): void {
    // Clear target element
    while (targetEl.firstChild) {
        targetEl.removeChild(targetEl.firstChild);
    }
    
    // Safely parse HTML content using DOMParser
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');
    
    // Safely add parsed content
    Array.from(doc.body.childNodes).forEach(node => {
        targetEl.appendChild(document.importNode(node, true));
    });
}

/**
 * Split text content into lines and safely add to target element
 * @param targetEl Target element
 * @param textContent Text content to add
 */
export function setTextContentByLines(targetEl: HTMLElement, textContent: string): void {
    // Clear target element
    while (targetEl.firstChild) {
        targetEl.removeChild(targetEl.firstChild);
    }
    
    // Split content by lines
    const lines = textContent.split('\n');
    
    // Create a div for each line
    lines.forEach((line, index) => {
        const lineEl = document.createElement('div');
        lineEl.textContent = line;
        targetEl.appendChild(lineEl);
        
        // If not the last line, add a newline character
        if (index < lines.length - 1) {
            targetEl.appendChild(document.createElement('br'));
        }
    });
}

/**
 * Create button with icon
 * @param container Parent container
 * @param iconName Icon name
 * @param buttonText Button text
 * @param cssClasses Additional CSS classes
 * @returns Button element
 */
export function createIconButton(
    container: HTMLElement,
    iconName: string,
    buttonText: string,
    cssClasses: string[] = []
): HTMLButtonElement {
    // Create button element
    const button = document.createElement('button');
    button.textContent = buttonText;
    
    // Add CSS classes
    if (cssClasses.length > 0) {
        button.classList.add('icon-button', ...cssClasses);
    } else {
        button.classList.add('icon-button');
    }
    
    // Add icon
    const icon = document.createElement('span');
    icon.classList.add('svg-icon', `lucide-${iconName}`);
    button.prepend(icon);
    
    // Add to container
    container.appendChild(button);
    
    return button;
}

/**
 * Create text element
 * @param container Parent container
 * @param text Text content
 * @param tagType Tag type, default is span
 * @param cssClasses Additional CSS classes
 * @returns Created element
 */
export function createTextElement(
    container: HTMLElement,
    text: string,
    tagType: 'span' | 'div' | 'p' = 'span',
    cssClasses: string[] = []
): HTMLElement {
    const element = document.createElement(tagType);
    element.textContent = text;
    
    // Add CSS classes
    if (cssClasses.length > 0) {
        element.classList.add(...cssClasses);
    }
    
    container.appendChild(element);
    return element;
}

/**
 * Remove all inline styles from element
 * @param element Target element
 * @param recursive Whether to handle child elements recursively
 */
export function removeInlineStyles(element: HTMLElement, recursive: boolean = true): void {
    // Remove current element's inline style
    element.removeAttribute('style');
    
    // If recursive processing is needed
    if (recursive && element.children.length > 0) {
        // Convert HTMLCollection to array for processing
        Array.from(element.children).forEach(child => {
            if (child instanceof HTMLElement) {
                removeInlineStyles(child, true);
            }
        });
    }
}
 