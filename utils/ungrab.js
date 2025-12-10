import { isCursorLocked, lockCursor } from '../mixinEntry.js';

export const ungrabMouse = () => {
    lockCursor.attach((instance, cir) => {
        cir.cancel();
    });
    
    isCursorLocked.attach((instance, cir) => {
        Client.getMinecraft().mouse.unlockCursor();
        cir.setReturnValue(false);
    });
}

export const grabMouse = () => {
    lockCursor.attach((instance, cir) => {});
    isCursorLocked.attach((instance, cir) => {});
}