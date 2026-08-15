from fastapi import APIRouter
from models import FilterOptions

router = APIRouter(prefix="/api", tags=["Filters"])

STANDARD_PLANT_PARTS = [
    "Leaf",
    "Root",
    "Bark",
    "Seed",
    "Flower",
    "Stem",
    "Fruit",
    "Rhizome",
    "Aerial Parts",
    "Bulb",
    "Whole Plant"
]

STANDARD_BIOACTIVITIES = [
    "Antioxidant",
    "Anti-inflammatory",
    "Antimicrobial",
    "Antibacterial",
    "Antifungal",
    "Antiviral",
    "Neuroprotective",
    "Hepatoprotective",
    "Anticancer / Cytotoxic",
    "Analgesic",
    "Antidiabetic",
    "Cardioprotective",
    "Immunomodulatory",
    "Gastroprotective",
    "Anxiolytic / Sedative",
    "Wound Healing",
    "Antiallergic"
]


@router.get("/filters", response_model=FilterOptions)
async def get_filter_options():
    """Returns available tissue filter options and bioactivity categories."""
    return FilterOptions(
        plant_parts=STANDARD_PLANT_PARTS,
        bioactivities=STANDARD_BIOACTIVITIES
    )
