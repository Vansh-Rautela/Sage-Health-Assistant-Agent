import streamlit as st
from config.app_config import PRIMARY_COLOR, SECONDARY_COLOR

def show_footer(in_sidebar=False):
    base_styles = f"""
        text-align: center;
        padding: 0.5rem;
        background: linear-gradient(to right, rgba(25, 118, 210, 0.02), rgba(100, 181, 246, 0.05), rgba(25, 118, 210, 0.02));
        border-top: 1px solid rgba(100, 181, 246, 0.1);
        margin-top: {'0' if in_sidebar else '2rem'};
        {'width: 100%' if not in_sidebar else ''};
    """
    
    st.markdown(
        f"""
        <div style='{base_styles}'>
            <p style='
                font-family: "Source Sans Pro", sans-serif;
                color: #64B5F6;
                font-size: 0.75rem;
                letter-spacing: 0.02em;
                margin: 0;
                opacity: 0.9;
            '>
                Created by 
                <a href='https://harshgajjar.vercel.app' 
                   target='_blank' 
                   style='
                       color: #1976D2;
                       text-decoration: none;
                       font-weight: 500;
                       transition: all 0.2s ease;
                   '
                   onmouseover="this.style.color='{PRIMARY_COLOR}'; this.style.textDecoration='underline'"
                   onmouseout="this.style.color='#1976D2'; this.style.textDecoration='none'">
                    Harsh Gajjar
                </a>
            </p>
        </div>
        """,
        unsafe_allow_html=True
    )
