export const valorant_agents = [
  {
    name: "Brimstone",
    role: "controller",
    emoji: "<:brimstone:1404832324427845783>"
  },
  {
    name: "Omen",
    role: "controller",
    emoji: "<:omen:1404832591378645165>"
  },
  {
    name: "Viper",
    role: "controller",
    emoji: "<:viper:1404832690703962203>"
  },
  {
    name: "Raze",
    role: "duelist",
    emoji: "<:raze:1404832759817699400>"
  },
  {
    name: "Cypher",
    role: "sentinel",
    emoji: "<:cypher:1404832818571382985>"
  },
  {
    name: "Sage",
    role: "sentinel",
    emoji: "<:sage:1404832895805427832>"
  },
  {
    name: "Sova",
    role: "initiator",
    emoji: "<:sova:1404832945998401536>"
  },
  {
    name: "Phoenix",
    role: "duelist",
    emoji: "<:phoenix:1404833016429154324>"
  },
  {
    name: "Jett",
    role: "duelist",
    emoji: "<:jett:1404833095193985137>"
  },
  {
    name: "Breach",
    role: "initiator",
    emoji: "<:breach:1404833186797715589>"
  },
  {
    name: "Reyna",
    role: "duelist",
    emoji: "<:reyna:1404833273460428921>"
  },
  {
    name: "Killjoy",
    role: "sentinel",
    emoji: "<:killjoy:1404833408034541669>"
  },
  {
    name: "Skye",
    role: "initiator",
    emoji: "<:skye:1404833496974753802>"
  },
  {
    name: "Yoru",
    role: "duelist",
    emoji: "<:yoru:1404833537773015163>"
  },
  {
    name: "Astra",
    role: "controller",
    emoji: "<:astra:1404833596606386196>"
  },
  {
    name: "KAY/O",
    role: "initiator",
    emoji: "<:kayo:1404833671403540582>"
  },
  {
    name: "Chamber",
    role: "sentinel",
    emoji: "<:chamber:1404833713610555416>"
  },
  {
    name: "Neon",
    role: "duelist",
    emoji: "<:neon:1404833902794637323>"
  },
  {
    name: "Fade",
    role: "initiator",
    emoji: "<:fade:1404834161667215511>"
  },
  {
    name: "Harbor",
    role: "controller",
    emoji: "<:harbor:1404834211164065903>"
  },
  {
    name: "Gekko",
    role: "initiator",
    emoji: "<:gekko:1404834402998947900>"
  },
  {
    name: "Deadlock",
    role: "sentinel",
    emoji: "<:deadlock:1404834466119159868>"
  },
  {
    name: "Iso",
    role: "duelist",
    emoji: "<:iso:1404834503528284191>"
  },
  {
    name: "Clove",
    role: "controller",
    emoji: "<:clove:1404834553390170203>"
  },
  {
    name: "Vyse",
    role: "sentinel",
    emoji: "<:vyse:1404834578916704300>"
  },
  {
    name: "Tejo",
    role: "initiator",
    emoji: "<:tejo:1404834612206764254>"
  },
  {
    name: "Waylay",
    role: "duelist",
    emoji: "<:waylay:1404834635531161811>"
  }
] as const
export const valorant_weapons = [
  {
    name: "Classic",
    price: 0,
    damage: 26
  },
  {
    name: "Shorty",
    price: 200,
    damage: 12
  },
  {
    name: "Frenzy",
    price: 450,
    damage: 26
  },
  {
    name: "Ghost",
    price: 500,
    damage: 30
  },
  {
    name: "Sheriff",
    price: 800,
    damage: 55
  },
  {
    name: "Stinger",
    price: 950,
    damage: 27
  },
  {
    name: "Spectre",
    price: 1600,
    damage: 26
  },
  {
    name: "Bucky",
    price: 850,
    damage: 22
  },
  {
    name: "Judge",
    price: 1850,
    damage: 17
  },
  {
    name: "Bulldog",
    price: 2050,
    damage: 35
  },
  {
    name: "Guardian",
    price: 2250,
    damage: 65
  },
  {
    name: "Phantom",
    price: 2900,
    damage: 39
  },
  {
    name: "Vandal",
    price: 2900,
    damage: 40
  },
  {
    name: "Marshal",
    price: 950,
    damage: 101
  },
  {
    name: "Operator",
    price: 4700,
    damage: 150
  },
  {
    name: "Outlaw",
    price: 2400,
    damage: 140
  },
  {
    name: "Ares",
    price: 1600,
    damage: 30
  },
  {
    name: "Odin",
    price: 3200,
    damage: 38
  },
  {
    name: "Melee",
    price: 0,
    damage: 50
  }
] as const
export const valorant_maps: {
  name: string
  meta_agents: typeof valorant_agents[number]["name"][]
  current_map_pool?: boolean
  image: string
}[] = [
  {
    name: "Ascent",
    meta_agents: [
      "Jett",
      "Killjoy",
      "Sova",
      "KAY/O",
      "Omen",
      "Vyse",
      "Yoru",
      "Waylay",
      "Cypher"
    ],
    current_map_pool: true,
    image: "https://imgur.com/HUdWHux.png"
  },
  {
    name: "Bind",
    meta_agents: [
      "Raze",
      "Brimstone",
      "Viper",
      "Skye",
      "Fade",
      "Gekko",
      "Neon",
      "Yoru",
      "Cypher",
      "Omen"
    ],
    current_map_pool: true,
    image: "https://imgur.com/vSP4vQB.png"
  },
  {
    name: "Breeze",
    meta_agents: [
      "Viper",
      "Jett",
      "Cypher",
      "KAY/O",
      "Sova",
      "Harbor"
    ],
    image: "https://imgur.com/p5Bxsca.png"
  },
  {
    name: "Fracture",
    meta_agents: [
      "Brimstone",
      "Raze",
      "Neon",
      "Vyse",
      "Killjoy",
      "Cypher",
      "Fade",
      "Breach",
      "Skye"
    ],
    image: "https://imgur.com/Fsas50g.png"
  },
  {
    name: "Haven",
    meta_agents: [
      "Cypher",
      "Omen",
      "Breach",
      "Killjoy",
      "Vyse",
      "Skye",
      "Sova",
      "Gekko",
      "Jett",
      "Yoru",
      "Iso",
      "Neon",
      "Viper"
    ],
    current_map_pool: true,
    image: "https://imgur.com/oNm4lD3.png"
  },
  {
    name: "Icebox",
    meta_agents: [
      "Jett",
      "Viper",
      "Harbor",
      "Killjoy",
      "Sova",
      "KAY/O",
      "Gekko"
    ],
    current_map_pool: true,
    image: "https://imgur.com/aQrhYgx.png"
  },
  {
    name: "Pearl",
    meta_agents: [
      "Yoru",
      "Jett",
      "Astra",
      "Viper",
      "Vyse",
      "Killjoy",
      "Cypher",
      "KAY/O",
      "Fade",
      "Sova"
    ],
    image: "https://imgur.com/P1189zs.png"
  },
  {
    name: "Split",
    meta_agents: [
      "Raze",
      "Yoru",
      "Jett",
      "Breach",
      "Fade",
      "Skye",
      "Astra",
      "Omen",
      "Viper",
      "Cypher"
    ],
    image: "https://imgur.com/36tar4S.png"
  },
  {
    name: "Lotus",
    meta_agents: [
      "Raze",
      "Yoru",
      "Neon",
      "Fade",
      "Tejo",
      "Gekko",
      "Vyse",
      "Cypher",
      "Killjoy",
      "Viper",
      "Omen"
    ],
    current_map_pool: true,
    image: "https://imgur.com/CLq6LKn.png"
  },
  {
    name: "Sunset",
    meta_agents: [
      "Raze",
      "Neon",
      "Fade",
      "Sova",
      "Breach",
      "Gekko",
      "Viper",
      "Omen",
      "Cypher"
    ],
    current_map_pool: true,
    image: "https://imgur.com/MuMwr1F.png"
  },
  {
    name: "Abyss",
    meta_agents: [
      "Astra",
      "Omen",
      "KAY/O",
      "Sova",
      "Cypher",
      "Vyse",
      "Chamber",
      "Jett",
      "Yoru"
    ],
    image: "https://imgur.com/7b8pgQz.png"
  },
  {
    name: "Corrode",
    meta_agents: [
      "Yoru",
      "Waylay",
      "Neon",
      "Omen",
      "Fade",
      "Sova",
      "Viper",
      "Vyse",
      "Chamber"
    ],
    current_map_pool: true,
    image: "https://imgur.com/2rmdsWE.png"
  }
] as const