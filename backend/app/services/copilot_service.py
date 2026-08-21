import json

from backend.app.mock_alert_data import MOCK_ALERTS
from backend.app.mock_capacity_data import MOCK_CAPACITY
from backend.app.mock_performance_data import MOCK_PERFORMANCE
from backend.app.mock_snapmirror_data import MOCK_SNAPMIRROR

from backend.app.services.inventory_service import InventoryService
from backend.app.services.llm_service import LLMService
from backend.app.services.action_service import action_service


class CopilotService:
    def __init__(self):
        self.inventory_service = InventoryService()
        self.llm_service = LLMService()

        self.alerts = MOCK_ALERTS.get("records", [])
        self.capacity = MOCK_CAPACITY
        self.performance = MOCK_PERFORMANCE
        self.snapmirror = MOCK_SNAPMIRROR

    def analyze(self, question: str) -> str:
        normalized_question = question.lower().strip()

        try:
            cluster = self.inventory_service.get_cluster()
            volumes_data = self.inventory_service.get_volumes()
            svms_data = self.inventory_service.get_svms()
            aggregates_data = self.inventory_service.get_aggregates()

        except Exception as error:
            return (
                "Storage inventory is unavailable: "
                f"{str(error)}"
            )

        volumes = volumes_data.get("records", [])
        svms = svms_data.get("records", [])
        aggregates = aggregates_data.get("records", [])

        # -------------------------------------------------
        # SAFE ACTION PROPOSALS
        # -------------------------------------------------

        if (
            "create action" in normalized_question
            or "propose action" in normalized_question
            or "fix prod_data" in normalized_question
            or "resize prod_data" in normalized_question
        ):
            return self.propose_volume_resize()

        if (
            "create snapshot" in normalized_question
            or "propose snapshot" in normalized_question
            or "snapshot prod_data" in normalized_question
        ):
            return self.propose_snapshot()

        if (
            "update snapmirror" in normalized_question
            or "fix snapmirror" in normalized_question
            or "propose snapmirror" in normalized_question
        ):
            return self.propose_snapmirror_update()

        # -------------------------------------------------
        # HIGHEST RISK ANALYSIS
        # -------------------------------------------------

        if (
            "highest risk" in normalized_question
            or "highest-risk" in normalized_question
            or "investigate first" in normalized_question
            or "priority issue" in normalized_question
            or "highest priority" in normalized_question
        ):
            return self.get_highest_risk_issue()

        # -------------------------------------------------
        # DIRECT STORAGE ANALYSIS
        # -------------------------------------------------

        if (
            "health" in normalized_question
            or "environment" in normalized_question
        ):
            return self.get_environment_health(
                cluster,
                volumes,
                svms,
                aggregates,
            )

        if "critical" in normalized_question:
            return self.get_critical_alerts()

        if "warning" in normalized_question:
            return self.get_warning_alerts()

        # -------------------------------------------------
        # DATA PROTECTION / SNAPMIRROR
        # -------------------------------------------------

        if (
            "snapmirror" in normalized_question
            or "replication" in normalized_question
            or "data protection" in normalized_question
        ):
            return self.get_snapmirror_health()

        # -------------------------------------------------
        # PERFORMANCE
        # -------------------------------------------------

        if (
            "performance" in normalized_question
            or "latency" in normalized_question
            or "iops" in normalized_question
            or "throughput" in normalized_question
        ):
            return self.get_performance_summary()

        # -------------------------------------------------
        # CAPACITY
        # -------------------------------------------------

        if (
            "capacity" in normalized_question
            or "growth" in normalized_question
            or "full" in normalized_question
            or "utilization" in normalized_question
        ):
            return self.get_capacity_summary()

        # -------------------------------------------------
        # SPECIFIC VOLUME
        # -------------------------------------------------

        for volume in volumes:
            name = volume.get("name", "").lower()

            if name and name in normalized_question:
                return self.get_volume_details(volume)

        # -------------------------------------------------
        # GENERAL INVENTORY QUESTIONS
        # -------------------------------------------------

        if (
            "volume" in normalized_question
            or "volumes" in normalized_question
        ):
            return (
                f"StoragePilot currently sees {len(volumes)} volumes. "
                "You can ask about a specific volume by name."
            )

        if (
            "svm" in normalized_question
            or "svms" in normalized_question
        ):
            running = [
                svm
                for svm in svms
                if svm.get("state") == "running"
            ]

            return (
                f"StoragePilot sees {len(svms)} SVMs. "
                f"{len(running)} are currently running."
            )

        if (
            "aggregate" in normalized_question
            or "aggregates" in normalized_question
        ):
            online = [
                aggregate
                for aggregate in aggregates
                if aggregate.get("state") == "online"
            ]

            return (
                f"StoragePilot sees {len(aggregates)} aggregates. "
                f"{len(online)} are currently online."
            )

        # -------------------------------------------------
        # ALERT RESOURCE MATCHING
        # -------------------------------------------------

        for alert in self.alerts:
            resource = alert.get("resource", "").lower()

            if resource and resource in normalized_question:
                return (
                    f"{resource} currently has a "
                    f"{alert['severity']} alert. "
                    f"{alert['message']}"
                )

        # -------------------------------------------------
        # LLM FALLBACK
        # -------------------------------------------------

        context = self.build_context(
            cluster=cluster,
            volumes=volumes,
            svms=svms,
            aggregates=aggregates,
        )

        return self.llm_service.generate_answer(
            question=question,
            context=context,
        )

    # -------------------------------------------------
    # BUILD LLM CONTEXT
    # -------------------------------------------------

    def build_context(
        self,
        cluster,
        volumes,
        svms,
        aggregates,
    ) -> str:
        storage_context = {
            "cluster": cluster,
            "volumes": volumes,
            "svms": svms,
            "aggregates": aggregates,
            "alerts": self.alerts,
            "capacity": self.capacity,
            "performance": self.performance,
            "snapmirror": self.snapmirror,
        }

        return json.dumps(
            storage_context,
            indent=2,
            default=str,
        )

    # -------------------------------------------------
    # SAFE ACTION: VOLUME RESIZE
    # -------------------------------------------------

    def propose_volume_resize(self):
        action = action_service.propose_action(
            action_type="volume_resize",
            resource="prod_data",
            details={
                "current_size_gb": 1000,
                "proposed_size_gb": 1200,
                "reason": (
                    "prod_data has elevated utilization and "
                    "continued capacity growth."
                ),
            },
        )

        return (
            "I created a proposed volume resize action for prod_data. "
            "Current size: 1000 GB. "
            "Proposed size: 1200 GB. "
            f"Action status: {action['status']}. "
            "No ONTAP change has been executed. "
            "Review the proposal on the Operations page."
        )

    # -------------------------------------------------
    # SAFE ACTION: SNAPSHOT
    # -------------------------------------------------

    def propose_snapshot(self):
        action = action_service.propose_action(
            action_type="snapshot_create",
            resource="prod_data",
            details={
                "snapshot_name": "storagepilot_manual_snapshot",
                "reason": (
                    "Create a recovery point before a planned "
                    "storage operation."
                ),
            },
        )

        return (
            "I created a proposed snapshot action for prod_data. "
            "Snapshot name: storagepilot_manual_snapshot. "
            f"Action status: {action['status']}. "
            "No snapshot has been created. "
            "Review and approve the proposal on the Operations page."
        )

    # -------------------------------------------------
    # SAFE ACTION: SNAPMIRROR UPDATE
    # -------------------------------------------------

    def propose_snapmirror_update(self):
        action = action_service.propose_action(
            action_type="snapmirror_update",
            resource="backup_data",
            details={
                "destination": "backup_data_dr",
                "reason": (
                    "The SnapMirror relationship is unhealthy "
                    "and has elevated replication lag."
                ),
            },
        )

        return (
            "I created a proposed SnapMirror update for backup_data. "
            "Destination: backup_data_dr. "
            f"Action status: {action['status']}. "
            "No replication operation has been executed. "
            "Review and approve the proposal on the Operations page."
        )

    # -------------------------------------------------
    # ENVIRONMENT HEALTH
    # -------------------------------------------------

    def get_environment_health(
        self,
        cluster,
        volumes,
        svms,
        aggregates,
    ):
        critical = [
            alert
            for alert in self.alerts
            if alert.get("severity") == "critical"
        ]

        warnings = [
            alert
            for alert in self.alerts
            if alert.get("severity") == "warning"
        ]

        unhealthy_snapmirror = [
            relationship
            for relationship in self.snapmirror.get("records", [])
            if not relationship.get("healthy", True)
        ]

        cluster_name = cluster.get("name", "Unknown")

        return (
            f"Cluster {cluster_name} is available. "
            f"StoragePilot sees {len(volumes)} volumes, "
            f"{len(svms)} SVMs, and "
            f"{len(aggregates)} aggregates. "
            f"There are {len(critical)} critical alerts, "
            f"{len(warnings)} warning alerts, and "
            f"{len(unhealthy_snapmirror)} unhealthy "
            f"SnapMirror relationships."
        )

    # -------------------------------------------------
    # CRITICAL ALERTS
    # -------------------------------------------------

    def get_critical_alerts(self):
        critical = [
            alert
            for alert in self.alerts
            if alert.get("severity") == "critical"
        ]

        if not critical:
            return "There are currently no critical alerts."

        details = [
            f"{alert['resource']}: {alert['message']}"
            for alert in critical
        ]

        return (
            "Critical alerts: "
            + " | ".join(details)
        )

    # -------------------------------------------------
    # WARNING ALERTS
    # -------------------------------------------------

    def get_warning_alerts(self):
        warnings = [
            alert
            for alert in self.alerts
            if alert.get("severity") == "warning"
        ]

        if not warnings:
            return "There are currently no warning alerts."

        details = [
            f"{alert['resource']}: {alert['message']}"
            for alert in warnings
        ]

        return (
            "Warning alerts: "
            + " | ".join(details)
        )

    # -------------------------------------------------
    # CAPACITY
    # -------------------------------------------------

    def get_capacity_summary(self):
        summary = self.capacity.get("summary", {})
        volumes = self.capacity.get("volumes", [])

        high_risk = [
            volume
            for volume in volumes
            if volume.get("risk") == "high"
        ]

        answer = (
            f"Overall storage utilization is "
            f"{summary.get('utilization_percent', 0)}%. "
            f"{summary.get('used_tb', 0)} TB is used out of "
            f"{summary.get('total_tb', 0)} TB. "
        )

        if high_risk:
            names = [
                volume.get("name", "Unknown")
                for volume in high_risk
            ]

            answer += (
                "High-risk capacity volumes: "
                + ", ".join(names)
                + "."
            )

        else:
            answer += (
                "No high-risk capacity conditions were detected."
            )

        return answer

    # -------------------------------------------------
    # PERFORMANCE
    # -------------------------------------------------

    def get_performance_summary(self):
        cluster = self.performance.get("cluster", {})
        volumes = self.performance.get("volumes", [])

        warning_volumes = [
            volume
            for volume in volumes
            if volume.get("status") == "warning"
        ]

        answer = (
            f"Cluster performance is currently "
            f"{cluster.get('iops', 0):,} IOPS, "
            f"{cluster.get('latency_ms', 0)} ms latency, "
            f"and {cluster.get('throughput_mb_s', 0)} MB/s throughput. "
        )

        if warning_volumes:
            details = [
                (
                    f"{volume['name']} "
                    f"({volume['latency_ms']} ms latency)"
                )
                for volume in warning_volumes
            ]

            answer += (
                "Performance warnings detected on: "
                + ", ".join(details)
                + "."
            )

        else:
            answer += (
                "No performance warnings are currently detected."
            )

        return answer

    # -------------------------------------------------
    # SNAPMIRROR
    # -------------------------------------------------

    def get_snapmirror_health(self):
        relationships = self.snapmirror.get("records", [])

        unhealthy = [
            relationship
            for relationship in relationships
            if not relationship.get("healthy", True)
        ]

        if not unhealthy:
            return (
                f"All {len(relationships)} SnapMirror relationships "
                "are currently healthy."
            )

        details = []

        for relationship in unhealthy:
            source_volume = relationship.get(
                "source",
                {},
            ).get(
                "volume",
                "Unknown",
            )

            destination_volume = relationship.get(
                "destination",
                {},
            ).get(
                "volume",
                "Unknown",
            )

            lag = relationship.get(
                "lag_time",
                "Unknown",
            )

            transfer_status = relationship.get(
                "last_transfer_status",
                "Unknown",
            )

            details.append(
                f"{source_volume} → {destination_volume} "
                f"is unhealthy with lag {lag} "
                f"and last transfer status {transfer_status}"
            )

        return (
            "SnapMirror issues detected: "
            + " | ".join(details)
        )

    # -------------------------------------------------
    # HIGHEST RISK CORRELATION
    # -------------------------------------------------

    def get_highest_risk_issue(self):
        issues = []

        critical_alerts = [
            alert
            for alert in self.alerts
            if alert.get("severity") == "critical"
        ]

        unhealthy_relationships = [
            relationship
            for relationship in self.snapmirror.get("records", [])
            if not relationship.get("healthy", True)
        ]

        high_risk_volumes = [
            volume
            for volume in self.capacity.get("volumes", [])
            if volume.get("risk") == "high"
        ]

        warning_performance = [
            volume
            for volume in self.performance.get("volumes", [])
            if volume.get("status") == "warning"
        ]

        for alert in critical_alerts:
            issues.append(
                {
                    "priority": 1,
                    "message": (
                        f"Critical alert on {alert['resource']}: "
                        f"{alert['message']}"
                    ),
                }
            )

        for relationship in unhealthy_relationships:
            issues.append(
                {
                    "priority": 2,
                    "message": (
                        "Unhealthy SnapMirror relationship for "
                        f"{relationship['source']['volume']} "
                        f"with lag {relationship['lag_time']} "
                        f"and transfer status "
                        f"{relationship['last_transfer_status']}."
                    ),
                }
            )

        for volume in high_risk_volumes:
            issues.append(
                {
                    "priority": 3,
                    "message": (
                        f"{volume['name']} is at "
                        f"{volume['utilization_percent']}% utilization "
                        f"and growing at "
                        f"{volume['daily_growth_gb']} GB/day."
                    ),
                }
            )

        for volume in warning_performance:
            issues.append(
                {
                    "priority": 4,
                    "message": (
                        f"{volume['name']} has a performance warning "
                        f"with {volume['latency_ms']} ms latency "
                        f"and {volume['iops']:,} IOPS."
                    ),
                }
            )

        if not issues:
            return (
                "StoragePilot did not detect any immediate "
                "high-risk storage conditions."
            )

        issues.sort(
            key=lambda issue: issue["priority"]
        )

        top_issue = issues[0]

        remaining = [
            issue["message"]
            for issue in issues[1:]
        ]

        answer = (
            "The highest-priority issue is: "
            f"{top_issue['message']}"
        )

        if remaining:
            answer += (
                " Additional conditions to review: "
                + " | ".join(remaining)
            )

        return answer

    # -------------------------------------------------
    # VOLUME DETAILS
    # -------------------------------------------------

    def get_volume_details(self, volume):
        name = volume.get("name", "Unknown")
        state = volume.get("state", "unknown")

        size = volume.get("size", 0)
        used = volume.get("space", {}).get("used", 0)

        utilization = 0

        if size:
            utilization = round(
                (used / size) * 100,
                1,
            )

        answer = (
            f"Volume {name} is {state}. "
            f"Current utilization is approximately "
            f"{utilization}%. "
        )

        if utilization >= 85:
            answer += (
                "This volume is at high utilization. "
                "Review snapshots, growth rate, and "
                "available aggregate space."
            )

        elif utilization >= 70:
            answer += (
                "Utilization is elevated. "
                "Monitor growth and review snapshot "
                "consumption."
            )

        else:
            answer += (
                "Current capacity utilization appears normal."
            )

        return answer