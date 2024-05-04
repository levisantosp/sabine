export const commands = {
  panel: {
    embed_title: 'Painel de Controle',
    embed_desc: 'Nenhum canal foi configurado',
    embed_field: 'Será anunciado em {ch}',
    embed_desc2: 'Nenhum canal foi configurado.\nUse `{p}painel {arg} [channel1] [channel2]` para configurar\n\n`[channel1]` - canal que as partidas serão enviadas\n`[channel2]` - canal que os resultados serão enviados',
    embed_desc3: 'Canais que as partidas do Valorant Champions Tour serão anunciadas: {ch}\nPara mudar os canais, use `{p}painel {arg} [channel1] [channel2]` para configurar\n\n`[channel1]` - canal que as partidas serão enviadas\n`[channel2]` - canal que os resultados serão enviados',
    embed_desc4: 'Canais que as partidas do Valorant Challengers Brazil serão anunciadas: {ch}\nPara mudar os canais, use `{p}painel {arg} [channel1] [channel2]` para configurar\n\n`[channel1]` - canal que as partidas serão enviadas\n`[channel2]` - canal que os resultados serão enviados',
    embed_desc5: 'Canais que as partidas do Valorant Challengers NA serão anunciadas: {ch}\nPara mudar os canais, use `{p}painel {arg} [channel1] [channel2]` para configurar\n\n`[channel1]` - canal que as partidas serão enviadas\n`[channel2]` - canal que os resultados serão enviados',
    menu: {
      option: 'Use {p}painel {arg} para configurar o canal'
    },
    'non-existent_channel': 'Canal inexistente ou não é um canal de texto.',
    success: 'Canal setado com sucesso.',
    enter_second_channel: 'Insira um segundo canal, onde os resultados serão enviados.'
  },
  history: {
    embed: {
      author: 'Seus palpites',
      field: 'Palpite: `{score1}-{score2}`\nResultado: `pendente`\n[Página da partida]({link})',
      field2: 'Palpite: `{score1}-{score2}`\nResultado: `{score3}-{score4}`\n[Página da partida]({link})',
      footer: 'Página {p1}/{p2}',
      desc: 'Palpites certos: `{right}`\nPalpites errados: `{wrong}`\nPalpites totais: `{t}`'
    }
  },
  player: {
    insert_player: 'Informe o nome de um jogador.',
    no_player_found: 'Nenhum jogador foi encontrado com esse nome.',
    embed: {
      desc: 'Nome: `{name}`\nEquipe atual: {team}\nEquipes passadas: {pt}\nÚltima partida: {lt}'
    }
  },
  team: {
    insert_team: 'Informe o nome de uma equipe.',
    no_team_found: 'Nenhuma equipe foi encontrada com esse nome.',
    embed: {
      desc: 'Jogadores: {p}\nStaff: {s}\nÚltima partida: {lt}\nPróxima partida: {n}'
    }
  },
  help: {
    command_not_found: 'Comando não encontrado.',
    name: 'Nome',
    aliases: 'Alternativas',
    examples: 'Exemplos',
    syntax: 'Sintaxe',
    permissions: 'Permissões',
    footer: '[] = argumento obrigatório | <> = argumento opcional',
    bot_permissions: 'Minhas permissões',
    title: 'Meus comandos',
    description: 'Para mais informações a respeito de determinado comando, use `{arg}`.\nPrecisando de ajuda? Entre no servidor de suporte clicando no botão abaixo!',
    field: 'Comandos ({q})'
  }
}
export const helper = {
  palpitate: 'Palpitar',
  palpitate_modal: {
    title: 'Seu palpite para a partida'
  },
  palpitate_response: 'Você palpitou {t1} `{s1}-{s2}` {t2}',
  replied: 'Você já palpitou essa partida.',
  started: 'Esta partida já começou ou terminou.'
}
export const permissions = {
  createInstantInvite: "Criar convite instantâneo",
  kickMembers: "Expulsar membros",
  banMembers: "Banir membros",
  administrator: "Administrador",
  manageChannels: "Gerenciar canais",
  manageGuild: "Gerenciar servidor",
  addReactions: "Adicionar reações",
  sendMessages: "Enviar mensagens",
  sendTTSMessages: "Enviar Mensagens em Texto-para-voz",
  manageMessages: "Gerenciar mensagens",
  embedLinks: "Inserir links",
  attachFiles: "Anexar arquivos",
  readMessageHistory: "Ler histórico de mensagens",
  mentionEveryone: "Mencionar @everyone, @here e todos os cargos",
  voiceUseVAD: "Usar detecção de voz",
  changeNickname: "Alterar apelido",
  manageNicknames: "Gerenciar apelidos",
  manageRoles: "Gerenciar cargos",
  manageEmojisAndStickers: "Gerenciar emojis e figurinhas",
  useExternalEmojis: "Usar emojis externos",
  viewAuditLog: "Ver registro de auditoria",
  voicePrioritySpeaker: "Voz prioritária",
  voiceStream: "Vídeo",
  viewChannel: "Ver canais",
  viewGuildInsights: "Ver análises do servidor",
  voiceConnect: "Conectar",
  voiceSpeak: "Falar",
  voiceMuteMembers: "Silenciar membros",
  voiceRequestToSpeak: "Pedir para falar",
  voiceDeafenMembers: "Ensurdecer membros",
  voiceMoveMembers: "Mover membros",
  manageWebhooks: "Gerenciar webhooks",
  useApplicationCommands: "Usar comandos de aplicativo",
  createPrivateThreads: "Criar tópicos privados",
  createPublicThreads: "Criar tópicos públicos",
  useExternalStickers: "Usar figurinhas externas",
  manageThreads: "Gerenciar tópicos",
  sendMessagesInThreads: "Enviar mensagens em tópicos",
  startEmbeddedActivities: "Começar atividades",
  moderateMembers: "Castigar membros"
}