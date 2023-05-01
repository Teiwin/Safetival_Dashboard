# Safetival_Dashboard
Thuis repos contains the code for a dashboard showing multiple data.
# to install:
(go in the project's root directory)  
create a venv:  
`python -m venv env`  
activate it (`source env/bin/activate` on linux)  
install the dependencies: `pip install -r requirements.txt`  

then for the first run, do:  
`python manage.py makemigrations`  
and  
`python manage.py migrate`


you can then run the project with: `python manage.py runserver`

# To do the requests
https://docs.djangoproject.com/en/4.2/topics/db/sql/#executing-custom-sql-directly

```
from django.db import connections

with connections["my_db_alias"].cursor() as cursor:
    ...
```