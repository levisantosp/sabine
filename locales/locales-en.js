export const commands = {
  panel: {
    embed_title: 'Control Panel',
    embed_desc: 'No channels have been configured',
    embed_field: 'Will be announced on {ch}',
    embed_desc2: 'No channels have been configured.\nUse `{p}panel {arg} [channel1] [channel2]` to configure\n\n`[channel1]` - will be the channel where the matches will be sent\n`[channel2]` - will be the channel where the results will be sent',
    embed_desc3: 'Channels that will be announced Valorant Champions Tour 2024 matches: {ch}\nTo change the channels, use `{p}panel {arg} [channel1] [channel2]` to configure\n\n`[channel1]` - will be the channel where the matches will be sent\n`[channel2]` - will be the channel where the results will be sent',
    embed_desc4: 'Channels that will be announced Valorant Challengers Brazil matches: {ch}\nTo change the channels, use `{p}panel {arg} [channel1] [channel2]` to configure\n\n`[channel1]` - will be the channel where the matches will be sent\n`[channel2]` - will be the channel where the results will be sent',
    embed_desc5: 'Channels that will be announced Valorant Challengers NA matches: {ch}\nTo change the channels, use `{p}panel {arg} [channel1] [channel2]` to configure\n\n`[channel1]` - will be the channel where the matches will be sent\n`[channel2]` - will be the channel where the results will be sent',
    menu: {
      option: 'Use {p}panel {arg} to configure the channel'
    },
    'non-existent_channel': 'Non-existent channel or is not a text channel.',
    success: 'Channel set successfully.',
    enter_second_channel: 'Enter the second channel, where the results will be sent.'
  },
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
  }
}
export const helper = {
  palpitate: 'Palpitate',
  palpitate_modal: {
    title: 'Your guess for the match'
  },
  palpitate_response: 'You guessed {t1} `{s1}-{s2}` {t2}',
  replied: 'You have already guessed this match.',
  started: 'This match has already started or finished.',
  permissions: {
    user: 'You\'re weak. You lack the following permissions to use this command: {permissions}',
    bot: 'I lack the following permissions for this command to work properly: {permissins}'
  }
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