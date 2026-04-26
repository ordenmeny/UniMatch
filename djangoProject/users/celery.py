import os
from celery import Celery
from django.conf import settings

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "djangoProject.settings")

app = Celery("proj")

# Детекция: запущено ли сейчас тестирование.
# TESTING = 'test' in sys.argv
# TESTING = TESTING or 'test_coverage' in sys.argv or 'pytest' in sys.modules
CELERY = {
    "broker_url": "redis://redis:6379/0",
    # 'task_always_eager': TESTING,
    "timezone": settings.TIME_ZONE,
    "result_backend": "django-db",
    "result_extended": True,
    "task_track_started": True,
    "include": [
        "users.celery_tasks",
    ],
}

app.config_from_object(CELERY)
app.autodiscover_tasks()
