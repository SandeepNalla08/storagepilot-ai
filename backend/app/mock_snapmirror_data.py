MOCK_SNAPMIRROR = {
    "records": [
        {
            "uuid": "sm-001",
            "source": {
                "svm": "svm_prod",
                "volume": "prod_data",
            },
            "destination": {
                "svm": "svm_dr",
                "volume": "prod_data_dr",
            },
            "state": "snapmirrored",
            "healthy": True,
            "lag_time": "00:12:35",
            "policy": "MirrorAndVault",
            "schedule": "hourly",
            "last_transfer_status": "success",
        },
        {
            "uuid": "sm-002",
            "source": {
                "svm": "svm_prod",
                "volume": "backup_data",
            },
            "destination": {
                "svm": "svm_dr",
                "volume": "backup_data_dr",
            },
            "state": "snapmirrored",
            "healthy": False,
            "lag_time": "05:42:10",
            "policy": "MirrorAllSnapshots",
            "schedule": "hourly",
            "last_transfer_status": "failed",
        },
    ],
    "num_records": 2,
}