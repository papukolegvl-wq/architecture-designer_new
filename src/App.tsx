import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react'
import ReactFlow, {
  Node,
  Edge,
  addEdge,
  Connection,
  useNodesState,
  useEdgesState,
  Background,
  Controls,
  ConnectionMode,
  MiniMap,
  NodeTypes,
  NodeProps,
  ReactFlowInstance,

  SelectionMode,
} from 'reactflow'
import 'reactflow/dist/style.css'
import ComponentPalette from './components/ComponentPalette'
import CustomNode from './components/CustomNode'
import SystemNode from './components/SystemNode'
import BusinessDomainNode from './components/BusinessDomainNode'
import ContainerNode from './components/ContainerNode'
import GroupNode from './components/GroupNode'
import NoteNode from './components/NoteNode'
import TextNode from './components/TextNode'
import AnimatedEdge from './components/AnimatedEdge'
import StatisticsPanel from './components/StatisticsPanel'
import SearchEngineConfigPanel from './components/SearchEngineConfigPanel'
import ConfigurationManagementConfigPanel from './components/ConfigurationManagementConfigPanel'
import EventBusConfigPanel from './components/EventBusConfigPanel'
import StreamProcessorConfigPanel from './components/StreamProcessorConfigPanel'
import GraphDatabaseConfigPanel from './components/GraphDatabaseConfigPanel'
import TimeSeriesDatabaseConfigPanel from './components/TimeSeriesDatabaseConfigPanel'
import ServiceMeshConfigPanel from './components/ServiceMeshConfigPanel'
import IdentityProviderConfigPanel from './components/IdentityProviderConfigPanel'
import SecretManagementConfigPanel from './components/SecretManagementConfigPanel'
import MonitoringConfigPanel from './components/MonitoringConfigPanel'
import LoggingConfigPanel from './components/LoggingConfigPanel'
import AnalyticsServiceConfigPanel from './components/AnalyticsServiceConfigPanel'
import BusinessIntelligenceConfigPanel from './components/BusinessIntelligenceConfigPanel'
import VectorDatabaseConfigPanel from './components/VectorDatabaseConfigPanel'
import ConnectionPanel from './components/ConnectionPanel'
import ConnectionTypeSelector from './components/ConnectionTypeSelector'
import DatabaseConfigPanel from './components/DatabaseConfigPanel'
import DatabaseSchemaEditor from './components/DatabaseSchemaEditor'
import TableEditor from './components/TableEditor'
import DatabaseReplicationPanel from './components/DatabaseReplicationPanel'
import CacheConfigPanel from './components/CacheConfigPanel'
import ServiceConfigPanel from './components/ServiceConfigPanel'
import FrontendConfigPanel from './components/FrontendConfigPanel'
import DataWarehouseConfigPanel from './components/DataWarehouseConfigPanel'
import DataWarehouseDataPanel from './components/DataWarehouseDataPanel'
import MessageBrokerConfigPanel from './components/MessageBrokerConfigPanel'
import MessageBrokerMessagesPanel from './components/MessageBrokerMessagesPanel'
import CDNConfigPanel from './components/CDNConfigPanel'
import LambdaConfigPanel from './components/LambdaConfigPanel'
import ObjectStorageConfigPanel from './components/ObjectStorageConfigPanel'
import DataDirectionSelector from './components/ObjectStorageDirectionSelector'
import AuthServiceConfigPanel from './components/AuthServiceConfigPanel'
import FirewallConfigPanel from './components/FirewallConfigPanel'
import LoadBalancerConfigPanel from './components/LoadBalancerConfigPanel'
import ApiGatewayConfigPanel from './components/ApiGatewayConfigPanel'
import ESBConfigPanel from './components/ESBConfigPanel'
import ComponentInfoPanel from './components/ComponentInfoPanel'
import ComparisonPanel from './components/ComparisonPanel'
import RecommendationPanel from './components/RecommendationPanel'
import FilePanel from './components/FilePanel'
import TabsPanel from './components/TabsPanel'
import ClassConfigPanel from './components/ClassConfigPanel'
import ControllerConfigPanel from './components/ControllerConfigPanel'
import RepositoryConfigPanel from './components/RepositoryConfigPanel'
import ComponentLinkPanel from './components/ComponentLinkPanel'
import CommentPanel from './components/CommentPanel'
import LearningPanel from './components/LearningPanel'
import AIAssistantPanel from './components/AIAssistantPanel'
import BackupServiceConfigPanel from './components/BackupServiceConfigPanel'
import QueueConfigPanel from './components/QueueConfigPanel'
import ProxyConfigPanel from './components/ProxyConfigPanel'
import VPNGatewayConfigPanel from './components/VPNGatewayConfigPanel'
import VCSConfigPanel from './components/VCSConfigPanel'
import CICDPipelineConfigPanel from './components/CICDPipelineConfigPanel'
import WebServerConfigPanel from './components/WebServerConfigPanel'
import ContainerConfigPanel from './components/ContainerConfigPanel'
import ServerConfigPanel from './components/ServerConfigPanel'
import BatchProcessorConfigPanel from './components/BatchProcessorConfigPanel'
import ETLServiceConfigPanel from './components/ETLServiceConfigPanel'
import DataLakeConfigPanel from './components/DataLakeConfigPanel'
import IntegrationPlatformConfigPanel from './components/IntegrationPlatformConfigPanel'
import MLServiceConfigPanel from './components/MLServiceConfigPanel'
import NotificationServiceConfigPanel from './components/NotificationServiceConfigPanel'
import EmailServiceConfigPanel from './components/EmailServiceConfigPanel'
import SMSGatewayConfigPanel from './components/SMSGatewayConfigPanel'
import DNSServiceConfigPanel from './components/DNSServiceConfigPanel'
import OrchestratorConfigPanel from './components/OrchestratorConfigPanel'
import ServiceDiscoveryConfigPanel from './components/ServiceDiscoveryConfigPanel'
import LLMModelConfigPanel from './components/LLMModelConfigPanel'
import TrackingReportPanel from './components/TrackingReportPanel'

import { Lock, Unlock, Sun, Moon, Activity, Clock } from 'lucide-react'
import ConnectionMarkers from './components/ConnectionMarkers'
import { AIGeneratedArchitecture } from './utils/geminiService'
import {
  ComponentType, ConnectionType, ComponentData, DatabaseType, NoSQLType,
  ReplicationApproach, ReplicationTool, CacheType, ServiceLanguage,
  FrontendFramework, DataWarehouseVendor, DatabaseVendor, MessageBrokerVendor,
  MessageDeliveryType, CDNVendor, LambdaVendor, ObjectStorageVendor,
  AuthServiceVendor, FirewallVendor, LoadBalancerVendor, ApiGatewayVendor,
  ESBVendor, DatabaseTable, ObjectStorageDirection, ComponentLink,
  EdgePathType, BackupServiceVendor, QueueVendor, ProxyVendor,
  VPNGatewayVendor, VCSVendor, CICDPipelineVendor, WebServerVendor,
  ContainerVendor, ServerVendor, VCSConfig, CICDPipelineConfig,
  WebServerConfig, ContainerConfig, ServerConfig, BatchProcessorVendor,
  ETLServiceVendor, DataLakeVendor, IntegrationPlatformVendor, MLServiceVendor,
  NotificationServiceVendor, EmailServiceVendor, SMSGatewayVendor,
  DNSServiceVendor, OrchestratorVendor, ServiceDiscoveryVendor, LLMModelVendor,
  ResourceEstimate
} from './types'
import ResourceEstimationPanel from './components/ResourceEstimationPanel'
import { saveToFile, loadFromFile, getPersistedHandle, prepareArchitectureData } from './utils/fileUtils'
import { saveToDrawIOFile } from './utils/drawioExport'
import { HistoryManager } from './utils/historyManager'
import html2canvas from 'html2canvas'

const edgeTypes = {
  animated: AnimatedEdge,
}

// Загружаем из localStorage при инициализации
const loadFromLocalStorage = (): { nodes: Node[]; edges: Edge[] } => {
  try {
    const saved = localStorage.getItem('architecture-designer-state')
    if (saved) {
      const parsed = JSON.parse(saved)
      const nodes = (parsed.nodes || []).map((node: Node) => {
        // Восстанавливаем все свойства узла полностью (JSON.parse уже восстановил все свойства)
        const restoredNode: Node = {
          ...node,
          // data уже содержит все конфигурации из JSON, сохраняем как есть
          data: node.data ? { ...node.data } : node.data
        }

        // Восстанавливаем свойства для компонентов типа "system", "external-system" и "business-domain"
        const data = node.data as ComponentData
        if (data && (data.type === 'system' || data.type === 'external-system' || data.type === 'business-domain')) {
          // Убеждаемся, что тип узла установлен правильно
          restoredNode.type = data.type === 'business-domain' ? 'business-domain' : 'system'

          // Восстанавливаем размеры
          if (!restoredNode.width) {
            restoredNode.width = 600
          }
          if (!restoredNode.height) {
            restoredNode.height = 400
          }

          // Восстанавливаем стиль
          if (!restoredNode.style) {
            restoredNode.style = { zIndex: -1 }
          } else if (!restoredNode.style.zIndex) {
            restoredNode.style = { ...restoredNode.style, zIndex: -1 }
          }

          // Восстанавливаем systemConfig (сохраняем существующие childNodes если они есть)
          // Все остальные свойства data уже сохранены через spread выше
          if (!data.systemConfig) {
            restoredNode.data = {
              ...restoredNode.data,
              systemConfig: { childNodes: [] },
            }
          } else {
            // Сохраняем существующие childNodes, все остальные свойства data уже сохранены
            restoredNode.data = {
              ...restoredNode.data,
              systemConfig: {
                childNodes: data.systemConfig.childNodes || [],
              },
            }
          }
        }
        // Для всех остальных компонентов все конфигурации уже сохранены через spread выше
        // Важно: groupId сохраняется автоматически, так как он входит в data и восстанавливается через spread

        return restoredNode
      })

      const systemNodesCount = nodes.filter((n: Node) => {
        const data = n.data as ComponentData
        return data?.type === 'system' || data?.type === 'external-system' || data?.type === 'business-domain'
      }).length

      console.log('Загружено узлов:', nodes.length, 'Узлы типа system:', systemNodesCount)

      // Логируем узлы с конфигурациями
      const nodesWithConfigs = nodes.filter((n: Node) => {
        const data = n.data as ComponentData
        return data && (
          data.databaseConfig ||
          data.cacheConfig ||
          data.serviceConfig ||
          data.frontendConfig ||
          data.dataWarehouseConfig ||
          data.objectStorageConfig ||
          data.messageBrokerConfig ||
          data.cdnConfig ||
          data.lambdaConfig ||
          data.authServiceConfig ||
          data.firewallConfig ||
          data.loadBalancerConfig ||
          data.apiGatewayConfig ||
          data.esbConfig ||
          data.systemConfig
        )
      })

      if (nodesWithConfigs.length > 0) {
        console.log('Загружено узлов с конфигурациями:', nodesWithConfigs.length, nodesWithConfigs.map((n: Node) => {
          const data = n.data as ComponentData
          const configs = []
          if (data.databaseConfig) configs.push('databaseConfig')
          if (data.cacheConfig) configs.push('cacheConfig')
          if (data.serviceConfig) configs.push('serviceConfig')
          if (data.frontendConfig) configs.push('frontendConfig')
          if (data.dataWarehouseConfig) configs.push('dataWarehouseConfig')
          if (data.objectStorageConfig) configs.push('objectStorageConfig')
          if (data.messageBrokerConfig) configs.push('messageBrokerConfig')
          if (data.cdnConfig) configs.push('cdnConfig')
          if (data.lambdaConfig) configs.push('lambdaConfig')
          if (data.authServiceConfig) configs.push('authServiceConfig')
          if (data.firewallConfig) configs.push('firewallConfig')
          if (data.loadBalancerConfig) configs.push('loadBalancerConfig')
          if (data.apiGatewayConfig) configs.push('apiGatewayConfig')
          if (data.esbConfig) configs.push('esbConfig')
          if (data.systemConfig) configs.push('systemConfig')
          return {
            id: n.id,
            type: data?.type,
            configs: configs
          }
        }))
      }

      console.log('Узлы типа system:', nodes.filter((n: Node) => {
        const data = n.data as ComponentData
        return data?.type === 'system' || data?.type === 'external-system' || data?.type === 'business-domain'
      }).map((n: Node) => {
        const nodeData = n.data as ComponentData
        return {
          id: n.id,
          type: n.type,
          width: n.width,
          height: n.height,
          hasStyle: !!n.style,
          childNodes: nodeData?.systemConfig?.childNodes || [],
          childNodesCount: (nodeData?.systemConfig?.childNodes || []).length
        }
      }))

      const restoredEdges = ensureEdgesNotAutoDeleted(parsed.edges || [])

      // Проверяем, что waypoint координаты загружены
      const edgesWithWaypoints = restoredEdges.filter(e => e.data?.waypointX !== undefined && e.data?.waypointY !== undefined)
      if (edgesWithWaypoints.length > 0) {
        console.log('📂 Загружено edges с waypoint:', edgesWithWaypoints.length, edgesWithWaypoints.map(e => ({
          id: e.id,
          waypointX: e.data?.waypointX,
          waypointY: e.data?.waypointY
        })))
      }

      return {
        nodes,
        edges: restoredEdges,
      }
    }
  } catch (error) {
    console.error('Ошибка при загрузке из localStorage:', error)
  }
  return { nodes: [], edges: [] }
}

// Функция для добавления свойств отключения автоматического удаления к edges
const ensureEdgesNotAutoDeleted = (edgesArray: Edge[]): Edge[] => {
  return edgesArray.map(edge => {
    const edgeData = edge.data ? { ...edge.data } : {}
    // Устанавливаем pathType: 'step' для всех edges, если он не указан
    if (!edgeData.pathType) {
      edgeData.pathType = 'step'
    }
    // Сохраняем waypoint координаты, если они есть
    // waypointX и waypointY уже должны быть в edge.data, но убеждаемся что они сохраняются

    const updatedEdge = {
      ...edge,
      data: edgeData, // Сохраняем все данные edge, включая waypointX и waypointY
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

interface Workspace {
  id: string
  name: string
  nodes: Node[]
  edges: Edge[]
  viewport?: { x: number; y: number; zoom: number } // Сохраняем viewport для каждого workspace
  isLocked?: boolean
}

const STORAGE_KEY_META = 'architecture-designer-workspaces-meta'
const STORAGE_KEY_DATA_PREFIX = 'architecture-designer-workspace-data-'

const getWorkspaceKey = (id: string) => `${STORAGE_KEY_DATA_PREFIX}${id}`

const saveWorkspaceData = (workspace: Workspace) => {
  try {
    const data = {
      nodes: workspace.nodes,
      edges: workspace.edges,
      viewport: workspace.viewport
    }
    sessionStorage.setItem(getWorkspaceKey(workspace.id), JSON.stringify(data))
  } catch (error) {
    console.error('Ошибка при сохранении данных вкладки:', error)
  }
}

const removeWorkspaceData = (id: string) => {
  try {
    sessionStorage.removeItem(getWorkspaceKey(id))
  } catch (error) {
    console.error('Ошибка при удалении данных вкладки:', error)
  }
}

const saveWorkspacesMeta = (workspaces: Workspace[]) => {
  try {
    const meta = workspaces.map(w => ({
      id: w.id,
      name: w.name,
      isLocked: w.isLocked
    }))
    sessionStorage.setItem(STORAGE_KEY_META, JSON.stringify(meta))
  } catch (error) {
    console.error('Ошибка при сохранении метаданных вкладок:', error)
  }
}

const loadWorkspacesFromStorage = (): Workspace[] => {
  try {
    // Пробуем загрузить новый формат (метаданные)
    const metaJson = sessionStorage.getItem(STORAGE_KEY_META)
    if (metaJson) {
      const meta = JSON.parse(metaJson)
      if (Array.isArray(meta)) {
        return meta.map((m: any) => {
          const dataJson = sessionStorage.getItem(getWorkspaceKey(m.id))
          const data = dataJson ? JSON.parse(dataJson) : {}
          return {
            ...m,
            nodes: data.nodes || [],
            edges: ensureEdgesNotAutoDeleted(data.edges || []),
            viewport: data.viewport
          }
        })
      }
    }

    // Fallback: пробуем загрузить старый формат
    const saved = sessionStorage.getItem('architecture-designer-workspaces')
    if (saved) {
      const workspaces = JSON.parse(saved) as Workspace[]
      if (workspaces && Array.isArray(workspaces) && workspaces.length > 0) {
        // Миграция: сохраняем в новом формате
        saveWorkspacesMeta(workspaces)
        workspaces.forEach(w => saveWorkspaceData(w))
        sessionStorage.removeItem('architecture-designer-workspaces') // Очистка старого

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
  return [{ id: '1', name: 'Рабочее пространство 1', nodes: [], edges: [] }]
}

const saveWorkspacesToStorage = (workspaces: Workspace[]) => {
  // Сохраняем все (для совместимости с handleLoad и другими массовыми операциями)
  saveWorkspacesMeta(workspaces)
  workspaces.forEach(w => saveWorkspaceData(w))
}

function App() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>(loadWorkspacesFromStorage())
  const [activeWorkspaceId, setActiveWorkspaceId] = useState<string>(() => {
    const savedActiveId = sessionStorage.getItem('architecture-designer-active-tab')
    if (savedActiveId && workspaces.some(w => w.id === savedActiveId)) {
      return savedActiveId
    }
    return workspaces[0]?.id || '1'
  })

  // Состояние отслеживания несохраненных изменений
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  // Предупреждение о закрытии вкладки без сохранения
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        const message = 'Вы не сохраняли свою работу ,хотите сохранить работу  ?'
        e.preventDefault()
        e.returnValue = message
        return message
      }
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [hasUnsavedChanges])

  // Состояние для цветовой схемы (темная/светлая)
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('architecture-designer-theme')
    return saved ? saved === 'dark' : true // По умолчанию темная тема
  })

  // Сохраняем тему в localStorage и применяем класс к корневому элементу
  useEffect(() => {
    localStorage.setItem('architecture-designer-theme', isDarkMode ? 'dark' : 'light')
    const root = document.documentElement
    if (isDarkMode) {
      root.classList.remove('light-theme')
    } else {
      root.classList.add('light-theme')
    }
  }, [isDarkMode])

  // Состояние для отображения анимации связей
  const [showAnimations, setShowAnimations] = useState<boolean>(() => {
    const saved = localStorage.getItem('architecture-designer-show-animations')
    return saved !== 'false' // По умолчанию включено
  })

  // Управление видимостью анимации через глобальные стили
  useEffect(() => {
    localStorage.setItem('architecture-designer-show-animations', String(showAnimations))

    let styleEl = document.getElementById('animation-styles')
    if (!styleEl) {
      styleEl = document.createElement('style')
      styleEl.id = 'animation-styles'
      document.head.appendChild(styleEl)
    }

    styleEl.textContent = showAnimations
      ? ''
      : '.edge-animation-path { display: none !important; }'

  }, [showAnimations])

  const activeWorkspace = workspaces.find(w => w.id === activeWorkspaceId)

  const [nodes, setNodes, onNodesChange] = useNodesState(activeWorkspace?.nodes || [])
  const [edges, setEdges, onEdgesChange] = useEdgesState(activeWorkspace?.edges || [])

  // Сохраняем активную вкладку в sessionStorage
  useEffect(() => {
    sessionStorage.setItem('architecture-designer-active-tab', activeWorkspaceId)
  }, [activeWorkspaceId])
  // Тип обновления истории
  type HistoryUpdateType = 'standard' | 'immediate' | 'skip' | 'reset'
  const historyUpdateTypeRef = useRef<HistoryUpdateType>('standard')

  const historyManagerRef = useRef(new HistoryManager())
  const isHistoryActionRef = useRef(false)
  const edgesToPreserveRef = useRef<Edge[]>([]) // Ref для хранения edges, которые нужно сохранить при удалении узлов
  const [canUndo, setCanUndo] = useState(false)
  const [canRedo, setCanRedo] = useState(false)
  const [showRecommendationPanel, setShowRecommendationPanel] = useState(false)
  const [showLearningPanel, setShowLearningPanel] = useState(false)
  const [showTrackingReport, setShowTrackingReport] = useState(false)
  const [resourceEstimationNode, setResourceEstimationNode] = useState<Node | null>(null)


  useEffect(() => {
    setEdges((currentEdges) => {
      const updatedEdges = ensureEdgesNotAutoDeleted(currentEdges)

      // Обновляем только если есть изменения
      if (updatedEdges.length !== currentEdges.length ||
        updatedEdges.some((e, i) => e.id !== currentEdges[i]?.id ||
          (e as any).deleteOnSourceNodeDelete !== (currentEdges[i] as any)?.deleteOnSourceNodeDelete)) {
        return updatedEdges
      }
      return currentEdges
    })
  }, [edges.length, setEdges]) // Обновляем при изменении количества edges

  // Устанавливаем pathType: 'step' для всех существующих edges, у которых его нет
  useEffect(() => {
    setEdges((currentEdges) => {
      const needsUpdate = currentEdges.some(edge => !edge.data?.pathType)
      if (!needsUpdate) return currentEdges

      return currentEdges.map(edge => {
        if (!edge.data?.pathType) {
          return {
            ...edge,
            data: {
              ...edge.data,
              pathType: 'step',
            },
          }
        }
        return edge
      })
    })
  }, []) // Выполняем только один раз при монтировании

  const handleEdgesChange = useCallback((changes: any) => {
    if (activeWorkspace?.isLocked) return
    onEdgesChange(changes)
  }, [onEdgesChange, activeWorkspace?.isLocked])

  const handleNodesChange = useCallback((changes: any) => {
    if (activeWorkspace?.isLocked) return
    onNodesChange(changes)
  }, [onNodesChange, activeWorkspace?.isLocked])

  const handleToggleLock = useCallback(() => {
    setWorkspaces(prev => {
      const updated = prev.map(w =>
        w.id === activeWorkspaceId
          ? { ...w, isLocked: !w.isLocked }
          : w
      )
      saveWorkspacesMeta(updated)
      return updated
    })
  }, [activeWorkspaceId])

  // Флаг для отслеживания загрузки архитектуры из файла
  const isFileLoadRef = useRef(false)

  // Сохраняем состояние текущей вкладки при изменении nodes или edges
  // Используем debounce для оптимизации - сохраняем не чаще чем раз в секунду
  useEffect(() => {
    if (activeWorkspaceId) {
      const timeoutId = setTimeout(() => {
        // Используем reactFlowInstanceRef для безопасного доступа
        const instance = reactFlowInstanceRef.current || reactFlowInstance
        const viewport = instance ? instance.getViewport() : { x: 0, y: 0, zoom: 1 }

        setWorkspaces(prev => {
          const updated = prev.map(w =>
            w.id === activeWorkspaceId
              ? { ...w, nodes, edges, viewport } // Сохраняем viewport вместе с nodes и edges
              : w
          )

          // Проверяем, что waypoint координаты сохраняются
          const edgesWithWaypoints = edges.filter(e => e.data?.waypointX !== undefined && e.data?.waypointY !== undefined)
          if (edgesWithWaypoints.length > 0) {
            console.log('💾 Сохранение edges с waypoint в localStorage:', edgesWithWaypoints.length, edgesWithWaypoints.map(e => ({
              id: e.id,
              waypointX: e.data?.waypointX,
              waypointY: e.data?.waypointY
            })))
          }

          // Оптимизация: сохраняем ТОЛЬКО данные активной вкладки
          // Это предотвращает сериализацию всех вкладок (что вызывает лаги при работе с большими схемами)
          const params = updated.find(w => w.id === activeWorkspaceId)
          if (params) {
            saveWorkspaceData(params)
          }

          return updated
        })
      }, 1000) // Сохраняем через 1 секунду после последнего изменения

      return () => clearTimeout(timeoutId)
    }
  }, [nodes, edges, activeWorkspaceId]) // Убрали reactFlowInstance из зависимостей

  // Автоматически применяем fitView после загрузки файла
  useEffect(() => {
    if (isFileLoadRef.current && nodes.length > 0) {
      // Даем время на рендеринг узлов
      requestAnimationFrame(() => {
        setTimeout(() => {
          const instance = reactFlowInstanceRef.current
          if (instance && nodes.length > 0) {
            isFileLoadRef.current = false
            try {
              console.log('Применяю fitView в useEffect')
              instance.fitView({
                padding: 0.1, // Небольшой padding
                duration: 0, // Без анимации
                maxZoom: 2, // Разрешаем больший zoom
                minZoom: 0.1, // Разрешаем меньший zoom
                includeHiddenNodes: false
              })
            } catch (error) {
              console.warn('Ошибка при fitView в useEffect:', error)
            }
          }
        }, 100)
      })

      // Дополнительная попытка
      setTimeout(() => {
        const instance = reactFlowInstanceRef.current
        if (instance && nodes.length > 0 && isFileLoadRef.current) {
          isFileLoadRef.current = false
          try {
            console.log('Применяю fitView в useEffect (дополнительная попытка)')
            instance.fitView({
              padding: 0.15,
              duration: 0,
              maxZoom: 1.2,
              minZoom: 0.3,
              includeHiddenNodes: false
            })
          } catch (error) {
            console.warn('Ошибка при fitView в useEffect (дополнительная попытка):', error)
          }
        }
      }, 500)
    }
  }, [nodes.length])

  // Переключение между вкладками
  const handleTabClick = useCallback((tabId: string) => {
    if (tabId === activeWorkspaceId) return // Уже на этой вкладке

    // Сохраняем текущее состояние перед переключением
    setWorkspaces(prev => {
      const updated = prev.map(w =>
        w.id === activeWorkspaceId
          ? { ...w, nodes, edges }
          : w
      )

      // Сохраняем данные текущей вкладки перед переключением
      const currentWorkspace = updated.find(w => w.id === activeWorkspaceId)
      if (currentWorkspace) {
        saveWorkspaceData(currentWorkspace)
      }

      // Переключаемся на новую вкладку
      const newWorkspace = updated.find(w => w.id === tabId)
      if (newWorkspace) {
        setTimeout(() => {
          setActiveWorkspaceId(tabId)
          // Сбрасываем историю для новой вкладки (будет инициализирована при следующем рендере через useEffect)
          historyUpdateTypeRef.current = 'reset'
          setNodes(newWorkspace.nodes)
          setEdges(newWorkspace.edges)
        }, 0)
      }

      return updated
    })
  }, [activeWorkspaceId, nodes, edges, setNodes, setEdges])

  // Создание новой вкладки
  const handleNewTab = useCallback(() => {
    const newId = `workspace-${Date.now()}`
    const newWorkspace: Workspace = {
      id: newId,
      name: `Рабочее пространство ${workspaces.length + 1}`,
      nodes: [],
      edges: [],
    }

    // Сохраняем текущее состояние перед созданием новой вкладки
    setWorkspaces(prev => {
      const updated = prev.map(w =>
        w.id === activeWorkspaceId
          ? { ...w, nodes, edges }
          : w
      )
      const newWorkspaces = [...updated, newWorkspace]

      // Сохраняем метаданные и новую вкладку
      saveWorkspacesMeta(newWorkspaces)
      saveWorkspaceData(newWorkspace)

      // Сохраняем текущую вкладку тоже, так как мы обновили ее состояние в updated
      const currentWorkspace = updated.find(w => w.id === activeWorkspaceId)
      if (currentWorkspace) {
        saveWorkspaceData(currentWorkspace)
      }

      return newWorkspaces
    })

    // Переключаемся на новую вкладку
    setActiveWorkspaceId(newId)
    // Task 1: Гарантируем пустое состояние новой вкладки
    historyUpdateTypeRef.current = 'reset'
    setNodes([])
    setEdges([])
    setTimeout(() => {
      setNodes([])
      setEdges([])
    }, 0)
  }, [workspaces, activeWorkspaceId, nodes, edges, setNodes, setEdges])

  // Переименование вкладки
  const handleTabRename = useCallback((tabId: string, newName: string) => {
    setWorkspaces(prev => {
      const updated = prev.map(w =>
        w.id === tabId
          ? { ...w, name: newName }
          : w
      )
      saveWorkspacesMeta(updated)
      return updated
    })
  }, [])

  // Закрытие вкладки
  const handleTabClose = useCallback((tabId: string) => {
    if (workspaces.length <= 1) {
      // Нельзя закрыть последнюю вкладку
      return
    }

    setWorkspaces(prev => {
      const filtered = prev.filter(w => w.id !== tabId)

      // Сохраняем метаданные и удаляем данные закрытой вкладки
      saveWorkspacesMeta(filtered)
      removeWorkspaceData(tabId)

      // Если закрыли активную вкладку, переключаемся на первую доступную
      if (tabId === activeWorkspaceId) {
        const newActiveId = filtered[0]?.id || '1'
        setActiveWorkspaceId(newActiveId)
        const newWorkspace = filtered.find(w => w.id === newActiveId)
        if (newWorkspace) {
          setNodes(newWorkspace.nodes)
          setEdges(newWorkspace.edges)
        }
      }

      return filtered
    })
  }, [workspaces, activeWorkspaceId, setNodes, setEdges])

  // Логируем загруженные узлы при инициализации
  useEffect(() => {
    const systemNodes = nodes.filter(n => {
      const data = n.data as ComponentData
      return data?.type === 'system' || data?.type === 'external-system'
    })
    console.log('Инициализация: всего узлов:', nodes.length, 'узлов типа system:', systemNodes.length)
    if (systemNodes.length > 0) {
      console.log('Узлы типа system при инициализации:', systemNodes.map(n => ({
        id: n.id,
        type: n.type,
        width: n.width,
        height: n.height,
        hasStyle: !!n.style,
        position: n.position
      })))
    }
  }, []) // Только при монтировании

  // Обертка для onNodesChange, чтобы отправлять события об изменениях и сохранять историю
  const onNodesChangeWithEvents = useCallback(
    (changes: any) => {
      // Task 6: Удалена логика сохранения edges при удалении узлов
      // Мы хотим, чтобы стрелки удалялись вместе с компонентами

      // Обрабатываем перемещение компонентов в группе и обновляем контрольные точки стрелок

      // Обрабатываем перемещение компонентов в группе и обновляем контрольные точки стрелок
      const positionChanges = changes.filter((change: any) => change.type === 'position' && change.dragging)
      if (positionChanges.length > 0) {
        // Собираем информацию о перемещениях узлов для обновления стрелок
        const nodeMovements: Array<{ nodeId: string; deltaX: number; deltaY: number }> = []

        // Получаем множество ID всех перемещаемых узлов (для определения выделенных элементов)
        const movingNodeIds = new Set(positionChanges.map((c: any) => c.id))

        setNodes((nds) => {
          const updatedNodes = nds.map((n: Node) => ({ ...n, position: { ...n.position } }))
          let hasGroupMovement = false

          positionChanges.forEach((change: any) => {
            const nodeIndex = updatedNodes.findIndex((n: Node) => n.id === change.id)
            if (nodeIndex !== -1) {
              const node = updatedNodes[nodeIndex]
              const data = node.data as ComponentData
              const groupId = data?.groupId

              // Находим узел в текущем состоянии для получения старой позиции
              const oldNode = nds.find((n: Node) => n.id === change.id)
              if (oldNode && change.position) {
                const oldPosition = oldNode.position
                const newPosition = change.position
                const deltaX = newPosition.x - oldPosition.x
                const deltaY = newPosition.y - oldPosition.y

                // Сохраняем информацию о перемещении для обновления стрелок
                if (deltaX !== 0 || deltaY !== 0) {
                  nodeMovements.push({ nodeId: change.id, deltaX, deltaY })
                }

                // Если узел входит в группу, перемещаем все узлы группы (включая те, что внутри систем)
                if (groupId) {
                  console.log('Перемещаем узел с groupId:', groupId, 'узел:', change.id)
                  console.log('Дельта перемещения:', deltaX, deltaY, 'для узла:', change.id)

                  // Обновляем позицию текущего узла
                  updatedNodes[nodeIndex].position = newPosition

                  // Перемещаем все узлы с тем же groupId (независимо от того, внутри системы они или нет)
                  let movedCount = 0
                  updatedNodes.forEach((n: Node, index: number) => {
                    const nData = n.data as ComponentData
                    if (nData?.groupId === groupId && n.id !== change.id) {
                      const oldPos = n.position
                      updatedNodes[index].position = {
                        x: n.position.x + deltaX,
                        y: n.position.y + deltaY,
                      }
                      // Также сохраняем информацию о перемещении для узлов в группе
                      nodeMovements.push({ nodeId: n.id, deltaX, deltaY })
                      console.log(`Перемещаем узел ${n.id} из (${oldPos.x}, ${oldPos.y}) в (${updatedNodes[index].position.x}, ${updatedNodes[index].position.y})`)
                      movedCount++
                      hasGroupMovement = true
                    }
                  })
                  console.log('Перемещено узлов в группе:', movedCount, 'из', updatedNodes.length)
                } else {
                  // Если узел не в группе, просто обновляем его позицию
                  updatedNodes[nodeIndex].position = newPosition
                }
              }
            }
          })

          return hasGroupMovement ? updatedNodes : nds
        })

        // Обновляем контрольные точки стрелок для сохранения формы
        if (nodeMovements.length > 0) {
          // Определяем, есть ли перемещения узлов в группе
          const groupIds = new Set<string>()
          const movingNodeIdsSet = new Set(nodeMovements.map(m => m.nodeId))
          // Используем nodes из состояния для получения данных узлов
          nodeMovements.forEach(m => {
            const node = nodes.find(n => n.id === m.nodeId)
            const nodeData = node?.data as ComponentData
            if (nodeData?.groupId) {
              groupIds.add(nodeData.groupId)
            }
          })

          setEdges((eds) =>
            eds.map((edge) => {
              const edgeData = edge.data as any
              const edgeGroupId = edgeData?.groupId

              // Проверяем, связана ли стрелка с перемещенными узлами
              const sourceMovement = nodeMovements.find(m => m.nodeId === edge.source)
              const targetMovement = nodeMovements.find(m => m.nodeId === edge.target)

              // Проверяем, перемещаются ли оба узла edge (выделены и перемещаются вместе)
              const sourceIsMoving = movingNodeIdsSet.has(edge.source)
              const targetIsMoving = movingNodeIdsSet.has(edge.target)
              const bothNodesMoving = sourceIsMoving && targetIsMoving

              // Если edge принадлежит группе или оба узла перемещаются (выделены вместе), обновляем все его waypoints
              const shouldUpdateEdge = sourceMovement || targetMovement || (edgeGroupId && groupIds.has(edgeGroupId)) || bothNodesMoving

              if (shouldUpdateEdge) {
                // Обрабатываем старый формат (одиночный waypoint)
                if (edgeData?.waypointX !== undefined && edgeData?.waypointY !== undefined) {
                  let newWaypointX = edgeData.waypointX
                  let newWaypointY = edgeData.waypointY

                  // Если оба узла перемещены, обновляем контрольную точку пропорционально
                  if (sourceMovement && targetMovement) {
                    // Используем среднее значение дельты для сохранения относительного положения
                    const avgDeltaX = (sourceMovement.deltaX + targetMovement.deltaX) / 2
                    const avgDeltaY = (sourceMovement.deltaY + targetMovement.deltaY) / 2
                    newWaypointX += avgDeltaX
                    newWaypointY += avgDeltaY
                  } else if (sourceMovement) {
                    // Если перемещен только source, обновляем контрольную точку
                    newWaypointX += sourceMovement.deltaX
                    newWaypointY += sourceMovement.deltaY
                  } else if (targetMovement) {
                    // Если перемещен только target, обновляем контрольную точку
                    newWaypointX += targetMovement.deltaX
                    newWaypointY += targetMovement.deltaY
                  } else if (edgeGroupId && groupIds.has(edgeGroupId)) {
                    // Если edge принадлежит группе, но ни source, ни target не перемещены напрямую,
                    // используем среднее значение всех перемещений в группе
                    const avgDeltaX = nodeMovements.reduce((sum, m) => sum + m.deltaX, 0) / nodeMovements.length
                    const avgDeltaY = nodeMovements.reduce((sum, m) => sum + m.deltaY, 0) / nodeMovements.length
                    newWaypointX += avgDeltaX
                    newWaypointY += avgDeltaY
                  }

                  return {
                    ...edge,
                    data: {
                      ...edgeData,
                      waypointX: newWaypointX,
                      waypointY: newWaypointY,
                    },
                  }
                }

                // Обрабатываем новый формат (массив waypoints)
                if (edgeData?.waypoints && Array.isArray(edgeData.waypoints) && edgeData.waypoints.length > 0) {
                  let deltaX = 0
                  let deltaY = 0

                  // Определяем дельту перемещения для waypoints
                  if (sourceMovement && targetMovement) {
                    // Если оба узла перемещены, используем среднее значение
                    deltaX = (sourceMovement.deltaX + targetMovement.deltaX) / 2
                    deltaY = (sourceMovement.deltaY + targetMovement.deltaY) / 2
                  } else if (sourceMovement) {
                    deltaX = sourceMovement.deltaX
                    deltaY = sourceMovement.deltaY
                  } else if (targetMovement) {
                    deltaX = targetMovement.deltaX
                    deltaY = targetMovement.deltaY
                  } else if (edgeGroupId && groupIds.has(edgeGroupId)) {
                    // Если edge принадлежит группе, используем среднее значение всех перемещений
                    deltaX = nodeMovements.reduce((sum, m) => sum + m.deltaX, 0) / nodeMovements.length
                    deltaY = nodeMovements.reduce((sum, m) => sum + m.deltaY, 0) / nodeMovements.length
                  }

                  // Обновляем все waypoints
                  const updatedWaypoints = edgeData.waypoints.map((wp: { x: number; y: number; id?: string }) => ({
                    ...wp,
                    x: wp.x + deltaX,
                    y: wp.y + deltaY,
                  }))

                  return {
                    ...edge,
                    data: {
                      ...edgeData,
                      waypoints: updatedWaypoints,
                    },
                  }
                }

                // Обновляем verticalSegmentX для прямоугольных линий
                if (edgeData?.verticalSegmentX !== undefined) {
                  let deltaX = 0

                  if (sourceMovement && targetMovement) {
                    deltaX = (sourceMovement.deltaX + targetMovement.deltaX) / 2
                  } else if (sourceMovement) {
                    deltaX = sourceMovement.deltaX
                  } else if (targetMovement) {
                    deltaX = targetMovement.deltaX
                  } else if (edgeGroupId && groupIds.has(edgeGroupId)) {
                    deltaX = nodeMovements.reduce((sum, m) => sum + m.deltaX, 0) / nodeMovements.length
                  }

                  return {
                    ...edge,
                    data: {
                      ...edgeData,
                      verticalSegmentX: edgeData.verticalSegmentX + deltaX,
                    },
                  }
                }
              }

              return edge
            })
          )
        }
      }

      onNodesChange(changes)

      // Сохраняем в историю
      if (!isHistoryActionRef.current) {
        const isRemove = changes.some((c: any) => c.type === 'remove')
        const isAdd = changes.some((c: any) => c.type === 'add')
        const isDragStop = changes.some((c: any) => c.type === 'position' && c.dragging === false)

        if (isRemove || isAdd || isDragStop) {
          historyUpdateTypeRef.current = 'immediate'
        } else {
          // Для остальных случаев (например, начало перетаскивания) используем стандартный debounce
          historyUpdateTypeRef.current = 'standard'
        }
      }

      // Проверяем, были ли удалены узлы
      const hasRemovedNodes = changes.some((change: any) => change.type === 'remove')

      // Если были удалены узлы, сохраняем связанные edges, чтобы они не удалились
      if (hasRemovedNodes) {
        const removedNodeIds = changes
          .filter((change: any) => change.type === 'remove')
          .map((change: any) => change.id)

        // Находим все edges, связанные с удаленными узлами
        const edgesToPreserve = edges.filter(edge =>
          removedNodeIds.includes(edge.source) || removedNodeIds.includes(edge.target)
        )

        // Сохраняем edges в ref ДО удаления узлов
        if (edgesToPreserve.length > 0) {
          console.log('Обнаружено удаление узлов в onNodesChangeWithEvents:', removedNodeIds, 'сохраняем', edgesToPreserve.length, 'связанных edges')

          edgesToPreserveRef.current = [...edgesToPreserveRef.current, ...edgesToPreserve.filter(e =>
            !edgesToPreserveRef.current.find(existing => existing.id === e.id)
          )]

          // Восстанавливаем эти edges сразу после применения изменений узлов
          // Используем несколько задержек для гарантии восстановления
          requestAnimationFrame(() => {
            setTimeout(() => {
              setEdges((currentEdges) => {
                const existingEdgeIds = new Set(currentEdges.map(e => e.id))
                const edgesToAdd = edgesToPreserve.filter(e => !existingEdgeIds.has(e.id))

                if (edgesToAdd.length > 0) {
                  console.log('Восстанавливаем', edgesToAdd.length, 'edges из onNodesChangeWithEvents (первая попытка)')
                  return [...currentEdges, ...edgesToAdd]
                }
                return currentEdges
              })
            }, 0)

            // Дополнительное восстановление через небольшую задержку
            setTimeout(() => {
              setEdges((currentEdges) => {
                const existingEdgeIds = new Set(currentEdges.map(e => e.id))
                const edgesToAdd = edgesToPreserve.filter(e => !existingEdgeIds.has(e.id))

                if (edgesToAdd.length > 0) {
                  console.log('✅ Восстановлено', edgesToAdd.length, 'edges (попытка 2)')
                  return [...currentEdges, ...edgesToAdd]
                }
                return currentEdges
              })
            }, 50)

            // Третья попытка восстановления
            setTimeout(() => {
              setEdges((currentEdges) => {
                const existingEdgeIds = new Set(currentEdges.map(e => e.id))
                const edgesToAdd = edgesToPreserve.filter(e => !existingEdgeIds.has(e.id))

                if (edgesToAdd.length > 0) {
                  console.log('✅ Восстановлено', edgesToAdd.length, 'edges (попытка 3)')
                  return [...currentEdges, ...edgesToAdd]
                }
                return currentEdges
              })
            }, 100)
          })
        }
      }

      // Отправляем событие об изменении узлов для обновления систем
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('nodeschange'))
        if (hasRemovedNodes) {
          // Дополнительное событие при удалении узлов для немедленного обновления систем
          window.dispatchEvent(new CustomEvent('nodesremove'))
        }
      }, 50)
    },
    [onNodesChange, nodes, edges, setCanUndo, setCanRedo, setNodes]
  )

  // Обертка для onEdgesChange с сохранением истории
  const onEdgesChangeWithHistory = useCallback(
    (changes: any) => {
      // Применяем изменения
      onEdgesChange(changes)

      // Проверяем, есть ли критические изменения для сохранения истории
      const hasMeaningfulChanges = changes.some((c: any) =>
        c.type !== 'select' && c.type !== 'dimensions' && c.type !== 'position'
      )

      // Для позиционирования сохраняем только при завершении перетаскивания (это сложно отловить тут, 
      // поэтому полагаемся на обработчик onNodeDragStop для истории перемещений)

      if (hasMeaningfulChanges) {
        // История теперь сохраняется централизованно через useEffect([nodes, edges])
      }
    },
    [onEdgesChange, nodes, edges, setCanUndo, setCanRedo]
  )

  // Обработчики Undo/Redo
  const handleUndo = useCallback(() => {
    const state = historyManagerRef.current.undo()
    if (state) {
      isHistoryActionRef.current = true
      historyUpdateTypeRef.current = 'skip'
      setNodes(state.nodes)
      setEdges(state.edges)
      setCanUndo(historyManagerRef.current.canUndo())
      setCanRedo(historyManagerRef.current.canRedo())
      setTimeout(() => {
        isHistoryActionRef.current = false
      }, 200)
    }
  }, [setNodes, setEdges, setCanUndo, setCanRedo])

  const handleRedo = useCallback(() => {
    const state = historyManagerRef.current.redo()
    if (state) {
      isHistoryActionRef.current = true
      historyUpdateTypeRef.current = 'skip'
      setNodes(state.nodes)
      setEdges(state.edges)
      setCanUndo(historyManagerRef.current.canUndo())
      setCanRedo(historyManagerRef.current.canRedo())
      setTimeout(() => {
        isHistoryActionRef.current = false
      }, 200)
    }
  }, [setNodes, setEdges, setCanUndo, setCanRedo])

  const [selectedEdge, setSelectedEdge] = useState<Edge | null>(null)
  const [selectedNodes, setSelectedNodes] = useState<Node[]>([])
  const [copiedNodes, setCopiedNodes] = useState<{ nodes: Node[]; edges: Edge[] } | null>(null)
  const [databaseConfigNode, setDatabaseConfigNode] = useState<Node | null>(null)
  const [databaseSchemaNode, setDatabaseSchemaNode] = useState<Node | null>(null)
  const [tableEditorNode, setTableEditorNode] = useState<Node | null>(null)
  const [vectorDBNode, setVectorDBNode] = useState<Node | null>(null)
  const [showStatistics, setShowStatistics] = useState(false)
  const [cacheConfigNode, setCacheConfigNode] = useState<Node | null>(null)
  const [serviceConfigNode, setServiceConfigNode] = useState<Node | null>(null)
  const [frontendConfigNode, setFrontendConfigNode] = useState<Node | null>(null)
  const [dataWarehouseConfigNode, setDataWarehouseConfigNode] = useState<Node | null>(null)
  const [dataWarehouseDataNode, setDataWarehouseDataNode] = useState<Node | null>(null)
  const [messageBrokerConfigNode, setMessageBrokerConfigNode] = useState<Node | null>(null)
  const [messageBrokerMessagesNode, setMessageBrokerMessagesNode] = useState<Node | null>(null)
  const [addExampleMessage, setAddExampleMessage] = useState(false)
  const [cdnConfigNode, setCdnConfigNode] = useState<Node | null>(null)
  const [lambdaConfigNode, setLambdaConfigNode] = useState<Node | null>(null)
  const [objectStorageConfigNode, setObjectStorageConfigNode] = useState<Node | null>(null)
  const [authServiceConfigNode, setAuthServiceConfigNode] = useState<Node | null>(null)
  const [firewallConfigNode, setFirewallConfigNode] = useState<Node | null>(null)
  const [loadBalancerConfigNode, setLoadBalancerConfigNode] = useState<Node | null>(null)
  const [apiGatewayConfigNode, setApiGatewayConfigNode] = useState<Node | null>(null)
  const [esbConfigNode, setEsbConfigNode] = useState<Node | null>(null)
  const [classConfigNode, setClassConfigNode] = useState<Node | null>(null)
  const [controllerConfigNode, setControllerConfigNode] = useState<Node | null>(null)
  const [repositoryConfigNode, setRepositoryConfigNode] = useState<Node | null>(null)
  const [linkConfigNode, setLinkConfigNode] = useState<Node | null>(null)
  const [backupServiceConfigNode, setBackupServiceConfigNode] = useState<Node | null>(null)
  const [queueConfigNode, setQueueConfigNode] = useState<Node | null>(null)
  const [proxyConfigNode, setProxyConfigNode] = useState<Node | null>(null)
  const [vpnGatewayConfigNode, setVpnGatewayConfigNode] = useState<Node | null>(null)
  const [dnsServiceConfigNode, setDnsServiceConfigNode] = useState<Node | null>(null)
  const [eventBusConfigNode, setEventBusConfigNode] = useState<Node | null>(null)
  const [streamProcessorConfigNode, setStreamProcessorConfigNode] = useState<Node | null>(null)
  const [searchEngineConfigNode, setSearchEngineConfigNode] = useState<Node | null>(null)
  const [graphDatabaseConfigNode, setGraphDatabaseConfigNode] = useState<Node | null>(null)
  const [timeSeriesDatabaseConfigNode, setTimeSeriesDatabaseConfigNode] = useState<Node | null>(null)
  const [serviceMeshConfigNode, setServiceMeshConfigNode] = useState<Node | null>(null)
  const [configurationManagementConfigNode, setConfigurationManagementConfigNode] = useState<Node | null>(null)
  const [ciCdPipelineConfigNode, setCiCdPipelineConfigNode] = useState<Node | null>(null)
  const [identityProviderConfigNode, setIdentityProviderConfigNode] = useState<Node | null>(null)
  const [secretManagementConfigNode, setSecretManagementConfigNode] = useState<Node | null>(null)
  const [integrationPlatformConfigNode, setIntegrationPlatformConfigNode] = useState<Node | null>(null)
  const [batchProcessorConfigNode, setBatchProcessorConfigNode] = useState<Node | null>(null)
  const [etlServiceConfigNode, setEtlServiceConfigNode] = useState<Node | null>(null)
  const [dataLakeConfigNode, setDataLakeConfigNode] = useState<Node | null>(null)
  const [mlServiceConfigNode, setMlServiceConfigNode] = useState<Node | null>(null)
  const [notificationServiceConfigNode, setNotificationServiceConfigNode] = useState<Node | null>(null)
  const [emailServiceConfigNode, setEmailServiceConfigNode] = useState<Node | null>(null)
  const [smsGatewayConfigNode, setSmsGatewayConfigNode] = useState<Node | null>(null)
  const [analyticsServiceConfigNode, setAnalyticsServiceConfigNode] = useState<Node | null>(null)
  const [businessIntelligenceConfigNode, setBusinessIntelligenceConfigNode] = useState<Node | null>(null)
  const [monitoringConfigNode, setMonitoringConfigNode] = useState<Node | null>(null)
  const [loggingConfigNode, setLoggingConfigNode] = useState<Node | null>(null)
  const [vcsConfigNode, setVcsConfigNode] = useState<Node | null>(null)
  const [webServerConfigNode, setWebServerConfigNode] = useState<Node | null>(null)
  const [containerConfigNode, setContainerConfigNode] = useState<Node | null>(null)
  const [serverConfigNode, setServerConfigNode] = useState<Node | null>(null)
  const [orchestratorConfigNode, setOrchestratorConfigNode] = useState<Node | null>(null)
  const [serviceDiscoveryConfigNode, setServiceDiscoveryConfigNode] = useState<Node | null>(null)
  const [llmModelConfigNode, setLlmModelConfigNode] = useState<Node | null>(null)
  const [showAIAssistant, setShowAIAssistant] = useState(false)
  const [commentNode, setCommentNode] = useState<Node | null>(null)
  const [selectedNodeIds, setSelectedNodeIds] = useState<string[]>([])
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null)
  const [infoComponentType, setInfoComponentType] = useState<ComponentType | null>(null)
  const [comparisonType, setComparisonType] = useState<string | null>(null)
  const reactFlowWrapper = useRef<HTMLDivElement>(null)
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null)
  const reactFlowInstanceRef = useRef<ReactFlowInstance | null>(null)
  const systemNodesRestoredRef = useRef(false)

  // Обновляем ref при изменении reactFlowInstance
  useEffect(() => {
    reactFlowInstanceRef.current = reactFlowInstance
  }, [reactFlowInstance])
  const nodesRef = useRef<Node[]>(nodes)
  const edgesRef = useRef<Edge[]>(edges)
  const setLinkConfigNodeRef = useRef(setLinkConfigNode)

  // Обновляем refs при изменении
  useEffect(() => {
    nodesRef.current = nodes
    edgesRef.current = edges
  }, [nodes, edges])

  useEffect(() => {
    setLinkConfigNodeRef.current = setLinkConfigNode
  }, [])




  // Инициализируем историю при первой загрузке
  useEffect(() => {
    if (historyManagerRef.current.getCurrentState() === null && nodesRef.current.length > 0) {
      // Если узлы уже есть при загрузке (например из LS), инициализируем ими
      historyManagerRef.current.initialize(nodesRef.current, edgesRef.current)
      setCanUndo(historyManagerRef.current.canUndo())
      setCanRedo(historyManagerRef.current.canRedo())
    }
  }, [])

  // Загружаем сохраненный дескриптор файла при старте
  useEffect(() => {
    getPersistedHandle().then(handle => {
      if (handle) {
        console.log('Восстановлен дескриптор файла из хранилища')
        fileHandleRef.current = handle
      }
    })
  }, [])

  const [isSpacePressed, setIsSpacePressed] = useState(false)

  const handleComparisonOpen = useCallback((type: ComponentType) => {
    setComparisonType(type)
    setInfoComponentType(null)
  }, [])

  // Универсальное сохранение истории при любых изменениях nodes/edges
  useEffect(() => {
    const updateType = historyUpdateTypeRef.current

    // Если это undo/redo или загрузка файла (которая сама обрабатывает историю/сброс), пропускаем
    if (updateType === 'skip' || isFileLoadRef.current) {
      // После пропуска возвращаем в стандартный режим
      historyUpdateTypeRef.current = 'standard'
      return
    }

    if (updateType === 'reset') {
      console.log('Resetting history for new context')
      historyManagerRef.current.initialize(nodes, edges)
      setCanUndo(historyManagerRef.current.canUndo())
      setCanRedo(historyManagerRef.current.canRedo())
      historyUpdateTypeRef.current = 'standard'
      return
    }

    const saveState = () => {
      historyManagerRef.current.pushState(nodes, edges)
      setCanUndo(historyManagerRef.current.canUndo())
      setCanRedo(historyManagerRef.current.canRedo())
      setHasUnsavedChanges(true)
      // Возвращаем в стандартный режим после сохранения
      historyUpdateTypeRef.current = 'standard'
    }

    if (updateType === 'immediate') {
      saveState()
    } else {
      // 'standard' - debounce
      const timeoutId = setTimeout(saveState, 500)
      return () => clearTimeout(timeoutId)
    }
  }, [nodes, edges])
  const [pendingConnection, setPendingConnection] = useState<{
    source: Node
    target: Node
    params: Connection
  } | null>(null)
  const [pendingObjectStorageDirection, setPendingObjectStorageDirection] = useState<{
    source: Node
    target: Node
    params: Connection
    connectionType: ConnectionType
  } | null>(null)

  // Восстанавливаем свойства узлов типа 'system' после загрузки (только один раз)
  useEffect(() => {
    if (systemNodesRestoredRef.current || nodes.length === 0) return

    // Проверяем, есть ли узлы типа 'system' без необходимых свойств
    const systemNodesToRestore = nodes.filter(node => {
      const data = node.data as ComponentData
      const isSystemType = data?.type === 'system' || data?.type === 'external-system' || data?.type === 'business-domain'
      return isSystemType && (!node.width || !node.height || !node.style || node.type !== 'system')
    })

    if (systemNodesToRestore.length > 0) {
      console.log('Восстанавливаем узлы типа system:', systemNodesToRestore.length)
      systemNodesRestoredRef.current = true
      setNodes((nds) =>
        nds.map((node) => {
          const data = node.data as ComponentData
          const isSystemType = data?.type === 'system' || data?.type === 'external-system' || data?.type === 'business-domain'
          if (isSystemType && (!node.width || !node.height || !node.style || (node.type !== 'system' && node.type !== 'business-domain'))) {
            const expectedType = data?.type === 'business-domain' ? 'business-domain' : 'system'
            const restored = {
              ...node,
              type: expectedType as any,
              width: node.width || 600,
              height: node.height || 400,
              style: node.style || { zIndex: -1 },
              data: {
                ...node.data, // Сохраняем все существующие конфигурации
                ...(data.systemConfig ? {} : { systemConfig: { childNodes: [] } }),
              },
            }
            console.log('Восстановлен узел:', restored.id, 'с конфигурациями:', Object.keys(restored.data || {}).filter(k => k !== 'type' && k !== 'label' && k !== 'connectionType'))
            return restored
          }
          return node
        })
      )
    } else {
      // Если узлы загружены и не требуют восстановления, помечаем как восстановленные
      systemNodesRestoredRef.current = true
    }
  }, [nodes.length, setNodes]) // Выполняется при изменении количества узлов

  // НЕ обновляем позиции систем автоматически при загрузке - используем сохраненные позиции
  // Позиции систем сохраняются вместе с узлами в localStorage

  // Автосохранение теперь происходит через систему вкладок в useEffect выше

  // Слушаем событие открытия редактора схемы
  useEffect(() => {
    const handleOpenSchema = (event: CustomEvent) => {
      const node = nodes.find(n => n.id === event.detail.nodeId)
      if (node) {
        setDatabaseSchemaNode(node)
        setDatabaseConfigNode(null)
      }
    }
    window.addEventListener('openSchemaEditor', handleOpenSchema as EventListener)
    return () => {
      window.removeEventListener('openSchemaEditor', handleOpenSchema as EventListener)
    }
  }, [nodes])

  // Слушаем события обновления узлов (цвет, метки)
  useEffect(() => {
    const handleNodeColorUpdate = (event: CustomEvent) => {
      const { nodeId, color } = event.detail
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === nodeId) {
            return {
              ...node,
              data: { ...node.data, customColor: color },
            }
          }
          return node
        })
      )
    }

    const handleNodeLabelUpdate = (event: CustomEvent) => {
      const { nodeId, label } = event.detail
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === nodeId) {
            return {
              ...node,
              data: { ...node.data, label },
            }
          }
          return node
        })
      )
    }

    const handleNodeSizeUpdate = (event: CustomEvent) => {
      const { nodeId, width, height } = event.detail
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === nodeId) {
            return {
              ...node,
              width,
              height,
              style: { ...node.style, width, height },
            }
          }
          return node
        })
      )
    }

    window.addEventListener('nodeColorUpdate', handleNodeColorUpdate as EventListener)
    window.addEventListener('nodeLabelUpdate', handleNodeLabelUpdate as EventListener)
    window.addEventListener('nodeSizeUpdate', handleNodeSizeUpdate as EventListener)

    return () => {
      window.removeEventListener('nodeColorUpdate', handleNodeColorUpdate as EventListener)
      window.removeEventListener('nodeLabelUpdate', handleNodeLabelUpdate as EventListener)
      window.removeEventListener('nodeSizeUpdate', handleNodeSizeUpdate as EventListener)
    }
  }, [setNodes])

  // Обработчик горячих клавиш для Undo/Redo и управления
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Игнорируем, если фокус в поле ввода (но пропускаем для Escape если нужно)
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return
      }

      const isCtrl = event.ctrlKey || event.metaKey
      const isShift = event.shiftKey
      const key = event.key.toLowerCase()
      const code = event.code

      // Ctrl + Z = Undo (поддержка разных раскладок через code и русский 'я')
      if (isCtrl && !isShift && (key === 'z' || key === 'я' || code === 'KeyZ')) {
        event.preventDefault()
        handleUndo()
      }

      // Ctrl + Y или Ctrl + Shift + Z = Redo
      if ((isCtrl && !isShift && (key === 'y' || key === 'н' || code === 'KeyY')) ||
        (isCtrl && isShift && (key === 'z' || key === 'я' || code === 'KeyZ'))) {
        event.preventDefault()
        handleRedo()
      }

      // Пробел для панорамирования
      if (code === 'Space' && !isSpacePressed) {
        // Мы не делаем preventDefault для пробела везде, только если нужно
        setIsSpacePressed(true)
      }
    }

    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.code === 'Space') {
        setIsSpacePressed(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [handleUndo, handleRedo, isSpacePressed])

  const addComponent = useCallback(
    (type: ComponentType, position?: { x: number; y: number }) => {
      let finalPosition = position

      // Если позиция не указана, добавляем в центр видимой области
      if (!finalPosition && reactFlowInstance) {
        const centerX = window.innerWidth / 2 - 250 // Учитываем ширину палитры
        const centerY = window.innerHeight / 2

        finalPosition = reactFlowInstance.screenToFlowPosition({
          x: centerX,
          y: centerY,
        })
      } else if (!finalPosition) {
        // Если ReactFlow еще не инициализирован, используем дефолтные координаты
        finalPosition = { x: 400, y: 300 }
      }

      const isSystemType = type === 'system' || type === 'external-system' || type === 'business-domain'
      const isContainerType = type === 'container'
      const isGroupType = type === 'group'
      const isTableType = type === 'table'
      const isTextType = type === 'text'
      const isNoteType = type === 'note'

      // Для бизнес-домена определяем уникальный цвет
      let domainColor = '#ffa94d' // Цвет по умолчанию
      if (type === 'business-domain') {
        const existingDomains = nodes.filter(n => {
          const data = n.data as ComponentData
          return data?.type === 'business-domain'
        })
        // Массив цветов для бизнес-доменов
        const domainColors = [
          '#ffa94d', // Оранжевый
          '#51cf66', // Зеленый
          '#4dabf7', // Синий
          '#845ef7', // Фиолетовый
          '#ffd43b', // Желтый
          '#ff6b6b', // Красный
          '#20c997', // Бирюзовый
          '#ff8787', // Розовый
          '#339af0', // Голубой
          '#9c88ff', // Сиреневый
        ]
        domainColor = domainColors[existingDomains.length % domainColors.length]
      }

      const newNode: Node = {
        id: `${type}-${Date.now()}`,
        type: isSystemType ? (type === 'business-domain' ? 'business-domain' : 'system')
          : isContainerType ? 'container'
            : isGroupType ? 'group'
              : isTextType ? 'text'
                : isNoteType ? 'note'
                  : 'custom',
        position: finalPosition,
        data: {
          type,
          label: getComponentLabel(type),
          connectionType: getDefaultConnectionMode(type),
          ...(isSystemType && {
            systemConfig: {
              childNodes: [],
              ...(type === 'business-domain' && { domainColor }),
            }
          }),
          ...(isContainerType && {
            containerConfig: {
              childNodes: []
            }
          }),
          ...(isGroupType && {
            groupConfig: {
              childNodes: [],
              isGrouped: true
            }
          }),
          ...(isTableType && {
            tableConfig: {
              name: 'NewTable',
              columns: [
                { name: 'id', type: 'INTEGER', primaryKey: true, nullable: false }
              ]
            }
          }),
        },
        ...(isSystemType && {
          width: 600,
          height: 400,
          style: { zIndex: -1 },
        }),
        ...(isContainerType && {
          width: 300,
          height: 200,
          style: { zIndex: 0 },
        }),
        ...(isGroupType && {
          width: 400,
          height: 300,
          style: { zIndex: 0 },
        }),
        ...(isNoteType && {
          width: 200,
          height: 150,
          style: { zIndex: 1 },
        }),
        ...(isTextType && {
          width: 200,
          height: 60,
          style: { zIndex: 1 },
        }),
      }
      setNodes((nds) => {
        return nds.concat(newNode)
      })
      historyUpdateTypeRef.current = 'immediate'
    },
    [nodes, reactFlowInstance, setNodes]
  )
  // Явно указываем, что это дискретное действие, требующее немедленного сохранения




  const handleAddComponentClick = useCallback(
    (type: ComponentType) => {
      addComponent(type)
    },
    [addComponent]
  )

  // Храним handle файла, чтобы не спрашивать каждый раз
  const fileHandleRef = useRef<any>(null)

  const handleSave = useCallback(async (selectedWorkspaceIds?: string[]) => {
    try {
      let dataToSave;

      // Если не выбраны конкретные вкладки, сохраняем текущую (совместимость)
      if (!selectedWorkspaceIds || selectedWorkspaceIds.length === 0) {
        dataToSave = prepareArchitectureData(nodes, edges);
      } else if (selectedWorkspaceIds.length === 1) {
        // Сохраняем одну конкретную вкладку
        const idToSave = selectedWorkspaceIds[0];
        const workspace = workspaces.find(w => w.id === idToSave);

        // Если сохраняем текущую активную вкладку, берем данные из стейта (они самые свежие)
        // Если другую - из workspaces
        const currentNodes = idToSave === activeWorkspaceId ? nodes : (workspace?.nodes || []);
        const currentEdges = idToSave === activeWorkspaceId ? edges : (workspace?.edges || []);

        dataToSave = prepareArchitectureData(currentNodes, currentEdges);
      } else {
        // Сохраняем пакет вкладок
        const workspacesToSave = workspaces
          .filter(w => selectedWorkspaceIds.includes(w.id))
          .map(w => {
            const currentNodes = w.id === activeWorkspaceId ? nodes : w.nodes;
            const currentEdges = w.id === activeWorkspaceId ? edges : w.edges;
            const prepared = prepareArchitectureData(currentNodes || [], currentEdges || []);
            return {
              ...w,
              nodes: prepared.nodes,
              edges: prepared.edges,
            };
          });

        dataToSave = {
          workspaces: workspacesToSave,
          version: '1.0',
          type: 'architecture-bundle'
        };
      }

      const handle = await saveToFile(dataToSave, fileHandleRef.current)
      if (handle) {
        fileHandleRef.current = handle
        console.log('Файл успешно сохранен')
        setHasUnsavedChanges(false)
        // alert('Файл сохранен!')
      }
    } catch (err) {
      console.error('Ошибка при сохранении:', err)
      alert('Ошибка при сохранении файла. Попробуйте еще раз.')
    }
  }, [nodes, edges, workspaces, activeWorkspaceId])

  const handleSaveLayout = useCallback((targetWorkspaceIds?: string[]) => {
    // Определяем целевые вкладки (по умолчанию - только текущая)
    // Если передан пустой массив, не сохраняем никуда. Если undefined - сохраняем в текущую.
    const targetIds = targetWorkspaceIds ?? [activeWorkspaceId];

    if (targetIds.length === 0) return;

    // Явно сохраняем текущее размещение всех компонентов через систему вкладок
    // Убеждаемся, что все waypoint координаты, pathType и viewport сохранены
    // Используем reactFlowInstanceRef для безопасного доступа
    const instance = reactFlowInstanceRef.current || reactFlowInstance
    if (!instance) {
      alert('Ошибка: ReactFlow не инициализирован')
      return
    }

    // Получаем текущий viewport для сохранения
    const viewport = instance.getViewport()

    setWorkspaces(prev => {
      // Подготавливаем edges (убеждаемся что pathType сохранен и т.д.)
      // Это берется из ТЕКУЩЕГО состояния редактора
      const edgesToSave = edges.map(edge => {
        const edgeData = edge.data || {}
        return {
          ...edge,
          data: {
            ...edgeData,
            // Убеждаемся, что pathType всегда 'step' (прямоугольная линия)
            pathType: (edgeData.pathType as EdgePathType) || 'step',
            // Сохраняем waypoints (массив точек изгиба), если они есть
            ...(edgeData.waypoints && Array.isArray(edgeData.waypoints) && edgeData.waypoints.length > 0 && {
              waypoints: edgeData.waypoints,
            }),
            // Обратная совместимость: сохраняем старый формат одиночного waypoint
            ...(edgeData.waypointX !== undefined && edgeData.waypointY !== undefined && !edgeData.waypoints && {
              waypointX: edgeData.waypointX,
              waypointY: edgeData.waypointY,
            }),
            // Сохраняем verticalSegmentX для прямоугольных линий без waypoint
            ...(edgeData.verticalSegmentX !== undefined && {
              verticalSegmentX: edgeData.verticalSegmentX,
            }),
          },
        }
      })

      // Обновляем ЦЕЛЕВЫЕ вкладки данными из ТЕКУЩЕГО редактора
      const updated = prev.map(w =>
        targetIds.includes(w.id)
          ? { ...w, nodes, edges: edgesToSave, viewport } // Сохраняем viewport вместе с nodes и edges
          : w
      )

      console.log(`💾 Размещение сохранено в вкладки: ${targetIds.join(', ')} с viewport`, viewport)

      saveWorkspacesToStorage(updated)

      // Событие storage отключено для изоляции вкладок

      return updated
    })
  }, [nodes, edges, activeWorkspaceId, reactFlowInstance])


  const handleLoad = useCallback(
    async (file: File) => {
      try {
        const data = await loadFromFile(file)

        // Проверяем, это пакет вкладок или одиночная архитектура
        if (data.workspaces && Array.isArray(data.workspaces) && data.workspaces.length > 0) {
          console.log('Загрузка пакета вкладок:', data.workspaces.length)

          // Восстанавливаем вкладки
          const restoredWorkspaces = data.workspaces.map((w: any) => ({
            ...w,
            nodes: w.nodes || [],
            edges: ensureEdgesNotAutoDeleted(w.edges || []),
            viewport: w.viewport || { x: 0, y: 0, zoom: 1 }
          }))

          // Обновляем состояние
          setWorkspaces(restoredWorkspaces)
          saveWorkspacesToStorage(restoredWorkspaces)

          // Переключаемся на первую вкладку из загруженных
          const firstWorkspace = restoredWorkspaces[0]
          setActiveWorkspaceId(firstWorkspace.id)

          // Сбрасываем историю
          historyUpdateTypeRef.current = 'reset'
          setNodes(firstWorkspace.nodes)
          setEdges(firstWorkspace.edges)

          // Устанавливаем флаг загрузки для fitView
          isFileLoadRef.current = true

          // Применяем fitView
          requestAnimationFrame(() => {
            setTimeout(() => {
              const instance = reactFlowInstanceRef.current || reactFlowInstance
              if (instance && firstWorkspace.nodes.length > 0) {
                instance.fitView({ padding: 0.15, duration: 0 })
              }
            }, 100)
          })

          alert(`Успешно загружено ${restoredWorkspaces.length} вкладок!`)
          setHasUnsavedChanges(false)
          return
        }

        // --- Старая логика для одиночного файла (загрузка в текущую вкладку) ---

        // Загружаем узлы и проверяем, нужна ли нормализация координат
        const nodes = data.nodes || []
        if (nodes.length === 0) {
          alert('Файл не содержит узлов')
          return
        }

        // Вычисляем границы архитектуры для определения необходимости нормализации
        let minX = Infinity
        let minY = Infinity
        let maxX = -Infinity
        let maxY = -Infinity

        nodes.forEach((node: Node) => {
          if (node.position) {
            const width = node.width || 200
            const height = node.height || 120
            minX = Math.min(minX, node.position.x)
            minY = Math.min(minY, node.position.y)
            maxX = Math.max(maxX, node.position.x + width)
            maxY = Math.max(maxY, node.position.y + height)
          }
        })

        const width = maxX - minX
        const height = maxY - minY

        // НЕ нормализуем координаты - сохраняем оригинальные позиции
        // Это гарантирует, что при загрузке компоненты будут в тех же позициях, что и при сохранении
        console.log('Загрузка архитектуры с оригинальными координатами, узлов:', nodes.length, {
          bounds: { minX, minY, maxX, maxY, width, height }
        })

        // Восстанавливаем все узлы с полным сохранением всех конфигураций и позиций
        const restoredNodes = nodes.map((node: Node) => {
          // Сохраняем оригинальную позицию без изменений
          const originalPosition = node.position || { x: 0, y: 0 }

          // Сохраняем все свойства узла, включая все конфигурации и позиции
          const restoredNode: Node = {
            ...node,
            // Сохраняем оригинальную позицию без изменений
            position: originalPosition,
            // Сохраняем positionAbsolute если оно есть
            positionAbsolute: node.positionAbsolute || undefined,
            // data уже содержит все конфигурации из файла, сохраняем как есть
            data: node.data ? { ...node.data } : node.data,
            // Сохраняем размеры если они есть
            width: node.width,
            height: node.height,
            // Сохраняем стиль если он есть
            style: node.style,
          }

          // Восстанавливаем свойства для компонентов типа "system" и "external-system"
          const nodeData = node.data as ComponentData
          const isSystemType = nodeData?.type === 'system' || nodeData?.type === 'external-system' || nodeData?.type === 'business-domain'
          if (isSystemType) {
            restoredNode.type = nodeData?.type === 'business-domain' ? 'business-domain' : 'system'
            restoredNode.width = node.width || 600
            restoredNode.height = node.height || 400
            restoredNode.style = node.style || { zIndex: -1 }

            // Восстанавливаем systemConfig, сохраняя все остальные свойства data
            if (!nodeData.systemConfig) {
              restoredNode.data = {
                ...restoredNode.data,
                systemConfig: { childNodes: [] },
              }
            } else {
              restoredNode.data = {
                ...restoredNode.data,
                systemConfig: {
                  childNodes: nodeData.systemConfig.childNodes || [],
                },
              }
            }
          }
          // Для всех остальных компонентов все конфигурации уже сохранены через spread выше

          return restoredNode
        })
        // Восстанавливаем edges: сохраняем все свойства, включая waypoints, без нормализации
        const restoredEdges = (data.edges || []).map((edge: Edge) => {
          // Сохраняем все данные edge, включая waypoints, без изменений
          const edgeData = edge.data ? { ...edge.data } : {}
          // Устанавливаем pathType: 'step' для всех edges, если он не указан
          if (!edgeData.pathType) {
            edgeData.pathType = 'step'
          }
          // Сохраняем waypoints без изменений (не применяем нормализацию)
          // waypoints уже сохранены в правильных координатах в файле

          const dataDescription = edgeData.dataDescription as string | undefined
          if (dataDescription && dataDescription.trim()) {
            // Если есть описание, показываем только его
            const connectionType = edge.data?.connectionType as ConnectionType
            const getColor = (type: ConnectionType): string => {
              switch (type) {
                case 'async':
                  return '#ffd43b'
                case 'database-connection':
                  return '#51cf66'
                case 'database-replication':
                  return '#20c997'
                case 'cache-connection':
                  return '#845ef7'
                case 'dependency':
                  return '#9c88ff'
                case 'composition':
                  return '#ff6b6b'
                case 'aggregation':
                  return '#ff8787'
                case 'method-call':
                  return '#51cf66'
                case 'inheritance':
                  return '#4dabf7'
                default:
                  return '#4dabf7'
              }
            }
            return {
              ...edge,
              data: edgeData,
              label: dataDescription.trim(),
              labelStyle: {
                fill: getColor(connectionType || 'rest'),
                fontWeight: 700,
                fontSize: '12px',
                backgroundColor: '#1e1e1e',
                padding: '4px 8px',
                borderRadius: '4px',
                border: `1px solid ${getColor(connectionType || 'rest')}40`,
                whiteSpace: 'pre-line',
                textAlign: 'center' as any,
              },
            }
          }
          // Если нет описания, убираем label и labelStyle, но сохраняем нормализованные данные
          const { label: _, labelStyle: __, ...edgeWithoutLabel } = edge
          return {
            ...edgeWithoutLabel,
            data: edgeData, // edgeData уже содержит pathType: 'step' если его не было
            labelStyle: { textAlign: 'center' as any }
          }
        })

        // Устанавливаем флаг загрузки из файла
        isFileLoadRef.current = true

        // Проверяем, что waypoint координаты сохранены в restoredEdges
        const edgesWithWaypoints = restoredEdges.filter(e => e.data?.waypointX !== undefined && e.data?.waypointY !== undefined)
        if (edgesWithWaypoints.length > 0) {
          console.log('📂 Загружено edges с waypoint из файла:', edgesWithWaypoints.length, edgesWithWaypoints.map(e => ({
            id: e.id,
            waypointX: e.data?.waypointX,
            waypointY: e.data?.waypointY,
            pathType: e.data?.pathType
          })))
        }

        // Загружаем данные в текущую вкладку
        setNodes(restoredNodes)
        setEdges(ensureEdgesNotAutoDeleted(restoredEdges))

        // Обновляем состояние текущей вкладки
        setWorkspaces(prev => {
          const updated = prev.map(w =>
            w.id === activeWorkspaceId
              ? { ...w, nodes: restoredNodes, edges: ensureEdgesNotAutoDeleted(restoredEdges) }
              : w
          )
          saveWorkspacesToStorage(updated)
          return updated
        })

        // Применяем fitView для компактного и читаемого отображения
        // Используем несколько попыток для надежности
        requestAnimationFrame(() => {
          setTimeout(() => {
            const instance = reactFlowInstanceRef.current || reactFlowInstance
            if (instance && restoredNodes.length > 0) {
              try {
                console.log('Применяю fitView для компактного отображения')
                instance.fitView({
                  padding: 0.15, // Умеренный padding для читаемости
                  duration: 0, // Без анимации для мгновенного результата
                  maxZoom: 1.2, // Ограничиваем максимальный zoom для компактности
                  minZoom: 0.3, // Увеличиваем минимальный zoom для читаемости
                  includeHiddenNodes: false
                })
              } catch (error) {
                console.warn('Ошибка при fitView:', error)
              }
            }
          }, 100)
        })

        // Дополнительные попытки для надежности
        setTimeout(() => {
          const instance = reactFlowInstanceRef.current || reactFlowInstance
          if (instance && restoredNodes.length > 0) {
            try {
              console.log('Применяю fitView (дополнительная попытка)')
              instance.fitView({
                padding: 0.15,
                duration: 0,
                maxZoom: 1.2,
                minZoom: 0.3,
                includeHiddenNodes: false
              })
            } catch (error) {
              console.warn('Ошибка при fitView (дополнительная попытка):', error)
            }
          }
        }, 500)

        setTimeout(() => {
          const instance = reactFlowInstanceRef.current || reactFlowInstance
          if (instance && restoredNodes.length > 0) {
            try {
              console.log('Применяю fitView (третья попытка)')
              instance.fitView({
                padding: 0.15,
                duration: 0,
                maxZoom: 1.2,
                minZoom: 0.3,
                includeHiddenNodes: false
              })
            } catch (error) {
              console.warn('Ошибка при fitView (третья попытка):', error)
            }
          }
        }, 1000)

        alert('Архитектура успешно загружена в текущую вкладку!')
        setHasUnsavedChanges(false)
      } catch (error) {
        alert('Ошибка при загрузке файла: ' + (error as Error).message)
      }
    },
    [setNodes, setEdges, activeWorkspaceId, reactFlowInstance, reactFlowInstanceRef]
  )


  const onConnect = useCallback(
    (params: Connection) => {
      if (!params.source || !params.target) return

      const sourceNode = nodes.find((n) => n.id === params.source)
      const targetNode = nodes.find((n) => n.id === params.target)

      if (!sourceNode || !targetNode) return

      // Сохраняем Handle ID для привязки к конкретным сторонам компонента
      // Если Handle не указан, ReactFlow автоматически определит его на основе позиции
      // Поддерживаем привязку к верхней/нижней стороне через Handle ID: "top-source", "bottom-target" и т.д.
      const connectionParams: any = {
        ...params,
        sourceHandle: params.sourceHandle || null,
        targetHandle: params.targetHandle || null,
      }

      // Показываем диалог выбора типа связи
      setPendingConnection({ source: sourceNode, target: targetNode, params: connectionParams })
    },
    [nodes]
  )

  const createConnectionEdge = useCallback(
    (params: Connection, connectionType: ConnectionType, additionalData?: { objectStorageDirection?: ObjectStorageDirection, relationshipType?: '1:1' | '1:n' | 'n:1' | 'n:m' }) => {
      const getLabelText = (type: ConnectionType): string => {
        switch (type) {
          case 'async':
            return 'Async'
          case 'database-connection':
            return 'DB Connection'
          case 'cache-connection':
            return 'Cache'
          case 'dependency':
            return 'Зависимость'
          case 'composition':
            return 'Композиция'
          case 'aggregation':
            return 'Агрегация'
          case 'method-call':
            return 'Вызов метода'
          case 'inheritance':
            return 'Наследование'
          default:
            return type.toUpperCase()
        }
      }

      const getColor = (type: ConnectionType): string => {
        switch (type) {
          case 'async':
            return '#ffd43b'
          case 'database-connection':
            return '#51cf66'
          case 'cache-connection':
            return '#845ef7'
          case 'database-replication':
            return '#20c997'
          case 'dependency':
            return '#9c88ff'
          case 'composition':
            return '#ff6b6b'
          case 'aggregation':
            return '#ff8787'
          case 'method-call':
            return '#51cf66'
          case 'inheritance':
            return '#4dabf7'
          default:
            return '#4dabf7'
        }
      }

      const newEdge: Edge = {
        id: `edge-${params.source}-${params.target}-${Date.now()}`,
        source: params.source!,
        target: params.target!,
        sourceHandle: params.sourceHandle || undefined,
        targetHandle: params.targetHandle || undefined,
        type: 'animated',
        animated: connectionType === 'async' || connectionType === 'database-replication',
        deletable: true,
        // @ts-ignore
        deleteOnSourceNodeDelete: true,
        // @ts-ignore
        deleteOnTargetNodeDelete: true,
        style: {
          stroke: getColor(connectionType),
          strokeWidth: connectionType === 'inheritance' ? 3 : 5,
          strokeDasharray:
            connectionType === 'async' || connectionType === 'database-replication'
              ? '8,4'
              : connectionType === 'inheritance'
                ? '5,5'
                : undefined,
        },
        data: {
          connectionType,
          pathType: 'step' as EdgePathType,
          waypoints: [],
          verticalSegmentX: null,
          ...(additionalData?.objectStorageDirection && {
            objectStorageDirection: additionalData.objectStorageDirection,
          }),
          ...(additionalData?.relationshipType && {
            relationshipType: additionalData.relationshipType,
          }),
        },
      }

      setEdges((eds) => addEdge(newEdge, eds))
    },
    [setEdges]
  )

  const handleConnectionTypeSelected = useCallback(
    (connectionType: ConnectionType, relationshipType?: '1:1' | '1:n' | 'n:1' | 'n:m') => {
      if (!pendingConnection) return

      const { source, target, params } = pendingConnection
      const sourceData = source.data as ComponentData
      const targetData = target.data as ComponentData

      // Если это репликация БД, показываем панель выбора подхода
      if (connectionType === 'database-replication') {
        // Панель репликации будет показана автоматически при проверке типов компонентов
        return
      }

      // Соединение всегда создается, валидация не блокирует создание

      // Если это соединение с объектным хранилищем, базой данных, хранилищем данных или брокером сообщений,
      // показываем выбор направления данных
      if (
        (connectionType === 'rest' && targetData.type === 'object-storage') ||
        (connectionType === 'database-connection' && (targetData.type === 'database' || targetData.type === 'data-warehouse')) ||
        (connectionType === 'async' && targetData.type === 'message-broker')
      ) {
        setPendingObjectStorageDirection({ source, target, params, connectionType })
        setPendingConnection(null)
        return
      }

      // Создаем связь с выбранным типом
      createConnectionEdge(params, connectionType, { relationshipType })
      setPendingConnection(null)
    },
    [pendingConnection, setEdges, createConnectionEdge]
  )

  const handleObjectStorageDirectionSelected = useCallback(
    (direction: ObjectStorageDirection) => {
      if (!pendingObjectStorageDirection) return

      const { params, connectionType } = pendingObjectStorageDirection

      // Создаем связь с выбранным направлением
      // createConnectionEdge будет определен позже, используем setEdges напрямую
      const getLabelText = (type: ConnectionType): string => {
        switch (type) {
          case 'async':
            return 'Async'
          case 'database-connection':
            return 'DB Connection'
          case 'cache-connection':
            return 'Cache'
          case 'dependency':
            return 'Зависимость'
          case 'composition':
            return 'Композиция'
          case 'aggregation':
            return 'Агрегация'
          case 'method-call':
            return 'Вызов метода'
          case 'inheritance':
            return 'Наследование'
          default:
            return type.toUpperCase()
        }
      }

      const getColor = (type: ConnectionType): string => {
        switch (type) {
          case 'async':
            return '#ffd43b'
          case 'database-connection':
            return '#51cf66'
          case 'cache-connection':
            return '#845ef7'
          case 'database-replication':
            return '#20c997'
          case 'dependency':
            return '#9c88ff'
          case 'composition':
            return '#ff6b6b'
          case 'aggregation':
            return '#ff8787'
          case 'method-call':
            return '#51cf66'
          case 'inheritance':
            return '#4dabf7'
          default:
            return '#4dabf7'
        }
      }

      const newEdge: Edge = {
        id: `edge-${params.source}-${params.target}-${Date.now()}`,
        source: params.source!,
        target: params.target!,
        // Сохраняем Handle ID для привязки к конкретным сторонам компонента
        sourceHandle: params.sourceHandle || undefined,
        targetHandle: params.targetHandle || undefined,
        type: 'animated',
        animated: connectionType === 'async' || connectionType === 'database-replication',
        deletable: true, // Позволяем удалять вручную
        // Отключаем автоматическое удаление при удалении узлов
        // @ts-ignore - эти свойства не в типах, но поддерживаются ReactFlow
        deleteOnSourceNodeDelete: true,
        deleteOnTargetNodeDelete: true,
        // Label не устанавливается при создании - будет добавлен только если указано описание данных
        style: {
          stroke: getColor(connectionType),
          strokeWidth: connectionType === 'inheritance' ? 3 : 5,
          strokeDasharray:
            connectionType === 'async' || connectionType === 'database-replication'
              ? '8,4'
              : connectionType === 'inheritance'
                ? '5,5'
                : undefined,
        },
        data: {
          connectionType,
          pathType: 'step' as EdgePathType, // По умолчанию прямоугольная линия для лучшего отображения направлений
          objectStorageDirection: direction,
        },
      }

      setEdges((eds) => {
        const updated = addEdge(newEdge, eds)

        // Сохраняем в историю после создания связи
        setTimeout(() => {
          if (!isHistoryActionRef.current) {
            historyManagerRef.current.pushState(nodesRef.current, edgesRef.current)
            setCanUndo(historyManagerRef.current.canUndo())
            setCanRedo(historyManagerRef.current.canRedo())
          }
        }, 150)

        return updated
      })
      setPendingObjectStorageDirection(null)
    },
    [pendingObjectStorageDirection, nodes, setEdges]
  )

  const handleReplicationSelected = useCallback(
    (approach: ReplicationApproach, tool?: ReplicationTool) => {
      if (!pendingConnection) return

      const { params } = pendingConnection

      // Создаем связь с репликацией
      const getLabelText = (approach: ReplicationApproach, tool?: ReplicationTool): string => {
        const approachLabels: Record<ReplicationApproach, string> = {
          'master-slave': 'Master-Slave',
          'master-master': 'Master-Master',
          'cdc': 'CDC',
          'etl': 'ETL',
          'streaming': 'Streaming',
          'snapshot': 'Snapshot',
        }

        const toolLabels: Record<ReplicationTool, string> = {
          'debezium': 'Debezium',
          'kafka-connect': 'Kafka',
          'apache-nifi': 'NiFi',
          'airbyte': 'Airbyte',
          'dms': 'DMS',
          'goldengate': 'GoldenGate',
          'native-replication': 'Native',
        }

        const approachLabel = approachLabels[approach] || 'Replication'
        if (tool) {
          return `${approachLabel} (${toolLabels[tool]})`
        }
        return approachLabel
      }

      const newEdge: Edge = {
        id: `edge-${params.source}-${params.target}-${Date.now()}`,
        source: params.source!,
        target: params.target!,
        // Сохраняем Handle ID для привязки к конкретным сторонам компонента
        sourceHandle: params.sourceHandle || undefined,
        targetHandle: params.targetHandle || undefined,
        type: 'animated',
        animated: true,
        deletable: true, // Позволяем удалять вручную
        // Отключаем автоматическое удаление при удалении узлов
        // @ts-ignore - эти свойства не в типах, но поддерживаются ReactFlow
        deleteOnSourceNodeDelete: true,
        deleteOnTargetNodeDelete: true,
        // Label не устанавливается при создании - будет добавлен только если указано описание данных
        style: {
          stroke: '#20c997',
          strokeWidth: 5,
          strokeDasharray: '8,4',
        },
        data: {
          connectionType: 'database-replication',
          pathType: 'step' as EdgePathType, // По умолчанию прямоугольная линия для лучшего отображения направлений
          replicationConfig: {
            approach,
            tool,
          },
        },
      }

      setEdges((eds) => {
        const updated = addEdge(newEdge, eds)

        // Сохраняем в историю после создания связи
        setTimeout(() => {
          if (!isHistoryActionRef.current) {
            historyManagerRef.current.pushState(nodesRef.current, edgesRef.current)
            setCanUndo(historyManagerRef.current.canUndo())
            setCanRedo(historyManagerRef.current.canRedo())
          }
        }, 150)

        return updated
      })
      setPendingConnection(null)
    },
    [pendingConnection, nodes, setEdges]
  )


  // Обработчик для обновления существующих edges при перетаскивании концов стрелок
  // Это позволяет переносить стрелки на другие компоненты
  // Важно: стрелки остаются прямоугольными (pathType: 'step') при перетаскивании
  const onEdgeUpdate = useCallback(
    (oldEdge: Edge, newConnection: Connection) => {
      console.log('🔄 onEdgeUpdate вызван:', {
        edgeId: oldEdge.id,
        oldSource: oldEdge.source,
        oldTarget: oldEdge.target,
        oldSourceHandle: oldEdge.sourceHandle,
        oldTargetHandle: oldEdge.targetHandle,
        newSource: newConnection.source,
        newTarget: newConnection.target,
        newSourceHandle: newConnection.sourceHandle,
        newTargetHandle: newConnection.targetHandle,
      })

      // Проверяем, что newConnection содержит необходимые данные
      if (!newConnection.source || !newConnection.target) {
        console.warn('⚠️ onEdgeUpdate: newConnection не содержит source или target')
        return
      }

      // Обновляем edge с новыми source/target и handles
      // Разрешаем перенос стрелок на любые компоненты без ограничений
      // Сохраняем pathType: 'step' чтобы стрелка оставалась прямоугольной
      setEdges((eds) => {
        return eds.map((edge) => {
          if (edge.id === oldEdge.id) {
            const oldData = oldEdge.data || {}
            const updatedEdge = {
              ...edge,
              source: newConnection.source!,
              target: newConnection.target!,
              // Сохраняем Handle ID для привязки к конкретным сторонам компонента
              // Это позволяет четко привязывать соединения к верхней/нижней стороне при перетаскивании
              sourceHandle: newConnection.sourceHandle || undefined,
              targetHandle: newConnection.targetHandle || undefined,
              // Сохраняем все данные из старого edge, включая waypoint координаты
              data: {
                ...oldData,
                // Убеждаемся, что pathType остается 'step' (прямоугольная линия)
                pathType: (oldData.pathType as EdgePathType) || 'step',
                // Сохраняем waypoint координаты, если они есть
                ...(oldData.waypointX !== undefined && oldData.waypointY !== undefined && {
                  waypointX: oldData.waypointX,
                  waypointY: oldData.waypointY,
                }),
              },
              // Убеждаемся, что стрелка не удалится при удалении узлов
              deletable: true,
              // @ts-ignore
              deleteOnSourceNodeDelete: true,
              deleteOnTargetNodeDelete: true,
            }
            console.log('✅ Edge обновлен (прямоугольная линия сохранена):', updatedEdge.id, {
              source: updatedEdge.source,
              target: updatedEdge.target,
              sourceHandle: updatedEdge.sourceHandle,
              targetHandle: updatedEdge.targetHandle,
              pathType: updatedEdge.data?.pathType,
              hasWaypoint: !!(updatedEdge.data?.waypointX !== undefined && updatedEdge.data?.waypointY !== undefined),
            })
            return updatedEdge
          }
          return edge
        })
      })
    },
    [setEdges]
  )

  const handleConnectionCancel = useCallback(() => {
    setPendingConnection(null)
  }, [])

  // Вспомогательная функция для обновления узлов с сохранением в историю
  const updateNodesWithHistory = useCallback((updater: (nds: Node[]) => Node[]) => {
    setNodes((nds) => updater(nds))
  }, [setNodes])

  const handleUpdateVectorDB = useCallback((nodeId: string, config: any) => {
    updateNodesWithHistory((nds) =>
      nds.map((node) => {
        if (node.id === nodeId) {
          return {
            ...node,
            data: {
              ...node.data,
              vectorDatabaseConfig: config,
            },
          }
        }
        return node
      })
    )
    setVectorDBNode(null)
  }, [updateNodesWithHistory])

  // Универсальный обработчик обновления конфигурации компонента
  const handleComponentConfigUpdate = useCallback(
    (nodeId: string, configKey: keyof ComponentData, configValue: any) => {
      updateNodesWithHistory((nds) =>
        nds.map((node) => {
          if (node.id === nodeId) {
            return {
              ...node,
              data: {
                ...node.data,
                [configKey]: configValue,
              },
            }
          }
          return node
        })
      )
    },
    [updateNodesWithHistory]
  )

  const handleDatabaseConfigUpdate = useCallback(
    (nodeId: string, config: { dbType: DatabaseType; nosqlType?: NoSQLType; vendor?: DatabaseVendor }) => {
      handleComponentConfigUpdate(nodeId, 'databaseConfig', config)
    },
    [handleComponentConfigUpdate]
  )

  const handleServiceConfigUpdate = useCallback(
    (nodeId: string, config: { language: ServiceLanguage }) => {
      handleComponentConfigUpdate(nodeId, 'serviceConfig', config)
    },
    [handleComponentConfigUpdate]
  )

  const handleFrontendConfigUpdate = useCallback(
    (nodeId: string, config: { framework: FrontendFramework }) => {
      handleComponentConfigUpdate(nodeId, 'frontendConfig', config)
    },
    [handleComponentConfigUpdate]
  )

  const handleDataWarehouseConfigUpdate = useCallback(
    (nodeId: string, config: { vendor: DataWarehouseVendor }) => {
      handleComponentConfigUpdate(nodeId, 'dataWarehouseConfig', config)
    },
    [handleComponentConfigUpdate]
  )

  const handleCDNConfigUpdate = useCallback(
    (nodeId: string, config: { vendor: CDNVendor }) => {
      handleComponentConfigUpdate(nodeId, 'cdnConfig', config)
    },
    [handleComponentConfigUpdate]
  )

  const handleLambdaConfigUpdate = useCallback(
    (nodeId: string, config: { vendor: LambdaVendor }) => {
      handleComponentConfigUpdate(nodeId, 'lambdaConfig', config)
    },
    [handleComponentConfigUpdate]
  )

  const handleObjectStorageConfigUpdate = useCallback(
    (nodeId: string, config: { vendor: ObjectStorageVendor }) => {
      handleComponentConfigUpdate(nodeId, 'objectStorageConfig', config)
    },
    [handleComponentConfigUpdate]
  )

  const handleAuthServiceConfigUpdate = useCallback(
    (nodeId: string, config: { vendor: AuthServiceVendor }) => {
      handleComponentConfigUpdate(nodeId, 'authServiceConfig', config)
    },
    [handleComponentConfigUpdate]
  )

  const handleFirewallConfigUpdate = useCallback(
    (nodeId: string, config: { vendor: FirewallVendor }) => {
      handleComponentConfigUpdate(nodeId, 'firewallConfig', config)
    },
    [handleComponentConfigUpdate]
  )

  const handleLoadBalancerConfigUpdate = useCallback(
    (nodeId: string, config: { vendor: LoadBalancerVendor }) => {
      handleComponentConfigUpdate(nodeId, 'loadBalancerConfig', config)
    },
    [handleComponentConfigUpdate]
  )

  const handleCacheConfigUpdate = useCallback(
    (nodeId: string, config: { cacheType: CacheType }) => {
      handleComponentConfigUpdate(nodeId, 'cacheConfig', config)
    },
    [handleComponentConfigUpdate]
  )

  const handleDataWarehouseDataUpdate = useCallback(
    (nodeId: string, tables: DatabaseTable[]) => {
      updateNodesWithHistory((nds) =>
        nds.map((node) => {
          if (node.id === nodeId) {
            return {
              ...node,
              data: {
                ...node.data,
                dataWarehouseConfig: {
                  ...node.data.dataWarehouseConfig,
                  tables,
                },
              },
            }
          }
          return node
        })
      )
    },
    [updateNodesWithHistory]
  )

  const handleMessageBrokerConfigUpdate = useCallback(
    (nodeId: string, config: { vendor: MessageBrokerVendor; deliveryType: MessageDeliveryType }) => {
      handleComponentConfigUpdate(nodeId, 'messageBrokerConfig', config)
    },
    [handleComponentConfigUpdate]
  )

  const handleMessageBrokerMessagesUpdate = useCallback(
    (nodeId: string, config: {
      kafkaTopics?: any[]
      rabbitmqQueues?: any[]
      sqsQueues?: any[]
      redisChannels?: any[]
    }) => {
      updateNodesWithHistory((nds) =>
        nds.map((node) => {
          if (node.id === nodeId) {
            return {
              ...node,
              data: {
                ...node.data,
                messageBrokerConfig: {
                  ...node.data.messageBrokerConfig,
                  kafkaTopics: config.kafkaTopics,
                  rabbitmqQueues: config.rabbitmqQueues,
                  sqsQueues: config.sqsQueues,
                  redisChannels: config.redisChannels,
                },
              },
            }
          }
          return node
        })
      )
    },
    [updateNodesWithHistory]
  )

  const handleApiGatewayConfigUpdate = useCallback(
    (nodeId: string, config: any) => {
      handleComponentConfigUpdate(nodeId, 'apiGatewayConfig', config)
    },
    [handleComponentConfigUpdate]
  )

  const handleProxyConfigUpdate = useCallback(
    (nodeId: string, config: any) => {
      handleComponentConfigUpdate(nodeId, 'proxyConfig', config)
    },
    [handleComponentConfigUpdate]
  )

  const handleVPNGatewayConfigUpdate = useCallback(
    (nodeId: string, config: any) => {
      handleComponentConfigUpdate(nodeId, 'vpnGatewayConfig', config)
    },
    [handleComponentConfigUpdate]
  )

  const handleBackupServiceConfigUpdate = useCallback(
    (nodeId: string, config: any) => {
      handleComponentConfigUpdate(nodeId, 'backupServiceConfig', config)
    },
    [handleComponentConfigUpdate]
  )

  const handleQueueConfigUpdate = useCallback(
    (nodeId: string, config: any) => {
      handleComponentConfigUpdate(nodeId, 'queueConfig', config)
    },
    [handleComponentConfigUpdate]
  )

  const handleESBConfigUpdate = useCallback(
    (nodeId: string, config: any) => {
      handleComponentConfigUpdate(nodeId, 'esbConfig', config)
    },
    [handleComponentConfigUpdate]
  )

  const handleClassConfigUpdate = useCallback(
    (nodeId: string, config: { methods: any[] }) => {
      updateNodesWithHistory((nds) =>
        nds.map((node) => {
          if (node.id === nodeId) {
            return {
              ...node,
              data: {
                ...node.data,
                classConfig: {
                  methods: config.methods,
                },
              },
            }
          }
          return node
        })
      )
    },
    [updateNodesWithHistory]
  )

  const handleControllerConfigUpdate = useCallback(
    (nodeId: string, config: { endpoints: any[] }) => {
      updateNodesWithHistory((nds) =>
        nds.map((node) => {
          if (node.id === nodeId) {
            return {
              ...node,
              data: {
                ...node.data,
                controllerConfig: {
                  endpoints: config.endpoints,
                },
              },
            }
          }
          return node
        })
      )
    },
    [updateNodesWithHistory]
  )

  const handleRepositoryConfigUpdate = useCallback(
    (nodeId: string, config: { data: any[] }) => {
      updateNodesWithHistory((nds) =>
        nds.map((node) => {
          if (node.id === nodeId) {
            return {
              ...node,
              data: {
                ...node.data,
                repositoryConfig: {
                  data: config.data,
                },
              },
            }
          }
          return node
        })
      )
    },
    [updateNodesWithHistory]
  )

  const handleVcsConfigUpdate = useCallback(
    (nodeId: string, config: VCSConfig) => {
      handleComponentConfigUpdate(nodeId, 'vcsConfig', config)
    },
    [handleComponentConfigUpdate]
  )

  const handleCicdPipelineConfigUpdate = useCallback(
    (nodeId: string, config: CICDPipelineConfig) => {
      handleComponentConfigUpdate(nodeId, 'ciCdPipelineConfig', config)
    },
    [handleComponentConfigUpdate]
  )

  const handleWebServerConfigUpdate = useCallback(
    (nodeId: string, config: WebServerConfig) => {
      handleComponentConfigUpdate(nodeId, 'webServerConfig', config)
    },
    [handleComponentConfigUpdate]
  )

  const handleContainerConfigUpdate = useCallback(
    (nodeId: string, config: ContainerConfig) => {
      handleComponentConfigUpdate(nodeId, 'containerConfig', config)
    },
    [handleComponentConfigUpdate]
  )

  const handleServerConfigUpdate = useCallback(
    (nodeId: string, config: ServerConfig) => {
      handleComponentConfigUpdate(nodeId, 'serverConfig', config)
    },
    [handleComponentConfigUpdate]
  )

  const handleSearchEngineConfigUpdate = useCallback(
    (nodeId: string, config: any) => {
      handleComponentConfigUpdate(nodeId, 'searchEngineConfig', config)
    },
    [handleComponentConfigUpdate]
  )

  const handleConfigurationManagementConfigUpdate = useCallback(
    (nodeId: string, config: any) => {
      handleComponentConfigUpdate(nodeId, 'configurationManagementConfig', config)
    },
    [handleComponentConfigUpdate]
  )

  const handleEventBusConfigUpdate = useCallback(
    (nodeId: string, config: any) => {
      handleComponentConfigUpdate(nodeId, 'eventBusConfig', config)
    },
    [handleComponentConfigUpdate]
  )

  const handleStreamProcessorConfigUpdate = useCallback(
    (nodeId: string, config: any) => {
      handleComponentConfigUpdate(nodeId, 'streamProcessorConfig', config)
    },
    [handleComponentConfigUpdate]
  )

  const handleGraphDatabaseConfigUpdate = useCallback(
    (nodeId: string, config: any) => {
      handleComponentConfigUpdate(nodeId, 'graphDatabaseConfig', config)
    },
    [handleComponentConfigUpdate]
  )

  const handleTimeSeriesDatabaseConfigUpdate = useCallback(
    (nodeId: string, config: any) => {
      handleComponentConfigUpdate(nodeId, 'timeSeriesDatabaseConfig', config)
    },
    [handleComponentConfigUpdate]
  )

  const handleResourceEstimationUpdate = useCallback(
    (nodeId: string, resources: ResourceEstimate) => {
      handleComponentConfigUpdate(nodeId, 'resources', resources)
    },
    [handleComponentConfigUpdate]
  )

  const handleServiceMeshConfigUpdate = useCallback(
    (nodeId: string, config: any) => {
      handleComponentConfigUpdate(nodeId, 'serviceMeshConfig', config)
    },
    [handleComponentConfigUpdate]
  )

  const handleIdentityProviderConfigUpdate = useCallback(
    (nodeId: string, config: any) => {
      handleComponentConfigUpdate(nodeId, 'identityProviderConfig', config)
    },
    [handleComponentConfigUpdate]
  )

  const handleSecretManagementConfigUpdate = useCallback(
    (nodeId: string, config: any) => {
      handleComponentConfigUpdate(nodeId, 'secretManagementConfig', config)
    },
    [handleComponentConfigUpdate]
  )

  const handleMonitoringConfigUpdate = useCallback(
    (nodeId: string, config: any) => {
      handleComponentConfigUpdate(nodeId, 'monitoringConfig', config)
    },
    [handleComponentConfigUpdate]
  )

  const handleLoggingConfigUpdate = useCallback(
    (nodeId: string, config: any) => {
      handleComponentConfigUpdate(nodeId, 'loggingConfig', config)
    },
    [handleComponentConfigUpdate]
  )

  const handleAnalyticsServiceConfigUpdate = useCallback(
    (nodeId: string, config: any) => {
      handleComponentConfigUpdate(nodeId, 'analyticsServiceConfig', config)
    },
    [handleComponentConfigUpdate]
  )

  const handleBusinessIntelligenceConfigUpdate = useCallback(
    (nodeId: string, config: any) => {
      handleComponentConfigUpdate(nodeId, 'businessIntelligenceConfig', config)
    },
    [handleComponentConfigUpdate]
  )

  const handleOrchestratorConfigUpdate = useCallback(
    (nodeId: string, config: any) => {
      handleComponentConfigUpdate(nodeId, 'orchestratorConfig', config)
    },
    [handleComponentConfigUpdate]
  )

  const handleServiceDiscoveryConfigUpdate = useCallback(
    (nodeId: string, config: any) => {
      handleComponentConfigUpdate(nodeId, 'serviceDiscoveryConfig', config)
    },
    [handleComponentConfigUpdate]
  )

  const handleLlmModelConfigUpdate = useCallback(
    (nodeId: string, config: any) => {
      handleComponentConfigUpdate(nodeId, 'llmModelConfig', config)
    },
    [handleComponentConfigUpdate]
  )

  const handleBatchProcessorConfigUpdate = useCallback(
    (nodeId: string, config: any) => {
      handleComponentConfigUpdate(nodeId, 'batchProcessorConfig', config)
    },
    [handleComponentConfigUpdate]
  )

  const handleEtlServiceConfigUpdate = useCallback(
    (nodeId: string, config: any) => {
      handleComponentConfigUpdate(nodeId, 'etlServiceConfig', config)
    },
    [handleComponentConfigUpdate]
  )

  const handleDataLakeConfigUpdate = useCallback(
    (nodeId: string, config: any) => {
      handleComponentConfigUpdate(nodeId, 'dataLakeConfig', config)
    },
    [handleComponentConfigUpdate]
  )

  const handleIntegrationPlatformConfigUpdate = useCallback(
    (nodeId: string, config: any) => {
      handleComponentConfigUpdate(nodeId, 'integrationPlatformConfig', config)
    },
    [handleComponentConfigUpdate]
  )

  const handleMlServiceConfigUpdate = useCallback(
    (nodeId: string, config: any) => {
      handleComponentConfigUpdate(nodeId, 'mlServiceConfig', config)
    },
    [handleComponentConfigUpdate]
  )

  const handleNotificationServiceConfigUpdate = useCallback(
    (nodeId: string, config: any) => {
      handleComponentConfigUpdate(nodeId, 'notificationServiceConfig', config)
    },
    [handleComponentConfigUpdate]
  )

  const handleEmailServiceConfigUpdate = useCallback(
    (nodeId: string, config: any) => {
      handleComponentConfigUpdate(nodeId, 'emailServiceConfig', config)
    },
    [handleComponentConfigUpdate]
  )

  const handleSmsGatewayConfigUpdate = useCallback(
    (nodeId: string, config: any) => {
      handleComponentConfigUpdate(nodeId, 'smsGatewayConfig', config)
    },
    [handleComponentConfigUpdate]
  )

  const handleDNSServiceConfigUpdate = useCallback(
    (nodeId: string, config: any) => {
      handleComponentConfigUpdate(nodeId, 'dnsServiceConfig', config)
    },
    [handleComponentConfigUpdate]
  )

  const onNodeClick = useCallback((_event: React.MouseEvent, node: Node) => {
    const nodeData = node.data as ComponentData
    // Закрываем все панели
    setDatabaseConfigNode(null)
    setDatabaseSchemaNode(null)
    setTableEditorNode(null) // Close TableEditor
    setVectorDBNode(null) // Close VectorDBConfigPanel
    setCacheConfigNode(null)
    setServiceConfigNode(null)
    setFrontendConfigNode(null)
    setDataWarehouseConfigNode(null)
    setMessageBrokerConfigNode(null)
    setMessageBrokerMessagesNode(null)
    setCdnConfigNode(null)
    setLambdaConfigNode(null)
    setObjectStorageConfigNode(null)
    setAuthServiceConfigNode(null)
    setFirewallConfigNode(null)
    setLoadBalancerConfigNode(null)
    setApiGatewayConfigNode(null)
    setEsbConfigNode(null)
    setClassConfigNode(null)
    setControllerConfigNode(null)
    setRepositoryConfigNode(null)
    setLinkConfigNode(null)
    setBackupServiceConfigNode(null)
    setQueueConfigNode(null)
    setProxyConfigNode(null)
    setVpnGatewayConfigNode(null)
    setDnsServiceConfigNode(null)
    setEventBusConfigNode(null)
    setStreamProcessorConfigNode(null)
    setSearchEngineConfigNode(null)
    setGraphDatabaseConfigNode(null)
    setTimeSeriesDatabaseConfigNode(null)
    setServiceMeshConfigNode(null)
    setConfigurationManagementConfigNode(null)
    setCiCdPipelineConfigNode(null)
    setIdentityProviderConfigNode(null)
    setSecretManagementConfigNode(null)
    setIntegrationPlatformConfigNode(null)
    setBatchProcessorConfigNode(null)
    setEtlServiceConfigNode(null)
    setDataLakeConfigNode(null)
    setMlServiceConfigNode(null)
    setNotificationServiceConfigNode(null)
    setEmailServiceConfigNode(null)
    setSmsGatewayConfigNode(null)
    setAnalyticsServiceConfigNode(null)
    setBusinessIntelligenceConfigNode(null)
    setMonitoringConfigNode(null)
    setLoggingConfigNode(null)
    setVcsConfigNode(null)
    setWebServerConfigNode(null)
    setContainerConfigNode(null)
    setServerConfigNode(null)
    setOrchestratorConfigNode(null)
    setServiceDiscoveryConfigNode(null)
    setLlmModelConfigNode(null)
    setSelectedEdge(null)

    // Открываем соответствующую панель настройки
    if (nodeData.type === 'database') {
      const dbConfig = nodeData.databaseConfig
      // Если база уже настроена (есть тип) и есть данные (таблицы/коллекции/key-value), открываем редактор схемы
      if (dbConfig?.dbType) {
        const hasData =
          (dbConfig.tables && dbConfig.tables.length > 0) ||
          ((dbConfig as any)?.collections && (dbConfig as any).collections.length > 0) ||
          ((dbConfig as any)?.keyValueStore && (dbConfig as any).keyValueStore.pairs && (dbConfig as any).keyValueStore.pairs.length > 0)

        if (hasData) {
          // Если есть данные, открываем редактор схемы
          setDatabaseSchemaNode(node)
          setDatabaseConfigNode(null)
        } else if (dbConfig.vendor) {
          // Если тип и vendor выбраны, но данных нет - открываем редактор схемы для добавления
          setDatabaseSchemaNode(node)
          setDatabaseConfigNode(null)
        } else {
          // Если тип выбран, но vendor нет - открываем панель настройки
          setDatabaseConfigNode(node)
          setDatabaseSchemaNode(null)
        }
      } else {
        // Если база не настроена, открываем панель настройки типа БД
        setDatabaseConfigNode(node)
        setDatabaseSchemaNode(null)
      }
    } else if (nodeData.type === 'table') {
      setTableEditorNode(node)
    } else if (nodeData.type === 'vector-database') {
      setVectorDBNode(node)
    } else if (nodeData.type === 'cache') {
      setCacheConfigNode(node)
    } else if (nodeData.type === 'service') {
      setServiceConfigNode(node)
    } else if (nodeData.type === 'frontend') {
      setFrontendConfigNode(node)
    } else if (nodeData.type === 'data-warehouse') {
      // Если платформа уже выбрана, открываем панель данных
      if (nodeData.dataWarehouseConfig?.vendor) {
        setDataWarehouseDataNode(node)
        setDataWarehouseConfigNode(null)
      } else {
        // Если не выбрана, открываем панель настройки
        setDataWarehouseConfigNode(node)
        setDataWarehouseDataNode(null)
      }
    } else if (nodeData.type === 'message-broker') {
      // Если брокер уже настроен (есть vendor), открываем панель сообщений
      if (nodeData.messageBrokerConfig?.vendor) {
        setMessageBrokerMessagesNode(node)
        setMessageBrokerConfigNode(null)
      } else {
        // Если не настроен, открываем панель настройки
        setMessageBrokerConfigNode(node)
        setMessageBrokerMessagesNode(null)
      }
    } else if (nodeData.type === 'cdn') {
      setCdnConfigNode(node)
    } else if (nodeData.type === 'lambda') {
      setLambdaConfigNode(node)
    } else if (nodeData.type === 'object-storage') {
      setObjectStorageConfigNode(node)
    } else if (nodeData.type === 'auth-service') {
      setAuthServiceConfigNode(node)
    } else if (nodeData.type === 'firewall') {
      setFirewallConfigNode(node)
    } else if (nodeData.type === 'load-balancer') {
      setLoadBalancerConfigNode(node)
    } else if (nodeData.type === 'api-gateway') {
      setApiGatewayConfigNode(node)
    } else if (nodeData.type === 'esb') {
      setEsbConfigNode(node)
    } else if (nodeData.type === 'class') {
      setClassConfigNode(node)
    } else if (nodeData.type === 'controller') {
      setControllerConfigNode(node)
    } else if (nodeData.type === 'repository') {
      setRepositoryConfigNode(node)
    } else if (nodeData.type === 'backup-service') {
      setBackupServiceConfigNode(node)
    } else if (nodeData.type === 'queue') {
      setQueueConfigNode(node)
    } else if (nodeData.type === 'proxy') {
      setProxyConfigNode(node)
    } else if (nodeData.type === 'vpn-gateway') {
      setVpnGatewayConfigNode(node)
    } else if (nodeData.type === 'dns-service') {
      setDnsServiceConfigNode(node)
    } else if (nodeData.type === 'event-bus') {
      setEventBusConfigNode(node)
    } else if (nodeData.type === 'stream-processor') {
      setStreamProcessorConfigNode(node)
    } else if (nodeData.type === 'search-engine') {
      setSearchEngineConfigNode(node)
    } else if (nodeData.type === 'graph-database') {
      setGraphDatabaseConfigNode(node)
    } else if (nodeData.type === 'time-series-database') {
      setTimeSeriesDatabaseConfigNode(node)
    } else if (nodeData.type === 'service-mesh') {
      setServiceMeshConfigNode(node)
    } else if (nodeData.type === 'identity-provider') {
      setIdentityProviderConfigNode(node)
    } else if (nodeData.type === 'secret-management') {
      setSecretManagementConfigNode(node)
    } else if (nodeData.type === 'integration-platform') {
      setIntegrationPlatformConfigNode(node)
    } else if (nodeData.type === 'batch-processor') {
      setBatchProcessorConfigNode(node)
    } else if (nodeData.type === 'etl-service') {
      setEtlServiceConfigNode(node)
    } else if (nodeData.type === 'data-lake') {
      setDataLakeConfigNode(node)
    } else if (nodeData.type === 'ml-ai-service') {
      setMlServiceConfigNode(node)
    } else if (nodeData.type === 'notification-service') {
      setNotificationServiceConfigNode(node)
    } else if (nodeData.type === 'email-service') {
      setEmailServiceConfigNode(node)
    } else if (nodeData.type === 'sms-gateway') {
      setSmsGatewayConfigNode(node)
    } else if (nodeData.type === 'analytics-service') {
      setAnalyticsServiceConfigNode(node)
    } else if (nodeData.type === 'business-intelligence') {
      setBusinessIntelligenceConfigNode(node)
    } else if (nodeData.type === 'orchestrator') {
      setOrchestratorConfigNode(node)
    } else if (nodeData.type === 'service-discovery') {
      setServiceDiscoveryConfigNode(node)
    } else if (nodeData.type === 'llm-model') {
      setLlmModelConfigNode(node)
    } else if (nodeData.type === 'monitoring') {
      setMonitoringConfigNode(node)
    } else if (nodeData.type === 'logging') {
      setLoggingConfigNode(node)
    } else if (nodeData.type === 'vcs') {
      setVcsConfigNode(node)
    } else if (nodeData.type === 'web-server') {
      setWebServerConfigNode(node)
    } else if (nodeData.type === 'container') {
      setContainerConfigNode(node)
    } else if (nodeData.type === 'server') {
      setServerConfigNode(node)
    } else if (nodeData.type === 'business-domain' || nodeData.type === 'system' || nodeData.type === 'external-system') {
      setSelectedNodes([node])
    } else {
      setSelectedNodes([node])
    }
  }, [])

  const handleLinkConfigUpdate = useCallback(
    (nodeId: string, link: ComponentLink | null) => {
      updateNodesWithHistory((nds) =>
        nds.map((node) => {
          if (node.id === nodeId) {
            return {
              ...node,
              data: {
                ...node.data,
                link: link || undefined,
              },
            }
          }
          return node
        })
      )
    },
    [updateNodesWithHistory]
  )

  // Обработчик перехода по ссылке
  const handleLinkClick = useCallback(
    (link: ComponentLink) => {
      // Сохраняем текущее состояние перед переключением
      setWorkspaces(prev => {
        const updated = prev.map(w =>
          w.id === activeWorkspaceId
            ? { ...w, nodes, edges }
            : w
        )
        saveWorkspacesToStorage(updated)

        // Переключаемся на целевую вкладку
        const targetWorkspace = updated.find(w => w.id === link.targetWorkspaceId)
        if (targetWorkspace) {
          setTimeout(() => {
            setActiveWorkspaceId(link.targetWorkspaceId)
            setNodes(targetWorkspace.nodes)
            setEdges(targetWorkspace.edges)

            // Фокусируемся на целевом узле
            setTimeout(() => {
              const targetNode = targetWorkspace.nodes.find(n => n.id === link.targetNodeId)
              if (targetNode && reactFlowInstance) {
                reactFlowInstance.fitView({
                  padding: 0.2,
                  includeHiddenNodes: false,
                  nodes: [targetNode],
                  duration: 500,
                })
                // Выделяем целевой узел
                setNodes((nds) =>
                  nds.map((n) => ({
                    ...n,
                    selected: n.id === link.targetNodeId,
                  }))
                )
              }
            }, 100)
          }, 0)
        }

        return updated
      })
    },
    [activeWorkspaceId, nodes, edges, setNodes, setEdges, reactFlowInstance]
  )

  const onEdgeClick = useCallback((_event: React.MouseEvent, edge: Edge) => {
    setSelectedEdge(edge)
    setSelectedNodes([])
    console.log('Стрелка выделена:', edge.id) // Для отладки
  }, [])

  const onPaneClick = useCallback(() => {
    setSelectedEdge(null)
    setSelectedNodes([])
    setDatabaseConfigNode(null)
    setDatabaseSchemaNode(null)
    setTableEditorNode(null)
    setVectorDBNode(null)
    setCacheConfigNode(null)
    setServiceConfigNode(null)
    setFrontendConfigNode(null)
    setDataWarehouseConfigNode(null)
    setDataWarehouseDataNode(null)
    setMessageBrokerConfigNode(null)
    setMessageBrokerMessagesNode(null)
    setCdnConfigNode(null)
    setLambdaConfigNode(null)
    setObjectStorageConfigNode(null)
    setAuthServiceConfigNode(null)
    setFirewallConfigNode(null)
    setLoadBalancerConfigNode(null)
    setApiGatewayConfigNode(null)
    setEsbConfigNode(null)
    setClassConfigNode(null)
    setControllerConfigNode(null)
    setRepositoryConfigNode(null)
    setLinkConfigNode(null)
    setBackupServiceConfigNode(null)
    setQueueConfigNode(null)
    setProxyConfigNode(null)
    setVpnGatewayConfigNode(null)
    setDnsServiceConfigNode(null)
    setEventBusConfigNode(null)
    setStreamProcessorConfigNode(null)
    setSearchEngineConfigNode(null)
    setGraphDatabaseConfigNode(null)
    setTimeSeriesDatabaseConfigNode(null)
    setServiceMeshConfigNode(null)
    setConfigurationManagementConfigNode(null)
    setCiCdPipelineConfigNode(null)
    setIdentityProviderConfigNode(null)
    setSecretManagementConfigNode(null)
    setIntegrationPlatformConfigNode(null)
    setBatchProcessorConfigNode(null)
    setEtlServiceConfigNode(null)
    setDataLakeConfigNode(null)
    setMlServiceConfigNode(null)
    setNotificationServiceConfigNode(null)
    setEmailServiceConfigNode(null)
    setSmsGatewayConfigNode(null)
    setAnalyticsServiceConfigNode(null)
    setBusinessIntelligenceConfigNode(null)
    setMonitoringConfigNode(null)
    setLoggingConfigNode(null)
    setVcsConfigNode(null)
    setWebServerConfigNode(null)
    setContainerConfigNode(null)
    setServerConfigNode(null)
    setOrchestratorConfigNode(null)
    setServiceDiscoveryConfigNode(null)
    setLlmModelConfigNode(null)
    setCommentNode(null)
    setInfoComponentType(null)
    setComparisonType(null)
    setShowStatistics(false)
    setShowAIAssistant(false)
  }, [])

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
  }, [])

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault()
      event.stopPropagation()

      // Пробуем получить данные из разных источников для совместимости
      let componentType = event.dataTransfer.getData('application/reactflow') as ComponentType
      if (!componentType) {
        componentType = event.dataTransfer.getData('text/plain') as ComponentType
      }

      if (!componentType) return

      // Если ReactFlow еще не инициализирован, добавляем в центр
      if (!reactFlowInstance) {
        addComponent(componentType)
        return
      }

      const reactFlowBounds = reactFlowWrapper.current?.getBoundingClientRect()
      if (!reactFlowBounds) {
        addComponent(componentType)
        return
      }

      // Получаем координаты относительно ReactFlow
      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      })

      addComponent(componentType, position)
    },
    [reactFlowInstance, addComponent]
  )

  const updateConnectionType = useCallback(
    (edgeId: string, connectionType: ConnectionType, dataDescription?: string, pathType?: EdgePathType, customColor?: string) => {
      const getLabelText = (type: ConnectionType): string => {
        switch (type) {
          case 'async':
            return 'Async'
          case 'database-connection':
            return 'DB Connection'
          case 'database-replication':
            return 'Replication'
          case 'cache-connection':
            return 'Cache'
          case 'dependency':
            return 'Зависимость'
          case 'composition':
            return 'Композиция'
          case 'aggregation':
            return 'Агрегация'
          case 'method-call':
            return 'Вызов метода'
          case 'inheritance':
            return 'Наследование'
          default:
            return type.toUpperCase()
        }
      }

      const getColor = (type: ConnectionType): string => {
        if (customColor) return customColor

        switch (type) {
          case 'async':
            return '#ffd43b'
          case 'database-connection':
            return '#51cf66'
          case 'database-replication':
            return '#20c997'
          case 'cache-connection':
            return '#845ef7' // Фиолетовый цвет как у кеша
          case 'dependency':
            return '#9c88ff'
          case 'composition':
            return '#ff6b6b'
          case 'aggregation':
            return '#ff8787'
          case 'method-call':
            return '#51cf66'
          case 'inheritance':
            return '#4dabf7'
          default:
            return '#4dabf7'
        }
      }

      setEdges((eds) =>
        eds.map((edge) => {
          if (edge.id === edgeId) {
            // Формируем label: показываем только описание данных, если оно указано
            // Если описание не указано, label будет undefined (ничего не отображается)
            const label = dataDescription && dataDescription.trim()
              ? dataDescription.trim()
              : undefined

            const edgeColor = getColor(connectionType)

            // Если есть label, добавляем его и стили, если нет - убираем label и labelStyle
            if (label) {
              return {
                ...edge,
                label,
                labelStyle: {
                  fill: edgeColor,
                  fontWeight: 700,
                  fontSize: '12px',
                  backgroundColor: '#1e1e1e',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  border: `1px solid ${edgeColor}40`,
                  whiteSpace: 'pre-line',
                  textAlign: 'center',
                },
                style: {
                  stroke: edgeColor,
                  strokeWidth: connectionType === 'inheritance' ? 2 : 3,
                  strokeDasharray:
                    connectionType === 'async' || connectionType === 'database-replication'
                      ? '8,4'
                      : connectionType === 'inheritance'
                        ? '5,5'
                        : undefined,
                },
                data: {
                  ...edge.data,
                  connectionType,
                  ...(dataDescription !== undefined && { dataDescription }),
                  ...(pathType !== undefined && { pathType }),
                  ...(customColor !== undefined && { customColor }),
                },
              }
            } else {
              // Если нет описания, убираем label и labelStyle
              const { label: _, labelStyle: __, ...edgeWithoutLabel } = edge
              return {
                ...edgeWithoutLabel,
                style: {
                  stroke: edgeColor,
                  strokeWidth: 3,
                  strokeDasharray: connectionType === 'async' || connectionType === 'database-replication' ? '8,4' : undefined,
                },
                data: {
                  ...edge.data,
                  connectionType,
                  ...(dataDescription !== undefined && { dataDescription }),
                  ...(pathType !== undefined && { pathType }),
                  ...(customColor !== undefined && { customColor }),
                },
              }
            }
          }
          return edge
        })
      )
    },
    [setEdges]
  )

  /* Task 3 & 6: Selective Deletion & Remove Unconnected Arrows logic */
  const deleteSelected = useCallback(() => {
    // Удаление выбранных связей (включая множественное выделение и orphan edges)
    const edgesToDelete = edges.filter(e => e.selected || (selectedEdge && e.id === selectedEdge.id));

    if (edgesToDelete.length > 0) {
      setEdges((eds) => {
        const idsToDelete = edgesToDelete.map(e => e.id);
        const updated = eds.filter((e) => !idsToDelete.includes(e.id))

        // Сохраняем в историю после удаления связи
        setTimeout(() => {
          if (!isHistoryActionRef.current) {
            historyManagerRef.current.pushState(nodesRef.current, edgesRef.current)
            setCanUndo(historyManagerRef.current.canUndo())
            setCanRedo(historyManagerRef.current.canRedo())
          }
        }, 150)

        return updated
      })
      setSelectedEdge(null)
      // Продолжаем выполнение, чтобы удалить и выделенные узлы, если они есть
    }

    // Удаление выбранных узлов
    if (selectedNodes.length > 0) {
      const nodeIds = selectedNodes.map((n) => n.id)

      // Task 6: Удаляем и стрелки, связанные с удаляемыми узлами (стандартное поведение)
      // Просто удаляем узлы, ReactFlow/наша логика должна почистить edges??
      // В ReactFlow edges не удаляются автоматически, если deleteOnSourceNodeDelete=false
      // Но мы меняем это поведение.

      setNodes((nds) => {
        const updatedNodes = nds.filter((n) => !nodeIds.includes(n.id))

        // Удаляем связанные edges
        setEdges((eds) => eds.filter(e => !nodeIds.includes(e.source) && !nodeIds.includes(e.target)))

        // Сохраняем в историю
        setTimeout(() => {
          if (!isHistoryActionRef.current) {
            // Берем актуальные edges после обновления
            const currentEdges = edges.filter(e => !nodeIds.includes(e.source) && !nodeIds.includes(e.target));
            historyManagerRef.current.pushState(updatedNodes, currentEdges)
            setCanUndo(historyManagerRef.current.canUndo())
            setCanRedo(historyManagerRef.current.canRedo())
          }
        }, 100)

        return updatedNodes
      })

      setSelectedNodes([])
    }
  }, [selectedEdge, selectedNodes, nodes, edges, setNodes, setEdges])

  // Обработка изменения выделения в ReactFlow
  const onSelectionChange = useCallback((params: { nodes: Node[]; edges: Edge[] }) => {
    console.log('🔄 ========== onSelectionChange вызван ==========')
    console.log('🔄 Выделено узлов:', params.nodes.length)
    console.log('🔄 Выделено связей:', params.edges.length)

    setSelectedNodes(params.nodes)

    // Обновляем selected в узлах для ReactFlow
    setNodes((nds) =>
      nds.map((node) => ({
        ...node,
        selected: params.nodes.some(selectedNode => selectedNode.id === node.id),
      }))
    )

    // Обновляем selected в связях для ReactFlow
    setEdges((eds) =>
      eds.map((edge) => ({
        ...edge,
        selected: params.edges.some(selectedEdge => selectedEdge.id === edge.id),
      }))
    )
    console.log('🔄 ========== onSelectionChange завершен ==========')

    // Находим все выделенные системы, бизнес-домены и группы
    const selectedContainers = params.nodes.filter(node => {
      const data = node.data as ComponentData
      return data?.type === 'system' || data?.type === 'business-domain' || data?.type === 'group'
    })

    // Находим все компоненты внутри выделенных контейнеров
    const nodesInsideContainers: Node[] = []
    selectedContainers.forEach(container => {
      const containerX = container.position.x
      const containerY = container.position.y
      const containerWidth = container.width || 400
      const containerHeight = container.height || 300

      // Ищем все узлы, которые находятся внутри этого контейнера
      nodes.forEach(node => {
        if (node.id === container.id) return
        const nodeData = node.data as ComponentData
        // Пропускаем другие контейнеры
        if (nodeData?.type === 'system' || nodeData?.type === 'business-domain' || nodeData?.type === 'group') return

        const nodeX = node.position.x
        const nodeY = node.position.y
        const nodeWidth = node.width || 200
        const nodeHeight = node.height || 120

        // Проверяем, находится ли узел внутри контейнера
        const nodeCenterX = nodeX + nodeWidth / 2
        const nodeCenterY = nodeY + nodeHeight / 2

        if (
          nodeCenterX >= containerX &&
          nodeCenterY >= containerY &&
          nodeCenterX <= containerX + containerWidth &&
          nodeCenterY <= containerY + containerHeight
        ) {
          // Проверяем, не добавлен ли уже этот узел
          if (!nodesInsideContainers.find(n => n.id === node.id) && !params.nodes.find(n => n.id === node.id)) {
            nodesInsideContainers.push(node)
          }
        }
      })
    })

    // Объединяем выделенные узлы и узлы внутри контейнеров
    const allSelectedNodes = [...params.nodes, ...nodesInsideContainers]

    // Удаляем дубликаты узлов
    const uniqueSelectedNodes = allSelectedNodes.filter((node, index, self) =>
      index === self.findIndex((n) => n.id === node.id)
    )

    // Фильтруем только обычные компоненты (не группы)
    const selectableNodes = uniqueSelectedNodes.filter(node => {
      const data = node.data as ComponentData
      const isSelectable = data?.type !== 'group'
      return isSelectable
    })
    const selectedIds = selectableNodes.map(n => n.id)
    setSelectedNodeIds(selectedIds)

    // Проверяем, есть ли у выбранных компонентов одинаковый groupId
    if (selectedIds.length > 0) {
      const groupIds = selectableNodes
        .map(n => (n.data as ComponentData)?.groupId)
        .filter((id): id is string => id !== undefined)

      // Если у всех выбранных компонентов одинаковый groupId, показываем кнопку разгруппировки
      if (groupIds.length === selectedIds.length && groupIds.length > 0) {
        const uniqueGroupIds = [...new Set(groupIds)]
        if (uniqueGroupIds.length === 1) {
          setSelectedGroupId(uniqueGroupIds[0])
        } else {
          setSelectedGroupId(null)
        }
      } else {
        setSelectedGroupId(null)
      }
    } else {
      setSelectedGroupId(null)
    }

    // Меню линий (ConnectionPanel) должно открываться ТОЛЬКО при прямом клике на линию (onEdgeClick).
    // При выделении области (box selection) мы НЕ должны автоматически открывать меню первой попавшейся линии.
    // Поэтому здесь мы только СБРАСЫВАЕМ выделенную линию, если в текущем выделении вообще нет линий.
    if (params.edges.length === 0) {
      setSelectedEdge(null)
    }
    // Если линии есть в выделении, мы ничего не делаем с selectedEdge - это сохраняет поведение:
    // 1. Если кликнули на линию -> onEdgeClick установил selectedEdge, а здесь мы его не трогаем.
    // 2. Если обвели рамкой -> selectedEdge остается null (или тем, чем был), меню не выпрыгивает само.
  }, [nodes])

  // Обработка группировки выбранных компонентов вместе со связанными
  const handleGroupSelected = useCallback(() => {
    if (selectedNodeIds.length < 1) {
      console.log('Недостаточно компонентов для группировки:', selectedNodeIds.length)
      return
    }

    const selectedNodesList = nodes.filter(n => selectedNodeIds.includes(n.id))
    if (selectedNodesList.length < 1) {
      console.log('Не найдено узлов для группировки:', selectedNodesList.length)
      return
    }

    // Создаем уникальный ID группы
    const groupId = `group-${Date.now()}`
    console.log('Создаем группу с ID:', groupId, 'для компонентов:', selectedNodeIds)

    // Находим все связанные компоненты (те, которые соединены с выбранными через edges)
    const nodesToGroup = new Set<string>(selectedNodeIds)
    let hasNewNodes = true

    // Итеративно находим все связанные компоненты
    while (hasNewNodes) {
      hasNewNodes = false
      const currentNodes = Array.from(nodesToGroup)

      edges.forEach(edge => {
        const sourceInGroup = nodesToGroup.has(edge.source)
        const targetInGroup = nodesToGroup.has(edge.target)

        // Если один из узлов связи уже в группе, добавляем второй
        if (sourceInGroup && !targetInGroup) {
          // Проверяем, что целевой узел не является группой и не находится уже в другой группе
          const targetNode = nodes.find(n => n.id === edge.target)
          const targetData = targetNode?.data as ComponentData
          if (targetData && targetData.type !== 'group' && !targetData.groupId) {
            nodesToGroup.add(edge.target)
            hasNewNodes = true
            console.log('Добавляем связанный компонент:', edge.target)
          }
        } else if (targetInGroup && !sourceInGroup) {
          // Проверяем, что исходный узел не является группой и не находится уже в другой группе
          const sourceNode = nodes.find(n => n.id === edge.source)
          const sourceData = sourceNode?.data as ComponentData
          if (sourceData && sourceData.type !== 'group' && !sourceData.groupId) {
            nodesToGroup.add(edge.source)
            hasNewNodes = true
            console.log('Добавляем связанный компонент:', edge.source)
          }
        }
      })
    }

    const allNodeIdsToGroup = Array.from(nodesToGroup)
    console.log('Всего компонентов для группировки (включая связанные):', allNodeIdsToGroup.length)
    console.log('Связанные компоненты:', allNodeIdsToGroup.filter(id => !selectedNodeIds.includes(id)))

    // Находим все связи между компонентами группы
    const nodesToGroupSet = new Set(allNodeIdsToGroup)
    const edgesInGroup = edges.filter(edge =>
      nodesToGroupSet.has(edge.source) && nodesToGroupSet.has(edge.target)
    )
    console.log('Найдено связей в группе:', edgesInGroup.length)

    // Присваиваем всем компонентам группы один и тот же groupId
    setNodes((nds) => {
      const updated = nds.map((node) => {
        if (allNodeIdsToGroup.includes(node.id)) {
          const updatedData = {
            ...node.data,
            groupId: groupId,
          }
          console.log('Добавляем groupId к узлу:', node.id, 'groupId:', groupId)
          return {
            ...node,
            data: updatedData,
          }
        }
        return node
      })

      return updated
    })

    // Помечаем все связи между компонентами группы как часть группы
    if (edgesInGroup.length > 0) {
      setEdges((eds) => {
        const updated = eds.map((edge) => {
          if (edgesInGroup.some(e => e.id === edge.id)) {
            const updatedData = {
              ...edge.data,
              groupId: groupId,
            }
            console.log('Добавляем groupId к связи:', edge.id, 'groupId:', groupId)
            return {
              ...edge,
              data: updatedData,
            }
          }
          return edge
        })
        return updated
      })
    }

    // Сохраняем в историю после группировки
    setTimeout(() => {
      if (!isHistoryActionRef.current) {
        const updatedNodes = nodes.map((node) => {
          if (allNodeIdsToGroup.includes(node.id)) {
            return {
              ...node,
              data: {
                ...node.data,
                groupId: groupId,
              },
            }
          }
          return node
        })

        const updatedEdges = edges.map((edge) => {
          if (edgesInGroup.some(e => e.id === edge.id)) {
            return {
              ...edge,
              data: {
                ...edge.data,
                groupId: groupId,
              },
            }
          }
          return edge
        })

        historyManagerRef.current.pushState(updatedNodes, updatedEdges)
        setCanUndo(historyManagerRef.current.canUndo())
        setCanRedo(historyManagerRef.current.canRedo())
      }
    }, 100)

    // Снимаем выделение
    setSelectedNodeIds([])
    setSelectedNodes([])
    setSelectedGroupId(null)
  }, [selectedNodeIds, nodes, edges, setNodes, setEdges])

  // Обработка разгруппировки выбранных компонентов
  const handleUngroupSelected = useCallback(() => {
    if (!selectedGroupId || selectedNodeIds.length === 0) return

    // Удаляем groupId у всех выбранных компонентов
    setNodes((nds) => {
      const updated = nds.map((node) => {
        if (selectedNodeIds.includes(node.id)) {
          const { groupId, ...dataWithoutGroupId } = node.data as ComponentData
          return {
            ...node,
            data: dataWithoutGroupId,
          }
        }
        return node
      })

      return updated
    })

    // Удаляем groupId у всех связей с тем же groupId
    setEdges((eds) => {
      const updated = eds.map((edge) => {
        const edgeData = edge.data as any
        if (edgeData?.groupId === selectedGroupId) {
          const { groupId, ...dataWithoutGroupId } = edgeData
          console.log('Удаляем groupId у связи:', edge.id)
          return {
            ...edge,
            data: dataWithoutGroupId,
          }
        }
        return edge
      })
      return updated
    })

    // Сохраняем в историю после разгруппировки
    setTimeout(() => {
      if (!isHistoryActionRef.current) {
        historyManagerRef.current.pushState(nodesRef.current, edgesRef.current)
        setCanUndo(historyManagerRef.current.canUndo())
        setCanRedo(historyManagerRef.current.canRedo())
      }
    }, 150)


    // Снимаем выделение
    setSelectedNodeIds([])
    setSelectedNodes([])
    setSelectedGroupId(null)
  }, [selectedGroupId, selectedNodeIds, nodes, edges, setNodes, setEdges])

  // Обработка копирования
  const handleCopy = useCallback(() => {
    console.log('📋 ========== handleCopy вызван ==========')

    // Пробуем получить выделенные узлы из ReactFlow напрямую
    const instance = reactFlowInstanceRef.current || reactFlowInstance
    let selectedFromReactFlow: Node[] = []

    if (instance) {
      // Получаем все узлы из ReactFlow и фильтруем выделенные
      const allNodes = instance.getNodes()
      selectedFromReactFlow = allNodes.filter(n => n.selected)
      console.log('📋 Узлы из ReactFlow API (selected):', selectedFromReactFlow.length)
    }

    // Используем selectedNodes из состояния onSelectionChange (более надежно)
    // Также проверяем nodes с selected=true для совместимости
    const selectedFromState = selectedNodes.length > 0 ? selectedNodes : nodes.filter(n => n.selected)

    // Приоритет: ReactFlow API > selectedNodes > nodes.filter
    const nodesToCopy = selectedFromReactFlow.length > 0
      ? selectedFromReactFlow
      : (selectedFromState.length > 0 ? selectedFromState : nodes.filter(n => n.selected))

    console.log('📋 Всего узлов:', nodes.length)
    console.log('📋 Узлы с selected=true:', nodes.filter(n => n.selected).length)
    console.log('📋 selectedNodes.length:', selectedNodes.length)
    console.log('📋 selectedFromReactFlow.length:', selectedFromReactFlow.length)
    console.log('📋 selectedFromState.length:', selectedFromState.length)
    console.log('📋 nodesToCopy.length:', nodesToCopy.length)
    console.log('📋 nodesToCopy:', nodesToCopy.map(n => ({ id: n.id, label: (n.data as ComponentData)?.label || n.id, selected: n.selected })))

    if (nodesToCopy.length === 0) {
      console.log('📋 ❌ Нет выделенных узлов для копирования')
      return
    }

    console.log('📋 ✅ Найдено узлов для копирования:', nodesToCopy.length)

    // Находим все edges, которые связаны с выделенными узлами ИЛИ явно выделены
    const selectedNodeIds = new Set(nodesToCopy.map(n => n.id))
    const relatedEdges = edges.filter(
      edge => (selectedNodeIds.has(edge.source) && selectedNodeIds.has(edge.target)) || edge.selected
    )

    console.log('📋 Найдено связей между выделенными узлами:', relatedEdges.length)

    const copiedData = {
      nodes: nodesToCopy.map(node => ({ ...node })),
      edges: relatedEdges.map(edge => ({ ...edge })),
    }

    setCopiedNodes(copiedData)
    // Сохраняем в localStorage для доступа из других вкладок
    try {
      const dataString = JSON.stringify(copiedData)
      localStorage.setItem('copiedArchitecture', dataString)
      console.log('📋 ✅ Скопировано:', nodesToCopy.length, 'узлов,', relatedEdges.length, 'связей (сохранено в localStorage)')
      console.log('📋 Размер данных в localStorage:', dataString.length, 'символов')
      console.log('📋 ========== handleCopy завершен ==========')
    } catch (e) {
      console.error('⚠️ Не удалось сохранить в localStorage:', e)
      alert('Ошибка при сохранении в буфер обмена: ' + (e instanceof Error ? e.message : String(e)))
    }
  }, [selectedNodes, nodes, edges, reactFlowInstance, reactFlowInstanceRef])

  // Обработка вставки
  const handlePaste = useCallback(() => {
    // Сначала пытаемся использовать состояние, если нет - загружаем из localStorage
    let dataToPaste = copiedNodes

    if (!dataToPaste || dataToPaste.nodes.length === 0) {
      // Пытаемся загрузить из localStorage (для работы между вкладками)
      try {
        const savedData = localStorage.getItem('copiedArchitecture')
        if (savedData) {
          dataToPaste = JSON.parse(savedData)
          if (dataToPaste) {
            setCopiedNodes(dataToPaste)
            console.log('📋 Загружено из localStorage:', dataToPaste.nodes.length, 'узлов')
          }
        }
      } catch (e) {
        console.warn('⚠️ Не удалось загрузить из localStorage:', e)
      }
    }

    if (!dataToPaste || dataToPaste.nodes.length === 0) {
      console.log('📋 Нет скопированных узлов для вставки')
      return
    }
    console.log('📋 Вставляю:', dataToPaste.nodes.length, 'узлов')

    // Получаем текущий viewport для определения позиции вставки
    const instance = reactFlowInstanceRef.current || reactFlowInstance
    const viewport = instance?.getViewport() || { x: 0, y: 0, zoom: 1 }

    // Вычисляем позицию вставки
    // Если есть выделенные узлы, вставляем рядом с ними, иначе в центр видимой области
    let pasteOffsetX = 50
    let pasteOffsetY = 50

    const selectedNodesList = nodes.filter(n => n.selected)
    if (selectedNodesList.length > 0) {
      // Если есть выделенные узлы, вставляем рядом с ними
      const avgX = selectedNodesList.reduce((sum, n) => sum + n.position.x, 0) / selectedNodesList.length
      const avgY = selectedNodesList.reduce((sum, n) => sum + n.position.y, 0) / selectedNodesList.length
      pasteOffsetX = avgX + 100
      pasteOffsetY = avgY + 100
    } else if (instance) {
      // Вставляем в центр видимой области экрана
      const screenCenterX = window.innerWidth / 2
      const screenCenterY = window.innerHeight / 2
      const flowCenter = instance.screenToFlowPosition({ x: screenCenterX, y: screenCenterY })
      pasteOffsetX = flowCenter.x
      pasteOffsetY = flowCenter.y
    }

    // Вычисляем минимальные координаты скопированных узлов для правильного смещения
    const minX = Math.min(...dataToPaste.nodes.map(n => n.position.x))
    const minY = Math.min(...dataToPaste.nodes.map(n => n.position.y))

    // Создаем новые ID для копируемых узлов
    const nodeIdMap = new Map<string, string>()
    const timestamp = Date.now()
    const newNodes: Node[] = dataToPaste.nodes.map((node, index) => {
      const newId = `${node.id}-copy-${timestamp}-${index}`
      nodeIdMap.set(node.id, newId)

      const nodeData = node.data as ComponentData
      // Для бизнес-домена назначаем новый цвет при вставке
      let updatedData = { ...node.data }
      if (nodeData?.type === 'business-domain') {
        const existingDomains = nodes.filter(n => {
          const data = n.data as ComponentData
          return data?.type === 'business-domain'
        })
        const domainColors = [
          '#ffa94d', '#51cf66', '#4dabf7', '#845ef7', '#ffd43b',
          '#ff6b6b', '#20c997', '#ff8787', '#339af0', '#9c88ff',
        ]
        const newColor = domainColors[existingDomains.length % domainColors.length]
        updatedData = {
          ...node.data,
          systemConfig: {
            ...(nodeData.systemConfig || { childNodes: [] }),
            domainColor: newColor,
          },
        }
      }

      // Смещаем позицию относительно точки вставки
      const newNode: Node = {
        ...node,
        id: newId,
        data: updatedData,
        position: {
          x: pasteOffsetX + (node.position.x - minX),
          y: pasteOffsetY + (node.position.y - minY),
        },
      }
      newNode.selected = true
      return newNode
    })

    // Снимаем выделение со всех существующих узлов и связей перед вставкой
    setNodes(nds => nds.map(n => ({ ...n, selected: false })))
    setEdges(eds => eds.map(e => ({ ...e, selected: false })))

    // Создаем новые edges с обновленными ID
    const newEdges: Edge[] = dataToPaste.edges.map((edge, index) => {
      const isNewSource = nodeIdMap.has(edge.source)
      const isNewTarget = nodeIdMap.has(edge.target)

      const newSourceId = nodeIdMap.get(edge.source) || edge.source
      const newTargetId = nodeIdMap.get(edge.target) || edge.target

      // Сохраняем все свойства edge, включая waypoints, pathType, labelPosition, verticalSegmentX
      const newEdge: Edge = {
        ...edge,
        id: `${edge.id}-copy-${timestamp}-${index}`,
        source: newSourceId,
        target: newTargetId,
        // Сохраняем Handle ID для новых связей, чтобы они оставались привязанными к тем же точкам
        sourceHandle: edge.sourceHandle,
        targetHandle: edge.targetHandle,
        selected: true,
        // Сохраняем все данные edge, включая waypoints, pathType, labelPosition, verticalSegmentX
        data: {
          ...edge.data,
          // Waypoints нужно обновить координаты относительно новых позиций узлов
          // МЫ смещаем их только если оба узла новые (целая ветка скопирована)
          // Или если это "хвост" к старому узлу - тогда оставляем как есть или смещаем аккуратно
          waypoints: edge.data?.waypoints ? edge.data.waypoints.map((wp: any) => ({
            ...wp,
            // Смещаем вейпоинт только если мы копируем "ветку" (оба узла новые)
            x: isNewSource && isNewTarget ? wp.x - minX + pasteOffsetX : wp.x,
            y: isNewSource && isNewTarget ? wp.y - minY + pasteOffsetY : wp.y,
          })) : undefined,
          // LabelPosition аналогично
          labelPosition: edge.data?.labelPosition ? {
            x: isNewSource && isNewTarget ? edge.data.labelPosition.x - minX + pasteOffsetX : edge.data.labelPosition.x,
            y: isNewSource && isNewTarget ? edge.data.labelPosition.y - minY + pasteOffsetY : edge.data.labelPosition.y,
          } : undefined,
          // VerticalSegmentX аналогично
          verticalSegmentX: (typeof edge.data?.verticalSegmentX === 'number') && isNewSource && isNewTarget
            ? edge.data.verticalSegmentX - minX + pasteOffsetX
            : edge.data?.verticalSegmentX,
          // Update single waypoint coordinates
          waypointX: (typeof edge.data?.waypointX === 'number') && isNewSource && isNewTarget
            ? edge.data.waypointX - minX + pasteOffsetX
            : edge.data?.waypointX,
          waypointY: (typeof edge.data?.waypointY === 'number') && isNewSource && isNewTarget
            ? edge.data.waypointY - minY + pasteOffsetY
            : edge.data?.waypointY,
        },
      }
      return newEdge
    }).filter((edge): edge is Edge => edge !== null)

    // Добавляем новые узлы и связи
    setNodes((nds) => [...nds, ...newNodes])
    setEdges((eds) => [...eds, ...newEdges])

    // Выделяем новые узлы после вставки
    setTimeout(() => {
      setSelectedNodes(newNodes)
      // Выделяем узлы в ReactFlow
      if (instance) {
        instance.setNodes((nds) =>
          nds.map((n) => ({
            ...n,
            selected: newNodes.some(newNode => newNode.id === n.id),
          }))
        )
      }
    }, 50)

    // Сохраняем в историю после вставки
    setTimeout(() => {
      if (!isHistoryActionRef.current) {
        setNodes((nds) => {
          const updatedNodes = nds
          setEdges((eds) => {
            const updatedEdges = eds
            historyManagerRef.current.pushState(updatedNodes, updatedEdges)
            setCanUndo(historyManagerRef.current.canUndo())
            setCanRedo(historyManagerRef.current.canRedo())
            return updatedEdges
          })
          return updatedNodes
        })
      }
    }, 100)
  }, [copiedNodes, nodes, edges, setNodes, setEdges, setSelectedNodes, reactFlowInstance, setCanUndo, setCanRedo])

  // Экспорт в PNG
  const handleExportPNG = useCallback(async () => {
    const selector = '.react-flow__viewport'
    const element = document.querySelector(selector) as HTMLElement
    if (!element) return

    try {
      const canvas = await html2canvas(element, {
        backgroundColor: null,
        scale: 2,
        ignoreElements: (element) => element.classList.contains('react-flow__controls') || element.classList.contains('react-flow__minimap')
      })

      const link = document.createElement('a')
      link.download = `architecture-${Date.now()}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
    } catch (error) {
      console.error('Error exporting PNG:', error)
      alert('Ошибка при экспорте в PNG')
    }
  }, [])



  // Дублирование компонентов
  const handleDuplicate = useCallback(() => {
    const selected = nodes.filter(n => n.selected)
    if (selected.length === 0) return

    const offset = 50
    const timestamp = Date.now()
    const idMap = new Map<string, string>()

    const newNodes = selected.map((node, index) => {
      const newId = `${node.id}-copy-${timestamp}-${index}`
      idMap.set(node.id, newId)

      // Создаем копию данных, сбрасываем groupId если дублируем только один компонент из группы (опционально)
      // Здесь мы просто копируем все данные

      return {
        ...node,
        id: newId,
        position: {
          x: node.position.x + offset,
          y: node.position.y + offset
        },
        selected: true,
        data: { ...node.data }
      }
    })

    // Копируем связи между выделенными узлами
    const selectedIds = new Set(selected.map(n => n.id))
    const relevantEdges = edges.filter(e => selectedIds.has(e.source) && selectedIds.has(e.target))

    const newEdges = relevantEdges.map((edge, index) => ({
      ...edge,
      id: `${edge.id}-copy-${timestamp}-${index}`,
      source: idMap.get(edge.source)!,
      target: idMap.get(edge.target)!,
      selected: true,
      data: {
        ...edge.data,
        // Update waypoints array
        waypoints: edge.data?.waypoints ? edge.data.waypoints.map((wp: any) => ({
          ...wp,
          x: wp.x + offset,
          y: wp.y + offset,
        })) : undefined,
        // Update single waypoint coordinates
        waypointX: (typeof edge.data?.waypointX === 'number') ? edge.data.waypointX + offset : undefined,
        waypointY: (typeof edge.data?.waypointY === 'number') ? edge.data.waypointY + offset : undefined,
        // Update vertical segment X
        verticalSegmentX: (typeof edge.data?.verticalSegmentX === 'number') ? edge.data.verticalSegmentX + offset : undefined,
        // Update label position
        labelPosition: edge.data?.labelPosition ? {
          x: edge.data.labelPosition.x + offset,
          y: edge.data.labelPosition.y + offset,
        } : undefined,
      }
    }))

    // Снимаем выделение с текущих и добавляем новые
    setNodes(nds => nds.map(n => ({ ...n, selected: false })).concat(newNodes))
    setEdges(eds => eds.map(e => ({ ...e, selected: false })).concat(newEdges))

    // Выделяем новые узлы в ReactFlow
    setTimeout(() => {
      setSelectedNodes(newNodes)
    }, 50)

  }, [nodes, edges, setNodes, setEdges, setSelectedNodes])

  // Отслеживание зажатой клавиши Space для панорамирования
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code === 'Space' && !event.repeat) {
        setIsSpacePressed(true)
      }
    }

    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.code === 'Space') {
        setIsSpacePressed(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [])

  // Обработка удаления, копирования и вставки по клавишам
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Проверяем, не находится ли фокус в поле ввода (input, textarea, contenteditable)
      const activeElement = document.activeElement
      const isInputFocused = activeElement && (
        activeElement.tagName === 'INPUT' ||
        activeElement.tagName === 'TEXTAREA' ||
        activeElement.getAttribute('contenteditable') === 'true' ||
        activeElement.closest('[contenteditable="true"]') !== null ||
        // Проверяем, не является ли активный элемент частью формы или редактируемого поля
        (activeElement.closest('input') !== null) ||
        (activeElement.closest('textarea') !== null)
      )

      // Ctrl+C или Cmd+C (Mac) - используем event.code для независимости от раскладки
      if ((event.ctrlKey || event.metaKey) && event.code === 'KeyC') {
        // Разрешаем копирование из полей ввода
        if (!isInputFocused) {
          event.preventDefault()
          event.stopPropagation()
          event.stopImmediatePropagation()
          console.log('⌨️ ========== Ctrl+C (KeyC) обработан - вызываю handleCopy ==========')
          handleCopy()
          return false
        }
      }

      // Ctrl+V или Cmd+V (Mac) - используем event.code для независимости от раскладки
      if ((event.ctrlKey || event.metaKey) && event.code === 'KeyV') {
        // Разрешаем вставку в поля ввода
        if (!isInputFocused) {
          event.preventDefault()
          event.stopPropagation()
          console.log('⌨️ Ctrl+V (KeyV) обработан')
          handlePaste()
        }
      }

      // Ctrl+D или Cmd+D - Дублирование
      if ((event.ctrlKey || event.metaKey) && event.code === 'KeyD') {
        if (!isInputFocused) {
          event.preventDefault()
          event.stopPropagation()
          handleDuplicate()
          return false
        }
      }

      // Delete или Backspace - НЕ удаляем компоненты, если фокус в поле ввода
      if ((event.code === 'Delete' || event.code === 'Backspace') && !isInputFocused) {
        deleteSelected()
      }

      const isZ = event.code === 'KeyZ' || (event.key && event.key.toLowerCase() === 'z') || (event.key && (event.key === 'я' || event.key === 'Я'))
      const isY = event.code === 'KeyY' || (event.key && event.key.toLowerCase() === 'y') || (event.key && (event.key === 'н' || event.key === 'Н'))

      // Ctrl+Z или Cmd+Z - Undo
      if ((event.ctrlKey || event.metaKey) && isZ && !event.shiftKey) {
        if (!isInputFocused) {
          event.preventDefault()
          event.stopPropagation()
          event.stopImmediatePropagation()
          handleUndo()
          return false
        }
      }

      // Ctrl+Shift+Z или Cmd+Shift+Z - Redo
      if ((event.ctrlKey || event.metaKey) && isZ && event.shiftKey) {
        if (!isInputFocused) {
          event.preventDefault()
          event.stopPropagation()
          event.stopImmediatePropagation()
          handleRedo()
          return false
        }
      }

      // Ctrl+Y или Cmd+Y - Redo
      if ((event.ctrlKey || event.metaKey) && isY) {
        if (!isInputFocused) {
          event.preventDefault()
          event.stopPropagation()
          event.stopImmediatePropagation()
          handleRedo()
          return false
        }
      }

    }

    // Используем capture phase для перехвата событий раньше других обработчиков
    document.addEventListener('keydown', handleKeyDown, true)
    return () => {
      document.removeEventListener('keydown', handleKeyDown, true)
    }
  }, [deleteSelected, handleCopy, handlePaste, handleUndo, handleRedo, handleDuplicate])

  // Функция для получения рекомендаций
  // Функция для автоматического построения компонентов из рекомендации (удалена - рекомендации отключены)
  const _handleBuildRecommendation = useCallback(
    (recommendation: any) => {
      if (!recommendation.suggestedComponents || recommendation.suggestedComponents.length === 0) {
        return
      }

      const createdNodes: Map<ComponentType, string> = new Map() // Храним ID узлов вместо самих узлов
      const spacing = 250 // Расстояние между компонентами
      let offsetX = 0
      let offsetY = 0

      // Находим существующие связанные узлы для размещения новых компонентов рядом
      const relatedNodes: Node[] = []
      if (recommendation.relatedNodes && recommendation.relatedNodes.length > 0) {
        recommendation.relatedNodes.forEach((nodeId: string) => {
          const node = nodes.find(n => n.id === nodeId)
          if (node) relatedNodes.push(node)
        })
      }
      if (recommendation.relatedEdges && recommendation.relatedEdges.length > 0) {
        recommendation.relatedEdges.forEach((edgeId: string) => {
          const edge = edges.find(e => e.id === edgeId)
          if (edge) {
            const sourceNode = nodes.find(n => n.id === edge.source)
            const targetNode = nodes.find(n => n.id === edge.target)
            if (sourceNode && !relatedNodes.find(n => n.id === sourceNode.id)) relatedNodes.push(sourceNode)
            if (targetNode && !relatedNodes.find(n => n.id === targetNode.id)) relatedNodes.push(targetNode)
          }
        })
      }

      // Определяем базовую позицию для размещения новых компонентов
      let basePosition = { x: 400, y: 300 }
      if (relatedNodes.length > 0) {
        // Размещаем рядом с первым связанным узлом
        const firstNode = relatedNodes[0]
        basePosition = {
          x: (firstNode.position?.x || 0) + (firstNode.width || 200) + spacing,
          y: (firstNode.position?.y || 0),
        }
      } else if (reactFlowInstance) {
        // Размещаем в центре видимой области
        const centerX = window.innerWidth / 2 - 250
        const centerY = window.innerHeight / 2
        basePosition = reactFlowInstance.screenToFlowPosition({ x: centerX, y: centerY })
      }

      // Создаем предложенные компоненты и сразу сохраняем их ID
      const newNodesToAdd: Node[] = []
      recommendation.suggestedComponents.forEach((componentType: ComponentType) => {
        // Проверяем, не существует ли уже такой компонент
        const existingNode = nodes.find(n => (n.data as ComponentData).type === componentType)
        if (existingNode) {
          // Если компонент уже существует, используем его
          createdNodes.set(componentType, existingNode.id)
          return
        }

        const position = {
          x: basePosition.x + offsetX,
          y: basePosition.y + offsetY,
        }
        offsetX += spacing
        if (offsetX > spacing * 2) {
          offsetX = 0
          offsetY += spacing
        }

        // Создаем узел напрямую
        const newNodeId = `${componentType}-${Date.now()}-${Math.random()}`
        const isSystemType = componentType === 'system' || componentType === 'external-system' || componentType === 'business-domain'

        // Для бизнес-домена определяем уникальный цвет
        let domainColor = '#ffa94d'
        if (componentType === 'business-domain') {
          const existingDomains = nodes.filter(n => {
            const data = n.data as ComponentData
            return data?.type === 'business-domain'
          })
          const domainColors = [
            '#ffa94d', '#51cf66', '#4dabf7', '#845ef7', '#ffd43b',
            '#ff6b6b', '#20c997', '#ff8787', '#339af0', '#9c88ff',
          ]
          domainColor = domainColors[existingDomains.length % domainColors.length]
        }

        const newNode: Node = {
          id: newNodeId,
          type: isSystemType ? (componentType === 'business-domain' ? 'business-domain' : 'system') : 'custom',
          position,
          data: {
            type: componentType,
            label: getComponentLabel(componentType),
            connectionType: getDefaultConnectionMode(componentType),
            ...(isSystemType && {
              systemConfig: {
                childNodes: [],
                ...(componentType === 'business-domain' && { domainColor }),
              }
            }),
          },
          ...(isSystemType && {
            width: 600,
            height: 400,
            style: { zIndex: -1 },
          }),
        }
        newNodesToAdd.push(newNode)
        createdNodes.set(componentType, newNodeId)
      })

      // Добавляем все новые узлы сразу и сразу создаем соединения
      if (newNodesToAdd.length > 0) {
        setNodes((nds) => {
          const updated = [...nds, ...newNodesToAdd]
          // Отправляем событие о добавлении узлов для обновления систем
          setTimeout(() => {
            newNodesToAdd.forEach(node => {
              window.dispatchEvent(new CustomEvent('nodeadd', { detail: { nodeId: node.id } }))
            })
          }, 100)

          // Создаем предложенные соединения сразу после обновления узлов
          if (recommendation.suggestedConnections && recommendation.suggestedConnections.length > 0) {
            setTimeout(() => {
              // Используем актуальное состояние nodes и edges
              setNodes((currentNodes) => {
                recommendation.suggestedConnections!.forEach((conn: { from: ComponentType; to: ComponentType; connectionType: string; description: string }) => {
                  // Находим узлы для соединения
                  let sourceNodeId: string | undefined
                  let targetNodeId: string | undefined

                  // Ищем source узел
                  if (createdNodes.has(conn.from)) {
                    sourceNodeId = createdNodes.get(conn.from)
                  } else {
                    const existingSource = currentNodes.find(n => (n.data as ComponentData).type === conn.from)
                    if (existingSource) {
                      sourceNodeId = existingSource.id
                    } else if (relatedNodes.length > 0) {
                      const relatedSource = relatedNodes.find(n => (n.data as ComponentData).type === conn.from)
                      if (relatedSource) {
                        sourceNodeId = relatedSource.id
                      } else {
                        sourceNodeId = relatedNodes[0].id
                      }
                    }
                  }

                  // Ищем target узел
                  if (createdNodes.has(conn.to)) {
                    targetNodeId = createdNodes.get(conn.to)
                  } else {
                    const existingTarget = currentNodes.find(n => (n.data as ComponentData).type === conn.to)
                    if (existingTarget) {
                      targetNodeId = existingTarget.id
                    } else if (relatedNodes.length > 0) {
                      const relatedTarget = relatedNodes.find(n => (n.data as ComponentData).type === conn.to)
                      if (relatedTarget) {
                        targetNodeId = relatedTarget.id
                      } else {
                        targetNodeId = relatedNodes[0].id
                      }
                    }
                  }

                  if (sourceNodeId && targetNodeId && sourceNodeId !== targetNodeId) {
                    // Проверяем, не существует ли уже такое соединение
                    setEdges((currentEdges) => {
                      const existingEdge = currentEdges.find(e =>
                        (e.source === sourceNodeId && e.target === targetNodeId) ||
                        (e.source === targetNodeId && e.target === sourceNodeId)
                      )

                      if (!existingEdge) {
                        // Создаем edge напрямую
                        const getLabelText = (type: ConnectionType): string => {
                          switch (type) {
                            case 'async':
                              return 'Async'
                            case 'database-connection':
                              return 'DB Connection'
                            case 'cache-connection':
                              return 'Cache'
                            default:
                              return type.toUpperCase()
                          }
                        }

                        const getColor = (type: ConnectionType): string => {
                          switch (type) {
                            case 'async':
                              return '#ffd43b'
                            case 'database-connection':
                              return '#51cf66'
                            case 'cache-connection':
                              return '#845ef7'
                            case 'database-replication':
                              return '#20c997'
                            case 'dependency':
                              return '#9c88ff'
                            case 'composition':
                              return '#ff6b6b'
                            case 'aggregation':
                              return '#ff8787'
                            case 'method-call':
                              return '#51cf66'
                            case 'inheritance':
                              return '#4dabf7'
                            default:
                              return '#4dabf7'
                          }
                        }

                        const connectionType = conn.connectionType as ConnectionType
                        const newEdge: Edge = {
                          id: `edge-${sourceNodeId}-${targetNodeId}-${Date.now()}-${Math.random()}`,
                          source: sourceNodeId,
                          target: targetNodeId,
                          sourceHandle: 'bottom',
                          targetHandle: 'top',
                          type: 'animated',
                          animated: connectionType === 'async' || connectionType === 'database-replication',
                          // Label не устанавливается при создании - будет добавлен только если указано описание данных
                          style: {
                            stroke: getColor(connectionType),
                            strokeWidth: connectionType === 'inheritance' ? 3 : 5,
                            strokeDasharray:
                              connectionType === 'async' || connectionType === 'database-replication'
                                ? '8,4'
                                : connectionType === 'inheritance'
                                  ? '5,5'
                                  : undefined,
                          },
                          data: {
                            connectionType,
                            pathType: 'step' as EdgePathType, // По умолчанию прямоугольная линия для лучшего отображения направлений
                          },
                        }

                        return addEdge(newEdge, currentEdges)
                      }

                      return currentEdges
                    })
                  }
                })

                return currentNodes
              })
            }, 200) // Задержка для гарантии обновления DOM
          }

          return updated
        })
      } else {
        // Если новых узлов нет, но есть соединения, создаем их сразу
        if (recommendation.suggestedConnections && recommendation.suggestedConnections.length > 0) {
          recommendation.suggestedConnections.forEach((conn: { from: ComponentType; to: ComponentType; connectionType: string; description: string }) => {
            // Находим узлы для соединения
            let sourceNodeId: string | undefined
            let targetNodeId: string | undefined

            // Ищем source узел
            if (createdNodes.has(conn.from)) {
              sourceNodeId = createdNodes.get(conn.from)
            } else {
              // Ищем существующий узел нужного типа
              const existingSource = nodes.find(n => (n.data as ComponentData).type === conn.from)
              if (existingSource) {
                sourceNodeId = existingSource.id
              } else if (relatedNodes.length > 0) {
                // Если не нашли по типу, ищем в связанных узлах
                const relatedSource = relatedNodes.find(n => (n.data as ComponentData).type === conn.from)
                if (relatedSource) {
                  sourceNodeId = relatedSource.id
                } else {
                  sourceNodeId = relatedNodes[0].id
                }
              }
            }

            // Ищем target узел
            if (createdNodes.has(conn.to)) {
              targetNodeId = createdNodes.get(conn.to)
            } else {
              // Ищем существующий узел нужного типа
              const existingTarget = nodes.find(n => (n.data as ComponentData).type === conn.to)
              if (existingTarget) {
                targetNodeId = existingTarget.id
              } else if (relatedNodes.length > 0) {
                // Если не нашли по типу, ищем в связанных узлах
                const relatedTarget = relatedNodes.find(n => (n.data as ComponentData).type === conn.to)
                if (relatedTarget) {
                  targetNodeId = relatedTarget.id
                } else {
                  targetNodeId = relatedNodes[0].id
                }
              }
            }

            if (sourceNodeId && targetNodeId && sourceNodeId !== targetNodeId) {
              // Проверяем, не существует ли уже такое соединение
              const existingEdge = edges.find(e =>
                (e.source === sourceNodeId && e.target === targetNodeId) ||
                (e.source === targetNodeId && e.target === sourceNodeId)
              )

              if (!existingEdge) {
                const connection: Connection = {
                  source: sourceNodeId,
                  target: targetNodeId,
                  sourceHandle: 'bottom',
                  targetHandle: 'top',
                }
                createConnectionEdge(connection, conn.connectionType as ConnectionType)
              }
            }
          })
        }
      }
    },
    [nodes, edges, setNodes, reactFlowInstance, createConnectionEdge]
  )

  // Обработка переименования узлов и обновления размеров систем
  React.useEffect(() => {
    const handleNodeLabelUpdate = (event: CustomEvent<{ nodeId: string; label: string }>) => {
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === event.detail.nodeId) {
            return {
              ...node,
              data: {
                ...node.data,
                label: event.detail.label,
              },
            }
          }
          return node
        })
      )
    }

    const handleSystemSizeUpdate = (event: CustomEvent<{
      systemId: string
      childNodes: string[]
      width: number
      height: number
      position: { x: number; y: number }
    }>) => {
      const { systemId, childNodes, width, height } = event.detail
      // НЕ обновляем позицию системы - она должна оставаться на месте
      // Обновляем только размер и список дочерних узлов
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === systemId) {
            return {
              ...node,
              // position не обновляется - система остается на своем месте
              width,
              height,
              data: {
                ...node.data,
                systemConfig: {
                  childNodes,
                },
              },
            }
          }
          return node
        })
      )
    }

    const handleSystemNodesUpdate = (event: CustomEvent<{
      systemId: string
      childNodes: string[]
    }>) => {
      const { systemId, childNodes } = event.detail
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === systemId) {
            return {
              ...node,
              data: {
                ...node.data,
                systemConfig: {
                  childNodes,
                },
              },
            }
          }
          return node
        })
      )
    }


    const handleContainerSizeUpdate = (event: CustomEvent<{
      containerId: string
      childNodes: string[]
      width: number
      height: number
      position: { x: number; y: number }
    }>) => {
      const { containerId, childNodes, width, height } = event.detail

      setNodes((nds) => {
        // 1. Identify valid child nodes in the current list
        // Filter out the container itself to avoid recursion
        const validChildNodes = childNodes.filter(id => id !== containerId);

        return nds.map((node) => {
          // If it's the container, update its config
          if (node.id === containerId) {
            return {
              ...node,
              width,
              height,
              data: {
                ...node.data,
                containerConfig: {
                  ...(node.data as ComponentData).containerConfig,
                  childNodes: validChildNodes,
                },
              },
            }
          }

          // If it's a child node inside the container, assign groupId
          if (validChildNodes.includes(node.id)) {
            // Only update if it doesn't already have this groupId to avoid unnecessary renders
            if ((node.data as ComponentData).groupId !== containerId) {
              return {
                ...node,
                data: {
                  ...node.data,
                  groupId: containerId
                }
              }
            }
          }

          // If the node was previously in this container but is NOT anymore
          // We need to check if its current groupId matches this containerId
          if ((node.data as ComponentData).groupId === containerId && !validChildNodes.includes(node.id)) {
            return {
              ...node,
              data: {
                ...node.data,
                groupId: undefined // Remove from group
              }
            }
          }

          return node
        })
      })
    }

    const handleContainerManualResize = (event: CustomEvent<{
      containerId: string
      isManuallyResized: boolean
    }>) => {
      const { containerId, isManuallyResized } = event.detail
      setNodes((nds) =>
        nds.map(node => {
          if (node.id === containerId) {
            return {
              ...node,
              data: {
                ...node.data,
                containerConfig: {
                  ...(node.data as ComponentData).containerConfig,
                  isManuallyResized
                }
              }
            }
          }
          return node
        })
      )
    }

    const handleGroupSizeUpdate = (event: CustomEvent<{
      groupId: string
      childNodes: string[]
      width: number
      height: number
      position: { x: number; y: number }
    }>) => {
      const { groupId, childNodes, width, height } = event.detail
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === groupId) {
            return {
              ...node,
              width,
              height,
              data: {
                ...node.data,
                groupConfig: {
                  ...(node.data as ComponentData).groupConfig,
                  childNodes,
                  isGrouped: true,
                },
              },
            }
          }
          return node
        })
      )
    }

    const handleNodeDataUpdate = (event: Event) => {
      const customEvent = event as CustomEvent<{ nodeId: string; data: any }>
      const { nodeId, data } = customEvent.detail
      updateNodesWithHistory((nds) =>
        nds.map((node) => (node.id === nodeId ? { ...node, data: { ...node.data, ...data } } : node))
      )
    }

    const handleNodeSizeUpdate = (event: Event) => {
      const customEvent = event as CustomEvent<{ nodeId: string; width: number | null; height: number | null }>
      const { nodeId, width, height } = customEvent.detail
      updateNodesWithHistory((nds) =>
        nds.map((node) => {
          if (node.id === nodeId) {
            return {
              ...node,
              width: width === null ? undefined : width,
              height: height === null ? undefined : height,
              style: {
                ...node.style,
                width: width === null ? undefined : width,
                height: height === null ? undefined : height,
              }
            }
          }
          return node
        })
      )
    }

    window.addEventListener('nodeDataUpdate', handleNodeDataUpdate as EventListener)
    window.addEventListener('nodeSizeUpdate', handleNodeSizeUpdate as EventListener)
    window.addEventListener('nodeLabelUpdate', handleNodeLabelUpdate as EventListener)
    window.addEventListener('systemSizeUpdate', handleSystemSizeUpdate as EventListener)
    window.addEventListener('systemNodesUpdate', handleSystemNodesUpdate as EventListener)
    window.addEventListener('containerSizeUpdate', handleContainerSizeUpdate as EventListener)
    window.addEventListener('containerManualResize', handleContainerManualResize as EventListener)
    window.addEventListener('groupSizeUpdate', handleGroupSizeUpdate as EventListener)

    const handleComponentInfoClick = (event: Event) => {
      const customEvent = event as CustomEvent<{ componentType: ComponentType }>
      setInfoComponentType(customEvent.detail.componentType)
    }

    const handleComponentLinkClick = (event: Event) => {
      const customEvent = event as CustomEvent<{ link: ComponentLink }>
      handleLinkClick(customEvent.detail.link)
    }

    const handleComponentLinkConfigClick = (event: Event) => {
      const customEvent = event as CustomEvent<{ nodeId: string }>
      const node = nodes.find(n => n.id === customEvent.detail.nodeId)
      if (node) {
        setLinkConfigNode(node)
      }
    }

    window.addEventListener('componentInfoClick', handleComponentInfoClick as EventListener)
    window.addEventListener('componentLinkClick', handleComponentLinkClick as EventListener)
    window.addEventListener('componentLinkConfigClick', handleComponentLinkConfigClick as EventListener)

    const handleComponentCommentClick = (event: Event) => {
      const customEvent = event as CustomEvent<{ nodeId: string }>
      const node = nodesRef.current.find(n => n.id === customEvent.detail.nodeId)
      if (node) {
        setCommentNode(node)
      }
    }

    window.addEventListener('componentCommentClick', handleComponentCommentClick as EventListener)

    const handleComponentStatusChange = (event: Event) => {
      const customEvent = event as CustomEvent<{ nodeId: string; status: 'new' | 'existing' | 'refinement' | undefined }>
      updateNodesWithHistory((nds) =>
        nds.map((node) => {
          if (node.id === customEvent.detail.nodeId) {
            return {
              ...node,
              data: {
                ...node.data,
                status: customEvent.detail.status,
              },
            }
          }
          return node
        })
      )
    }

    window.addEventListener('componentStatusChange', handleComponentStatusChange as EventListener)

    const handleComponentColorChange = (event: Event) => {
      const customEvent = event as CustomEvent<{ nodeId: string; color: string | undefined }>
      updateNodesWithHistory((nds) =>
        nds.map((node) => {
          if (node.id === customEvent.detail.nodeId) {
            return {
              ...node,
              data: {
                ...node.data,
                customColor: customEvent.detail.color,
              },
            }
          }
          return node
        })
      )
    }

    window.addEventListener('componentColorChange', handleComponentColorChange as EventListener)

    const handleShowAIAssistant = () => {
      setShowAIAssistant(true)
    }

    window.addEventListener('showAIAssistant', handleShowAIAssistant as EventListener)

    const handleShowLearningPanel = () => {
      setShowLearningPanel(true)
    }

    window.addEventListener('showLearningPanel', handleShowLearningPanel as EventListener)

    // Обработчик синхронизации между вкладками отключен для изоляции сессий
    // (код удален)

    return () => {
      window.removeEventListener('nodeDataUpdate', handleNodeDataUpdate as EventListener)
      window.removeEventListener('nodeSizeUpdate', handleNodeSizeUpdate as EventListener)
      window.removeEventListener('nodeLabelUpdate', handleNodeLabelUpdate as EventListener)
      window.removeEventListener('systemSizeUpdate', handleSystemSizeUpdate as EventListener)
      window.removeEventListener('systemNodesUpdate', handleSystemNodesUpdate as EventListener)
      window.removeEventListener('containerSizeUpdate', handleContainerSizeUpdate as EventListener)
      window.removeEventListener('containerManualResize', handleContainerManualResize as EventListener)
      window.removeEventListener('componentInfoClick', handleComponentInfoClick as EventListener)
      window.removeEventListener('componentLinkClick', handleComponentLinkClick as EventListener)
      window.removeEventListener('componentLinkConfigClick', handleComponentLinkConfigClick as EventListener)
      window.removeEventListener('componentCommentClick', handleComponentCommentClick as EventListener)
      window.removeEventListener('componentColorChange', handleComponentColorChange as EventListener)
      window.removeEventListener('showAIAssistant', handleShowAIAssistant as EventListener)
    }
  }, [setNodes, handleLinkClick, setShowAIAssistant, activeWorkspaceId, setWorkspaces, setEdges])

  // Создаем nodeTypes БЕЗ зависимостей - используем события для обработчиков
  // Это предотвращает пересоздание nodeTypes при каждом рендере
  const nodeTypes: NodeTypes = useMemo(() => ({
    custom: (props: NodeProps) => (
      <CustomNode
        {...props}
        onInfoClick={(type: ComponentType) => {
          const event = new CustomEvent('componentInfoClick', { detail: { componentType: type } })
          window.dispatchEvent(event)
        }}
        onLinkClick={(link: ComponentLink) => {
          const event = new CustomEvent('componentLinkClick', { detail: { link } })
          window.dispatchEvent(event)
        }}
        onLinkConfigClick={(nodeId: string) => {
          const event = new CustomEvent('componentLinkConfigClick', { detail: { nodeId } })
          window.dispatchEvent(event)
        }}
        onCommentClick={(nodeId: string) => {
          const event = new CustomEvent('componentCommentClick', { detail: { nodeId } })
          window.dispatchEvent(event)
        }}
        onStatusChange={(nodeId: string, status: 'new' | 'existing' | 'refinement') => {
          const event = new CustomEvent('componentStatusChange', { detail: { nodeId, status } })
          window.dispatchEvent(event)
        }}
        onColorChange={(nodeId: string, color: string | undefined) => {
          const event = new CustomEvent('componentColorChange', { detail: { nodeId, color } })
          window.dispatchEvent(event)
        }}
      />
    ),
    system: (props: NodeProps) => (
      <SystemNode
        {...props}
        onLinkClick={(link: ComponentLink) => {
          const event = new CustomEvent('componentLinkClick', { detail: { link } })
          window.dispatchEvent(event)
        }}
        onLinkConfigClick={(nodeId: string) => {
          const event = new CustomEvent('componentLinkConfigClick', { detail: { nodeId } })
          window.dispatchEvent(event)
        }}
        onColorChange={(nodeId: string, color: string | undefined) => {
          const event = new CustomEvent('componentColorChange', { detail: { nodeId, color } })
          window.dispatchEvent(event)
        }}
      />
    ),
    container: (props: NodeProps) => (
      <ContainerNode
        {...props}
        onLinkClick={(link: ComponentLink) => {
          const event = new CustomEvent('componentLinkClick', { detail: { link } })
          window.dispatchEvent(event)
        }}
        onLinkConfigClick={(nodeId: string) => {
          const event = new CustomEvent('componentLinkConfigClick', { detail: { nodeId } })
          window.dispatchEvent(event)
        }}
        onColorChange={(nodeId: string, color: string | undefined) => {
          const event = new CustomEvent('componentColorChange', { detail: { nodeId, color } })
          window.dispatchEvent(event)
        }}
      />
    ),
    group: (props: NodeProps) => (
      <GroupNode
        {...props}
        onLinkClick={(link: ComponentLink) => {
          const event = new CustomEvent('componentLinkClick', { detail: { link } })
          window.dispatchEvent(event)
        }}
        onLinkConfigClick={(nodeId: string) => {
          const event = new CustomEvent('componentLinkConfigClick', { detail: { nodeId } })
          window.dispatchEvent(event)
        }}
        onColorChange={(nodeId: string, color: string | undefined) => {
          const event = new CustomEvent('componentColorChange', { detail: { nodeId, color } })
          window.dispatchEvent(event)
        }}
      />
    ),
    note: (props: NodeProps) => (
      <NoteNode
        {...props}
        onLinkClick={(link: ComponentLink) => {
          const event = new CustomEvent('componentLinkClick', { detail: { link } })
          window.dispatchEvent(event)
        }}
        onLinkConfigClick={(nodeId: string) => {
          const event = new CustomEvent('componentLinkConfigClick', { detail: { nodeId } })
          window.dispatchEvent(event)
        }}
        onColorChange={(nodeId: string, color: string | undefined) => {
          const event = new CustomEvent('componentColorChange', { detail: { nodeId, color } })
          window.dispatchEvent(event)
        }}
      />
    ),
    'business-domain': (props: NodeProps) => (
      <BusinessDomainNode
        {...props}
        onInfoClick={(type: ComponentType) => {
          const event = new CustomEvent('componentInfoClick', { detail: { componentType: type } })
          window.dispatchEvent(event)
        }}
        onLinkClick={(link: ComponentLink) => {
          const event = new CustomEvent('componentLinkClick', { detail: { link } })
          window.dispatchEvent(event)
        }}
        onLinkConfigClick={(nodeId: string) => {
          const event = new CustomEvent('componentLinkConfigClick', { detail: { nodeId } })
          window.dispatchEvent(event)
        }}
        onColorChange={(nodeId: string, color: string | undefined) => {
          const event = new CustomEvent('componentColorChange', { detail: { nodeId, color } })
          window.dispatchEvent(event)
        }}
      />
    ),
    text: (props: NodeProps) => (
      <TextNode
        {...props}
      />
    ),
  }), []) // Пустой массив зависимостей - nodeTypes создаются один раз

  // Фильтруем узлы: скрываем дочерние узлы свернутых систем
  const visibleNodes = useMemo(() => {
    // Создаем Set с ID всех дочерних узлов свернутых систем
    const hiddenNodeIds = new Set<string>()

    for (const node of nodes) {
      const nodeData = node.data as ComponentData
      if (nodeData.type === 'system' || nodeData.type === 'external-system' || nodeData.type === 'business-domain') {
        if (nodeData.systemConfig?.collapsed) {
          const childNodes = nodeData.systemConfig.childNodes || []
          for (const childId of childNodes) {
            hiddenNodeIds.add(childId)
          }
        }
      }
    }

    if (hiddenNodeIds.size === 0) return nodes;
    return nodes.filter((node) => !hiddenNodeIds.has(node.id))
  }, [nodes])

  // Фильтруем связи: скрываем только связи между дочерними узлами внутри одной свернутой системы
  const visibleEdges = useMemo(() => {
    // Создаем Map: systemId -> Set of childNodeIds для свернутых систем
    const collapsedSystemChildren = new Map<string, Set<string>>()

    for (const node of nodes) {
      const nodeData = node.data as ComponentData
      if (nodeData.type === 'system' || nodeData.type === 'external-system' || nodeData.type === 'business-domain') {
        if (nodeData.systemConfig?.collapsed) {
          const childNodes = nodeData.systemConfig.childNodes || []
          collapsedSystemChildren.set(node.id, new Set(childNodes))
        }
      }
    }

    if (collapsedSystemChildren.size === 0) {
      return edges.filter(e => !(e as any).hidden);
    }

    // Фильтруем связи
    return edges.filter((edge) => {
      // Пропускаем явно скрытые связи (связи между дочерними узлами внутри системы)
      if ((edge as any).hidden === true) {
        return false
      }

      // Проверяем, не находятся ли оба конца связи внутри одной свернутой системы
      for (const [systemId, childNodes] of collapsedSystemChildren) {
        // СНАЧАЛА проверяем, перенаправлена ли связь на систему - такие связи всегда показываем
        if (edge.source === systemId || edge.target === systemId) {
          return true
        }

        // Затем проверяем, находятся ли оба узла внутри системы - такие связи скрываем
        if (childNodes.has(edge.source) && childNodes.has(edge.target)) {
          return false
        }
      }

      return true
    })
  }, [edges, nodes])

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      <TabsPanel
        tabs={workspaces.map(w => ({ id: w.id, name: w.name, isLocked: w.isLocked }))}
        activeTabId={activeWorkspaceId}
        onTabClick={handleTabClick}
        onTabClose={handleTabClose}
        onNewTab={handleNewTab}
        onTabRename={handleTabRename}
      />
      <ComponentPalette
        onComponentClick={handleAddComponentClick}
        onRecommendationClick={() => setShowRecommendationPanel(true)}
      />
      {showRecommendationPanel && (
        <RecommendationPanel
          onClose={() => setShowRecommendationPanel(false)}
          onAdd={(type, vendor) => {
            // Logic to add component with specific vendor
            const reactFlowInstance = reactFlowInstanceRef.current
            if (!reactFlowInstance) return

            const { x, y, zoom } = reactFlowInstance.getViewport()
            const centerX = window.innerWidth / 2 - 250
            const centerY = window.innerHeight / 2

            // Helper to map vendor to node data (simplified)
            const getDataForVendor = (t: ComponentType, v?: string) => {
              const base = { label: v ? v.charAt(0).toUpperCase() + v.slice(1) : t }
              if (!v) return base

              if (t === 'database') {
                let dbType: DatabaseType = 'sql'
                let nosqlType: any = undefined

                if (['mongodb', 'dynamodb', 'couchbase', 'elasticsearch'].includes(v)) {
                  dbType = 'nosql'
                  nosqlType = 'document'
                } else if (v === 'cassandra' || v === 'hbase') {
                  dbType = 'nosql'
                  nosqlType = 'column'
                } else if (v === 'redis' || v === 'memcached') {
                  dbType = 'nosql'
                  nosqlType = 'key-value'
                } else if (v === 'neo4j' || v === 'amazon-neptune') {
                  dbType = 'nosql'
                  nosqlType = 'graph'
                } else if (v === 'influxdb' || v === 'timescale') {
                  dbType = 'nosql'
                  nosqlType = 'time-series'
                }

                return { ...base, databaseConfig: { vendor: v, dbType, nosqlType } }
              }
              if (t === 'data-warehouse') return { ...base, dataWarehouseConfig: { vendor: v as any } }
              if (t === 'search-engine') return { ...base, searchEngineConfig: { vendor: v as any } }
              if (t === 'message-broker') return { ...base, messageBrokerConfig: { vendor: v as any } }
              if (t === 'queue') return { ...base, queueConfig: { vendor: v as any } }
              if (t === 'cache') return { ...base, cacheConfig: { vendor: v as any } }
              if (t === 'etl-service') return { ...base, etlServiceConfig: { vendor: v as any } }
              if (t === 'stream-processor') return { ...base, streamProcessorConfig: { vendor: v as any } }
              if (t === 'api-gateway') return { ...base, apiGatewayConfig: { vendor: v as any } }
              if (t === 'batch-processor') return { ...base, batchProcessorConfig: { vendor: v as any } }
              return base
            }

            const newNode: Node = {
              id: `${type}-${Date.now()}`,
              type: 'custom',
              position: { x: centerX - 100 + Math.random() * 50, y: centerY - 100 + Math.random() * 50 },
              data: {
                type,
                ...getDataForVendor(type, vendor)
              }
            }

            setNodes((nds) => nds.concat(newNode))
            historyUpdateTypeRef.current = 'immediate'
          }}
          onCompare={(type) => {
            setComparisonType(type)
            setShowRecommendationPanel(false)
          }}
        />
      )}
      <FilePanel
        onSave={handleSave}
        onLoad={handleLoad}
        onExportDrawIO={() => saveToDrawIOFile(nodes, edges)}
        onExportPNG={handleExportPNG}

        onSaveLayout={handleSaveLayout}
        workspaces={workspaces}
        activeWorkspaceId={activeWorkspaceId}
      />
      <div
        ref={reactFlowWrapper}
        style={{
          flex: 1,
          position: 'relative',
          width: '100%',
          height: 'calc(100vh - 48px)',
          marginTop: '48px',
          overflow: 'hidden',
          cursor: 'default'
        }}
        onDrop={onDrop}
        onDragOver={onDragOver}
      >
        <ReactFlow
          key={activeWorkspaceId}
          nodes={visibleNodes}
          edges={visibleEdges}
          onNodesChange={handleNodesChange}
          onEdgesChange={handleEdgesChange}
          onConnect={activeWorkspace?.isLocked ? undefined : onConnect}
          onEdgeUpdate={activeWorkspace?.isLocked ? undefined : onEdgeUpdate}
          onNodeClick={onNodeClick}
          onEdgeClick={onEdgeClick}
          onPaneClick={onPaneClick}
          onSelectionChange={onSelectionChange}
          onInit={(instance) => {
            setReactFlowInstance(instance)
            reactFlowInstanceRef.current = instance
            // Восстанавливаем viewport для текущего workspace при инициализации
            const currentWorkspace = workspaces.find(w => w.id === activeWorkspaceId)
            if (currentWorkspace?.viewport) {
              setTimeout(() => {
                instance.setViewport(currentWorkspace.viewport!)
                console.log('🔄 Восстановлен viewport:', currentWorkspace.viewport)
              }, 100)
            } else {
              console.log('ℹ️ Viewport не найден для workspace:', activeWorkspaceId)
            }
          }}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          nodesDraggable={!activeWorkspace?.isLocked}
          nodesConnectable={!activeWorkspace?.isLocked}
          elementsSelectable={!activeWorkspace?.isLocked}
          edgesUpdatable={!activeWorkspace?.isLocked}
          edgesFocusable={!activeWorkspace?.isLocked}

          selectNodesOnDrag={false}
          panOnDrag={[1, 2]} // Панорамирование правой и средней кнопкой мыши
          panOnScroll={true}
          panOnScrollMode="free" // Свободное панорамирование при скролле
          zoomOnScroll={true}
          zoomOnPinch={true}
          selectionOnDrag={!isSpacePressed && !activeWorkspace?.isLocked} // Выделение обводкой работает только когда пробел не зажат и не заблокировано
          onMoveStart={() => {
            // Предотвращаем конфликты при начале перемещения
          }}
          onMoveEnd={() => {
            // Предотвращаем конфликты при окончании перемещения
          }}
          connectionLineStyle={{ stroke: '#4dabf7', strokeWidth: 2, strokeDasharray: '5,5' }}
          connectionMode={ConnectionMode.Loose}
          // connectionRadius позволяет подключаться к Handle в радиусе
          // Используем достаточно большой радиус для удобного подключения к видимым Handle на всех сторонах
          // При этом сохраняем привязку к конкретным Handle ID (top-source, bottom-target, left-source, right-target и т.д.)
          connectionRadius={50} // Радиус для обнаружения Handle (50px достаточно для видимых точек на всех сторонах)
          selectionMode={SelectionMode.Partial}
          // Функция для определения точки подключения на границе узла
          // Вычисляет точку пересечения линии подключения с границей узла
          // Это позволяет подключаться к любой точке границы компонента
          onDragOver={activeWorkspace?.isLocked ? undefined : onDragOver}
          onDrop={activeWorkspace?.isLocked ? undefined : onDrop}
          deleteKeyCode={activeWorkspace?.isLocked ? null : "Delete"}
          multiSelectionKeyCode={activeWorkspace?.isLocked ? null : "Control"}
          selectionKeyCode={activeWorkspace?.isLocked ? null : "Shift"}
          // edgesConnectable={true} // removed as it might not be supported
          minZoom={0.1}
          maxZoom={2}
          style={{ background: isDarkMode ? '#1a1a1a' : '#ffffff' }}
          // Оптимизации производительности
          onlyRenderVisibleElements={true} // Рендерим только видимые элементы
          elevateNodesOnSelect={false} // Отключаем поднятие узлов при выделении для лучшей производительности
          elevateEdgesOnSelect={false} // Отключаем поднятие связей при выделении
        >
          <ConnectionMarkers />
          <Background
            color={isDarkMode ? "#333" : "#e0e0e0"}
            gap={20}
            size={1}
          />
          <Controls
            showInteractive={false}
            style={{
              backgroundColor: '#2d2d2d',
              border: '1px solid #444',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <button
              onClick={(e) => {
                e.stopPropagation()
                e.preventDefault()
                handleToggleLock()
              }}
              title={activeWorkspace?.isLocked ? "Разблокировать вкладку" : "Заблокировать вкладку"}
              style={{
                width: '26px',
                height: '26px',
                backgroundColor: activeWorkspace?.isLocked ? '#e03131' : 'transparent',
                border: 'none',
                borderTop: '1px solid #444',
                color: activeWorkspace?.isLocked ? '#fff' : '#aaa',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '4px',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                if (!activeWorkspace?.isLocked) {
                  e.currentTarget.style.backgroundColor = '#3d3d3d'
                  e.currentTarget.style.color = '#fff'
                }
              }}
              onMouseLeave={(e) => {
                if (!activeWorkspace?.isLocked) {
                  e.currentTarget.style.backgroundColor = 'transparent'
                  e.currentTarget.style.color = '#aaa'
                }
              }}
            >
              {activeWorkspace?.isLocked ? <Lock size={14} /> : <Unlock size={14} />}
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                e.preventDefault()
                setIsDarkMode(!isDarkMode)
              }}
              title={isDarkMode ? "Переключить на светлую тему" : "Переключить на темную тему"}
              style={{
                width: '26px',
                height: '26px',
                backgroundColor: 'transparent',
                border: 'none',
                borderTop: '1px solid #444',
                color: isDarkMode ? '#aaa' : '#666',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '4px',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = isDarkMode ? '#3d3d3d' : '#eee'
                e.currentTarget.style.color = isDarkMode ? '#fff' : '#333'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent'
                e.currentTarget.style.color = isDarkMode ? '#aaa' : '#666'
              }}
            >
              {isDarkMode ? <Sun size={14} /> : <Moon size={14} />}
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                e.preventDefault()
                setShowAnimations(!showAnimations)
              }}
              title={showAnimations ? "Выключить анимацию связей" : "Включить анимацию связей"}
              style={{
                width: '26px',
                height: '26px',
                backgroundColor: 'transparent',
                border: 'none',
                borderTop: '1px solid #444',
                color: isDarkMode ? '#aaa' : '#666',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '4px',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = isDarkMode ? '#3d3d3d' : '#eee'
                e.currentTarget.style.color = isDarkMode ? '#fff' : '#333'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent'
                e.currentTarget.style.color = isDarkMode ? '#aaa' : '#666'
              }}
            >
              <Activity size={14} style={{ opacity: showAnimations ? 1 : 0.4 }} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                e.preventDefault()
                setShowTrackingReport(true)
              }}
              title="Отчет по трекингу"
              style={{
                width: '26px',
                height: '26px',
                backgroundColor: 'transparent',
                border: 'none',
                borderTop: '1px solid #444',
                color: isDarkMode ? '#aaa' : '#666',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '4px',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = isDarkMode ? '#3d3d3d' : '#eee'
                e.currentTarget.style.color = isDarkMode ? '#fff' : '#333'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent'
                e.currentTarget.style.color = isDarkMode ? '#aaa' : '#666'
              }}
            >
              <Clock size={14} />
            </button>


          </Controls>
          <MiniMap
            style={{
              backgroundColor: '#2d2d2d',
              border: '1px solid #444'
            }}
            nodeColor={(node) => {
              const colors: Record<string, string> = {
                frontend: '#339af0',
                service: '#4dabf7',
                'auth-service': '#ff6b6b',
                database: '#51cf66',
                'data-warehouse': '#20c997',
                'message-broker': '#ffd43b',
                'api-gateway': '#ff6b6b',
                'esb': '#9c88ff',
                cache: '#845ef7',
                'object-storage': '#fd7e14',
                cdn: '#51cf66',
                lambda: '#ffd43b',
                'load-balancer': '#fd7e14',
                firewall: '#dc3545',
                server: '#339af0',
                orchestrator: '#20c997',
                'service-discovery': '#4dabf7',
                'web-server': '#51cf66',
                monitoring: '#ff6b6b',
                logging: '#ffa94d',
              }
              return colors[(node.data as ComponentData)?.type] || '#666'
            }}
          />
        </ReactFlow>

        {selectedEdge && (
          <ConnectionPanel
            edge={selectedEdge}
            nodes={nodes}
            onUpdate={updateConnectionType}
            onDelete={deleteSelected}
          />
        )}
        {pendingObjectStorageDirection && (
          <DataDirectionSelector
            sourceNode={pendingObjectStorageDirection.source}
            targetNode={pendingObjectStorageDirection.target}
            connectionType={pendingObjectStorageDirection.connectionType}
            onSelect={handleObjectStorageDirectionSelected}
            onCancel={() => setPendingObjectStorageDirection(null)}
          />
        )}
        {pendingConnection && (() => {
          const sourceData = pendingConnection.source.data as ComponentData
          const targetData = pendingConnection.target.data as ComponentData

          if (sourceData.type === 'database' && targetData.type === 'database') {
            return (
              <DatabaseReplicationPanel
                sourceNode={pendingConnection.source}
                targetNode={pendingConnection.target}
                onSelect={handleReplicationSelected}
                onCancel={handleConnectionCancel}
              />
            )
          }

          return (
            <ConnectionTypeSelector
              sourceNode={pendingConnection.source}
              targetNode={pendingConnection.target}
              onSelect={handleConnectionTypeSelected}
              onCancel={handleConnectionCancel}
            />
          )
        })()}
        {databaseConfigNode && (
          <DatabaseConfigPanel
            node={databaseConfigNode}
            onUpdate={handleDatabaseConfigUpdate}
            onClose={() => setDatabaseConfigNode(null)}
            onOpenSchemaEditor={(nodeId) => {
              const node = nodes.find(n => n.id === nodeId)
              if (node) {
                setDatabaseSchemaNode(node)
                setDatabaseConfigNode(null)
              }
            }}
          />
        )}
        {databaseSchemaNode && (
          <DatabaseSchemaEditor
            node={databaseSchemaNode}
            onUpdate={(nodeId, tables, collections, keyValueStore) => {
              setNodes((nds) =>
                nds.map((node) => {
                  if (node.id === nodeId) {
                    return {
                      ...node,
                      data: {
                        ...node.data,
                        databaseConfig: {
                          ...node.data.databaseConfig,
                          tables,
                          collections,
                          keyValueStore,
                        },
                      },
                    }
                  }
                  return node
                })
              )
            }}
            onClose={() => setDatabaseSchemaNode(null)}
          />
        )}
        {tableEditorNode && (
          <TableEditor
            node={tableEditorNode}
            allTables={nodes.filter(n => (n.data as ComponentData).type === 'table').map(n => ({ id: n.id, name: (n.data as ComponentData).tableConfig?.name || n.data.label }))}
            onUpdate={(nodeId, tableConfig) => {
              setNodes((nds) =>
                nds.map((node) => {
                  if (node.id === nodeId) {
                    return {
                      ...node,
                      data: {
                        ...node.data,
                        label: tableConfig.name,
                        tableConfig: tableConfig,
                      },
                    }
                  }
                  return node
                })
              )
              historyUpdateTypeRef.current = 'immediate'
            }}
            onClose={() => setTableEditorNode(null)}
          />
        )}

        {vectorDBNode && (
          <VectorDatabaseConfigPanel
            node={vectorDBNode}
            onUpdate={handleUpdateVectorDB}
            onClose={() => setVectorDBNode(null)}
          />
        )}

        {showStatistics && (
          <StatisticsPanel
            nodes={nodes}
            edges={edges}
            onClose={() => setShowStatistics(false)}
          />
        )}
        {cacheConfigNode && (
          <CacheConfigPanel
            node={cacheConfigNode}
            onUpdate={handleCacheConfigUpdate}
            onClose={() => setCacheConfigNode(null)}
          />
        )}
        {serviceConfigNode && (
          <ServiceConfigPanel
            node={serviceConfigNode}
            onUpdate={handleServiceConfigUpdate}
            onClose={() => setServiceConfigNode(null)}
          />
        )}
        {frontendConfigNode && (
          <FrontendConfigPanel
            node={frontendConfigNode}
            onUpdate={handleFrontendConfigUpdate}
            onClose={() => setFrontendConfigNode(null)}
          />
        )}
        {dataWarehouseConfigNode && (
          <DataWarehouseConfigPanel
            node={dataWarehouseConfigNode}
            onUpdate={handleDataWarehouseConfigUpdate}
            onClose={() => setDataWarehouseConfigNode(null)}
            onOpenDataPanel={(nodeId) => {
              const node = nodes.find(n => n.id === nodeId)
              if (node) {
                setDataWarehouseDataNode(node)
                setDataWarehouseConfigNode(null)
              }
            }}
          />
        )}
        {dataWarehouseDataNode && (
          <DataWarehouseDataPanel
            node={dataWarehouseDataNode}
            onUpdate={handleDataWarehouseDataUpdate}
            onClose={() => setDataWarehouseDataNode(null)}
          />
        )}
        {messageBrokerConfigNode && (
          <MessageBrokerConfigPanel
            node={messageBrokerConfigNode}
            onUpdate={handleMessageBrokerConfigUpdate}
            onClose={() => setMessageBrokerConfigNode(null)}
            onOpenMessagesPanel={(nodeId, addExample) => {
              const node = nodes.find(n => n.id === nodeId)
              if (node) {
                setAddExampleMessage(addExample || false)
                setMessageBrokerMessagesNode(node)
                setMessageBrokerConfigNode(null)
              }
            }}
          />
        )}
        {messageBrokerMessagesNode && (
          <MessageBrokerMessagesPanel
            node={messageBrokerMessagesNode}
            onUpdate={handleMessageBrokerMessagesUpdate}
            onClose={() => {
              setMessageBrokerMessagesNode(null)
              setAddExampleMessage(false)
            }}
            addExampleMessage={addExampleMessage}
          />
        )}
        {cdnConfigNode && (
          <CDNConfigPanel
            node={cdnConfigNode}
            onUpdate={handleCDNConfigUpdate}
            onClose={() => setCdnConfigNode(null)}
          />
        )}
        {lambdaConfigNode && (
          <LambdaConfigPanel
            node={lambdaConfigNode}
            onUpdate={handleLambdaConfigUpdate}
            onClose={() => setLambdaConfigNode(null)}
          />
        )}
        {objectStorageConfigNode && (
          <ObjectStorageConfigPanel
            node={objectStorageConfigNode}
            onUpdate={handleObjectStorageConfigUpdate}
            onClose={() => setObjectStorageConfigNode(null)}
          />
        )}
        {authServiceConfigNode && (
          <AuthServiceConfigPanel
            node={authServiceConfigNode}
            onUpdate={handleAuthServiceConfigUpdate}
            onClose={() => setAuthServiceConfigNode(null)}
          />
        )}
        {firewallConfigNode && (
          <FirewallConfigPanel
            node={firewallConfigNode}
            onUpdate={handleFirewallConfigUpdate}
            onClose={() => setFirewallConfigNode(null)}
          />
        )}
        {loadBalancerConfigNode && (
          <LoadBalancerConfigPanel
            node={loadBalancerConfigNode}
            onUpdate={handleLoadBalancerConfigUpdate}
            onClose={() => setLoadBalancerConfigNode(null)}
          />
        )}
        {apiGatewayConfigNode && (
          <ApiGatewayConfigPanel
            node={apiGatewayConfigNode}
            onUpdate={handleApiGatewayConfigUpdate}
            onClose={() => setApiGatewayConfigNode(null)}
          />
        )}
        {esbConfigNode && (
          <ESBConfigPanel
            node={esbConfigNode}
            onUpdate={handleESBConfigUpdate}
            onClose={() => setEsbConfigNode(null)}
          />
        )}
        {classConfigNode && (
          <ClassConfigPanel
            node={classConfigNode}
            onUpdate={handleClassConfigUpdate}
            onClose={() => setClassConfigNode(null)}
          />
        )}
        {controllerConfigNode && (
          <ControllerConfigPanel
            node={controllerConfigNode}
            onUpdate={handleControllerConfigUpdate}
            onClose={() => setControllerConfigNode(null)}
          />
        )}
        {repositoryConfigNode && (
          <RepositoryConfigPanel
            node={repositoryConfigNode}
            onUpdate={handleRepositoryConfigUpdate}
            onClose={() => setRepositoryConfigNode(null)}
          />
        )}
        {backupServiceConfigNode && (
          <BackupServiceConfigPanel
            node={backupServiceConfigNode}
            onUpdate={handleBackupServiceConfigUpdate}
            onClose={() => setBackupServiceConfigNode(null)}
          />
        )}
        {queueConfigNode && (
          <QueueConfigPanel
            node={queueConfigNode}
            onUpdate={handleQueueConfigUpdate}
            onClose={() => setQueueConfigNode(null)}
          />
        )}
        {proxyConfigNode && (
          <ProxyConfigPanel
            node={proxyConfigNode}
            onUpdate={handleProxyConfigUpdate}
            onClose={() => setProxyConfigNode(null)}
          />
        )}
        {vpnGatewayConfigNode && (
          <VPNGatewayConfigPanel
            node={vpnGatewayConfigNode}
            onUpdate={handleVPNGatewayConfigUpdate}
            onClose={() => setVpnGatewayConfigNode(null)}
          />
        )}
        {linkConfigNode && (
          <ComponentLinkPanel
            node={linkConfigNode}
            workspaces={workspaces}
            activeWorkspaceId={activeWorkspaceId}
            onUpdate={handleLinkConfigUpdate}
            onClose={() => setLinkConfigNode(null)}
          />
        )}
        {commentNode && (
          <CommentPanel
            node={commentNode}
            onUpdate={(nodeId, comment) => {
              setNodes((nds) =>
                nds.map((node) =>
                  node.id === nodeId
                    ? {
                      ...node,
                      data: {
                        ...node.data,
                        comment,
                      },
                    }
                    : node
                )
              )
            }}
            onClose={() => setCommentNode(null)}
          />
        )}
        {showLearningPanel && (
          <LearningPanel
            nodes={nodes}
            edges={edges}
            onClose={() => setShowLearningPanel(false)}
          />
        )}
        {showAIAssistant && (
          <AIAssistantPanel
            nodes={nodes}
            edges={edges}
            onClose={() => setShowAIAssistant(false)}
            onGenerateArchitecture={() => {
              // Улучшения не применяются автоматически, только выгружаются как JSON
            }}
          />
        )}
        {infoComponentType && (
          <ComponentInfoPanel
            componentType={infoComponentType}
            onClose={() => setInfoComponentType(null)}
            onCompare={handleComparisonOpen}
          />
        )}
        {comparisonType && (
          <ComparisonPanel
            type={comparisonType}
            onClose={() => setComparisonType(null)}
          />
        )}
        {businessIntelligenceConfigNode && (
          <BusinessIntelligenceConfigPanel
            node={businessIntelligenceConfigNode}
            onUpdate={handleBusinessIntelligenceConfigUpdate}
            onClose={() => setBusinessIntelligenceConfigNode(null)}
          />
        )}
        {searchEngineConfigNode && (
          <SearchEngineConfigPanel
            node={searchEngineConfigNode}
            onUpdate={handleSearchEngineConfigUpdate}
            onClose={() => setSearchEngineConfigNode(null)}
          />
        )}
        {configurationManagementConfigNode && (
          <ConfigurationManagementConfigPanel
            node={configurationManagementConfigNode}
            onUpdate={handleConfigurationManagementConfigUpdate}
            onClose={() => setConfigurationManagementConfigNode(null)}
          />
        )}
        {eventBusConfigNode && (
          <EventBusConfigPanel
            node={eventBusConfigNode}
            onUpdate={handleEventBusConfigUpdate}
            onClose={() => setEventBusConfigNode(null)}
          />
        )}
        {streamProcessorConfigNode && (
          <StreamProcessorConfigPanel
            node={streamProcessorConfigNode}
            onUpdate={handleStreamProcessorConfigUpdate}
            onClose={() => setStreamProcessorConfigNode(null)}
          />
        )}
        {graphDatabaseConfigNode && (
          <GraphDatabaseConfigPanel
            node={graphDatabaseConfigNode}
            onUpdate={handleGraphDatabaseConfigUpdate}
            onClose={() => setGraphDatabaseConfigNode(null)}
          />
        )}
        {
          timeSeriesDatabaseConfigNode && (
            <TimeSeriesDatabaseConfigPanel
              node={timeSeriesDatabaseConfigNode}
              onUpdate={handleTimeSeriesDatabaseConfigUpdate}
              onClose={() => setTimeSeriesDatabaseConfigNode(null)}
            />
          )
        }
        {
          serviceMeshConfigNode && (
            <ServiceMeshConfigPanel
              node={serviceMeshConfigNode}
              onUpdate={handleServiceMeshConfigUpdate}
              onClose={() => setServiceMeshConfigNode(null)}
            />
          )
        }
        {
          identityProviderConfigNode && (
            <IdentityProviderConfigPanel
              node={identityProviderConfigNode}
              onUpdate={handleIdentityProviderConfigUpdate}
              onClose={() => setIdentityProviderConfigNode(null)}
            />
          )
        }
        {
          secretManagementConfigNode && (
            <SecretManagementConfigPanel
              node={secretManagementConfigNode}
              onUpdate={handleSecretManagementConfigUpdate}
              onClose={() => setSecretManagementConfigNode(null)}
            />
          )
        }
        {
          monitoringConfigNode && (
            <MonitoringConfigPanel
              node={monitoringConfigNode}
              onUpdate={handleMonitoringConfigUpdate}
              onClose={() => setMonitoringConfigNode(null)}
            />
          )
        }
        {
          loggingConfigNode && (
            <LoggingConfigPanel
              node={loggingConfigNode}
              onUpdate={handleLoggingConfigUpdate}
              onClose={() => setLoggingConfigNode(null)}
            />
          )
        }
        {
          analyticsServiceConfigNode && (
            <AnalyticsServiceConfigPanel
              node={analyticsServiceConfigNode}
              onUpdate={handleAnalyticsServiceConfigUpdate}
              onClose={() => setAnalyticsServiceConfigNode(null)}
            />
          )
        }
        {
          vcsConfigNode && (
            <VCSConfigPanel
              node={vcsConfigNode}
              onUpdate={handleVcsConfigUpdate}
              onClose={() => setVcsConfigNode(null)}
            />
          )
        }
        {
          ciCdPipelineConfigNode && (
            <CICDPipelineConfigPanel
              node={ciCdPipelineConfigNode}
              onUpdate={handleCicdPipelineConfigUpdate}
              onClose={() => setCiCdPipelineConfigNode(null)}
            />
          )
        }
        {
          webServerConfigNode && (
            <WebServerConfigPanel
              node={webServerConfigNode}
              onUpdate={handleWebServerConfigUpdate}
              onClose={() => setWebServerConfigNode(null)}
            />
          )
        }
        {
          containerConfigNode && (
            <ContainerConfigPanel
              node={containerConfigNode}
              onUpdate={handleContainerConfigUpdate}
              onClose={() => setContainerConfigNode(null)}
            />
          )
        }
        {
          serverConfigNode && (
            <ServerConfigPanel
              node={serverConfigNode}
              onUpdate={handleServerConfigUpdate}
              onClose={() => setServerConfigNode(null)}
            />
          )
        }
        {
          batchProcessorConfigNode && (
            <BatchProcessorConfigPanel
              node={batchProcessorConfigNode}
              onUpdate={handleBatchProcessorConfigUpdate}
              onClose={() => setBatchProcessorConfigNode(null)}
            />
          )
        }
        {
          etlServiceConfigNode && (
            <ETLServiceConfigPanel
              node={etlServiceConfigNode}
              onUpdate={handleEtlServiceConfigUpdate}
              onClose={() => setEtlServiceConfigNode(null)}
            />
          )
        }
        {
          dataLakeConfigNode && (
            <DataLakeConfigPanel
              node={dataLakeConfigNode}
              onUpdate={handleDataLakeConfigUpdate}
              onClose={() => setDataLakeConfigNode(null)}
            />
          )
        }
        {
          integrationPlatformConfigNode && (
            <IntegrationPlatformConfigPanel
              node={integrationPlatformConfigNode}
              onUpdate={handleIntegrationPlatformConfigUpdate}
              onClose={() => setIntegrationPlatformConfigNode(null)}
            />
          )
        }
        {
          mlServiceConfigNode && (
            <MLServiceConfigPanel
              node={mlServiceConfigNode}
              onUpdate={handleMlServiceConfigUpdate}
              onClose={() => setMlServiceConfigNode(null)}
            />
          )
        }
        {
          notificationServiceConfigNode && (
            <NotificationServiceConfigPanel
              node={notificationServiceConfigNode}
              onUpdate={handleNotificationServiceConfigUpdate}
              onClose={() => setNotificationServiceConfigNode(null)}
            />
          )
        }
        {
          emailServiceConfigNode && (
            <EmailServiceConfigPanel
              node={emailServiceConfigNode}
              onUpdate={handleEmailServiceConfigUpdate}
              onClose={() => setEmailServiceConfigNode(null)}
            />
          )
        }
        {
          smsGatewayConfigNode && (
            <SMSGatewayConfigPanel
              node={smsGatewayConfigNode}
              onUpdate={handleSmsGatewayConfigUpdate}
              onClose={() => setSmsGatewayConfigNode(null)}
            />
          )
        }
        {
          dnsServiceConfigNode && (
            <DNSServiceConfigPanel
              node={dnsServiceConfigNode}
              onUpdate={handleDNSServiceConfigUpdate}
              onClose={() => setDnsServiceConfigNode(null)}
            />
          )
        }
        {
          orchestratorConfigNode && (
            <OrchestratorConfigPanel
              node={orchestratorConfigNode}
              onUpdate={handleOrchestratorConfigUpdate}
              onClose={() => setOrchestratorConfigNode(null)}
            />
          )
        }
        {
          serviceDiscoveryConfigNode && (
            <ServiceDiscoveryConfigPanel
              node={serviceDiscoveryConfigNode}
              onUpdate={handleServiceDiscoveryConfigUpdate}
              onClose={() => setServiceDiscoveryConfigNode(null)}
            />
          )
        }
        {
          llmModelConfigNode && (
            <LLMModelConfigPanel
              node={llmModelConfigNode}
              onUpdate={handleLlmModelConfigUpdate}
              onClose={() => setLlmModelConfigNode(null)}
            />
          )
        }
        {
          resourceEstimationNode && (
            <ResourceEstimationPanel
              node={resourceEstimationNode}
              onUpdate={handleResourceEstimationUpdate}
              onClose={() => setResourceEstimationNode(null)}
            />
          )
        }

        {showTrackingReport && (
          <TrackingReportPanel
            nodes={nodes}
            onClose={() => setShowTrackingReport(false)}
          />
        )}
      </div >

    </div >
  )
}

// Функция валидации соединений отключена - все соединения разрешены без ограничений
function validateConnectionType(
  _source: ComponentData,
  _target: ComponentData,
  _connectionType: ConnectionType
): boolean {
  // Все соединения разрешены без ограничений
  return true
}


function getComponentLabel(type: ComponentType): string {
  const labels: Record<ComponentType, string> = {
    frontend: 'Клиентское приложение',
    service: 'Сервис',
    'auth-service': 'Сервис аутентификации',
    database: 'База данных',
    queue: 'Очередь',
    'event-bus': 'Шина событий',
    'stream-processor': 'Потоковый обработчик',
    'search-engine': 'Поисковая система',
    table: 'Таблица БД',
    'analytics-service': 'Сервис аналитики',
    'business-intelligence': 'Business Intelligence',
    'graph-database': 'Графовая БД',
    'time-series-database': 'Временные ряды',
    'service-mesh': 'Сервисная сеть',
    'configuration-management': 'Управление конфигурацией',
    vcs: 'VCS (GitHub/GitLab)',
    'ci-cd-pipeline': 'CI/CD пайплайн',
    'backup-service': 'Резервное копирование',
    'identity-provider': 'Провайдер идентичности',
    'secret-management': 'Управление секретами',
    'api-client': 'API клиент',
    'api-documentation': 'Документация API',
    'integration-platform': 'Платформа интеграций',
    'batch-processor': 'Пакетный обработчик',
    'etl-service': 'ETL сервис',
    'data-lake': 'Data Lake',
    'edge-computing': 'Граничные вычисления',
    'iot-gateway': 'IoT шлюз',
    blockchain: 'Блокчейн',
    'ml-ai-service': 'ML/AI сервис',
    analyst: 'Системный аналитик',
    devops: 'DevOps инженер',
    developer: 'Разработчик',
    team: 'Команда',
    'notification-service': 'Сервис уведомлений',
    'email-service': 'Email сервис',
    'sms-gateway': 'SMS шлюз',
    proxy: 'Прокси',
    'vpn-gateway': 'VPN шлюз',
    'dns-service': 'DNS сервис',
    'data-warehouse': 'Хранилище данных',
    'message-broker': 'Брокер сообщений',
    'api-gateway': 'API Gateway',
    cache: 'Кэш',
    'object-storage': 'Объектное хранилище',
    cdn: 'CDN',
    lambda: 'Бессерверная функция',
    'load-balancer': 'Балансировщик',
    firewall: 'Межсетевой экран',
    system: 'Система',
    esb: 'ESB (Корпоративная сервисная шина)',
    client: 'Клиент',
    'external-system': 'Внешняя система',
    controller: 'Контроллер',
    repository: 'Репозиторий',
    class: 'Класс',
    server: 'Сервер',
    container: 'Контейнер',
    orchestrator: 'Оркестратор',
    'service-discovery': 'Обнаружение сервисов',
    'web-server': 'Веб-сервер',
    monitoring: 'Мониторинг',
    logging: 'Логирование',
    'business-domain': 'Бизнес-домен',
    group: 'Группа',
    'note': 'Заметка',
    'text': 'Текст',
    'system-component': 'Компонент системы',
    'llm-model': 'LLM Модель',
    'vector-database': 'Векторная БД',
    'ml-training': 'Обучение моделей',
    'ml-inference': 'Инференс',
    'ai-agent': 'AI Агент',
    'ml-data-pipeline': 'ML Пайплайн',
    'gpu-cluster': 'GPU Кластер',
    'rate-limiter': 'Rate Limiter',
    'circuit-breaker': 'Circuit Breaker',
    'scheduler': 'Scheduler / Cron',
    'feature-flag': 'Feature Flag Service',
    'secrets-vault': 'Secrets Vault',
    'config-service': 'Configuration Service',
    'gateway-cache': 'Gateway Cache',
    'waf': 'WAF',
    'zero-trust': 'Zero Trust Gateway',
    'edge-cache': 'Edge Cache',
    'data-replication': 'Data Replication',
    'data-migration': 'Data Migration',
    'schema-registry': 'Schema Registry',
    'cdc': 'CDC',
    'data-governance': 'Data Governance',
    'data-quality': 'Data Quality Service',
    'feature-store': 'Feature Store',
    'iam': 'IAM',
    'policy-engine': 'Policy Engine',
    'token-service': 'Token Service',
    'kms': 'KMS',
    'audit-log': 'Audit Log',
    'fraud-detection': 'Fraud Detection',
    'dlp': 'DLP',
    'bff': 'BFF',
    'facade': 'Facade Service',
    'saga': 'Saga Orchestrator',
    'workflow-engine': 'Workflow Engine',
    'rules-engine': 'Rules Engine',
    'service-template': 'Service Template',
    'sdk': 'SDK / Library',
    'alert-manager': 'Alert Manager',
    'tracing': 'Tracing',
    'slo-manager': 'SLO / SLA Manager',
    'chaos-testing': 'Chaos Testing',
    'cost-monitoring': 'Cost Monitoring',
    'webhook': 'Webhook Service',
    'contract-testing': 'Contract Testing',
    'partner-gateway': 'Partner Gateway',
    'etl-orchestrator': 'ETL Orchestrator',
    'ipaas': 'iPaaS',
    'prompt-store': 'Prompt Store',
    'prompt-router': 'Prompt Router',
    'model-registry': 'Model Registry',
    'explainability': 'Explainability Service',
    'feedback-loop': 'Feedback Loop',
    'ab-testing': 'A/B Testing for AI',
    'adr': 'ADR',
    'capability-map': 'Capability Map',
    'risk-register': 'Risk Register',
    'compliance': 'Compliance Service',
    'tracking': 'Планирование работ'
  }
  return labels[type] || type
}

function getDefaultConnectionMode(type: ComponentType): 'sync' | 'async' {
  // Только брокер сообщений работает асинхронно
  if (type === 'message-broker') {
    return 'async'
  }
  // Система, бизнес-домен и контейнер не имеют типа соединения
  if (type === 'system' || type === 'business-domain' || type === 'container') {
    return 'sync'
  }
  // Остальные компоненты синхронные
  return 'sync'
}

export default App

