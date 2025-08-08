# 🩺 Sage - Your Personal AI Health Assistant

**Sage** is an intelligent agent that analyzes medical blood reports, provides detailed health insights, and allows for conversational follow-ups. Built with a modern, decoupled architecture using FastAPI and React.



## ✨ Features

-   **Decoupled Architecture**: Scalable FastAPI backend and a responsive React frontend.
-   **AI-Powered Analysis**: Utilizes Large Language Models to provide comprehensive health insights from PDF blood reports.
-   **Personalized Risk Scoring**: Generates risk scores for cardiovascular, diabetes, and liver health.
-   **Conversational Interface**: Ask follow-up questions about your report in a natural way.
-   **Secure Authentication**: Manages user accounts and sessions securely.
-   **Session History**: Track and review all your previous report analyses.

---
## 🛠️ Tech Stack

-   **Backend**: Python with **FastAPI**
-   **Frontend**: **React** with **Next.js** and **Tailwind CSS**
-   **AI Integration**: Multi-model support via **Groq**
-   **Database**: **Supabase** (PostgreSQL)
-   **PDF Processing**: `pdfplumber`

---
## 🚀 Getting Started

### Prerequisites

-   Node.js and npm (or your preferred package manager)
-   Python 3.8+ and `pip`
-   A Supabase account
-   A Groq API key

### Installation

1.  **Clone the Repository**
    ```bash
    git clone [https://github.com/your-username/sage.git](https://github.com/your-username/sage.git)
    cd sage
    ```

2.  **Backend Setup**
    -   Create a `.env` file in the root `sage` directory and add your secret keys:
        ```
        SUPABASE_URL="your-supabase-url"
        SUPABASE_KEY="your-supabase-key"
        GROQ_API_KEY="your-groq-api-key"
        ```
    -   Install Python dependencies and run the server:
        ```bash
        pip install -r requirements.txt
        uvicorn api:app --reload
        ```
    -   The backend will be running at `http://localhost:8000`.

3.  **Frontend Setup**
    -   Navigate to the `frontend` directory, install dependencies, and run the development server:
        ```bash
        cd frontend
        npm install --legacy-peer-deps
        npm run dev
        ```
    -   The frontend will be available at `http://localhost:3000`.

---
## 📁 Project Structure


sage/
├── frontend/         # The React/Next.js frontend application
├── src/              # The Python source code for the backend
│   ├── agents/
│   ├── auth/
│   ├── config/
│   └── utils/
├── api.py            # The main FastAPI application file
├── requirements.txt  # Python dependencies
└── .env              # Secret keys (not committed)


---
## 👥 Contributing

Contributions are welcome! Please feel free to open an issue or submit a pull request.

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](./LICENSE) file for details.
