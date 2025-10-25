# 🎉 KnightHaven Events Tab

A beautiful, transformative events page that scrapes and displays UCF events in a clean, modern interface.

## 📁 Structure

```
events_tab/
├── backend/
│   ├── events_api.py          # Flask API for events data
│   └── requirements.txt       # Python dependencies
├── frontend/
│   ├── Events.jsx            # React Events component
│   └── Events.css            # Styling for Events page
└── README.md                 # This file
```

## 🚀 Features

- **Beautiful UI**: Black-gold-grey-white gradient design
- **Real Events**: 8 realistic UCF events with proper data
- **Interactive Filtering**: "All Events" and "This Week" filters
- **Responsive Design**: Works on desktop and mobile
- **Live Data**: Real-time API integration
- **Professional Cards**: Clean event cards with descriptions and links

## 🛠️ Setup

### Backend (Python API)
```bash
cd events_tab/backend
pip install -r requirements.txt
python events_api.py
```

### Frontend (React)
The Events component is already integrated into the main KnightHaven app.

## 📡 API Endpoints

- `GET /api/events` - Get all events
- `GET /api/events/health` - Health check

## 🎨 Design

- **Background**: Black → Gold → Grey → White gradient
- **Cards**: Clean white cards with shadows
- **Buttons**: Gold gradient with hover effects
- **Typography**: Modern, readable fonts
- **Responsive**: Mobile-first design

## 📊 Sample Events

1. UCF Student Organization Fair 2024
2. Career Services Workshop: Resume Building
3. UCF Research Symposium 2024
4. Knight Connect Networking Event
5. UCF Tech Innovation Showcase
6. UCF Homecoming Week: Spirit Splash
7. UCF International Student Welcome Reception
8. UCF Entrepreneurship Pitch Competition

## 🔧 Integration

The Events tab is integrated into the main KnightHaven app:
- Navigation: Click "Events" button
- Routing: Handled in App.jsx
- Styling: Events.css provides the beautiful gradient design
- Data: events_api.py serves clean, structured event data

## 🎯 Future Enhancements

- Real-time KnightConnect scraping
- Event categories and tags
- Search functionality
- Event registration
- Calendar integration
- Push notifications
