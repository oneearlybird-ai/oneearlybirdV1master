# 2025-09-19 — Media Gateway (Twilio Streams) Rollout Plan

Scope
- Stand up HA media WebSocket gateway for Twilio Media Streams at `wss://media.oneearlybird.ai/rtm/voice`.
- Components: ACM cert, ALB (HTTPS 443), Target Group (HTTP -> 8080), ASG (2× c7g.2xlarge, Debian 12 ARM64), SGs, Route 53 alias.
- No changes to existing FS/SIP in this step. Twilio number stays on old flow until we cut over.

Terraform
- Path: `infra/terraform/media-gateway`
- Variables: see `variables.tf` and `terraform.tfvars.example`.
- Prereqs: `AWS_DEFAULT_PROFILE=chris-admin` and Route 53 hosted zone for `oneearlybird.ai`.

Commands
1. cd infra/terraform/media-gateway
2. terraform init
3. export TF_VAR_media_auth_token="<random-32-bytes>"
   (optional) export TF_VAR_elevenlabs_api_key="sk_..."
4. terraform plan -out plan.out
5. terraform apply plan.out

Outputs
- `alb_dns_name` and `route53_record` (A alias) for `media.oneearlybird.ai`.

What it deploys
- IAM: EC2 role with SSM core.
- SGs: `media-alb-sg` (443 open), `media-instance-sg` (8080 from ALB only).
- ACM: public cert for `media.oneearlybird.ai` validated by Route 53 CNAME.
- ALB: HTTPS:443 with TLS 1.2/1.3 policy, targets `media-ws-tg`.
- ASG: 2× c7g.2xlarge across default VPC subnets, user-data installs Node 20 and starts `media-ws` systemd @ 8080.

Runtime
- Health check: `GET /health` — 200 indicates ready.
- Metrics: `GET /metrics` — basic counters, no PHI.
- Token: if `MEDIA_AUTH_TOKEN` is set, WS requires `?token=...` or header `x-media-auth: ...`.

Twilio Cutover (after ALB is healthy)
- Switch number webhook to return TwiML `<Connect><Stream url="wss://media.oneearlybird.ai/rtm/voice" track="both"/>`.
- For AI+human: `<Start><Stream track="both"/>` then `<Dial>` the business line (or Conference variant).
- Remove SIP trunk assignment from the number to avoid 32011.

Security Hardening (post-cutover)
- Optionally restrict ALB SG 443 to Twilio IPs (IPs may change; prefer WS token auth).
- Store secrets in SSM Parameter Store; pass to instances via `EnvironmentFile=/etc/default/media-ws` or SSM agent.
- Keep logs redacted; no PHI.

Latency Targets
- Keep infra in `us-east-1` and pin Twilio to `us1`.
- Disable permessage-deflate; WS gateway uses TCP_NODELAY (default Node TCP behavior).
- Process 20 ms frames inline; warm ElevenLabs session.

Rollback
- `terraform destroy` in this module only reverts the media gateway; no other stacks touched.

