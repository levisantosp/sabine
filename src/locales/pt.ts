export const commands = {
  history: {
    embed: {
      author: 'Seus palpites',
      field: 'Palpite: `{score1}-{score2}`\nResultado: [clique aqui]({link})',
      field2: 'Palpite: `{score1}-{score2}`\nResultado: [clique aqui]({link})',
      footer: 'Página {p1}/{p2}',
      desc: 'Palpites certos: `{right}`\nPalpites errados: `{wrong}`\nPalpites totais: `{t}`'
    },
    no_guesses: 'Você não possui palpites.'
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
  },
  leaderboard: {
    author: 'Página {page}/{pages}',
    footer: 'Sua posição: #{pos}',
    title: 'Usuários com mais palpites certos',
    field: 'Totais: `{v}`',
    no_users: 'Sem usuários para mostrar nesta página.'
  },
  admin: {
    tournament_has_been_added: 'Este campeonato já foi adicionado.',
    tournament_added: 'O campeonato **{t}** foi adicionado com sucesso!',
    channels_must_be_different: 'Os canais de resultados e partidas NÃO PODEM ser iguais. É recomendável que o canal de partidas seja um canal separado onde não haverá interação de membros.',
    tournament_removed: 'O campeonato **{t}** foi removido com sucesso!',
    panel: 'Painel de Controle',
    event_channels: 'Partidas serão anunciadas em {ch1}\nResultados serão anunciados em {ch2}',
    desc: 'Idioma: `{lang}` (altere usando: </admin language:{id}>)\nLimite de campeonatos: `{limit}`',
    invalid_channel: 'Tipo de canal inválido. Considere selecionar um canal de TEXTO.',
    limit_reached: 'Este servidor atingiu o limite máximo de campeonatos que podem ser adicionados. Se quiser adicionar este campeonato, considere remover um usando {cmd}',
    channel_being_used: 'O canal {ch} já está sendo usado para anunciar as partidas de outro campeonato. Considere usar outro canal para isso.\nVerifique os canais que já estão em uso usando {cmd}'
  }
}
export const helper = {
  palpitate: 'Palpitar',
  stats: 'Estatísticas',
  palpitate_modal: {
    title: 'Seu palpite para a partida'
  },
  palpitate_response: 'Você palpitou {t1} `{s1}-{s2}` {t2}',
  replied: 'Você já palpitou essa partida.',
  started: 'Esta partida já começou ou terminou.',
  permissions: {
    user: 'Você é fraco. Te faltam as seguintes permissões para usar esse comando: {permissions}',
    bot: 'Me faltam as seguintes permissões para esse comando funcionar adequadamente: {permissins}'
  },
  error: 'Ocorreu um erro inesperado...\n`{e}`'
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