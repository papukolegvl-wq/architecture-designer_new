import { useState, useRef, useEffect, useCallback } from 'react'
import { Node, Edge } from 'reactflow'
import { HistoryManager } from '../utils/historyManager'

export type HistoryUpdateType = 'standard' | 'immediate' | 'skip' | 'reset'

export function useHistory(nodes: Node[], edges: Edge[], onRestore: (nodes: Node[], edges: Edge[]) => void) {
    const historyManagerRef = useRef(new HistoryManager())
    const isHistoryActionRef = useRef(false)
    const historyUpdateTypeRef = useRef<HistoryUpdateType>('standard')
    const [canUndo, setCanUndo] = useState(false)
    const [canRedo, setCanRedo] = useState(false)

    const updateStatus = useCallback(() => {
        setCanUndo(historyManagerRef.current.canUndo())
        setCanRedo(historyManagerRef.current.canRedo())
    }, [])

    useEffect(() => {
        const updateType = historyUpdateTypeRef.current

        if (updateType === 'skip') {
            historyUpdateTypeRef.current = 'standard'
            return
        }

        if (updateType === 'reset') {
            historyManagerRef.current.initialize(nodes, edges)
            updateStatus()
            historyUpdateTypeRef.current = 'standard'
            return
        }

        const saveState = () => {
            if (isHistoryActionRef.current) return
            historyManagerRef.current.pushState(nodes, edges)
            updateStatus()
            historyUpdateTypeRef.current = 'standard'
        }

        if (updateType === 'immediate') {
            saveState()
        } else {
            const timeoutId = setTimeout(saveState, 500)
            return () => clearTimeout(timeoutId)
        }
    }, [nodes, edges, updateStatus])

    const undo = useCallback(() => {
        const state = historyManagerRef.current.undo()
        if (state) {
            isHistoryActionRef.current = true
            historyUpdateTypeRef.current = 'skip'
            onRestore(state.nodes, state.edges)
            updateStatus()
            setTimeout(() => {
                isHistoryActionRef.current = false
            }, 200)
        }
    }, [onRestore, updateStatus])

    const redo = useCallback(() => {
        const state = historyManagerRef.current.redo()
        if (state) {
            isHistoryActionRef.current = true
            historyUpdateTypeRef.current = 'skip'
            onRestore(state.nodes, state.edges)
            updateStatus()
            setTimeout(() => {
                isHistoryActionRef.current = false
            }, 200)
        }
    }, [onRestore, updateStatus])

    return {
        undo,
        redo,
        canUndo,
        canRedo,
        historyUpdateTypeRef,
        isHistoryActionRef
    }
}
