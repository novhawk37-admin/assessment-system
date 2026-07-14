from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

password = "user33"
hashed = pwd_context.hash(password)

print(hashed)