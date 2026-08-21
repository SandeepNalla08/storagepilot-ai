import { useEffect, useState } from "react";
import axios from "axios";

type VolumeCapacity = {
  name: string;
  size_gb: number;
  used_gb: number;
  utilization_percent: number;
  daily_growth_gb: number;
  days_to_90_percent: number;
  risk: string;
  recommendation: string;
};

type CapacityData = {
  summary: {
    total_tb: number;
    used_tb: number;
    available_tb: number;
    utilization_percent: number;
  };

  volumes: VolumeCapacity[];
};

function Capacity() {
  const [capacity, setCapacity] =
    useState<CapacityData | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadCapacity = async () => {
      try {
        const response = await axios.get<CapacityData>(
          "http://127.0.0.1:8000/mock/ontap/capacity"
        );

        setCapacity(response.data);
      } catch (err) {
        console.error(err);
        setError("Unable to load capacity analysis.");
      } finally {
        setLoading(false);
      }
    };

    loadCapacity();
  }, []);

  if (loading) {
    return (
      <section className="panel">
        Loading capacity analysis...
      </section>
    );
  }

  if (error || !capacity) {
    return (
      <section className="panel">
        <strong>
          {error || "Capacity data unavailable."}
        </strong>
      </section>
    );
  }

  return (
    <div>
      <header className="topbar">
        <div>
          <h2>Capacity Analysis</h2>

          <p>
            Monitor utilization, growth, and projected
            capacity risk.
          </p>
        </div>
      </header>

      <section className="metrics-grid">
        <div className="metric-card">
          <div className="metric-title">
            Total Capacity
          </div>

          <div className="metric-value">
            {capacity.summary.total_tb} TB
          </div>

          <div className="metric-status">
            Total storage capacity
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-title">
            Used Capacity
          </div>

          <div className="metric-value">
            {capacity.summary.used_tb} TB
          </div>

          <div className="metric-status">
            Currently consumed
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-title">
            Available Capacity
          </div>

          <div className="metric-value">
            {capacity.summary.available_tb} TB
          </div>

          <div className="metric-status">
            Remaining capacity
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-title">
            Utilization
          </div>

          <div className="metric-value">
            {capacity.summary.utilization_percent}%
          </div>

          <div className="metric-status">
            Overall utilization
          </div>
        </div>
      </section>

      <section className="panel">
        <div className="panel-header">
          <div>
            <h3>Capacity Forecast</h3>

            <p>
              Projected volume growth and capacity risk.
            </p>
          </div>
        </div>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Volume</th>
                <th>Utilization</th>
                <th>Daily Growth</th>
                <th>Days to 90%</th>
                <th>Risk</th>
                <th>Recommendation</th>
              </tr>
            </thead>

            <tbody>
              {capacity.volumes.map((volume) => (
                <tr key={volume.name}>
                  <td>
                    <div className="cluster-name">
                      {volume.name}
                    </div>

                    <div className="secondary-text">
                      {volume.used_gb} GB used of{" "}
                      {volume.size_gb} GB
                    </div>
                  </td>

                  <td>
                    {volume.utilization_percent}%
                  </td>

                  <td>
                    {volume.daily_growth_gb} GB/day
                  </td>

                  <td>
                    {volume.days_to_90_percent} days
                  </td>

                  <td>
                    <span
                      className={
                        volume.risk === "high"
                          ? "alert-badge alert-critical"
                          : volume.risk === "medium"
                          ? "alert-badge alert-warning"
                          : "status-badge"
                      }
                    >
                      {volume.risk}
                    </span>
                  </td>

                  <td>
                    {volume.recommendation}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export default Capacity;