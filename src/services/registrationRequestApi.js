export async function sendEnrollmentLink(email, firstName, lastName) {
  const response = await fetch('/api/registration-request', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, firstName, lastName }),
  })

  if (!response.ok) {
    let errorMessage = 'Impossible d’envoyer le lien de pré-inscription.'

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
