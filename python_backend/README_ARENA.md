# Medical Arena - Autogen Multi-Agent System

## Overview
The Medical Arena is a Doctor-Resident debate system using Autogen multi-agent framework. It simulates a realistic medical consultation where a Senior Surgeon (Doctor) and Junior Resident engage in a structured debate to diagnose patient conditions.

## Installation

### Backend Setup
```bash
cd backend
pip install -r requirements.txt
```

**Important:** Install pyautogen:
```bash
pip install pyautogen==0.10.0
```

### Environment Variables
Make sure your `.env` file contains:
```env
GROQ_API_KEY=your_groq_api_key_here
TAVILY_API_KEY=your_tavily_api_key_here  # Optional
```

## How It Works

### Agent Roles

**Doctor Agent (Dr. Sarah Mitchell)**
- Senior Surgeon with 20+ years experience
- Leads the diagnostic discussion
- Questions the Resident's reasoning
- Ensures thorough medical analysis
- Provides final diagnosis to patient

**Resident Agent (Dr. Alex Chen)**
- Junior Surgical Resident (3rd year)
- Analyzes patient symptoms
- Responds with medical reasoning
- Learns from Doctor's guidance
- Refines diagnosis based on feedback

### Debate Flow

1. **Patient Input** → Symptoms and medical history
2. **Doctor** → Analyzes and questions
3. **Resident** → Responds with reasoning
4. **Doctor & Resident** → Debate and converge
5. **Doctor** → Final diagnosis + disclaimer

## API Endpoints

### POST /arena/debate
Start a complete debate (returns all messages at once)

**Request:**
```json
{
  "symptoms": "Patient symptoms description...",
  "model": "llama-3.3-70b-versatile",
  "max_rounds": 6
}
```

**Response:**
```json
{
  "messages": [
    {
      "role": "doctor",
      "content": "...",
      "name": "Doctor"
    },
    {
      "role": "resident",
      "content": "...",
      "name": "Resident"
    }
  ]
}
```

### POST /arena/debate-stream
Stream debate messages one by one (recommended for UI)

**Request:** Same as above

**Response:** Server-Sent Events (SSE)
```
data: {"role": "doctor", "content": "...", "name": "Doctor"}

data: {"role": "resident", "content": "...", "name": "Resident"}

data: [DONE]
```

## Frontend Usage

Navigate to: `http://localhost:3000/arena`

### Features
- Split-screen UI showing Doctor and Resident separately
- Messages appear one after another
- Color-coded by role (Blue = Doctor, Cyan = Resident)
- Real-time streaming debate
- Patient case summary at top
- Medical disclaimer footer

### Navigation
From Dashboard → Click "Medical Arena" button in header

## Safety & Disclaimers

⚠️ **Important:**
- This is a simulated medical discussion using AI
- NOT a replacement for real medical advice
- Always consult a licensed physician
- No guaranteed medical certainty
- Does not prescribe medication directly

## Troubleshooting

### Autogen Import Error
If you get import errors, try:
```bash
pip uninstall pyautogen
pip install pyautogen==0.10.0
```

### Backend Not Starting
Check that all dependencies are installed:
```bash
pip install -r requirements.txt
```

### No Debate Messages
1. Ensure GROQ_API_KEY is set in `.env`
2. Check backend logs for errors
3. Verify the model name is valid

## Example Patient Case

```
45-year-old male presenting with severe chest pain radiating to left arm, 
shortness of breath, and sweating for the past 30 minutes. 
History of hypertension and smoking.
```

This will trigger a debate about possible cardiac issues, differential diagnosis, and treatment approach.

## Technical Details

- **Framework:** Autogen 0.10.0
- **LLM Provider:** Groq (via ChatGroq)
- **Models:** Llama 3.3 70B, Llama 3.1 8B, etc.
- **Backend:** FastAPI with async streaming
- **Frontend:** Next.js 14 with TypeScript
- **UI:** Tailwind CSS with gradient themes

## Future Enhancements

- [ ] Add more specialist roles (Cardiologist, Neurologist, etc.)
- [ ] Save debate transcripts
- [ ] Export to PDF
- [ ] Voice synthesis for agents
- [ ] Multi-language support
- [ ] Integration with medical databases
