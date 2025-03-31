import { Key, KeySchemaInterface } from "../database/index.js"
import ButtonBuilder from "../structures/builders/ButtonBuilder.js"
import createCommand from "../structures/command/createCommand.js"

export default createCommand({
  name: "activatekey",
  nameLocalizations: {
    "pt-BR": "ativarchave"
  },
  description: "Activate your premium key",
  descriptionLocalizations: {
    "pt-BR": "Ative sua chave premium"
  },
  options: [
    {
      type: 3,
      name: "key",
      nameLocalizations: {
        "pt-BR": "chave"
      },
      description: "Insert your key",
      descriptionLocalizations: {
        "pt-BR": "Insira sua chave"
      },
      required: true
    }
  ],
  syntax: "activatekey [key]",
  examples: [
    "activatekey ABCD-1234-AB12-abcdf"
  ],
  permissions: ["ADMINISTRATOR"],
  ephemeral: true,
  async run({ ctx, locale }) {
    const key = await Key.findById(ctx.args[0]) as KeySchemaInterface;
    if(!key) {
      ctx.reply("commands.activatekey.invalid_key");
      return;
    }
    if((key.type === "BOOSTER" && key.active) || key.activeIn.includes(ctx.guild.id)) {
      ctx.reply("commands.activatekey.key_already_activated");
      return;
    }
    if(key.type === "PREMIUM" && key.activeIn.length >= 2) {
      ctx.reply("commands.activatekey.limit_reached");
      return;
    }
    if(ctx.db.guild.key) {
      const button = new ButtonBuilder()
      .setStyle("red")
      .setLabel(locale("commands.activatekey.button"))
      .setCustomId(`activatekey;${ctx.interaction.user.id};${key.type};${ctx.args[0]}`);
      ctx.reply(button.build(locale("commands.activatekey.would_like_to_continue", { key: ctx.db.guild.key.type })));
    }
    else {
      ctx.db.guild.key = {
        type: key.type,
        id: key.id,
        expiresAt: key.expiresAt
      }
      ctx.db.guild.tournamentsLength = 20;
      key.active = true;
      key.activeIn.push(ctx.guild.id);
      await key.save();
      await ctx.db.guild.save();
      ctx.reply("commands.activatekey.key_activated");
    }
  },
  async createInteraction({ ctx }) {
    await ctx.interaction.defer(64);
    const key = await Key.findById(ctx.args[3]) as KeySchemaInterface;
    if(!key) {
      ctx.reply("commands.activatekey.invalid_key");
      return;
    }
    if((key.type === "BOOSTER" && key.active) || key.activeIn.includes(ctx.guild.id)) {
      ctx.reply("commands.activatekey.key_already_activated");
      return;
    }
    if(key.type === "PREMIUM" && key.activeIn.length >= 2) {
      ctx.reply("commands.activatekey.limit_reached");
      return;
    }
    ctx.db.guild.key = {
      id: key.id,
      type: key.type,
      expiresAt: key.expiresAt
    }
    ctx.db.guild.tournamentsLength = 20;
    key.active = true;
    key.activeIn.push(ctx.guild.id);
    await key.save();
    await ctx.db.guild.save();
    ctx.reply("commands.activatekey.key_activated");
  }
});