from datetime import datetime, timedelta
# NOTE: We no longer import or use Streamlit here
from .model_manager import ModelManager

class AnalysisAgent:
    def __init__(self):
        self.model_manager = ModelManager()
        # State is no longer managed here; it will be handled by the API layer
        self.analysis_count = 0
        self.last_analysis = datetime.now()
        self.analysis_limit = 15

    def check_rate_limit(self):
        # This logic remains the same but operates on instance variables
        time_until_reset = timedelta(days=1) - (datetime.now() - self.last_analysis)
        if time_until_reset.days < 0:
            self.analysis_count = 0
            self.last_analysis = datetime.now()
        
        if self.analysis_count >= self.analysis_limit:
            hours, remainder = divmod(time_until_reset.seconds, 3600)
            minutes, _ = divmod(remainder, 60)
            return False, f"Daily limit reached. Reset in {hours}h {minutes}m"
        return True, None

    def analyze_report(self, data, system_prompt, chat_history=None):
        can_analyze, error_msg = self.check_rate_limit()
        if not can_analyze:
            return {"success": False, "error": error_msg}

        processed_data = self._preprocess_data(data)
        
        # In a real scenario, knowledge base would be persisted in a DB
        # For now, it's ephemeral
        knowledge_base = {} 
        enhanced_prompt = self._build_enhanced_prompt(system_prompt, processed_data, chat_history, knowledge_base)
        
        result = self.model_manager.generate_analysis(processed_data, enhanced_prompt)
        
        if result["success"]:
            self.analysis_count += 1
            self.last_analysis = datetime.now()
        
        return result
    
    def _preprocess_data(self, data):
        if isinstance(data, dict):
            return {
                "patient_name": data.get("patient_name", ""),
                "age": data.get("age", ""),
                "gender": data.get("gender", ""),
                "report": data.get("report", ""),
                "question": data.get("question") # Pass question if it exists
            }
        return data

    def _build_enhanced_prompt(self, system_prompt, data, chat_history, knowledge_base):
      # This function can remain largely the same, but it must not use st.session_state
      # For simplicity, we'll just use the system prompt and history for now
      if chat_history:
          session_context = self._get_session_context(chat_history)
          if session_context:
              return f"{system_prompt}\n\n## Current Session History\n{session_context}"
      return system_prompt

    def _get_session_context(self, chat_history):
        if not chat_history or len(chat_history) < 2:
            return ""
        context_items = []
        for msg in chat_history[-4:]: # Get last 4 messages for context
            context_items.append(f"{msg['role']}: {msg['content']}")
        return "\n".join(context_items)