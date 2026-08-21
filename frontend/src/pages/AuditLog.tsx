import { useEffect, useState } from "react";
import axios from "axios";

type AuditAction = {
  id: string;
  action_type: string;
  resource: string;
  details: Record<string, unknown>;
  status: string;
  requested_by?: string;
  simulation_mode: boolean;
  executed: boolean;
  created_at: string;
  approved_at?: string | null;
  rejected_at?: string | null;
  executed_at?: string | null;
};

function AuditLog() {
  const [actions, setActions] = useState<AuditAction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadAuditHistory = async () => {
    try {
      setError("");

      const response = await axios.get(
        "http://127.0.0.1:8000/actions"
      );

      setActions(response.data.records ?? []);
    } catch (err) {
      console.error(err);
      setError("Unable to load audit history.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAuditHistory();
  }, []);

  const formatDate = (value?: string | null) => {
    if (!value) {
      return "-";
    }

    return new Date(value).toLocaleString();
  };

  return (
    <div>
      <header className="topbar">
        <div>
          <h2>Audit Log</h2>
          <p>
            Review StoragePilot AI proposed, approved, rejected,
            and simulated storage operations.
          </p>
        </div>

        <div className="system-health">
          <span className="health-dot"></span>
          <span>Audit Tracking Enabled</span>
        </div>
      </header>

      <section className="panel">
        <div className="panel-header">
          <div>
            <h3>Storage Operations History</h3>
            <p>
              Persistent activity recorded by StoragePilot.
            </p>
          </div>

          <button
            className="user-button"
            onClick={loadAuditHistory}
          >
            Refresh
          </button>
        </div>

        {loading && <p>Loading audit history...</p>}

        {error && (
          <div className="form-error">
            {error}
          </div>
        )}

        {!loading && !error && actions.length === 0 && (
          <p>No storage operations have been recorded yet.</p>
        )}

        {!loading && !error && actions.length > 0 && (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Action</th>
                  <th>Resource</th>
                  <th>Requested By</th>
                  <th>Status</th>
                  <th>Simulation</th>
                  <th>Executed</th>
                  <th>Created</th>
                  <th>Decision Time</th>
                </tr>
              </thead>

              <tbody>
                {actions.map((action) => {
                  const decisionTime =
                    action.approved_at ??
                    action.rejected_at ??
                    action.executed_at;

                  return (
                    <tr key={action.id}>
                      <td>
                        <div className="cluster-name">
                          {action.action_type}
                        </div>
                      </td>

                      <td>{action.resource}</td>

                      <td>
                        {action.requested_by ??
                          "StoragePilot AI"}
                      </td>

                      <td>
                        <span
                          className={
                            action.status === "approved"
                              ? "status-badge"
                              : action.status === "rejected"
                              ? "alert-badge alert-critical"
                              : "alert-badge alert-warning"
                          }
                        >
                          {action.status}
                        </span>
                      </td>

                      <td>
                        {action.simulation_mode
                          ? "Yes"
                          : "No"}
                      </td>

                      <td>
                        {action.executed
                          ? "Yes"
                          : "No"}
                      </td>

                      <td>
                        {formatDate(action.created_at)}
                      </td>

                      <td>
                        {formatDate(decisionTime)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

export default AuditLog;