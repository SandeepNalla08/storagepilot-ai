MOCK_CLUSTER = {
    "name": "cluster1",
    "uuid": "mock-cluster-uuid",
    "version": {
        "full": "NetApp Release ONTAP 9.15.1"
    },
    "status": "healthy"
}


MOCK_VOLUMES = {
    "records": [
        {
            "name": "prod_data",
            "uuid": "vol-001",
            "state": "online",
            "size": 107374182400,
            "space": {
                "used": 75161927680,
                "available": 32212254720
            }
        },
        {
            "name": "backup_data",
            "uuid": "vol-002",
            "state": "online",
            "size": 214748364800,
            "space": {
                "used": 128849018880,
                "available": 85899345920
            }
        }
    ],
    "num_records": 2
}


MOCK_SVMS = {
    "records": [
        {
            "name": "svm_prod",
            "uuid": "svm-001",
            "state": "running"
        },
        {
            "name": "svm_backup",
            "uuid": "svm-002",
            "state": "running"
        }
    ],
    "num_records": 2
}


MOCK_AGGREGATES = {
    "records": [
        {
            "name": "aggr1",
            "uuid": "aggr-001",
            "state": "online",
            "space": {
                "block_storage": {
                    "size": 536870912000,
                    "used": 322122547200,
                    "available": 214748364800
                }
            }
        },
        {
            "name": "aggr2",
            "uuid": "aggr-002",
            "state": "online",
            "space": {
                "block_storage": {
                    "size": 1073741824000,
                    "used": 644245094400,
                    "available": 429496729600
                }
            }
        }
    ],
    "num_records": 2
}