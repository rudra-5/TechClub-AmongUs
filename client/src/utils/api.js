// API utility to handle both development and production environments
const getServerUrl = () => {
  // In production, use the environment variable
  // In development, use relative URLs (Vite proxy handles it)
  return import.meta.env.VITE_SERVER_URL || ''
}

export const apiCall = async (endpoint, options = {}) => {
  const serverUrl = getServerUrl()
  const url = serverUrl ? `${serverUrl}${endpoint}` : endpoint
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    }
  })
  
  return response
}

export { getServerUrl }
