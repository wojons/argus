/**
 * Advanced Web Scraper with LLM Integration
 * Crawler Module - Handles web crawling functionality
 */

// Crawler class
class Crawler {
    /**
     * Create a new Crawler instance
     * @param {Object} config - Configuration options
     */
    constructor(config = {}) {
        // Default configuration
        this.config = {
            maxDepth: 3,
            maxPages: 100,
            crawlDelay: 1000,
            maxRetries: 3,
            respectRobots: true,
            followExternal: false,
            useSitemap: true,
            includePattern: '',
            excludePattern: '',
            concurrentRequests: 3,
            requestTimeout: 30000,
            ...config
        };
        
        // Initialize state
        this.reset();
        
        // Bind methods
        this.start = this.start.bind(this);
        this.stop = this.stop.bind(this);
        this.pause = this.pause.bind(this);
        this.resume = this.resume.bind(this);
        this.processUrl = this.processUrl.bind(this);
        this.extractLinks = this.extractLinks.bind(this);
        this.fetchRobotsTxt = this.fetchRobotsTxt.bind(this);
        this.fetchSitemap = this.fetchSitemap.bind(this);
        this.isAllowed = this.isAllowed.bind(this);
        this.shouldCrawl = this.shouldCrawl.bind(this);
    }
    
    /**
     * Reset the crawler state
     */
    reset() {
        this.queue = [];
        this.visited = new Set();
        this.inProgress = new Set();
        this.robotsTxt = null;
        this.disallowedPaths = [];
        this.sitemapUrls = [];
        this.baseUrl = '';
        this.baseUrlObj = null;
        this.running = false;
        this.paused = false;
        this.activeRequests = 0;
        this.pagesProcessed = 0;
        this.totalPages = 0;
        this.startTime = null;
        this.results = [];
        this.errors = [];
    }
    
    /**
     * Start crawling from a given URL
     * @param {string} url - The starting URL
     * @returns {Promise} A promise that resolves when crawling is complete
     */
    async start(url) {
        if (this.running) {
            throw new Error('Crawler is already running');
        }
        
        // Reset state
        this.reset();
        
        // Set running flag
        this.running = true;
        this.paused = false;
        this.startTime = Date.now();
        
        // Parse and normalize the base URL
        try {
            this.baseUrlObj = new URL(url);
            this.baseUrl = this.baseUrlObj.origin;
            
            // Log start
            this.log(`Starting crawl from ${url}`, 'info');
            this.log(`Base URL: ${this.baseUrl}`, 'info');
            
            // Fetch robots.txt if enabled
            if (this.config.respectRobots) {
                await this.fetchRobotsTxt();
            }
            
            // Fetch sitemap if enabled
            if (this.config.useSitemap) {
                await this.fetchSitemap();
                
                // Add sitemap URLs to the queue
                if (this.sitemapUrls.length > 0) {
                    this.log(`Found ${this.sitemapUrls.length} URLs in sitemap`, 'info');
                    
                    // Add sitemap URLs to the queue with depth 0
                    this.sitemapUrls.forEach(sitemapUrl => {
                        this.queue.push({
                            url: sitemapUrl,
                            depth: 0,
                            from: 'sitemap'
                        });
                    });
                    
                    // Update total pages estimate
                    this.totalPages = this.sitemapUrls.length;
                    this.updateProgress();
                }
            }
            
            // Add the starting URL to the queue if not already added via sitemap
            if (!this.queue.some(item => item.url === url)) {
                this.queue.push({
                    url,
                    depth: 0,
                    from: 'start'
                });
                
                // Update total pages estimate
                this.totalPages++;
                this.updateProgress();
            }
            
            // Start processing the queue
            await this.processQueue();
            
            // Log completion
            const duration = ((Date.now() - this.startTime) / 1000).toFixed(2);
            this.log(`Crawling completed in ${duration}s. Processed ${this.pagesProcessed} pages.`, 'info');
            
            // Return results
            return {
                results: this.results,
                errors: this.errors,
                stats: {
                    pagesProcessed: this.pagesProcessed,
                    duration: parseFloat(duration),
                    successRate: this.pagesProcessed > 0 ? 
                        ((this.pagesProcessed - this.errors.length) / this.pagesProcessed * 100).toFixed(2) + '%' : 
                        '0%'
                }
            };
        } catch (error) {
            this.log(`Error starting crawler: ${error.message}`, 'error');
            throw error;
        } finally {
            this.running = false;
        }
    }
    
    /**
     * Process the URL queue
     * @returns {Promise} A promise that resolves when the queue is empty or max pages reached
     */
    async processQueue() {
        // Process until the queue is empty or we've reached the max pages
        while (
            this.running && 
            this.queue.length > 0 && 
            this.pagesProcessed < this.config.maxPages &&
            this.activeRequests < this.config.concurrentRequests
        ) {
            // Check if paused
            if (this.paused) {
                await new Promise(resolve => setTimeout(resolve, 100));
                continue;
            }
            
            // Get the next URL from the queue
            const queueItem = this.queue.shift();
            
            // Skip if already visited or in progress
            if (this.visited.has(queueItem.url) || this.inProgress.has(queueItem.url)) {
                continue;
            }
            
            // Check if we should crawl this URL
            if (!this.shouldCrawl(queueItem.url, queueItem.depth)) {
                continue;
            }
            
            // Mark as in progress
            this.inProgress.add(queueItem.url);
            this.activeRequests++;
            
            // Process the URL (don't await to allow concurrent processing)
            this.processUrl(queueItem)
                .catch(error => {
                    this.log(`Error processing ${queueItem.url}: ${error.message}`, 'error');
                    this.errors.push({
                        url: queueItem.url,
                        error: error.message,
                        from: queueItem.from
                    });
                })
                .finally(() => {
                    // Mark as no longer in progress
                    this.inProgress.delete(queueItem.url);
                    this.activeRequests--;
                    
                    // Continue processing the queue
                    if (this.running && !this.paused) {
                        this.processQueue();
                    }
                });
            
            // If we have reached the concurrent request limit, wait for some to complete
            if (this.activeRequests >= this.config.concurrentRequests) {
                await new Promise(resolve => setTimeout(resolve, 100));
            }
        }
        
        // If there are still active requests, wait for them to complete
        while (this.activeRequests > 0) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        // If we're still running and not paused, and there are items in the queue,
        // continue processing (this can happen if new URLs were added while waiting)
        if (this.running && !this.paused && this.queue.length > 0 && this.pagesProcessed < this.config.maxPages) {
            return this.processQueue();
        }
    }
    
    /**
     * Process a single URL
     * @param {Object} queueItem - The queue item containing the URL to process
     * @returns {Promise} A promise that resolves when the URL is processed
     */
    async processUrl(queueItem) {
        const { url, depth, from } = queueItem;
        
        // Check if we should respect the crawl delay
        if (this.config.crawlDelay > 0 && this.pagesProcessed > 0) {
            await new Promise(resolve => setTimeout(resolve, this.config.crawlDelay));
        }
        
        // Log the URL being processed
        this.log(`Processing ${url} (depth: ${depth})`, 'info');
        
        try {
            // Check if URL is allowed by robots.txt
            if (this.config.respectRobots && !this.isAllowed(url)) {
                this.log(`Skipping ${url} (disallowed by robots.txt)`, 'info');
                return;
            }
            
            // Fetch the URL
            const response = await this.fetchWithRetry(url);
            
            // Check if response is HTML
            const contentType = response.headers.get('content-type') || '';
            if (!contentType.includes('text/html')) {
                this.log(`Skipping ${url} (not HTML: ${contentType})`, 'info');
                return;
            }
            
            // Get the HTML content
            const html = await response.text();
            
            // Create a DOM parser
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            
            // Extract links
            if (depth < this.config.maxDepth) {
                const links = this.extractLinks(doc, url);
                
                // Add new links to the queue
                links.forEach(link => {
                    // Skip if already visited or in queue
                    if (this.visited.has(link) || this.inProgress.has(link) || 
                        this.queue.some(item => item.url === link)) {
                        return;
                    }
                    
                    // Add to queue
                    this.queue.push({
                        url: link,
                        depth: depth + 1,
                        from: url
                    });
                    
                    // Update total pages estimate
                    this.totalPages++;
                    this.updateProgress();
                });
            }
            
            // Mark as visited
            this.visited.add(url);
            this.pagesProcessed++;
            
            // Update progress
            this.updateProgress();
            
            // Add to results
            this.results.push({
                url,
                depth,
                from,
                title: doc.title,
                html,
                timestamp: new Date().toISOString()
            });
            
            return {
                url,
                success: true
            };
        } catch (error) {
            // Log error
            this.log(`Error processing ${url}: ${error.message}`, 'error');
            
            // Mark as visited to avoid retrying
            this.visited.add(url);
            this.pagesProcessed++;
            
            // Update progress
            this.updateProgress();
            
            // Rethrow the error
            throw error;
        }
    }
    
    /**
     * Extract links from a document
     * @param {Document} doc - The document to extract links from
     * @param {string} baseUrl - The base URL for resolving relative links
     * @returns {Array} An array of absolute URLs
     */
    extractLinks(doc, baseUrl) {
        const links = [];
        const anchors = doc.querySelectorAll('a[href]');
        
        // Convert NodeList to Array and extract href attributes
        Array.from(anchors).forEach(anchor => {
            try {
                // Get the href attribute
                let href = anchor.getAttribute('href');
                
                // Skip empty, javascript:, mailto:, tel:, etc.
                if (!href || href.startsWith('javascript:') || href.startsWith('mailto:') || 
                    href.startsWith('tel:') || href.startsWith('#')) {
                    return;
                }
                
                // Resolve relative URLs
                const absoluteUrl = new URL(href, baseUrl).href;
                
                // Check if it's an external link
                const urlObj = new URL(absoluteUrl);
                const isExternal = urlObj.origin !== this.baseUrl;
                
                // Skip external links if not configured to follow them
                if (isExternal && !this.config.followExternal) {
                    return;
                }
                
                // Add to links array
                links.push(absoluteUrl);
            } catch (error) {
                // Skip invalid URLs
                this.log(`Invalid URL: ${anchor.getAttribute('href')}`, 'warning');
            }
        });
        
        return links;
    }
    
    /**
     * Fetch robots.txt and parse disallowed paths
     * @returns {Promise} A promise that resolves when robots.txt is fetched and parsed
     */
    async fetchRobotsTxt() {
        try {
            const robotsUrl = `${this.baseUrl}/robots.txt`;
            this.log(`Fetching robots.txt from ${robotsUrl}`, 'info');
            
            const response = await fetch(robotsUrl, { 
                method: 'GET',
                headers: { 'User-Agent': 'WebScraperBot/1.0' }
            });
            
            if (!response.ok) {
                this.log(`No robots.txt found or unable to fetch (${response.status})`, 'warning');
                return;
            }
            
            const robotsTxt = await response.text();
            this.robotsTxt = robotsTxt;
            
            // Parse disallowed paths
            const lines = robotsTxt.split('\n');
            let currentUserAgent = '*';
            
            for (const line of lines) {
                const trimmedLine = line.trim();
                
                // Skip comments and empty lines
                if (trimmedLine.startsWith('#') || trimmedLine === '') {
                    continue;
                }
                
                // Check for User-agent
                if (trimmedLine.toLowerCase().startsWith('user-agent:')) {
                    currentUserAgent = trimmedLine.split(':')[1].trim();
                    continue;
                }
                
                // Check for Disallow
                if ((currentUserAgent === '*' || currentUserAgent.toLowerCase() === 'webscraperbot') && 
                    trimmedLine.toLowerCase().startsWith('disallow:')) {
                    const path = trimmedLine.split(':')[1].trim();
                    if (path) {
                        this.disallowedPaths.push(path);
                    }
                }
                
                // Check for Sitemap
                if (trimmedLine.toLowerCase().startsWith('sitemap:')) {
                    const sitemapUrl = trimmedLine.split(':').slice(1).join(':').trim();
                    if (sitemapUrl && this.config.useSitemap) {
                        this.log(`Found sitemap in robots.txt: ${sitemapUrl}`, 'info');
                        try {
                            await this.fetchSitemapFromUrl(sitemapUrl);
                        } catch (error) {
                            this.log(`Error fetching sitemap from robots.txt: ${error.message}`, 'warning');
                        }
                    }
                }
            }
            
            this.log(`Parsed robots.txt: ${this.disallowedPaths.length} disallowed paths`, 'info');
        } catch (error) {
            this.log(`Error fetching robots.txt: ${error.message}`, 'warning');
        }
    }
    
    /**
     * Fetch sitemap.xml and extract URLs
     * @returns {Promise} A promise that resolves when the sitemap is fetched and parsed
     */
    async fetchSitemap() {
        try {
            const sitemapUrl = `${this.baseUrl}/sitemap.xml`;
            await this.fetchSitemapFromUrl(sitemapUrl);
        } catch (error) {
            this.log(`Error fetching sitemap: ${error.message}`, 'warning');
            
            // Try sitemap index
            try {
                const sitemapIndexUrl = `${this.baseUrl}/sitemap_index.xml`;
                this.log(`Trying sitemap index at ${sitemapIndexUrl}`, 'info');
                
                const response = await fetch(sitemapIndexUrl, { 
                    method: 'GET',
                    headers: { 'User-Agent': 'WebScraperBot/1.0' }
                });
                
                if (!response.ok) {
                    this.log(`No sitemap index found (${response.status})`, 'warning');
                    return;
                }
                
                const sitemapIndexXml = await response.text();
                const parser = new DOMParser();
                const doc = parser.parseFromString(sitemapIndexXml, 'text/xml');
                
                // Extract sitemap URLs
                const sitemapElements = doc.querySelectorAll('sitemap loc');
                
                for (const element of sitemapElements) {
                    const sitemapUrl = element.textContent;
                    this.log(`Found sitemap in index: ${sitemapUrl}`, 'info');
                    
                    try {
                        await this.fetchSitemapFromUrl(sitemapUrl);
                    } catch (sitemapError) {
                        this.log(`Error fetching sitemap from index: ${sitemapError.message}`, 'warning');
                    }
                }
            } catch (indexError) {
                this.log(`Error fetching sitemap index: ${indexError.message}`, 'warning');
            }
        }
    }
    
    /**
     * Fetch a sitemap from a specific URL
     * @param {string} sitemapUrl - The URL of the sitemap
     * @returns {Promise} A promise that resolves when the sitemap is fetched and parsed
     */
    async fetchSitemapFromUrl(sitemapUrl) {
        this.log(`Fetching sitemap from ${sitemapUrl}`, 'info');
        
        const response = await fetch(sitemapUrl, { 
            method: 'GET',
            headers: { 'User-Agent': 'WebScraperBot/1.0' }
        });
        
        if (!response.ok) {
            throw new Error(`Failed to fetch sitemap: ${response.status}`);
        }
        
        const sitemapXml = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(sitemapXml, 'text/xml');
        
        // Extract URLs
        const urlElements = doc.querySelectorAll('url loc');
        
        for (const element of urlElements) {
            const url = element.textContent;
            
            // Check if URL is from the same domain
            try {
                const urlObj = new URL(url);
                const isExternal = urlObj.origin !== this.baseUrl;
                
                // Skip external URLs if not configured to follow them
                if (isExternal && !this.config.followExternal) {
                    continue;
                }
                
                // Add to sitemap URLs
                this.sitemapUrls.push(url);
            } catch (error) {
                this.log(`Invalid URL in sitemap: ${url}`, 'warning');
            }
        }
        
        this.log(`Extracted ${urlElements.length} URLs from sitemap`, 'info');
    }
    
    /**
     * Check if a URL is allowed by robots.txt
     * @param {string} url - The URL to check
     * @returns {boolean} True if the URL is allowed, false otherwise
     */
    isAllowed(url) {
        // If no disallowed paths, allow all
        if (!this.disallowedPaths || this.disallowedPaths.length === 0) {
            return true;
        }
        
        try {
            const urlObj = new URL(url);
            const path = urlObj.pathname;
            
            // Check against disallowed paths
            for (const disallowedPath of this.disallowedPaths) {
                // Exact match
                if (disallowedPath === path) {
                    return false;
                }
                
                // Path starts with disallowed path
                if (disallowedPath.endsWith('/') && path.startsWith(disallowedPath)) {
                    return false;
                }
                
                // Wildcard match
                if (disallowedPath.includes('*')) {
                    const regex = new RegExp('^' + disallowedPath.replace(/\*/g, '.*') + '$');
                    if (regex.test(path)) {
                        return false;
                    }
                }
            }
            
            return true;
        } catch (error) {
            this.log(`Error checking if URL is allowed: ${error.message}`, 'error');
            return false;
        }
    }
    
    /**
     * Check if a URL should be crawled based on configuration
     * @param {string} url - The URL to check
     * @param {number} depth - The depth of the URL
     * @returns {boolean} True if the URL should be crawled, false otherwise
     */
    shouldCrawl(url, depth) {
        try {
            // Check depth
            if (depth > this.config.maxDepth) {
                return false;
            }
            
            // Check if already visited
            if (this.visited.has(url)) {
                return false;
            }
            
            // Parse URL
            const urlObj = new URL(url);
            
            // Check if external
            const isExternal = urlObj.origin !== this.baseUrl;
            if (isExternal && !this.config.followExternal) {
                return false;
            }
            
            // Check include pattern
            if (this.config.includePattern) {
                const includeRegex = new RegExp(this.config.includePattern);
                if (!includeRegex.test(url)) {
                    return false;
                }
            }
            
            // Check exclude pattern
            if (this.config.excludePattern) {
                const excludeRegex = new RegExp(this.config.excludePattern);
                if (excludeRegex.test(url)) {
                    return false;
                }
            }
            
            return true;
        } catch (error) {
            this.log(`Error checking if URL should be crawled: ${error.message}`, 'error');
            return false;
        }
    }
    
    /**
     * Fetch a URL with retry logic
     * @param {string} url - The URL to fetch
     * @returns {Promise} A promise that resolves with the response
     */
    async fetchWithRetry(url) {
        let retries = 0;
        let lastError = null;
        
        while (retries <= this.config.maxRetries) {
            try {
                // Use proxy if enabled
                if (this.config.enableProxy && this.config.proxyUrl) {
                    return await this.fetchWithProxy(url);
                }
                
                // Use JSONP if enabled
                if (this.config.enableJsonp) {
                    return await this.fetchWithJsonp(url);
                }
                
                // Use iframe if enabled
                if (this.config.enableIframe) {
                    return await this.fetchWithIframe(url);
                }
                
                // Regular fetch
                const response = await fetch(url, {
                    method: 'GET',
                    headers: { 'User-Agent': 'WebScraperBot/1.0' },
                    timeout: this.config.requestTimeout
                });
                
                if (!response.ok) {
                    throw new Error(`HTTP error: ${response.status}`);
                }
                
                return response;
            } catch (error) {
                lastError = error;
                retries++;
                
                if (retries <= this.config.maxRetries) {
                    this.log(`Retry ${retries}/${this.config.maxRetries} for ${url}: ${error.message}`, 'warning');
                    
                    // Wait before retrying (exponential backoff)
                    const delay = Math.min(1000 * Math.pow(2, retries - 1), 10000);
                    await new Promise(resolve => setTimeout(resolve, delay));
                }
            }
        }
        
        throw new Error(`Failed after ${this.config.maxRetries} retries: ${lastError.message}`);
    }
    
    /**
     * Fetch a URL using a proxy server
     * @param {string} url - The URL to fetch
     * @returns {Promise} A promise that resolves with the response
     */
    async fetchWithProxy(url) {
        this.log(`Fetching ${url} via proxy`, 'info');
        
        // Encode the URL to be used as a query parameter
        const encodedUrl = encodeURIComponent(url);
        const proxyUrl = `${this.config.proxyUrl}?url=${encodedUrl}`;
        
        const response = await fetch(proxyUrl, {
            method: 'GET',
            headers: { 'User-Agent': 'WebScraperBot/1.0' },
            timeout: this.config.requestTimeout
        });
        
        if (!response.ok) {
            throw new Error(`Proxy HTTP error: ${response.status}`);
        }
        
        // Create a new Response object with the proxy response
        return new Response(await response.text(), {
            status: 200,
            headers: new Headers({
                'content-type': 'text/html'
            })
        });
    }
    
    /**
     * Fetch a URL using JSONP
     * @param {string} url - The URL to fetch
     * @returns {Promise} A promise that resolves with the response
     */
    async fetchWithJsonp(url) {
        this.log(`Fetching ${url} via JSONP`, 'info');
        
        return new Promise((resolve, reject) => {
            // Create a unique callback name
            const callbackName = 'jsonp_callback_' + Math.round(100000 * Math.random());
            
            // Create script element
            const script = document.createElement('script');
            
            // Set timeout
            const timeout = setTimeout(() => {
                cleanup();
                reject(new Error('JSONP request timed out'));
            }, this.config.requestTimeout);
            
            // Cleanup function
            const cleanup = () => {
                if (script.parentNode) script.parentNode.removeChild(script);
                delete window[callbackName];
                clearTimeout(timeout);
            };
            
            // Setup callback function
            window[callbackName] = (data) => {
                cleanup();
                
                // Create a new Response object with the JSONP data
                resolve(new Response(JSON.stringify(data), {
                    status: 200,
                    headers: new Headers({
                        'content-type': 'application/json'
                    })
                }));
            };
            
            // Add callback parameter to URL
            const jsonpUrl = url + (url.includes('?') ? '&' : '?') + 'callback=' + callbackName;
            
            // Set script source and append to document
            script.src = jsonpUrl;
            document.head.appendChild(script);
            
            // Handle script load error
            script.onerror = () => {
                cleanup();
                reject(new Error('JSONP request failed'));
            };
        });
    }
    
    /**
     * Fetch a URL using an iframe
     * @param {string} url - The URL to fetch
     * @returns {Promise} A promise that resolves with the response
     */
    async fetchWithIframe(url) {
        this.log(`Fetching ${url} via iframe`, 'info');
        
        return new Promise((resolve, reject) => {
            // Create iframe element
            const iframe = document.createElement('iframe');
            iframe.style.display = 'none';
            
            // Set timeout
            const timeout = setTimeout(() => {
                cleanup();
                reject(new Error('iframe request timed out'));
            }, this.config.requestTimeout);
            
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
                    
                    // Create a new Response object with the iframe content
                    resolve(new Response(html, {
                        status: 200,
                        headers: new Headers({
                            'content-type': 'text/html'
                        })
                    }));
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
    
    /**
     * Stop the crawler
     */
    stop() {
        this.log('Stopping crawler', 'info');
        this.running = false;
    }
    
    /**
     * Pause the crawler
     */
    pause() {
        if (!this.paused) {
            this.log('Pausing crawler', 'info');
            this.paused = true;
        }
    }
    
    /**
     * Resume the crawler
     */
    resume() {
        if (this.paused) {
            this.log('Resuming crawler', 'info');
            this.paused = false;
            
            // Continue processing the queue
            this.processQueue();
        }
    }
    
    /**
     * Update the progress display
     */
    updateProgress() {
        if (window.WebScraper && window.WebScraper.UI) {
            window.WebScraper.UI.updateProgress(
                this.pagesProcessed,
                this.totalPages,
                this.paused ? 'Paused' : (this.running ? 'Scraping...' : 'Stopped')
            );
        }
    }
    
    /**
     * Log a message
     * @param {string} message - The message to log
     * @param {string} level - The log level (info, warning, error)
     */
    log(message, level = 'info') {
        if (window.WebScraper && window.WebScraper.UI) {
            window.WebScraper.UI.logMessage(message, level);
        } else {
            console.log(`[${level.toUpperCase()}] ${message}`);
        }
    }
    
    /**
     * Get the results of the crawl
     * @returns {Array} An array of crawled pages
     */
    getResults() {
        return this.results;
    }
    
    /**
     * Get the errors encountered during the crawl
     * @returns {Array} An array of errors
     */
    getErrors() {
        return this.errors;
    }
    
    /**
     * Get statistics about the crawl
     * @returns {Object} An object containing statistics
     */
    getStats() {
        const duration = this.startTime ? parseFloat(((Date.now() - this.startTime) / 1000).toFixed(2)) : 0;
        const successCount = this.pagesProcessed - this.errors.length;
        const successRate = this.pagesProcessed > 0 ? (successCount / this.pagesProcessed * 100).toFixed(2) + '%' : '0%';
        
        return {
            pagesProcessed: this.pagesProcessed,
            totalPagesEstimate: this.totalPages,
            urlsInQueue: this.queue.length,
            duration: duration,
            successCount: successCount,
            errorCount: this.errors.length,
            successRate: successRate
        };
    }
}

// Export the Crawler class
window.WebScraper = window.WebScraper || {};
window.WebScraper.Crawler = Crawler;
