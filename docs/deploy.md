Note: Previous deployments used Railway for the media service. This has been replaced with Fly.io.

Media (Fly) quick start
```
cd apps/media
fly launch --no-deploy
fly deploy -a earlybird-media --remote-only --auto-confirm
```

Trigger: automated commit to initiate deploys via your chosen CI/CD.
