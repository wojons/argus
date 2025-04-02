/**
 * Advanced Web Scraper with LLM Integration
 * ZIP Module - Handles ZIP archive creation using JSZip
 */

// This module is responsible for creating ZIP archives of scraped data

/**
 * Create a ZIP archive of the scraped data
 * @param {Array} data - The scraped data to include in the archive
 * @returns {Promise<Blob>} A promise that resolves with the ZIP archive as a Blob
 */
async function createZipArchive(data) {
    // Check if JSZip is available
    if (typeof JSZip === 'undefined') {
        throw new Error('JSZip library is not loaded. Please include it in your HTML.');
    }
    
    // Create a new ZIP archive
    const zip = new JSZip();
    
    // Add each data item to the archive
    data.forEach((item, index) => {
        // Create a filename for the item
        const filename = `scraped_data_${index + 1}.json`;
        
        // Add the item to the archive as a JSON file
        zip.file(filename, JSON.stringify(item, null, 2));
    });
    
    // Generate the ZIP archive as a Blob
    const blob = await zip.generateAsync({ type: 'blob' });
    
    return blob;
}

// Export the function
window.createZipArchive = createZipArchive;
