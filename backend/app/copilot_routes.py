from fastapi import APIRouter
from pydantic import BaseModel

from backend.app.services.copilot_service import CopilotService


router = APIRouter()


class CopilotRequest(BaseModel):
    question: str


@router.post("/copilot/chat")
def copilot_chat(request: CopilotRequest):
    service = CopilotService()

    answer = service.analyze(request.question)

    return {
        "answer": answer
    }