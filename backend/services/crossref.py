import logging
import re
# pyrefly: ignore [missing-import]
import httpx
from typing import List
from models import PaperRecord

logger = logging.getLogger("botanic_ai.crossref")
CROSSREF_API_URL = "https://api.crossref.org/works"


def strip_xml_tags(text: str) -> str:
    """Removes JATS XML tags (e.g. <jats:p>, <jats:italic>) from Crossref abstracts."""
    if not text:
        return ""
    clean = re.sub(r"<[^>]+>", "", text)
    return re.sub(r"\s+", " ", clean).strip()


async def search_crossref(query: str, limit: int = 10) -> List[PaperRecord]:
    """
    Queries Crossref REST API across 150M+ registered publications for DOI metadata
    and publisher abstracts relating to botanical pharmacology.
    """
    records: List[PaperRecord] = []
    formatted_query = f"{query} pharmacology phytochemistry bioactive"

    params = {
        "query": formatted_query,
        "rows": min(limit, 15),
        "filter": "has-abstract:true,type:journal-article",
        "select": "DOI,title,abstract,created,container-title,author,URL"
    }

    headers = {
        "User-Agent": "BotanicAI/1.0 (https://botanicai.local; mailto:research@botanicai.local)"
    }

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.get(CROSSREF_API_URL, params=params, headers=headers)
            if resp.status_code != 200:
                logger.warning(f"Crossref returned status code {resp.status_code}: {resp.text[:200]}")
                return []

            data = resp.json()
            items = data.get("message", {}).get("items", [])

            for item in items:
                titles = item.get("title", [])
                title = titles[0] if titles else ""

                abstract_raw = item.get("abstract", "")
                abstract = strip_xml_tags(abstract_raw)

                if len(abstract.strip()) < 40:
                    continue

                doi = item.get("DOI")
                if not doi and not title:
                    continue

                paper_id = doi or f"crossref_{len(records)}"

                # Authors
                authors = []
                for a in item.get("author", []):
                    given = a.get("given", "")
                    family = a.get("family", "")
                    name = f"{given} {family}".strip() or family
                    if name:
                        authors.append(name)

                # Journal & Year
                containers = item.get("container-title", [])
                journal = containers[0] if containers else None

                created = item.get("created", {}).get("date-parts", [[]])
                year = created[0][0] if created and created[0] else None

                url = item.get("URL") or (f"https://doi.org/{doi}" if doi else None)

                records.append(
                    PaperRecord(
                        id=f"crossref_{paper_id}",
                        title=title.strip(),
                        abstract=abstract.strip(),
                        doi=doi,
                        source="Crossref",
                        year=year,
                        journal=journal,
                        authors=authors[:5],
                        url=url,
                        is_peer_reviewed=True
                    )
                )

    except Exception as e:
        logger.error(f"Error querying Crossref for '{query}': {e}", exc_info=True)

    return records
