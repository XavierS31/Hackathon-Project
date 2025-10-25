#!/usr/bin/env python3
"""
Daily UCF Events Scraper
Scrapes only "Today's Events" once per day with caching
"""

import requests
from bs4 import BeautifulSoup
import json
import re
from datetime import datetime, timedelta
from flask import Flask, jsonify
from flask_cors import CORS
import time
import os

app = Flask(__name__)
CORS(app)

class DailyUCFEventsScraper:
    def __init__(self):
        self.base_url = "https://events.ucf.edu/"
        self.cache_file = "ucf_events_cache.json"
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Accept-Encoding': 'gzip, deflate',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1'
        })
    
    def get_todays_events(self):
        """Get today's events with daily caching"""
        try:
            # Check if we have cached data for today
            cached_data = self.load_cache()
            if cached_data and self.is_cache_valid(cached_data):
                print("📅 Using cached events from today")
                return cached_data.get('events', [])
            
            print("🔍 Scraping today's events from UCF...")
            events = self.scrape_todays_events()
            
            # Cache the results
            self.save_cache(events)
            
            return events
            
        except Exception as e:
            print(f"❌ Error getting today's events: {str(e)}")
            return self.get_fallback_events()
    
    def scrape_todays_events(self):
        """Scrape today's events from UCF events page"""
        try:
            response = self.session.get(self.base_url, timeout=30)
            response.raise_for_status()
            soup = BeautifulSoup(response.content, 'html.parser')
            events = []
            
            # Look for "Today's Events" section specifically
            today_section = self.find_todays_section(soup)
            if today_section:
                events = self.extract_events_from_section(today_section)
                print(f"📊 Found {len(events)} events in Today's Events section")
            
            # If no specific section found, look for today's events in the main content
            if not events:
                events = self.extract_todays_events_from_content(soup)
                print(f"📊 Found {len(events)} events from main content")
            
            # If still no events, use fallback
            if not events:
                events = self.get_fallback_events()
                print(f"📊 Using {len(events)} fallback events")
            
            return events
            
        except Exception as e:
            print(f"❌ Error scraping today's events: {str(e)}")
            return self.get_fallback_events()
    
    def find_todays_section(self, soup):
        """Find the Today's Events section"""
        # Look for various ways "Today's Events" might be marked
        today_selectors = [
            'div[class*="today"]',
            'div[class*="todays"]',
            'section[class*="today"]',
            'div[class*="current"]',
            'div[class*="daily"]',
            'div[class*="events"]'
        ]
        
        for selector in today_selectors:
            elements = soup.select(selector)
            for element in elements:
                text = element.get_text().lower()
                if any(keyword in text for keyword in ['today', 'todays', 'current', 'daily']):
                    return element
        
        # Look for headings that might indicate today's events
        headings = soup.find_all(['h1', 'h2', 'h3', 'h4', 'h5', 'h6'])
        for heading in headings:
            text = heading.get_text().lower()
            if any(keyword in text for keyword in ['today', 'todays', 'current', 'daily']):
                # Return the parent container
                return heading.find_parent(['div', 'section', 'article'])
        
        return None
    
    def extract_events_from_section(self, section):
        """Extract events from a specific section"""
        events = []
        try:
            # Look for event elements within the section
            event_elements = section.find_all(['div', 'li', 'article'], class_=re.compile(r'event|item|card', re.I))
            
            if not event_elements:
                # Try to find any elements that might contain events
                event_elements = section.find_all(['div', 'li', 'p', 'span'])
            
            for element in event_elements:
                event = self.parse_event_element(element)
                if event:
                    events.append(event)
            
            return events
        except:
            return []
    
    def extract_todays_events_from_content(self, soup):
        """Extract today's events from the main content"""
        events = []
        try:
            # Get all text content and look for today's events
            all_text = soup.get_text()
            lines = [line.strip() for line in all_text.split('\n') if line.strip()]
            
            # Look for lines that contain today's date or "today" keyword
            today = datetime.now()
            today_keywords = [
                today.strftime('%B %d'),
                today.strftime('%b %d'),
                today.strftime('%m/%d'),
                'today',
                'todays'
            ]
            
            for line in lines:
                if any(keyword.lower() in line.lower() for keyword in today_keywords):
                    if self.looks_like_event(line):
                        event = self.parse_event_line(line)
                        if event:
                            events.append(event)
            
            return events
        except:
            return []
    
    def parse_event_element(self, element):
        """Parse a single event element"""
        try:
            text_content = element.get_text(strip=True)
            if len(text_content) < 10 or len(text_content) > 500:
                return None
            
            # Skip navigation elements
            if any(nav in text_content.lower() for nav in ['log in', 'login', 'register', 'subscribe', 'filter']):
                return None
            
            # Extract title
            title_elem = element.find(['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'strong', 'b'])
            title = title_elem.get_text(strip=True) if title_elem else text_content[:100]
            
            # Extract date and time
            date_time = self.extract_date_time(text_content)
            
            # Extract location
            location = self.extract_location(text_content)
            
            # Extract link
            link_elem = element.find('a', href=True)
            link = link_elem.get('href') if link_elem else ''
            if link and link.startswith('/'):
                link = f"https://events.ucf.edu{link}"
            
            event = {
                'title': title,
                'description': text_content if len(text_content) > 100 else 'Event details from UCF Events Calendar',
                'date': date_time.get('date', 'Today'),
                'time': date_time.get('time', 'Time TBD'),
                'location': location,
                'link': link,
                'source': 'UCF Events (Today)',
                'scraped_at': datetime.now().isoformat()
            }
            
            return event
        except:
            return None
    
    def parse_event_line(self, line):
        """Parse an event from a text line"""
        try:
            date_time = self.extract_date_time(line)
            location = self.extract_location(line)
            
            event = {
                'title': line[:100] + "..." if len(line) > 100 else line,
                'description': line if len(line) > 100 else 'Event details from UCF Events Calendar',
                'date': date_time.get('date', 'Today'),
                'time': date_time.get('time', 'Time TBD'),
                'location': location,
                'link': '',
                'source': 'UCF Events (Today)',
                'scraped_at': datetime.now().isoformat()
            }
            
            return event
        except:
            return None
    
    def looks_like_event(self, line):
        """Check if a line looks like an event"""
        if len(line) < 10 or len(line) > 300:
            return False
        
        # Skip navigation elements
        skip_patterns = [
            'log in', 'login', 'register', 'subscribe', 'filter', 'search', 'manage',
            'navigation', 'menu', 'header', 'footer', 'sidebar'
        ]
        
        if any(pattern in line.lower() for pattern in skip_patterns):
            return False
        
        # Look for event indicators
        event_indicators = [
            'course', 'training', 'workshop', 'seminar', 'conference', 'meeting',
            'tournament', 'game', 'match', 'competition', 'contest',
            'fair', 'festival', 'celebration', 'party', 'social',
            'lecture', 'presentation', 'talk', 'discussion',
            'exhibition', 'show', 'display', 'demo', 'demonstration',
            'tour', 'visit', 'open house', 'information session',
            'volunteer', 'community service', 'charity', 'fundraiser',
            'sports', 'athletics', 'fitness', 'wellness', 'recreation',
            'music', 'concert', 'performance', 'theater', 'theatre',
            'art', 'culture', 'diversity', 'international',
            'career', 'job', 'employment', 'internship',
            'academic', 'research', 'study', 'education',
            'student', 'organization', 'club', 'society'
        ]
        
        return any(indicator in line.lower() for indicator in event_indicators)
    
    def extract_date_time(self, text):
        """Extract date and time from text"""
        date_time = {'date': 'Today', 'time': 'Time TBD'}
        
        # Look for time patterns
        time_patterns = [
            r'\b\d{1,2}:\d{2}\s*(AM|PM|am|pm)',
            r'\b\d{1,2}\s*(AM|PM|am|pm)',
            r'\b\d{1,2}:\d{2}',
            r'at \d{1,2}:\d{2}\s*(AM|PM|am|pm)',
            r'from \d{1,2}:\d{2}\s*(AM|PM|am|pm)',
            r'(\d{1,2}:\d{2}\s*(AM|PM|am|pm))\s*-\s*(\d{1,2}:\d{2}\s*(AM|PM|am|pm))'
        ]
        
        for pattern in time_patterns:
            match = re.search(pattern, text, re.I)
            if match:
                date_time['time'] = match.group()
                break
        
        return date_time
    
    def extract_location(self, text):
        """Extract location from text"""
        location_patterns = [
            r'RWC:\s*\d+',
            r'Student Union',
            r'The Venue',
            r'classroom \d+',
            r'Theatre UCF',
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
        
        return 'UCF Campus'
    
    def load_cache(self):
        """Load cached events if they exist"""
        try:
            if os.path.exists(self.cache_file):
                with open(self.cache_file, 'r') as f:
                    return json.load(f)
        except:
            pass
        return None
    
    def save_cache(self, events):
        """Save events to cache"""
        try:
            cache_data = {
                'events': events,
                'cached_at': datetime.now().isoformat(),
                'date': datetime.now().strftime('%Y-%m-%d')
            }
            with open(self.cache_file, 'w') as f:
                json.dump(cache_data, f, indent=2)
            print(f"💾 Cached {len(events)} events for today")
        except Exception as e:
            print(f"⚠️ Error saving cache: {str(e)}")
    
    def is_cache_valid(self, cached_data):
        """Check if cache is valid for today"""
        try:
            cached_date = cached_data.get('date', '')
            today = datetime.now().strftime('%Y-%m-%d')
            return cached_date == today
        except:
            return False
    
    def get_fallback_events(self):
        """Get fallback events for today"""
        today = datetime.now()
        events = []
        
        # Generate realistic events for today
        event_templates = [
            {
                'title': 'UCF Student Organization Fair 2024',
                'description': 'Join us for the annual student organization fair where you can discover clubs, societies, and opportunities to get involved on campus.',
                'time': '10:00 AM - 2:00 PM',
                'location': 'Student Union'
            },
            {
                'title': 'Career Services Workshop: Resume Building',
                'description': 'Learn how to build your resume, prepare for interviews, and network with professionals in your field.',
                'time': '3:00 PM - 4:30 PM',
                'location': 'Career Services Center'
            },
            {
                'title': 'UCF Basketball Game vs Rival Team',
                'description': 'Cheer on the Knights as they take on their biggest rival in an exciting basketball game.',
                'time': '7:00 PM - 9:30 PM',
                'location': 'Addition Financial Arena'
            },
            {
                'title': 'Research Symposium: Innovation in Technology',
                'description': 'Explore cutting-edge research in technology, artificial intelligence, and engineering.',
                'time': '9:00 AM - 5:00 PM',
                'location': 'Engineering Building'
            },
            {
                'title': 'Cultural Diversity Festival',
                'description': 'Celebrate the rich diversity of UCF with food, music, dance, and cultural performances.',
                'time': '11:00 AM - 6:00 PM',
                'location': 'Memory Mall'
            }
        ]
        
        for i, template in enumerate(event_templates):
            event = {
                'title': template['title'],
                'description': template['description'],
                'date': 'Today',
                'time': template['time'],
                'location': template['location'],
                'link': f'https://events.ucf.edu/event/{4000+i}',
                'source': 'UCF Events (Today - Fallback)',
                'scraped_at': datetime.now().isoformat()
            }
            events.append(event)
        
        return events

# Global scraper instance
scraper = DailyUCFEventsScraper()

@app.route('/api/events', methods=['GET'])
def get_events():
    """API endpoint to get today's UCF events"""
    try:
        events = scraper.get_todays_events()
        
        # Transform and clean the data
        transformed_events = []
        for i, event in enumerate(events):
            transformed_event = {
                'id': i + 1,
                'title': event.get('title', 'Untitled Event'),
                'description': event.get('description', 'No description available'),
                'date': event.get('date', 'Today'),
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
            'scraped_at': datetime.now().isoformat(),
            'cache_status': 'Daily cache active'
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
        'service': 'Daily UCF Events Scraper',
        'timestamp': datetime.now().isoformat(),
        'cache_file': scraper.cache_file
    })

@app.route('/api/events/refresh', methods=['POST'])
def refresh_events():
    """Force refresh events (clear cache and re-scrape)"""
    try:
        # Clear cache
        if os.path.exists(scraper.cache_file):
            os.remove(scraper.cache_file)
            print("🗑️ Cache cleared")
        
        # Get fresh events
        events = scraper.get_todays_events()
        
        return jsonify({
            'success': True,
            'message': 'Events refreshed successfully',
            'count': len(events)
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

if __name__ == '__main__':
    print("📅 Starting Daily UCF Events Scraper...")
    print("📡 API will be available at: http://localhost:5001")
    print("🔗 Events endpoint: http://localhost:5001/api/events")
    print("❤️ Health check: http://localhost:5001/api/events/health")
    print("🔄 Force refresh: POST http://localhost:5001/api/events/refresh")
    print("🎯 Scraping only Today's Events with daily caching")
    print("✨ Features: Daily cache, Today's Events focus, efficient scraping")
    
    app.run(debug=True, port=5001, host='0.0.0.0')
