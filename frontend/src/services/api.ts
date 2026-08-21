import axios from "axios";

const API_BASE_URL = "http://127.0.0.1:8000";


// -------------------------------------------------
// INVENTORY
// -------------------------------------------------

export const getMockCluster = async () => {
  const response = await axios.get(
    `${API_BASE_URL}/inventory/cluster`
  );

  return response.data;
};


export const getMockVolumes = async () => {
  const response = await axios.get(
    `${API_BASE_URL}/inventory/volumes`
  );

  return response.data;
};


export const getMockSvms = async () => {
  const response = await axios.get(
    `${API_BASE_URL}/inventory/svms`
  );

  return response.data;
};


export const getMockAggregates = async () => {
  const response = await axios.get(
    `${API_BASE_URL}/inventory/aggregates`
  );

  return response.data;
};


// -------------------------------------------------
// ALERTS
// -------------------------------------------------

export const getMockAlerts = async () => {
  const response = await axios.get(
    `${API_BASE_URL}/mock/ontap/alerts`
  );

  return response.data;
};


// -------------------------------------------------
// SETTINGS
// -------------------------------------------------

export const getSettings = async () => {
  const response = await axios.get(
    `${API_BASE_URL}/settings`
  );

  return response.data;
};


export const updateStorageMode = async (
  mode: "mock" | "real"
) => {
  const response = await axios.post(
    `${API_BASE_URL}/settings/mode`,
    {
      mode: mode,
    }
  );

  return response.data;
};
export const saveOntapSettings = async (
  hostname: string,
  username: string,
  password: string
) => {
  const response = await axios.post(
    `${API_BASE_URL}/settings/ontap`,
    {
      hostname,
      username,
      password,
    }
  );

  return response.data;
};

export const testOntapConnection = async (
  hostname: string,
  username: string,
  password: string
) => {
  const response = await axios.post(
    `${API_BASE_URL}/settings/ontap/test`,
    {
      hostname,
      username,
      password,
    }
  );

  return response.data;
};