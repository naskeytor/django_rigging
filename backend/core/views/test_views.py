from django.http import JsonResponse

def test_connection(request):
    return JsonResponse({"message": "Conexión Django-React exitosa!"})