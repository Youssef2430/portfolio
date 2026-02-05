import { LoggerProvider, SimpleLogRecordProcessor } from "@opentelemetry/sdk-logs";
import { OTLPLogExporter } from "@opentelemetry/exporter-logs-otlp-http";
import { logs } from "@opentelemetry/api-logs";
import { resourceFromAttributes } from "@opentelemetry/resources";

let _loggerProvider: LoggerProvider | null = null;

function getLoggerProvider(): LoggerProvider {
  if (_loggerProvider) {
    return _loggerProvider;
  }

  const POSTHOG_KEY = process.env.POSTHOG_PROJECT_API_KEY || process.env.NEXT_PUBLIC_POSTHOG_KEY || "";
  const POSTHOG_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com";

  const exporter = new OTLPLogExporter({
    url: `${POSTHOG_HOST}/i/v1/logs`,
    headers: {
      "Authorization": `Bearer ${POSTHOG_KEY}`,
      "Content-Type": "application/json",
    },
  });

  _loggerProvider = new LoggerProvider({
    resource: resourceFromAttributes({ "service.name": "youssef-portfolio" }),
    processors: [
      new SimpleLogRecordProcessor(exporter),
    ],
  });

  return _loggerProvider;
}

export const loggerProvider = {
  getLogger: (name: string) => getLoggerProvider().getLogger(name),
  forceFlush: () => getLoggerProvider().forceFlush(),
};

export function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    logs.setGlobalLoggerProvider(getLoggerProvider());
  }
}
