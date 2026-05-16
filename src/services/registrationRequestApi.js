const registrationRequestApiUrl = import.meta.env.VITE_REGISTRATION_REQUEST_API_URL
const registrationRequestApiToken = import.meta.env.VITE_REGISTRATION_REQUEST_API_TOKEN

export async function sendEnrollmentLink(email, firstName, lastName) {
  if (!registrationRequestApiUrl) {
    throw new Error('URL API manquante pour l’envoi de la demande.')
  }

  if (!registrationRequestApiToken) {
    throw new Error('Token API manquant pour l’envoi de la demande.')
  }

  const requestUrl = new URL(registrationRequestApiUrl)
  requestUrl.searchParams.set('systemToken', registrationRequestApiToken)

  const response = await fetch(requestUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, firstName, lastName }),
  })

  if (!response.ok) {
    let errorMessage = 'Failed to send enrollment link'

    try {
      const error = await response.json()
      errorMessage = error.message || errorMessage
    } catch {
      // Keep the fallback message when the API does not return JSON.
    }

    throw new Error(errorMessage)
  }

  return response.json()
}

export function sendRegistrationRequest({ email, firstName, lastName }) {
  return sendEnrollmentLink(email, firstName, lastName)
}
