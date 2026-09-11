declare module '@rails/actioncable' {
  interface Subscription {
    unsubscribe(): void
  }

  interface Consumer {
    subscriptions: {
      create(
        channel: string | Record<string, unknown>,
        callbacks?: Record<string, (...args: any[]) => any>
      ): Subscription
    }
    disconnect(): void
    send(data: unknown): void
  }

  export function createConsumer(
    url?: string
  ): Consumer
}