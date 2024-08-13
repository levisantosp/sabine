export const commands = {
  history: {
    embed: {
      author: 'Your predictions',
      field: 'Prediction: `{score1}-{score2}`\nResult: [click here]({link})',
      footer: 'Page {p1}/{p2}',
      desc: 'Right predictions: `{right}`\nWrong predictions: `{wrong}`\nTotal predictions: `{t}`'
    },
    no_predictions: 'You do not have predictions.'
  },
  player: {
    insert_player: 'Provide the name of a player.',
    no_player_found: 'No players have been found with that name.',
    embed: {
      desc: 'Name: `{name}`\nCurrent team: {team}\nPast teams: {pt}\nLast match: {lt}'
    }
  },
  team: {
    insert_team: 'Provide the name of a team.',
    no_team_found: 'No teams have been found with that name.',
    embed: {
      desc: 'Players: {p}\nStaff: {s}\nLast match: {lt}\nNext match: {n}'
    }
  },
  help: {
    command_not_found: 'Command not found.',
    name: 'Name',
    aliases: 'Aliases',
    examples: 'Examples',
    syntax: 'Syntax',
    permissions: 'Permissions',
    footer: '[] = required argument | <> = optional argument',
    bot_permissions: 'My permissions',
    title: 'My commands',
    description: 'For more information about a particular command, use `{arg}`.\nNeed help? Log in to the support server by clicking the button below!',
    field: 'Commands ({q})',
    community: 'Community and Support',
    privacy: 'Terms of Service and Privacy'
  },
  leaderboard: {
    author: 'Page {page}/{pages}',
    footer: 'Your position: #{pos}',
    title: 'Users with the most correct predictions',
    field: '`{t}` correct predictions',
    no_users: 'No users to show in this page.'
  },
  admin: {
    tournament_has_been_added: 'This tournament already has been added.',
    tournament_added: 'The tournament **{t}** has been added successfuly!',
    channels_must_be_different: 'The matches channel and results channel cannot be the same. It is recommended that the matches channel be a separate channel where there will be no member interaction.',
    tournament_removed: 'The tournament **{t}** has been removed successfuly!',
    panel: 'Control Panel',
    event_channels: 'Matches will be announced in {ch1}\nResults will be announced in {ch2}',
    desc: 'Language: `{lang}` (change by using: </admin language:{id}>)\nLimit of tournaments: `{limit}`',
    invalid_channel: 'Invalid channel type. Consider select a TEXT channel.',
    limit_reached: 'This server has reached the maximum limit of tournaments that can be added. If you want to add this tournaments, consider removing one using {cmd}',
    channel_being_used: 'The channel {ch} is already being used to announce the matches of another tournament. Consider using another channel for this.\nCheck the channels that are already in use by using {cmd}',
    resend_time: 'This feature has already been used today on this server. Try again tomorrow.',
    resending: 'Resending matches. It may take a few minutes for matches to be resent, just wait.',
    resend: 'Resend matches',
    confirm: 'You are about to FORCE the submission of matches on this server!\nIt is worth remembering that this action is **IRREVERSIBLE** and can only be done **ONCE a day**! If you still want to add more tournaments, add them before using this feature.\nDo you want to continue?',
    continue: 'Continue'
  },
  info: {
    embed: {
      title: 'Bot information'
    },
    lib: 'Library',
    creator: 'Creator',
    guilds: 'Servers',
    users: 'Users',
    invite: 'Invite me!'
  }
}
export const helper = {
  palpitate: 'Make a prediction',
  stats: 'Stats',
  palpitate_modal: {
    title: 'Your prediction for the match'
  },
  palpitate_response: 'You predicted {t1} `{s1}-{s2}` {t2}',
  replied: 'You have already predicted this match.',
  started: 'This match has already started or finished.',
  permissions: {
    user: 'You\'re weak. You lack the following permissions to use this command: {permissions}',
    bot: 'I lack the following permissions for this command to work properly: {permissins}'
  },
  error: 'An unexpected error has occurred...\n`{e}`',
  privacy: 'Before you start to use the bot, you must accept the [Terms of Service and Privacy](https://levispires.github.io/sabine-terms/)',
  verifying: '<a:carregando:809221866434199634> Processing request... just wait.',
  verified: '<:sucess:869391072323846184> Request processed. You can already make a prediction.',
  pickem: {
    label: 'Pick\'em',
    res: 'Join the PICK\'EM for a chance to win a <:booster:1272968894239215636> **Discord Nitro** or a <:nitro:1272968817496297542> **Discord Nitro Basic** by joining our official server!\nhttps://discord.gg/g5nmc376yh'
  }
}
export const permissions = {
  CREATE_INSTANT_INVITE: 'Create Instant Invite',
  KICK_MEMBERS: 'Kick Members',
  BAN_MEMBERS: 'Ban Members',
  ADMINISTRATOR: 'Administrator',
  MANAGE_CHANNELS: 'Manage Channels',
  MANAGE_GUILD: 'Manage Guild',
  ADD_REACTIONS: 'Add Reactions',
  SEND_MESSAGES: 'Send Messages',
  SEND_TTS_MESSAGES: 'Send TTS Messages',
  MANAGE_MESSAGES: 'Manage Messages',
  EMBED_LINKS: 'Embed Links',
  ATTACH_FILES: 'Attach Files',
  READ_MESSAGE_HISTORY: 'Read Message History',
  MENTION_EVERYONE: 'Mention Everyone',
  VOICE_USE_VAD: 'Use VAD',
  CHANGE_NICKNAME: 'Change Nickname',
  MANAGE_NICKNAMES: 'Manage Nicknames',
  MANAGE_ROLES: 'Manage Roles',
  MANAGE_EMOJIS_AND_STICKERS: 'Manage Emojis And Stickers',
  USE_EXTERNAL_EMOJIS: 'Use External Emojis',
  VIEW_AUDIT_LOG: 'View Audit Log',
  VOICE_PRIORITY_SPEAKER: 'Priority Speaker',
  VOICE_STREAM: 'Stream',
  VIEW_CHANNEL: 'View Channel',
  VIEW_GUILD_INSIGHTS: 'View Guild Insights',
  VOICE_CONNECT: 'Connect',
  VOICE_SPEAK: 'Speak',
  VOICE_MUTE_MEMBERS: 'Mute Members',
  VOICE_REQUEST_TO_SPEAK: 'Request to Speak',
  VOICE_DEAFEN_MEMBERS: 'Deafen Members',
  VOICE_MOVE_MEMBERS: 'Move Members',
  MANAGE_WEBHOOKS: 'Manage Webhooks',
  USE_APPLICATION_COMMANDS: 'Use Application Commands',
  CREATE_PRIVATE_THREADS: 'Create Private Threads',
  CREATE_PUBLIC_THREADS: 'Create Public Threads',
  USE_EXTERNAL_STICKERS: 'Use External Stickers',
  MANAGE_THREADS: 'Manage Threads',
  SEND_MESSAGES_IN_THREADS: 'Send Messages In Threads',
  START_EMBEDDED_ACTIVITIES: 'Start Activities',
  MODERATE_MEMBERS: 'Timeout Members'
}