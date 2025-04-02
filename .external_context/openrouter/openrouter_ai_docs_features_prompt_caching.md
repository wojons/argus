To save on inference costs, you can enable prompt caching on supported providers and models.

Most providers automatically enable prompt caching, but note that some (see Anthropic below) require you to enable it on a per-message basis.

When using caching (whether automatically in supported models, or via the `cache_control` header), OpenRouter will make a best-effort to continue routing
to the same provider to make use of the warm cache. In the event that the provider with your cached prompt is not available,
OpenRouter will try the next-best provider.

## Inspecting cache usage

To see how much caching saved on each generation, you click the detail button on the [Activity](https://openrouter.ai/activity) page, or you can use the `/api/v1/generation` API, [documented here](https://openrouter.ai/docs/api-reference/overview#querying-cost-and-stats).

The `cache_discount` field in the response body will tell you how much the response saved on cache usage. Some providers, like Anthropic, will have a negative discount on cache writes, but a positive discount (which reduces total cost) on cache reads.

## OpenAI

Caching price changes:

- **Cache writes**: no cost
- **Cache reads**: charged at 0.5x the price of the original input pricing

Prompt caching with OpenAI is automated and does not require any additional configuration. There is a minimum prompt size of 1024 tokens.

[Click here to read more about OpenAI prompt caching and its limitation.](https://openai.com/index/api-prompt-caching/)

## Anthropic Claude

Caching price changes:

- **Cache writes**: charged at 1.25x the price of the original input pricing
- **Cache reads**: charged at 0.1x the price of the original input pricing

Prompt caching with Anthropic requires the use of `cache_control` breakpoints. There is a limit of four breakpoints, and the cache will expire within five minutes. Therefore, it is recommended to reserve the cache breakpoints for large bodies of text, such as character cards, CSV data, RAG data, book chapters, etc.

[Click here to read more about Anthropic prompt caching and its limitation.](https://docs.anthropic.com/en/docs/build-with-claude/prompt-caching)

The `cache_control` breakpoint can only be inserted into the text part of a multipart message.

System message caching example:

```code-block text-sm

1{2  "messages": [3    {4      "role": "system",5      "content": [6        {7          "type": "text",8          "text": "You are a historian studying the fall of the Roman Empire. You know the following book very well:"9        },10        {11          "type": "text",12          "text": "HUGE TEXT BODY",13          "cache_control": {14            "type": "ephemeral"15          }16        }17      ]18    },19    {20      "role": "user",21      "content": [22        {23          "type": "text",24          "text": "What triggered the collapse?"25        }26      ]27    }28  ]29}

```

User message caching example:

```code-block text-sm

1{2  "messages": [3    {4      "role": "user",5      "content": [6        {7          "type": "text",8          "text": "Given the book below:"9        },10        {11          "type": "text",12          "text": "HUGE TEXT BODY",13          "cache_control": {14            "type": "ephemeral"15          }16        },17        {18          "type": "text",19          "text": "Name all the characters in the above book"20        }21      ]22    }23  ]24}

```

## DeepSeek

Caching price changes:

- **Cache writes**: charged at the same price as the original input pricing
- **Cache reads**: charged at 0.1x the price of the original input pricing

Prompt caching with DeepSeek is automated and does not require any additional configuration.

[Built with](https://buildwithfern.com/?utm_campaign=buildWith&utm_medium=docs&utm_source=openrouter.ai)