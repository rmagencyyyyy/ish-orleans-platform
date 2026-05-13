const registrationRequestApiUrl = import.meta.env.VITE_REGISTRATION_REQUEST_API_URL
const registrationRequestApiToken = import.meta.env.VITE_REGISTRATION_REQUEST_API_TOKEN

export async function sendRegistrationRequest(payload) {
  if (!registrationRequestApiUrl) {
    throw new Error('URL API manquante pour l’envoi de la demande.')
  }

  const response = await fetch(registrationRequestApiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${registrationRequestApiToken || ''}`,
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw new Error('Impossible d’envoyer la demande pour le moment.')
  }

  const contentType = response.headers.get('content-type') || ''

  if (contentType.includes('application/json')) {
    return response.json()
  }

  return null
}
