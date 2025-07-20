import { NextRequest } from "next/server";
import fetch from "node-fetch";
import { HttpsProxyAgent } from "https-proxy-agent";
import { Proxy } from "@/types";

type ProxyCheckOptions = {
  proxies: {
    formatted: string;
    raw: string;
  }[];
  latencyCheck: boolean;
  ipLookup: boolean;
  targetUrl: string; // Made targetUrl mandatory for clarity
};

async function checkProxy(
  proxy: {
    formatted: string;
    raw: string;
  },
  options: Pick<ProxyCheckOptions, "latencyCheck" | "ipLookup" | "targetUrl">
): Promise<Omit<Proxy, "raw">> {
  let ttfb: number | undefined;
  let totalLatency: number | undefined;

  const startTime = performance.now(); // Start high-resolution timer

  // HttpsProxyAgent requires the proxy URL to have a protocol
  const proxyUrl = proxy.formatted.startsWith("http")
    ? proxy.formatted
    : `http://${proxy.formatted}`;
  const agent = new HttpsProxyAgent(proxyUrl);

  // Use an AbortController to enforce a timeout on the fetch request
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000); // 15-second timeout

  try {
    // 1. Primary request to the target URL to check connectivity and latency
    const response = await fetch(options.targetUrl, {
      agent,
      signal: controller.signal,
    });

    const ttfbTime = performance.now();
    ttfb = Math.round(ttfbTime - startTime);

    if (!response.ok) {
      // If the response status is not 2xx, consider the proxy failed
      throw new Error(`Request failed with status ${response.status}`);
    }

    await response.text();
    const endTime = performance.now(); // End timer after body is consumed
    totalLatency = Math.round(endTime - startTime);

    let ip: string | undefined;
    let country: string | undefined;
    let countryCode: string | undefined;
    let isp: string | undefined;
    let city: string | undefined;

    // 2. Optional: If IP lookup is enabled, make a second request to an IP service
    if (options.ipLookup) {
      try {
        const ipResponse = await fetch("https://wtfismyip.com/json", {
          agent,
          signal: controller.signal, // Reuse the signal if it hasn't aborted
        });
        if (ipResponse.ok) {
          const data = (await ipResponse.json()) as {
            YourFuckingIPAddress: string;
            YourFuckingCountry: string;
            YourFuckingCountryCode: string;
            YourFuckingISP: string;
            YourFuckingCity: string;
          };
          ip = data["YourFuckingIPAddress"];
          country = data["YourFuckingCountry"];
          countryCode = data["YourFuckingCountryCode"];
          isp = data["YourFuckingISP"];
          city = data["YourFuckingCity"];
        }
      } catch (ipError) {
        console.warn(
          `IP lookup failed for proxy ${proxy}, but connection was ok.`
        );
      }
    }

    return {
      ...proxy,
      status: "ok",
      latency: ttfb,
      ip,
      country,
      countryCode,
      isp,
      city,
    };
  } catch (error) {
    // This block catches fetch errors, timeouts, and non-ok responses
    return { ...proxy, status: "fail" };
  } finally {
    // IMPORTANT: Always clear the timeout
    clearTimeout(timeoutId);
  }
}

// The main API route handler remains largely the same, streaming results
export const POST = async (req: NextRequest) => {
  const { proxies, latencyCheck, ipLookup, targetUrl }: ProxyCheckOptions =
    await req.json();

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const concurrencyLimit = 10; // Test 10 proxies in parallel
      const queue = [...proxies];

      const runTask = async () => {
        while (queue.length > 0) {
          if (req.signal.aborted) {
            console.log(
              "Client disconnected, stopping server-side processing."
            );
            break;
          }
          const proxy = queue.shift()!;
          const result = await checkProxy(proxy, {
            latencyCheck,
            ipLookup,
            targetUrl,
          });
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(result)}\n\n`)
          );
        }
      };

      const workers = Array(concurrencyLimit).fill(null).map(runTask);
      await Promise.all(workers);

      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
};
