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