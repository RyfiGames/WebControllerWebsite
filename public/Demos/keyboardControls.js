var pressedKeys = [];

window.addEventListener('keydown', (e) => {
    let key = e.key;
    //console.log(key);
    if (pressedKeys.indexOf(key) > -1) return;
    pressedKeys.push(key);

    if (key == ' ') {
        drawObjs[2].setPressed(true, "keyboard");
    }
});

window.addEventListener('keyup', (e) => {
    let key = e.key;

    if (pressedKeys.indexOf(key) == -1) return;
    pressedKeys.splice(pressedKeys.indexOf(key));

    // if (key == 'w') {
    //     drawObjs[0].setAxis(1, 0);
    // }
    // if (key == 'a') {
    //     drawObjs[0].setAxis(0, 0);
    // }
    // if (key == 's') {
    //     drawObjs[0].setAxis(1, 0);
    // }
    // if (key == 'd') {
    //     drawObjs[0].setAxis(0, 0);
    // }
    if (key == ' ') {
        drawObjs[2].setPressed(false, "keyboard");
    }
});

setInterval(checkKeys, 1);

function checkKeys() {
    let pw = pressedKeys.indexOf('w') > -1;
    let pa = pressedKeys.indexOf('a') > -1;
    let ps = pressedKeys.indexOf('s') > -1;
    let pd = pressedKeys.indexOf('d') > -1;
    if (pw || pa || ps || pd) {
        drawObjs[0].setAxis(0, 0);
        drawObjs[0].setAxis(1, 0);
    }
    if (pw) {
        drawObjs[0].setAxis(1, -1);
    }
    if (pa) {
        drawObjs[0].setAxis(0, -1);
    }
    if (ps) {
        drawObjs[0].setAxis(1, 1);
    }
    if (pd) {
        drawObjs[0].setAxis(0, 1);
    }
}