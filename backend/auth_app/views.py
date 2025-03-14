import json
import secrets
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User, Group
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.core.mail import send_mail
from django.conf import settings
from django.http import JsonResponse
from rest_framework_simplejwt.tokens import RefreshToken


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
    """
    Registra un nuevo usuario y lo asigna al grupo 'user' por defecto.
    """
    if request.method == "POST":
        data = json.loads(request.body)
        username = data.get("username")
        email = data.get("email")
        password = data.get("password")

        if User.objects.filter(username=username).exists():
            return JsonResponse({"error": "El nombre de usuario ya está en uso"}, status=400)

        if User.objects.filter(email=email).exists():
            return JsonResponse({"error": "El email ya está registrado"}, status=400)

        user = User.objects.create_user(username=username, email=email, password=password)

        # Agregar usuario al grupo "user" por defecto
        user_group, _ = Group.objects.get_or_create(name="user")
        user.groups.add(user_group)

        return JsonResponse({
            "message": "Registro exitoso",
            "user": {"id": user.id, "username": user.username, "email": user.email, "group": "user"},
        }, status=201)

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

            return JsonResponse({
                "message": "Login exitoso",
                "group": groups[0],
                "access": "FAKE_ACCESS_TOKEN",  # 🔹 Aquí debes generar un JWT real
                "refresh": "FAKE_REFRESH_TOKEN",
                "user": {
                    "username": user.username,
                    "email": user.email,
                    "image": f"https://ui-avatars.com/api/?name={user.username}"  # 🔹 Imagen generada
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
    """
    Envío de un correo con un enlace para restablecer la contraseña.
    """
    if request.method == "POST":
        data = json.loads(request.body)
        email = data.get("email")

        if not email:
            return JsonResponse({"error": "El email es obligatorio"}, status=400)

        user = User.objects.filter(email=email).first()
        if not user:
            return JsonResponse({"error": "No se encontró un usuario con este email"}, status=404)

        # Generar token de recuperación
        reset_token = secrets.token_hex(16)
        user.profile.reset_token = reset_token  # Guardamos el token en el perfil del usuario
        user.profile.save()

        # Crear la URL de restablecimiento
        reset_url = f"http://127.0.0.1:5174/reset-password/{reset_token}"

        # Enviar el correo con el link de restablecimiento
        subject = "Restablecimiento de Contraseña"
        message = f"Haz clic en el siguiente enlace para restablecer tu contraseña:\n{reset_url}"
        email_from = settings.DEFAULT_FROM_EMAIL
        recipient_list = [email]

        try:
            send_mail(subject, message, email_from, recipient_list)
            return JsonResponse({"message": "Correo de restablecimiento enviado"}, status=200)
        except Exception as e:
            return JsonResponse({"error": "Error al enviar el correo", "details": str(e)}, status=500)

    return JsonResponse({"error": "Método no permitido"}, status=405)


@csrf_exempt
def reset_password_view(request, token):
    """
    Restablece la contraseña del usuario si el token es válido.
    """
    if request.method == "POST":
        data = json.loads(request.body)
        new_password = data.get("password")

        user = User.objects.filter(profile__reset_token=token).first()
        if not user:
            return JsonResponse({"error": "Token inválido o expirado"}, status=400)

        # Cambiar la contraseña y limpiar el token
        user.set_password(new_password)
        user.profile.reset_token = None
        user.profile.save()
        user.save()

        return JsonResponse({"message": "Contraseña actualizada correctamente"}, status=200)

    return JsonResponse({"error": "Método no permitido"}, status=405)
