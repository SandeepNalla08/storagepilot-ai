import { useEffect, useState } from "react";
import { getMockSvms } from "../services/api";

type Svm = {
  name?: string;
  uuid?: string;
  state?: string;
};

type SvmResponse = {
  records?: Svm[];
  num_records?: number;
};

function Svms() {
  const [svms, setSvms] = useState<Svm[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadSvms = async () => {
      try {
        const data: SvmResponse = await getMockSvms();
        setSvms(data.records ?? []);
      } catch (err) {
        console.error(err);
        setError("Unable to load SVM inventory.");
      } finally {
        setLoading(false);
      }
    };

    loadSvms();
  }, []);

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>SVMs</h2>
          <p>
            View Storage Virtual Machines and their current operational state.
          </p>
        </div>
      </div>

      <section className="panel">
        {loading && <p>Loading SVM inventory...</p>}

        {error && <p>{error}</p>}

        {!loading && !error && (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>SVM</th>
                  <th>UUID</th>
                  <th>State</th>
                </tr>
              </thead>

              <tbody>
                {svms.map((svm) => (
                  <tr key={svm.uuid ?? svm.name}>
                    <td>
                      <div className="cluster-name">
                        {svm.name ?? "Unknown"}
                      </div>
                    </td>

                    <td>{svm.uuid ?? "Unavailable"}</td>

                    <td>
                      <span className="status-badge">
                        {svm.state ?? "unknown"}
                      </span>
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

export default Svms;