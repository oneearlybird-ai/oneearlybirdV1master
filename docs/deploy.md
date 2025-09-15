Note: Previous deployments used Railway and Fly.io for the media service. This has been replaced with AWS (EC2 behind ALB/ACM).

Media (AWS) quick start
```
# Build container and run under systemd on EC2; place behind an internal ALB with ACM TLS.
# See docs/operations/handoff_checklist.md for environment variables and smokes.
```

Trigger: automated commit to initiate deploys via your chosen CI/CD.
