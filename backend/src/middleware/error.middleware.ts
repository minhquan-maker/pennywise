import { Request, Response, NextFunction } from 'express'

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  console.error('[Error]', err.message)

  const code = (err as { statusCode?: number }).statusCode || 500
  const safeStatus = code >= 400 && code < 600 ? code : 500

  if (safeStatus >= 500) {
    res.status(safeStatus).json({ error: 'Internal server error' })
  } else {
    res.status(safeStatus).json({ error: err.message || 'Bad request' })
  }
}
