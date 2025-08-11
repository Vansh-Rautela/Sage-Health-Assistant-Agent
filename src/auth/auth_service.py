import os
import re
import time 
from datetime import datetime
from supabase import create_client, Client
import logging

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

class AuthService:
    def __init__(self):
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
        Signs up a new user in the auth schema and then explicitly creates their
        profile in the public.users table.
        """
        try:
            # Step 1: Create the user in the authentication system
            auth_response = self.supabase.auth.sign_up({
                "email": email,
                "password": password,
                "options": {"data": {"name": name}}
            })

            if not auth_response.user:
                error_detail = "Failed to create user in auth schema. The user may already exist or the password may be too weak."
                return False, error_detail

            new_user = auth_response.user

            # --- THIS IS THE NEW, DEFINITIVE FIX ---
            # Step 2: Explicitly insert the user profile into the public.users table.
            # This replaces the unreliable database trigger.
            profile_data = {
                'id': new_user.id,
                'email': new_user.email,
                'name': name
            }
            
            insert_response = self.supabase.table('users').insert(profile_data).execute()

            if not insert_response.data:
                logging.error(f"Failed to create user profile for {new_user.id} after signup.")
                return False, "Could not create user profile. Please try again."
            # --- END OF FIX ---

            logging.info(f"Successfully created user and profile for {new_user.email}")
            return True, {"id": new_user.id, "email": new_user.email, "name": name}

        except Exception as e:
            error_msg = str(e)
            logging.error(f"An exception occurred during signup: {error_msg}")
            if "duplicate key value" in error_msg.lower() or "already registered" in error_msg.lower():
                return False, "Email already registered"
            return False, f"Sign up failed: {error_msg}"


    def sign_in(self, email, password):
        """Signs in a user and returns their data along with a session token."""
        try:
            res = self.supabase.auth.sign_in_with_password({"email": email, "password": password})
            if not res.user or not res.session:
                return False, "Invalid login credentials"

            # The retry logic is no longer needed here because the signup function
            # now guarantees the profile exists before it returns success.
            user_data = self.get_user_data(res.user.id)

            if not user_data:
                return False, "User data not found. Please try signing up again."

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
            
    # --- No changes to the functions below this line ---

    def create_session(self, user_id, title=None):
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
        try:
            result = self.supabase.table('chat_sessions').select('*').eq('user_id', user_id).order('created_at', desc=True).execute()
            return True, result.data
        except Exception as e:
            logging.error(f"Error fetching sessions for user {user_id}: {e}")
            return False, []

    def save_chat_message(self, session_id, content, role='user'):
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
        try:
            result = self.supabase.table('chat_messages').select('*').eq('session_id', session_id).order('created_at').execute()
            return True, result.data
        except Exception as e:
            logging.error(f"Error fetching messages for session {session_id}: {e}")
            return False, []

    def delete_session(self, session_id):
        try:
            self.supabase.table('chat_messages').delete().eq('session_id', session_id).execute()
            self.supabase.table('chat_sessions').delete().eq('id', session_id).execute()
            return True, None
        except Exception as e:
            logging.error(f"Error deleting session {session_id}: {e}")
            return False, str(e)