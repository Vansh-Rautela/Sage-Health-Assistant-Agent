import streamlit as st
from auth.session_manager import SessionManager
from components.auth_pages import show_login_page
from components.sidebar import show_sidebar
from components.analysis_form import show_analysis_form
from components.footer import show_footer
from config.app_config import APP_NAME, APP_TAGLINE, APP_DESCRIPTION, APP_ICON
from services.ai_service import generate_analysis
from config.prompts import SPECIALIST_PROMPTS

# Must be the first Streamlit command
st.set_page_config(
    page_title="HIA - Health Insights Agent",
    page_icon="🩺",
    layout="wide"
)

# Initialize session state
SessionManager.init_session()

# Hide all Streamlit form-related elements
st.markdown("""
    <style>
        /* Hide form submission helper text */
        div[data-testid="InputInstructions"] > span:nth-child(1) {
            visibility: hidden;
        }
    </style>
""", unsafe_allow_html=True)

def show_welcome_screen():
    st.markdown(
        f"""
        <div style='text-align: center; padding: 50px;'>
            <h1>{APP_ICON} {APP_NAME}</h1>
            <h3>{APP_DESCRIPTION}</h3>
            <p style='font-size: 1.2em; color: #666;'>{APP_TAGLINE}</p>
            <p>Start by creating a new analysis session</p>
        </div>
        """,
        unsafe_allow_html=True
    )
    
    col1, col2, col3 = st.columns([2, 3, 2])
    with col2:
        if st.button("➕ Create New Analysis Session", use_container_width=True, type="primary"):
            success, session = SessionManager.create_chat_session()
            if success:
                st.session_state.current_session = session
                st.rerun()
            else:
                st.error("Failed to create session")


def show_chat_history():
    # This function now returns the messages for use in the main loop
    if 'current_session' in st.session_state and st.session_state.current_session:
        success, messages = st.session_state.auth_service.get_session_messages(
            st.session_state.current_session['id']
        )
        if success:
            for msg in messages:
                with st.chat_message(msg['role']):
                    st.markdown(msg['content'])
            return messages
    return []

def show_user_greeting():
    if st.session_state.user:
        # Get name from user data, fallback to email if name is empty
        display_name = st.session_state.user.get('name') or st.session_state.user.get('email', '')
        st.markdown(f"""
            <div style='text-align: right; padding: 1rem; color: #64B5F6; font-size: 1.1em;'>
                👋 Hi, {display_name}
            </div>
        """, unsafe_allow_html=True)

def main():
    SessionManager.init_session()

    if not SessionManager.is_authenticated():
        show_login_page()
        show_footer()
        return

    show_user_greeting()
    show_sidebar()

    if st.session_state.get('current_session'):
        st.title(f"📊 {st.session_state.current_session['title']}")
        
        messages = show_chat_history()
        
        if not messages:
            show_analysis_form()
        
        if prompt := st.chat_input("Ask a follow-up question about your report..."):
            st.session_state.auth_service.save_chat_message(
                st.session_state.current_session['id'],
                prompt,
                role='user'
            )
            with st.chat_message("user"):
                st.markdown(prompt)

            with st.chat_message("assistant"):
                with st.spinner("Thinking..."):
                    # --- THIS IS THE FIX ---
                    # For follow-ups, we now send only the user's prompt.
                    # The `analysis_agent` will be responsible for retrieving the full context.
                    response = generate_analysis(
                        data=prompt,
                        system_prompt=SPECIALIST_PROMPTS["comprehensive_analyst"],
                        session_id=st.session_state.current_session['id']
                    )
                    # --- END OF FIX ---

                    if response["success"]:
                        st.markdown(response["content"])
                        st.session_state.auth_service.save_chat_message(
                            st.session_state.current_session['id'],
                            response["content"],
                            role='assistant'
                        )
                    else:
                        st.error(response["error"])
    else:
        show_welcome_screen()

if __name__ == "__main__":
    main()