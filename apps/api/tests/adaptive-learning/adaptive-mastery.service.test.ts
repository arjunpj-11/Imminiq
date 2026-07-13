import { describe, expect, it } from 'vitest'

import { calculateAdaptiveMasteryResult } from '../../src/modules/user/adaptive-learning/domain/services/adaptive-mastery.service'

describe('adaptive mastery calculation', () => {
  it('downgrades mastery whenever the learner scores below prediction', () => {
    expect(
      calculateAdaptiveMasteryResult({
        currentMasteryScore: 50,
        predictedScore: 70,
        actualScore: 55,
      }),
    ).toEqual({ change: -3, masteryScore: 47, level: 'developing' })
  })

  it('upgrades mastery when the learner beats prediction', () => {
    expect(
      calculateAdaptiveMasteryResult({
        currentMasteryScore: 70,
        predictedScore: 60,
        actualScore: 81,
      }),
    ).toEqual({ change: 4, masteryScore: 74, level: 'proficient' })
  })

  it('caps a single exam movement and total mastery range', () => {
    expect(
      calculateAdaptiveMasteryResult({
        currentMasteryScore: 98,
        predictedScore: 10,
        actualScore: 100,
      }),
    ).toEqual({ change: 8, masteryScore: 100, level: 'advanced' })
  })
})
