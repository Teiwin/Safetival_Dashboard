
from django.db import connections

def get_querry(querry, data):
    result = None
    # Fetch the event properties
    with connections["postgresql"].cursor() as cursor:
        cursor.execute(querry, data)
        result = cursor.fetchall()

    return result

