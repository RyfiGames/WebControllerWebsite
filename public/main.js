const socket = io('ws://localhost:8080')

const joinScreen = document.getElementById('joinScreen');
const waitScreen = document.getElementById('waitScreen');
const premiumScreen = document.getElementById('premiumScreen');
const controlScreen = document.getElementById('controlScreen');
const disconnectScreen = document.getElementById('disconnectScreen');

const usernameInput = document.getElementById('username');
const gamepinInput = document.getElementById('pin');
const joinButton = document.getElementById('joinButton');

const controllerButton = document.getElementById('controllerButton');
const screenshareButton = document.getElementById('screenshareButton');
const bothButton = document.getElementById('bothButton');

const controllerData = document.getElementById('controllerData');
const submitButton = document.getElementById('submitButton');
const leaveButton = document.getElementById('leaveButton');

const disconnectReason = document.getElementById('disconnectReason');

socket.on('roomPremium', () => {
    hideScreens();
    premiumScreen.removeAttribute('hidden');
});

socket.on('roomAccepted', (controllerLayout) => {
    hideScreens();
    controlScreen.removeAttribute('hidden');
});

socket.on('disconnectHost', (reason) => {
    disconnectReason.innerHTML = reason;
    hideScreens();
    disconnectScreen.removeAttribute('hidden');
});

joinButton.addEventListener('click', () => {
    socket.emit('joinAttempt', usernameInput.value, gamepinInput.value, "default");
    hideScreens();
    waitScreen.removeAttribute('hidden');
});

controllerButton.addEventListener('click', () => {
    socket.emit('joinAttempt', usernameInput.value, gamepinInput.value, "controller");
    hideScreens();
    waitScreen.removeAttribute('hidden');
});

screenshareButton.addEventListener('click', () => {
    socket.emit('joinAttempt', usernameInput.value, gamepinInput.value, "screenshare");
    hideScreens();
    waitScreen.removeAttribute('hidden');
});

bothButton.addEventListener('click', () => {
    socket.emit('joinAttempt', usernameInput.value, gamepinInput.value, "both");
    hideScreens();
    waitScreen.removeAttribute('hidden');
});

submitButton.addEventListener('click', () => {
    socket.emit('controllerData', controllerData.value);
    controllerData.value = '';
});

leaveButton.addEventListener('click', () => {
    socket.emit('disconnectMe');
});

window.addEventListener('gamepadconnected', (e) => {
    console.log("Gamepad Connected");
});

window.addEventListener('gamepaddisconnected', (e) => {
    console.log("Gamepad Disconnected");
});

function hideScreens() {
    joinScreen.setAttribute('hidden', 'true');
    waitScreen.setAttribute('hidden', 'true');
    premiumScreen.setAttribute('hidden', 'true');
    controlScreen.setAttribute('hidden', 'true');
    disconnectScreen.setAttribute('hidden', 'true');
}

const url = new URL(window.location.href);
var urlPin = url.searchParams.get('pin');
if (urlPin) {
    gamepinInput.value = urlPin;
}