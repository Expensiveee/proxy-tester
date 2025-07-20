import { create } from "zustand";
import { Proxy, TestStatus } from "@/types";

type ProxyTesterState = {
  loadedProxies: Proxy[];
  testedProxies: Proxy[];
  isLoading: boolean;
  targetUrl: string;
  ipLookup: boolean;
  latencyCheck: boolean;
  testStatus: TestStatus;
  abortController: AbortController | null;
};

type ProxyTesterActions = {
  /** Replaces the list of proxies to be tested. */
  replaceAllProxies: (proxies: Proxy[]) => void;
  /** Resets the entire store to its initial state. */
  clearAll: () => void;
  setOptions: (options: any) => void;
  setTestStatus: (status: TestStatus) => void;
  removeTestedProxy: (proxy: Proxy) => void;

  // New test lifecycle actions
  prepareForTest: (controller: AbortController) => void;
  stopTest: () => void;
  addTestResult: (result: Proxy) => void;
  finalizeTest: () => void;
};

const initialState: ProxyTesterState = {
  loadedProxies: [],
  testedProxies: [],
  isLoading: false,
  targetUrl: "https://www.google.com",
  ipLookup: true,
  latencyCheck: true,
  testStatus: "idle",
  abortController: null,
};

export const useProxyTesterStore = create<
  ProxyTesterState & ProxyTesterActions
>()((set, get) => ({
  ...initialState,

  replaceAllProxies: (proxies) => set({ loadedProxies: proxies }),
  setTestStatus: (status) => set({ testStatus: status }),
  clearAll: () =>
    set({
      testedProxies: [],
      loadedProxies: [],
      isLoading: false,
    }),

  stopTest: () => {
    // get() is available here!
    const { abortController, testStatus } = get();
    if (abortController && testStatus === "testing") {
      abortController.abort();
      set({ testStatus: "stopping", abortController: null });
    }
  },

  setOptions: (options) => set(options),

  prepareForTest: (controller: AbortController) => {
    set({
      testStatus: "testing",
      testedProxies: [],
      abortController: controller,
    });
  },

  removeTestedProxy: (proxy) =>
    set((state) => ({
      testedProxies: state.testedProxies.filter((p) => p.raw !== proxy.raw),
    })),

  addTestResult: (result) =>
    set((state) => ({
      // CRITICAL: Append the new result to the 'testedProxies' array.
      testedProxies: [...state.testedProxies, result],
    })),

  finalizeTest: () => set({ isLoading: false, testStatus: "finished" }),
}));
