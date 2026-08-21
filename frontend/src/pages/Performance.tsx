import { useEffect, useState } from "react";
import axios from "axios";

type VolumePerformance = {
  name: string;
  iops: number;
  latency_ms: number;
  throughput_mb_s: number;
  status: string;
};

type PerformanceData = {
  cluster: {
    iops: number;
    latency_ms: number;
    throughput_mb_s: number;
  };
  volumes: VolumePerformance[];
};

function Performance() {
  const [performance, setPerformance] =
    useState<PerformanceData | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadPerformance = async () => {
      try {
        const response = await axios.get<PerformanceData>(
          "http://127.0.0.1:8000/mock/ontap/performance"
        );

        setPerformance(response.data);
      } catch (err) {
        console.error(err);
        setError("Unable to load performance data.");
      } finally {
        setLoading(false);
      }
    };

    loadPerformance();
  }, []);

  if (loading) {
    return (
      <section className="panel">
        Loading storage performance...
      </section>
    );
  }

  if (error || !performance) {
    return (
      <section className="panel">
        <strong>
          {error || "Performance data unavailable."}
        </strong>
      </section>
    );
  }

  return (
    <div>
      <header className="topbar">
        <div>
          <h2>Performance</h2>

          <p>
            Monitor IOPS, latency, and throughput across the
            storage environment.
          </p>
        </div>

        <div className="system-health">
          <span className="health-dot"></span>
          <span>Performance Monitoring</span>
        </div>
      </header>

      <section className="metrics-grid">
        <div className="metric-card">
          <div className="metric-title">
            Cluster IOPS
          </div>

          <div className="metric-value">
            {performance.cluster.iops.toLocaleString()}
          </div>

          <div className="metric-status">
            Operations per second
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-title">
            Average Latency
          </div>

          <div className="metric-value">
            {performance.cluster.latency_ms} ms
          </div>

          <div className="metric-status">
            Cluster response time
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-title">
            Throughput
          </div>

          <div className="metric-value">
            {performance.cluster.throughput_mb_s}
          </div>

          <div className="metric-status">
            MB/s
          </div>
        </div>
      </section>

      <section className="panel">
        <div className="panel-header">
          <div>
            <h3>Volume Performance</h3>

            <p>
              Current workload performance for monitored
              volumes.
            </p>
          </div>
        </div>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Volume</th>
                <th>IOPS</th>
                <th>Latency</th>
                <th>Throughput</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {performance.volumes.map((volume) => (
                <tr key={volume.name}>
                  <td>
                    <div className="cluster-name">
                      {volume.name}
                    </div>
                  </td>

                  <td>
                    {volume.iops.toLocaleString()}
                  </td>

                  <td>
                    {volume.latency_ms} ms
                  </td>

                  <td>
                    {volume.throughput_mb_s} MB/s
                  </td>

                  <td>
                    <span
                      className={
                        volume.status === "healthy"
                          ? "status-badge"
                          : "alert-badge alert-warning"
                      }
                    >
                      {volume.status === "healthy"
                        ? "Healthy"
                        : "Warning"}
                    </span>
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

export default Performance;