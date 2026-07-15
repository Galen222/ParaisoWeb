"""Resolución segura de la IP real cuando FastAPI está detrás de proxies confiables."""

import logging
from ipaddress import IPv6Address, ip_address
from typing import Iterable

from fastapi import Request


def normalize_forwarded_ip(value: str) -> str | None:
    """Normaliza una IP y convierte una IPv4 mapeada en IPv6 a su forma IPv4."""
    try:
        parsed = ip_address(value)
    except ValueError:
        return None

    if isinstance(parsed, IPv6Address) and parsed.ipv4_mapped is not None:
        return str(parsed.ipv4_mapped)
    return str(parsed)


def normalize_host(value: str) -> str:
    """Normaliza direcciones IP sin romper hosts especiales usados en pruebas."""
    stripped = value.strip()
    return normalize_forwarded_ip(stripped) or stripped


def resolve_client_host(
    request: Request,
    trusted_proxy_ips: Iterable[str],
    logger: logging.Logger | None = None,
) -> str:
    """Obtiene el cliente real y solo confía en cabeceras de proxies autorizados."""
    trusted_hosts = {
        normalize_host(value)
        for value in trusted_proxy_ips
        if value.strip()
    }
    direct_host = normalize_host(request.client.host if request.client else "unknown")
    if direct_host not in trusted_hosts:
        return direct_host

    forwarded_for = request.headers.get("x-forwarded-for", "")
    forwarded_chain = [value.strip() for value in forwarded_for.split(",") if value.strip()]

    # Recorre desde el proxy más cercano hacia el cliente para impedir que una IP falsa
    # antepuesta por el visitante sustituya al salto real añadido por Nginx/Plesk.
    for candidate in reversed(forwarded_chain):
        normalized_candidate = normalize_forwarded_ip(candidate)
        if normalized_candidate is None:
            if logger is not None:
                logger.warning(
                    "Entrada inválida de X-Forwarded-For ignorada desde proxy confiable"
                )
            continue

        if normalized_candidate not in trusted_hosts:
            return normalized_candidate

    real_ip = request.headers.get("x-real-ip", "").strip()
    normalized_real_ip = normalize_forwarded_ip(real_ip) if real_ip else None
    if normalized_real_ip and normalized_real_ip not in trusted_hosts:
        return normalized_real_ip

    return direct_host
