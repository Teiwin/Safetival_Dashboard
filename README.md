# Safetival_Dashboard

# To do the requests
https://docs.djangoproject.com/en/4.2/topics/db/sql/#executing-custom-sql-directly

```
from django.db import connections

with connections["my_db_alias"].cursor() as cursor:
    ...
```