export const commands = {
  history: {
    embed: {
      author: 'Your guesses',
      field: 'Guess: `{score1}-{score2}`\nResult: [click here]({link})',
      field2: 'Guess: `{score1}-{score2}`\nResult: [click here]({link})',
      footer: 'Page {p1}/{p2}',
      desc: 'Right guesses: `{right}`\nWrong guesses: `{wrong}`\nTotal guesses: `{t}`'
    },
    no_guesses: 'You do not have guesses.'
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
    field: 'Commands ({q})'
  },
  leaderboard: {
    author: 'Page {page}/{pages}',
    footer: 'Your position: #{pos}',
    title: 'Users with the most correct guesses',
    field: 'Total: `{v}`',
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
    limit_reached: 'This server has reached the maximum limit of tournaments that can be added. If you want to add this tournaments, consider removing one using {cmd}'
  }
}
export const helper = {
  palpitate: 'Palpitate',
  stats: 'Stats',
  palpitate_modal: {
    title: 'Your guess for the match'
  },
  palpitate_response: 'You guessed {t1} `{s1}-{s2}` {t2}',
  replied: 'You have already guessed this match.',
  started: 'This match has already started or finished.',
  permissions: {
    user: 'You\'re weak. You lack the following permissions to use this command: {permissions}',
    bot: 'I lack the following permissions for this command to work properly: {permissins}'
  },
  error: 'An unexpected error has occurred...\n`{e}`'
}
export const permissions = {
  createInstantInvite: "Create Instant Invite",
  kickMembers: "Kick Members",
  banMembers: "Ban Members",
  administrator: "Administrator",
  manageChannels: "Manage Channels",
  manageGuild: "Manage Guild",
  addReactions: "Add Reactions",
  sendMessages: "Send Messages",
  sendTTSMessages: "Send TTS Messages",
  manageMessages: "Manage Messages",
  embedLinks: "Embed Links",
  attachFiles: "Attach Files",
  readMessageHistory: "Read Message History",
  mentionEveryone: "Mention Everyone",
  voiceUseVAD: "Use VAD",
  changeNickname: "Change Nickname",
  manageNicknames: "Manage Nicknames",
  manageRoles: "Manage Roles",
  manageEmojisAndStickers: "Manage Emojis And Stickers",
  useExternalEmojis: "Use External Emojis",
  viewAuditLog: "View Audit Log",
  voicePrioritySpeaker: "Priority Speaker",
  voiceStream: "Stream",
  viewChannel: "View Channel",
  viewGuildInsights: "View Guild Insights",
  voiceConnect: "Connect",
  voiceSpeak: "Speak",
  voiceMuteMembers: "Mute Members",
  voiceRequestToSpeak: "Request to Speak",
  voiceDeafenMembers: "Deafen Members",
  voiceMoveMembers: "Move Members",
  manageWebhooks: "Manage Webhooks",
  useApplicationCommands: "Use Application Commands",
  createPrivateThreads: "Create Private Threads",
  createPublicThreads: "Create Public Threads",
  useExternalStickers: "Use External Stickers",
  manageThreads: "Manage Threads",
  sendMessagesInThreads: "Send Messages In Threads",
  startEmbeddedActivities: "Start Activities",
  moderateMembers: "Timeout Members"
}