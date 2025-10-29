import type { Args } from '../../i18n/index.ts'
import App from '../app/App.ts'
import ComponentInteractionContext from './ComponentInteractionContext.ts'

type CreateInteractionProps = {
  ctx: ComponentInteractionContext
  t: (content: string, args?: Args) => string
  app: App
}

export type CreateInteractionOptions = {
  name: string
  isThinking?: boolean
  ephemeral?: boolean
  flags?: number
  run: (props: CreateInteractionProps) => Promise<any>
  time?: number
  global?: boolean
}

export default function(component: CreateInteractionOptions) {
  return component
}