import os
import httpx
import asyncio
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware

# --- Configuration ---
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
    raise ValueError("Error: GOOGLE_API_KEY environment variable not set.")

GEMINI_API_URL = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key={API_KEY}"

# --- Prompts ---

# Professional Python Prompt
PYTHON_SYSTEM_PROMPT = """
You are a Senior Python QA Engineer. Your sole job is to write robust, professional-level test cases. You will be given a Python script and must generate a complete, runnable `unittest` test file for it.

RULES:
1.  You **ONLY** respond with Python code. No explanations or markdown.
2.  Your response **MUST** be a single, runnable Python script.
3.  The script **MUST** `import unittest` and any other standard libraries needed *for the tests*.
4.  **CRITICAL:** The user's code will be saved as `user_code.py`. You **MUST** import the functions/classes to be tested from it (e.g., `from user_code import DataAnalyzer, specific_function`).
5.  **Identify all** functions and classes in the user's code. Do **NOT** attempt to test code inside an `if __name__ == "__main__":` block.
6.  Generate **thorough and robust** tests. Include positive cases, negative cases, edge cases (empty lists, null/None inputs, zero), and type error tests.
7.  For float comparisons, **MUST** use `self.assertAlmostEqual`.
8.  The script **MUST** conclude with `if __name__ == "__main__": unittest.main()`.
"""

# Professional JavaScript Prompt
JAVASCRIPT_SYSTEM_PROMPT = """
You are a Senior JavaScript QA Engineer. Your sole job is to write robust, professional-level test cases. You will be given a JavaScript script and must generate a complete, runnable test script for it.

RULES:
1.  You **ONLY** respond with JavaScript code. No explanations or markdown.
2.  Your response **MUST** be a single, runnable JavaScript script using Node.js.
3.  **CRITICAL:** The user's code will be saved as `user_code.js`. You **MUST** require the functions/classes to be tested from it (e.g., `const { DataAnalyzer, specificFunction } = require('./user_code.js');`).
4.  **Identify all** exported functions and classes in the user's code and generate **thorough and robust** tests for them.
5.  You **MUST** use the built-in `console.assert` for testing. Example: `console.assert(result === expected, "Test Failed: [description of test]");`
6.  Include positive cases, negative cases, and edge cases (empty arrays, null/undefined inputs, zero).
7.  Add a `console.log("All tests passed!");` message at the very end of the script, *after* all assertions.
"""

# --- NEW JAVA PROMPT ---
JAVA_SYSTEM_PROMPT = """
You are a Senior Java QA Engineer. Your sole job is to write a single, complete, runnable Java file that tests a user's provided code.

RULES:
1.  You **ONLY** respond with Java code. No explanations or markdown.
2.  Your response **MUST** be a single, runnable Java file.
3.  The file **MUST** be named `TestRunner.java`.
4.  You **MUST** combine the user's code (e.g., their classes and methods) AND your test logic into this one file.
5.  The file **MUST** have a `public static void main(String[] args)` method. This main method is the test runner.
6.  Inside the `main` method, you **MUST** run a series of test functions (e.g., `test1()`, `test2()`).
7.  Each test function **MUST** use assertions. If an assertion fails, you **MUST** throw a `RuntimeException` with a clear error message.
    * Example: `if (result != expected) { throw new RuntimeException("Test Failed: [description of test]"); }`
    * For floats/doubles, check a small range: `if (Math.abs(result - expected) > 0.001) { ... }`
8.  If all tests in the `main` method pass, the file **MUST** print `All tests passed!` at the very end.
9.  The user's code might include `import` statements (like `java.util.*` or `java.math.*`). You **MUST** include these at the top of the file.
"""
# --- END NEW JAVA PROMPT ---

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

# --- API Endpoint (Updated) ---

@app.post("/chat")
async def chat(user_input: UserInput) -> AIResponse:
    
    # --- NEW LOGIC ---
    if user_input.language == "python":
        system_prompt = PYTHON_SYSTEM_PROMPT
    elif user_input.language == "javascript":
        system_prompt = JAVASCRIPT_SYSTEM_PROMPT
    elif user_input.language == "java":
        system_prompt = JAVA_SYSTEM_PROMPT
    # --- END NEW LOGIC ---
    else:
        raise HTTPException(status_code=400, detail="Unsupported language")

    payload = {
        "systemInstruction": {"parts": [{"text": system_prompt}]},
        "contents": [{"parts": [{"text": user_input.text}]}], # The user's code is the input
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
            # Clean up markdown ```java ... ```
            if text.startswith("```java"):
                text = text[7:]
            if text.endswith("```"):
                text = text[:-3]
            
            return AIResponse(response=text.strip())

    except httpx.HTTPStatusError as e:
        error_details = e.response.json()
        raise HTTPException(status_code=e.response.status_code, detail=error_details)
    except Exception as e:
        print(f"Unhandled error: {e}")
        raise HTTPException(status_code=500, detail=f"An internal error occurred: {e}")