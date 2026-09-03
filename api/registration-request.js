import process from 'node:process'

const DEFAULT_API_URL =
  'https://api.nschool.app/api/v1/openapi/candidates/send-enrollment-link-by-email'

function sendJson(response, status, body) {
  response.status(status).json(body)
}

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST')
    return sendJson(response, 405, { message: 'Méthode non autorisée.' })
  }

  const apiUrl =
    process.env.REGISTRATION_REQUEST_API_URL ||
    process.env.VITE_REGISTRATION_REQUEST_API_URL ||
    DEFAULT_API_URL
  const apiToken =
    process.env.REGISTRATION_REQUEST_API_TOKEN ||
    process.env.VITE_REGISTRATION_REQUEST_API_TOKEN

  if (!apiToken) {
    console.error('REGISTRATION_REQUEST_API_TOKEN is not configured')
    return sendJson(response, 500, {
      message: 'Le service de pré-inscription n’est pas configuré.',
    })
  }

  const { email, firstName, lastName } = request.body || {}

  if (
    typeof email !== 'string' ||
    typeof firstName !== 'string' ||
    typeof lastName !== 'string' ||
    !email.trim() ||
    !firstName.trim() ||
    !lastName.trim()
  ) {
    return sendJson(response, 400, {
      message: 'Veuillez renseigner tous les champs.',
    })
  }

  try {
    const upstreamResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-System-Token': apiToken.trim(),
      },
      body: JSON.stringify({
        email: email.trim(),
        firstName: firstName.trim(),
        lastName: lastName.trim(),
      }),
    })

    const responseText = await upstreamResponse.text()
    let responseBody = {}

    if (responseText) {
      try {
        responseBody = JSON.parse(responseText)
      } catch {
        responseBody = { message: responseText }
      }
    }

    if (!upstreamResponse.ok) {
      console.error('nSchool API error', upstreamResponse.status, responseText)
      return sendJson(response, upstreamResponse.status, {
        message:
          responseBody.message ||
          (upstreamResponse.status === 403
            ? 'Le service de pré-inscription refuse le token configuré.'
            : 'Impossible d’envoyer le lien de pré-inscription.'),
      })
    }

    return sendJson(response, 200, responseBody)
  } catch (error) {
    console.error('nSchool API request failed', error)
    return sendJson(response, 502, {
      message: 'Le service de pré-inscription est temporairement indisponible.',
    })
  }
}
