var http = require('http');
var body = '';



http.get(url, function(res) {
  res.on('data', function(chunk) {
    body += chunk;
  });
  res.on('end', function() {
    // all data has been downloaded
  });
});