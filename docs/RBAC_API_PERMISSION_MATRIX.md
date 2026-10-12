# FleetOps API Permission Matrix

| Endpoint | HTTP Method | ADMIN | FLEET_MANAGER | DISPATCHER | DRIVER |
|---|---|:---:|:---:|:---:|:---:|
| `/api/v1/vehicles` | GET | YES | YES | YES | NO |
| `/api/v1/vehicles` | POST | YES | YES | NO (403) | NO (403) |
| `/api/v1/vehicles/{id}` | PUT | YES | YES | NO (403) | NO (403) |
| `/api/v1/vehicles/{id}/category` | PATCH | YES | YES | NO (403) | NO (403) |
| `/api/v1/vehicles/{id}/status` | PATCH | YES | YES | YES | NO (403) |
| `/api/v1/vehicles/{id}` | DELETE | YES | NO (403) | NO (403) | NO (403) |
| `/api/v1/categories` | GET | YES | YES | NO | NO |
| `/api/v1/categories` | POST/PUT/PATCH | YES | YES | NO (403) | NO (403) |
| `/api/v1/drivers` | GET | YES | YES | YES | NO |
| `/api/v1/drivers` | POST/PUT | YES | YES | NO (403) | NO (403) |
| `/api/v1/trips` | GET | YES | YES | YES | YES |
| `/api/v1/trips` | POST | YES | YES | YES | NO (403) |
| `/api/v1/trips/{id}/start` | PUT | YES | YES | YES | NO (403) |
| `/api/v1/trips/{id}/complete` | PUT | YES | YES | YES | NO (403) |
| `/api/v1/trips/{id}/cancel` | PUT | YES | YES | YES | NO (403) |
| `/api/v1/fuel` | GET | YES | YES | NO | NO |
| `/api/v1/fuel` | POST | YES | YES | NO (403) | NO (403) |
| `/api/v1/maintenance/work-orders` | GET | YES | YES | NO | NO |
| `/api/v1/maintenance/work-orders` | POST/PUT | YES | YES | NO (403) | NO (403) |
| `/api/v1/parts` | GET | YES | YES | NO | NO |
| `/api/v1/parts` | POST/PUT | YES | YES | NO (403) | NO (403) |
| `/api/v1/recommendations` | GET | YES | YES | YES | NO |
| `/api/v1/recommendations/evaluate` | POST | YES | YES | NO (403) | NO (403) |
| `/api/v1/audit-logs` | GET | YES | NO (403) | NO (403) | NO (403) |
| `/api/v1/notifications` | GET/PUT | YES | YES | YES | YES |
| `/api/v1/analytics/dashboard` | GET | YES | YES | YES | YES |
