import 'express'

declare global {
  namespace Express {
    interface User {
      userId: string
      role: 'user' | 'admin' | 'moderator' | 'superadmin'
      type?: 'access' | 'refresh'
    }

    interface Request {
      user?: User
    }
  }
}

export {}