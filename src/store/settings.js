import {defineStore} from 'pinia'

const KEY = 'defects-center:stageOptions'

function load() {
    try {
        return JSON.parse(localStorage.getItem(KEY)) || null
    } catch {
        return null
    }
}

function save(v) {
    try {
        localStorage.setItem(KEY, JSON.stringify(v))
    } catch {
    }
}

const DEFAULTS = ['Анализ', 'В разработке', 'Выполнено']

export const useSettingsStore = defineStore('settings', {
    state: () => ({
        stageOptions: load() || DEFAULTS
    }),
    actions: {
        addStageOption(name) {
            const v = name?.trim()
            if (!v) return
            if (!this.stageOptions.includes(v)) {
                this.stageOptions.push(v)
                save(this.stageOptions)
            }
        },
        removeStageOption(name) {
            this.stageOptions = this.stageOptions.filter(x => x !== name)
            save(this.stageOptions)
        },
        resetDefaults() {
            this.stageOptions = DEFAULTS.slice()
            save(this.stageOptions)
        }
    }
})
