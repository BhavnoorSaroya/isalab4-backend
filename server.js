const http = require('http');
const messages = require('./lang/messages/en'); // Assuming all user-facing strings are in en.js

// Class to handle JSON responses
class JsonResponse {
  static send(res, statusCode, message) {
    res.writeHead(statusCode, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(message));
  }
}

// Class to handle requests and manage the dictionary
class RequestHandler {
  constructor() {
    this.dictionary = [];
    this.requestCount = 0;
  }

  // CORS headers
  setCorsHeaders(res) {
    res.setHeader('Access-Control-Allow-Origin', '*'); // Allow all origins
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS'); // Allow GET, POST, and OPTIONS
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type'); // Allow Content-Type header
  }

  // Handle OPTIONS preflight request
  handleOptions(req, res) {
    this.setCorsHeaders(res);
    res.writeHead(204); // No content for OPTIONS request
    res.end();
  }

  // GET request handler
  handleGet(req, res) {
    this.setCorsHeaders(res); // Set CORS headers for GET request
    const url = new URL(req.url, `http://${req.headers.host}`);
    const word = url.searchParams.get('word');

    if (url.pathname === '/api/definitions/' && word) {
      const entry = this.dictionary.find((item) => item.word === word.toLowerCase());

      if (entry) {
        JsonResponse.send(res, 200, {
          requestNumber: this.requestCount,
          word: entry.word,
          definition: entry.definition,
          success: true,
        });
      } else {
        JsonResponse.send(res, 404, {
          requestNumber: this.requestCount,
          message: messages.wordNotFound(word, this.requestCount),
        });
      }
    } else {
      JsonResponse.send(res, 400, { message: messages.invalidGetRequest });
    }
  }

  // POST request handler
  handlePost(req, res) {
    this.setCorsHeaders(res); // Set CORS headers for POST request
    if (req.url === '/api/definitions') {
      let body = '';

      // Collect the body data
      req.on('data', (chunk) => {
        body += chunk.toString();
      });

      // Process the body data
      req.on('end', () => {
        try {
          const data = JSON.parse(body);
          const word = data.word.trim().toLowerCase();
          const definition = data.definition.trim();

          if (!word || !definition || /\d/.test(word)) {
            throw new Error(messages.invalidWordOrDefinition);
          }

          const existingEntry = this.dictionary.find((item) => item.word === word);

          if (existingEntry) {
            JsonResponse.send(res, 400, {
              requestNumber: this.requestCount,
              message: messages.wordExists(word, this.requestCount),
            });
          } else {
            this.dictionary.push({ word, definition });

            JsonResponse.send(res, 201, {
              requestNumber: this.requestCount,
              totalEntries: this.dictionary.length,
              message: messages.newEntryRecorded(word, definition, this.dictionary.length, this.requestCount),
            });
          }
        } catch (error) {
          JsonResponse.send(res, 400, {
            message: messages.invalidWordOrDefinition,
          });
        }
      });
    } else {
      JsonResponse.send(res, 404, { message: messages.endpointNotFound });
    }
  }

  // Main request handler
  handleRequest(req, res) {
    this.requestCount++;
    this.setCorsHeaders(res); // Set CORS headers for every request

    if (req.method === 'OPTIONS') {
      this.handleOptions(req, res); // Handle CORS preflight requests
    } else if (req.method === 'GET') {
      this.handleGet(req, res);
    } else if (req.method === 'POST') {
      this.handlePost(req, res);
    } else {
      JsonResponse.send(res, 405, { message: messages.methodNotAllowed });
    }
  }
}

// Instantiate the RequestHandler
const requestHandler = new RequestHandler();

// Create the server
const server = http.createServer((req, res) => {
  requestHandler.handleRequest(req, res);
});

// Start the server
server.listen(8000, () => {
  console.log('Server running');
});
