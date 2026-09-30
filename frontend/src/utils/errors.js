export function getErrorMessage(error, fallback = 'Something went wrong. Please try again.') {
  const data = error?.response?.data
  if (typeof data === 'string' && data.trim()) return data
  if (data?.message) return data.message
  if (error?.message === 'Network Error') return 'Cannot reach the backend. Make sure Spring Boot is running on port 8089.'
  return fallback
}
