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
 