const { client } = require("../dist/src/structures/client/App");

(async() => {
  await client.restMode();
  const commands = [];
  for(const cmd of await client.loadCommands()) {
    commands.push({
      name: cmd[1].name,
      nameLocalizations: cmd[1].nameLocalizations,
      description: cmd[1].description,
      descriptionLocalizations: cmd[1].descriptionLocalizations,
      options: cmd[1].options,
      type: 1
    });
  }
  await client.application.bulkEditGlobalCommands(commands);
  console.log("done");
})();