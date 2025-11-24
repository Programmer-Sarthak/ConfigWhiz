import os
import httpx
import asyncio
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

API_KEY = os.environ.get("GOOGLE_API_KEY")

if not API_KEY:
    raise ValueError("Error: GOOGLE_API_KEY not found. Please create a .env file in the test_case_generator folder.")

GEMINI_API_URL = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key={API_KEY}"

PYTHON_SYSTEM_PROMPT = """
You are a Senior Python QA Engineer. Your sole job is to write robust, professional-level test cases. You will be given a Python script and must generate a complete, runnable `unittest` test file for it.
RULES:
1. You ONLY respond with Python code. No explanations or markdown.
2. Your response MUST be a single, runnable Python script.
3. The script MUST import unittest and any other standard libraries needed for the tests.
4. The user's code will be saved as `user_code.py`. You MUST import the functions/classes to be tested from it.
5. Identify all functions and classes in the user's code. Do NOT attempt to test code inside an `if __name__ == "__main__":` block.
6. Generate thorough and robust tests. Include positive cases, negative cases, edge cases, and type error tests.
7. For float comparisons, MUST use self.assertAlmostEqual.
8. The script MUST conclude with `if __name__ == "__main__": unittest.main()`.
"""

JAVASCRIPT_SYSTEM_PROMPT = """
You are a Senior JavaScript QA Engineer. Your sole job is to write robust, professional-level test cases. You will be given a JavaScript script and must generate a complete, runnable test script for it.
RULES:
1. You ONLY respond with JavaScript code. No explanations or markdown.
2. Your response MUST be a single, runnable JavaScript script using Node.js.
3. The user's code will be saved as `user_code.js`. You MUST require the functions/classes from it.
4. Identify all exported functions and classes and generate thorough and robust tests.
5. Use console.assert for testing.
6. Include positive cases, negative cases, and edge cases.
7. End with console.log("All tests passed!");
"""

JAVA_SYSTEM_PROMPT = """
You are a Senior Java QA Engineer. Your sole job is to write a single, complete, runnable Java file that tests a user's provided code.
RULES:
1. You ONLY respond with Java code. No explanations or markdown.
2. Your response MUST be a single, runnable Java file.
3. The file MUST be named `TestRunner.java`.
4. You MUST combine the user's code and your test logic into this one file.
5. Include public static void main(String[] args) as the test runner.
6. Test functions MUST use assertions and throw RuntimeException on failure.
7. For floats/doubles, use a tolerance check.
8. Print `All tests passed!` at the end.
"""

class UserInput(BaseModel):
    text: str
    language: str = "python"

class AIResponse(BaseModel):
    response: str

async def generate_with_retry(client, payload):
    max_retries = 3
    delay = 1
    for attempt in range(max_retries):
        try:
            response = await client.post(GEMINI_API_URL, json=payload, timeout=30.0)
            response.raise_for_status()
            return response.json()
        except (httpx.RequestError, httpx.HTTPStatusError):
            if attempt == max_retries - 1:
                raise
            await asyncio.sleep(delay)
            delay *= 2

@app.post("/chat")
async def chat(user_input: UserInput) -> AIResponse:

    if user_input.language == "python":
        system_prompt = PYTHON_SYSTEM_PROMPT
    elif user_input.language == "javascript":
        system_prompt = JAVASCRIPT_SYSTEM_PROMPT
    elif user_input.language == "java":
        system_prompt = JAVA_SYSTEM_PROMPT
    else:
        raise HTTPException(status_code=400, detail="Unsupported language")

    payload = {
        "systemInstruction": {"parts": [{"text": system_prompt}]},
        "contents": [{"parts": [{"text": user_input.text}]}],
        "generationConfig": {
            "temperature": 0.4,
            "top_p": 1.0,
            "top_k": 32,
            "maxOutputTokens": 8192,
        },
    }

    try:
        async with httpx.AsyncClient() as client:
            result = await generate_with_retry(client, payload)

            if "candidates" not in result or not result["candidates"]:
                raise HTTPException(status_code=500, detail="AI returned no response.")

            text = result["candidates"][0]["content"]["parts"][0]["text"]

            # --- CLEANUP LOGIC ADDED HERE ---
            # This removes the ```python and ``` lines so the code is pure
            if text.startswith("```"):
                lines = text.splitlines()
                # Remove the first line if it starts with ```
                if lines[0].startswith("```"):
                    lines = lines[1:]
                # Remove the last line if it starts with ```
                if lines and lines[-1].strip().startswith("```"):
                    lines = lines[:-1]
                text = "\n".join(lines)
            # --------------------------------

            return AIResponse(response=text.strip())

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))