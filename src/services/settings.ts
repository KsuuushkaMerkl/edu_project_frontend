import axios from 'axios'

const settingsApi = axios.create({
    baseURL: import.meta.env.VITE_SETTINGS_API_URL,
})

export async function apiGetSettings() {
    const res = await settingsApi.get('/settings')
    return res.data
}
