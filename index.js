import { toggle, toggleDebug } from './features/autofish';
import { getArmorStands } from './features/mixins';
import { toggleDebug as toggleMouseDebug } from './features/mouseungrab';

register("command", toggle).setName("autofish");

register("command", toggleDebug).setName("fishdebug");

register("command", toggleMouseDebug).setName("fishmousedebug");

register("command", () => {
    const stands = getArmorStands();
    ChatLib.chat("&6[Fishmaster] &fScanning...");
    let count = 0;
    for (let i = 0; i < stands.length; i++) {
        const stand = stands[i];
        if (stand.hasCustomName()) {
            const name = stand.getCustomName();
            if (name) {
                ChatLib.chat("&7  Found: '" + name.getString() + "'");
                count++;
            }
        }
    }
    ChatLib.chat("&6[Fishmaster] &fFound " + count + " named armor stands.");
}).setName("fishscan");

register("command", () => {
    ChatLib.chat("&6=== Fishmaster Commands ===");
    ChatLib.chat("&e/autofish &7- Toggle autofish");
    ChatLib.chat("&e/fishdebug &7- Toggle debug mode");
    ChatLib.chat("&e/fishmousedebug &7- Toggle mouse debug");
    ChatLib.chat("&e/fishscan &7- Scan armor stands");
    ChatLib.chat("&e/fishhelp &7- Show this help");
}).setName("fishhelp");

ChatLib.chat("&6[Fishmaster] &fLoaded! Use &e/autofish &fto toggle!.");