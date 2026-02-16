import { Node, Edge } from 'reactflow'

export interface HistoryState {
  nodes: Node[]
  edges: Edge[]
}

export class HistoryManager {
  private history: HistoryState[] = []
  private currentIndex: number = -1
  private maxHistorySize: number = 50

  pushState(nodes: Node[], edges: Edge[]) {
    const nodesCopy = JSON.parse(JSON.stringify(nodes))
    const edgesCopy = JSON.parse(JSON.stringify(edges))

    // Проверяем, отличается ли новое состояние от текущего
    const currentState = this.getCurrentState()
    if (currentState) {
      const isNodesSame = JSON.stringify(currentState.nodes) === JSON.stringify(nodesCopy)
      const isEdgesSame = JSON.stringify(currentState.edges) === JSON.stringify(edgesCopy)
      if (isNodesSame && isEdgesSame) {
        return
      }
    }

    // Удаляем все состояния после текущего индекса (если мы не в конце истории)
    if (this.currentIndex < this.history.length - 1) {
      this.history = this.history.slice(0, this.currentIndex + 1)
    }

    // Добавляем новое состояние
    this.history.push({
      nodes: nodesCopy,
      edges: edgesCopy,
    })

    // Ограничиваем размер истории
    if (this.history.length > this.maxHistorySize) {
      this.history.shift()
    } else {
      this.currentIndex++
    }
  }

  canUndo(): boolean {
    return this.currentIndex > 0
  }

  canRedo(): boolean {
    return this.currentIndex < this.history.length - 1
  }

  undo(): HistoryState | null {
    if (!this.canUndo()) {
      return null
    }
    this.currentIndex--
    return this.history[this.currentIndex]
  }

  redo(): HistoryState | null {
    if (!this.canRedo()) {
      return null
    }
    this.currentIndex++
    return this.history[this.currentIndex]
  }

  getCurrentState(): HistoryState | null {
    if (this.currentIndex >= 0 && this.currentIndex < this.history.length) {
      return this.history[this.currentIndex]
    }
    return null
  }

  clear() {
    this.history = []
    this.currentIndex = -1
  }

  initialize(nodes: Node[], edges: Edge[]) {
    this.clear()
    this.pushState(nodes, edges)
  }
}












