const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const OpenAI = require('openai');
const Post = require('../models/Post');

// Initialize Groq client
const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

const CREDIT_COST_PER_100_WORDS = Number(process.env.CREDIT_COST_PER_100_WORDS || 1);

function estimateWords(text) {
  if (!text) return 0;
  return text.trim().split(/\s+/).length;
}

function getCategoryPrompt(category) {
  const prompts = {
    'general': 'You are a versatile content writer. Create engaging and informative content that is well-structured and easy to read.',
    'marketing': 'You are an expert marketing copywriter. Create persuasive content that highlights value propositions and drives engagement. Focus on benefits and clear calls to action.',
    'product': 'You are a professional product content writer. Create detailed, accurate, and user-focused content that explains features and benefits clearly.',
    'blog': 'You are an experienced blogger. Create engaging, conversational content with a clear narrative structure. Include relevant examples and maintain a consistent tone.',
    'technical': 'You are a technical writer. Create precise, well-structured content with accurate terminology and clear explanations.',
    'creative': 'You are a creative writer. Create engaging, imaginative content with vivid descriptions and compelling narrative.',
    'social': 'You are a social media content creator. Create concise, engaging content that sparks interaction and fits platform-specific best practices.'
  };
  
  return prompts[category] || prompts['general'];
}

router.post('/', auth, async (req, res) => {
  try {
    const { prompt, category = 'general', title = '', model = 'openai/gpt-oss-20b' } = req.body;
    if (!prompt) return res.status(400).json({ error: 'No prompt' });

    // Simple estimate: we'll ask Groq and then compute words
    // Check credits: estimate 200 words typical => cost = ceil(words/100)*credit_rate
    const estimatedWords = 200; // conservative pre-check
    const estimatedCost = Math.ceil(estimatedWords / 100) * CREDIT_COST_PER_100_WORDS;
    if (req.user.credits < estimatedCost) return res.status(402).json({ error: 'Not enough credits' });

    // Prepare system message based on category
    const systemMessage = {
      role: 'system',
      content: getCategoryPrompt(category)
    };

    // Call Groq API with enhanced prompt using the OpenAI-compatible client
    console.log('Calling Groq API...'); // Debug log
    
    const response = await groq.responses.create({
      model: 'openai/gpt-oss-20b',
      input: prompt,
      temperature: 0.7,
      top_p: 0.9,
    });

    // Validate API response
    if (!response || !response.output_text) {
      throw new Error('Invalid response from Groq API');
    }

    const content = response.output_text;
    if (!content) {
      throw new Error('No content generated');
    }

    const usage = response.usage || {};
    const words = estimateWords(content);
    
    // Validate generated content
    if (words < 10) {
      throw new Error('Generated content is too short');
    }

    const actualCost = Math.ceil(words / 100) * CREDIT_COST_PER_100_WORDS;

    // Format the title
    let finalTitle = title;
    if (!finalTitle) {
      // Extract first line as title if not provided
      const lines = content.split('\n');
      finalTitle = lines[0].replace(/^#\s*/, ''); // Remove Markdown heading if present
      if (finalTitle.length > 100) {
        finalTitle = finalTitle.substring(0, 97) + '...';
      }
    }

    // Deduct credits atomically-ish
    req.user.credits = Math.max(0, req.user.credits - actualCost);
    await req.user.save();

    // Save post
    const post = new Post({
      userId: req.user._id,
      title: finalTitle || 'Untitled',
      body: content,
      category,
      wordCount: words,
      prompt,
      modelUsed: model,
      tokensUsed: usage.total_tokens || 0
    });
    await post.save();

    res.json({
      post,
      creditsLeft: req.user.credits,
      usage,
      cost: actualCost
    });
  } catch (err) {
    console.error('Content generation error:', err);

    // Handle OpenAI client errors
    if (err instanceof OpenAI.APIError) {
      console.error('Groq API error:', {
        status: err.status,
        message: err.message,
        type: err.type
      });

      // Map common error types
      switch (err.status) {
        case 401:
          return res.status(500).json({
            error: 'Authentication Error',
            message: 'Invalid API key. Please check your Groq API key configuration.'
          });
        case 404:
          return res.status(500).json({
            error: 'API Configuration Error',
            message: 'Invalid API endpoint. Please check the API configuration.'
          });
        case 429:
          return res.status(429).json({
            error: 'Rate limit exceeded',
            message: 'Too many requests. Please try again later.'
          });
        default:
          return res.status(err.status || 500).json({
            error: 'Generation failed',
            message: err.message || 'Error calling Groq API',
            type: err.type
          });
      }
    }

    // Generic error
    res.status(500).json({
      error: 'Generation failed',
      message: err.message || 'An unexpected error occurred while generating content'
    });
  }
});

module.exports = router;
