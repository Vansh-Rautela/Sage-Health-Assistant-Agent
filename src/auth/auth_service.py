import os
import re
from datetime import datetime
from supabase import create_client, Client
import logging

# Configure basic logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

class AuthService:
    def __init__(self):
        """
        Initializes the AuthService, connecting to Supabase using credentials
        from environment variables.
        """
        try:
            url = os.environ.get("SUPABASE_URL")
            key = os.environ.get("SUPABASE_KEY")
            if not url or not key:
                raise ValueError("Supabase URL and Key must be set in the .env file")
            self.supabase: Client = create_client(url, key)
            logging.info("AuthService initialized and Supabase client created successfully.")
        except Exception as e:
            logging.error(f"FATAL: Failed to initialize Supabase client: {e}")
            raise

    # --- (sign_up and sign_in methods remain the same) ---
    def sign_up(self, email, password, name):
        try:
            res = self.supabase.auth.sign_up({
                "email": email, "password": password, "options": {"data": {"name": name}}
            })
            if not res.user: return False, "Failed to create user account"
            user_data = {'id': res.user.id, 'email': email, 'name': name}
            self.supabase.table('users').insert(user_data).execute()
            return True, user_data
        except Exception as e:
            error_msg = str(e).lower()
            if "duplicate" in error_msg or "already registered" in error_msg: return False, "Email already registered"
            return False, f"Sign up failed: {str(e)}"

    def sign_in(self, email, password):
        try:
            res = self.supabase.auth.sign_in_with_password({"email": email, "password": password})
            if not res.user: return False, "Invalid login credentials"
            user_data = self.get_user_data(res.user.id)
            if not user_data: return False, "User data not found"
            user_data["token"] = res.session.access_token
            return True, user_data
        except Exception as e:
            return False, "Invalid login credentials"

    def get_user_data(self, user_id):
        try:
            response = self.supabase.table('users').select('*').eq('id', user_id).single().execute()
            return response.data if response.data else None
        except Exception as e:
            logging.error(f"Error fetching user data for {user_id}: {e}")
            return None

    def create_session(self, user_id, title=None):
        try:
            current_time = datetime.now()
            default_title = f"{current_time.strftime('%d-%m-%Y')} | {current_time.strftime('%H:%M:%S')}"
            session_data = {'user_id': user_id, 'title': title or default_title, 'created_at': current_time.isoformat()}
            result = self.supabase.table('chat_sessions').insert(session_data).execute()
            return True, result.data[0] if result.data else None
        except Exception as e:
            logging.error(f"Error creating session for user {user_id}: {e}")
            return False, str(e)

    # --- THIS IS THE KEY FUNCTION TO DEBUG ---
    def get_user_sessions(self, user_id):
        """Retrieves all chat sessions for a given user with detailed logging."""
        logging.info(f"Attempting to fetch sessions for user_id: {user_id}")
        try:
            result = self.supabase.table('chat_sessions').select('*').eq('user_id', user_id).order('created_at', desc=True).execute()
            logging.info(f"Supabase response for get_user_sessions: {result.data}")
            return True, result.data
        except Exception as e:
            # This will print the exact Supabase error to your terminal
            logging.error(f"CRITICAL: Supabase query failed in get_user_sessions for user {user_id}: {e}")
            return False, []
    # --- END OF DEBUGGING BLOCK ---

    # (The rest of the methods remain the same, but you could add similar logging)
    def save_chat_message(self, session_id, content, role='user'):
        try:
            message_data = {'session_id': session_id, 'content': content, 'role': role, 'created_at': datetime.now().isoformat()}
            result = self.supabase.table('chat_messages').insert(message_data).execute()
            return True, result.data[0] if result.data else None
        except Exception as e:
            logging.error(f"Error saving chat message for session {session_id}: {e}")
            return False, str(e)

    def get_session_messages(self, session_id):
        try:
            result = self.supabase.table('chat_messages').select('*').eq('session_id', session_id).order('created_at').execute()
            return True, result.data
        except Exception as e:
            return False, []

    def delete_session(self, session_id):
        try:
            self.supabase.table('chat_messages').delete().eq('session_id', session_id).execute()
            self.supabase.table('chat_sessions').delete().eq('id', session_id).execute()
            return True, None
        except Exception as e:
            return False, str(e)