const static = require('node-static');
const file = new static.Server('./frontend');

require('http').createServer(function (request, response) {
    request.addListener('end', function () {
        file.serve(request, response);
    }).resume();
}).listen(process.env.PORT || 3000);

require('./backend/Main.js')();