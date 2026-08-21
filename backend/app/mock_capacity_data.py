MOCK_CAPACITY = {
    "summary": {
        "total_tb": 20,
        "used_tb": 14.8,
        "available_tb": 5.2,
        "utilization_percent": 74,
    },

    "volumes": [
        {
            "name": "prod_data",
            "size_gb": 1000,
            "used_gb": 820,
            "utilization_percent": 82,
            "daily_growth_gb": 4.2,
            "days_to_90_percent": 19,
            "risk": "high",
            "recommendation": (
                "Review snapshot consumption and "
                "prepare additional capacity."
            ),
        },

        {
            "name": "backup_data",
            "size_gb": 2000,
            "used_gb": 1240,
            "utilization_percent": 62,
            "daily_growth_gb": 2.1,
            "days_to_90_percent": 266,
            "risk": "low",
            "recommendation": (
                "Capacity is within normal operating range."
            ),
        },
    ],
}