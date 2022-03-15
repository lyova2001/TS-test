type response = {
  status: number
}

type handlers = {
  next: Function
  error: Function
  complete: Function
}

class Observer {
  private isUnsubscribed: boolean
  private handlers: handlers
  _unsubscribe: any
  constructor(handlers: handlers) {
    this.handlers = handlers
    this.isUnsubscribed = false
  }

  next(value: any) {
    if (this.handlers.next && !this.isUnsubscribed) {
      this.handlers.next(value)
    }
  }

  error(error: any) {
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

class Observable {
  private _subscribe: Function

  constructor(subscribe) {
    this._subscribe = subscribe
  }
  static from(values) {
    return new Observable((observer) => {
      values.forEach((value) => observer.next(value))
      observer.complete()
      return () => {
        console.log('unsubscribed')
      }
    })
  }
  subscribe(obs) {
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

const requestsMock = [
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

const handleRequest = (request: any) => {
  // handling of request
  return { status: HTTP_STATUS_OK }
}
const handleError = (error: any) => {
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
