export const commands = {
  predictions: {
    embed: {
      author: "Seus palpites",
      field: "Palpite: `{score1}-{score2}`\nEstatísticas: [clique aqui]({link})",
      footer: "Página {p1}/{p2}",
      desc: "Palpites certos: `{correct}`\nPalpites errados: `{wrong}`\nPalpites totais: `{t}`"
    },
    no_predictions: "Você não possui palpites.",
    no_pages: "Nada para mostrar nesta página."
  },
  player: {
    insert_player: "Informe o nome de um jogador.",
    player_not_found: "Nenhum jogador foi encontrado com esse nome.",
    embed: {
      desc: "Nome: `{name}`\nEquipe atual: {team}\nEquipes passadas: {pt}\nÚltima partida: {lt}"
    }
  },
  team: {
    insert_team: "Informe o nome de uma equipe.",
    team_not_found: "Nenhuma equipe foi encontrada com esse nome.",
    embed: {
      desc: "Jogadores: {p}\nStaff: {s}\nÚltima partida: {lt}\nPróxima partida: {n}"
    }
  },
  help: {
    command_not_found: "Comando não encontrado.",
    name: "Nome",
    aliases: "Alternativas",
    examples: "Exemplos",
    syntax: "Sintaxe",
    permissions: "Permissões",
    footer: "[] = argumento obrigatório | <> = argumento opcional",
    bot_permissions: "Minhas permissões",
    title: "Meus comandos",
    description: "Você pode ver meus comandos aqui: {website}\nPara mais informações a respeito de determinado comando, use `{arg}`.\nPrecisando de ajuda? Entre no servidor de suporte clicando no botão abaixo!",
    field: "Comandos ({q})",
    community: "Comunidade e Suporte",
    privacy: "Termos de Serviço e Privacidade"
  },
  ranking: {
    author: "Página {page}/{pages}",
    footer: "Sua posição: #{pos}",
    title: "Usuários com mais palpites certos",
    field: "`{t}` palpites certos",
    no_users: "Sem usuários para mostrar nesta página."
  },
  admin: {
    tournament_has_been_added: "Este campeonato já foi adicionado.",
    tournament_added: "O campeonato **{t}** foi adicionado com sucesso!",
    channels_must_be_different: "Os canais de resultados e partidas NÃO PODEM ser iguais. É recomendável que o canal de partidas seja um canal separado onde não haverá interação de membros.",
    tournament_removed: "O campeonato **{t}** foi removido com sucesso!",
    dashboard: "Painel de Controle",
    event_channels: "Partidas serão anunciadas em {ch1}\nResultados serão anunciados em {ch2}",
    desc: "- Idioma: `{lang}` (altere usando: </admin language:{id}>)\n- Limite de campeonatos: `{limit}`\n- Canal de notícias de VALORANT: {vlr_news}\n- Canal de live feed do VALORANT: {vlr_live}\n- Canal de notícias de League of Legends: {lol_news}\n- Canal de live feed de League of Legends: {lol_live}",
    invalid_channel: "Tipo de canal inválido. Considere selecionar um canal de TEXTO.",
    limit_reached: "Este servidor atingiu o limite máximo de campeonatos que podem ser adicionados. Se quiser adicionar este campeonato, considere remover um usando {cmd}",
    channel_being_used: "O canal {ch} já está sendo usado para anunciar os resultados de um campeonato. Considere usar outro canal para isso.\nVerifique os canais que já estão em uso usando {cmd}",
    resend_time: "Este recurso já foi usado recentemente neste servidor. Tente novamente {t}.",
    resending: "<a:carregando:809221866434199634> Reenviando partidas... Por favor, aguarde.",
    resend: "Reenviar partidas de {game}",
    confirm: "Você está prestes a FORÇAR o envio das partidas neste servidor!\nVale lembrar que esta ação é **IRREVERSÍVEL** e só pode ser feita **UMA VEZ por hora**! Se você ainda quer adicionar mais campeonatos, adicione antes de usar este recurso.\nDeseja continuar?",
    continue: "Continuar",
    remove_all: "Remover todos",
    removed_all_tournaments: "Todos os torneios foram removidos com sucesso!",
    resent: "Partidas reenviadas com sucesso!",
    buy_premium: "Compre o premium!",
    invalid_channel2: "Tipo de canal inválido. Considere selecionar um canal de TEXTO ou ANÚNCIOS.",
    news_enabled: "Funcionalidade de notícias habilitada ao canal {ch}",
    news_disabled: "Funcionalidade de notícias desabilitada com sucesso!",
    no_premium: "Este servidor não tem nenhum chave premium ativada.",
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
    you_dont_have_premium: "Você não tem um plano premium ativo. Compre um no [servidor de suporte](https://discord.com/invite/FaqYcpA84r)!",
    embed: {
      description: "Obrigado por apoiar o bot assinando o premium!\nSeu plano expira {expiresAt}",
      field: {
        value: "Chave: `{key}`\nExpira {expiresAt}"
      }
    },
    button: {
      label: "Visualizar chaves de ativação"
    },
    you_dont_have_keys: "Você não possui nenhuma chave de ativação."
  },
  activatekey: {
    key_activated: "Sua chave foi ativada com sucesso! Aproveite os benefícios!",
    invalid_key: "Chave inválida!",
    button: "Continuar",
    would_like_to_continue: "Este servidor tem uma chave {key} ativada. Gostaria de continuar?",
    key_already_activated: "Esta chave já está ativada!",
    limit_reached: "Esta chave já está ativada em 2 servidores."
  },
  tournament: {
    tournament_added: "O torneio **{t}** foi adicionado com sucesso!",
    channels_must_be_different: "Os canais de resultados e partidas NÃO PODEM ser iguais. É recomendável que o canal de partidas seja um canal separado onde não haverá interação de membros.",
    tournament_removed: "O torneio **{t}** foi removido com sucesso!",
    remove_all: "Remover todos",
    invalid_channel: "Tipo de canal inválido. Considere selecionar um canal de TEXTO.",
    limit_reached: "Este servidor atingiu o limite máximo de campeonatos que podem ser adicionados. Se quiser adicionar este campeonato, considere remover um usando {cmd}"
  },
  news: {
    invalid_channel: "Tipo de canal inválido. Considere selecionar um canal de TEXTO ou ANÚNCIO.",
    news_enabled: "Funcionalidade de notícias habilitada no canal {ch}",
    news_disabled: "Funcionalidade de notícias desabilitada com sucesso!",
    buy_premium: "Compre o premium!"
  },
  live: {
    invalid_channel: "Tipo de canal inválido. Considere selecionar um canal de TEXTO.",
    news_enabled: "Funcionalidade de transmissão ao vivo habilitada no canal {ch}",
    news_disabled: "Funcionalidade de transmissão ao vivo desabilitada com sucesso!",
    buy_premium: "Compre o premium!"
  },
  claim: {
    claimed: `
      **{player}** juntou-se ao seu elenco de graça
      Valor de mercado: \`{price}\`
    `.trim(),
    has_been_claimed: "Você já usou este comando recentemente. Tente novamente {t}"
  },
  roster: {
    embed: {
      title: "Seu elenco",
      desc: "Nome da equipe: **{name}**\nValor do elenco: `{value}`\nOverral do elenco: `{ovr}`",
      field: {
        name1: "Jogadores Titulares ({total})",
        name2: "Jogadores Reservas ({total})"
      }
    },
    generate_file: "Gerar arquivo .txt do elenco completo",
    change_team: "Alterar nome ou tag da equipe",
    modal: {
      title: "Insira o novo nome e tag",
      team_name: "Novo nome",
      team_tag: "Nova tag"
    },
    team_info_changed: "Você alterou o nome do seu time para **{name}** e a tag para **{tag}** com sucesso!"
  },
  promote: {
    player_not_found: "Jogador não encontrado!",
    player_promoted: "Você promoveu **{p}** com sucesso!",
    select_player: "Selecione um jogador para substituir"
  },
  remove: {
    player_not_found: "Jogador não encontrado!",
    player_removed: "Você removeu **{p}** com sucesso!"
  },
  sell: {
    player_not_found: "Jogador não encontrado!",
    sold: "Você vendeu **{p}** por **{price}** coins com sucesso!"
  },
  coins: {
    res: "Você possui **{c}** coins"
  },
  duel: {
    started: "### Partida iniciada",
    already_in_match: "Você já está em partida. Aguarde a mesma terminar e tente novamente.",
    needed_team_name: "Você precisa definir o nome da sua equipe antes de jogar.",
    team_not_completed_1: "Seu time não está completo.",
    team_not_completed_2: "O time do seu oponente não está completo.",
    needed_team_name_2: "Seu oponente precisa definir o nome da equipe antes de jogar.",
    already_in_match_2: "Seu oponente já está em partida."
  },
  career: {
    no_pages: "Nada pra mostrar aqui.",
    embed: {
      author: "Histório de partidas",
      desc: "Vitórias: `{wins}`\nDerrotas: `{defeats}`\nPartidas jogadas: `{total}`",
      footer: "Página {page}/{pages}"
    }
  }
} as const
export const simulator = {
  sides: {
    name: "Lados",
    value: "Ataque: {attack}\nDefesa: {defense}"
  },
  round_started: "*Rodada {n} iniciada*",
  winner: "{user} venceu a partida!",
  switch_sides: "Troca de lados",
  won_by_elimination: "- **{t} venceu a rodada eliminando toda a equipe adversária**",
  kill: "{t1} {p1} matou {t2} {p2} com {w}",
  spike_not_planted: "- A spike não foi plantada a tempo\n- **{team}** venceu o round",
  spike_detonated: "- Spike detonada\n- **{team}** venceu o round",
  spike_defused: "- Spike desarmada\n- **{team}** venceu o round",
  spike_planted: "- *Spike plantada no bomb site {bomb}*"
} as const
export const helper = {
  palpitate: "Palpitar",
  stats: "Estatísticas",
  prediction_modal: {
    title: "Seu palpite para a partida"
  },
  palpitate_response: "Você palpitou {t1} `{s1}-{s2}` {t2}",
  replied: "Você já palpitou essa partida.",
  started: "Esta partida já começou ou terminou.",
  permissions: {
    user: "Você é fraco. Te faltam as seguintes permissões para usar esse comando: {permissions}",
    bot: "Me faltam as seguintes permissões para esse comando funcionar adequadamente: {permissins}"
  },
  error: "Ocorreu um erro inesperado...\n`{e}`",
  privacy: "Antes de começar a usar o bot, você deve aceitar os [Termos de Serviço e Privacidade](https://levispires.github.io/sabine-terms/)",
  verified: "Faça seu palpite clicando no botão abaixo.",
  pickem: {
    label: "Bolão",
    res: "Participe do BOLÃO valendo um <:booster:1272968894239215636> **Discord Nitro** e um <:nitro:1272968817496297542> **Discord Nitro Basic** entrando no nosso servidor oficial!\nhttps://discord.gg/g5nmc376yh"
  },
  banned: "**Você está banido e não pode mais usar o bot.\você acha que isso é um engano, entre em contato conosco no nosso servidor no Discord!**\n**Quando:** {when}\n**Termina em:** {ends}\n**Motivo:** `{reason}`",
  interaction_failed: "Não foi possível executar esta ação... Se o problema persistir, reporte para a equipe no meu [servidor de suporte](https://discord.gg/g5nmc376yh).",
  premium_feature: "Opa, parece que você achou uma funcionalidade premium. Desbloqueie ela comprando o premium em nosso servidor de suporte!",
  live_feed_value: "Mapa atual: `{map}`\nPlacar do mapa: `{score}`",
  source: "Ver artigo completo",
  live_now: "AO VIVO AGORA",
  streams: "Transmissões",
  bet: "Apostar",
  prediction_needed: "Você deve fazer um palpite antes de apostar",
  bet_modal: {
    title: "Aposta para {teams}",
    label: "Insira a quantidade que deseja apostar"
  },
  coins_needed: "Você precisa ter ao menos 500 coins para fazer uma aposta",
  invalid_coins: "Insira um valor válido",
  too_much: "Você não tem essa quantia de coins",
  bet_res: "Você apostou **{coins}** coins em **{team}**\n" +
           "A odd atual está valendo \`{odd}x\`. O valor pode mudar conforme os usuários forem apostando.",
  min_value: "O valor mínimo para apostar é 500 coins"
} as const
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
} as const