import { useState, useEffect, useCallback, useRef } from 'react'
import { Node, Edge, ReactFlowInstance } from 'reactflow'
import { Workspace } from '../types'
import { loadWorkspacesFromLocalStorage, saveWorkspacesToLocalStorage } from '../utils/persistenceUtils'

export function usePersistence() {
    const [workspaces, setWorkspaces] = useState<Workspace[]>(loadWorkspacesFromLocalStorage())
    const [activeWorkspaceId, setActiveWorkspaceId] = useState<string>(() => {
        const savedActiveId = localStorage.getItem('architecture-designer-active-tab')
        if (savedActiveId && workspaces.some(w => w.id === savedActiveId)) {
            return savedActiveId
        }
        return workspaces[0]?.id || '1'
    })

    useEffect(() => {
        localStorage.setItem('architecture-designer-active-tab', activeWorkspaceId)
    }, [activeWorkspaceId])

    const saveWorkspaceState = useCallback((nodes: Node[], edges: Edge[], instance: ReactFlowInstance | null) => {
        const viewport = instance ? instance.getViewport() : { x: 0, y: 0, zoom: 1 }
        setWorkspaces(prev => {
            const updated = prev.map(w =>
                w.id === activeWorkspaceId
                    ? { ...w, nodes, edges, viewport }
                    : w
            )
            saveWorkspacesToLocalStorage(updated)
            return updated
        })
    }, [activeWorkspaceId])

    return {
        workspaces,
        setWorkspaces,
        activeWorkspaceId,
        setActiveWorkspaceId,
        saveWorkspaceState
    }
}
