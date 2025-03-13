from django.db.models.signals import post_migrate
from django.contrib.auth.models import Group
from django.dispatch import receiver

@receiver(post_migrate)
def create_default_groups(sender, **kwargs):
    if sender.name == "auth_app":
        for group_name in ["admin", "rigger", "user"]:
            Group.objects.get_or_create(name=group_name)