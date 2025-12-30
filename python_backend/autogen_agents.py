"""
Autogen Multi-Agent System for Doctor-Resident Medical Debate
"""
import os
from typing import List, Dict, Any
try:
    from autogen import AssistantAgent, UserProxyAgent, GroupChat, GroupChatManager
except ImportError:
    # Fallback for different autogen versions
    from autogen.agentchat import AssistantAgent, UserProxyAgent, GroupChat, GroupChatManager

# Doctor Agent System Prompt
DOCTOR_SYSTEM_PROMPT = """You are Dr. Sarah Mitchell, a Senior Surgeon with 20+ years of experience.

Your role in this DEBATE-STYLE medical consultation:
- Engage in SHORT, CONVERSATIONAL exchanges (2-4 sentences per turn)
- Ask ONE focused question at a time to the Resident
- Challenge specific points in the Resident's reasoning
- Build on previous responses - this is a DIALOGUE, not a monologue
- Guide through Socratic questioning, not lectures

Communication style:
- BRIEF and CONVERSATIONAL (like a real discussion)
- Ask probing questions: "What about X?", "Have you considered Y?", "Why do you think Z?"
- Respond directly to what the Resident just said
- Keep each response focused on ONE medical point
- Use natural conversation flow

Debate progression:
- Start with initial observations and ONE key question
- Each turn: respond to Resident's answer + ask next question
- Gradually narrow down the diagnosis through dialogue
- After ~10-12 exchanges, provide final diagnosis
- End with: "This is a simulated medical discussion. Please consult a real doctor for confirmation."

IMPORTANT:
- Keep responses SHORT (2-4 sentences max)
- ONE idea per turn
- Make it feel like a real conversation
- Never write long paragraphs
"""

# Resident Agent System Prompt
RESIDENT_SYSTEM_PROMPT = """You are Dr. Alex Chen, a Junior Surgical Resident in your 3rd year of training.

Your role in this DEBATE-STYLE medical consultation:
- Engage in SHORT, CONVERSATIONAL responses (2-4 sentences per turn)
- Answer the Doctor's specific question directly
- Provide ONE key insight or observation per turn
- Build on the ongoing dialogue - reference what was just discussed
- Think out loud briefly, don't write essays

Communication style:
- BRIEF and CONVERSATIONAL (like a real discussion)
- Answer the Doctor's question first, then add ONE supporting point
- Use phrases like: "I think...", "What concerns me is...", "Could it be..."
- Respond naturally to what the Doctor just asked
- Keep it focused - ONE medical point at a time

Debate approach:
- Start with initial assessment and ONE key concern
- Each turn: answer Doctor's question + mention ONE new observation
- Adjust your thinking based on Doctor's feedback
- Gradually refine diagnosis through the conversation
- Admit uncertainties naturally: "I'm not sure about...", "That's a good point..."

IMPORTANT:
- Keep responses SHORT (2-4 sentences max)
- ONE idea per turn
- Make it feel like a real conversation
- Never write long paragraphs
- React to what the Doctor just said
"""

def create_autogen_config(groq_api_key: str, model: str = "llama-3.3-70b-versatile"):
    """Create Autogen LLM configuration for Groq"""
    return {
        "config_list": [
            {
                "model": model,
                "api_key": groq_api_key,
                "api_type": "groq",
                "base_url": "https://api.groq.com",
            }
        ],
        "temperature": 0.8,
        "max_tokens": 200,  # Limit tokens to force shorter responses
    }

class MedicalDebateSystem:
    """Manages the Doctor-Resident debate system"""
    
    def __init__(self, groq_api_key: str, model: str = "llama-3.3-70b-versatile"):
        self.groq_api_key = groq_api_key
        self.model = model
        self.llm_config = create_autogen_config(groq_api_key, model)
        
    def create_agents(self):
        """Create Doctor and Resident agents"""
        
        # Doctor Agent (Senior Surgeon)
        doctor = AssistantAgent(
            name="Doctor",
            system_message=DOCTOR_SYSTEM_PROMPT,
            llm_config=self.llm_config,
            human_input_mode="NEVER",
        )
        
        # Resident Agent (Junior Surgeon)
        resident = AssistantAgent(
            name="Resident",
            system_message=RESIDENT_SYSTEM_PROMPT,
            llm_config=self.llm_config,
            human_input_mode="NEVER",
        )
        
        # Patient Agent (provides symptoms and follow-up information)
        patient_prompt = """You are a patient experiencing medical symptoms. 
        
Your role:
- Provide clear descriptions of your symptoms when asked
- Answer the doctors' questions about your condition
- Keep responses BRIEF (1-2 sentences)
- Mention new symptoms or changes if relevant
- Be honest about how you're feeling

IMPORTANT:
- Keep responses SHORT
- Only speak when asked a direct question
- Don't provide medical analysis, just describe symptoms
"""
        
        patient = AssistantAgent(
            name="Patient",
            system_message=patient_prompt,
            llm_config=self.llm_config,
            human_input_mode="NEVER",
        )
        
        return doctor, resident, patient
    
    async def run_debate(self, patient_symptoms: str, max_rounds: int = 25) -> List[Dict[str, Any]]:
        """
        Run the doctor-resident debate
        
        Args:
            patient_symptoms: Patient's symptoms and concerns
            max_rounds: Maximum number of conversation rounds (default 25 for ~12-13 messages each)
            
        Returns:
            List of messages in the debate
        """
        doctor, resident, patient = self.create_agents()
        
        # Create group chat
        groupchat = GroupChat(
            agents=[patient, doctor, resident],
            messages=[],
            max_round=max_rounds,
            speaker_selection_method="round_robin",
        )
        
        # Create group chat manager
        manager = GroupChatManager(
            groupchat=groupchat,
            llm_config=self.llm_config,
        )
        
        # Initial message from patient
        initial_message = f"""Patient presents with the following symptoms and concerns:

{patient_symptoms}

Doctor, please begin the consultation by analyzing these symptoms and engaging with the Resident to ensure a thorough diagnostic process."""
        
        # Start the conversation
        patient.initiate_chat(
            manager,
            message=initial_message,
        )
        
        # Extract messages
        debate_messages = []
        for msg in groupchat.messages:
            if msg.get("name") in ["Doctor", "Resident", "Patient"]:
                debate_messages.append({
                    "role": msg.get("name", "unknown").lower(),
                    "content": msg.get("content", ""),
                    "name": msg.get("name", "Unknown")
                })
        
        return debate_messages

def format_debate_for_patient(messages: List[Dict[str, Any]]) -> str:
    """Format the debate messages for patient viewing"""
    formatted = "=== Medical Consultation Transcript ===\n\n"
    
    for msg in messages:
        role = msg.get("name", msg.get("role", "Unknown"))
        content = msg.get("content", "")
        formatted += f"**{role}:**\n{content}\n\n---\n\n"
    
    return formatted
