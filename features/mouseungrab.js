const CONFIG = {
    checkInterval: 10,
    debug: false
};

let mouseWasGrabbed = false;
let autoFishingEnabled = false;
let tickCounter = 0;
let moduleClickInProgress = false;

function debug(msg) {
    if (CONFIG.debug) ChatLib.chat("&7[MouseUngrab] &f" + msg);
}

function getClient() {
    return Client.getMinecraft();
}

function getMouse() {
    const client = getClient();
    return client ? client.mouse : null;
}

export function toggleDebug() {
    CONFIG.debug = !CONFIG.debug;
    ChatLib.chat("&6[Fishmaster] &fMouse debug: " + (CONFIG.debug ? "&aON" : "&cOFF"));
}

export function setModuleClickInProgress(inProgress) {
    moduleClickInProgress = inProgress;
}

export function isModuleClickInProgress() {
    return moduleClickInProgress;
}

export function ungrabMouse() {
    const mouse = getMouse();
    if (!mouse) {
        debug("Mouse is null, cannot ungrab");
        return;
    }

    try {
        mouseWasGrabbed = mouse.isCursorLocked();
        mouse.unlockCursor();
        autoFishingEnabled = true;
        debug("Cursor ungrabbed (was grabbed: " + mouseWasGrabbed + ")");
    } catch (e) {
        debug("Failed to ungrab: " + e);
    }
}

export function restoreMouseGrab() {
    const mouse = getMouse();
    if (!mouse) {
        debug("Mouse is null, cannot restore");
        return;
    }

    if (!mouseWasGrabbed) {
        debug("Cursor was not grabbed before, not restoring");
        autoFishingEnabled = false;
        return;
    }

    if (autoFishingEnabled) {
        debug("Auto-fishing still enabled, not restoring yet");
        return;
    }

    try {
        mouse.lockCursor();
        debug("Cursor grab restored");
    } catch (e) {
        debug("Failed to restore grab: " + e);
    }
}

export function stopAndRestore() {
    autoFishingEnabled = false;
    restoreMouseGrab();
}

export function ensureMouseUngrabbedIfEnabled() {
    if (!autoFishingEnabled) return;

    const mouse = getMouse();
    if (!mouse) return;

    try {
        if (mouse.isCursorLocked()) {
            mouse.unlockCursor();
            debug("Re-ungrabbed cursor (MC tried to grab it)");
        }
    } catch (e) {}
}

export function isAutoFishingActive() {
    return autoFishingEnabled;
}

register('tick', () => {
    if (!autoFishingEnabled) return;

    tickCounter++;
    if (tickCounter >= CONFIG.checkInterval) {
        tickCounter = 0;
        ensureMouseUngrabbedIfEnabled();
    }
});

register('clicked', (x, y, button, isPressed, event) => {
    if (!autoFishingEnabled) return;
    if (moduleClickInProgress) return;
    
    cancel(event);
    debug("Blocked user click: button=" + button + " pressed=" + isPressed);
});

register('worldUnload', () => {
    if (autoFishingEnabled) {
        debug("World unload - stopping and restoring mouse");
        stopAndRestore();
    }
});
