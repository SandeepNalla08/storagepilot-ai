from fastapi import APIRouter
from pydantic import BaseModel

from backend.app.services.action_service import action_service


router = APIRouter()


class ActionRequest(BaseModel):
    action_type: str
    resource: str
    details: dict


@router.get("/actions")
def get_actions():
    actions = action_service.get_actions()

    return {
        "records": actions,
        "num_records": len(actions),
    }


@router.post("/actions/propose")
def propose_action(request: ActionRequest):
    action = action_service.propose_action(
        action_type=request.action_type,
        resource=request.resource,
        details=request.details,
    )

    return {
        "success": True,
        "action": action,
    }


@router.post("/actions/{action_id}/approve")
def approve_action(action_id: str):
    return action_service.approve_action(action_id)


@router.post("/actions/{action_id}/reject")
def reject_action(action_id: str):
    return action_service.reject_action(action_id)