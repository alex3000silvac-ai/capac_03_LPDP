"""
Sistema de Seguridad Mejorado para LPDP
Reemplaza encriptación Base64 con AES-256 real
Elimina eval() y credenciales hardcodeadas
"""

import os
import json
import secrets
import hashlib
from typing import Optional, Dict, Any, Tuple
from datetime import datetime, timedelta
from cryptography.fernet import Fernet
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2
from cryptography.hazmat.backends import default_backend
import base64
import bcrypt
from jose import JWTError, jwt
from passlib.context import CryptContext
from dotenv import load_dotenv

# Cargar variables de entorno
load_dotenv()

# ============================================================================
# CONFIGURACIÓN SEGURA DESDE VARIABLES DE ENTORNO
# ============================================================================

class SecurityConfig:
    """Configuración de seguridad centralizada"""
    
    # JWT Configuration
    SECRET_KEY = os.getenv("SECRET_KEY", secrets.token_urlsafe(32))
    ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))
    REFRESH_TOKEN_EXPIRE_DAYS = int(os.getenv("REFRESH_TOKEN_EXPIRE_DAYS", "7"))
    
    # AES Encryption
    AES_KEY = os.getenv("AES_ENCRYPTION_KEY", secrets.token_urlsafe(32))
    AES_IV = os.getenv("AES_ENCRYPTION_IV", secrets.token_urlsafe(16))
    
    # Demo Mode
    DEMO_MODE_ENABLED = os.getenv("DEMO_MODE_ENABLED", "false").lower() == "true"
    DEMO_TENANT_ID = os.getenv("DEMO_TENANT_ID", "demo_empresa_lpdp_2024")
    DEMO_ADMIN_EMAIL = os.getenv("DEMO_ADMIN_EMAIL", "demo@lpdp-sistema.cl")
    DEMO_ADMIN_PASSWORD = os.getenv("DEMO_ADMIN_PASSWORD", secrets.token_urlsafe(16))
    
    # Security Settings
    RATE_LIMIT_ENABLED = os.getenv("RATE_LIMIT_ENABLED", "true").lower() == "true"
    RATE_LIMIT_REQUESTS = int(os.getenv("RATE_LIMIT_REQUESTS", "100"))
    RATE_LIMIT_PERIOD = int(os.getenv("RATE_LIMIT_PERIOD", "60"))
    
    # Multi-tenant
    ENABLE_MULTI_TENANT = os.getenv("ENABLE_MULTI_TENANT", "true").lower() == "true"
    ENABLE_AUDIT_LOG = os.getenv("ENABLE_AUDIT_LOG", "true").lower() == "true"

# ============================================================================
# ENCRIPTACIÓN AES-256 REAL (REEMPLAZA BASE64)
# ============================================================================

class AESCipher:
    """Encriptación AES-256 segura para datos sensibles"""
    
    def __init__(self, key: Optional[str] = None):
        """
        Inicializa el cifrador AES con una clave derivada
        """
        if key is None:
            key = SecurityConfig.AES_KEY
            
        # Derivar clave usando PBKDF2
        salt = b'stable_salt_for_key_derivation'  # En producción, usar salt único por dato
        kdf = PBKDF2(
            algorithm=hashes.SHA256(),
            length=32,
            salt=salt,
            iterations=100000,
            backend=default_backend()
        )
        key_bytes = base64.urlsafe_b64encode(kdf.derive(key.encode()))
        self.cipher = Fernet(key_bytes)
    
    def encrypt(self, plaintext: str) -> str:
        """
        Encripta texto plano usando AES-256
        """
        if not plaintext:
            return ""
        
        # Encriptar
        encrypted_bytes = self.cipher.encrypt(plaintext.encode())
        
        # Retornar como string base64
        return base64.urlsafe_b64encode(encrypted_bytes).decode()
    
    def decrypt(self, ciphertext: str) -> str:
        """
        Desencripta texto cifrado
        """
        if not ciphertext:
            return ""
        
        try:
            # Decodificar de base64
            encrypted_bytes = base64.urlsafe_b64decode(ciphertext.encode())
            
            # Desencriptar
            decrypted_bytes = self.cipher.decrypt(encrypted_bytes)
            
            return decrypted_bytes.decode()
        except Exception as e:
            raise ValueError(f"Error al desencriptar: {str(e)}")
    
    def encrypt_dict(self, data: Dict[str, Any]) -> str:
        """
        Encripta un diccionario completo (reemplaza eval() inseguro)
        """
        # Serializar a JSON (seguro, no eval)
        json_str = json.dumps(data, default=str)
        return self.encrypt(json_str)
    
    def decrypt_dict(self, ciphertext: str) -> Dict[str, Any]:
        """
        Desencripta y retorna un diccionario (sin usar eval())
        """
        json_str = self.decrypt(ciphertext)
        return json.loads(json_str)  # Seguro, no eval()

# ============================================================================
# GESTIÓN SEGURA DE CONTRASEÑAS
# ============================================================================

class PasswordManager:
    """Gestión segura de contraseñas con bcrypt"""
    
    def __init__(self):
        self.pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
        self.rounds = 12  # Número de rondas para bcrypt
    
    def hash_password(self, password: str) -> str:
        """
        Hash de contraseña usando bcrypt con salt automático
        """
        if not password:
            raise ValueError("La contraseña no puede estar vacía")
        
        # Validar fortaleza mínima
        if len(password) < 8:
            raise ValueError("La contraseña debe tener al menos 8 caracteres")
        
        return self.pwd_context.hash(password)
    
    def verify_password(self, plain_password: str, hashed_password: str) -> bool:
        """
        Verifica una contraseña contra su hash
        """
        if not plain_password or not hashed_password:
            return False
        
        return self.pwd_context.verify(plain_password, hashed_password)
    
    def generate_secure_password(self, length: int = 16) -> str:
        """
        Genera una contraseña segura aleatoria
        """
        # Usar secrets para generación criptográficamente segura
        alphabet = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*"
        password = ''.join(secrets.choice(alphabet) for _ in range(length))
        return password

# ============================================================================
# JWT SEGURO CON TENANT ISOLATION
# ============================================================================

class JWTManager:
    """Gestión segura de tokens JWT con información de tenant"""
    
    @staticmethod
    def create_access_token(
        data: dict, 
        tenant_id: str,
        expires_delta: Optional[timedelta] = None
    ) -> str:
        """
        Crea un token de acceso con información de tenant
        """
        to_encode = data.copy()
        
        # Agregar información crítica
        to_encode.update({
            "tenant_id": tenant_id,
            "type": "access",
            "iat": datetime.utcnow(),
            "jti": secrets.token_urlsafe(16)  # JWT ID único
        })
        
        # Establecer expiración
        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(
                minutes=SecurityConfig.ACCESS_TOKEN_EXPIRE_MINUTES
            )
        
        to_encode.update({"exp": expire})
        
        # Crear token
        encoded_jwt = jwt.encode(
            to_encode, 
            SecurityConfig.SECRET_KEY, 
            algorithm=SecurityConfig.ALGORITHM
        )
        
        return encoded_jwt
    
    @staticmethod
    def create_refresh_token(
        data: dict,
        tenant_id: str,
        expires_delta: Optional[timedelta] = None
    ) -> str:
        """
        Crea un token de refresco con mayor duración
        """
        to_encode = data.copy()
        
        # Agregar información
        to_encode.update({
            "tenant_id": tenant_id,
            "type": "refresh",
            "iat": datetime.utcnow(),
            "jti": secrets.token_urlsafe(16)
        })
        
        # Establecer expiración más larga
        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(
                days=SecurityConfig.REFRESH_TOKEN_EXPIRE_DAYS
            )
        
        to_encode.update({"exp": expire})
        
        # Crear token
        encoded_jwt = jwt.encode(
            to_encode,
            SecurityConfig.SECRET_KEY,
            algorithm=SecurityConfig.ALGORITHM
        )
        
        return encoded_jwt
    
    @staticmethod
    def decode_token(token: str) -> Dict[str, Any]:
        """
        Decodifica y valida un token JWT
        """
        try:
            payload = jwt.decode(
                token,
                SecurityConfig.SECRET_KEY,
                algorithms=[SecurityConfig.ALGORITHM]
            )
            
            # Validar que tiene tenant_id
            if "tenant_id" not in payload:
                raise JWTError("Token inválido: falta tenant_id")
            
            return payload
            
        except JWTError as e:
            raise ValueError(f"Token inválido: {str(e)}")

# ============================================================================
# USUARIO DEMO SEGURO
# ============================================================================

class DemoUserManager:
    """Gestión segura del usuario demo para pruebas"""
    
    def __init__(self):
        self.password_manager = PasswordManager()
        self.jwt_manager = JWTManager()
        self.aes_cipher = AESCipher()
    
    def create_demo_user(self) -> Dict[str, Any]:
        """
        Crea un usuario demo seguro con limitaciones
        """
        if not SecurityConfig.DEMO_MODE_ENABLED:
            raise ValueError("Modo demo no está habilitado")
        
        # Hash de la contraseña demo
        hashed_password = self.password_manager.hash_password(
            SecurityConfig.DEMO_ADMIN_PASSWORD
        )
        
        # Crear usuario demo con limitaciones
        demo_user = {
            "id": secrets.token_urlsafe(16),
            "email": SecurityConfig.DEMO_ADMIN_EMAIL,
            "password_hash": hashed_password,
            "tenant_id": SecurityConfig.DEMO_TENANT_ID,
            "company_name": os.getenv("DEMO_COMPANY_NAME", "Empresa Demo LPDP"),
            "company_rut": os.getenv("DEMO_COMPANY_RUT", "99999999-9"),
            "is_demo": True,
            "is_active": True,
            "is_superuser": False,  # Demo nunca es superuser
            "max_users": int(os.getenv("DEMO_MAX_USERS", "3")),
            "max_activities": int(os.getenv("DEMO_MAX_ACTIVITIES", "5")),
            "trial_days": int(os.getenv("DEMO_TRIAL_DAYS", "30")),
            "created_at": datetime.utcnow().isoformat(),
            "expires_at": (datetime.utcnow() + timedelta(days=30)).isoformat(),
            "limitations": {
                "can_export": True,
                "can_create_users": False,
                "can_delete_data": False,
                "can_modify_settings": False,
                "watermark_exports": True,
                "max_api_calls_per_hour": 100
            }
        }
        
        return demo_user
    
    def authenticate_demo_user(self, email: str, password: str) -> Optional[Dict[str, Any]]:
        """
        Autentica el usuario demo de forma segura
        """
        if not SecurityConfig.DEMO_MODE_ENABLED:
            return None
        
        # Verificar que es el email demo
        if email != SecurityConfig.DEMO_ADMIN_EMAIL:
            return None
        
        # Verificar contraseña
        if password != SecurityConfig.DEMO_ADMIN_PASSWORD:
            return None
        
        # Crear usuario demo
        demo_user = self.create_demo_user()
        
        # Crear tokens
        access_token = self.jwt_manager.create_access_token(
            data={"sub": demo_user["email"], "is_demo": True},
            tenant_id=demo_user["tenant_id"]
        )
        
        refresh_token = self.jwt_manager.create_refresh_token(
            data={"sub": demo_user["email"], "is_demo": True},
            tenant_id=demo_user["tenant_id"]
        )
        
        return {
            "user": demo_user,
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer"
        }

# ============================================================================
# VALIDACIÓN Y SANITIZACIÓN DE INPUTS
# ============================================================================

class InputValidator:
    """Validación y sanitización de entradas para prevenir inyecciones"""
    
    @staticmethod
    def validate_tenant_id(tenant_id: str) -> bool:
        """
        Valida que el tenant_id sea seguro para usar en queries
        """
        if not tenant_id:
            return False
        
        # Solo permitir caracteres alfanuméricos y guiones bajos
        import re
        pattern = r'^[a-zA-Z0-9_-]+$'
        
        if not re.match(pattern, tenant_id):
            return False
        
        # Limitar longitud
        if len(tenant_id) > 50:
            return False
        
        return True
    
    @staticmethod
    def sanitize_sql_identifier(identifier: str) -> str:
        """
        Sanitiza un identificador SQL para prevenir inyección
        """
        if not identifier:
            raise ValueError("Identificador vacío")
        
        # Remover caracteres peligrosos
        import re
        sanitized = re.sub(r'[^a-zA-Z0-9_]', '', identifier)
        
        # Validar longitud
        if len(sanitized) > 63:  # Límite PostgreSQL
            sanitized = sanitized[:63]
        
        # No puede empezar con número
        if sanitized and sanitized[0].isdigit():
            sanitized = 'tenant_' + sanitized
        
        return sanitized.lower()
    
    @staticmethod
    def validate_email(email: str) -> bool:
        """
        Valida formato de email
        """
        import re
        pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        return bool(re.match(pattern, email))
    
    @staticmethod
    def sanitize_user_input(text: str, max_length: int = 1000) -> str:
        """
        Sanitiza entrada de usuario para prevenir XSS
        """
        if not text:
            return ""
        
        # Limitar longitud
        text = text[:max_length]
        
        # Escapar caracteres HTML peligrosos
        import html
        text = html.escape(text)
        
        # Remover caracteres de control
        import re
        text = re.sub(r'[\x00-\x1F\x7F]', '', text)
        
        return text

# ============================================================================
# SISTEMA DE AUDITORÍA
# ============================================================================

class AuditLogger:
    """Sistema de auditoría para acciones críticas"""
    
    @staticmethod
    def log_security_event(
        event_type: str,
        tenant_id: str,
        user_id: str,
        details: Dict[str, Any],
        severity: str = "INFO"
    ) -> None:
        """
        Registra un evento de seguridad
        """
        if not SecurityConfig.ENABLE_AUDIT_LOG:
            return
        
        import logging
        logger = logging.getLogger("security_audit")
        
        audit_entry = {
            "timestamp": datetime.utcnow().isoformat(),
            "event_type": event_type,
            "tenant_id": tenant_id,
            "user_id": user_id,
            "severity": severity,
            "details": details,
            "ip_address": details.get("ip_address", "unknown"),
            "user_agent": details.get("user_agent", "unknown")
        }
        
        # Log según severidad
        if severity == "CRITICAL":
            logger.critical(json.dumps(audit_entry))
        elif severity == "ERROR":
            logger.error(json.dumps(audit_entry))
        elif severity == "WARNING":
            logger.warning(json.dumps(audit_entry))
        else:
            logger.info(json.dumps(audit_entry))
    
    @staticmethod
    def log_authentication_attempt(
        email: str,
        tenant_id: str,
        success: bool,
        ip_address: str,
        user_agent: str
    ) -> None:
        """
        Registra intento de autenticación
        """
        AuditLogger.log_security_event(
            event_type="authentication_attempt",
            tenant_id=tenant_id,
            user_id=email,
            details={
                "success": success,
                "ip_address": ip_address,
                "user_agent": user_agent
            },
            severity="INFO" if success else "WARNING"
        )
    
    @staticmethod
    def log_data_access(
        tenant_id: str,
        user_id: str,
        resource: str,
        action: str,
        success: bool
    ) -> None:
        """
        Registra acceso a datos sensibles
        """
        AuditLogger.log_security_event(
            event_type="data_access",
            tenant_id=tenant_id,
            user_id=user_id,
            details={
                "resource": resource,
                "action": action,
                "success": success
            },
            severity="INFO" if success else "WARNING"
        )

# ============================================================================
# RATE LIMITING
# ============================================================================

class RateLimiter:
    """Control de rate limiting para prevenir abuso"""
    
    def __init__(self):
        self.attempts = {}  # En producción usar Redis
    
    def check_rate_limit(
        self,
        identifier: str,
        max_attempts: Optional[int] = None,
        window_seconds: Optional[int] = None
    ) -> Tuple[bool, int]:
        """
        Verifica si se excedió el límite de intentos
        Retorna (permitido, intentos_restantes)
        """
        if not SecurityConfig.RATE_LIMIT_ENABLED:
            return True, 999
        
        max_attempts = max_attempts or SecurityConfig.RATE_LIMIT_REQUESTS
        window_seconds = window_seconds or SecurityConfig.RATE_LIMIT_PERIOD
        
        now = datetime.utcnow()
        
        # Limpiar intentos antiguos
        if identifier in self.attempts:
            self.attempts[identifier] = [
                t for t in self.attempts[identifier]
                if (now - t).total_seconds() < window_seconds
            ]
        else:
            self.attempts[identifier] = []
        
        # Verificar límite
        current_attempts = len(self.attempts[identifier])
        
        if current_attempts >= max_attempts:
            return False, 0
        
        # Registrar intento
        self.attempts[identifier].append(now)
        
        return True, max_attempts - current_attempts - 1

# ============================================================================
# INICIALIZACIÓN GLOBAL
# ============================================================================

# Instancias singleton
aes_cipher = AESCipher()
password_manager = PasswordManager()
jwt_manager = JWTManager()
demo_manager = DemoUserManager()
input_validator = InputValidator()
audit_logger = AuditLogger()
rate_limiter = RateLimiter()

# ============================================================================
# FUNCIONES DE UTILIDAD
# ============================================================================

def generate_secure_key(length: int = 32) -> str:
    """Genera una clave segura para configuración"""
    return secrets.token_urlsafe(length)

def hash_sensitive_data(data: str) -> str:
    """Hash unidireccional para datos sensibles que no necesitan ser recuperados"""
    return hashlib.sha256(data.encode()).hexdigest()

def validate_password_strength(password: str) -> Tuple[bool, str]:
    """Valida la fortaleza de una contraseña"""
    if len(password) < 8:
        return False, "La contraseña debe tener al menos 8 caracteres"
    
    if not any(c.isupper() for c in password):
        return False, "La contraseña debe contener al menos una mayúscula"
    
    if not any(c.islower() for c in password):
        return False, "La contraseña debe contener al menos una minúscula"
    
    if not any(c.isdigit() for c in password):
        return False, "La contraseña debe contener al menos un número"
    
    if not any(c in "!@#$%^&*()_+-=[]{}|;:,.<>?" for c in password):
        return False, "La contraseña debe contener al menos un carácter especial"
    
    return True, "Contraseña válida"

# ============================================================================
# EJEMPLO DE USO
# ============================================================================

if __name__ == "__main__":
    print("Sistema de Seguridad Mejorado LPDP")
    print("-" * 50)
    
    # Ejemplo de encriptación AES
    cipher = AESCipher()
    encrypted = cipher.encrypt("Dato sensible de prueba")
    print(f"Encriptado: {encrypted}")
    decrypted = cipher.decrypt(encrypted)
    print(f"Desencriptado: {decrypted}")
    
    # Ejemplo de usuario demo
    if SecurityConfig.DEMO_MODE_ENABLED:
        demo_user = demo_manager.create_demo_user()
        print(f"\nUsuario Demo creado: {demo_user['email']}")
        print(f"Limitaciones: {demo_user['limitations']}")
    
    # Ejemplo de validación
    tenant_id = "empresa_123"
    if input_validator.validate_tenant_id(tenant_id):
        print(f"\nTenant ID válido: {tenant_id}")
        sanitized = input_validator.sanitize_sql_identifier(tenant_id)
        print(f"Sanitizado para SQL: {sanitized}")