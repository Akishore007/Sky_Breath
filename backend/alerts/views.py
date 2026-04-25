from rest_framework import viewsets, status, permissions, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Alert
from .serializers import (
    AlertSerializer,
    AlertCreateSerializer,
    AlertUpdateSerializer
)


class AlertViewSet(viewsets.ModelViewSet):
    """
    ViewSet for weather alerts
    Endpoints:
    - GET /api/v1/alerts/ - List user's alerts
    - POST /api/v1/alerts/ - Create new alert
    - GET /api/v1/alerts/{id}/ - Get specific alert
    - PATCH /api/v1/alerts/{id}/ - Update alert status
    - DELETE /api/v1/alerts/{id}/ - Delete alert
    """
    serializer_class = AlertSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'message', 'severity', 'location']
    ordering_fields = ['timestamp', 'severity']
    
    def get_queryset(self):
        """Return alerts for current user"""
        user = self.request.user
        if user.is_staff:
            return Alert.objects.all().order_by('-timestamp')
        return Alert.objects.filter(user=user).order_by('-timestamp')
    
    def get_serializer_class(self):
        """Use different serializers for different actions"""
        if self.action == 'create':
            return AlertCreateSerializer
        elif self.action in ['partial_update', 'update']:
            return AlertUpdateSerializer
        return AlertSerializer
    
    def create(self, request, *args, **kwargs):
        """Create new alert - auto-assign to current user"""
        data = request.data.copy()
        data['user'] = request.user.id
        serializer = self.get_serializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['get'])
    def unread(self, request):
        """Get unread alerts for current user"""
        alerts = self.get_queryset().filter(is_read=False)
        serializer = AlertSerializer(alerts, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def critical(self, request):
        """Get critical severity alerts"""
        alerts = self.get_queryset().filter(severity='critical')
        serializer = AlertSerializer(alerts, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def mark_as_read(self, request, pk=None):
        """Mark alert as read"""
        alert = self.get_object()
        alert.is_read = True
        alert.save()
        serializer = AlertSerializer(alert)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def mark_as_unread(self, request, pk=None):
        """Mark alert as unread"""
        alert = self.get_object()
        alert.is_read = False
        alert.save()
        serializer = AlertSerializer(alert)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def dismiss(self, request, pk=None):
        """Dismiss an alert"""
        alert = self.get_object()
        alert.is_dismissed = True
        alert.save()
        serializer = AlertSerializer(alert)
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'])
    def mark_all_read(self, request):
        """Mark all alerts as read for current user"""
        self.get_queryset().filter(is_read=False).update(is_read=True)
        return Response({'message': 'All alerts marked as read'})
    
    @action(detail=False, methods=['get'])
    def by_severity(self, request):
        """Get alerts filtered by severity"""
        severity = request.query_params.get('severity')
        if not severity:
            return Response(
                {'error': 'Severity parameter required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        alerts = self.get_queryset().filter(severity=severity)
        serializer = AlertSerializer(alerts, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def by_type(self, request):
        """Get alerts filtered by type"""
        alert_type = request.query_params.get('type')
        if not alert_type:
            return Response(
                {'error': 'Type parameter required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        alerts = self.get_queryset().filter(alert_type=alert_type)
        serializer = AlertSerializer(alerts, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def summary(self, request):
        """Get alert summary for current user"""
        alerts = self.get_queryset()
        return Response({
            'total': alerts.count(),
            'unread': alerts.filter(is_read=False).count(),
            'critical': alerts.filter(severity='critical').count(),
            'warning': alerts.filter(severity='warning').count(),
            'info': alerts.filter(severity='info').count(),
            'dismissed': alerts.filter(is_dismissed=True).count(),
        })
