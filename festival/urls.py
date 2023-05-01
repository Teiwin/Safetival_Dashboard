from django.urls import path
from . import views

urlpatterns = [
    path("festival/<int:event_id>/", views.festival, name="event"),
    path('festival/<int:event_id>/graphs/', views.graphs, name='graphs'),
]