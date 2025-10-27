import 'dotenv/config';
import axios from 'axios';
import https from 'https';

const httpsAgent = new https.Agent({
  rejectUnauthorized: process.env.NODE_TLS_REJECT_UNAUTHORIZED !== '0',
  keepAlive: true,
});

console.log('🔍 DIAGNÓSTICO DE BETFAIR API\n');
console.log('Por favor proporciona tus credenciales como argumentos:');
console.log('npx tsx diagnostico.ts <APP_KEY> <SESSION_TOKEN>');
console.log('O:');
console.log('npx tsx diagnostico.ts <APP_KEY> <USERNAME> <PASSWORD>\n');

const [,, appKey, credencial1, credencial2] = process.argv;

if (!appKey) {
  console.error('❌ Error: Debes proporcionar al menos el APP_KEY');
  process.exit(1);
}

async function diagnosticar() {
  console.log('📋 Configuración:');
  console.log('  App Key:', appKey.substring(0, 10) + '...');
  console.log('  Node version:', process.version);
  console.log('  SSL Verification:', process.env.NODE_TLS_REJECT_UNAUTHORIZED === '0' ? 'Disabled' : 'Enabled');
  console.log('');

  // Escenario 1: Con Session Token
  if (credencial1 && !credencial2) {
    console.log('🔑 Probando con SESSION TOKEN...\n');

    try {
      console.log('1. Testing API call con session token...');
      const response = await axios.post(
        'https://api.betfair.com/exchange/betting/json-rpc/v1',
        {
          jsonrpc: '2.0',
          method: 'SportsAPING/v1.0/listEventTypes',
          params: {},
          id: 1,
        },
        {
          headers: {
            'X-Application': appKey,
            'X-Authentication': credencial1,
            'Content-Type': 'application/json',
          },
          httpsAgent,
          validateStatus: () => true,
        }
      );

      console.log('   Status Code:', response.status);
      console.log('   Response:', JSON.stringify(response.data, null, 2));

      if (response.status === 200 && response.data.result) {
        console.log('\n✅ Session token es VÁLIDO!');
        console.log('   Puedes usar este session token en tus peticiones');
      } else if (response.status === 403) {
        console.log('\n❌ Error 403 - FORBIDDEN');
        console.log('   Posibles causas:');
        console.log('   1. Session token expirado (los tokens duran 8-20 horas)');
        console.log('   2. App Key incorrecta o no activada');
        console.log('   3. App Key no tiene permisos para la API');
        console.log('\n   💡 Soluciones:');
        console.log('   1. Obtén un nuevo session token de las cookies de Betfair');
        console.log('   2. Verifica tu App Key en: https://www.betfair.com/exchange/plus/en/api-software');
        console.log('   3. Asegúrate de tener una cuenta con acceso a la API');
      }
    } catch (error: any) {
      console.error('\n❌ Error de conexión:', error.message);
    }
  }

  // Escenario 2: Con Usuario y Contraseña
  if (credencial1 && credencial2) {
    console.log('🔑 Probando LOGIN con USUARIO y CONTRASEÑA...\n');

    try {
      console.log('1. Intentando login...');
      const loginResponse = await axios.post(
        'https://identitysso.betfair.es/api/login',
        new URLSearchParams({
          username: credencial1,
          password: credencial2,
        }).toString(),
        {
          headers: {
            'X-Application': appKey,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          httpsAgent,
          validateStatus: () => true,
        }
      );

      console.log('   Status Code:', loginResponse.status);
      console.log('   Response:', JSON.stringify(loginResponse.data, null, 2));

      if (loginResponse.data.status === 'SUCCESS') {
        console.log('\n✅ LOGIN EXITOSO!');
        console.log('   Token obtenido:', loginResponse.data.token.substring(0, 20) + '...');

        // Probar una llamada a la API
        console.log('\n2. Probando llamada a la API con el token...');
        const apiResponse = await axios.post(
          'https://api.betfair.com/exchange/betting/json-rpc/v1',
          {
            jsonrpc: '2.0',
            method: 'SportsAPING/v1.0/listEventTypes',
            params: {},
            id: 1,
          },
          {
            headers: {
              'X-Application': appKey,
              'X-Authentication': loginResponse.data.token,
              'Content-Type': 'application/json',
            },
            httpsAgent,
            validateStatus: () => true,
          }
        );

        console.log('   Status Code:', apiResponse.status);

        if (apiResponse.status === 200) {
          console.log('\n✅ API FUNCIONANDO CORRECTAMENTE!');
          console.log('   Event Types disponibles:', apiResponse.data.result?.length || 0);
        } else {
          console.log('\n❌ Error en llamada a la API');
          console.log('   Response:', JSON.stringify(apiResponse.data, null, 2));
        }
      } else if (loginResponse.status === 403) {
        console.log('\n❌ Error 403 en LOGIN - FORBIDDEN');
        console.log('   Posibles causas:');
        console.log('   1. App Key incorrecta');
        console.log('   2. App Key no activada para tu cuenta');
        console.log('   3. Usuario o contraseña incorrectos');
        console.log('   4. Cuenta bloqueada o sin permisos de API');
        console.log('\n   💡 Soluciones:');
        console.log('   1. Verifica que el App Key sea correcta');
        console.log('   2. Activa el App Key en: https://www.betfair.com/exchange/plus/en/api-software');
        console.log('   3. Verifica usuario y contraseña');
      } else {
        console.log('\n❌ Login falló:', loginResponse.data.status);
      }
    } catch (error: any) {
      console.error('\n❌ Error de conexión:', error.message);
    }
  }
}

diagnosticar();
