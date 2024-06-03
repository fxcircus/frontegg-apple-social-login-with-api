const express = require('express');
const axios = require('axios');
const fs = require('fs');
const morgan = require('morgan');
const app = express();
const port = 3000;

const fronteggDomain = 'https://app-xxxx.frontegg.com'; // example https://app-frtqiefxjqn9.frontegg.com

const logFile = fs.createWriteStream('network_calls.log', { flags: 'w' });

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Setup morgan for logging requests
app.use(morgan('combined', { stream: logFile }));

// Middleware to log request and response details
app.use(async (req, res, next) => {
    const start = Date.now();
    const { method, url, headers, body } = req;

    logFile.write(`\nRequest:\n`);
    logFile.write(`Method: ${method}\n`);
    logFile.write(`URL: ${url}\n`);
    logFile.write(`Headers: ${JSON.stringify(headers, null, 2)}\n`);
    logFile.write(`Body: ${JSON.stringify(body, null, 2)}\n`);

    const originalSend = res.send;

    res.send = function (data) {
        const duration = Date.now() - start;
        res.send = originalSend;
        res.send(data);

        logFile.write(`Response:\n`);
        logFile.write(`Status: ${res.statusCode}\n`);
        logFile.write(`Headers: ${JSON.stringify(res.getHeaders(), null, 2)}\n`);
        logFile.write(`Body: ${data}\n`);
        logFile.write(`Duration: ${duration}ms\n`);
        logFile.write(`-------------------\n`);

        return res;
    };

    next();
});

app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Apple Social Login</title>
            <script>
                async function loginWithApple() {
                    try {
                        const response = await fetch('/apple-prelogin');
                        const data = await response.json();
                        console.log('Prelogin response headers:', data.headers);
                        window.location.href = data.location;
                    } catch (error) {
                        console.error('Error during prelogin:', error);
                    }
                }
            </script>
        </head>
        <body>
            <h1>Login with Apple</h1>
            <button onclick="loginWithApple()">Login with Apple</button>
        </body>
        </html>
    `);
});

app.get('/apple-prelogin', async (req, res) => {
    logFile.write('@@Reached apple-prelogin!');
    try {
        const preloginResponse = await axios.get(`${fronteggDomain}/frontegg/identity/resources/auth/v2/user/sso/default/apple/prelogin`, {
        });

        if (preloginResponse.headers.location) {
            res.json({
                location: preloginResponse.headers.location,
                headers: preloginResponse.headers
            });
        } else if (preloginResponse.request.res.responseUrl) {
            res.json({
                location: preloginResponse.request.res.responseUrl,
                headers: preloginResponse.headers
            });
        } else {
            console.error('Location not found in the response headers');
            res.status(500).send('Internal Server Error');
        }
    } catch (error) {
        console.error('Error during prelogin:', error.message);
        res.status(500).send('Internal Server Error');
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
