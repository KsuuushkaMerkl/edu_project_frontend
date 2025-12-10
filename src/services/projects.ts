import axios from 'axios'

const projectsApi = axios.create({
    baseURL: import.meta.env.VITE_PROJECTS_API_URL,
})

export async function apiGetProjects() {
    const res = await projectsApi.get('/projects')
    return res.data
}
