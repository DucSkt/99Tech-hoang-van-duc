# 🏆 Leaderboard API Specification

## 🎯 Overview
This module provides a **Leaderboard System** for tracking and updating user scores in real-time.  
It ensures **high performance, security, and scalability** by using:
- **Redis** for real-time leaderboard ranking (with TTL caching).
- **PostgreSQL** for persistent storage.
- **WebSocket** for live updates.
- **HMAC + Nonce** to prevent unauthorized score modifications.

---

## 📌 API Endpoints

### 1️⃣ Get Top 10 Leaderboard (with token validation)
```http
GET /api/leaderboard
Authorization: Bearer <JWT_TOKEN>
```
#### 🔹 **Flow**
1. Validate the **JWT token** to prevent spam requests.
2. Check the **Redis cache** for the leaderboard.
    - If found, return the top 10 users from Redis.
    - If not found, retrieve the leaderboard from **PostgreSQL** and update Redis.
    - Set a **TTL of 1 hour** for Redis caching.
3. Return the **top 10 users**.

**Response:**
```json
{
  "leaderboard": [
    { "rank": 1, "username": "user1", "score": 1000 },
    { "rank": 2, "username": "user2", "score": 950 }
  ]
}
```

---

### 2️⃣ Submit Score (Secure)
```http
POST /api/score
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```
**Body:**
```json
{
  "score": 50,
  "nonce": 123456,
  "signature": "hashed_signature"
}
```
#### 🔹 **Flow**
1. Validate the **JWT token** to authenticate the user.
2. Retrieve **userId from the token**.
3. Verify the **nonce**:
    - Each user has a stored nonce.
    - Before signing, the user must fetch their latest nonce and sign the request.
    - The backend checks if the nonce belongs to the authenticated user, updates the nonce once it is valid.
4. Validate the **HMAC SHA256 signature** to ensure request integrity.
5. Check **latest update time**:
    - Users can only update their points if at least **5 seconds** have passed since the last update.
6. Update the **user's score** in Redis and PostgreSQL.

**Security:**

✅ Each user has a **unique nonce** to prevent replay attacks.  
✅ Signature ensures **data integrity**.  
✅ **Rate-limited updates** (every 5 seconds).

**Response:**
```json
{
  "message": "Score updated successfully",
  "new_score": 1050
}
```

---

### 3️⃣ Real-time Updates (WebSocket)
```websocket
/ws/leaderboard
Authorization: Bearer <JWT_TOKEN>
```
#### 🔹 **Flow**
1. Validate the **JWT token** before allowing WebSocket connection.
2. Decide how to handle leaderboard data:
    - Only send updates when there is a change in the top 10.

**Events:**
- `score_update`: Sends updated leaderboard when a user enters/exits the **top 10**.

---

## 🚀 Improvements

### ✅ **Daily Point Limit**
- Set a **max daily point limit** per user to prevent abuse.

### ✅ **Nonce + Signature Verification**
- Require **nonce + HMAC SHA256 signature** to validate score updates.

### ✅ **Rate Limiting**
- Users can **only update scores every 5 seconds**.

### ✅ **Optimal Request**
- In event socket contains data of top 10 users, to limit requests from users calling to redis.
- Only send socket update events when there is a change in the top 10.
---

## ⚙️ Tech Stack
- **Backend**: NodeJS (Express/NestJS)
- **Database**: PostgreSQL (persistent storage) + Redis (real-time ranking, TTL cache)
- **Authentication**: JWT (OAuth2 support)
- **Live Updates**: WebSocket (event-driven updates)

