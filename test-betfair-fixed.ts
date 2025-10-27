import axios from 'axios';
import https from 'https';

// Configurar agente HTTPS
const httpsAgent = new https.Agent({
  rejectUnauthorized: true, // Mantener seguridad
  keepAlive: true,
});

// Test con configuración mejorada
async function testBetfairConnectionFixed() {
  console.log('🔍 Probando conexión a Betfair API (con fix)...\n');

  try {
    console.log('1. Probando conexión HTTPS a Betfair API...');
    const response = await axios.get('https://api.betfair.com/exchange/betting/json-rpc/v1', {
      timeout: 10000,
      httpsAgent,
      validateStatus: () => true,
    });
    console.log('✅ Conexión exitosa a Betfair API');
    console.log('   Status:', response.status);
  } catch (error: any) {
    console.error('❌ Error de conexión:', error.message);
    if (error.code) {
      console.error('   Código de error:', error.code);
    }
  }

  console.log('\n2. Probando login endpoint...');
  try {
    const response = await axios.post(
      'https://identitysso.betfair.com/api/login',
      'username=test&password=test',
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'X-Application': 'test',
        },
        timeout: 10000,
        httpsAgent,
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

  console.log('\n3. Información del entorno:');
  console.log('   Node version:', process.version);
  console.log('   Platform:', process.platform);
  console.log('   NODE_TLS_REJECT_UNAUTHORIZED:', process.env.NODE_TLS_REJECT_UNAUTHORIZED);
}

testBetfairConnectionFixed();
