import httpx


class OntapService:
    def __init__(
        self,
        hostname: str,
        username: str,
        password: str,
    ):
        self.hostname = hostname
        self.username = username
        self.password = password
        self.base_url = f"https://{hostname}/api"

    def _get(self, endpoint: str):
        url = f"{self.base_url}{endpoint}"

        try:
            with httpx.Client(
                verify=False,
                timeout=15.0,
            ) as client:
                response = client.get(
                    url,
                    auth=(
                        self.username,
                        self.password,
                    ),
                    headers={
                        "Accept": "application/json",
                    },
                )

                response.raise_for_status()

                return response.json()

        except httpx.ConnectError:
            raise RuntimeError(
                f"Unable to connect to ONTAP host: {self.hostname}"
            )

        except httpx.TimeoutException:
            raise RuntimeError(
                f"Connection to ONTAP host {self.hostname} timed out."
            )

        except httpx.HTTPStatusError as error:
            status_code = error.response.status_code

            if status_code == 401:
                raise RuntimeError(
                    "ONTAP authentication failed. "
                    "Check username and password."
                )

            if status_code == 403:
                raise RuntimeError(
                    "ONTAP API access was denied. "
                    "Check the user's permissions."
                )

            if status_code == 404:
                raise RuntimeError(
                    "The requested ONTAP API endpoint was not found."
                )

            raise RuntimeError(
                f"ONTAP API returned HTTP {status_code}: "
                f"{error.response.text}"
            )

        except httpx.RequestError as error:
            raise RuntimeError(
                f"ONTAP request failed: {str(error)}"
            )

    # -------------------------------------------------
    # CLUSTER
    # -------------------------------------------------

    def get_cluster(self):
        return self._get("/cluster")

    # -------------------------------------------------
    # VOLUMES
    # -------------------------------------------------

    def get_volumes(self):
        return self._get(
            "/storage/volumes"
            "?fields=name,state,size,space,svm,aggregates"
        )

    # -------------------------------------------------
    # SVMS
    # -------------------------------------------------

    def get_svms(self):
        return self._get(
            "/svm/svms"
            "?fields=name,state,uuid,subtype"
        )

    # -------------------------------------------------
    # AGGREGATES
    # -------------------------------------------------

    def get_aggregates(self):
        return self._get(
            "/storage/aggregates"
            "?fields=name,state,space,block_storage"
        )

    # -------------------------------------------------
    # SNAPMIRROR
    # -------------------------------------------------

    def get_snapmirror_relationships(self):
        return self._get(
            "/snapmirror/relationships"
            "?fields=source,destination,state,healthy,"
            "lag_time,policy,transfer"
        )