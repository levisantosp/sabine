import { ClientEvents } from "oceanic.js"
import { App } from ".."

type Listener<T extends keyof ClientEvents> = {
  name: T;
  run: (client: App, ...args: ClientEvents[T]) => Promise<void>;
}
export default function<T extends keyof ClientEvents>(
  listener: Listener<T>
): Listener<T> {
  return listener;
}