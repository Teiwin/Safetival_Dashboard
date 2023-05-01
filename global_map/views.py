from django.http import HttpResponse
from django.http import JsonResponse
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



def map(request):
    min_lat = float(request.GET.get('minLat', -90))
    min_lng = float(request.GET.get('minLng', -180))
    max_lat = float(request.GET.get('maxLat', 90))
    max_lng = float(request.GET.get('maxLng', 180))

    participants_data = {}
    with connections["postgresql"].cursor() as cursor:
      # get all the positions of all the users
      cursor.execute(
          "SELECT p_user_id, sample_date, gps_north, gps_west FROM position WHERE gps_north > %s AND gps_north < %s AND gps_west > %s AND gps_west < %s",
          (min_lat, max_lat, min_lng, max_lng)
      ) 
      for row in cursor.fetchall():
          user_id = row[0]
          # convert the timestamp (datetime.datetime) to a timestamp (int)
          timestamp = int(row[1].timestamp())
          lat = row[2]
          lng = row[3]
          if user_id not in participants_data:
              participants_data[user_id] = {}
          participants_data[user_id][timestamp] = {"lat": lat, "lng": lng}

    return JsonResponse(participants_data)


def display_map(request):
    # Chargez les données des participants depuis votre base de données ou un fichier JSON
    participants_data = {}
    
    # Convertissez les données des participants en JSON pour les utiliser dans le template
    participants_data_json = json.dumps(participants_data)

    context = {"participants_data": participants_data_json}
    return render(request, "global_map/map.html", context)
