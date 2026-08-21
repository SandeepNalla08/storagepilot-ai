from typing import Literal


StorageMode = Literal["mock", "real"]


class ApplicationSettings:
    def __init__(self):
        self.mode: StorageMode = "mock"

        self.ontap_hostname: str | None = None
        self.ontap_username: str | None = None
        self.ontap_password: str | None = None


settings = ApplicationSettings()