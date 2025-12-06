const ArmorStandEntity = Java.type("net.minecraft.entity.decoration.ArmorStandEntity");

import { setModuleClickInProgress } from './mouseungrab';

const mc = Client.getMinecraft();
const LeftClickMethod = mc.getClass().getDeclaredMethod('method_1536');
LeftClickMethod.setAccessible(true);
const RightClickMethod = mc.getClass().getDeclaredMethod('method_1583');
RightClickMethod.setAccessible(true);

export function leftClick() {
    const client = Client.getMinecraft();
    if (client && client.player) {
        setModuleClickInProgress(true);
        LeftClickMethod.invoke(client);
        setModuleClickInProgress(false);
    }
}

export function rightClick() {
    const client = Client.getMinecraft();
    if (client && client.player) {
        setModuleClickInProgress(true);
        RightClickMethod.invoke(client);
        setModuleClickInProgress(false);
    }
}

export function getArmorStands() {
    const allEntities = World.getAllEntities();
    const result = [];
    for (let i = 0; i < allEntities.length; i++) {
        const entity = allEntities[i];
        const mcEntity = entity.toMC ? entity.toMC() : entity;
        if (mcEntity instanceof ArmorStandEntity) {
            result.push(mcEntity);
        }
    }
    return result;
}

export function findArmorStandsByName(name, exact) {
    const armorStands = getArmorStands();
    const result = [];
    for (let i = 0; i < armorStands.length; i++) {
        const stand = armorStands[i];
        if (stand.hasCustomName()) {
            const customName = stand.getCustomName();
            if (customName) {
                const nameString = customName.getString();
                if (exact ? nameString === name : nameString.includes(name)) {
                    result.push(stand);
                }
            }
        }
    }
    return result;
}

export function getPlayerBobber() {
    const player = Player.toMC();
    return player ? player.fishHook : null;
}

export function isBobberInLiquid(bobber) {
    return bobber && (bobber.isTouchingWater() || bobber.isInLava());
}
