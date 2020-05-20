console.log('Initialising DOM references...');

// Inputs
const nameField = document.querySelector('#name');
const urlField = document.querySelector('#url');
const voteField = document.querySelector('#vote');

// Buttons
const connectButton = document.querySelector('#connect');
const submitVoteButton = document.querySelector('#submit-vote');
const showVotesButton = document.querySelector('#show-votes');
const clearVotesButton = document.querySelector('#clear-votes');

// Outputs
const votesOutput = document.querySelector('#votes-output');
const debugOutput = document.querySelector('#debug-output');
const needNameOutput = document.querySelector('#need-name');
const voteCountOutput = document.querySelector('#vote-count');

// Display
const voteInputsSection = document.querySelector('#vote-inputs');

console.log('Initialising DOM references done!');
