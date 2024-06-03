# Apple Social Login with Frontegg APIs
Implementation of [Apple social Login](https://docs.frontegg.com/docs/apple-login) with Frontegg APIs

## How to run

1. Open your Frontegg account and follow the instructions on our [Apple social Login](https://docs.frontegg.com/docs/apple-login) doc

2. Open `apple-social-login-using-apis.js`, add your vendor host

```
const fronteggDomain = 'https://app-xxxx.frontegg.com'; // example https://app-frtqiefxjqn9.frontegg.com
```

3. Run `npm install` and then `node apple-social-login-using-apis.js`
4. Open your browser and navigate to `http://localhost:3000`. Authenticate with your Apple account.
You can check the logs to see if it worked from `Frontegg Portal ➜ [ENVIRONMENT] ➜ Backoffice ➜ Monitoring`.

You should also see your bearer token in the requests in the network tab.
