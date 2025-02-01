const fetch = require('node-fetch');

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { action, steamId } = JSON.parse(event.body);

    switch (action) {
      case 'login':
        return await handleSteamLogin(steamId);
      case 'verify':
        return await verifySteamSession(event.headers);
      default:
        return {
          statusCode: 400,
          body: JSON.stringify({ error: 'Invalid action' })
        };
    }
  } catch (error) {
    console.error('Auth error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};

async function handleSteamLogin(steamId) {
  if (!process.env.STEAM_API_KEY) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Steam API key not configured' })
    };
  }

  try {
    const response = await fetch(
      `http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${process.env.STEAM_API_KEY}&steamids=${steamId}`
    );

    if (!response.ok) {
      throw new Error('Steam API request failed');
    }

    const data = await response.json();
    const player = data.response.players[0];

    if (!player) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: 'Steam user not found' })
      };
    }

    // Create a session token
    const token = generateSessionToken(steamId);

    return {
      statusCode: 200,
      body: JSON.stringify({
        token,
        user: {
          steamId: player.steamid,
          name: player.personaname,
          avatar: player.avatarfull,
          profileUrl: player.profileurl
        }
      })
    };
  } catch (error) {
    console.error('Steam login error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to authenticate with Steam' })
    };
  }
}

async function verifySteamSession(headers) {
  const token = headers.authorization?.replace('Bearer ', '');

  if (!token) {
    return {
      statusCode: 401,
      body: JSON.stringify({ error: 'No token provided' })
    };
  }

  try {
    const steamId = verifySessionToken(token);
    
    if (!steamId) {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: 'Invalid token' })
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ valid: true, steamId })
    };
  } catch (error) {
    return {
      statusCode: 401,
      body: JSON.stringify({ error: 'Invalid session' })
    };
  }
}

function generateSessionToken(steamId) {
  // In a production environment, use a proper JWT library
  return Buffer.from(`${steamId}-${Date.now()}`).toString('base64');
}

function verifySessionToken(token) {
  try {
    const decoded = Buffer.from(token, 'base64').toString();
    const [steamId, timestamp] = decoded.split('-');
    
    // Check if the token is not expired (24 hours)
    if (Date.now() - parseInt(timestamp) > 24 * 60 * 60 * 1000) {
      return null;
    }

    return steamId;
  } catch {
    return null;
  }
} 