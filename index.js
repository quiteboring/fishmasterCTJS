const ArmorStandEntity = Java.type("net.minecraft.entity.decoration.ArmorStandEntity");

const CONFIG = {
    recastDelay: 30,
    reelingDelay: 5,
    maxCastAttempts: 5,
    randomization: 0.2
};

let enabled = false;
let state = "IDLE";
let delayTimer = 0;
let reelingTimer = 0;
let castAttempts = 0;
let lastCastTime = 0;

const useKey = Client.getMinecraft().options.useKey;

function rightClick() {
    const mc = Client.getMinecraft();
    if (mc && mc.player) {
        useKey.setPressed(true);
        Client.scheduleTask(1, () => useKey.setPressed(false));
    }
}

function getRandomDelay(base) {
    const variance = base * CONFIG.randomization;
    return Math.max(2, Math.round(base + (Math.random() * 2 - 1) * variance));
}

function isBobberInWater(bobber) {
    return bobber && (bobber.isTouchingWater() || bobber.isInLava());
}

function detectFishBite() {
    const player = Player.toMC();
    if (!player) return false;

    const entities = World.getAllEntitiesOfType(ArmorStandEntity);
    for (let i = 0; i < entities.length; i++) {
        const stand = entities[i];
        if (stand.getName().includes("!!!") && player.distanceTo(stand.toMC()) <= 5) {
            return true;
        }
    }
    return false;
}

function startCasting() {
    rightClick();
    state = "CASTING";
    castAttempts++;
    lastCastTime = Date.now();
    delayTimer = 10;
}

function resetState() {
    state = "IDLE";
    delayTimer = 0;
    reelingTimer = 0;
    castAttempts = 0;
}

register('tick', () => {
    if (!enabled || !World.isLoaded()) return;

    if (delayTimer > 0) { delayTimer--; return; }
    if (reelingTimer > 0) {
        reelingTimer--;
        if (reelingTimer <= 0) {
            rightClick();
            state = "IDLE";
            delayTimer = getRandomDelay(CONFIG.recastDelay);
        }
        return;
    }

    const player = Player.toMC();
    if (!player) return;

    const bobber = player.fishHook;

    switch (state) {
        case "IDLE":
            if (!bobber) {
                startCasting();
            } else if (isBobberInWater(bobber)) {
                state = "FISHING";
            }
            break;

        case "CASTING":
            if (bobber && isBobberInWater(bobber)) {
                state = "FISHING";
                castAttempts = 0;
            } else if (!bobber && Date.now() - lastCastTime > 2000) {
                if (castAttempts < CONFIG.maxCastAttempts) {
                    startCasting();
                } else {
                    ChatLib.chat("&c[Fishmaster] &fFailed to cast. Stopping.");
                    enabled = false;
                    resetState();
                }
            }
            break;

        case "FISHING":
            if (!bobber) {
                state = "IDLE";
            } else if (detectFishBite()) {
                reelingTimer = getRandomDelay(CONFIG.reelingDelay);
            }
            break;
    }
});

function toggleAutofish() {
    enabled = !enabled;
    if (enabled) {
        ChatLib.chat("&a[Fishmaster] &fAutofish &aenabled!");
        resetState();
    } else {
        ChatLib.chat("&c[Fishmaster] &fAutofish &cdisabled!");
        resetState();
    }
}

register("command", toggleAutofish).setName("autofish");

ChatLib.chat("&6[Fishmaster] &fLoaded! Use /autofish to toggle.");