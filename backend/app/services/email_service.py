import smtplib
from email.message import EmailMessage
from email.utils import formataddr
from ssl import create_default_context
from typing import Optional

from app.core.config import settings


class EmailDeliveryError(RuntimeError):
    pass


class EmailService:
    def __init__(
        self,
        host: str = settings.SMTP_HOST,
        port: int = settings.SMTP_PORT,
        username: Optional[str] = settings.SMTP_USERNAME,
        password: Optional[str] = settings.SMTP_PASSWORD,
        from_email: str = settings.SMTP_FROM_EMAIL,
        from_name: str = settings.SMTP_FROM_NAME,
        use_tls: bool = settings.SMTP_USE_TLS,
        use_ssl: bool = settings.SMTP_USE_SSL,
    ):
        self.host = host
        self.port = port
        self.username = username
        self.password = password
        self.from_email = from_email
        self.from_name = from_name
        self.use_tls = use_tls
        self.use_ssl = use_ssl

    def send_email(
        self,
        to_email: str,
        subject: str,
        text: str,
        html: Optional[str] = None,
    ) -> None:
        message = EmailMessage()
        message["Subject"] = subject
        message["From"] = formataddr((self.from_name, self.from_email))
        message["To"] = to_email

        message.set_content(text)
        if html is not None:
            message.add_alternative(html, subtype="html")

        context = create_default_context()

        try:
            if self.use_ssl:
                with smtplib.SMTP_SSL(self.host, self.port, context=context) as smtp:
                    self._send_message(smtp, message)
                return

            with smtplib.SMTP(self.host, self.port) as smtp:
                if self.use_tls:
                    smtp.starttls(context=context)
                self._send_message(smtp, message)
        except (OSError, smtplib.SMTPException) as error:
            raise EmailDeliveryError("Не удалось отправить email") from error

    def send_email_verification(self, to_email: str, verification_url: str) -> None:
        subject = "Подтверждение регистрации в Task Manager"
        text = (
            "Здравствуйте!\n\n"
            "Для завершения регистрации подтвердите email по ссылке:\n"
            f"{verification_url}\n\n"
            "Если вы не регистрировались в Task Manager, просто проигнорируйте это письмо."
        )
        html = f"""
        <p>Здравствуйте!</p>
        <p>Для завершения регистрации подтвердите email по ссылке:</p>
        <p><a href="{verification_url}">Подтвердить email</a></p>
        <p>Если вы не регистрировались в Task Manager, просто проигнорируйте это письмо.</p>
        """

        self.send_email(to_email=to_email, subject=subject, text=text, html=html)

    def send_password_reset(self, to_email: str, reset_url: str) -> None:
        subject = "Восстановление пароля в Task Manager"
        text = (
            "Здравствуйте!\n\n"
            "Для восстановления пароля перейдите по ссылке:\n"
            f"{reset_url}\n\n"
            "Если вы не запрашивали восстановление пароля, просто проигнорируйте это письмо."
        )
        html = f"""
        <p>Здравствуйте!</p>
        <p>Для восстановления пароля перейдите по ссылке:</p>
        <p><a href="{reset_url}">Восстановить пароль</a></p>
        <p>Если вы не запрашивали восстановление пароля, просто проигнорируйте это письмо.</p>
        """

        self.send_email(to_email=to_email, subject=subject, text=text, html=html)

    def send_project_invitation(
        self,
        to_email: str,
        invitation_url: str,
        project_name: str,
    ) -> None:
        subject = f"Приглашение в проект {project_name}"
        text = (
            "Здравствуйте!\n\n"
            f"Вас пригласили в проект «{project_name}» в Task Manager.\n"
            "Чтобы принять приглашение и создать пароль, перейдите по ссылке:\n"
            f"{invitation_url}\n\n"
            "Если вы не ожидали это приглашение, просто проигнорируйте письмо."
        )
        html = f"""
        <p>Здравствуйте!</p>
        <p>Вас пригласили в проект <strong>{project_name}</strong> в Task Manager.</p>
        <p>Чтобы принять приглашение и создать пароль, перейдите по ссылке:</p>
        <p><a href="{invitation_url}">Принять приглашение</a></p>
        <p>Если вы не ожидали это приглашение, просто проигнорируйте письмо.</p>
        """

        self.send_email(to_email=to_email, subject=subject, text=text, html=html)

    def _send_message(self, smtp: smtplib.SMTP, message: EmailMessage) -> None:
        if self.username and self.password:
            smtp.login(self.username, self.password)

        smtp.send_message(message)
