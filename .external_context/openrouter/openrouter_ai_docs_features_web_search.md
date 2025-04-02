You can incorporate relevant web search results for _any_ model on OpenRouter by activating and customizing the `web` plugin, or by appending `:online` to the model slug:

```code-block text-sm

1{2  "model": "openai/gpt-4o:online"3}
```

This is a shortcut for using the `web` plugin, and is exactly equivalent to:

```code-block text-sm

1{2  "model": "openrouter/auto",3  "plugins": [{ "id": "web" }]4}
```

The web search plugin is powered by [Exa](https://exa.ai/) and uses their [“auto”](https://docs.exa.ai/reference/how-exa-search-works#combining-neural-and-keyword-the-best-of-both-worlds-through-exa-auto-search) method (a combination of keyword search and embeddings-based web search) to find the most relevant results and augment/ground your prompt.

## Customizing the Web Plugin

The maximum results allowed by the web plugin and the prompt used to attach them to your message stream can be customized:

```code-block text-sm

1{2  "model": "openai/gpt-4o:online",3  "plugins": [4    {5      "id": "web",6      "max_results": 1, // Defaults to 57      "search_prompt": "Some relevant web results:" // See default below8    }9  ]10}
```

By default, the web plugin uses the following search prompt, using the current date:

```code-block text-sm

A web search was conducted on `date`. Incorporate the following web search results into your response.IMPORTANT: Cite them using markdown links named using the domain of the source.Example: [nytimes.com](https://nytimes.com/some-page).
```

## Pricing

The web plugin uses your OpenRouter credits and charges _$4 per 1000 results_. By default, `max_results` set to 5, this comes out to a maximum of $0.02 per request, in addition to the LLM usage for the search result prompt tokens.

[Built with](https://buildwithfern.com/?utm_campaign=buildWith&utm_medium=docs&utm_source=openrouter.ai)