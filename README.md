# Advanced Web Scraper with LLM Integration

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Description

This project is an advanced web scraper that integrates Large Language Models (LLMs) to enhance data extraction and analysis. It allows users to configure various scraping options, bypass same-origin policy restrictions, and leverage LLMs for intelligent content processing.

## Features

*   **Configurable Crawling:** Set maximum depth, crawl delay, URL include/exclude patterns, and more.
*   **Versatile Content Extraction:** Extract text, images, links, videos, CSS, and raw HTML.
*   **LLM Integration:** Leverage OpenRouter for LLM-based extraction, summarization, and sentiment analysis.
*   **Same-Origin Policy Bypass:** Options for JSONP and IFrame-based data retrieval (use with caution).
*   **Data Visualization:** Visualize the crawled website structure using Cytoscape.js or Vis.js.
*   **Multiple Output Formats:** Download scraped data in Markdown, JSON, CSV, and plain text formats.
*   **Browser Extension Support:** Companion extensions for Chrome and Firefox for unrestricted scraping.
*   **Proxy Server:** Included Node.js proxy server to bypass same-origin policy restrictions.

## Getting Started

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/wojons/argus.git
    cd argus
    ```
2.  **Install dependencies:**

    ```bash
    cd web-scraper
    npm install
    cd proxy-server
    npm install
    cd ../..
    ```
3.  **Set up the proxy server (optional):**

    You can run the proxy server using Docker Compose:

    ```bash
    cd web-scraper
    docker-compose up
    ```

    Or using Docker directly:

    ```bash
    cd web-scraper/proxy-server
    docker build -t web-scraper-proxy .
    docker run -p 3000:3000 web-scraper-proxy
    ```

    Alternatively, you can run it locally:

    *   Navigate to the `web-scraper/proxy-server` directory.
    *   Run `npm install` to install dependencies.
    *   Start the server with `node server.js`.
    *   The proxy will run on `http://localhost:3000` by default.
    *   In the app settings, enable proxy and enter the proxy URL.
4.  **Open `web-scraper/public/index.html` in your browser.**

## Usage

1.  Enter a URL in the input field.
2.  Configure crawl and extraction options.
3.  Click "Start" to begin scraping.
4.  View results in the output section.
5.  Download data in your preferred format.

## Security

*   Handle API keys securely. Use IndexedDB for storage and follow best practices.
*   Encrypt API keys before storing them in IndexedDB.
*   Implement robust authentication and authorization for the proxy server.
*   Carefully validate and sanitize all data received from external sources (websites, LLM APIs).
*   Be extremely mindful of potential security implications when handling user-provided prompts for LLMs.

## Technologies Used

*   JavaScript (ES6+)
*   HTML5
*   CSS3
*   JSZip
*   Cytoscape.js
*   OpenRouter API
*   IndexedDB
*   Node.js

## Directory Structure

```
argus/
├── web-scraper/
│   ├── .clinerules
│   ├── public/
│   │   ├── index.html
│   │   ├── css/
│   │   │   └── styles.css
│   │   ├── js/
│   │   │   ├── core/         # Core scraping logic
│   │   │   │   ├── crawler.js
│   │   │   │   └── scraper.js
│   │   │   ├── ui/           # UI components
│   │   │   │   ├── main.js   # Main UI
│   │   │   │   ├── input.js  # Input elements
│   │   │   │   ├── output.js # Output display
│   │   │   │   └── settings.js # Advanced settings
│   │   │   ├── llm/          # LLM integration
│   │   │   │   ├── llm.js    # LLM API handling
│   │   │   │   └── webllm.js # (If implementing WebLLM)
│   │   │   ├── data/         # Data handling
│   │   │   │   ├── data.js   # Data processing
│   │   │   │   └── zip.js    # ZIP creation
│   │   │   ├── viz/          # Visualization
│   │   │   │   └── viz.js    # Graph visualization
│   │   │   ├── security/     # Security
│   │   │   │   └── security.js # API key handling
│   │   │   ├── bypass/       # Same-origin policy bypass
│   │   │   │   ├── cors.js   # (If implementing CORS helper)
│   │   │   │   ├── jsonp.js  # JSONP implementation
│   │   │   │   ├── iframe.js # IFrame handling
│   │   │   └── proxy/      # Proxy server communication
│   │   │       └── proxy.js
│   │   └── assets/         # Images, etc.
│   ├── extensions/     # Browser extension code
│   │   ├── chrome/
│   │   │   ├── manifest.json
│   │   │   └── background.js
│   │   └── firefox/
│   │       ├── manifest.json
│   │       └── background.js
│   ├── proxy-server/     # Proxy server code (Node.js)
│   │   ├── server.js
│   │   └── package.json
│   ├── data/               # Example data (can be excluded from build)
│   ├── docs/               # Project documentation
│   ├── .clineignore
│   ├── package.json        # npm dependencies (for main app)
│   ├── webpack.config.js   # (If using Webpack)
│   └── README.md
└── .external_context/ # External docs for Cline (excluded from git)
```

## License

MIT License
