resource "aws_apigatewayv2_api" "audit" {
  name          = "${var.project}-audit-api"
  protocol_type = "HTTP"
}
resource "aws_apigatewayv2_integration" "audit" {
  api_id                 = aws_apigatewayv2_api.audit.id
  integration_type       = "AWS_PROXY"
  integration_uri        = aws_lambda_function.audit.invoke_arn
  payload_format_version = "2.0"
}
resource "aws_lambda_permission" "apigw" {
  statement_id  = "AllowInvokeFromAPIGW"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.audit.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.audit.execution_arn}/*/*"
}
resource "aws_apigatewayv2_route" "audit_post" {
  api_id    = aws_apigatewayv2_api.audit.id
  route_key = "POST /audit"
  target    = "integrations/${aws_apigatewayv2_integration.audit.id}"
}
resource "aws_apigatewayv2_stage" "prod" {
  api_id      = aws_apigatewayv2_api.audit.id
  name        = "prod"
  auto_deploy = true
  access_log_settings {
    destination_arn = aws_cloudwatch_log_group.apigw.arn
    format = jsonencode({
      requestId      = "$context.requestId",
      httpMethod     = "$context.httpMethod",
      routeKey       = "$context.routeKey",
      status         = "$context.status",
      protocol       = "$context.protocol",
      responseLength = "$context.responseLength",
      requestTime    = "$context.requestTime",
      integration    = {
        status        = "$context.integration.status",
        error         = "$context.integration.error",
        latency       = "$context.integration.latency"
      }
    })
  }
}

resource "aws_cloudwatch_log_group" "apigw" {
  name              = "/aws/http-api/${var.project}/audit"
  retention_in_days = 14
}
