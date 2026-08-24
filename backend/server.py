import os
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse

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
    return JSONResponse({
        "cpu_load": 18.4,
        "temperature_celsius": 42.1,
        "shield_power": 98.6,
        "status": "LISTENING"
    })

# If static web build output exists, mount it
out_dir = os.path.join(os.path.dirname(__file__), "..", "z_ai_web_hud", "out")
if os.path.exists(out_dir):
    app.mount("/", StaticFiles(directory=out_dir, html=True), name="static")

if __name__ == "__main__":
    uvicorn.run("server:app", host="127.0.0.1", port=8000, reload=True)
