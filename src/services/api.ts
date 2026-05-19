import axios from 'axios'

const api = axios.create({
  baseURL: 'https://pounce-retainer-patchwork.ngrok-free.dev',
})

export default api
