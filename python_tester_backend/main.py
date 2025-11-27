import docker
import os
import time
import tempfile
import zipfile 
import shutil  
import pathlib
import re
from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware

# --- Configuration ---

app = FastAPI()

# Allow CORS for your React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Docker Client ---

try:
    client = docker.from_env()
    client.ping()
    print("Successfully connected to Docker.")
except Exception as e:
    print("="*50)
    print("FATAL ERROR: COULD NOT CONNECT TO DOCKER")
    print("Please ensure Docker Desktop is installed AND running.")
    print(f"Error details: {e}")
    print("="*50)
    raise

# --- Language/Image Mapping ---

DOCKER_IMAGES = {
    "python": "python:3.11-slim",
    "javascript": "node:20-slim",
    "java": "eclipse-temurin:17-jdk", # Correct image
    "java-project": "maven:3.9-eclipse-temurin-17" 
}

RUN_COMMANDS = {
    "python": ["python", "-m", "unittest", "test_code.py"],
    "javascript": ["node", "test_code.js"],
    "java": ["sh", "-c", "javac TestRunner.java && java TestRunner"],
}

# --- API Models ---

class CodeInput(BaseModel):
    language: str
    code: str
    test_code: str

class TestResult(BaseModel):
    success: bool
    summary: str
    output: str

# --- HELPER: Java Code Sanitizer ---
def sanitize_java_code(source_code: str) -> str:
    """
    Moves all import statements to the top of the Java file
    to prevent compilation errors if the AI places them mid-file.
    """
    lines = source_code.splitlines()
    imports = []
    code_body = []
    
    for line in lines:
        stripped = line.strip()
        # Check for imports
        if stripped.startswith("import ") and stripped.endswith(";"):
            imports.append(line)
        # Remove package declarations (single file runner uses default package)
        elif stripped.startswith("package "):
             pass 
        else:
            code_body.append(line)
            
    # Remove duplicate imports while preserving order
    unique_imports = list(dict.fromkeys(imports))
    
    # Reassemble: Imports first, then the rest of the code
    return "\n".join(unique_imports + [""] + code_body)

# --- HELPER 1: Run Single File (Updated) ---

def run_in_docker(language: str, code: str, test_code: str) -> TestResult:
    
    if language not in DOCKER_IMAGES:
        raise HTTPException(status_code=400, detail="Unsupported language")

    image_name = DOCKER_IMAGES[language]
    run_command = RUN_COMMANDS[language]
    
    try:
        client.images.get(image_name)
    except docker.errors.ImageNotFound:
        try:
            print(f"Image '{image_name}' not found. Starting download...")
            client.images.pull(image_name) 
            print(f"Image pull complete: {image_name}")
            return TestResult(
                success=False,
                summary="Downloading Environment...",
                output=f"The Docker image '{image_name}' was not found. The download has completed. Please try running the test again."
            )
        except Exception as pull_error:
             print(f"Failed to pull image: {pull_error}")
             return TestResult(
                success=False,
                summary="Failed to Download Environment",
                output=f"Failed to pull Docker image '{image_name}'. Error: {pull_error}"
            )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Docker error: {e}")

    temp_dir = pathlib.Path(tempfile.gettempdir()) / f"codetester_{os.getpid()}_{time.time()}"
    temp_dir.mkdir(parents=True, exist_ok=True)
    
    container = None
    try:
        if language == "java":
            # --- USE SANITIZER HERE ---
            # Fix imports before writing to file
            clean_code = sanitize_java_code(test_code)
            test_path = temp_dir / "TestRunner.java"
            with open(test_path, 'w', encoding='utf-8') as f:
                f.write(clean_code)
        else:
            code_filename = "user_code.py" if language == "python" else "user_code.js"
            test_filename = "test_code.py" if language == "python" else "test_code.js"
            code_path = temp_dir / code_filename
            with open(code_path, 'w', encoding='utf-8') as f:
                f.write(code)
            test_path = temp_dir / test_filename
            with open(test_path, 'w', encoding='utf-8') as f:
                f.write(test_code)

        container = client.containers.run(
            image=image_name,
            volumes={str(temp_dir): {'bind': '/app', 'mode': 'rw'}},
            working_dir='/app',
            command=run_command,
            detach=True,
            remove=False 
        )

        try:
            # 300s timeout
            result = container.wait(timeout=300) 
            exit_code = result.get("StatusCode", 1) 
        except Exception as e:
            return TestResult(
                success=False,
                summary="Code execution timed out (5 minutes).",
                output=f"Timeout: The test run exceeded the 5-minute limit."
            )

        logs = container.logs(stdout=True, stderr=True).decode('utf-8')

        if exit_code == 0:
            return TestResult(success=True, summary="All tests passed!", output=logs)
        else:
            return TestResult(success=False, summary="Tests Failed or Code Error", output=logs)

    except Exception as e:
        return TestResult(success=False, summary="Docker Execution Error", output=f"An unexpected error occurred: {str(e)}")
    finally:
        if container:
            try: container.stop(timeout=1); container.remove(v=True, force=True)
            except: pass 
        if temp_dir.exists():
             shutil.rmtree(temp_dir, ignore_errors=True)


# --- HELPER 2: Run Project ZIP (Unchanged) ---

def run_project_in_docker(language: str, zip_file: UploadFile) -> TestResult:
    
    if language == "javascript":
        image_name = DOCKER_IMAGES["javascript"]
        project_commands = "npm install && npm test"
        config_file = "package.json"
    elif language == "python":
        image_name = DOCKER_IMAGES["python"]
        project_commands = "pip install pytest && if [ -f requirements.txt ]; then pip install -r requirements.txt; fi && pytest"
        config_file = "requirements.txt" 
    elif language == "java":
        image_name = DOCKER_IMAGES["java-project"]
        project_commands = "mvn test"
        config_file = "pom.xml"
    else:
        raise HTTPException(status_code=400, detail="Unsupported project language.")

    try:
        client.images.get(image_name)
    except docker.errors.ImageNotFound:
        try:
            print(f"Image '{image_name}' not found. Downloading...")
            client.images.pull(image_name)
            print(f"Image pull complete: {image_name}")
            return TestResult(success=False, summary="Downloading Environment...", output=f"The {language} project environment was not found. The download has completed. Please re-upload the project.")
        except Exception as pull_error:
             return TestResult(success=False, summary="Failed to Download Environment", output=f"Failed to pull Docker image. Error: {pull_error}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Docker error: {e}")

    temp_dir = pathlib.Path(tempfile.gettempdir()) / f"codetester_proj_{os.getpid()}_{time.time()}"
    temp_dir.mkdir(parents=True, exist_ok=True)
    
    container = None
    try:
        zip_path = temp_dir / "project.zip"
        try:
            with open(zip_path, "wb") as f:
                shutil.copyfileobj(zip_file.file, f)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to save zip file: {e}")
        finally:
            zip_file.file.close()

        try:
            with zipfile.ZipFile(zip_path, 'r') as zip_ref:
                zip_ref.extractall(temp_dir)
        except Exception as e:
            return TestResult(success=False, summary="ZIP Error", output=f"Invalid .zip file. Error: {e}")
        
        if language == "java":
            if not (temp_dir / "pom.xml").exists():
                 return TestResult(success=False, summary="Invalid Project", output="No 'pom.xml' found. Please include a pom.xml file.")
            
            if not (temp_dir / "src" / "main" / "java").exists():
                print("Flat Java structure detected. Reorganizing for Maven...")
                src_main = temp_dir / "src" / "main" / "java"
                src_main.mkdir(parents=True, exist_ok=True)
                
                for item in list(temp_dir.iterdir()):
                    if item.name.endswith(".java"):
                        try:
                            with open(item, 'r', encoding='utf-8') as f:
                                content = f.read()
                                class_match = re.search(r'public\s+class\s+(\w+)', content)
                                target_filename = item.name
                                if class_match:
                                    detected_class = class_match.group(1)
                                    if item.stem != detected_class:
                                        target_filename = f"{detected_class}.java"

                                package_match = re.search(r'^\s*package\s+([\w.]+);', content, re.MULTILINE)
                                if package_match:
                                    package_name = package_match.group(1)
                                    package_path = package_name.replace('.', '/')
                                    target_dir = src_main / package_path
                                    target_dir.mkdir(parents=True, exist_ok=True)
                                    shutil.move(str(item), str(target_dir / target_filename))
                                else:
                                    shutil.move(str(item), str(src_main / target_filename))
                        except Exception as e:
                            print(f"Error processing {item.name}: {e}")

        elif language == "python":
            req_file = None
            if (temp_dir / "requirements.txt").exists(): req_file = "requirements.txt"
            elif (temp_dir / "requirement.txt").exists(): req_file = "requirement.txt"
            
            install_cmd = ""
            if req_file and (temp_dir / req_file).stat().st_size > 0:
                install_cmd = f"pip install -r {req_file} && "

            test_files = list(temp_dir.glob("test_*.py")) + list(temp_dir.glob("*_test.py"))
            if not test_files:
                smoke_test = """
import unittest
import os
import importlib
import sys
from unittest.mock import MagicMock
sys.modules["tkinter"] = MagicMock()
sys.modules["turtle"] = MagicMock()
sys.modules["pygame"] = MagicMock()
class TestProjectStructure(unittest.TestCase):
    def test_files_importable(self):
        print("\\n--- Checking Project Files ---")
        files = [f[:-3] for f in os.listdir('.') if f.endswith('.py') and f != 'test_smoke_generated.py']
        if not files: self.fail("No Python files found!")
        for module_name in files:
            try:
                importlib.import_module(module_name)
                print(f"[OK] Loaded: {module_name}.py") 
            except Exception as e:
                print(f"[FAIL] Failed: {module_name}.py")
                self.fail(f"Error importing {module_name}.py: {e}")
if __name__ == '__main__': unittest.main()
"""
                with open(temp_dir / "test_smoke_generated.py", "w", encoding="utf-8") as f:
                    f.write(smoke_test)
                project_commands = f"pip install pytest && {install_cmd}pytest test_smoke_generated.py"
            else:
                project_commands = f"pip install pytest && {install_cmd}pytest"

        elif language == "javascript":
            is_frontend_project = (temp_dir / "index.html").exists() and (temp_dir / "script.js").exists()
            if is_frontend_project and not (temp_dir / "package.json").exists():
                 print("Frontend project detected. Injecting test harness...")
                 pkg_json = """{"name": "frontend-test","version": "1.0.0","scripts": {"test": "node test_runner.js"},"dependencies": {"jsdom": "^24.0.0"}}"""
                 with open(temp_dir / "package.json", "w", encoding="utf-8") as f: f.write(pkg_json)
                 test_runner = """const fs = require('fs'); const jsdom = require("jsdom"); const { JSDOM } = jsdom; try { const html = fs.readFileSync('index.html', 'utf8'); const scriptContent = fs.readFileSync('script.js', 'utf8'); const dom = new JSDOM(html, { runScripts: "dangerously", resources: "usable" }); const { window } = dom; window.eval(scriptContent); console.log("[OK] script.js loaded successfully."); console.log("[OK] DOM initialized successfully."); } catch (error) { console.error("[FAIL] Test Failed:", error); process.exit(1); }"""
                 with open(temp_dir / "test_runner.js", "w", encoding="utf-8") as f: f.write(test_runner)
            elif not (temp_dir / "package.json").exists():
                 return TestResult(success=False, summary="Invalid Project", output=error_msg)

        container = client.containers.run(
            image=image_name,
            volumes={str(temp_dir): {'bind': '/app', 'mode': 'rw'}},
            working_dir='/app',
            command=["sh", "-c", project_commands], 
            detach=True,
            remove=False 
        )

        try:
            result = container.wait(timeout=600) 
            exit_code = result.get("StatusCode", 1) 
        except Exception as e:
            return TestResult(
                success=False,
                summary="Project execution timed out (10 minutes).",
                output=f"Timeout: The project run exceeded the 10-minute limit."
            )

        logs = container.logs(stdout=True, stderr=True).decode('utf-8')

        if exit_code == 0:
            return TestResult(success=True, summary="All project tests passed!", output=logs)
        else:
            return TestResult(success=False, summary="Project Tests Failed", output=logs)

    except Exception as e:
        return TestResult(success=False, summary="Docker Execution Error", output=f"An unexpected error occurred: {str(e)}")
    finally:
        if container:
            try: container.stop(timeout=1); container.remove(v=True, force=True)
            except: pass 
        if temp_dir.exists():
             shutil.rmtree(temp_dir, ignore_errors=True)


# --- API Endpoints ---

@app.post("/run-test")
async def run_test(payload: CodeInput) -> TestResult:
    try:
        return run_in_docker(payload.language, payload.code, payload.test_code)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")

@app.post("/run-project-zip")
async def run_project_zip(language: str = Form(...), zip_file: UploadFile = File(...)) -> TestResult:
    if not zip_file.filename.endswith(".zip"):
        raise HTTPException(status_code=400, detail="Invalid file type. Please upload a .zip file.")
    try:
        return run_project_in_docker(language, zip_file)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")