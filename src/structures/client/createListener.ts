import type { ClientEvents } from "oceanic.js"
import App from "./App.ts"

type Listener<T extends keyof ClientEvents> = {
  name: T
  run: (client: App, ...args: ClientEvents[T]) => Promise<any>
}
export default function<T extends keyof ClientEvents>(
  listener: Listener<T>
): Listener<T> {
  return listener
}