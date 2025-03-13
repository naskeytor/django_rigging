from django.urls import path
from .views import login_view, register_view, logout_view, forgot_password_view, reset_password_view, auth_root_view

urlpatterns = [
    path("", auth_root_view, name="auth_root"),  # ✅ Agregamos esta línea
    path("login/", login_view, name="login"),
    path("register/", register_view, name="register"),
    path("logout/", logout_view, name="logout"),
    path("forgot-password/", forgot_password_view, name="forgot_password"),
    path("reset-password/<str:token>/", reset_password_view, name="reset_password"),
]