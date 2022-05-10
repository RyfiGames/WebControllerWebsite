const socket = io('wss://controller.y33t.net:443');
// const socket = io('ws://76.124.144.42');

function SendControllerData(data) {
    socket.emit('controllerDataPing', data);
}

socket.on('controllerDataPong', data => {
    SetControllerData(data);
})