import { useEffect, useState } from "react";
import { getMockAggregates } from "../services/api";

type Aggregate = {
  name?: string;
  uuid?: string;
  state?: string;
  space?: {
    block_storage?: {
      size?: number;
      used?: number;
      available?: number;
    };
  };
};

type AggregateResponse = {
  records?: Aggregate[];
  num_records?: number;
};

const bytesToGB = (bytes?: number) => {
  if (!bytes) return "0 GB";

  return `${Math.round(bytes / 1024 / 1024 / 1024)} GB`;
};

function Aggregates() {
  const [aggregates, setAggregates] = useState<Aggregate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadAggregates = async () => {
      try {
        const data: AggregateResponse = await getMockAggregates();
        setAggregates(data.records ?? []);
      } catch (err) {
        console.error(err);
        setError("Unable to load aggregate inventory.");
      } finally {
        setLoading(false);
      }
    };

    loadAggregates();
  }, []);

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Aggregates</h2>
          <p>
            Monitor ONTAP aggregate capacity, utilization, and operational
            status.
          </p>
        </div>
      </div>

      <section className="panel">
        {loading && <p>Loading aggregate inventory...</p>}

        {error && <p>{error}</p>}

        {!loading && !error && (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Aggregate</th>
                  <th>State</th>
                  <th>Total Size</th>
                  <th>Used</th>
                  <th>Available</th>
                </tr>
              </thead>

              <tbody>
                {aggregates.map((aggregate) => (
                  <tr key={aggregate.uuid ?? aggregate.name}>
                    <td>
                      <div className="cluster-name">
                        {aggregate.name ?? "Unknown"}
                      </div>
                    </td>

                    <td>
                      <span className="status-badge">
                        {aggregate.state ?? "unknown"}
                      </span>
                    </td>

                    <td>
                      {bytesToGB(
                        aggregate.space?.block_storage?.size
                      )}
                    </td>

                    <td>
                      {bytesToGB(
                        aggregate.space?.block_storage?.used
                      )}
                    </td>

                    <td>
                      {bytesToGB(
                        aggregate.space?.block_storage?.available
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

export default Aggregates;