/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: process.env.EMAIL_SECURE,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  async sendEmail(email: string, activationToken: any) {
    try {
      await this.transporter.sendMail({
        from: 'dltcode260@gmail.com',
        to:email,
        subject: "Bienvenido a DLTCode",
        html: `<h1>Hola, bienvenido</h1><p>Gracias por unirte a nuestro equipo, pero aún queda un paso, introduce el siguiente código en la pantalla de verificación: </p><b>${activationToken.activation_token}</b>`, // html body
      });
      return true
    } catch (error) {
      throw new Error('Error al enviar el correo de verificación')
    }
  }
}
