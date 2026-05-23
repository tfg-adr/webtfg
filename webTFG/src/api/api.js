import axios from 'axios'
 
const api = axios.create({
  //baseURL: 'https://webtfgback-production.up.railway.app/api',
  baseURL: 'http://localhost:5034/api',
  headers: { 'Content-Type': 'application/json' }
})
 
export default api