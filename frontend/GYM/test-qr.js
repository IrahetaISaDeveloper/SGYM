import axios from 'axios';

async function test() {
  try {
    console.log('1. Registering user...');
    const registerRes = await axios.post('http://localhost:5000/api/auth/register', {
      name: 'Test QR 4',
      email: 'testqr4@example.com',
      password: 'password123'
    });
    const token = registerRes.data.token;
    console.log('Token received:', token.substring(0, 20) + '...');

    console.log('2. Generating QR...');
    const qrRes = await axios.get('http://localhost:5000/api/access/generate-qr', {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('QR Response:', qrRes.data);
  } catch (error) {
    console.error('Error:', error.response ? error.response.data : error.message);
  }
}

test();
