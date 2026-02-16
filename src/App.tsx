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
  PanOnScrollMode, // Import PanOnScrollMode
  SelectionMode,
  applyNodeChanges,
  NodeChange,
} from 'reactflow'
import 'reactflow/dist/style.css'
import ComponentPalette from './components/ComponentPalette'
import CustomNode, { componentColors } from './components/CustomNode'
import SystemNode from './components/SystemNode'
import BusinessDomainNode from './components/BusinessDomainNode'
import ContainerNode from './components/ContainerNode'
import GroupNode from './components/GroupNode'
import NoteNode from './components/NoteNode'
import TextNode from './components/TextNode'
import GhostNode from './components/GhostNode'
import AnimatedEdge from './components/AnimatedEdge'
import SearchPanel from './components/SearchPanel'
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
import NodeControlPanel from './components/NodeControlPanel'
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
import { Lock, Unlock, Sun, Moon, Activity, Clock, Menu, X } from 'lucide-react'
import ConnectionMarkers from './components/ConnectionMarkers'

import { AIGeneratedArchitecture } from './utils/geminiService'
import {
  ComponentType, ConnectionType, ComponentData, DatabaseType, NoSQLType,
  ReplicationApproach, ReplicationTool, CacheType, ServiceLanguage, ServiceConfig,
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
  ResourceEstimate, DatabaseConfig
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
        if (data && (data.type === 'system' || data.type === 'external-system' || data.type === 'business-domain' || data.type === 'external-component' || data.type === 'cluster')) {
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
        return data?.type === 'system' || data?.type === 'external-system' || data?.type === 'business-domain' || data?.type === 'external-component' || data?.type === 'cluster'
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

    // CLEANUP: Remove default generated labels (Sync: ..., Async: ...)
    // ONLY if there is no manual data description.
    let finalLabel = edge.label;
    let finalLabelStyle = edge.labelStyle;

    const dataDescription = edgeData.dataDescription as string;
    const isManualDescription = dataDescription && dataDescription.trim().length > 0;

    if (!isManualDescription && typeof finalLabel === 'string' && (finalLabel.startsWith('Sync: ') || finalLabel.startsWith('Async: '))) {
      finalLabel = undefined; // Remove the label
      finalLabelStyle = undefined; // Remove the style
    }

    const updatedEdge = {
      ...edge,
      label: finalLabel,
      labelStyle: finalLabelStyle,
      data: edgeData, // Сохраняем все данные edge, включая waypointX и waypointY
    }

    return {
      ...updatedEdge,
      deletable: true,
      // @ts-ignore - эти свойства не в типах, но поддерживаются ReactFlow
      deleteOnSourceNodeDelete: false,
      deleteOnTargetNodeDelete: false,
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
    localStorage.setItem(getWorkspaceKey(workspace.id), JSON.stringify(data))
  } catch (error) {
    console.error('Ошибка при сохранении данных вкладки:', error)
  }
}

const removeWorkspaceData = (id: string) => {
  try {
    localStorage.removeItem(getWorkspaceKey(id))
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
    localStorage.setItem(STORAGE_KEY_META, JSON.stringify(meta))
  } catch (error) {
    console.error('Ошибка при сохранении метаданных вкладок:', error)
  }
}

const loadWorkspacesFromStorage = (): Workspace[] => {
  // Возвращаем чистое состояние по умолчанию, как запросил пользователь.
  // Автоматическое восстановление отключено.
  return [{ id: '1', name: 'Рабочее пространство 1', nodes: [], edges: [] }]
}

const saveWorkspacesToStorage = (workspaces: Workspace[]) => {
  saveWorkspacesMeta(workspaces)
  workspaces.forEach(w => saveWorkspaceData(w))
}

function App() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>(loadWorkspacesFromStorage())
  const [activeWorkspaceId, setActiveWorkspaceId] = useState<string>(() => {
    const savedActiveId = localStorage.getItem('architecture-designer-active-tab') || sessionStorage.getItem('architecture-designer-active-tab')
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

  // Сохраняем активную вкладку в localStorage
  useEffect(() => {
    localStorage.setItem('architecture-designer-active-tab', activeWorkspaceId)
  }, [activeWorkspaceId])

  // Автоматическое сохранение изменений (Auto-save)
  useEffect(() => {
    if (!activeWorkspaceId) return

    const saveTimeout = setTimeout(() => {
      setWorkspaces(prevWorkspaces => {
        const currentWs = prevWorkspaces.find(w => w.id === activeWorkspaceId)

        // Если ничего не изменилось, не обновляем (избегаем лишних ререндеров и записи в диск)
        if (currentWs && currentWs.nodes === nodes && currentWs.edges === edges) {
          return prevWorkspaces
        }

        const updatedWorkspaces = prevWorkspaces.map(w =>
          w.id === activeWorkspaceId
            ? { ...w, nodes, edges } // Обновляем nodes и edges в текущем workspace
            : w
        )

        // Сохраняем в localStorage
        saveWorkspacesToStorage(updatedWorkspaces)
        return updatedWorkspaces
      })
    }, 500) // Debounce 500ms

    return () => clearTimeout(saveTimeout)
  }, [nodes, edges, activeWorkspaceId])
  // Тип обновления истории
  type HistoryUpdateType = 'standard' | 'immediate' | 'skip' | 'reset'
  const historyUpdateTypeRef = useRef<HistoryUpdateType>('standard')

  const historyManagerRef = useRef(new HistoryManager())
  const isHistoryActionRef = useRef(false)
  const edgesToPreserveRef = useRef<Edge[]>([]) // Ref для хранения edges, которые нужно сохранить при удалении узлов
  const [canUndo, setCanUndo] = useState(false)
  const [canRedo, setCanRedo] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const [showPalette, setShowPalette] = useState(false)
  const [controlsExpanded, setControlsExpanded] = useState(false)
  const draggingChildrenRef = useRef<Map<string, string[]>>(new Map())
  const dragStartPositionsRef = useRef<Map<string, { x: number; y: number }>>(new Map())
  const dragStartEdgeWaypointsRef = useRef<Map<string, any>>(new Map())

  // Вспомогательная функция для обновления стрелок при перемещении узлов
  const updateEdgesOnMovement = useCallback((nodeMovements: Array<{ nodeId: string; deltaX: number; deltaY: number }>, movingNodeIdsSet: Set<string>) => {
    const groupIds = new Set<string>()
    nodeMovements.forEach(m => {
      const node = nodesRef.current.find(n => n.id === m.nodeId)
      const nodeData = node?.data as ComponentData
      if (nodeData?.groupId) groupIds.add(nodeData.groupId)
    })

    setEdges((eds) =>
      eds.map((edge) => {
        const edgeData = edge.data as any
        const edgeGroupId = edgeData?.groupId
        const sourceMovement = nodeMovements.find(m => m.nodeId === edge.source)
        const targetMovement = nodeMovements.find(m => m.nodeId === edge.target)
        const sourceIsMoving = movingNodeIdsSet.has(edge.source)
        const targetIsMoving = movingNodeIdsSet.has(edge.target)

        const shouldUpdateEdge = sourceMovement || targetMovement || (edgeGroupId && groupIds.has(edgeGroupId))

        if (shouldUpdateEdge) {
          if (edgeData?.waypointX !== undefined && edgeData?.waypointY !== undefined) {
            const startState = dragStartEdgeWaypointsRef.current.get(edge.id)
            let baseX = edgeData.waypointX
            let baseY = edgeData.waypointY

            // Если есть сохраненное начальное состояние, используем его как базу
            if (startState && !Array.isArray(startState) && (startState as any).x !== undefined) {
              baseX = (startState as any).x
              baseY = (startState as any).y
            } else {
              // Fallback: если нет начального состояния (например, перемещение программное, а не драг),
              // то мы не можем использовать дельту, так как она может быть накопленной.
              // Но updateEdgesOnMovement вызывается при драге.
              // Если нет стейта - лучше не трогать или использовать текущее (но будет баг аккумуляции).
              // Попытаемся использовать текущее, но это риск.
              // Однако, onNodeDragStart должен был заполнить map.
            }

            let deltaX = 0
            let deltaY = 0

            if (sourceMovement && targetMovement) {
              deltaX = (sourceMovement.deltaX + targetMovement.deltaX) / 2
              deltaY = (sourceMovement.deltaY + targetMovement.deltaY) / 2
            } else if (sourceMovement) {
              deltaX = sourceMovement.deltaX
              deltaY = sourceMovement.deltaY
            } else if (targetMovement) {
              deltaX = targetMovement.deltaX
              deltaY = targetMovement.deltaY
            }

            // Новая позиция = База + Дельта
            return { ...edge, data: { ...edgeData, waypointX: baseX + deltaX, waypointY: baseY + deltaY } }
          }

          if (edgeData?.waypoints && Array.isArray(edgeData.waypoints) && edgeData.waypoints.length > 0) {
            const startState = dragStartEdgeWaypointsRef.current.get(edge.id)
            const waypointsBase = (startState && Array.isArray(startState)) ? startState : edgeData.waypoints

            let deltaX = 0, deltaY = 0
            if (sourceMovement && targetMovement) {
              deltaX = (sourceMovement.deltaX + targetMovement.deltaX) / 2
              deltaY = (sourceMovement.deltaY + targetMovement.deltaY) / 2
            } else if (sourceMovement) {
              deltaX = sourceMovement.deltaX; deltaY = sourceMovement.deltaY
            } else if (targetMovement) {
              deltaX = targetMovement.deltaX; deltaY = targetMovement.deltaY
            }

            return {
              ...edge,
              data: {
                ...edgeData,
                waypoints: waypointsBase.map((wp: any) => ({
                  ...wp,
                  x: wp.x + deltaX,
                  y: wp.y + deltaY,
                }))
              }
            }
          }
        }
        return edge
      })
    )
  }, [setEdges])

  // Обертка для onNodesChange, чтобы отправлять события об изменениях и сохранять историю
  const onNodesChangeWithEvents = useCallback(
    (changes: NodeChange[]) => {
      // 1. Предварительная фильтрация для логики ghost-узлов
      const nodesToGhost: Node[] = []
      const filteredChanges = changes.filter((change: any) => {
        if (change.type === 'remove') {
          const node = nodesRef.current.find(n => n.id === change.id)
          if (node) {
            const hasEdges = edgesRef.current.some(edge => edge.source === node.id || edge.target === node.id)
            if (hasEdges && !node.data.isGhost && node.type !== 'note' && node.type !== 'text') {
              nodesToGhost.push(node)
              return false
            }
          }
        }
        return true
      })

      // 2. Применяем основные изменения через основной обработчик ReactFlow
      onNodesChange(filteredChanges)

      // 3. Синхронизируем перемещение дочерних элементов (Absolute Offset Strategy)
      const positionChanges = changes.filter((c: any) => c.type === 'position' && c.dragging) as any[]

      if (positionChanges.length > 0) {
        const movements: Array<{ nodeId: string; deltaX: number; deltaY: number }> = []
        const movingIdsSet = new Set<string>(positionChanges.map(c => c.id))

        setNodes((nds) => {
          let nextNodes = [...nds]

          positionChanges.forEach((change) => {
            const newNode = nextNodes.find(n => n.id === change.id)
            const parentStartPos = dragStartPositionsRef.current.get(change.id)

            if (newNode && parentStartPos) {
              // Суммарный сдвиг родителя от точки начала перетаскивания
              const totalDX = newNode.position.x - parentStartPos.x
              const totalDY = newNode.position.y - parentStartPos.y

              movements.push({ nodeId: newNode.id, deltaX: totalDX, deltaY: totalDY })

              const childIds = draggingChildrenRef.current.get(newNode.id) || []
              if (childIds.length > 0) {
                nextNodes = nextNodes.map(n => {
                  // Если этот узел и так перемещается самой ReactFlow, пропускаем
                  if (movingIdsSet.has(n.id)) return n

                  if (childIds.includes(n.id)) {
                    const childStartPos = dragStartPositionsRef.current.get(n.id)
                    if (childStartPos) {
                      return {
                        ...n,
                        position: {
                          x: childStartPos.x + totalDX,
                          y: childStartPos.y + totalDY
                        }
                      }
                    }
                  }
                  return n
                })
              }
            }
          })
          return nextNodes
        })

        // Обновляем связи для всех затронутых узлов
        updateEdgesOnMovement(movements, movingIdsSet)
      }

      // 4. Пост-обработка: превращение удаленных узлов в ghost
      if (nodesToGhost.length > 0) {
        setNodes((nds) =>
          nds.map((n) => {
            const ghostRef = nodesToGhost.find((gn) => gn.id === n.id)
            if (ghostRef) {
              return {
                ...n,
                type: 'ghost',
                width: 40,
                height: 40,
                data: {
                  ...n.data,
                  isGhost: true,
                  originalData: { ...n.data, type: n.type, width: n.width, height: n.height },
                  label: n.data.label
                }
              }
            }
            return n
          })
        )
      }

      // 6. Управление историей и событиями
      const isRemove = filteredChanges.some((c: any) => c.type === 'remove')
      const isAdd = filteredChanges.some((c: any) => c.type === 'add')
      const isDragStop = filteredChanges.some((c: any) => c.type === 'position' && c.dragging === false)

      if (isRemove || isAdd || isDragStop) {
        historyUpdateTypeRef.current = 'immediate'
      }

      const hasRemovedNodes = filteredChanges.some((change: any) => change.type === 'remove')
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('nodeschange'))
        if (hasRemovedNodes) window.dispatchEvent(new CustomEvent('nodesremove'))
      }, 50)
    },
    [setNodes, updateEdgesOnMovement]
  )

  const onEdgesChangeWithHistory = useCallback(
    (changes: any) => {
      onEdgesChange(changes)
    },
    [onEdgesChange]
  )
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
    onEdgesChangeWithHistory(changes)
  }, [onEdgesChangeWithHistory, activeWorkspace?.isLocked])

  const handleNodesChange = useCallback((changes: any) => {
    if (activeWorkspace?.isLocked) return
    onNodesChangeWithEvents(changes)
  }, [onNodesChangeWithEvents, activeWorkspace?.isLocked])

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

  const onNodeDragStart = useCallback((_event: React.MouseEvent, node: Node) => {
    if (activeWorkspace?.isLocked) return

    const allNodes = nodesRef.current
    const selectedNodes = allNodes.filter(n => n.selected)
    const nodesToHandle = selectedNodes.length > 0 ? selectedNodes : [node]

    nodesToHandle.forEach(parentNode => {
      const parentData = parentNode.data as ComponentData

      // 1. Запоминаем стартовую позицию родителя
      dragStartPositionsRef.current.set(parentNode.id, { ...parentNode.position })

      // 1.1 Snapshot edge waypoints state
      // Очищаем map только при начале нового драг-сессии (если это первый узел)
      // Но так как onNodeDragStart вызывается для каждого узла или один раз?
      // ReactFlow: onNodeDragStart called once per selection drag start? 
      // Actually usually called for the node clicked. But we need to ensure we capture relevant edges.
      // Simply iterate all edges and capture their current state.
      // Optimization: do this only once per drag session start.
      // But clearing inside foreach loop is wrong.
      // We'll rely on the map being idempotent if we just set. 
      // Ideally we clear before setting, but where?
      // Let's just set. The map might grow but it's small.
      // We can clear it if the node being dragged is the *first* one?
      // Easier: iterate all edges and set them.
      if (edgesRef.current) {
        edgesRef.current.forEach(edge => {
          const d = edge.data
          if (d?.waypoints && Array.isArray(d.waypoints)) {
            dragStartEdgeWaypointsRef.current.set(edge.id, d.waypoints.map((wp: any) => ({ ...wp })))
          } else if (d?.waypointX !== undefined && d?.waypointY !== undefined) {
            dragStartEdgeWaypointsRef.current.set(edge.id, { x: d.waypointX, y: d.waypointY })
          }
        })
      }

      const isSystem = parentNode.type === 'system' ||
        parentNode.type === 'business-domain' ||
        parentData.type === 'system' ||
        parentData.type === 'external-system' ||
        parentData.type === 'external-component' ||
        parentData.type === 'cluster'

      const isContainer = parentNode.type === 'container' ||
        parentNode.type === 'group' ||
        parentData.type === 'container' ||
        parentData.type === 'vpc' ||
        parentData.type === 'subnet' ||
        parentData.type === 'server' ||
        parentData.type === 'web-server' ||
        parentData.type === 'orchestrator'

      const getSafeDim = (n: Node, defaultW: number, defaultH: number) => {
        const w = n.width || (n.style?.width ? parseFloat(String(n.style.width)) : 0) || defaultW
        const h = n.height || (n.style?.height ? parseFloat(String(n.style.height)) : 0) || defaultH
        return { w, h }
      }

      const { w: pW, h: pH } = getSafeDim(parentNode, isSystem ? 600 : isContainer ? 300 : 200, isSystem ? 400 : isContainer ? 200 : 110)

      // Критическое изменение: ограничиваем "способность" быть родителем.
      // Компонент может двигать детей ТОЛЬКО если он большой (Система/Контейнер)
      // или если он был вручную расширен до больших размеров.
      // Обычные маленькие компоненты, стоящие рядом, больше не будут захватывать друг друга.
      const isLargeEnoughToBeParent = pW >= 250 || pH >= 150

      if ((isSystem || isContainer || parentData.isExpanded) && isLargeEnoughToBeParent) {
        const parentPos = parentNode.position

        const children = allNodes.filter(child => {
          if (child.id === parentNode.id || child.selected) return false

          // Получаем размеры ребенка для проверки вхождения центра
          const { w: cW, h: cH } = getSafeDim(child, 10, 10)

          // Проверяем, что ребенок СУЩЕСТВЕННО меньше родителя (чтобы избежать захвата равных по размеру соседей)
          if (cW >= pW * 0.9 && cH >= pH * 0.9) return false

          const cCenterX = child.position.x + cW / 2
          const cCenterY = child.position.y + cH / 2

          const isInside = cCenterX >= parentPos.x &&
            cCenterY >= parentPos.y &&
            cCenterX <= parentPos.x + pW &&
            cCenterY <= parentPos.y + pH

          if (isInside) {
            // 2. Запоминаем стартовую позицию каждого найденного ребенка
            dragStartPositionsRef.current.set(child.id, { ...child.position })
            return true
          }
          return false
        }).map(c => c.id)

        if (children.length > 0) {
          draggingChildrenRef.current.set(parentNode.id, children)
        }
      }
    })
  }, [activeWorkspace?.isLocked])

  const onSelectionDragStart = useCallback((_event: React.MouseEvent, nodes: Node[]) => {
    if (activeWorkspace?.isLocked) return
    nodes.forEach(node => {
      onNodeDragStart(_event, node)
    })
  }, [onNodeDragStart, activeWorkspace?.isLocked])

  const onNodeDragStop = useCallback(() => {
    draggingChildrenRef.current.clear()
    dragStartPositionsRef.current.clear()
  }, [])

  const onSelectionDragStop = useCallback(() => {
    draggingChildrenRef.current.clear()
  }, [])

  const handleSelectNodeForSearch = useCallback((nodeId: string) => {
    const node = nodes.find(n => n.id === nodeId);
    if (node && reactFlowInstanceRef.current) {
      const currentZoom = reactFlowInstanceRef.current.getZoom();

      // Вычисляем центр узла (с учетом того, что узел может иметь разные размеры)
      const centerX = node.position.x + (node.width || 200) / 2;
      const centerY = node.position.y + (node.height || 120) / 2;

      reactFlowInstanceRef.current.setCenter(
        centerX,
        centerY,
        { zoom: Math.max(currentZoom, 1.0), duration: 1000 }
      );

      // Выделяем узел и сбрасываем выделение с остальных
      setNodes(nds => nds.map(n => ({
        ...n,
        selected: n.id === nodeId
      })));
    }
  }, [nodes, setNodes]);

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
              ? { ...w, nodes, edges, viewport }
              : w
          )

          const params = updated.find(w => w.id === activeWorkspaceId)
          if (params) {
            saveWorkspaceData(params)
          }

          return updated
        })
      }, 200) // Уменьшили время до 200мс для более быстрого сохранения

      return () => clearTimeout(timeoutId)
    }
  }, [nodes, edges, activeWorkspaceId])

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
  const [infoComponentLabel, setInfoComponentLabel] = useState<string | null>(null)
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

  const handleComparisonOpen = useCallback((type: ComponentType, label?: string) => {
    let targetType: string = type

    // Mapping logic for cloud services and other components
    if (label) {
      const lowerLabel = label.toLowerCase()
      if (lowerLabel.includes('s3') || lowerLabel.includes('blob storage') || lowerLabel.includes('object storage')) {
        targetType = 'object-storage'
      } else if (lowerLabel.includes('ec2') || lowerLabel.includes('compute') || lowerLabel.includes('virtual machine') || lowerLabel.includes('vm')) {
        targetType = 'server'
      } else if (lowerLabel.includes('lambda') || lowerLabel.includes('functions')) {
        targetType = 'lambda'
      } else if (lowerLabel.includes('rds') || lowerLabel.includes('sql database') || lowerLabel.includes('autonomous db')) {
        targetType = 'database'
      } else if (lowerLabel.includes('dynamodb') || lowerLabel.includes('cosmos db') || lowerLabel.includes('nosql')) {
        targetType = 'database'
      } else if (lowerLabel.includes('vpc') || lowerLabel.includes('vnet') || lowerLabel.includes('vcn') || lowerLabel.includes('virtual network')) {
        targetType = 'vpc'
      } else if (lowerLabel.includes('subnet')) {
        targetType = 'subnet'
      } else if (lowerLabel.includes('cloudfront') || lowerLabel.includes('cdn')) {
        targetType = 'cdn'
      } else if (lowerLabel.includes('iam') || lowerLabel.includes('identity') || lowerLabel.includes('entra id') || lowerLabel.includes('cognito')) {
        targetType = 'identity-provider'
      } else if (lowerLabel.includes('eks') || lowerLabel.includes('aks') || lowerLabel.includes('oke') || lowerLabel.includes('ecs') || lowerLabel.includes('fargate')) {
        targetType = 'orchestrator'
      } else if (lowerLabel.includes('api gateway')) {
        targetType = 'api-gateway'
      } else if (lowerLabel.includes('sqs') || lowerLabel.includes('service bus') || lowerLabel.includes('queue') || lowerLabel.includes('pub/sub')) {
        targetType = 'queue'
      } else if (lowerLabel.includes('sns') || lowerLabel.includes('notification')) {
        targetType = 'notification-service'
      } else if (lowerLabel.includes('kms') || lowerLabel.includes('key vault') || lowerLabel.includes('vault') || lowerLabel.includes('secret')) {
        targetType = 'secret-management'
      } else if (lowerLabel.includes('waf') || lowerLabel.includes('firewall') || lowerLabel.includes('shield')) {
        targetType = 'firewall'
      } else if (lowerLabel.includes('redshift') || lowerLabel.includes('bigquery') || lowerLabel.includes('data warehouse') || lowerLabel.includes('synapse')) {
        targetType = 'data-warehouse'
      } else if (lowerLabel.includes('step functions') || lowerLabel.includes('logic apps') || lowerLabel.includes('workflow') || lowerLabel.includes('airflow') || lowerLabel.includes('data factory')) {
        targetType = 'batch-processor'
      } else if (lowerLabel.includes('route 53') || lowerLabel.includes('dns')) {
        targetType = 'dns-service'
      } else if (lowerLabel.includes('athena') || lowerLabel.includes('lake formation') || lowerLabel.includes('data lake')) {
        targetType = 'data-lake'
      } else if (lowerLabel.includes('kinesis') || lowerLabel.includes('event hub') || lowerLabel.includes('streaming')) {
        targetType = 'stream-processor'
      } else if (lowerLabel.includes('elasticache') || lowerLabel.includes('redis') || lowerLabel.includes('memcached')) {
        targetType = 'cache'
      } else if (lowerLabel.includes('monorepo') || lowerLabel.includes('turborepo') || lowerLabel.includes('nx')) {
        targetType = 'monorepo'
      } else if (lowerLabel.includes('micro-frontend') || lowerLabel.includes('module federation')) {
        targetType = 'micro-frontend'
      } else if (lowerLabel.includes('dashboard') || lowerLabel.includes('grafana') || lowerLabel.includes('kibana')) {
        targetType = 'dashboard'
      } else if (lowerLabel.includes('github') || lowerLabel.includes('gitlab') || lowerLabel.includes('bitbucket') || lowerLabel.includes('vcs')) {
        targetType = 'vcs'
      }
    }

    // Default fallbacks if the mapped type doesn't exist in comparisonData
    // We already have comparisonData imported or we can check Object.keys if we had it but it's in data/comparisonData

    setComparisonType(targetType)
    setInfoComponentType(null)
    setInfoComponentLabel(null)
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
      const isSystemType = data?.type === 'system' || data?.type === 'external-system' || data?.type === 'business-domain' || data?.type === 'external-component' || data?.type === 'cluster'
      return isSystemType && (!node.width || !node.height || !node.style || (node.type !== 'system' && node.type !== 'business-domain'))
    })

    if (systemNodesToRestore.length > 0) {
      console.log('Восстанавливаем узлы типа system:', systemNodesToRestore.length)
      systemNodesRestoredRef.current = true
      setNodes((nds) =>
        nds.map((node) => {
          const data = node.data as ComponentData
          const isSystemType = data?.type === 'system' || data?.type === 'external-system' || data?.type === 'business-domain' || data?.type === 'external-component' || data?.type === 'cluster'
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

      // Ctrl + F = Search
      if (isCtrl && (key === 'f' || key === 'а' || code === 'KeyF')) {
        event.preventDefault()
        setShowSearch(true)
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

  // Автоматическая коррекция z-index для больших узлов (контейнеров)
  // Унифицированное управление z-index для обеспечения интерактивности вложенных элементов
  useEffect(() => {
    const getNodeZIndex = (node: Node, allNodes: Node[]): number => {
      const data = node.data as ComponentData;
      if (data?.isGhost) return -100;

      const nodeType = node.type;
      const dataType = data?.type;
      const isExpanded = data?.isExpanded;

      const getW = (n: Node) => n.width || (n.style?.width ? parseFloat(String(n.style.width)) : 0) || 0;
      const getH = (n: Node) => n.height || (n.style?.height ? parseFloat(String(n.style.height)) : 0) || 0;

      const w = getW(node);
      const h = getH(node);

      // Порог для автоматического определения контейнера (соотносится с onNodeDragStart)
      const isLarge = w >= 250 || h >= 150;

      // Проверка: содержит ли этот узел другие узлы визуально?
      // Если да, он должен быть ниже них (zIndex меньше)
      const containsOthers = allNodes.some(other => {
        if (other.id === node.id || other.data?.isGhost) return false;

        const ow = getW(other) || 10;
        const oh = getH(other) || 10;
        const ocx = other.position.x + ow / 2;
        const ocy = other.position.y + oh / 2;

        return ocx >= node.position.x && ocx <= node.position.x + w &&
          ocy >= node.position.y && ocy <= node.position.y + h &&
          (w > ow || h > oh); // Только если родитель больше ребенка
      });

      // Системы и домены на самом заднем плане
      if (nodeType === 'system' || nodeType === 'business-domain' || dataType === 'system') return -10;

      // Контейнеры и развернутые компоненты чуть выше систем, но ниже обычных узлов
      if (nodeType === 'group' || nodeType === 'container' || dataType === 'container' || dataType === 'cluster' || dataType === 'vpc' || isExpanded || isLarge || containsOthers) return -5;

      // Заметки и текст выше всех
      if (nodeType === 'note' || nodeType === 'text') return 50;

      // Обычные компоненты на стандартном уровне (0)
      return 0;
    };

    const needsUpdate = nodes.some(node => node.style?.zIndex !== getNodeZIndex(node, nodes));

    if (needsUpdate) {
      setNodes(nds => nds.map(node => {
        const targetZIndex = getNodeZIndex(node, nds);
        if (node.style?.zIndex !== targetZIndex) {
          return {
            ...node,
            style: { ...node.style, zIndex: targetZIndex }
          };
        }
        return node;
      }));
    }
  }, [nodes, setNodes]);

  // Слушаем запросы на удаление и обновление данных узлов
  useEffect(() => {
    const handleDeleteRequest = (event: CustomEvent) => {
      const { nodeId } = event.detail
      setNodes((nds) => nds.filter((n) => n.id !== nodeId))
      setEdges((eds) => eds.filter((e) => e.source !== nodeId && e.target !== nodeId))
      historyUpdateTypeRef.current = 'immediate'
    }

    const handleStatusChange = (event: CustomEvent) => {
      const { nodeId, status, color } = event.detail
      setNodes((nds) =>
        nds.map((n) => {
          if (n.id === nodeId) {
            return {
              ...n,
              data: { ...n.data, status }
            }
          }
          return n
        })
      )

      // Если статус 'highlighted', подсвечиваем все связанные ребра
      // Если статус изменился с 'highlighted', убираем принудительную подсветку (если они не выбраны иным способом)
      setEdges((eds) =>
        eds.map((edge) => {
          const isSourceHighlighted = status === 'highlighted' && edge.source === nodeId
          const isTargetHighlighted = status === 'highlighted' && edge.target === nodeId

          // Проверяем, есть ли другие причины для подсветки (другие узлы подсвечены)
          let shouldBeHighlighted = isSourceHighlighted || isTargetHighlighted

          if (!shouldBeHighlighted) {
            // Проверяем второй узел ребра - вдруг он тоже подсвечен
            const otherNodeId = edge.source === nodeId ? edge.target : edge.source
            const otherNode = nodes.find(n => n.id === otherNodeId)
            if (otherNode && (otherNode.data as ComponentData).status === 'highlighted') {
              shouldBeHighlighted = true
            }
          }

          if (shouldBeHighlighted !== edge.data?.highlighted || edge.data?.highlightColor !== color) {
            return {
              ...edge,
              data: {
                ...edge.data,
                highlighted: shouldBeHighlighted,
                highlightColor: shouldBeHighlighted ? color : undefined
              }
            }
          }
          return edge
        })
      )

      historyUpdateTypeRef.current = 'immediate'
    }

    const handleDataUpdate = (event: CustomEvent) => {
      const { nodeId, data: newData } = event.detail
      setNodes((nds) =>
        nds.map((n) => {
          if (n.id === nodeId) {
            // Если мы восстанавливаем из ghost, возвращаем оригинальный тип
            let type = n.type
            if (newData.isGhost === false && newData.originalData?.type) {
              type = newData.originalData.type
            }
            return {
              ...n,
              type,
              width: newData.originalData?.width || 200, // Упрощенный возврат размеров
              height: newData.originalData?.height || 120,
              data: { ...newData }
            }
          }
          return n
        })
      )
      historyUpdateTypeRef.current = 'immediate'
    }

    window.addEventListener('nodeDeleteRequest', handleDeleteRequest as unknown as EventListener)
    window.addEventListener('nodeDataUpdate', handleDataUpdate as unknown as EventListener)
    window.addEventListener('componentStatusChange', handleStatusChange as unknown as EventListener)

    return () => {
      window.removeEventListener('nodeDeleteRequest', handleDeleteRequest as unknown as EventListener)
      window.removeEventListener('nodeDataUpdate', handleDataUpdate as unknown as EventListener)
      window.removeEventListener('componentStatusChange', handleStatusChange as unknown as EventListener)
    }
  }, [setNodes, setEdges, nodes])

  const addComponent = useCallback(
    (type: ComponentType, position?: { x: number; y: number }, label?: string) => {
      let finalPosition = position

      // Если позиция не указана, добавляем в центр видимой области
      if (!finalPosition && reactFlowInstance) {
        const centerX = window.innerWidth / 2 - 250 // Учитываем ширину палитры
        const centerY = window.innerHeight / 2

        // Добавляем небольшой случайный сдвиг, чтобы компоненты не накладывались друг на друга при повторном добавлении
        const jitterX = (Math.random() - 0.5) * 40
        const jitterY = (Math.random() - 0.5) * 40

        finalPosition = reactFlowInstance.screenToFlowPosition({
          x: centerX + jitterX,
          y: centerY + jitterY,
        })
      } else if (!finalPosition) {
        // Если ReactFlow еще не инициализирован, используем дефолтные координаты
        finalPosition = { x: 400 + Math.random() * 20, y: 300 + Math.random() * 20 }
      }

      const isSystemType = type === 'system' || type === 'external-system' || type === 'business-domain' || type === 'vpc' || type === 'subnet' || type === 'external-component' || type === 'cluster'
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
        id: `${type}-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
        type: isSystemType ? (type === 'business-domain' ? 'business-domain' : 'system')
          : isContainerType ? 'container'
            : isGroupType ? 'group'
              : isTextType ? 'text'
                : isNoteType ? 'note'
                  : 'custom',
        position: finalPosition,
        data: {
          type,
          label: label || getComponentLabel(type),
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
    (type: ComponentType, label?: string) => {
      addComponent(type, undefined, label)
    },
    [addComponent]
  )

  // Храним handle файла, чтобы не спрашивать каждый раз
  const fileHandleRef = useRef<any>(null)

  const handleSave = useCallback(async (selectedWorkspaceIds?: string[]) => {
    try {
      let dataToSave;

      // Если не выбраны конкретные вкладки, сохраняем ВСЕ вкладки (по запросу пользователя)
      if (!selectedWorkspaceIds || selectedWorkspaceIds.length === 0) {
        // Сохраняем пакет всех вкладок
        const workspacesToSave = workspaces.map(w => {
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
        // Сохраняем пакет выбранных вкладок
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
                color: getColor(connectionType || 'rest'),
                fill: getColor(connectionType || 'rest'),
                fontWeight: 700,
                fontSize: '17px',
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
        deleteOnSourceNodeDelete: false,
        // @ts-ignore
        deleteOnTargetNodeDelete: false,
        style: {
          stroke: getColor(connectionType),
          strokeWidth: connectionType === 'inheritance' ? 3 : 5,
          strokeDasharray:
            connectionType === 'async' || connectionType === 'async-bidirectional' || connectionType === 'database-replication'
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
          isBackground: false,
        },
        zIndex: 10,
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
        deleteOnSourceNodeDelete: false,
        deleteOnTargetNodeDelete: false,
        // Label не устанавливается при создании - будет добавлен только если указано описание данных
        style: {
          stroke: getColor(connectionType),
          strokeWidth: connectionType === 'inheritance' ? 3 : 5,
          strokeDasharray:
            connectionType === 'async' || connectionType === 'async-bidirectional' || connectionType === 'database-replication'
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
        deleteOnSourceNodeDelete: false,
        deleteOnTargetNodeDelete: false,
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
        zIndex: 20, // Репликация по умолчанию акцентирована
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
              deleteOnSourceNodeDelete: false,
              deleteOnTargetNodeDelete: false,
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
    (nodeId: string, config: DatabaseConfig) => {
      handleComponentConfigUpdate(nodeId, 'databaseConfig', config)
    },
    [handleComponentConfigUpdate]
  )

  const handleServiceConfigUpdate = useCallback(
    (nodeId: string, config: ServiceConfig) => {
      updateNodesWithHistory((nds) =>
        nds.map((node) => {
          if (node.id === nodeId) {
            return {
              ...node,
              data: {
                ...node.data,
                serviceConfig: {
                  ...node.data.serviceConfig,
                  ...config,
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

  const handleOpenSettings = useCallback((nodeId: string) => {
    const node = nodes.find(n => n.id === nodeId)
    if (!node) return
    const nodeData = node.data as ComponentData

    // Закрываем все панели перед открытием новой
    setDatabaseConfigNode(null)
    setDatabaseSchemaNode(null)
    setTableEditorNode(null)
    setVectorDBNode(null)
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
    setCommentNode(null)

    // Открываем соответствующую панель настройки
    if (nodeData.type === 'database') {
      const dbConfig = nodeData.databaseConfig
      if (dbConfig?.dbType) {
        const hasData =
          (dbConfig.tables && dbConfig.tables.length > 0) ||
          ((dbConfig as any)?.collections && (dbConfig as any).collections.length > 0) ||
          ((dbConfig as any)?.keyValueStore && (dbConfig as any).keyValueStore.pairs && (dbConfig as any).keyValueStore.pairs.length > 0)

        if (hasData) {
          setDatabaseSchemaNode(node)
        } else if (dbConfig.vendor) {
          setDatabaseSchemaNode(node)
        } else {
          setDatabaseConfigNode(node)
        }
      } else {
        setDatabaseConfigNode(node)
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
      if (nodeData.dataWarehouseConfig?.vendor) {
        setDataWarehouseDataNode(node)
      } else {
        setDataWarehouseConfigNode(node)
      }
    } else if (nodeData.type === 'message-broker') {
      if (nodeData.messageBrokerConfig?.vendor) {
        setMessageBrokerMessagesNode(node)
      } else {
        setMessageBrokerConfigNode(node)
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
    } else if (nodeData.type === 'micro-frontend') {
      setFrontendConfigNode(node)
    } else if (nodeData.type === 'library') {
      setServiceConfigNode(node)
    } else if (nodeData.type === 'dashboard') {
      setMonitoringConfigNode(node)
    } else if (nodeData.type === 'log-aggregator') {
      setLoggingConfigNode(node)
    } else if (nodeData.type === 'metrics-collector') {
      setMonitoringConfigNode(node)
    } else if (nodeData.type === 'synthetic-monitoring') {
      setMonitoringConfigNode(node)
    } else if (nodeData.type === 'server' || nodeData.type === 'bare-metal' || nodeData.type === 'virtual-machine') {
      setServerConfigNode(node)
    }
  }, [nodes])

  const onNodeClick = useCallback((_event: React.MouseEvent, node: Node) => {
    handleOpenSettings(node.id)
    setSelectedNodes([node])
  }, [handleOpenSettings, setSelectedNodes])

  const handleLinkConfigUpdate = useCallback(
    (nodeId: string, newLink: ComponentLink | null) => {
      // Find source node and its old link to handle cleanup
      const sourceNode = nodes.find((n) => n.id === nodeId)
      if (!sourceNode) return
      const oldLink = (sourceNode.data as ComponentData).link

      // 1. Update other workspaces if external links are involved
      setWorkspaces((prevWorkspaces) => {
        return prevWorkspaces.map((ws) => {
          // Skip active workspace as it's handled by setNodes/updateNodesWithHistory
          if (ws.id === activeWorkspaceId) return ws

          let updatedNodes = ws.nodes

          // Handle Old Link Removal (External target)
          if (oldLink && oldLink.targetWorkspaceId === ws.id) {
            updatedNodes = updatedNodes.map((n) => {
              if (n.id === oldLink.targetNodeId) {
                // Check if it links back to us before removing? 
                // We enforce synchronization, so we remove the link.
                return { ...n, data: { ...n.data, link: undefined } }
              }
              return n
            })
          }

          // Handle New Link Creation (External target)
          if (newLink && newLink.targetWorkspaceId === ws.id) {
            updatedNodes = updatedNodes.map((n) => {
              if (n.id === newLink.targetNodeId) {
                // Create back-link
                return {
                  ...n,
                  data: {
                    ...n.data,
                    link: {
                      targetWorkspaceId: activeWorkspaceId,
                      targetNodeId: nodeId,
                      label: newLink.label
                    }
                  }
                }
              }
              return n
            })
          }

          if (updatedNodes !== ws.nodes) {
            return { ...ws, nodes: updatedNodes }
          }
          return ws
        })
      })

      // 2. Update nodes in current workspace
      updateNodesWithHistory((currentNodes) => {
        let nextNodes = [...currentNodes]

        // Handle Old Link Removal (Local target)
        if (oldLink && oldLink.targetWorkspaceId === activeWorkspaceId) {
          nextNodes = nextNodes.map((n) => {
            if (n.id === oldLink.targetNodeId) {
              return { ...n, data: { ...n.data, link: undefined } }
            }
            return n
          })
        }

        // Handle New Link Creation (Local target)
        if (newLink && newLink.targetWorkspaceId === activeWorkspaceId) {
          nextNodes = nextNodes.map((n) => {
            if (n.id === newLink.targetNodeId) {
              return {
                ...n,
                data: {
                  ...n.data,
                  link: {
                    targetWorkspaceId: activeWorkspaceId,
                    targetNodeId: nodeId,
                    label: newLink.label
                  }
                }
              }
            }
            return n
          })
        }

        // Update Source Node
        nextNodes = nextNodes.map((node) => {
          if (node.id === nodeId) {
            return {
              ...node,
              data: {
                ...node.data,
                link: newLink || undefined,
              },
            }
          }
          return node
        })

        return nextNodes
      })
    },
    [nodes, activeWorkspaceId, updateNodesWithHistory]
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
    _event.stopPropagation()
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
    setResourceEstimationNode(null)
    setCommentNode(null)
    setInfoComponentType(null)
    setInfoComponentLabel(null)
    setComparisonType(null)
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
      const componentLabel = event.dataTransfer.getData('application/reactflow-label')
      if (!componentType) {
        componentType = event.dataTransfer.getData('text/plain') as ComponentType
      }

      if (!componentType) return

      // Если ReactFlow еще не инициализирован, добавляем в центр
      if (!reactFlowInstance) {
        addComponent(componentType, undefined, componentLabel)
        return
      }

      const reactFlowBounds = reactFlowWrapper.current?.getBoundingClientRect()
      if (!reactFlowBounds) {
        addComponent(componentType, undefined, componentLabel)
        return
      }

      // Получаем координаты относительно ReactFlow
      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      })

      addComponent(componentType, position, componentLabel)
    },
    [reactFlowInstance, addComponent]
  )

  const updateConnectionType = useCallback(
    (edgeId: string, connectionType: ConnectionType, dataDescription?: string, pathType?: EdgePathType, customColor?: string, accented?: boolean, isBackground?: boolean, toBeDeleted?: boolean, increasedLoad?: boolean, hasIncorrectData?: boolean, incorrectDataComment?: string, toBeDeletedComment?: string, increasedLoadComment?: string, showProtocolBadge?: boolean, isTruthSource?: boolean) => {
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
          case 'oidc':
            return 'OpenID Connect'
          case 'oauth2':
            return 'OAuth 2.0'
          case 'saml':
            return 'SAML'
          case 'ws':
            return 'WebSocket'
          case 'wss':
            return 'WSS'
          case 'graphql':
            return 'GraphQL'
          case 'etl':
            return 'ETL Flow'
          case 'jdbc':
            return 'JDBC'
          case 'kafka':
            return 'Kafka'
          case 'rest':
            return 'REST'
          case 'grpc':
            return 'gRPC'
          case 'related':
            return '' // Don't show label for simple related links by default
          default:
            return type.toUpperCase()
        }
      }

      const getColor = (type: ConnectionType): string => {
        if (customColor) return customColor
        if (toBeDeleted) return '#dc3545'

        switch (type) {
          case 'async':
            return '#ffd43b'
          case 'database-connection':
            return '#51cf66'
          case 'database-replication':
            return '#20c997'
          case 'cache-connection':
            return '#845ef7' // Фиолетовый цвет как у кеша
          case 'ws':
          case 'wss':
            return '#339af0' // Голубой для вебсокетов
          case 'graphql':
            return '#e64980' // Розовый для GraphQL
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
            const edgeColor = getColor(connectionType)
            const labelText = getLabelText(connectionType)
            const label = dataDescription || labelText

            if (label) {
              return {
                ...edge,
                label,
                labelStyle: {
                  color: edgeColor,
                  fill: edgeColor,
                  fontWeight: 700,
                  fontSize: '20px',
                  backgroundColor: '#1e1e1e',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  border: `1px solid ${edgeColor}40`,
                  whiteSpace: 'pre-line',
                  textAlign: 'left',
                },
                style: {
                  stroke: edgeColor,
                  strokeWidth: accented ? 5 : (connectionType === 'inheritance' ? 2 : 3),
                  strokeDasharray:
                    connectionType === 'async' || connectionType === 'database-replication' || connectionType === 'ws' || connectionType === 'wss'
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
                  ...(accented !== undefined && { accented }),
                  ...(isBackground !== undefined && { isBackground }),
                  ...(toBeDeleted !== undefined && { toBeDeleted }),
                  ...(increasedLoad !== undefined && { increasedLoad }),
                  ...(hasIncorrectData !== undefined && { hasIncorrectData }),
                  ...(incorrectDataComment !== undefined && { incorrectDataComment }),
                  ...(toBeDeletedComment !== undefined && { toBeDeletedComment }),
                  ...(increasedLoadComment !== undefined && { increasedLoadComment }),
                  ...(showProtocolBadge !== undefined && { showProtocolBadge }),
                  ...(isTruthSource !== undefined && { isTruthSource }),
                },
                zIndex: isBackground ? 1 : (accented ? 20 : 10),
              }
            } else {
              // Если нет описания, убираем label и labelStyle
              const { label: _, labelStyle: __, ...edgeWithoutLabel } = edge
              return {
                ...edgeWithoutLabel,
                style: {
                  stroke: edgeColor,
                  strokeWidth: isBackground ? 1.5 : (accented ? 5 : 3),
                  strokeDasharray: connectionType === 'async' || connectionType === 'database-replication' || connectionType === 'ws' || connectionType === 'wss' ? '8,4' : undefined,
                },
                data: {
                  ...edge.data,
                  connectionType,
                  ...(dataDescription !== undefined && { dataDescription }),
                  ...(pathType !== undefined && { pathType }),
                  ...(customColor !== undefined && { customColor }),
                  ...(accented !== undefined && { accented }),
                  ...(isBackground !== undefined && { isBackground }),
                  ...(toBeDeleted !== undefined && { toBeDeleted }),
                  ...(increasedLoad !== undefined && { increasedLoad }),
                  ...(hasIncorrectData !== undefined && { hasIncorrectData }),
                  ...(incorrectDataComment !== undefined && { incorrectDataComment }),
                  ...(toBeDeletedComment !== undefined && { toBeDeletedComment }),
                  ...(increasedLoadComment !== undefined && { increasedLoadComment }),
                  ...(showProtocolBadge !== undefined && { showProtocolBadge }),
                  ...(isTruthSource !== undefined && { isTruthSource }),
                },
                zIndex: isBackground ? 1 : (accented ? 20 : 10),
              }
            }
          }
          return edge
        })
      )
    },
    [setEdges]
  )

  const reverseEdgeDirection = useCallback(
    (edgeId: string) => {
      setEdges((eds) =>
        eds.map((edge) => {
          if (edge.id === edgeId) {
            // Function to correctly swap handle type in ID to match React Flow component types
            const swapHandleId = (id: string | null | undefined, toType: 'source' | 'target') => {
              if (!id) return id
              if (toType === 'source') return id.replace('-target', '-source')
              return id.replace('-source', '-target')
            }

            return {
              ...edge,
              source: edge.target,
              target: edge.source,
              sourceHandle: swapHandleId(edge.targetHandle, 'source'),
              targetHandle: swapHandleId(edge.sourceHandle, 'target'),
              // If there are waypoints, we should reverse them to keep the path similar but inverted
              data: {
                ...edge.data,
                waypoints: edge.data?.waypoints ? [...edge.data.waypoints].reverse() : undefined,
                // These are for simple waypoints, we should probably reverse them too if we swap source/target
                waypointX: edge.data?.waypointX,
                waypointY: edge.data?.waypointY,
              },
            }
          }
          return edge
        })
      )
      historyUpdateTypeRef.current = 'immediate'
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
    }

    // Удаление выбранных узлов
    if (selectedNodes.length > 0) {
      const nodeIds = selectedNodes.map((n) => n.id)

      // Если у узла есть связи, превращаем его в "ghost", иначе удаляем
      const nodesToGhostIds = new Set<string>()
      const nodesToRemoveIds = new Set<string>()

      selectedNodes.forEach(node => {
        const hasEdges = edges.some(edge => edge.source === node.id || edge.target === node.id)
        if (hasEdges && !node.data.isGhost && node.type !== 'note' && node.type !== 'text') {
          nodesToGhostIds.add(node.id)
        } else {
          nodesToRemoveIds.add(node.id)
        }
      })

      if (nodesToGhostIds.size > 0 || nodesToRemoveIds.size > 0) {
        setNodes((nds) => {
          const updatedNodes = nds
            .filter((n) => !nodesToRemoveIds.has(n.id))
            .map((n) => {
              if (nodesToGhostIds.has(n.id)) {
                const nodeWidth = n.width || 200
                const nodeHeight = n.height || 120
                return {
                  ...n,
                  type: 'ghost',
                  width: 40,
                  height: 40,
                  position: {
                    x: n.position.x + nodeWidth / 2 - 20,
                    y: n.position.y + nodeHeight / 2 - 20,
                  },
                  selected: false,
                  selectable: true,
                  data: {
                    ...n.data,
                    isGhost: true,
                    originalData: { ...n.data, type: n.type, width: nodeWidth, height: nodeHeight },
                    label: n.data.label,
                  },
                }
              }
              return n
            })

          // Сохраняем в историю
          setTimeout(() => {
            if (!isHistoryActionRef.current) {
              historyManagerRef.current.pushState(updatedNodes, edgesRef.current)
              setCanUndo(historyManagerRef.current.canUndo())
              setCanRedo(historyManagerRef.current.canRedo())
            }
          }, 100)

          return updatedNodes
        })

        setSelectedNodes([])
      }
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

    // Обновляем selected и highlighted в связях для ReactFlow
    // Это позволяет визуализировать связи выбранных компонентов
    const selectedNodeIdsSet = new Set(selectedIds)
    setEdges((eds) =>
      eds.map((edge) => {
        // Линия выбрана явно (рамкой или кликом)
        const isExplicitlySelected = params.edges.some(selectedEdge => selectedEdge.id === edge.id)
        // Линия соединяет два выбранных компонента -> выделяем её (Relationship)
        const isRelationship = selectedNodeIdsSet.has(edge.source) && selectedNodeIdsSet.has(edge.target)
        // Линия соединена хотя бы с одним выбранным компонентом -> подсвечиваем её (Associated)
        const isAssociated = selectedNodeIdsSet.has(edge.source) || selectedNodeIdsSet.has(edge.target)

        return {
          ...edge,
          selected: isExplicitlySelected || isRelationship,
          data: {
            ...edge.data,
            highlighted: isAssociated || !!edge.data?.accented
          }
        }
      })
    )

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

    // Меню линий (ConnectionPanel) должно открываться, когда выбрана одна линия.
    // Это делает поведение более надежным (работает и при клике, и при выделении рамкой одной линии).
    if (params.edges.length === 1) {
      // Важно: проверяем, изменился ли выбранный edge, чтобы избежать лишних ререндеров
      setSelectedEdge(prev => prev?.id === params.edges[0].id ? prev : params.edges[0])
    } else if (params.edges.length === 0) {
      setSelectedEdge(null)
    }
    // Если выбрано > 1 линии, меню не показываем (или оставляем старое, но лучше скрыть, чтобы не путать)
    else {
      // Optional: setSelectedEdge(null) if we don't want menu for multi-selection
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
          // Update indicator positions
          protocolBadgePosition: edge.data?.protocolBadgePosition && isNewSource && isNewTarget ? {
            x: edge.data.protocolBadgePosition.x - minX + pasteOffsetX,
            y: edge.data.protocolBadgePosition.y - minY + pasteOffsetY,
          } : edge.data?.protocolBadgePosition,
          toBeDeletedPosition: edge.data?.toBeDeletedPosition && isNewSource && isNewTarget ? {
            x: edge.data.toBeDeletedPosition.x - minX + pasteOffsetX,
            y: edge.data.toBeDeletedPosition.y - minY + pasteOffsetY,
          } : edge.data?.toBeDeletedPosition,
          increasedLoadPosition: edge.data?.increasedLoadPosition && isNewSource && isNewTarget ? {
            x: edge.data.increasedLoadPosition.x - minX + pasteOffsetX,
            y: edge.data.increasedLoadPosition.y - minY + pasteOffsetY,
          } : edge.data?.increasedLoadPosition,
          incorrectDataPosition: edge.data?.incorrectDataPosition && isNewSource && isNewTarget ? {
            x: edge.data.incorrectDataPosition.x - minX + pasteOffsetX,
            y: edge.data.incorrectDataPosition.y - minY + pasteOffsetY,
          } : edge.data?.incorrectDataPosition,
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
        // Update indicator positions
        protocolBadgePosition: edge.data?.protocolBadgePosition ? {
          x: edge.data.protocolBadgePosition.x + offset,
          y: edge.data.protocolBadgePosition.y + offset,
        } : undefined,
        toBeDeletedPosition: edge.data?.toBeDeletedPosition ? {
          x: edge.data.toBeDeletedPosition.x + offset,
          y: edge.data.toBeDeletedPosition.y + offset,
        } : undefined,
        increasedLoadPosition: edge.data?.increasedLoadPosition ? {
          x: edge.data.increasedLoadPosition.x + offset,
          y: edge.data.increasedLoadPosition.y + offset,
        } : undefined,
        incorrectDataPosition: edge.data?.incorrectDataPosition ? {
          x: edge.data.incorrectDataPosition.x + offset,
          y: edge.data.incorrectDataPosition.y + offset,
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
        event.preventDefault()
        event.stopPropagation()
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
      setNodes((nds) => {
        const validChildNodes = childNodes.filter(id => id !== groupId);

        return nds.map((node) => {
          if (node.id === groupId) {
            return {
              ...node,
              width,
              height,
              data: {
                ...node.data,
                groupConfig: {
                  ...(node.data as ComponentData).groupConfig,
                  childNodes: validChildNodes,
                  isGrouped: true,
                },
              },
            }
          }

          if (validChildNodes.includes(node.id)) {
            if ((node.data as ComponentData).groupId !== groupId) {
              return {
                ...node,
                data: {
                  ...node.data,
                  groupId
                }
              }
            }
          }

          if ((node.data as ComponentData).groupId === groupId && !validChildNodes.includes(node.id)) {
            return {
              ...node,
              data: {
                ...node.data,
                groupId: undefined
              }
            }
          }

          return node
        })
      })
    }

    const handleNodeDataUpdate = (event: Event) => {
      const customEvent = event as CustomEvent<{ nodeId: string; data: any }>
      const { nodeId, data } = customEvent.detail
      updateNodesWithHistory((nds) =>
        nds.map((node) => {
          if (node.id === nodeId) {
            // Manage zIndex for expanded nodes to ensure proper layering
            let newStyle = { ...node.style }
            if ('isExpanded' in data) {
              newStyle.zIndex = data.isExpanded ? -1 : undefined
            }
            return {
              ...node,
              style: newStyle,
              data: { ...node.data, ...data }
            }
          }
          return node
        })
      )
    }

    const handleNodeSizeUpdate = (event: Event) => {
      const customEvent = event as CustomEvent<{ nodeId: string; width: number | null; height: number | null }>
      const { nodeId, width, height } = customEvent.detail
      updateNodesWithHistory((nds) =>
        nds.map((node) => {
          if (node.id === nodeId) {
            // Check if the node is large enough to be considered a container
            // If so, push it to the background (zIndex: -1) to allow child interactions
            const isExpanded = (node.data as ComponentData).isExpanded
            const isLarge = (width && width > 250) || (height && height > 150)
            const type = node.type || (node.data as ComponentData).type

            let newZIndex = 0
            if (type === 'system' || type === 'business-domain') newZIndex = -10
            else if (type === 'container' || type === 'cluster' || isExpanded || isLarge) newZIndex = -5

            return {
              ...node,
              width: width === null ? undefined : width,
              height: height === null ? undefined : height,
              style: {
                ...node.style,
                width: width === null ? undefined : width,
                height: height === null ? undefined : height,
                zIndex: newZIndex
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
      const customEvent = event as CustomEvent<{ componentType: ComponentType, label?: string }>
      setInfoComponentType(customEvent.detail.componentType)
      setInfoComponentLabel(customEvent.detail.label || null)
    }

    const handleComponentLinkClick = (event: Event) => {
      const customEvent = event as CustomEvent<{ link: ComponentLink }>
      handleLinkClick(customEvent.detail.link)
    }

    const handleComponentLinkConfigClick = (event: Event) => {
      const customEvent = event as CustomEvent<{ nodeId: string }>
      // Use nodesRef to avoid stale closure
      const node = nodesRef.current.find(n => n.id === customEvent.detail.nodeId)
      if (node) {
        // Close all other panels
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
        setCommentNode(null)

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
        // Close all other panels
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
        setSelectedEdge(null)

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
    window.addEventListener('nodeColorUpdate', handleComponentColorChange as EventListener)

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
      window.removeEventListener('nodeColorUpdate', handleComponentColorChange as EventListener)
      window.removeEventListener('showAIAssistant', handleShowAIAssistant as EventListener)
    }
  }, [setNodes, handleLinkClick, setShowAIAssistant, activeWorkspaceId, setWorkspaces, setEdges])

  // Создаем nodeTypes БЕЗ зависимостей - используем события для обработчиков
  // Это предотвращает пересоздание nodeTypes при каждом рендере
  const nodeTypes: NodeTypes = useMemo(() => ({
    custom: (props: NodeProps) => (
      <CustomNode
        {...props}
        onInfoClick={(type: ComponentType, label?: string) => {
          const event = new CustomEvent('componentInfoClick', { detail: { componentType: type, label } })
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
        onStatusChange={(nodeId: string, status: 'new' | 'existing' | 'refinement' | 'highlighted' | 'background' | undefined, color?: string) => {
          const event = new CustomEvent('componentStatusChange', { detail: { nodeId, status, color } })
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
        onInfoClick={(type: ComponentType, label?: string) => {
          const event = new CustomEvent('componentInfoClick', { detail: { componentType: type, label } })
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
    ghost: GhostNode,
  }), []) // Пустой массив зависимостей - nodeTypes создаются один раз

  // Фильтруем узлы: скрываем дочерние узлы свернутых систем
  const visibleNodes = useMemo(() => {
    // Создаем Set с ID всех дочерних узлов свернутых систем
    const hiddenNodeIds = new Set<string>()

    for (const node of nodes) {
      const nodeData = node.data as ComponentData
      if (nodeData.type === 'system' || nodeData.type === 'external-system' || nodeData.type === 'business-domain' || nodeData.type === 'external-component' || nodeData.type === 'cluster') {
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
      if (nodeData.type === 'system' || nodeData.type === 'external-system' || nodeData.type === 'business-domain' || nodeData.type === 'external-component' || nodeData.type === 'cluster') {
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

  const isAnyConfigPanelOpen = !!(
    databaseConfigNode ||
    databaseSchemaNode ||
    tableEditorNode ||
    vectorDBNode ||
    cacheConfigNode ||
    serviceConfigNode ||
    frontendConfigNode ||
    dataWarehouseConfigNode ||
    messageBrokerConfigNode ||
    messageBrokerMessagesNode ||
    cdnConfigNode ||
    lambdaConfigNode ||
    objectStorageConfigNode ||
    authServiceConfigNode ||
    firewallConfigNode ||
    loadBalancerConfigNode ||
    apiGatewayConfigNode ||
    esbConfigNode ||
    classConfigNode ||
    controllerConfigNode ||
    repositoryConfigNode ||
    linkConfigNode ||
    backupServiceConfigNode ||
    queueConfigNode ||
    proxyConfigNode ||
    vpnGatewayConfigNode ||
    dnsServiceConfigNode ||
    eventBusConfigNode ||
    streamProcessorConfigNode ||
    searchEngineConfigNode ||
    graphDatabaseConfigNode ||
    timeSeriesDatabaseConfigNode ||
    serviceMeshConfigNode ||
    configurationManagementConfigNode ||
    ciCdPipelineConfigNode ||
    identityProviderConfigNode ||
    secretManagementConfigNode ||
    integrationPlatformConfigNode ||
    batchProcessorConfigNode ||
    etlServiceConfigNode ||
    dataLakeConfigNode ||
    mlServiceConfigNode ||
    notificationServiceConfigNode ||
    emailServiceConfigNode ||
    smsGatewayConfigNode ||
    analyticsServiceConfigNode ||
    businessIntelligenceConfigNode ||
    monitoringConfigNode ||
    loggingConfigNode ||
    vcsConfigNode ||
    webServerConfigNode ||
    containerConfigNode ||
    serverConfigNode ||
    orchestratorConfigNode ||
    serviceDiscoveryConfigNode ||
    llmModelConfigNode ||
    commentNode
  )

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
      {showPalette && (
        <ComponentPalette
          onComponentClick={handleAddComponentClick}
          onRecommendationClick={() => setShowRecommendationPanel(true)}
          onClose={() => setShowPalette(false)}
        />
      )}
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
        onExportDrawIO={() => {
          const currentWorkspaces = workspaces.map(w =>
            w.id === activeWorkspaceId
              ? { ...w, nodes, edges }
              : w
          )
          saveToDrawIOFile(nodes, edges, currentWorkspaces)
        }}
        onExportPNG={handleExportPNG}

        onSaveLayout={handleSaveLayout}
        onTogglePalette={() => setShowPalette(!showPalette)}
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
          onNodeDragStart={onNodeDragStart}
          onNodeDragStop={onNodeDragStop}
          onSelectionDragStart={onSelectionDragStart}
          onSelectionDragStop={onSelectionDragStop}
          onNodeClick={onNodeClick}
          onEdgeClick={onEdgeClick}
          onPaneClick={onPaneClick}
          onConnectStart={onPaneClick}
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
          panOnScrollMode={PanOnScrollMode.Free} // Свободное панорамирование при скролле
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
          deleteKeyCode={null}
          multiSelectionKeyCode={activeWorkspace?.isLocked ? null : "Control"}
          selectionKeyCode={activeWorkspace?.isLocked ? null : "Shift"}
          // edgesConnectable={true} // removed as it might not be supported
          minZoom={0.1}
          maxZoom={2}
          style={{ background: isDarkMode ? '#1a1a1a' : '#ffffff' }}
          // Оптимизации производительности
          edgeUpdaterRadius={20}
          onlyRenderVisibleElements={true} // Рендерим только видимые элементы
          elevateNodesOnSelect={false} // Отключаем поднятие узлов при выделении для лучшей производительности
          elevateEdgesOnSelect={true} // ВКЛЮЧАЕМ поднятие связей при выделении для удобства клика
        >
          <ConnectionMarkers />
          <Background
            color={isDarkMode ? "#333" : "#e0e0e0"}
            gap={20}
            size={1}
          />
          <Controls
            showZoom={controlsExpanded}
            showFitView={controlsExpanded}
            showInteractive={false}
            position="bottom-left"
            style={{
              backgroundColor: '#2d2d2d',
              border: '1px solid #444',
              display: 'flex',
              flexDirection: 'column',
              borderRadius: '6px',
              overflow: 'hidden',
              boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
              width: '24px',
              padding: 0,
              margin: '0 0 15px 15px'
            }}
          >
            <button
              onClick={(e) => {
                e.stopPropagation()
                e.preventDefault()
                setControlsExpanded(!controlsExpanded)
              }}
              title={controlsExpanded ? "Свернуть панель управления" : "Развернуть панель управления"}
              style={{
                width: '24px',
                height: '24px',
                backgroundColor: controlsExpanded ? '#3d3d3d' : 'transparent',
                border: 'none',
                color: '#fff',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s',
              }}
            >
              {controlsExpanded ? <X size={14} /> : <Menu size={14} />}
            </button>

            {controlsExpanded && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    e.preventDefault()
                    handleToggleLock()
                  }}
                  title={activeWorkspace?.isLocked ? "Разблокировать вкладку" : "Заблокировать вкладку"}
                  style={{
                    width: '24px',
                    height: '24px',
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
                  {activeWorkspace?.isLocked ? <Lock size={12} /> : <Unlock size={12} />}
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    e.preventDefault()
                    setIsDarkMode(!isDarkMode)
                  }}
                  title={isDarkMode ? "Переключить на светлую тему" : "Переключить на темную тему"}
                  style={{
                    width: '24px',
                    height: '24px',
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
                  {isDarkMode ? <Sun size={12} /> : <Moon size={12} />}
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    e.preventDefault()
                    setShowAnimations(!showAnimations)
                  }}
                  title={showAnimations ? "Выключить анимацию связей" : "Включить анимацию связей"}
                  style={{
                    width: '24px',
                    height: '24px',
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
                  <Activity size={12} style={{ opacity: showAnimations ? 1 : 0.4 }} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    e.preventDefault()
                    setShowTrackingReport(true)
                  }}
                  title="Отчет по трекингу"
                  style={{
                    width: '24px',
                    height: '24px',
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
                  <Clock size={12} />
                </button>
              </>
            )}
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
            edge={edges.find(e => e.id === selectedEdge.id) || selectedEdge}
            nodes={nodes}
            onUpdate={updateConnectionType}
            onDelete={deleteSelected}
            onReverse={reverseEdgeDirection}
          />
        )}
        {nodes.filter(n => n.selected).length === 1 && (
          <NodeControlPanel
            node={nodes.find(n => n.selected)!}
            componentColors={componentColors}
            style={isAnyConfigPanelOpen ? { right: '440px' } : undefined}
            onStatusChange={(nodeId, status) => {
              const event = new CustomEvent('componentStatusChange', { detail: { nodeId, status } })
              window.dispatchEvent(event)
            }}
            onColorChange={(nodeId, color) => {
              const event = new CustomEvent('componentColorChange', { detail: { nodeId, color } })
              window.dispatchEvent(event)
            }}
            onLinkConfigClick={(nodeId) => {
              const event = new CustomEvent('componentLinkConfigClick', { detail: { nodeId } })
              window.dispatchEvent(event)
            }}
            onLinkClick={(link) => {
              const event = new CustomEvent('componentLinkClick', { detail: { link } })
              window.dispatchEvent(event)
            }}
            onTruthSourceChange={(nodeId, isTruthSource) => {
              const node = nodes.find((n) => n.id === nodeId)
              if (!node) return
              const event = new CustomEvent('nodeDataUpdate', {
                detail: { nodeId, data: { ...node.data, isTruthSource } },
              })
              window.dispatchEvent(event)
            }}
            onBadgesChange={(nodeId, badges) => {
              const node = nodes.find((n) => n.id === nodeId)
              if (!node) return
              const event = new CustomEvent('nodeDataUpdate', {
                detail: { nodeId, data: { ...node.data, badges } },
              })
              window.dispatchEvent(event)
            }}
            onInfoClick={(nodeId) => {
              const event = new CustomEvent('showComponentInfo', { detail: { nodeId } })
              window.dispatchEvent(event)
            }}
            onSettingsClick={handleOpenSettings}
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
            node={nodes.find(n => n.id === databaseConfigNode.id) || databaseConfigNode}
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
            node={nodes.find(n => n.id === cacheConfigNode.id) || cacheConfigNode}
            onUpdate={handleCacheConfigUpdate}
            onClose={() => setCacheConfigNode(null)}
          />
        )}
        {serviceConfigNode && (
          <ServiceConfigPanel
            node={nodes.find(n => n.id === serviceConfigNode.id) || serviceConfigNode}
            onUpdate={handleServiceConfigUpdate}
            onClose={() => setServiceConfigNode(null)}
          />
        )}
        {frontendConfigNode && (
          <FrontendConfigPanel
            node={nodes.find(n => n.id === frontendConfigNode.id) || frontendConfigNode}
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
            node={nodes.find(n => n.id === messageBrokerConfigNode.id) || messageBrokerConfigNode}
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
            node={nodes.find(n => n.id === apiGatewayConfigNode.id) || apiGatewayConfigNode}
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
            label={infoComponentLabel || undefined}
            onClose={() => {
              setInfoComponentType(null)
              setInfoComponentLabel(null)
            }}
            onCompare={(type) => handleComparisonOpen(type, infoComponentLabel || undefined)}
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

        {showSearch && (
          <SearchPanel
            nodes={nodes}
            onSelectNode={handleSelectNodeForSearch}
            onAddComponent={addComponent}
            onClose={() => setShowSearch(false)}
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
  const labels: Partial<Record<ComponentType, string>> = {
    frontend: 'Клиентское приложение',
    service: 'Сервис',
    'mobile-app': 'Мобильное приложение',
    'desktop-app': 'Десктоп приложение',
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
    'tracking': 'Планирование работ',
    'roadmap': 'Roadmap (Дорожная карта)',
    'vpc': 'VPC / Virtual Network',
    'subnet': 'Podnet / Subnet',
    'bare-metal': 'Bare Metal Server',
    'virtual-machine': 'Virtual Machine',
    'micro-frontend': 'Micro-frontend',
    'monorepo': 'Monorepo',
    'dashboard': 'Monitoring Dashboard',
    'log-aggregator': 'Log Aggregator',
    'metrics-collector': 'Metrics Collector',
    'synthetic-monitoring': 'Synthetic Monitoring',
    'aws-service': 'AWS Service',
    'gcp-service': 'Google Cloud Service',
    'azure-service': 'Azure Service',
    'oracle-service': 'Oracle Service',
    'data-pipeline': 'Data Pipeline',
    'stream-analytic': 'Stream Analytics',
    'security-group': 'Security Group',
    'internet-gateway': 'Internet Gateway',
    'nat-gateway': 'NAT Gateway',
    'ocr-service': 'OCR Service',
    'library': 'Library / Module',
    'hsm': 'HSM (Hardware Security Module)',
    'siem': 'SIEM',
    'vulnerability-scanner': 'Vulnerability Scanner',
    'status-page': 'Status Page',
    'profiler': 'Profiling Service',
    'iot-sensor': 'IoT Sensor',
    'iot-hub': 'IoT Hub',
    'edge-gateway': 'Edge Gateway',
    'data-catalog': 'Data Catalog',
    'data-lineage': 'Data Lineage',
    'model-monitoring': 'Model Monitoring',
    'cdn-edge': 'CDN Edge Node',
    'edge-worker': 'Edge Worker',
    'internal-portal': 'Internal Developer Portal',
    'service-proxy': 'Service Proxy',
    'api-proxy': 'API Proxy',
    'data-source': 'Data Source',
    'user': 'User / Actor',
    'vendor': 'Third-party Vendor',
    'regulatory-body': 'Regulatory Body',
    'json': 'JSON Document',
    'xml': 'XML Document',
    'secret-key': 'Secret Key',
    'encryption-service': 'Encryption Service',
    'hashing-service': 'Hashing Service',
    'cluster': 'Кластер',
    'external-component': 'Внешний компонент'
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

