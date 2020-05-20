let ws = undefined;
let voted = false;

console.log('Initialising client...');

setUseEnabled(nameField.value.length >= 3);

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
        setUseEnabled(nameField.value.length >= 3);

        ws.addEventListener('open', () => {
            console.log('Opening websocket to ', `ws://${urlField.value}!`);
            connectButton.textContent = 'Disconnect';

            writeDebugOutput(`Connected to ws://${urlField.value}!`, 'green');
        });

        ws.addEventListener('message', (ev) => {
            const data = JSON.parse(ev.data);

            switch (data.command) {
                case 'ping':
                    console.log('<< ping');
                    console.log('>> pong');
                    ws.send(JSON.stringify({command: 'pong'}));
                    break;
                case 'vote':
                    if (data.data.acknowledge) {
                        voted = true;
                        voteCountOutput.textContent = data.data.voteCount;
                        submitVoteButton.disabled = true;
                    } else {
                        voteCountOutput.textContent = data.data;
                    }
                    break;
                case 'show':
                    votesOutput.innerHTML = '';
                    data.data.forEach(renderVote);
                    break;
                case 'clear':
                    votesOutput.innerHTML = '';
                    voted = false;
                    voteCountOutput.textContent = null;
                    submitVoteButton.disabled = false;
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
        });

        ws.addEventListener('error', (err) => {
            console.log(err);

            writeDebugOutput(`Error; Check console.`, 'red');
        });
    } else {
        ws.close();
        ws = undefined;

        voteField.value = null;
        nameField.disabled = false;
        connectButton.textContent = 'Connect';
        submitVoteButton.disabled = true;
        setUseEnabled(nameField.value.length >= 3);

        clearDebugOutput();
    }
});

submitVoteButton.addEventListener('click', (event) => {
    event.preventDefault();

    if (!voteField.value || voteField.value < 0 || voteField.value > 13) {
        writeDebugOutput(`Error; Vote must be >= 0 && < 13`, 'red');
        return;
    }

    if (voted) {
        writeDebugOutput(`Error; 'Clear Votes' to vote again`, 'red');
        return;
    }

    writeDebugOutput(`Connected to ws://${urlField.value}!`, 'green');

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

nameField.addEventListener('keyup', nameFieldListener);
voteField.addEventListener('keyup', (event) => submitVoteButton.disabled = !event.target.value);



function nameFieldListener(event) {
    setUseEnabled(event.target.value.length >= 3);
}

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

function setUseEnabled(enabled) {
    needNameOutput.hidden = enabled;

    connectButton.disabled = !enabled;
    voteInputsSection.hidden = !ws;
    voteField.disabled = !ws;
    showVotesButton.disabled = !ws;
    clearVotesButton.disabled = !ws;
}

console.log('Initialising client done!');
