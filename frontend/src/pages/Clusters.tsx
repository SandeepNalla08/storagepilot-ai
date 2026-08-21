import { useEffect, useState } from "react";
import axios from "axios";

type Cluster = {
  id: number;
  name: string;
  hostname: string;
  ontap_version?: string;
  status: string;
  last_sync?: string | null;
  created_at: string;
};

function Clusters() {
  const [clusters, setClusters] = useState<Cluster[]>([]);
  const [name, setName] = useState("");
  const [hostname, setHostname] = useState("");
  const [ontapVersion, setOntapVersion] = useState("");
  const [status, setStatus] = useState("unknown");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const loadClusters = async () => {
    try {
      setError("");

      const response = await axios.get(
        "http://127.0.0.1:8000/clusters"
      );

      setClusters(response.data);
    } catch (err) {
      console.error(err);
      setError("Unable to load clusters.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClusters();
  }, []);

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!name.trim() || !hostname.trim()) {
      setError("Cluster name and hostname are required.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      await axios.post(
        "http://127.0.0.1:8000/clusters",
        {
          name,
          hostname,
          ontap_version: ontapVersion || null,
          status,
        }
      );

      setName("");
      setHostname("");
      setOntapVersion("");
      setStatus("unknown");

      await loadClusters();
    } catch (err) {
      console.error(err);
      setError("Unable to save cluster.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Clusters</h2>
          <p>
            Manage ONTAP cluster connections registered with
            StoragePilot AI.
          </p>
        </div>
      </div>

      <section className="panel">
        <h3>Add Cluster</h3>

        <form
          onSubmit={handleSubmit}
          className="cluster-form"
        >
          <div className="form-grid">
            <div className="form-field">
              <label>Cluster Name</label>

              <input
                type="text"
                value={name}
                onChange={(event) =>
                  setName(event.target.value)
                }
                placeholder="Example: prod-cluster-01"
              />
            </div>

            <div className="form-field">
              <label>Hostname / IP</label>

              <input
                type="text"
                value={hostname}
                onChange={(event) =>
                  setHostname(event.target.value)
                }
                placeholder="Example: 192.168.1.100"
              />
            </div>

            <div className="form-field">
              <label>ONTAP Version</label>

              <input
                type="text"
                value={ontapVersion}
                onChange={(event) =>
                  setOntapVersion(event.target.value)
                }
                placeholder="Example: 9.15.1"
              />
            </div>

            <div className="form-field">
              <label>Status</label>

              <select
                value={status}
                onChange={(event) =>
                  setStatus(event.target.value)
                }
              >
                <option value="unknown">Unknown</option>
                <option value="connected">Connected</option>
                <option value="healthy">Healthy</option>
                <option value="warning">Warning</option>
                <option value="disconnected">
                  Disconnected
                </option>
              </select>
            </div>
          </div>

          <button
            className="primary-button"
            type="submit"
            disabled={saving}
          >
            {saving ? "Saving..." : "Add Cluster"}
          </button>
        </form>

        {error && (
          <p className="form-error">{error}</p>
        )}
      </section>

      <section className="panel">
        <div className="panel-header">
          <div>
            <h3>Registered Clusters</h3>
            <p>
              Clusters currently stored in PostgreSQL.
            </p>
          </div>
        </div>

        {loading && <p>Loading clusters...</p>}

        {!loading && clusters.length === 0 && (
          <p>No clusters have been registered yet.</p>
        )}

        {!loading && clusters.length > 0 && (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Cluster</th>
                  <th>Hostname / IP</th>
                  <th>ONTAP Version</th>
                  <th>Status</th>
                  <th>Created</th>
                </tr>
              </thead>

              <tbody>
                {clusters.map((cluster) => (
                  <tr key={cluster.id}>
                    <td>
                      <div className="cluster-name">
                        {cluster.name}
                      </div>
                    </td>

                    <td>{cluster.hostname}</td>

                    <td>
                      {cluster.ontap_version ??
                        "Unavailable"}
                    </td>

                    <td>
                      <span className="status-badge">
                        {cluster.status}
                      </span>
                    </td>

                    <td>
                      {new Date(
                        cluster.created_at
                      ).toLocaleString()}
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

export default Clusters;