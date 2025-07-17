# POST without authentication should return 401
POST http://localhost:8080/v1/fragments
Content-Type: text/plain

`No auth header here`

HTTP/1.1 401
