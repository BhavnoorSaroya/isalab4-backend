// lang/messages/en.js
const messages = {
    invalidGetRequest: 'Invalid GET request.',
    wordNotFound: (word, requestCount) => `Request #${requestCount}, word '${word}' not found!`,
    invalidWordOrDefinition: 'Invalid word or definition. Please provide a valid word and definition.',
    wordExists: (word, requestCount) => `Warning! Word '${word}' already exists. Request #${requestCount}.`,
    newEntryRecorded: (word, definition, totalEntries, requestCount) =>
      `Request #${requestCount}, new entry recorded: '${word}' - '${definition}'. Total entries: ${totalEntries}.`,
    methodNotAllowed: 'Method not allowed.',
    endpointNotFound: 'Endpoint not found.',
  };
  
  module.exports = messages;
  