data "cloudfoundry_service" "redis" {
  name = "redis"
}

resource "cloudfoundry_service_instance" "redis" {
  name         = "${var.environment}-frontend-redis"
  space        = data.cloudfoundry_space.space.id
  service_plan = data.cloudfoundry_service.redis.service_plans["${var.redis_service_plan}"]
}

