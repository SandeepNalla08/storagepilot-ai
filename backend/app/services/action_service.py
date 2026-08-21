from datetime import datetime
from uuid import uuid4

from sqlalchemy.orm import sessionmaker

from backend.app.database import engine
from backend.app.models import StorageAction


SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)


class ActionService:

    # -------------------------------------------------
    # CONVERT DATABASE MODEL TO API DICTIONARY
    # -------------------------------------------------

    def _to_dict(self, action: StorageAction):
        return {
            "id": action.action_id,
            "action_type": action.action_type,
            "resource": action.resource,
            "details": action.details,
            "status": action.status,
            "requested_by": action.requested_by,
            "simulation_mode": action.simulation_mode,
            "executed": action.executed,
            "created_at": (
                action.created_at.isoformat()
                if action.created_at
                else None
            ),
            "approved_at": (
                action.approved_at.isoformat()
                if action.approved_at
                else None
            ),
            "rejected_at": (
                action.rejected_at.isoformat()
                if action.rejected_at
                else None
            ),
            "executed_at": (
                action.executed_at.isoformat()
                if action.executed_at
                else None
            ),
        }

    # -------------------------------------------------
    # PROPOSE ACTION
    # -------------------------------------------------

    def propose_action(
        self,
        action_type: str,
        resource: str,
        details: dict,
        requested_by: str = "StoragePilot AI",
    ):
        db = SessionLocal()

        try:
            action = StorageAction(
                action_id=str(uuid4()),
                action_type=action_type,
                resource=resource,
                details=details,
                status="awaiting_approval",
                requested_by=requested_by,
                simulation_mode=True,
                executed=False,
            )

            db.add(action)
            db.commit()
            db.refresh(action)

            return self._to_dict(action)

        finally:
            db.close()

    # -------------------------------------------------
    # GET ALL ACTIONS
    # -------------------------------------------------

    def get_actions(self):
        db = SessionLocal()

        try:
            actions = (
                db.query(StorageAction)
                .order_by(StorageAction.created_at.desc())
                .all()
            )

            return [
                self._to_dict(action)
                for action in actions
            ]

        finally:
            db.close()

    # -------------------------------------------------
    # APPROVE ACTION
    # -------------------------------------------------

    def approve_action(self, action_id: str):
        db = SessionLocal()

        try:
            action = (
                db.query(StorageAction)
                .filter(
                    StorageAction.action_id == action_id
                )
                .first()
            )

            if not action:
                return {
                    "success": False,
                    "message": "Action not found.",
                }

            if action.status != "awaiting_approval":
                return {
                    "success": False,
                    "message": (
                        f"Action is already {action.status}."
                    ),
                    "action": self._to_dict(action),
                }

            action.status = "approved"
            action.approved_at = datetime.utcnow()

            # IMPORTANT:
            # No real ONTAP operation is executed yet.
            action.executed = False

            db.commit()
            db.refresh(action)

            return {
                "success": True,
                "message": (
                    "Action approved. Simulation mode is enabled, "
                    "so no ONTAP change was executed."
                ),
                "action": self._to_dict(action),
            }

        finally:
            db.close()

    # -------------------------------------------------
    # REJECT ACTION
    # -------------------------------------------------

    def reject_action(self, action_id: str):
        db = SessionLocal()

        try:
            action = (
                db.query(StorageAction)
                .filter(
                    StorageAction.action_id == action_id
                )
                .first()
            )

            if not action:
                return {
                    "success": False,
                    "message": "Action not found.",
                }

            if action.status != "awaiting_approval":
                return {
                    "success": False,
                    "message": (
                        f"Action is already {action.status}."
                    ),
                    "action": self._to_dict(action),
                }

            action.status = "rejected"
            action.rejected_at = datetime.utcnow()

            db.commit()
            db.refresh(action)

            return {
                "success": True,
                "message": "Action rejected.",
                "action": self._to_dict(action),
            }

        finally:
            db.close()


action_service = ActionService()