from django.urls import path
from . import views

urlpatterns = [
    path("test/<int:id>", views.test, name="test"),
    path('map/', views.map, name='map'),
    path("display_map", views.display_map, name="display_map"),
]