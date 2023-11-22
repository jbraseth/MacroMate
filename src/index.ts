import { defineAIPluginManifest } from 'chatgpt-plugin';
import { OpenAPIRouter } from '@cloudflare/itty-router-openapi';

import pkg from '../package.json';

const router = OpenAPIRouter({
  schema: {
    info: {
      title: pkg.aiPlugin.name,
      description: pkg.aiPlugin.description,
      version: pkg.version
    }
  }
});

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Content-Type': 'text/plain'
};

const preflightHeaders = {
  ...headers,
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};


router.get('/.well-known/ai-plugin.json', (request: Request) => {
  const host = request.headers.get('host');
  const pluginManifest = defineAIPluginManifest({
    schema_version: 'v1',
    name_for_model: 'MacroMate',
    name_for_human: 'MacroMate',
    description_for_model: pkg.aiPlugin.description_for_model,
    description_for_human: pkg.description,
    auth: {
      type: 'oauth',
      authorization_url: `https://${host}/mfp-auth`,
      scope: 'basic activity',
    },
    api: {
      type: 'openapi',
      url: `https://${host}/openapi.json`,
      has_user_authentication: true
    },
    logo_url: 'https://yourdomain.com/logo.png',
    contact_email: 'contact@yourdomain.com',
    legal_info_url: 'https://yourdomain.com/legal'
  }, {
    openAPIUrl: `https://${host}/openapi.json`
  });

  return new Response(JSON.stringify(pluginManifest, null, 2), {
    headers: {
      'content-type': 'application/json;charset=UTF-8'
    }
  });
});

router.get('/mfp-auth', async ({ query }) => {
  const authorizationCode = query.code;

  try {
    // Placeholder for the OAuth implementation
    // Throw an error indicating that OAuth implementation is pending MyFitnessPal API credentials
    throw new Error("OAuth Implementation Pending: Awaiting client credentials (client_id and client_secret) from MyFitnessPal to enable the OAuth exchange.");

    // #region OAuth token exchange logic to be implemented after receiving credentials...

    // const tokenResponse = await fetch('https://api.myfitnesspal.com/oauth2/token', {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/x-www-form-urlencoded',
    //   },
    //   body: new URLSearchParams({
    //     grant_type: 'authorization_code',
    //     code: authorizationCode,
    //     redirect_uri: 'https://www.yourapp.com/mfp-auth',
    //     client_id: 'YOUR_CLIENT_ID', // Replace with your actual client ID
    //     client_secret: 'YOUR_CLIENT_SECRET' // Replace with your actual client secret
    //   })
    // });

    // const tokenData = await tokenResponse.json();

    // if (!tokenResponse.ok) {
    //   throw new Error(tokenData.error_description || 'Error obtaining access token');
    // }
    // return new Response(`OAuth successful. Token: ${tokenData.access_token}`, { headers: headers });
    // #endregion

  } catch (error) {
    return new Response(error.message, { status: 501, headers: headers },);
  }
});

router.post('/mfp-activity', async request => {
    const activityData = await request.json();
    console.log(activityData);
    return new Response('Activity data received.', { status: 200, headers: headers });
});

router.options('/mfp-activity', () => {
  return new Response(null, { headers: preflightHeaders });
});

router.all('*', () => new Response('Not Found', { status: 404 }));

export default {
    fetch: (request) => router.handle(request)
};