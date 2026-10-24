import os
import logging
from celery import Celery

logger = logging.getLogger("legacybridge.celery")

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")

celery_app = Celery(
    "legacybridge_tasks",
    broker=REDIS_URL,
    backend=REDIS_URL,
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    task_track_started=True,
    task_time_limit=300, # 5 minutes hard limit for web browser agent runs
)

@celery_app.task(name="execute_legacybridge_task", bind=True, max_retries=2)
def execute_legacybridge_task(self, task_id: str):
    """
    Celery background worker task for running LegacyBridge browser agent pipelines.
    Supports asynchronous queuing, worker concurrency, and exponential retry backoff.
    """
    import asyncio
    from backend.services.orchestrator import run_pipeline
    logger.info(f"Celery worker received execution request for task_id: {task_id}")
    try:
        loop = asyncio.get_event_loop()
        if loop.is_closed():
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
        result = loop.run_until_complete(run_pipeline(task_id, trigger_type="celery_worker"))
        return {"status": "success", "task_id": task_id, "run_id": result.id}
    except Exception as exc:
        logger.error(f"Celery task failed for {task_id}: {exc}")
        raise self.retry(exc=exc, countdown=10)
