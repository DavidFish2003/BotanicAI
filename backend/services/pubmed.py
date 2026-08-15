import os
import logging
import xml.etree.ElementTree as ET
from typing import List, Optional
import httpx
from models import PaperRecord

logger = logging.getLogger("botanic_ai.pubmed")

ESEARCH_URL = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi"
EFETCH_URL = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi"


async def search_pubmed(query: str, limit: int = 15) -> List[PaperRecord]:
    """
    Searches PubMed using NCBI E-utilities (esearch + efetch in XML)
    for botanical pharmacology & phytochemical research.
    """
    records: List[PaperRecord] = []
    ncbi_api_key = os.getenv("NCBI_API_KEY", "").strip()

    search_term = f'("{query}"[Title/Abstract]) AND (pharmacology[Title/Abstract] OR "bioactive compounds"[Title/Abstract] OR phytochemistry[Title/Abstract] OR "plant extract"[Title/Abstract])'

    params = {
        "db": "pubmed",
        "term": search_term,
        "retmode": "json",
        "retmax": min(limit, 20),
        "sort": "relevance"
    }
    if ncbi_api_key:
        params["api_key"] = ncbi_api_key

    headers = {
        "User-Agent": "BotanicAI/1.2 (mailto:research@botanicai.local)"
    }

    try:
        async with httpx.AsyncClient(timeout=12.0) as client:
            # Step 1: ESearch to get PubMed IDs (PMIDs)
            search_resp = await client.get(ESEARCH_URL, params=params, headers=headers)
            if search_resp.status_code != 200:
                logger.warning(f"PubMed ESearch failed with code {search_resp.status_code}")
                return []

            search_data = search_resp.json()
            id_list = search_data.get("esearchresult", {}).get("idlist", [])
            if not id_list:
                return []

            # Step 2: EFetch to get detailed XML metadata & abstracts
            fetch_params = {
                "db": "pubmed",
                "id": ",".join(id_list),
                "retmode": "xml"
            }
            if ncbi_api_key:
                fetch_params["api_key"] = ncbi_api_key

            fetch_resp = await client.get(EFETCH_URL, params=fetch_params, headers=headers)
            if fetch_resp.status_code != 200:
                logger.warning(f"PubMed EFetch failed with code {fetch_resp.status_code}")
                return []

            # Step 3: Parse XML
            xml_text = fetch_resp.text
            root = ET.fromstring(xml_text)

            for article in root.findall(".//PubmedArticle"):
                try:
                    medline = article.find(".//MedlineCitation")
                    if medline is None:
                        continue

                    pmid_elem = medline.find(".//PMID")
                    pmid = pmid_elem.text if pmid_elem is not None else ""

                    article_elem = medline.find(".//Article")
                    if article_elem is None:
                        continue

                    # Title
                    title_elem = article_elem.find(".//ArticleTitle")
                    title = "".join(title_elem.itertext()) if title_elem is not None else ""

                    # Abstract
                    abstract_elem = article_elem.find(".//Abstract")
                    if abstract_elem is None:
                        continue
                    
                    abstract_parts = []
                    for text_node in abstract_elem.findall(".//AbstractText"):
                        label = text_node.get("Label")
                        part_text = "".join(text_node.itertext()).strip()
                        if label:
                            abstract_parts.append(f"{label}: {part_text}")
                        else:
                            abstract_parts.append(part_text)
                    abstract = " ".join(abstract_parts).strip()

                    if len(abstract) < 50:
                        continue

                    # DOI
                    doi = None
                    article_ids = article.findall(".//ArticleIdList/ArticleId")
                    for aid in article_ids:
                        if aid.get("IdType") == "doi":
                            doi = aid.text.strip() if aid.text else None
                            break

                    # Journal
                    journal_elem = article_elem.find(".//Journal/Title")
                    journal = journal_elem.text if journal_elem is not None else None

                    # Year
                    year = None
                    pub_date = article_elem.find(".//Journal/JournalIssue/PubDate")
                    if pub_date is not None:
                        year_elem = pub_date.find(".//Year")
                        if year_elem is not None and year_elem.text:
                            try:
                                year = int(year_elem.text.strip()[:4])
                            except ValueError:
                                pass

                    # Authors
                    authors = []
                    for author in article_elem.findall(".//AuthorList/Author"):
                        last_name = author.find(".//LastName")
                        fore_name = author.find(".//ForeName")
                        if last_name is not None and last_name.text:
                            fn = fore_name.text if fore_name is not None and fore_name.text else ""
                            authors.append(f"{last_name.text} {fn}".strip())

                    url = f"https://pubmed.ncbi.nlm.nih.gov/{pmid}/" if pmid else (f"https://doi.org/{doi}" if doi else None)

                    records.append(
                        PaperRecord(
                            id=f"pmid_{pmid}" if pmid else f"pubmed_{len(records)}",
                            title=title.strip(),
                            abstract=abstract.strip(),
                            doi=doi,
                            source="PubMed",
                            year=year,
                            journal=journal,
                            authors=authors[:5],
                            url=url,
                            is_peer_reviewed=True
                        )
                    )
                except Exception as parse_err:
                    logger.debug(f"Skipping malformed PubmedArticle: {parse_err}")

    except Exception as e:
        logger.error(f"Error querying PubMed for '{query}': {e}", exc_info=True)

    return records
