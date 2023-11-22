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
    // Exchange the authorization code for an access token
    const tokenResponse = await fetch('https://api.myfitnesspal.com/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: authorizationCode,
        redirect_uri: 'https://www.yourapp.com/mfp-auth',
        client_id: 'YOUR_CLIENT_ID', // Replace with your actual client ID
        client_secret: 'YOUR_CLIENT_SECRET' // Replace with your actual client secret
      })
    });

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok) {
      throw new Error(tokenData.error_description || 'Error obtaining access token');
    }

    // TODO store the access token securely and associate it with the user's session
    // For demonstration purposes, we'll just return it in the response
    return new Response(`OAuth successful. Token: ${tokenData.access_token}`);
  } catch (error) {
    return new Response(`OAuth error: ${error.message}`, { status: 500 });
  }
});

router.post('/mfp-activity', async request => {
  const activityData = await request.json(); // Process activity data here
  console.log(activityData);
  return new Response('Activity data received', { status: 200 });
});

router.all('*', () => new Response('Not Found', { status: 404 }));

export default {
    fetch: (request) => router.handle(request)
};
