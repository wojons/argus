/**
 * Advanced Web Scraper with LLM Integration
 * LLM Module - Handles integration with OpenRouter for LLM-based tasks
 */

/**
 * Send text to the LLM for processing
 * @param {string} text - The text to send to the LLM
 * @param {string} provider - The LLM provider (e.g., 'openai', 'anthropic')
 * @param {string} model - The LLM model to use (e.g., 'gpt-3.5-turbo')
 * @param {string} prompt - The prompt to use for the LLM
 * @returns {Promise<string>} A promise that resolves with the LLM response
 */
async function sendToLlm(text, provider, model, prompt = '') {
    // Get API key from secure storage
    const apiKey = await getApiKey();
    
    if (!apiKey) {
        throw new Error('No API key found. Please enter your API key in the settings.');
    }
    
    // Construct the API endpoint URL
    let apiUrl = 'https://openrouter.ai/api/v1/chat/completions';
    
    // Construct the request body
    const requestBody = {
        model: model,
        messages: [
            {
                role: 'system',
                content: prompt || 'You are a helpful assistant. Please provide a concise and informative response.'
            },
            {
                role: 'user',
                content: text
            }
        ]
    };
    
    try {
        // Send the request to the OpenRouter API
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });
        
        // Check for errors
        if (!response.ok) {
            throw new Error(`LLM API error: ${response.status} ${response.statusText}`);
        }
        
        // Parse the response
        const data = await response.json();
        
        // Extract the LLM response
        const llmResponse = data.choices[0].message.content;
        
        return llmResponse;
    } catch (error) {
        console.error('Error sending to LLM:', error);
        throw error;
    }
}

// Export the function
window.sendToLlm = sendToLlm;
