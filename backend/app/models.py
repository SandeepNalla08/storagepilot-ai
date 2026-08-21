from datetime import datetime

from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    Integer,
    JSON,
    String,
)

from backend.app.database import Base


# -------------------------------------------------
# CLUSTER MODEL
# -------------------------------------------------

class Cluster(Base):
    __tablename__ = "clusters"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    name = Column(
        String,
        nullable=False,
    )

    hostname = Column(
        String,
        nullable=False,
    )

    ontap_version = Column(
        String,
        nullable=True,
    )

    status = Column(
        String,
        default="unknown",
        nullable=False,
    )

    last_sync = Column(
        DateTime,
        nullable=True,
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
    )


# -------------------------------------------------
# STORAGE ACTION MODEL
# -------------------------------------------------

class StorageAction(Base):
    __tablename__ = "storage_actions"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    action_id = Column(
        String,
        unique=True,
        index=True,
        nullable=False,
    )

    action_type = Column(
        String,
        nullable=False,
    )

    resource = Column(
        String,
        nullable=False,
    )

    details = Column(
        JSON,
        nullable=False,
        default=dict,
    )

    status = Column(
        String,
        default="awaiting_approval",
        nullable=False,
    )

    requested_by = Column(
        String,
        default="StoragePilot AI",
        nullable=False,
    )

    simulation_mode = Column(
        Boolean,
        default=True,
        nullable=False,
    )

    executed = Column(
        Boolean,
        default=False,
        nullable=False,
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
    )

    approved_at = Column(
        DateTime,
        nullable=True,
    )

    rejected_at = Column(
        DateTime,
        nullable=True,
    )

    executed_at = Column(
        DateTime,
        nullable=True,
    )