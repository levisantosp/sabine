import { valorant_weapons } from "../config.ts"

type WeaponDamage = {
  head: number
  chest: number
}
type Weapon = {
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
  teamIndex: number
  index: number
  stats: PlayerStats
  teamCredits: number
}
export default class Player {
  public name: string
  public life: number
  public credits: number
  public weapon: PlayerWeapon
  public teamIndex: number
  public index: number
  public stats: PlayerStats
  public teamCredits: number
  public constructor(options: PlayerOptions) {
    this.name = options.name
    this.life = options.life
    this.credits = options.credits
    this.weapon = options.weapon
    this.teamIndex = options.teamIndex
    this.index = options.index
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
      const secondary = valorant_weapons.filter(w => w.price > 0 && w.price <= 800)
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
    const weight = items.reduce((sum, i) => sum + weightFun(i), 0)
    let random = Math.random() * weight
    for(const item of items) {
      random -= weightFun(item)
      if(random <= 0) {
        return item
      }
    }
    return items[items.length - 1]
  }
}