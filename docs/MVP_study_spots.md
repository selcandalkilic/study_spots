\# Study Spots MVP

\#\# Goal

Study Spots is a responsive web app that helps students find good study places in Linz and Istanbul.

\#\# Target users

Students who want to find libraries, cafes, university spaces, and other quiet places to study.

\#\# First version features

\- Show a map  
\- Show study spots as markers  
\- Filter by city: Linz / Istanbul  
\- Filter by category: Library / Cafe / University / Other  
\- Show place details when clicking a marker  
\- Use a simple JSON file for data

\#\# Not included in MVP

\- Login/register  
\- User reviews  
\- Ratings  
\- Favorites  
\- Backend/database  
\- Route planning

\#\# First cities

\- Linz, Austria  
\- Istanbul, Turkey

\#\# Data structure

Each study spot should have:

\- id  
\- name  
\- city  
\- country  
\- category  
\- latitude  
\- longitude  
\- description  
\- wifi  
\- quiet  
\- openingHours

\#\# Example place

\`\`\`json  
{  
  "id": 1,  
  "name": "JKU Library",  
  "city": "Linz",  
  "country": "Austria",  
  "category": "Library",  
  "latitude": 48.337,  
  "longitude": 14.3209,  
  "description": "University library with quiet study areas.",  
  "wifi": true,  
  "quiet": true,  
  "openingHours": "Mon-Fri 08:00-22:00"  
}

	