# backend/services/file_service.py

"""
services/file_service.py

Servicio para manejar la validación y procesamiento de archivos.

Este módulo gestiona:
- Validación de tipos MIME y extensiones de archivos.
- Escaneo de contenido en busca de firmas maliciosas.
- Procesamiento y registro de información de archivos válidos.

Dependencias:
- FastAPI: Para manejar archivos en las solicitudes.
- Filetype: Para detección de tipos de archivo mediante cabeceras.
- Hashlib: Para generar hashes SHA-256 de los archivos.
- Logging: Para registrar actividades y errores.
"""

import filetype
import os
import hashlib
from typing import Dict, Optional, Set, Union
from fastapi import UploadFile, HTTPException
import logging

# Colores ANSI para salida en consola
ANSI_GREEN = "\033[32m"
ANSI_RED = "\033[31m"
ANSI_RESET = "\033[0m"

# Configurar logger
logger = logging.getLogger("file_service")

class ColoredFormatter(logging.Formatter):
    def format(self, record):
        if record.levelno == logging.ERROR:
            return f"{ANSI_RED}ERROR-LOG{ANSI_RESET}: {record.getMessage()}"
        elif record.levelno == logging.INFO:
            return f"{ANSI_GREEN}INFO-LOG{ANSI_RESET}: {record.getMessage()}"
        return record.getMessage()

logger.propagate = False
logger.setLevel(logging.INFO)

if not logger.hasHandlers():
    handler = logging.StreamHandler()
    handler.setFormatter(ColoredFormatter())
    logger.addHandler(handler)

class FileService:
    """
    Servicio para validar y procesar archivos adjuntos.

    Este servicio encapsula toda la lógica necesaria para verificar la seguridad
    y validez de los archivos, asegurándose de que cumplan con los criterios definidos.
    """

    # Tipos MIME permitidos y sus extensiones asociadas
    ALLOWED_MIME_TYPES: Dict[str, Set[str]] = {
        'application/pdf': {'.pdf'},
        'image/jpeg': {'.jpg', '.jpeg'},
    }

    # Tamaño máximo de archivo permitido (10 MB)
    MAX_FILE_SIZE: int = 10 * 1024 * 1024

    # Firmas de contenido malicioso conocidas
    MALICIOUS_SIGNATURES: Set[bytes] = {
        b'<%eval', b'<%execute', b'<script>',
        b'javascript:', b'vbscript:',
        b'.exe\x00', b'.dll\x00'
    }

    async def validate_file_headers(self, file: UploadFile) -> str:
        """
        Valida las cabeceras del archivo para determinar su tipo MIME real.

        Args:
            file (UploadFile): Archivo a validar.

        Returns:
            str: Tipo MIME real del archivo.

        Raises:
            HTTPException:
                - 400: Si el tipo MIME no está permitido.
                - 400: Si la extensión del archivo no corresponde al tipo MIME.
        """
        logger.info(f"{ANSI_GREEN}Validando tipo MIME y extensión de: {file.filename}{ANSI_RESET}")
        try:
            # Leer los primeros 8 KB para determinar el tipo
            first_chunk = await file.read(8192)
            await file.seek(0)  # Regresar el puntero del archivo al inicio

            # Detectar tipo MIME usando filetype
            kind = filetype.guess(first_chunk)
            if kind is None:
                logger.error(f"{ANSI_RED}No se pudo determinar el tipo de archivo: {file.filename}{ANSI_RESET}")
                raise HTTPException(
                    status_code=400,
                    detail="No se pudo determinar el tipo de archivo"
                )

            mime_type = kind.mime

            if mime_type not in self.ALLOWED_MIME_TYPES:
                logger.error(f"{ANSI_RED}Tipo de archivo no permitido: {mime_type} ({file.filename}){ANSI_RESET}")
                raise HTTPException(
                    status_code=400,
                    detail=f"Tipo de archivo no permitido. Se permiten: {', '.join(self.ALLOWED_MIME_TYPES.keys())}"
                )

            # Verificar la extensión del archivo
            file_ext = os.path.splitext(file.filename or "")[1].lower()
            if file_ext not in self.ALLOWED_MIME_TYPES[mime_type]:
                logger.error(f"{ANSI_RED}Extensión no válida '{file_ext}' para tipo {mime_type} en {file.filename}{ANSI_RESET}")
                raise HTTPException(
                    status_code=400,
                    detail=f"Extensión de archivo no válida para el tipo {mime_type}"
                )

            return mime_type
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"{ANSI_RED}Error al validar el archivo {file.filename}: {str(e)}{ANSI_RESET}")
            raise HTTPException(
                status_code=400,
                detail=f"Error al validar el archivo: {str(e)}"
            )

    async def scan_file_content(self, file: UploadFile) -> str:
        """
        Escanea el contenido del archivo en busca de contenido malicioso.

        Args:
            file (UploadFile): Archivo a escanear.

        Returns:
            str: Hash SHA-256 del archivo.

        Raises:
            HTTPException:
                - 400: Si el archivo excede el tamaño máximo permitido.
                - 400: Si se detecta contenido malicioso.
        """
        logger.info(f"{ANSI_GREEN}Escaneando contenido de archivo: {file.filename}{ANSI_RESET}")
        try:
            content = await file.read()
            await file.seek(0)  # Regresar el puntero del archivo al inicio

            # Verificar tamaño del archivo
            if len(content) > self.MAX_FILE_SIZE:
                logger.error(f"{ANSI_RED}Archivo {file.filename} excede tamaño máximo ({len(content)} bytes){ANSI_RESET}")
                raise HTTPException(
                    status_code=400,
                    detail=f"El archivo excede el tamaño máximo permitido de {self.MAX_FILE_SIZE / 1024 / 1024}MB"
                )

            # Buscar firmas maliciosas en el contenido
            for signature in self.MALICIOUS_SIGNATURES:
                if signature in content.lower():
                    logger.error(f"{ANSI_RED}Firma maliciosa detectada en {file.filename}: {signature}{ANSI_RESET}")
                    raise HTTPException(
                        status_code=400,
                        detail="Se detectó contenido potencialmente malicioso en el archivo"
                    )

            # Calcular y devolver el hash SHA-256 del contenido
            file_hash = hashlib.sha256(content).hexdigest()
            logger.info(f"{ANSI_GREEN}Archivo limpio. Hash SHA-256: {file_hash}{ANSI_RESET}")
            return file_hash
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"{ANSI_RED}Error al escanear el archivo {file.filename}: {str(e)}{ANSI_RESET}")
            raise HTTPException(
                status_code=400,
                detail=f"Error al escanear el archivo: {str(e)}"
            )

    async def validate_and_process_file(self, file: UploadFile) -> Optional[Dict[str, Union[str, int, None]]]:
        """
        Valida y procesa un archivo adjunto completamente.

        Este método valida el tipo MIME, escanea el contenido y genera un hash único
        para el archivo.

        Args:
            file (UploadFile): Archivo a procesar.

        Returns:
            Optional[Dict[str, Union[str, int, None]]]: Información del archivo procesado.

        Raises:
            HTTPException:
                - 400: Si el archivo no cumple con los criterios definidos.
        """
        if not file:
            logger.info(f"{ANSI_GREEN}No se recibió archivo para procesar.{ANSI_RESET}")
            return None

        # Validar cabeceras y tipo MIME
        mime_type = await self.validate_file_headers(file)

        # Escanear contenido y obtener hash
        file_hash = await self.scan_file_content(file)

        logger.info(f"{ANSI_GREEN}Archivo procesado exitosamente: {file.filename}{ANSI_RESET}")

        return {
            'filename': file.filename,
            'content_type': mime_type,
            'file_hash': file_hash,
            'size': file.size
        }
