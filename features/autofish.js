import { rightClick, findArmorStandsByName, getPlayerBobber, isBobberInLiquid } from './mixins';
import { ungrabMouse, stopAndRestore } from './mouseungrab';

const CONFIG = {
    recastDelay: 30,
    reelingDelay: 2,
    maxCastAttempts: 5,
    randomization: 0.2,
    detectionRange: 50,
    debug: false
};

let enabled = false;
let state = "IDLE";
let delayTimer = 0;
let reelingTimer = 0;
let castAttempts = 0;
let lastCastTime = 0;

function getRandomDelay(base) {
    const variance = base * CONFIG.randomization;
    return Math.max(2, Math.round(base + (Math.random() * 2 - 1) * variance));
}

function debug(msg) {
    if (CONFIG.debug) ChatLib.chat("&7[Debug] &f" + msg);
}

function detectFishBite() {
    const bobber = getPlayerBobber();
    if (!bobber || !isBobberInLiquid(bobber)) return false;

    const player = Player.toMC();
    if (!player) return false;

    const biteStands = findArmorStandsByName("!!!", false);
    for (let i = 0; i < biteStands.length; i++) {
        const stand = biteStands[i];
        const distSq = stand.squaredDistanceTo(player);
        if (distSq <= CONFIG.detectionRange * CONFIG.detectionRange) {
            debug("Fish bite detected! Distance: " + Math.sqrt(distSq).toFixed(2));
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
    debug("Casting rod... (attempt " + castAttempts + ")");
}

function resetState() {
    state = "IDLE";
    delayTimer = 0;
    reelingTimer = 0;
    castAttempts = 0;
}

export function enable() {
    enabled = true;
    resetState();
    ungrabMouse();
    ChatLib.chat("&6[Fishmaster] &aAutofish enabled!");
}

export function disable() {
    enabled = false;
    resetState();
    stopAndRestore();
    ChatLib.chat("&6[Fishmaster] &cAutofish disabled!");
}

export function toggle() {
    if (enabled) disable();
    else enable();
}

export function toggleDebug() {
    CONFIG.debug = !CONFIG.debug;
    ChatLib.chat("&6[Fishmaster] &fDebug: " + (CONFIG.debug ? "&aON" : "&cOFF"));
}

export function isEnabled() {
    return enabled;
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
            debug("Reeled in! Waiting " + delayTimer + " ticks.");
        }
        return;
    }

    const bobber = getPlayerBobber();

    switch (state) {
        case "IDLE":
            if (!bobber) startCasting();
            else if (isBobberInLiquid(bobber)) {
                state = "FISHING";
                debug("Bobber in water, waiting for bite...");
            }
            break;

        case "CASTING":
            if (bobber && isBobberInLiquid(bobber)) {
                state = "FISHING";
                castAttempts = 0;
                debug("Bobber landed!");
            } else if (!bobber && Date.now() - lastCastTime > 2000) {
                if (castAttempts < CONFIG.maxCastAttempts) startCasting();
                else {
                    ChatLib.chat("&6[Fishmaster] &cFailed to cast. Stopping.");
                    disable();
                }
            }
            break;

        case "FISHING":
            if (!bobber) {
                state = "IDLE";
                debug("Bobber gone, recasting...");
            } else if (detectFishBite()) {
                reelingTimer = getRandomDelay(CONFIG.reelingDelay);
                debug("Fish bite! Reeling in " + reelingTimer + " ticks.");
            }
            break;
    }
});
