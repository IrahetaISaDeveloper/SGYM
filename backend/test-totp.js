import { TOTP, NobleCryptoPlugin, ScureBase32Plugin } from 'otplib';

const totp = new TOTP({
  crypto: new NobleCryptoPlugin(),
  base32: new ScureBase32Plugin()
});

async function testTOTP() {
  try {
    const API_URL = 'http://localhost:5000/api';

    // 1. Create a test user
    console.log('1. Registrando usuario de prueba para TOTP...');
    const testEmail = `test_totp_${Date.now()}@test.com`;
    
    let userRes = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Tester TOTP',
        email: testEmail,
        password: 'password123'
      })
    });
    const userData = await userRes.json();
    if (!userRes.ok) throw new Error(userData.message);
    
    console.log('✅ Usuario registrado. Secreto:', userData.totpSecret);

    const { _id, totpSecret } = userData;

    console.log('\n2. Activando membresía del usuario (simulando Admin)...');
    
    let adminRes = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Admin TOTP',
        email: `admin_totp_${Date.now()}@test.com`,
        password: 'adminpassword',
        role: 'Admin'
      })
    });
    const adminData = await adminRes.json();
    const adminToken = adminData.token;

    const plansRes = await fetch(`${API_URL}/plans`, { headers: { Authorization: `Bearer ${adminToken}` }});
    const plansData = await plansRes.json();
    const planId = plansData[0]._id;

    await fetch(`${API_URL}/users/${_id}/renew`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}` 
      },
      body: JSON.stringify({ planId, amount: 100 })
    });

    console.log('✅ Membresía activada.');

    console.log('\n3. Generando código TOTP local...');
    const code = await totp.generate({ secret: totpSecret });
    const qrPayload = JSON.stringify({ id: _id, code: code });
    console.log(`✅ Código generado: ${code}`);

    console.log('\n4. Escaneando QR y verificando...');
    const scanRes = await fetch(`${API_URL}/access/scan`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}` 
      },
      body: JSON.stringify({ token: qrPayload })
    });
    const scanData = await scanRes.json();
    if (!scanRes.ok) throw new Error(scanData.message);
    
    console.log('✅ Escaneo exitoso:', scanData);
    console.log('\n🚀 ¡Prueba del Backend TOTP completada con éxito!');

  } catch (error) {
    console.error('❌ Error general durante la prueba:', error.message);
  }
}

testTOTP();
