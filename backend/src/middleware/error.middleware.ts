import { Request, Response, NextFunction } from 'express'

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  console.error('[Error]', err.message)

  // Prisma "record not found" (e.g. updating another user's row) -> 404
  if ((err as { code?: string }).code === 'P2025') {
    res.status(404).json({ error: 'Not found' })
    return
  }

  const code = (err as { statusCode?: number }).statusCode || 500
  const safeStatus = code >= 400 && code < 600 ? code : 500

  if (safeStatus >= 500) {
    res.status(safeStatus).json({ error: 'Internal server error' })
  } else {
    res.status(safeStatus).json({ error: err.message || 'Bad request' })
  }
}
