Creates and hydrates a Coinbase Commerce charge for cryptocurrency payments

### Request

This endpoint expects an object.

amountdoubleRequired

USD amount to charge (must be between min and max purchase limits)

senderstringRequired

Ethereum address of the sender

chain\_idintegerRequired

Chain ID for the transaction

### Response

Returns the calldata to fulfill the transaction

dataobject

Show 5 properties

[Exchange authorization code for API key\\
\\
Up Next](https://openrouter.ai/docs/api-reference/authentication/exchange-authorization-code-for-api-key)

[Built with](https://buildwithfern.com/?utm_campaign=buildWith&utm_medium=docs&utm_source=openrouter.ai)