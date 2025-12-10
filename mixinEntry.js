const mouse = new Mixin('net.minecraft.client.Mouse');

export const isCursorLocked = mouse.inject({
    method: 'isCursorLocked()Z',
    at: new At({ value: 'HEAD' }),
    cancellable: true,
});

export const lockCursor = mouse.inject({
    method: 'lockCursor()V',
    at: new At({ value: 'HEAD' }),
    cancellable: true,
});