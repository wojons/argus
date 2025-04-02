/**
 * Advanced Web Scraper with LLM Integration
 * Scraper Module - Handles data extraction from crawled pages
 */

class Scraper {
    /**
     * Create a new Scraper instance
     * @param {Object} config - Configuration options
     */
    constructor(config = {}) {
        this.config = {
            extractText: true,
            extractImages: false,
            extractLinks: false,
            extractVideos: false,
            includeHeaders: false,
            extractCss: false,
            extractHtml: false,
            cssSelector: '',
            xpathSelector: '',
            enableLlm: false,
            llmProvider: 'openrouter',
            llmModel: 'openai/gpt-3.5-turbo',
            llmPrompt: '',
            ...config
        };
    }
    
    /**
     * Extract data from a given HTML document
     * @param {string} html - The HTML content to extract data from
     * @param {string} url - The URL of the page (for context)
     * @returns {Promise<Object>} A promise that resolves with the extracted data
     */
    async extractData(html, url) {
        try {
            // Create a DOM parser
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            
            let extractedData = {};
            
            // Extract data based on configuration
            if (this.config.extractText) {
                extractedData.text = this.extractText(doc);
            }
            if (this.config.extractImages) {
                extractedData.images = this.extractImages(doc, url);
            }
            if (this.config.extractLinks) {
                extractedData.links = this.extractLinks(doc, url);
            }
            if (this.config.extractVideos) {
                extractedData.videos = this.extractVideos(doc, url);
            }
            if (this.config.extractCss) {
                extractedData.css = this.extractCss(doc);
            }
            if (this.config.extractHtml) {
                extractedData.html = html;
            }
            
            // Apply custom CSS selector
            if (this.config.cssSelector) {
                extractedData.customCss = this.extractWithCssSelector(doc, this.config.cssSelector);
            }
            
            // Apply custom XPath selector
            if (this.config.xpathSelector) {
                extractedData.customXPath = this.extractWithXPath(doc, this.config.xpathSelector);
            }
            
            // Apply LLM if enabled
            if (this.config.enableLlm) {
                extractedData.llm = await this.applyLlm(extractedData.text, url);
            }
            
            return extractedData;
        } catch (error) {
            console.error(`Error extracting data from ${url}: ${error.message}`);
            throw error;
        }
    }
    
    /**
     * Extract text content from a document
     * @param {Document} doc - The document to extract text from
     * @returns {string} The extracted text content
     */
    extractText(doc) {
        let text = doc.body.textContent || '';
        
        // Remove extra whitespace
        text = text.replace(/\s+/g, ' ').trim();
        
        return text;
    }
    
    /**
     * Extract image URLs from a document
     * @param {Document} doc - The document to extract image URLs from
     * @param {string} baseUrl - The base URL for resolving relative URLs
     * @returns {Array} An array of image URLs
     */
    extractImages(doc, baseUrl) {
        const images = [];
        const imgElements = doc.querySelectorAll('img[src]');
        
        imgElements.forEach(img => {
            try {
                // Get the src attribute
                let src = img.getAttribute('src');
                
                // Resolve relative URLs
                const absoluteUrl = new URL(src, baseUrl).href;
                
                // Add to images array
                images.push(absoluteUrl);
            } catch (error) {
                console.warn(`Invalid image URL: ${img.getAttribute('src')}`);
            }
        });
        
        return images;
    }
    
    /**
     * Extract links from a document
     * @param {Document} doc - The document to extract links from
     * @param {string} baseUrl - The base URL for resolving relative URLs
     * @returns {Array} An array of link objects (text and href)
     */
    extractLinks(doc, baseUrl) {
        const links = [];
        const aElements = doc.querySelectorAll('a[href]');
        
        aElements.forEach(a => {
            try {
                // Get the href attribute
                let href = a.getAttribute('href');
                
                // Resolve relative URLs
                const absoluteUrl = new URL(href, baseUrl).href;
                
                // Add to links array
                links.push({
                    text: a.textContent.trim(),
                    href: absoluteUrl
                });
            } catch (error) {
                console.warn(`Invalid link URL: ${a.getAttribute('href')}`);
            }
        });
        
        return links;
    }
    
    /**
     * Extract video URLs from a document
     * @param {Document} doc - The document to extract video URLs from
     * @param {string} baseUrl - The base URL for resolving relative URLs
     * @returns {Array} An array of video URLs
     */
    extractVideos(doc, baseUrl) {
        const videos = [];
        const videoElements = doc.querySelectorAll('video source[src]');
        
        videoElements.forEach(video => {
            try {
                // Get the src attribute
                let src = video.getAttribute('src');
                
                // Resolve relative URLs
                const absoluteUrl = new URL(src, baseUrl).href;
                
                // Add to videos array
                videos.push(absoluteUrl);
            } catch (error) {
                console.warn(`Invalid video URL: ${video.getAttribute('src')}`);
            }
        });
        
        return videos;
    }
    
    /**
     * Extract CSS from a document
     * @param {Document} doc - The document to extract CSS from
     * @returns {string} The extracted CSS
     */
    extractCss(doc) {
        let css = '';
        const styleElements = doc.querySelectorAll('style');
        
        styleElements.forEach(style => {
            css += style.textContent + '\n';
        });
        
        return css;
    }
    
    /**
     * Extract content using a CSS selector
     * @param {Document} doc - The document to extract content from
     * @param {string} selector - The CSS selector to use
     * @returns {string} The extracted content
     */
    extractWithCssSelector(doc, selector) {
        try {
            const element = doc.querySelector(selector);
            return element ? element.textContent.trim() : '';
        } catch (error) {
            console.error(`Invalid CSS selector: ${selector}`);
            return '';
        }
    }
    
    /**
     * Extract content using an XPath expression
     * @param {Document} doc - The document to extract content from
     * @param {string} xpath - The XPath expression to use
     * @returns {string} The extracted content
     */
    extractWithXPath(doc, xpath) {
        try {
            const result = doc.evaluate(
                xpath,
                doc,
                null,
                XPathResult.STRING_TYPE,
                null
            );
            return result.stringValue.trim();
        } catch (error) {
            console.error(`Invalid XPath expression: ${xpath}`);
            return '';
        }
    }
    
    /**
     * Apply LLM to the extracted text
     * @param {string} text - The text to apply the LLM to
     * @param {string} url - The URL of the page (for context)
     * @returns {Promise<string>} A promise that resolves with the LLM response
     */
    async applyLlm(text, url) {
        if (!text) {
            return 'No text to analyze.';
        }
        
        // Get LLM provider and model
        const provider = this.config.llmProvider;
        const model = this.config.llmModel;
        const prompt = this.config.llmPrompt;
        
        // Log message
        console.log(`Applying LLM (${provider} ${model}) to ${url}`);
        
        try {
            // Send to LLM
            const response = await sendToLlm(text, provider, model, prompt);
            return response;
        } catch (error) {
            console.error(`Error from LLM: ${error.message}`);
            return `Error: ${error.message}`;
        }
    }
}

// Export the Scraper class
window.WebScraper = window.WebScraper || {};
window.WebScraper.Scraper = Scraper;
