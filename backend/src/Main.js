// Imports
const WebSocket = require('ws');

console.log('Constructing Server...');
this.votes = [];
this.sockets = [];
this.topic = '';
this.server = new WebSocket.Server({'port': 4242, host: '0.0.0.0'}, () => console.log('Started Listening on:', this.server.address()));
this.server.on('connection', (socket) => connectionHandler(this, socket));

//setInterval(() => console.log('Active Sockets', this.sockets.length), 5000);

function connectionHandler($, socket) {
    socket.on('message', (message) => messageHandler($, message));
    console.log(`Socket message handler started!`);

    socket.on('error', (error) => errorHandler(error));
    console.log(`Socket error handler started!`);

    $.sockets.push(socket);
    console.log('|| new ', $.sockets.indexOf(socket));

    let alive = true;
    setTimeout(() => aliveCheck($), 2550);

    socket.send(
        JSON.stringify({
            command: 'vote',
            data: $.votes
        })
    );

    function messageHandler($$, message) {
        let data = JSON.parse(message);

        switch (data.command) {
            case 'vote':
                console.log('<< vote from', $$.sockets.indexOf(socket));
                pushOrUpdateVote(data.data, $$.votes)
                $$.sockets.forEach((sock) => {
                        if (sock === socket) {
                            sock.send(
                                JSON.stringify({
                                    command: 'vote',
                                    data: {
                                        acknowledge: true,
                                        votes: filterVoteValues($$.votes, true)
                                    }
                                })
                            );
                        } else {
                            sock.send(
                                JSON.stringify({
                                    command: 'vote',
                                    data: filterVoteValues($$.votes)
                                })
                            );
                        }
                    }
                );
                break;
            case 'show':
                console.log('<< show from', $$.sockets.indexOf(socket));
                $$.sockets.forEach((sock) => sock.send(
                    JSON.stringify({
                        command: 'show',
                        data: $$.votes
                    })
                ));
                break;
            case 'clear':
                console.log('<< clear from', $$.sockets.indexOf(socket));
                $$.votes = [];
                $$.sockets.forEach((sock) => sock.send(
                    message
                ));
                break;
            case 'topic':
                console.log('<< topic from', $$.sockets.indexOf(socket));
                $.topic = data.data;
                $$.sockets.forEach((sock) => sock.send(
                    JSON.stringify({
                        command: 'topic',
                        data: $$.topic
                    })
                ));
                break;
            case 'pong':
                console.log('<< pong from', $$.sockets.indexOf(socket));
                alive = true;
                break;
            default:
                break;
        }
    }
    
    function pushOrUpdateVote(vote, array) {
        const index = array.indexOf(array.find(v => v.name === vote.name));
        if (index > -1) {
            array[index] = vote;
            return;
        }
        array.push(vote);
    }

    function filterVoteValues(votes, vote) {
        return votes.map(v => {
            if (!vote) {
                return {
                    name: v.name,
                    vote: ''
                };
            }
            return v;
        });
    }

    function errorHandler(err) {
        console.log('Error!');
        console.error(err);

        throw err;
    }

    function aliveCheck($$) {
        if (alive) {
            alive = false;

            console.log('>> ping to', $$.sockets.indexOf(socket));
            socket.send(JSON.stringify({ command : 'ping' }));

            setTimeout(() => aliveCheck($$), 2550);
        } else {
            console.log($$.sockets.indexOf(socket), ' dead ||');

            removeSocket($$, socket);
            socket.terminate();
            socket = undefined;

            console.log('Active Sockets', $$.sockets.length)
        }
    }

    function removeSocket($$, socket) {
        const index = $$.sockets.indexOf(socket);
        if (index > -1) {
            $$.sockets.splice(index, 1);
        }
    }
}
