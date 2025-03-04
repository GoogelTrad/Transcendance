from django.db import models
from users.models import User
from django.utils.timezone import now


# Create your models here.

class FriendRequest(models.Model):
    from_user = models.ForeignKey(User, related_name="sent_request", on_delete=models.CASCADE)
    to_user = models.ForeignKey(User, related_name="received_request", on_delete=models.CASCADE)
    created_at = models.DateTimeField(default=now)
    
    def __str__(self):
        return f"{self.from_user} -> {self.to_user}"
    