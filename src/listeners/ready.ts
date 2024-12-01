import { CreateApplicationCommandOptions } from "oceanic.js"
import { createListener, Logger } from "../structures"

export default createListener({
  name: "ready",
  async run(client) {
    Logger.send(`${client.user.tag} online!`);
    if(client.user.id !== "1235576817683922954") {
      client.editStatus("dnd");
    }
    const commands: CreateApplicationCommandOptions[] = [];
    client.commands.forEach(cmd => {
      commands.push({
        name: cmd.name,
        nameLocalizations: cmd.nameLocalizations,
        description: cmd.description,
        descriptionLocalizations: cmd.descriptionLocalizations,
        options: cmd.options,
        type: 1
      });
    });
    client.application.bulkEditGlobalCommands(commands);
  }
});