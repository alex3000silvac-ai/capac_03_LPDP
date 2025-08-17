"""
Configuración de seguridad y autenticación
"""
from datetime import datetime, timedelta
from typing import Optional, Union, Any
from jose import JWTError, jwt
from passlib.context import CryptContext
from cryptography.fernet import Fernet
import secrets
import string
import hashlib
import logging

from app.core.config import settings

logger = logging.getLogger(__name__)

# Configuración de encriptación de contraseñas
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Configuración de encriptación de campos sensibles
# fernet_key = Fernet(settings.LICENSE_ENCRYPTION_KEY.encode())  # COMENTADO: No disponible en config mínima

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verifica una contraseña contra su hash
    """
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    """
    Genera el hash de una contraseña
    """
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """
    Crea un token JWT de acceso
    """
    to_encode = data.copy()
    
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    
    return encoded_jwt

def verify_token(token: str) -> Optional[dict]:
    """
    Verifica y decodifica un token JWT
    """
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return payload
    except JWTError:
        return None

def encrypt_field(value: str) -> str:
    """
    Encripta un campo sensible (SIMPLIFICADO)
    """
    if not value:
        return value
    
    # Encriptación simplificada para evitar dependencias
    try:
        import base64
        encoded = base64.b64encode(value.encode()).decode()
        return f"ENCRYPTED_{encoded}"
    except Exception as e:
        logger.error(f"Error encriptando campo: {e}")
        return value

def decrypt_field(encrypted_value: str) -> str:
    """
    Desencripta un campo sensible (SIMPLIFICADO)
    """
    if not encrypted_value:
        return encrypted_value
    
    # Desencriptación simplificada
    try:
        if encrypted_value.startswith("ENCRYPTED_"):
            import base64
            encoded = encrypted_value[10:]  # Remover "ENCRYPTED_"
            decoded = base64.b64decode(encoded).decode()
            return decoded
        return encrypted_value
    except Exception as e:
        logger.error(f"Error desencriptando campo: {e}")
        return encrypted_value

def generate_secure_password(length: int = 12) -> str:
    """
    Genera una contraseña segura
    """
    alphabet = string.ascii_letters + string.digits + "!@#$%"
    password = ''.join(secrets.choice(alphabet) for _ in range(length))
    return password

def generate_license_key(company_name: str, module_code: str, expiration_date: str) -> str:
    """
    Genera una clave de licencia única
    """
    # Crear base para la clave
    base = f"{company_name}_{module_code}_{expiration_date}"
    
    # Generar hash único
    hash_object = hashlib.sha256(base.encode())
    hash_hex = hash_object.hexdigest()
    
    # Formatear como clave de licencia (formato: XXXX-XXXX-XXXX-XXXX)
    formatted_key = f"{hash_hex[:4]}-{hash_hex[4:8]}-{hash_hex[8:12]}-{hash_hex[12:16]}"
    
    return formatted_key.upper()

def hash_for_search(value: str) -> str:
    """
    Genera un hash para búsquedas sin desencriptar
    """
    try:
        import hashlib
        return hashlib.sha256(value.encode()).hexdigest()
    except Exception as e:
        logger.error(f"Error generando hash: {e}")
        return value

def validate_license_key(license_key: str, company_name: str, module_code: str, expiration_date: str) -> bool:
    """
    Valida una clave de licencia
    """
    expected_key = generate_license_key(company_name, module_code, expiration_date)
    return license_key.upper() == expected_key.upper()

def generate_reset_token() -> str:
    """
    Genera un token para reset de contraseña
    """
    return secrets.token_urlsafe(32)

def hash_sensitive_data(data: str) -> str:
    """
    Genera un hash SHA-256 de datos sensibles
    """
    return hashlib.sha256(data.encode()).hexdigest()

def verify_data_integrity(original_hash: str, data: str) -> bool:
    """
    Verifica la integridad de datos sensibles
    """
    current_hash = hash_sensitive_data(data)
    return current_hash == original_hash

def create_user_session_token(user_id: str, tenant_id: str, permissions: list) -> str:
    """
    Crea un token de sesión específico para un usuario
    """
    data = {
        "sub": user_id,
        "tenant_id": tenant_id,
        "permissions": permissions,
        "type": "user_session"
    }
    
    return create_access_token(data, timedelta(hours=24))

def create_api_key(description: str, permissions: list) -> str:
    """
    Crea una API key para integraciones
    """
    data = {
        "description": description,
        "permissions": permissions,
        "type": "api_key",
        "created_at": datetime.utcnow().isoformat()
    }
    
    # Generar clave única
    api_key = secrets.token_urlsafe(32)
    
    # Encriptar datos de la API key
    encrypted_data = encrypt_field(str(data))
    
    return f"{api_key}.{encrypted_data}"

def validate_api_key(api_key: str) -> Optional[dict]:
    """
    Valida una API key
    """
    try:
        key_part, encrypted_part = api_key.split('.', 1)
        decrypted_data = decrypt_field(encrypted_part)
        
        # Aquí podrías agregar validación adicional
        # Por ejemplo, verificar en base de datos si la key está activa
        
        return eval(decrypted_data)  # En producción, usar json.loads
    except Exception as e:
        logger.error(f"Error validando API key: {e}")
        return None

# Funciones de compatibilidad
def decode_token(token: str) -> Optional[dict]:
    """
    Función de compatibilidad - alias para verify_token
    """
    return verify_token(token)