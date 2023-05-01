from django.db import connections
from django.shortcuts import render

def festival(request, event_id):
    # Fetch map boundaries from the database
    with connections["postgresql"].cursor() as cursor:
        cursor.execute(
            "SELECT lat_min, long_min, lat_max, long_max, start_date, end_date FROM place WHERE id = %s",
            (event_id,)
        )
        row = cursor.fetchone()
        min_lat = row[0]
        min_lng = row[1]
        max_lat = row[2]
        max_lng = row[3]
        start_date = row[4]
        end_date = row[5]

    # Fetch participants data from the database
    with connections["postgresql"].cursor() as cursor:
        querry = ("SELECT gps_north, gps_west, sample_date FROM position "
                   "JOIN participation ON position.p_user_id = participation.p_user_id "
                   "WHERE participation.place_id = %s "
                   "AND gps_north > %s AND gps_north < %s AND gps_west > %s AND gps_west < %s "
        )
        data = (event_id, min_lat, max_lat, min_lng, max_lng)
        cursor.execute(querry, data)
    
        participant_position = []
        for row in cursor.fetchall():
            participant_position.append([row[2].timestamp(), row[0], row[1]])

    # fetch the number of participants present at the event
    with connections["postgresql"].cursor() as cursor:
        querry = ("SELECT COUNT(DISTINCT position.p_user_id) FROM position "
                   "JOIN participation ON position.p_user_id = participation.p_user_id "
                   "WHERE participation.place_id = %s "
                   "AND gps_north > %s AND gps_north < %s AND gps_west > %s AND gps_west < %s "
        )
        data = (event_id, min_lat, max_lat, min_lng, max_lng)
        cursor.execute(querry, data)
        number_of_participants = cursor.fetchone()[0]
        
    # fetch the start time and end time of the participations (for the timeline, development)
    # DEVLOPPEMENT ONLY:!!
    with connections["postgresql"].cursor() as cursor:
        querry = ("SELECT min(sample_date), max(sample_date) FROM position "
                   "JOIN participation ON position.p_user_id = participation.p_user_id "
                   "WHERE participation.place_id = %s "
                   "AND gps_north > %s AND gps_north < %s AND gps_west > %s AND gps_west < %s ")
        data = (event_id, min_lat, max_lat, min_lng, max_lng)
        cursor.execute(querry, data)
        start_time, end_time = [i.timestamp() for i in cursor.fetchone()]

    context = {
        "event_id": event_id,
        "min_lat": min_lat,
        "min_lng": min_lng,
        "max_lat": max_lat,
        "max_lng": max_lng,
        "participant_positions": participant_position,
        "number_of_participants": number_of_participants,
        "start_time": start_time,
        "end_time": end_time,
    }

    return render(request, "festival/festival.html", context)


def graphs(request, event_id):
    
    context = {
    }
    return render(request, 'graphs.html', context)