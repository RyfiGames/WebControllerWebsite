// const express = require("express");
// const app = express();
const port = 80;
const portwss = 80;

// const http = require('http');
// const server = http.createServer(app);
// const { Server } = require("socket.io");
// const io = new Server(server, {
//     cors: {origin: "*" }
// });

const express = require("express");
var app = express();
var server = require('http').Server(app);

// var serverWS = require("https").createServer();
var io = require('socket.io')(server, { pingTimeout: 100000 });

const { Dictionary } = require('dictionaryjs');

app.use(express.static('public'));

// app.listen(port, () => {
//         console.log(`Example app listening at http://localhost:${port}`);
// });

// Debug Stuff
var screenHostSocket = null;
var screenShareSocket = null;
// End Debug Stuff

server.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});

var gameRooms = new Dictionary();

io.on('connection', (socket) => {
    console.log('a user connected ' + socket.id);
    socket.data = new ServerClient(socket, 'Guest', false, null);

    socket.on('disconnect', (reason) => {
        if (socket.data.room != null) {
            if (socket.data.isHost) {
                socket.data.room.closeRoom();
            } else {
                socket.data.room.disconnectPlayer(socket.data);
            }
        }
        socket.data.connected = false;
        socket.data = null;
        console.log('a user disconnected ' + socket.id + ' (' + reason + ')');
    });

    // Events from a player

    socket.on('joinAttempt', (username, gamepin, mode) => {
        if (username == null || gamepin == null || mode == null) {
            socket.disconnect();
            return;
        }
        if (socket.data.room != null) {
            return;
        }

        socket.data.username = username;
        socket.data.mode = mode;
        if (gameRooms.has(gamepin)) {
            if (gameRooms[gamepin].premium && mode == "default") {
                socket.emit('roomPremium');
            }
            else {
                gameRooms[gamepin].attemptJoin(socket.data, username, mode);
            }
        } else {
            console.log(`Room doesn't exist (${gamepin})`);
        }
    });

    socket.on('disconnectMe', () => {
        if (socket.data.room == null) return;
        socket.emit('disconnectHost', "You left the room.");
        socket.data.room.disconnectPlayer(socket.data);
    });

    socket.on('controllerData', (controller) => {
        if (controller == null) {
            socket.disconnect();
            return;
        }
        if (socket.data.room == null) return;
        socket.data.room.receiveControllerData(socket.data, controller);
    });

    // Events from a host

    socket.on('requestHost', (gameID) => {
        if (gameID == null) {
            sendError(socket.data, 'Missing argument, read the docs.');
            return;
        }
        if (socket.data.room != null) {
            socket.emit('hostFail', "client is already in a room");
            sendError(socket.data, 'Host request failed.');
            return;
        }

        let room = new GameRoom();
        let pin = makeuniqueid(6, gameRooms);
        room.roomHost = socket.data;
        room.gameID = gameID;
        if (gameID == 'premium100') {
            room.premium = true;
        }
        room.gamepin = pin;
        gameRooms.set(pin, room);
        socket.data.isHost = true;
        socket.data.room = room;

        socket.emit('hostConfirm', pin);
    });

    socket.on('acceptPlayer', (jaid) => {
        if (jaid == null) {
            sendError(socket.data, 'Missing argument, read the docs.');
            return;
        }

        if (!socket.data.isHost || socket.data.room == null) {
            sendError(socket.data, 'You are not a host');
            return;
        }

        socket.data.room.acceptPlayer(jaid);
    });

    socket.on('kickPlayer', (userID) => {
        if (userID == null) {
            sendError(socket.data, 'Missing argument, read the docs.');
            return;
        }
        if (!socket.data.isHost || socket.data.room == null) {
            sendError(socket.data, 'You are not a host');
            return;
        }
        socket.data.room.kickPlayer(userID);
    });

    socket.on('closeRoom', () => {
        if (!socket.data.isHost || socket.data.room == null) {
            sendError(socket.data, 'You are not a host');
            return;
        }
        socket.data.room.closeRoom();
    });

    // WebRTC Events
    socket.on('rtcOffer', (userID, sdp) => {
        socket.data.room.players[userID].socket.emit('rtcOffer', sdp);
    });

    socket.on('rtcHostCandidate', (userID, candidate, sdpMid, sdpMLineIndex) => {
        socket.data.room.players[userID].socket.emit('rtcHostCandidate', candidate, sdpMid, sdpMLineIndex);
    });

    socket.on('rtcAnswer', (data) => {
        socket.data.room.roomHost.socket.emit('rtcAnswer', socket.data.userID, data);
    });

    socket.on('rtcAnswerCandidate', (candidate, sdpMid, sdpMLineIndex) => {
        socket.data.room.roomHost.socket.emit('rtcAnswerCandidate', socket.data.userID, candidate, sdpMid, sdpMLineIndex);
    });

    // Debug Events
    socket.on('controllerDataPing', (controller) => {
        socket.emit('controllerDataPong', controller);
    });

    socket.on('debugScreenshare', () => {
        screenShareSocket = socket;
    });

    socket.on('hostPeerData', (sdp) => {
        screenHostSocket = socket;
        screenShareSocket.emit('debugScreenshareMe', sdp);
    });
});

// serverWS.listen(portwss);

function sendError(client, msg) {
    client.hostAudit++;
    let status = client.socket.data.hostAudit < 100;
    client.socket.emit('errorMessage', msg, true);
    if (!status) {
        client.socket.emit('errorMessage', 'Disconnected due to many errors.', false);
        client.socket.disconnect(true);
    }
}

function makeid(length) {
    var result           = '';
    var characters       = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnopqrstuvwxyz23456789';
//  var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
   }
   return result;
}

function makeuniqueid(length, checkList) {
    let id = '';
    do {
        id = makeid(length);
    } while (checkList.has(id));
    return id;
}

class ServerClient {
    socket;
    connected = true;

    username;
    userID;
    isHost;
    room;
    mode;

    hostAudit = 0;

    constructor(socket, username, isHost, room) {
        this.socket = socket;
        this.username = username;
        this.isHost = isHost;
        this.room = room;
    }
}

class GameRoom {
    roomHost;
    gameID;
    premium = false;
    players = new Dictionary();
    gamepin = '';
    joinAttempts = new Dictionary();

    attemptJoin(client, username, mode) {
        let jaid = makeuniqueid(6, this.joinAttempts);
        this.joinAttempts.set(jaid, client);
        this.roomHost.socket.emit('joinAttempt', username, jaid, mode);
    }

    acceptPlayer(jaid) {
        if (!this.joinAttempts.has(jaid)) {
            sendError(this.roomHost, 'The submitted join id does not exist.');
            return;
        }
        let newPlayer = this.joinAttempts[jaid];
        if (!newPlayer.connected) return;
        
        this.joinAttempts.remove(jaid);
        let userID = makeuniqueid(6, this.players);
        this.players.set(userID, newPlayer);
        newPlayer.userID = userID;
        newPlayer.room = this;
        this.roomHost.socket.emit('acceptedPlayer', newPlayer.username, userID, newPlayer.mode);
        newPlayer.socket.emit('roomAccepted', null);
    }

    receiveControllerData(client, controller) {
        let pid = client.userID;
        this.roomHost.socket.emit('controllerData', pid, controller);
    }

    disconnectPlayer(client) {
        let pid = client.userID;
        client.room = null;
        this.players.remove(pid);
        this.roomHost.socket.emit('disconnectPlayer', pid);
    }

    kickPlayer(userID) {
        if (!this.players.has(userID)) {
            sendError(this.roomHost, 'The submitted user id does not exist.');
            return;
        }
        this.players[userID].socket.emit('disconnectHost', "Kicked by the host.");
        this.disconnectPlayer(this.players[userID]);
    }

    closeRoom() {
        console.log("Host closed room");
        // let p = this.players.values;
        // for (let i = 0; i < p.length; i++) {
        //     if (p[i] != null) {
        //         p[i].socket.emit('disconnectHost', "Game room was closed by the host.");
        //         this.disconnectPlayer(p[i]);
        //     }
        // }
        this.players.forEach((key,value) => {
            if (value != null) {
                value.socket.emit('disconnectHost', "Game room was closed by the host.");
                this.disconnectPlayer(value);
            }
        });
        this.players.empty();
        this.joinAttempts.empty();
        this.roomHost.isHost = false;
        this.roomHost.room = null;
        gameRooms.remove(this.gamepin);
    }

}

// WebRTC Stuff //

// var ffmpeg = require('fluent-ffmpeg');
// const iceservers = {
//   iceServers: [
//     {
//       urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302'],
//     },
//   ],
//   iceCandidatePoolSize: 10,
// };
// const pc = new RTCPeerConnection(iceservers);
// let localStream = new MediaStream();
// ffmpeg.ffprobe("\\public\\Assets\\rickroll.mp4", (err, metadata) => {
//     localStream.addTrack(metadata.streams[0]);
// });

/////////////////