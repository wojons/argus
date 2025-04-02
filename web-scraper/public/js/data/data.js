/**
 * Advanced Web Scraper with LLM Integration
 * Data Module - Handles data storage and processing
 */

// This module is responsible for handling data storage and processing

// In-memory data storage (for now)
let scrapedData = [];

/**
 * Add scraped data to the storage
 * @param {Object} data - The data to add
 */
function addData(data) {
    scrapedData.push(data);
}

/**
 * Get all scraped data
 * @returns {Array} The scraped data
 */
function getAllData() {
    return scrapedData;
}

// Export the functions
window.WebScraper = window.WebScraper || {};
window.WebScraper.Data = {
    addData,
    getAllData
};
