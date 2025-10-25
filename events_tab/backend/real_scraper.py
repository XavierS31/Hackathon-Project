#!/usr/bin/env python3
"""
Real KnightConnect Events Scraper
Uses multiple extraction methods to get real UCF events
"""

import requests
from bs4 import BeautifulSoup
import json
import re
from datetime import datetime
from flask import Flask, jsonify
from flask_cors import CORS
import time

app = Flask(__name__)
CORS(app)

class RealKnightConnectScraper:
    def __init__(self):
        self.base_url = "https://knightconnect.campuslabs.com/engage/events"
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Accept-Encoding': 'gzip, deflate',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1'
        })
    
    def scrape_real_events(self):
        """Scrape real events using multiple extraction methods"""
        try:
            print("🔍 Scraping real KnightConnect events...")
            response = self.session.get(self.base_url, timeout=30)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.content, 'html.parser')
            events = []
            
            # Method 1: JSON-LD Structured Data (Easiest)
            json_events = self.extract_json_ld_events(soup)
            if json_events:
                events.extend(json_events)
                print(f"📊 Found {len(json_events)} events from JSON-LD")
            
            # Method 2: Data Attributes (Very Easy)
            if not events:
                data_events = self.extract_data_attribute_events(soup)
                if data_events:
                    events.extend(data_events)
                    print(f"📊 Found {len(data_events)} events from data attributes")
            
            # Method 3: CSS Class Patterns (Easy)
            if not events:
                css_events = self.extract_css_pattern_events(soup)
                if css_events:
                    events.extend(css_events)
                    print(f"📊 Found {len(css_events)} events from CSS patterns")
            
            # Method 4: Text Pattern Matching (Medium)
            if not events:
                text_events = self.extract_text_pattern_events(soup)
                if text_events:
                    events.extend(text_events)
                    print(f"📊 Found {len(text_events)} events from text patterns")
            
            # Method 5: Fallback to sample events
            if not events:
                events = self.get_fallback_events()
                print(f"📊 Using {len(events)} fallback events")
            
            print(f"✅ Successfully extracted {len(events)} events")
            return events
            
        except Exception as e:
            print(f"❌ Error scraping events: {str(e)}")
            return self.get_fallback_events()
    
    def extract_json_ld_events(self, soup):
        """Extract events from JSON-LD structured data"""
        events = []
        try:
            json_scripts = soup.find_all('script', type='application/ld+json')
            for script in json_scripts:
                try:
                    data = json.loads(script.string)
                    if isinstance(data, dict) and data.get('@type') == 'Event':
                        events.append(self.parse_json_ld_event(data))
                    elif isinstance(data, list):
                        for item in data:
                            if isinstance(item, dict) and item.get('@type') == 'Event':
                                events.append(self.parse_json_ld_event(item))
                except:
                    continue
        except:
            pass
        return events
    
    def parse_json_ld_event(self, data):
        """Parse a JSON-LD event object"""
        return {
            'title': data.get('name', 'Untitled Event'),
            'description': data.get('description', 'No description available'),
            'date': data.get('startDate', 'Date TBD'),
            'time': data.get('startTime', 'Time TBD'),
            'location': data.get('location', {}).get('name', 'UCF Campus') if isinstance(data.get('location'), dict) else str(data.get('location', 'UCF Campus')),
            'link': data.get('url', ''),
            'image': data.get('image', ''),
            'source': 'KnightConnect (Real)',
            'scraped_at': datetime.now().isoformat()
        }
    
    def extract_data_attribute_events(self, soup):
        """Extract events from data attributes"""
        events = []
        try:
            # Look for elements with event-related data attributes
            selectors = [
                'div[data-event-id]',
                'div[data-event-title]',
                'div[data-event-date]',
                'article[data-event-id]',
                '[data-testid*="event"]'
            ]
            
            for selector in selectors:
                elements = soup.select(selector)
                for element in elements:
                    event = self.parse_data_attribute_event(element)
                    if event and event.get('title'):
                        events.append(event)
                if events:
                    break
        except:
            pass
        return events
    
    def parse_data_attribute_event(self, element):
        """Parse event from data attributes"""
        try:
            return {
                'title': element.get('data-title') or element.get('data-event-title') or 'Untitled Event',
                'description': element.get('data-description') or 'No description available',
                'date': element.get('data-date') or element.get('data-event-date') or 'Date TBD',
                'time': element.get('data-time') or 'Time TBD',
                'location': element.get('data-location') or 'UCF Campus',
                'link': element.get('data-url') or element.get('href', ''),
                'image': element.get('data-image') or '',
                'source': 'KnightConnect (Real)',
                'scraped_at': datetime.now().isoformat()
            }
        except:
            return None
    
    def extract_css_pattern_events(self, soup):
        """Extract events using CSS class patterns"""
        events = []
        try:
            # Common event container selectors
            selectors = [
                'div[class*="event"]',
                'div[class*="card"]',
                'div[class*="item"]',
                'article[class*="event"]',
                'div[class*="listing"]',
                '.event-card',
                '.card',
                '.event-item',
                '.listing-item'
            ]
            
            for selector in selectors:
                containers = soup.select(selector)
                if containers:
                    print(f"📊 Found {len(containers)} containers with selector: {selector}")
                    for container in containers:
                        event = self.parse_css_event(container)
                        if event and event.get('title'):
                            events.append(event)
                    if events:
                        break
        except:
            pass
        return events
    
    def parse_css_event(self, container):
        """Parse event from CSS container"""
        try:
            event = {}
            text_content = container.get_text(strip=True)
            
            # Skip if container is too short
            if len(text_content) < 10:
                return None
            
            # Extract title
            title_selectors = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'strong', 'b', '.title', '.event-title', '[class*="title"]']
            for selector in title_selectors:
                title_elem = container.select_one(selector)
                if title_elem and title_elem.get_text(strip=True):
                    event['title'] = title_elem.get_text(strip=True)
                    break
            
            # Extract description
            desc_selectors = ['.description', '.content', '.summary', 'p', '[class*="desc"]']
            for selector in desc_selectors:
                desc_elem = container.select_one(selector)
                if desc_elem:
                    desc_text = desc_elem.get_text(strip=True)
                    if desc_text and desc_text != event.get('title'):
                        event['description'] = desc_text
                        break
            
            # Extract date/time
            event['date'] = self.extract_date_from_text(text_content)
            event['time'] = self.extract_time_from_text(text_content)
            event['location'] = self.extract_location_from_text(text_content)
            
            # Extract link
            link_elem = container.find('a', href=True)
            if link_elem:
                href = link_elem.get('href')
                if href:
                    if href.startswith('/'):
                        event['link'] = f"https://knightconnect.campuslabs.com{href}"
                    else:
                        event['link'] = href
            
            # Extract image
            img_elem = container.find('img')
            if img_elem:
                src = img_elem.get('src')
                if src:
                    if src.startswith('/'):
                        event['image'] = f"https://knightconnect.campuslabs.com{src}"
                    else:
                        event['image'] = src
            
            # Add metadata
            event['source'] = 'KnightConnect (Real)'
            event['scraped_at'] = datetime.now().isoformat()
            
            return event
            
        except:
            return None
    
    def extract_text_pattern_events(self, soup):
        """Extract events using text pattern matching"""
        events = []
        try:
            # Remove script and style tags
            for script in soup(["script", "style"]):
                script.decompose()
            
            all_text = soup.get_text()
            lines = [line.strip() for line in all_text.split('\n') if line.strip()]
            
            # Filter out JavaScript and other non-event content
            filtered_lines = []
            for line in lines:
                # Skip lines that look like code
                if any(skip in line.lower() for skip in ['function', 'var ', 'const ', 'let ', 'if(', 'for(', 'return', 'console.', 'document.', 'window.']):
                    continue
                # Skip very long lines (likely code)
                if len(line) > 200:
                    continue
                # Skip lines with too many special characters
                if line.count('{') > 2 or line.count('}') > 2 or line.count('(') > 5:
                    continue
                filtered_lines.append(line)
            
            event_keywords = ['event', 'meeting', 'workshop', 'seminar', 'conference', 'session', 'fair', 'expo', 'symposium', 'lecture', 'presentation']
            
            for line in filtered_lines:
                if any(keyword in line.lower() for keyword in event_keywords) and 10 < len(line) < 100:
                    # Additional filtering to avoid code-like content
                    if not any(code_word in line.lower() for code_word in ['script', 'function', 'var', 'const', 'let']):
                        event = {
                            'title': line,
                            'description': 'Event details from KnightConnect',
                            'date': 'Date TBD',
                            'time': 'Time TBD',
                            'location': 'UCF Campus',
                            'source': 'KnightConnect (Real)',
                            'scraped_at': datetime.now().isoformat()
                        }
                        events.append(event)
                        if len(events) >= 5:  # Limit to 5 events
                            break
        except:
            pass
        return events
    
    def extract_date_from_text(self, text):
        """Extract date from text using regex patterns"""
        date_patterns = [
            r'\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{1,2}(?:st|nd|rd|th)?,?\s+\d{4}',
            r'\b\d{1,2}/\d{1,2}/\d{2,4}',
            r'\b\d{4}-\d{2}-\d{2}',
            r'\b(Mon|Tue|Wed|Thu|Fri|Sat|Sun)day',
            r'\b(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2}'
        ]
        
        for pattern in date_patterns:
            match = re.search(pattern, text, re.I)
            if match:
                return match.group()
        return 'Date TBD'
    
    def extract_time_from_text(self, text):
        """Extract time from text using regex patterns"""
        time_patterns = [
            r'\b\d{1,2}:\d{2}\s*(AM|PM|am|pm)',
            r'\b\d{1,2}\s*(AM|PM|am|pm)',
            r'\b\d{1,2}:\d{2}'
        ]
        
        for pattern in time_patterns:
            match = re.search(pattern, text, re.I)
            if match:
                return match.group()
        return 'Time TBD'
    
    def extract_location_from_text(self, text):
        """Extract location from text"""
        location_keywords = ['location', 'venue', 'place', 'room', 'building', 'campus', 'center', 'hall']
        text_lower = text.lower()
        
        for keyword in location_keywords:
            if keyword in text_lower:
                # Try to extract text around the keyword
                words = text_lower.split()
                try:
                    idx = words.index(keyword)
                    location_text = ' '.join(words[idx:idx+3])
                    return location_text.title()
                except:
                    continue
        return 'UCF Campus'
    
    def get_fallback_events(self):
        """Get fallback events when real scraping fails"""
        return [
            {
                'title': 'UCF Student Organization Fair 2024',
                'description': 'Join us for the annual student organization fair where you can discover clubs, societies, and opportunities to get involved on campus.',
                'date': 'October 30, 2024',
                'time': '10:00 AM - 2:00 PM',
                'location': 'Student Union',
                'link': 'https://knightconnect.campuslabs.com/engage/event/12345',
                'image': '',
                'source': 'KnightConnect (Sample)',
                'scraped_at': datetime.now().isoformat()
            }
        ]

# Global scraper instance
scraper = RealKnightConnectScraper()

@app.route('/api/events', methods=['GET'])
def get_events():
    """API endpoint to get real scraped events"""
    try:
        events = scraper.scrape_real_events()
        
        # Transform and clean the data
        transformed_events = []
        for i, event in enumerate(events):
            transformed_event = {
                'id': i + 1,
                'title': event.get('title', 'Untitled Event'),
                'description': event.get('description', 'No description available'),
                'date': event.get('date', 'Date TBD'),
                'time': event.get('time', 'Time TBD'),
                'location': event.get('location', 'UCF Campus'),
                'link': event.get('link', ''),
                'image': event.get('image', ''),
                'source': event.get('source', 'KnightConnect'),
                'scraped_at': event.get('scraped_at', datetime.now().isoformat())
            }
            transformed_events.append(transformed_event)
        
        return jsonify({
            'success': True,
            'events': transformed_events,
            'count': len(transformed_events),
            'scraped_at': datetime.now().isoformat()
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e),
            'events': [],
            'count': 0
        }), 500

@app.route('/api/events/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'OK',
        'service': 'Real KnightConnect Events Scraper',
        'timestamp': datetime.now().isoformat()
    })

if __name__ == '__main__':
    print("🚀 Starting Real KnightConnect Events Scraper...")
    print("📡 API will be available at: http://localhost:5001")
    print("🔗 Events endpoint: http://localhost:5001/api/events")
    print("❤️ Health check: http://localhost:5001/api/events/health")
    print("🔍 Using multiple extraction methods for real events")
    
    app.run(debug=True, port=5001, host='0.0.0.0')
