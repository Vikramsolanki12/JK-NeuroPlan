from openai import OpenAI
import os

client = OpenAI(
    base_url="https://integrate.api.nvidia.com/v1",
    api_key="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"
)

def generate_ai_insights(tasks, timetable):

    prompt = f"""
You are an AI study productivity assistant.

Analyze the student's study data and return JSON.

Tasks:
{tasks}

Timetable:
{timetable}

Return JSON with:

focus_score
strengths
weaknesses
topics_to_improve
study_plan
revision_plan
insights
"""

    completion = client.chat.completions.create(
        model="deepseek-ai/deepseek-v3.2",
        messages=[
            {"role": "system", "content": "You are a study productivity AI."},
            {"role": "user", "content": prompt}
        ],
        temperature=0.4,
        max_tokens=800
    )

    return completion.choices[0].message.content