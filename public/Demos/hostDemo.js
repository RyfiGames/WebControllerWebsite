const socket = io('wss://controller.y33t.net:443')

const dataInput = document.getElementById('dataInput');
//const dataInput2 = document.getElementById('dataInput2');

const requestButton = document.getElementById('requestButton');
const acceptButton = document.getElementById('acceptButton');
const kickButton = document.getElementById('kickButton');
//const premiumButton = document.getElementById('premiumButton');
const closeButton = document.getElementById('closeButton');

const consoleOutput = document.getElementById('consoleOutput');

function PrintConsole(data) {
    consoleOutput.innerHTML += `<p>${data}</p>`;
}

socket.on('hostFail', (reason) => {
    PrintConsole(`Host request failed (${reason})`);
});

socket.on('hostConfirm', (pin) => {
    PrintConsole(`Host request succeeded. Pin: ${pin}`);
});

socket.on('joinAttempt', (username, jaid, mode) => {
    PrintConsole(`A user is trying to join. Username: ${username} JAID: ${jaid} mode: ${mode}`);
});

socket.on('acceptedPlayer', (username, userID, mode) => {
    PrintConsole(`A user joined successfully Username: ${username} UserID: ${userID} mode: ${mode}`);
});

socket.on('disconnectPlayer', (userID) => {
    PrintConsole(`A user disconnected. UserID: ${userID}`);
});

socket.on('controllerData', (userID, controller) => {
    PrintConsole(`${userID}: ${controller}`);
});

socket.on('errorMessage', (info, status) => {
    PrintConsole(`ERROR: ${info}`);
    if (!status) {
        PrintConsole("You have been disconnected.");
    }
});

requestButton.addEventListener('click', () => {
    socket.emit('requestHost', dataInput.value);
});

acceptButton.addEventListener('click', () => {
    socket.emit('acceptPlayer', dataInput.value);
});

kickButton.addEventListener('click', () => {
    socket.emit('kickPlayer', dataInput.value);
});

closeButton.addEventListener('click', () => {
    socket.emit('closeRoom');
    PrintConsole("Room closed.");
});