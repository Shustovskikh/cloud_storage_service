from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import FileViewSet

router = DefaultRouter()
router.register(r'', FileViewSet, basename='file')

urlpatterns = [
    path('', include(router.urls)),
    path('download/<str:shared_link>/', FileViewSet.as_view({'get': 'download_file'}), name='file-download'),
    path('<int:pk>/update/', FileViewSet.as_view({'put': 'update_file'}), name='file-update'),
]
