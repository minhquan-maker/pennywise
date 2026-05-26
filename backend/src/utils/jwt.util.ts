import jwt from 'jsonwebtoken'

export const signToken = (userId: string) =>
  jwt.sign({ userId }, process.env.JWT_SECRET!, { expiresIn: '7d' })

export const verifyToken = (token: string) =>
  jwt.verify(token, process.env.JWT_SECRET!) as { userId: string }
