from django.db import models
from django.contrib.auth.models import User, Group

import festival


# Create your models here.
class Festival(models.Model):
    user_id = models.ForeignKey(User, on_delete=models.DO_NOTHING)
    festival_id = models.IntegerField()
    festival_name = models.CharField(max_length=200)
