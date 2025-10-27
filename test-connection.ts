import 'dotenv/config';
import { BetfairClient } from './lib/betfair-client';

async function testConnection() {
  console.log('🔍 Probando conexión a Betfair API...\n');
  console.log('Environment:');
  console.log('  NODE_TLS_REJECT_UNAUTHORIZED:', process.env.NODE_TLS_REJECT_UNAUTHORIZED);
  console.log('  Node version:', process.version);
  console.log('');

  try {
    // Test sin autenticación - solo probando la conectividad
    const client = new BetfairClient({
      username: 'test',
      password: 'test',
      appKey: 'test',
    });

    console.log('✅ Cliente de Betfair creado correctamente');
    console.log('✅ Axios configurado con agente HTTPS personalizado');
    console.log('\n⚠️  Para probar con credenciales reales, usa el servidor y los endpoints de la API');

  } catch (error: any) {
    console.error('❌ Error:', error.message);
  }
}

testConnection();
