Rollback — Media Gateway Artifact

Purpose
- Provide a one-command rollback to the last known good (LKG) media server artifact if audio regresses after a deploy.

What’s included
- rollback.tfvars with the LKG S3 object and SHA256.
  - key: media/server-e4b6b96c9f69f52c22e01f8ddcdb8d3bad1a5ec75aa28935ddaae8c096c7b4b6.mjs
  - sha: e4b6b96c9f69f52c22e01f8ddcdb8d3bad1a5ec75aa28935ddaae8c096c7b4b6

Quick rollback
- cd infra/terraform/media-gateway
- terraform init (first time or if backend changed)
- terraform plan -var-file=rollback.tfvars
- terraform apply -var-file=rollback.tfvars

Notes
- This only updates the Launch Template user_data. Instances pick up the artifact on first boot. For immediate rollout, trigger an ASG instance refresh:
  aws autoscaling start-instance-refresh --auto-scaling-group-name media-ws-asg \
    --preferences '{"MinHealthyPercentage": 90, "InstanceWarmup": 60}'
- To roll forward again (current artifact is in variables.tf defaults):
  terraform apply

