import logging
import httpx
from typing import List
from models import PaperRecord

logger = logging.getLogger("botanic_ai.biorxiv")
EUROPE_PMC_PREPRINT_URL = "https://www.ebi.ac.uk/europepmc/webservices/rest/search"


async def search_biorxiv(query: str, limit: int = 10) -> List[PaperRecord]:
    """
    Queries bioRxiv & medRxiv preprints for early-stage pharmacological and
    phytochemistry findings prior to formal peer-review journal publication.
    """
    records: List[PaperRecord] = []
    formatted_query = f'"{query}" AND (pharmacology OR phytochemistry OR bioactive) AND (SRC:PPR OR PUBLISHER:"bioRxiv" OR PUBLISHER:"medRxiv") HAS_ABSTRACT:Y'

    params = {
        "query": formatted_query,
        "format": "json",
        "pageSize": min(limit, 15),
        "resultType": "core"
    }

    headers = {
        "User-Agent": "BotanicAI/1.3 (https://botanicai.local; mailto:research@botanicai.local)"
    }

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.get(EUROPE_PMC_PREPRINT_URL, params=params, headers=headers)
            if resp.status_code != 200:
                logger.warning(f"bioRxiv search returned status code {resp.status_code}: {resp.text[:200]}")
                return []

            data = resp.json()
            results = data.get("resultList", {}).get("result", [])

            for item in results:
                title = item.get("title") or ""
                abstract = item.get("abstractText") or ""

                if len(abstract.strip()) < 40:
                    continue

                doi = item.get("doi")
                paper_id = item.get("id") or f"biorxiv_{doi}"

                author_string = item.get("authorString", "")
                authors = [a.strip() for a in author_string.split(",") if a.strip()][:5]

                publisher = item.get("bookOrReportDetails", {}).get("publisher") or item.get("journalTitle") or "bioRxiv"
                year_str = item.get("pubYear")
                year = int(year_str) if year_str and year_str.isdigit() else None

                landing_url = f"https://doi.org/{doi}" if doi else f"https://www.biorxiv.org/content/{doi}v1"

                records.append(
                    PaperRecord(
                        id=f"biorxiv_{paper_id}",
                        title=title.strip(),
                        abstract=abstract.strip(),
                        doi=doi,
                        source="bioRxiv / medRxiv",
                        year=year,
                        journal=publisher,
                        authors=authors,
                        url=landing_url,
                        is_peer_reviewed=False
                    )
                )

    except Exception as e:
        logger.error(f"Error querying bioRxiv for '{query}': {e}", exc_info=True)

    return records
