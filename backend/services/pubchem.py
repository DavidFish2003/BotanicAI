import logging
import httpx
from typing import Optional, Dict, Any
from models import CompoundDetail

logger = logging.getLogger("botanic_ai.pubchem")
PUBCHEM_REST_URL = "https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name"

# Cache for compound details to prevent duplicate PubChem calls
_pubchem_cache: Dict[str, Optional[CompoundDetail]] = {}


async def fetch_compound_detail(compound_name: str) -> Optional[CompoundDetail]:
    """
    Queries NCBI PubChem PUG-REST API to retrieve molecular properties,
    SMILES string, 2D structure image URL, and PubChem link for a compound.
    """
    clean_name = compound_name.strip()
    if not clean_name:
        return None

    cache_key = clean_name.lower()
    if cache_key in _pubchem_cache:
        return _pubchem_cache[cache_key]

    url = f"{PUBCHEM_REST_URL}/{clean_name}/property/MolecularFormula,MolecularWeight,IUPACName,CanonicalSMILES/JSON"
    
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            resp = await client.get(url)
            if resp.status_code != 200:
                logger.debug(f"PubChem lookup for '{clean_name}' returned status {resp.status_code}")
                _pubchem_cache[cache_key] = None
                return None
            
            data = resp.json()
            properties_list = data.get("PropertyTable", {}).get("Properties", [])
            if not properties_list:
                _pubchem_cache[cache_key] = None
                return None
            
            prop = properties_list[0]
            cid = prop.get("CID")
            
            detail = CompoundDetail(
                name=clean_name,
                cid=cid,
                molecular_formula=prop.get("MolecularFormula"),
                molecular_weight=float(prop.get("MolecularWeight")) if prop.get("MolecularWeight") else None,
                iupac_name=prop.get("IUPACName"),
                smiles=prop.get("CanonicalSMILES"),
                image_url=f"https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/{cid}/PNG" if cid else None,
                pubchem_url=f"https://pubchem.ncbi.nlm.nih.gov/compound/{cid}" if cid else None
            )
            
            _pubchem_cache[cache_key] = detail
            return detail

    except Exception as e:
        logger.warning(f"Error fetching PubChem data for compound '{clean_name}': {e}")
        _pubchem_cache[cache_key] = None
        return None
