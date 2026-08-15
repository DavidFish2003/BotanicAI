import os
import re
import json
import logging
import asyncio
from typing import List, Optional, Dict, Any
from models import PaperRecord, PhytoExtraction

logger = logging.getLogger("botanic_ai.llm_extractor")

# Botanical parts taxonomy
PLANT_PARTS = [
    ("aerial part", "Aerial Parts"),
    ("aerial parts", "Aerial Parts"),
    ("rhizome", "Rhizome"),
    ("rhizomes", "Rhizome"),
    ("leaf", "Leaf"),
    ("leaves", "Leaf"),
    ("root", "Root"),
    ("roots", "Root"),
    ("bark", "Bark"),
    ("barks", "Bark"),
    ("seed", "Seed"),
    ("seeds", "Seed"),
    ("flower", "Flower"),
    ("flowers", "Flower"),
    ("floral", "Flower"),
    ("stem", "Stem"),
    ("stems", "Stem"),
    ("fruit", "Fruit"),
    ("fruits", "Fruit"),
    ("bulb", "Bulb"),
    ("bulbs", "Bulb"),
    ("resin", "Resin"),
    ("wood", "Wood"),
    ("berry", "Fruit"),
    ("berries", "Fruit"),
    ("whole plant", "Whole Plant"),
    ("entire plant", "Whole Plant"),
]

# Pharmacological Bioactivity taxonomy with synonyms
BIOACTIVITIES_MAP = {
    "antioxidant": "Antioxidant",
    "anti-oxidant": "Antioxidant",
    "free radical scavenging": "Antioxidant",
    "dpph": "Antioxidant",
    "anti-inflammatory": "Anti-inflammatory",
    "antiinflammatory": "Anti-inflammatory",
    "inflammation": "Anti-inflammatory",
    "antimicrobial": "Antimicrobial",
    "antibacterial": "Antibacterial",
    "anti-bacterial": "Antibacterial",
    "antifungal": "Antifungal",
    "anti-fungal": "Antifungal",
    "antiviral": "Antiviral",
    "anti-viral": "Antiviral",
    "neuroprotective": "Neuroprotective",
    "neuroprotection": "Neuroprotective",
    "hepatoprotective": "Hepatoprotective",
    "liver protective": "Hepatoprotective",
    "cytotoxic": "Cytotoxic",
    "anticancer": "Anticancer / Cytotoxic",
    "anti-cancer": "Anticancer / Cytotoxic",
    "antitumor": "Anticancer / Cytotoxic",
    "antiproliferative": "Anticancer / Cytotoxic",
    "analgesic": "Analgesic",
    "antinociceptive": "Analgesic",
    "pain relief": "Analgesic",
    "antidiabetic": "Antidiabetic",
    "hypoglycemic": "Antidiabetic",
    "cardioprotective": "Cardioprotective",
    "cardiovascular": "Cardioprotective",
    "immunomodulatory": "Immunomodulatory",
    "immunostimulatory": "Immunomodulatory",
    "gastroprotective": "Gastroprotective",
    "antiulcer": "Gastroprotective",
    "anxiolytic": "Anxiolytic / Sedative",
    "sedative": "Anxiolytic / Sedative",
    "wound healing": "Wound Healing",
    "wound-healing": "Wound Healing",
    "anti-allergic": "Antiallergic",
    "antiallergic": "Antiallergic",
    "antihypertensive": "Antihypertensive",
    "hypolipidemic": "Hypolipidemic",
    "cholesterol-lowering": "Hypolipidemic",
}

# Phytochemical compound patterns and common phytomolecules
KNOWN_PHYTOCHEMICALS = [
    # Phenolics & Flavonoids
    "quercetin", "rutin", "kaempferol", "luteolin", "apigenin", "myricetin", "hesperidin", "naringenin",
    "epicatechin", "catechin", "epigallocatechin gallate", "egcg", "resveratrol", "genistein", "daidzein",
    "chlorogenic acid", "caffeic acid", "ferulic acid", "gallic acid", "ellagic acid", "rosmarinic acid",
    "carnosic acid", "carnosol", "salicylic acid", "syringic acid", "vanillic acid", "coumaric acid",
    # Terpenoids & Volatiles
    "curcumin", "demethoxycurcumin", "bisdemethoxycurcumin", "thymol", "carvacrol", "eugenol", "menthol",
    "cineole", "eucalyptol", "limonene", "pinene", "camphor", "linalool", "geraniol", "terpineol",
    "artemisinin", "paclitaxel", "ursolic acid", "oleanolic acid", "betulinic acid", "boswellic acid",
    "ginsenosides", "withanolides", "withaferin a", "andrographolide", "tannins", "proanthocyanidins",
    # Alkaloids
    "berberine", "piperine", "capsaicin", "caffeine", "theobromine", "morphine", "codeine", "quinine",
    "atropine", "scopolamine", "ephedrine", "colchicine", "vincristine", "vinblastine", "emetine",
    # Saponins & Glycosides
    "saponins", "glycyrrhizin", "glycyrrhetinic acid", "salicin", "hypericin", "pseudohypericin",
    "hyperoside", "baicalin", "baicalein", "wogonin", "silymarin", "silibinin"
]

EXTRACT_PATTERNS = [
    (r"\bessential\s+oil\b", "Essential Oil"),
    (r"\bethanolic\s+extract\b|\bethanol\s+extract\b", "Ethanolic Extract"),
    (r"\bmethanolic\s+extract\b|\bmethanol\s+extract\b", "Methanolic Extract"),
    (r"\baqueous\s+extract\b|\bwater\s+extract\b|\bdecoction\b|\binfusion\b", "Aqueous Extract"),
    (r"\bhydroalcoholic\s+extract\b", "Hydroalcoholic Extract"),
    (r"\bethyl\s+acetate\s+extract\b|\bethyl\s+acetate\s+fraction\b", "Ethyl Acetate Fraction"),
    (r"\bhexane\s+extract\b|\bhexane\s+fraction\b", "Hexane Fraction"),
    (r"\bcrude\s+extract\b", "Crude Extract"),
    (r"\bsupercritical\s+co2\b", "Supercritical CO2 Extract"),
]

MECHANISM_PATTERNS = [
    (r"\b(inhibition of cox-?\d*|inhibit(?:ed|ing)? cyclooxygenase)\b", "COX enzyme inhibition"),
    (r"\b(inhibit(?:ed|ing)? nf-k?b|nf-kappa\s*b suppression)\b", "NF-κB pathway suppression"),
    (r"\b(reactive oxygen species scavenging|ros scavenging|free radical scavenging)\b", "ROS scavenging / redox regulation"),
    (r"\b(apoptosis induction|induced apoptosis|caspase-?\d* activation)\b", "Apoptosis induction in target cells"),
    (r"\b(inhibit(?:ed|ing)? ache|acetylcholinesterase inhibition)\b", "Acetylcholinesterase (AChE) inhibition"),
    (r"\b(inhibit(?:ed|ing)? tnf-alpha|tnf-a reduction)\b", "Pro-inflammatory cytokine (TNF-α/IL-6) down-regulation"),
    (r"\b(membrane disruption|cell wall permeability)\b", "Microbial cell membrane disruption"),
    (r"\b(nitric oxide (?:no) production inhibition|inos down-regulation)\b", "iNOS & Nitric Oxide suppression"),
]


def extract_with_heuristic(record: PaperRecord) -> PhytoExtraction:
    """
    Robust rule-based botanical NLP extraction engine.
    Parses paper title and abstract to accurately identify plant parts,
    bioactivities, phytochemical compounds, extract types, and mechanisms.
    """
    full_text = f"{record.title} {record.abstract}".lower()

    # 1. Identify Plant Part
    detected_part = "Whole Plant"
    for keyword, part_name in PLANT_PARTS:
        # Match word boundaries
        if re.search(rf"\b{re.escape(keyword)}\b", full_text):
            detected_part = part_name
            break

    # 2. Identify Bioactivities
    found_activities = set()
    for keyword, activity_name in BIOACTIVITIES_MAP.items():
        if re.search(rf"\b{re.escape(keyword)}\b", full_text):
            found_activities.add(activity_name)
    
    if not found_activities:
        found_activities.add("Pharmacological Activity")

    # 3. Identify Bioactive Compounds
    found_compounds = set()
    for compound in KNOWN_PHYTOCHEMICALS:
        if re.search(rf"\b{re.escape(compound)}\b", full_text):
            # Capitalize nicely
            found_compounds.add(compound.title())
            
    # Generic regex for phytochemical suffixes (e.g. -oside, -in, -ol, -oid, -ene, -genin)
    generic_compounds = re.findall(r"\b([a-z]{4,}(?:oside|in|flavone|terpene|catechin|genin|loid))\b", full_text)
    for gc in generic_compounds:
        if gc not in {"protein", "origin", "domain", "margin", "contain", "obtain", "remain", "within", "chain", "strain", "brain", "vein", "main"}:
            if len(gc) > 4 and len(found_compounds) < 6:
                found_compounds.add(gc.title())

    # 4. Extract Type
    detected_extract = None
    for pattern, name in EXTRACT_PATTERNS:
        if re.search(pattern, full_text):
            detected_extract = name
            break

    # 5. Mechanisms
    mechanisms = []
    for pattern, name in MECHANISM_PATTERNS:
        if re.search(pattern, full_text):
            mechanisms.append(name)

    confidence = 0.82 if found_compounds and len(found_activities) > 1 else 0.74

    return PhytoExtraction(
        plant_part=detected_part,
        bioactivity=sorted(list(found_activities)),
        bioactive_compounds=sorted(list(found_compounds))[:8],
        confidence_score=round(confidence, 2),
        extraction_method="nlp-heuristic",
        mechanisms_of_action=mechanisms[:3],
        extract_type=detected_extract,
        notes="Extracted via BotanicAI Domain NLP Engine"
    )


async def extract_with_llm(record: PaperRecord, api_key: str) -> PhytoExtraction:
    """
    Extracts structured phytochemistry and pharmacology records using OpenAI GPT-4o-mini.
    Falls back to heuristic parser on failure.
    """
    from openai import AsyncOpenAI
    
    client = AsyncOpenAI(api_key=api_key)

    system_prompt = (
        "You are an expert botanical pharmacologist and phytochemist. "
        "Your task is to analyze scientific research paper abstracts and extract structured phytopharmacological data.\n"
        "Return ONLY a valid JSON object with the following schema:\n"
        "{\n"
        '  "plant_part": "Leaf" | "Root" | "Bark" | "Seed" | "Flower" | "Stem" | "Fruit" | "Rhizome" | "Aerial Parts" | "Whole Plant",\n'
        '  "bioactivity": ["Antioxidant", "Anti-inflammatory", "Antimicrobial", ...],\n'
        '  "bioactive_compounds": ["Quercetin", "Rosmarinic acid", ...],\n'
        '  "extract_type": "Essential Oil" | "Ethanolic Extract" | "Aqueous Extract" | ... or null,\n'
        '  "mechanisms_of_action": ["COX-2 inhibition", "ROS scavenging", ...],\n'
        '  "confidence_score": float between 0.0 and 1.0\n'
        "}"
    )

    user_prompt = f"Title: {record.title}\n\nAbstract:\n{record.abstract}"

    try:
        response = await client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            response_format={"type": "json_object"},
            temperature=0.1,
            max_tokens=500,
            timeout=10.0
        )

        content = response.choices[0].message.content
        if not content:
            return extract_with_heuristic(record)

        data = json.loads(content)
        
        plant_part = data.get("plant_part") or "Whole Plant"
        bioactivity = data.get("bioactivity") or []
        bioactive_compounds = data.get("bioactive_compounds") or []
        confidence_score = float(data.get("confidence_score", 0.92))
        mechanisms = data.get("mechanisms_of_action") or []
        extract_type = data.get("extract_type")

        # Standardize plant_part
        matched_part = "Whole Plant"
        for _, standard_name in PLANT_PARTS:
            if standard_name.lower() == plant_part.lower():
                matched_part = standard_name
                break

        return PhytoExtraction(
            plant_part=matched_part,
            bioactivity=bioactivity if isinstance(bioactivity, list) else [str(bioactivity)],
            bioactive_compounds=bioactive_compounds if isinstance(bioactive_compounds, list) else [str(bioactive_compounds)],
            confidence_score=max(0.1, min(1.0, confidence_score)),
            extraction_method="gpt-4o-mini",
            mechanisms_of_action=mechanisms if isinstance(mechanisms, list) else [],
            extract_type=extract_type,
            notes="Extracted via OpenAI GPT-4o-mini"
        )
    except Exception as e:
        logger.warning(f"OpenAI extraction error ({e}), falling back to NLP heuristic parser.")
        return extract_with_heuristic(record)


async def extract_phyto_data(records: List[PaperRecord]) -> List[PhytoExtraction]:
    """
    Runs batch extraction concurrently across all paper records.
    Uses OpenAI GPT-4o-mini if OPENAI_API_KEY is present, otherwise uses NLP heuristic.
    """
    openai_key = os.getenv("OPENAI_API_KEY", "").strip()
    semaphore = asyncio.Semaphore(5)  # Limit concurrency to 5 parallel tasks

    async def _process_single(record: PaperRecord) -> PhytoExtraction:
        async with semaphore:
            if openai_key:
                return await extract_with_llm(record, openai_key)
            else:
                return extract_with_heuristic(record)

    tasks = [_process_single(rec) for rec in records]
    extractions = await asyncio.gather(*tasks, return_exceptions=False)
    return extractions
