![tag:innovationlab](https://img.shields.io/badge/innovationlab-3D8BD3)
![tag:healthcare](https://img.shields.io/badge/healthcare-FF6B35)
![tag:referral-assistant](https://img.shields.io/badge/referral_assistant-4CAF50)
![tag:ai-powered](https://img.shields.io/badge/ai_powered-9C27B0)
![tag:multilingual](https://img.shields.io/badge/multilingual-E31837)

# 🏥 VitaSync

Your intelligent medical referral assistant.

A patient enters their referral details → the AI analyzes urgency and detects the specialty → an appointment is scheduled → a personalized task list is generated to prepare → on appointment day the patient checks in and tracks wait time → after the visit, doctor's notes are simplified and translated into the patient's language.

---

## 🚀 Deliverables

- 💬 **ASI:One Chat Session**: https://asi1.ai/shared-chat/ed3c4af6-62ff-4df0-aaaa-5b9b3bf8105f
- 🌐 **Agentverse Profile**: https://agentverse.ai/agents/details/agent1qd7qdmnlslnr0dzk53pshcvcttqmxacul34ett45pg4n0yd9whsxjl8zv9j/profile

---

## 🧠 System Architecture

VitaSync is powered by a **single multi-capability AI agent** built using the Fetch.ai uAgents framework.

### 🔧 Core Components

- **Frontend / Input Layer**
  - Form-based referral input
  - Appointment notes input (bullet points)

- **Backend API (FastAPI)**
  - Handles structured requests
  - Routes to agent endpoints
  - Normalizes inputs and outputs

- **AI Agent (Fetch.ai uAgents)**
  - Central intelligence layer
  - Handles:
    - Referral analysis
    - Task generation
    - Patient explanation
    - Appointment summarization

- **AI Model (ASI-1)**
  - Used for:
    - Natural language understanding
    - Medical reasoning
    - Translation
    - Structured JSON outputs

---

### 🔄 End-to-End Flow
User Input (Referral / Appointment Notes)
↓
FastAPI Backend
↓
Fetch.ai Agent (uAgents)
↓
ASI-1 Model
↓
Structured JSON Output
↓
Frontend / Agentverse Chat


---

## ⚙️ Tech Stack

- **Backend:** FastAPI (Python)
- **Agent Framework:** Fetch.ai uAgents
- **AI Model:** ASI-1 (via API)
- **Protocols:** AgentChatProtocol
- **Networking:** ngrok (public agent endpoint)
- **Communication:** REST + Agent messaging

---

## 🧩 Key Features

### 🧠 AI Referral Analysis
- Analyzes patient referral text  
- Detects medical specialty automatically  
- Assigns urgency level (low / medium / high)  
- Identifies missing documents and next steps  

### 📅 Smart Appointment Scheduling
- Patient selects location, date and time slot  
- Appointment confirmation with full details shown on task list screen  

### 📋 Personalized Task List
- Generates structured preparation tasks  
- Color-coded status: Missing (dark blue) / Pending (purple) / Complete (purple)  
- Patient notes section for new symptoms or questions  

### 🌍 Multilingual Support
- Converts medical jargon into plain language  
- Supports English, Spanish, and Vietnamese  
- Translations powered by ASI-1  

### ⏱️ Appointment Day Check-in
- Real-time wait time progress bar  
- Patient can update notes before seeing the doctor  

### 🗒️ Doctor Notes → AI Summary
- Doctor's clinical notes displayed as-is  
- AI generates patient-friendly translated summary  
- Medication details extracted and displayed clearly  

### 💊 Medication Intelligence
- Medication name and explanation  
- Dosage, frequency, and duration  
- Simple patient reminders  
---

## 🤖 Agent Design

### Single-Agent, Multi-Responsibility System

Instead of multiple agents, VitaSync uses **one unified agent** that handles:

- Referral understanding  
- Missing information detection  
- Task orchestration  
- Patient communication  
- Appointment summarization  

This simplifies coordination while still leveraging agent-based architecture.

---

## 💬 Chat Protocol (Fetch.ai Integration)

We implemented the **AgentChatProtocol** using:

```python
protocol = Protocol(spec=chat_protocol_spec)

@protocol.on_message(ChatMessage)
async def handle_chat(...)