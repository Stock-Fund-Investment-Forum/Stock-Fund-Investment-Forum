import os
from pathlib import Path
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, declarative_base
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv(
    "DATABASE_URL", "mysql+pymysql://root:example@127.0.0.1:3306/stock_fund_forum"
)


def _create_engine(database_url: str):
    if database_url.startswith("sqlite"):
        return create_engine(
            database_url,
            connect_args={"check_same_thread": False},
        )
    return create_engine(database_url, pool_pre_ping=True)


def _build_engine():
    engine = _create_engine(DATABASE_URL)
    fallback_enabled = os.getenv("SQLITE_FALLBACK", "true").lower() == "true"
    if not fallback_enabled or DATABASE_URL.startswith("sqlite"):
        return engine

    try:
        with engine.connect():
            return engine
    except Exception:
        fallback_path = Path(__file__).resolve().parents[1] / "stock_fund_forum.db"
        fallback_url = f"sqlite+pysqlite:///{fallback_path.as_posix()}"
        print(
            "[database] Falling back to local SQLite because the configured DB is unreachable: "
            f"{DATABASE_URL} -> {fallback_url}"
        )
        return _create_engine(fallback_url)


def cleanup_invalid_post_enums() -> None:
    """把 posts 表里非法的枚举值修正为默认合法值。

    旧版本或手工写入的脏数据可能让 SQLAlchemy 在读取时直接报错，
    这里在启动时做一次温和修复，避免列表接口因为一条坏数据整体 500。
    """
    valid_post_types = ("QUESTION", "DISCUSSION", "ANALYSIS", "NEWS", "GUIDE")
    valid_post_statuses = ("DRAFT", "PUBLISHED", "ARCHIVED", "DELETED")
    valid_audit_statuses = ("PENDING", "APPROVED", "REJECTED", "FLAGGED")

    def _sql_in_list(values: tuple[str, ...]) -> str:
        return ", ".join(f"'{value}'" for value in values)

    with engine.begin() as conn:
        conn.execute(
            text(
                "UPDATE posts SET post_type = :default_value "
                f"WHERE post_type IS NOT NULL AND post_type NOT IN ({_sql_in_list(valid_post_types)})"
            ),
            {"default_value": "DISCUSSION"},
        )
        conn.execute(
            text(
                "UPDATE posts SET status = :default_value "
                f"WHERE status IS NOT NULL AND status NOT IN ({_sql_in_list(valid_post_statuses)})"
            ),
            {"default_value": "DELETED"},
        )
        conn.execute(
            text(
                "UPDATE posts SET audit_status = :default_value "
                f"WHERE audit_status IS NOT NULL AND audit_status NOT IN ({_sql_in_list(valid_audit_statuses)})"
            ),
            {"default_value": "APPROVED"},
        )
        # 统一软删除语义：只要 status=DELETED，则 is_deleted 也应为 true；反之亦然。
        conn.execute(text("UPDATE posts SET is_deleted = 1 WHERE status = 'DELETED'"))
        conn.execute(text("UPDATE posts SET status = 'DELETED' WHERE is_deleted = 1"))


engine = _build_engine()
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()