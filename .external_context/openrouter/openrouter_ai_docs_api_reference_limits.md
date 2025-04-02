If you need a lot of inference, making additional accounts or API keys _makes_
_no difference_. We manage the rate limit globally. We do however have
different rate limits for different models, so you can share the load that way
if you do run into issues. If you start getting rate limited — [tell\\
us](https://discord.gg/fVyRaUDgxW)! We are here to help. If you are able,
don’t specify providers; that will let us load balance it better.

## Rate Limits and Credits Remaining

To check the rate limit or credits left on an API key, make a GET request to `https://openrouter.ai/api/v1/auth/key`.

TypeScriptPython

```code-block text-sm

1const response = await fetch('https://openrouter.ai/api/v1/auth/key', {2  method: 'GET',3  headers: {4    Authorization: 'Bearer <OPENROUTER_API_KEY>',5  },6});
```

If you submit a valid API key, you should get a response of the form:

TypeScript

```code-block text-sm

1type Key = {2  data: {3    label: string;4    usage: number; // Number of credits used5    limit: number | null; // Credit limit for the key, or null if unlimited6    is_free_tier: boolean; // Whether the user has paid for credits before7    rate_limit: {8      requests: number; // Number of requests allowed...9      interval: string; // in this interval, e.g. "10s"10    };11  };12};
```

There are a few rate limits that apply to certain types of requests, regardless of account status:

1. **Free limit**: If you are using a free model variant (with an ID ending in `:free`), then you will be limited to 20 requests per minute and 200 requests per day.

2. **DDoS protection**: Cloudflare’s DDoS protection will block requests that dramatically exceed reasonable usage.


For all other requests, rate limits are a function of the number of credits remaining on the key or account. Partial credits round up in your favor. For the credits available on your API key, you can make **1 request per credit per second** up to the surge limit (typically 500 requests per second, but you can go higher).

For example:

- 0.5 credits → 1 req/s (minimum)
- 5 credits → 5 req/s
- 10 credits → 10 req/s
- 500 credits → 500 req/s
- 1000 credits → Contact us if you see ratelimiting from OpenRouter

If your account has a negative credit balance, you may see `402` errors, including for free models. Adding credits to put your balance above zero allows you to use those models again.

[Built with](https://buildwithfern.com/?utm_campaign=buildWith&utm_medium=docs&utm_source=openrouter.ai)