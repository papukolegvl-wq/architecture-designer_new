import React, { useState, useEffect, useRef } from 'react'
import { Handle, Position, NodeProps, useStore, useReactFlow, NodeResizer, useUpdateNodeInternals } from 'reactflow'
import { Maximize2, Minimize2, Trash2, Edit3 } from 'lucide-react'
import { renderFormattedText, handleTextareaTab } from '../utils/textUtils'
import { ComponentData, ComponentType, ComponentLink } from '../types'
import {
  Server,
  Database,
  MessageSquare,
  Globe,
  HardDrive,
  Cloud,
  Zap,
  Shield,
  Loader,
  Box,
  Warehouse,
  Lock,
  Network,
  Github,
  GitBranch,
  Info,
  User,
  ExternalLink,
  Settings,
  Archive,
  Code,
  Container,
  Search,
  Activity,
  FileText,
  Link as LinkIcon,
  Link2,
  Layers,
  BarChart3,
  Key,
  FileCode,
  Clock,
  Cpu,
  Wifi,
  Mail,
  MessageCircle,
  Sparkles,
  CheckCircle,
  Brain,
  Bot,
  Workflow,
  Table as TableIcon,
  Palette,
  Users,
  UserSearch,
  UserCog,
  Gauge,
  ToggleLeft,
  CalendarClock,
  Flag,
  KeyRound,
  Settings2,
  DatabaseZap,
  ShieldAlert,
  ShieldCheck,
  Globe2,
  Copy,
  ArrowRight,
  FileJson,
  RefreshCcw,
  Scale,
  CheckCircle2,
  UserCheck,
  ScrollText,
  ClipboardList,
  EyeOff,
  FileLock,
  LayoutTemplate,
  AppWindow,
  RefreshCw,
  ListChecks,
  FileCode2,
  BellRing,
  Percent,
  Bomb,
  DollarSign,
  Webhook,
  Handshake,
  CloudLightning,
  MessageSquarePlus,
  Signpost,
  HelpCircle,
  Split,
  Map,
  AlertTriangle,
  BadgeCheck,
  Milestone,
  Package,
  Target,
  Circle,
  CircleDot,
  Diamond,
  SeparatorHorizontal,
  StickyNote,
} from 'lucide-react'

const componentIcons: Record<string, React.ReactNode> = {
  frontend: <Globe size={32} />,
  service: <Server size={32} />,
  'auth-service': <Lock size={32} />,
  database: <Database size={32} />,
  'data-warehouse': <Warehouse size={32} />,
  'message-broker': <MessageSquare size={32} />,
  'api-gateway': <Network size={32} />,
  cache: <HardDrive size={32} />,
  'object-storage': <Box size={32} />,
  cdn: <Cloud size={32} />,
  lambda: <Zap size={32} />,
  'load-balancer': <Loader size={32} />,
  firewall: <Shield size={32} />,
  esb: <GitBranch size={32} />,
  client: <User size={32} />,
  'external-system': <ExternalLink size={32} />,
  controller: <Settings size={32} />,
  repository: <Archive size={32} />,
  class: <Code size={32} />,
  server: <Server size={32} />,
  container: <Container size={32} />,
  orchestrator: <Layers size={32} />,
  cluster: <Network size={32} />,
  group: <Layers size={32} />,
  'service-discovery': <Search size={32} />,
  'web-server': <Globe size={32} />,
  monitoring: <Activity size={32} />,
  logging: <FileText size={32} />,
  queue: <MessageSquare size={32} />,
  'event-bus': <Layers size={32} />,
  'stream-processor': <Zap size={32} />,
  'search-engine': <Search size={32} />,
  'analytics-service': <BarChart3 size={32} />,
  'business-intelligence': <BarChart3 size={32} />,
  'graph-database': <Network size={32} />,
  'time-series-database': <Clock size={32} />,
  'service-mesh': <Network size={32} />,
  'configuration-management': <Settings size={32} />,
  vcs: <Github size={32} />,
  'ci-cd-pipeline': <GitBranch size={32} />,
  'backup-service': <HardDrive size={32} />,
  'identity-provider': <Key size={32} />,
  'secret-management': <Lock size={32} />,
  'api-client': <LinkIcon size={32} />,
  'api-documentation': <FileCode size={32} />,
  'integration-platform': <GitBranch size={32} />,
  'batch-processor': <Cpu size={32} />,
  'etl-service': <Database size={32} />,
  'data-lake': <Warehouse size={32} />,
  'edge-computing': <Cpu size={32} />,
  'iot-gateway': <Wifi size={32} />,
  blockchain: <LinkIcon size={32} />,
  'ml-ai-service': <Sparkles size={32} />,
  'llm-model': <Brain size={32} />,
  'vector-database': <Database size={32} />,
  'ai-agent': <Bot size={32} />,
  'ml-training': <Activity size={32} />,
  'ml-inference': <Cpu size={32} />,
  'ml-data-pipeline': <Workflow size={32} />,
  'gpu-cluster': <Server size={32} />,
  'notification-service': <MessageCircle size={32} />,
  'email-service': <Mail size={32} />,
  'sms-gateway': <MessageCircle size={32} />,
  proxy: <Server size={32} />,
  'vpn-gateway': <Shield size={32} />,
  'dns-service': <Globe size={32} />,
  'system-component': <Box size={32} />,
  table: <TableIcon size={32} />,
  analyst: <UserSearch size={32} />,
  devops: <UserCog size={32} />,
  developer: (
    <div style={{ position: 'relative', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <User size={32} />
      <Code size={16} style={{ position: 'absolute', bottom: -2, right: -2, background: 'rgba(0,0,0,0.6)', borderRadius: '4px', padding: '1px' }} />
    </div>
  ),
  team: <Users size={32} />,
  'rate-limiter': <Gauge size={32} />,
  'circuit-breaker': <ToggleLeft size={32} />,
  scheduler: <CalendarClock size={32} />,
  'feature-flag': <Flag size={32} />,
  'secrets-vault': <KeyRound size={32} />,
  'config-service': <Settings2 size={32} />,
  'gateway-cache': <DatabaseZap size={32} />,
  waf: <ShieldAlert size={32} />,
  'zero-trust': <ShieldCheck size={32} />,
  'edge-cache': <Globe2 size={32} />,
  'data-replication': <Copy size={32} />,
  'data-migration': <ArrowRight size={32} />,
  'schema-registry': <FileJson size={32} />,
  cdc: <RefreshCcw size={32} />,
  'data-governance': <Scale size={32} />,
  'data-quality': <CheckCircle2 size={32} />,
  'feature-store': <DatabaseZap size={32} />,
  iam: <UserCheck size={32} />,
  'policy-engine': <ScrollText size={32} />,
  'token-service': <KeyRound size={32} />,
  kms: <KeyRound size={32} />,
  'audit-log': <ClipboardList size={32} />,
  'fraud-detection': <EyeOff size={32} />,
  dlp: <FileLock size={32} />,
  bff: <LayoutTemplate size={32} />,
  facade: <AppWindow size={32} />,
  saga: <RefreshCw size={32} />,
  'workflow-engine': <Workflow size={32} />,
  'rules-engine': <ListChecks size={32} />,
  'service-template': <FileCode2 size={32} />,
  sdk: <Package size={32} />,
  'alert-manager': <BellRing size={32} />,
  tracing: <Activity size={32} />,
  'slo-manager': <Percent size={32} />,
  'chaos-testing': <Bomb size={32} />,
  'cost-monitoring': <DollarSign size={32} />,
  webhook: <Webhook size={32} />,
  'contract-testing': <Handshake size={32} />,
  'partner-gateway': <Users size={32} />,
  'etl-orchestrator': <Workflow size={32} />,
  ipaas: <CloudLightning size={32} />,
  'prompt-store': <MessageSquarePlus size={32} />,
  'prompt-router': <Signpost size={32} />,
  'model-registry': <Archive size={32} />,
  explainability: <HelpCircle size={32} />,
  'feedback-loop': <RefreshCw size={32} />,
  'ab-testing': <Split size={32} />,
  adr: <FileText size={32} />,
  'capability-map': <Map size={32} />,
  'risk-register': <AlertTriangle size={32} />,
  compliance: <BadgeCheck size={32} />,
  roadmap: <Milestone size={32} />,
  'roadmap-task': <ListChecks size={32} />,
  'roadmap-milestone': <Milestone size={32} />,
  'roadmap-phase': <Map size={32} />,
  tracking: <Clock size={32} />,
  'external-component': <ExternalLink size={32} />,
  'activity-start': <Circle size={32} fill="currentColor" />,
  'activity-end': <CircleDot size={32} strokeWidth={3} />,
  'activity-decision': <Diamond size={32} />,
  'activity-action': <Activity size={32} />,
  'activity-fork': <SeparatorHorizontal size={40} strokeWidth={5} />,
  'activity-join': <SeparatorHorizontal size={40} strokeWidth={5} />,
  'activity-note': <StickyNote size={32} />,
}

export const componentColors: Record<string, string> = {
  frontend: '#339af0',
  service: '#4dabf7',
  'auth-service': '#ff6b6b',
  database: '#51cf66',
  'data-warehouse': '#20c997',
  'message-broker': '#ffd43b',
  'api-gateway': '#ff6b6b',
  cache: '#845ef7',
  'object-storage': '#fd7e14',
  cdn: '#51cf66',
  lambda: '#ffd43b',
  'load-balancer': '#4dabf7',
  firewall: '#dc3545',
  esb: '#9c88ff',
  client: '#ff8787',
  'external-system': '#ffa94d',
  'external-component': '#868e96',
  controller: '#4dabf7',
  repository: '#51cf66',
  class: '#845ef7',
  server: '#339af0',
  container: '#51cf66',
  orchestrator: '#20c997',
  cluster: '#339af0',
  'service-discovery': '#4dabf7',
  'web-server': '#51cf66',
  monitoring: '#ff6b6b',
  logging: '#ffa94d',
  queue: '#ffd43b',
  'event-bus': '#845ef7',
  'stream-processor': '#4dabf7',
  'search-engine': '#20c997',
  'analytics-service': '#339af0',
  'business-intelligence': '#4dabf7',
  'graph-database': '#51cf66',
  'time-series-database': '#845ef7',
  'service-mesh': '#9c88ff',
  'configuration-management': '#ffa94d',
  vcs: '#fff',
  'ci-cd-pipeline': '#20c997',
  'backup-service': '#666',
  'identity-provider': '#ff6b6b',
  'secret-management': '#dc3545',
  'api-client': '#4dabf7',
  'api-documentation': '#339af0',
  'integration-platform': '#9c88ff',
  'batch-processor': '#845ef7',
  'etl-service': '#20c997',
  'data-lake': '#51cf66',
  'edge-computing': '#ffa94d',
  'iot-gateway': '#4dabf7',
  blockchain: '#333',
  'ml-ai-service': '#fab005',
  'llm-model': '#ae3ec9',
  'vector-database': '#748ffc',
  'ai-agent': '#f03e3e',
  'ml-training': '#fcc419',
  'ml-inference': '#37b24d',
  'ml-data-pipeline': '#4dabf7',
  'gpu-cluster': '#228be6',
  'notification-service': '#ffd43b',
  'email-service': '#339af0',
  'sms-gateway': '#4dabf7',
  proxy: '#666',
  'vpn-gateway': '#dc3545',
  'dns-service': '#51cf66',
  table: '#5C7CFA',
  analyst: '#4dabf7',
  devops: '#20c997',
  developer: '#339af0',
  team: '#845ef7',
  'rate-limiter': '#fa5252',
  'circuit-breaker': '#fa5252',
  scheduler: '#4dabf7',
  'feature-flag': '#fd7e14',
  'secrets-vault': '#e03131',
  'config-service': '#fab005',
  'gateway-cache': '#845ef7',
  waf: '#e03131',
  'zero-trust': '#0ca678',
  'edge-cache': '#3bc9db',
  'data-replication': '#51cf66',
  'data-migration': '#69db7c',
  'schema-registry': '#38d9a9',
  cdc: '#20c997',
  'data-governance': '#099268',
  'data-quality': '#38d9a9',
  'feature-store': '#ae3ec9',
  iam: '#f03e3e',
  'policy-engine': '#d6336c',
  'token-service': '#f06595',
  kms: '#e03131',
  'audit-log': '#868e96',
  'fraud-detection': '#c92a2a',
  dlp: '#fa5252',
  bff: '#22b8cf',
  facade: '#15aabf',
  saga: '#ae3ec9',
  'workflow-engine': '#be4bdb',
  'rules-engine': '#7950f2',
  'service-template': '#748ffc',
  sdk: '#4c6ef5',
  'alert-manager': '#e03131',
  tracing: '#f03e3e',
  'slo-manager': '#fa5252',
  'chaos-testing': '#000',
  'cost-monitoring': '#12b886',
  webhook: '#be4bdb',
  'contract-testing': '#7950f2',
  'partner-gateway': '#4c6ef5',
  'etl-orchestrator': '#22b8cf',
  ipaas: '#1098ad',
  'prompt-store': '#cc5de8',
  'prompt-router': '#b197fc',
  'model-registry': '#845ef7',
  explainability: '#5c7cfa',
  'feedback-loop': '#339af0',
  'ab-testing': '#228be6',
  adr: '#868e96',
  'capability-map': '#1098ad',
  'risk-register': '#fa5252',
  compliance: '#087f5b',
  roadmap: '#099268',
  'roadmap-task': '#20c997',
  'roadmap-milestone': '#f03e3e',
  'roadmap-phase': '#099268',
  tracking: '#ffd43b',
}

interface CustomNodeProps extends NodeProps<ComponentData> {
  onInfoClick?: (componentType: ComponentType, label?: string) => void
  onLinkClick?: (link: ComponentLink) => void
  onLinkConfigClick?: (nodeId: string) => void
  onCommentClick?: (nodeId: string) => void
  onStatusChange?: (nodeId: string, status: 'new' | 'existing' | 'refinement' | 'highlighted' | undefined, color?: string) => void
  onColorChange?: (nodeId: string, color: string | undefined) => void
}

function CustomNode({ data, selected, id, onInfoClick, onLinkClick, onLinkConfigClick, onCommentClick, onStatusChange, onColorChange }: CustomNodeProps) {
  // Reactive Dark Mode check
  const [isDarkMode, setIsDarkMode] = useState(!document.documentElement.classList.contains('light-theme'));

  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          setIsDarkMode(!document.documentElement.classList.contains('light-theme'));
        }
      });
    });
    observer.observe(document.documentElement, { attributes: true });
    return () => observer.disconnect();
  }, []);

  const { getNodes } = useReactFlow()
  const icon = componentIcons[data.type] || <Server size={32} />
  const color = data.customColor || componentColors[data.type] || '#4dabf7'
  const [isEditing, setIsEditing] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [label, setLabel] = useState(data.label)
  const [showColorPicker, setShowColorPicker] = useState(false)
  const [childNodes, setChildNodes] = useState<string[]>(data.containerConfig?.childNodes || [])
  const [isManuallyResized, setIsManuallyResized] = useState(data.isExpanded || false)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const colorPickerRef = useRef<HTMLDivElement>(null)
  const zoom = useStore((s) => s.transform[2])
  const { nodeWidth, nodeHeight } = useStore((s) => {
    const node = s.nodeInternals.get(id);
    return {
      nodeWidth: node?.width || (node?.style?.width as number) || 0,
      nodeHeight: node?.height || (node?.style?.height as number) || 0
    };
  }, (a, b) => a.nodeWidth === b.nodeWidth && a.nodeHeight === b.nodeHeight);

  // Explicitly track connection state from global store to ensure handle interactivity updates correctly
  const isGlobalConnecting = useStore((s) => !!s.connectionNodeId);

  const isActivity = data.type?.startsWith('activity-');
  const isStart = data.type === 'activity-start';
  const isEnd = data.type === 'activity-end';
  const isDecision = data.type === 'activity-decision';
  const isFork = data.type === 'activity-fork';
  const isJoin = data.type === 'activity-join';
  const isForkJoin = isFork || isJoin;
  const isAction = data.type === 'activity-action';
  const isActivityNote = data.type === 'activity-note';

  // Добавляем логику контейнера, если компонент расширен
  const updateContainerSize = React.useCallback(() => {
    if (!data.isExpanded) return;

    const allNodes = getNodes()
    const thisNode = allNodes.find(n => n.id === id)
    if (!thisNode) return

    const padding = 30
    const minWidth = 300
    const minHeight = 200

    const containerX = thisNode.position.x
    const containerY = thisNode.position.y
    const currentWidth = thisNode.width || minWidth
    const currentHeight = thisNode.height || minHeight

    // Находим узлы внутри
    let insideNodes = allNodes.filter(node => {
      // Исключаем только самого себя
      if (node.id === id) return false

      // Проверяем, что узел не является родителем этого узла (защита от циклов)
      if (node.id === thisNode.parentId) return false

      const nodeX = node.position.x
      const nodeY = node.position.y
      const nodeWidth = node.width || 200
      const nodeHeight = node.height || 120

      const nodeCenterX = nodeX + nodeWidth / 2
      const nodeCenterY = nodeY + nodeHeight / 2

      return (
        nodeCenterX >= containerX &&
        nodeCenterY >= containerY &&
        nodeCenterX <= containerX + currentWidth &&
        nodeCenterY <= containerY + currentHeight
      )
    })

    const childIds = insideNodes.map(n => n.id)
    const childrenChanged = JSON.stringify(childIds.sort()) !== JSON.stringify(childNodes.sort())

    if (childrenChanged) {
      setChildNodes(childIds)
    }

    if (childrenChanged || (insideNodes.length > 0)) {
      if (childrenChanged) {
        const event = new CustomEvent('containerSizeUpdate', {
          detail: {
            containerId: id,
            childNodes: childIds,
            width: currentWidth,
            height: currentHeight,
            position: { x: containerX, y: containerY },
          },
        })
        window.dispatchEvent(event)
      }
    }
  }, [id, getNodes, data.isExpanded, childNodes])

  useEffect(() => {
    if (data.isExpanded) {
      updateContainerSize()
      const interval = setInterval(updateContainerSize, 1000)
      return () => clearInterval(interval)
    }
  }, [updateContainerSize, data.isExpanded])

  const handleToggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation()
    const newIsExpanded = !data.isExpanded

    // Отправляем событие для обновления данных узла в App
    const event = new CustomEvent('nodeDataUpdate', {
      detail: {
        nodeId: id,
        data: {
          ...data,
          isExpanded: newIsExpanded,
          // Если расширяем, устанавливаем начальные размеры, если их нет
          containerConfig: data.containerConfig || { childNodes: [] }
        }
      }
    })
    window.dispatchEvent(event)

    // Если расширяем, также устанавливаем размеры через стиль/пропсы в App (это обработает App)
    if (newIsExpanded) {
      const sizeEvent = new CustomEvent('nodeSizeUpdate', {
        detail: { nodeId: id, width: 400, height: 300 }
      })
      window.dispatchEvent(sizeEvent)
    } else {
      // При сворачивании возвращаем стандартный размер
      const sizeEvent = new CustomEvent('nodeSizeUpdate', {
        detail: { nodeId: id, width: null, height: null }
      })
      window.dispatchEvent(sizeEvent)
    }
  }
  const connectedHandleIds = useStore((s) => {
    // Оптимизированный селектор: фильтруем только те грани, которые связаны с этим узлом
    const ids: string[] = []
    for (const e of s.edges) {
      if (e.source === id && e.sourceHandle) ids.push(e.sourceHandle)
      if (e.target === id && e.targetHandle) ids.push(e.targetHandle)
    }
    return ids
  }, (a, b) => JSON.stringify(a) === JSON.stringify(b));

  const isConnecting = useStore((s) => !!s.connectionStartHandle);
  const [wasConnecting, setWasConnecting] = useState(false);

  // Стабилизируем отображение handle: если мы только что закончили подключение,
  // придерживаем handle видимыми еще 500мс, чтобы ReactFlow успел отрисовать новую связь
  useEffect(() => {
    if (isConnecting) {
      setWasConnecting(true);
    } else if (wasConnecting) {
      const timer = setTimeout(() => setWasConnecting(false), 500);
      return () => clearTimeout(timer);
    }
  }, [isConnecting, wasConnecting]);

  const isSimple = zoom < 0.4
  const isMedium = zoom < 0.7

  const handleInfoClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    if (onInfoClick) {
      onInfoClick(data.type, data.label)
    }
  }

  const isGhost = data.isGhost;
  const statusColor = data.status === 'new'
    ? '#40c057'
    : data.status === 'existing'
      ? '#339af0'
      : data.status === 'refinement'
        ? '#fab005'
        : data.status === 'highlighted'
          ? '#e64980' // Яркий розовый для акцента
          : color;

  useEffect(() => {
    setLabel(data.label)
  }, [data.label])

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditing])

  const handleDoubleClick = () => {
    if (data.type === 'roadmap') {
      const event = new CustomEvent('showRoadmapPanel')
      window.dispatchEvent(event)
      return
    }
    if (selected) {
      setIsEditing(true)
    }
  }

  const handleBlur = () => {
    setIsEditing(false)
    if (label.trim() && label !== data.label) {
      // Обновляем label через изменение data
      const event = new CustomEvent('nodeLabelUpdate', {
        detail: { nodeId: id, label: label.trim() },
      })
      window.dispatchEvent(event)
    } else {
      setLabel(data.label)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Останавливаем распространение события, чтобы глобальный обработчик не удалял компонент
    e.stopPropagation()

    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      handleBlur()
    } else if (e.key === 'Escape') {
      setLabel(data.label)
      setIsEditing(false)
    } else if (e.key === 'Tab') {
      handleTextareaTab(e, label, setLabel)
      // Also trigger the update event
      const newLabel = label.substring(0, e.currentTarget.selectionStart) + '  ' + label.substring(e.currentTarget.selectionEnd);
      const event = new CustomEvent('nodeLabelUpdate', {
        detail: { nodeId: id, label: newLabel },
      });
      window.dispatchEvent(event);
    }
    // Enter без модификаторов теперь просто вставляет перенос строки (стандартное поведение textarea)
  }

  // Check if initial migration is needed for old tracking config
  useEffect(() => {
    if (data.type === 'tracking' && data.trackingConfig && !(data.trackingConfig as any).items) {
      // Migrate old format to new format
      const oldConfig = data.trackingConfig as any
      const newConfig = {
        included: true,
        items: [
          {
            id: Date.now().toString(),
            activity: oldConfig.activity || '',
            time: oldConfig.time || '',
            included: true
          }
        ]
      }

      const event = new CustomEvent('nodeDataUpdate', {
        detail: {
          nodeId: id,
          data: {
            ...data,
            trackingConfig: newConfig
          }
        }
      })
      window.dispatchEvent(event)
    }
  }, [data.type, data.trackingConfig, id, data])

  const handleTrackingItemUpdate = (itemId: string, field: 'activity' | 'time' | 'included', value: string | boolean) => {
    const items = data.trackingConfig?.items || []
    const newItems = items.map(item =>
      item.id === itemId ? { ...item, [field]: value } : item
    )

    const newConfig = { items: newItems }

    const event = new CustomEvent('nodeDataUpdate', {
      detail: {
        nodeId: id,
        data: {
          ...data,
          trackingConfig: newConfig
        }
      }
    })
    window.dispatchEvent(event)
  }

  const handleAddTrackingItem = () => {
    const items = data.trackingConfig?.items || []
    const newItems = [
      ...items,
      { id: Date.now().toString(), activity: '', time: '', included: true }
    ]

    const newConfig = { items: newItems }

    const event = new CustomEvent('nodeDataUpdate', {
      detail: {
        nodeId: id,
        data: {
          ...data,
          trackingConfig: newConfig
        }
      }
    })
    window.dispatchEvent(event)
  }

  const handleDeleteTrackingItem = (itemId: string) => {
    const items = data.trackingConfig?.items || []
    const newItems = items.filter(item => item.id !== itemId)

    const newConfig = { items: newItems }

    const event = new CustomEvent('nodeDataUpdate', {
      detail: {
        nodeId: id,
        data: {
          ...data,
          trackingConfig: newConfig
        }
      }
    })
    window.dispatchEvent(event)
  }

  const handleTrackingGlobalToggle = (checked: boolean) => {
    const newConfig = {
      ...(data.trackingConfig || {}),
      included: checked
    }

    const event = new CustomEvent('nodeDataUpdate', {
      detail: {
        nodeId: id,
        data: {
          ...data,
          trackingConfig: newConfig
        }
      }
    })
    window.dispatchEvent(event)
  }



  // Определяем подпись для отображения
  const getSubtitle = () => {
    if (data.type === 'database') {
      if (data.databaseConfig?.vendor) {
        const vendorLabels: Record<string, string> = {
          postgresql: 'PostgreSQL',
          mysql: 'MySQL',
          oracle: 'Oracle',
          'sql-server': 'SQL Server',
          mongodb: 'MongoDB',
          elasticsearch: 'Elasticsearch',
          cassandra: 'Cassandra',
          redis: 'Redis',
          dynamodb: 'DynamoDB',
          neo4j: 'Neo4j',
          influxdb: 'InfluxDB',
          mariadb: 'MariaDB',
          sqlite: 'SQLite',
          cockroachdb: 'CockroachDB',
          tidb: 'TiDB',
          duckdb: 'DuckDB',
          couchdb: 'CouchDB',
          ravendb: 'RavenDB',
          firebase: 'Firebase',
          scylladb: 'ScyllaDB',
          hbase: 'HBase',
          bigtable: 'BigTable',
          riak: 'Riak',
          memcached: 'Memcached',
          aerospike: 'Aerospike',
          arangodb: 'ArangoDB',
          neptune: 'Neptune',
          'amazon-neptune': 'Amazon Neptune',
          orientdb: 'OrientDB',
          janusgraph: 'JanusGraph',
          timescaledb: 'TimescaleDB',
          prometheus: 'Prometheus',
          victoriametrics: 'VictoriaMetrics',
          clickhouse: 'ClickHouse',
          'apache-druid': 'Apache Druid',
          pinot: 'Pinot',
        }
        return vendorLabels[data.databaseConfig.vendor] || 'Database'
      }
      if (data.databaseConfig?.dbType) {
        return data.databaseConfig.dbType === 'sql' ? 'SQL' : 'NoSQL'
      }
      return 'Database'
    } else if (data.type === 'cache') {
      if (data.cacheConfig?.vendor) {
        const vendorLabels: Record<string, string> = {
          redis: 'Redis',
          memcached: 'Memcached',
          hazelcast: 'Hazelcast',
          ehcache: 'Ehcache',
          infinispan: 'Infinispan',
        }
        return vendorLabels[data.cacheConfig.vendor] || 'Cache'
      }
      if (data.cacheConfig?.cacheType) {
        return data.cacheConfig.cacheType === 'distributed' ? 'Distributed' : 'In-Memory'
      }
      return 'Cache'
    } else if (data.type === 'frontend') {
      if (data.frontendConfig?.framework) {
        const frameworkLabels: Record<string, string> = {
          react: 'React',
          vue: 'Vue',
          angular: 'Angular',
          svelte: 'Svelte',
          nextjs: 'Next.js',
          nuxt: 'Nuxt',
          vanilla: 'Vanilla JS',
        }
        return frameworkLabels[data.frontendConfig.framework] || 'Frontend'
      }
      return 'Frontend'
    } else if (data.type === 'service') {
      if (data.serviceConfig?.language) {
        const languageLabels: Record<string, string> = {
          java: 'Java',
          python: 'Python',
          nodejs: 'Node.js',
          go: 'Go',
          csharp: 'C#',
          rust: 'Rust',
          kotlin: 'Kotlin',
          scala: 'Scala',
        }
        return languageLabels[data.serviceConfig.language] || 'Service'
      }
      return 'Service'
    } else if (data.type === 'data-warehouse') {
      if (data.dataWarehouseConfig?.vendor) {
        const vendorLabels: Record<string, string> = {
          snowflake: 'Snowflake',
          redshift: 'Redshift',
          bigquery: 'BigQuery',
          databricks: 'Databricks',
          synapse: 'Synapse',
          teradata: 'Teradata',
        }
        return vendorLabels[data.dataWarehouseConfig.vendor] || 'Data Warehouse'
      }
      return 'Data Warehouse'
    } else if (data.type === 'message-broker') {
      if (data.messageBrokerConfig?.vendor) {
        const vendorLabels: Record<string, string> = {
          kafka: 'Kafka',
          rabbitmq: 'RabbitMQ',
          activemq: 'ActiveMQ',
          nats: 'NATS',
          pulsar: 'Pulsar',
          'redis-pubsub': 'Redis Pub/Sub',
          'amazon-sqs': 'SQS',
          'azure-service-bus': 'Service Bus',
        }
        const vendorLabel = vendorLabels[data.messageBrokerConfig.vendor] || 'Broker'
        if (data.messageBrokerConfig.deliveryType) {
          const deliveryLabels: Record<string, string> = {
            push: 'Push',
            pull: 'Pull',
            'pub-sub': 'Pub-Sub',
          }
          return `${vendorLabel} (${deliveryLabels[data.messageBrokerConfig.deliveryType] || data.messageBrokerConfig.deliveryType})`
        }
        return vendorLabel
      }
      return 'Message Broker'
    } else if (data.type === 'lambda') {
      if (data.lambdaConfig?.vendor) {
        const vendorLabels: Record<string, string> = {
          'aws-lambda': 'AWS Lambda',
          'azure-functions': 'Azure Functions',
          'gcp-cloud-functions': 'GCP Functions',
          vercel: 'Vercel',
          'cloudflare-workers': 'Cloudflare Workers',
        }
        return vendorLabels[data.lambdaConfig.vendor] || 'Lambda'
      }
      return 'Lambda'
    } else if (data.type === 'cdn') {
      if (data.cdnConfig?.vendor) {
        const vendorLabels: Record<string, string> = {
          cloudflare: 'Cloudflare',
          'aws-cloudfront': 'CloudFront',
          'azure-cdn': 'Azure CDN',
          'gcp-cdn': 'GCP CDN',
          akamai: 'Akamai',
        }
        return vendorLabels[data.cdnConfig.vendor] || 'CDN'
      }
      return 'CDN'
    } else if (data.type === 'object-storage') {
      if (data.objectStorageConfig?.vendor) {
        const vendorLabels: Record<string, string> = {
          s3: 'S3',
          'azure-blob': 'Azure Blob',
          gcs: 'GCS',
          minio: 'MinIO',
        }
        return vendorLabels[data.objectStorageConfig.vendor] || 'Object Storage'
      }
      return 'Object Storage'
    } else if (data.type === 'auth-service') {
      if (data.authServiceConfig?.vendor) {
        const vendorLabels: Record<string, string> = {
          auth0: 'Auth0',
          okta: 'Okta',
          keycloak: 'Keycloak',
          'aws-cognito': 'Cognito',
          'azure-ad': 'Azure AD',
          'firebase-auth': 'Firebase Auth',
          oauth2: 'OAuth2',
          jwt: 'JWT',
        }
        return vendorLabels[data.authServiceConfig.vendor] || 'Auth'
      }
      return 'Auth Service'
    } else if (data.type === 'firewall') {
      if (data.firewallConfig?.vendor) {
        const vendorLabels: Record<string, string> = {
          'aws-waf': 'AWS WAF',
          'azure-waf': 'Azure WAF',
          'cloudflare-waf': 'Cloudflare WAF',
          modsecurity: 'ModSecurity',
          'nginx-waf': 'NGINX WAF',
          fortinet: 'Fortinet',
        }
        return vendorLabels[data.firewallConfig.vendor] || 'Firewall'
      }
      return 'Firewall'
    } else if (data.type === 'load-balancer') {
      if (data.loadBalancerConfig?.vendor) {
        const vendorLabels: Record<string, string> = {
          nginx: 'NGINX',
          haproxy: 'HAProxy',
          'aws-alb': 'AWS ALB',
          'azure-lb': 'Azure LB',
          'gcp-lb': 'GCP LB',
          traefik: 'Traefik',
        }
        return vendorLabels[data.loadBalancerConfig.vendor] || 'Load Balancer'
      }
      return 'Load Balancer'
    } else if (data.type === 'api-gateway') {
      if (data.apiGatewayConfig?.vendor) {
        const vendorLabels: Record<string, string> = {
          'aws-api-gateway': 'AWS API Gateway',
          'azure-api-management': 'Azure API Mgmt',
          kong: 'Kong',
          tyk: 'Tyk',
          apigee: 'Apigee',
          'nginx-plus': 'NGINX Plus',
        }
        return vendorLabels[data.apiGatewayConfig.vendor] || 'API Gateway'
      }
      return 'API Gateway'
    } else if (data.type === 'esb') {
      if (data.esbConfig?.vendor) {
        const vendorLabels: Record<string, string> = {
          'mule-esb': 'Mule ESB',
          'wso2-esb': 'WSO2 ESB',
          'apache-camel': 'Apache Camel',
          'jboss-fuse': 'JBoss Fuse',
          'tibco-businessworks': 'TIBCO BW',
          'oracle-service-bus': 'Oracle SB',
          'ibm-integration-bus': 'IBM IIB',
        }
        return vendorLabels[data.esbConfig.vendor] || 'ESB'
      }
      return 'ESB'
    } else if (data.type === 'client') {
      return 'Client'
    } else if (data.type === 'external-system') {
      return 'External System'
    } else if (data.type === 'controller') {
      if (data.controllerConfig?.endpoints && data.controllerConfig.endpoints.length > 0) {
        return `${data.controllerConfig.endpoints.length} endpoint(s)`
      }
      return 'Controller'
    } else if (data.type === 'repository') {
      if (data.repositoryConfig?.data && data.repositoryConfig.data.length > 0) {
        return `${data.repositoryConfig.data.length} таблиц(ы)`
      }
      return 'Repository'
    } else if (data.type === 'class') {
      if (data.classConfig?.methods && data.classConfig.methods.length > 0) {
        return `${data.classConfig.methods.length} метод(ов)`
      }
      return 'Class'
    } else if (data.type === 'server') {
      return 'Server'
    } else if (data.type === 'orchestrator') {
      return 'Orchestrator'
    } else if (data.type === 'group') {
      return 'Group'
    } else if (data.type === 'service-discovery') {
      return 'Service Discovery'
    } else if (data.type === 'web-server') {
      return 'Web Server'
    } else if (data.type === 'monitoring') {
      return 'Monitoring'
    } else if (data.type === 'logging') {
      return 'Logging'
    } else if (data.type === 'queue') {
      if (data.queueConfig?.vendor) {
        return data.queueConfig.vendor
      }
      return 'Queue'
    } else if (data.type === 'event-bus') {
      if (data.eventBusConfig?.vendor) {
        return data.eventBusConfig.vendor
      }
      return 'Event Bus'
    } else if (data.type === 'stream-processor') {
      if (data.streamProcessorConfig?.vendor) {
        return data.streamProcessorConfig.vendor
      }
      return 'Stream Processor'
    } else if (data.type === 'search-engine') {
      if (data.searchEngineConfig?.vendor) {
        return data.searchEngineConfig.vendor
      }
      return 'Search Engine'
    } else if (data.type === 'analytics-service') {
      return 'Analytics'
    } else if (data.type === 'business-intelligence') {
      return 'BI'
    } else if (data.type === 'graph-database') {
      if (data.graphDatabaseConfig?.vendor) {
        return data.graphDatabaseConfig.vendor
      }
      return 'Graph DB'
    } else if (data.type === 'time-series-database') {
      if (data.timeSeriesDatabaseConfig?.vendor) {
        return data.timeSeriesDatabaseConfig.vendor
      }
      return 'Time Series DB'
    } else if (data.type === 'service-mesh') {
      if (data.serviceMeshConfig?.vendor) {
        return data.serviceMeshConfig.vendor
      }
      return 'Service Mesh'
    } else if (data.type === 'activity-start') {
      return '(Start)'
    } else if (data.type === 'activity-end') {
      return '(End)'
    } else if (data.type === 'activity-decision') {
      return '(Decision)'
    } else if (data.type === 'activity-action') {
      return '(Action)'
    } else if (data.type === 'activity-fork') {
      return '(Fork)'
    } else if (data.type === 'activity-join') {
      return '(Join)'
    } else if (data.type === 'activity-note') {
      return '(Note)'
    } else if (data.type === 'configuration-management') {
      if (data.configurationManagementConfig?.vendor) {
        return data.configurationManagementConfig.vendor
      }
      return 'Config Management'
    } else if (data.type === 'ci-cd-pipeline') {
      if (data.ciCdPipelineConfig?.vendor) {
        return data.ciCdPipelineConfig.vendor
      }
      return 'CI/CD'
    } else if (data.type === 'backup-service') {
      return 'Backup'
    } else if (data.type === 'identity-provider') {
      if (data.identityProviderConfig?.vendor) {
        return data.identityProviderConfig.vendor
      }
      return 'Identity Provider'
    } else if (data.type === 'secret-management') {
      if (data.secretManagementConfig?.vendor) {
        return data.secretManagementConfig.vendor
      }
      return 'Secret Management'
    } else if (data.type === 'api-client') {
      return 'API Client'
    } else if (data.type === 'api-documentation') {
      return 'API Docs'
    } else if (data.type === 'integration-platform') {
      if (data.integrationPlatformConfig?.vendor) {
        return data.integrationPlatformConfig.vendor
      }
      return 'Integration Platform'
    } else if (data.type === 'batch-processor') {
      if (data.batchProcessorConfig?.vendor) {
        return data.batchProcessorConfig.vendor
      }
      return 'Batch Processor'
    } else if (data.type === 'etl-service') {
      if (data.etlServiceConfig?.vendor) {
        return data.etlServiceConfig.vendor
      }
      return 'ETL Service'
    } else if (data.type === 'data-lake') {
      if (data.dataLakeConfig?.vendor) {
        return data.dataLakeConfig.vendor
      }
      return 'Data Lake'
    } else if (data.type === 'edge-computing') {
      return 'Edge Computing'
    } else if (data.type === 'iot-gateway') {
      return 'IoT Gateway'
    } else if (data.type === 'blockchain') {
      return 'Blockchain'
    } else if (data.type === 'system-component') {
      return 'Система'
    } else if (data.type === 'ml-ai-service') {
      if (data.mlServiceConfig?.vendor) {
        return data.mlServiceConfig.vendor
      }
      return 'ML/AI Service'
    } else if (data.type === 'notification-service') {
      if (data.notificationServiceConfig?.vendor) {
        return data.notificationServiceConfig.vendor
      }
      return 'Notifications'
    } else if (data.type === 'email-service') {
      if (data.emailServiceConfig?.vendor) {
        return data.emailServiceConfig.vendor
      }
      return 'Email Service'
    } else if (data.type === 'sms-gateway') {
      if (data.smsGatewayConfig?.vendor) {
        return data.smsGatewayConfig.vendor
      }
      return 'SMS Gateway'
    } else if (data.type === 'proxy') {
      if (data.proxyConfig?.vendor) {
        return data.proxyConfig.vendor
      }
      return 'Proxy'
    } else if (data.type === 'vpn-gateway') {
      if (data.vpnGatewayConfig?.vendor) {
        return data.vpnGatewayConfig.vendor
      }
      return 'VPN Gateway'
    } else if (data.type === 'dns-service') {
      if (data.dnsServiceConfig?.vendor) {
        return data.dnsServiceConfig.vendor
      }
      return 'DNS Service'
    } else if (data.type === 'vector-database') {
      if (data.vectorDatabaseConfig?.vendor) {
        const vendorLabels: Record<string, string> = {
          pinecone: 'Pinecone',
          milvus: 'Milvus',
          weaviate: 'Weaviate',
          qdrant: 'Qdrant',
          chroma: 'Chroma',
          faiss: 'FAISS',
          zilliz: 'Zilliz',
          'elastic-vector': 'Elastic Vector',
          pgvector: 'pgvector',
        }
        return vendorLabels[data.vectorDatabaseConfig.vendor] || 'Vector DB'
      }
      return 'Vector Database'
    }
    return ''
  }

  // Определяем стили для статусов
  const isNew = data.status === 'new'
  const isRefinement = data.status === 'refinement'
  const isExisting = data.status === 'existing'

  const borderColor = selected
    ? color + '99' // Reduced brightness for selected state
    : isNew
      ? '#40c057' // Green
      : isExisting
        ? '#339af0' // Blue
        : isRefinement
          ? '#fab005' // Yellow
          : '#444'

  const borderStyle = isGhost
    ? 'dotted'
    : isNew
      ? 'dashed'
      : isExisting
        ? 'solid' // Solid double border look is simulated via double? No, 'double' css style.
        : isRefinement
          ? 'dashed'
          : 'solid'

  const actualBorderStyle = isExisting ? 'double' : (isNew || isRefinement ? 'dashed' : 'solid');

  const borderWidth = isExisting ? '3px' : (isNew || isRefinement ? '2px' : '1.5px')

  // Shadow logic
  const boxShadow = isNew
    ? selected
      ? `0 4px 12px ${color}08, 0 0 0 1px ${color}05`
      : `0 1px 6px rgba(0,0,0,0.2)`
    : isRefinement
      ? selected
        ? `0 4px 12px ${color}08, 0 0 0 1px ${color}05`
        : `0 1px 6px rgba(0,0,0,0.2)`
      : isExisting
        ? selected
          ? `0 2px 8px ${color}05`
          : '0 1px 2px rgba(0,0,0,0.1)'
        : selected
          ? `0 2px 8px ${color}05`
          : isDarkMode
            ? '0 1px 2px rgba(0,0,0,0.1)'
            : `0 2px 8px -5px ${color}10`
  printable: true

  // Background color logic
  // Light mode: use almost opaque whitish background or very light tint
  // Dark mode: use transparent dark
  // Background color logic
  // Light mode: use a clearer tint of the component color (10%) instead of almost white
  // Dark mode: use transparent dark (original logic)
  const backgroundColor = isDarkMode
    ? (isNew ? 'rgba(26, 46, 26, 0.08)' : isRefinement ? 'rgba(46, 41, 26, 0.08)' : isExisting ? 'rgba(26, 34, 46, 0.08)' : 'rgba(45, 45, 45, 0.08)')
    : (data.isExpanded ? `${color}05` : `${color}03`); // minimal background tint

  const textColor = isDarkMode ? '#fff' : '#111'; // Even darker text in light mode for contrast
  const contentColor = isDarkMode ? '#fff' : '#1e1e1e';
  const mutedContentColor = isDarkMode ? '#ccc' : '#555';
  const listBackgroundColor = isDarkMode ? '#2d2d2d' : 'rgba(0,0,0,0.05)';

  const actionButtonBg = isDarkMode ? 'rgba(0,0,0,0.6)' : '#ffffff';
  const actionButtonBorder = isDarkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)';
  const actionButtonShadow = isDarkMode ? 'none' : '0 2px 4px rgba(0,0,0,0.15)';

  const subtitle = getSubtitle()

  return (
    <div
      style={{
        width: (nodeWidth && nodeWidth > 10) ? '100%' : (isSimple ? '60px' : (isStart || isEnd) ? '40px' : isDecision ? '60px' : isForkJoin ? '150px' : '210px'),
        height: isDecision ? (nodeWidth ? `${nodeWidth}px` : '60px') : '100%',
        boxSizing: 'border-box',
        padding: (isSimple || isStart || isEnd || isForkJoin || isDecision) ? '0' : '16px 24px',
        borderRadius: isStart || isEnd ? '50%' : isDecision ? '4px' : isAction ? '20px' : isForkJoin ? '2px' : '12px',
        background: isStart
          ? `linear-gradient(135deg, ${color}, ${color}dd)`
          : isEnd
            ? 'transparent'
            : isForkJoin
              ? (color === '#868e96' ? '#222' : color)
              : data.status === 'highlighted'
                ? `${color}05`
                : (data.isExpanded ? `${color}01` : (isSimple ? color : (isDarkMode ? 'rgba(30, 30, 30, 0.7)' : 'rgba(255, 255, 255, 0.9)'))),
        border: isStart || isForkJoin
          ? 'none'
          : isEnd
            ? `3px solid ${isDarkMode ? '#eee' : '#222'}`
            : isAction || isDecision
              ? `1.5px solid ${color}cc`
              : `${data.status === 'highlighted' ? '2px' : borderWidth} ${actualBorderStyle} ${selected || data.status === 'highlighted' ? color + 'CC' : (isSimple ? 'transparent' : (isDarkMode ? borderColor : (isHovered ? '#444' : color + '80')))}`,
        color: isSimple ? '#fff' : textColor,
        minWidth: isStart || isEnd ? '40px' : isDecision ? '40px' : isForkJoin ? '10px' : isSimple ? '60px' : '120px',
        minHeight: isStart || isEnd ? '40px' : isDecision ? '40px' : isForkJoin ? '10px' : isSimple ? '60px' : '60px',
        boxShadow: isStart || isEnd
          ? `0 4px 12px ${color}40`
          : isForkJoin
            ? '0 2px 4px rgba(0,0,0,0.3)'
            : (data.status === 'highlighted'
              ? `0 0 6px 1px ${color}15, 0 0 0 1px ${color}40`
              : (isDarkMode
                ? (isHovered ? `0 8px 24px rgba(0,0,0,0.4), inset 0 0 0 1px ${color}20` : `0 4px 12px rgba(0,0,0,0.2)`)
                : (isHovered ? `0 8px 24px ${color}15, inset 0 0 0 1px ${color}30` : `0 4px 12px ${color}10`))),
        transform: isDecision ? 'rotate(45deg)' : 'none',
        display: 'flex',
        flexDirection: isForkJoin ? (isFork ? 'column' : 'row') : 'column',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'visible',
        backdropFilter: (isAction || isDecision) ? 'blur(8px)' : 'none',
        opacity: isGhost ? 0 : (data.status === 'background' ? 0.35 : 1),
        pointerEvents: 'all',
        filter: data.isTruthSource
          ? (data.type === 'service' && data.serviceConfig?.isCron
            ? `drop-shadow(0 0 12px #4dabf7aa) drop-shadow(0 0 20px #4dabf740)`
            : `drop-shadow(0 0 12px #51cf66aa) drop-shadow(0 0 20px #51cf6640)`)
          : (data.status === 'highlighted' ? `drop-shadow(0 0 4px ${color}30)` : (data.status === 'background' ? 'grayscale(0.8) contrast(0.8)' : 'none')),
        cursor: selected ? 'move' : 'pointer',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onDoubleClick={handleDoubleClick}
    >
      {/* Inner end circle for activity-end */}
      {isEnd && (
        <div style={{
          width: '18px',
          height: '18px',
          borderRadius: '50%',
          backgroundColor: isDarkMode ? '#eee' : '#222',
        }} />
      )}
      <div style={{
        position: 'absolute',
        top: '-26px',
        right: '-10px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: '4px',
        zIndex: 100,
      }}>
        {/* Source of Truth Badge */}
        {data.isTruthSource && !isSimple && (
          <div style={{
            background: 'linear-gradient(135deg, #ffd700 0%, #51cf66 100%)',
            color: '#000',
            padding: '4px 12px',
            borderRadius: '24px',
            fontSize: '10px',
            fontWeight: '900',
            boxShadow: '0 0 15px rgba(81, 207, 102, 0.4), 0 4px 10px rgba(0,0,0,0.5)',
            whiteSpace: 'nowrap',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            border: '1.5px solid #fff',
            animation: 'truth-source-badge-pulse 2s infinite ease-in-out',
          }}>
            <ShieldCheck size={14} strokeWidth={3} />
            TRUTH SOURCE
          </div>
        )}

        {/* Dynamic Badges */}
        {!isSimple && data.badges?.map(badgeId => {
          if (badgeId === 'cron') {
            return (
              <div key="cron" style={{
                background: 'linear-gradient(135deg, #4dabf7 0%, #007bff 100%)',
                color: '#fff',
                padding: '4px 12px',
                borderRadius: '24px',
                fontSize: '10px',
                fontWeight: '900',
                boxShadow: '0 0 15px rgba(77, 171, 247, 0.4), 0 4px 10px rgba(0,0,0,0.5)',
                whiteSpace: 'nowrap',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                border: '1.5px solid #fff',
              }}>
                <Clock size={14} strokeWidth={3} />
                CRON
              </div>
            )
          }
          return null
        })}
      </div>


      {/* Генерируем точки подключения по всему периметру (кроме таблиц) */}
      {data.type !== 'table' && ([Position.Top, Position.Bottom, Position.Left, Position.Right] as Position[]).map((pos) =>
        [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map((p) => {
          const isHorizontal = pos === Position.Top || pos === Position.Bottom;
          const isCenter = p === 50;
          const targetId = `${pos}-target-${p}`;
          const sourceId = `${pos}-source-${p}`;

          const isTargetConnected = connectedHandleIds.includes(targetId);
          const isSourceConnected = connectedHandleIds.includes(sourceId);

          // ОПТИМИЗАЦИЯ: Всегда рендерим handle в DOM, чтобы ReactFlow мог их измерить,
          // но скрываем визуально и отключаем события, если они не нужны
          const isVisible = isGhost ? (isHovered || selected || isConnecting) : (isHovered || isConnecting || wasConnecting || isCenter || isTargetConnected || isSourceConnected || selected);

          const style: React.CSSProperties = {
            [isHorizontal ? 'left' : 'top']: `${p}%`,
            [pos]: '-5px',
            opacity: isVisible ? 1 : 0,
            borderRadius: '50%',
            width: isGhost ? '24px' : (isCenter ? '10px' : '6px'),
            height: isGhost ? '24px' : (isCenter ? '10px' : '6px'),
            background: isGhost ? (isHovered ? '#ff4040' : 'rgba(255, 64, 64, 0.4)') : '#1e1e1e',
            border: isGhost ? '2px solid white' : 'none',
            boxShadow: isGhost && isHovered ? '0 0 10px #ff4040' : 'none',
            cursor: 'crosshair',
            transform: isHorizontal ? 'translateX(-50%)' : 'translateY(-50%)',
            zIndex: isCenter || isGhost ? 30 : 25,
            transition: 'opacity 0.2s',
            visibility: 'visible',
            pointerEvents: 'all',
          };

          return (
            <React.Fragment key={`${pos}-${p}`}>
              <Handle
                type="target"
                position={pos}
                id={targetId}
                style={style}
                className={isGhost ? 'ghost-handle-pulse' : ''}
              />
              <Handle
                type="source"
                position={pos}
                id={sourceId}
                style={style}
                className={isGhost ? 'ghost-handle-pulse' : ''}
              />
            </React.Fragment>
          );
        })
      )}

      {/* BACKWARD COMPATIBILITY: Добавляем handles со старым форматом ID для существующих edges */}
      {data.type !== 'table' && ([Position.Top, Position.Bottom, Position.Left, Position.Right] as Position[]).map((pos) => {
        const oldTargetId = `${pos}-target`;
        const oldSourceId = `${pos}-source`;

        const isTargetConnected = connectedHandleIds.includes(oldTargetId);
        const isSourceConnected = connectedHandleIds.includes(oldSourceId);

        // Всегда рендерим для стабильности
        const isVisible = isGhost ? (isHovered || selected || isConnecting) : (isTargetConnected || isSourceConnected || (isHovered && isConnecting) || wasConnecting || selected);

        const isHorizontal = pos === Position.Top || pos === Position.Bottom;
        const style: React.CSSProperties = {
          width: '8px',
          height: '8px',
          cursor: 'crosshair',
          transform: isHorizontal ? 'translateX(-50%)' : 'translateY(-50%)',
          zIndex: 30,
          opacity: isVisible ? 1 : 0,
          transition: 'opacity 0.2s',
          visibility: 'visible',
          pointerEvents: 'all',
          background: isGhost ? (isHovered ? '#ff4040' : 'rgba(255, 64, 64, 0.4)') : '#1e1e1e',
          border: isGhost ? '2px solid white' : 'none',
        };

        return (
          <React.Fragment key={`legacy-${pos}`}>
            <Handle
              type="target"
              position={pos}
              id={oldTargetId}
              style={style}
              className={isGhost ? 'ghost-handle-pulse' : ''}
            />
            <Handle
              type="source"
              position={pos}
              id={oldSourceId}
              style={style}
              className={isGhost ? 'ghost-handle-pulse' : ''}
            />
          </React.Fragment>
        );
      })}

      {/* Expansion and Controls */}
      {!isSimple && (
        <div
          className="node-controls"
          style={{
            position: 'absolute',
            top: data.isExpanded ? '10px' : '-40px',
            right: data.isExpanded ? '40px' : '0',
            display: 'flex',
            gap: '5px',
            opacity: isGhost ? 0 : (isHovered || selected ? 1 : 0),
            transition: 'opacity 0.2s, top 0.2s',
            zIndex: 1000,
            backgroundColor: 'rgba(30, 30, 30, 0.9)',
            padding: '4px',
            borderRadius: '6px',
            border: `1px solid ${color}40`,
            boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
            pointerEvents: isGhost ? 'none' : 'all',
          }}
        >
          <button
            onClick={handleToggleExpand}
            style={{
              background: data.isExpanded ? `${color}40` : 'transparent',
              border: 'none',
              borderRadius: '4px',
              color: '#fff',
              padding: '4px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            title={data.isExpanded ? "Свернуть в компонент" : "Развернуть в контейнер"}
          >
            {data.isExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>

          {isGhost && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                const event = new CustomEvent('nodeDataUpdate', {
                  detail: {
                    nodeId: id,
                    data: {
                      ...data.originalData,
                      isGhost: false,
                      originalData: undefined
                    }
                  }
                });
                window.dispatchEvent(event);
              }}
              style={{
                background: '#40c057',
                border: 'none',
                borderRadius: '4px',
                color: '#fff',
                padding: '4px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              title="Восстановить компонент"
            >
              <RefreshCw size={16} />
            </button>
          )}
        </div>
      )}

      {!isSimple && !isGhost && (
        <NodeResizer
          color={color}
          isVisible={selected}
          minWidth={data.isExpanded ? 300 : (isActivity ? 40 : 120)}
          minHeight={data.isExpanded ? 200 : (isActivity ? 40 : 80)}
          onResize={(_event, { width, height }) => {
            const sizeEvent = new CustomEvent('nodeSizeUpdate', {
              detail: { nodeId: id, width, height }
            })
            window.dispatchEvent(sizeEvent)
          }}
          handleStyle={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: '#333',
            border: 'none',
            boxShadow: 'none',
          }}
        />
      )}

      {/* Background / Main Shape */}
      {data.type !== 'note' && (
        <div
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className={`custom-node-body ${data.type}`}
          style={{
            width: '100%',
            height: '100%',
            backgroundColor: (data.isExpanded || isDecision || isAction) ? 'transparent' : (isSimple ? 'transparent' : (isDarkMode ? 'rgba(30, 30, 30, 0.01)' : 'rgba(255, 255, 255, 0.02)')),
            backdropFilter: isDarkMode ? 'none' : 'blur(0.5px)',
            border: (isSimple || isStart || isEnd || isForkJoin || isDecision || isAction) ? 'none' : `1px solid ${statusColor}80`, // Thinner and more transparent
            borderRadius: data.isExpanded ? '12px' : (data.type === 'database' || data.type === 'data-warehouse' ? '12px 12px 12px 12px' : (isAction ? '20px' : '12px')),
            display: (isStart || isEnd || isForkJoin) ? 'none' : 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: (data.isExpanded || (nodeHeight > 140)) && !isDecision ? 'flex-start' : 'center',
            padding: (data.isExpanded || isDecision) ? '10px' : (isMedium ? '10px' : '20px'),
            boxShadow: selected && !isSimple ? `0 0 4px ${color}08` : 'none',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            position: 'relative',
            overflow: (isDecision || isStart || isEnd) ? 'visible' : 'hidden',
            minWidth: isGhost ? '0px' : (data.isExpanded ? '300px' : 'auto'),
            minHeight: isGhost ? '0px' : (data.isExpanded ? '200px' : 'auto'),
            opacity: isGhost ? 0 : 1,
            pointerEvents: data.isExpanded ? 'none' : (isGhost ? 'none' : 'all'), // Если развернут, пропускаем клики сквозь тело к связям
            transform: isDecision ? 'rotate(-45deg)' : 'none', // Counter-rotate content for decision
          }}
        >
          {data.isExpanded && (
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '40px',
                backgroundColor: `${color}15`,
                borderBottom: `1px solid ${color}30`,
                borderRadius: '10px 10px 0 0',
                display: 'flex',
                alignItems: 'center',
                padding: '0 15px',
                gap: '10px',
                pointerEvents: 'all', // Включаем взаимодействие для заголовка, чтобы можно было перетаскивать
                cursor: 'grab'
              }}
            >
              {React.cloneElement(icon as React.ReactElement, { size: 18, color: color })}
              <span style={{ fontSize: '12px', fontWeight: 'bold', color: contentColor, opacity: 0.8 }}>
                {label} (Контейнер)
              </span>
            </div>
          )}

          <div
            className="node-header-section"
            style={{
              display: 'flex',
              flexDirection: (nodeWidth > 220 && !data.isExpanded) ? 'row' : 'column',
              alignItems: (nodeWidth > 220 && !data.isExpanded) ? 'flex-start' : 'center',
              justifyContent: 'center',
              width: '100%',
              marginTop: data.isExpanded ? '40px' : ((nodeHeight > 140 && !isDecision) ? '10px' : '0'),
              gap: (nodeWidth > 220 && !data.isExpanded) ? '16px' : '0'
            }}
          >
            {/* Label and Subtitle Section */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: (nodeWidth > 220 && !data.isExpanded) ? 'flex-start' : 'center',
              flex: (nodeWidth > 220 && !data.isExpanded) ? '1' : 'none',
              width: (nodeWidth > 220 && !data.isExpanded) ? 'auto' : '100%',
              order: (nodeWidth > 220 && !data.isExpanded) ? -1 : 1,
              minWidth: 0,
            }}>
              {/* Label */}
              <div style={{ textAlign: (nodeWidth > 220 && !data.isExpanded) ? 'left' : 'center', width: '100%' }}>
                {isEditing && !isMedium ? (
                  <textarea
                    ref={inputRef}
                    value={label}
                    onChange={(e) => {
                      const newLabel = e.target.value;
                      setLabel(newLabel);
                      // Отправляем событие обновления метки немедленно
                      const event = new CustomEvent('nodeLabelUpdate', {
                        detail: { nodeId: id, label: newLabel },
                      });
                      window.dispatchEvent(event);
                    }}
                    onBlur={() => setIsEditing(false)}
                    onKeyDown={handleKeyDown}
                    style={{
                      background: 'transparent',
                      border: `1px solid ${color}`,
                      borderRadius: '4px',
                      padding: '2px 8px',
                      color: contentColor,
                      fontSize: isMedium ? '11px' : '14px',
                      fontWeight: '500',
                      textAlign: (nodeWidth > 220 && !data.isExpanded) ? 'left' : 'center',
                      outline: 'none',
                      width: '100%',
                      minHeight: '24px',
                      height: 'auto',
                      resize: 'none',
                      overflow: 'hidden',
                      fontFamily: 'inherit',
                    }}
                    autoFocus
                    rows={1}
                    onInput={(e) => {
                      // Auto-resize
                      const target = e.target as HTMLTextAreaElement;
                      target.style.height = 'auto';
                      target.style.height = `${target.scrollHeight}px`;
                    }}
                  />
                ) : (
                  <div
                    style={{
                      color: contentColor,
                      fontSize: isMedium ? '11px' : '14px',
                      fontWeight: '500',
                      letterSpacing: '-0.01em',
                      textShadow: isDarkMode ? '0 1px 2px rgba(0,0,0,0.3)' : '0 1px 0 rgba(255,255,255,0.8)',
                      fontFamily: '"SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                      wordBreak: isDecision ? 'break-all' : 'break-word',
                      overflowWrap: 'break-word',
                      whiteSpace: 'pre-wrap',
                      overflow: 'visible',
                      textOverflow: 'clip',
                      lineHeight: '1.2',
                      userSelect: 'text',
                      cursor: 'text',
                      maxWidth: isDecision ? '80%' : '100%',
                      margin: isDecision ? '0 auto' : '0',
                    }}
                    title={label}
                  >
                    {renderFormattedText(label)}
                  </div>
                )}
              </div>

              {/* Subtitle / Type badge - hide in Medium view */}
              {!isMedium && subtitle && !isActivity && (
                <div
                  style={{
                    fontSize: '11px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    color: isDarkMode ? `${color}b0` : `${color}`, // Muted text in dark mode (was ee)
                    backgroundColor: isDarkMode ? `${color}10` : `${color}15`, // Reduced background opacity
                    border: isDarkMode ? `1px solid ${color}20` : `1px solid ${color}30`,
                    padding: '2px 8px',
                    borderRadius: '10px',
                    fontWeight: '700',
                    marginTop: '4px',
                    display: 'inline-block'
                  }}
                >
                  {subtitle}
                </div>
              )}
            </div>



            {/* Icon container with gradient background - Fixed size to prevent stretching */}
            {!data.isExpanded && !isActivity && (
              <div
                style={{
                  width: isMedium ? '40px' : '56px',
                  height: isMedium ? '40px' : '56px',
                  borderRadius: '12px',
                  background: `${color}15`,
                  border: `1px solid ${color}30`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: color,
                  boxShadow: 'none',
                  position: 'relative',
                  flexShrink: 0,
                  order: (nodeWidth > 220 && !data.isExpanded) ? 1 : -1,
                  marginBottom: (nodeWidth > 220 && !data.isExpanded) ? '0' : (isMedium ? '4px' : '12px'),
                }}
              >
                {React.isValidElement(icon)
                  ? React.cloneElement(icon as React.ReactElement, { size: isMedium ? 24 : 28 })
                  : icon}

                {/* Status dot */}
                {data.status === 'new' && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '-2px',
                      right: '-2px',
                      width: '10px',
                      height: '10px',
                      borderRadius: '50%',
                      backgroundColor: '#ffd43b',
                      border: '2px solid #1e1e1e',
                      boxShadow: '0 0 5px #ffd43b',
                    }}
                    title="Новый компонент"
                  />
                )}
              </div>
            )}
          </div>

          {/* Tracking Inputs List - Full Width below Header */}
          {data.type === 'tracking' && !isMedium && (
            <div className="tracking-list" style={{
              marginTop: '8px',
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
              flex: 1,
              minHeight: 0,
              overflowY: 'auto',
              // @ts-ignore
              scrollbarWidth: 'none', // Firefox
              msOverflowStyle: 'none', // IE/Edge
            }}>
              <style>{`
                  .tracking-list::-webkit-scrollbar {
                    display: none;
                  }
                `}</style>
              {(data.trackingConfig?.items || []).map((item) => (
                <div key={item.id} style={{ display: 'flex', flexDirection: 'row', gap: '4px', alignItems: 'center' }}>
                  <input
                    placeholder="Активность"
                    value={item.activity}
                    onChange={(e) => handleTrackingItemUpdate(item.id, 'activity', e.target.value)}
                    style={{
                      background: listBackgroundColor,
                      border: `1px solid ${color}30`,
                      borderRadius: '4px',
                      color: contentColor,
                      padding: '4px',
                      fontSize: '16px',
                      fontWeight: 'bold',
                      flex: 1,
                      minWidth: '50px'
                    }}
                    onMouseDown={(e) => e.stopPropagation()}
                  />
                  <input
                    placeholder="ITMD"
                    value={item.time}
                    onChange={(e) => handleTrackingItemUpdate(item.id, 'time', e.target.value)}
                    style={{
                      background: listBackgroundColor,
                      border: `1px solid ${color}30`,
                      borderRadius: '4px',
                      color: contentColor,
                      padding: '4px',
                      fontSize: '16px',
                      fontWeight: 'bold',
                      width: '40px',
                      textAlign: 'center'
                    }}
                    onMouseDown={(e) => e.stopPropagation()}
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteTrackingItem(item.id);
                    }}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#ff6b6b',
                      cursor: 'pointer',
                      padding: '0 2px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                    title="Удалить"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleAddTrackingItem();
                }}
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px dashed rgba(255, 255, 255, 0.2)',
                  borderRadius: '4px',
                  color: '#ccc',
                  cursor: 'pointer',
                  padding: '2px',
                  fontSize: '10px',
                  width: '100%',
                  marginTop: '2px'
                }}
              >
                + Добавить активность
              </button>
            </div>
          )}

          {/* Metadata / Config Section - Always full width and below header */}
          {!isMedium && (
            <div
              style={{
                marginTop: '8px',
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
                flex: 1,
                minHeight: 0,
              }}
            >
              {/* Database tables / Repository info */}
              {(data.type === 'repository' || (data.type === 'database' && (data.databaseConfig?.tables?.length || 0) > 0)) && (
                <div style={{ fontSize: '11px', color: '#888' }}>
                  {data.databaseConfig?.tables?.length || 0} таблиц(ы)
                </div>
              )}

              {data.type === 'table' && data.tableConfig?.columns && (
                <div
                  style={{
                    marginTop: '12px',
                    paddingTop: '12px',
                    borderTop: '1px solid #333',
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                    flex: 1,
                    minHeight: 0,
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '2px',
                      overflowY: 'auto',
                      overflowX: 'hidden',
                      flex: 1,
                      minHeight: 0,
                      paddingLeft: '24px',
                      paddingRight: '24px',
                    }}
                  >
                    {data.tableConfig.columns.map((column, index) => (
                      <div
                        key={index}
                        style={{
                          fontSize: '10px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '4px 6px',
                          backgroundColor: listBackgroundColor,
                          borderRadius: '4px',
                          marginBottom: '2px',
                          border: `1px solid ${color}20`,
                          position: 'relative',
                        }}
                      >
                        {/* Handles for field-to-field connections */}
                        {/* Handles for field-to-field connections */}
                        {/* Handles for field-to-field connections - Universal 'Source' Handles for maximum reliability */}
                        {/* Left Handle */}
                        <Handle
                          type="source"
                          position={Position.Left}
                          id={`col-${index}-left`}
                          className="nodrag"
                          style={{
                            left: isMedium ? '-14px' : '-24px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            opacity: isHovered || isGlobalConnecting || wasConnecting || selected || connectedHandleIds.some(id => id && id.includes(`col-${index}-left`)) ? 1 : 0.3,
                            pointerEvents: 'all',
                            transition: 'all 0.2s',
                            width: '12px',
                            height: '12px',
                            borderRadius: '50%',
                            background: connectedHandleIds.some(id => id && id.includes(`col-${index}-left`)) ? '#4dabf7' : '#1e1e1e',
                            border: `2px solid ${color}`,
                            zIndex: 100
                          }}
                        />

                        {/* Right Handle */}
                        <Handle
                          type="source"
                          position={Position.Right}
                          id={`col-${index}-right`}
                          className="nodrag"
                          style={{
                            right: isMedium ? '-14px' : '-24px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            opacity: isHovered || isGlobalConnecting || wasConnecting || selected || connectedHandleIds.some(id => id && id.includes(`col-${index}-right`)) ? 1 : 0.3,
                            pointerEvents: 'all',
                            transition: 'all 0.2s',
                            width: '12px',
                            height: '12px',
                            borderRadius: '50%',
                            background: connectedHandleIds.some(id => id && id.includes(`col-${index}-right`)) ? '#4dabf7' : '#1e1e1e',
                            border: `2px solid ${color}`,
                            zIndex: 100
                          }}
                        />

                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1, minWidth: 0 }}>
                          {column.primaryKey && <Key size={10} style={{ color: '#ffd43b', flexShrink: 0 }} />}
                          {column.foreignKey && <Link2 size={10} style={{ color: '#4dabf7', flexShrink: 0 }} />}
                          <span
                            style={{
                              color: contentColor,
                              fontWeight: '500',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}
                            title={column.name}
                          >
                            {column.name}
                          </span>
                        </div>
                        <span style={{ color: '#888', fontSize: '9px', flexShrink: 0, marginLeft: '4px' }}>{column.type}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Class methods list */}
              {data.type === 'class' && data.classConfig?.methods && data.classConfig.methods.length > 0 && (
                <div
                  style={{
                    marginTop: '12px',
                    paddingTop: '12px',
                    borderTop: '1px solid #333',
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                  }}
                >
                  <div style={{ fontSize: '10px', color: color, fontWeight: '600', marginBottom: '4px' }}>
                    Методы:
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px',
                      maxHeight: '120px',
                      overflowY: 'auto',
                      overflowX: 'hidden',
                    }}
                  >
                    {data.classConfig.methods.slice(0, 5).map((method, index) => (
                      <div
                        key={index}
                        style={{
                          fontSize: '10px',
                          color: mutedContentColor,
                          textAlign: 'left',
                          padding: '4px 8px',
                          backgroundColor: listBackgroundColor,
                          borderRadius: '4px',
                          border: `1px solid ${color}20`,
                          wordBreak: 'break-word',
                        }}
                      >
                        <span style={{ color: color, fontWeight: '600' }}>
                          {method.visibility || 'public'}
                        </span>
                        {' '}
                        <span style={{ color: method.returnType ? '#4dabf7' : '#888' }}>
                          {method.returnType || 'void'}
                        </span>
                        {' '}
                        <span style={{ color: contentColor, fontWeight: '500' }}>
                          {method.name || `метод${index + 1}`}
                        </span>
                      </div>
                    ))}
                    {data.classConfig.methods.length > 5 && (
                      <div style={{ fontSize: '10px', color: color, textAlign: 'center', fontStyle: 'italic' }}>
                        +{data.classConfig.methods.length - 5} еще...
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Comment bubble */}
              {data.comment && (
                <div
                  style={{
                    fontSize: '11px',
                    color: '#888',
                    marginTop: '8px',
                    padding: '8px',
                    backgroundColor: 'rgba(0,0,0,0.3)',
                    borderRadius: '8px',
                    borderLeft: `2px solid ${color}`,
                    fontStyle: 'italic',
                  }}
                >
                  {data.comment}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {isSimple && (
        <div style={{ color: '#fff' }}>
          {React.cloneElement(icon as React.ReactElement, { size: 32 })}
        </div>
      )}
    </div>
  )
}

export default React.memo(CustomNode, (prevProps, nextProps) => {
  return (
    prevProps.id === nextProps.id &&
    prevProps.selected === nextProps.selected &&
    prevProps.data?.label === nextProps.data?.label &&
    prevProps.data?.type === nextProps.data?.type &&
    prevProps.data?.status === nextProps.data?.status &&
    prevProps.data?.isExpanded === nextProps.data?.isExpanded &&
    prevProps.data?.customColor === nextProps.data?.customColor &&
    JSON.stringify(prevProps.data) === JSON.stringify(nextProps.data)
  )
})
