from groq import Groq
from config import settings

client = Groq(api_key=settings.groq_api_key)

PROMPTS = {
    "answers": """You are an expert academic tutor. The following is a past exam paper.
Read through all the questions carefully and provide clear, well-structured answers for each one.
Format your response with each question number followed by a detailed answer.

PAST PAPER:
{content}
""",

    "notes": """You are an expert academic note-taker. The following is study material or lecture notes.
Create concise, well-organized revision notes from this content.
Use headings, bullet points, and highlight key concepts, definitions, and important facts.

CONTENT:
{content}
""",

    "both": """You are an expert academic tutor and note-taker.
The following document may contain questions, content, or both.

First, if there are exam questions, provide clear answers for each one.
Then, generate concise revision notes summarizing the key concepts covered.

DOCUMENT:
{content}
"""
}

def generate_response(content: str, mode: str) -> str:
    """Send extracted text to Groq and return the AI response."""
    prompt = PROMPTS[mode].format(content=content)

    chat_completion = client.chat.completions.create(
        messages=[
            {
                "role": "user",
                "content": prompt,
            }
        ],
        model=settings.groq_model,
        max_tokens=settings.max_tokens,
    )

    return chat_completion.choices[0].message.content
