# backend/core/email_templates.py

"""
core/email_templates.py

Módulo para generar plantillas HTML para correos electrónicos enviados
por el backend. Este archivo contiene funciones reutilizables para
generar plantillas con diferentes diseños.

Dependencias:
- Ninguna externa.
"""

def contacto_email_template(name: str, email: str, reason: str, message: str) -> str:
    """
    Genera una plantilla HTML para un correo de contacto.

    Esta plantilla incluye información básica como el nombre del remitente,
    su correo electrónico, el motivo del contacto y el mensaje enviado.
    Además, el diseño es compatible con la mayoría de los clientes de correo electrónico.

    Args:
        name (str): Nombre del remitente.
        email (str): Correo electrónico del remitente.
        reason (str): Motivo del contacto (por ejemplo, "Información", "Error").
        message (str): Mensaje del remitente.

    Returns:
        str: Plantilla HTML completa del correo de contacto.

    Example:
        >>> html = contacto_email_template(
        >>>     name="Juan Pérez",
        >>>     email="juan.perez@example.com",
        >>>     reason="Informacion",
        >>>     message="Hola, tengo una duda sobre su servicio."
        >>> )
        >>> print(html)
    """
    return f"""
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
            /* Estilos base */
            body {{
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                margin: 0;
                padding: 0;
            }}
            
            /* Contenedor principal */
            .email-container {{
                max-width: 600px;
                margin: auto;
                border: 1px solid #ddd;
                border-radius: 8px;
                overflow: hidden;
                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
            }}
            
            /* Encabezado */
            .header {{
                background-color: #f4f4f4;
                padding: 20px;
                text-align: center;
            }}
            
            /* Logo */
            .logo-image {{
                max-width: 150px;
                height: auto;
                margin: 0 auto;
            }}
            
            /* Soporte específico para Outlook */
            @media screen and (-ms-high-contrast: active), (-ms-high-contrast: none) {{
                .logo-image {{
                    display: none !important;
                }}
            }}
            
            /* Contenido principal */
            .content {{
                padding: 20px;
            }}
            
            /* Pie de página */
            .footer {{
                background-color: #f4f4f4;
                text-align: center;
                padding: 10px;
                font-size: 0.8em;
                color: #666;
            }}
            
            /* Texto resaltado */
            .highlight {{
                color: #0056b3;
            }}

            /* Estilos específicos para Outlook */
            .outlook-td {{
                padding: 0;
                text-align: center;
            }}

            .outlook-table {{
                width: 100%;
                border: 0;
                cellpadding: 0;
                cellspacing: 0;
            }}

            .outlook-rect {{
                height: 89pt;
                width: 150pt;
                stroke-color: none;
            }}
        </style>
    </head>
    <body>
        <div class="email-container">
            <div class="header">
                <!--[if mso]>
                <table class="outlook-table" role="presentation">
                    <tr>
                        <td class="outlook-td">
                            <v:rect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" 
                                class="outlook-rect">
                                <v:fill type="frame" src="https://galenn.asuscomm.com/images/navbar/imagenLogo.png" />
                                <w:wrap type="none"/>
                            </v:rect>
                        </td>
                    </tr>
                </table>
                <![endif]-->
                <!--[if !mso]><!-->
                <img class="logo-image" src="https://galenn.asuscomm.com/images/navbar/imagenLogo.png" alt="Logo">
                <!--<![endif]-->
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