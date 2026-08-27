from fastapi import FastAPI
from pydantic import BaseModel
from typing import Optional

app = FastAPI(title="LoanSphere AI Service")

class EligibilityRequest(BaseModel):
    salary: float
    age: int
    occupation: str
    existing_loans: int
    requested_amount: float

@app.get("/")
def read_root():
    return {"message": "LoanSphere AI Service is running"}

@app.post("/predict/eligibility")
def predict_eligibility(req: EligibilityRequest):
    # Placeholder logic for AI prediction
    score = 0.85
    eligible = True
    if req.salary < 20000 or req.existing_loans > 3:
        eligible = False
        score = 0.3
    
    return {
        "eligible": eligible,
        "confidence_score": score,
        "message": "Eligible for loan" if eligible else "Not eligible due to risk factors"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
