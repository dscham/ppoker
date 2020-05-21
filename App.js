const nodeStatic = require('node-static');
const wwwroot = new nodeStatic.Server('./frontend');
const PPoker = require('./backend/Main.js');

const httpServer = require('http').createServer(function (request, response) {
    request.addListener('end', function () {
        wwwroot.serve(request, response);
    }).resume();
}).listen(process.env.PORT || 80);

new PPoker(httpServer);