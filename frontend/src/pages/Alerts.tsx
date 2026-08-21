import { useEffect, useState } from "react";
import { getMockAlerts } from "../services/api";

type Alert = {
  id: string;
  severity: string;
  resource: string;
  message: string;
  timestamp: string;
};

type AlertResponse = {
  records?: Alert[];
  num_records?: number;
};

function Alerts() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadAlerts = async () => {
      try {
        const data: AlertResponse = await getMockAlerts();
        setAlerts(data.records ?? []);
      } catch (err) {
        console.error(err);
        setError("Unable to load alerts.");
      } finally {
        setLoading(false);
      }
    };

    loadAlerts();
  }, []);

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Alerts</h2>
          <p>
            Review storage events, warnings, and critical infrastructure
            conditions.
          </p>
        </div>
      </div>

      <section className="panel">
        {loading && <p>Loading alerts...</p>}

        {error && <p>{error}</p>}

        {!loading && !error && (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Severity</th>
                  <th>Resource</th>
                  <th>Message</th>
                  <th>Timestamp</th>
                </tr>
              </thead>

              <tbody>
                {alerts.map((alert) => (
                  <tr key={alert.id}>
                    <td>
                      <span className={`alert-badge alert-${alert.severity}`}>
                        {alert.severity}
                      </span>
                    </td>

                    <td>{alert.resource}</td>

                    <td>{alert.message}</td>

                    <td>
                      {new Date(alert.timestamp).toLocaleString()}
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

export default Alerts;