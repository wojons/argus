OpenRouter’s request and response schemas are very similar to the OpenAI Chat API, with a few small differences. At a high level, **OpenRouter normalizes the schema across models and providers** so you only need to learn one.

## Requests

### Completions Request Format

Here is the request schema as a TypeScript type. This will be the body of your `POST` request to the `/api/v1/chat/completions` endpoint (see the [quick start](https://openrouter.ai/docs/quick-start) above for an example).

For a complete list of parameters, see the [Parameters](https://openrouter.ai/docs/api-reference/parameters).

Request Schema

```code-block text-sm

1// Definitions of subtypes are below2type Request = {3  // Either "messages" or "prompt" is required4  messages?: Message[];5  prompt?: string;67  // If "model" is unspecified, uses the user's default8  model?: string; // See "Supported Models" section910  // Allows to force the model to produce specific output format.11  // See models page and note on this docs page for which models support it.12  response_format?: { type: 'json_object' };1314  stop?: string | string[];15  stream?: boolean; // Enable streaming1617  // See LLM Parameters (openrouter.ai/docs/api-reference/parameters)18  max_tokens?: number; // Range: [1, context_length)19  temperature?: number; // Range: [0, 2]2021  // Tool calling22  // Will be passed down as-is for providers implementing OpenAI's interface.23  // For providers with custom interfaces, we transform and map the properties.24  // Otherwise, we transform the tools into a YAML template. The model responds with an assistant message.25  // See models supporting tool calling: openrouter.ai/models?supported_parameters=tools26  tools?: Tool[];27  tool_choice?: ToolChoice;2829  // Advanced optional parameters30  seed?: number; // Integer only31  top_p?: number; // Range: (0, 1]32  top_k?: number; // Range: [1, Infinity) Not available for OpenAI models33  frequency_penalty?: number; // Range: [-2, 2]34  presence_penalty?: number; // Range: [-2, 2]35  repetition_penalty?: number; // Range: (0, 2]36  logit_bias?: { [key: number]: number };37  top_logprobs: number; // Integer only38  min_p?: number; // Range: [0, 1]39  top_a?: number; // Range: [0, 1]4041  // Reduce latency by providing the model with a predicted output42  // https://platform.openai.com/docs/guides/latency-optimization#use-predicted-outputs43  prediction?: { type: 'content'; content: string };4445  // OpenRouter-only parameters46  // See "Prompt Transforms" section: openrouter.ai/docs/transforms47  transforms?: string[];48  // See "Model Routing" section: openrouter.ai/docs/model-routing49  models?: string[];50  route?: 'fallback';51  // See "Provider Routing" section: openrouter.ai/docs/provider-routing52  provider?: ProviderPreferences;53};5455// Subtypes:5657type TextContent = {58  type: 'text';59  text: string;60};6162type ImageContentPart = {63  type: 'image_url';64  image_url: {65    url: string; // URL or base64 encoded image data66    detail?: string; // Optional, defaults to "auto"67  };68};6970type ContentPart = TextContent | ImageContentPart;7172type Message =73  | {74      role: 'user' | 'assistant' | 'system';75      // ContentParts are only for the "user" role:76      content: string | ContentPart[];77      // If "name" is included, it will be prepended like this78      // for non-OpenAI models: `{name}: {content}`79      name?: string;80    }81  | {82      role: 'tool';83      content: string;84      tool_call_id: string;85      name?: string;86    };8788type FunctionDescription = {89  description?: string;90  name: string;91  parameters: object; // JSON Schema object92};9394type Tool = {95  type: 'function';96  function: FunctionDescription;97};9899type ToolChoice =100  | 'none'101  | 'auto'102  | {103      type: 'function';104      function: {105        name: string;106      };107    };

```

The `response_format` parameter ensures you receive a structured response from the LLM. The parameter is only supported by OpenAI models, Nitro models, and some others - check the providers on the model page on openrouter.ai/models to see if it’s supported, and set `require_parameters` to true in your Provider Preferences. See [Provider Routing](https://openrouter.ai/docs/features/provider-routing)

### Headers

OpenRouter allows you to specify some optional headers to identify your app and make it discoverable to users on our site.

- `HTTP-Referer`: Identifies your app on openrouter.ai
- `X-Title`: Sets/modifies your app’s title

TypeScript

```code-block text-sm

1fetch('https://openrouter.ai/api/v1/chat/completions', {2  method: 'POST',3  headers: {4    Authorization: 'Bearer <OPENROUTER_API_KEY>',5    'HTTP-Referer': '<YOUR_SITE_URL>', // Optional. Site URL for rankings on openrouter.ai.6    'X-Title': '<YOUR_SITE_NAME>', // Optional. Site title for rankings on openrouter.ai.7    'Content-Type': 'application/json',8  },9  body: JSON.stringify({10    model: 'openai/gpt-4o',11    messages: [12      {13        role: 'user',14        content: 'What is the meaning of life?',15      },16    ],17  }),18});
```

##### Model routing

If the `model` parameter is omitted, the user or payer’s default is used.
Otherwise, remember to select a value for `model` from the [supported\\
models](https://openrouter.ai/models) or [API](https://openrouter.ai/api/v1/models), and include the organization
prefix. OpenRouter will select the least expensive and best GPUs available to
serve the request, and fall back to other providers or GPUs if it receives a
5xx response code or if you are rate-limited.

##### Streaming

[Server-Sent Events\\
(SSE)](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events#event_stream_format)
are supported as well, to enable streaming _for all models_. Simply send
`stream: true` in your request body. The SSE stream will occasionally contain
a “comment” payload, which you should ignore (noted below).

##### Non-standard parameters

If the chosen model doesn’t support a request parameter (such as `logit_bias`
in non-OpenAI models, or `top_k` for OpenAI), then the parameter is ignored.
The rest are forwarded to the underlying model API.

### Assistant Prefill

OpenRouter supports asking models to complete a partial response. This can be useful for guiding models to respond in a certain way.

To use this features, simply include a message with `role: "assistant"` at the end of your `messages` array.

TypeScript

```code-block text-sm

1fetch('https://openrouter.ai/api/v1/chat/completions', {2  method: 'POST',3  headers: {4    Authorization: 'Bearer <OPENROUTER_API_KEY>',5    'Content-Type': 'application/json',6  },7  body: JSON.stringify({8    model: 'openai/gpt-4o',9    messages: [10      { role: 'user', content: 'What is the meaning of life?' },11      { role: 'assistant', content: "I'm not sure, but my best guess is" },12    ],13  }),14});
```

### Images & Multimodal

Multimodal requests are only available via the `/api/v1/chat/completions` API with a multi-part `messages` parameter. The `image_url` can either be a URL or a data-base64 encoded image.

```code-block text-sm

1"messages": [2  {3    "role": "user",4    "content": [5      {6        "type": "text",7        "text": "What's in this image?"8      },9      {10        "type": "image_url",11        "image_url": {12          "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/d/dd/Gfp-wisconsin-madison-the-nature-boardwalk.jpg/2560px-Gfp-wisconsin-madison-the-nature-boardwalk.jpg"13        }14      }15    ]16  }17]
```

Sample LLM response:

```code-block text-sm

1{2  "choices": [3    {4      "role": "assistant",5      "content": "This image depicts a scenic natural landscape featuring a long wooden boardwalk that stretches out through an expansive field of green grass. The boardwalk provides a clear path and invites exploration through the lush environment. The scene is surrounded by a variety of shrubbery and trees in the background, indicating a diverse plant life in the area."6    }7  ]8}

```

### Image Generation

Some models support native image generation capabilities. To generate images, you can include `modalities: ["image", "text"]` in your request. The model will respond with an image in the OpenAI ContentPartImage format, where the `image_url` contains a base64 data URL.

```code-block text-sm

1{2  "model": "openai/dall-e-3",3  "messages": [4    {5      "role": "user",6      "content": "Create a beautiful sunset over mountains"7    }8  ],9  "modalities": ["image", "text"]10}
```

Sample response with generated image:

```code-block text-sm

1{2  "choices": [3    {4      "message": {5        "role": "assistant",6        "content": [7          {8            "type": "text",9            "text": "Here's your requested sunset over mountains."10          },11          {12            "type": "image_url",13            "image_url": {14              "url": "data:image/png;base64,..."15            }16          }17        ]18      }19    }20  ]21}
```

#### Uploading base64 encoded images

For locally stored images, you can send them to the model using base64 encoding. Here’s an example:

TypeScript

```code-block text-sm

1import { readFile } from "fs/promises";23const getFlowerImage = async (): Promise<string> => {4  const imagePath = new URL("flower.jpg", import.meta.url);5  const imageBuffer = await readFile(imagePath);6  const base64Image = imageBuffer.toString("base64");7  return `data:image/jpeg;base64,${base64Image}`;8};910...1112"messages": [13  {14    role: "user",15    content: [16      {17        type: "text",18        text: "What's in this image?",19      },20      {21        type: "image_url",22        image_url: {23          url: `${await getFlowerImage()}`,24        },25      },26    ],27  },28];

```

When sending data-base64 string, ensure it contains the content-type of the image. Example:

```code-block text-sm

data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAIAQMAAAD+wSzIAAAABlBMVEX///+/v7+jQ3Y5AAAADklEQVQI12P4AIX8EAgALgAD/aNpbtEAAAAASUVORK5CYII
```

Supported content types are:

- `image/png`
- `image/jpeg`
- `image/webp`

## Responses

### CompletionsResponse Format

OpenRouter normalizes the schema across models and providers to comply with the [OpenAI Chat API](https://platform.openai.com/docs/api-reference/chat).

This means that `choices` is always an array, even if the model only returns one completion. Each choice will contain a `delta` property if a stream was requested and a `message` property otherwise. This makes it easier to use the same code for all models.

Here’s the response schema as a TypeScript type:

TypeScript

```code-block text-sm

1// Definitions of subtypes are below2type Response = {3  id: string;4  // Depending on whether you set "stream" to "true" and5  // whether you passed in "messages" or a "prompt", you6  // will get a different output shape7  choices: (NonStreamingChoice | StreamingChoice | NonChatChoice)[];8  created: number; // Unix timestamp9  model: string;10  object: 'chat.completion' | 'chat.completion.chunk';1112  system_fingerprint?: string; // Only present if the provider supports it1314  // Usage data is always returned for non-streaming.15  // When streaming, you will get one usage object at16  // the end accompanied by an empty choices array.17  usage?: ResponseUsage;18};
```

```code-block text-sm

1// If the provider returns usage, we pass it down2// as-is. Otherwise, we count using the GPT-4 tokenizer.34type ResponseUsage = {5  /** Including images and tools if any */6  prompt_tokens: number;7  /** The tokens generated */8  completion_tokens: number;9  /** Sum of the above two fields */10  total_tokens: number;11};
```

```code-block text-sm

1// Subtypes:2type NonChatChoice = {3  finish_reason: string | null;4  text: string;5  error?: ErrorResponse;6};78type NonStreamingChoice = {9  finish_reason: string | null;10  native_finish_reason: string | null;11  message: {12    content: string | null;13    role: string;14    tool_calls?: ToolCall[];15  };16  error?: ErrorResponse;17};1819type StreamingChoice = {20  finish_reason: string | null;21  native_finish_reason: string | null;22  delta: {23    content: string | null;24    role?: string;25    tool_calls?: ToolCall[];26  };27  error?: ErrorResponse;28};2930type ErrorResponse = {31  code: number; // See "Error Handling" section32  message: string;33  metadata?: Record<string, unknown>; // Contains additional error information such as provider details, the raw error message, etc.34};3536type ToolCall = {37  id: string;38  type: 'function';39  function: FunctionCall;40};

```

Here’s an example:

```code-block text-sm

1{2  "id": "gen-xxxxxxxxxxxxxx",3  "choices": [4    {5      "finish_reason": "stop", // Normalized finish_reason6      "native_finish_reason": "stop", // The raw finish_reason from the provider7      "message": {8        // will be "delta" if streaming9        "role": "assistant",10        "content": "Hello there!"11      }12    }13  ],14  "usage": {15    "prompt_tokens": 0,16    "completion_tokens": 4,17    "total_tokens": 418  },19  "model": "openai/gpt-3.5-turbo" // Could also be "anthropic/claude-2.1", etc, depending on the "model" that ends up being used20}
```

### Finish Reason

OpenRouter normalizes each model’s `finish_reason` to one of the following values: `tool_calls`, `stop`, `length`, `content_filter`, `error`.

Some models and providers may have additional finish reasons. The raw finish\_reason string returned by the model is available via the `native_finish_reason` property.

### Querying Cost and Stats

The token counts that are returned in the completions API response are **not** counted via the model’s native tokenizer. Instead it uses a normalized, model-agnostic count (accomplished via the GPT4o tokenizer). This is because some providers do not reliably return native token counts. This behavior is becoming more rare, however, and we may add native token counts to the response object in the future.

Credit usage and model pricing are based on the **native** token counts (not the ‘normalized’ token counts returned in the API response).

For precise token accounting using the model’s native tokenizer, you can retrieve the full generation information via the `/api/v1/generation` endpoint.

You can use the returned `id` to query for the generation stats (including token counts and cost) after the request is complete. This is how you can get the cost and tokens for _all models and requests_, streaming and non-streaming.

Query Generation Stats

```code-block text-sm

1const generation = await fetch(2  'https://openrouter.ai/api/v1/generation?id=$GENERATION_ID',3  { headers },4);56const stats = await generation.json();
```

Please see the [Generation](https://openrouter.ai/docs/api-reference/get-a-generation) API reference for the full response shape.

Note that token counts are also available in the `usage` field of the response body for non-streaming completions.

[Built with](https://buildwithfern.com/?utm_campaign=buildWith&utm_medium=docs&utm_source=openrouter.ai)