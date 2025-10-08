import {defineStore} from 'pinia'
import {save, load} from '../utils/persist'

export const useDefectsStore = defineStore('defects', {
    state: () => ({
        defects: load('defects', [])
    }),
    getters: {
        stats: (state) => ({
            total: state.defects.length,
            closed: state.defects.filter(d => d.status === 'Закрыта').length
        })
    },
    actions: {
        addDefect(title, desc, extra = {}) {
            const now = new Date().toISOString()
            const item = {
                id: Date.now(),
                title, desc,
                status: 'Новая',
                priority: extra.priority || 'Средний',
                assignee: extra.assignee || '',
                due: extra.due || '',
                attachments: [],
                comments: [],
                history: [{ts: now, action: 'create', payload: {title, desc, ...extra}}]
            }
            this.defects.push(item)
            save('defects', this.defects)
            return item.id
        },
        updateStatus(id, status) {
            const d = this.defects.find(x => x.id === id);
            if (!d) return
            const now = new Date().toISOString()
            d.history.push({ts: now, action: 'status', payload: {from: d.status, to: status}})
            d.status = status
            save('defects', this.defects)
        },
        updateDefect(id, patch) {
            const d = this.defects.find(x => x.id === id);
            if (!d) return
            const before = {
                title: d.title, desc: d.desc, priority: d.priority,
                assignee: d.assignee, due: d.due, status: d.status
            }
            Object.assign(d, patch)
            const now = new Date().toISOString()
            d.history.push({ts: now, action: 'update', payload: {before, after: patch}})
            save('defects', this.defects)
        },
        addComment(id, text) {
            const d = this.defects.find(x => x.id === id);
            if (!d) return
            const now = new Date().toISOString()
            d.comments.push({id: Date.now(), text})
            d.history.push({ts: now, action: 'comment', payload: {text}})
            save('defects', this.defects)
        },
        attachFiles(id, files) {
            const d = this.defects.find(x => x.id === id);
            if (!d) return
            const now = new Date().toISOString()
            d.attachments.push(...files)
            d.history.push({ts: now, action: 'attach', payload: {count: files.length}})
            save('defects', this.defects)
        },
        removeAttachment(id, name) {
            const d = this.defects.find(x => x.id === id);
            if (!d) return
            d.attachments = d.attachments.filter(f => f.name !== name)
            const now = new Date().toISOString()
            d.history.push({ts: now, action: 'detach', payload: {name}})
            save('defects', this.defects)
        },
        deleteDefect(id) {
            this.defects = this.defects.filter(d => d.id !== id)
            save('defects', this.defects)
        },
        getById(id) {
            return this.defects.find(d => d.id === Number(id)) || null
        }
    }
})
