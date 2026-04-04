import os
import json
from datetime import datetime
from uuid import uuid4
from typing import Any, Dict, List, Optional

from dotenv import load_dotenv
from openai import OpenAI
from uagents import Agent, Context, Model, Protocol
from uagents_core.contrib.protocols.chat import (
    ChatAcknowledgement,
    ChatMessage,
    EndSessionContent,
    TextContent,
    chat_protocol_spec,
)

load_dotenv()

ASI_API_KEY = os.getenv("ASI_API_KEY", "")
AGENT_SEED = os.getenv("AGENT_SEED", "")
AGENT_NAME = os.getenv("AGENT_NAME", "nurse-referral-agent")
AGENT_PORT = int(os.getenv("AGENT_PORT", "8001"))

if not ASI_API_KEY:
    raise ValueError("Missing ASI_API_KEY in .env")

if not AGENT_SEED:
    raise ValueError("Missing AGENT_SEED in .env")

client = OpenAI(
    base_url="https://api.asi1.ai/v1",
    api_key=ASI_API_KEY,
)

agent = Agent(
    name=AGENT_NAME,
    seed=AGENT_SEED,
    port=AGENT_PORT,
    endpoint=[f"http://127.0.0.1:{AGENT_PORT}/submit"],
    mailbox=True,
    publish_agent_details=True,
    network="testnet",
)

protocol = Protocol(spec=chat_protocol_spec)


# ----------------------------
# Models
# ----------------------------

class ReferralRequest(Model):
    patient_name: str
    age: Optional[int] = None
    language_preference: str = "en"
    location: Optional[str] = None
    insurance: Optional[str] = None
    referral_text: str


class TaskItem(Model):
    task: str
    responsible: str
    status: str


class ReferralAnalysisResponse(Model):
    patient_name: str
    referral_summary: str
    detected_specialty: str
    specialty_simple_name: str
    urgency_level: str
    extracted_info: Dict[str, Any]
    missing_info: List[str]
    tasks: List[TaskItem]
    patient_friendly_explanation: str
    translated_explanation: str
    language_used: str
    status: str


class HealthResponse(Model):
    status: str
    agent_name: str


# ----------------------------
# Helpers
# ----------------------------

SUPPORTED_LANGUAGES = {"en", "vi", "es"}


def normalize_language(language: Optional[str]) -> str:
    """
    Normalize language preference to a supported code.
    Defaults to English if unsupported or missing.
    """
    if not language:
        return "en"

    lang = language.strip().lower()

    aliases = {
        "english": "en",
        "en-us": "en",
        "en-gb": "en",
        "vietnamese": "vi",
        "vn": "vi",
        "vi-vn": "vi",
        "spanish": "es",
        "es-es": "es",
        "es-mx": "es",
    }

    lang = aliases.get(lang, lang)

    if lang not in SUPPORTED_LANGUAGES:
        return "en"

    return lang


def normalize_specialty_simple_name(specialty: str) -> str:
    specialty_lower = (specialty or "").strip().lower()

    mapping = {
        "cardiology": "Heart Doctor",
        "dermatology": "Skin Doctor",
        "neurology": "Brain and Nerve Doctor",
        "gastroenterology": "Stomach and Digestive Doctor",
        "orthopedics": "Bone and Joint Doctor",
        "orthopedic": "Bone and Joint Doctor",
        "pulmonology": "Lung Doctor",
        "endocrinology": "Hormone Doctor",
    }

    return mapping.get(specialty_lower, "Specialist Doctor")


def build_referral_prompt(data: ReferralRequest) -> str:
    language = normalize_language(data.language_preference)

    return f"""
You are a healthcare referral workflow assistant.

Read the referral text and return ONLY valid JSON.

Required JSON schema:
{{
  "referral_summary": "string",
  "detected_specialty": "string",
  "specialty_simple_name": "string",
  "urgency_level": "low|medium|high",
  "extracted_info": {{
    "symptoms_or_reason": "string",
    "documents_present": ["string"],
    "insurance": "string",
    "language_preference": "string"
  }},
  "missing_info": ["string"],
  "tasks": [
    {{
      "task": "string",
      "responsible": "PCP|Patient|Specialist Office",
      "status": "Missing|Pending|Complete"
    }}
  ],
  "patient_friendly_explanation": "string",
  "translated_explanation": "string",
  "status": "Submitted|Reviewing|Waiting Info|Ready|Scheduled"
}}

Rules:
- Keep output concise and practical.
- Infer reasonable missing items such as imaging, labs, prior notes, or insurance authorization.
- Always write patient_friendly_explanation in English.
- Then set translated_explanation based on language_preference:
  - if "en": translated_explanation must exactly match patient_friendly_explanation
  - if "vi": translate into Vietnamese
  - if "es": translate into Spanish
  - if unsupported: use English
- If specialty is cardiology, use "Heart Doctor".
- If specialty is dermatology, use "Skin Doctor".
- If specialty is neurology, use "Brain and Nerve Doctor".
- If specialty is gastroenterology, use "Stomach and Digestive Doctor".
- If specialty is orthopedics or orthopedic, use "Bone and Joint Doctor".
- Do not wrap JSON in markdown or code fences.

Patient name: {data.patient_name}
Age: {data.age}
Preferred language: {language}
Location: {data.location}
Insurance: {data.insurance}

Referral text:
{data.referral_text}
""".strip()


def call_asi_json(prompt: str) -> Dict[str, Any]:
    response = client.chat.completions.create(
        model="asi1-mini",
        messages=[
            {
                "role": "system",
                "content": "Return only strict JSON. No markdown. No code fences.",
            },
            {
                "role": "user",
                "content": prompt,
            },
        ],
        temperature=0.2,
    )

    content = response.choices[0].message.content.strip()

    # Defensive cleanup if model still returns fenced JSON
    if content.startswith("```"):
        content = content.strip("`")
        if content.lower().startswith("json"):
            content = content[4:].strip()

    return json.loads(content)


def translate_text(text: str, target_language: str) -> str:
    """
    Fallback translator using ASI if the first response did not follow
    translation instructions properly.
    """
    language = normalize_language(target_language)

    if language == "en":
        return text

    language_name = {
        "vi": "Vietnamese",
        "es": "Spanish",
    }.get(language, "English")

    prompt = f"""
Translate the following patient-friendly healthcare explanation into {language_name}.

Rules:
- Keep the meaning accurate.
- Use simple, clear patient-friendly language.
- Return only the translated text.
- Do not add notes, labels, or quotation marks.

Text:
{text}
""".strip()

    response = client.chat.completions.create(
        model="asi1-mini",
        messages=[
            {
                "role": "system",
                "content": "You are a medical translation assistant. Return only the translated text.",
            },
            {
                "role": "user",
                "content": prompt,
            },
        ],
        temperature=0.1,
    )

    return response.choices[0].message.content.strip()


def enforce_translation_logic(result: Dict[str, Any], language: str) -> Dict[str, Any]:
    """
    Make sure translated_explanation truly matches language_preference.
    """
    language = normalize_language(language)

    base_text = str(result.get("patient_friendly_explanation", "")).strip()
    translated_text = str(result.get("translated_explanation", "")).strip()

    # Ensure English base explanation always exists
    if not base_text:
        base_text = "Your referral has been received. The care team is reviewing what is needed before your specialist visit."
        result["patient_friendly_explanation"] = base_text

    # English preference: translated text should match English exactly
    if language == "en":
        result["translated_explanation"] = base_text
        return result

    # Non-English preference:
    # If the model forgot to translate or returned the same English text,
    # do a second translation call.
    if not translated_text or translated_text == base_text:
        try:
            translated_text = translate_text(base_text, language)
        except Exception:
            translated_text = base_text

    result["translated_explanation"] = translated_text
    return result


def safe_fallback(data: ReferralRequest) -> Dict[str, Any]:
    language = normalize_language(data.language_preference)

    patient_text = (
        "Your referral has been received. The care team is reviewing what is needed before your specialist visit."
    )

    translated_text = patient_text
    if language in {"vi", "es"}:
        try:
            translated_text = translate_text(patient_text, language)
        except Exception:
            translated_text = patient_text

    return {
        "referral_summary": "Referral received and awaiting review.",
        "detected_specialty": "Unknown",
        "specialty_simple_name": "Specialist Doctor",
        "urgency_level": "medium",
        "extracted_info": {
            "symptoms_or_reason": data.referral_text[:200],
            "documents_present": [],
            "insurance": data.insurance or "Unknown",
            "language_preference": language,
        },
        "missing_info": ["Clinical review needed"],
        "tasks": [
            {
                "task": "Review referral manually",
                "responsible": "PCP",
                "status": "Pending",
            }
        ],
        "patient_friendly_explanation": patient_text,
        "translated_explanation": translated_text if language != "en" else patient_text,
        "status": "Reviewing",
    }


def sanitize_result(result: Dict[str, Any], data: ReferralRequest) -> Dict[str, Any]:
    """
    Normalizes and fills in missing fields from the LLM output.
    """
    language = normalize_language(data.language_preference)

    detected_specialty = str(result.get("detected_specialty", "Unknown")).strip()
    specialty_simple_name = str(result.get("specialty_simple_name", "")).strip()

    if not specialty_simple_name:
        specialty_simple_name = normalize_specialty_simple_name(detected_specialty)

    extracted_info = result.get("extracted_info", {})
    if not isinstance(extracted_info, dict):
        extracted_info = {}

    extracted_info["insurance"] = extracted_info.get("insurance") or data.insurance or "Unknown"
    extracted_info["language_preference"] = language

    missing_info = result.get("missing_info", [])
    if not isinstance(missing_info, list):
        missing_info = []

    tasks = result.get("tasks", [])
    if not isinstance(tasks, list):
        tasks = []

    result["detected_specialty"] = detected_specialty or "Unknown"
    result["specialty_simple_name"] = specialty_simple_name
    result["urgency_level"] = str(result.get("urgency_level", "medium")).strip().lower()
    result["extracted_info"] = extracted_info
    result["missing_info"] = missing_info
    result["tasks"] = tasks
    result["status"] = str(result.get("status", "Reviewing")).strip() or "Reviewing"

    # Enforce translation rules
    result = enforce_translation_logic(result, language)

    return result


# ----------------------------
# Core business logic
# ----------------------------

async def analyze_referral_logic(ctx: Context, data: ReferralRequest) -> ReferralAnalysisResponse:
    language = normalize_language(data.language_preference)

    try:
        raw_result = call_asi_json(build_referral_prompt(data))
        result = sanitize_result(raw_result, data)
    except Exception as e:
        ctx.logger.error(f"ASI call failed: {e}")
        result = safe_fallback(data)

    tasks: List[TaskItem] = []
    for task in result.get("tasks", []):
        try:
            tasks.append(TaskItem(**task))
        except Exception:
            continue

    return ReferralAnalysisResponse(
        patient_name=data.patient_name,
        referral_summary=result.get("referral_summary", ""),
        detected_specialty=result.get("detected_specialty", "Unknown"),
        specialty_simple_name=result.get("specialty_simple_name", "Specialist Doctor"),
        urgency_level=result.get("urgency_level", "medium"),
        extracted_info=result.get("extracted_info", {}),
        missing_info=result.get("missing_info", []),
        tasks=tasks,
        patient_friendly_explanation=result.get("patient_friendly_explanation", ""),
        translated_explanation=result.get("translated_explanation", ""),
        language_used=language,
        status=result.get("status", "Reviewing"),
    )


# ----------------------------
# REST endpoints
# ----------------------------

@agent.on_rest_get("/health", HealthResponse)
async def health(ctx: Context) -> HealthResponse:
    return HealthResponse(
        status="ok",
        agent_name=AGENT_NAME,
    )


@agent.on_rest_post("/analyze_referral", ReferralRequest, ReferralAnalysisResponse)
async def analyze_referral(ctx: Context, req: ReferralRequest) -> ReferralAnalysisResponse:
    return await analyze_referral_logic(ctx, req)


# ----------------------------
# Chat protocol support
# ----------------------------

@protocol.on_message(ChatMessage)
async def handle_chat(ctx: Context, sender: str, msg: ChatMessage):
    await ctx.send(
        sender,
        ChatAcknowledgement(
            timestamp=datetime.now(),
            acknowledged_msg_id=msg.msg_id,
        ),
    )

    user_text = ""
    for item in msg.content:
        if hasattr(item, "text"):
            user_text += item.text + "\n"

    prompt = f"""
You are a concise healthcare referral assistant.
If the user provides a referral, summarize it, identify likely missing items, and explain next steps briefly.

User message:
{user_text}
""".strip()

    try:
        response = client.chat.completions.create(
            model="asi1-mini",
            messages=[
                {
                    "role": "system",
                    "content": "Be brief, practical, and clear.",
                },
                {
                    "role": "user",
                    "content": prompt,
                },
            ],
            temperature=0.2,
        )
        answer = response.choices[0].message.content.strip()
    except Exception as e:
        ctx.logger.error(f"Chat ASI call failed: {e}")
        answer = "Sorry, I could not process that request right now."

    await ctx.send(
        sender,
        ChatMessage(
            timestamp=datetime.utcnow(),
            msg_id=uuid4(),
            content=[
                TextContent(type="text", text=answer),
                EndSessionContent(type="end-session"),
            ],
        ),
    )


@protocol.on_message(ChatAcknowledgement)
async def handle_ack(ctx: Context, sender: str, msg: ChatAcknowledgement):
    pass


agent.include(protocol, publish_manifest=True)

if __name__ == "__main__":
    agent.run()