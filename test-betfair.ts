import axios from 'axios';

// Test simple para ver el error de certificado
async function testBetfairConnection() {
  console.log('🔍 Probando conexión a Betfair API...\n');

  try {
    // Intento 1: Conexión básica a la API de Betfair
    console.log('1. Probando conexión HTTPS a Betfair...');
    const response = await axios.get('https://api.betfair.com/exchange/betting/json-rpc/v1', {
      timeout: 10000,
      validateStatus: () => true, // Aceptar cualquier status
    });
    console.log('✅ Conexión exitosa a Betfair API');
    console.log('   Status:', response.status);
  } catch (error: any) {
    console.error('❌ Error de conexión:', error.message);
    if (error.code) {
      console.error('   Código de error:', error.code);
    }
    if (error.cause) {
      console.error('   Causa:', error.cause);
    }
  }

  console.log('\n2. Probando login endpoint...');
  try {
    const response = await axios.post(
      'https://identitysso.betfair.es/api/login',
      'username=test&password=test',
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        timeout: 10000,
        validateStatus: () => true,
      }
    );
    console.log('✅ Conexión exitosa a login endpoint');
    console.log('   Status:', response.status);
    console.log('   Response:', response.data);
  } catch (error: any) {
    console.error('❌ Error en login endpoint:', error.message);
    if (error.code) {
      console.error('   Código de error:', error.code);
    }
  }
}

testBetfairConnection();
