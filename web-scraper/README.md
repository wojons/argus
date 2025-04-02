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
    git clone [repository URL]
    cd web-scraper
    ```
2.  **Install dependencies:**

    ```bash
    npm install
    cd proxy-server
    npm install
    cd ..
    ```
3.  **Set up the proxy server (optional):**

    You can run the proxy server using Docker Compose:

    ```bash
    docker-compose up
    ```

    Or using Docker directly:

    ```bash
    cd proxy-server
    docker build -t web-scraper-proxy .
    docker run -p 3000:3000 web-scraper-proxy
    ```

    Alternatively, you can run it locally:

    *   Navigate to the `proxy-server` directory.
    *   Run `npm install` to install dependencies.
    *   Start the server with `node server.js`.
    *   The proxy will run on `http://localhost:3000` by default.
    *   In the app settings, enable proxy and enter the proxy URL.
4.  **Open `public/index.html` in your browser.**

## Usage

1.  Enter a URL in the input field.
2.  Configure crawl and extraction options.
3.  Click "Start" to begin scraping.
4.  View results in the output section.
5.  Download data in your preferred format.

## GitHub Setup

You can use the provided script to initialize and push your repository to GitHub:

**Linux/macOS:**
```bash
chmod +x init-git.sh
./init-git.sh
```

**Windows:**
```bash
init-git.bat
```

Or manually:

1. **Create a new repository on GitHub:**
   * Go to [GitHub](https://github.com) and sign in.
   * Click the "+" icon in the top right corner and select "New repository".
   * Name your repository (e.g., "web-scraper").
   * Add a description (optional).
   * Choose public or private visibility.
   * Click "Create repository".

2. **Initialize and push your local repository:**
   ```bash
   cd web-scraper
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/yourusername/web-scraper.git
   git push -u origin main
   ```

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
web-scraper/
├── .clinerules
├── public/
│   ├── index.html
│   ├── css/
│   │   └── styles.css
│   ├── js/
│   │   ├── core/         # Core scraping logic
│   │   │   ├── crawler.js
│   │   │   └── scraper.js
│   │   ├── ui/           # UI components
│   │   │   ├── main.js   # Main UI
│   │   │   ├── input.js  # Input elements
│   │   │   ├── output.js # Output display
│   │   │   └── settings.js # Advanced settings
│   │   ├── llm/          # LLM integration
│   │   │   ├── llm.js    # LLM API handling
│   │   │   └── webllm.js # (If implementing WebLLM)
│   │   ├── data/         # Data handling
│   │   │   ├── data.js   # Data processing
│   │   │   └── zip.js    # ZIP creation
│   │   ├── viz/          # Visualization
│   │   │   └── viz.js    # Graph visualization
│   │   ├── security/     # Security
│   │   │   └── security.js # API key handling
│   │   ├── bypass/       # Same-origin policy bypass
│   │   │   ├── cors.js   # (If implementing CORS helper)
│   │   │   ├── jsonp.js  # JSONP implementation
│   │   │   ├── iframe.js # IFrame handling
│   │   └── proxy/      # Proxy server communication
│   │       └── proxy.js
│   └── assets/         # Images, etc.
├── extensions/     # Browser extension code
│   ├── chrome/
│   │   ├── manifest.json
│   │   └── background.js
│   └── firefox/
│       ├── manifest.json
│       └── background.js
├── proxy-server/     # Proxy server code (Node.js)
│   ├── server.js
│   └── package.json
├── data/               # Example data (can be excluded from build)
├── docs/               # Project documentation
├── .external_context/ # External docs for Cline
│   ├── research_docs/
│   │   ├── Client-Side Web Scraping Research_.md
│   │   └── Web Scraping Tool Design Refined_.md
│   └── webllm_docs/   # (If you provide them)
├── .clineignore
├── package.json        # npm dependencies (for main app)
├── webpack.config.js   # (If using Webpack)
└── README.md
```

## License

MIT License
