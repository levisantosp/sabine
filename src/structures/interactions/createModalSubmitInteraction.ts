import type { Args } from '../../locales/index.ts'
import ModalSubmitInteractionContext from './ModalSubmitInteractionContext.ts'

type CreateModalSubmitInteractionProps = {
  ctx: ModalSubmitInteractionContext
  t: (content: string, args?: Args) => string
}
type CreateModalSubmitInteractionOptions = {
  name: string
  isThinking?: boolean
  ephemeral?: boolean
  flags?: number
  run: (props: CreateModalSubmitInteractionProps) => Promise<any>
}
export default function(options: CreateModalSubmitInteractionOptions) {
  return options
}