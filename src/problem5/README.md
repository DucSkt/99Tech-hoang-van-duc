# 🚀 ExpressJS + TypeScript + MongoDB

## 📂 1️⃣ Project Structure
```
99tech/
│── data/                      # MongoDB data (Docker volume)
│── dist/                      # Compiled TypeScript code (for production)
│── src/                       # Main source code
│   ├── config/                # System configuration
│   ├── resource/              # Main module
│   │   ├── dto/               # DTO validation
│   │   ├── models/            # Mongoose Schema
│   │   ├── resource.module.ts # Module managing resources
│   │   ├── resource.controller.ts  # Handles API requests
│   │   ├── resource.service.ts # Business logic
│   │   ├── resource.route.ts   # API route definitions
│── .env                       # Environment configuration file
│── package.json               # Dependencies list
│── tsconfig.json              # TypeScript configuration
│── Dockerfile                 # Dockerfile to build the project
│── docker-compose.yml         # Docker Compose configuration
│── README.md                  # Documentation
```

---

## 🐳 2️⃣ Running with Docker
### 1. Start MongoDB Replica Set + Node.js (Ensure Docker is running)
```sh
docker-compose up -d
```

## 📌 4️⃣ Testing the API with `curl`
### 1️⃣ Create a Resource
```sh
curl --location --request POST 'http://localhost:3000/api/v1/resources' \
--header 'Content-Type: application/json' \
--data-raw '{"name": "test", "description": "This is a test resource"}'
```

### 2️⃣ Get Resource List
```sh
curl --location --request GET 'http://localhost:3000/api/v1/resources?take=2&skip=0'
```

### 3️⃣ Soft Delete a Resource
```sh
curl --location --request DELETE 'http://localhost:3000/api/v1/resources/67b1b472a1b791d58fc3e1c9'
```

### 4️⃣ Update a Resource
```sh
curl --location --request PUT 'http://localhost:3000/api/v1/resources/67b1b472a1b791d58fc3e1c9' \
--header 'Content-Type: application/json' \
--data-raw '{
    "name": "Updated Resource",
    "description": "Updated description"
}'
```
### 5️⃣ Get Resource Details
```sh
curl --location --request GET 'http://localhost:3000/api/v1/resources/67b20afa8d8947dc03f8f7a1'
```
