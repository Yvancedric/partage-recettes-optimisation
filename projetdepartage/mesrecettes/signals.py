from django.dispatch import receiver
from django_rest_passwordreset.signals import reset_password_token_created
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.conf import settings


@receiver(reset_password_token_created)
def password_reset_token_created(sender, instance, reset_password_token, *args, **kwargs):
    """
    Handles password reset tokens
    When a token is created, an e-mail needs to be sent to the user
    """
    # Récupérer l'URL de réinitialisation depuis les settings
    reset_password_url = getattr(settings, 'PASSWORD_RESET_URL', 'http://localhost:3000/reset-password?token={token}')
    reset_password_url = reset_password_url.format(token=reset_password_token.key)

    # Créer le contenu de l'email
    context = {
        'current_user': reset_password_token.user,
        'username': reset_password_token.user.username,
        'email': reset_password_token.user.email,
        'reset_password_url': reset_password_url,
        'token': reset_password_token.key,
    }

    # Sujet de l'email
    email_subject = "Réinitialisation de votre mot de passe - Plateforme de Recettes"

    # Corps de l'email en texte brut
    email_plaintext_message = f"""
Bonjour {context['username']},

Vous avez demandé la réinitialisation de votre mot de passe sur la Plateforme de Recettes.

Pour réinitialiser votre mot de passe, cliquez sur le lien suivant :
{reset_password_url}

Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.

Ce lien est valide pendant 24 heures.

Cordialement,
L'équipe de la Plateforme de Recettes
"""

    # Corps de l'email en HTML
    email_html_message = f"""
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body {{
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }}
        .header {{
            background-color: #386641;
            color: white;
            padding: 20px;
            text-align: center;
            border-radius: 8px 8px 0 0;
        }}
        .content {{
            background-color: #f9f9f9;
            padding: 30px;
            border-radius: 0 0 8px 8px;
        }}
        .button {{
            display: inline-block;
            background-color: #6a994e;
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 6px;
            margin: 20px 0;
        }}
        .button:hover {{
            background-color: #386641;
        }}
        .footer {{
            margin-top: 20px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
            font-size: 12px;
            color: #666;
        }}
    </style>
</head>
<body>
    <div class="header">
        <h1>Réinitialisation de mot de passe</h1>
    </div>
    <div class="content">
        <p>Bonjour <strong>{context['username']}</strong>,</p>
        
        <p>Vous avez demandé la réinitialisation de votre mot de passe sur la Plateforme de Recettes.</p>
        
        <p>Pour réinitialiser votre mot de passe, cliquez sur le bouton ci-dessous :</p>
        
        <div style="text-align: center;">
            <a href="{reset_password_url}" class="button">Réinitialiser mon mot de passe</a>
        </div>
        
        <p>Ou copiez-collez ce lien dans votre navigateur :</p>
        <p style="word-break: break-all; color: #6a994e;">{reset_password_url}</p>
        
        <p><strong>Important :</strong> Ce lien est valide pendant 24 heures.</p>
        
        <p>Si vous n'avez pas demandé cette réinitialisation, ignorez cet email. Votre mot de passe ne sera pas modifié.</p>
    </div>
    <div class="footer">
        <p>Cordialement,<br>L'équipe de la Plateforme de Recettes</p>
    </div>
</body>
</html>
"""

    # Envoyer l'email
    msg = EmailMultiAlternatives(
        # Sujet
        email_subject,
        # Message texte
        email_plaintext_message,
        # Expéditeur
        settings.DEFAULT_FROM_EMAIL,
        # Destinataire
        [reset_password_token.user.email]
    )
    # Ajouter la version HTML
    msg.attach_alternative(email_html_message, "text/html")
    # Envoyer
    msg.send()
