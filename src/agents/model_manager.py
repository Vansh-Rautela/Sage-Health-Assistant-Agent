import groq
import os
from enum import Enum
import logging
import time

logger = logging.getLogger(__name__)

class ModelTier(Enum):
    PRIMARY = "primary"
    SECONDARY = "secondary" 
    TERTIARY = "tertiary"
    FALLBACK = "fallback"

class ModelManager:
    """
    Manages AI model selection, fallback, and rate limits.
    Implements an agent-based approach for model management.
    """
    
    # --- THIS IS THE FIX: Optimized Model Cascade ---
    MODEL_CONFIG = {
        ModelTier.PRIMARY: {
            "provider": "groq",
            "model": "llama3-8b-8192",      # For speed and general chat
            "max_tokens": 8000,
            "temperature": 0.7
        },
        ModelTier.SECONDARY: {
            "provider": "groq", 
            "model": "llama3-70b-8192",     # For power and deep analysis
            "max_tokens": 8000,
            "temperature": 0.7
        },
        ModelTier.TERTIARY: {
            "provider": "groq",
            "model": "mixtral-8x7b-32768",  # For long context
            "max_tokens": 32000, 
            "temperature": 0.7
        },
        ModelTier.FALLBACK: {
            "provider": "groq",
            "model": "gemma-7b-it",         # For reliability
            "max_tokens": 8000,
            "temperature": 0.7
        }
    }
    # --- END OF FIX ---
    
    def __init__(self):
        self.clients = {}
        self._initialize_clients()

    def _initialize_clients(self):
        """Initialize API clients for each provider."""
        try:
            api_key = os.environ.get("GROQ_API_KEY")
            if not api_key:
                raise ValueError("GROQ_API_KEY not found in .env file")
            self.clients["groq"] = groq.Groq(api_key=api_key)
        except Exception as e:
            logger.error(f"Failed to initialize Groq client: {str(e)}")

    def generate_analysis(self, data, system_prompt, retry_count=0):
        """
        Generate analysis using the best available model with automatic fallback.
        """
        if retry_count > len(ModelTier):
            return {"success": False, "error": "All models failed after multiple retries"}

        # Determine which model tier to use based on retry count
        tiers = [ModelTier.PRIMARY, ModelTier.SECONDARY, ModelTier.TERTIARY, ModelTier.FALLBACK]
        tier = tiers[retry_count]
            
        model_config = self.MODEL_CONFIG[tier]
        provider = model_config["provider"]
        model = model_config["model"]
        
        if provider not in self.clients:
            logger.error(f"No client available for provider: {provider}")
            return self.generate_analysis(data, system_prompt, retry_count + 1)
            
        try:
            client = self.clients[provider]
            logger.info(f"Attempting generation with {provider} model: {model}")
            
            completion = client.chat.completions.create(
                model=model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": str(data)}
                ],
                temperature=model_config["temperature"],
                max_tokens=model_config["max_tokens"]
            )
            
            return {
                "success": True,
                "content": completion.choices[0].message.content,
                "model_used": f"{provider}/{model}"
            }
                
        except Exception as e:
            error_message = str(e).lower()
            logger.warning(f"Model {model} failed: {error_message}")
            
            if "rate limit" in error_message or "quota" in error_message:
                time.sleep(2)
            
            return self.generate_analysis(data, system_prompt, retry_count + 1)
            
        return {"success": False, "error": "Analysis failed with all available models"}