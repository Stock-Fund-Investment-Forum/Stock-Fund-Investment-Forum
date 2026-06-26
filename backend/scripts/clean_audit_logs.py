from sqlalchemy import text
from app.database import engine

TARGET_ACTIONS = [
    "REPORT_VIOLATION_ON_TARGET",
    "RESOLVE_VIOLATION_ON_TARGET",
]


def _actions_sql_list(actions):
    return ",".join(f"'{a}'" for a in actions)


def main():
    with engine.begin() as conn:
        # 查询将被删除的记录
        rows = conn.execute(
            text(
                f"SELECT audit_id, action, target_type, target_id, actor_id, created_at FROM audit_logs WHERE action IN ({_actions_sql_list(TARGET_ACTIONS)}) ORDER BY created_at DESC"
            )
        ).fetchall()

        print(f"Found {len(rows)} matching audit_logs records to backup/delete")
        for r in rows[:50]:
            print(r)

        if not rows:
            print("No records to delete. Exiting.")
            return

        # 创建备份表（兼容 MySQL 和 SQLite）
        dialect = engine.dialect.name
        print(f"Using dialect: {dialect}")
        if dialect == "sqlite":
            # SQLite: create backup via CTAS with zero rows if not exists
            conn.execute(
                text(
                    "CREATE TABLE IF NOT EXISTS audit_logs_backup AS SELECT * FROM audit_logs WHERE 0"
                )
            )
        else:
            # MySQL and others: try LIKE pattern (MySQL supports it)
            try:
                conn.execute(
                    text("CREATE TABLE IF NOT EXISTS audit_logs_backup LIKE audit_logs")
                )
            except Exception:
                # Fallback to CTAS with zero rows
                conn.execute(
                    text(
                        "CREATE TABLE IF NOT EXISTS audit_logs_backup AS SELECT * FROM audit_logs WHERE 0"
                    )
                )

        # 备份要删除的行
        insert_sql = text(
            f"INSERT INTO audit_logs_backup SELECT * FROM audit_logs WHERE action IN ({_actions_sql_list(TARGET_ACTIONS)})"
        )
        res = conn.execute(insert_sql)
        print(f"Backed up rows: {res.rowcount}")

        # 删除原表中的行
        delete_sql = text(
            f"DELETE FROM audit_logs WHERE action IN ({_actions_sql_list(TARGET_ACTIONS)})"
        )
        res2 = conn.execute(delete_sql)
        print(f"Deleted rows: {res2.rowcount}")


if __name__ == "__main__":
    main()
