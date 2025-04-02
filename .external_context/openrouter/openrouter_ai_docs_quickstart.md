OpenRouter provides a unified API that gives you access to hundreds of AI models through a single endpoint, while automatically handling fallbacks and selecting the most cost-effective options. Get started with just a few lines of code using your preferred SDK or framework.

Want to chat with our docs? Download an LLM-friendly text file of our [full\\
documentation](https://openrouter.ai/docs/llms-full.txt) and include it in your system prompt.

In the examples below, the OpenRouter-specific headers are optional. Setting them allows your app to appear on the OpenRouter leaderboards.

## Using the OpenAI SDK

PythonTypeScript

```code-block text-sm

1from openai import OpenAI23client = OpenAI(4  base_url="https://openrouter.ai/api/v1",5  api_key="<OPENROUTER_API_KEY>",6)78completion = client.chat.completions.create(9  extra_headers={10    "HTTP-Referer": "<YOUR_SITE_URL>", # Optional. Site URL for rankings on openrouter.ai.11    "X-Title": "<YOUR_SITE_NAME>", # Optional. Site title for rankings on openrouter.ai.12  },13  model="openai/gpt-4o",14  messages=[15    {16      "role": "user",17      "content": "What is the meaning of life?"18    }19  ]20)2122print(completion.choices[0].message.content)

```

## Using the OpenRouter API directly

PythonTypeScriptShell

```code-block text-sm

1import requests2import json34response = requests.post(5  url="https://openrouter.ai/api/v1/chat/completions",6  headers={7    "Authorization": "Bearer <OPENROUTER_API_KEY>",8    "HTTP-Referer": "<YOUR_SITE_URL>", # Optional. Site URL for rankings on openrouter.ai.9    "X-Title": "<YOUR_SITE_NAME>", # Optional. Site title for rankings on openrouter.ai.10  },11  data=json.dumps({12    "model": "openai/gpt-4o", # Optional13    "messages": [14      {15        "role": "user",16        "content": "What is the meaning of life?"17      }18    ]19  })20)
```

The API also supports [streaming](https://openrouter.ai/docs/api-reference/streaming).

## Using third-party SDKs

For information about using third-party SDKs and frameworks with OpenRouter, please [see our frameworks documentation.](https://openrouter.ai/docs/community/frameworks)

[Built with](https://buildwithfern.com/?utm_campaign=buildWith&utm_medium=docs&utm_source=openrouter.ai)