import pytest
from rest_framework.test import APIClient
from core.models import Component, Rig, ComponentType

@pytest.mark.django_db
def test_umount_updates_jumps_correctly():
    client = APIClient()

    # 🔹 Crear tipos de componente
    aad_type = ComponentType.objects.create(component_type="AAD")
    canopy_type = ComponentType.objects.create(component_type="Canopy")
    container_type = Component.objects.create(component_type="Container")
    reserve_type = ComponentType.objects.create(component_type="Reserve")

    # 🔹 Crear componentes con aad_jumps_on_mount = 100
    aad = Component.objects.create(serial_number="aad-1", component_type=aad_type, jumps=0, aad_jumps_on_mount=100)
    canopy = Component.objects.create(serial_number="canopy-1", component_type=canopy_type, jumps=50, aad_jumps_on_mount=100)
    container = Component.objects.create(serial_number="container-1", component_type=container_type, jumps=30, aad_jumps_on_mount=100)
    reserve = Component.objects.create(serial_number="reserve-1", component_type=reserve_type, jumps=70, aad_jumps_on_mount=100)

    # 🔹 Crear rig y montarlos
    rig = Rig.objects.create(rig_number="R1")
    aad.rigs.add(rig)
    canopy.rigs.add(rig)
    container.rigs.add(rig)
    reserve.rigs.add(rig)

    # 🔹 Simular desmontaje del AAD con aad_jumps = 110
    response = client.post(
        f"/api/components/{aad.id}/umount/",
        {"aad_jumps": 110},
        format="json"
    )

    assert response.status_code == 200

    # 🔄 Refrescar desde la base de datos
    canopy.refresh_from_db()
    container.refresh_from_db()
    reserve.refresh_from_db()
    aad.refresh_from_db()

    # ✅ Canopy y Container deben haber sumado 10
    assert canopy.jumps == 60
    assert container.jumps == 40

    # ✅ Reserve no debe cambiar
    assert reserve.jumps == 70

    # ✅ AAD desmontado (ya no pertenece a rigs)
    assert aad.rigs.count() == 0
