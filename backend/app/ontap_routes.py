from backend.app.mock_capacity_data import MOCK_CAPACITY
from backend.app.mock_performance_data import MOCK_PERFORMANCE
from backend.app.mock_snapmirror_data import MOCK_SNAPMIRROR
from backend.app.mock_alert_data import MOCK_ALERTS
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from backend.app.services.ontap_service import OntapService
from backend.app.mock_ontap_data import (
    MOCK_CLUSTER,
    MOCK_VOLUMES,
    MOCK_SVMS,
    MOCK_AGGREGATES,
)


router = APIRouter()


class OntapConnectionRequest(BaseModel):
    hostname: str
    username: str
    password: str


# -------------------------------------------------
# REAL ONTAP ENDPOINTS
# -------------------------------------------------

@router.post("/ontap/test-connection")
def test_ontap_connection(request: OntapConnectionRequest):
    try:
        service = OntapService(
            hostname=request.hostname,
            username=request.username,
            password=request.password,
        )

        cluster_data = service.get_cluster()

        return {
            "connected": True,
            "cluster_data": cluster_data,
        }

    except Exception as error:
        raise HTTPException(
            status_code=400,
            detail=str(error),
        )


@router.post("/ontap/volumes")
def get_ontap_volumes(request: OntapConnectionRequest):
    try:
        service = OntapService(
            hostname=request.hostname,
            username=request.username,
            password=request.password,
        )

        return service.get_volumes()

    except Exception as error:
        raise HTTPException(
            status_code=400,
            detail=str(error),
        )


@router.post("/ontap/svms")
def get_ontap_svms(request: OntapConnectionRequest):
    try:
        service = OntapService(
            hostname=request.hostname,
            username=request.username,
            password=request.password,
        )

        return service.get_svms()

    except Exception as error:
        raise HTTPException(
            status_code=400,
            detail=str(error),
        )


@router.post("/ontap/aggregates")
def get_ontap_aggregates(request: OntapConnectionRequest):
    try:
        service = OntapService(
            hostname=request.hostname,
            username=request.username,
            password=request.password,
        )

        return service.get_aggregates()

    except Exception as error:
        raise HTTPException(
            status_code=400,
            detail=str(error),
        )

# -------------------------------------------------
# MOCK ONTAP ENDPOINTS
# -------------------------------------------------

@router.get("/mock/ontap/cluster")
def mock_cluster():
    return MOCK_CLUSTER


@router.get("/mock/ontap/volumes")
def mock_volumes():
    return MOCK_VOLUMES


@router.get("/mock/ontap/svms")
def mock_svms():
    return MOCK_SVMS


@router.get("/mock/ontap/aggregates")
def mock_aggregates():
    return MOCK_AGGREGATES

@router.get("/mock/ontap/alerts")
def mock_alerts():
    return MOCK_ALERTS
@router.get("/mock/ontap/snapmirror")
def mock_snapmirror():
    return MOCK_SNAPMIRROR

@router.get("/mock/ontap/performance")
def mock_performance():
    return MOCK_PERFORMANCE

@router.get("/mock/ontap/capacity")
def mock_capacity():
    return MOCK_CAPACITY