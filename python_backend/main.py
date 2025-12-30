from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import List, Optional, AsyncGenerator
import json
import asyncio
import os

from langchain_groq import ChatGroq
from langchain_community.tools.tavily_search import TavilySearchResults
from langchain.agents import AgentExecutor, create_tool_calling_agent
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage

from autogen_agents import MedicalDebateSystem
from autogen_streaming import StreamingDebateSystem

# Ensure API Keys are loaded into environment variables
# LangChain tools often look for TAVILY_API_KEY in os.environ automatically
try:
    from config import settings
    from prompts import MEDICAL_ASSISTANT_SYSTEM_PROMPT
    os.environ["TAVILY_API_KEY"] = settings.TAVILY_API_KEY
    os.environ["GROQ_API_KEY"] = settings.GROQ_API_KEY
except ImportError:
    # Fallback for demonstration
    MEDICAL_ASSISTANT_SYSTEM_PROMPT = "You are a professional medical assistant with real-time web access."

app = FastAPI(title="MEDA Medical Assistant API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

AVAILABLE_MODELS = [
        'llama-3.3-70b-versatile',
        'llama-3.1-8b-instant',
        'meta-llama/llama-guard-4-12b',
        'openai/gpt-oss-20b',
        'openai/gpt-oss-120b'
      ]

class Message(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: List[Message]
    model: str = "llama-3.3-70b-versatile"
    stream: bool = False

class ChatResponse(BaseModel):
    role: str
    content: str

def get_tavily_tool():
    """Initialize Tavily search tool correctly."""
    api_key = os.getenv("TAVILY_API_KEY")
    if not api_key:
        print("Error: TAVILY_API_KEY not found in environment.")
        return None
    try:
        return TavilySearchResults(
            max_results=3,
            search_depth="advanced" # Advanced depth ensures better real-time results
        )
    except Exception as e:
        print(f"Failed to init Tavily: {e}")
        return None

def create_medical_agent(model_name: str):
    llm = ChatGroq(
        api_key=os.getenv("GROQ_API_KEY"),
        model=model_name,
        temperature=0.1, # Lower temperature for better tool use accuracy
    )
    
    tavily_tool = get_tavily_tool()
    tools = [tavily_tool] if tavily_tool else []
    
    # Prompt MUST include agent_scratchpad for tool-calling agents
    prompt = ChatPromptTemplate.from_messages([
        ("system", MEDICAL_ASSISTANT_SYSTEM_PROMPT),
        MessagesPlaceholder(variable_name="chat_history"),
        ("human", "{input}"),
        MessagesPlaceholder(variable_name="agent_scratchpad"),
    ])
    
    if tools:
        # bind_tools is implicit in create_tool_calling_agent, 
        # but ensure the LLM used supports it (Llama 3 on Groq does)
        agent = create_tool_calling_agent(llm, tools, prompt)
        return AgentExecutor(
            agent=agent, 
            tools=tools, 
            verbose=True, 
            handle_parsing_errors=True,
            max_iterations=5 # Limit to prevent infinite loops
        )
    return llm

def convert_messages(messages: List[Message]):
    langchain_messages = []
    for msg in messages[:-1]:
        if msg.role == "user":
            langchain_messages.append(HumanMessage(content=msg.content))
        elif msg.role == "assistant":
            langchain_messages.append(AIMessage(content=msg.content))
    return langchain_messages

@app.get("/models")
async def get_models():
    """Get list of available models"""
    return {
        "models": AVAILABLE_MODELS,
        "default": "llama-3.3-70b-versatile"
    }

@app.post("/chat")
async def chat(request: ChatRequest):
    if request.model not in AVAILABLE_MODELS:
        raise HTTPException(status_code=400, detail="Invalid model")
    
    current_query = request.messages[-1].content
    chat_history = convert_messages(request.messages)
    executor = create_medical_agent(request.model)

    if request.stream:
        async def generate_stream():
            if isinstance(executor, AgentExecutor):
                # Standard for streaming from agents
                async for event in executor.astream_events(
                    {"input": current_query, "chat_history": chat_history},
                    version="v1"
                ):
                    kind = event["event"]
                    if kind == "on_chat_model_stream":
                        content = event["data"]["chunk"].content
                        if content:
                            yield f"data: {json.dumps({'content': content})}\n\n"
            else:
                messages = [SystemMessage(content=MEDICAL_ASSISTANT_SYSTEM_PROMPT)] + chat_history + [HumanMessage(content=current_query)]
                async for chunk in executor.astream(messages):
                    yield f"data: {json.dumps({'content': chunk.content})}\n\n"
            yield "data: [DONE]\n\n"

        return StreamingResponse(generate_stream(), media_type="text/event-stream")

    else:
        if isinstance(executor, AgentExecutor):
            # INVOKE includes tool execution automatically
            result = await executor.ainvoke({"input": current_query, "chat_history": chat_history})
            response_content = result["output"]
        else:
            messages = [SystemMessage(content=MEDICAL_ASSISTANT_SYSTEM_PROMPT)] + chat_history + [HumanMessage(content=current_query)]
            result = await executor.ainvoke(messages)
            response_content = result.content
            
        return ChatResponse(role="assistant", content=response_content)

# Autogen Medical Arena Endpoints
class DebateRequest(BaseModel):
    symptoms: str
    model: str = "llama-3.3-70b-versatile"
    max_rounds: int = 25

class DebateMessage(BaseModel):
    role: str
    content: str
    name: str

class DebateResponse(BaseModel):
    messages: List[DebateMessage]

@app.post("/arena/debate")
async def medical_debate(request: DebateRequest):
    """Start a Doctor-Resident debate about patient symptoms"""
    try:
        if request.model not in AVAILABLE_MODELS:
            raise HTTPException(status_code=400, detail="Invalid model")
        
        groq_api_key = os.getenv("GROQ_API_KEY")
        if not groq_api_key:
            raise HTTPException(status_code=500, detail="GROQ_API_KEY not configured")
        
        # Create debate system
        debate_system = MedicalDebateSystem(groq_api_key, request.model)
        
        # Run the debate
        messages = await debate_system.run_debate(request.symptoms, request.max_rounds)
        
        # Format response
        debate_messages = [
            DebateMessage(
                role=msg["role"],
                content=msg["content"],
                name=msg["name"]
            )
            for msg in messages
        ]
        
        return DebateResponse(messages=debate_messages)
    
    except Exception as e:
        print(f"Debate error: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/arena/debate-stream")
async def medical_debate_stream(request: DebateRequest):
    """Stream Doctor-Resident debate messages in real-time as they're generated"""
    async def generate_debate_stream():
        try:
            if request.model not in AVAILABLE_MODELS:
                yield f"data: {json.dumps({'error': 'Invalid model'})}\n\n"
                return
            
            groq_api_key = os.getenv("GROQ_API_KEY")
            if not groq_api_key:
                yield f"data: {json.dumps({'error': 'GROQ_API_KEY not configured'})}\n\n"
                return
            
            # Create streaming debate system
            debate_system = StreamingDebateSystem(groq_api_key, request.model)
            
            # Stream messages as they're generated in real-time
            async for msg in debate_system.run_debate_streaming(request.symptoms, request.max_rounds):
                yield f"data: {json.dumps(msg)}\n\n"
            
            yield "data: [DONE]\n\n"
        
        except Exception as e:
            print(f"Debate stream error: {e}")
            import traceback
            traceback.print_exc()
            yield f"data: {json.dumps({'error': str(e)})}\n\n"
    
    return StreamingResponse(generate_debate_stream(), media_type="text/event-stream")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app", # Point to your file name and app object
        host="0.0.0.0", 
        port=8000, 
        reload=True,
        log_level="info"
    )