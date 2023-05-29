from django.urls import path
from django.contrib.auth import views as auth_views

from . import views

from festival.forms import CustomLoginForm

urlpatterns = [
    path("", views.festival, name="event"),
    path('graphs/', views.graphs, name='graphs'),
    path(
        "login/",
        auth_views.LoginView.as_view(
            template_name="login.html", form_class=CustomLoginForm
        ),
        name="login",
    ),
    path("logout/", auth_views.LogoutView.as_view(), name="logout"),
]
