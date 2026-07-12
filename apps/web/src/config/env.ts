import { parseWebEnvironment } from './env.parser'

export const webEnvironment = parseWebEnvironment(import.meta.env)
