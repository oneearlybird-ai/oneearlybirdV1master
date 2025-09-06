output "audit_webhook_url" {
  value = "${aws_apigatewayv2_api.audit.api_endpoint}/${aws_apigatewayv2_stage.prod.name}/audit"
}
