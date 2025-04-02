/**
 * Advanced Web Scraper with LLM Integration
 * Input Module - Handles UI elements for URL input, crawl configuration, and extraction options
 */

// This module is responsible for handling user input and configuration

/**
 * Get the current scraper configuration from the UI
 */
function getScraperConfig() {
    return {
        maxDepth: parseInt(document.getElementById('max-depth').value, 10),
        crawlDelay: parseInt(document.getElementById('crawl-delay').value, 10),
        maxRetries: parseInt(document.getElementById('max-retries').value, 10),
        maxPages: parseInt(document.getElementById('max-pages').value, 10),
        respectRobots: document.getElementById('respect-robots').checked,
        followExternal: document.getElementById('follow-external').checked,
        useSitemap: document.getElementById('use-sitemap').checked,
        includePattern: document.getElementById('include-pattern').value,
        excludePattern: document.getElementById('exclude-pattern').value,
        extractText: document.getElementById('extract-text').checked,
        extractImages: document.getElementById('extract-images').checked,
        extractLinks: document.getElementById('extract-links').checked,
        extractVideos: document.getElementById('extract-videos').checked,
        includeHeaders: document.getElementById('include-headers').checked,
        extractCss: document.getElementById('extract-css').checked,
        extractHtml: document.getElementById('extract-html').checked,
        cssSelector: document.getElementById('css-selector').value,
        xpathSelector: document.getElementById('xpath-selector').value,
        enableLlm: document.getElementById('enable-llm').checked,
        llmProvider: document.getElementById('llm-provider').value,
        llmModel: document.getElementById('openrouter-model').value,
        llmPrompt: document.getElementById('llm-prompt').value,
        enableJsonp: document.getElementById('enable-jsonp').checked,
        enableIframe: document.getElementById('enable-iframe').checked,
        enableProxy: document.getElementById('enable-proxy').checked,
        proxyUrl: document.getElementById('proxy-url').value,
        concurrentRequests: parseInt(document.getElementById('concurrent-requests').value, 10),
        requestTimeout: parseInt(document.getElementById('request-timeout').value, 10)
    };
}

// Export the function
window.getScraperConfig = getScraperConfig;
