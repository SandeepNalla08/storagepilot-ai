MOCK_PERFORMANCE = {
    "cluster": {
        "iops": 18500,
        "latency_ms": 1.4,
        "throughput_mb_s": 920,
    },
    "volumes": [
        {
            "name": "prod_data",
            "iops": 8200,
            "latency_ms": 2.1,
            "throughput_mb_s": 410,
            "status": "warning",
        },
        {
            "name": "backup_data",
            "iops": 4300,
            "latency_ms": 1.2,
            "throughput_mb_s": 260,
            "status": "healthy",
        },
    ],
}