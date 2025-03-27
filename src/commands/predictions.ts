import { ComponentInteraction } from "oceanic.js"
import createCommand from "../structures/command/createCommand.js"
import EmbedBuilder from "../structures/builders/EmbedBuilder.js"
import ButtonBuilder from "../structures/builders/ButtonBuilder.js"

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
    if(!ctx.db.user.valorant_predictions.length) {
      ctx.reply("commands.predictions.no_predictions");
      return;
    }
    let preds = ctx.db.user.valorant_predictions.reverse();
    let page = !ctx.args[0] ? 1 : Number(ctx.args[0]);
    let pages = Math.ceil(ctx.db.user.valorant_predictions.length / 5);
    if(page === 1) preds = preds.slice(0, 5);
    else preds = preds.slice(page * 5 - 5, page * 5);
    if(!preds.length) {
      ctx.reply("commands.predictions.no_pages");
      return;
    }
    const embed = new EmbedBuilder()
    .setAuthor({
      name: locale("commands.predictions.embed.author"),
      iconURL: ctx.interaction.user.avatarURL()
    })
    .setDesc(locale("commands.predictions.embed.desc", {
      correct: ctx.db.user.correct_predictions,
      wrong: ctx.db.user.wrong_predictions,
      t: ctx.db.user.valorant_predictions.length
    }))
    .setFooter({
      text: locale("commands.predictions.embed.footer", {
        p1: isNaN(page) ? 1 : page,
        p2: pages
      })
    });
    for(const prediction of preds) {
      embed.addField(`${prediction.teams[0].name} <:versus:1349105624180330516> ${prediction.teams[1].name}`, locale("commands.predictions.embed.field", {
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
    .setCustomId(`predictions;${ctx.interaction.user.id};${page + 1 > pages ? pages : page + 1};next`)
    .setStyle("gray");
    if(page <= 1) previous.setDisabled();
    if(page >= pages) next.setDisabled();
    ctx.reply(embed.build({
      components: [
        {
          type: 1,
          components: [previous, next]
        }
      ]
    }));
  },
  async createInteraction({ ctx, locale }) {
    await (ctx.interaction as ComponentInteraction).deferUpdate();
    if(!ctx.db.user.valorant_predictions.length) {
      ctx.reply("commands.predictions.no_predictions");
      return;
    }
    let preds = ctx.db.user.valorant_predictions.reverse();
    let page = Number(ctx.args[2]);
    let pages = Math.ceil(ctx.db.user.valorant_predictions.length / 5);
    preds = preds.slice(page * 5 - 5, page * 5);
    if(!preds.length) {
      ctx.reply("commands.predictions.no_pages");
      return;
    }
    const embed = new EmbedBuilder()
    .setAuthor({
      name: locale("commands.predictions.embed.author"),
      iconURL: ctx.interaction.user.avatarURL()
    })
    .setDesc(locale("commands.predictions.embed.desc", {
      right: ctx.db.user.correct_predictions,
      wrong: ctx.db.user.wrong_predictions,
      t: ctx.db.user.valorant_predictions.length
    }))
    .setFooter({
      text: locale("commands.predictions.embed.footer", {
        p1: isNaN(page) ? 1 : page,
        p2: pages
      })
    });
    for(const prediction of preds) {
      embed.addField(`${prediction.teams[0].name} <:versus:1349105624180330516> ${prediction.teams[1].name}`, locale("commands.predictions.embed.field", {
        score1: prediction.teams[0].score,
        score2: prediction.teams[1].score,
        link: `https://www.vlr.gg/${prediction.match}`
      }));
    }
    const previous = new ButtonBuilder()
    .setEmoji("◀️")
    .setStyle("gray")
    .setCustomId(`${ctx.args[0]};${ctx.args[1]};${page - 1};previous`)
    const next = new ButtonBuilder()
    .setEmoji("▶")
    .setStyle("gray")
    .setCustomId(`${ctx.args[0]};${ctx.args[1]};${page + 1};next`)
    if(page <= 1) previous.setDisabled();
    if(page >= pages) next.setDisabled();
    ctx.edit(embed.build({
      components: [
        {
          type: 1,
          components: [previous, next]
        }
      ]
    }));
  }
});