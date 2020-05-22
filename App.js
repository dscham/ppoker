const nodeStatic = require('node-static');
const PPokerServer = require('./backend/PPokerServer.js');

const wwwroot = new nodeStatic.Server('./frontend');

const httpServer = require('http').createServer(function (request, response) {
    request.addListener('end', function () {
        wwwroot.serve(request, response);
    }).resume();
}).listen(process.env.PORT || 80);

const wsServer = new PPokerServer(httpServer);