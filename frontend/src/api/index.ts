import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:3000',
  timeout: 10000,
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error)
    return Promise.reject(error)
  }
)

export const chatApi = {
  sendMessage: async (message: string) => {
    const response = await api.post('/chat', { message })
    return response.data
  },
}

export const knowledgeApi = {
  search: async (query: string) => {
    const response = await api.get('/knowledge/search', { params: { query } })
    return response.data
  },
}

export default api
