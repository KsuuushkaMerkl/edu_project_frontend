import {defineStore} from 'pinia'
import {save, load} from '../utils/persist'

export const useProjectsStore = defineStore('projects', {
    state: () => ({
        projects: load('projects', [])
    }),
    getters: {
        total: (s) => s.projects.length,
    },
    actions: {
        addProject(name, description = '') {
            const now = new Date().toISOString()
            const p = {
                id: Date.now(),
                name,
                description,
                stages: [],
                attachments: [],
                history: [{ts: now, action: 'create', payload: {name, description}}]
            }
            this.projects.push(p)
            save('projects', this.projects)
            return p.id
        },
        updateProject(id, patch) {
            const p = this.projects.find(x => x.id === id);
            if (!p) return
            const before = {name: p.name, description: p.description}
            Object.assign(p, patch)
            p.history.push({ts: new Date().toISOString(), action: 'update', payload: {before, after: patch}})
            save('projects', this.projects)
        },
        deleteProject(id) {
            this.projects = this.projects.filter(p => p.id !== id)
            save('projects', this.projects)
        },
        addStage(projectId, title) {
            const p = this.projects.find(x => x.id === projectId);
            if (!p) return
            if (p.stages.some(s => s.title === title)) return
            p.stages.push({id: Date.now(), title})
            p.history.push({ts: new Date().toISOString(), action: 'stage_add', payload: {title}})
            save('projects', this.projects)
        },
        removeStage(projectId, stageId) {
            const p = this.projects.find(x => x.id === projectId);
            if (!p) return
            const st = p.stages.find(s => s.id === stageId)
            p.stages = p.stages.filter(s => s.id !== stageId)
            p.history.push({
                ts: new Date().toISOString(),
                action: 'stage_remove',
                payload: {title: st?.title || stageId}
            })
            save('projects', this.projects)
        },
        attachFiles(id, files) {
            const p = this.projects.find(x => x.id === id);
            if (!p) return
            p.attachments.push(...files)
            p.history.push({ts: new Date().toISOString(), action: 'attach', payload: {count: files.length}})
            save('projects', this.projects)
        },
        removeAttachment(id, name) {
            const p = this.projects.find(x => x.id === id);
            if (!p) return
            p.attachments = p.attachments.filter(f => f.name !== name)
            p.history.push({ts: new Date().toISOString(), action: 'detach', payload: {name}})
            save('projects', this.projects)
        },
        getById(id) {
            return this.projects.find(p => p.id === Number(id)) || null
        }
    }
})
