import { useEffect, useState } from "react";

import {
  getSettings,
  updateStorageMode,
  saveOntapSettings,
  testOntapConnection,
} from "../services/api";

type StorageMode = "mock" | "real";

function Settings() {
  const [mode, setMode] = useState<StorageMode>("mock");

  const [hostname, setHostname] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [connectionStatus, setConnectionStatus] =
    useState<"idle" | "success" | "failed">("idle");

  const [clusterName, setClusterName] = useState("");
  const [clusterVersion, setClusterVersion] = useState("");

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const data = await getSettings();

        if (data.mode === "mock" || data.mode === "real") {
          setMode(data.mode);
        }

        setHostname(data.ontap_hostname ?? "");
        setUsername(data.ontap_username ?? "");
      } catch (err) {
        console.error(err);

        setError(
          "Unable to load StoragePilot settings."
        );
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  const handleTestConnection = async () => {
    setTesting(true);
    setMessage("");
    setError("");
    setConnectionStatus("idle");
    setClusterName("");
    setClusterVersion("");

    if (
      !hostname.trim() ||
      !username.trim() ||
      !password
    ) {
      setError(
        "Hostname, username, and password are required to test the ONTAP connection."
      );

      setTesting(false);
      return;
    }

    try {
      const response = await testOntapConnection(
        hostname,
        username,
        password
      );

      if (response.success) {
        setConnectionStatus("success");

        setClusterName(
          response.cluster?.name ?? "Unknown"
        );

        const version =
          response.cluster?.version?.full ??
          response.cluster?.version?.generation ??
          "";

        setClusterVersion(
          version ? String(version) : "Unavailable"
        );

        setMessage(
          "ONTAP connection test was successful."
        );
      } else {
        setConnectionStatus("failed");

        setError(
          response.message ??
            "Unable to connect to the ONTAP cluster."
        );
      }
    } catch (err) {
      console.error(err);

      setConnectionStatus("failed");

      setError(
        "Unable to test the ONTAP connection."
      );
    } finally {
      setTesting(false);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    setMessage("");
    setError("");

    try {
      if (mode === "real") {
        if (
          !hostname.trim() ||
          !username.trim() ||
          !password
        ) {
          setError(
            "Hostname, username, and password are required for Real ONTAP mode."
          );

          setSaving(false);
          return;
        }

        await saveOntapSettings(
          hostname,
          username,
          password
        );
      }

      const response = await updateStorageMode(mode);

      if (response.success) {
        setMessage(
          `StoragePilot is now using ${
            mode === "mock"
              ? "Mock ONTAP"
              : "Real ONTAP"
          } mode.`
        );

        setPassword("");
      } else {
        setError(
          response.message ??
            "Unable to update StoragePilot mode."
        );
      }
    } catch (err) {
      console.error(err);

      setError(
        "Unable to save StoragePilot settings."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <section className="panel">
        Loading StoragePilot settings...
      </section>
    );
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Settings</h2>

          <p>
            Configure StoragePilot environment mode and ONTAP
            connection information.
          </p>
        </div>
      </div>

      <section className="panel">
        <h3>Environment Mode</h3>

        <p className="secondary-text">
          Choose whether StoragePilot uses sample inventory
          or connects to a real ONTAP cluster.
        </p>

        <div className="settings-group">
          <label className="settings-option">
            <input
              type="radio"
              name="mode"
              checked={mode === "mock"}
              onChange={() => {
                setMode("mock");
                setConnectionStatus("idle");
              }}
            />

            <div>
              <strong>Mock Environment</strong>

              <p>
                Use built-in ONTAP sample data for development
                and testing.
              </p>
            </div>
          </label>

          <label className="settings-option">
            <input
              type="radio"
              name="mode"
              checked={mode === "real"}
              onChange={() => {
                setMode("real");
                setConnectionStatus("idle");
              }}
            />

            <div>
              <strong>Real ONTAP</strong>

              <p>
                Connect StoragePilot to an ONTAP cluster
                through the REST API.
              </p>
            </div>
          </label>
        </div>
      </section>

      <section className="panel">
        <h3>ONTAP Connection</h3>

        <p className="secondary-text">
          Test the connection before enabling Real ONTAP mode.
          Testing does not change the current StoragePilot mode.
        </p>

        <div className="form-grid settings-form">
          <div className="form-field">
            <label>
              Cluster Hostname / IP
            </label>

            <input
              type="text"
              value={hostname}
              onChange={(event) => {
                setHostname(event.target.value);
                setConnectionStatus("idle");
              }}
              placeholder="Example: cluster1.example.com"
              disabled={mode === "mock"}
            />
          </div>

          <div className="form-field">
            <label>
              Username
            </label>

            <input
              type="text"
              value={username}
              onChange={(event) => {
                setUsername(event.target.value);
                setConnectionStatus("idle");
              }}
              placeholder="Example: admin"
              disabled={mode === "mock"}
            />
          </div>

          <div className="form-field">
            <label>
              Password
            </label>

            <input
              type="password"
              value={password}
              onChange={(event) => {
                setPassword(event.target.value);
                setConnectionStatus("idle");
              }}
              placeholder={
                mode === "real"
                  ? "Enter ONTAP password"
                  : "Disabled in mock mode"
              }
              disabled={mode === "mock"}
            />
          </div>
        </div>

        <div className="settings-note">
          Credentials are sent only to your local FastAPI backend
          for development. Do not commit credentials to GitHub.
        </div>

        {mode === "real" && (
          <div className="operation-buttons">
            <button
              className="user-button"
              type="button"
              onClick={handleTestConnection}
              disabled={testing || saving}
            >
              {testing
                ? "Testing..."
                : "Test Connection"}
            </button>

            <button
              className="primary-button"
              type="button"
              onClick={saveSettings}
              disabled={saving || testing}
            >
              {saving
                ? "Saving..."
                : "Save Settings"}
            </button>
          </div>
        )}

        {mode === "mock" && (
          <button
            className="primary-button"
            type="button"
            onClick={saveSettings}
            disabled={saving}
          >
            {saving
              ? "Saving..."
              : "Save Settings"}
          </button>
        )}

        {connectionStatus === "success" && (
          <div className="connection-result connection-success">
            <strong>ONTAP connection successful</strong>

            <div>
              Cluster: {clusterName}
            </div>

            <div>
              ONTAP Version: {clusterVersion}
            </div>
          </div>
        )}

        {connectionStatus === "failed" && (
          <div className="connection-result connection-failed">
            <strong>ONTAP connection failed</strong>
          </div>
        )}

        {message && (
          <div className="settings-success">
            {message}
          </div>
        )}

        {error && (
          <div className="settings-error">
            {error}
          </div>
        )}
      </section>
    </div>
  );
}

export default Settings;