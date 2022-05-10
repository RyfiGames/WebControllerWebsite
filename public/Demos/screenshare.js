const socket = io('wss://controller.y33t.net:443')
const videoPlayer = document.getElementById("remoteVideo");
const joystickText = document.getElementById("joystickText");
joystickText.innerHTML = "poop";

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

pc.ondatachannel = function(ev) {
  console.log('Data channel is created!');
  ev.channel.onopen = function() {
    console.log('Data channel is open and ready to be used.');
    };
    ev.channel.onmessage = (e) => {
        console.log(e.data);
    }
    dataChannel = ev.channel;
};

pc.ontrack = (e) => {
    console.log('got track! ' + e.streams.length);
    e.streams[0].getTracks().forEach((track) => {
        console.log('track');
        remoteStream.addTrack(track);
    });
}
videoPlayer.srcObject = remoteStream;

pc.onicecandidate = (e) => {
    if (e.candidate) {
        // candidate, sdpMid, sdpMLineIndex
        socket.emit('rtcAnswerCandidate', e.candidate.candidate, e.candidate.sdpMid, e.candidate.sdpMLineIndex);
        console.log('sent ICE candidate');
    }
}

socket.on('connect', () => {
    socket.emit('debugScreenshare');
});

socket.on('debugScreenshareMe', async (sdp) => {
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
    console.log('got ICE candidate');
})

function SendControllerData(data) {
    joystickText.innerHTML = data;
    if (dataChannel) {
        dataChannel.send(data);
    }
}