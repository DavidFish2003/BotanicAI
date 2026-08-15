import logging
import httpx
from typing import List
from models import PaperRecord

logger = logging.getLogger("botanic_ai.semantic_scholar")
S2_API_URL = "https://api.semanticscholar.org/graph/v1/paper/search"


async def search_semantic_scholar(query: str, limit: int = 10) -> List[PaperRecord]:
    """
    Queries Semantic Scholar Graph API (Allen Institute for AI) for scholarly works
    relating to botanical pharmacology and phytochemistry.
    """
    records: List[PaperRecord] = []
    formatted_query = f"{query} pharmacology OR phytochemistry OR bioactive"

    params = {
        "query": formatted_query,
        "limit": min(limit, 15),
        "fields": "title,abstract,authors,year,journal,externalIds,url,isOpenAccess,publicationTypes"
    }

    headers = {
        "User-Agent": "BotanicAI/1.2 (https://botanicai.local; mailto:research@botanicai.local)"
    }

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.get(S2_API_URL, params=params, headers=headers)
            if resp.status_code != 200:
                logger.warning(f"Semantic Scholar returned status code {resp.status_code}: {resp.text[:200]}")
                return []

            data = resp.json()
            results = data.get("data", [])

            for item in results:
                title = item.get("title") or ""
                abstract = item.get("abstract") or ""

                if len(abstract.strip()) < 40:
                    continue

                ext_ids = item.get("externalIds") or {}
                doi = ext_ids.get("DOI")
                pmid = ext_ids.get("PubMed")
                paper_id = item.get("paperId") or pmid or f"s2_{doi}"

                authors_raw = item.get("authors") or []
                authors = [a.get("name", "").strip() for a in authors_raw if a.get("name")][:5]

                journal_info = item.get("journal") or {}
                journal = journal_info.get("name") if isinstance(journal_info, dict) else None
                year = item.get("year")

                url = item.get("url") or (f"https://doi.org/{doi}" if doi else None)
                pub_types = item.get("publicationTypes") or []
                is_peer_reviewed = "Preprint" not in pub_types

                records.append(
                    PaperRecord(
                        id=f"s2_{paper_id}",
                        title=title.strip(),
                        abstract=abstract.strip(),
                        doi=doi,
                        source="Semantic Scholar",
                        year=year,
                        journal=journal,
                        authors=authors,
                        url=url,
                        is_peer_reviewed=is_peer_reviewed
                    )
                )

    except Exception as e:
        logger.error(f"Error querying Semantic Scholar for '{query}': {e}", exc_info=True)

    return records
