# backend/services/file_service.py

"""
services/file_service.py

Servicio para manejar la validación y procesamiento de archivos.
"""

import filetype
import os
import hashlib
from typing import Dict, Optional, Set
from fastapi import UploadFile, HTTPException

class FileService:
    # Tipos MIME permitidos y sus extensiones
    ALLOWED_MIME_TYPES: Dict[str, Set[str]] = {
        'application/pdf': {'.pdf'},
        'image/jpeg': {'.jpg', '.jpeg'},
    }

    # Tamaño máximo de archivo (10MB)
    MAX_FILE_SIZE: int = 10 * 1024 * 1024

    # Firmas de bytes maliciosos conocidos
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
            HTTPException: Si el archivo no es válido.
        """
        try:
            # Leer primeros 8KB para análisis
            first_chunk = await file.read(8192)
            await file.seek(0)

            # Detectar tipo usando filetype
            kind = filetype.guess(first_chunk)
            if kind is None:
                raise HTTPException(
                    status_code=400,
                    detail="No se pudo determinar el tipo de archivo"
                )

            mime_type = kind.mime

            if mime_type not in self.ALLOWED_MIME_TYPES:
                raise HTTPException(
                    status_code=400,
                    detail=f"Tipo de archivo no permitido. Se permiten: {', '.join(self.ALLOWED_MIME_TYPES.keys())}"
                )

            # Verificar extensión
            file_ext = os.path.splitext(file.filename)[1].lower()
            if file_ext not in self.ALLOWED_MIME_TYPES[mime_type]:
                raise HTTPException(
                    status_code=400,
                    detail=f"Extensión de archivo no válida para el tipo {mime_type}"
                )

            return mime_type
        except HTTPException:
            raise
        except Exception as e:
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
            HTTPException: Si se encuentra contenido malicioso.
        """
        try:
            content = await file.read()
            await file.seek(0)

            # Verificar tamaño
            if len(content) > self.MAX_FILE_SIZE:
                raise HTTPException(
                    status_code=400,
                    detail=f"El archivo excede el tamaño máximo permitido de {self.MAX_FILE_SIZE/1024/1024}MB"
                )

            # Buscar firmas maliciosas
            for signature in self.MALICIOUS_SIGNATURES:
                if signature in content.lower():
                    raise HTTPException(
                        status_code=400,
                        detail="Se detectó contenido potencialmente malicioso en el archivo"
                    )

            # Calcular hash para registro
            return hashlib.sha256(content).hexdigest()
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(
                status_code=400,
                detail=f"Error al escanear el archivo: {str(e)}"
            )

    async def validate_and_process_file(self, file: UploadFile) -> Optional[Dict[str, str]]:
        """
        Valida y procesa un archivo adjunto completamente.
        
        Args:
            file (UploadFile): Archivo a procesar.
            
        Returns:
            Optional[Dict[str, str]]: Información del archivo procesado.
            
        Raises:
            HTTPException: Si el archivo no cumple los criterios.
        """
        if not file:
            return None

        # Validar cabeceras y tipo MIME
        mime_type = await self.validate_file_headers(file)

        # Escanear contenido y obtener hash
        file_hash = await self.scan_file_content(file)

        return {
            'filename': file.filename,
            'content_type': mime_type,
            'file_hash': file_hash,
            'size': file.size
        }
        