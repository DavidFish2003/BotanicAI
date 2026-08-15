from typing import Dict, Any, Optional

BOTANICAL_TAXONOMY: Dict[str, Dict[str, Any]] = {
    "rosmarinus officinalis": {
        "scientific_name": "Salvia rosmarinus (syn. Rosmarinus officinalis)",
        "family": "Lamiaceae",
        "common_names": ["Rosemary", "Romero", "Encens"],
        "parts": ["Leaf", "Essential oil", "Aerial parts"],
        "primary_bioactivities": ["Antioxidant", "Anti-inflammatory", "Antimicrobial", "Neuroprotective"],
        "key_compounds": ["Rosmarinic acid", "Carnosic acid", "Carnosol", "Ursolic acid", "1,8-Cineole", "Alpha-pinene", "Camphor"]
    },
    "curcuma longa": {
        "scientific_name": "Curcuma longa L.",
        "family": "Zingiberaceae",
        "common_names": ["Turmeric", "Haridra", "Curcuma"],
        "parts": ["Rhizome", "Root", "Essential oil"],
        "primary_bioactivities": ["Anti-inflammatory", "Antioxidant", "Anticancer", "Hepatoprotective", "Neuroprotective"],
        "key_compounds": ["Curcumin", "Demethoxycurcumin", "Bisdemethoxycurcumin", "Turmerone", "Zingiberene"]
    },
    "ginkgo biloba": {
        "scientific_name": "Ginkgo biloba L.",
        "family": "Ginkgoaceae",
        "common_names": ["Maidenhair tree", "Ginkgo", "Yin Xing"],
        "parts": ["Leaf", "Seed"],
        "primary_bioactivities": ["Neuroprotective", "Antioxidant", "Cardioprotective", "Vasorelaxant"],
        "key_compounds": ["Ginkgolide A", "Ginkgolide B", "Bilobalide", "Quercetin", "Kaempferol", "Isorhamnetin"]
    },
    "panax ginseng": {
        "scientific_name": "Panax ginseng C.A. Mey.",
        "family": "Araliaceae",
        "common_names": ["Korean Ginseng", "Asian Ginseng", "Ren Shen"],
        "parts": ["Root", "Rhizome", "Berry"],
        "primary_bioactivities": ["Immunomodulatory", "Neuroprotective", "Antioxidant", "Antidiabetic", "Cardioprotective"],
        "key_compounds": ["Ginsenoside Rg1", "Ginsenoside Rb1", "Ginsenoside Rg3", "Panaxadiol", "Panaxatriol"]
    },
    "withania somnifera": {
        "scientific_name": "Withania somnifera (L.) Dunal",
        "family": "Solanaceae",
        "common_names": ["Ashwagandha", "Indian Ginseng", "Winter Cherry"],
        "parts": ["Root", "Leaf", "Whole plant"],
        "primary_bioactivities": ["Neuroprotective", "Anti-inflammatory", "Immunomodulatory", "Anxiolytic / Sedative", "Anticancer"],
        "key_compounds": ["Withaferin A", "Withanolide A", "Withanolide D", "Withanoside IV", "Sitoindosides"]
    },
    "echinacea purpurea": {
        "scientific_name": "Echinacea purpurea (L.) Moench",
        "family": "Asteraceae",
        "common_names": ["Purple Coneflower", "Echinacea"],
        "parts": ["Root", "Aerial parts", "Flower"],
        "primary_bioactivities": ["Immunomodulatory", "Antiviral", "Anti-inflammatory", "Antimicrobial", "Wound healing"],
        "key_compounds": ["Cichoric acid", "Echinacoside", "Alkamides", "Polysaccharides", "Caftaric acid"]
    },
    "zingiber officinale": {
        "scientific_name": "Zingiber officinale Roscoe",
        "family": "Zingiberaceae",
        "common_names": ["Ginger", "Adrak", "Zenzero"],
        "parts": ["Rhizome", "Essential oil"],
        "primary_bioactivities": ["Anti-inflammatory", "Gastroprotective", "Analgesic", "Antioxidant", "Antiemetic"],
        "key_compounds": ["6-Gingerol", "6-Shogaol", "Zingiberene", "Curcumene", "Beta-bisabolene"]
    },
    "lavandula angustifolia": {
        "scientific_name": "Lavandula angustifolia Mill.",
        "family": "Lamiaceae",
        "common_names": ["English Lavender", "True Lavender"],
        "parts": ["Flower", "Essential oil", "Aerial parts"],
        "primary_bioactivities": ["Anxiolytic / Sedative", "Antimicrobial", "Anti-inflammatory", "Antioxidant", "Analgesic"],
        "key_compounds": ["Linalool", "Linalyl acetate", "Lavandulyl acetate", "Terpinen-4-ol", "Beta-ocimene"]
    },
    "artemisia annua": {
        "scientific_name": "Artemisia annua L.",
        "family": "Asteraceae",
        "common_names": ["Sweet Wormwood", "Qinghao", "Sweet Annie"],
        "parts": ["Leaf", "Aerial parts", "Essential oil"],
        "primary_bioactivities": ["Antiviral", "Anticancer", "Anti-inflammatory", "Antioxidant"],
        "key_compounds": ["Artemisinin", "Arteannuin B", "Scopoletin", "Chrysosplenetin", "Artemisinic acid"]
    },
    "salvia miltiorrhiza": {
        "scientific_name": "Salvia miltiorrhiza Bunge",
        "family": "Lamiaceae",
        "common_names": ["Danshen", "Red Sage", "Chinese Salvia"],
        "parts": ["Root", "Rhizome"],
        "primary_bioactivities": ["Cardioprotective", "Anti-inflammatory", "Antioxidant", "Neuroprotective", "Hepatoprotective"],
        "key_compounds": ["Tanshinone IIA", "Cryptotanshinone", "Salvianolic acid B", "Salvianolic acid A", "Danshensu"]
    }
}

def lookup_taxonomy(query: str) -> Optional[Dict[str, Any]]:
    query_clean = query.strip().lower()
    for key, data in BOTANICAL_TAXONOMY.items():
        if key in query_clean or query_clean in key:
            return data
        for cname in data["common_names"]:
            if cname.lower() in query_clean or query_clean in cname.lower():
                return data
    return None
