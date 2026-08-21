from fastapi import APIRouter
from pydantic import BaseModel

from backend.app.settings import settings
from backend.app.services.ontap_service import OntapService


router = APIRouter()


class ModeRequest(BaseModel):
    mode: str


class OntapConnectionSettingsRequest(BaseModel):
    hostname: str
    username: str
    password: str


class OntapConnectionTestRequest(BaseModel):
    hostname: str
    username: str
    password: str


# -------------------------------------------------
# GET SETTINGS
# -------------------------------------------------

@router.get("/settings")
def get_settings():
    return {
        "mode": settings.mode,
        "ontap_hostname": settings.ontap_hostname,
        "ontap_username": settings.ontap_username,
        "has_password": settings.ontap_password is not None,
    }


# -------------------------------------------------
# UPDATE STORAGE MODE
# -------------------------------------------------

@router.post("/settings/mode")
def set_mode(request: ModeRequest):
    if request.mode not in ["mock", "real"]:
        return {
            "success": False,
            "message": "Mode must be mock or real.",
        }

    settings.mode = request.mode

    return {
        "success": True,
        "mode": settings.mode,
    }


# -------------------------------------------------
# SAVE ONTAP SETTINGS
# -------------------------------------------------

@router.post("/settings/ontap")
def save_ontap_settings(
    request: OntapConnectionSettingsRequest,
):
    settings.ontap_hostname = request.hostname.strip()
    settings.ontap_username = request.username.strip()
    settings.ontap_password = request.password

    return {
        "success": True,
        "message": (
            "ONTAP connection settings saved "
            "for this backend session."
        ),
        "hostname": settings.ontap_hostname,
        "username": settings.ontap_username,
        "has_password": True,
    }


# -------------------------------------------------
# TEST ONTAP CONNECTION
# -------------------------------------------------

@router.post("/settings/ontap/test")
def test_ontap_connection(
    request: OntapConnectionTestRequest,
):
    try:
        service = OntapService(
            hostname=request.hostname.strip(),
            username=request.username.strip(),
            password=request.password,
        )

        cluster = service.get_cluster()

        return {
            "success": True,
            "message": "ONTAP connection successful.",
            "cluster": {
                "name": cluster.get("name"),
                "uuid": cluster.get("uuid"),
                "version": cluster.get("version"),
            },
        }

    except Exception as error:
        return {
            "success": False,
            "message": str(error),
        }