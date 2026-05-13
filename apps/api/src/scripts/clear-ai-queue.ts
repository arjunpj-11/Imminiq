import { aiQueue } from '../infrastructure/queue/queues'

const clearAIQueue = async () => {
  try {
    await aiQueue.obliterate({
      force: true,
    })

    console.log('✅ AI BullMQ queue cleared completely')
  } catch (error) {
    console.error('❌ Failed to clear AI BullMQ queue:', error)
    process.exitCode = 1
  } finally {
    await aiQueue.close()
  }
}

clearAIQueue()