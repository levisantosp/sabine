export const commands = {
  predictions: {
    embed: {
      author: "Seus palpites",
      field: "Palpite: `{score1}-{score2}`\nEstatísticas: [clique aqui]({link})",
      footer: "Página {p1}/{p2}",
      desc: "Palpites certos: `{correct}`\nPalpites errados: `{wrong}`\nPalpites totais: `{t}`"
    },
    no_predictions: "<:error:1300882259078938685> Você não possui palpites.",
    no_pages: "<:error:1300882259078938685> Nada para mostrar nesta página."
  },
  player: {
    insert_player: "<:warn:869393116854108191> Informe o nome de um jogador.",
    player_not_found: "<:error:1300882259078938685> Nenhum jogador foi encontrado com esse nome.",
    embed: {
      desc: "Nome: `{name}`\nEquipe atual: {team}\nEquipes passadas: {pt}\nÚltima partida: {lt}"
    }
  },
  team: {
    insert_team: "<:warn:869393116854108191> Informe o nome de uma equipe.",
    team_not_found: "<:error:1300882259078938685> Nenhuma equipe foi encontrada com esse nome.",
    embed: {
      desc: "Jogadores: {p}\nStaff: {s}\nÚltima partida: {lt}\nPróxima partida: {n}"
    }
  },
  help: {
    command_not_found: "<:error:1300882259078938685> Comando não encontrado.",
    name: "Nome",
    aliases: "Alternativas",
    examples: "Exemplos",
    syntax: "Sintaxe",
    permissions: "Permissões",
    footer: "[] = argumento obrigatório | <> = argumento opcional",
    bot_permissions: "Minhas permissões",
    title: "Meus comandos",
    description: "Para mais informações a respeito de determinado comando, use `{arg}`.\nPrecisando de ajuda? Entre no servidor de suporte clicando no botão abaixo!",
    field: "Comandos ({q})",
    community: "Comunidade e Suporte",
    privacy: "Termos de Serviço e Privacidade"
  },
  ranking: {
    author: "Página {page}/{pages}",
    footer: "Sua posição: #{pos}",
    title: "Usuários com mais palpites certos",
    field: "`{t}` palpites certos",
    no_users: "<:error:1300882259078938685> Sem usuários para mostrar nesta página."
  },
  admin: {
    tournament_has_been_added: "<:error:1300882259078938685> Este campeonato já foi adicionado.",
    tournament_added: "<:success:1300882212190945292> O campeonato **{t}** foi adicionado com sucesso!",
    channels_must_be_different: "<:error:1300882259078938685> Os canais de resultados e partidas NÃO PODEM ser iguais. É recomendável que o canal de partidas seja um canal separado onde não haverá interação de membros.",
    tournament_removed: "<:success:1300882212190945292> O campeonato **{t}** foi removido com sucesso!",
    dashboard: "Painel de Controle",
    event_channels: "Partidas serão anunciadas em {ch1}\nResultados serão anunciados em {ch2}",
    desc: "- Idioma: `{lang}` (altere usando: </admin language:{id}>)\n- Limite de campeonatos: `{limit}`\n- Canal de notícias de VALORANT: {vlr_news}\n- Canal de live feed do VALORANT: {vlr_live}\n- Canal de notícias de League of Legends: {lol_news}\n- Canal de live feed de League of Legends: {lol_live}",
    invalid_channel: "<:error:1300882259078938685> Tipo de canal inválido. Considere selecionar um canal de TEXTO.",
    limit_reached: "<:error:1300882259078938685> Este servidor atingiu o limite máximo de campeonatos que podem ser adicionados. Se quiser adicionar este campeonato, considere remover um usando {cmd}",
    channel_being_used: "<:error:1300882259078938685> O canal {ch} já está sendo usado para anunciar os resultados de um campeonato. Considere usar outro canal para isso.\nVerifique os canais que já estão em uso usando {cmd}",
    resend_time: "<:error:1300882259078938685> Este recurso já foi usado recentemente neste servidor. Tente novamente {t}.",
    resending: "<a:carregando:809221866434199634> Reenviando partidas... Por favor, aguarde.",
    resend: "Reenviar partidas de {game}",
    confirm: "<:warn:869393116854108191> Você está prestes a FORÇAR o envio das partidas neste servidor!\n<:warn:869393116854108191> Vale lembrar que esta ação é **IRREVERSÍVEL** e só pode ser feita **UMA VEZ por hora**! Se você ainda quer adicionar mais campeonatos, adicione antes de usar este recurso.\nDeseja continuar?",
    continue: "Continuar",
    remove_all: "Remover todos",
    removed_all_tournaments: "<:success:1300882212190945292> Todos os torneios foram removidos com sucesso!",
    resent: "<:success:1300882212190945292> Partidas reenviadas com sucesso!",
    buy_premium: "Compre o premium!",
    invalid_channel2: "<:error:1300882259078938685> Tipo de canal inválido. Considere selecionar um canal de TEXTO ou ANÚNCIOS.",
    news_enabled: "<:success:1300882212190945292> Funcionalidade de notícias habilitada ao canal {ch}",
    news_disabled: "<:success:1300882212190945292> Funcionalidade de notícias desabilitada com sucesso!",
    no_premium: "<:error:1300882259078938685> Este servidor não tem nenhum chave premium ativada.",
    premium: "Este servidor está com a chave {key} ativada.\nA chave expira {expiresAt}",
    lol_esports_coverage: "Cobertura de e-sports de League of Legends",
    vlr_esports_coverage: "Cobertura de e-sports de VALORANT",
    tournaments: "## Torneios de {game} adicionados"
  },
  info: {
    embed: {
      title: "Informações do Bot"
    },
    lib: "Biblioteca",
    creator: "Criador",
    guilds: "Servidores",
    users: "Usuários",
    invite: "Me adicione!"
  },
  premium: {
    you_dont_have_premium: "<:error:1300882259078938685> Você não tem um plano premium ativo. Compre um no [servidor de suporte](https://discord.com/invite/FaqYcpA84r)!",
    embed: {
      description: "Obrigado por apoiar o bot assinando o premium!\nSeu plano expira {expiresAt}",
      field: {
        value: "Chave: `{key}`\nExpira {expiresAt}"
      }
    },
    button: {
      label: "Visualizar chaves de ativação"
    },
    you_dont_have_keys: "<:error:1300882259078938685> Você não possui nenhuma chave de ativação."
  },
  activatekey: {
    key_activated: "<:success:1300882212190945292> Sua chave foi ativada com sucesso! Aproveite os benefícios!",
    invalid_key: "<:error:1300882259078938685> Chave inválida!",
    button: "Continuar",
    would_like_to_continue: "<:warn:869393116854108191> Este servidor tem uma chave {key} ativada. Gostaria de continuar?",
    key_already_activated: "<:error:1300882259078938685> Esta chave já está ativada!",
    limit_reached: "<:error:1300882259078938685> Esta chave já está ativada em 2 servidores."
  },
  tournament: {
    tournament_added: "<:success:1300882212190945292> O torneio **{t}** foi adicionado com sucesso!",
    channels_must_be_different: "<:warn:869393116854108191> Os canais de resultados e partidas NÃO PODEM ser iguais. É recomendável que o canal de partidas seja um canal separado onde não haverá interação de membros.",
    tournament_removed: "<:success:1300882212190945292> O torneio **{t}** foi removido com sucesso!",
    remove_all: "Remover todos",
    invalid_channel: "<:error:1300882259078938685> Tipo de canal inválido. Considere selecionar um canal de TEXTO.",
    limit_reached: "<:error:1300882259078938685> Este servidor atingiu o limite máximo de campeonatos que podem ser adicionados. Se quiser adicionar este campeonato, considere remover um usando {cmd}"
  },
  news: {
    invalid_channel: "<:error:1300882259078938685> Tipo de canal inválido. Considere selecionar um canal de TEXTO ou ANÚNCIO.",
    news_enabled: "<:success:1300882212190945292> Funcionalidade de notícias habilitada no canal {ch}",
    news_disabled: "<:success:1300882212190945292> Funcionalidade de notícias desabilitada com sucesso!",
    buy_premium: "Compre o premium!"
  },
  live: {
    invalid_channel: "<:error:1300882259078938685> Tipo de canal inválido. Considere selecionar um canal de TEXTO.",
    news_enabled: "<:success:1300882212190945292> Funcionalidade de transmissão ao vivo habilitada no canal {ch}",
    news_disabled: "<:success:1300882212190945292> Funcionalidade de transmissão ao vivo desabilitada com sucesso!",
    buy_premium: "Compre o premium!"
  }
}
export const helper = {
  palpitate: "Palpitar",
  stats: "Estatísticas",
  prediction_modal: {
    title: "Seu palpite para a partida"
  },
  palpitate_response: "<:success:1300882212190945292> Você palpitou {t1} `{s1}-{s2}` {t2}",
  replied: "<:error:1300882259078938685> Você já palpitou essa partida.",
  started: "<:error:1300882259078938685> Esta partida já começou ou terminou.",
  permissions: {
    user: "<:error:1300882259078938685> Você é fraco. Te faltam as seguintes permissões para usar esse comando: {permissions}",
    bot: "<:error:1300882259078938685> Me faltam as seguintes permissões para esse comando funcionar adequadamente: {permissins}"
  },
  error: "Ocorreu um erro inesperado...\n`{e}`",
  privacy: "Antes de começar a usar o bot, você deve aceitar os [Termos de Serviço e Privacidade](https://levispires.github.io/sabine-terms/)",
  verified: "<:success:1300882212190945292> Faça seu palpite clicando no botão abaixo.",
  pickem: {
    label: "Bolão",
    res: "Participe do BOLÃO valendo um <:booster:1272968894239215636> **Discord Nitro** e um <:nitro:1272968817496297542> **Discord Nitro Basic** entrando no nosso servidor oficial!\nhttps://discord.gg/g5nmc376yh"
  },
  banned: "**<:error:1300882259078938685> Você está banido e não pode mais usar o bot.\<:warn:869393116854108191> você acha que isso é um engano, entre em contato conosco no nosso servidor no Discord!**\n**Quando:** {when}\n**Termina em:** {ends}\n**Motivo:** `{reason}`",
  interaction_failed: "<:error:1300882259078938685> Não foi possível executar esta ação... Se o problema persistir, reporte para a equipe no meu [servidor de suporte](https://discord.gg/g5nmc376yh).",
  premium_feature: "<:warn:869393116854108191> Opa, parece que você achou uma funcionalidade premium. Desbloqueie ela comprando o premium em nosso servidor de suporte!",
  live_feed_value: "Mapa atual: `{map}`\nPlacar do mapa: `{score}`",
  source: "Ver artigo completo",
  live_now: "AO VIVO AGORA"
}
export const permissions = {
  CREATE_INSTANT_INVITE: "Criar convite instantâneo",
  KICK_MEMBERS: "Expulsar membros",
  BAN_MEMBERS: "Banir membros",
  ADMINISTRATOR: "Administrador",
  MANAGE_CHANNELS: "Gerenciar canais",
  MANAGE_GUILD: "Gerenciar servidor",
  ADD_REACTIONS: "Adicionar reações",
  SEND_MESSAGES: "Enviar mensagens",
  SEND_TTS_MESSAGES: "Enviar mensagens em texto-para-voz",
  MANAGE_MESSAGES: "Gerenciar mensagens",
  EMBED_LINKS: "Inserir links",
  ATTACH_FILES: "Anexar arquivos",
  READ_MESSAGE_HISTORY: "Ler histórico de mensagens",
  MENTION_EVERYONE: "Mencionar @everyone, @here e todos os cargos",
  VOICE_USE_VAD: "Usar detecção de voz",
  CHANGE_NICKNAME: "Alterar apelido",
  MANAGE_NICKNAMES: "Gerenciar apelidos",
  MANAGE_ROLES: "Gerenciar cargos",
  MANAGE_EMOJIS_AND_STICKERS: "Gerenciar emojis e figurinhas",
  USE_EXTERNAL_EMOJIS: "Usar emojis externos",
  VIEW_AUDIT_LOG: "Ver registro de auditoria",
  VOICE_PRIORITY_SPEAKER: "Voz prioritária",
  VOICE_STREAM: "Vídeo",
  VIEW_CHANNEL: "Ver canais",
  VIEW_GUILD_INSIGHTS: "Ver análises do servidor",
  VOICE_CONNECT: "Conectar",
  VOICE_SPEAK: "Falar",
  VOICE_MUTE_MEMBERS: "Silenciar membros",
  VOICE_REQUEST_TO_SPEAK: "Pedir para falar",
  VOICE_DEAFEN_MEMBERS: "Ensurdecer membros",
  VOICE_MOVE_MEMBERS: "Mover membros",
  MANAGE_WEBHOOKS: "Gerenciar webhooks",
  USE_APPLICATION_COMMANDS: "Usar comandos de aplicativo",
  CREATE_PRIVATE_THREADS: "Criar tópicos privados",
  CREATE_PUBLIC_THREADS: "Criar tópicos públicos",
  USE_EXTERNAL_STICKERS: "Usar figurinhas externas",
  MANAGE_THREADS: "Gerenciar tópicos",
  SEND_MESSAGES_IN_THREADS: "Enviar mensagens em tópicos",
  START_EMBEDDED_ACTIVITIES: "Começar atividades",
  MODERATE_MEMBERS: "Castigar membros"
}