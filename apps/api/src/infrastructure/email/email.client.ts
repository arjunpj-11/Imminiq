import nodemailer from 'nodemailer'
import { env } from '../../config/env'

export const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: Number(env.SMTP_PORT), // 587
  secure: Number(env.SMTP_PORT) === 465, // false for 587, true for 465
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
  },
})

export const sendMail = async (
  to: string,
  subject: string,
  html: string
) => {
  return transporter.sendMail({
    from: env.EMAIL_FROM,
    to,
    subject,
    html,
  })
}