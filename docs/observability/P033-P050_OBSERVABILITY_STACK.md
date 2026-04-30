# Phase Group B — Observability Stack (P031-P050)

## P033 — Grafana Installation
```bash
helm install grafana grafana/grafana \
  --namespace lmg-monitoring \
  --set persistence.enabled=true \
  --set persistence.size=20Gi
```
**Dashboards:** Platform Overview, Dispatch, Driver Health, Fleet Telemetry, Payment, ESG, SLA, Infrastructure

## P034 — Grafana Platform Overview Dashboard
Live orders, active drivers, revenue/hr, error rate panels

## P035 — Loki Installation & Log Collection
```bash
helm install loki grafana/loki-stack \
  --namespace lmg-monitoring
```
Log retention: 30 days hot, 1 year cold (S3)

## P036 — Tempo Installation
Distributed tracing backend, trace storage

## P037 — Jaeger Installation
Trace query UI for debugging

## P038 — OpenTelemetry Collector
Daemonset collecting metrics, logs, traces from all pods:
```yaml
receivers:
  otlp:
    protocols:
      grpc: { endpoint: "0.0.0.0:4317" }
      http: { endpoint: "0.0.0.0:4318" }
exporters:
  prometheus: { endpoint: "0.0.0.0:8889" }
  loki: { endpoint: "http://loki:3100" }
  otlp/tempo: { endpoint: "http://tempo:4317" }
```

## P039 — Grafana Log & Trace Dashboards
Loki log explorer, Tempo trace search

## P040 — Sentry Project Setup
```bash
npm install @sentry/nextjs @sentry/node
```
Error tracking for frontend + backend services

## P041 — Datadog Agent EKS DaemonSet
```bash
helm install datadog datadog/datadog \
  --namespace lmg-monitoring \
  --set datadog.apiKey=$DATADOG_API_KEY
```
APM + infrastructure metrics

## P042 — PagerDuty Service & Escalation
Services, escalation policies, on-call schedules

## P043 — Grafana PagerDuty Alert Rules
```yaml
groups:
- name: lmg-alerts
  rules:
  - alert: HighErrorRate
    expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.01
  - alert: DispatchLatency
    expr: histogram_quantile(0.95, dispatch_duration_seconds) > 5
```
P1/P2/P3/P4 routing

## P044 — AWS CloudWatch Custom Dashboards
EKS, MSK, OpenSearch resource dashboards

## P045 — AWS CloudWatch Synthetics Uptime
Canary checks every 5 min on all public endpoints

## P046 — Grafana Infrastructure Dashboard
EKS node utilisation, pod health, Kafka lag

## P047 — Grafana Payment Gateway Dashboard
Transaction volume, failure rate per gateway

## P048 — Grafana Driver Health Dashboard
Active drivers by zone, performance scores

## P049 — Grafana ESG Dashboard
Carbon kg/day, EV %, placeholder panels

## P050 — Chaos Engineering First Experiment
AWS FIS: Kill 1 API Gateway pod, validate resilience
```json
{
  "name": "Kill API Gateway Pod Test",
  "target": "eks-pod:api-gateway",
  "action": "terminate",
  "percentage": 33,
  "duration": "5 minutes",
  "acceptance_criteria": "p99 latency < 2s, zero 5xx"
}
```

---

## Observability Stack Summary
| Component | Purpose |
|-----------|---------|
| Prometheus | Metrics collection |
| ServiceMonitor | Auto-discover service metrics |
| Grafana | Dashboards (8+) |
| Loki | Log aggregation |
| Tempo | Distributed tracing |
| Jaeger | Trace analysis |
| OTel Collector | Unified instrumentation |
| Sentry | Error tracking |
| Datadog | APM + infra |
| PagerDuty | Incident management |
| CloudWatch | AWS-native monitoring |
| CloudWatch Synthetics | Uptime checks |
| AWS FIS | Chaos engineering |

**Phase Group B Complete! Ready for Phase Group C — Security & Compliance (P051-P070)**
