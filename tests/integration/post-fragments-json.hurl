# POST a JSON fragment and verify response
POST http://localhost:8080/v1/fragments
Content-Type: application/json

[BasicAuth]
user1@email.com:password1

`{"title": "Test", "valid": true}`

HTTP/1.1 201

[Asserts]
jsonpath "$.fragment.type" == "application/json"
jsonpath "$.fragment.size" isInteger

[Captures]
url: header "Location"

# GET the fragment back
GET {{url}}
[BasicAuth]
user1@email.com:password1

HTTP/1.1 200

[Asserts]
header "Content-Type" matches "^application/json(;\\s*charset=utf-8)?$"
jsonpath "$.title" == "Test"
jsonpath "$.valid" == true
