"""Resolución segura de la IP real cuando FastAPI está detrás de proxies confiables."""

import logging
from ipaddress import IPv6Address, ip_address
from typing import Iterable

from fastapi import Request


_FORWARDING_HEADER_NAMES = (b"x-forwarded-for", b"x-real-ip")


def _raw_header_values(request: Request, name: bytes) -> list[bytes]:
    """Obtiene todas las apariciones reales de una cabecera sin fusionarlas."""
    return [
        value
        for key, value in request.scope.get("headers", [])
        if key.lower() == name
    ]


def has_ambiguous_forwarding_headers(
    request: Request,
    logger: logging.Logger | None = None,
) -> bool:
    """Detecta cabeceras de proxy duplicadas que distintos servidores podrían fusionar distinto."""
    duplicated_names = [
        name.decode("ascii")
        for name in _FORWARDING_HEADER_NAMES
        if len(_raw_header_values(request, name)) > 1
    ]
    if not duplicated_names:
        return False

    if logger is not None:
        logger.warning(
            "Cabeceras de proxy duplicadas ignoradas: %s",
            ", ".join(duplicated_names),
        )
    return True


def _single_forwarding_header(request: Request, name: bytes) -> str:
    """Devuelve una cabecera de proxy solo cuando aparece exactamente una vez."""
    values = _raw_header_values(request, name)
    if len(values) != 1:
        return ""
    return values[0].decode("latin-1").strip()


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

    # Las cabeceras repetidas son ambiguas: proxies y servidores ASGI pueden conservarlas,
    # concatenarlas o escoger una de ellas. Para el rate limit se falla de forma segura
    # usando el peer directo; los endpoints exclusivamente locales las rechazan aparte.
    if has_ambiguous_forwarding_headers(request, logger):
        return direct_host

    forwarded_for = _single_forwarding_header(request, b"x-forwarded-for")
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

    real_ip = _single_forwarding_header(request, b"x-real-ip")
    normalized_real_ip = normalize_forwarded_ip(real_ip) if real_ip else None
    if normalized_real_ip and normalized_real_ip not in trusted_hosts:
        return normalized_real_ip

    return direct_host
