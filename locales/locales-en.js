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
      field: 'Guess: `{score1}-{score2}`\nResult: `pending`\n[Match page]({link})',
      field2: 'Guess: `{score1}-{score2}`\nResult: `{score3}-{score4}`\n[Match page]({link})',
      footer: 'Page {p1}/{p2}',
      desc: 'Right guesses: `{right}`\nWrong guesses: `{wrong}`\nTotal guesses: `{t}`'
    }
  },
  player: {
    insert_player: 'Provide the name of a player.',
    no_player_found: 'No players have been found with that name.',
    embed: {
      desc: 'Name: `{name}`\nCurrent team: {team}\nPast teams: {pt}'
    }
  }
}
export const helper = {
  palpitate: 'Palpitate',
  palpitate_modal: {
    title: 'Your guess for the match'
  },
  palpitate_response: 'You guessed {t1} `{s1}-{s2}` {t2}',
  replied: 'You have already guessed this match.',
  started: 'This match has already started or finished.'
}