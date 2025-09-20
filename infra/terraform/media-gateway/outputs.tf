output "alb_dns_name" { value = aws_lb.media_alb.dns_name }
output "alb_arn" { value = aws_lb.media_alb.arn }
output "alb_listener_arn" { value = aws_lb_listener.https.arn }
output "route53_record" { value = aws_route53_record.media_alias.fqdn }
output "certificate_arn" { value = aws_acm_certificate_validation.cert.certificate_arn }

