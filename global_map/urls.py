from django.urls import path
from . import views

urlpatterns = [
    path("test/<int:id>", views.test, name="test"),
    path('map/', views.display_map, name='map'),
]