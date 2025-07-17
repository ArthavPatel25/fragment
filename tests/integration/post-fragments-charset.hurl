# POST a plain text fragment with charset
POST http://localhost:8080/v1/fragments
Content-Type: text/plain; charset=utf-8

[BasicAuth]
user1@email.com:password1

`Fragment with charset`

HTTP/1.1 201

[Asserts]
jsonpath "$.fragment.type" == "text/plain"
[Captures]
url: header "Location"

# GET the fragment back
GET {{url}}
[BasicAuth]
user1@email.com:password1

HTTP/1.1 200

[Asserts]
header "Content-Type" matches "^text/plain(;\\s*charset=utf-8)?$"
body == "Fragment with charset"
