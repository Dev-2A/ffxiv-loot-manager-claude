from django.urls import path, include
from rest_framework.routers import DefaultRouter

from bis_manager.views import (
    SeasonViewSet, ItemViewSet, PlayerViewSet,
    BisSetViewSet, BisItemViewSet,
    RaidProgressViewSet, ItemAcquisitionViewSet, DistributionPriorityViewSet,
    ResourceTrackingViewSet
)

# API 라우터 설정
router = DefaultRouter()
router.register(r'seasons', SeasonViewSet)
router.register(r'items', ItemViewSet)
router.register(r'players', PlayerViewSet)
router.register(r'bis-sets', BisSetViewSet)
router.register(r'bis-items', BisItemViewSet)
router.register(r'raid-progress', RaidProgressViewSet)
router.register(r'item-acquisitions', ItemAcquisitionViewSet)
router.register(r'distribution-priorities', DistributionPriorityViewSet)
router.register(r'resources', ResourceTrackingViewSet)

urlpatterns = [
    path('', include(router.urls)),
]