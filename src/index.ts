import "dotenv/config"
import App from "./structures/client/App.js"
import { FastifyPluginAsyncTypebox, Type } from "@fastify/type-provider-typebox"
import fastify from "fastify"
import { Guild, GuildSchemaInterface } from "./database/index.js";
import { ResultsData } from "../types/index.js";

export const client = new App({
  auth: "Bot " + process.env.BOT_TOKEN,
  gateway: {
    intents: ["ALL"],
    autoReconnect: true,
    maxShards: "auto"
  },
  allowedMentions: {
    everyone: false,
    users: true,
    repliedUser: true,
    roles: false
  },
  defaultImageFormat: "png",
  defaultImageSize: 2048
});
await client.start();

const routes: FastifyPluginAsyncTypebox = async(fastify) => {
  fastify.post("/webhooks/matches/valorant", {}, async(req, res) => {
    console.log("webhook received", req.body);
  });

  fastify.post("/webhooks/results/valorant", {
    schema: {
      body: Type.Array(
        Type.Object(
          {
            id: Type.String(),
            teams: Type.Array(
              Type.Object(
                {
                  name: Type.String(),
                  score: Type.String(),
                  country: Type.String(),
                  winner: Type.Boolean()
                }
              )
            ),
            status: Type.String(),
            tournament: Type.Object(
              {
                name: Type.String(),
                image: Type.String()
              }
            ),
            stage: Type.String(),
            when: Type.Number()
          }
        )
      )
    }
  }, async(req) => {
    const guilds = await Guild.find({
      events: { $ne: [] }
    }) as GuildSchemaInterface[];
    if(!guilds.length) return;
    let matches: ResultsData[];
    for(const guild of guilds) {
      let data: ResultsData[];
      if(guild.events.length > 5 && !guild.key) {
        req.body
        data = req.body.filter(d => guild.events.reverse().slice(0, 5).some(e => e.name === d.tournament.name));
      }
      else data = req.body.filter(d => guild.events.some(e => e.name === d.tournament.name));
      if(!data || !data[0]) continue;
      
      matches = data;

      console.log(data);
    }
  });
}
const server = fastify();
server.register(routes);
server.listen({ host: "0.0.0.0", port: 3001 });