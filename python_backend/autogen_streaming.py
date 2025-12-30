"""
Real-time streaming implementation for Autogen debates
"""
import asyncio
import re
from typing import AsyncGenerator, Dict, Any, List
from autogen_agents import MedicalDebateSystem

def split_message_into_bubbles(content: str) -> List[str]:
    """
    Split a message into chat bubbles - for short conversational responses, 
    split by sentences to create natural dialogue flow.
    
    Args:
        content: The full message content
        
    Returns:
        List of message chunks for separate bubbles
    """
    # For short responses (conversational style), split by sentences
    if len(content) < 300:
        # Split by sentence-ending punctuation
        sentences = re.split(r'(?<=[.!?])\s+', content.strip())
        # Each sentence becomes its own bubble for conversational feel
        return [s.strip() for s in sentences if s.strip()]
    
    # For longer responses, use paragraph-based splitting
    paragraphs = [p.strip() for p in content.split('\n\n') if p.strip()]
    
    bubbles = []
    for paragraph in paragraphs:
        if len(paragraph) < 150:
            bubbles.append(paragraph)
        else:
            # Split by sentences
            sentences = re.split(r'(?<=[.!?])\s+', paragraph)
            for sentence in sentences:
                if sentence.strip():
                    bubbles.append(sentence.strip())
    
    return bubbles if bubbles else [content]

class StreamingDebateSystem(MedicalDebateSystem):
    """Extended debate system with real-time streaming support"""
    
    async def run_debate_streaming(
        self, 
        patient_symptoms: str, 
        max_rounds: int = 25
    ) -> AsyncGenerator[Dict[str, Any], None]:
        """
        Run debate and stream messages as they're generated
        
        Args:
            patient_symptoms: Patient's symptoms and concerns
            max_rounds: Maximum number of conversation rounds
            
        Yields:
            Individual debate messages as they're generated
        """
        doctor, resident, user_proxy = self.create_agents()
        
        # Create group chat with custom message tracking
        from autogen import GroupChat, GroupChatManager
        
        groupchat = GroupChat(
            agents=[user_proxy, doctor, resident],
            messages=[],
            max_round=max_rounds,
            speaker_selection_method="round_robin",
        )
        
        # Track message count to detect new messages
        last_message_count = 0
        
        # Create manager
        manager = GroupChatManager(
            groupchat=groupchat,
            llm_config=self.llm_config,
        )
        
        # Initial message
        initial_message = f"""Patient presents with the following symptoms and concerns:

{patient_symptoms}

Doctor, please begin the consultation by analyzing these symptoms and engaging with the Resident to ensure a thorough diagnostic process."""
        
        # Start conversation in background task
        async def run_chat():
            await asyncio.to_thread(
                user_proxy.initiate_chat,
                manager,
                message=initial_message,
            )
        
        # Start the chat task
        chat_task = asyncio.create_task(run_chat())
        
        # Stream messages as they appear
        try:
            while not chat_task.done():
                await asyncio.sleep(0.3)  # Check for new messages frequently
                
                # Check for new messages
                current_count = len(groupchat.messages)
                if current_count > last_message_count:
                    # New messages available
                    for i in range(last_message_count, current_count):
                        msg = groupchat.messages[i]
                        if msg.get("name") in ["Doctor", "Resident", "Patient"]:
                            # Stream complete message as single bubble
                            content = msg.get("content", "")
                            yield {
                                "role": msg.get("name", "unknown").lower(),
                                "content": content,
                                "name": msg.get("name", "Unknown")
                            }
                    last_message_count = current_count
            
            # Wait for chat to complete
            await chat_task
            
            # Stream any remaining messages
            current_count = len(groupchat.messages)
            if current_count > last_message_count:
                for i in range(last_message_count, current_count):
                    msg = groupchat.messages[i]
                    if msg.get("name") in ["Doctor", "Resident", "Patient"]:
                        # Stream complete message as single bubble
                        content = msg.get("content", "")
                        yield {
                            "role": msg.get("name", "unknown").lower(),
                            "content": content,
                            "name": msg.get("name", "Unknown")
                        }
        
        except Exception as e:
            print(f"Streaming error: {e}")
            raise
