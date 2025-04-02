## For Providers

If you’d like to be a model provider and sell inference on OpenRouter, [fill out our form](https://openrouter.notion.site/15a2fd57c4dc8067bc61ecd5263b31fd) to get started.

To be eligible to provide inference on OpenRouter you must have the following:

### 1\. List Models Endpoint

You must implement an endpoint that returns all models that should be served by OpenRouter. At this endpoint, please return a list of all available models on your platform. Below is an example of the response format:

```code-block text-sm

1{2  "data": [3    {4      "id": "anthropic/claude-2.0",5      "name": "Anthropic: Claude v2.0",6      "created": 1690502400,7      "description": "Anthropic's flagship model...", // Optional8      "context_length": 100000, // Required9      "max_completion_tokens": 4096, // Optional10      "quantization": "fp8", // Required11      "pricing": {12        "prompt": "0.000008", // pricing per 1 token13        "completion": "0.000024", // pricing per 1 token14        "image": "0", // pricing per 1 image15        "request": "0" // pricing per 1 request16      }17    }18  ]19}
```

NOTE: `pricing` fields are in string format to avoid floating point precision issues, and must be in USD.

Valid quantization values are:
`int4`, `int8`, `fp4`, `fp6`, `fp8`, `fp16`, `bf16`, `fp32`

### 2\. Auto Top Up or Invoicing

For OpenRouter to use the provider we must be able to pay for inference automatically. This can be done via auto top up or invoicing.

[Built with](https://buildwithfern.com/?utm_campaign=buildWith&utm_medium=docs&utm_source=openrouter.ai)