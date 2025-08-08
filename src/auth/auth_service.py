import os
import re
from datetime import datetime
from supabase import create_client, Client
import logging

# Configure basic logging to help with future debugging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

class AuthService:
    def __init__(self):
        """
        Initializes the AuthService, connecting to Supabase using credentials
        from environment variables loaded from the .env file.
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

    def sign_up(self, email, password, name):
        """
        Signs up a new user. The user profile is created automatically in the
        public.users table by a database trigger.
        """
        try:
            res = self.supabase.auth.sign_up({
                "email": email,
                "password": password,
                "options": {"data": {"name": name}}
            })
            if not res.user:
                return False, "Failed to create user in auth schema"

            # The database trigger handles creating the public user profile.
            # We just return the user info upon successful auth creation.
            return True, {"id": res.user.id, "email": res.user.email, "name": name}
        except Exception as e:
            error_msg = str(e).lower()
            if "duplicate key value" in error_msg or "already registered" in error_msg:
                return False, "Email already registered"
            return False, f"Sign up failed: {str(e)}"

    def sign_in(self, email, password):
        """Signs in a user and returns their data along with a session token."""
        try:
            res = self.supabase.auth.sign_in_with_password({"email": email, "password": password})
            if not res.user or not res.session:
                return False, "Invalid login credentials"

            user_data = self.get_user_data(res.user.id)
            if not user_data:
                # This handles the rare case where the db trigger is slow.
                import time
                time.sleep(1)
                user_data = self.get_user_data(res.user.id)

            if not user_data:
                return False, "User data not found. Please ensure your account is confirmed."

            # Attach the token for the frontend to store
            user_data["token"] = res.session.access_token
            return True, user_data
        except Exception:
            return False, "Invalid login credentials"

    def get_user_data(self, user_id):
        """Retrieves user profile data from the public 'users' table."""
        try:
            response = self.supabase.table('users').select('*').eq('id', user_id).single().execute()
            return response.data if response.data else None
        except Exception as e:
            logging.error(f"Error fetching user data for {user_id}: {e}")
            return None

    def create_session(self, user_id, title=None):
        """Creates a new chat session for a given user."""
        try:
            current_time = datetime.now()
            default_title = f"{current_time.strftime('%d-%m-%Y')} | {current_time.strftime('%H:%M:%S')}"
            session_data = {
                'user_id': user_id,
                'title': title or default_title,
                'created_at': current_time.isoformat()
            }
            result = self.supabase.table('chat_sessions').insert(session_data).execute()
            return True, result.data[0] if result.data else None
        except Exception as e:
            logging.error(f"Error creating session for user {user_id}: {e}")
            return False, str(e)

    def get_user_sessions(self, user_id):
        """Retrieves all chat sessions for a given user."""
        try:
            result = self.supabase.table('chat_sessions').select('*').eq('user_id', user_id).order('created_at', desc=True).execute()
            return True, result.data
        except Exception as e:
            logging.error(f"Error fetching sessions for user {user_id}: {e}")
            return False, []

    def save_chat_message(self, session_id, content, role='user'):
        """Saves a chat message to a specific session."""
        try:
            message_data = {
                'session_id': session_id,
                'content': content,
                'role': role,
                'created_at': datetime.now().isoformat()
            }
            result = self.supabase.table('chat_messages').insert(message_data).execute()
            return True, result.data[0] if result.data else None
        except Exception as e:
            logging.error(f"Error saving chat message for session {session_id}: {e}")
            return False, str(e)

    def get_session_messages(self, session_id):
        """Retrieves all messages for a specific session."""
        try:
            result = self.supabase.table('chat_messages').select('*').eq('session_id', session_id).order('created_at').execute()
            return True, result.data
        except Exception as e:
            logging.error(f"Error fetching messages for session {session_id}: {e}")
            return False, []

    def delete_session(self, session_id):
        """Deletes a session and all associated messages."""
        try:
            self.supabase.table('chat_messages').delete().eq('session_id', session_id).execute()
            self.supabase.table('chat_sessions').delete().eq('id', session_id).execute()
            return True, None
        except Exception as e:
            logging.error(f"Error deleting session {session_id}: {e}")
            return False, str(e)