# Authenticated POST to /v1/fragments
POST http://localhost:8080/v1/fragments
Content-Type: text/plain; charset=utf-8
[BasicAuth]
user1@email.com:password1

`Hello S3!`

HTTP/1.1 201
[Captures]
url: header "Location"

# Authenticated GET using the captured URL
GET {{url}}
[BasicAuth]
user1@email.com:password1

HTTP/1.1 200
[Asserts]
header "Content-Type" == "text/plain; charset=utf-8"
body == "Hello S3!"

# DELETE the fragment
DELETE {{url}}
[BasicAuth]
user1@email.com:password1

HTTP/1.1 200

# Try to GET the deleted fragment again
GET {{url}}
[BasicAuth]
user1@email.com:password1

HTTP/1.1 404