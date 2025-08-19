# Fake Data Generation

This script helps you generate realistic fake data for testing the patient dashboard and analytics features.

## What Data is Generated

The script generates 8 months of realistic patient data including:

### Falls Data (3-5 falls over 8 months)
- **Realistic frequency**: Not every day, but spread out over the 8-month period
- **Varied locations**: Living Room, Kitchen, Bathroom, Bedroom, Garden, Stairs, Driveway
- **Different activities**: Walking, Getting up from chair, Showering, Cooking, etc.
- **Various causes**: Slipped on wet floor, Lost balance, Tripped on rug, etc.
- **Different injuries**: Minor bruising, Scraped knee, Sore hip, etc.

### Exercise Logs (32 weeks of data)
- **Weekly exercise minutes**: 30-120 minutes per week (with some weeks having 0)
- **Realistic patterns**: 10% chance of no exercise in a given week
- **Consistent tracking**: Data for every week over the 8-month period

### Screening Data (2-3 screenings over 8 months)
- **Risk assessments**: Various combinations of unsteady, worries, fallen flags
- **Fall counts**: 1-3 falls reported in screenings
- **Injury reports**: Mix of "Minor injuries" and "No injuries"

## How to Use

### Option 1: Use the Setup Script (Recommended)

1. Make sure your backend server is running on port 3000
2. Run the setup script:

```bash
cd backend
node scripts/setup-patient-data.js
```

This will:
- Create the patient account (me@gmail.com / test)
- Generate all the fake data
- Show you a summary of what was created

### Option 2: Manual API Calls

If you prefer to do it manually:

1. **Register the patient account**:
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "me@gmail.com",
    "password": "test",
    "fullName": "Moe Enis",
    "userType": "patient"
  }'
```

2. **Login to get a token**:
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "me@gmail.com",
    "password": "test"
  }'
```

3. **Generate fake data** (replace YOUR_TOKEN with the token from step 2):
```bash
curl -X POST http://localhost:3000/api/generate-fake-data \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Login Credentials

After running the script, you can log in to the app with:
- **Email**: me@gmail.com
- **Password**: test

## Data Realism

The generated data is designed to be realistic for an elderly patient:
- Falls are infrequent but not rare (3-5 over 8 months)
- Exercise patterns vary but generally show some consistency
- Screening data reflects typical risk factors
- All dates are properly distributed over the 8-month period

## Resetting Data

If you want to regenerate the data, simply run the script again. It will:
1. Clear all existing data for the patient
2. Generate fresh data with new random patterns

## Notes

- This feature is intended for development/testing only
- The data is randomly generated, so each run will produce different results
- All data is associated with the patient account (me@gmail.com)
- The script handles both new account creation and existing account scenarios
