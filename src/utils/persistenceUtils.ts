import { Node, Edge } from 'reactflow'
import { Workspace } from '../types'

// Функция для добавления свойств отключения автоматического удаления к edges
export const ensureEdgesNotAutoDeleted = (edgesArray: Edge[]): Edge[] => {
    return edgesArray.map(edge => {
        const edgeData = edge.data ? { ...edge.data } : {}
        if (!edgeData.pathType) {
            edgeData.pathType = 'step'
        }

        const updatedEdge = {
            ...edge,
            data: edgeData,
        }

        return {
            ...updatedEdge,
            deletable: true,
            // @ts-ignore - эти свойства не в типах, но поддерживаются ReactFlow
            deleteOnSourceNodeDelete: true,
            deleteOnTargetNodeDelete: true,
        }
    })
}

// Загружаем из localStorage при инициализации (старый формат)
export const loadFromLocalStorage = (): { nodes: Node[]; edges: Edge[] } => {
    try {
        const saved = localStorage.getItem('architecture-designer-state')
        if (saved) {
            const parsed = JSON.parse(saved)
            const restoredEdges = ensureEdgesNotAutoDeleted(parsed.edges || [])
            return {
                nodes: parsed.nodes || [],
                edges: restoredEdges,
            }
        }
    } catch (error) {
        console.error('Ошибка при загрузке из localStorage:', error)
    }
    return { nodes: [], edges: [] }
}

export const loadWorkspacesFromLocalStorage = (): Workspace[] => {
    try {
        const saved = localStorage.getItem('architecture-designer-workspaces')
        if (saved) {
            const workspaces = JSON.parse(saved) as Workspace[]
            if (workspaces && Array.isArray(workspaces) && workspaces.length > 0) {
                return workspaces.map(w => ({
                    ...w,
                    nodes: w.nodes || [],
                    edges: ensureEdgesNotAutoDeleted(w.edges || [])
                }))
            }
        }
    } catch (error) {
        console.error('Ошибка при загрузке вкладок:', error)
    }

    const savedState = loadFromLocalStorage()
    if (savedState.nodes.length > 0 || savedState.edges.length > 0) {
        return [{ id: '1', name: 'Рабочее пространство 1', nodes: savedState.nodes, edges: savedState.edges }]
    }

    return [{ id: '1', name: 'Рабочее пространство 1', nodes: [], edges: [] }]
}

export const saveWorkspacesToLocalStorage = (workspaces: Workspace[]) => {
    try {
        const serialized = JSON.stringify(workspaces)
        localStorage.setItem('architecture-designer-workspaces', serialized)
    } catch (error) {
        console.error('Ошибка при сохранении вкладок:', error)
    }
}
