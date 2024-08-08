export const commands = {
  history: {
    embed: {
      author: 'Seus palpites',
      field: 'Palpite: `{score1}-{score2}`\nResultado: [clique aqui]({link})',
      field2: 'Palpite: `{score1}-{score2}`\nResultado: [clique aqui]({link})',
      footer: 'Página {p1}/{p2}',
      desc: 'Palpites certos: `{right}`\nPalpites errados: `{wrong}`\nPalpites totais: `{t}`'
    },
    no_predictions: 'Você não possui palpites.'
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
    field: 'Comandos ({q})',
    community: 'Comunidade e Suporte',
    privacy: 'Termos de Serviço e Privacidade'
  },
  leaderboard: {
    author: 'Página {page}/{pages}',
    footer: 'Sua posição: #{pos}',
    title: 'Usuários com mais palpites certos',
    field: '`{t}` palpites certos',
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
    channel_being_used: 'O canal {ch} já está sendo usado para anunciar as partidas de outro campeonato. Considere usar outro canal para isso.\nVerifique os canais que já estão em uso usando {cmd}',
    resend_time: 'Este recurso já foi usado hoje neste servidor. Tente novamente amanhã.',
    resending: 'Reenviando partidas. Pode demorar alguns minutos para as partidas serem reenviadas, apenas aguarde.',
    resend: 'Reenviar partidas',
    confirm: 'Você está prestes a FORÇAR o envio das partidas neste servidor!\nVale lembrar que esta ação é **IRREVERSÍVEL** e só pode ser feita **UMA VEZ por dia**! Se você ainda quer adicionar mais campeonatos, adicione antes de usar este recurso.\nDeseja continuar?',
    continue: 'Continuar'
  }
}
export const helper = {
  palpitate: 'Fazer um palpite',
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
  error: 'Ocorreu um erro inesperado...\n`{e}`',
  privacy: 'Antes de começar a usar o bot, você deve aceitar os [Termos de Serviço e Privacidade](https://levispires.github.io/sabine-terms/)',
  verifying: '<a:carregando:809221866434199634> Processando requisição... aguarde.',
  verified: '<:sucess:869391072323846184> Requisição processada. Você já pode fazer um palpite.'
}
export const permissions = {
  CREATE_INSTANT_INVITE: 'Criar convite instantâneo',
  KICK_MEMBERS: 'Expulsar membros',
  BAN_MEMBERS: 'Banir membros',
  ADMINISTRATOR: 'Administrador',
  MANAGE_CHANNELS: 'Gerenciar canais',
  MANAGE_GUILD: 'Gerenciar servidor',
  ADD_REACTIONS: 'Adicionar reações',
  SEND_MESSAGES: 'Enviar mensagens',
  SEND_TTS_MESSAGES: 'Enviar mensagens em texto-para-voz',
  MANAGE_MESSAGES: 'Gerenciar mensagens',
  EMBED_LINKS: 'Inserir links',
  ATTACH_FILES: 'Anexar arquivos',
  READ_MESSAGE_HISTORY: 'Ler histórico de mensagens',
  MENTION_EVERYONE: 'Mencionar @everyone, @here e todos os cargos',
  VOICE_USE_VAD: 'Usar detecção de voz',
  CHANGE_NICKNAME: 'Alterar apelido',
  MANAGE_NICKNAMES: 'Gerenciar apelidos',
  MANAGE_ROLES: 'Gerenciar cargos',
  MANAGE_EMOJIS_AND_STICKERS: 'Gerenciar emojis e figurinhas',
  USE_EXTERNAL_EMOJIS: 'Usar emojis externos',
  VIEW_AUDIT_LOG: 'Ver registro de auditoria',
  VOICE_PRIORITY_SPEAKER: 'Voz prioritária',
  VOICE_STREAM: 'Vídeo',
  VIEW_CHANNEL: 'Ver canais',
  VIEW_GUILD_INSIGHTS: 'Ver análises do servidor',
  VOICE_CONNECT: 'Conectar',
  VOICE_SPEAK: 'Falar',
  VOICE_MUTE_MEMBERS: 'Silenciar membros',
  VOICE_REQUEST_TO_SPEAK: 'Pedir para falar',
  VOICE_DEAFEN_MEMBERS: 'Ensurdecer membros',
  VOICE_MOVE_MEMBERS: 'Mover membros',
  MANAGE_WEBHOOKS: 'Gerenciar webhooks',
  USE_APPLICATION_COMMANDS: 'Usar comandos de aplicativo',
  CREATE_PRIVATE_THREADS: 'Criar tópicos privados',
  CREATE_PUBLIC_THREADS: 'Criar tópicos públicos',
  USE_EXTERNAL_STICKERS: 'Usar figurinhas externas',
  MANAGE_THREADS: 'Gerenciar tópicos',
  SEND_MESSAGES_IN_THREADS: 'Enviar mensagens em tópicos',
  START_EMBEDDED_ACTIVITIES: 'Começar atividades',
  MODERATE_MEMBERS: 'Castigar membros'
}