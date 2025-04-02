/**
 * Advanced Web Scraper with LLM Integration
 * Main UI Script
 */

// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize the UI components
    initializeTabs();
    initializeOutputTabs();
    initializeToggleElements();
    initializeEventListeners();
    
    // Log initialization
    logMessage('System initialized and ready.', 'info');
});

/**
 * Initialize the main navigation tabs
 */
function initializeTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons and contents
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Add active class to clicked button
            button.classList.add('active');
            
            // Show the corresponding tab content
            const tabId = button.getAttribute('data-tab');
            document.getElementById(`${tabId}-tab`).classList.add('active');
            
            // Log tab change
            logMessage(`Switched to ${tabId} tab.`, 'info');
        });
    });
}

/**
 * Initialize the output tabs (Preview/LLM)
 */
function initializeOutputTabs() {
    const outputTabButtons = document.querySelectorAll('.output-tab-btn');
    const outputContents = document.querySelectorAll('.output-content');
    
    outputTabButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons and contents
            outputTabButtons.forEach(btn => btn.classList.remove('active'));
            outputContents.forEach(content => content.classList.remove('active'));
            
            // Add active class to clicked button
            button.classList.add('active');
            
            // Show the corresponding output content
            const outputId = button.getAttribute('data-output');
            document.getElementById(`${outputId}-output`).classList.add('active');
        });
    });
}

/**
 * Initialize toggle elements (checkboxes that show/hide related settings)
 */
function initializeToggleElements() {
    // LLM toggle
    const llmToggle = document.getElementById('enable-llm');
    const llmSettings = document.getElementById('llm-settings');
    
    llmToggle.addEventListener('change', () => {
        llmSettings.style.display = llmToggle.checked ? 'block' : 'none';
        
        // Enable/disable LLM-related UI elements
        const chatInput = document.getElementById('chat-input');
        const sendChatBtn = document.getElementById('send-chat');
        const downloadLlmBtn = document.getElementById('download-llm');
        
        chatInput.disabled = !llmToggle.checked;
        sendChatBtn.disabled = !llmToggle.checked;
        downloadLlmBtn.disabled = !llmToggle.checked;
        
        // Log LLM toggle
        logMessage(`LLM integration ${llmToggle.checked ? 'enabled' : 'disabled'}.`, 'info');
        
        // If enabled, check for API key
        if (llmToggle.checked) {
            const llmProvider = document.getElementById('llm-provider').value;
            if (llmProvider === 'openrouter') {
                checkApiKey();
            }
        }
    });
    
    // LLM provider change
    const llmProvider = document.getElementById('llm-provider');
    const openrouterOptions = document.querySelectorAll('.openrouter-option');
    
    llmProvider.addEventListener('change', () => {
        const isOpenRouter = llmProvider.value === 'openrouter';
        
        openrouterOptions.forEach(option => {
            option.style.display = isOpenRouter ? 'block' : 'none';
        });
        
        // Log provider change
        logMessage(`LLM provider changed to ${llmProvider.value}.`, 'info');
        
        // If OpenRouter, check for API key
        if (isOpenRouter) {
            checkApiKey();
        }
    });
    
    // Proxy toggle
    const proxyToggle = document.getElementById('enable-proxy');
    const proxySettings = document.getElementById('proxy-settings');
    
    proxyToggle.addEventListener('change', () => {
        proxySettings.style.display = proxyToggle.checked ? 'block' : 'none';
        
        // Log proxy toggle
        logMessage(`Proxy server ${proxyToggle.checked ? 'enabled' : 'disabled'}.`, 'info');
    });
}

/**
 * Initialize other event listeners
 */
function initializeEventListeners() {
    // Start button
    const startBtn = document.getElementById('start-btn');
    const stopBtn = document.getElementById('stop-btn');
    const pauseBtn = document.getElementById('pause-btn');
    
    startBtn.addEventListener('click', () => {
        // Validate URL
        const urlInput = document.getElementById('url-input');
        const url = urlInput.value.trim();
        
        if (!url) {
            logMessage('Please enter a URL to scrape.', 'error');
            urlInput.focus();
            return;
        }
        
        if (!isValidUrl(url)) {
            logMessage(`Invalid URL: ${url}. Please enter a valid URL.`, 'error');
            urlInput.focus();
            return;
        }
        
        // Update UI
        startBtn.disabled = true;
        stopBtn.disabled = false;
        pauseBtn.disabled = false;
        
        // Update progress
        document.getElementById('progress-text').textContent = 'Scraping...';
        document.getElementById('progress-stats').textContent = '0/0 pages';
        document.getElementById('progress-bar').style.width = '0%';
        
        // Log start
        logMessage(`Starting scrape of ${url}`, 'info');
        
        // Get configuration
        const config = getScraperConfig();
        
        // Start the scraping process
        startScraping(url, config);
    });
    
    // Stop button
    stopBtn.addEventListener('click', () => {
        // Update UI
        startBtn.disabled = false;
        stopBtn.disabled = true;
        pauseBtn.disabled = true;
        
        // Update progress
        document.getElementById('progress-text').textContent = 'Stopped';
        
        // Log stop
        logMessage('Scraping stopped by user.', 'info');
        
        // Stop the scraping process
        stopScraping();
    });
    
    // Pause button
    pauseBtn.addEventListener('click', () => {
        const isPaused = pauseBtn.textContent === 'Resume';
        
        // Update button text
        pauseBtn.textContent = isPaused ? 'Pause' : 'Resume';
        
        // Update progress
        document.getElementById('progress-text').textContent = isPaused ? 'Scraping...' : 'Paused';
        
        // Log pause/resume
        logMessage(`Scraping ${isPaused ? 'resumed' : 'paused'} by user.`, 'info');
        
        // Pause/resume the scraping process
        togglePauseScraping();
    });
    
    // Clear logs button
    const clearLogsBtn = document.getElementById('clear-logs');
    clearLogsBtn.addEventListener('click', () => {
        const logContainer = document.getElementById('log-container');
        
        // Keep only the first log entry (system initialized)
        const firstLogEntry = logContainer.firstElementChild;
        logContainer.innerHTML = '';
        logContainer.appendChild(firstLogEntry);
        
        // Log clear
        logMessage('Logs cleared.', 'info');
    });
    
    // Log level filter
    const logLevelFilter = document.getElementById('log-level');
    logLevelFilter.addEventListener('change', () => {
        const level = logLevelFilter.value;
        const logEntries = document.querySelectorAll('.log-entry');
        
        logEntries.forEach(entry => {
            if (level === 'all' || entry.classList.contains(level)) {
                entry.style.display = 'block';
            } else {
                entry.style.display = 'none';
            }
        });
    });
    
    // Save API key button
    const saveApiKeyBtn = document.getElementById('save-api-key');
    saveApiKeyBtn.addEventListener('click', () => {
        const apiKeyInput = document.getElementById('api-key');
        const apiKey = apiKeyInput.value.trim();
        
        if (!apiKey) {
            logMessage('Please enter an API key.', 'error');
            apiKeyInput.focus();
            return;
        }
        
        // Save API key securely
        saveApiKey(apiKey)
            .then(() => {
                logMessage('API key saved securely.', 'info');
                apiKeyInput.value = '';
            })
            .catch(error => {
                logMessage(`Error saving API key: ${error.message}`, 'error');
            });
    });
    
    // Clear storage button
    const clearStorageBtn = document.getElementById('clear-storage');
    clearStorageBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to clear all stored data? This will remove saved API keys and cached data.')) {
            clearStorage()
                .then(() => {
                    logMessage('All stored data cleared.', 'info');
                })
                .catch(error => {
                    logMessage(`Error clearing storage: ${error.message}`, 'error');
                });
        }
    });
    
    // Apply LLM task button
    const applyTaskBtn = document.getElementById('apply-task');
    applyTaskBtn.addEventListener('click', () => {
        const taskSelect = document.getElementById('llm-task');
        const promptTextarea = document.getElementById('llm-prompt');
        
        const selectedTask = taskSelect.value;
        if (!selectedTask) return;
        
        // Set prompt based on selected task
        switch (selectedTask) {
            case 'extract':
                promptTextarea.value = 'Extract the following information from the content: [specify what to extract]';
                break;
            case 'summarize':
                promptTextarea.value = 'Provide a concise summary of the main points in this content.';
                break;
            case 'sentiment':
                promptTextarea.value = 'Analyze the sentiment of this content. Is it positive, negative, or neutral? Provide examples to support your analysis.';
                break;
            case 'structure':
                promptTextarea.value = 'Convert this content into a structured JSON format with the following fields: [specify fields]';
                break;
        }
        
        // Reset the select
        taskSelect.value = '';
    });
    
    // Send chat button
    const sendChatBtn = document.getElementById('send-chat');
    const chatInput = document.getElementById('chat-input');
    
    sendChatBtn.addEventListener('click', () => {
        sendChatMessage();
    });
    
    chatInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            sendChatMessage();
        }
    });
    
    // Download buttons
    const downloadButtons = document.querySelectorAll('.download-btn');
    downloadButtons.forEach(button => {
        button.addEventListener('click', () => {
            const format = button.id.replace('download-', '');
            downloadScrapedData(format);
        });
    });
    
    // Refresh visualization button
    const refreshVizBtn = document.getElementById('refresh-viz');
    refreshVizBtn.addEventListener('click', () => {
        refreshVisualization();
    });
}

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

/**
 * Check if a string is a valid URL
 */
function isValidUrl(string) {
    try {
        new URL(string);
        return true;
    } catch (_) {
        return false;
    }
}

/**
 * Send a chat message to the LLM
 */
function sendChatMessage() {
    const chatInput = document.getElementById('chat-input');
    const message = chatInput.value.trim();
    
    if (!message) return;
    
    // Add user message to chat
    addChatMessage(message, 'user');
    
    // Clear input
    chatInput.value = '';
    
    // Get LLM provider and model
    const provider = document.getElementById('llm-provider').value;
    const model = document.getElementById('openrouter-model').value;
    
    // Log message
    logMessage(`Sending message to ${provider} ${model}.`, 'info');
    
    // Send to LLM
    sendToLlm(message, provider, model)
        .then(response => {
            // Add LLM response to chat
            addChatMessage(response, 'llm');
        })
        .catch(error => {
            logMessage(`Error from LLM: ${error.message}`, 'error');
            addChatMessage(`Error: ${error.message}`, 'llm');
        });
}

/**
 * Add a message to the chat display
 */
function addChatMessage(message, sender) {
    const chatMessages = document.getElementById('chat-messages');
    const messageElement = document.createElement('div');
    
    messageElement.classList.add('message');
    messageElement.classList.add(`${sender}-message`);
    messageElement.textContent = message;
    
    // Remove placeholder if present
    const placeholder = chatMessages.querySelector('.placeholder-text');
    if (placeholder) {
        chatMessages.removeChild(placeholder);
    }
    
    chatMessages.appendChild(messageElement);
    
    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

/**
 * Log a message to the log container
 */
function logMessage(message, level = 'info') {
    const logContainer = document.getElementById('log-container');
    const logEntry = document.createElement('div');
    
    // Get current time
    const now = new Date();
    const timeString = now.toTimeString().split(' ')[0];
    
    // Create log entry
    logEntry.classList.add('log-entry');
    logEntry.classList.add(level);
    
    logEntry.innerHTML = `
        <span class="log-time">[${timeString}]</span>
        <span class="log-level">${level.toUpperCase()}</span>
        <span class="log-message">${message}</span>
    `;
    
    // Add to log container
    logContainer.appendChild(logEntry);
    
    // Scroll to bottom
    logContainer.scrollTop = logContainer.scrollHeight;
    
    // Check if entry should be visible based on current filter
    const currentFilter = document.getElementById('log-level').value;
    if (currentFilter !== 'all' && currentFilter !== level) {
        logEntry.style.display = 'none';
    }
    
    // If error, also show in console
    if (level === 'error') {
        console.error(message);
    }
}

/**
 * Update the progress display
 */
function updateProgress(current, total, status = null) {
    const progressBar = document.getElementById('progress-bar');
    const progressText = document.getElementById('progress-text');
    const progressStats = document.getElementById('progress-stats');
    
    // Calculate percentage
    const percentage = total > 0 ? Math.round((current / total) * 100) : 0;
    
    // Update progress bar
    progressBar.style.width = `${percentage}%`;
    
    // Update stats
    progressStats.textContent = `${current}/${total} pages`;
    
    // Update status text if provided
    if (status) {
        progressText.textContent = status;
    }
    
    // Enable download buttons if progress is complete
    if (current === total && total > 0) {
        document.querySelectorAll('.download-btn').forEach(btn => {
            // Only enable if not LLM format or if LLM is enabled
            if (btn.id !== 'download-llm' || document.getElementById('enable-llm').checked) {
                btn.disabled = false;
            }
        });
    }
}

/**
 * Check if API key is stored and update UI accordingly
 */
function checkApiKey() {
    getApiKey()
        .then(apiKey => {
            const apiKeyInput = document.getElementById('api-key');
            const saveApiKeyBtn = document.getElementById('save-api-key');
            
            if (apiKey) {
                apiKeyInput.placeholder = '••••••••••••••••••••••••••';
                saveApiKeyBtn.textContent = 'Update Key';
                logMessage('API key found in secure storage.', 'info');
            } else {
                apiKeyInput.placeholder = 'Enter your OpenRouter API key';
                saveApiKeyBtn.textContent = 'Save Key';
                logMessage('No API key found. Please enter your API key.', 'warning');
            }
        })
        .catch(error => {
            logMessage(`Error checking API key: ${error.message}`, 'error');
        });
}

// Export functions for use in other modules
window.WebScraper = window.WebScraper || {};
window.WebScraper.UI = {
    logMessage,
    updateProgress,
    addChatMessage
};
