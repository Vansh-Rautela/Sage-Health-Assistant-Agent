import streamlit as st
from datetime import datetime, timedelta

class SessionManager:
    @staticmethod
    def init_session():
        """Initialize or validate session."""
        if 'auth_service' not in st.session_state:
            from auth.auth_service import AuthService
            st.session_state.auth_service = AuthService()
        
        # Try to restore session from token
        if 'user' not in st.session_state:
            user_data = st.session_state.auth_service.validate_session_token()
            if user_data:
                st.session_state.user = user_data
    
    @staticmethod
    def is_authenticated():
        """Check if user is authenticated."""
        return bool(st.session_state.get('user'))
    
    @staticmethod
    def create_chat_session():
        """Create a new chat session."""
        if not SessionManager.is_authenticated():
            return False, "Not authenticated"
        return st.session_state.auth_service.create_session(
            st.session_state.user['id']
        )
    
    @staticmethod
    def get_user_sessions():
        """Get user's chat sessions."""
        if not SessionManager.is_authenticated():
            return False, []
        return st.session_state.auth_service.get_user_sessions(
            st.session_state.user['id']
        )
    
    @staticmethod
    def delete_session(session_id):
        """Delete a chat session."""
        if not SessionManager.is_authenticated():
            return False, "Not authenticated"
        return st.session_state.auth_service.delete_session(session_id)
    
    @staticmethod
    def logout():
        """Logout user and clear session."""
        if 'auth_service' in st.session_state:
            st.session_state.auth_service.sign_out()
    
    @staticmethod
    def login(email, password):
        """Handle user login."""
        if 'auth_service' not in st.session_state:
            from auth.auth_service import AuthService
            st.session_state.auth_service = AuthService()
            
        return st.session_state.auth_service.sign_in(email, password)
