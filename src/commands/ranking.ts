import { ComponentInteraction } from "oceanic.js"
import { User, UserSchemaInterface } from "../database/index.js"
import createCommand from "../structures/command/createCommand.js"
import EmbedBuilder from "../structures/builders/EmbedBuilder.js"
import ButtonBuilder from "../structures/builders/ButtonBuilder.js"

export default createCommand({
  name: "ranking",
  description: "Ranking of users with most correct predictions",
  descriptionLocalizations: {
    "pt-BR": "Tabela de usuários com mais palpites corretos"
  },
  options: [
    {
      type: 1,
      name: "local",
      description: "Shows the predictions ranking of this server",
      descriptionLocalizations: {
        "pt-BR": "Mostra o ranking de palpites desse servidor"
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
      ]
    },
    {
      type: 1,
      name: "global",
      description: "Shows the global predictions ranking",
      descriptionLocalizations: {
        "pt-BR": "Mostra o ranking global de palpites"
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
      ]
    }
  ],
  syntax: "ranking global/local <page>",
  examples: [
    "ranking global",
    "ranking global 2",
    "ranking global 5",
    "ranking local",
    "ranking local 2",
    "ranking local 5"
  ],
  isThinking: true,
  async run({ ctx, locale, client }) {
    if(ctx.args[0] === "local") {
      let users = (await User.find({
        correct_predictions: {
          $gt: 0
        }
      }) as UserSchemaInterface[]).filter(user => ctx.guild.members.get(user.id)).sort((a, b) => b.correct_predictions - a.correct_predictions);
      let array = users;
      let page = Number(ctx.args[1]);
      if(!page || page === 1 || isNaN(page)) {
        users = users.slice(0, 10);
        page = 1;
      }
      else users = users.slice(page * 10 - 10, page * 10);
      if(!users.length) {
        ctx.reply("commands.ranking.no_users");
        return;
      }
      const embed = new EmbedBuilder()
      .setAuthor({
        name: locale("commands.ranking.author", {
          page,
          pages: Math.ceil(array.length / 10)
        })
      })
      .setTitle(locale("commands.ranking.title"))
      .setThumb((await client.rest.users.get(array[0].id!))?.avatarURL()!);
  
      let pos = 0;
      if(!isNaN(page) && page > 1) pos = page * 10 - 10;
      for(const user of users) {
        pos++;
        const u = client.users.get(user.id);
        let field =  `${pos} - ${!u ? "*unknown*" : u.username}`
        if(pos === 1) field = `🥇 - ${!u ? "*unknown*" : u.username}`
        if(pos === 2) field = `🥈 - ${!u ? "*unknown*" : u.username}`
        if(pos === 3) field = `🥉 - ${!u ? "*unknown*" : u.username}`
        embed.addField(field, locale("commands.ranking.field", {
          t: user.correct_predictions
        }));
      }
      embed.setFooter({
        text: locale("commands.ranking.footer", {
          pos: array.findIndex((user: any) => user.id === ctx.interaction.user.id) + 1
        })
      });
      const previous = new ButtonBuilder()
      .setEmoji("◀️")
      .setCustomId(`ranking;${ctx.interaction.user.id};${page - 1 < 1 ? 1 : page - 1};previous;local`)
      .setStyle("gray");
      const next = new ButtonBuilder()
      .setEmoji("▶")
      .setCustomId(`ranking;${ctx.interaction.user.id};${page + 1 > Math.ceil(array.length / 10) ? Math.ceil(array.length / 10) : page + 1};next;local`)
      .setStyle("gray");
      if(page <= 1) previous.setDisabled();
      if(page >= Math.ceil(array.length / 10)) next.setDisabled();
      ctx.reply(embed.build({
        components: [
          {
            type: 1,
            components: [previous, next]
          }
        ]
      }));
    }
    else {
      let users = (await User.find({
        correct_predictions: {
          $gt: 0
        }
      }) as UserSchemaInterface[]).sort((a, b) => b.correct_predictions - a.correct_predictions);
      let array = users;
      let page = Number(ctx.args[1]);
      if(!page || page === 1 || isNaN(page)) {
        users = users.slice(0, 10);
        page = 1;
      }
      else users = users.slice(page * 10 - 10, page * 10);
      if(!users.length) {
        ctx.reply("commands.ranking.no_users");
        return;
      }
      const embed = new EmbedBuilder()
      .setAuthor({
        name: locale("commands.ranking.author", {
          page,
          pages: Math.ceil(array.length / 10)
        })
      })
      .setTitle(locale("commands.ranking.title"))
      .setThumb((await client.rest.users.get(array[0].id!))?.avatarURL());
  
      let pos = 0;
      if(!isNaN(page) && page > 1) pos = page * 10 - 10;
      for(const user of users) {
        pos++;
        const u = client.users.get(user.id)
        let field = `${pos} - ${!u ? "*unknown*" : u.username}`
        if(pos === 1) field = `🥇 - ${!u ? "*unknown*" : u.username}`
        if(pos === 2) field = `🥈 - ${!u ? "*unknown*" : u.username}`
        if(pos === 3) field = `🥉 - ${!u ? "*unknown*" : u.username}`
        embed.addField(field, locale("commands.ranking.field", {
          t: user.correct_predictions
        }));
      }
      embed.setFooter({
        text: locale("commands.ranking.footer", {
          pos: array.findIndex((user) => user.id === ctx.interaction.user.id) + 1
        })
      });
      const previous = new ButtonBuilder()
      .setEmoji("◀️")
      .setCustomId(`ranking;${ctx.interaction.user.id};${page - 1 < 1 ? 1 : page - 1};previous`)
      .setStyle("gray");
      const next = new ButtonBuilder()
      .setEmoji("▶")
      .setCustomId(`ranking;${ctx.interaction.user.id};${page + 1 > Math.ceil(array.length / 10) ? Math.ceil(array.length / 10) : page + 1};next`)
      .setStyle("gray");
      if(page <= 1) previous.setDisabled();
      if(page >= Math.ceil(array.length / 10)) next.setDisabled();
      ctx.reply(embed.build({
        components: [
          {
            type: 1,
            components: [previous, next]
          }
        ]
      }));
    }
  },
  async createInteraction({ ctx, locale, client }) {
    await (ctx.interaction as ComponentInteraction).deferUpdate();
    if(ctx.args[4] === "local") {
      let users = (await User.find({
        correct_predictions: {
          $gt: 0
        }
      }) as UserSchemaInterface[]).filter(user => ctx.guild.members.get(user.id)).sort((a, b) => b.correct_predictions - a.correct_predictions);
      let array = users;
      let page = Number(ctx.args[2]);
      let pages = Math.ceil(array.length / 10);
      users = users.slice(page * 10 - 10, page * 10);
      if(!users.length) {
        ctx.reply("commands.ranking.no_users");
        return;
      }
      const embed = new EmbedBuilder()
      .setAuthor({
        name: locale("commands.ranking.author", {
          page,
          pages: Math.ceil(array.length / 10)
        })
      })
      .setTitle(locale("commands.ranking.title"))
      .setThumb((await client.rest.users.get(array[0].id!))?.avatarURL()!);
  
      let pos = 0;
      if(!isNaN(page) && page > 1) pos = page * 10 - 10;
      for(const user of users) {
        pos++;
        const u = client.users.get(user.id);
        let field =  `${pos} - ${!u ? "*unknown*" : u.username}`
        if(pos === 1) field = `🥇 - ${!u ? "*unknown*" : u.username}`
        if(pos === 2) field = `🥈 - ${!u ? "*unknown*" : u.username}`
        if(pos === 3) field = `🥉 - ${!u ? "*unknown*" : u.username}`
        embed.addField(field, locale("commands.ranking.field", {
          t: user.correct_predictions
        }));
      }
      embed.setFooter({
        text: locale("commands.ranking.footer", {
          pos: array.findIndex((user) => user.id === ctx.interaction.user.id) + 1
        })
      });
      const previous = new ButtonBuilder()
      .setEmoji("◀️")
      .setCustomId(`ranking;${ctx.interaction.user.id};${page - 1};previous;local`)
      .setStyle("gray");
      const next = new ButtonBuilder()
      .setEmoji("▶")
      .setCustomId(`ranking;${ctx.interaction.user.id};${page + 1};next;local`)
      .setStyle("gray");
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
    else {
      let users = (await User.find({
        correct_predictions: {
          $gt: 0
        }
      }) as UserSchemaInterface[]).sort((a, b) => b.correct_predictions - a.correct_predictions);
      let array = users;
      let page = Number(ctx.args[2]);
      let pages = Math.ceil(array.length / 10);
      users = users.slice(page * 10 - 10, page * 10);
      if(!users.length) {
        ctx.reply("commands.ranking.no_users");
        return;
      }
      const embed = new EmbedBuilder()
      .setAuthor({
        name: locale("commands.ranking.author", {
          page,
          pages: Math.ceil(array.length / 10)
        })
      })
      .setTitle(locale("commands.ranking.title"))
      .setThumb((await client.rest.users.get(array[0].id!))?.avatarURL()!);
  
      let pos = 0;
      if(!isNaN(page) && page > 1) pos = page * 10 - 10;
      for(const user of users) {
        pos++;
        const u = client.users.get(user.id);
        let field =  `${pos} - ${!u ? "*unknown*" : u.username}`
        if(pos === 1) field = `🥇 - ${!u ? "*unknown*" : u.username}`
        if(pos === 2) field = `🥈 - ${!u ? "*unknown*" : u.username}`
        if(pos === 3) field = `🥉 - ${!u ? "*unknown*" : u.username}`
        embed.addField(field, locale("commands.ranking.field", {
          t: user.correct_predictions
        }));
      }
      embed.setFooter({
        text: locale("commands.ranking.footer", {
          pos: array.findIndex((user) => user.id === ctx.interaction.user.id) + 1
        })
      });
      const previous = new ButtonBuilder()
      .setEmoji("◀️")
      .setCustomId(`ranking;${ctx.interaction.user.id};${page - 1};previous`)
      .setStyle("gray");
      const next = new ButtonBuilder()
      .setEmoji("▶")
      .setCustomId(`ranking;${ctx.interaction.user.id};${page + 1};next`)
      .setStyle("gray");
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
  }
});