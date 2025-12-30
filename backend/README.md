# MEDA Medical Assistant Backend

FastAPI backend with LangChain, Groq LLM, and Tavily search integration for the MEDA Medical Assistant application.

## Features

- **Multiple LLM Models**: Support for 5 different Groq models
- **Real-time Search**: Tavily integration for fetching current medical information
- **Streaming Support**: Optional streaming responses for better UX
- **Agent-based Architecture**: LangChain agents with tool calling capabilities
- **CORS Enabled**: Ready for frontend integration

## Setup

### 1. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. Environment Variables

Add the following to your `.env` file in the project root:

```env
GROQ_API_KEY=your_groq_api_key_here
TAVILY_API_KEY=your_tavily_api_key_here
```

### 3. Run the Server

```bash
python main.py
```

Or with uvicorn:

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at `http://localhost:8000`

## API Endpoints

### GET `/`
Health check endpoint

**Response:**
```json
{
  "message": "MEDA Medical Assistant API",
  "version": "1.0.0",
  "status": "active"
}
```

### GET `/models`
Get list of available models

**Response:**
```json
{
  "models": [
    "llama-3.3-70b-versatile",
    "llama-3.1-8b-instant",
    "meta-llama/llama-guard-4-12b",
    "openai/gpt-oss-20b",
    "openai/gpt-oss-120b"
  ],
  "default": "llama-3.3-70b-versatile"
}
```

### POST `/chat`
Main chat endpoint with streaming support

**Request Body:**
```json
{
  "messages": [
    {
      "role": "user",
      "content": "What are the latest treatments for diabetes?"
    }
  ],
  "model": "llama-3.3-70b-versatile",
  "stream": false
}
```

**Response (Non-streaming):**
```json
{
  "role": "assistant",
  "content": "Based on the latest research..."
}
```

**Response (Streaming):**
Server-Sent Events (SSE) format with chunks of the response.

### POST `/search`
Direct search endpoint for testing Tavily integration

**Query Parameter:**
- `query`: Search query string

**Response:**
```json
{
  "results": [...]
}
```

## Available Models

1. **llama-3.3-70b-versatile** (Default) - Best for complex medical queries
2. **llama-3.1-8b-instant** - Faster responses, good for simple queries
3. **meta-llama/llama-guard-4-12b** - Safety-focused model
4. **openai/gpt-oss-20b** - OpenAI-style model (20B parameters)
5. **openai/gpt-oss-120b** - OpenAI-style model (120B parameters)

## System Prompt

The assistant uses a comprehensive medical system prompt that:
- Defines MEDA as a medical research assistant
- Emphasizes evidence-based medicine
- Includes medical disclaimers
- Guides when to use real-time search
- Ensures accurate, professional responses

## Architecture

```
┌─────────────┐
│   FastAPI   │
└──────┬──────┘
       │
       ├─── LangChain Agent
       │    ├─── Groq LLM (5 models)
       │    └─── Tavily Search Tool
       │
       └─── CORS Middleware
```

## Error Handling

- Invalid model selection: 400 Bad Request
- Missing/invalid messages: 400 Bad Request
- API errors: 500 Internal Server Error

## Development

The backend is structured with:
- `main.py` - FastAPI application and endpoints
- `config.py` - Configuration and environment variables
- `prompts.py` - System prompts and instructions
- `requirements.txt` - Python dependencies

## Notes

- The agent can automatically decide when to use the search tool
- Search tool is configured for medical/healthcare queries
- Streaming is recommended for better user experience
- All responses include medical disclaimers as per the system prompt
