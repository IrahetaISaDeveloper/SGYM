async function testPOS() {
  try {
    const API_URL = 'http://localhost:5000/api';

    console.log('1. Registrando usuario Staff de prueba para POS...');
    const testEmail = `staff_pos_${Date.now()}@test.com`;
    
    let staffRes = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Staff POS Tester',
        email: testEmail,
        password: 'staffpassword',
        role: 'Staff'
      })
    });
    const staffData = await staffRes.json();
    if (!staffRes.ok) throw new Error(staffData.message);
    
    const staffToken = staffData.token;
    console.log('✅ Staff registrado con éxito. Token recibido.');

    console.log('\n2. Obteniendo turno activo inicial (debería ser nulo/vacío)...');
    let activeRes = await fetch(`${API_URL}/shifts/active`, {
      headers: { Authorization: `Bearer ${staffToken}` }
    });
    let activeData = await activeRes.json();
    console.log('Active shift:', activeData);

    console.log('\n3. Abriendo un turno de caja con fondo de $150...');
    let openRes = await fetch(`${API_URL}/shifts/open`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        Authorization: `Bearer ${staffToken}` 
      },
      body: JSON.stringify({ initialCash: 150 })
    });
    let openData = await openRes.json();
    if (!openRes.ok) throw new Error(openData.message);
    console.log('✅ Turno abierto:', openData);

    console.log('\n4. Intentando abrir otro turno en paralelo (debería fallar)...');
    let openRes2 = await fetch(`${API_URL}/shifts/open`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        Authorization: `Bearer ${staffToken}` 
      },
      body: JSON.stringify({ initialCash: 50 })
    });
    let openData2 = await openRes2.json();
    if (openRes2.ok) {
      throw new Error('❌ Error: Se permitió abrir un segundo turno de caja en paralelo.');
    } else {
      console.log('✅ Bloqueo correcto:', openData2.message);
    }

    console.log('\n5. Registrando una venta de productos...');
    const products = [
      { name: '💧 Agua Mineral', quantity: 2, price: 1.00 },
      { name: '🔋 Bebida Energética', quantity: 1, price: 2.50 }
    ];
    let saleRes = await fetch(`${API_URL}/shifts/sale`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        Authorization: `Bearer ${staffToken}` 
      },
      body: JSON.stringify({ products })
    });
    let saleData = await saleRes.json();
    if (!saleRes.ok) throw new Error(saleData.message);
    console.log('✅ Venta registrada:', saleData);

    console.log('\n6. Consultando turno activo y verificando sumatoria...');
    let activeCheckRes = await fetch(`${API_URL}/shifts/active`, {
      headers: { Authorization: `Bearer ${staffToken}` }
    });
    let activeCheckData = await activeCheckRes.json();
    if (activeCheckData.totalSales !== 4.50) {
      throw new Error(`❌ Error: totalSales es ${activeCheckData.totalSales}, esperado: 4.50`);
    }
    console.log(`✅ totalSales verificado correctamente: $${activeCheckData.totalSales}`);

    console.log('\n7. Cerrando el turno de caja...');
    let closeRes = await fetch(`${API_URL}/shifts/close`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        Authorization: `Bearer ${staffToken}` 
      }
    });
    let closeData = await closeRes.json();
    if (!closeRes.ok) throw new Error(closeData.message);
    console.log('✅ Turno cerrado exitosamente:', closeData);

    console.log('\n🚀 ¡Pruebas de Caja y POS en el backend exitosas!');
  } catch (error) {
    console.error('❌ Error general durante la prueba:', error.message);
  }
}

testPOS();
