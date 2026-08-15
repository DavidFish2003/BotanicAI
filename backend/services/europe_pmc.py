import logging
import httpx
from typing import List
from models import PaperRecord

logger = logging.getLogger("botanic_ai.europe_pmc")
EUROPE_PMC_API_URL = "https://www.ebi.ac.uk/europepmc/webservices/rest/search"


async def search_europe_pmc(query: str, limit: int = 15) -> List[PaperRecord]:
    """
    Queries Europe PMC REST API for scientific literature relating to botanical pharmacology.
    Europe PMC aggregates PubMed, PMC full-text, and open-access life science articles.
    """
    records: List[PaperRecord] = []
    formatted_query = f'"{query}" AND (pharmacology OR phytochemistry OR "bioactive compounds" OR "plant extract") HAS_ABSTRACT:Y'
    
    params = {
        "query": formatted_query,
        "format": "json",
        "pageSize": min(limit, 25),
        "resultType": "core",
        "synonym": "true"
    }

    headers = {
        "User-Agent": "BotanicAI/1.0 (https://botanicai.local; mailto:research@botanicai.local)"
    }

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.get(EUROPE_PMC_API_URL, params=params, headers=headers)
            if resp.status_code != 200:
                logger.warning(f"Europe PMC returned status code {resp.status_code}: {resp.text[:200]}")
                return []
            
            data = resp.json()
            results = data.get("resultList", {}).get("result", [])
            
            for item in results:
                title = item.get("title") or ""
                abstract = item.get("abstractText") or ""
                
                if len(abstract.strip()) < 40:
                    continue
                
                doi = item.get("doi")
                paper_id = item.get("id") or item.get("pmid") or f"epmc_{doi}"
                
                author_string = item.get("authorString", "")
                authors = [a.strip() for a in author_string.split(",") if a.strip()][:5]
                
                journal = item.get("journalTitle") or item.get("journalInfo", {}).get("journal", {}).get("title")
                year_str = item.get("pubYear")
                year = int(year_str) if year_str and year_str.isdigit() else None
                
                landing_url = f"https://europepmc.org/article/{item.get('source', 'MED')}/{paper_id}" if paper_id else (f"https://doi.org/{doi}" if doi else None)
                
                records.append(
                    PaperRecord(
                        id=f"epmc_{paper_id}",
                        title=title.strip(),
                        abstract=abstract.strip(),
                        doi=doi,
                        source="Europe PMC",
                        year=year,
                        journal=journal,
                        authors=authors,
                        url=landing_url,
                        is_peer_reviewed=True
                    )
                )
                
    except Exception as e:
        logger.error(f"Error querying Europe PMC for '{query}': {e}", exc_info=True)

    return records
