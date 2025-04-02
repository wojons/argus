OpenRouter routes requests to the best available providers for your model. By default, [requests are load balanced](https://openrouter.ai/docs/features/provider-routing#load-balancing-default-strategy) across the top providers to maximize uptime.

You can customize how your requests are routed using the `provider` object in the request body for [Chat Completions](https://openrouter.ai/docs/api-reference/chat-completion) and [Completions](https://openrouter.ai/docs/api-reference/completion).

For a complete list of valid provider names to use in the API, see the [full\\
provider schema](https://openrouter.ai/docs/features/provider-routing#json-schema-for-provider-preferences).

The `provider` object can contain the following fields:

| Field | Type | Default | Description |
| --- | --- | --- | --- |
| `order` | string\[\] | - | List of provider names to try in order (e.g. `["Anthropic", "OpenAI"]`). [Learn more](https://openrouter.ai/docs/features/provider-routing#ordering-specific-providers) |
| `allow_fallbacks` | boolean | `true` | Whether to allow backup providers when the primary is unavailable. [Learn more](https://openrouter.ai/docs/features/provider-routing#disabling-fallbacks) |
| `require_parameters` | boolean | `false` | Only use providers that support all parameters in your request. [Learn more](https://openrouter.ai/docs/features/provider-routing#requiring-providers-to-support-all-parameters-beta) |
| `data_collection` | ”allow” \| “deny" | "allow” | Control whether to use providers that may store data. [Learn more](https://openrouter.ai/docs/features/provider-routing#requiring-providers-to-comply-with-data-policies) |
| `ignore` | string\[\] | - | List of provider names to skip for this request. [Learn more](https://openrouter.ai/docs/features/provider-routing#ignoring-providers) |
| `quantizations` | string\[\] | - | List of quantization levels to filter by (e.g. `["int4", "int8"]`). [Learn more](https://openrouter.ai/docs/features/provider-routing#quantization) |
| `sort` | string | - | Sort providers by price or throughput. (e.g. `"price"` or `"throughput"`). [Learn more](https://openrouter.ai/docs/features/provider-routing#provider-sorting) |

## Price-Based Load Balancing (Default Strategy)

For each model in your request, OpenRouter’s default behavior is to load balance requests across providers, prioritizing price.

If you are more sensitive to throughput than price, you can use the `sort` field to explicitly prioritize throughput.

When you send a request with `tools` or `tool_choice`, OpenRouter will only
route to providers that support tool use. Similarly, if you set a
`max_tokens`, then OpenRouter will only route to providers that support a
response of that length.

Here is OpenRouter’s default load balancing strategy:

1. Prioritize providers that have not seen significant outages in the last 30 seconds.
2. For the stable providers, look at the lowest-cost candidates and select one weighted by inverse square of the price (example below).
3. Use the remaining providers as fallbacks.

##### A Load Balancing Example

If Provider A costs $1 per million tokens, Provider B costs $2, and Provider C costs $3, and Provider B recently saw a few outages.

- Your request is routed to Provider A. Provider A is 9x more likely to be first routed to Provider A than Provider C because (1/32=1/9)(1 / 3^2 = 1/9)(1/32=1/9) (inverse square of the price).
- If Provider A fails, then Provider C will be tried next.
- If Provider C also fails, Provider B will be tried last.

If you have `sort` or `order` set in your provider preferences, load balancing will be disabled.

## Provider Sorting

As described above, OpenRouter load balances based on price, while taking uptime into account.

If you instead want to _explicitly_ prioritize a particular provider attribute, you can include the `sort` field in the `provider` preferences. Load balancing will be disabled, and the router will try providers in order.

The three sort options are:

- `"price"`: prioritize lowest price
- `"throughput"`: prioritize highest throughput
- `"latency"`: prioritize lowest latency

TypeScript Example with Fallbacks EnabledPython Example with Fallbacks Enabled

```code-block text-sm

1fetch('https://openrouter.ai/api/v1/chat/completions', {2  method: 'POST',3  headers: {4    'Authorization': 'Bearer <OPENROUTER_API_KEY>',5    'HTTP-Referer': '<YOUR_SITE_URL>', // Optional. Site URL for rankings on openrouter.ai.6    'X-Title': '<YOUR_SITE_NAME>', // Optional. Site title for rankings on openrouter.ai.7    'Content-Type': 'application/json',8  },9  body: JSON.stringify({10    'model': 'meta-llama/llama-3.1-70b-instruct',11    'messages': [12      {13        'role': 'user',14        'content': 'Hello'15      }16    ],17    'provider': {18      'sort': 'throughput'19    }20  }),21});
```

To _always_ prioritize low prices, and not apply any load balancing, set `sort` to `"price"`.

To _always_ prioritize low latency, and not apply any load balancing, set `sort` to `"latency"`.

## Nitro Shortcut

You can append `:nitro` to any model slug as a shortcut to sort by throughput. This is exactly equivalent to setting `provider.sort` to `"throughput"`.

TypeScript Example using Nitro shortcutPython Example using Nitro shortcut

```code-block text-sm

1fetch('https://openrouter.ai/api/v1/chat/completions', {2  method: 'POST',3  headers: {4    'Authorization': 'Bearer <OPENROUTER_API_KEY>',5    'HTTP-Referer': '<YOUR_SITE_URL>', // Optional. Site URL for rankings on openrouter.ai.6    'X-Title': '<YOUR_SITE_NAME>', // Optional. Site title for rankings on openrouter.ai.7    'Content-Type': 'application/json',8  },9  body: JSON.stringify({10    'model': 'meta-llama/llama-3.1-70b-instruct:nitro',11    'messages': [12      {13        'role': 'user',14        'content': 'Hello'15      }16    ]17  }),18});
```

## Floor Price Shortcut

You can append `:floor` to any model slug as a shortcut to sort by price. This is exactly equivalent to setting `provider.sort` to `"price"`.

TypeScript Example using Floor shortcutPython Example using Floor shortcut

```code-block text-sm

1fetch('https://openrouter.ai/api/v1/chat/completions', {2  method: 'POST',3  headers: {4    'Authorization': 'Bearer <OPENROUTER_API_KEY>',5    'HTTP-Referer': '<YOUR_SITE_URL>', // Optional. Site URL for rankings on openrouter.ai.6    'X-Title': '<YOUR_SITE_NAME>', // Optional. Site title for rankings on openrouter.ai.7    'Content-Type': 'application/json',8  },9  body: JSON.stringify({10    'model': 'meta-llama/llama-3.1-70b-instruct:floor',11    'messages': [12      {13        'role': 'user',14        'content': 'Hello'15      }16    ]17  }),18});
```

## Ordering Specific Providers

You can set the providers that OpenRouter will prioritize for your request using the `order` field.

| Field | Type | Default | Description |
| --- | --- | --- | --- |
| `order` | string\[\] | - | List of provider names to try in order (e.g. `["Anthropic", "OpenAI"]`). |

The router will prioritize providers in this list, and in this order, for the model you’re using. If you don’t set this field, the router will [load balance](https://openrouter.ai/docs/features/provider-routing#load-balancing-default-strategy) across the top providers to maximize uptime.

OpenRouter will try them one at a time and proceed to other providers if none are operational. If you don’t want to allow any other providers, you should [disable fallbacks](https://openrouter.ai/docs/features/provider-routing#disabling-fallbacks) as well.

### Example: Specifying providers with fallbacks

This example skips over OpenAI (which doesn’t host Mixtral), tries Together, and then falls back to the normal list of providers on OpenRouter:

TypeScript Example with Fallbacks EnabledPython Example with Fallbacks Enabled

```code-block text-sm

1fetch('https://openrouter.ai/api/v1/chat/completions', {2  method: 'POST',3  headers: {4    'Authorization': 'Bearer <OPENROUTER_API_KEY>',5    'HTTP-Referer': '<YOUR_SITE_URL>', // Optional. Site URL for rankings on openrouter.ai.6    'X-Title': '<YOUR_SITE_NAME>', // Optional. Site title for rankings on openrouter.ai.7    'Content-Type': 'application/json',8  },9  body: JSON.stringify({10    'model': 'mistralai/mixtral-8x7b-instruct',11    'messages': [12      {13        'role': 'user',14        'content': 'Hello'15      }16    ],17    'provider': {18      'order': [19        'OpenAI',20        'Together'21      ]22    }23  }),24});
```

### Example: Specifying providers with fallbacks disabled

Here’s an example with `allow_fallbacks` set to `false` that skips over OpenAI (which doesn’t host Mixtral), tries Together, and then fails if Together fails:

TypeScript Example with Fallbacks DisabledPython Example with Fallbacks Disabled

```code-block text-sm

1fetch('https://openrouter.ai/api/v1/chat/completions', {2  method: 'POST',3  headers: {4    'Authorization': 'Bearer <OPENROUTER_API_KEY>',5    'HTTP-Referer': '<YOUR_SITE_URL>', // Optional. Site URL for rankings on openrouter.ai.6    'X-Title': '<YOUR_SITE_NAME>', // Optional. Site title for rankings on openrouter.ai.7    'Content-Type': 'application/json',8  },9  body: JSON.stringify({10    'model': 'mistralai/mixtral-8x7b-instruct',11    'messages': [12      {13        'role': 'user',14        'content': 'Hello'15      }16    ],17    'provider': {18      'order': [19        'OpenAI',20        'Together'21      ],22      'allow_fallbacks': false23    }24  }),25});
```

## Requiring Providers to Support All Parameters (beta)

You can restrict requests only to providers that support all parameters in your request using the `require_parameters` field.

| Field | Type | Default | Description |
| --- | --- | --- | --- |
| `require_parameters` | boolean | `false` | Only use providers that support all parameters in your request. |

With the default routing strategy, providers that don’t support all the [LLM parameters](https://openrouter.ai/docs/api-reference/parameters) specified in your request can still receive the request, but will ignore unknown parameters. When you set `require_parameters` to `true`, the request won’t even be routed to that provider.

### Example: Excluding providers that don’t support JSON formatting

For example, to only use providers that support JSON formatting:

TypeScript Python

```code-block text-sm

1fetch('https://openrouter.ai/api/v1/chat/completions', {2  method: 'POST',3  headers: {4    'Authorization': 'Bearer <OPENROUTER_API_KEY>',5    'HTTP-Referer': '<YOUR_SITE_URL>', // Optional. Site URL for rankings on openrouter.ai.6    'X-Title': '<YOUR_SITE_NAME>', // Optional. Site title for rankings on openrouter.ai.7    'Content-Type': 'application/json',8  },9  body: JSON.stringify({10    'messages': [11      {12        'role': 'user',13        'content': 'Hello'14      }15    ],16    'provider': {17      'require_parameters': true18    },19    'response_format': {20      'type': 'json_object'21    }22  }),23});
```

## Requiring Providers to Comply with Data Policies

You can restrict requests only to providers that comply with your data policies using the `data_collection` field.

| Field | Type | Default | Description |
| --- | --- | --- | --- |
| `data_collection` | ”allow” \| “deny" | "allow” | Control whether to use providers that may store data. |

- `allow`: (default) allow providers which store user data non-transiently and may train on it
- `deny`: use only providers which do not collect user data

Some model providers may log prompts, so we display them with a **Data Policy** tag on model pages. This is not a definitive source of third party data policies, but represents our best knowledge.

##### Account-Wide Data Policy Filtering

This is also available as an account-wide setting in [your privacy\\
settings](https://openrouter.ai/settings/privacy). You can disable third party
model providers that store inputs for training.

### Example: Excluding providers that don’t comply with data policies

To exclude providers that don’t comply with your data policies, set `data_collection` to `deny`:

TypeScript Python

```code-block text-sm

1fetch('https://openrouter.ai/api/v1/chat/completions', {2  method: 'POST',3  headers: {4    'Authorization': 'Bearer <OPENROUTER_API_KEY>',5    'HTTP-Referer': '<YOUR_SITE_URL>', // Optional. Site URL for rankings on openrouter.ai.6    'X-Title': '<YOUR_SITE_NAME>', // Optional. Site title for rankings on openrouter.ai.7    'Content-Type': 'application/json',8  },9  body: JSON.stringify({10    'messages': [11      {12        'role': 'user',13        'content': 'Hello'14      }15    ],16    'provider': {17      'data_collection': 'deny'18    }19  }),20});
```

## Disabling Fallbacks

To guarantee that your request is only served by the top (lowest-cost) provider, you can disable fallbacks.

This is combined with the `order` field from [Ordering Specific Providers](https://openrouter.ai/docs/features/provider-routing#ordering-specific-providers) to restrict the providers that OpenRouter will prioritize to just your chosen list.

TypeScript Python

```code-block text-sm

1fetch('https://openrouter.ai/api/v1/chat/completions', {2  method: 'POST',3  headers: {4    'Authorization': 'Bearer <OPENROUTER_API_KEY>',5    'HTTP-Referer': '<YOUR_SITE_URL>', // Optional. Site URL for rankings on openrouter.ai.6    'X-Title': '<YOUR_SITE_NAME>', // Optional. Site title for rankings on openrouter.ai.7    'Content-Type': 'application/json',8  },9  body: JSON.stringify({10    'messages': [11      {12        'role': 'user',13        'content': 'Hello'14      }15    ],16    'provider': {17      'allow_fallbacks': false18    }19  }),20});
```

## Ignoring Providers

You can ignore providers for a request by setting the `ignore` field in the `provider` object.

| Field | Type | Default | Description |
| --- | --- | --- | --- |
| `ignore` | string\[\] | - | List of provider names to skip for this request. |

Ignoring multiple providers may significantly reduce fallback options and
limit request recovery.

##### Account-Wide Ignored Providers

You can ignore providers for all account requests by configuring your [preferences](https://openrouter.ai/settings/preferences). This configuration applies to all API requests and chatroom messages.

Note that when you ignore providers for a specific request, the list of ignored providers is merged with your account-wide ignored providers.

### Example: Ignoring Azure for a request calling GPT-4 Omni

Here’s an example that will ignore Azure for a request calling GPT-4 Omni:

TypeScript Python

```code-block text-sm

1fetch('https://openrouter.ai/api/v1/chat/completions', {2  method: 'POST',3  headers: {4    'Authorization': 'Bearer <OPENROUTER_API_KEY>',5    'HTTP-Referer': '<YOUR_SITE_URL>', // Optional. Site URL for rankings on openrouter.ai.6    'X-Title': '<YOUR_SITE_NAME>', // Optional. Site title for rankings on openrouter.ai.7    'Content-Type': 'application/json',8  },9  body: JSON.stringify({10    'model': 'openai/gpt-4o',11    'messages': [12      {13        'role': 'user',14        'content': 'Hello'15      }16    ],17    'provider': {18      'ignore': [19        'Azure'20      ]21    }22  }),23});
```

## Quantization

Quantization reduces model size and computational requirements while aiming to preserve performance. Most LLMs today use FP16 or BF16 for training and inference, cutting memory requirements in half compared to FP32. Some optimizations use FP8 or quantization to reduce size further (e.g., INT8, INT4).

| Field | Type | Default | Description |
| --- | --- | --- | --- |
| `quantizations` | string\[\] | - | List of quantization levels to filter by (e.g. `["int4", "int8"]`). [Learn more](https://openrouter.ai/docs/features/provider-routing#quantization) |

Quantized models may exhibit degraded performance for certain prompts,
depending on the method used.

Providers can support various quantization levels for open-weight models.

### Quantization Levels

By default, requests are load-balanced across all available providers, ordered by price. To filter providers by quantization level, specify the `quantizations` field in the `provider` parameter with the following values:

- `int4`: Integer (4 bit)
- `int8`: Integer (8 bit)
- `fp4`: Floating point (4 bit)
- `fp6`: Floating point (6 bit)
- `fp8`: Floating point (8 bit)
- `fp16`: Floating point (16 bit)
- `bf16`: Brain floating point (16 bit)
- `fp32`: Floating point (32 bit)
- `unknown`: Unknown

### Example: Requesting FP8 Quantization

Here’s an example that will only use providers that support FP8 quantization:

TypeScript Python

```code-block text-sm

1fetch('https://openrouter.ai/api/v1/chat/completions', {2  method: 'POST',3  headers: {4    'Authorization': 'Bearer <OPENROUTER_API_KEY>',5    'HTTP-Referer': '<YOUR_SITE_URL>', // Optional. Site URL for rankings on openrouter.ai.6    'X-Title': '<YOUR_SITE_NAME>', // Optional. Site title for rankings on openrouter.ai.7    'Content-Type': 'application/json',8  },9  body: JSON.stringify({10    'model': 'meta-llama/llama-3.1-8b-instruct',11    'messages': [12      {13        'role': 'user',14        'content': 'Hello'15      }16    ],17    'provider': {18      'quantizations': [19        'fp8'20      ]21    }22  }),23});
```

## Terms of Service

You can view the terms of service for each provider below. You may not violate the terms of service or policies of third-party providers that power the models on OpenRouter.

- `OpenAI`: [https://openai.com/policies/row-terms-of-use/](https://openai.com/policies/row-terms-of-use/)
- `Anthropic`: [https://www.anthropic.com/legal/commercial-terms](https://www.anthropic.com/legal/commercial-terms)
- `Google Vertex`: [https://cloud.google.com/terms/](https://cloud.google.com/terms/)
- `Google AI Studio`: [https://cloud.google.com/terms/](https://cloud.google.com/terms/)
- `Amazon Bedrock`: [https://aws.amazon.com/service-terms/](https://aws.amazon.com/service-terms/)
- `Groq`: [https://groq.com/terms-of-use/](https://groq.com/terms-of-use/)
- `SambaNova`: [https://sambanova.ai/terms-and-conditions](https://sambanova.ai/terms-and-conditions)
- `Cohere`: [https://cohere.com/terms-of-use](https://cohere.com/terms-of-use)
- `Mistral`: [https://mistral.ai/terms/#terms-of-use](https://mistral.ai/terms/#terms-of-use)
- `Together`: [https://www.together.ai/terms-of-service](https://www.together.ai/terms-of-service)
- `Together (lite)`: [https://www.together.ai/terms-of-service](https://www.together.ai/terms-of-service)
- `Fireworks`: [https://fireworks.ai/terms-of-service](https://fireworks.ai/terms-of-service)
- `DeepInfra`: [https://deepinfra.com/docs/data](https://deepinfra.com/docs/data)
- `Lepton`: [https://www.lepton.ai/policies/tos](https://www.lepton.ai/policies/tos)
- `NovitaAI`: [https://novita.ai/legal/terms-of-service](https://novita.ai/legal/terms-of-service)
- `Avian.io`: [https://avian.io/privacy](https://avian.io/privacy)
- `Lambda`: [https://lambdalabs.com/legal/privacy-policy](https://lambdalabs.com/legal/privacy-policy)
- `Azure`: [https://www.microsoft.com/en-us/legal/terms-of-use?oneroute=true](https://www.microsoft.com/en-us/legal/terms-of-use?oneroute=true)
- `Modal`: [https://modal.com/legal/terms](https://modal.com/legal/terms)
- `AnyScale`: [https://www.anyscale.com/terms](https://www.anyscale.com/terms)
- `Replicate`: [https://replicate.com/terms](https://replicate.com/terms)
- `Perplexity`: [https://www.perplexity.ai/hub/legal/perplexity-api-terms-of-service](https://www.perplexity.ai/hub/legal/perplexity-api-terms-of-service)
- `Recursal`: [https://featherless.ai/terms](https://featherless.ai/terms)
- `OctoAI`: [https://octo.ai/docs/faqs/privacy-and-security](https://octo.ai/docs/faqs/privacy-and-security)
- `DeepSeek`: [https://chat.deepseek.com/downloads/DeepSeek%20Terms%20of%20Use.html](https://chat.deepseek.com/downloads/DeepSeek%20Terms%20of%20Use.html)
- `Infermatic`: [https://infermatic.ai/privacy-policy/](https://infermatic.ai/privacy-policy/)
- `AI21`: [https://studio.ai21.com/privacy-policy](https://studio.ai21.com/privacy-policy)
- `Featherless`: [https://featherless.ai/terms](https://featherless.ai/terms)
- `Inflection`: [https://developers.inflection.ai/tos](https://developers.inflection.ai/tos)
- `xAI`: [https://x.ai/legal/terms-of-service](https://x.ai/legal/terms-of-service)
- `Cloudflare`: [https://www.cloudflare.com/service-specific-terms-developer-platform/#developer-platform-terms](https://www.cloudflare.com/service-specific-terms-developer-platform/#developer-platform-terms)
- `SF Compute`: [https://inference.sfcompute.com/privacy](https://inference.sfcompute.com/privacy)
- `Minimax`: [https://intl.minimaxi.com/protocol/terms-of-service](https://intl.minimaxi.com/protocol/terms-of-service)
- `Nineteen`: [https://nineteen.ai/tos](https://nineteen.ai/tos)
- `Liquid`: [https://www.liquid.ai/terms-conditions](https://www.liquid.ai/terms-conditions)
- `nCompass`: [https://ncompass.tech/terms](https://ncompass.tech/terms)
- `inference.net`: [https://inference.net/terms](https://inference.net/terms)
- `Friendli`: [https://friendli.ai/terms-of-service](https://friendli.ai/terms-of-service)
- `AionLabs`: [https://www.aionlabs.ai/terms/](https://www.aionlabs.ai/terms/)
- `Alibaba`: [https://www.alibabacloud.com/help/en/legal/latest/alibaba-cloud-international-website-product-terms-of-service-v-3-8-0](https://www.alibabacloud.com/help/en/legal/latest/alibaba-cloud-international-website-product-terms-of-service-v-3-8-0)
- `Nebius AI Studio`: [https://docs.nebius.com/legal/studio/terms-of-use/](https://docs.nebius.com/legal/studio/terms-of-use/)
- `Chutes`: [https://chutes.ai/tos](https://chutes.ai/tos)
- `kluster.ai`: [https://www.kluster.ai/terms-of-use](https://www.kluster.ai/terms-of-use)
- `Crusoe`: [https://legal.crusoe.ai/open-router#managed-inference-tos-open-router](https://legal.crusoe.ai/open-router#managed-inference-tos-open-router)
- `Targon`: [https://targon.com/terms](https://targon.com/terms)
- `Ubicloud`: [https://www.ubicloud.com/docs/about/terms-of-service](https://www.ubicloud.com/docs/about/terms-of-service)
- `Parasail`: [https://www.parasail.io/legal/terms](https://www.parasail.io/legal/terms)
- `01.AI`: [https://platform.01.ai/privacypolicy](https://platform.01.ai/privacypolicy)
- `HuggingFace`: [https://huggingface.co/terms-of-service](https://huggingface.co/terms-of-service)
- `Mancer`: [https://mancer.tech/terms](https://mancer.tech/terms)
- `Mancer (private)`: [https://mancer.tech/terms](https://mancer.tech/terms)
- `Hyperbolic`: [https://hyperbolic.xyz/privacy](https://hyperbolic.xyz/privacy)
- `Hyperbolic (quantized)`: [https://hyperbolic.xyz/privacy](https://hyperbolic.xyz/privacy)
- `Lynn`: [https://api.lynn.app/policy](https://api.lynn.app/policy)

## JSON Schema for Provider Preferences

For a complete list of options, see this JSON schema:

Provider Preferences Schema

```code-block text-sm

1{2    "$ref": "#/definitions/Provider Preferences Schema",3    "definitions": {4      "Provider Preferences Schema": {5        "type": "object",6        "properties": {7          "allow_fallbacks": {8            "type": [9              "boolean",10              "null"11            ],12            "description": "Whether to allow backup providers to serve requests\n- true: (default) when the primary provider (or your custom providers in \"order\") is unavailable, use the next best provider.\n- false: use only the primary/custom provider, and return the upstream error if it's unavailable.\n"13          },14          "require_parameters": {15            "type": [16              "boolean",17              "null"18            ],19            "description": "Whether to filter providers to only those that support the parameters you've provided. If this setting is omitted or set to false, then providers will receive only the parameters they support, and ignore the rest."20          },21          "data_collection": {22            "anyOf": [23              {24                "type": "string",25                "enum": [26                  "deny",27                  "allow"28                ]29              },30              {31                "type": "null"32              }33            ],34            "description": "Data collection setting. If no available model provider meets the requirement, your request will return an error.\n- allow: (default) allow providers which store user data non-transiently and may train on it\n- deny: use only providers which do not collect user data.\n"35          },36          "order": {37            "anyOf": [38              {39                "type": "array",40                "items": {41                  "type": "string",42                  "enum": [43                    "OpenAI",44                    "Anthropic",45                    "Google",46                    "Google AI Studio",47                    "Amazon Bedrock",48                    "Groq",49                    "SambaNova",50                    "Cohere",51                    "Mistral",52                    "Together",53                    "Together 2",54                    "Fireworks",55                    "DeepInfra",56                    "Lepton",57                    "Novita",58                    "Avian",59                    "Lambda",60                    "Azure",61                    "Modal",62                    "AnyScale",63                    "Replicate",64                    "Perplexity",65                    "Recursal",66                    "OctoAI",67                    "DeepSeek",68                    "Infermatic",69                    "AI21",70                    "Featherless",71                    "Inflection",72                    "xAI",73                    "Cloudflare",74                    "SF Compute",75                    "Minimax",76                    "Nineteen",77                    "Liquid",78                    "NCompass",79                    "InferenceNet",80                    "Friendli",81                    "AionLabs",82                    "Alibaba",83                    "Nebius",84                    "Chutes",85                    "Kluster",86                    "Crusoe",87                    "Targon",88                    "Ubicloud",89                    "Parasail",90                    "01.AI",91                    "HuggingFace",92                    "Mancer",93                    "Mancer 2",94                    "Hyperbolic",95                    "Hyperbolic 2",96                    "Lynn 2",97                    "Lynn",98                    "Reflection"99                  ]100                }101              },102              {103                "type": "null"104              }105            ],106            "description": "An ordered list of provider names. The router will attempt to use the first provider in the subset of this list that supports your requested model, and fall back to the next if it is unavailable. If no providers are available, the request will fail with an error message."107          },108          "ignore": {109            "anyOf": [110              {111                "type": "array",112                "items": {113                  "type": "string",114                  "enum": [115                    "OpenAI",116                    "Anthropic",117                    "Google",118                    "Google AI Studio",119                    "Amazon Bedrock",120                    "Groq",121                    "SambaNova",122                    "Cohere",123                    "Mistral",124                    "Together",125                    "Together 2",126                    "Fireworks",127                    "DeepInfra",128                    "Lepton",129                    "Novita",130                    "Avian",131                    "Lambda",132                    "Azure",133                    "Modal",134                    "AnyScale",135                    "Replicate",136                    "Perplexity",137                    "Recursal",138                    "OctoAI",139                    "DeepSeek",140                    "Infermatic",141                    "AI21",142                    "Featherless",143                    "Inflection",144                    "xAI",145                    "Cloudflare",146                    "SF Compute",147                    "Minimax",148                    "Nineteen",149                    "Liquid",150                    "NCompass",151                    "InferenceNet",152                    "Friendli",153                    "AionLabs",154                    "Alibaba",155                    "Nebius",156                    "Chutes",157                    "Kluster",158                    "Crusoe",159                    "Targon",160                    "Ubicloud",161                    "Parasail",162                    "01.AI",163                    "HuggingFace",164                    "Mancer",165                    "Mancer 2",166                    "Hyperbolic",167                    "Hyperbolic 2",168                    "Lynn 2",169                    "Lynn",170                    "Reflection"171                  ]172                }173              },174              {175                "type": "null"176              }177            ],178            "description": "List of provider names to ignore. If provided, this list is merged with your account-wide ignored provider settings for this request."179          },180          "quantizations": {181            "anyOf": [182              {183                "type": "array",184                "items": {185                  "type": "string",186                  "enum": [187                    "int4",188                    "int8",189                    "fp4",190                    "fp6",191                    "fp8",192                    "fp16",193                    "bf16",194                    "fp32",195                    "unknown"196                  ]197                }198              },199              {200                "type": "null"201              }202            ],203            "description": "A list of quantization levels to filter the provider by."204          },205          "sort": {206            "anyOf": [207              {208                "type": "string",209                "enum": [210                  "price",211                  "throughput",212                  "latency"213                ]214              },215              {216                "type": "null"217              }218            ],219            "description": "The sorting strategy to use for this request, if \"order\" is not specified. When set, no load balancing is performed."220          }221        },222        "additionalProperties": false223      }224    },225    "$schema": "http://json-schema.org/draft-07/schema#"226  }

```

[Built with](https://buildwithfern.com/?utm_campaign=buildWith&utm_medium=docs&utm_source=openrouter.ai)