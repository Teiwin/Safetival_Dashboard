from django.shortcuts import render
from django.contrib.auth.decorators import login_required

from festival.models import Festival
from festival.postgre import get_querry

import numpy as np

@login_required
def festival(request):
    
    # get the event id from the user id:
    festival = Festival.objects.get(user_id=request.user.pk)
    event_id = festival.festival_id
    
    # Fetch the event properties
    row = get_querry(
        "SELECT lat_min, long_min, lat_max, long_max, start_date, end_date FROM place WHERE id = %s",
        (event_id,)
    )[0]
    min_lat = row[0]
    min_lng = row[1]
    max_lat = row[2]
    max_lng = row[3]
    start_date = row[4]
    end_date = row[5]

    # Fetch positions data from the database
    querry = ("SELECT gps_north, gps_west, sample_date FROM position "
              "WHERE gps_north > %s AND gps_north < %s AND gps_west > %s AND gps_west < %s "
              "AND sample_date BETWEEN %s AND %s"
            )
    data = (min_lat, max_lat, min_lng, max_lng, start_date, end_date)
    
    participant_position = []
    for row in get_querry(querry, data):
        participant_position.append([row[2].timestamp(), row[0], row[1]])


    querry = ("SELECT gps_north, gps_west, sample_date FROM position "
                "JOIN alert ON position.p_user_id = alert.a_user_id "
                "WHERE gps_north > %s AND gps_north < %s AND gps_west > %s AND gps_west < %s "
                "AND sample_date BETWEEN %s AND %s "
                "AND alert.start_date BETWEEN %s AND %s"
                )
    data = (min_lat, max_lat, min_lng, max_lng, start_date, end_date, start_date, end_date)

    alerte_position = []
    for row in get_querry(querry, data):
        alerte_position.append([row[2].timestamp(), row[0], row[1]])

    # fetch the number of participants present at the event (who are registered in the event)
    querry = ("SELECT COUNT(DISTINCT position.p_user_id) FROM position "
                "JOIN participation ON position.p_user_id = participation.p_user_id "
                "WHERE participation.place_id = %s "
                "AND gps_north > %s AND gps_north < %s AND gps_west > %s AND gps_west < %s AND sample_date > %s AND sample_date < %s"
    )
    data = (event_id, min_lat, max_lat, min_lng, max_lng, start_date, end_date)
    number_of_registered_participants = get_querry(querry, data)[0][0]
    
    # Fetch the number of participants present at the event
    querry = ("SELECT COUNT(DISTINCT position.p_user_id) FROM position "
                "WHERE gps_north > %s AND gps_north < %s "
                "AND gps_west > %s AND gps_west < %s "
                "AND sample_date > %s AND sample_date < %s"
    )
    data = (min_lat, max_lat, min_lng, max_lng, start_date, end_date)
    number_of_participants = get_querry(querry, data)[0][0]

    context = {
        "event_id": event_id,
        "min_lat": min_lat,
        "min_lng": min_lng,
        "max_lat": max_lat,
        "max_lng": max_lng,
        "participant_positions": participant_position,
        "alerte_position" : alerte_position,
        "number_of_registered_participants": number_of_registered_participants,
        "number_of_participants": number_of_participants,
        "start_time": start_date.timestamp(),
        "end_time": end_date.timestamp(),
    }

    return render(request, "festival/festival.html", context)


@login_required
def graphs(request):
    
    # get the event id from the user id:
    festival = Festival.objects.get(user_id=request.user.pk)
    event_id = festival.festival_id
    
    # Fetch the event properties
    row = get_querry(
        "SELECT lat_min, long_min, lat_max, long_max, start_date, end_date, name FROM place WHERE id = %s",
        (event_id,)
    )[0]
    min_lat = row[0]
    min_lng = row[1]
    max_lat = row[2]
    max_lng = row[3]
    start_date = row[4]
    end_date = row[5]
    name = row[6]
        
    # get the number of alerts in the event
    querry = ("SELECT COUNT(DISTINCT alert.id), MAX(alert.end_date - alert.start_date) FROM alert " # select distinc alert
                "JOIN position ON position.p_user_id = alert.a_user_id "
                "WHERE position.gps_north > %s AND position.gps_north < %s " # user has positions in the event area
                "AND position.gps_west > %s AND position.gps_west < %s "
                "AND position.sample_date > %s AND position.sample_date < %s " # during the event time
                "AND alert.start_date BETWEEN %s AND %s " # alert starts in the event
                # "AND EXTRACT(SECONDS from alert.end_date - alert.start_date) >= 30 " # alert lasts at least 1 minute
    )
    data = (min_lat, max_lat, min_lng, max_lng, start_date, end_date, start_date, end_date)
    
    nb_alerts, max_alert = get_querry(querry, data)[0]

    # Fetch positions data from the database
    querry = ("SELECT gps_north, gps_west, sample_date, p_user_id FROM position "
                "WHERE gps_north > %s AND gps_north < %s AND gps_west > %s AND gps_west < %s "
                "AND sample_date BETWEEN %s AND %s"
    )
    data = (min_lat, max_lat, min_lng, max_lng, start_date, end_date)
    
    participant_position = []
    for row in get_querry(querry, data):
        participant_position.append([row[2].timestamp(), row[3], row[0], row[1]])

    # Fetch the number of participants present at the event
    querry = ("SELECT COUNT(DISTINCT position.p_user_id) FROM position "
                "WHERE gps_north > %s AND gps_north < %s "
                "AND gps_west > %s AND gps_west < %s "
                "AND sample_date > %s AND sample_date < %s"
    )
    data = (min_lat, max_lat, min_lng, max_lng, start_date, end_date)
    number_of_participants = get_querry(querry, data)[0][0]
        
    # Compute the density
    density = [0]
    density_timestamps = [0]
    
    # on s'en fout
    
    grid = np.linspace((min_lat, min_lng), (max_lat, max_lng), 100)
    
    
    
        
    context = {
        "event_id": event_id,
        "event_name": name,
        "nb_alerts": nb_alerts,
        "max_alert": max_alert,
        "density": density,
        "density_timestamps": density_timestamps,
    }
    return render(request, 'festival/graphs.html', context)
