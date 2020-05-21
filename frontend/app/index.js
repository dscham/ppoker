let ws = undefined;

console.log('Initialising client...');

setUseEnabled(nameField.value.length);
createVoteButtons();

connectButton.addEventListener('click', (event) => {
    event.preventDefault();
    if (!ws) {
        if (!nameField.value) {
            writeDebugOutput(`Enter Name before connecting!`, 'red');
            return;
        }
        const webSocketProtocol = location.protocol === 'https:' ? 'wss' : 'ws' + '://';
        ws = new WebSocket(`${webSocketProtocol}${location.hostname}:${location.port}`);

        nameField.disabled = true;
        clearDebugOutput();
        setUseEnabled(nameField.value.length);

        ws.addEventListener('open', () => {
            console.log('Opening websocket to ', `${webSocketProtocol}${location.hostname}:${location.port}!`);
            connectButton.textContent = 'Disconnect';

            writeDebugOutput(`Connected to ${webSocketProtocol}${location.hostname}:${location.port}!`,
                'green');
        });

        ws.addEventListener('message', (ev) => {
            const data = JSON.parse(ev.data);

            switch (data.command) {
                case 'ping':
                    ws.send(JSON.stringify({command: 'pong'}));
                    break;
                case 'vote':
                    votesOutput.innerHTML = '';
                    if (data.data.acknowledge) {
                        voteCountOutput.textContent = data.data.votes.length + '';
                        data.data.votes.forEach(renderVoter)
                    } else {
                        voteCountOutput.textContent = data.data.length + '';
                        data.data.forEach(renderVoter)
                    }
                    break;
                case 'show':
                    votesOutput.innerHTML = '';
                    data.data.forEach(renderVote);
                    break;
                case 'clear':
                    votesOutput.innerHTML = '';
                    voteCountOutput.textContent = 0 + '';
                    break;
                case 'topic':
                    topicField.value = data.data;
                    break;
                case 'error':
                    writeDebugOutput(data.data, 'red');
                    break;
                default:
                    console.log('Unhandled command', data);
                    break;
            }

            function renderVote(vote) {
                const neww = document.createElement('p');
                neww.textContent = `${vote.vote}: ${vote.name}`;
                votesOutput.appendChild(neww);
            }

            function renderVoter(vote) {
                const neww = document.createElement('p');
                neww.textContent = `?: ${vote.name}`;
                votesOutput.appendChild(neww);
            }
        });

        ws.addEventListener('error', (err) => {
            console.log('ws.onerror', err);
            console.log('WebSocket Open?');
            if (ws.readyState === 1) {
                console.log('✔');
            } else {
                console.log('❌');
                writeDebugOutput(`Error; Check console.`, 'red');
                cleanUp(false);
            }
        });
    } else {
        cleanUp(true);
    }

    function cleanUp(clearDebug) {
        if (!!ws && !!ws.close && typeof ws.close === 'function') ws.close();
        ws = undefined;

        nameField.disabled = false;
        connectButton.textContent = 'Connect';
        setUseEnabled(nameField.value.length);

        if (clearDebug) clearDebugOutput();
    }
});

function createVoteButtons() {
    voteButtonsParagraph.appendChild(createVoteButton('0'));
    voteButtonsParagraph.appendChild(createVoteButton('1'));
    voteButtonsParagraph.appendChild(createVoteButton('2'));
    voteButtonsParagraph.appendChild(createVoteButton('3'));
    voteButtonsParagraph.appendChild(createVoteButton('5'));
    voteButtonsParagraph.appendChild(createVoteButton('8'));
    voteButtonsParagraph.appendChild(createVoteButton('13'));
    voteButtonsParagraph.appendChild(createVoteButton('20'));
    voteButtonsParagraph.appendChild(createVoteButton('40'));
    voteButtonsParagraph.appendChild(createVoteButton('100'));
    voteButtonsParagraph.appendChild(document.createElement('br'));
    voteButtonsParagraph.appendChild(createVoteButton('∞'));
    voteButtonsParagraph.appendChild(createVoteButton('?'));
    voteButtonsParagraph.appendChild(createVoteButton('Coffee'));
}

function createVoteButton(value) {
    const holder = document.createElement('a');

    const input =  document.createElement('input');
    input.type = 'radio';
    input.name = 'vote';
    input.id = `vote-${value}`;
    input.value = value;
    input.addEventListener('click', (event) => {
        const command = getCommandObject('vote',
            {
                name: nameField.value,
                vote: event.target.value
            });
        console.log('>> ', command);

        ws.send(JSON.stringify(command));
    });
    holder.appendChild(input);

    const label = document.createElement('label');
    label.for = input.id;
    label.textContent = value;
    holder.appendChild(label);

    return holder;
}

showVotesButton.addEventListener('click', (event) => {
    event.preventDefault();

    const command = getCommandObject('show');
    console.log('>> ', command);

    ws.send(JSON.stringify(command));
});

clearVotesButton.addEventListener('click', (event) => {
    event.preventDefault();

    const command = getCommandObject('clear');
    console.log('>> ', command);

    ws.send(JSON.stringify(command));
});

nameField.addEventListener('keyup', (event) => {
    setUseEnabled(event.target.value.length);
});

topicField.addEventListener('keyup', (event) => {
    event.preventDefault();
    ws.send(JSON.stringify(getCommandObject('topic', event.target.value)));
});

function getCommandObject(command, payload) {
    return {
        command: command,
        data: payload
    }
}

function writeDebugOutput(message, color) {
    debugOutput.textContent = message;
    debugOutput.style['color'] = color;
    debugOutput.hidden = false;
}

function clearDebugOutput() {
    debugOutput.textContent = '';
    debugOutput.style['color'] = 'black';
    debugOutput.hidden = true;
}

function setUseEnabled(length) {
    const enabled = length >= 2;

    needNameOutput.hidden = enabled;

    connectButton.disabled = !enabled;
    voteInputsSection.hidden = !ws;
    showVotesButton.disabled = !ws;
    clearVotesButton.disabled = !ws;
}

console.log('Initialising client done!');