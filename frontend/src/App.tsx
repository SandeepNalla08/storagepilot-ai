import { useEffect, useState } from "react";
import { NavLink, Route, Routes } from "react-router-dom";
import "./App.css";

import {
  getMockCluster,
  getMockVolumes,
  getMockSvms,
  getMockAggregates,
} from "./services/api";

import Volumes from "./pages/Volumes";
import Svms from "./pages/Svms";
import Aggregates from "./pages/Aggregates";
import Clusters from "./pages/Clusters";
import Alerts from "./pages/Alerts";
import Copilot from "./pages/Copilot";
import Settings from "./pages/Settings";
import DataProtection from "./pages/DataProtection";
import Performance from "./pages/Performance";
import Capacity from "./pages/Capacity";
import Operations from "./pages/Operations";
import AuditLog from "./pages/AuditLog";

type Cluster = {
  name?: string;
  version?: {
    full?: string;
  };
  status?: string;
};

type VolumeResponse = {
  records?: unknown[];
  num_records?: number;
};

type SvmResponse = {
  records?: unknown[];
  num_records?: number;
};

type AggregateResponse = {
  records?: unknown[];
  num_records?: number;
};

function Dashboard() {
  const [cluster, setCluster] = useState<Cluster | null>(null);
  const [volumes, setVolumes] = useState<VolumeResponse | null>(null);
  const [svms, setSvms] = useState<SvmResponse | null>(null);
  const [aggregates, setAggregates] =
    useState<AggregateResponse | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [
          clusterData,
          volumeData,
          svmData,
          aggregateData,
        ] = await Promise.all([
          getMockCluster(),
          getMockVolumes(),
          getMockSvms(),
          getMockAggregates(),
        ]);

        setCluster(clusterData);
        setVolumes(volumeData);
        setSvms(svmData);
        setAggregates(aggregateData);
      } catch (err) {
        console.error(err);
        setError("Unable to load storage data from the backend.");
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const volumeCount =
    volumes?.num_records ?? volumes?.records?.length ?? 0;

  const svmCount =
    svms?.num_records ?? svms?.records?.length ?? 0;

  const aggregateCount =
    aggregates?.num_records ?? aggregates?.records?.length ?? 0;

  return (
    <>
      <header className="topbar">
        <div>
          <h2>Infrastructure Overview</h2>
          <p>
            Monitor the health, capacity, and availability of your
            enterprise storage environment.
          </p>
        </div>

        <div className="user-area">
          <div className="system-health">
            <span className="health-dot"></span>
            <span>System Healthy</span>
          </div>

          <button className="user-button">
            Administrator
          </button>
        </div>
      </header>

      {loading && (
        <section className="panel">
          Loading storage inventory...
        </section>
      )}

      {error && (
        <section className="panel">
          <strong>{error}</strong>
        </section>
      )}

      {!loading && !error && (
        <>
          <section className="metrics-grid">
            <div className="metric-card">
              <div className="metric-title">
                Connected Clusters
              </div>

              <div className="metric-value">
                {cluster ? 1 : 0}
              </div>

              <div className="metric-status">
                {cluster ? "1 healthy cluster" : "No clusters"}
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-title">
                Volumes
              </div>

              <div className="metric-value">
                {volumeCount}
              </div>

              <div className="metric-status">
                Inventory loaded
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-title">
                SVMs
              </div>

              <div className="metric-value">
                {svmCount}
              </div>

              <div className="metric-status">
                Inventory loaded
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-title">
                Aggregates
              </div>

              <div className="metric-value">
                {aggregateCount}
              </div>

              <div className="metric-status">
                Inventory loaded
              </div>
            </div>
          </section>

          <section className="panel">
            <div className="panel-header">
              <div>
                <h3>Cluster Status</h3>
                <p>
                  Current ONTAP infrastructure health and
                  connectivity.
                </p>
              </div>

              <NavLink
                to="/clusters"
                className="primary-button"
              >
                Add Cluster
              </NavLink>
            </div>

            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Cluster</th>
                    <th>ONTAP Version</th>
                    <th>Status</th>
                    <th>Environment</th>
                  </tr>
                </thead>

                <tbody>
                  <tr>
                    <td>
                      <div className="cluster-name">
                        {cluster?.name ?? "Unknown"}
                      </div>

                      <div className="secondary-text">
                        StoragePilot lab environment
                      </div>
                    </td>

                    <td>
                      {cluster?.version?.full ??
                        "Version unavailable"}
                    </td>

                    <td>
                      <span className="status-badge">
                        {cluster?.status ?? "Healthy"}
                      </span>
                    </td>

                    <td>Mock ONTAP</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </>
  );
}

function App() {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">SP</div>

          <div className="brand-text">
            <h1>StoragePilot AI</h1>
            <p>Enterprise Storage Operations</p>
          </div>
        </div>

        <nav className="nav-menu">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `nav-item ${isActive ? "active" : ""}`
            }
          >
            Dashboard
          </NavLink>

          <NavLink
            to="/clusters"
            className={({ isActive }) =>
              `nav-item ${isActive ? "active" : ""}`
            }
          >
            Clusters
          </NavLink>

          <NavLink
            to="/volumes"
            className={({ isActive }) =>
              `nav-item ${isActive ? "active" : ""}`
            }
          >
            Volumes
          </NavLink>

          <NavLink
            to="/svms"
            className={({ isActive }) =>
              `nav-item ${isActive ? "active" : ""}`
            }
          >
            SVMs
          </NavLink>

          <NavLink
            to="/aggregates"
            className={({ isActive }) =>
              `nav-item ${isActive ? "active" : ""}`
            }
          >
            Aggregates
          </NavLink>

          <NavLink
            to="/data-protection"
            className={({ isActive }) =>
              `nav-item ${isActive ? "active" : ""}`
            }
          >
            Data Protection
          </NavLink>

          <NavLink
            to="/performance"
            className={({ isActive }) =>
              `nav-item ${isActive ? "active" : ""}`
            }
          >
            Performance
          </NavLink>

          <NavLink
            to="/capacity"
            className={({ isActive }) =>
              `nav-item ${isActive ? "active" : ""}`
            }
          >
            Capacity
          </NavLink>

          <NavLink
            to="/operations"
            className={({ isActive }) =>
              `nav-item ${isActive ? "active" : ""}`
            }
          >
            Operations
          </NavLink>

          <NavLink
            to="/audit-log"
            className={({ isActive }) =>
              `nav-item ${isActive ? "active" : ""}`
            }
          >
            Audit Log
          </NavLink>

          <NavLink
            to="/alerts"
            className={({ isActive }) =>
              `nav-item ${isActive ? "active" : ""}`
            }
          >
            Alerts
          </NavLink>

          <NavLink
            to="/copilot"
            className={({ isActive }) =>
              `nav-item ${isActive ? "active" : ""}`
            }
          >
            AI Copilot
          </NavLink>

          <NavLink
            to="/settings"
            className={({ isActive }) =>
              `nav-item ${isActive ? "active" : ""}`
            }
          >
            Settings
          </NavLink>
        </nav>
      </aside>

      <main className="main-content">
        <Routes>
          <Route path="/" element={<Dashboard />} />

          <Route
            path="/clusters"
            element={<Clusters />}
          />

          <Route
            path="/volumes"
            element={<Volumes />}
          />

          <Route
            path="/svms"
            element={<Svms />}
          />

          <Route
            path="/aggregates"
            element={<Aggregates />}
          />

          <Route
            path="/data-protection"
            element={<DataProtection />}
          />

          <Route
            path="/performance"
            element={<Performance />}
          />

          <Route
            path="/capacity"
            element={<Capacity />}
          />

          <Route
            path="/operations"
            element={<Operations />}
          />

          <Route
            path="/audit-log"
            element={<AuditLog />}
          />

          <Route
            path="/alerts"
            element={<Alerts />}
          />

          <Route
            path="/copilot"
            element={<Copilot />}
          />

          <Route
            path="/settings"
            element={<Settings />}
          />
        </Routes>
      </main>
    </div>
  );
}

export default App;