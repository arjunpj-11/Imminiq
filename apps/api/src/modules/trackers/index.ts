export { default } from './presentation/trackers.routes'
export { default as trackerRoutes } from './presentation/trackers.routes'
export { trackerController } from './presentation/trackers.controller'
export { trackerService } from './trackers.service'

// Compatibility export for existing modules that still import trackerRepository
// from the public trackers barrel during the migration.
export { trackerRepository } from './trackers.repository'

export * from './domain/types/trackers.types'
export * from './domain/types/lesson-practice.types'
