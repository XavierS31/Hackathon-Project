#!/usr/bin/env python3
"""
Debug KnightConnect Scraper
Analyzes the actual structure of KnightConnect to find the best extraction method
"""

import requests
from bs4 import BeautifulSoup
import json
import re
from datetime import datetime

def debug_knightconnect():
    """Debug the actual structure of KnightConnect"""
    try:
        print("🔍 Debugging KnightConnect structure...")
        
        session = requests.Session()
        session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Accept-Encoding': 'gzip, deflate',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1'
        })
        
        response = session.get('https://knightconnect.campuslabs.com/engage/events', timeout=30)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.content, 'html.parser')
        
        print(f"📊 Page loaded successfully (Status: {response.status_code})")
        print(f"📊 Page size: {len(response.content)} bytes")
        
        # 1. Check for JSON-LD structured data
        print("\n🔍 Checking for JSON-LD structured data...")
        json_scripts = soup.find_all('script', type='application/ld+json')
        print(f"📊 Found {len(json_scripts)} JSON-LD scripts")
        for i, script in enumerate(json_scripts[:3]):  # Show first 3
            try:
                data = json.loads(script.string)
                print(f"  Script {i+1}: {type(data)} - {list(data.keys()) if isinstance(data, dict) else 'List'}")
            except:
                print(f"  Script {i+1}: Invalid JSON")
        
        # 2. Check for data attributes
        print("\n🔍 Checking for data attributes...")
        data_attrs = []
        for attr in ['data-event', 'data-event-id', 'data-event-title', 'data-testid']:
            elements = soup.find_all(attrs={attr: True})
            if elements:
                data_attrs.append(f"{attr}: {len(elements)} elements")
        print(f"📊 Data attributes: {data_attrs if data_attrs else 'None found'}")
        
        # 3. Check for common CSS classes
        print("\n🔍 Checking for common CSS classes...")
        css_classes = []
        for class_pattern in ['event', 'card', 'item', 'listing']:
            elements = soup.find_all(class_=re.compile(class_pattern, re.I))
            if elements:
                css_classes.append(f"{class_pattern}: {len(elements)} elements")
        print(f"📊 CSS classes: {css_classes if css_classes else 'None found'}")
        
        # 4. Check for text content patterns
        print("\n🔍 Checking for text content patterns...")
        all_text = soup.get_text()
        lines = [line.strip() for line in all_text.split('\n') if line.strip()]
        
        event_keywords = ['event', 'meeting', 'workshop', 'seminar', 'conference']
        keyword_matches = []
        for keyword in event_keywords:
            matches = [line for line in lines if keyword.lower() in line.lower()]
            if matches:
                keyword_matches.append(f"{keyword}: {len(matches)} matches")
        print(f"📊 Text patterns: {keyword_matches if keyword_matches else 'None found'}")
        
        # 5. Show sample HTML structure
        print("\n🔍 Sample HTML structure...")
        body = soup.find('body')
        if body:
            # Find the main content area
            main_content = body.find(['main', 'div'], class_=re.compile(r'content|main|container', re.I))
            if main_content:
                print(f"📊 Main content area: {main_content.name} with classes: {main_content.get('class', [])}")
                # Show first few child elements
                children = main_content.find_all(['div', 'article', 'section'], limit=5)
                for i, child in enumerate(children):
                    print(f"  Child {i+1}: {child.name} - classes: {child.get('class', [])}")
            else:
                print("📊 No main content area found")
        
        # 6. Check for JavaScript variables
        print("\n🔍 Checking for JavaScript variables...")
        script_tags = soup.find_all('script')
        js_vars = []
        for script in script_tags:
            if script.string:
                content = script.string
                if 'event' in content.lower() and ('var ' in content or 'const ' in content or 'let ' in content):
                    # Look for variable assignments
                    lines = content.split('\n')
                    for line in lines[:10]:  # Check first 10 lines
                        if 'event' in line.lower() and ('=' in line or ':' in line):
                            js_vars.append(line.strip()[:100])
                            break
        print(f"📊 JavaScript variables: {js_vars[:3] if js_vars else 'None found'}")
        
        # 7. Check for meta tags
        print("\n🔍 Checking for meta tags...")
        meta_tags = soup.find_all('meta')
        relevant_meta = []
        for meta in meta_tags:
            if meta.get('name') and 'event' in meta.get('name', '').lower():
                relevant_meta.append(f"{meta.get('name')}: {meta.get('content', '')[:50]}")
        print(f"📊 Meta tags: {relevant_meta if relevant_meta else 'None found'}")
        
        print("\n✅ Debug analysis complete!")
        return True
        
    except Exception as e:
        print(f"❌ Error during debug: {str(e)}")
        return False

if __name__ == '__main__':
    debug_knightconnect()
