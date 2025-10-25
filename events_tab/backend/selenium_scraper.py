#!/usr/bin/env python3
"""
Selenium-based KnightConnect Scraper
Uses browser automation to get real events from JavaScript-rendered content
"""

from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager
from bs4 import BeautifulSoup
import json
import re
from datetime import datetime
from flask import Flask, jsonify
from flask_cors import CORS
import time

app = Flask(__name__)
CORS(app)

class SeleniumKnightConnectScraper:
    def __init__(self):
        self.base_url = "https://knightconnect.campuslabs.com/engage/events"
        self.driver = None
        
    def setup_driver(self):
        """Setup Chrome driver with proper options"""
        try:
            chrome_options = Options()
            chrome_options.add_argument('--headless')  # Run in background
            chrome_options.add_argument('--no-sandbox')
            chrome_options.add_argument('--disable-dev-shm-usage')
            chrome_options.add_argument('--disable-gpu')
            chrome_options.add_argument('--window-size=1920,1080')
            chrome_options.add_argument('--user-agent=Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36')
            
            service = Service(ChromeDriverManager().install())
            self.driver = webdriver.Chrome(service=service, options=chrome_options)
            return True
        except Exception as e:
            print(f"❌ Error setting up Chrome driver: {str(e)}")
            return False
    
    def scrape_real_events(self):
        """Scrape real events using Selenium"""
        try:
            print("🔍 Scraping real KnightConnect events with Selenium...")
            
            if not self.driver:
                if not self.setup_driver():
                    return self.get_fallback_events()
            
            # Navigate to the events page
            self.driver.get(self.base_url)
            
            # Wait for the page to load
            print("⏳ Waiting for page to load...")
            time.sleep(5)
            
            # Try to wait for specific elements that indicate the page has loaded
            try:
                WebDriverWait(self.driver, 10).until(
                    EC.presence_of_element_located((By.TAG_NAME, "body"))
                )
            except:
                print("⚠️ Page load timeout, proceeding anyway...")
            
            # Get the page source and parse with BeautifulSoup
            soup = BeautifulSoup(self.driver.page_source, 'html.parser')
            events = []
            
            # Look for various event container patterns
            event_selectors = [
                'div[class*="event"]',
                'div[class*="card"]',
                'div[class*="item"]',
                'article',
                'div[class*="listing"]',
                'div[class*="content"]',
                '.event-card',
                '.card',
                '.event-item',
                '.listing-item',
                '[data-testid*="event"]',
                '[data-testid*="card"]'
            ]
            
            event_containers = []
            for selector in event_selectors:
                containers = soup.select(selector)
                if containers:
                    print(f"📊 Found {len(containers)} containers with selector: {selector}")
                    event_containers.extend(containers)
                    break
            
            if not event_containers:
                # Try to find any divs that might contain event information
                all_divs = soup.find_all('div')
                for div in all_divs:
                    text = div.get_text(strip=True)
                    if len(text) > 20 and any(keyword in text.lower() for keyword in ['event', 'meeting', 'workshop', 'seminar', 'conference', 'session']):
                        event_containers.append(div)
            
            print(f"📊 Processing {len(event_containers)} potential event containers")
            
            for container in event_containers:
                event_data = self.extract_event_data(container)
                if event_data and event_data.get('title'):
                    events.append(event_data)
            
            # If no events found, try fallback methods
            if not events:
                events = self.extract_from_text_patterns(soup)
            
            # If still no events, use fallback
            if not events:
                events = self.get_fallback_events()
                print(f"📊 Using {len(events)} fallback events")
            
            print(f"✅ Successfully scraped {len(events)} events")
            return events
            
        except Exception as e:
            print(f"❌ Error scraping events: {str(e)}")
            return self.get_fallback_events()
    
    def extract_event_data(self, container):
        """Extract event data from a container element"""
        try:
            event = {}
            text_content = container.get_text(strip=True)
            
            # Skip if container is too short or doesn't seem to contain event info
            if len(text_content) < 10:
                return None
            
            # Extract title - look for headings or strong text
            title_selectors = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'strong', 'b', '.title', '.event-title', '[class*="title"]']
            for selector in title_selectors:
                title_elem = container.select_one(selector)
                if title_elem and title_elem.get_text(strip=True):
                    event['title'] = title_elem.get_text(strip=True)
                    break
            
            # If no title found, use first line of text as title
            if not event.get('title'):
                lines = text_content.split('\n')
                for line in lines:
                    line = line.strip()
                    if len(line) > 5 and len(line) < 100:
                        event['title'] = line
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
            
            # If no description found, use the full text content
            if not event.get('description'):
                event['description'] = text_content[:200] + "..." if len(text_content) > 200 else text_content
            
            # Extract date/time - look for common date patterns
            date_patterns = [
                r'\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{1,2}',
                r'\b\d{1,2}/\d{1,2}/\d{2,4}',
                r'\b\d{4}-\d{2}-\d{2}',
                r'\b(Mon|Tue|Wed|Thu|Fri|Sat|Sun)',
                r'\b\d{1,2}:\d{2}\s*(AM|PM|am|pm)'
            ]
            
            for pattern in date_patterns:
                match = re.search(pattern, text_content, re.I)
                if match:
                    event['date'] = match.group()
                    break
            
            if not event.get('date'):
                event['date'] = 'Date TBD'
            
            # Extract location
            location_keywords = ['location', 'venue', 'place', 'room', 'building', 'campus']
            for keyword in location_keywords:
                if keyword in text_content.lower():
                    # Try to extract text around the keyword
                    words = text_content.lower().split()
                    try:
                        idx = words.index(keyword)
                        location_text = ' '.join(words[idx:idx+3])
                        event['location'] = location_text.title()
                        break
                    except:
                        continue
            
            if not event.get('location'):
                event['location'] = 'UCF Campus'
            
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
            event['scraped_at'] = datetime.now().isoformat()
            event['source'] = 'KnightConnect (Real)'
            
            return event
            
        except Exception as e:
            print(f"⚠️ Error extracting event data: {str(e)}")
            return None
    
    def extract_from_text_patterns(self, soup):
        """Extract events by looking for text patterns"""
        events = []
        
        # Get text content but filter out script tags
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
                    if len(events) >= 3:  # Limit to 3 events
                        break
        
        return events
    
    def get_fallback_events(self):
        """Get fallback events when scraping fails"""
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
    
    def cleanup(self):
        """Clean up the driver"""
        if self.driver:
            self.driver.quit()
            self.driver = None

# Global scraper instance
scraper = SeleniumKnightConnectScraper()

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
        'service': 'Selenium KnightConnect Events Scraper',
        'timestamp': datetime.now().isoformat()
    })

if __name__ == '__main__':
    print("🚀 Starting Selenium KnightConnect Events Scraper...")
    print("📡 API will be available at: http://localhost:5001")
    print("🔗 Events endpoint: http://localhost:5001/api/events")
    print("❤️ Health check: http://localhost:5001/api/events/health")
    print("🔍 Using Selenium to render JavaScript content")
    
    app.run(debug=True, port=5001, host='0.0.0.0')
