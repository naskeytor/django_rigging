import json
import secrets
from django.contrib.auth import authenticate, login, logout
# from django.contrib.auth.models import User, Group
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.core.mail import send_mail
from django.conf import settings
from django.http import JsonResponse
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group

User = get_user_model()


def auth_root_view(request):
    """
    Devuelve una lista de los endpoints disponibles en /api/auth/
    """
    endpoints = {
        "login": "/api/auth/login/",
        "register": "/api/auth/register/",
        "logout": "/api/auth/logout/",
        "forgot_password": "/api/auth/forgot-password/",
        "reset_password": "/api/auth/reset-password/<token>/",
    }
    return JsonResponse(endpoints)


@csrf_exempt
def register_view(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            username = data.get("username")
            email = data.get("email")
            password = data.get("password")

            if not username or not email or not password:
                return JsonResponse({"error": "Todos los campos son obligatorios"}, status=400)

            if User.objects.filter(username=username).exists():
                return JsonResponse({"error": "El nombre de usuario ya está en uso"}, status=400)

            if User.objects.filter(email=email).exists():
                return JsonResponse({"error": "El email ya está registrado"}, status=400)

            user = User.objects.create_user(username=username, email=email, password=password)

            group, _ = Group.objects.get_or_create(name="user")
            user.groups.add(group)

            return JsonResponse({
                "message": "Registro exitoso",
                "user": {
                    "id": user.id,
                    "username": user.username,
                    "email": user.email,
                    "group": "user"
                }
            }, status=201)

        except Exception as e:
            return JsonResponse({"error": f"Error en el servidor: {str(e)}"}, status=500)

    return JsonResponse({"error": "Método no permitido"}, status=405)


@csrf_exempt
def login_view(request):
    """
    Inicia sesión autenticando un usuario y devuelve su grupo y datos.
    """
    if request.method == "POST":
        data = json.loads(request.body)
        username = data.get("username")
        password = data.get("password")

        user = authenticate(request, username=username, password=password)
        if user:
            login(request, user)
            groups = list(user.groups.values_list('name', flat=True)) if user.groups.exists() else ["user"]

            # ✅ Generamos un JWT real
            refresh = RefreshToken.for_user(user)

            return JsonResponse({
                "message": "Login exitoso",
                "group": groups[0],
                "access": str(refresh.access_token),  # ✅ Token real
                "refresh": str(refresh),
                "user": {
                    "username": user.username,
                    "email": user.email,
                    "image": f"https://ui-avatars.com/api/?name={user.username}"
                }
            }, status=200)

        return JsonResponse({"error": "Usuario o contraseña incorrectos"}, status=401)

    return JsonResponse({"error": "Método no permitido"}, status=405)


def logout_view(request):
    """
    Cierra la sesión del usuario.
    """
    logout(request)
    return JsonResponse({"message": "Logout exitoso"}, status=200)


@csrf_exempt
def forgot_password_view(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            email = data.get("email")

            if not email:
                return JsonResponse({"error": "Email es obligatorio"}, status=400)

            user = User.objects.filter(email=email).first()
            if not user:
                return JsonResponse({"error": "Usuario no encontrado"}, status=404)

            # 🔑 Generar token único
            reset_token = secrets.token_hex(16)
            user.reset_token = reset_token
            user.save()

            # 📨 Enviar correo con enlace de recuperación
            frontend_url = "http://127.0.0.1:5174"  # Actualiza si es necesario
            reset_url = f"{frontend_url}/reset-password/{reset_token}"

            send_mail(
                subject="Restablecimiento de contraseña",
                message=f"Haz clic aquí para restablecer tu contraseña: {reset_url}",
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[email],
                fail_silently=False,
            )

            return JsonResponse({"message": "Enlace de recuperación enviado si el email existe."})

        except Exception as e:
            return JsonResponse({"error": f"Error en el servidor: {str(e)}"}, status=500)

    return JsonResponse({"error": "Método no permitido"}, status=405)


@csrf_exempt
def reset_password_view(request, token):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            password = data.get("password")

            if not password:
                return JsonResponse({"error": "Contraseña requerida"}, status=400)

            user = User.objects.filter(reset_token=token).first()
            if not user:
                return JsonResponse({"error": "Token inválido o expirado"}, status=400)

            user.set_password(password)
            user.reset_token = None  # ⚠️ Eliminar el token una vez usado
            user.save()

            return JsonResponse({"message": "Contraseña actualizada correctamente"})

        except Exception as e:
            return JsonResponse({"error": f"Error en el servidor: {str(e)}"}, status=500)

    return JsonResponse({"error": "Método no permitido"}, status=405)