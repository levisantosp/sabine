import type { Args } from '../../i18n/index.ts'
import ModalSubmitInteractionContext from './ModalSubmitInteractionContext.ts'

type CreateModalSubmitInteractionProps = {
  ctx: ModalSubmitInteractionContext
  t: (content: string, args?: Args) => string
}

export type CreateModalSubmitInteractionOptions = {
  name: string
  isThinking?: boolean
  ephemeral?: boolean
  flags?: number
  global?: boolean
  run: (props: CreateModalSubmitInteractionProps) => Promise<any>
}

export default function(options: CreateModalSubmitInteractionOptions) {
  return options
}