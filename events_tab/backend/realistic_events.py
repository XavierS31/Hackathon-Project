#!/usr/bin/env python3
"""
Realistic UCF Events Generator
Creates realistic UCF events that look and feel like real KnightConnect data
"""

import random
from datetime import datetime, timedelta
from flask import Flask, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

class RealisticUCFEvents:
    def __init__(self):
        self.event_templates = [
            {
                'title_templates': [
                    'UCF {category} Workshop',
                    '{category} Information Session',
                    'UCF {category} Fair',
                    '{category} Networking Event',
                    'UCF {category} Symposium',
                    '{category} Career Panel',
                    'UCF {category} Showcase',
                    '{category} Student Meeting'
                ],
                'categories': [
                    'Student Organizations', 'Career Services', 'Research', 'Technology',
                    'Engineering', 'Business', 'Arts', 'Sciences', 'Health', 'Education',
                    'International', 'Graduate', 'Undergraduate', 'Leadership', 'Volunteer'
                ],
                'descriptions': [
                    'Join us for an informative session about {topic}. Learn about opportunities, resources, and how to get involved.',
                    'Connect with fellow students and professionals in {field}. This event provides networking opportunities and career insights.',
                    'Discover the latest developments in {topic}. This session covers current trends and future opportunities.',
                    'Learn about {topic} and how it can benefit your academic and professional journey.',
                    'Meet with representatives and learn about {topic}. This is a great opportunity to ask questions and get involved.'
                ],
                'locations': [
                    'Student Union', 'Career Services Center', 'Engineering Building', 'Business Administration Building',
                    'Technology Commons', 'Library', 'Student Union Ballroom', 'Reflecting Pond',
                    'International Student Center', 'Recreation Center', 'Health Sciences Building',
                    'Education Building', 'Arts Building', 'Sciences Building'
                ],
                'times': [
                    '10:00 AM - 11:30 AM', '2:00 PM - 3:30 PM', '6:00 PM - 7:30 PM',
                    '12:00 PM - 1:30 PM', '4:00 PM - 5:30 PM', '7:00 PM - 8:30 PM',
                    '9:00 AM - 10:30 AM', '1:00 PM - 2:30 PM', '5:00 PM - 6:30 PM'
                ]
            }
        ]
    
    def generate_realistic_events(self):
        """Generate realistic UCF events"""
        events = []
        base_date = datetime.now()
        
        # Generate 8-12 events over the next 2 months
        num_events = random.randint(8, 12)
        
        for i in range(num_events):
            # Random date within next 60 days
            days_ahead = random.randint(1, 60)
            event_date = base_date + timedelta(days=days_ahead)
            
            # Select random template
            template = self.event_templates[0]
            category = random.choice(template['categories'])
            title_template = random.choice(template['title_templates'])
            description_template = random.choice(template['descriptions'])
            
            # Generate event
            event = {
                'title': title_template.format(category=category),
                'description': description_template.format(
                    topic=category.lower(),
                    field=category.lower()
                ),
                'date': event_date.strftime('%B %d, %Y'),
                'time': random.choice(template['times']),
                'location': random.choice(template['locations']),
                'link': f'https://knightconnect.campuslabs.com/engage/event/{random.randint(10000, 99999)}',
                'image': '',
                'source': 'KnightConnect (Realistic)',
                'scraped_at': datetime.now().isoformat()
            }
            
            events.append(event)
        
        # Sort by date
        events.sort(key=lambda x: datetime.strptime(x['date'], '%B %d, %Y'))
        
        return events

# Global generator instance
generator = RealisticUCFEvents()

@app.route('/api/events', methods=['GET'])
def get_events():
    """API endpoint to get realistic UCF events"""
    try:
        events = generator.generate_realistic_events()
        
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
        'service': 'Realistic UCF Events Generator',
        'timestamp': datetime.now().isoformat()
    })

if __name__ == '__main__':
    print("🚀 Starting Realistic UCF Events Generator...")
    print("📡 API will be available at: http://localhost:5001")
    print("🔗 Events endpoint: http://localhost:5001/api/events")
    print("❤️ Health check: http://localhost:5001/api/events/health")
    print("🎯 Generating realistic UCF events (no authentication required)")
    
    app.run(debug=True, port=5001, host='0.0.0.0')
