from fastapi import APIRouter, HTTPException

from backend.app.services.inventory_service import InventoryService


router = APIRouter()

inventory_service = InventoryService()


# -------------------------------------------------
# COMPLETE INVENTORY
# -------------------------------------------------

@router.get("/inventory")
def get_complete_inventory():
    try:
        return inventory_service.get_inventory()

    except Exception as error:
        raise HTTPException(
            status_code=400,
            detail=str(error),
        )


# -------------------------------------------------
# CLUSTER
# -------------------------------------------------

@router.get("/inventory/cluster")
def get_inventory_cluster():
    try:
        return inventory_service.get_cluster()

    except Exception as error:
        raise HTTPException(
            status_code=400,
            detail=str(error),
        )


# -------------------------------------------------
# VOLUMES
# -------------------------------------------------

@router.get("/inventory/volumes")
def get_inventory_volumes():
    try:
        return inventory_service.get_volumes()

    except Exception as error:
        raise HTTPException(
            status_code=400,
            detail=str(error),
        )


# -------------------------------------------------
# SVMS
# -------------------------------------------------

@router.get("/inventory/svms")
def get_inventory_svms():
    try:
        return inventory_service.get_svms()

    except Exception as error:
        raise HTTPException(
            status_code=400,
            detail=str(error),
        )


# -------------------------------------------------
# AGGREGATES
# -------------------------------------------------

@router.get("/inventory/aggregates")
def get_inventory_aggregates():
    try:
        return inventory_service.get_aggregates()

    except Exception as error:
        raise HTTPException(
            status_code=400,
            detail=str(error),
        )


# -------------------------------------------------
# SNAPMIRROR
# -------------------------------------------------

@router.get("/inventory/snapmirror")
def get_inventory_snapmirror():
    try:
        return inventory_service.get_snapmirror_relationships()

    except Exception as error:
        raise HTTPException(
            status_code=400,
            detail=str(error),
        )