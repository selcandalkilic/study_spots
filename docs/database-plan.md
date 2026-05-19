# Study Spots Database Plan

## Goal

The backend should store study places, users, and reviews.

## Tables

### profiles

Stores public user profile information.

Fields:
- id
- username
- created_at

### places

Stores study spots.

Fields:
- id
- name
- city
- country
- category
- latitude
- longitude
- description
- wifi
- quiet
- opening_hours
- wifi_quality
- outlets
- noise_level
- seating
- laptop_friendly
- solo_study
- group_study
- best_time_to_study
- crowded_times
- created_at

### reviews

Stores user reviews for places.

Fields:
- id
- place_id
- user_id
- rating
- comment
- created_at

## Relationships

- One place can have many reviews.
- One user can write many reviews.
- Each review belongs to one place and one user.

## Later Features

- saved places
- photos
- admin approval for new places
- report incorrect data