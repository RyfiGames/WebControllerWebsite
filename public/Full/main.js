const socket = io('wss://controller.y33t.net:443')

const joinScreen = document.getElementById('joinScreen');
const waitScreen = document.getElementById('waitScreen');
const premiumScreen = document.getElementById('premiumScreen');
const screenshareScreen = document.getElementById('screenshare');
const controlScreen = document.getElementById('controlScreen');
const disconnectScreen = document.getElementById('disconnectScreen');

const usernameInput = document.getElementById('username');
const gamepinInput = document.getElementById('pin');
const joinButton = document.getElementById('joinButton');

const controllerButton = document.getElementById('controllerButton');
const screenshareButton = document.getElementById('screenshareButton');
const bothButton = document.getElementById('bothButton');

// const controllerData = document.getElementById('controllerData');
// const submitButton = document.getElementById('submitButton');
// const leaveButton = document.getElementById('leaveButton');
const videoPlayer = document.getElementById("remoteVideo");

const disconnectReason = document.getElementById('disconnectReason');

const servers = {
  iceServers: [
    {
          urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302'],
    },
  ],
  iceCandidatePoolSize: 10,
};

const pc = new RTCPeerConnection(servers);
const remoteStream = new MediaStream();
var dataChannel;

var controllerMode = true;
var screenshareMode = false;

pc.ondatachannel = function (ev) {
    ev.channel.onopen = function (e) {
        dataChannel = ev.channel;
    }
    ev.channel.onmessage = (e) => {
        console.log(e.data);
    }
    ev.channel.onclose = function (e) {
        dataChannel = null;
    }
};

pc.ontrack = (e) => {
    e.streams[0].getTracks().forEach((track) => {
        remoteStream.addTrack(track);
    });
    videoPlayer.srcObject = remoteStream;
}

pc.onicecandidate = (e) => {
    if (e.candidate) {
        socket.emit('rtcAnswerCandidate', e.candidate.candidate, e.candidate.sdpMid, e.candidate.sdpMLineIndex);
    }
}

socket.on('rtcOffer', async (sdp) => {
    let offer = {
        type: 'offer',
        sdp: sdp
    }
    await pc.setRemoteDescription(new RTCSessionDescription(offer));
    
    let answerDesc = await pc.createAnswer();
    await pc.setLocalDescription(answerDesc);

    let answer = {
        type: answerDesc.type,
        sdp: answerDesc.sdp
    };

    socket.emit('rtcAnswer', answer.sdp);
});

socket.on('rtcHostCandidate', (candidate, sdpMid, sdpMLineIndex) => {
    let c = {
        candidate: candidate,
        sdpMid: sdpMid,
        sdpMLineIndex: sdpMLineIndex
    }

    pc.addIceCandidate(new RTCIceCandidate(c));
});

socket.on('roomPremium', () => {
    hideScreens();
    premiumScreen.removeAttribute('hidden');
});

socket.on('roomAccepted', (controllerLayout) => {
    hideScreens();
    if (controllerMode) {
        controlScreen.removeAttribute('hidden');
    }
    if (screenshareMode) {
        screenshareScreen.removeAttribute('hidden');
    }
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
    controllerMode = false;
    screenshareMode = true;
    socket.emit('joinAttempt', usernameInput.value, gamepinInput.value, "screenshare");
    hideScreens();
    waitScreen.removeAttribute('hidden');
});

bothButton.addEventListener('click', () => {
    screenshareMode = true;
    socket.emit('joinAttempt', usernameInput.value, gamepinInput.value, "both");
    hideScreens();
    waitScreen.removeAttribute('hidden');
});

// submitButton.addEventListener('click', () => {
//     socket.emit('controllerData', controllerData.value);
//     controllerData.value = '';
// });

function SendControllerData(data) {
    if (dataChannel) {
        dataChannel.send(data);
    }
}

// leaveButton.addEventListener('click', () => {
//     socket.emit('disconnectMe');
// });

// window.addEventListener('gamepadconnected', (e) => {
//     console.log("Gamepad Connected");
// });

// window.addEventListener('gamepaddisconnected', (e) => {
//     console.log("Gamepad Disconnected");
// });

function hideScreens() {
    joinScreen.setAttribute('hidden', 'true');
    waitScreen.setAttribute('hidden', 'true');
    premiumScreen.setAttribute('hidden', 'true');
    screenshareScreen.setAttribute('hidden', 'true');
    controlScreen.setAttribute('hidden', 'true');
    disconnectScreen.setAttribute('hidden', 'true');
}

const url = new URL(window.location.href);
var urlPin = url.searchParams.get('pin');
if (urlPin) {
    gamepinInput.value = urlPin;
}