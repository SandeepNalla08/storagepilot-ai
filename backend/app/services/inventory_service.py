from backend.app.settings import settings

from backend.app.mock_ontap_data import (
    MOCK_CLUSTER,
    MOCK_VOLUMES,
    MOCK_SVMS,
    MOCK_AGGREGATES,
)

from backend.app.mock_snapmirror_data import MOCK_SNAPMIRROR

from backend.app.services.ontap_service import OntapService


class InventoryService:

    # -------------------------------------------------
    # CHECK CURRENT MODE
    # -------------------------------------------------

    def is_mock_mode(self):
        return settings.mode.lower() == "mock"

    # -------------------------------------------------
    # CREATE REAL ONTAP SERVICE
    # -------------------------------------------------

    def _get_real_ontap_service(self):

        if not settings.ontap_hostname:
            raise ValueError(
                "Real ONTAP mode is enabled, but no ONTAP "
                "hostname is configured."
            )

        if not settings.ontap_username:
            raise ValueError(
                "Real ONTAP mode is enabled, but no ONTAP "
                "username is configured."
            )

        if not settings.ontap_password:
            raise ValueError(
                "Real ONTAP mode is enabled, but no ONTAP "
                "password is configured."
            )

        return OntapService(
            hostname=settings.ontap_hostname,
            username=settings.ontap_username,
            password=settings.ontap_password,
        )

    # -------------------------------------------------
    # CLUSTER
    # -------------------------------------------------

    def get_cluster(self):

        if self.is_mock_mode():
            return MOCK_CLUSTER

        service = self._get_real_ontap_service()

        return service.get_cluster()

    # -------------------------------------------------
    # VOLUMES
    # -------------------------------------------------

    def get_volumes(self):

        if self.is_mock_mode():
            return MOCK_VOLUMES

        service = self._get_real_ontap_service()

        return service.get_volumes()

    # -------------------------------------------------
    # SVMS
    # -------------------------------------------------

    def get_svms(self):

        if self.is_mock_mode():
            return MOCK_SVMS

        service = self._get_real_ontap_service()

        return service.get_svms()

    # -------------------------------------------------
    # AGGREGATES
    # -------------------------------------------------

    def get_aggregates(self):

        if self.is_mock_mode():
            return MOCK_AGGREGATES

        service = self._get_real_ontap_service()

        return service.get_aggregates()

    # -------------------------------------------------
    # SNAPMIRROR
    # -------------------------------------------------

    def get_snapmirror_relationships(self):

        if self.is_mock_mode():
            return MOCK_SNAPMIRROR

        service = self._get_real_ontap_service()

        return service.get_snapmirror_relationships()

    # -------------------------------------------------
    # COMPLETE INVENTORY
    # -------------------------------------------------

    def get_inventory(self):

        return {
            "mode": settings.mode,
            "cluster": self.get_cluster(),
            "volumes": self.get_volumes(),
            "svms": self.get_svms(),
            "aggregates": self.get_aggregates(),
            "snapmirror": self.get_snapmirror_relationships(),
        }