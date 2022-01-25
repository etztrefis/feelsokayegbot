# Command sample:
```
export const command = {
  name: "command name",
  active: true,
  cooldown: 5000,
  bypassCooldown: false,
  cooldown_mode: levels.USERCOMMAND,
  permission: commandPermissions.MOD,
  author_permission: false,
  description: "command description",
  aliases: ["aliases"],
  run: async (context: cmdData, okayeg: Bot) => {
    // your code...
  },
};
```


# Required:
  - name
  - aliases
  - active
  - author_permission
  - run

# Optional:
  - cooldown
  - description
  - bypassCooldown
  - cooldown_mode
  - permission

# Typings:
## Command:
```
type nestedBotCommand = {
  name: string;
  aliases: string[];
  description?: string;
  cooldown?: number;
  bypassCooldown?: boolean;
  cooldown_mode?: levels;
  permission?: commandPermissions;
  author_permission: boolean;
  active: boolean;
  run: (context: cmdData, okayeg: Bot) => Promise<void>;
};
```

## Levels:
```
enum levels {
  USERCOMMAND = "UserCommand",
  DISABLED = "Disabled",
  USER = "User",
  CHANNEL = "Channel",
}
```
## CommandPermissions:
```
enum commandPermissions {
  BROADCASTER = "broadcaster",
  MOD = "mod",
}
```