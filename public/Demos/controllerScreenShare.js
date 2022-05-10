var canvas, ctx;
var onMobile = false;

class JoystickObj {

    constructor(posX, posY) {
        this.posX = posX;
        this.posY = posY;

        this.outerRadius = 100;
        this.innerRadius = 50;
        this.outlineThickness = 8;
        this.bgColor = '#ECE5E5';
        this.fillColor = '#F08080';
        this.outlineColor = '#F6ABAB';

        this.pressID = 0;
        this.pressed = false;
        this.lockX = false;
        this.lockY = false;
        this.stickX = 0;
        this.stickY = 0;
    }

    setPressed(pressed, pid) {
        this.pressed = pressed;
        this.pressID = pid;
        if (!pressed) {
            this.movePress(this.posX, this.posY);
        }
    }

    setAxis(axis, value) {
        let localX = this.stickX;
        let localY = this.stickY;
        if (axis == 0) {
            localX = value * this.outerRadius;
        } else if (axis == 1) {
            localY = value * this.outerRadius;
        }

        let mag = Math.sqrt(Math.pow(localX, 2) + Math.pow(localY, 2));
        if (mag > this.outerRadius) {
            localX *= this.outerRadius / mag;
            localY *= this.outerRadius / mag;
        }
        if (!this.lockX)
            this.stickX = localX;
        if (!this.lockY)
            this.stickY = localY;
        
        Draw();
    }

    getAxis(axis) {
        if (axis == 0) {
            return this.stickX / this.outerRadius;
        } else if (axis == 1) {
            return this.stickY / this.outerRadius;
        } 
    }

    movePress(x, y) {
        let localX = x - this.posX;
        let localY = y - this.posY;
        let mag = Math.sqrt(Math.pow(localX, 2) + Math.pow(localY, 2));
        if (mag > this.outerRadius) {
            localX *= this.outerRadius / mag;
            localY *= this.outerRadius / mag;
        }
        if (!this.lockX)
            this.stickX = localX;
        if (!this.lockY)
            this.stickY = localY;
    }

    draw(ctx) {
        // Background
        ctx.beginPath();
        ctx.arc(this.posX, this.posY, this.outerRadius, 0, Math.PI * 2, true);
        ctx.fillStyle = this.bgColor;
        ctx.fill();
        // Joystick
        ctx.beginPath();
        ctx.arc(this.stickX + this.posX, this.stickY + this.posY, this.innerRadius, 0, Math.PI * 2, true);
        ctx.fillStyle = this.fillColor;
        ctx.fill();
        ctx.strokeStyle = this.outlineColor;
        ctx.lineWidth = this.outlineThickness;
        ctx.stroke();
    }

    isTouching(x, y) {
        var current_radius = Math.sqrt(Math.pow(x - this.posX, 2) + Math.pow(y - this.posY, 2));
        if (this.outerRadius >= current_radius) return true;
        else return false
    }

    getState() {
        return `${this.getAxis(0)},${this.getAxis(1)}`;
    }
}

class ButtonObj {

    constructor(posX, posY) {
        this.posX = posX;
        this.posY = posY;

        this.radius = 50;
        this.outlineThickness = 8;
        this.fillColor = '#F08080';
        this.outlineColor = '#F6ABAB';
        this.textFont = "30px Arial";
        this.textColor = '#ff0000';
        this.label = 'A';
        
        this.pressable = true;
        this.pressID = 0;
        this.pressed = false;
    }

    setPressed(pressed, pid) {
        if (this.pressable) {
            this.pressed = pressed;
            this.pressID = pid;
            Draw();
        }
    }
    
    movePress(x, y) {

    }

    draw(ctx) {
        // Button
        ctx.beginPath();
        ctx.arc(this.posX, this.posY, this.radius, 0, Math.PI * 2, true);
        ctx.fillStyle = this.pressed ?  this.outlineColor : this.fillColor;
        ctx.fill();
        ctx.strokeStyle = this.outlineColor;
        ctx.lineWidth = this.outlineThickness;
        ctx.stroke();
        // Label
        ctx.font = this.textFont;
        ctx.fillStyle = this.textColor;
        ctx.textAlign = "center";
        ctx.fillText(this.label, this.posX, this.posY);
    }

    isTouching(x, y) {
        var current_radius = Math.sqrt(Math.pow(x - this.posX, 2) + Math.pow(y - this.posY, 2));
        if (this.radius >= current_radius) return true;
        else return false
    }

    getState() {
        return this.pressed;
    }
}

var drawObjs = [new JoystickObj(100, 100)];

canvas = document.getElementById('canvas');
ctx = canvas.getContext('2d');

if (/Android|webOS|iPhone|iPad|Mac|Macintosh|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
    // onMobile = true;
}

if (onMobile) {
    drawObjs.forEach(obj => {
        let a = obj.posX;
        obj.posX = obj.posY;
        obj.posY = a;
    });
}

resize();
Draw();

document.addEventListener('mousedown', startPress);
document.addEventListener('mouseup', endPress);
document.addEventListener('mousemove', movePress);

document.addEventListener('touchstart', startPress);
document.addEventListener('touchend', endPress);
document.addEventListener('touchcancel', endPress);
document.addEventListener('touchmove', movePress);
//window.addEventListener('resize', resize);

document.addEventListener("gesturestart", gesture, false);
document.addEventListener("gesturechange", gesture, false);
document.addEventListener("gestureend", gesture, false);

let coords = [];//{ x: 0, y: 0 };

function getPositions(event) {
    coords = [];
    if (event.clientX) {
        let mouse_x = event.clientX;
        let mouse_y = event.clientY;
        coords.push({
            id: 'mouse',
            x: mouse_x - canvas.offsetLeft,
            y: mouse_y - canvas.offsetTop
        });
    } else if (event.changedTouches) {
        for (i = 0; i < event.changedTouches.length; i++) {
            let mouse_x = event.changedTouches[i].clientX;
            let mouse_y = event.changedTouches[i].clientY;
            coords.push({
                id: event.changedTouches[i].identifier,
                x: mouse_x - canvas.offsetLeft,
                y: mouse_y - canvas.offsetTop
            });
        }
    }
    // var mouse_x = event.clientX || event.touches[0].clientX;
    // var mouse_y = event.clientY || event.touches[0].clientY;
    // coord.x = mouse_x - canvas.offsetLeft;
    // coord.y = mouse_y - canvas.offsetTop;
}

function startPress(event) {
    getPositions(event);
    coords.forEach(c => {
        drawObjs.forEach(obj => {
            if (obj.isTouching(c.x, c.y)) {
                obj.setPressed(true, c.id);
            }
        });
    });
    Draw();
}
function endPress(event) {
    getPositions(event);
    coords.forEach(c => {
        drawObjs.forEach(obj => {
            if (obj.pressID == c.id) {
                obj.setPressed(false, 0);
            }
        });
    });
    Draw();
}
function movePress(event) {
    try {
        event.preventDefault();
    } catch {}
    getPositions(event);
    coords.forEach(c => {
        drawObjs.forEach(obj => {
            if (obj.pressID == c.id) {
                obj.movePress(c.x, c.y);
            }
        });
    });
    Draw();
}

function gesture(event) {
    event.preventDefault();
}

function resize() {
    ctx.canvas.width = 500;
    ctx.canvas.height = 500;
}

function Draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawObjs.forEach(obj => {
        obj.draw(ctx);
    });
    SendChanges();
}

function GenerateState() {
    // let out = '';
    // for (let i = 0; i < drawObjs.length; i++) {
    //     out += drawObjs[i].getState() + ', ';
    // }
    // return out;
    return drawObjs[0].getState();
}

var controllerState = '';

function SendChanges() {
    let newState = GenerateState();
    if (newState != controllerState) {
        controllerState = newState;
        SendControllerData(newState);
    }
}

// setInterval(SendChanges, 1);