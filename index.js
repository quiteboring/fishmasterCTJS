const ArmorStandEntity = Java.type("net.minecraft.entity.decoration.ArmorStandEntity");
const Iterable = Java.type("java.lang.Iterable");

const CONFIG = {
    recastDelay: 30,
    reelingDelay: 5,
    maxCastAttempts: 5,
    randomization: 0.2,
    debug: false
};

let enabled = false;
let state = "IDLE";
let delayTimer = 0;
let reelingTimer = 0;
let castAttempts = 0;
let lastCastTime = 0;

const LeftClickMouse = Client.getMinecraft().getClass().getDeclaredMethod('method_1536');
LeftClickMouse.setAccessible(true);

const RightClickMouse = Client.getMinecraft().getClass().getDeclaredMethod('method_1583');
RightClickMouse.setAccessible(true);

function debugMsg(msg) {
    if (CONFIG.debug) {
        ChatLib.chat("&7[Debug] &f" + msg);
    }
}

function leftClick() {
    const mc = Client.getMinecraft();
    if (mc && mc.player) {
        LeftClickMouse.invoke(mc);
    }
}

function rightClick() {
    const mc = Client.getMinecraft();
    if (mc && mc.player) {
        RightClickMouse.invoke(mc);
    }
}

function getRandomDelay(base) {
    const variance = base * CONFIG.randomization;
    return Math.max(2, Math.round(base + (Math.random() * 2 - 1) * variance));
}

function hasBobberInWater() {
    const player = Player.toMC();
    if (!player) return false;
    const bobber = player.fishHook;
    return bobber && (bobber.isTouchingWater() || bobber.isInLava());
}

function isBobberInWater(bobber) {
    return bobber && (bobber.isTouchingWater() || bobber.isInLava());
}

function detectFishBite() {
    const mc = Client.getMinecraft();
    const player = mc?.player;
    const world = mc?.world;
    
    if (!player || !world || !hasBobberInWater()) {
        return false;
    }

    
    const allEntities = World.getAllEntities();
    
    for (let i = 0; i < allEntities.length; i++) {
        const entity = allEntities[i];
        const mcEntity = entity.toMC ? entity.toMC() : entity;
        
        if (mcEntity instanceof ArmorStandEntity) {
            if (mcEntity.hasCustomName()) {
                const customName = mcEntity.getCustomName();
                if (customName) {
                    const nameString = customName.getString();
                    if (nameString === "!!!" || nameString.includes("!!!")) {
                        const distance = mcEntity.squaredDistanceTo(player);
                        if (distance <= 50 * 50) {
                            return true;
                        }
                    }
                }
            }
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