"""
Servicio de envío de emails
"""
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import List, Optional
import logging
from app.core.config import settings

logger = logging.getLogger(__name__)


class EmailService:
    """Servicio para envío de emails"""
    
    def __init__(self):
        self.smtp_host = settings.SMTP_HOST
        self.smtp_port = settings.SMTP_PORT
        self.smtp_user = settings.SMTP_USER
        self.smtp_password = settings.SMTP_PASSWORD
        self.from_email = settings.EMAILS_FROM_EMAIL
        self.from_name = settings.EMAILS_FROM_NAME
    
    def send_email(
        self,
        to_email: str,
        subject: str,
        body_html: str,
        body_text: Optional[str] = None
    ) -> bool:
        """
        Envía un email
        
        Args:
            to_email: Email del destinatario
            subject: Asunto del email
            body_html: Cuerpo del email en HTML
            body_text: Cuerpo del email en texto plano (opcional)
            
        Returns:
            bool: True si se envió correctamente, False en caso contrario
        """
        try:
            # En desarrollo, solo log el email
            if settings.ENVIRONMENT == "development":
                logger.info(f"Email simulado para: {to_email}")
                logger.info(f"Asunto: {subject}")
                logger.info(f"Contenido: {body_text or body_html}")
                return True
            
            # Si no hay configuración SMTP, solo log
            if not self.smtp_user or not self.smtp_password:
                logger.warning("No hay configuración SMTP. Email no enviado.")
                logger.info(f"Email para: {to_email}, Asunto: {subject}")
                return False
            
            # Crear mensaje
            msg = MIMEMultipart('alternative')
            msg['Subject'] = subject
            msg['From'] = f"{self.from_name} <{self.from_email}>"
            msg['To'] = to_email
            
            # Agregar cuerpo del mensaje
            if body_text:
                part1 = MIMEText(body_text, 'plain')
                msg.attach(part1)
            
            part2 = MIMEText(body_html, 'html')
            msg.attach(part2)
            
            # Enviar email
            with smtplib.SMTP(self.smtp_host, self.smtp_port) as server:
                server.starttls()
                server.login(self.smtp_user, self.smtp_password)
                server.send_message(msg)
            
            logger.info(f"Email enviado exitosamente a: {to_email}")
            return True
            
        except Exception as e:
            logger.error(f"Error al enviar email: {str(e)}")
            return False
    
    def send_password_reset_email(
        self,
        to_email: str,
        user_name: str,
        new_password: str,
        company_name: str
    ) -> bool:
        """
        Envía email con nueva contraseña
        
        Args:
            to_email: Email del usuario
            user_name: Nombre del usuario
            new_password: Nueva contraseña generada
            company_name: Nombre de la empresa
            
        Returns:
            bool: True si se envió correctamente
        """
        subject = f"Reseteo de Contraseña - {company_name}"
        
        body_html = f"""
        <html>
            <body style="font-family: Arial, sans-serif; color: #333;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h2 style="color: #2c3e50;">Reseteo de Contraseña</h2>
                    
                    <p>Hola {user_name},</p>
                    
                    <p>Tu contraseña ha sido reseteada por un administrador del sistema.</p>
                    
                    <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
                        <p><strong>Tu nueva contraseña es:</strong></p>
                        <p style="font-size: 18px; font-family: monospace; background-color: #fff; padding: 10px; border: 1px solid #ddd; border-radius: 3px;">
                            {new_password}
                        </p>
                    </div>
                    
                    <p><strong>Importante:</strong></p>
                    <ul>
                        <li>Por seguridad, te recomendamos cambiar esta contraseña al iniciar sesión</li>
                        <li>No compartas esta contraseña con nadie</li>
                        <li>Si no solicitaste este cambio, contacta inmediatamente al administrador</li>
                    </ul>
                    
                    <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
                    
                    <p style="font-size: 12px; color: #666;">
                        Este es un mensaje automático del Sistema de Capacitación LPDP de {company_name}.
                        Por favor, no respondas a este email.
                    </p>
                </div>
            </body>
        </html>
        """
        
        body_text = f"""
Reseteo de Contraseña

Hola {user_name},

Tu contraseña ha sido reseteada por un administrador del sistema.

Tu nueva contraseña es: {new_password}

IMPORTANTE:
- Por seguridad, te recomendamos cambiar esta contraseña al iniciar sesión
- No compartas esta contraseña con nadie
- Si no solicitaste este cambio, contacta inmediatamente al administrador

---
Este es un mensaje automático del Sistema de Capacitación LPDP de {company_name}.
        """
        
        return self.send_email(to_email, subject, body_html, body_text)
    
    def send_welcome_email(
        self,
        to_email: str,
        user_name: str,
        username: str,
        temporary_password: str,
        company_name: str,
        login_url: str
    ) -> bool:
        """
        Envía email de bienvenida con credenciales
        
        Args:
            to_email: Email del usuario
            user_name: Nombre completo del usuario
            username: Nombre de usuario para login
            temporary_password: Contraseña temporal
            company_name: Nombre de la empresa
            login_url: URL para iniciar sesión
            
        Returns:
            bool: True si se envió correctamente
        """
        subject = f"Bienvenido al Sistema de Capacitación LPDP - {company_name}"
        
        body_html = f"""
        <html>
            <body style="font-family: Arial, sans-serif; color: #333;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h2 style="color: #2c3e50;">¡Bienvenido al Sistema de Capacitación LPDP!</h2>
                    
                    <p>Hola {user_name},</p>
                    
                    <p>Tu cuenta ha sido creada exitosamente en el Sistema de Capacitación sobre la Ley de Protección de Datos Personales.</p>
                    
                    <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
                        <p><strong>Tus credenciales de acceso son:</strong></p>
                        <p>Usuario: <strong>{username}</strong></p>
                        <p>Contraseña temporal: <strong style="font-family: monospace;">{temporary_password}</strong></p>
                        <p>URL de acceso: <a href="{login_url}">{login_url}</a></p>
                    </div>
                    
                    <p><strong>Próximos pasos:</strong></p>
                    <ol>
                        <li>Ingresa al sistema usando las credenciales proporcionadas</li>
                        <li>Cambia tu contraseña temporal por una personal</li>
                        <li>Completa tu perfil</li>
                        <li>Comienza tu capacitación en los módulos disponibles</li>
                    </ol>
                    
                    <p>Si tienes alguna pregunta o necesitas ayuda, no dudes en contactar a tu administrador.</p>
                    
                    <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
                    
                    <p style="font-size: 12px; color: #666;">
                        {company_name} - Sistema de Capacitación LPDP<br>
                        Powered by Jurídica Digital SPA
                    </p>
                </div>
            </body>
        </html>
        """
        
        body_text = f"""
¡Bienvenido al Sistema de Capacitación LPDP!

Hola {user_name},

Tu cuenta ha sido creada exitosamente en el Sistema de Capacitación sobre la Ley de Protección de Datos Personales.

Tus credenciales de acceso son:
Usuario: {username}
Contraseña temporal: {temporary_password}
URL de acceso: {login_url}

Próximos pasos:
1. Ingresa al sistema usando las credenciales proporcionadas
2. Cambia tu contraseña temporal por una personal
3. Completa tu perfil
4. Comienza tu capacitación en los módulos disponibles

Si tienes alguna pregunta o necesitas ayuda, no dudes en contactar a tu administrador.

---
{company_name} - Sistema de Capacitación LPDP
Powered by Jurídica Digital SPA
        """
        
        return self.send_email(to_email, subject, body_html, body_text)


# Instancia global del servicio
email_service = EmailService()
