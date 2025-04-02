Exchange an authorization code from the PKCE flow for a user-controlled API key

### Request

This endpoint expects an object.

codestringRequired

The authorization code received from the OAuth redirect

code\_verifierstringOptional

The code verifier if code\_challenge was used in the authorization request

code\_challenge\_methodenumOptional

Allowed values: S256plain

The method used to generate the code challenge

### Response

Successfully exchanged code for an API key

keystring

The API key to use for OpenRouter requests

user\_idstringOptional

User ID associated with the API key

### Errors

400

Post Auth Keys Request Bad Request Error

403

Post Auth Keys Request Forbidden Error

405

Post Auth Keys Request Method Not Allowed Error

[Get current API key\\
\\
Up Next](https://openrouter.ai/docs/api-reference/api-keys/get-current-api-key)

[Built with](https://buildwithfern.com/?utm_campaign=buildWith&utm_medium=docs&utm_source=openrouter.ai)