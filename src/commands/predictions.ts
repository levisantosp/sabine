import { ButtonBuilder, createCommand, EmbedBuilder } from "../structures"

export default createCommand({
  name: "predictions",
  nameLocalizations: {
    "pt-BR": "palpites"
  },
  description: "Shows your predictions",
  descriptionLocalizations: {
    "pt-BR": "Mostra seus palpites"
  },
  options: [
    {
      type: 4,
      name: "page",
      nameLocalizations: {
        "pt-BR": "página"
      },
      description: "Insert the page",
      descriptionLocalizations: {
        "pt-BR": "Insira a página"
      }
    }
  ],
  botPermissions: ["EMBED_LINKS"],
  syntax: "predictions <page>",
  examples: [
    "predictions",
    "predictions 1",
    "predictions 2",
    "predictions 5"
  ],
  async run({ ctx, locale }) {
    if(!ctx.db.user.history.length) {
      ctx.reply("commands.predictions.no_predictions");
      return;
    }
    let history = ctx.db.user.history.reverse();
    let page = !ctx.args[0] ? 1 : Number(ctx.args[0]);
    if(page === 1) history = history.slice(0, 5);
    else history = history.slice(page * 5 - 5, page * 5);
    if(!history.length) {
      ctx.reply("commands.predictions.no_pages");
      return
    }
    const embed = new EmbedBuilder()
    .setAuthor({
      name: locale("commands.predictions.embed.author"),
      iconURL: ctx.interaction.user.avatarURL()
    })
    .setDesc(locale("commands.predictions.embed.desc", {
      right: ctx.db.user.guessesRight,
      wrong: ctx.db.user.guessesWrong,
      t: ctx.db.user.history.length
    }))
    .setFooter({
      text: locale("commands.predictions.embed.footer", {
        p1: isNaN(page) ? 1 : page,
        p2: Math.ceil(ctx.db.user.history.length / 5)
      })
    });
    for(const prediction of history) {
      embed.addField(`${prediction.teams[0].name} x ${prediction.teams[1].name}`, locale("commands.predictions.embed.field", {
        score1: prediction.teams[0].score,
        score2: prediction.teams[1].score,
        link: `https://www.vlr.gg/${prediction.match}`
      }));
    }
    const previous = new ButtonBuilder()
    .setEmoji("◀️")
    .setCustomId(`predictions;${ctx.interaction.user.id};${page - 1 < 1 ? 1 : page - 1};previous`)
    .setStyle("gray");
    const next = new ButtonBuilder()
    .setEmoji("▶")
    .setCustomId(`predictions;${ctx.interaction.user.id};${page + 1 > Math.ceil(ctx.db.user.history.length / 5) ? Math.ceil(ctx.db.user.history.length / 5) : page + 1}`)
    .setStyle("gray");
    if(page <= 1) previous.setDisabled();
    if(page >= Math.ceil(ctx.db.user.history.length / 5)) next.setDisabled();
    ctx.reply(embed.build({
      components: [
        {
          type: 1,
          components: [previous, next]
        }
      ]
    }));
  },
  async createInteraction({ ctx }) {
    let history = ctx.db.user.history.reverse();
    
  }
});