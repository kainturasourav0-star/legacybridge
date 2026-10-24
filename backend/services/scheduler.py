import logging
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger

logger = logging.getLogger("legacybridge.scheduler")

scheduler = AsyncIOScheduler()

def start_scheduler():
    if not scheduler.running:
        scheduler.start()
        logger.info("APScheduler initialized for automated LegacyBridge recurring runs.")

def stop_scheduler():
    if scheduler.running:
        scheduler.shutdown(wait=False)
        logger.info("APScheduler stopped.")

def schedule_task_job(task_id: str, cron_expr: str):
    """Schedules a recurring task run with cron expression."""
    from backend.services.orchestrator import run_pipeline
    trigger = CronTrigger.from_crontab(cron_expr)
    job_id = f"task-cron-{task_id}"
    scheduler.add_job(
        run_pipeline,
        trigger=trigger,
        id=job_id,
        args=[task_id],
        replace_existing=True
    )
    logger.info(f"Scheduled task {task_id} with cron '{cron_expr}' as job {job_id}")
    return job_id

def remove_task_job(task_id: str):
    """Removes a scheduled job."""
    job_id = f"task-cron-{task_id}"
    if scheduler.get_job(job_id):
        scheduler.remove_job(job_id)
        logger.info(f"Removed scheduled job {job_id}")
        return True
    return False

def list_scheduled_jobs():
    """Returns list of active scheduled jobs."""
    results = []
    for job in scheduler.get_jobs():
        nrt = getattr(job, "next_run_time", None)
        results.append({
            "id": job.id,
            "next_run_time": str(nrt) if nrt else None,
            "name": getattr(job, "name", str(job.id))
        })
    return results
