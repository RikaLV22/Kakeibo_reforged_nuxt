import axios from 'axios'

export default defineNuxtPlugin((nuxtApp) => {
  const api = axios.create({
    baseURL: 'http://localhost:3000'
  })

  let isRedirecting = false

  api.interceptors.request.use((config) => {
    if (import.meta.client) {
      const token = localStorage.getItem('token')

      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    }

    return config
  })

  api.interceptors.response.use(
    response => response,
    async error => {
      const status = error?.response?.status

      if (
        import.meta.client &&
        status === 401 &&
        !isRedirecting
      ) {
        isRedirecting = true

        localStorage.removeItem('token')
        localStorage.removeItem('currentUser')
        localStorage.removeItem('selectedOrganizationId')

        await nuxtApp.runWithContext(() =>
          navigateTo('/login')
        )
      }

      return Promise.reject(error)
    }
  )

  return {
    provide: {
      api
    }
  }
})
