
var gamepads = [];
var gamepadCount = 0;
var joysticks = [];
var buttons = [];

var buttonMappingsByID = {};
var axisMappingsByID = {};

function gamepadHandler(event, connecting) {
    var gamepad = event.gamepad;
    console.log("Gamepad " + (connecting ? "connected" : "disconnected"));
    if (!connecting)
        gamepad = null;
  // Note:
  // gamepad === navigator.getGamepads()[gamepad.index]

//   if (connecting) {
//       gamepads[gamepad.index] = gamepad;
//       if (buttonMappingsByID[gamepad.id] == null) {
//           buttonMappingsByID[gamepad.id] = [];
//           axisMappingsByID[gamepad.id] = [];
//       }
//       gamepadCount++;
//   } else {
//       delete gamepads[gamepad.index];
//       gamepadCount--;
//   }
}

window.addEventListener("gamepadconnected", function(e) { gamepadHandler(e, true); }, false);
window.addEventListener("gamepaddisconnected", function (e) { gamepadHandler(e, false); }, false);

function ReadGamepadState() {
    gamepads = navigator.getGamepads();
    gamepadCount = gamepads.length;
    if (gamepadCount == 0 || gamepads[0] == null) return;
    //addMessage(`Gamepad has ${gamepad.axes.length} axes and ${gamepad.buttons.length} buttons`);
    drawObjs[0].setAxis(0, gamepads[0].axes[0]);
    drawObjs[0].setAxis(1, gamepads[0].axes[1]);
    drawObjs[1].setPressed(gamepads[0].buttons[1].pressed, "gamepad");
    drawObjs[2].setPressed(gamepads[0].buttons[4].pressed, "gamepad");
    drawObjs[3].setPressed(gamepads[0].buttons[5].pressed, "gamepad");
}

function AddButtonMapping() {}

setInterval(ReadGamepadState, 1);