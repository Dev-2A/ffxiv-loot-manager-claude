from rest_framework import viewsets, permissions, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from datetime import datetime, timedelta

from bis_manager.models import Schedule
from bis_manager.serializers import ScheduleSerializer
from bis_manager.permissions import IsAdminOrReadOnly, IsOwnerOrReadOnly

class ScheduleViewSet(viewsets.ModelViewSet):
    queryset = Schedule.objects.all().order_by('start_time')
    serializer_class = ScheduleSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['creator', 'is_admin_schedule', 'repeat_type']
    search_fields = ['title', 'description']
    
    def get_permissions(self):
        # 관리자 일정은 관리자만 생성 가능
        # 개인 일정은 본인만 수정/삭제 가능
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [permissions.IsAuthenticated(), IsOwnerOrReadOnly()]
        return [permissions.IsAuthenticated()]
    
    def get_queryset(self):
        """특정 기간의 일정 필터링"""
        queryset = super().get_queryset()
        
        # 시작 날짜와 종료 날짜로 필터링
        start_date = self.request.query_params.get('start_date')
        end_date = self.request.query_params.get('end_date')
        
        if start_date:
            try:
                start_datetime = datetime.strptime(start_date, '%Y-%m-%d')
                queryset = queryset.filter(start_time__gte=start_datetime)
            except ValueError:
                pass
        
        if end_date:
            try:
                end_datetime = datetime.strptime(end_date, '%Y-%m-%d')
                end_datetime = end_datetime + timedelta(days=1) # 해당 날짜의 끝까지 포함
                queryset = queryset.filter(start_time__lt=end_datetime)
            except ValueError:
                pass
        
        return queryset
    
    def perform_create(self, serializer):
        serializer.save(creator=self.request.user)
    
    @action(detail=False, methods=['get'])
    def my_schedules(self, request):
        """로그인한 사용자의 일정만 조회"""
        queryset = self.get_queryset().filter(creator=request.user)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)