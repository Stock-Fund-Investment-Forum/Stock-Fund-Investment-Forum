import asyncio
from typing import Optional
from datetime import datetime

from ..database import SessionLocal
from .. import crud, schemas

_task: Optional[asyncio.Task] = None
_stopped = False


def _fetch_demo_market_data():
    """示例行情数据源 — 开发/演示用。替换为真实行情接口调用。"""
    # 返回一个列表，每项包含 symbol/name/last_price/change/percent_change/volume/market_time
    now = datetime.utcnow()
    return [
        {
            "symbol": "STR0001",
            "name": "示例股票",
            "last_price": 10.5,
            "change": 0.5,
            "percent_change": 5.0,
            "volume": 1000,
            "market_time": now,
        }
    ]


async def _run(interval_seconds: int = 60):
    global _stopped
    while not _stopped:
        try:
            data = _fetch_demo_market_data()
            db = SessionLocal()
            try:
                for d in data:
                    s = schemas.StockInfoCreate(
                        symbol=d.get("symbol"),
                        name=d.get("name"),
                        last_price=d.get("last_price", 0),
                        change=d.get("change", 0),
                        percent_change=d.get("percent_change", 0),
                        volume=d.get("volume", 0),
                        market_time=d.get("market_time"),
                    )
                    crud.create_or_update_stock(db, s)
            finally:
                db.close()
        except Exception:
            # 不让单次错误中断循环，开发阶段简单忽略或打印
            import traceback

            traceback.print_exc()
        await asyncio.sleep(interval_seconds)


def start(interval_seconds: int = 60):
    """在事件循环中启动后台更新任务（非阻塞）。"""
    global _task, _stopped
    _stopped = False
    loop = asyncio.get_event_loop()
    if _task is None or _task.done():
        _task = loop.create_task(_run(interval_seconds))


def stop():
    """停止后台任务，等待取消。"""
    global _task, _stopped
    _stopped = True
    if _task is not None:
        _task.cancel()
        _task = None
