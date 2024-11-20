"""
email_templates.py

Módulo para generar plantillas HTML para correos electrónicos enviados
por el backend. Este archivo contiene funciones reutilizables para
generar plantillas con diferentes diseños.

Dependencias:
- Ninguna externa
"""

def contacto_email_template(name: str, email: str, reason: str, message: str) -> str:
    """
    Genera la plantilla HTML para un correo de contacto.

    Args:
        name (str): Nombre del remitente.
        email (str): Correo electrónico del remitente.
        reason (str): Motivo del contacto.
        message (str): Mensaje del remitente.

    Returns:
        str: Contenido HTML del correo.

    Example:
        >>> html = contacto_email_template(
        >>>     name="Juan Pérez",
        >>>     email="juan.perez@example.com",
        >>>     reason="Informacion",
        >>>     message="Hola, tengo una duda sobre su servicio."
        >>> )
    """
    return f"""
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
            body {{
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                margin: 0;
                padding: 0;
            }}
            .email-container {{
                max-width: 600px;
                margin: auto;
                border: 1px solid #ddd;
                border-radius: 8px;
                overflow: hidden;
                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
            }}
            .header {{
                background-color: #f4f4f4;
                padding: 20px;
                text-align: center;
            }}
            .header img {{
                max-width: 150px;
            }}
            .content {{
                padding: 20px;
            }}
            .footer {{
                background-color: #f4f4f4;
                text-align: center;
                padding: 10px;
                font-size: 0.8em;
                color: #666;
            }}
            .highlight {{
                color: #0056b3;
            }}
        </style>
    </head>
    <body>
        <div class="email-container">
            <div class="header">
                <img src="https://galenn.asuscomm.com/images/navbar/imagenLogo.png" alt="Logo">
            </div>
            <div class="content">
                <h2>Nuevo mensaje</h2>
                <p><strong>Nombre:</strong> <span class="highlight">{name}</span></p>
                <p><strong>Correo Electrónico:</strong> <span class="highlight">{email}</span></p>
                <p><strong>Motivo:</strong> <span class="highlight">{reason}</span></p>
                <p><strong>Mensaje:</strong></p>
                <p>{message}</p>
            </div>
            <div class="footer">
                <p>Este correo fue enviado automáticamente desde el formulario de contacto del sitio web Paraíso Del Jamón.</p>
            </div>
        </div>
    </body>
    </html>
    """
