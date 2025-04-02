/**
 * Advanced Web Scraper with LLM Integration
 * IFrame Module - Handles IFrame-based content access for same-origin policy bypass
 * 
 * WARNING: IFrame access is limited by X-Frame-Options headers and Content Security Policy of target sites.
 * Many sites block being loaded in iframes.
 */

// This module is responsible for handling IFrame-based content access

/**
 * Fetch data using an IFrame
 * @param {string} url - The URL to fetch
 * @returns {Promise<string>} A promise that resolves with the HTML content of the IFrame
 */
async function fetchWithIframe(url) {
    return new Promise((resolve, reject) => {
        // Create iframe element
        const iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        
        // Set timeout
        const timeout = setTimeout(() => {
            cleanup();
            reject(new Error('iframe request timed out'));
        }, 30000);
        
        // Cleanup function
        const cleanup = () => {
            if (iframe.parentNode) iframe.parentNode.removeChild(iframe);
            clearTimeout(timeout);
        };
        
        // Handle load event
        iframe.onload = () => {
            try {
                // Try to access iframe content (may fail due to same-origin policy)
                const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
                const html = iframeDoc.documentElement.outerHTML;
                
                cleanup();
                resolve(html);
            } catch (error) {
                cleanup();
                reject(new Error('Cannot access iframe content due to same-origin policy'));
            }
        };
        
        // Handle error event
        iframe.onerror = () => {
            cleanup();
            reject(new Error('iframe request failed'));
        };
        
        // Set iframe source and append to document
        iframe.src = url;
        document.body.appendChild(iframe);
    });
}

// Export the function
window.fetchWithIframe = fetchWithIframe;
