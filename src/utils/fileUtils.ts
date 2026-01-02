import { Node, Edge } from 'reactflow'

export interface ArchitectureData {
  nodes: Node[]
  edges: Edge[]
  version: string
}

export function saveToFile(nodes: Node[], edges: Edge[]): void {
  // Убеждаемся, что все свойства узлов сохраняются, включая position, width, height
  const nodesToSave = nodes.map(node => ({
    ...node,
    // Явно сохраняем position, чтобы гарантировать его присутствие
    position: node.position || { x: 0, y: 0 },
    // Сохраняем все остальные свойства
    positionAbsolute: node.positionAbsolute,
    width: node.width,
    height: node.height,
    style: node.style,
    data: node.data,
  }))
  
  // Убеждаемся, что все свойства edges сохраняются
  const edgesToSave = edges.map(edge => ({
    ...edge,
    // Сохраняем все свойства edge, включая data с waypoints, pathType и т.д.
    data: edge.data,
    source: edge.source,
    target: edge.target,
    sourceHandle: edge.sourceHandle,
    targetHandle: edge.targetHandle,
  }))
  
  const data: ArchitectureData = {
    nodes: nodesToSave,
    edges: edgesToSave,
    version: '1.0',
  }

  const json = JSON.stringify(data, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `architecture-${new Date().toISOString().split('T')[0]}.json`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export function loadFromFile(file: File): Promise<ArchitectureData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string
        const data = JSON.parse(text) as ArchitectureData
        
        // Валидация данных
        if (!data.nodes || !data.edges) {
          throw new Error('Неверный формат файла')
        }
        
        resolve(data)
      } catch (error) {
        reject(new Error('Ошибка при чтении файла: ' + (error as Error).message))
      }
    }
    reader.onerror = () => reject(new Error('Ошибка при чтении файла'))
    reader.readAsText(file)
  })
}








