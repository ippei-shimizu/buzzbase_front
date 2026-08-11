import { API_REQUEST_TIMEOUT_MS } from "@app/constants/http";
import axiosInstance from "@app/utils/axiosInstance";

export const fetcher = (url: string) =>
  axiosInstance
    .get(url, { timeout: API_REQUEST_TIMEOUT_MS })
    .then((res) => res.data);
