import type { SignalType } from './data'

export const REPOSITORY_URL = 'https://github.com/nus-etp/hermenaut'

export const QUIET_SIGNAL_TYPES: SignalType[] = ['Hiring', 'Release']

export function isQuietSignalType(type: SignalType): boolean {
  return QUIET_SIGNAL_TYPES.includes(type)
}
