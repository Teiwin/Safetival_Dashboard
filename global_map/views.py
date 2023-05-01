from django.http import HttpResponse
from django.shortcuts import render
from django.db import connections
import json


# Create your views here.
def test(request, id):
    with connections["postgresql"].cursor() as cursor:
        cursor.execute("SELECT 1")
        one = cursor.fetchone()
        print(one)
    return HttpResponse("OK")


def display_map(request):
    # Chargez les données des participants depuis votre base de données ou un fichier JSON
    participants_data = {
        # Insérez ici vos données d'objet Python avec les positions GPS des participants
        "user1": {
            "1624546800": {"lat": 48.858844, "lng": 2.294351},
            "1624547100": {"lat": 48.858935, "lng": 2.293273},
        },
        "user2": {
            "1624546800": {"lat": 48.857612, "lng": 2.291532},
            "1624547100": {"lat": 48.857422, "lng": 2.293012},
        },
    }

    # Convertissez les données des participants en JSON pour les utiliser dans le template
    participants_data_json = json.dumps(participants_data)

    context = {"participants_data": participants_data_json}
    return render(request, "global_map/map.html", context)
