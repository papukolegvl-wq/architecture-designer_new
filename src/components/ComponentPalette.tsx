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
  Monitor,
  Terminal,
  Layout,
  Smartphone,
  Laptop,
  Coins,
  Combine,
  Construction,
  Eye,
  Circle,
  CircleDot,
  Diamond,
  SeparatorHorizontal,
  FileSearch,
  Fingerprint,
  FlaskConical,
  Focus,
  Folders,
  Frame,
  GanttChart,
  GitFork,
  HeartPulse,
  History,
  Home,
  Image,
  Inbox,
  Infinity,
  InspectionPanel,
  Joystick,
  Languages,
  Library,
  LineChart,
  Megaphone,
  Microscope,
  Mic,
  Music,
  Navigation,
  Newspaper,
  Orbit,
  Origami,
  Palmtree,
  Paperclip,
  Pause,
  PenTool,
  Phone,
  PictureInPicture,
  PieChart,
  Pipette,
  Play,
  Plug,
  Plus,
  Power,
  Printer,
  Puzzle,
  QrCode,
  Quote,
  Radio,
  Receipt,
  Recycle,
  Regex,
  Repeat,
  Reply,
  Rewind,
  Rocket,
  Route,
  Router,
  Rss,
  Save,
  Scan,
  Scissors,
  ScreenShare,
  Scroll,
  Share,
  ShoppingBag,
  ShoppingCart,
  Shovel,
  Shuffle,
  Sigma,
  Signal,
  Siren,
  SkipBack,
  SkipForward,
  Slash,
  Slice,
  Sliders,
  Smile,
  Speaker,
  Square,
  Star,
  StepBack,
  StepForward,
  Stethoscope,
  Sticker,
  StickyNote,
  StopCircle,
  Sun,
  Sunrise,
  Sunset,
  Table,
  Tablet,
  Tag,
  Target,
  Tent,
  Thermometer,
  ThumbsDown,
  ThumbsUp,
  Ticket,
  Timer,
  ToggleRight,
  Tornado,
  Tractor,
  TrafficCone,
  Train,
  Trash,
  Trees,
  Trello,
  TrendingDown,
  TrendingUp,
  Triangle,
  Trophy,
  Truck,
  Tv,
  Twitch,
  Twitter,
  Umbrella,
  Underline,
  Undo,
  UnfoldHorizontal,
  UnfoldVertical,
  Ungroup,
  Unlink,
  Unlock,
  Upload,
  UserMinus,
  UserPlus,
  UserX,
  Utensils,
  Vibrate,
  Video,
  View,
  Voicemail,
  Volume,
  Wallet,
  Wand,
  Watch,
  Waves,
  Webcam,
  Wind,
  Wine,
  WrapText,
  Wrench,
  Youtube,
  Grid,
} from 'lucide-react'
import {
  SiPostgresql,
  SiMysql,
  SiMongodb,
  SiRedis,
  SiElasticsearch,
  SiApachecassandra,
  SiMariadb,
  SiClickhouse,
  SiNeo4J,
  SiApachekafka,
  SiRabbitmq,
  SiKubernetes,
  SiDocker,
  SiTerraform,
  SiJenkins,
  SiPrometheus,
  SiGrafana,
  SiAnsible,
} from 'react-icons/si'

interface ComponentPaletteProps {
  onComponentClick: (type: ComponentType, label?: string) => void
  onRecommendationClick?: () => void
  onClose?: () => void
}

type ComponentCategory = 'all' | 'infrastructure' | 'data' | 'security' | 'development' | 'monitoring' | 'integration' | 'communication' | 'text' | 'ai' | 'roles' | 'management' | 'misc' | 'aws' | 'gcp' | 'azure' | 'oracle' | 'branded' | 'activity'

interface Component {
  type: ComponentType
  label: string
  icon: React.ReactNode
  color: string
  category: ComponentCategory
}

export const components: Component[] = [
  // Инфраструктура
  { type: 'server', label: 'Сервер', icon: <Server size={24} />, color: '#339af0', category: 'infrastructure' },
  { type: 'container', label: 'Контейнер', icon: <Package size={24} />, color: '#51cf66', category: 'infrastructure' },
  { type: 'orchestrator', label: 'Оркестратор', icon: <Layers size={24} />, color: '#20c997', category: 'infrastructure' },
  { type: 'cluster', label: 'Кластер', icon: <Network size={24} />, color: '#339af0', category: 'infrastructure' },
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
  { type: 'iot-sensor', label: 'IoT сенсор', icon: <Zap size={24} />, color: '#ffd43b', category: 'infrastructure' },
  { type: 'iot-hub', label: 'IoT Hub', icon: <Network size={24} />, color: '#22b8cf', category: 'infrastructure' },
  { type: 'edge-gateway', label: 'Edge Gateway', icon: <Router size={24} />, color: '#15aabf', category: 'infrastructure' },
  { type: 'cdn-edge', label: 'CDN Edge Node', icon: <Globe size={24} />, color: '#51cf66', category: 'infrastructure' },
  { type: 'edge-worker', label: 'Edge Worker', icon: <Cpu size={24} />, color: '#ffd43b', category: 'infrastructure' },
  { type: 'service-proxy', label: 'Service Proxy', icon: <Server size={24} />, color: '#666', category: 'infrastructure' },
  { type: 'api-proxy', label: 'API Proxy', icon: <Zap size={24} />, color: '#4dabf7', category: 'infrastructure' },
  { type: 'cron', label: 'Cron (Планировщик)', icon: <Clock size={24} />, color: '#4dabf7', category: 'infrastructure' },

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
  { type: 'data-catalog', label: 'Data Catalog', icon: <Library size={24} />, color: '#20c997', category: 'data' },
  { type: 'data-lineage', label: 'Data Lineage', icon: <Route size={24} />, color: '#94d82d', category: 'data' },
  { type: 'data-source', label: 'Data Source', icon: <Database size={24} />, color: '#adb5bd', category: 'data' },
  { type: 'json', label: 'JSON Document', icon: <FileJson size={24} />, color: '#fcc419', category: 'data' },
  { type: 'xml', label: 'XML Document', icon: <FileCode size={24} />, color: '#ff922b', category: 'data' },

  // Безопасность
  { type: 'firewall', label: 'Межсетевой экран', icon: <Shield size={24} />, color: '#dc3545', category: 'security' },
  { type: 'auth-service', label: 'Сервис аутентификации', icon: <Lock size={24} />, color: '#ff6b6b', category: 'security' },
  { type: 'identity-provider', label: 'Провайдер идентичности', icon: <Key size={24} />, color: '#ff6b6b', category: 'security' },
  { type: 'secret-management', label: 'Управление секретами', icon: <Lock size={24} />, color: '#dc3545', category: 'security' },
  { type: 'vpn-gateway', label: 'VPN шлюз', icon: <Shield size={24} />, color: '#dc3545', category: 'security' },
  { type: 'hsm', label: 'HSM', icon: <Lock size={24} />, color: '#e03131', category: 'security' },
  { type: 'siem', label: 'SIEM', icon: <ShieldAlert size={24} />, color: '#c92a2a', category: 'security' },
  { type: 'vulnerability-scanner', label: 'Vulnerability Scanner', icon: <Search size={24} />, color: '#fa5252', category: 'security' },
  { type: 'secret-key', label: 'Secret Key', icon: <KeyRound size={24} />, color: '#e03131', category: 'security' },
  { type: 'encryption-service', label: 'Encryption', icon: <Lock size={24} />, color: '#c92a2a', category: 'security' },
  { type: 'hashing-service', label: 'Hashing', icon: <Fingerprint size={24} />, color: '#868e96', category: 'security' },

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
  { type: 'internal-portal', label: 'Internal Portal', icon: <Layout size={24} />, color: '#228be6', category: 'development' },

  // Мониторинг
  { type: 'monitoring', label: 'Мониторинг', icon: <Activity size={24} />, color: '#ff6b6b', category: 'monitoring' },
  { type: 'logging', label: 'Логирование', icon: <FileText size={24} />, color: '#ffa94d', category: 'monitoring' },
  { type: 'analytics-service', label: 'Аналитика', icon: <BarChart3 size={24} />, color: '#339af0', category: 'monitoring' },
  { type: 'business-intelligence', label: 'Business Intelligence', icon: <BarChart3 size={24} />, color: '#4dabf7', category: 'monitoring' },
  { type: 'status-page', label: 'Status Page', icon: <Monitor size={24} />, color: '#37b24d', category: 'monitoring' },
  { type: 'profiler', label: 'Profiling Service', icon: <Gauge size={24} />, color: '#f59f00', category: 'monitoring' },

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
  { type: 'external-component', label: 'Внешний компонент', icon: <ExternalLink size={24} />, color: '#868e96', category: 'integration' },

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
  { type: 'ocr-service', label: 'OCR сервис', icon: <Scan size={24} />, color: '#fab005', category: 'ai' },
  { type: 'model-monitoring', label: 'Model Monitoring', icon: <Activity size={24} />, color: '#ae3ec9', category: 'ai' },
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
  { type: 'logic', label: 'Логика', icon: <Workflow size={24} />, color: '#4dabf7', category: 'development' },
  { type: 'pattern', label: 'Паттерн', icon: <Layers size={24} />, color: '#ae3ec9', category: 'development' },
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

  // Activity Diagram / Flowchart
  { type: 'activity-start', label: 'Начало', icon: <Circle size={24} fill="currentColor" />, color: '#51cf66', category: 'activity' },
  { type: 'activity-end', label: 'Конец', icon: <CircleDot size={24} strokeWidth={3} />, color: '#fa5252', category: 'activity' },
  { type: 'activity-decision', label: 'Условие / Решение', icon: <Diamond size={24} />, color: '#ffd43b', category: 'activity' },
  { type: 'activity-action', label: 'Действие / Шаг', icon: <Activity size={24} />, color: '#4dabf7', category: 'activity' },
  { type: 'activity-fork', label: 'Разветвление', icon: <SeparatorHorizontal size={24} strokeWidth={4} />, color: '#868e96', category: 'activity' },
  { type: 'activity-join', label: 'Слияние', icon: <SeparatorHorizontal size={24} strokeWidth={4} />, color: '#868e96', category: 'activity' },
  { type: 'activity-note', label: 'Заметка / Коммент', icon: <StickyNote size={24} />, color: '#ffd666', category: 'activity' },

  // Разное
  { type: 'tracking', label: 'Трекинг', icon: <Clock size={24} />, color: '#ffd43b', category: 'misc' },
  { type: 'user', label: 'User / Actor', icon: <User size={24} />, color: '#ff8787', category: 'misc' },
  { type: 'vendor', label: 'Vendor / Third Party', icon: <Building2 size={24} />, color: '#adb5bd', category: 'misc' },
  { type: 'regulatory-body', label: 'Regulatory Body', icon: <Scale size={24} />, color: '#12b886', category: 'misc' },

  // --- AWS ---
  { type: 'aws-service', label: 'AWS EC2', icon: <Server size={24} />, color: '#FF9900', category: 'aws' },
  { type: 'aws-service', label: 'AWS S3', icon: <Box size={24} />, color: '#FF9900', category: 'aws' },
  { type: 'aws-service', label: 'AWS Lambda', icon: <Zap size={24} />, color: '#FF9900', category: 'aws' },
  { type: 'aws-service', label: 'AWS RDS', icon: <Database size={24} />, color: '#FF9900', category: 'aws' },
  { type: 'aws-service', label: 'AWS DynamoDB', icon: <DatabaseZap size={24} />, color: '#FF9900', category: 'aws' },
  { type: 'aws-service', label: 'AWS SQS', icon: <MessageSquare size={24} />, color: '#FF9900', category: 'aws' },
  { type: 'aws-service', label: 'AWS SNS', icon: <BellRing size={24} />, color: '#FF9900', category: 'aws' },
  { type: 'aws-service', label: 'AWS IAM', icon: <UserCheck size={24} />, color: '#FF9900', category: 'aws' },
  { type: 'aws-service', label: 'AWS VPC', icon: <Network size={24} />, color: '#FF9900', category: 'aws' },
  { type: 'aws-service', label: 'AWS CloudFront', icon: <Cloud size={24} />, color: '#FF9900', category: 'aws' },
  { type: 'aws-service', label: 'AWS API Gateway', icon: <Zap size={24} />, color: '#FF9900', category: 'aws' },
  { type: 'aws-service', label: 'AWS Route53', icon: <Globe size={24} />, color: '#FF9900', category: 'aws' },
  { type: 'aws-service', label: 'AWS ElastiCache', icon: <HardDrive size={24} />, color: '#FF9900', category: 'aws' },
  { type: 'aws-service', label: 'AWS EKS', icon: <Layers size={24} />, color: '#FF9900', category: 'aws' },
  { type: 'aws-service', label: 'AWS ECS', icon: <Box size={24} />, color: '#FF9900', category: 'aws' },
  { type: 'aws-service', label: 'AWS Cognito', icon: <UserCheck size={24} />, color: '#FF9900', category: 'aws' },
  { type: 'aws-service', label: 'AWS Step Functions', icon: <Workflow size={24} />, color: '#FF9900', category: 'aws' },
  { type: 'aws-service', label: 'AWS Redshift', icon: <Warehouse size={24} />, color: '#FF9900', category: 'aws' },
  { type: 'aws-service', label: 'AWS Aurora', icon: <DatabaseZap size={24} />, color: '#FF9900', category: 'aws' },
  { type: 'aws-service', label: 'AWS Kinesis', icon: <Zap size={24} />, color: '#FF9900', category: 'aws' },
  { type: 'aws-service', label: 'AWS CloudWatch', icon: <Activity size={24} />, color: '#FF9900', category: 'aws' },
  { type: 'aws-service', label: 'AWS Glue', icon: <RefreshCw size={24} />, color: '#FF9900', category: 'aws' },

  // AWS Compute
  { type: 'aws-service', label: 'AWS EC2 Auto Scaling', icon: <Scale size={24} />, color: '#FF9900', category: 'aws' },
  { type: 'aws-service', label: 'AWS Elastic Beanstalk', icon: <Layers size={24} />, color: '#FF9900', category: 'aws' },
  { type: 'aws-service', label: 'AWS Lightsail', icon: <Server size={24} />, color: '#FF9900', category: 'aws' },
  { type: 'aws-service', label: 'AWS Batch', icon: <ListChecks size={24} />, color: '#FF9900', category: 'aws' },
  { type: 'aws-service', label: 'AWS App Runner', icon: <Play size={24} />, color: '#FF9900', category: 'aws' },
  { type: 'aws-service', label: 'AWS Outposts', icon: <Server size={24} />, color: '#FF9900', category: 'aws' },

  // AWS Storage
  { type: 'aws-service', label: 'AWS S3 Glacier', icon: <Archive size={24} />, color: '#FF9900', category: 'aws' },
  { type: 'aws-service', label: 'AWS EBS', icon: <HardDrive size={24} />, color: '#FF9900', category: 'aws' },
  { type: 'aws-service', label: 'AWS EFS', icon: <Folders size={24} />, color: '#FF9900', category: 'aws' },
  { type: 'aws-service', label: 'AWS FSx', icon: <HardDrive size={24} />, color: '#FF9900', category: 'aws' },
  { type: 'aws-service', label: 'AWS Storage Gateway', icon: <Router size={24} />, color: '#FF9900', category: 'aws' },
  { type: 'aws-service', label: 'AWS Snowball', icon: <Truck size={24} />, color: '#FF9900', category: 'aws' },

  // AWS Databases
  { type: 'aws-service', label: 'AWS Neptune', icon: <Network size={24} />, color: '#FF9900', category: 'aws' },
  { type: 'aws-service', label: 'AWS DocumentDB', icon: <FileJson size={24} />, color: '#FF9900', category: 'aws' },
  { type: 'aws-service', label: 'AWS Keyspaces', icon: <Table size={24} />, color: '#FF9900', category: 'aws' },

  // AWS Networking
  { type: 'aws-service', label: 'AWS ELB', icon: <Split size={24} />, color: '#FF9900', category: 'aws' },
  { type: 'aws-service', label: 'AWS Direct Connect', icon: <LinkIcon size={24} />, color: '#FF9900', category: 'aws' },
  { type: 'aws-service', label: 'AWS Global Accelerator', icon: <Zap size={24} />, color: '#FF9900', category: 'aws' },

  // AWS Security
  { type: 'aws-service', label: 'AWS KMS', icon: <Key size={24} />, color: '#FF9900', category: 'aws' },
  { type: 'aws-service', label: 'AWS Secrets Manager', icon: <Lock size={24} />, color: '#FF9900', category: 'aws' },
  { type: 'aws-service', label: 'AWS Certificate Manager', icon: <BadgeCheck size={24} />, color: '#FF9900', category: 'aws' },
  { type: 'aws-service', label: 'AWS Shield', icon: <Shield size={24} />, color: '#FF9900', category: 'aws' },
  { type: 'aws-service', label: 'AWS WAF', icon: <ShieldAlert size={24} />, color: '#FF9900', category: 'aws' },
  { type: 'aws-service', label: 'AWS GuardDuty', icon: <Eye size={24} />, color: '#FF9900', category: 'aws' },
  { type: 'aws-service', label: 'AWS Inspector', icon: <Search size={24} />, color: '#FF9900', category: 'aws' },
  { type: 'aws-service', label: 'AWS Macie', icon: <FileSearch size={24} />, color: '#FF9900', category: 'aws' },

  // AWS DevOps
  { type: 'aws-service', label: 'AWS CloudFormation', icon: <FileCode size={24} />, color: '#FF9900', category: 'aws' },
  { type: 'aws-service', label: 'AWS CDK', icon: <Code size={24} />, color: '#FF9900', category: 'aws' },
  { type: 'aws-service', label: 'AWS CodeCommit', icon: <GitBranch size={24} />, color: '#FF9900', category: 'aws' },
  { type: 'aws-service', label: 'AWS CodeBuild', icon: <Construction size={24} />, color: '#FF9900', category: 'aws' },
  { type: 'aws-service', label: 'AWS CodeDeploy', icon: <Rocket size={24} />, color: '#FF9900', category: 'aws' },
  { type: 'aws-service', label: 'AWS CodePipeline', icon: <Workflow size={24} />, color: '#FF9900', category: 'aws' },
  { type: 'aws-service', label: 'AWS Systems Manager', icon: <Settings size={24} />, color: '#FF9900', category: 'aws' },
  { type: 'aws-service', label: 'AWS CloudTrail', icon: <ScrollText size={24} />, color: '#FF9900', category: 'aws' },
  { type: 'aws-service', label: 'AWS Config', icon: <Settings2 size={24} />, color: '#FF9900', category: 'aws' },

  // AWS Analytics
  { type: 'aws-service', label: 'AWS Athena', icon: <Pipette size={24} />, color: '#FF9900', category: 'aws' },
  { type: 'aws-service', label: 'AWS EMR', icon: <BarChart3 size={24} />, color: '#FF9900', category: 'aws' },
  { type: 'aws-service', label: 'AWS OpenSearch', icon: <Search size={24} />, color: '#FF9900', category: 'aws' },
  { type: 'aws-service', label: 'AWS Data Pipeline', icon: <Workflow size={24} />, color: '#FF9900', category: 'aws' },

  // AWS AI
  { type: 'aws-service', label: 'AWS SageMaker', icon: <Brain size={24} />, color: '#FF9900', category: 'aws' },
  { type: 'aws-service', label: 'AWS Rekognition', icon: <Video size={24} />, color: '#FF9900', category: 'aws' },
  { type: 'aws-service', label: 'AWS Comprehend', icon: <FileText size={24} />, color: '#FF9900', category: 'aws' },
  { type: 'aws-service', label: 'AWS Lex', icon: <MessageCircle size={24} />, color: '#FF9900', category: 'aws' },
  { type: 'aws-service', label: 'AWS Polly', icon: <Speaker size={24} />, color: '#FF9900', category: 'aws' },
  { type: 'aws-service', label: 'AWS Transcribe', icon: <Mic size={24} />, color: '#FF9900', category: 'aws' },
  { type: 'aws-service', label: 'AWS Translate', icon: <Languages size={24} />, color: '#FF9900', category: 'aws' },

  // --- GCP ---
  { type: 'gcp-service', label: 'GCP Compute Engine', icon: <Server size={24} />, color: '#4285F4', category: 'gcp' },
  { type: 'gcp-service', label: 'GCP Cloud Storage', icon: <Box size={24} />, color: '#4285F4', category: 'gcp' },
  { type: 'gcp-service', label: 'GCP Cloud Functions', icon: <Zap size={24} />, color: '#4285F4', category: 'gcp' },
  { type: 'gcp-service', label: 'GCP Cloud SQL', icon: <Database size={24} />, color: '#4285F4', category: 'gcp' },
  { type: 'gcp-service', label: 'GCP Bigtable', icon: <DatabaseZap size={24} />, color: '#4285F4', category: 'gcp' },
  { type: 'gcp-service', label: 'GCP Pub/Sub', icon: <MessageSquare size={24} />, color: '#4285F4', category: 'gcp' },
  { type: 'gcp-service', label: 'GCP Cloud Run', icon: <Package size={24} />, color: '#4285F4', category: 'gcp' },
  { type: 'gcp-service', label: 'GCP BigQuery', icon: <BarChart3 size={24} />, color: '#4285F4', category: 'gcp' },
  { type: 'gcp-service', label: 'GCP GKE', icon: <Layers size={24} />, color: '#4285F4', category: 'gcp' },
  { type: 'gcp-service', label: 'GCP Firestore', icon: <Database size={24} />, color: '#4285F4', category: 'gcp' },
  { type: 'gcp-service', label: 'GCP Spanner', icon: <DatabaseZap size={24} />, color: '#4285F4', category: 'gcp' },
  { type: 'gcp-service', label: 'GCP Dataflow', icon: <Zap size={24} />, color: '#4285F4', category: 'gcp' },
  { type: 'gcp-service', label: 'GCP Dataproc', icon: <Cpu size={24} />, color: '#4285F4', category: 'gcp' },
  { type: 'gcp-service', label: 'GCP Cloud Armor', icon: <Shield size={24} />, color: '#4285F4', category: 'gcp' },
  { type: 'gcp-service', label: 'GCP Artifact Registry', icon: <Archive size={24} />, color: '#4285F4', category: 'gcp' },
  { type: 'gcp-service', label: 'GCP Cloud Build', icon: <RefreshCcw size={24} />, color: '#4285F4', category: 'gcp' },

  // --- Azure ---
  { type: 'azure-service', label: 'Azure VM', icon: <Server size={24} />, color: '#0089D6', category: 'azure' },
  { type: 'azure-service', label: 'Azure Blob Storage', icon: <Box size={24} />, color: '#0089D6', category: 'azure' },
  { type: 'azure-service', label: 'Azure Functions', icon: <Zap size={24} />, color: '#0089D6', category: 'azure' },
  { type: 'azure-service', label: 'Azure SQL Database', icon: <Database size={24} />, color: '#0089D6', category: 'azure' },
  { type: 'azure-service', label: 'Azure Cosmos DB', icon: <DatabaseZap size={24} />, color: '#0089D6', category: 'azure' },
  { type: 'azure-service', label: 'Azure Service Bus', icon: <MessageSquare size={24} />, color: '#0089D6', category: 'azure' },
  { type: 'azure-service', label: 'Azure AKS', icon: <Layers size={24} />, color: '#0089D6', category: 'azure' },
  { type: 'azure-service', label: 'Azure App Service', icon: <Globe size={24} />, color: '#0089D6', category: 'azure' },
  { type: 'azure-service', label: 'Azure Key Vault', icon: <Lock size={24} />, color: '#0089D6', category: 'azure' },
  { type: 'azure-service', label: 'Azure Application Gateway', icon: <Loader size={24} />, color: '#0089D6', category: 'azure' },
  { type: 'azure-service', label: 'Azure Traffic Manager', icon: <Network size={24} />, color: '#0089D6', category: 'azure' },
  { type: 'azure-service', label: 'Azure Data Lake Storage', icon: <Warehouse size={24} />, color: '#0089D6', category: 'azure' },
  { type: 'azure-service', label: 'Azure Front Door', icon: <Globe size={24} />, color: '#0089D6', category: 'azure' },
  { type: 'azure-service', label: 'Azure Logic Apps', icon: <Workflow size={24} />, color: '#0089D6', category: 'azure' },

  // Azure Compute
  { type: 'azure-service', label: 'Azure VM Scale Sets', icon: <Copy size={24} />, color: '#0089D6', category: 'azure' },
  { type: 'azure-service', label: 'Azure Batch', icon: <ListChecks size={24} />, color: '#0089D6', category: 'azure' },
  { type: 'azure-service', label: 'Azure Container Instances', icon: <Box size={24} />, color: '#0089D6', category: 'azure' },

  // Azure Storage
  { type: 'azure-service', label: 'Azure File Storage', icon: <Folders size={24} />, color: '#0089D6', category: 'azure' },
  { type: 'azure-service', label: 'Azure Queue Storage', icon: <ListChecks size={24} />, color: '#0089D6', category: 'azure' },
  { type: 'azure-service', label: 'Azure Table Storage', icon: <Table size={24} />, color: '#0089D6', category: 'azure' },
  { type: 'azure-service', label: 'Azure Disk Storage', icon: <HardDrive size={24} />, color: '#0089D6', category: 'azure' },
  { type: 'azure-service', label: 'Azure Data Box', icon: <Truck size={24} />, color: '#0089D6', category: 'azure' },

  // Azure Databases
  { type: 'azure-service', label: 'Azure SQL Managed Instance', icon: <Database size={24} />, color: '#0089D6', category: 'azure' },
  { type: 'azure-service', label: 'SQL Server on VM', icon: <Database size={24} />, color: '#0089D6', category: 'azure' },
  { type: 'azure-service', label: 'Azure MySQL Flexible', icon: <Database size={24} />, color: '#0089D6', category: 'azure' },
  { type: 'azure-service', label: 'Azure PostgreSQL Flexible', icon: <Database size={24} />, color: '#0089D6', category: 'azure' },

  // Azure Networking
  { type: 'azure-service', label: 'Azure VNet', icon: <Network size={24} />, color: '#0089D6', category: 'azure' },
  { type: 'azure-service', label: 'Azure Load Balancer', icon: <Split size={24} />, color: '#0089D6', category: 'azure' },
  { type: 'azure-service', label: 'Azure ExpressRoute', icon: <LinkIcon size={24} />, color: '#0089D6', category: 'azure' },
  { type: 'azure-service', label: 'Azure DNS', icon: <Globe size={24} />, color: '#0089D6', category: 'azure' },
  { type: 'azure-service', label: 'Azure CDN', icon: <Globe2 size={24} />, color: '#0089D6', category: 'azure' },

  // Azure Security
  { type: 'azure-service', label: 'Azure Entra ID', icon: <UserCheck size={24} />, color: '#0089D6', category: 'azure' },
  { type: 'azure-service', label: 'Azure Defender', icon: <ShieldCheck size={24} />, color: '#0089D6', category: 'azure' },
  { type: 'azure-service', label: 'Azure Sentinel', icon: <ShieldAlert size={24} />, color: '#0089D6', category: 'azure' },
  { type: 'azure-service', label: 'Azure DDoS Protection', icon: <Shield size={24} />, color: '#0089D6', category: 'azure' },
  { type: 'azure-service', label: 'Azure Firewall', icon: <Shield size={24} />, color: '#0089D6', category: 'azure' },
  { type: 'azure-service', label: 'Azure WAF', icon: <ShieldAlert size={24} />, color: '#0089D6', category: 'azure' },

  // Azure DevOps
  { type: 'azure-service', label: 'Azure DevOps', icon: <Infinity size={24} />, color: '#0089D6', category: 'azure' },
  { type: 'azure-service', label: 'Azure ARM Templates', icon: <FileCode size={24} />, color: '#0089D6', category: 'azure' },
  { type: 'azure-service', label: 'Azure Bicep', icon: <FileCode2 size={24} />, color: '#0089D6', category: 'azure' },
  { type: 'azure-service', label: 'Azure Monitor', icon: <Activity size={24} />, color: '#0089D6', category: 'azure' },
  { type: 'azure-service', label: 'Azure Log Analytics', icon: <FileSearch size={24} />, color: '#0089D6', category: 'azure' },
  { type: 'azure-service', label: 'Azure Automation', icon: <Bot size={24} />, color: '#0089D6', category: 'azure' },
  { type: 'azure-service', label: 'Azure Policy', icon: <ScrollText size={24} />, color: '#0089D6', category: 'azure' },
  { type: 'azure-service', label: 'Azure Blueprints', icon: <Map size={24} />, color: '#0089D6', category: 'azure' },

  // Azure Analytics
  { type: 'azure-service', label: 'Azure Synapse Analytics', icon: <BarChart3 size={24} />, color: '#0089D6', category: 'azure' },
  { type: 'azure-service', label: 'Azure Data Factory', icon: <Workflow size={24} />, color: '#0089D6', category: 'azure' },
  { type: 'azure-service', label: 'Azure Stream Analytics', icon: <Activity size={24} />, color: '#0089D6', category: 'azure' },
  { type: 'azure-service', label: 'Azure Event Hubs', icon: <Radio size={24} />, color: '#0089D6', category: 'azure' },

  // Azure AI
  { type: 'azure-service', label: 'Azure Machine Learning', icon: <Brain size={24} />, color: '#0089D6', category: 'azure' },
  { type: 'azure-service', label: 'Azure Cognitive Services', icon: <Sparkles size={24} />, color: '#0089D6', category: 'azure' },
  { type: 'azure-service', label: 'Azure OpenAI Service', icon: <Brain size={24} />, color: '#0089D6', category: 'azure' },
  { type: 'azure-service', label: 'Azure Bot Service', icon: <Bot size={24} />, color: '#0089D6', category: 'azure' },

  // --- Oracle ---
  { type: 'oracle-service', label: 'Oracle Database', icon: <Database size={24} />, color: '#F80000', category: 'oracle' },
  { type: 'oracle-service', label: 'Oracle Cloud Compute', icon: <Server size={24} />, color: '#F80000', category: 'oracle' },
  { type: 'oracle-service', label: 'Oracle Cloud Storage', icon: <Box size={24} />, color: '#F80000', category: 'oracle' },
  { type: 'oracle-service', label: 'Oracle Exadata', icon: <DatabaseZap size={24} />, color: '#F80000', category: 'oracle' },
  { type: 'oracle-service', label: 'Oracle Autonomous DB', icon: <Zap size={24} />, color: '#F80000', category: 'oracle' },

  // Oracle Compute
  { type: 'oracle-service', label: 'OCI Dedicated VM Hosts', icon: <Server size={24} />, color: '#F80000', category: 'oracle' },
  { type: 'oracle-service', label: 'OCI Bare Metal Servers', icon: <Cpu size={24} />, color: '#F80000', category: 'oracle' },
  { type: 'oracle-service', label: 'OCI Functions', icon: <Zap size={24} />, color: '#F80000', category: 'oracle' },
  { type: 'oracle-service', label: 'OCI OKE', icon: <Layers size={24} />, color: '#F80000', category: 'oracle' },

  // Oracle Storage
  { type: 'oracle-service', label: 'OCI Archive Storage', icon: <Archive size={24} />, color: '#F80000', category: 'oracle' },
  { type: 'oracle-service', label: 'OCI Block Volumes', icon: <HardDrive size={24} />, color: '#F80000', category: 'oracle' },
  { type: 'oracle-service', label: 'OCI File Storage', icon: <Folders size={24} />, color: '#F80000', category: 'oracle' },
  { type: 'oracle-service', label: 'OCI Data Transfer', icon: <ArrowRight size={24} />, color: '#F80000', category: 'oracle' },

  // Oracle Databases
  { type: 'oracle-service', label: 'OCI MySQL HeatWave', icon: <DatabaseZap size={24} />, color: '#F80000', category: 'oracle' },
  { type: 'oracle-service', label: 'OCI NoSQL Database', icon: <Database size={24} />, color: '#F80000', category: 'oracle' },

  // Oracle Networking
  { type: 'oracle-service', label: 'OCI VCN', icon: <Network size={24} />, color: '#F80000', category: 'oracle' },
  { type: 'oracle-service', label: 'OCI Load Balancer', icon: <Split size={24} />, color: '#F80000', category: 'oracle' },
  { type: 'oracle-service', label: 'OCI FastConnect', icon: <LinkIcon size={24} />, color: '#F80000', category: 'oracle' },
  { type: 'oracle-service', label: 'OCI DNS', icon: <Globe size={24} />, color: '#F80000', category: 'oracle' },
  { type: 'oracle-service', label: 'OCI Traffic Management', icon: <Route size={24} />, color: '#F80000', category: 'oracle' },

  // Oracle Security
  { type: 'oracle-service', label: 'OCI IAM', icon: <UserCheck size={24} />, color: '#F80000', category: 'oracle' },
  { type: 'oracle-service', label: 'OCI Vault', icon: <Lock size={24} />, color: '#F80000', category: 'oracle' },
  { type: 'oracle-service', label: 'OCI Cloud Guard', icon: <ShieldCheck size={24} />, color: '#F80000', category: 'oracle' },
  { type: 'oracle-service', label: 'OCI Security Zones', icon: <Shield size={24} />, color: '#F80000', category: 'oracle' },
  { type: 'oracle-service', label: 'OCI WAF', icon: <ShieldAlert size={24} />, color: '#F80000', category: 'oracle' },

  // Oracle Management & DevOps
  { type: 'oracle-service', label: 'OCI Resource Manager', icon: <Settings size={24} />, color: '#F80000', category: 'oracle' },
  { type: 'oracle-service', label: 'OCI Monitoring', icon: <Activity size={24} />, color: '#F80000', category: 'oracle' },
  { type: 'oracle-service', label: 'OCI Logging', icon: <FileText size={24} />, color: '#F80000', category: 'oracle' },
  { type: 'oracle-service', label: 'OCI Events Service', icon: <Zap size={24} />, color: '#F80000', category: 'oracle' },
  { type: 'oracle-service', label: 'OCI DevOps', icon: <GitBranch size={24} />, color: '#F80000', category: 'oracle' },

  // Oracle Analytics
  { type: 'oracle-service', label: 'Oracle Analytics Cloud', icon: <BarChart3 size={24} />, color: '#F80000', category: 'oracle' },
  { type: 'oracle-service', label: 'OCI Data Integration', icon: <Workflow size={24} />, color: '#F80000', category: 'oracle' },
  { type: 'oracle-service', label: 'OCI Big Data Service', icon: <Database size={24} />, color: '#F80000', category: 'oracle' },

  // Oracle AI
  { type: 'oracle-service', label: 'OCI Data Science', icon: <Brain size={24} />, color: '#F80000', category: 'oracle' },
  { type: 'oracle-service', label: 'OCI AI Vision', icon: <Eye size={24} />, color: '#F80000', category: 'oracle' },
  { type: 'oracle-service', label: 'OCI AI Language', icon: <MessageCircle size={24} />, color: '#F80000', category: 'oracle' },
  { type: 'oracle-service', label: 'OCI AI Speech', icon: <Mic size={24} />, color: '#F80000', category: 'oracle' },

  // --- INFRASTRUCTURE EXPANSION ---
  { type: 'bare-metal', label: 'Bare Metal', icon: <Cpu size={24} />, color: '#444', category: 'infrastructure' },
  { type: 'virtual-machine', label: 'VM', icon: <Server size={24} />, color: '#666', category: 'infrastructure' },
  { type: 'vpc', label: 'VPC / VNet', icon: <Network size={24} />, color: '#339af0', category: 'infrastructure' },
  { type: 'subnet', label: 'Subnet', icon: <Grid size={24} />, color: '#4dabf7', category: 'infrastructure' },
  { type: 'security-group', label: 'Security Group', icon: <Shield size={24} />, color: '#dc3545', category: 'infrastructure' },
  { type: 'internet-gateway', label: 'Internet Gateway', icon: <Globe size={24} />, color: '#51cf66', category: 'infrastructure' },
  { type: 'nat-gateway', label: 'NAT Gateway', icon: <Zap size={24} />, color: '#ffd43b', category: 'infrastructure' },

  // --- DEVELOPMENT EXPANSION ---
  { type: 'monorepo', label: 'Monorepo', icon: <Folders size={24} />, color: '#adb5bd', category: 'development' },
  { type: 'micro-frontend', label: 'Micro-frontend', icon: <Layout size={24} />, color: '#22b8cf', category: 'development' },
  { type: 'library', label: 'Library', icon: <Library size={24} />, color: '#748ffc', category: 'development' },

  // --- MONITORING EXPANSION ---
  { type: 'dashboard', label: 'Dashboard', icon: <Monitor size={24} />, color: '#f03e3e', category: 'monitoring' },
  { type: 'log-aggregator', label: 'Log Aggregator', icon: <Terminal size={24} />, color: '#fd7e14', category: 'monitoring' },
  { type: 'metrics-collector', label: 'Metrics Collector', icon: <Activity size={24} />, color: '#ff6b6b', category: 'monitoring' },
  { type: 'synthetic-monitoring', label: 'Synthetic Monitoring', icon: <FlaskConical size={24} />, color: '#ae3ec9', category: 'monitoring' },

  // --- BRANDED / SPECIFIC TECHNOLOGIES ---
  // Databases
  { type: 'postgresql', label: 'PostgreSQL', icon: <SiPostgresql size={24} />, color: '#336791', category: 'branded' },
  { type: 'mysql', label: 'MySQL', icon: <SiMysql size={24} />, color: '#00758F', category: 'branded' },
  { type: 'mongodb', label: 'MongoDB', icon: <SiMongodb size={24} />, color: '#47A248', category: 'branded' },
  { type: 'redis', label: 'Redis', icon: <SiRedis size={24} />, color: '#DC382D', category: 'branded' },
  { type: 'elasticsearch', label: 'Elasticsearch', icon: <SiElasticsearch size={24} />, color: '#005571', category: 'branded' },
  { type: 'cassandra', label: 'Cassandra', icon: <SiApachecassandra size={24} />, color: '#1287B1', category: 'branded' },
  { type: 'mariadb', label: 'MariaDB', icon: <SiMariadb size={24} />, color: '#003545', category: 'branded' },
  { type: 'clickhouse', label: 'ClickHouse', icon: <SiClickhouse size={24} />, color: '#FFCC01', category: 'branded' },
  { type: 'neo4j', label: 'Neo4j', icon: <SiNeo4J size={24} />, color: '#008CC1', category: 'branded' },

  // Messaging / Streaming
  { type: 'kafka', label: 'Apache Kafka', icon: <SiApachekafka size={24} />, color: '#231F20', category: 'branded' },
  { type: 'rabbitmq', label: 'RabbitMQ', icon: <SiRabbitmq size={24} />, color: '#FF6600', category: 'branded' },

  // DevOps / Infra Tools
  { type: 'kubernetes', label: 'Kubernetes', icon: <SiKubernetes size={24} />, color: '#326CE5', category: 'branded' },
  { type: 'docker', label: 'Docker', icon: <SiDocker size={24} />, color: '#2496ED', category: 'branded' },
  { type: 'terraform', label: 'Terraform', icon: <SiTerraform size={24} />, color: '#623CE4', category: 'branded' },
  { type: 'jenkins', label: 'Jenkins', icon: <SiJenkins size={24} />, color: '#D24939', category: 'branded' },
  { type: 'ansible', label: 'Ansible', icon: <SiAnsible size={24} />, color: '#EE0000', category: 'branded' },

  // Monitoring Tools
  { type: 'prometheus', label: 'Prometheus', icon: <SiPrometheus size={24} />, color: '#E6522C', category: 'branded' },
  { type: 'grafana', label: 'Grafana', icon: <SiGrafana size={24} />, color: '#F46800', category: 'branded' },
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
  aws: 'AWS',
  gcp: 'Google Cloud',
  azure: 'Azure',
  oracle: 'Oracle',
  branded: 'Технологии (Бренды)',
  activity: 'Блок-схемы / Activity',
}

export default function ComponentPalette({ onComponentClick, onRecommendationClick, onClose }: ComponentPaletteProps) {
  const [position, setPosition] = useState({ x: 20, y: 20 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<ComponentCategory>('all')
  const paletteRef = useRef<HTMLDivElement>(null)

  // Функция нормализации для игнорирования различий между RU и UA раскладками
  const normalize = (str: string) => {
    return str.toLowerCase()
      .replace(/[иііїы]/g, 'и')
      .replace(/[еєэё]/g, 'е')
      .trim();
  };

  // Фильтрация компонентов
  const filteredComponents = components.filter(component => {
    if (searchQuery === '') {
      return selectedCategory === 'all' || component.category === selectedCategory
    }

    const q = normalize(searchQuery)
    const label = normalize(component.label)
    const type = normalize(component.type)

    const matchesSearch = label.includes(q) || type.includes(q)
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

  const handleDragStart = (e: React.DragEvent, type: ComponentType, label: string) => {
    e.dataTransfer.setData('application/reactflow', type)
    e.dataTransfer.setData('application/reactflow-label', label)
    e.dataTransfer.setData('text/plain', type)
    e.dataTransfer.effectAllowed = 'move'
  }

  return (
    <div
      style={{
        position: 'fixed',
        left: 0,
        top: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(10px)',
        zIndex: 2000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        animation: 'paletteFadeIn 0.3s ease-out',
      }}
      onClick={onClose}
    >
      <style>{`
        @keyframes paletteFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes paletteSlideUp {
          from { opacity: 0; transform: translateY(20px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>

      <div
        ref={paletteRef}
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '900px',
          maxWidth: '95vw',
          height: '80vh',
          backgroundColor: '#1a1a1a',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '24px',
          padding: '32px',
          boxShadow: '0 32px 64px -12px rgba(0, 0, 0, 0.7)',
          display: 'flex',
          flexDirection: 'column',
          animation: 'paletteSlideUp 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '24px',
            paddingBottom: '20px',
            borderBottom: '1px solid rgba(255,255,255,0.05)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              backgroundColor: 'rgba(77, 171, 247, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Layout color="#4dabf7" size={24} />
            </div>
            <div>
              <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#fff', margin: 0 }}>Палитра компонентов</h2>
              <p style={{ fontSize: '13px', color: '#666', margin: '4px 0 0 0' }}>Выберите элемент для добавления в архитектуру</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            {onRecommendationClick && (
              <button
                onClick={onRecommendationClick}
                style={{
                  background: 'rgba(255, 212, 59, 0.1)',
                  border: 'none',
                  color: '#ffd43b',
                  cursor: 'pointer',
                  padding: '8px 16px',
                  borderRadius: '12px',
                  fontSize: '14px',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 212, 59, 0.2)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 212, 59, 0.1)'}
              >
                <Lightbulb size={16} /> Рекомендации
              </button>
            )}
            <button
              onClick={onClose}
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                backgroundColor: 'rgba(255,255,255,0.05)',
                border: 'none',
                color: '#888',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 68, 68, 0.1)'
                e.currentTarget.style.color = '#ff6b6b'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'
                e.currentTarget.style.color = '#888'
              }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Поиск и категории */}
        <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search
              size={18}
              color="#555"
              style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }}
            />
            <input
              type="text"
              placeholder="Быстрый поиск по названию или типу..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                backgroundColor: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.05)',
                borderRadius: '16px',
                padding: '16px 16px 16px 48px',
                color: '#fff',
                fontSize: '16px',
                outline: 'none',
                transition: 'all 0.2s',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => e.target.style.borderColor = '#4dabf7'}
              onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.05)'}
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value as ComponentCategory)}
            style={{
              backgroundColor: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.05)',
              borderRadius: '16px',
              padding: '0 20px',
              color: '#fff',
              fontSize: '14px',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            {Object.entries(categoryLabels).map(([id, label]) => (
              <option key={id} value={id} style={{ backgroundColor: '#1a1a1a' }}>{label}</option>
            ))}
          </select>
        </div>

        {/* Сетка компонентов */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
            gap: '12px',
            paddingRight: '8px'
          }}
          className="custom-scrollbar"
        >
          <style>{`
            .custom-scrollbar::-webkit-scrollbar { width: 6px; }
            .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
            .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }
          `}</style>

          {filteredComponents.map((component, idx) => (
            <div
              key={`${component.type}-${idx}`}
              onClick={() => {
                onComponentClick(component.type, component.label)
                if (onClose) onClose()
              }}
              className="palette-item"
              style={{
                backgroundColor: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.05)',
                borderRadius: '18px',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '12px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                textAlign: 'center',
              }}
            >
              <div style={{
                width: '52px',
                height: '52px',
                borderRadius: '14px',
                background: `linear-gradient(135deg, ${component.color}15, ${component.color}08)`,
                border: `1.5px solid ${component.color}30`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: component.color,
                transition: 'all 0.3s ease',
              }}>
                {React.cloneElement(component.icon as React.ReactElement, { size: 28 })}
              </div>
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#eee', lineHeight: 1.2 }}>
                {component.label}
              </span>

              <style>{`
                .palette-item:hover {
                  background-color: rgba(255,255,255,0.06);
                  border-color: rgba(255,255,255,0.15);
                  transform: translateY(-4px);
                  box-shadow: 0 12px 24px -8px rgba(0,0,0,0.5);
                }
                .palette-item:hover > div {
                  transform: scale(1.1);
                  border-color: ${component.color}80;
                  background-color: ${component.color}25;
                }
              `}</style>
            </div>
          ))}
        </div>

        <div style={{
          marginTop: '20px',
          paddingTop: '16px',
          borderTop: '1px solid rgba(255,255,255,0.05)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          color: '#444',
          fontSize: '11px'
        }}>
          <div>Всего компонентов: {filteredComponents.length}</div>
          <div style={{ display: 'flex', gap: '16px' }}>
            <span><kbd style={{ background: '#333', padding: '2px 4px', borderRadius: '4px' }}>ESC</kbd> Закрыть</span>
            <span><kbd style={{ background: '#333', padding: '2px 4px', borderRadius: '4px' }}>ENTER</kbd> Добавить</span>
          </div>
        </div>
      </div>
    </div>
  )
}
