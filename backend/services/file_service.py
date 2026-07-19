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
import unicodedata
from typing import Dict, Optional, Set, Union
from fastapi import UploadFile, HTTPException
import logging

# El handler y el formato se configuran de forma centralizada al arrancar la API.
logger = logging.getLogger(__name__)


PDF_SIGNATURE = b"%PDF-"
PDF_HEADER_SEARCH_BYTES = 1024
PDF_WHITESPACE_BYTES = frozenset({0x00, 0x09, 0x0A, 0x0C, 0x0D, 0x20})
PDF_LINE_END_BYTES = frozenset({0x0A, 0x0D})


def has_valid_pdf_signature(header: bytes) -> bool:
    """Comprueba `%PDF-` tras espacios PDF o comentarios completos, sin falsos prefijos."""
    marker_index = 0

    while True:
        marker_index = header.find(PDF_SIGNATURE, marker_index)
        if marker_index < 0:
            return False

        in_comment = False
        line_contains_only_whitespace = True
        prefix_is_valid = True

        for byte in header[:marker_index]:
            if in_comment:
                if byte in PDF_LINE_END_BYTES:
                    in_comment = False
                    line_contains_only_whitespace = True
                continue

            if byte in PDF_LINE_END_BYTES:
                line_contains_only_whitespace = True
                continue

            if byte == ord("%") and line_contains_only_whitespace:
                in_comment = True
                continue

            if byte in PDF_WHITESPACE_BYTES:
                continue

            prefix_is_valid = False
            break

        if prefix_is_valid and not in_comment:
            return True

        marker_index += 1



def has_safe_attachment_filename(filename: Optional[str]) -> bool:
    """Rechaza nombres engañosos antes de validarlos o mostrarlos en el correo."""
    if not filename or filename.strip() != filename or "/" in filename or "\\" in filename:
        return False
    return not any(
        unicodedata.category(character).startswith("C")
        or unicodedata.category(character) in {"Zl", "Zp"}
        for character in filename
    )

def file_log_context(file: UploadFile) -> str:
    """Describe el adjunto para logs sin registrar su nombre original ni controles."""
    extension = os.path.splitext(file.filename or "")[1].lower()
    if not extension:
        return "extensión=sin extensión"

    # Solo las extensiones ASCII breves son útiles para diagnóstico. Cualquier salto
    # de línea, control o texto añadido se resume para impedir inyección de líneas de log.
    is_safe_extension = (
        len(extension) <= 16
        and extension.startswith(".")
        and extension[1:].isalnum()
        and extension.isascii()
    )
    return f"extensión={extension if is_safe_extension else 'no válida'}"


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

    # Tamaño de cada bloque leído durante el escaneo para no cargar el adjunto completo en memoria.
    SCAN_CHUNK_SIZE: int = 64 * 1024

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
        logger.info("Validando tipo MIME y extensión | %s", file_log_context(file))
        try:
            if not has_safe_attachment_filename(file.filename):
                raise HTTPException(status_code=400, detail="Nombre de archivo no válido")

            # Leer los primeros 8 KB para determinar el tipo
            first_chunk = await file.read(8192)
            await file.seek(0)  # Regresar el puntero del archivo al inicio

            # Detectar tipo MIME usando filetype. Algunos PDF válidos incluyen unos pocos
            # bytes de comentario antes de `%PDF-`; se aplica el mismo límite de 1024 bytes
            # que usa el frontend, pero solo cuando ninguna otra firma ha sido reconocida.
            kind = filetype.guess(first_chunk)
            if kind is not None:
                mime_type = kind.mime
            else:
                header = first_chunk[:PDF_HEADER_SEARCH_BYTES]
                if has_valid_pdf_signature(header):
                    mime_type = "application/pdf"
                else:
                    logger.error("No se pudo determinar el tipo de archivo | %s", file_log_context(file))
                    raise HTTPException(
                        status_code=400,
                        detail="No se pudo determinar el tipo de archivo"
                    )
            if mime_type not in self.ALLOWED_MIME_TYPES:
                logger.error("Tipo de archivo no permitido: %s | %s", mime_type, file_log_context(file))
                raise HTTPException(
                    status_code=400,
                    detail=f"Tipo de archivo no permitido. Se permiten: {', '.join(self.ALLOWED_MIME_TYPES.keys())}"
                )

            # Verificar la extensión del archivo
            file_ext = os.path.splitext(file.filename or "")[1].lower()
            if file_ext not in self.ALLOWED_MIME_TYPES[mime_type]:
                logger.error("Extensión no válida para tipo %s | %s", mime_type, file_log_context(file))
                raise HTTPException(
                    status_code=400,
                    detail=f"Extensión de archivo no válida para el tipo {mime_type}"
                )

            return mime_type
        except HTTPException:
            raise
        except Exception:
            logger.exception(
                f"Error inesperado al validar el archivo | {file_log_context(file)}"
            )
            raise HTTPException(
                status_code=500,
                detail="Error interno al validar el archivo"
            ) from None

    async def scan_file_content(self, file: UploadFile) -> str:
        """
        Escanea el contenido del archivo en busca de contenido malicioso.

        Args:
            file (UploadFile): Archivo a escanear.

        Returns:
            str: Hash SHA-256 del archivo.

        Raises:
            HTTPException:
                - 413: Si el archivo excede el tamaño máximo permitido.
                - 400: Si se detecta contenido malicioso.
        """
        logger.info("Escaneando contenido de archivo | %s", file_log_context(file))
        try:
            # Si Starlette conoce el tamaño, rechaza el adjunto antes de leerlo por completo.
            if file.size is not None and file.size > self.MAX_FILE_SIZE:
                logger.error(
                    "Archivo excede tamaño máximo (%s bytes) | %s",
                    file.size,
                    file_log_context(file),
                )
                raise HTTPException(
                    status_code=413,
                    detail=f"El archivo excede el tamaño máximo permitido de {self.MAX_FILE_SIZE / 1024 / 1024}MB"
                )

            total_size = 0
            file_hash = hashlib.sha256()
            max_signature_length = max((len(signature) for signature in self.MALICIOUS_SIGNATURES), default=1)
            signature_overlap = b""

            while True:
                chunk = await file.read(self.SCAN_CHUNK_SIZE)
                if not chunk:
                    break

                total_size += len(chunk)
                if total_size > self.MAX_FILE_SIZE:
                    logger.error(
                        "Archivo excede tamaño máximo durante la lectura (%s bytes) | %s",
                        total_size,
                        file_log_context(file),
                    )
                    raise HTTPException(
                        status_code=413,
                        detail=f"El archivo excede el tamaño máximo permitido de {self.MAX_FILE_SIZE / 1024 / 1024}MB"
                    )

                file_hash.update(chunk)

                # Conserva un pequeño solapamiento para detectar firmas partidas entre dos bloques.
                content_to_scan = signature_overlap + chunk.lower()
                for signature in self.MALICIOUS_SIGNATURES:
                    if signature in content_to_scan:
                        logger.error(
                            "Firma maliciosa detectada: %s | %s",
                            signature,
                            file_log_context(file),
                        )
                        raise HTTPException(
                            status_code=400,
                            detail="Se detectó contenido potencialmente malicioso en el archivo"
                        )

                overlap_size = max_signature_length - 1
                signature_overlap = content_to_scan[-overlap_size:] if overlap_size > 0 else b""

            # El servicio de correo necesita volver a leer el adjunto desde el principio.
            await file.seek(0)

            # Calcular y devolver el hash SHA-256 sin escribirlo en logs. Un hash completo
            # permite correlacionar adjuntos entre solicitudes y actúa como identificador
            # persistente del contenido, aunque no revele directamente el archivo.
            file_hash_value = file_hash.hexdigest()
            logger.info(
                "Archivo limpio | bytes=%s | %s",
                total_size,
                file_log_context(file),
            )
            return file_hash_value
        except HTTPException:
            raise
        except Exception:
            logger.exception(
                f"Error inesperado al escanear el archivo | {file_log_context(file)}"
            )
            raise HTTPException(
                status_code=500,
                detail="Error interno al escanear el archivo"
            ) from None

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
            logger.info("No se recibió archivo para procesar.")
            return None

        # Validar cabeceras y tipo MIME
        mime_type = await self.validate_file_headers(file)

        # Escanear contenido y obtener hash
        file_hash = await self.scan_file_content(file)

        logger.info("Archivo procesado exitosamente | %s", file_log_context(file))

        return {
            'filename': file.filename,
            'content_type': mime_type,
            'file_hash': file_hash,
            'size': file.size
        }
