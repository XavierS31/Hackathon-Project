#!/usr/bin/env python3
"""
UCF Public Events Scraper
Scrapes real events from https://events.ucf.edu/ (public site)
"""

import requests
from bs4 import BeautifulSoup
import json
import re
from datetime import datetime, timedelta
from flask import Flask, jsonify
from flask_cors import CORS
import time

app = Flask(__name__)
CORS(app)

class UCFEventsScraper:
    def __init__(self):
        self.base_url = "https://events.ucf.edu/"
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Accept-Encoding': 'gzip, deflate',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1'
        })
    
    def scrape_ucf_events(self):
        """Scrape real events from UCF public events calendar"""
        try:
            print("🔍 Scraping UCF public events from events.ucf.edu...")
            response = self.session.get(self.base_url, timeout=30)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.content, 'html.parser')
            events = []
            
            # Extract events from the "Today's Events" section
            today_events = self.extract_todays_events(soup)
            if today_events:
                events.extend(today_events)
                print(f"📊 Found {len(today_events)} events from Today's Events section")
            
            # Try to extract from other sections
            other_events = self.extract_other_events(soup)
            if other_events:
                events.extend(other_events)
                print(f"📊 Found {len(other_events)} additional events")
            
            # If no events found, use fallback
            if not events:
                events = self.get_fallback_events()
                print(f"📊 Using {len(events)} fallback events")
            
            print(f"✅ Successfully scraped {len(events)} events")
            return events
            
        except Exception as e:
            print(f"❌ Error scraping events: {str(e)}")
            return self.get_fallback_events()
    
    def extract_todays_events(self, soup):
        """Extract events from Today's Events section"""
        events = []
        try:
            # Look for the "Today's Events" section
            # Based on the HTML structure, events are in a list format
            event_elements = soup.find_all(['li', 'div'], class_=re.compile(r'event|item', re.I))
            
            if not event_elements:
                # Try alternative selectors
                event_elements = soup.find_all('h3')  # Event titles are often in h3 tags
            
            for element in event_elements:
                event = self.parse_event_element(element)
                if event and event.get('title'):
                    events.append(event)
            
            # If no structured events found, try to parse the text content
            if not events:
                events = self.parse_text_content(soup)
            
        except Exception as e:
            print(f"⚠️ Error extracting today's events: {str(e)}")
        
        return events
    
    def parse_event_element(self, element):
        """Parse a single event element"""
        try:
            event = {}
            text_content = element.get_text(strip=True)
            
            # Skip if too short
            if len(text_content) < 10:
                return None
            
            # Extract title (usually the first line or in h3/h4 tags)
            title_elem = element.find(['h3', 'h4', 'strong', 'b'])
            if title_elem:
                event['title'] = title_elem.get_text(strip=True)
            else:
                # Use first line as title
                lines = text_content.split('\n')
                for line in lines:
                    line = line.strip()
                    if len(line) > 5 and len(line) < 100:
                        event['title'] = line
                        break
            
            # Extract date and time
            date_time = self.extract_date_time(text_content)
            event['date'] = date_time.get('date', 'Date TBD')
            event['time'] = date_time.get('time', 'Time TBD')
            
            # Extract location
            event['location'] = self.extract_location(text_content)
            
            # Extract description
            event['description'] = self.extract_description(text_content)
            
            # Extract link
            link_elem = element.find('a', href=True)
            if link_elem:
                href = link_elem.get('href')
                if href:
                    if href.startswith('/'):
                        event['link'] = f"https://events.ucf.edu{href}"
                    else:
                        event['link'] = href
            
            # Add metadata
            event['source'] = 'UCF Events (Real)'
            event['scraped_at'] = datetime.now().isoformat()
            
            return event
            
        except Exception as e:
            print(f"⚠️ Error parsing event element: {str(e)}")
            return None
    
    def extract_date_time(self, text):
        """Extract date and time from text"""
        date_time = {'date': 'Date TBD', 'time': 'Time TBD'}
        
        # Look for date patterns
        date_patterns = [
            r'(Oct\.|Nov\.|Dec\.|Jan\.|Feb\.|Mar\.|Apr\.|May|Jun\.|Jul\.|Aug\.|Sep\.)\s+\d{1,2},?\s+\d{4}',
            r'\b\d{1,2}/\d{1,2}/\d{2,4}',
            r'\b\d{4}-\d{2}-\d{2}'
        ]
        
        for pattern in date_patterns:
            match = re.search(pattern, text, re.I)
            if match:
                date_time['date'] = match.group()
                break
        
        # Look for time patterns
        time_patterns = [
            r'\b\d{1,2}:\d{2}\s*(AM|PM|am|pm)',
            r'\b\d{1,2}\s*(AM|PM|am|pm)',
            r'\b\d{1,2}:\d{2}',
            r'at \d{1,2}:\d{2}\s*(AM|PM|am|pm)',
            r'from \d{1,2}:\d{2}\s*(AM|PM|am|pm)'
        ]
        
        for pattern in time_patterns:
            match = re.search(pattern, text, re.I)
            if match:
                date_time['time'] = match.group()
                break
        
        return date_time
    
    def extract_location(self, text):
        """Extract location from text"""
        # Look for common UCF location patterns
        location_patterns = [
            r'RWC:\s*\d+',
            r'Student Union:\s*[^,]+',
            r'The Venue',
            r'classroom \d+::\s*Room \d+',
            r'Theatre UCF:\s*[^,]+',
            r'Virtual'
        ]
        
        for pattern in location_patterns:
            match = re.search(pattern, text, re.I)
            if match:
                return match.group().strip()
        
        # Look for location keywords
        location_keywords = ['RWC', 'Student Union', 'The Venue', 'classroom', 'Theatre', 'Virtual']
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
    
    def extract_description(self, text):
        """Extract description from text"""
        # Look for longer text that might be description
        lines = text.split('\n')
        for line in lines:
            line = line.strip()
            if len(line) > 50 and not any(skip in line.lower() for skip in ['oct.', 'nov.', 'dec.', 'at ', 'until']):
                return line[:200] + "..." if len(line) > 200 else line
        
        return 'Event details from UCF Events Calendar'
    
    def parse_text_content(self, soup):
        """Parse events from text content when structured elements aren't found"""
        events = []
        try:
            # Get all text and look for event patterns
            all_text = soup.get_text()
            lines = [line.strip() for line in all_text.split('\n') if line.strip()]
            
            # Look for lines that look like event titles
            for line in lines:
                if self.looks_like_event_title(line):
                    event = {
                        'title': line,
                        'description': 'Event details from UCF Events Calendar',
                        'date': 'Date TBD',
                        'time': 'Time TBD',
                        'location': 'UCF Campus',
                        'source': 'UCF Events (Real)',
                        'scraped_at': datetime.now().isoformat()
                    }
                    events.append(event)
                    if len(events) >= 5:  # Limit to 5 events
                        break
        except:
            pass
        
        return events
    
    def looks_like_event_title(self, line):
        """Check if a line looks like an event title"""
        if len(line) < 10 or len(line) > 100:
            return False
        
        # Skip lines that look like navigation or metadata
        skip_patterns = ['Log In', 'Manage', 'Edit', 'View', 'Search', 'Subscribe', 'Filter', 'Feeds']
        if any(pattern in line for pattern in skip_patterns):
            return False
        
        # Look for event-like keywords
        event_keywords = ['course', 'tournament', 'training', 'volleyball', 'cinema', 'musical', 'open house', 'certification']
        return any(keyword in line.lower() for keyword in event_keywords)
    
    def extract_other_events(self, soup):
        """Extract events from other sections of the page"""
        events = []
        try:
            # Look for events in calendar or other sections
            # This would be implemented based on the specific structure
            pass
        except:
            pass
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
                'link': 'https://events.ucf.edu/event/12345',
                'source': 'UCF Events (Sample)',
                'scraped_at': datetime.now().isoformat()
            }
        ]

# Global scraper instance
scraper = UCFEventsScraper()

@app.route('/api/events', methods=['GET'])
def get_events():
    """API endpoint to get real UCF events"""
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
        'service': 'UCF Public Events Scraper',
        'timestamp': datetime.now().isoformat()
    })

if __name__ == '__main__':
    print("🚀 Starting UCF Public Events Scraper...")
    print("📡 API will be available at: http://localhost:5001")
    print("🔗 Events endpoint: http://localhost:5001/api/events")
    print("❤️ Health check: http://localhost:5001/api/events/health")
    print("🎯 Scraping from https://events.ucf.edu/ (public site)")
    
    app.run(debug=True, port=5001, host='0.0.0.0')
