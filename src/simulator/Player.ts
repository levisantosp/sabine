import { valorant_weapons } from "../config.ts"

type WeaponDamage = {
  head: number
  chest: number
}
type Weapon = {
  name?: string
  damage: WeaponDamage
  magazine?: number
}
export type PlayerWeapon = {
  primary?: Weapon
  secondary?: Weapon
  melee: Weapon
}
type PlayerStats = {
  aim: number
  HS: number
  movement: number
  aggression: number
  ACS: number
  gamesense: number
  ovr: number
}
type PlayerOptions = {
  name: string
  life: number
  credits: number
  weapon: PlayerWeapon
  stats: PlayerStats
  teamCredits: number
}
export default class Player {
  public name: string
  public life: number
  public credits: number
  public weapon: PlayerWeapon
  public stats: PlayerStats
  public teamCredits: number
  public constructor(options: PlayerOptions) {
    this.name = options.name
    this.life = options.life
    this.credits = options.teamCredits
    this.weapon = options.weapon
    this.stats = options.stats
    this.teamCredits = options.teamCredits
  }
  public buy() {
    if(this.teamCredits >= 2700) {
      let primary = valorant_weapons.filter(w => w.price > 800 && w.price + 1000 <= this.credits)
      let secondary = valorant_weapons.filter(w => w.price > 0 && w.price <= 800 && w.price + 1000 <= this.credits)
      if(!primary.length) {
        primary = valorant_weapons.filter(w => w.price > 800 && w.price + 400 <= this.credits)
      }
      if(!secondary.length) {
        secondary = valorant_weapons.filter(w => w.price > 0 && w.price <= 800 &&  w.price + 400 <= this.credits)
      }
      const weapon = this.chooseWeapon(
        primary,
        w => ["Outlaw", "Operator", "Marshall", "Guardian"]
        .includes(w.name) ? w.damage.chest * 100 : w.damage.head * 100
      )
      const secondaryWeapon = this.chooseWeapon(secondary, w => w.price)
      this.credits -= weapon.price
      this.weapon.primary = weapon
      if(this.credits >= secondaryWeapon.price) {
        this.credits -= secondaryWeapon.price
        this.weapon.secondary = secondaryWeapon
      }
      if(this.credits >= 1000) {
        this.credits -= 1000
        this.life = 150
      }
      else if(this.credits >= 400) {
        this.credits -= 400
        this.life = 125
      }
    }
    else if(this.teamCredits === 800) {
      const secondary = valorant_weapons.filter(w => w.price <= 800 && w.name !== "Melee")
      const weapon = this.chooseWeapon(secondary, w => w.price * 5)
      this.credits -= weapon.price
      this.weapon.secondary = weapon
      if(this.credits >= 400) {
        this.life = 125
        this.credits -= 400
      }
    }
    else {
      // not buy
    }
    return this
  }
  private chooseWeapon<T>(items: T[], weightFun: (item: T) => number) {
    console.log(items)
    const weight = items.reduce((sum, i) => sum + weightFun(i), 0)
    let random = Math.random() * weight
    for(const item of items) {
      random -= weightFun(item)
      if(random <= 0) {
        return item
      }
    }
    console.log(items)
    return items[items.length - 1]
  }
  private chooseShoot() {
    let steepness = 0.05
    let midpoint = 50
    let prob = 1 / (1 + Math.exp(-steepness * (this.stats.aim - midpoint)))
    let random = Math.random()
    if(random <= prob) {
      steepness = 0.02
      midpoint = 75
      prob = 1 / (1 + Math.exp(-steepness * (this.stats.HS - midpoint)))
      random = Math.random()
      if(random <= prob) {
        return "head"
      }
      else return "chest"
    }
    return "none"
  }
  public shoot() {
    if(this.weapon.primary && this.weapon.primary.magazine && this.weapon.primary.magazine > 0) {
      this.weapon.primary.magazine -= 1
      const choice = this.chooseShoot()
      if(choice === "head") {
        return this.weapon.primary.damage.head
      }
      else if(choice === "chest") {
        return this.weapon.primary.damage.chest
      }
      else {
        return 0
      }
    }
    else if(!this.weapon.secondary || this.weapon.secondary) {
      if(!this.weapon.secondary) this.weapon.secondary = valorant_weapons.find(w => w.name === "Classic")
    }
  }
}