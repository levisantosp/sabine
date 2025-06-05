export const commands = {
  predictions: {
    embed: {
      author: "Your predictions",
      field: "Prediction: `{score1}-{score2}`\nStats: [click here]({link})",
      footer: "Page {p1}/{p2}",
      desc: "Correct predictions: `{correct}`\nWrong predictions: `{wrong}`\nTotal predictions: `{t}`"
    },
    no_predictions: "<:error:1300882259078938685> You do not have predictions.",
    no_pages: "<:error:1300882259078938685> Nothing to show in this page."
  },
  player: {
    insert_player: "<:warn:869393116854108191> Provide the name of a player.",
    player_not_found: "<:error:1300882259078938685> No players have been found with that name.",
    embed: {
      desc: "Name: `{name}`\nCurrent team: {team}\nPast teams: {pt}\nLast match: {lt}"
    }
  },
  team: {
    insert_team: "<:warn:869393116854108191> Provide the name of a team.",
    team_not_found: "<:error:1300882259078938685> No teams have been found with that name.",
    embed: {
      desc: "Players: {p}\nStaff: {s}\nLast match: {lt}\nNext match: {n}"
    }
  },
  help: {
    command_not_found: "<:error:1300882259078938685> Command not found.",
    name: "Name",
    aliases: "Aliases",
    examples: "Examples",
    syntax: "Syntax",
    permissions: "Permissions",
    footer: "[] = required argument | <> = optional argument",
    bot_permissions: "My permissions",
    title: "My commands",
    description: "For more information about a particular command, use `{arg}`.\nNeed help? Log in to the support server by clicking the button below!",
    field: "Commands ({q})",
    community: "Community and Support",
    privacy: "Terms of Service and Privacy"
  },
  ranking: {
    author: "Page {page}/{pages}",
    footer: "Your position: #{pos}",
    title: "Users with the most correct predictions",
    field: "`{t}` correct predictions",
    no_users: "<:error:1300882259078938685> No users to show in this page."
  },
  admin: {
    tournament_has_been_added: "<:error:1300882259078938685> This tournament already has been added.",
    tournament_added: "<:success:1300882212190945292> The tournament **{t}** has been added successfully!",
    channels_must_be_different: "<:warn:869393116854108191> The matches channel and results channel cannot be the same. It is recommended that the matches channel be a separate channel where there will be no member interaction.",
    tournament_removed: "<:success:1300882212190945292> The tournament **{t}** has been removed successfully!",
    dashboard: "Dashboard",
    event_channels: "Matches will be announced in {ch1}\nResults will be announced in {ch2}",
    desc: "- Language: `{lang}` (change by using: </admin language:{id}>)\n- Limit of tournaments: `{limit}`\n- VALORANT news channel: {vlr_news}\n- VALORANT live feed channel: {vlr_live}\n- League of Legends news channel: {lol_news}\n- League of legends live feed channel: {lol_live}",
    invalid_channel: "<:error:1300882259078938685> Invalid channel type. Consider select a TEXT channel.",
    limit_reached: "<:error:1300882259078938685> This server has reached the maximum limit of tournaments that can be added. If you want to add this tournaments, consider removing one using {cmd}",
    channel_being_used: "<:error:1300882259078938685> The channel {ch} is already being used to send the results of a tournament. Consider using another channel for this.\nCheck the channels that are already in use by using {cmd}",
    resend_time: "<:error:1300882259078938685> This feature has already been used recently on this server. Try again {t}.",
    resending: "<a:carregando:809221866434199634> Resending matches... Please, wait.",
    resend: "Resend {game} matches",
    confirm: "<:warn:869393116854108191> You are about to FORCE the submission of matches on this server!\n<:warn:869393116854108191> It is worth remembering that this action is **IRREVERSIBLE** and can only be done **ONCE a hour**! If you still want to add more tournaments, add them before using this feature. Do you want to continue?",
    continue: "Continue",
    remove_all: "Remove all",
    removed_all_tournaments: "<:success:1300882212190945292> All tournaments have been removed successfully!",
    resent: "<:success:1300882212190945292> Matches resent successfully!",
    invalid_channel2: "<:error:1300882259078938685> Invalid channel type. Consider select a TEXT or ANNOUNCEMENT channel.",
    news_enabled: "<:success:1300882212190945292> News feature enabled to channel {ch}",
    news_disabled: "<:success:1300882212190945292> News feature disabled successfully!",
    no_premium: "<:error:1300882259078938685> This server does not have any premium keys.",
    premium: "This server has the {key} key activated.",
    lol_esports_coverage: "League of Legends e-sports coverage",
    vlr_esports_coverage: "VALORANT e-sports coverage",
    tournaments: "## {game} tournaments added"
  },
  info: {
    embed: {
      title: "Bot information"
    },
    lib: "Library",
    creator: "Creator",
    guilds: "Servers",
    users: "Users",
    invite: "Invite me!"
  },
  premium: {
    you_dont_have_premium: "<:error:1300882259078938685> You do not have an active plan. Buy one in [support server](https://discord.com/invite/FaqYcpA84r)!",
    embed: {
      description: "Thank you for supporting the bot by subscribing to the premium.\nYour plan expires {expiresAt}",
      field: {
        value: "Key: `{key}`\nExpires {expiresAt}"
      }
    },
    button: {
      label: "View activation keys"
    },
    you_dont_have_keys: "<:error:1300882259078938685> You do not have any activation key."
  },
  activatekey: {
    key_activated: "<:success:1300882212190945292> Your key has been activated successfully! Enjoy the benefits!",
    invalid_key: "<:error:1300882259078938685> Invalid key!",
    button: "Continue",
    would_like_to_continue: "<:warn:869393116854108191> This server has a {key} key activated. Would you like to continue?",
    key_already_activated: "<:error:1300882259078938685> This key is already activated!",
    limit_reached: "<:error:1300882259078938685> This key is already activated in 2 servers."
  },
  tournament: {
    tournament_added: "<:success:1300882212190945292> The tournament **{t}** has been added successfully!",
    channels_must_be_different: "<:warn:869393116854108191> The matches channel and results channel cannot be the same. It is recommended that the matches channel be a separate channel where there will be no member interaction.",
    tournament_removed: "<:success:1300882212190945292> The tournament **{t}** has been removed successfully!",
    remove_all: "Remove all",
    invalid_channel: "<:error:1300882259078938685> Invalid channel type. Consider select a TEXT channel.",
    limit_reached: "<:error:1300882259078938685> This server has reached the maximum limit of tournaments that can be added. If you want to add this tournaments, consider removing one using {cmd}"
  },
  news: {
    invalid_channel: "<:error:1300882259078938685> Invalid channel type. Consider select a TEXT or ANNOUNCEMENT channel.",
    news_enabled: "<:success:1300882212190945292> News feature enabled to channel {ch}",
    news_disabled: "<:success:1300882212190945292> News feature disabled successfully!",
    buy_premium: "Buy the premium!"
  },
  live: {
    invalid_channel: "<:error:1300882259078938685> Invalid channel type. Consider select a TEXT channel.",
    news_enabled: "<:success:1300882212190945292> Live feed feature enabled to channel {ch}",
    news_disabled: "<:success:1300882212190945292> Live feed feature disabled successfully!",
    buy_premium: "Buy the premium!"
  }
}

export const helper = {
  palpitate: "Predict",
  stats: "Stats",
  prediction_modal: {
    title: "Your prediction for the match"
  },
  palpitate_response: "<:success:1300882212190945292> You predicted {t1} `{s1}-{s2}` {t2}",
  replied: "<:error:1300882259078938685> You have already predicted this match.",
  started: "<:error:1300882259078938685> This match has already started or finished.",
  permissions: {
    user: "<:error:1300882259078938685> You\"re weak. You lack the following permissions to use this command: {permissions}",
    bot: "<:error:1300882259078938685> I lack the following permissions for this command to work properly: {permissins}"
  },
  error: "An unexpected error has occurred...\n`{e}`",
  privacy: "Before you start to use the bot, you must accept the [Terms of Service and Privacy](https://levispires.github.io/sabine-terms/)",
  verified: "<:success:1300882212190945292> Make your prediction by clicking the button below.",
  pickem: {
    label: "Pick'em",
    res: "Join the PICK\'EM for a chance to win a <:booster:1272968894239215636> **Discord Nitro** or a <:nitro:1272968817496297542> **Discord Nitro Basic** by joining our official server!\nhttps://discord.gg/g5nmc376yh"
  },
  banned: "<:error:1300882259078938685> **You are banned and can not use the bot.\n<:warn:869393116854108191> If you think this is a mistake, contact us in our Discord server!**\n**When:** {when}\n**Ends at:** {ends}\n**Reason:** `{reason}`",
  interaction_failed: "<:error:1300882259078938685> It was not possible to run this action... If the problem persists, report it to the team in my [support server](https://discord.gg/g5nmc376yh).",
  premium_feature: "<:warn:869393116854108191> Oops, looks like you have found a premium feature. Unlock it by buying the premium on our support server!",
  live_feed_value: "Current map: `{map}`\nMap score: `{score}`",
  source: "View full article",
  live_now: "LIVE NOW",
  streams: "Streams"
}

export const permissions = {
  CREATE_INSTANT_INVITE: "Create Instant Invite",
  KICK_MEMBERS: "Kick Members",
  BAN_MEMBERS: "Ban Members",
  ADMINISTRATOR: "Administrator",
  MANAGE_CHANNELS: "Manage Channels",
  MANAGE_GUILD: "Manage Guild",
  ADD_REACTIONS: "Add Reactions",
  SEND_MESSAGES: "Send Messages",
  SEND_TTS_MESSAGES: "Send TTS Messages",
  MANAGE_MESSAGES: "Manage Messages",
  EMBED_LINKS: "Embed Links",
  ATTACH_FILES: "Attach Files",
  READ_MESSAGE_HISTORY: "Read Message History",
  MENTION_EVERYONE: "Mention Everyone",
  VOICE_USE_VAD: "Use VAD",
  CHANGE_NICKNAME: "Change Nickname",
  MANAGE_NICKNAMES: "Manage Nicknames",
  MANAGE_ROLES: "Manage Roles",
  MANAGE_EMOJIS_AND_STICKERS: "Manage Emojis And Stickers",
  USE_EXTERNAL_EMOJIS: "Use External Emojis",
  VIEW_AUDIT_LOG: "View Audit Log",
  VOICE_PRIORITY_SPEAKER: "Priority Speaker",
  VOICE_STREAM: "Stream",
  VIEW_CHANNEL: "View Channel",
  VIEW_GUILD_INSIGHTS: "View Guild Insights",
  VOICE_CONNECT: "Connect",
  VOICE_SPEAK: "Speak",
  VOICE_MUTE_MEMBERS: "Mute Members",
  VOICE_REQUEST_TO_SPEAK: "Request to Speak",
  VOICE_DEAFEN_MEMBERS: "Deafen Members",
  VOICE_MOVE_MEMBERS: "Move Members",
  MANAGE_WEBHOOKS: "Manage Webhooks",
  USE_APPLICATION_COMMANDS: "Use Application Commands",
  CREATE_PRIVATE_THREADS: "Create Private Threads",
  CREATE_PUBLIC_THREADS: "Create Public Threads",
  USE_EXTERNAL_STICKERS: "Use External Stickers",
  MANAGE_THREADS: "Manage Threads",
  SEND_MESSAGES_IN_THREADS: "Send Messages In Threads",
  START_EMBEDDED_ACTIVITIES: "Start Activities",
  MODERATE_MEMBERS: "Timeout Members"
}