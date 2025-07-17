# Health Check Test
GET http://localhost:8080

# Expect an HTTP 1.1 200 OK
HTTP/1.1 200
Cache-Control: no-cache

[Asserts]
# Basic JSON response checks
jsonpath "$.status" == "ok"
jsonpath "$.author" isString
jsonpath "$.githubUrl" matches /^https:\/\/github.com\/.+/
jsonpath "$.version" matches /^\d+\.\d+\.\d+$/
