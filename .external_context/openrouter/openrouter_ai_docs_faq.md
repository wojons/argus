## Getting started

###### Why should I use OpenRouter?

OpenRouter provides a unified API to access all the major LLM models on the
market. It also allows users to aggregate their billing in one place and
keep track of all of their usage using our analytics.

OpenRouter passes through the pricing of the underlying providers, while pooling their uptime,
so you get the same pricing you’d get from the provider directly, with a
unified API and fallbacks so that you get much better uptime.

###### How do I get started with OpenRouter?

To get started, create an account and add credits on the
[Credits](https://openrouter.ai/settings/credits) page. Credits are simply
deposits on OpenRouter that you use for LLM inference.
When you use the API or chat interface, we deduct the request cost from your
credits. Each model and provider has a different price per million tokens.

Once you have credits you can either use the chat room, or create API keys
and start using the API. You can read our [quickstart](https://openrouter.ai/docs/quickstart)
guide for code samples and more.

###### How do I get support?

The best way to get support is to join our
[Discord](https://discord.gg/fVyRaUDgxW) and ping us in the #help forum.

###### How do I get billed for my usage on OpenRouter?

For each model we have the pricing displayed per million tokens. There is
usually a different price for prompt and completion tokens. There are also
models that charge per request, for images and for reasoning tokens. All of
these details will be visible on the models page.

When you make a request to OpenRouter, we receive the total number of tokens processed
by the provider. We then calculate the corresponding cost and deduct it from your credits.
You can review your complete usage history in the [Activity tab](https://openrouter.ai/activity).

We pass through the pricing of the underlying providers; there is no markup
on inference pricing (however we do charge a [fee](https://openrouter.ai/terms#_4_-payment) when purchasing credits).

## Models and Providers

###### What LLM models does OpenRouter support?

OpenRouter provides access to a wide variety of LLM models, including frontier models from major AI labs.
For a complete list of models you can visit the [models browser](https://openrouter.ai/models) or fetch the list through the [models api](https://openrouter.ai/api/v1/models).

###### How frequently are new models added?

We work on adding models as quickly as we can. We often have partnerships with
the labs releasing models and can release models as soon as they are
available. If there is a model missing that you’d like OpenRouter to support, feel free to message us on
[Discord](https://discord.gg/fVyRaUDgxW).

###### What are model variants?

Variants are suffixes that can be added to the model slug to change its behavior.

Static variants can only be used with specific models and these are listed in our [models api](https://openrouter.ai/api/v1/models).

1. `:free` \- The model is always provided for free and has low rate limits.
2. `:beta` \- The model is not moderated by OpenRouter.
3. `:extended` \- The model has longer than usual context length.
4. `:thinking` \- The model supports reasoning by default.

Dynamic variants can be used on all models and they change the behavior of how the request is routed or used.

1. `:online` \- All requests will run a query to extract web results that are attached to the prompt.
2. `:nitro` \- Providers will be sorted by throughput rather than the default sort, optimizing for faster response times.
3. `:floor` \- Providers will be sorted by price rather than the default sort, prioritizing the most cost-effective options.

###### I am an inference provider, how can I get listed on OpenRouter?

You can read our requirements at the [Providers\\
page](https://openrouter.ai/docs/use-cases/for-providers). If you would like to contact us, the best
place to reach us is over email.

###### What is the expected latency/response time for different models?

For each model on OpenRouter we show the latency (time to first token) and the token
throughput for all providers. You can use this to estimate how long requests
will take. If you would like to optimize for throughput you can use the
`:nitro` variant to route to the fastest provider.

###### How does model fallback work if a provider is unavailable?

If a provider returns an error OpenRouter will automatically fall back to the
next provider. This happens transparently to the user and allows production
apps to be much more resilient. OpenRouter has a lot of options to configure
the provider routing behavior. The full documentation can be found [here](https://openrouter.ai/docs/features/provider-routing).

## API Technical Specifications

###### What authentication methods are supported?

OpenRouter uses three authentication methods:

1. Cookie-based authentication for the web interface and chatroom
2. API keys (passed as Bearer tokens) for accessing the completions API and other core endpoints
3. [Provisioning API keys](https://openrouter.ai/docs/features/provisioning-api-keys) for programmatically managing API keys through the key management endpoints

###### How are rate limits calculated?

Your account has a hard limit of 200 requests per day total across all free models.
For all other models, rate limits are determined by the credits in your account. You can read more
details in our [rate limits documentation](https://openrouter.ai/docs/api-reference/limits).

###### What API endpoints are available?

OpenRouter implements the OpenAI API specification for /completions and
/chat/completions endpoints, allowing you to use any model with the same
request/response format. Additional endpoints like /api/v1/models are also
available. See our [API documentation](https://openrouter.ai/docs/api-reference/overview) for
detailed specifications.

###### What are the supported formats?

The API supports text and images.
[Images](https://openrouter.ai/docs/api-reference/overview#images--multimodal) can be passed as
URLs or base64 encoded images. PDF and other file types are coming soon.

###### How does streaming work?

Streaming uses server-sent events (SSE) for real-time token delivery. Set
`stream: true` in your request to enable streaming responses.

###### What SDK support is available?

OpenRouter is a drop-in replacement for OpenAI. Therefore, any SDKs that
support OpenAI by default also support OpenRouter. Check out our
[docs](https://openrouter.ai/docs/frameworks) for more details.

## Privacy and Data Logging

Please see our [Terms of Service](https://openrouter.ai/terms) and [Privacy Policy](https://openrouter.ai/privacy).

###### What data is logged during API use?

We log basic request metadata (timestamps, model used, token counts). Prompt
and completion are not logged by default. We do zero logging of your prompts/completions,
even if an error occurs, unless you opt-in to logging them.

We have an opt-in [setting](https://openrouter.ai/settings/privacy) that
lets users opt-in to log their prompts and completions in exchange for a 1%
discount on usage costs.

###### What data is logged during Chatroom use?

The same data privacy applies to the chatroom as the API. All conversations
in the chatroom are stored locally on your device. Conversations will not sync across devices.
It is possible to export and import conversations using the settings menu in the chatroom.

###### What third-party sharing occurs?

OpenRouter is a proxy that sends your requests to the model provider for it to be completed.
We work with all providers to, when possible, ensure that prompts and completions are not logged or used for training.
Providers that do log, or where we have been unable to confirm their policy, will not be routed to unless the model training
toggle is switched on in the [privacy settings](https://openrouter.ai/settings/privacy) tab.

If you specify [provider routing](https://openrouter.ai/docs/features/provider-routing) in your request, but none of the providers
match the level of privacy specified in your account settings, you will get an error and your request will not complete.

## Credit and Billing Systems

###### What purchase options exist?

OpenRouter uses a credit system where the base currency is US dollars. All
of the pricing on our site and API is denoted in dollars. Users can top up
their balance manually or set up auto top up so that the balance is
replenished when it gets below the set threshold.

###### Do credits expire?

Per our [terms](https://openrouter.ai/terms), we reserve the right to expire
unused credits after one year of purchase.

###### My credits haven't showed up in my account

If you paid using Stripe, sometimes there is an issue with the Stripe
integration and credits can get delayed in showing up on your account. Please allow up to one hour.
If your credits still have not appeared after an hour, contact us on [Discord](https://discord.gg/fVyRaUDgxW) and we will
look into it.

If you paid using crypto, please reach out to us on [Discord](https://discord.gg/fVyRaUDgxW)
and we will look into it.

###### What's the refund policy?

OpenRouter currently does not offer refunds for purchased credits.

###### How to monitor credit usage?

The [Activity](https://openrouter.ai/activity) page allows users to view
their historic usage and filter the usage by model, provider and api key.

We also provide a [credits api](https://openrouter.ai/docs/api-reference/get-credits) that has
live information about the balance and remaining credits for the account.

###### What free tier options exist?

All new users receive a very small free allowance to be able to test out OpenRouter.
There are many [free models](https://openrouter.ai/models?max_price=0) available
on OpenRouter, it is important to note that these models have low rate limits (200 requests per day total)
and are usually not suitable for production use.

###### How do volume discounts work?

OpenRouter does not currently offer volume discounts, but you can reach out to us
over email if you think you have an exceptional use case.

###### What payment methods are accepted?

We accept all major credit cards, AliPay and cryptocurrency payments in
USDC. We are working on integrating PayPal soon, if there are any payment
methods that you would like us to support please reach out on [Discord](https://discord.gg/fVyRaUDgxW).

###### How does OpenRouter make money?

We charge a small [fee](https://openrouter.ai/terms#_4_-payment) when purchasing credits. We never mark-up the pricing
of the underlying providers, and you’ll always pay the same as the provider’s
listed price.

## Account Management

###### How can I delete my account?

Go to the [Settings](https://openrouter.ai/settings/preferences) page and click Manage Account.
In the modal that opens, select the Security tab. You’ll find an option there to delete your account.

Note that unused credits will be lost and cannot be reclaimed if you delete and later recreate your account.

###### How does team access work?

Team management is coming very soon! For now you can use [provisioning API\\
keys](https://openrouter.ai/docs/features/provisioning-api-keys) to allow sharing credits with
people on your team.

###### What analytics are available?

Our [activity dashboard](https://openrouter.ai/activity) provides real-time
usage metrics. If you would like any specific reports or metrics please
contact us.

###### How can I contact support?

The best way to reach us is to join our
[Discord](https://discord.gg/fVyRaUDgxW) and ping us in the #help forum.

[Built with](https://buildwithfern.com/?utm_campaign=buildWith&utm_medium=docs&utm_source=openrouter.ai)