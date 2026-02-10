require('dotenv').config();
const express = require('express');
const cors = require('cors');
const Groq = require('groq-sdk');

const app = express();
const PORT = 3001;

// Init Groq
const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

app.use(cors());
app.use(express.json());

// Root route - API info
app.get('/', (req, res) => {
    res.json({
        name: 'SecondBrain API',
        version: '1.0.0',
        status: 'running',
        endpoints: {
            knowledge: '/api/knowledge',
            stats: '/api/stats',
            insights: '/api/insights'
        },
        docs: 'See API.md for full documentation'
    });
});

// Health
app.get('/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
});

// Simple in-memory storage
let knowledge = [];
let idCounter = 1;

// GET /api/knowledge - List all items
app.get('/api/knowledge', (req, res) => {
    const { type, limit } = req.query;
    let result = [...knowledge];

    if (type && type !== 'all') {
        result = result.filter(k => k.type === type);
    }

    if (limit) {
        result = result.slice(0, parseInt(limit));
    }

    res.json({
        items: result.map(k => ({
            id: k.id,
            type: k.type,
            title: k.title,
            content: k.content,
            status: k.status,
            createdAt: k.createdAt,
            insights: k.insights,
            preview: k.insights?.summary?.slice(0, 150) + '...'
        })),
        total: result.length
    });
});

// GET /api/knowledge/:id - Get single item with full insights
app.get('/api/knowledge/:id', (req, res) => {
    const item = knowledge.find(k => k.id === req.params.id);

    if (!item) {
        return res.status(404).json({ error: 'Knowledge item not found' });
    }

    res.json(item);
});

// POST /api/knowledge - Create new item
app.post('/api/knowledge', (req, res) => {
    const { type, title, content } = req.body;

    if (!title || !content) {
        return res.status(400).json({ error: 'Title and content are required' });
    }

    const newItem = {
        id: `k${idCounter++}`,
        type: type || 'text',
        title,
        content,
        createdAt: new Date().toISOString(),
        status: 'pending',
        insights: null
    };

    knowledge.unshift(newItem);
    res.status(201).json(newItem);
});

// DELETE /api/knowledge/:id - Remove an item
app.delete('/api/knowledge/:id', (req, res) => {
    const index = knowledge.findIndex(k => k.id === req.params.id);

    if (index === -1) {
        return res.status(404).json({ error: 'Knowledge item not found' });
    }

    const deletedItem = knowledge.splice(index, 1)[0];
    res.json({ message: 'Item deleted successfully', id: deletedItem.id });
});

// POST /api/knowledge/:id/analyze - Trigger AI analysis
app.post('/api/knowledge/:id/analyze', async (req, res) => {
    const item = knowledge.find(k => k.id === req.params.id);

    if (!item) {
        return res.status(404).json({ error: 'Knowledge item not found' });
    }

    // Set to processing
    item.status = 'processing';

    try {
        console.log(`Analyzing: ${item.title}`);
        const insights = await generateAIInsights(item);

        item.status = 'analyzed';
        item.insights = insights;

        console.log(`Analysis complete for: "${item.title}"`);

        res.json({
            id: item.id,
            status: 'analyzed',
            insights: insights
        });
    } catch (error) {
        console.error('Analysis failed:', error);
        item.status = 'error';
        res.status(500).json({
            id: item.id,
            status: 'error',
            error: error.message
        });
    }
});

// GET /api/stats - Dashboard statistics
app.get('/api/stats', (req, res) => {
    const textCount = knowledge.filter(k => k.type === 'text').length;
    const videoCount = knowledge.filter(k => k.type === 'video').length;
    const insightCount = knowledge.reduce((acc, k) => {
        return acc + (k.insights?.keyPoints?.length || 0);
    }, 0);

    res.json({
        totalNotes: textCount,
        totalVideos: videoCount,
        aiInsights: insightCount,
        searchQueries: 0
    });
});

// GET /api/insights - Get all analyzed items with insights
app.get('/api/insights', (req, res) => {
    const analyzedItems = knowledge.filter(k => k.status === 'analyzed' && k.insights);

    const insights = analyzedItems.map(item => ({
        id: item.id,
        title: item.title,
        type: item.type,
        summary: item.insights?.summary || '',
        keyPoints: item.insights?.keyPoints || [],
        tags: item.insights?.tags || [],
        sentiment: item.insights?.sentiment,
        communication: item.insights?.communication,
        analyzedAt: item.insights?.analyzedAt,
        createdAt: item.createdAt
    }));

    res.json({
        items: insights,
        total: insights.length,
        totalKeyPoints: insights.reduce((acc, i) => acc + i.keyPoints.length, 0)
    });
});

// Generate AI insights using Groq
async function generateAIInsights(item) {
    const isVideo = item.type === 'video';

    const prompt = isVideo
        ? `Analyze this video content. Title: "${item.title}". URL/Description: "${item.content}".
           
           Return a JSON object with:
           - summary: A 2-3 sentence summary of what this video likely covers
           - keyPoints: Array of 4-5 key learning points
           - tags: Array of 3-5 relevant topic tags (lowercase)
           - communication: Object with scores (1-10) for clarity, engagement, structure, pace
           
           Only return valid JSON, no markdown.`
        : `Analyze this text content. Title: "${item.title}". Content: "${item.content.substring(0, 2000)}".
           
           Return a JSON object with:
           - summary: A 2-3 sentence summary of the main ideas
           - keyPoints: Array of 4-5 key insights or takeaways
           - tags: Array of 3-5 relevant topic tags (lowercase)
           - sentiment: One of "positive", "neutral", "negative", "educational"
           
           Only return valid JSON, no markdown.`;

    try {
        const completion = await groq.chat.completions.create({
            messages: [
                {
                    role: 'system',
                    content: 'You are a knowledge analysis assistant. Analyze content and return structured JSON insights. Always return valid JSON only.'
                },
                {
                    role: 'user',
                    content: prompt
                }
            ],
            model: 'llama-3.1-8b-instant',
            temperature: 0.3,
            max_tokens: 1000
        });

        const responseText = completion.choices[0]?.message?.content || '{}';

        // Parse the JSON response
        let parsed;
        try {
            // Try to extract JSON from response (in case there's extra text)
            const jsonMatch = responseText.match(/\{[\s\S]*\}/);
            parsed = JSON.parse(jsonMatch ? jsonMatch[0] : responseText);
        } catch (parseError) {
            console.error('Failed to parse AI response:', responseText);
            parsed = {};
        }

        const base = {
            summary: parsed.summary || `Analysis of "${item.title}"`,
            keyPoints: parsed.keyPoints || ['Key insight extracted', 'Important concept identified', 'Actionable takeaway noted'],
            tags: parsed.tags || ['knowledge', 'learning'],
            analyzedAt: new Date().toISOString(),
            aiGenerated: true
        };

        if (isVideo) {
            return {
                ...base,
                duration: '~10 min',
                communication: parsed.communication || {
                    clarity: 8.0,
                    engagement: 8.5,
                    structure: 8.0,
                    pace: 8.2
                }
            };
        }

        return {
            ...base,
            sentiment: parsed.sentiment || 'educational',
            readingTime: `${Math.ceil(item.content.length / 1000)} min`
        };

    } catch (error) {
        console.error('Groq AI error:', error.message);
        // Fallback to basic response
        return {
            summary: `Analysis of "${item.title}" - AI processing encountered an issue.`,
            keyPoints: ['Content has been saved', 'Manual review recommended'],
            tags: ['pending-review'],
            analyzedAt: new Date().toISOString(),
            aiGenerated: false,
            error: error.message
        };
    }
}

app.listen(PORT, () => {
    console.log(`SecondBrain API running at http://localhost:${PORT}`);
    console.log('\nEndpoints:');
    console.log('  GET    /api/knowledge');
    console.log('  GET    /api/knowledge/:id');
    console.log('  POST   /api/knowledge');
    console.log('  POST   /api/knowledge/:id/analyze');
    console.log('  GET    /api/stats');
    console.log('  GET    /api/insights');
});
