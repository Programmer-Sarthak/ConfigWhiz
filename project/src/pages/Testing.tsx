import { useState, useRef } from "react";
import { Upload, Loader, AlertTriangle, CheckCircle2, XCircle, Brain, Play, FileArchive, FileText, ChevronDown } from "lucide-react";
import Editor from "@monaco-editor/react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";

// NOTE: We are pausing Firebase integration, so all imports are commented out
// import { getFirestore, collection, addDoc } from 'firebase/firestore';
// import { initializeApp } from 'firebase/app';
// import { useAuth } from '../context/AuthContext'; 

// Define the structure for the test results
interface TestResult {
  success: boolean;
  summary: string;
  output: string;
}

// Define the structure for the AI service error
interface AIErrorDetail {
  error: {
    code: number;
    message: string;
    status: string;
  };
}

type Language = "python" | "javascript" | "java"; 
type TestMode = "singleFile" | "projectZip"; 

// --- Default Code Examples ---
const languageConfig = {
  python: {
    defaultCode: `import math

# --- Professional Example: DataAnalyzer Class ---

class DataAnalyzer:
    def __init__(self, data):
        if not isinstance(data, list):
            raise TypeError("Data must be a list of numbers")
        if not all(isinstance(x, (int, float)) for x in data):
            raise TypeError("All items in data must be numbers")
            
        self.data = data

    def get_mean(self):
        if not self.data:
            return 0
        return sum(self.data) / len(self.data)

    def get_max(self):
        if not self.data:
            return None
        return max(self.data)

    def get_standard_deviation(self):
        if not self.data or len(self.data) < 2:
            return 0
        
        n = len(self.data)
        mean = self.get_mean()
        variance = sum((x - mean) ** 2 for x in self.data) / (n - 1)
        return math.sqrt(variance)

# Example of a separate function
def find_word_frequency(text):
    if not isinstance(text, str):
        return {}
    
    # Improved logic: Replace non-alphabetic characters with spaces, then split
    import re
    text = re.sub(r'[^a-z\\s]', '', text.lower())
    words = text.split()
    
    frequency = {}
    for word in words:
        if word:
            frequency[word] = frequency.get(word, 0) + 1
    return frequency
`,
    language: "python",
  },
  javascript: {
    defaultCode: `// --- Professional Example: DataAnalyzer Class ---

class DataAnalyzer {
    constructor(data) {
        if (!Array.isArray(data)) {
            throw new TypeError("Data must be an array of numbers");
        }
        if (!data.every(x => typeof x === 'number')) {
            throw new TypeError("All items in data must be numbers");
        }
        this.data = data;
    }

    getMean() {
        if (this.data.length === 0) {
            return 0;
        }
        return this.data.reduce((a, b) => a + b, 0) / this.data.length;
    }

    getMax() {
        if (this.data.length === 0) {
            return null;
        }
        return Math.max(...this.data);
    }

    getStandardDeviation() {
        if (this.data.length < 2) {
            return 0;
        }
        
        const n = this.data.length;
        const mean = this.getMean();
        const variance = this.data.reduce((acc, val) => acc + (val - mean) ** 2, 0) / (n - 1);
        return Math.sqrt(variance);
    }
}

// Example of a separate function
function findWordFrequency(text) {
    if (typeof text !== 'string') {
        return {};
    }
    const words = text.toLowerCase().split(/\\s+/); // Split on whitespace
    const frequency = {};
    for (const word of words) {
        const cleanedWord = word.replace(/[^a-z0-9]/g, ''); // Remove punctuation
        if (cleanedWord) {
            frequency[cleanedWord] = (frequency[cleanedWord] || 0) + 1;
        }
    }
    return frequency;
}

// Note: In Node.js, you must export functions/classes for the tests to find them.
module.exports = { DataAnalyzer, findWordFrequency };
`,
    language: "javascript",
  },
  java: {
    // --- THIS IS THE FIX ---
    defaultCode: `import java.util.List;
import java.util.ArrayList;

// --- Professional Example: DataAnalyzer Class ---

class DataAnalyzer {
    private List<Number> data;

    public DataAnalyzer(List<Number> data) {
        if (data == null) {
            throw new IllegalArgumentException("Data cannot be null");
        }
        for (Object item : data) {
            if (!(item instanceof Number)) {
                throw new IllegalArgumentException("All items must be numbers");
            }
        }
        this.data = new ArrayList<>(data);
    }

    public double getMean() {
        if (data.isEmpty()) {
            throw new IllegalStateException("Cannot calculate mean of empty list");
        }
        double sum = 0.0;
        for (Number n : data) {
            sum += n.doubleValue();
        }
        return sum / data.size();
    }

    public double getMax() {
        if (data.isEmpty()) {
             throw new IllegalStateException("Cannot calculate max of empty list");
        }
        double max = -Double.MAX_VALUE;
        for(Number n : data) {
             if(n.doubleValue() > max) {
                 max = n.doubleValue();
             }
        }
        return max;
    }
}
`,
    // --- END FIX ---
    language: "java",
  },
};
// --- End Default Code ---


export default function Testing() {
  // --- State ---
  const [mode, setMode] = useState<TestMode>("singleFile");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [zipFileName, setZipFileName] = useState<string>("No project selected");
  const [language, setLanguage] = useState<Language>("python");
  const [code, setCode] = useState(languageConfig.python.defaultCode);
  const [aiTestCode, setAiTestCode] = useState("");
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [isLoadingRunner, setIsLoadingRunner] = useState(false);
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // --- Manual Dropdown State ---
  const [showDropdown, setShowDropdown] = useState(false); 
  
  const aiEditorRef = useRef<any>(null);
  
  // We are pausing Firebase
  // const { user, isAuthReady } = useAuth();
  // const db = getFirestore(initializeApp(typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {}));
  // const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

  // --- API URLs ---
  const aiApiUrl = "http://127.0.0.1:8000/chat";
  const runnerApiUrl = "http://127.0.0.1:8001/run-test";
  const projectRunnerApiUrl = "http://127.0.0.1:8001/run-project-zip";

  // --- Handlers for Single File Mode ---
  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
    setCode(languageConfig[lang].defaultCode); 
    setAiTestCode("");
    setTestResult(null);
    setError(null);
    setShowDropdown(false); // Close dropdown on selection
  };

  const handleEditorChange = (value: string | undefined) => {
    setCode(value || "");
  };

  const handleAiEditorDidMount = (editor: any) => {
    aiEditorRef.current = editor;
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setCode(content);
      };
      reader.readAsText(file);
    }
  };


  // --- Handlers for Project Zip Mode ---
  const handleModeChange = (newMode: TestMode) => {
    setMode(newMode);
    setTestResult(null);
    setError(null);
    setSelectedFile(null);
    setZipFileName("No project selected");
  };

  const handleZipFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type === "application/zip" || file.name.endsWith(".zip")) {
        setSelectedFile(file);
        setZipFileName(file.name);
        setError(null);
      } else {
        setError("Invalid file type. Please upload a .zip file.");
        setSelectedFile(null);
        setZipFileName("No project selected");
      }
    }
  };

  // --- Main Execution Logic ---
  const handleRun = () => {
    if (mode === 'singleFile') {
      handleGenerateAndRunSingleFile();
    } else {
      handleProjectUpload();
    }
  };

  // --- Main Logic 1: Single File ---
  const handleGenerateAndRunSingleFile = async () => {
    setIsLoadingAI(true);
    setIsLoadingRunner(false);
    setError(null);
    setTestResult(null);
    setAiTestCode(""); 

    let generatedTestCode = "";

    try {
      const aiResponse = await axios.post(aiApiUrl, {
        text: code,
        language: language,
      });
      generatedTestCode = aiResponse.data.response;
      setAiTestCode(generatedTestCode);
    } catch (err: any) {
      setError("Failed to generate tests. Check AI server (port 8000).");
      setIsLoadingAI(false);
      return;
    } finally {
      setIsLoadingAI(false);
    }

    if (!generatedTestCode) {
      setError("Error: AI did not return any test code.");
      return;
    }

    setIsLoadingRunner(true);
    try {
      const runnerPayload = {
        language: language,
        code: language === "java" ? "" : code,
        test_code: generatedTestCode,
      };
      
      const runnerResponse = await axios.post(runnerApiUrl, runnerPayload);
      setTestResult(runnerResponse.data as TestResult);
    } catch (err: any) {
      setError("Failed to run tests. Check Runner server (port 8001).");
      setTestResult({ success: false, summary: "Execution Failed", output: err.message });
    } finally {
      setIsLoadingRunner(false);
    }
  };

  // --- Main Logic 2: Project Upload ---
  const handleProjectUpload = async () => {
    if (!selectedFile) {
      setError("Please select a .zip file to upload.");
      return;
    }
    
    setIsLoadingAI(false); 
    setIsLoadingRunner(true);
    setError(null);
    setTestResult(null);

    const formData = new FormData();
    formData.append("zip_file", selectedFile);
    formData.append("language", language);

    try {
      const response = await axios.post(projectRunnerApiUrl, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 310000 
      });

      setTestResult(response.data as TestResult);
      
    } catch (err: any) {
      let errorMessage = "Failed to run project tests.";
      if (err.code === "ECONNABORTED") {
        errorMessage = "Request timed out (5+ minutes). Your project is too large or dependencies are taking too long."
      } else if (err.response && err.response.data?.detail) {
         errorMessage = `Failed to run tests. ${err.response.data.detail}`;
      }
      setTestResult({
        success: false,
        summary: "Project Execution Failed",
        output: errorMessage,
      });
    } finally {
      setIsLoadingRunner(false);
    }
  };

  const isRunning = isLoadingAI || isLoadingRunner;
  
  const getProjectUploadTitle = () => {
    if (language === 'python') return "Upload Python Project";
    if (language === 'javascript') return "Upload Node.js Project";
    if (language === 'java') return "Upload Java (Maven) Project";
    return "Upload Project";
  }

  const getProjectUploadText = () => {
    if (language === 'python') {
      return (
        <p className="text-muted">
          The runner will automatically run <code>pip install pytest</code>, 
          install a <code>requirements.txt</code> (if found), and run <code>pytest</code>.
        </p>
      );
    }
    if (language === 'javascript') {
      return (
        <p className="text-muted">
          The runner will automatically run <code>npm install</code> and <code>npm test</code>.
          <br/>
          Ensure your project has a <code>package.json</code> with a <code>"test"</code> script.
        </p>
      );
    }
    if (language === 'java') {
      return (
        <p className="text-muted">
          The runner will automatically run <code>mvn test</code>.
          <br/>
          Ensure your project has a <code>pom.xml</code> file in the root.
        </p>
      );
    }
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="container py-4"
    >
      {/* --- Header & Toggles --- */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h3 mb-0">Code Test Runner</h1>
        <div className="d-flex align-items-center gap-3">
          
          {/* --- Mode Toggle --- */}
          <div className="btn-group">
            <button 
              className={`btn ${mode === 'singleFile' ? 'btn-primary' : 'btn-outline-secondary'}`}
              onClick={() => handleModeChange('singleFile')}
              disabled={isRunning}
            >
              <FileText size={16} className="me-2"/>
              Single File
            </button>
            <button 
              className={`btn ${mode === 'projectZip' ? 'btn-primary' : 'btn-outline-secondary'}`}
              onClick={() => handleModeChange('projectZip')}
              disabled={isRunning}
            >
              <FileArchive size={16} className="me-2"/>
              Project
            </button>
          </div>

          {/* --- Language Dropdown (React Controlled) --- */}
            <div className="btn-group position-relative">
              <button
                type="button"
                className="btn btn-outline-primary dropdown-toggle d-flex align-items-center gap-2"
                onClick={() => setShowDropdown(!showDropdown)} // Toggle state
                disabled={isRunning}
              >
                {language === "python" ? "Python" : (language === "javascript" ? "JavaScript" : "Java")}
                <ChevronDown size={14} />
              </button>
              {showDropdown && (
                <div 
                    className="dropdown-menu dropdown-menu-dark show" 
                    style={{ position: 'absolute', top: '100%', left: 0, marginTop: '0.25rem', zIndex: 1000 }}
                >
                  <button className="dropdown-item" type="button" onClick={() => handleLanguageChange("python")}>
                    Python
                  </button>
                  <button className="dropdown-item" type="button" onClick={() => handleLanguageChange("javascript")}>
                    JavaScript
                  </button>
                  <button className="dropdown-item" type="button" onClick={() => handleLanguageChange("java")}>
                    Java
                  </button>
                </div>
              )}
              {/* Overlay to close dropdown when clicking outside */}
              {showDropdown && (
                <div 
                    style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 999 }} 
                    onClick={() => setShowDropdown(false)}
                />
              )}
            </div>

          {/* --- Main RunButton --- */}
          <motion.button
            className="btn btn-primary d-flex align-items.center gap-2"
            onClick={handleRun}
            disabled={isRunning || (mode === 'projectZip' && !selectedFile)}
            whileHover={{ scale: isRunning ? 1 : 1.02 }}
            whileTap={{ scale: isRunning ? 1 : 0.98 }}
          >
            {isLoadingAI ? (
              <><Loader size={18} className="spinner-border spinner-border-sm" /> Generating...</>
            ) : isLoadingRunner ? (
              <><Loader size={18} className="spinner-border spinner-border-sm" /> Running...</>
            ) : (
              <><Play size={18} /> {mode === 'singleFile' ? 'Generate & Run Tests' : 'Upload & Run Project'} </>
            )}
          </motion.button>
        </div>
      </div>

      {/* --- Main Content Area --- */}
      <AnimatePresence mode="wait">
        {mode === 'singleFile' ? (
          // --- SINGLE FILE MODE UI ---
          <motion.div
            key="singleFile"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <div className="row g-4">
              {/* Left Column: User Code */}
              <div className="col-lg-6">
                <div className="card bg-dark border-secondary h-100">
                  <div className="card-header d-flex justify-content-between align-items-center">
                    <h3 className="card-title mb-0 h5">Your Code</h3>
                    <label className="btn btn-outline-light btn-sm d-flex align-items-center gap-2">
                      <Upload size={16} /> Upload File
                      <input type="file" className="d-none" accept={language === "python" ? ".py" : (language === "javascript" ? ".js" : ".java")} onChange={handleFileUpload} disabled={isRunning} />
                    </label>
                  </div>
                  <div className="card-body p-0" style={{ height: "600px" }}>
                    <Editor height="100%" language={languageConfig[language].language} theme="vs-dark" value={code} onChange={handleEditorChange} options={{ minimap: { enabled: false }, fontSize: 14, padding: { top: 16, bottom: 16 }, scrollBeyondLastLine: false }} />
                  </div>
                </div>
              </div>
              {/* Right Column: AI Tests */}
              <div className="col-lg-6">
                <div className="card bg-dark border-secondary h-100">
                  <div className="card-header">
                    <h3 className="card-title mb-0 h5"><Brain size={20} className="me-2 text-primary" /> AI-Generated Tests</h3>
                  </div>
                  <div className="card-body p-0" style={{ height: "600px" }}>
                    <Editor height="100%" language={languageConfig[language].language} theme="vs-dark" value={aiTestCode} onMount={handleAiEditorDidMount} options={{ minimap: { enabled: false }, fontSize: 14, padding: { top: 16, bottom: 16 }, readOnly: true, scrollBeyondLastLine: false }} />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          // --- PROJECT ZIP MODE UI ---
          <motion.div
            key="projectZip"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <div className="row justify-content-center">
              <div className="col-lg-8">
                <div className="card bg-dark border-secondary">
                  <div className="card-header">
                    <h3 className="card-title mb-0 h5">{getProjectUploadTitle()}</h3>
                  </div>
                  <div className="card-body text-center p-5">
                    <FileArchive size={64} className="text-primary mb-4" />
                    <h4 className="mb-3">Select your .zip project file</h4>
                    {getProjectUploadText()}
                    <label className={`btn ${selectedFile ? 'btn-outline-success' : 'btn-outline-light'} btn-lg mt-3`}>
                      <Upload size={18} className="me-2" />
                      {zipFileName}
                      <input type="file" className="d-none" accept=".zip,application/zip" onChange={handleZipFileChange} disabled={isRunning} />
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- Bottom Section (Results & Errors) --- */}
      <div className="mt-4">
        {/* --- Error Display --- */}
        <AnimatePresence>
          {error && (
            <motion.div className="alert alert-danger d-flex align-items-center gap-2" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <AlertTriangle size={20} />
              <div><strong>Error:</strong> {error}</div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* --- Test Result Display --- */}
        <AnimatePresence>
          {testResult && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              {/* Summary Banner */}
              <div className={`alert d-flex align-items-center gap-2 h4 ${testResult.success ? "alert-success" : "alert-danger"}`}>
                {testResult.success ? <CheckCircle2 size={24} /> : <XCircle size={24} />}
                {testResult.summary}
              </div>
              {/* Detailed Output */}
              {testResult.output && (
                 <div className="card bg-dark border-secondary">
                   <div className="card-header"><h5 className="mb-0">Test Output</h5></div>
                   <div className="card-body">
                    <pre className="text-light bg-black p-3 rounded m-0" style={{maxHeight: '400px', overflowY: 'auto'}}>
                      <code>{testResult.output}</code>
                    </pre>
                   </div>
                 </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}