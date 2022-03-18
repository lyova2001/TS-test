type response = {
  status: number
}

type handlers = {
  next(value: request): void
  error(error: response): void
  complete(): void
}

class Observer {
  private isUnsubscribed: boolean
  private handlers: handlers
  _unsubscribe: any

  constructor(handlers: handlers) {
    this.handlers = handlers
    this.isUnsubscribed = false
  }

  next(value: request) {
    console.log(value)
    if (this.handlers.next && !this.isUnsubscribed) {
      this.handlers.next(value)
    }
  }

  error(error: any) {
    console.log(error)
    if (!this.isUnsubscribed) {
      if (this.handlers.error) {
        this.handlers.error(error)
      }

      this.unsubscribe()
    }
  }

  complete() {
    if (!this.isUnsubscribed) {
      if (this.handlers.complete) {
        this.handlers.complete()
      }

      this.unsubscribe()
    }
  }

  unsubscribe() {
    this.isUnsubscribed = true

    if (this._unsubscribe) {
      this._unsubscribe()
    }
  }
}

type subscribeType = (observer: Observer) => () => void

class Observable {
  private _subscribe: subscribeType

  constructor(subscribe: subscribeType) {
    this._subscribe = subscribe
  }

  static from(values: typeof requestsMock) {
    return new Observable((observer: Observer) => {
      values.forEach((value) => observer.next(value))
      observer.complete()
      return () => {
        console.log('unsubscribed')
      }
    })
  }

  subscribe(obs: any) {
    const observer = new Observer(obs)
    observer._unsubscribe = this._subscribe(observer)
    return {
      unsubscribe() {
        observer.unsubscribe()
      },
    }
  }
}

const HTTP_POST_METHOD: string = 'POST'
const HTTP_GET_METHOD: string = 'GET'

const HTTP_STATUS_OK: number = 200
const HTTP_STATUS_INTERNAL_SERVER_ERROR: number = 500

const userMock = {
  name: 'User Name',
  age: 26,
  roles: ['user', 'admin'],
  createdAt: new Date(),
  isDeleated: false,
}

type request = {
  method: string
  host: string
  path: string
  body?: typeof userMock
  params: {
    id?: string
  }
}

const requestsMock: request[] = [
  {
    method: HTTP_POST_METHOD,
    host: 'service.example',
    path: 'user',
    body: userMock,
    params: {},
  },
  {
    method: HTTP_GET_METHOD,
    host: 'service.example',
    path: 'user',
    params: {
      id: '3f5h67s4s',
    },
  },
]

const handleRequest = (request: request): response => {
  // handling of request
  return { status: HTTP_STATUS_OK }
}
const handleError = (error: any): response => {
  // handling of error
  return { status: HTTP_STATUS_INTERNAL_SERVER_ERROR }
}

const handleComplete = () => console.log('complete')

const requests$ = Observable.from(requestsMock)

const subscription = requests$.subscribe({
  next: handleRequest,
  error: handleError,
  complete: handleComplete,
})

subscription.unsubscribe()
