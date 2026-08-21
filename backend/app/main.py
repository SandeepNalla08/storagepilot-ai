from backend.app.action_routes import router as action_router
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware

from sqlalchemy import text
from sqlalchemy.orm import Session

from backend.app.database import engine, Base, get_db
from backend.app import models
from backend.app.schemas import ClusterCreate, ClusterResponse

from backend.app.ontap_routes import router as ontap_router
from backend.app.copilot_routes import router as copilot_router
from backend.app.settings_routes import router as settings_router
from backend.app.inventory_routes import router as inventory_router
from backend.app.action_routes import router as action_router


# -------------------------------------------------
# CREATE DATABASE TABLES
# -------------------------------------------------

Base.metadata.create_all(bind=engine)


# -------------------------------------------------
# CREATE FASTAPI APPLICATION
# -------------------------------------------------

app = FastAPI(
    title="StoragePilot AI",
    description="AI Copilot for Enterprise Storage Operations",
    version="0.1.0",
)


# -------------------------------------------------
# CORS CONFIGURATION
# -------------------------------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# -------------------------------------------------
# LOAD ROUTERS
# -------------------------------------------------

app.include_router(ontap_router)
app.include_router(copilot_router)
app.include_router(settings_router)
app.include_router(inventory_router)
app.include_router(action_router)


# -------------------------------------------------
# ROOT ENDPOINT
# -------------------------------------------------

@app.get("/")
def root():
    return {
        "message": "Welcome to StoragePilot AI",
        "status": "running",
    }


# -------------------------------------------------
# DATABASE HEALTH ENDPOINT
# -------------------------------------------------

@app.get("/health/database")
def database_health():
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))

        return {
            "database": "connected",
            "status": "healthy",
        }

    except Exception as error:
        return {
            "database": "disconnected",
            "status": "error",
            "detail": str(error),
        }


# -------------------------------------------------
# CREATE CLUSTER
# -------------------------------------------------

@app.post("/clusters", response_model=ClusterResponse)
def create_cluster(
    cluster: ClusterCreate,
    db: Session = Depends(get_db),
):
    new_cluster = models.Cluster(
        name=cluster.name,
        hostname=cluster.hostname,
        ontap_version=cluster.ontap_version,
        status=cluster.status,
    )

    db.add(new_cluster)
    db.commit()
    db.refresh(new_cluster)

    return new_cluster


# -------------------------------------------------
# GET CLUSTERS
# -------------------------------------------------

@app.get("/clusters", response_model=list[ClusterResponse])
def get_clusters(
    db: Session = Depends(get_db),
):
    clusters = db.query(models.Cluster).all()

    return clusters