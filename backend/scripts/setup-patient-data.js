#!/usr/bin/env node

const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000/api';
const PATIENT_EMAIL = 'me@gmail.com';
const PATIENT_PASSWORD = 'test';
const PATIENT_NAME = 'Moe Enis';

async function setupPatientData() {
  try {
    console.log('🚀 Setting up patient data for Moe Enis...\n');

    // Step 1: Register the patient account
    console.log('1. Registering patient account...');
    const registerResponse = await axios.post(`${API_BASE_URL}/auth/register`, {
      email: PATIENT_EMAIL,
      password: PATIENT_PASSWORD,
      fullName: PATIENT_NAME,
      userType: 'patient'
    });

    console.log('✅ Patient account registered successfully');
    const token = registerResponse.data.token;

    // Step 2: Generate fake data
    console.log('\n2. Generating fake data for the past 8 months...');
    const fakeDataResponse = await axios.post(`${API_BASE_URL}/generate-fake-data`, {}, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('✅ Fake data generated successfully!');
    console.log('\n📊 Generated Data Summary:');
    console.log(`   - User: ${fakeDataResponse.data.user}`);
    console.log(`   - Falls: ${fakeDataResponse.data.fallsGenerated}`);
    console.log(`   - Exercise weeks: ${fakeDataResponse.data.exerciseWeeksGenerated}`);
    console.log(`   - Screenings: ${fakeDataResponse.data.screeningsGenerated}`);
    console.log(`   - Data period: ${fakeDataResponse.data.dataPeriod}`);

    console.log('\n🎉 Setup complete! You can now log in with:');
    console.log(`   Email: ${PATIENT_EMAIL}`);
    console.log(`   Password: ${PATIENT_PASSWORD}`);

  } catch (error) {
    if (error.response?.status === 400 && error.response?.data?.error === 'User already exists') {
      console.log('⚠️  Patient account already exists. Attempting to login and generate data...\n');
      
      try {
        // Try to login with existing account
        const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
          email: PATIENT_EMAIL,
          password: PATIENT_PASSWORD
        });

        const token = loginResponse.data.token;
        console.log('✅ Successfully logged in with existing account');

        // Generate fake data
        console.log('\n2. Generating fake data for the past 8 months...');
        const fakeDataResponse = await axios.post(`${API_BASE_URL}/generate-fake-data`, {}, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        console.log('✅ Fake data generated successfully!');
        console.log('\n📊 Generated Data Summary:');
        console.log(`   - User: ${fakeDataResponse.data.user}`);
        console.log(`   - Falls: ${fakeDataResponse.data.fallsGenerated}`);
        console.log(`   - Exercise weeks: ${fakeDataResponse.data.exerciseWeeksGenerated}`);
        console.log(`   - Screenings: ${fakeDataResponse.data.screeningsGenerated}`);
        console.log(`   - Data period: ${fakeDataResponse.data.dataPeriod}`);

        console.log('\n🎉 Setup complete! You can now log in with:');
        console.log(`   Email: ${PATIENT_EMAIL}`);
        console.log(`   Password: ${PATIENT_PASSWORD}`);

      } catch (loginError) {
        console.error('❌ Error during login:', loginError.response?.data?.error || loginError.message);
        console.log('\n💡 If the password is incorrect, you may need to reset it in the database.');
      }
    } else {
      console.error('❌ Error during setup:', error.response?.data?.error || error.message);
      console.log('\n💡 Make sure the backend server is running on port 3000');
    }
  }
}

// Check if axios is available
try {
  require.resolve('axios');
} catch (e) {
  console.error('❌ axios is not installed. Please install it first:');
  console.log('   npm install axios');
  process.exit(1);
}

setupPatientData();
