import os
import uvicorn
import psutil
import subprocess
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
from pydantic import BaseModel

app = FastAPI(
    title="Z-AI JARVIS HUD Core Backend API",
    description="Local FastAPI core backend serving system telemetry and local desktop embedding support.",
    version="1.0.0"
)

# Enable CORS for local web HUD development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/health")
async def health_check():
    return JSONResponse({
        "status": "ONLINE",
        "system": "Z-AI JARVIS CORE",
        "telemetry": "NOMINAL"
    })

@app.get("/api/telemetry")
async def get_telemetry():
    # Real system telemetry using psutil
    cpu_percent = psutil.cpu_percent(interval=0.1)
    memory = psutil.virtual_memory()
    
    # Battery info (may not be available on all systems)
    battery = psutil.sensors_battery()
    battery_percent = battery.percent if battery else 100.0
    is_plugged = battery.power_plugged if battery else True
    
    disk = psutil.disk_usage('/')
    
    return JSONResponse({
        "cpu_load": cpu_percent,
        "memory_used_percent": memory.percent,
        "battery_percent": battery_percent,
        "is_plugged": is_plugged,
        "disk_free_gb": round(disk.free / (1024 ** 3), 2),
        "status": "LISTENING"
    })

class CommandRequest(BaseModel):
    command: str

@app.post("/api/execute")
async def execute_command(req: CommandRequest):
    try:
        # Run command securely (consider adding a whitelist or confirmation prompt in the future)
        result = subprocess.run(
            req.command,
            shell=True,
            capture_output=True,
            text=True,
            timeout=30 # 30 seconds timeout
        )
        return JSONResponse({
            "status": "success",
            "stdout": result.stdout,
            "stderr": result.stderr,
            "return_code": result.returncode
        })
    except subprocess.TimeoutExpired:
        raise HTTPException(status_code=408, detail="Command execution timed out.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# If static web build output exists, mount it
out_dir = os.path.join(os.path.dirname(__file__), "..", "z_ai_web_hud", "out")
if os.path.exists(out_dir):
    app.mount("/", StaticFiles(directory=out_dir, html=True), name="static")

if __name__ == "__main__":
    uvicorn.run("server:app", host="127.0.0.1", port=8000, reload=True)
