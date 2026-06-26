import os
from contextlib import asynccontextmanager

from fastapi import FastAPI

from .database import Base, engine, SessionLocal, cleanup_invalid_post_enums
from .routers import (
    auth as auth_router,
    users as users_router,
    boards as boards_router,
    attachments as attachments_router,
    polls as polls_router,
    engagements as engagements_router,
    messages as messages_router,
    notifications as notifications_router,
    posts as posts_router,
    comments as comments_router,
    tags as tags_router,
    stocks as stocks_router,
    audit as audit_router,
    groups as groups_router,
    admin as admin_router,
)
from .tasks import market_updater

# app/main.py 示例
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy import text


def seed_default_data():
    db = SessionLocal()
    try:
        from .models import Board, Tag
        default_boards = [
            ("a-stock", "A股讨论区", "STOCKS"),
            ("hk-stock", "港股讨论区", "STOCKS"),
            ("us-stock", "美股讨论区", "STOCKS"),
            ("fund", "基金投资", "FUNDS"),
            ("value-investing", "价值投资专区", "ANALYSIS"),
            ("quantitative", "量化投资专区", "ANALYSIS"),
            ("new-issues", "新股/新债讨论", "NEWS"),
            ("macro", "宏观策略研讨", "ANALYSIS"),
            ("company-research", "公司研究专区", "ANALYSIS"),
            ("qa", "问答求助区", "QUESTIONS"),
        ]
        for bid, bname, bcat in default_boards:
            existing = db.query(Board).filter(Board.board_id == bid).first()
            if not existing:
                board = Board(board_id=bid, name=bname, category=bcat)
                db.add(board)

        default_tags = [
            ("技术分析", "STOCK"), ("基本面分析", "STOCK"),
            ("价值投资", "STRATEGY"), ("量化策略", "STRATEGY"),
            ("市场情绪", "ANALYSIS"), ("宏观经济", "ANALYSIS"),
            ("ETF", "FUND"), ("主动基金", "FUND"),
            ("新股申购", "NEWS"), ("政策解读", "NEWS"),
        ]
        for tname, tcat in default_tags:
            existing = db.query(Tag).filter(Tag.name == tname).first()
            if not existing:
                tag = Tag(name=tname, category=tcat, is_hot=True)
                db.add(tag)
        db.commit()
    except Exception:
        db.rollback()
    finally:
        db.close()


@asynccontextmanager
async def lifespan(app: FastAPI):
    if os.getenv("AUTO_CREATE_TABLES", "false").lower() == "true":
        Base.metadata.create_all(bind=engine)

    # 修复旧数据里非法的 posts 枚举值，避免 include_deleted 列表读取时 500
    cleanup_invalid_post_enums()

    # 初始化默认板块和标签（幂等）
    seed_default_data()

    host = os.getenv("APP_HOST", "0.0.0.0")
    port = os.getenv("APP_PORT", "8080")
    public_host = "localhost" if host in {"0.0.0.0", "::", "127.0.0.1"} else host
    print(f"Debug URL: http://{public_host}:{port}/")
    print(f"Docs URL:  http://{public_host}:{port}/docs")
    # 启动轻量行情更新任务（开发/演示用）
    try:
        market_updater.start(interval_seconds=int(os.getenv("MARKET_UPDATE_INTERVAL", "60")))
    except Exception:
        print("[market_updater] failed to start background updater")

    yield

    try:
        market_updater.stop()
    except Exception:
        pass


app = FastAPI(title="Stock & Fund Investment Forum API (FastAPI)", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:6789","http://127.0.0.1:6789","http://localhost:5173","http://127.0.0.1:5173"], # 允许前端地址
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def include_router_both(router, prefix="/api/v1"):
    app.include_router(router, prefix=prefix)
    app.include_router(router, prefix="", include_in_schema=False)


include_router_both(auth_router.router)
include_router_both(users_router.router)
include_router_both(attachments_router.router)
include_router_both(polls_router.router)
include_router_both(engagements_router.router)
include_router_both(messages_router.router)
include_router_both(notifications_router.router)
include_router_both(boards_router.router)
include_router_both(posts_router.router)
include_router_both(comments_router.router)
include_router_both(tags_router.router)
include_router_both(stocks_router.router)
include_router_both(audit_router.router)
include_router_both(groups_router.router)
include_router_both(admin_router.router)


@app.get("/")
def root():
    return {"message": "Stock & Fund Investment Forum API"}


@app.get("/health")
def health():
    """轻量健康检查：检测数据库是否可达。"""
    try:
        # 简单执行 SELECT 1 验证 DB 连接
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        return {"status": "ok"}
    except Exception as e:
        return JSONResponse(status_code=503, content={"status": "error", "detail": str(e)})


