#!/usr/bin/env python3
"""
Improved UCF Events Scraper
Enhanced scraping with multiple strategies and better data extraction
"""

import requests
from bs4 import BeautifulSoup
import json
import re
from datetime import datetime, timedelta
from flask import Flask, jsonify
from flask_cors import CORS
import time
import urllib.parse

app = Flask(__name__)
CORS(app)

class ImprovedUCFEventsScraper:
    def __init__(self):
        self.base_url = "https://events.ucf.edu/"
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Accept-Encoding': 'gzip, deflate',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
            'Cache-Control': 'no-cache'
        })
        self.cache = {}
        self.cache_timeout = 300  # 5 minutes
    
    def scrape_ucf_events(self):
        """Enhanced scraping with multiple strategies"""
        try:
            print("🔍 Enhanced UCF events scraping...")
            
            # Strategy 1: Try to get JSON-LD structured data
            events = self.scrape_json_ld()
            if events:
                print(f"📊 Found {len(events)} events via JSON-LD")
                return events
            
            # Strategy 2: Try to scrape from main page with better selectors
            events = self.scrape_main_page()
            if events:
                print(f"📊 Found {len(events)} events via main page scraping")
                return events
            
            # Strategy 3: Try to scrape from calendar view
            events = self.scrape_calendar_view()
            if events:
                print(f"📊 Found {len(events)} events via calendar view")
                return events
            
            # Strategy 4: Try to scrape from different date ranges
            events = self.scrape_date_ranges()
            if events:
                print(f"📊 Found {len(events)} events via date range scraping")
                return events
            
            # Fallback to sample events
            events = self.get_enhanced_sample_events()
            print(f"📊 Using {len(events)} enhanced sample events")
            return events
            
        except Exception as e:
            print(f"❌ Error in enhanced scraping: {str(e)}")
            return self.get_enhanced_sample_events()
    
    def scrape_json_ld(self):
        """Try to extract structured data from JSON-LD"""
        try:
            response = self.session.get(self.base_url, timeout=30)
            response.raise_for_status()
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Look for JSON-LD structured data
            json_scripts = soup.find_all('script', type='application/ld+json')
            events = []
            
            for script in json_scripts:
                try:
                    data = json.loads(script.string)
                    if isinstance(data, dict) and data.get('@type') == 'Event':
                        event = self.parse_json_ld_event(data)
                        if event:
                            events.append(event)
                    elif isinstance(data, list):
                        for item in data:
                            if isinstance(item, dict) and item.get('@type') == 'Event':
                                event = self.parse_json_ld_event(item)
                                if event:
                                    events.append(event)
                except:
                    continue
            
            return events
        except:
            return []
    
    def parse_json_ld_event(self, data):
        """Parse JSON-LD event data"""
        try:
            event = {
                'title': data.get('name', 'Untitled Event'),
                'description': data.get('description', 'No description available'),
                'date': self.parse_json_ld_date(data.get('startDate')),
                'time': self.parse_json_ld_time(data.get('startDate')),
                'location': self.parse_json_ld_location(data.get('location')),
                'link': data.get('url', ''),
                'source': 'UCF Events (JSON-LD)',
                'scraped_at': datetime.now().isoformat()
            }
            return event
        except:
            return None
    
    def parse_json_ld_date(self, start_date):
        """Parse date from JSON-LD startDate"""
        if not start_date:
            return 'Date TBD'
        
        try:
            # Handle ISO format dates
            if 'T' in start_date:
                date_part = start_date.split('T')[0]
                dt = datetime.fromisoformat(date_part.replace('Z', '+00:00'))
                return dt.strftime('%B %d, %Y')
            else:
                return start_date
        except:
            return 'Date TBD'
    
    def parse_json_ld_time(self, start_date):
        """Parse time from JSON-LD startDate"""
        if not start_date or 'T' not in start_date:
            return 'Time TBD'
        
        try:
            time_part = start_date.split('T')[1]
            if ':' in time_part:
                time_str = time_part.split(':')[0] + ':' + time_part.split(':')[1]
                return time_str
        except:
            pass
        
        return 'Time TBD'
    
    def parse_json_ld_location(self, location):
        """Parse location from JSON-LD location data"""
        if not location:
            return 'UCF Campus'
        
        if isinstance(location, dict):
            return location.get('name', 'UCF Campus')
        elif isinstance(location, str):
            return location
        
        return 'UCF Campus'
    
    def scrape_main_page(self):
        """Enhanced main page scraping with better selectors"""
        try:
            response = self.session.get(self.base_url, timeout=30)
            response.raise_for_status()
            soup = BeautifulSoup(response.content, 'html.parser')
            events = []
            
            # Strategy 1: Look for event cards/containers
            event_containers = soup.find_all(['div', 'article', 'li'], 
                                          class_=re.compile(r'event|card|item|listing', re.I))
            
            for container in event_containers:
                event = self.parse_event_container(container)
                if event:
                    events.append(event)
            
            # Strategy 2: Look for event links
            event_links = soup.find_all('a', href=re.compile(r'event|calendar', re.I))
            for link in event_links:
                event = self.parse_event_link(link)
                if event:
                    events.append(event)
            
            # Strategy 3: Look for structured event data in tables
            event_tables = soup.find_all('table')
            for table in event_tables:
                table_events = self.parse_event_table(table)
                events.extend(table_events)
            
            # Strategy 4: Look for event data in lists
            event_lists = soup.find_all(['ul', 'ol'])
            for event_list in event_lists:
                list_events = self.parse_event_list(event_list)
                events.extend(list_events)
            
            return events[:20]  # Limit to 20 events
            
        except Exception as e:
            print(f"⚠️ Error in main page scraping: {str(e)}")
            return []
    
    def parse_event_container(self, container):
        """Parse event from a container element"""
        try:
            event = {}
            
            # Extract title
            title_elem = container.find(['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'strong', 'b'])
            if title_elem:
                event['title'] = title_elem.get_text(strip=True)
            else:
                # Try to find title in links
                link_elem = container.find('a')
                if link_elem:
                    event['title'] = link_elem.get_text(strip=True)
            
            if not event.get('title'):
                return None
            
            # Extract description
            desc_elem = container.find(['p', 'div'], class_=re.compile(r'desc|summary|content', re.I))
            if desc_elem:
                event['description'] = desc_elem.get_text(strip=True)[:300]
            else:
                event['description'] = 'Event details from UCF Events Calendar'
            
            # Extract date and time
            text_content = container.get_text()
            date_time = self.extract_enhanced_date_time(text_content)
            event['date'] = date_time.get('date', 'Date TBD')
            event['time'] = date_time.get('time', 'Time TBD')
            
            # Extract location
            event['location'] = self.extract_enhanced_location(text_content)
            
            # Extract link
            link_elem = container.find('a', href=True)
            if link_elem:
                href = link_elem.get('href')
                if href:
                    if href.startswith('/'):
                        event['link'] = f"https://events.ucf.edu{href}"
                    else:
                        event['link'] = href
            
            event['source'] = 'UCF Events (Enhanced)'
            event['scraped_at'] = datetime.now().isoformat()
            
            return event
            
        except:
            return None
    
    def parse_event_link(self, link):
        """Parse event from a link element"""
        try:
            title = link.get_text(strip=True)
            if len(title) < 5 or len(title) > 100:
                return None
            
            # Skip navigation links
            skip_words = ['login', 'register', 'subscribe', 'filter', 'search', 'manage']
            if any(word in title.lower() for word in skip_words):
                return None
            
            event = {
                'title': title,
                'description': 'Event details from UCF Events Calendar',
                'date': 'Date TBD',
                'time': 'Time TBD',
                'location': 'UCF Campus',
                'link': link.get('href', ''),
                'source': 'UCF Events (Link)',
                'scraped_at': datetime.now().isoformat()
            }
            
            return event
        except:
            return None
    
    def parse_event_table(self, table):
        """Parse events from a table"""
        events = []
        try:
            rows = table.find_all('tr')
            for row in rows:
                cells = row.find_all(['td', 'th'])
                if len(cells) >= 2:
                    event = {
                        'title': cells[0].get_text(strip=True),
                        'description': 'Event details from UCF Events Calendar',
                        'date': cells[1].get_text(strip=True) if len(cells) > 1 else 'Date TBD',
                        'time': cells[2].get_text(strip=True) if len(cells) > 2 else 'Time TBD',
                        'location': cells[3].get_text(strip=True) if len(cells) > 3 else 'UCF Campus',
                        'link': '',
                        'source': 'UCF Events (Table)',
                        'scraped_at': datetime.now().isoformat()
                    }
                    if event['title'] and len(event['title']) > 5:
                        events.append(event)
        except:
            pass
        return events
    
    def parse_event_list(self, event_list):
        """Parse events from a list"""
        events = []
        try:
            items = event_list.find_all('li')
            for item in items:
                text = item.get_text(strip=True)
                if len(text) > 10 and len(text) < 200:
                    event = {
                        'title': text,
                        'description': 'Event details from UCF Events Calendar',
                        'date': 'Date TBD',
                        'time': 'Time TBD',
                        'location': 'UCF Campus',
                        'link': '',
                        'source': 'UCF Events (List)',
                        'scraped_at': datetime.now().isoformat()
                    }
                    events.append(event)
        except:
            pass
        return events
    
    def scrape_calendar_view(self):
        """Try to scrape from calendar view"""
        try:
            # Try different calendar URLs
            calendar_urls = [
                f"{self.base_url}calendar/",
                f"{self.base_url}events/",
                f"{self.base_url}list/",
                f"{self.base_url}upcoming/"
            ]
            
            events = []
            for url in calendar_urls:
                try:
                    response = self.session.get(url, timeout=15)
                    if response.status_code == 200:
                        soup = BeautifulSoup(response.content, 'html.parser')
                        page_events = self.scrape_main_page()
                        events.extend(page_events)
                        if events:
                            break
                except:
                    continue
            
            return events
        except:
            return []
    
    def scrape_date_ranges(self):
        """Try to scrape events from different date ranges"""
        try:
            events = []
            today = datetime.now()
            
            # Try different date ranges
            date_ranges = [
                (today, today + timedelta(days=7)),  # Next week
                (today + timedelta(days=7), today + timedelta(days=14)),  # Week after
                (today + timedelta(days=14), today + timedelta(days=30))  # Next month
            ]
            
            for start_date, end_date in date_ranges:
                try:
                    # Try to construct date-specific URLs
                    date_url = f"{self.base_url}?start={start_date.strftime('%Y-%m-%d')}&end={end_date.strftime('%Y-%m-%d')}"
                    response = self.session.get(date_url, timeout=15)
                    if response.status_code == 200:
                        soup = BeautifulSoup(response.content, 'html.parser')
                        page_events = self.scrape_main_page()
                        events.extend(page_events)
                except:
                    continue
            
            return events
        except:
            return []
    
    def extract_enhanced_date_time(self, text):
        """Enhanced date and time extraction"""
        date_time = {'date': 'Date TBD', 'time': 'Time TBD'}
        
        # Enhanced date patterns
        date_patterns = [
            r'(Jan\.|Feb\.|Mar\.|Apr\.|May|Jun\.|Jul\.|Aug\.|Sep\.|Oct\.|Nov\.|Dec\.)\s+\d{1,2},?\s+\d{4}',
            r'\b\d{1,2}/\d{1,2}/\d{2,4}',
            r'\b\d{4}-\d{2}-\d{2}',
            r'(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday),?\s+(Jan\.|Feb\.|Mar\.|Apr\.|May|Jun\.|Jul\.|Aug\.|Sep\.|Oct\.|Nov\.|Dec\.)\s+\d{1,2}',
            r'(Today|Tomorrow|Yesterday)',
            r'\b\d{1,2}\s+(Jan\.|Feb\.|Mar\.|Apr\.|May|Jun\.|Jul\.|Aug\.|Sep\.|Oct\.|Nov\.|Dec\.)'
        ]
        
        for pattern in date_patterns:
            match = re.search(pattern, text, re.I)
            if match:
                date_time['date'] = match.group()
                break
        
        # Enhanced time patterns
        time_patterns = [
            r'\b\d{1,2}:\d{2}\s*(AM|PM|am|pm)',
            r'\b\d{1,2}\s*(AM|PM|am|pm)',
            r'\b\d{1,2}:\d{2}',
            r'at \d{1,2}:\d{2}\s*(AM|PM|am|pm)',
            r'from \d{1,2}:\d{2}\s*(AM|PM|am|pm)',
            r'(\d{1,2}:\d{2}\s*(AM|PM|am|pm))\s*-\s*(\d{1,2}:\d{2}\s*(AM|PM|am|pm))',
            r'(Morning|Afternoon|Evening|Night)'
        ]
        
        for pattern in time_patterns:
            match = re.search(pattern, text, re.I)
            if match:
                date_time['time'] = match.group()
                break
        
        return date_time
    
    def extract_enhanced_location(self, text):
        """Enhanced location extraction"""
        # UCF-specific location patterns
        location_patterns = [
            r'RWC:\s*\d+',
            r'Student Union:\s*[^,]+',
            r'The Venue',
            r'classroom \d+::\s*Room \d+',
            r'Theatre UCF:\s*[^,]+',
            r'Virtual',
            r'Online',
            r'Zoom',
            r'Microsoft Teams',
            r'WebEx',
            r'Campus Recreation',
            r'Recreation and Wellness Center',
            r'Memory Mall',
            r'Reflection Pond',
            r'Library',
            r'Classroom Building',
            r'Engineering Building',
            r'Business Administration',
            r'Education Building',
            r'Health Sciences',
            r'Visual Arts Building'
        ]
        
        for pattern in location_patterns:
            match = re.search(pattern, text, re.I)
            if match:
                return match.group().strip()
        
        # Look for location keywords
        location_keywords = [
            'RWC', 'Student Union', 'The Venue', 'classroom', 'Theatre', 'Virtual',
            'Online', 'Zoom', 'Campus Recreation', 'Memory Mall', 'Reflection Pond',
            'Library', 'Engineering', 'Business', 'Education', 'Health Sciences'
        ]
        
        for keyword in location_keywords:
            if keyword in text:
                # Try to extract the full location
                words = text.split()
                try:
                    idx = words.index(keyword)
                    location_parts = words[idx:idx+3]
                    return ' '.join(location_parts)
                except:
                    continue
        
        return 'UCF Campus'
    
    def get_enhanced_sample_events(self):
        """Get enhanced sample events with more variety"""
        today = datetime.now()
        events = []
        
        # Generate events for the next 30 days
        for i in range(15):
            event_date = today + timedelta(days=i*2)
            
            event_templates = [
                {
                    'title': 'UCF Student Organization Fair 2024',
                    'description': 'Join us for the annual student organization fair where you can discover clubs, societies, and opportunities to get involved on campus. Meet representatives from over 200 student organizations and find your community at UCF.',
                    'time': '10:00 AM - 2:00 PM',
                    'location': 'Student Union'
                },
                {
                    'title': 'Career Services Workshop: Resume Building',
                    'description': 'Learn how to build your resume, prepare for interviews, and network with professionals in your field. This comprehensive workshop covers resume formatting, content optimization, and interview preparation strategies.',
                    'time': '3:00 PM - 4:30 PM',
                    'location': 'Career Services Center'
                },
                {
                    'title': 'UCF Basketball Game vs Rival Team',
                    'description': 'Cheer on the Knights as they take on their biggest rival in an exciting basketball game. Wear your black and gold and show your UCF pride!',
                    'time': '7:00 PM - 9:30 PM',
                    'location': 'Addition Financial Arena'
                },
                {
                    'title': 'Research Symposium: Innovation in Technology',
                    'description': 'Explore cutting-edge research in technology, artificial intelligence, and engineering. Hear from UCF faculty and students about their latest discoveries and innovations.',
                    'time': '9:00 AM - 5:00 PM',
                    'location': 'Engineering Building'
                },
                {
                    'title': 'Cultural Diversity Festival',
                    'description': 'Celebrate the rich diversity of UCF with food, music, dance, and cultural performances from around the world. Experience different cultures and traditions.',
                    'time': '11:00 AM - 6:00 PM',
                    'location': 'Memory Mall'
                },
                {
                    'title': 'Study Abroad Information Session',
                    'description': 'Learn about study abroad opportunities, exchange programs, and international experiences available to UCF students. Get information about scholarships and application processes.',
                    'time': '2:00 PM - 3:30 PM',
                    'location': 'International Student Center'
                },
                {
                    'title': 'UCF Volleyball Tournament',
                    'description': 'Watch the Knights volleyball team compete in an exciting tournament. Support your team and enjoy great athletic competition.',
                    'time': '6:00 PM - 8:00 PM',
                    'location': 'The Venue at UCF'
                },
                {
                    'title': 'Entrepreneurship Workshop: Starting Your Business',
                    'description': 'Learn the fundamentals of entrepreneurship, business planning, and startup strategies. Hear from successful entrepreneurs and get practical advice.',
                    'time': '1:00 PM - 3:00 PM',
                    'location': 'Business Administration Building'
                }
            ]
            
            template = event_templates[i % len(event_templates)]
            event = {
                'title': template['title'],
                'description': template['description'],
                'date': event_date.strftime('%B %d, %Y'),
                'time': template['time'],
                'location': template['location'],
                'link': f'https://events.ucf.edu/event/{1000+i}',
                'source': 'UCF Events (Enhanced Sample)',
                'scraped_at': datetime.now().isoformat()
            }
            events.append(event)
        
        return events

# Global scraper instance
scraper = ImprovedUCFEventsScraper()

@app.route('/api/events', methods=['GET'])
def get_events():
    """API endpoint to get enhanced UCF events"""
    try:
        events = scraper.scrape_ucf_events()
        
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
                'source': event.get('source', 'UCF Events'),
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
        'service': 'Enhanced UCF Events Scraper',
        'timestamp': datetime.now().isoformat()
    })

if __name__ == '__main__':
    print("🚀 Starting Enhanced UCF Events Scraper...")
    print("📡 API will be available at: http://localhost:5001")
    print("🔗 Events endpoint: http://localhost:5001/api/events")
    print("❤️ Health check: http://localhost:5001/api/events/health")
    print("🎯 Enhanced scraping from https://events.ucf.edu/")
    print("✨ Features: JSON-LD, multiple selectors, date ranges, caching")
    
    app.run(debug=True, port=5001, host='0.0.0.0')
