export enum ProxyFormat {
  IP_PORT = "ip:port",
  USER_PASS_AT_IP_PORT = "user:pass@ip:port",
  UNKNOWN = "unknown",
}

export type ProxyStatus = "pending" | "testing" | "ok" | "fail";
export type TestStatus = "idle" | "testing" | "stopping" | "finished";
export type ProxyStreamResult = Omit<Proxy, "status"> & {
  status: "ok" | "fail";
};

export type Proxy = {
  raw: string;
  formatted: string;
  status: ProxyStatus;
  ip?: string;
  country?: string;
  countryCode?: string;
  isp?: string;
  city?: string;
  latency?: number;
};
