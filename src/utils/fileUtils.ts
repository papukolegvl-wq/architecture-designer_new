import { Node, Edge } from 'reactflow'

export interface ArchitectureData {
  nodes?: Node[]
  edges?: Edge[]
  workspaces?: any[]
  version: string
  type?: string
}

// Помощник для работы с IndexedDB для сохранения дескрипторов файлов/папок
const IDB_NAME = 'architecture-designer-idb'
const STORE_NAME = 'handles'
const HANDLE_KEY = 'architecture-file-handle' // Ключ для конкретного файла

async function getDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(IDB_NAME, 1)
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(STORE_NAME)) {
        request.result.createObjectStore(STORE_NAME)
      }
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

async function setPersistedHandle(handle: any) {
  try {
    const db = await getDB()
    const tx = db.transaction(STORE_NAME, 'readwrite')
    tx.objectStore(STORE_NAME).put(handle, HANDLE_KEY)
    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve(true)
      tx.onerror = () => reject(tx.error)
    })
  } catch (e) {
    console.error('Error persisting handle:', e)
  }
}

export async function getPersistedHandle() {
  try {
    const db = await getDB()
    const tx = db.transaction(STORE_NAME, 'readonly')
    const request = tx.objectStore(STORE_NAME).get(HANDLE_KEY)
    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  } catch (e) {
    console.warn('Error getting persisted handle:', e)
    return null
  }
}

// Помощник для проверки и запроса разрешений на дескриптор файла
async function verifyPermission(fileHandle: any, readWrite: boolean) {
  const options: any = {}
  if (readWrite) {
    options.mode = 'readwrite'
  }

  try {
    // Проверяем, есть ли уже разрешение
    if ((await fileHandle.queryPermission(options)) === 'granted') {
      return true
    }

    // Если нет, запрашиваем разрешение (это вызовет диалог подтверждения доступа)
    if ((await fileHandle.requestPermission(options)) === 'granted') {
      return true
    }
  } catch (error) {
    console.warn('Error in verifyPermission:', error)
  }

  return false
}

// Helper to clean up nodes and edges for saving
export function prepareArchitectureData(nodes: Node[], edges: Edge[], version: string = '1.0'): ArchitectureData {
  const nodesToSave = nodes.map(node => ({
    ...node,
    position: node.position || { x: 0, y: 0 },
    positionAbsolute: node.positionAbsolute,
    width: node.width,
    height: node.height,
    style: node.style,
    data: node.data,
  }))

  const edgesToSave = edges.map(edge => ({
    ...edge,
    data: edge.data,
    source: edge.source,
    target: edge.target,
    sourceHandle: edge.sourceHandle,
    targetHandle: edge.targetHandle,
  }))

  return {
    nodes: nodesToSave,
    edges: edgesToSave,
    version,
  }
}

export async function saveToFile(data: any, cachedHandle?: any): Promise<any> {
  const json = JSON.stringify(data, null, 2)
  const isMultiWorkspace = data.workspaces && Array.isArray(data.workspaces);
  const prefix = isMultiWorkspace ? 'architecture-bundle' : 'architecture';
  const filename = `${prefix}-${new Date().toISOString().split('T')[0]}.json`

  try {
    if ('showSaveFilePicker' in window) {
      let fileHandle;

      // Always show save file picker
      console.log('Showing save file picker...')
      try {
        // @ts-ignore
        fileHandle = await window.showSaveFilePicker({
          suggestedName: filename,
          types: [{
            description: 'JSON Files',
            accept: { 'application/json': ['.json'] },
          }],
        })

      } catch (pickerError) {
        console.error('Picker error or cancelled:', pickerError)
        // If user cancelled, return undefined
        if ((pickerError as Error).name === 'AbortError') return undefined
        throw pickerError
      }

      // Write to file
      console.log('Saving to file...')
      // @ts-ignore
      const writable = await fileHandle.createWritable()
      await writable.write(json)
      await writable.close()

      console.log('File saved successfully using File System Access API')
      return fileHandle
    }
  } catch (error) {
    console.error('File System Access API error in saveToFile:', error)
    if ((error as Error).name === 'AbortError') return undefined
  }

  // Fallback: Классическое скачивание
  console.log('Falling back to legacy download method')
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)

  return undefined
}

export function loadFromFile(file: File): Promise<ArchitectureData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string
        const data = JSON.parse(text) as ArchitectureData

        // Проверяем: либо это старый формат (nodes + edges), либо новый (workspaces)
        const isValidSingle = data.nodes && data.edges;
        const isValidBundle = data.workspaces && Array.isArray(data.workspaces);

        if (!isValidSingle && !isValidBundle) {
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
