const mongoose = require("mongoose");


const httpRequestsTotal = new Map();
const httpRequestDurationMs = new Map();


function recordHttpRequest(method, path, status, durationMs) {
  const counterKey = `${method},${path},${status}`;
  httpRequestsTotal.set(counterKey, (httpRequestsTotal.get(counterKey) || 0) + 1);

  const durationKey = `${method},${path}`;
  const record = httpRequestDurationMs.get(durationKey) || { count: 0, sum: 0 };
  record.count += 1;
  record.sum += durationMs;
  httpRequestDurationMs.set(durationKey, record);
}


async function getPrometheusMetrics() {
  const metrics = [];


  metrics.push("# HELP http_requests_total Total number of HTTP requests.");
  metrics.push("# TYPE http_requests_total counter");
  for (const [key, value] of httpRequestsTotal.entries()) {
    const [method, path, status] = key.split(",");
    metrics.push(`http_requests_total{method="${method}",path="${path}",status="${status}"} ${value}`);
  }


  metrics.push("# HELP http_request_duration_ms_sum Total HTTP request latency in milliseconds.");
  metrics.push("# TYPE http_request_duration_ms_sum counter");
  metrics.push("# HELP http_request_duration_ms_count Total number of measured HTTP requests for latency.");
  metrics.push("# TYPE http_request_duration_ms_count counter");
  for (const [key, record] of httpRequestDurationMs.entries()) {
    const [method, path] = key.split(",");
    metrics.push(`http_request_duration_ms_sum{method="${method}",path="${path}"} ${record.sum}`);
    metrics.push(`http_request_duration_ms_count{method="${method}",path="${path}"} ${record.count}`);
  }

  const dbState = mongoose.connection.readyState;
  metrics.push("# HELP db_connection_status Database connection status (1 = connected, 0 = other).");
  metrics.push("# TYPE db_connection_status gauge");
  metrics.push(`db_connection_status ${dbState === 1 ? 1 : 0}`);


  metrics.push("# HELP node_process_uptime_seconds Uptime of the node process in seconds.");
  metrics.push("# TYPE node_process_uptime_seconds gauge");
  metrics.push(`node_process_uptime_seconds ${process.uptime()}`);

  metrics.push("# HELP node_process_memory_usage_bytes Resident set size memory usage in bytes.");
  metrics.push("# TYPE node_process_memory_usage_bytes gauge");
  metrics.push(`node_process_memory_usage_bytes ${process.memoryUsage().rss}`);


  try {
    const Log = mongoose.model("Log");
    const Incident = mongoose.model("Incident");

    if (Log) {
      const logCount = await Log.countDocuments();
      metrics.push("# HELP signalops_logs_total Total number of ingested log lines.");
      metrics.push("# TYPE signalops_logs_total gauge");
      metrics.push(`signalops_logs_total ${logCount}`);
    }

    if (Incident) {
      const activeIncidents = await Incident.countDocuments({ status: { $ne: "RESOLVED" } });
      metrics.push("# HELP signalops_active_incidents Total number of active/unresolved incidents.");
      metrics.push("# TYPE signalops_active_incidents gauge");
      metrics.push(`signalops_active_incidents ${activeIncidents}`);
    }
  } catch (err) {

  }

  return metrics.join("\n") + "\n";
}

module.exports = {
  recordHttpRequest,
  getPrometheusMetrics,
};
