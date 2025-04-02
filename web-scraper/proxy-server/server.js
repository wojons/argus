const express = require('express');
const request = require('request');
const cors = require('cors');

const app = express();
const port = 3000;

app.use(cors());

app.get('/proxy', (req, res) => {
  const url = req.query.url;

  if (!url) {
    return res.status(400).send('URL parameter is required');
  }

  request(url, {encoding: null}, (error, response, body) => {
    if (error) {
      console.error(error);
      return res.status(500).send('Proxy error');
    }

    res.set({
      'Content-Type': response.headers['content-type'],
      'Content-Disposition': response.headers['content-disposition'] || '',
    });
    res.status(response.statusCode).send(body);
  });
});

app.listen(port, () => {
  console.log(`Proxy server listening on port ${port}`);
});
