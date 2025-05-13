from django.apps import AppConfig


class BisManagerConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "bis_manager"
    
    def ready(self):
        import bis_manager.signals # 시그널 등록
