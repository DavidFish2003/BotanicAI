import httpx
import json

base_url = 'http://127.0.0.1:8000'

def test_all():
    print('=== 1. Health Check ===')
    health_res = httpx.get(f'{base_url}/api/health')
    print('Status:', health_res.status_code)
    print(json.dumps(health_res.json(), indent=2))
    assert health_res.status_code == 200

    print('\n=== 2. Filters Check ===')
    filter_res = httpx.get(f'{base_url}/api/filters')
    print('Status:', filter_res.status_code)
    data_filt = filter_res.json()
    print('Plant parts:', data_filt.get('plant_parts'))
    print('Bioactivities count:', len(data_filt.get('bioactivities', [])))
    assert filter_res.status_code == 200

    print('\n=== 3. Search Check: Rosmarinus officinalis ===')
    search_res = httpx.post(f'{base_url}/api/search', json={'query': 'Rosmarinus officinalis', 'limit': 10}, timeout=30.0)
    print('Status:', search_res.status_code)
    data = search_res.json()
    print('Query:', data['query'])
    print('Total papers found:', data['total_papers_found'])
    print('Total cards generated:', data['total_cards'])
    print('Execution time:', data['execution_time_ms'], 'ms')
    for i, card in enumerate(data['cards']):
        print(f"\n  Card {i+1}: {card['plant_name']} - Tissue: {card['plant_part']}")
        print(f"    - Bioactivities: {card['bioactivities']}")
        print(f"    - Compounds: {card['bioactive_compounds']}")
        print(f"    - Papers Count: {card['paper_count']}")
        print(f"    - Confidence: {card['confidence_score']}")
    assert search_res.status_code == 200
    assert len(data['cards']) > 0

    print('\n=== 4. Search Check: Curcuma longa ===')
    search_res2 = httpx.post(f'{base_url}/api/search', json={'query': 'Curcuma longa', 'limit': 10}, timeout=30.0)
    print('Status:', search_res2.status_code)
    data2 = search_res2.json()
    print('Found papers:', data2['total_papers_found'])
    print('Cards:', len(data2['cards']))
    if data2['cards']:
        print('Curcuma card sample:', data2['cards'][0]['plant_name'], data2['cards'][0]['plant_part'], data2['cards'][0]['bioactive_compounds'])
    assert search_res2.status_code == 200

    print('\n=== ALL TESTS COMPLETED SUCCESSFULLY! ===')

if __name__ == '__main__':
    test_all()
