import { useEffect, useState } from "react";
import { getMockVolumes } from "../services/api";

type Volume = {
  name?: string;
  state?: string;
  size?: number;
  space?: {
    used?: number;
    available?: number;
  };
};

type VolumeResponse = {
  records?: Volume[];
  num_records?: number;
};

const bytesToGB = (bytes?: number) => {
  if (!bytes) return "0 GB";

  return `${Math.round(bytes / 1024 / 1024 / 1024)} GB`;
};

function Volumes() {
  const [volumes, setVolumes] = useState<Volume[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadVolumes = async () => {
      try {
        const data: VolumeResponse = await getMockVolumes();
        setVolumes(data.records ?? []);
      } catch (err) {
        console.error(err);
        setError("Unable to load volume inventory.");
      } finally {
        setLoading(false);
      }
    };

    loadVolumes();
  }, []);

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Volumes</h2>
          <p>View ONTAP volume capacity, state, and utilization.</p>
        </div>
      </div>

      <section className="panel">
        {loading && <p>Loading volume inventory...</p>}

        {error && <p>{error}</p>}

        {!loading && !error && (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Volume</th>
                  <th>State</th>
                  <th>Total Size</th>
                  <th>Used</th>
                  <th>Available</th>
                </tr>
              </thead>

              <tbody>
                {volumes.map((volume) => (
                  <tr key={volume.name}>
                    <td>
                      <div className="cluster-name">
                        {volume.name ?? "Unknown"}
                      </div>
                    </td>

                    <td>
                      <span className="status-badge">
                        {volume.state ?? "unknown"}
                      </span>
                    </td>

                    <td>{bytesToGB(volume.size)}</td>

                    <td>{bytesToGB(volume.space?.used)}</td>

                    <td>{bytesToGB(volume.space?.available)}</td>
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

export default Volumes;