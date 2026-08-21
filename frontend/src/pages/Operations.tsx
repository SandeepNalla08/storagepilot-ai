import { useEffect, useState } from "react";
import axios from "axios";

type ActionRecord = {
  id: string;
  action_type: string;
  resource: string;
  details: Record<string, unknown>;
  status: string;
  created_at: string;
  executed: boolean;
  simulation_mode: boolean;
};

function Operations() {
  const [actions, setActions] = useState<ActionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadActions = async () => {
    try {
      setError("");

      const response = await axios.get(
        "http://127.0.0.1:8000/actions"
      );

      setActions(response.data.records ?? []);
    } catch (err) {
      console.error(err);
      setError("Unable to load proposed storage actions.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadActions();
  }, []);

  const proposeResize = async () => {
    try {
      setMessage("");
      setError("");

      await axios.post(
        "http://127.0.0.1:8000/actions/propose",
        {
          action_type: "volume_resize",
          resource: "prod_data",
          details: {
            current_size_gb: 1000,
            proposed_size_gb: 1200,
            reason:
              "Volume utilization is elevated and projected to continue growing.",
          },
        }
      );

      setMessage(
        "Volume resize action proposed for approval."
      );

      await loadActions();
    } catch (err) {
      console.error(err);
      setError("Unable to propose volume resize action.");
    }
  };

  const proposeSnapshot = async () => {
    try {
      setMessage("");
      setError("");

      await axios.post(
        "http://127.0.0.1:8000/actions/propose",
        {
          action_type: "snapshot_create",
          resource: "prod_data",
          details: {
            snapshot_name: "storagepilot_manual_snapshot",
            reason:
              "Create a recovery point before a planned storage operation.",
          },
        }
      );

      setMessage(
        "Snapshot creation action proposed for approval."
      );

      await loadActions();
    } catch (err) {
      console.error(err);
      setError("Unable to propose snapshot action.");
    }
  };

  const proposeSnapMirrorUpdate = async () => {
    try {
      setMessage("");
      setError("");

      await axios.post(
        "http://127.0.0.1:8000/actions/propose",
        {
          action_type: "snapmirror_update",
          resource: "backup_data",
          details: {
            destination: "backup_data_dr",
            reason:
              "Replication relationship is unhealthy and has elevated lag.",
          },
        }
      );

      setMessage(
        "SnapMirror update action proposed for approval."
      );

      await loadActions();
    } catch (err) {
      console.error(err);
      setError("Unable to propose SnapMirror update.");
    }
  };

  const approveAction = async (actionId: string) => {
    try {
      setMessage("");
      setError("");

      const response = await axios.post(
        `http://127.0.0.1:8000/actions/${actionId}/approve`
      );

      setMessage(response.data.message);

      await loadActions();
    } catch (err) {
      console.error(err);
      setError("Unable to approve action.");
    }
  };

  const rejectAction = async (actionId: string) => {
    try {
      setMessage("");
      setError("");

      const response = await axios.post(
        `http://127.0.0.1:8000/actions/${actionId}/reject`
      );

      setMessage(response.data.message);

      await loadActions();
    } catch (err) {
      console.error(err);
      setError("Unable to reject action.");
    }
  };

  return (
    <div>
      <header className="topbar">
        <div>
          <h2>Operations</h2>
          <p>
            Review and approve AI-assisted storage operations.
            All actions are currently simulated.
          </p>
        </div>

        <div className="system-health">
          <span className="health-dot"></span>
          <span>Simulation Mode</span>
        </div>
      </header>

      <section className="panel">
        <div className="panel-header">
          <div>
            <h3>Propose Storage Action</h3>
            <p>
              Create a simulated ONTAP operation that requires
              administrator approval.
            </p>
          </div>
        </div>

        <div className="operation-buttons">
          <button
            className="primary-button"
            onClick={proposeResize}
          >
            Propose Volume Resize
          </button>

          <button
            className="primary-button"
            onClick={proposeSnapshot}
          >
            Propose Snapshot
          </button>

          <button
            className="primary-button"
            onClick={proposeSnapMirrorUpdate}
          >
            Propose SnapMirror Update
          </button>
        </div>

        {message && (
          <div className="settings-success">
            {message}
          </div>
        )}

        {error && (
          <div className="form-error">
            {error}
          </div>
        )}
      </section>

      <section className="panel">
        <div className="panel-header">
          <div>
            <h3>Pending & Historical Actions</h3>
            <p>
              Review proposed storage changes before execution.
            </p>
          </div>
        </div>

        {loading && <p>Loading actions...</p>}

        {!loading && actions.length === 0 && (
          <p>No storage actions have been proposed yet.</p>
        )}

        {!loading && actions.length > 0 && (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Action</th>
                  <th>Resource</th>
                  <th>Status</th>
                  <th>Simulation</th>
                  <th>Created</th>
                  <th>Decision</th>
                </tr>
              </thead>

              <tbody>
                {actions.map((action) => (
                  <tr key={action.id}>
                    <td>
                      <div className="cluster-name">
                        {action.action_type}
                      </div>
                    </td>

                    <td>{action.resource}</td>

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
                      {new Date(
                        action.created_at
                      ).toLocaleString()}
                    </td>

                    <td>
                      {action.status ===
                      "awaiting_approval" ? (
                        <div className="action-buttons">
                          <button
                            className="primary-button"
                            onClick={() =>
                              approveAction(action.id)
                            }
                          >
                            Approve
                          </button>

                          <button
                            className="user-button"
                            onClick={() =>
                              rejectAction(action.id)
                            }
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        "-"
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

export default Operations;