import { useEffect, useState } from "react";
import axios from "axios";

type SnapMirrorRelationship = {
  uuid: string;
  source: {
    svm: string;
    volume: string;
  };
  destination: {
    svm: string;
    volume: string;
  };
  state: string;
  healthy: boolean;
  lag_time: string;
  policy: string;
  schedule: string;
  last_transfer_status: string;
};

type SnapMirrorResponse = {
  records?: SnapMirrorRelationship[];
  num_records?: number;
};

function DataProtection() {
  const [relationships, setRelationships] = useState<
    SnapMirrorRelationship[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadRelationships = async () => {
      try {
        const response = await axios.get<SnapMirrorResponse>(
          "http://127.0.0.1:8000/mock/ontap/snapmirror"
        );

        setRelationships(response.data.records ?? []);
      } catch (err) {
        console.error(err);
        setError("Unable to load SnapMirror relationships.");
      } finally {
        setLoading(false);
      }
    };

    loadRelationships();
  }, []);

  const healthyCount = relationships.filter(
    (relationship) => relationship.healthy
  ).length;

  const unhealthyCount =
    relationships.length - healthyCount;

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Data Protection</h2>
          <p>
            Monitor SnapMirror replication health, lag, policy,
            and transfer status.
          </p>
        </div>
      </div>

      <section className="metrics-grid">
        <div className="metric-card">
          <div className="metric-title">
            Relationships
          </div>
          <div className="metric-value">
            {relationships.length}
          </div>
          <div className="metric-status">
            Total protection relationships
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-title">
            Healthy
          </div>
          <div className="metric-value">
            {healthyCount}
          </div>
          <div className="metric-status">
            Replication operating normally
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-title">
            Unhealthy
          </div>
          <div className="metric-value">
            {unhealthyCount}
          </div>
          <div className="metric-status">
            Requires investigation
          </div>
        </div>
      </section>

      <section className="panel">
        {loading && (
          <p>Loading SnapMirror relationships...</p>
        )}

        {error && <p>{error}</p>}

        {!loading && !error && (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Source</th>
                  <th>Destination</th>
                  <th>Health</th>
                  <th>Lag</th>
                  <th>Policy</th>
                  <th>Schedule</th>
                  <th>Last Transfer</th>
                </tr>
              </thead>

              <tbody>
                {relationships.map((relationship) => (
                  <tr key={relationship.uuid}>
                    <td>
                      {relationship.source.svm}/
                      {relationship.source.volume}
                    </td>

                    <td>
                      {relationship.destination.svm}/
                      {relationship.destination.volume}
                    </td>

                    <td>
                      <span
                        className={
                          relationship.healthy
                            ? "status-badge"
                            : "alert-badge alert-critical"
                        }
                      >
                        {relationship.healthy
                          ? "Healthy"
                          : "Unhealthy"}
                      </span>
                    </td>

                    <td>{relationship.lag_time}</td>
                    <td>{relationship.policy}</td>
                    <td>{relationship.schedule}</td>

                    <td>
                      {relationship.last_transfer_status}
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

export default DataProtection;