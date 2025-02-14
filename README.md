# HIA - Health Insights Agent

AI Agent to analyze blood reports and provide detailed health insights.

## 🎥 Demo Video

<img src="public/HIA_demo.gif" alt="demo video" autoplay loop muted playsinline>
</img>

## 🌟 Features

- 🔒 Secure user authentication and session management
- 📊 Blood report analysis using AI
- 📁 PDF report upload and text extraction
- 💾 Session-based analysis history
- 🎯 Rate limiting and usage tracking
- 🎨 Modern, responsive UI

## 🛠️ Tech Stack

- **Frontend Framework**: Streamlit
- **AI Integration**: Groq (LLaMA-3.3-70B)
- **Database**: Supabase
- **PDF Processing**: PDFPlumber
- **Authentication**: Supabase Auth

## 📋 Requirements

- Python 3.8+
- Streamlit 1.30.0+
- Supabase account
- Groq API key
- PDFPlumber
- Python-magic-bin (Windows) or Python-magic (Linux/Mac)

## ⚙️ Configuration

Required environment variables (in `.streamlit/secrets.toml`):

```toml
SUPABASE_URL = "your-supabase-url"
SUPABASE_KEY = "your-supabase-key"
GROQ_API_KEY = "your-groq-api-key"

# Additional configurations
[server]
maxUploadSize = 20  # Maximum file upload size in MB
```

## 🚀 Installation

1. Clone the repository:

```bash
git clone https://github.com/harshhh28/hia.git
cd hia
```

2. Install dependencies:

```bash
pip install -r requirements.txt
```

3. Run the application:

```bash
streamlit run src/main.py
```

## 📁 Project Structure

```
hia/
├── requirements.txt
├── README.md
├── src/
│   ├── main.py                 # Application entry point
│   ├── auth/                   # Authentication related modules
│   │   ├── auth_service.py     # Supabase auth integration
│   │   └── session_manager.py  # Session management
│   ├── components/             # UI Components
│   │   ├── analysis_form.py    # Report analysis form
│   │   ├── auth_pages.py       # Login/Signup pages
│   │   ├── footer.py          # Footer component
│   │   └── sidebar.py         # Sidebar navigation
│   ├── config/                # Configuration files
│   │   ├── app_config.py      # App settings
│   │   └── prompts.py         # AI prompts
│   ├── services/              # Service integrations
│   │   └── ai_service.py      # AI service integration
│   └── utils/                 # Utility functions
│       ├── validators.py      # Input validation
│       └── pdf_extractor.py   # PDF processing
```

## 🔐 Authentication

- Email/password-based authentication
- Session timeout after 30 minutes of inactivity
- Secure password requirements:
  - Minimum 8 characters
  - At least one uppercase letter
  - At least one lowercase letter
  - At least one number

## 📊 Analysis Features

- PDF blood report upload (up to 20MB)
- Smart text extraction and validation
- Automatic medical report detection
- AI-powered comprehensive analysis
- Daily analysis limit (15 per day)
- Sample report option for testing
- Detailed error handling for invalid files

## 💾 Data Management

- Secure storage using Supabase
- Session-based analysis history
- PDF size limit: 20MB
- Maximum 50 pages per PDF

## 🎯 Rate Limiting

- 15 analyses per day per user
- Counter resets daily
- Session timeout after 30 minutes

## 🔄 Session Management

- Persistent user sessions
- Automatic timeout
- Multiple analysis sessions
- Session history tracking

## 📱 UI Features

- Responsive design
- Dark/Light mode support
- Interactive sidebar navigation
- Progress indicators
- Error handling
- Success notifications

## 🔐 Security Features

- Secure file type validation
- PDF content validation
- Rate limiting implementation
- Session-based authentication
- Automatic session timeout
- Secure password requirements
- Input sanitization
- Error handling

## 👥 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙋‍♂️ Author

Created by [Harsh Gajjar](https://harshgajjar.vercel.app)
