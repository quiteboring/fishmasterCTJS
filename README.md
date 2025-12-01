# Fishmaster

A ChatTriggers module for automated fishing in Hypixel Skyblock.

## Requirements

- Minecraft 1.21.x
- [ChatTriggers 3.0.0](https://github.com/Synnerz/ctjs/tree/1.21.8) (Fabric)

## Installation

1. Install ChatTriggers 3.0.0 for Fabric
2. Clone or download this repository
3. Place the `fishmaster` folder in `.minecraft/config/ChatTriggers/modules/`
4. Run `/ct load` in-game or restart Minecraft

## Usage

| Command | Description |
|---------|-------------|
| `/autofish` | Toggle autofish on/off |

## Features

- **Auto Cast**: Automatically casts your fishing rod
- **Fish Bite Detection**: Detects fish bites via "!!!" armor stand indicator (Hypixel Skyblock)
- **Auto Reel**: Automatically reels in when fish is detected
- **Lava Fishing**: Supports both water and lava fishing
- **Randomized Delays**: Adds variance to delays to appear more human-like
- **Auto Recast**: Attempts to recast if casting fails

## Configuration

Edit the `CONFIG` object at the top of `index.js`:

```javascript
const CONFIG = {
    recastDelay: 30,      // Ticks between casts (30 = 1.5s)
    reelingDelay: 5,      // Ticks before reeling in
    maxCastAttempts: 5,   // Max recast attempts before stopping
    randomization: 0.2    // Delay variance (0.2 = ±20%)
};
```

## How It Works

The module uses a simple state machine:

1. **IDLE**: Waiting to cast
2. **CASTING**: Rod cast, waiting for bobber to land in water
3. **FISHING**: Bobber in water, waiting for fish bite

Fish bites are detected by looking for armor stands with "!!!" in their name within 5 blocks of the player (Hypixel Skyblock specific).

---

## Contributing

### Project Structure

```
fishmaster/
├── index.js        # Main module code
├── metadata.json   # Module metadata
└── README.md       # This file
```

### Code Overview

| Function | Purpose |
|----------|---------|
| `rightClick()` | Simulates right-click using keybind |
| `getRandomDelay(base)` | Adds randomization to delays |
| `isBobberInWater(bobber)` | Checks if bobber is in water/lava |
| `detectFishBite()` | Detects "!!!" armor stands nearby |
| `startCasting()` | Initiates a cast |
| `resetState()` | Resets all state variables |
| `toggleAutofish()` | Toggles the module on/off |

### State Machine

```
IDLE ──(no bobber)──> CASTING
  │                      │
  │                      │ (bobber in water)
  │                      ▼
  └──(bobber in water)──> FISHING
                           │
                           │ (fish bite detected)
                           ▼
                      [Reel in] ──> IDLE
```

### Development Tips

1. **Testing**: Use `/ct load` to reload changes without restarting
2. **Debugging**: Add `ChatLib.chat()` calls to trace execution
3. **CT Docs**: Refer to [ChatTriggers Slate](https://chattriggers.com/slate/)

### Adding Features

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Make your changes
4. Test thoroughly in-game
5. Submit a pull request

### Code Style

- Use `const` for constants, `let` for variables
- Use descriptive function names
- Keep functions small and focused
- Add comments for complex logic

## License

MIT

## Disclaimer

Use at your own risk. Automated fishing may violate server rules.
