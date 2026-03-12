"""Email templates for customer-facing emails (portal credentials, etc.)."""

# Logo URL for email header (hosted on your domain; change if needed)
EMAIL_LOGO_URL = "https://innexar.app/logo.png"

# Localized strings for portal credentials email (en, pt, es)
PORTAL_CREDENTIALS_STRINGS: dict[str, dict[str, str]] = {
    "en": {
        "subject": "Innexar – Your portal access details",
        "hello": "Hello,",
        "intro_after_payment": "Your payment was approved. Here are your portal access details:",
        "intro_default": "Here are your Innexar portal access details:",
        "access": "Access",
        "email": "Email",
        "temp_password": "Temporary password",
        "change_password_hint": "We recommend changing your password after first login.",
        "next_step_briefing": "Next step: fill in your website details (name, services, photos) so we can start building.",
        "signature": "— Innexar Team",
        "footer_legal": "This email was sent because you are a client or requested portal access. If you have questions, reply to this message.",
    },
    "pt": {
        "subject": "Innexar – Seus dados de acesso ao portal do cliente",
        "hello": "Olá,",
        "intro_after_payment": "Seu pagamento foi aprovado. Segue seu acesso ao portal:",
        "intro_default": "Segue seu acesso ao portal da Innexar:",
        "access": "Acesse",
        "email": "E-mail",
        "temp_password": "Senha temporária",
        "change_password_hint": "Recomendamos alterar a senha após o primeiro acesso.",
        "next_step_briefing": "Próximo passo: preencha os dados do seu site (nome, serviços, fotos) para começarmos a construção.",
        "signature": "— Equipe Innexar",
        "footer_legal": "Este e-mail foi enviado porque você é cliente ou solicitou acesso ao portal. Em caso de dúvidas, responda a esta mensagem.",
    },
    "es": {
        "subject": "Innexar – Tus datos de acceso al portal",
        "hello": "Hola,",
        "intro_after_payment": "Tu pago fue aprobado. Aquí están tus datos de acceso al portal:",
        "intro_default": "Aquí están tus datos de acceso al portal de Innexar:",
        "access": "Acceso",
        "email": "Correo",
        "temp_password": "Contraseña temporal",
        "change_password_hint": "Recomendamos cambiar la contraseña después del primer acceso.",
        "next_step_briefing": "Siguiente paso: completa los datos de tu sitio (nombre, servicios, fotos) para comenzar la construcción.",
        "signature": "— Equipo Innexar",
        "footer_legal": "Este correo fue enviado porque eres cliente o solicitaste acceso al portal. Si tienes dudas, responde a este mensaje.",
    },
}


def _strings_for_locale(locale: str) -> dict[str, str]:
    return PORTAL_CREDENTIALS_STRINGS.get(locale, PORTAL_CREDENTIALS_STRINGS["en"])


def portal_credentials_email(
    login_url: str,
    recipient_email: str,
    temporary_password: str,
    *,
    after_payment: bool = False,
    briefing_url: str | None = None,
    locale: str = "en",
) -> tuple[str, str, str]:
    """Return (subject, body_plain, body_html) for portal access email.
    Subject is short and professional (no URL or password in subject).
    locale: en, pt, or es for localized content."""
    s = _strings_for_locale(locale if locale in ("en", "pt", "es") else "en")
    subject = s["subject"]
    intro = s["intro_after_payment"] if after_payment else s["intro_default"]
    body_plain = (
        f"{s['hello']}\n\n"
        f"{intro}\n\n"
        f"{s['access']}: {login_url}\n"
        f"{s['email']}: {recipient_email}\n"
        f"{s['temp_password']}: {temporary_password}\n\n"
        f"{s['change_password_hint']}\n\n"
    )
    if after_payment and briefing_url:
        body_plain += f"{s['next_step_briefing']} {briefing_url}\n\n"
    body_plain += s["signature"]
    body_html = _portal_credentials_html(
        login_url=login_url,
        recipient_email=recipient_email,
        temporary_password=temporary_password,
        after_payment=after_payment,
        briefing_url=briefing_url,
        locale=locale,
    )
    return subject, body_plain, body_html


def _email_header_html(logo_url: str) -> str:
    """Professional header with logo for transactional emails."""
    return f"""
    <tr>
      <td style="padding: 28px 28px 24px; background: linear-gradient(180deg, #0f172a 0%, #1e293b 100%); text-align: center;">
        <a href="https://innexar.app" style="text-decoration: none;">
          <img src="{logo_url}" alt="Innexar" width="140" height="40" style="display: inline-block; max-width: 140px; height: auto; border: 0;" />
        </a>
      </td>
    </tr>"""


def _email_footer_html(locale: str = "en") -> str:
    """Professional footer: signature, company info, legal."""
    s = _strings_for_locale(locale)
    return f"""
    <tr>
      <td style="padding: 24px 28px; background: #f8fafc; border-top: 1px solid #e2e8f0;">
        <p style="margin:0 0 8px; font-size: 14px; font-weight: 600; color: #0f172a;">Innexar Team</p>
        <p style="margin:0 0 4px; font-size: 13px; color: #475569;">
          <a href="https://innexar.app" style="color: #2563eb; text-decoration: none;">innexar.app</a>
        </p>
        <p style="margin: 12px 0 0; font-size: 11px; color: #94a3b8; line-height: 1.4;">
          {s["footer_legal"]}
        </p>
      </td>
    </tr>
    <tr>
      <td style="padding: 12px 28px; background: #f1f5f9; text-align: center;">
        <p style="margin:0; font-size: 11px; color: #94a3b8;">© Innexar.</p>
      </td>
    </tr>"""


def _portal_credentials_html(
    login_url: str,
    recipient_email: str,
    temporary_password: str,
    after_payment: bool,
    briefing_url: str | None = None,
    locale: str = "en",
) -> str:
    s = _strings_for_locale(locale)
    intro = s["intro_after_payment"] if after_payment else s["intro_default"]
    lang = "en" if locale == "en" else "pt-BR" if locale == "pt" else "es"
    header = _email_header_html(EMAIL_LOGO_URL)
    footer = _email_footer_html(locale)
    briefing_block = (
        f'<p style="margin: 24px 0 0; font-size: 14px; color: #475569;">{s["next_step_briefing"]} <a href="{briefing_url}" style="color: #2563eb;">{briefing_url}</a></p>'
        if briefing_url
        else ""
    )
    return f"""<!DOCTYPE html>
<html lang="{lang}">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Portal access</title>
</head>
<body style="margin:0; padding:0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f1f5f9; color: #1e293b;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f1f5f9;">
    <tr>
      <td style="padding: 32px 16px;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.08); overflow: hidden;">
          {header}
          <tr>
            <td style="padding: 28px;">
              <p style="margin:0 0 16px; font-size: 15px; line-height: 1.5; color: #475569;">{s["hello"]}</p>
              <p style="margin:0 0 24px; font-size: 15px; line-height: 1.5; color: #475569;">{intro}</p>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0;">
                <tr>
                  <td style="padding: 20px;">
                    <p style="margin:0 0 12px; font-size: 13px; color: #64748b;">{s["access"]}</p>
                    <p style="margin:0 0 16px; font-size: 15px;"><a href="{login_url}" style="color: #2563eb; text-decoration: none; font-weight: 500;">{login_url}</a></p>
                    <p style="margin:0 0 8px; font-size: 13px; color: #64748b;">{s["email"]}</p>
                    <p style="margin:0 0 16px; font-size: 15px; color: #1e293b;">{recipient_email}</p>
                    <p style="margin:0 0 8px; font-size: 13px; color: #64748b;">{s["temp_password"]}</p>
                    <p style="margin:0; font-size: 15px; font-family: ui-monospace, monospace; color: #1e293b; letter-spacing: 0.02em;">{temporary_password}</p>
                  </td>
                </tr>
              </table>
              <p style="margin: 20px 0 0; font-size: 14px; color: #64748b;">{s["change_password_hint"]}</p>
              <p style="margin: 28px 0 0;">
                <a href="{login_url}" style="display: inline-block; padding: 12px 24px; background: #2563eb; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 500; border-radius: 8px;">{s["access"]}</a>
              </p>
              {briefing_block}
            </td>
          </tr>
          {footer}
        </table>
      </td>
    </tr>
  </table>
</body>
</html>"""
