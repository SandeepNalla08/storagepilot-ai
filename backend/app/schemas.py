from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class ClusterCreate(BaseModel):
    name: str
    hostname: str
    ontap_version: Optional[str] = None
    status: Optional[str] = "unknown"


class ClusterResponse(BaseModel):
    id: int
    name: str
    hostname: str
    ontap_version: Optional[str] = None
    status: str
    last_sync: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True