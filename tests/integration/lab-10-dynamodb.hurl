# tests/integration/lab-10-dynamodb.hurl

# POST a new fragment (metadata goes to DynamoDB, content to S3)
POST http://localhost:8080/v1/fragments
Content-Type: text/plain; charset=utf-8
[BasicAuth]
user1@email.com:password1

`Hello DynamoDB!`

HTTP/1.1 201
[Captures]
url: header "Location"

# Confirm GET works (should fetch from S3, metadata from DynamoDB)
GET {{url}}
[BasicAuth]
user1@email.com:password1

HTTP/1.1 200
[Asserts]
header "Content-Type" == "text/plain; charset=utf-8"
body == "Hello DynamoDB!"

# DELETE the fragment (removes metadata from DynamoDB and content from S3)
DELETE {{url}}
[BasicAuth]
user1@email.com:password1

HTTP/1.1 200

# Confirm it’s gone (404 from both stores)
GET {{url}}
[BasicAuth]
user1@email.com:password1

HTTP/1.1 404