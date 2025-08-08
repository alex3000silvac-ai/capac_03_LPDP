"""
Funciones de seguridad y autenticación
"""
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from jose import jwt, JWTError
from passlib.context import CryptContext
from cryptography.fernet import Fernet
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
import base64
import secrets
import hashlib
from .config import settings

# Contexto para hashing de contraseñas
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Encriptación para datos sensibles
def get_encryption_key(key_id: Optional[str] = None) -> bytes:
    """Obtiene o genera una clave de encriptación"""
    # En producción, esto debería venir de un servicio de gestión de claves
    if key_id:
        # Derivar clave desde el key_id y la clave maestra
        kdf = PBKDF2HMAC(
            algorithm=hashes.SHA256(),
            length=32,
            salt=key_id.encode(),
            iterations=100000,
        )
        key = base64.urlsafe_b64encode(
            kdf.derive(settings.LICENSE_ENCRYPTION_KEY.encode())
        )
        return key
    else:
        # Usar clave por defecto
        return base64.urlsafe_b64encode(settings.LICENSE_ENCRYPTION_KEY.encode()[:32])


def encrypt_field(plaintext: str, key_id: Optional[str] = None) -> str:
    """Encripta un campo usando Fernet (AES-128)"""
    if not plaintext:
        return plaintext
    
    key = get_encryption_key(key_id)
    f = Fernet(key)
    return f.encrypt(plaintext.encode()).decode()


def decrypt_field(ciphertext: str, key_id: Optional[str] = None) -> str:
    """Desencripta un campo"""
    if not ciphertext:
        return ciphertext
    
    try:
        key = get_encryption_key(key_id)
        f = Fernet(key)
        return f.decrypt(ciphertext.encode()).decode()
    except Exception:
        # Si falla la desencriptación, devolver vacío por seguridad
        return ""


def hash_for_search(value: str) -> str:
    """Genera un hash SHA-256 para búsquedas sin desencriptar"""
    if not value:
        return ""
    return hashlib.sha256(value.encode()).hexdigest()


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifica una contraseña contra su hash"""
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """Genera hash de contraseña"""
    return pwd_context.hash(password)


def create_access_token(
    data: Dict[str, Any],
    expires_delta: Optional[timedelta] = None
) -> str:
    """Crea un token JWT de acceso"""
    to_encode = data.copy()
    
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(
            minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
        )
    
    to_encode.update({"exp": expire, "type": "access"})
    encoded_jwt = jwt.encode(
        to_encode, 
        settings.SECRET_KEY, 
        algorithm=settings.ALGORITHM
    )
    return encoded_jwt


def create_refresh_token(
    data: Dict[str, Any],
    expires_delta: Optional[timedelta] = None
) -> str:
    """Crea un token JWT de refresco"""
    to_encode = data.copy()
    
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(
            days=settings.REFRESH_TOKEN_EXPIRE_DAYS
        )
    
    to_encode.update({"exp": expire, "type": "refresh"})
    encoded_jwt = jwt.encode(
        to_encode, 
        settings.SECRET_KEY, 
        algorithm=settings.ALGORITHM
    )
    return encoded_jwt


def decode_token(token: str) -> Optional[Dict[str, Any]]:
    """Decodifica y valida un token JWT"""
    try:
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM]
        )
        return payload
    except JWTError:
        return None


def generate_password_reset_token() -> str:
    """Genera un token seguro para reset de contraseña"""
    return secrets.token_urlsafe(32)


def generate_email_verification_token() -> str:
    """Genera un token para verificación de email"""
    return secrets.token_urlsafe(32)


def generate_mfa_secret() -> str:
    """Genera un secreto para autenticación de dos factores"""
    return secrets.token_hex(20)


def verify_mfa_token(secret: str, token: str) -> bool:
    """Verifica un token TOTP de MFA"""
    # TODO: Implementar verificación TOTP
    # Por ahora retorna True para desarrollo
    return True


def generate_api_key() -> str:
    """Genera una API key segura"""
    return f"jd_{secrets.token_urlsafe(32)}"


def hash_api_key(api_key: str) -> str:
    """Hashea una API key para almacenamiento"""
    return hashlib.sha256(api_key.encode()).hexdigest()


def generate_license_key(
    tenant_id: str,
    modules: list,
    expiration_date: datetime
) -> str:
    """
    Genera una clave de licencia encriptada
    
    Formato: TENANT_MODULES_EXPIRATION_SIGNATURE
    """
    # Crear payload
    payload = {
        "tenant_id": tenant_id,
        "modules": sorted(modules),  # Ordenar para consistencia
        "exp": expiration_date.isoformat(),
        "iat": datetime.utcnow().isoformat()
    }
    
    # Convertir a string y encriptar
    payload_str = jwt.encode(
        payload,
        settings.LICENSE_ENCRYPTION_KEY,
        algorithm="HS256"
    )
    
    # Formato legible: XXXX-XXXX-XXXX-XXXX
    # Usar base32 para caracteres más amigables
    encoded = base64.b32encode(payload_str.encode()).decode()
    
    # Formatear en grupos
    formatted = "-".join([
        encoded[i:i+4] for i in range(0, min(len(encoded), 16), 4)
    ])
    
    return f"JD-{formatted[:19]}"  # Prefijo + 19 chars


def validate_license_key(license_key: str) -> Optional[Dict[str, Any]]:
    """
    Valida y decodifica una clave de licencia
    
    Retorna None si es inválida o un dict con la información
    """
    try:
        # Quitar prefijo y guiones
        if not license_key.startswith("JD-"):
            return None
        
        key_part = license_key[3:].replace("-", "")
        
        # Decodificar
        # Completar padding si es necesario
        missing_padding = len(key_part) % 8
        if missing_padding:
            key_part += '=' * (8 - missing_padding)
        
        decoded = base64.b32decode(key_part).decode()
        
        # Verificar JWT
        payload = jwt.decode(
            decoded,
            settings.LICENSE_ENCRYPTION_KEY,
            algorithms=["HS256"]
        )
        
        # Verificar expiración
        exp_date = datetime.fromisoformat(payload["exp"])
        if exp_date < datetime.utcnow():
            return None
        
        return payload
        
    except Exception:
        return None


def generate_audit_hash(
    event_data: Dict[str, Any],
    previous_hash: Optional[str] = None
) -> str:
    """
    Genera hash para integridad de logs de auditoría
    
    Incluye el hash anterior para crear una cadena tipo blockchain
    """
    # Ordenar claves para consistencia
    ordered_data = dict(sorted(event_data.items()))
    
    # Convertir a string
    data_str = str(ordered_data)
    
    # Incluir hash anterior si existe
    if previous_hash:
        data_str = f"{previous_hash}:{data_str}"
    
    # Generar SHA-256
    return hashlib.sha256(data_str.encode()).hexdigest()


def mask_sensitive_data(value: str, mask_type: str = "email") -> str:
    """
    Enmascara datos sensibles para logs y display
    """
    if not value:
        return ""
    
    if mask_type == "email":
        parts = value.split("@")
        if len(parts) == 2:
            name = parts[0]
            if len(name) > 2:
                masked = name[0] + "*" * (len(name) - 2) + name[-1]
            else:
                masked = "*" * len(name)
            return f"{masked}@{parts[1]}"
    
    elif mask_type == "rut":
        # Formato: 12.345.678-9
        if len(value) >= 4:
            return f"***.***.**{value[-4:]}"
    
    elif mask_type == "phone":
        # Mostrar solo últimos 4 dígitos
        if len(value) >= 4:
            return "*" * (len(value) - 4) + value[-4:]
    
    # Por defecto, mostrar solo primer y último carácter
    if len(value) > 2:
        return value[0] + "*" * (len(value) - 2) + value[-1]
    
    return "*" * len(value)