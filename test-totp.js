import axios from 'axios';
import { authenticator } from 'otplib';

async function testTOTP() {
  try {
    const API_URL = 'http://localhost:5000/api';

    // 1. Create a test user
    console.log('1. Registrando usuario de prueba para TOTP...');
    const testEmail = `test_totp_${Date.now()}@test.com`;
    let userRes;
    try {
      userRes = await axios.post(`${API_URL}/auth/register`, {
        name: 'Tester TOTP',
        email: testEmail,
        password: 'password123'
      });
      console.log('✅ Usuario registrado. Secreto:', userRes.data.totpSecret);
    } catch (err) {
      console.error('Error al registrar:', err.response?.data || err.message);
      return;
    }

    const { _id, totpSecret, token } = userRes.data;

    // We must manually activate the user's membership to avoid "Membresía inactiva" error on scan.
    // For this test, I will just manually insert into the DB or just use an Admin token to renew.
    console.log('\n2. Activando membresía del usuario (simulando Admin)...');
    
    const adminRes = await axios.post(`${API_URL}/auth/register`, {
      name: 'Admin TOTP',
      email: `admin_totp_${Date.now()}@test.com`,
      password: 'adminpassword',
      role: 'Admin'
    });
    const adminToken = adminRes.data.token;

    // GET a plan to renew with
    const plansRes = await axios.get(`${API_URL}/plans`, { headers: { Authorization: `Bearer ${adminToken}` }});
    const planId = plansRes.data[0]._id;

    await axios.post(`${API_URL}/users/${_id}/renew`, {
      planId: planId,
      amount: 100
    }, { headers: { Authorization: `Bearer ${adminToken}` } });

    console.log('✅ Membresía activada.');


    // 3. Generate local TOTP code
    console.log('\n3. Generando código TOTP local...');
    const code = authenticator.generate(totpSecret);
    const qrPayload = JSON.stringify({ id: _id, code: code });
    console.log(`✅ Código generado: ${code}`);

    // 4. Scan QR code via API
    console.log('\n4. Escaneando QR y verificando...');
    const scanRes = await axios.post(`${API_URL}/access/scan`, { token: qrPayload }, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log('✅ Escaneo exitoso:', scanRes.data);

    // 5. Test streaks (doing a second scan should keep streak if same day, we can't easily jump 24h but we can test logic)
    console.log('\n🚀 ¡Prueba del Backend TOTP completada con éxito!');

  } catch (error) {
    console.error('❌ Error general durante la prueba:', error.response?.data || error.message);
  }
}

testTOTP();
