from fastapi import FastAPI, APIRouter, HTTPException, Depends, Response
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone
import jwt
import io
import csv

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT Configuration
JWT_SECRET = os.environ['JWT_SECRET']
JWT_ALGORITHM = "HS256"
ADMIN_PASSWORD = os.environ['ADMIN_PASSWORD']

security = HTTPBearer()

# Create the main app
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# ==================== Models ====================

class RSVPCreate(BaseModel):
    full_name: str
    attending_events: List[str]  # ["reception", "muhurtham"]
    guest_status: str  # "solo" or "plus_one"
    plus_one_name: Optional[str] = None

class RSVPResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    full_name: str
    attending_events: List[str]
    guest_status: str
    plus_one_name: Optional[str] = None
    timestamp: str

class AdminLogin(BaseModel):
    password: str

class TokenResponse(BaseModel):
    token: str

class RSVPStats(BaseModel):
    total_rsvps: int
    total_guests: int
    reception_count: int
    muhurtham_count: int

# ==================== Helper Functions ====================

def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        if payload.get("role") != "admin":
            raise HTTPException(status_code=403, detail="Invalid token")
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

# ==================== Public Routes ====================

@api_router.get("/")
async def root():
    return {"message": "Harsha & Spoorthi Wedding RSVP API"}

@api_router.post("/rsvp", response_model=RSVPResponse)
async def create_rsvp(rsvp: RSVPCreate):
    """Create a new RSVP"""
    rsvp_id = str(uuid.uuid4())
    timestamp = datetime.now(timezone.utc).isoformat()
    
    doc = {
        "id": rsvp_id,
        "full_name": rsvp.full_name,
        "attending_events": rsvp.attending_events,
        "guest_status": rsvp.guest_status,
        "plus_one_name": rsvp.plus_one_name if rsvp.guest_status == "plus_one" else None,
        "timestamp": timestamp
    }
    
    await db.rsvps.insert_one(doc)
    
    return RSVPResponse(
        id=rsvp_id,
        full_name=rsvp.full_name,
        attending_events=rsvp.attending_events,
        guest_status=rsvp.guest_status,
        plus_one_name=doc["plus_one_name"],
        timestamp=timestamp
    )

# ==================== Admin Routes ====================

@api_router.post("/admin/login", response_model=TokenResponse)
async def admin_login(login: AdminLogin):
    """Admin login with password"""
    if login.password != ADMIN_PASSWORD:
        raise HTTPException(status_code=401, detail="Invalid password")
    
    token = jwt.encode(
        {
            "role": "admin",
            "exp": datetime.now(timezone.utc).timestamp() + 86400  # 24 hours
        },
        JWT_SECRET,
        algorithm=JWT_ALGORITHM
    )
    
    return TokenResponse(token=token)

@api_router.get("/admin/rsvps", response_model=List[RSVPResponse])
async def get_all_rsvps(payload: dict = Depends(verify_token)):
    """Get all RSVPs (admin only)"""
    rsvps = await db.rsvps.find({}, {"_id": 0}).sort("timestamp", -1).to_list(1000)
    return rsvps

@api_router.get("/admin/stats", response_model=RSVPStats)
async def get_rsvp_stats(payload: dict = Depends(verify_token)):
    """Get RSVP statistics (admin only)"""
    rsvps = await db.rsvps.find({}, {"_id": 0}).to_list(1000)
    
    total_rsvps = len(rsvps)
    total_guests = total_rsvps + sum(1 for r in rsvps if r.get("guest_status") == "plus_one" and r.get("plus_one_name"))
    reception_count = sum(1 for r in rsvps if "reception" in r.get("attending_events", []))
    muhurtham_count = sum(1 for r in rsvps if "muhurtham" in r.get("attending_events", []))
    
    return RSVPStats(
        total_rsvps=total_rsvps,
        total_guests=total_guests,
        reception_count=reception_count,
        muhurtham_count=muhurtham_count
    )

@api_router.get("/admin/export-csv")
async def export_csv(payload: dict = Depends(verify_token)):
    """Export RSVPs as CSV (admin only)"""
    rsvps = await db.rsvps.find({}, {"_id": 0}).sort("timestamp", -1).to_list(1000)
    
    output = io.StringIO()
    writer = csv.writer(output)
    
    # Header
    writer.writerow(["ID", "Timestamp", "Primary Guest", "Events Selected", "Guest Status", "Plus One Name"])
    
    # Data rows
    for rsvp in rsvps:
        writer.writerow([
            rsvp.get("id", ""),
            rsvp.get("timestamp", ""),
            rsvp.get("full_name", ""),
            ", ".join(rsvp.get("attending_events", [])),
            rsvp.get("guest_status", ""),
            rsvp.get("plus_one_name", "") or ""
        ])
    
    output.seek(0)
    
    return Response(
        content=output.getvalue(),
        media_type="text/csv",
        headers={
            "Content-Disposition": "attachment; filename=wedding_rsvps.csv"
        }
    )

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
