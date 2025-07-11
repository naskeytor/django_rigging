from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin, Group, Permission
from datetime import date, timezone
from django.utils import timezone


class UserManager(BaseUserManager):
    def create_user(self, username, email=None, password=None, **extra_fields):
        if not username:
            raise ValueError("El nombre de usuario es obligatorio")

        user = self.model(username=username, email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)

        # 🔹 Asignar al grupo 'user' por defecto
        try:
            user_group, created = Group.objects.get_or_create(name='user')
            user.groups.add(user_group)
        except Exception as e:
            print(f"❌ Error al asignar grupo 'user' al crear usuario: {e}")

        return user

    def create_superuser(self, username, email=None, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)

        if extra_fields.get("is_staff") is not True:
            raise ValueError("El superusuario debe tener is_staff=True.")
        if extra_fields.get("is_superuser") is not True:
            raise ValueError("El superusuario debe tener is_superuser=True.")

        return self.create_user(username, email, password, **extra_fields)



class User(AbstractBaseUser, PermissionsMixin):
    username = models.CharField(max_length=100, unique=True)
    email = models.EmailField(unique=True)

    reset_token = models.CharField(max_length=64, unique=True, null=True, blank=True)
    is_verified = models.BooleanField(default=False)
    verification_token = models.CharField(max_length=100, unique=True, null=True, blank=True)
    is_staff = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    groups = models.ManyToManyField(Group, related_name="core_users")  # Cambié el related_name
    user_permissions = models.ManyToManyField(Permission,
                                              related_name="core_users_permissions")  # Cambié el related_name

    objects = UserManager()

    USERNAME_FIELD = 'username'
    REQUIRED_FIELDS = ['email']

    def __str__(self):
        return self.username


class Manufacturer(models.Model):
    manufacturer = models.CharField(max_length=50)

    def __str__(self):
        return self.manufacturer


class Size(models.Model):
    size = models.CharField(max_length=50, null=True)

    def __str__(self):
        return self.size


class Status(models.Model):
    status = models.CharField(max_length=50)

    def __str__(self):
        return self.status


class ComponentType(models.Model):
    component_type = models.CharField(max_length=50)

    def __str__(self):
        return self.component_type


class Model(models.Model):
    name = models.CharField(max_length=50)
    manufacturer = models.ForeignKey(Manufacturer, on_delete=models.CASCADE, related_name='models')

    def __str__(self):
        return self.name


class Component(models.Model):
    USAGE_TYPE_CHOICES = [
        ('Sport', 'Sport'),
        ('Tandem', 'Tandem'),
        ('Emergency', 'Emergency'),
    ]

    component_type = models.ForeignKey(ComponentType, on_delete=models.CASCADE, related_name='components')
    model = models.ForeignKey(Model, on_delete=models.SET_NULL, null=True, related_name='components')
    serial_number = models.CharField(max_length=50)
    dom = models.DateField(default=date.today)
    size = models.ForeignKey(Size, on_delete=models.SET_NULL, null=True, related_name='components')
    status = models.ForeignKey(Status, on_delete=models.SET_NULL, null=True, related_name='components')
    jumps = models.IntegerField(default=0)
    aad_jumps_on_mount = models.IntegerField(default=0)
    usage_type = models.CharField(
        max_length=20,
        choices=USAGE_TYPE_CHOICES,
        default='Sport'
    )
    packs = models.IntegerField(null=True, blank=True)
    openings = models.IntegerField(null=True, blank=True)


    def __str__(self):
        return self.serial_number


class Rig(models.Model):
    rig_number = models.CharField(max_length=10)
    components = models.ManyToManyField('Component', related_name='rigs', blank=True)
    current_aad_jumps = models.IntegerField(default=0)

    def __str__(self):
        return self.rig_number

    def update_aad_jumps(self, new_value):
        old_value = self.current_aad_jumps
        diff = new_value - old_value
        if diff == 0:
            return

        self.current_aad_jumps = new_value
        self.save()

        for comp in self.components.all():
            comp_type = comp.component_type.component_type.lower()
            if comp_type in ["canopy", "container"]:
                comp.jumps = (comp.jumps or 0) + diff
                comp.aad_jumps_on_mount = new_value
                comp.save()
            elif comp_type == "aad":
                # 🔹 Actualizar el campo aad_jumps_on_mount también
                comp.jumps = new_value
                comp.save()


class Rigging(models.Model):
    RIGGING_TYPES = [
        ("I+R", "Inspection + Repack"),
        ("Reparation", "Reparation"),
        ("Fabrication", "Fabrication"),
    ]

    date = models.DateField(default=timezone.now)

    rigger = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="riggings",
        help_text="Rigger assigned to this work"
    )

    type_rigging = models.CharField(
        max_length=20,
        choices=RIGGING_TYPES,
        default="I+R"
    )

    component = models.ForeignKey(
        "Component",
        on_delete=models.CASCADE,
        related_name="riggings",
        help_text="Component involved in this rigging",
        null=True
    )

    rig = models.ForeignKey(
        "Rig",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="riggings",
        help_text="Rig associated with this rigging"
    )

    description = models.TextField(
        blank=True,
        help_text="Description of the work done",
        null=True
    )

    price = models.DecimalField(
        max_digits=8,
        decimal_places=2,
        default=0.00
    )

    def __str__(self):
        return f"{self.date} - {self.type_rigging} - {self.component.serial_number} ({self.rig.rig_number if self.rig else 'No Rig'})"



    class Lineset(models.Model):
        serial_number = models.CharField(max_length=50)
        line_type = models.CharField(max_length=50)
        jumps = models.IntegerField(default=0)
        aad_jumps_on_mount = models.IntegerField(null=True, blank=True)

        # Relación opcional con Component (Canopy)
        canopy = models.ForeignKey(
            'Component',
            on_delete=models.SET_NULL,
            null=True,
            blank=True,
            related_name='linesets'
        )

        def __str__(self):
            return f"{self.serial_number} ({self.line_type})"

    class Drogue(models.Model):
        serial_number = models.CharField(max_length=50)
        line_type = models.CharField(max_length=50)
        jumps = models.IntegerField(default=0)
        aad_jumps_on_mount = models.IntegerField(null=True, blank=True)
        killline_jumps_on_mount = models.IntegerField(null=True, blank=True)
        kill_line_jumps = models.IntegerField(default=0)

        # Relación opcional con Component (Container o Canopy, según tu lógica)
        canopy = models.ForeignKey(
            'Component',
            on_delete=models.SET_NULL,
            null=True,
            blank=True,
            related_name='drogues'
        )

        def __str__(self):
            return f"{self.serial_number} ({self.line_type})"