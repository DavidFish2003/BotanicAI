import re
from typing import List, Dict, Tuple, Optional
from models import PhytoExtraction, PaperRecord

# Comprehensive botanical tissue vocabulary
PLANT_PARTS_MAP: Dict[str, List[str]] = {
    "Leaf": [r"\bleaf\b", r"\bleaves\b", r"\bfolium\b", r"\bfolia\b", r"\bfoliar\b"],
    "Root": [r"\broot\b", r"\broots\b", r"\bradix\b", r"\bradices\b", r"\btuber\b", r"\btubers\b"],
    "Rhizome": [r"\brhizome\b", r"\brhizomes\b", r"\brhizoma\b"],
    "Bark": [r"\bbark\b", r"\bcortex\b", r"\bstem bark\b", r"\broot bark\b"],
    "Flower": [r"\bflower\b", r"\bflowers\b", r"\bfloral\b", r"\bflos\b", r"\bpetal\b", r"\bpetals\b", r"\binflorescence\b"],
    "Seed": [r"\bseed\b", r"\bseeds\b", r"\bsemen\b", r"\bgrain\b"],
    "Fruit": [r"\bfruit\b", r"\bfruits\b", r"\bfructus\b", r"\bberry\b", r"\bberries\b", r"\bpulp\b", r"\bpericarp\b"],
    "Aerial parts": [r"\baerial part\b", r"\baerial parts\b", r"\bherb\b", r"\bherba\b", r"\bshoot\b", r"\bshoots\b"],
    "Stem": [r"\bstem\b", r"\bstems\b", r"\bcaulis\b", r"\btwig\b", r"\btwigs\b"],
    "Essential oil": [r"\bessential oil\b", r"\bessential oils\b", r"\bvolatile oil\b", r"\bvolatile oils\b"],
    "Resin": [r"\bresin\b", r"\bgum\b", r"\bleo-resin\b", r"\bexudate\b"],
    "Whole plant": [r"\bwhole plant\b", r"\bentire plant\b"]
}

# Bioactivity categories with synonym regexes
BIOACTIVITY_MAP: Dict[str, List[str]] = {
    "Antioxidant": [
        r"\bantioxidant\b", r"\bfree radical scavenging\b", r"\bdpph\b", r"\babts\b",
        r"\bfrap\b", r"\bros scavenging\b", r"\blipid peroxidation\b"
    ],
    "Anti-inflammatory": [
        r"\banti-inflammatory\b", r"\bantiinflammatory\b", r"\binflammation\b",
        r"\bcox-2\b", r"\bnf-kb\b", r"\btnf-alpha\b", r"\bil-6\b", r"\binos\b"
    ],
    "Antimicrobial": [
        r"\bantimicrobial\b", r"\bantibacterial\b", r"\bantifungal\b",
        r"\bmic\b", r"\bzone of inhibition\b", r"\bbactericidal\b", r"\bpathogen\b"
    ],
    "Neuroprotective": [
        r"\bneuroprotective\b", r"\bneuroprotection\b", r"\balzheimer\b",
        r"\bacetylcholinesterase\b", r"\bache inhibition\b", r"\bmemory\b", r"\bcognitive\b"
    ],
    "Antidiabetic": [
        r"\bantidiabetic\b", r"\bhypoglycemic\b", r"\bdiabetes\b",
        r"\balpha-glucosidase\b", r"\balpha-amylase\b", r"\binsulin\b", r"\bglucose uptake\b"
    ],
    "Anticancer": [
        r"\banticancer\b", r"\bcytotoxic\b", r"\bcytotoxicity\b", r"\banti-tumor\b",
        r"\bantitumor\b", r"\bapoptosis\b", r"\bmtt assay\b", r"\bantiproliferative\b"
    ],
    "Hepatoprotective": [
        r"\bhepatoprotective\b", r"\bliver protective\b", r"\balt\b", r"\bast\b",
        r"\bhepatotoxicity\b"
    ],
    "Analgesic": [
        r"\banalgesic\b", r"\bantinociceptive\b", r"\bpain relief\b", r"\bwrithing test\b"
    ],
    "Cardioprotective": [
        r"\bcardioprotective\b", r"\bvasorelaxant\b", r"\bhypertension\b", r"\bantihypertensive\b"
    ],
    "Gastroprotective": [
        r"\bgastroprotective\b", r"\banti-ulcer\b", r"\bgastric ulcer\b"
    ],
    "Immunomodulatory": [
        r"\bimmunomodulatory\b", r"\bimmune boosting\b", r"\bimmunostimulatory\b"
    ],
    "Antiviral": [
        r"\bantiviral\b", r"\bvirus\b", r"\bviraemia\b"
    ]
}

# Known botanical phytochemical dictionary for entity recognition
KNOWN_COMPOUNDS = [
    "quercetin", "rosmarinic acid", "carnosic acid", "carnosol", "curcumin",
    "epigallocatechin gallate", "apigenin", "luteolin", "kaempferol", "ursolic acid",
    "oleanolic acid", "chlorogenic acid", "caffeic acid", "gallic acid", "rutin",
    "berberine", "resveratrol", "eugenol", "thymol", "carvacrol", "menthol",
    "1,8-cineole", "eucalyptol", "alpha-pinene", "beta-pinene", "limonene",
    "gingerol", "shogaol", "capsaicin", "ginsenosides", "withanolides",
    "artemisinin", "cannabidiol", "silymarin", "silybin", "piperine",
    "hesperidin", "naringenin", "genistein", "daidzein", "baicalin",
    "baicalein", "chrysin", "ellagic acid", "ferulic acid", "myricetin",
    "tannic acid", "beta-caryophyllene", "linalool", "terpinen-4-ol",
    "andrographolide", "asiaticoside", "madecassoside", "scopoletin",
    "esculetin", "umbelliferone", "mangiferin", "pterostilbene", "hypericin"
]

EXTRACTION_METHODS = [
    (r"\bethanolic extract\b|\bethanol extract\b", "Ethanol extract"),
    (r"\bmethanolic extract\b|\bmethanol extract\b", "Methanol extract"),
    (r"\bhydroalcoholic extract\b|\baqueous-ethanolic\b", "Hydroalcoholic extract"),
    (r"\baqueous extract\b|\bwater extract\b|\bdecoction\b|\binfusion\b", "Aqueous extract"),
    (r"\bessential oil\b|\bhydrodistillation\b|\bsteam distillation\b", "Essential oil / Steam distillation"),
    (r"\bsupercritical co2\b|\bsupercritical fluid\b", "Supercritical CO2 extraction"),
    (r"\bethyl acetate fraction\b|\bethyl acetate extract\b", "Ethyl acetate extract"),
    (r"\bhexane extract\b|\bpetroleum ether extract\b", "Hexane / Non-polar extract")
]

class NLPExtractor:
    def extract_from_paper(self, paper: PaperRecord, plant_query: str) -> Optional[PhytoExtraction]:
        text = f"{paper.title}\n{paper.abstract}"
        text_lower = text.lower()

        # 1. Detect Plant Part / Tissue
        detected_parts: List[Tuple[str, int]] = []
        for part_name, patterns in PLANT_PARTS_MAP.items():
            count = 0
            for pat in patterns:
                matches = re.findall(pat, text_lower)
                count += len(matches)
            if count > 0:
                detected_parts.append((part_name, count))
        
        detected_parts.sort(key=lambda x: x[1], reverse=True)
        primary_part = detected_parts[0][0] if detected_parts else "Aerial parts"

        # 2. Detect Bioactivities
        detected_bioactivities: List[str] = []
        for bio_name, patterns in BIOACTIVITY_MAP.items():
            for pat in patterns:
                if re.search(pat, text_lower):
                    detected_bioactivities.append(bio_name)
                    break
        
        if not detected_bioactivities:
            detected_bioactivities = ["Pharmacological study"]

        # 3. Detect Bioactive Compounds
        detected_compounds: List[str] = []
        # A) Match known compound dictionary
        for comp in KNOWN_COMPOUNDS:
            pat = r"\b" + re.escape(comp) + r"\b"
            if re.search(pat, text_lower):
                detected_compounds.append(comp.title())

        # B) Secondary regex heuristic for chemical names (e.g., xxx-glucoside, xxx-flavone, xxx-acid)
        chem_matches = re.findall(
            r"\b([a-z]{3,15}(?:oside|glycoside|flavone|terpene|lactone|quinine|alkaloid|phenolic acid))\b",
            text_lower
        )
        for chem in chem_matches[:3]:
            title_chem = chem.title()
            if title_chem not in detected_compounds and len(chem) > 4:
                detected_compounds.append(title_chem)

        if not detected_compounds:
            detected_compounds = ["Phytochemical complex / Total polyphenols"]

        # 4. Extraction method
        extraction_method = "Solvent extraction"
        for pat, method_name in EXTRACTION_METHODS:
            if re.search(pat, text_lower):
                extraction_method = method_name
                break

        # 5. Mechanism / evidence snippet
        sentences = re.split(r'(?<=[.!?])\s+', paper.abstract)
        evidence_snippet = None
        for s in sentences:
            s_lower = s.lower()
            if any(b.lower() in s_lower for b in detected_bioactivities) or any(c.lower() in s_lower for c in detected_compounds):
                evidence_snippet = s.strip()
                if len(evidence_snippet) > 40:
                    break

        if not evidence_snippet and len(sentences) > 0:
            evidence_snippet = sentences[-1].strip()

        # 6. Confidence Score Calculation
        score = 0.50
        if detected_parts:
            score += 0.15
        if len(detected_bioactivities) >= 2:
            score += 0.15
        if len(detected_compounds) >= 2:
            score += 0.15
        if paper.doi:
            score += 0.05
        confidence_score = min(0.98, max(0.65, round(score, 2)))

        return PhytoExtraction(
            paper_id=paper.id,
            plant_name=plant_query.title(),
            plant_part=primary_part,
            bioactivity=detected_bioactivities,
            bioactive_compounds=detected_compounds[:8],
            extraction_method=extraction_method,
            confidence_score=confidence_score,
            evidence_snippet=evidence_snippet,
            paper_title=paper.title,
            paper_doi=paper.doi,
            paper_journal=paper.journal,
            paper_year=paper.publication_year,
            source=paper.source
        )

nlp_extractor = NLPExtractor()
