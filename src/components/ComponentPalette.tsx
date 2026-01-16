import React, { useState, useRef, useEffect } from 'react'
import { ComponentType } from '../types'
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
  Layers,
  GitBranch,
  Github,
  User,
  ExternalLink,
  Building2,
  Settings,
  Archive,
  Code,
  Search,
  Activity,
  FileText,
  ChevronDown,
  ChevronUp,
  X,
  BarChart3,
  Clock,
  Key,
  FileCode,
  Cpu,
  Wifi,
  Mail,
  MessageCircle,
  Link as LinkIcon,
  Package,
  Brain,
  Bot,
  Workflow,
  Sparkles,
  Lightbulb,
  Users,
  UserSearch,
  UserCog,
  Type,
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
} from 'lucide-react'

interface ComponentPaletteProps {
  onComponentClick: (type: ComponentType) => void
  onRecommendationClick?: () => void
}

type ComponentCategory = 'all' | 'infrastructure' | 'data' | 'security' | 'development' | 'monitoring' | 'integration' | 'communication' | 'text' | 'ai' | 'roles' | 'management' | 'misc'

interface Component {
  type: ComponentType
  label: string
  icon: React.ReactNode
  color: string
  category: ComponentCategory
}

const components: Component[] = [
  // Инфраструктура
  { type: 'server', label: 'Сервер', icon: <Server size={24} />, color: '#339af0', category: 'infrastructure' },
  { type: 'container', label: 'Контейнер', icon: <Package size={24} />, color: '#51cf66', category: 'infrastructure' },
  { type: 'orchestrator', label: 'Оркестратор', icon: <Layers size={24} />, color: '#20c997', category: 'infrastructure' },
  { type: 'web-server', label: 'Веб-сервер', icon: <Globe size={24} />, color: '#51cf66', category: 'infrastructure' },
  { type: 'load-balancer', label: 'Балансировщик', icon: <Loader size={24} />, color: '#4dabf7', category: 'infrastructure' },
  { type: 'service-discovery', label: 'Обнаружение сервисов', icon: <Search size={24} />, color: '#4dabf7', category: 'infrastructure' },
  { type: 'cdn', label: 'CDN', icon: <Cloud size={24} />, color: '#51cf66', category: 'infrastructure' },
  { type: 'service-mesh', label: 'Сервисная сеть', icon: <Network size={24} />, color: '#9c88ff', category: 'infrastructure' },
  { type: 'configuration-management', label: 'Управление конфигурацией', icon: <Settings size={24} />, color: '#ffa94d', category: 'infrastructure' },
  { type: 'backup-service', label: 'Резервное копирование', icon: <HardDrive size={24} />, color: '#666', category: 'infrastructure' },
  { type: 'proxy', label: 'Прокси', icon: <Server size={24} />, color: '#666', category: 'infrastructure' },
  { type: 'dns-service', label: 'DNS сервис', icon: <Globe size={24} />, color: '#51cf66', category: 'infrastructure' },
  { type: 'edge-computing', label: 'Граничные вычисления', icon: <Cpu size={24} />, color: '#ffa94d', category: 'infrastructure' },
  { type: 'iot-gateway', label: 'IoT шлюз', icon: <Wifi size={24} />, color: '#4dabf7', category: 'infrastructure' },

  // Данные
  { type: 'database', label: 'База данных', icon: <Database size={24} />, color: '#51cf66', category: 'data' },
  { type: 'data-warehouse', label: 'Хранилище данных', icon: <Warehouse size={24} />, color: '#20c997', category: 'data' },
  { type: 'cache', label: 'Кэш', icon: <HardDrive size={24} />, color: '#845ef7', category: 'data' },
  { type: 'object-storage', label: 'Объектное хранилище', icon: <Box size={24} />, color: '#fd7e14', category: 'data' },
  { type: 'graph-database', label: 'Графовая БД', icon: <Network size={24} />, color: '#51cf66', category: 'data' },
  { type: 'time-series-database', label: 'Временные ряды', icon: <Clock size={24} />, color: '#845ef7', category: 'data' },
  { type: 'data-lake', label: 'Data Lake', icon: <Warehouse size={24} />, color: '#51cf66', category: 'data' },
  { type: 'search-engine', label: 'Поисковая система', icon: <Search size={24} />, color: '#20c997', category: 'data' },
  { type: 'table', label: 'Таблица БД', icon: <Database size={24} />, color: '#5C7CFA', category: 'data' },

  // Безопасность
  { type: 'firewall', label: 'Межсетевой экран', icon: <Shield size={24} />, color: '#dc3545', category: 'security' },
  { type: 'auth-service', label: 'Сервис аутентификации', icon: <Lock size={24} />, color: '#ff6b6b', category: 'security' },
  { type: 'identity-provider', label: 'Провайдер идентичности', icon: <Key size={24} />, color: '#ff6b6b', category: 'security' },
  { type: 'secret-management', label: 'Управление секретами', icon: <Lock size={24} />, color: '#dc3545', category: 'security' },
  { type: 'vpn-gateway', label: 'VPN шлюз', icon: <Shield size={24} />, color: '#dc3545', category: 'security' },

  // Разработка
  { type: 'service', label: 'Сервис', icon: <Server size={24} />, color: '#4dabf7', category: 'development' },
  { type: 'frontend', label: 'Клиентское приложение', icon: <Globe size={24} />, color: '#339af0', category: 'development' },
  { type: 'lambda', label: 'Бессерверная функция', icon: <Zap size={24} />, color: '#ffd43b', category: 'development' },
  { type: 'controller', label: 'Контроллер', icon: <Settings size={24} />, color: '#4dabf7', category: 'development' },
  { type: 'repository', label: 'Репозиторий', icon: <Archive size={24} />, color: '#51cf66', category: 'development' },
  { type: 'vcs', label: 'GitHub / GitLab', icon: <Github size={24} />, color: '#fff', category: 'development' },
  { type: 'ci-cd-pipeline', label: 'CI/CD пайплайн', icon: <GitBranch size={24} />, color: '#20c997', category: 'development' },
  { type: 'class', label: 'Класс', icon: <Code size={24} />, color: '#845ef7', category: 'development' },
  { type: 'batch-processor', label: 'Пакетный обработчик', icon: <Cpu size={24} />, color: '#845ef7', category: 'development' },
  { type: 'etl-service', label: 'ETL сервис', icon: <Database size={24} />, color: '#20c997', category: 'development' },
  { type: 'blockchain', label: 'Блокчейн', icon: <LinkIcon size={24} />, color: '#333', category: 'development' },

  // Мониторинг
  { type: 'monitoring', label: 'Мониторинг', icon: <Activity size={24} />, color: '#ff6b6b', category: 'monitoring' },
  { type: 'logging', label: 'Логирование', icon: <FileText size={24} />, color: '#ffa94d', category: 'monitoring' },
  { type: 'analytics-service', label: 'Аналитика', icon: <BarChart3 size={24} />, color: '#339af0', category: 'monitoring' },
  { type: 'business-intelligence', label: 'Business Intelligence', icon: <BarChart3 size={24} />, color: '#4dabf7', category: 'monitoring' },

  // Интеграция
  { type: 'api-gateway', label: 'API Gateway', icon: <Network size={24} />, color: '#ff6b6b', category: 'integration' },
  { type: 'message-broker', label: 'Брокер сообщений', icon: <MessageSquare size={24} />, color: '#ffd43b', category: 'integration' },
  { type: 'esb', label: 'ESB (Корпоративная сервисная шина)', icon: <GitBranch size={24} />, color: '#9c88ff', category: 'integration' },
  { type: 'queue', label: 'Очередь', icon: <MessageSquare size={24} />, color: '#ffd43b', category: 'integration' },
  { type: 'event-bus', label: 'Шина событий', icon: <Layers size={24} />, color: '#845ef7', category: 'integration' },
  { type: 'stream-processor', label: 'Потоковый обработчик', icon: <Zap size={24} />, color: '#4dabf7', category: 'integration' },
  { type: 'integration-platform', label: 'Платформа интеграций', icon: <GitBranch size={24} />, color: '#9c88ff', category: 'integration' },
  { type: 'api-client', label: 'API клиент', icon: <LinkIcon size={24} />, color: '#4dabf7', category: 'integration' },
  { type: 'api-documentation', label: 'Документация API', icon: <FileCode size={24} />, color: '#339af0', category: 'integration' },

  // Организация
  { type: 'system', label: 'Система', icon: <Layers size={24} />, color: '#4dabf7', category: 'infrastructure' },
  { type: 'system-component', label: 'Система (компонент)', icon: <Box size={24} />, color: '#4dabf7', category: 'infrastructure' },
  { type: 'business-domain', label: 'Бизнес-домен', icon: <Building2 size={24} />, color: '#ffa94d', category: 'infrastructure' },
  { type: 'group', label: 'Группа', icon: <Layers size={24} />, color: '#845ef7', category: 'infrastructure' },
  { type: 'client', label: 'Клиент', icon: <User size={24} />, color: '#ff8787', category: 'infrastructure' },
  { type: 'external-system', label: 'Внешняя система', icon: <ExternalLink size={24} />, color: '#ffa94d', category: 'integration' },

  // Коммуникации
  { type: 'notification-service', label: 'Сервис уведомлений', icon: <MessageCircle size={24} />, color: '#ffd43b', category: 'communication' },
  { type: 'email-service', label: 'Email сервис', icon: <Mail size={24} />, color: '#339af0', category: 'communication' },
  { type: 'sms-gateway', label: 'SMS шлюз', icon: <MessageCircle size={24} />, color: '#4dabf7', category: 'communication' },

  // Текст и аннотации
  { type: 'note', label: 'Заметка', icon: <FileText size={24} />, color: '#ffd666', category: 'text' },
  { type: 'text', label: 'Текст', icon: <Type size={24} />, color: '#666', category: 'text' },

  // AI / ML
  { type: 'llm-model', label: 'LLM модель', icon: <Brain size={24} />, color: '#ae3ec9', category: 'ai' },
  { type: 'vector-database', label: 'Векторная БД', icon: <Database size={24} />, color: '#748ffc', category: 'ai' },
  { type: 'ai-agent', label: 'AI Агент', icon: <Bot size={24} />, color: '#f03e3e', category: 'ai' },
  { type: 'ml-training', label: 'Обучение моделей', icon: <Activity size={24} />, color: '#fcc419', category: 'ai' },
  { type: 'ml-inference', label: 'Инференс', icon: <Cpu size={24} />, color: '#37b24d', category: 'ai' },
  { type: 'ml-data-pipeline', label: 'ML Дата-пайплайн', icon: <Workflow size={24} />, color: '#4dabf7', category: 'ai' },
  { type: 'ml-ai-service', label: 'ML/AI сервис', icon: <Sparkles size={24} />, color: '#fab005', category: 'ai' },
  { type: 'gpu-cluster', label: 'GPU кластер', icon: <Server size={24} />, color: '#228be6', category: 'ai' },
  // Роли и Команды
  { type: 'analyst', label: 'Системный аналитик', icon: <UserSearch size={24} />, color: '#4dabf7', category: 'roles' },
  { type: 'devops', label: 'Девопс инженер', icon: <UserCog size={24} />, color: '#20c997', category: 'roles' },
  {
    type: 'developer', label: 'Разработчик', icon: (
      <div style={{ position: 'relative', width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <User size={24} />
        <Code size={12} style={{ position: 'absolute', bottom: -1, right: -1, background: 'rgba(0,0,0,0.6)', borderRadius: '3px', padding: '1px' }} />
      </div>
    ), color: '#339af0', category: 'roles'
  },
  { type: 'team', label: 'Команда', icon: <Users size={24} />, color: '#845ef7', category: 'roles' },

  // Новые компоненты (Group 1 - Infra/Resilience)
  { type: 'rate-limiter', label: 'Rate Limiter', icon: <Gauge size={24} />, color: '#fa5252', category: 'infrastructure' },
  { type: 'circuit-breaker', label: 'Circuit Breaker', icon: <ToggleLeft size={24} />, color: '#fa5252', category: 'infrastructure' },
  { type: 'scheduler', label: 'Scheduler / Cron', icon: <CalendarClock size={24} />, color: '#4dabf7', category: 'infrastructure' },
  { type: 'feature-flag', label: 'Feature Flag', icon: <Flag size={24} />, color: '#fd7e14', category: 'development' },
  { type: 'secrets-vault', label: 'Secrets Vault', icon: <KeyRound size={24} />, color: '#e03131', category: 'security' },
  { type: 'config-service', label: 'Config Service', icon: <Settings2 size={24} />, color: '#fab005', category: 'infrastructure' },
  { type: 'gateway-cache', label: 'Gateway Cache', icon: <DatabaseZap size={24} />, color: '#845ef7', category: 'infrastructure' },
  { type: 'waf', label: 'WAF', icon: <ShieldAlert size={24} />, color: '#e03131', category: 'security' },
  { type: 'zero-trust', label: 'Zero Trust Gateway', icon: <ShieldCheck size={24} />, color: '#0ca678', category: 'security' },
  { type: 'edge-cache', label: 'Edge Cache', icon: <Globe2 size={24} />, color: '#3bc9db', category: 'infrastructure' },

  // Новые компоненты (Group 2 - Data)
  { type: 'data-replication', label: 'Data Replication', icon: <Copy size={24} />, color: '#51cf66', category: 'data' },
  { type: 'data-migration', label: 'Data Migration', icon: <ArrowRight size={24} />, color: '#69db7c', category: 'data' },
  { type: 'schema-registry', label: 'Schema Registry', icon: <FileJson size={24} />, color: '#38d9a9', category: 'data' },
  { type: 'cdc', label: 'CDC', icon: <RefreshCcw size={24} />, color: '#20c997', category: 'data' },
  { type: 'data-governance', label: 'Data Governance', icon: <Scale size={24} />, color: '#099268', category: 'data' },
  { type: 'data-quality', label: 'Data Quality', icon: <CheckCircle2 size={24} />, color: '#38d9a9', category: 'data' },
  { type: 'feature-store', label: 'Feature Store', icon: <DatabaseZap size={24} />, color: '#ae3ec9', category: 'data' },

  // Новые компоненты (Group 3 - Security)
  { type: 'iam', label: 'IAM', icon: <UserCheck size={24} />, color: '#f03e3e', category: 'security' },
  { type: 'policy-engine', label: 'Policy Engine', icon: <ScrollText size={24} />, color: '#d6336c', category: 'security' },
  { type: 'token-service', label: 'Token Service', icon: <KeyRound size={24} />, color: '#f06595', category: 'security' },
  { type: 'kms', label: 'KMS', icon: <KeyRound size={24} />, color: '#e03131', category: 'security' },
  { type: 'audit-log', label: 'Audit Log', icon: <ClipboardList size={24} />, color: '#868e96', category: 'security' },
  { type: 'fraud-detection', label: 'Fraud Detection', icon: <EyeOff size={24} />, color: '#c92a2a', category: 'security' },
  { type: 'dlp', label: 'DLP', icon: <FileLock size={24} />, color: '#fa5252', category: 'security' },

  // Новые компоненты (Group 4 - Development)
  { type: 'bff', label: 'BFF', icon: <LayoutTemplate size={24} />, color: '#22b8cf', category: 'development' },
  { type: 'facade', label: 'Facade Service', icon: <AppWindow size={24} />, color: '#15aabf', category: 'development' },
  { type: 'saga', label: 'Saga Orchestrator', icon: <RefreshCw size={24} />, color: '#ae3ec9', category: 'development' },
  { type: 'workflow-engine', label: 'Workflow Engine', icon: <Workflow size={24} />, color: '#be4bdb', category: 'development' },
  { type: 'rules-engine', label: 'Rules Engine', icon: <ListChecks size={24} />, color: '#7950f2', category: 'development' },
  { type: 'service-template', label: 'Service Template', icon: <FileCode2 size={24} />, color: '#748ffc', category: 'development' },
  { type: 'sdk', label: 'SDK / Library', icon: <Package size={24} />, color: '#4c6ef5', category: 'development' },

  // Новые компоненты (Group 5 - Monitoring)
  { type: 'alert-manager', label: 'Alert Manager', icon: <BellRing size={24} />, color: '#e03131', category: 'monitoring' },
  { type: 'tracing', label: 'Tracing', icon: <Activity size={24} />, color: '#f03e3e', category: 'monitoring' },
  { type: 'slo-manager', label: 'SLO / SLA Manager', icon: <Percent size={24} />, color: '#fa5252', category: 'monitoring' },
  { type: 'chaos-testing', label: 'Chaos Testing', icon: <Bomb size={24} />, color: '#000', category: 'monitoring' },
  { type: 'cost-monitoring', label: 'Cost Monitoring', icon: <DollarSign size={24} />, color: '#12b886', category: 'monitoring' },

  // Новые компоненты (Group 6 - Integration)
  { type: 'webhook', label: 'Webhook Service', icon: <Webhook size={24} />, color: '#be4bdb', category: 'integration' },
  { type: 'contract-testing', label: 'Contract Testing', icon: <Handshake size={24} />, color: '#7950f2', category: 'integration' },
  { type: 'partner-gateway', label: 'Partner Gateway', icon: <Users size={24} />, color: '#4c6ef5', category: 'integration' },
  { type: 'etl-orchestrator', label: 'ETL Orchestrator', icon: <Workflow size={24} />, color: '#22b8cf', category: 'integration' },
  { type: 'ipaas', label: 'iPaaS', icon: <CloudLightning size={24} />, color: '#1098ad', category: 'integration' },

  // Новые компоненты (Group 7 - AI)
  { type: 'prompt-store', label: 'Prompt Store', icon: <MessageSquarePlus size={24} />, color: '#cc5de8', category: 'ai' },
  { type: 'prompt-router', label: 'Prompt Router', icon: <Signpost size={24} />, color: '#b197fc', category: 'ai' },
  { type: 'model-registry', label: 'Model Registry', icon: <Archive size={24} />, color: '#845ef7', category: 'ai' },
  { type: 'explainability', label: 'Explainability Service', icon: <HelpCircle size={24} />, color: '#5c7cfa', category: 'ai' },
  { type: 'feedback-loop', label: 'Feedback Loop', icon: <RefreshCw size={24} />, color: '#339af0', category: 'ai' },
  { type: 'ab-testing', label: 'A/B Testing (AI)', icon: <Split size={24} />, color: '#228be6', category: 'ai' },

  // Новые компоненты (Group 8 - Management)
  { type: 'adr', label: 'ADR', icon: <FileText size={24} />, color: '#868e96', category: 'management' },
  { type: 'capability-map', label: 'Capability Map', icon: <Map size={24} />, color: '#1098ad', category: 'management' },
  { type: 'risk-register', label: 'Risk Register', icon: <AlertTriangle size={24} />, color: '#fa5252', category: 'management' },
  { type: 'compliance', label: 'Compliance Service', icon: <BadgeCheck size={24} />, color: '#087f5b', category: 'management' },

  // Разное
  { type: 'tracking', label: 'Трекинг', icon: <Clock size={24} />, color: '#ffd43b', category: 'misc' },
]

const categoryLabels: Record<ComponentCategory, string> = {
  all: 'Все',
  infrastructure: 'Инфраструктура',
  data: 'Данные',
  security: 'Безопасность',
  development: 'Разработка',
  monitoring: 'Мониторинг',
  integration: 'Интеграция',
  communication: 'Коммуникации',
  text: 'Текст',
  ai: 'AI / ML',
  roles: 'Команда и Роли',
  management: 'Управление архитектурой',
  misc: 'Разное',
}

export default function ComponentPalette({ onComponentClick, onRecommendationClick }: ComponentPaletteProps) {
  const [position, setPosition] = useState({ x: 20, y: 20 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<ComponentCategory>('all')
  const paletteRef = useRef<HTMLDivElement>(null)

  // Фильтрация компонентов
  const filteredComponents = components.filter(component => {
    const matchesSearch = searchQuery === '' ||
      component.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      component.type.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || component.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  // Загружаем позицию и состояние сворачивания из localStorage
  useEffect(() => {
    const savedPosition = localStorage.getItem('component-palette-position')
    if (savedPosition) {
      try {
        const parsed = JSON.parse(savedPosition)
        setPosition(parsed)
      } catch (e) {
        // Игнорируем ошибки
      }
    }

    const savedCollapsed = localStorage.getItem('component-palette-collapsed')
    if (savedCollapsed) {
      try {
        setIsCollapsed(JSON.parse(savedCollapsed))
      } catch (e) {
        // Игнорируем ошибки
      }
    }
  }, [])

  // Сохраняем позицию и состояние сворачивания в localStorage
  useEffect(() => {
    localStorage.setItem('component-palette-position', JSON.stringify(position))
  }, [position])

  useEffect(() => {
    localStorage.setItem('component-palette-collapsed', JSON.stringify(isCollapsed))
  }, [isCollapsed])

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed)
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    if (paletteRef.current) {
      const rect = paletteRef.current.getBoundingClientRect()
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      })
      setIsDragging(true)
    }
  }

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        setPosition({
          x: e.clientX - dragOffset.x,
          y: e.clientY - dragOffset.y,
        })
      }
    }

    const handleMouseUp = () => {
      setIsDragging(false)
    }

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging, dragOffset])

  const handleDragStart = (e: React.DragEvent, type: ComponentType) => {
    e.dataTransfer.setData('application/reactflow', type)
    e.dataTransfer.setData('text/plain', type)
    e.dataTransfer.effectAllowed = 'move'
  }

  return (
    <div
      ref={paletteRef}
      style={{
        position: 'absolute',
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: '520px',
        backgroundColor: '#1e1e1e',
        border: '2px solid #444',
        borderRadius: '12px',
        padding: isCollapsed ? '12px 16px' : '16px',
        boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
        zIndex: 10,
        maxHeight: isCollapsed ? 'auto' : 'calc(100vh - 40px)',
        overflowY: isCollapsed ? 'visible' : 'auto',
        cursor: isDragging ? 'grabbing' : 'default',
        transition: 'padding 0.3s ease',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: isCollapsed ? '0' : '12px',
          paddingBottom: isCollapsed ? '0' : '10px',
          borderBottom: isCollapsed ? 'none' : '2px solid #444',
        }}
      >
        <h2
          onMouseDown={handleMouseDown}
          style={{
            fontSize: '16px',
            fontWeight: 'bold',
            color: '#fff',
            cursor: 'grab',
            userSelect: 'none',
            margin: 0,
            flex: 1,
          }}
          onMouseEnter={(e) => {
            if (!isDragging) {
              e.currentTarget.style.cursor = 'grab'
            }
          }}
          onMouseLeave={(e) => {
            if (!isDragging) {
              e.currentTarget.style.cursor = 'default'
            }
          }}
        >
          {isDragging ? '🖐 Перетаскивание...' : '☰ Компоненты'}
        </h2>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={onRecommendationClick}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#fff',
              cursor: 'pointer',
              padding: '4px 8px',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background-color 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#333'
              e.currentTarget.style.color = '#ffd43b'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent'
              e.currentTarget.style.color = '#fff'
            }}
            title="Ассистент по выбору технологий"
          >
            <Lightbulb size={20} />
          </button>
          <button
            onClick={toggleCollapse}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#fff',
              cursor: 'pointer',
              padding: '4px 8px',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background-color 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#333'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent'
            }}
            title={isCollapsed ? 'Развернуть' : 'Свернуть'}
          >
            {isCollapsed ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
          </button>
        </div>
      </div>
      {!isCollapsed && (
        <>
          {/* Поиск */}
          <div style={{ marginBottom: '12px', position: 'relative' }}>
            <Search
              size={16}
              style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#888',
                pointerEvents: 'none',
              }}
            />
            <input
              type="text"
              placeholder="Поиск компонентов..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px 8px 36px',
                backgroundColor: '#1e1e1e',
                border: '1px solid #555',
                borderRadius: '6px',
                color: '#fff',
                fontSize: '14px',
                outline: 'none',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#4dabf7'
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#555'
              }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                style={{
                  position: 'absolute',
                  right: '8px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'transparent',
                  border: 'none',
                  color: '#888',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#fff'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#888'
                }}
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Категории */}
          <div style={{ marginBottom: '12px', display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
            {(Object.keys(categoryLabels) as ComponentCategory[]).map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                style={{
                  padding: '6px 12px',
                  backgroundColor: selectedCategory === category ? '#4dabf7' : '#2d2d2d',
                  color: '#fff',
                  border: `1px solid ${selectedCategory === category ? '#4dabf7' : '#555'}`,
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: selectedCategory === category ? '600' : '400',
                  transition: 'all 0.2s',
                  whiteSpace: 'nowrap',
                }}
                onMouseEnter={(e) => {
                  if (selectedCategory !== category) {
                    e.currentTarget.style.backgroundColor = '#333'
                    e.currentTarget.style.borderColor = '#666'
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedCategory !== category) {
                    e.currentTarget.style.backgroundColor = '#2d2d2d'
                    e.currentTarget.style.borderColor = '#555'
                  }
                }}
              >
                {categoryLabels[category]}
              </button>
            ))}
          </div>

          {/* Список компонентов */}
          {filteredComponents.length === 0 ? (
            <div style={{
              padding: '20px',
              textAlign: 'center',
              color: '#888',
              fontSize: '14px'
            }}>
              Компоненты не найдены
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(5, 1fr)',
                gap: '8px',
              }}
            >
              {filteredComponents.map((component) => (
                <div
                  key={component.type}
                  draggable
                  onDragStart={(e) => handleDragStart(e, component.type)}
                  onClick={() => onComponentClick(component.type)}
                  style={{
                    padding: '8px',
                    backgroundColor: '#2d2d2d',
                    border: `2px solid ${component.color}40`,
                    borderRadius: '8px',
                    cursor: 'grab',
                    transition: 'all 0.2s',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '4px',
                    textAlign: 'center',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = component.color
                    e.currentTarget.style.backgroundColor = '#333'
                    e.currentTarget.style.transform = 'translateY(-2px)'
                    e.currentTarget.style.boxShadow = `0 4px 12px ${component.color}30`
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = `${component.color}40`
                    e.currentTarget.style.backgroundColor = '#2d2d2d'
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                  onMouseDown={(e) => {
                    e.currentTarget.style.cursor = 'grabbing'
                  }}
                  onMouseUp={(e) => {
                    e.currentTarget.style.cursor = 'grab'
                  }}
                >
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '6px',
                      background: `linear-gradient(135deg, ${component.color}20, ${component.color}10)`,
                      border: `2px solid ${component.color}40`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: component.color,
                      marginBottom: '2px',
                    }}
                  >
                    {React.cloneElement(component.icon as React.ReactElement, { size: 18 })}
                  </div>
                  <span
                    style={{
                      fontSize: '10px',
                      fontWeight: '500',
                      color: '#fff',
                      lineHeight: '1.1',
                    }}
                  >
                    {component.label}
                  </span>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
