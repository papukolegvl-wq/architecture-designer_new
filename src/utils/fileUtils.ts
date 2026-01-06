import { Node, Edge } from 'reactflow'

export interface ArchitectureData {
  nodes: Node[]
  edges: Edge[]
  version: string
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

export async function saveToFile(nodes: Node[], edges: Edge[], cachedHandle?: any): Promise<any> {
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

  const data: ArchitectureData = {
    nodes: nodesToSave,
    edges: edgesToSave,
    version: '1.0',
  }

  const json = JSON.stringify(data, null, 2)
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')
  const seconds = String(now.getSeconds()).padStart(2, '0')

  const filename = `architecture-${year}-${month}-${day}_${hours}-${minutes}-${seconds}.json`

  try {
    if ('showSaveFilePicker' in window) {
      // Игнорируем cachedHandle, так как пользователь хочет новые файлы при каждом сохранении
      console.log('Showing save file picker for a new file...')
      try {
        // @ts-ignore
        const fileHandle = await window.showSaveFilePicker({
          suggestedName: filename,
          types: [{
            description: 'JSON Files',
            accept: { 'application/json': ['.json'] },
          }],
        })

        // Записываем данные в файл
        console.log('Saving architecture to file...')
        // @ts-ignore
        const writable = await fileHandle.createWritable()
        await writable.write(json)
        await writable.close()

        console.log('File saved successfully using File System Access API')
        return fileHandle
      } catch (pickerError) {
        console.error('Picker error or cancelled:', pickerError)
        // Если пользователь отменил выбор, выходим (не падаем в fallback)
        if ((pickerError as Error).name === 'AbortError') return undefined
        throw pickerError
      }
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

import { LearningProject } from '../types'

export async function saveLearningProject(project: LearningProject, cachedHandle?: any): Promise<any> {
  const json = JSON.stringify(project, null, 2)
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')
  const seconds = String(now.getSeconds()).padStart(2, '0')

  const filename = `learning-project-${year}-${month}-${day}_${hours}-${minutes}-${seconds}.json`

  try {
    if ('showSaveFilePicker' in window) {
      console.log('Showing save file picker for new learning project...')
      // @ts-ignore
      const fileHandle = await window.showSaveFilePicker({
        suggestedName: filename,
        types: [{
          description: 'Learning Project JSON',
          accept: { 'application/json': ['.json'] },
        }],
      })

      // @ts-ignore
      const writable = await fileHandle.createWritable()
      await writable.write(json)
      await writable.close()

      return fileHandle
    }
  } catch (error) {
    console.error('File System Access API error in saveLearningProject:', error)
    if ((error as Error).name === 'AbortError') return undefined
  }

  // Fallback
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

export function loadLearningProject(file: File): Promise<LearningProject> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string
        const data = JSON.parse(text) as LearningProject
        // Basic validation
        if (!data.case || !data.nodes || !data.history) {
          throw new Error('Неверный формат файла обучающего проекта')
        }
        resolve(data)
      } catch (error) {
        reject(new Error('Ошибка при чтении файла проекта: ' + (error as Error).message))
      }
    }
    reader.onerror = () => reject(new Error('Ошибка при чтении файла'))
    reader.readAsText(file)
  })
}

