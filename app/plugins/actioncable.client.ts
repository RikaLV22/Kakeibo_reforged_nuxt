import {
  createConsumer,
  type Consumer
} from '@rails/actioncable'

export default defineNuxtPlugin((): {
  provide: {
    cable: Consumer | null
  }
} => {
  if (!import.meta.client) {
    return {
      provide: {
        cable: null
      }
    }
  }

  const token = localStorage.getItem('token')

  if (!token) {
    return {
      provide: {
        cable: null
      }
    }
  }

  const cable = createConsumer(
    `ws://localhost:3000/cable?token=${encodeURIComponent(token)}`
  )

  return {
    provide: {
      cable
    }
  }
})