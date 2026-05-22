import os

from fastapi import FastAPI

from .database import Base, engine, cleanup_invalid_post_enums
from .routers import (
    auth as auth_router,
    users as users_router,
    boards as boards_router,
    posts as posts_router,
    comments as comments_router,
    tags as tags_router,
    stocks as stocks_router,
    audit as audit_router,
)
from .tasks import market_updater

app = FastAPI(title="Stock & Fund Investment Forum API (FastAPI)")


@app.on_event("startup")
def on_startup() -> None:
    if os.getenv("AUTO_CREATE_TABLES", "false").lower() == "true":
        Base.metadata.create_all(bind=engine)

    # 修复旧数据里非法的 posts 枚举值，避免 include_deleted 列表读取时 500
    cleanup_invalid_post_enums()

    host = os.getenv("APP_HOST", "0.0.0.0")
    port = os.getenv("APP_PORT", "8080")
    public_host = "localhost" if host in {"0.0.0.0", "::", "127.0.0.1"} else host
    print(f"Debug URL: http://{public_host}:{port}/")
    print(f"Docs URL:  http://{public_host}:{port}/docs")
    # 启动轻量行情更新任务（开发/演示用）
    try:
        market_updater.start(
            interval_seconds=int(os.getenv("MARKET_UPDATE_INTERVAL", "60"))
        )
    except Exception:
        print("[market_updater] failed to start background updater")


app.include_router(auth_router.router)
app.include_router(users_router.router)
app.include_router(boards_router.router)
app.include_router(posts_router.router)
app.include_router(comments_router.router)
app.include_router(tags_router.router)
app.include_router(stocks_router.router)
app.include_router(audit_router.router)


@app.get("/")
def root():
    return {"message": "Stock & Fund Investment Forum API"}


@app.on_event("shutdown")
def on_shutdown() -> None:
    try:
        market_updater.stop()
    except Exception:
        pass
