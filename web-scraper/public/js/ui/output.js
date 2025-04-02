/**
 * Advanced Web Scraper with LLM Integration
 * Output Module - Handles UI elements for displaying scraped data and LLM responses
 */

/**
 * Update the progress display
 * @param {number} current - The current number of pages processed
 * @param {number} total - The total number of pages to process
 * @param {string} status - The current status of the scraping process
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
 * Add a message to the chat display
 *  @param {string} message - The message to add
 * @param {string} sender - The sender of the message ('user' or 'llm')
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

// Export the functions
window.WebScraper = window.WebScraper || {};
window.WebScraper.UI = window.WebScraper.UI || {};
window.WebScraper.UI.updateProgress = updateProgress;
window.WebScraper.UI.addChatMessage = addChatMessage;
