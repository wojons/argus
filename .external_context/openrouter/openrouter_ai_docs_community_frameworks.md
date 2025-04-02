You can find a few examples of using OpenRouter with other frameworks in [this Github repository](https://github.com/OpenRouterTeam/openrouter-examples). Here are some examples:

## Using the OpenAI SDK

- Using `pip install openai`: [github](https://github.com/OpenRouterTeam/openrouter-examples-python/blob/main/src/openai_test.py).
- Using `npm i openai`: [github](https://github.com/OpenRouterTeam/openrouter-examples/blob/main/examples/openai/index.ts).












You can also use
[Grit](https://app.grit.io/studio?key=RKC0n7ikOiTGTNVkI8uRS) to
automatically migrate your code. Simply run `npx @getgrit/launcher   openrouter`.


TypeScriptPython

```code-block text-sm

1import OpenAI from "openai"23const openai = new OpenAI({4  baseURL: "https://openrouter.ai/api/v1",5  apiKey: "${API_KEY_REF}",6  defaultHeaders: {7    ${getHeaderLines().join('\n        ')}8  },9})1011async function main() {12  const completion = await openai.chat.completions.create({13    model: "${Model.GPT_4_Omni}",14    messages: [15      { role: "user", content: "Say this is a test" }16    ],17  })1819  console.log(completion.choices[0].message)20}21main();
```

## Using LangChain

- Using [LangChain for Python](https://github.com/langchain-ai/langchain): [github](https://github.com/alexanderatallah/openrouter-streamlit/blob/main/pages/2_Langchain_Quickstart.py)
- Using [LangChain.js](https://github.com/langchain-ai/langchainjs): [github](https://github.com/OpenRouterTeam/openrouter-examples/blob/main/examples/langchain/index.ts)
- Using [Streamlit](https://streamlit.io/): [github](https://github.com/alexanderatallah/openrouter-streamlit)

TypeScriptPython

```code-block text-sm

1const chat = new ChatOpenAI(2  {3    modelName: '<model_name>',4    temperature: 0.8,5    streaming: true,6    openAIApiKey: '${API_KEY_REF}',7  },8  {9    basePath: 'https://openrouter.ai/api/v1',10    baseOptions: {11      headers: {12        'HTTP-Referer': '<YOUR_SITE_URL>', // Optional. Site URL for rankings on openrouter.ai.13        'X-Title': '<YOUR_SITE_NAME>', // Optional. Site title for rankings on openrouter.ai.14      },15    },16  },17);
```

* * *

## Using PydanticAI

[PydanticAI](https://github.com/pydantic/pydantic-ai) provides a high-level interface for working with various LLM providers, including OpenRouter.

### Installation

```code-block text-sm

$pip install 'pydantic-ai-slim[openai]'
```

### Configuration

You can use OpenRouter with PydanticAI through its OpenAI-compatible interface:

```code-block text-sm

1from pydantic_ai import Agent2from pydantic_ai.models.openai import OpenAIModel34model = OpenAIModel(5    "anthropic/claude-3.5-sonnet",  # or any other OpenRouter model6    base_url="https://openrouter.ai/api/v1",7    api_key="sk-or-...",8)910agent = Agent(model)11result = await agent.run("What is the meaning of life?")12print(result)
```

For more details about using PydanticAI with OpenRouter, see the [PydanticAI documentation](https://ai.pydantic.dev/models/#api_key-argument).

* * *

## Vercel AI SDK

You can use the [Vercel AI SDK](https://www.npmjs.com/package/ai) to integrate OpenRouter with your Next.js app. To get started, install [@openrouter/ai-sdk-provider](https://github.com/OpenRouterTeam/ai-sdk-provider):

```code-block text-sm

$npm install @openrouter/ai-sdk-provider
```

And then you can use [streamText()](https://sdk.vercel.ai/docs/reference/ai-sdk-core/stream-text) API to stream text from OpenRouter.

TypeScript

```code-block text-sm

1import { createOpenRouter } from '@openrouter/ai-sdk-provider';2import { streamText } from 'ai';3import { z } from 'zod';45export const getLasagnaRecipe = async (modelName: string) => {6  const openrouter = createOpenRouter({7    apiKey: '${API_KEY_REF}',8  });910  const result = await streamText({11    model: openrouter(modelName),12    prompt: 'Write a vegetarian lasagna recipe for 4 people.',13  });14  return result.toAIStreamResponse();15};1617export const getWeather = async (modelName: string) => {18  const openrouter = createOpenRouter({19    apiKey: '${API_KEY_REF}',20  });2122  const result = await streamText({23    model: openrouter(modelName),24    prompt: 'What is the weather in San Francisco, CA in Fahrenheit?',25    tools: {26      getCurrentWeather: {27        description: 'Get the current weather in a given location',28        parameters: z.object({29          location: z30            .string()31            .describe('The city and state, e.g. San Francisco, CA'),32          unit: z.enum(['celsius', 'fahrenheit']).optional(),33        }),34        execute: async ({ location, unit = 'celsius' }) => {35          // Mock response for the weather36          const weatherData = {37            'Boston, MA': {38              celsius: '15°C',39              fahrenheit: '59°F',40            },41            'San Francisco, CA': {42              celsius: '18°C',43              fahrenheit: '64°F',44            },45          };4647          const weather = weatherData[location];48          if (!weather) {49            return `Weather data for ${location} is not available.`;50          }5152          return `The current weather in ${location} is ${weather[unit]}.`;53        },54      },55    },56  });57  return result.toAIStreamResponse();58};

```

[Built with](https://buildwithfern.com/?utm_campaign=buildWith&utm_medium=docs&utm_source=openrouter.ai)