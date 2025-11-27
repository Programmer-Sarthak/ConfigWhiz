import os
import httpx
import asyncio
import re
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware

# --- Configuration ---

# 1. Load environment variables from .env
load_dotenv()

app = FastAPI()

# Allow CORS for your React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 2. Get API key
API_KEY = os.environ.get("GOOGLE_API_KEY")

if not API_KEY:
    # Friendly error message if .env is missing
    print("CRITICAL ERROR: GOOGLE_API_KEY not found.")
    print("Please create a file named '.env' in the 'test_case_generator' folder.")
    print("Add this line to it: GOOGLE_API_KEY=your_api_key_here")
    # We don't raise error here so the server can start and print the log, 
    # but requests will fail.

GEMINI_API_URL = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key={API_KEY}"

# --- Prompts ---

PYTHON_SYSTEM_PROMPT = """
You are a Senior Python QA Engineer. Your sole job is to write robust, professional-level test cases.
RULES:
1. You ONLY respond with Python code. No explanations or markdown.
2. Your response MUST be a single, runnable Python script.
3. The script MUST import unittest.
4. CRITICAL: The user's code will be saved as `user_code.py`. You MUST import functions from it.
5. Identify functions in user code and test them.
6. Generate thorough tests (positive, negative, edge cases).
7. End with `if __name__ == "__main__": unittest.main()`.
"""

JAVASCRIPT_SYSTEM_PROMPT = """
You are a Senior JavaScript QA Engineer. Your sole job is to write robust, professional-level test cases.
RULES:
1. You ONLY respond with JavaScript code. No explanations or markdown.
2. Your response MUST be a single, runnable JavaScript script.
3. CRITICAL: The user's code will be saved as `user_code.js`. You MUST require it: `const { ... } = require('./user_code.js');`.
4. Identify exported functions and test them.
5. Use `console.assert` for testing.
6. End with `console.log("All tests passed!");`.
"""

JAVA_SYSTEM_PROMPT = """
You are a Senior Java QA Engineer. Your sole job is to write a single, complete, runnable Java file.
RULES:
1. You ONLY respond with Java code. No explanations or markdown.
2. The file MUST be named `TestRunner.java`.
3. Combine user code and test logic into this one file.
4. Include `public static void main(String[] args)`.
5. Run series of tests. Throw RuntimeException on failure.
6. Print `All tests passed!` at the end.
"""

# --- API Models ---

class UserInput(BaseModel):
    text: str
    language: str = "python"

class AIResponse(BaseModel):
    response: str

# --- Helper for Async HTTP ---

async def generate_with_retry(client, payload):
    max_retries = 3
    delay = 1
    for attempt in range(max_retries):
        try:
            response = await client.post(GEMINI_API_URL, json=payload, timeout=30.0)
            response.raise_for_status()
            return response.json()
        except (httpx.RequestError, httpx.HTTPStatusError) as e:
            if attempt == max_retries - 1:
                raise e
            await asyncio.sleep(delay)
            delay *= 2

# --- API Endpoint ---

@app.post("/chat")
async def chat(user_input: UserInput) -> AIResponse:
    if not API_KEY:
        raise HTTPException(status_code=500, detail="Server Error: API Key missing. Check server logs.")

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
            
            # Robust Cleanup using Regex
            match = re.search(r"```\w*\n(.*?)```", text, re.DOTALL)
            if match:
                text = match.group(1)
            else:
                text = text.replace("```python", "").replace("```javascript", "").replace("```java", "").replace("```", "")
            
            return AIResponse(response=text.strip())

    except httpx.HTTPStatusError as e:
        raise HTTPException(status_code=e.response.status_code, detail=e.response.json())
    except Exception as e:
        print(f"Unhandled error: {e}")
        raise HTTPException(status_code=500, detail=f"An internal error occurred: {e}")