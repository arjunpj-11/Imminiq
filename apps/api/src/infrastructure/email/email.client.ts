import nodemailer from 'nodemailer'
import { env } from '../../config/env'

export const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: Number(env.SMTP_PORT),
  auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
})

export const sendMail = (to: string, subject: string, html: string) =>
  transporter.sendMail({ from: env.EMAIL_FROM, to, subject, html })