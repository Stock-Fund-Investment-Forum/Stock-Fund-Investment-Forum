import os

from fastapi import FastAPI

from .database import Base, engine
from .routers import auth as auth_router, users as users_router

app = FastAPI(title="Stock & Fund Investment Forum API (FastAPI)")


@app.on_event("startup")
def on_startup() -> None:
    if os.getenv("AUTO_CREATE_TABLES", "false").lower() == "true":
        Base.metadata.create_all(bind=engine)

    host = os.getenv("APP_HOST", "0.0.0.0")
    port = os.getenv("APP_PORT", "8080")
    public_host = "localhost" if host in {"0.0.0.0", "::", "127.0.0.1"} else host
    print(f"Debug URL: http://{public_host}:{port}/")
    print(f"Docs URL:  http://{public_host}:{port}/docs")


app.include_router(auth_router.router)
app.include_router(users_router.router)


@app.get("/")
def root():
    return {"message": "Stock & Fund Investment Forum API"}
