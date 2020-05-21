let ws = undefined;
let voted = false;

console.log('Initialising client...');

setUseEnabled(nameField.value.length);

urlField.value = `${location.hostname}:4242`;
voteField.value = null;
submitVoteButton.disabled = true;

connectButton.addEventListener('click', (event) => {
    event.preventDefault();
    if (!ws) {
        if (!nameField.value) {
            writeDebugOutput(`Enter Name before connecting!`, 'red');
            return;
        }

        ws = new WebSocket(`ws://${urlField.value}`);

        nameField.disabled = true;
        clearDebugOutput();
        setUseEnabled(nameField.value.length);

        ws.addEventListener('open', () => {
            console.log('Opening websocket to ', `ws://${urlField.value}!`);
            connectButton.textContent = 'Disconnect';

            writeDebugOutput(`Connected to ws://${urlField.value}!`, 'green');
        });

        ws.addEventListener('message', (ev) => {
            const data = JSON.parse(ev.data);

            switch (data.command) {
                case 'ping':
                    // console.log('<< ping');
                    // console.log('>> pong');
                    ws.send(JSON.stringify({command: 'pong'}));
                    break;
                case 'vote':
                    votesOutput.innerHTML = '';
                    if (data.data.acknowledge) {
                        //voted = true;
                        currentVoteOutput.textContent = 'Your Vote: ' + data.data.votes.find(v => v.name === nameField.value).vote;
                        voteCountOutput.textContent = data.data.votes.length + '';
                        data.data.votes.forEach(renderVoter)
                        //submitVoteButton.disabled = true;
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
                    currentVoteOutput.textContent = '';
                    voteField.value = null;
                    //voted = false;
                    voteCountOutput.textContent = 0 + '';
                    submitVoteButton.disabled = false;
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

        voteField.value = null;
        nameField.disabled = false;
        connectButton.textContent = 'Connect';
        submitVoteButton.disabled = true;
        setUseEnabled(nameField.value.length);

        if (clearDebug) clearDebugOutput();
    }
});

submitVoteButton.addEventListener('click', (event) => {
    event.preventDefault();

    if (!voteField.value || voteField.value < 0 || voteField.value > 13) {
        writeDebugOutput(`Error; Vote must be >= 0 && < 13`, 'red');
        return;
    }

    // if (voted) {
    //     writeDebugOutput(`Error; 'Clear Votes' to vote again`, 'red');
    //     return;
    // }
    //writeDebugOutput(`Connected to ws://${urlField.value}!`, 'green');

    const command = getCommandObject('vote',
        {
            name: nameField.value,
            vote: voteField.value
        });
    console.log('>> ', command);

    ws.send(JSON.stringify(command));
});

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

voteField.addEventListener('keyup', (event) => submitVoteButton.disabled = !event.target.value);

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
    voteField.disabled = !ws;
    showVotesButton.disabled = !ws;
    clearVotesButton.disabled = !ws;
}

console.log('Initialising client done!');
