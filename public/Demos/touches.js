var body = document.body;

function addMessage(msg) {
    body.innerHTML = `<p>${msg}</p>` + body.innerHTML;
}

addMessage(navigator.userAgent);

document.addEventListener('mousedown', (e) => {
    addMessage(`Mouse Down (${e.clientX}, ${e.clientY})`);
});
document.addEventListener('mouseup', (e) => {
    addMessage(`Mouse Up (${e.clientX}, ${e.clientY})`);
});
document.addEventListener('mousemove', (e) => {
    //addMessage(`Mouse Move (${e.clientX}, ${e.clientY})`);
});

document.addEventListener('touchstart', (e) => {
    e.preventDefault();
    addMessage(`Touch Start (${e.touches.length} touches)`);
    // for (i = 0; i < e.touches.length; i++) {
    //     addMessage(`Touch ${i} (${e.touches[i].clientX}, ${e.touches[i].clientY})`);
    // }
    for (i = 0; i < e.changedTouches.length; i++) {
        addMessage(`Changed Touch ${e.changedTouches[i].identifier} (${e.changedTouches[i].clientX}, ${e.changedTouches[i].clientY})`);
    }
});
document.addEventListener('touchend', (e) => {
    addMessage(`Touch End (${e.touches.length} touches)`);
    // for (i = 0; i < e.touches.length; i++) {
    //     addMessage(`Touch ${i} (${e.touches[i].clientX}, ${e.touches[i].clientY})`);
    // }
    for (i = 0; i < e.changedTouches.length; i++) {
        addMessage(`Changed Touch ${e.changedTouches[i].identifier} (${e.changedTouches[i].clientX}, ${e.changedTouches[i].clientY})`);
    }
});
document.addEventListener('touchcancel', (e) => {
    addMessage(`Touch Cancel (${e.touches.length} touches)`);
    // for (i = 0; i < e.touches.length; i++) {
    //     addMessage(`Touch ${i} (${e.touches[i].clientX}, ${e.touches[i].clientY})`);
    // }
    for (i = 0; i < e.changedTouches.length; i++) {
        addMessage(`Changed Touch ${e.changedTouches[i].identifier} (${e.changedTouches[i].clientX}, ${e.changedTouches[i].clientY})`);
    }
});
document.addEventListener('touchmove', (e) => {
    e.preventDefault();
    //addMessage(`Touch Move (${e.touches.length} touches)`);
    for (i = 0; i < e.touches.length; i++) {
        //addMessage(`Touch ${i} (${e.touches[i].clientX}, ${e.touches[i].clientY})`);
    }
    for (i = 0; i < e.changedTouches.length; i++) {
        //addMessage(`Changed Touch ${e.changedTouches[i].identifier} (${e.changedTouches[i].clientX}, ${e.changedTouches[i].clientY})`);
    }
});

document.addEventListener("gesturestart", (e) => {
    e.preventDefault();
    addMessage("Gesture Start");
});
document.addEventListener("gesturechange", (e) => {
    e.preventDefault();
    addMessage("Gesture Change");
});
document.addEventListener("gestureend", (e) => {
    addMessage("Gesture End");
});