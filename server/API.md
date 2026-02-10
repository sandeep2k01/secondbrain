# SecondBrain API Documentation

Minimal REST API for the SecondBrain knowledge management system.

## Base URL

```
http://localhost:3001/api
```

## Endpoints

### Knowledge Items

#### List Knowledge
```
GET /knowledge
```

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| type | string | Filter by `text` or `video` |
| limit | number | Max items to return |

**Response:**
```json
{
  "items": [
    {
      "id": "k1",
      "type": "text",
      "title": "Understanding React Hooks",
      "status": "analyzed",
      "createdAt": "2024-01-15T10:30:00.000Z",
      "preview": "Comprehensive guide covering useState..."
    }
  ],
  "total": 3
}
```

---

#### Get Knowledge Item
```
GET /knowledge/:id
```

**Response:**
```json
{
  "id": "k1",
  "type": "text",
  "title": "Understanding React Hooks",
  "content": "Full content here...",
  "createdAt": "2024-01-15T10:30:00.000Z",
  "status": "analyzed",
  "insights": {
    "summary": "AI-generated summary...",
    "keyPoints": ["Point 1", "Point 2"],
    "tags": ["react", "hooks"],
    "readingTime": "5 min"
  }
}
```

---

#### Create Knowledge
```
POST /knowledge
```

**Request Body:**
```json
{
  "type": "text",
  "title": "My New Note",
  "content": "Content to analyze..."
}
```

**Response:** `201 Created`
```json
{
  "id": "k4",
  "type": "text",
  "title": "My New Note",
  "content": "Content to analyze...",
  "createdAt": "2024-01-15T10:30:00.000Z",
  "status": "pending",
  "insights": null
}
```

---

#### Trigger AI Analysis
```
POST /knowledge/:id/analyze
```

Triggers async AI processing. Returns immediately with estimated time.

**Response:**
```json
{
  "id": "k4",
  "status": "processing",
  "estimatedTime": 1500
}
```

After processing completes, GET the item again to retrieve insights.

---

### Dashboard

#### Get Stats
```
GET /stats
```

**Response:**
```json
{
  "totalNotes": 127,
  "totalVideos": 34,
  "aiInsights": 89,
  "searchQueries": 256
}
```

---

#### Get AI Insights
```
GET /insights
```

Returns cross-content patterns and suggestions.

**Response:**
```json
{
  "patterns": [
    {
      "type": "connection",
      "title": "React Hooks patterns align with TypeScript notes",
      "items": ["k1", "k3"],
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  ],
  "topics": [
    { "name": "React Development", "count": 24 }
  ],
  "suggestions": [
    "Add notes on GraphQL patterns"
  ]
}
```

---

## Data Models

### Knowledge Item
```typescript
interface KnowledgeItem {
  id: string;
  type: 'text' | 'video';
  title: string;
  content: string;
  createdAt: string;           // ISO 8601
  status: 'pending' | 'processing' | 'analyzed';
  insights: Insights | null;
}
```

### Insights (Text)
```typescript
interface TextInsights {
  summary: string;
  keyPoints: string[];
  tags: string[];
  readingTime: string;
  analyzedAt: string;
}
```

### Insights (Video)
```typescript
interface VideoInsights {
  summary: string;
  keyPoints: string[];
  tags: string[];
  duration: string;
  analyzedAt: string;
  communication: {
    clarity: number;      // 0-10
    engagement: number;   // 0-10
    structure: number;    // 0-10
    pace: number;         // 0-10
  };
}
```

---

## Error Responses

```json
{
  "error": "Knowledge item not found"
}
```

| Status | Meaning |
|--------|---------|
| 400 | Bad request (missing fields) |
| 404 | Resource not found |
| 500 | Server error |

---

## Running the Server

```bash
cd server
npm install
npm start
```

Server runs at `http://localhost:3001`
