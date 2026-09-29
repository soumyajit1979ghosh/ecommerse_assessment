## Ecommerse Assessment

### Environment Setup

Create an .env file inside the ./server folder and add the details as follows:

```
PORT=8877
NODE_ENV=development
DB_HOST=localhost
DB_PORT=5432
DB_USER=YOUR_DATABASE_USER_NAME
DB_PASSWORD=YOUR_DATABASE_PASSWORD
DB_NAME=shoppin_db
REDIS_URL=redis://localhost:6379
JWT_SECRET=thisisjwtsecret
JWT_EXPIRES_IN=1d
RESERVATION_TTL_SECONDS=300
```
