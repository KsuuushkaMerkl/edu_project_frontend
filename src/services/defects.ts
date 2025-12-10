import axios from 'axios'

const defectsApi = axios.create({
    baseURL: import.meta.env.VITE_DEFECTS_API_URL,
})

export async function apiGetDefects() {
    const res = await defectsApi.get('/defects')
    return res.data
}
