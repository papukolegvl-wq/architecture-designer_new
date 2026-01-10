import React, { useState, useEffect, useRef } from 'react'
import { Handle, Position, NodeProps, useStore, useReactFlow, NodeResizer } from 'reactflow'
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
  ShieldCheck,
  Eye,
  Book,
  History,
  Waves,
  Repeat,
  LayoutDashboard,
  Calendar,
  Maximize2,
  Minimize2,
  Briefcase,
  Share2,
  Users,
  Image as ImageIcon,
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
  'cdc-service': <History size={32} />,
  'data-quality': <ShieldCheck size={32} />,
  'data-observability': <Eye size={32} />,
  'metadata-catalog': <Book size={32} />,
  'reverse-etl': <Repeat size={32} />,
  'feature-store': <Warehouse size={32} />,
  lakehouse: <Waves size={32} />,
  dashboard: <LayoutDashboard size={32} />,
  'workflow-engine': <Workflow size={32} />,
  scheduler: <Calendar size={32} />,
  volume: <HardDrive size={32} />,
  cpu: <Cpu size={32} />,
  vcs: <GitBranch size={32} />,
  customer: <User size={32} />,
  developer: <Briefcase size={32} />,
  analyst: <BarChart3 size={32} />,
  devops: <Settings size={32} />,
  architect: <Share2 size={32} />,
  'product-manager': <Briefcase size={32} />,
  team: <Users size={32} />,
  image: <ImageIcon size={32} />,
}

const componentColors: Record<string, string> = {
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
  controller: '#4dabf7',
  repository: '#51cf66',
  class: '#845ef7',
  server: '#339af0',
  container: '#51cf66',
  orchestrator: '#20c997',
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
  'cdc-service': '#fab005',
  'data-quality': '#40c057',
  'data-observability': '#228be6',
  'metadata-catalog': '#7950f2',
  'reverse-etl': '#be4bdb',
  'feature-store': '#fd7e14',
  lakehouse: '#15aabf',
  'business-process': '#ae3ec9',
  dashboard: '#339af0',
  'workflow-engine': '#845ef7',
  scheduler: '#ffd43b',
  volume: '#666',
  cpu: '#ffa94d',
  vcs: '#F06595',
  customer: '#ff8787',
  developer: '#ae3ec9',
  analyst: '#ffd43b',
  devops: '#f03e3e',
  architect: '#be4bdb',
  'product-manager': '#20c997',
  team: '#4dabf7',
  image: '#fab005',
}

interface CustomNodeProps extends NodeProps<ComponentData> {
  onInfoClick?: (componentType: ComponentType) => void
  onLinkClick?: (link: ComponentLink) => void
  onLinkConfigClick?: (nodeId: string) => void
  onCommentClick?: (nodeId: string) => void
  onStatusChange?: (nodeId: string, status: 'new' | 'existing') => void
}

export const getActorShape = (type: string, color: string, size: number = 64) => {
  const bodyBaseStyle = { fill: 'none', stroke: color, strokeWidth: 2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  const fillStyle = { fill: `${color}20`, stroke: color, strokeWidth: 2 };

  switch (type) {
    case 'developer':
      return (
        <svg width={size} height={size} viewBox="0 0 100 100" style={{ margin: '0 auto' }}>
          {/* Detailed Developer Figure */}
          <circle cx="50" cy="15" r="10" fill={color} />
          <path d="M25,35 Q50,25 75,35 L85,75 Q85,85 75,85 L25,85 Q15,85 15,75 Z" style={fillStyle} />
          {/* Laptop symbol on torso */}
          <rect x="35" y="45" width="30" height="20" rx="2" style={{ fill: 'none', stroke: color, strokeWidth: 1.5 }} />
          <line x1="40" y1="52" x2="60" y2="52" stroke={color} strokeWidth="1" />
          <line x1="40" y1="58" x2="55" y2="58" stroke={color} strokeWidth="1" />
          <path d="M30,85 L70,85 L75,95 L25,95 Z" fill={color} />
        </svg>
      );
    case 'analyst':
      return (
        <svg width={size} height={size} viewBox="0 0 100 100" style={{ margin: '0 auto' }}>
          {/* Detailed Analyst Figure */}
          <circle cx="50" cy="15" r="10" fill={color} />
          <path d="M25,35 Q50,25 75,35 L85,75 Q85,85 75,85 L25,85 Q15,85 15,75 Z" style={fillStyle} />
          {/* Chart symbol on torso */}
          <line x1="35" y1="70" x2="65" y2="70" stroke={color} strokeWidth="2" />
          <rect x="38" y="55" width="6" height="15" fill={color} />
          <rect x="47" y="45" width="6" height="25" fill={color} />
          <rect x="56" y="50" width="6" height="20" fill={color} />
          {/* Magnifying glass or pointing stick */}
          <line x1="75" y1="40" x2="90" y2="25" stroke={color} strokeWidth="3" strokeLinecap="round" />
        </svg>
      );
    case 'devops':
      return (
        <svg width={size} height={size} viewBox="0 0 100 100" style={{ margin: '0 auto' }}>
          {/* Detailed DevOps Figure */}
          <circle cx="50" cy="15" r="10" fill={color} />
          <path d="M25,35 Q50,25 75,35 L85,75 Q85,85 75,85 L25,85 Q15,85 15,75 Z" style={fillStyle} />
          {/* Gear/Infinity symbol on torso */}
          <circle cx="42" cy="60" r="8" style={{ fill: 'none', stroke: color, strokeWidth: 2 }} />
          <circle cx="58" cy="60" r="8" style={{ fill: 'none', stroke: color, strokeWidth: 2 }} />
          <path d="M30,25 Q15,35 15,50 L25,50" style={bodyBaseStyle} />
          <path d="M70,25 Q85,35 85,50 L75,50" style={bodyBaseStyle} />
          {/* Wrench symbol */}
          <path d="M65,40 L85,20 M80,15 L90,25" stroke={color} strokeWidth="3" strokeLinecap="round" />
        </svg>
      );
    case 'architect':
      return (
        <svg width={size} height={size} viewBox="0 0 100 100" style={{ margin: '0 auto' }}>
          <circle cx="50" cy="15" r="10" fill={color} />
          <path d="M20,35 Q50,25 80,35 L90,75 Q90,85 80,85 L20,85 Q10,85 10,75 Z" style={fillStyle} />
          {/* Blueprint/Structure lines */}
          <rect x="35" y="45" width="30" height="30" style={{ fill: 'none', stroke: color, strokeWidth: 1.5 }} />
          <line x1="35" y1="45" x2="65" y2="75" stroke={color} strokeWidth="1" />
          <line x1="65" y1="45" x2="35" y2="75" stroke={color} strokeWidth="1" />
          <circle cx="50" cy="60" r="4" fill={color} />
        </svg>
      );
    case 'security-engineer':
      return (
        <svg width={size} height={size} viewBox="0 0 100 100" style={{ margin: '0 auto' }}>
          <circle cx="50" cy="15" r="10" fill={color} />
          <path d="M25,35 Q50,25 75,35 L85,75 Q85,85 75,85 L25,85 Q15,85 15,75 Z" style={fillStyle} />
          {/* Shield/Shield-check on torso */}
          <path d="M42,48 Q50,45 58,48 L58,60 Q50,68 42,60 Z" style={{ fill: 'none', stroke: color, strokeWidth: 1.5 }} />
          <path d="M46,55 L49,58 L54,52" stroke={color} strokeWidth="1.5" fill="none" />
          <path d="M30,85 L70,85 L80,95 L20,95 Z" fill={color} opacity="0.6" />
        </svg>
      );
    case 'qa-engineer':
      return (
        <svg width={size} height={size} viewBox="0 0 100 100" style={{ margin: '0 auto' }}>
          <circle cx="50" cy="15" r="10" fill={color} />
          <path d="M25,35 Q50,25 75,35 L85,75 Q85,85 75,85 L25,85 Q15,85 15,75 Z" style={fillStyle} />
          {/* Bug icon or Magnifying glass */}
          <circle cx="50" cy="55" r="8" style={{ fill: 'none', stroke: color, strokeWidth: 1.5 }} />
          <line x1="56" y1="61" x2="65" y2="70" stroke={color} strokeWidth="2" strokeLinecap="round" />
          <path d="M46,55 L49,58 L54,52" stroke={color} strokeWidth="1.5" fill="none" />
        </svg>
      );
    case 'dba':
      return (
        <svg width={size} height={size} viewBox="0 0 100 100" style={{ margin: '0 auto' }}>
          <circle cx="50" cy="15" r="10" fill={color} />
          <path d="M25,35 Q50,25 75,35 L85,75 Q85,85 75,85 L25,85 Q15,85 15,75 Z" style={fillStyle} />
          {/* Database symbol on torso */}
          <ellipse cx="50" cy="50" rx="12" ry="4" style={{ fill: 'none', stroke: color, strokeWidth: 1.5 }} />
          <path d="M38,50 L38,65 Q50,70 62,65 L62,50" style={{ fill: 'none', stroke: color, strokeWidth: 1.5 }} />
          <ellipse cx="50" cy="58" rx="12" ry="4" style={{ fill: 'none', stroke: color, strokeWidth: 1 }} opacity="0.5" />
        </svg>
      );
    case 'designer':
      return (
        <svg width={size} height={size} viewBox="0 0 100 100" style={{ margin: '0 auto' }}>
          <circle cx="50" cy="15" r="10" fill={color} />
          <path d="M25,35 Q50,25 75,35 L85,75 Q85,85 75,85 L25,85 Q15,85 15,75 Z" style={fillStyle} />
          {/* Palette or Bezier curve */}
          <path d="M35,65 Q50,45 65,65" stroke={color} strokeWidth="2" fill="none" strokeDasharray="3,2" />
          <circle cx="35" cy="65" r="3" fill={color} />
          <circle cx="65" cy="65" r="3" fill={color} />
          <circle cx="50" cy="45" r="3" fill={color} />
          <path d="M45,75 L55,75" stroke={color} strokeWidth="3" strokeLinecap="round" />
        </svg>
      );
    case 'sre-engineer':
      return (
        <svg width={size} height={size} viewBox="0 0 100 100" style={{ margin: '0 auto' }}>
          <circle cx="50" cy="15" r="10" fill={color} />
          <path d="M25,35 Q50,25 75,35 L85,75 Q85,85 75,85 L25,85 Q15,85 15,75 Z" style={fillStyle} />
          {/* Heart rate / Pulse line */}
          <path d="M35,65 L43,65 L48,45 L52,75 L57,65 L65,65" stroke={color} strokeWidth="2" fill="none" />
          {/* Small gear icon */}
          <circle cx="80" cy="40" r="5" style={{ fill: 'none', stroke: color, strokeWidth: 1.5 }} />
        </svg>
      );
    case 'data-scientist':
      return (
        <svg width={size} height={size} viewBox="0 0 100 100" style={{ margin: '0 auto' }}>
          <circle cx="50" cy="15" r="10" fill={color} />
          <path d="M25,35 Q50,25 75,35 L85,75 Q85,85 75,85 L25,85 Q15,85 15,75 Z" style={fillStyle} />
          {/* Atom or Network node symbol */}
          <circle cx="50" cy="55" r="4" fill={color} />
          <circle cx="38" cy="65" r="3" fill={color} />
          <circle cx="62" cy="65" r="3" fill={color} />
          <circle cx="50" cy="75" r="3" fill={color} />
          <line x1="50" y1="55" x2="38" y2="65" stroke={color} strokeWidth="1" />
          <line x1="50" y1="55" x2="62" y2="65" stroke={color} strokeWidth="1" />
          <line x1="50" y1="55" x2="50" y2="75" stroke={color} strokeWidth="1" />
        </svg>
      );
    case 'support':
      return (
        <svg width={size} height={size} viewBox="0 0 100 100" style={{ margin: '0 auto' }}>
          <circle cx="50" cy="15" r="10" fill={color} />
          <path d="M25,35 Q50,25 75,35 L85,75 Q85,85 75,85 L25,85 Q15,85 15,75 Z" style={fillStyle} />
          {/* Headset symbol */}
          <path d="M35,15 Q35,5 50,5 Q65,5 65,15" stroke={color} strokeWidth="2" fill="none" />
          <rect x="30" y="15" width="6" height="10" rx="2" fill={color} />
          <rect x="64" y="15" width="6" height="10" rx="2" fill={color} />
          {/* Chat bubble on torso */}
          <rect x="40" y="50" width="20" height="12" rx="3" style={{ fill: 'none', stroke: color, strokeWidth: 1.5 }} />
          <path d="M45,62 L45,67 L50,62" fill={color} />
        </svg>
      );
    case 'compliance-officer':
      return (
        <svg width={size} height={size} viewBox="0 0 100 100" style={{ margin: '0 auto' }}>
          <circle cx="50" cy="15" r="10" fill={color} />
          <path d="M25,35 Q50,25 75,35 L85,75 Q85,85 75,85 L25,85 Q15,85 15,75 Z" style={fillStyle} />
          {/* Scales or Document symbol */}
          <line x1="35" y1="50" x2="65" y2="50" stroke={color} strokeWidth="2" />
          <path d="M35,50 L30,65 Q35,70 40,65 Z" style={{ fill: 'none', stroke: color, strokeWidth: 1 }} />
          <path d="M65,50 L60,65 Q65,70 70,65 Z" style={{ fill: 'none', stroke: color, strokeWidth: 1 }} />
          <line x1="50" y1="45" x2="50" y2="75" stroke={color} strokeWidth="2" />
        </svg>
      );
    case 'product-manager':
      return (
        <svg width={size} height={size} viewBox="0 0 100 100" style={{ margin: '0 auto' }}>
          <circle cx="50" cy="15" r="10" fill={color} />
          <path d="M25,35 Q50,25 75,35 L85,75 Q85,85 75,85 L25,85 Q15,85 15,75 Z" style={fillStyle} />
          {/* Checkbox/List symbol */}
          <rect x="35" y="45" width="30" height="30" rx="3" style={{ fill: 'none', stroke: color, strokeWidth: 1.5 }} />
          <path d="M42,60 L48,65 L58,55" stroke={color} strokeWidth="2" fill="none" />
          <line x1="40" y1="75" x2="60" y2="75" stroke={color} strokeWidth="1" />
        </svg>
      );
    case 'customer':
      return (
        <svg width={size} height={size} viewBox="0 0 100 100" style={{ margin: '0 auto' }}>
          <circle cx="50" cy="15" r="10" fill={color} />
          <path d="M20,35 Q50,30 80,35 L85,80 Q85,90 70,90 L30,90 Q15,90 15,80 Z" style={fillStyle} />
          {/* Wallet/Money symbol */}
          <circle cx="50" cy="60" r="12" style={{ fill: 'none', stroke: color, strokeWidth: 2 }} />
          <text x="50" y="65" fill={color} fontSize="14" fontWeight="bold" textAnchor="middle" style={{ userSelect: 'none' }}>$</text>
        </svg>
      );
    case 'team':
      return (
        <svg width={size} height={size} viewBox="0 0 100 100" style={{ margin: '0 auto' }}>
          {/* Multiple figures */}
          <circle cx="35" cy="20" r="8" fill={color} />
          <path d="M20,40 Q35,35 50,40 L55,75 Q55,82 45,82 L25,82 Q15,82 15,75 Z" style={fillStyle} />

          <circle cx="65" cy="25" r="8" fill={color} />
          <path d="M50,45 Q65,40 80,45 L85,80 Q85,87 75,87 L55,87 Q45,87 45,80 Z" style={{ ...fillStyle, fill: `${color}40` }} />
        </svg>
      );
    default:
      return null;
  }
}


function CustomNode({ data, selected, id, onInfoClick, onLinkClick, onLinkConfigClick, onStatusChange }: CustomNodeProps) {
  const icon = componentIcons[data.type] || <Server size={32} />
  const color = data.color || componentColors[data.type] || '#4dabf7'
  const [isEditing, setIsEditing] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [label, setLabel] = useState(data.label)
  const inputRef = useRef<HTMLInputElement>(null)

  // Expandable Frame Logic
  const { getNodes } = useReactFlow()
  const [isExpanded, setIsExpanded] = useState(data.isExpanded || false)
  const isMounted = useRef(true)
  const [childNodes, setChildNodes] = useState<string[]>(data.childNodes || [])
  const [isManuallyResized, setIsManuallyResized] = useState(data.isManuallyResized || false)

  useEffect(() => {
    isMounted.current = true
    return () => { isMounted.current = false }
  }, [])

  useEffect(() => {
    if (data.isExpanded !== undefined) setIsExpanded(data.isExpanded)
  }, [data.isExpanded])

  const updateSize = React.useCallback(() => {
    if (!isExpanded || !isMounted.current) return
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

    let insideNodes = allNodes.filter(node => {
      if (node.id === id || node.parentNode === id || node.type === 'system') return false
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

    if (childrenChanged && isMounted.current) {
      setChildNodes(childIds)
    }

    if (childrenChanged || (!isManuallyResized && insideNodes.length > 0)) {
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
      insideNodes.forEach(node => {
        const nodeX = node.position.x
        const nodeY = node.position.y
        const nodeWidth = node.width || 200
        const nodeHeight = node.height || 120
        minX = Math.min(minX, nodeX)
        minY = Math.min(minY, nodeY)
        maxX = Math.max(maxX, nodeX + nodeWidth)
        maxY = Math.max(maxY, nodeY + nodeHeight)
      })

      let newWidth = thisNode.width || minWidth
      let newHeight = thisNode.height || minHeight

      if (!isManuallyResized && insideNodes.length > 0) {
        newWidth = Math.max(minWidth, maxX - minX + padding * 2)
        newHeight = Math.max(minHeight, maxY - minY + padding * 2)
      }

      if (thisNode.width !== newWidth || thisNode.height !== newHeight || childrenChanged) {
        const event = new CustomEvent('containerSizeUpdate', {
          detail: {
            containerId: id,
            childNodes: childIds,
            width: newWidth,
            height: newHeight,
            position: { x: containerX, y: containerY },
          },
        })
        window.dispatchEvent(event)
      }
    }
  }, [id, getNodes, isManuallyResized, childNodes, isExpanded])

  useEffect(() => {
    if (isExpanded && isMounted.current) {
      setTimeout(updateSize, 0)
      const interval = setInterval(updateSize, 2000)
      return () => clearInterval(interval)
    }
  }, [updateSize, isExpanded])

  useEffect(() => {
    if (!isExpanded) return
    const handleNodesChange = () => { if (isMounted.current) updateSize() }
    window.addEventListener('nodesChange', handleNodesChange)
    return () => window.removeEventListener('nodesChange', handleNodesChange)
  }, [updateSize, isExpanded])

  const toggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation()
    const newExpanded = !isExpanded
    setIsExpanded(newExpanded)
    const event = new CustomEvent('nodeDataUpdate', {
      detail: { nodeId: id, data: { ...data, isExpanded: newExpanded } }
    })
    window.dispatchEvent(event)
  }

  /* Optimization: Subscribe to specific zoom thresholds to avoid re-rendering on every zoom frame */
  const isSimple = useStore((s) => s.transform[2] < 0.4)
  const isMedium = useStore((s) => s.transform[2] < 0.7)

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

  const handleInfoClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    if (onInfoClick) {
      onInfoClick(data.type)
    }
  }

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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Останавливаем распространение события, чтобы глобальный обработчик не удалял компонент
    e.stopPropagation()

    if (e.key === 'Enter') {
      handleBlur()
    } else if (e.key === 'Escape') {
      setLabel(data.label)
      setIsEditing(false)
    }
    // Backspace и Delete обрабатываются нормально в input, не блокируем их
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
      const parts: string[] = []
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
        if (languageLabels[data.serviceConfig.language]) {
          parts.push(languageLabels[data.serviceConfig.language])
        }
      }
      if (data.serviceConfig?.endpoints && data.serviceConfig.endpoints.length > 0) {
        parts.push(`${data.serviceConfig.endpoints.length} EP`)
      }
      return parts.length > 0 ? parts.join(' | ') : 'Service'
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
    } else if (data.type === 'image') {
      return 'Изображение'
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
      if (data.serverConfig?.vendor) return data.serverConfig.vendor
      return 'Server'
    } else if (data.type === 'orchestrator') {
      if (data.orchestratorConfig?.vendor) return data.orchestratorConfig.vendor
      return 'Orchestrator'
    } else if (data.type === 'group') {
      return 'Group'
    } else if (data.type === 'service-discovery') {
      return 'Service Discovery'
    } else if (data.type === 'web-server') {
      if (data.webServerConfig?.vendor) return data.webServerConfig.vendor
      return 'Web Server'
    } else if (data.type === 'monitoring') {
      if (data.monitoringConfig?.vendor) {
        return data.monitoringConfig.vendor
      }
      return 'Monitoring'
    } else if (data.type === 'logging') {
      if (data.loggingConfig?.vendor) {
        return data.loggingConfig.vendor
      }
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
    } else if (data.type === 'internet-gateway') {
      if (data.internetGatewayConfig?.vendor) return data.internetGatewayConfig.vendor
      return 'Internet Gateway'
    } else if (data.type === 'nat-gateway') {
      if (data.natGatewayConfig?.vendor) return data.natGatewayConfig.vendor
      return 'NAT Gateway'
    } else if (data.type === 'edge-computing') {
      if (data.edgeComputingConfig?.vendor) return data.edgeComputingConfig.vendor
      return 'Edge Computing'
    } else if (data.type === 'iot-gateway') {
      if (data.iotGatewayConfig?.vendor) return data.iotGatewayConfig.vendor
      return 'IoT Gateway'
    } else if (data.type === 'block-storage') {
      if (data.blockStorageConfig?.vendor) return data.blockStorageConfig.vendor
      return 'Block Storage'
    } else if (data.type === 'file-storage') {
      if (data.fileStorageConfig?.vendor) return data.fileStorageConfig.vendor
      return 'File Storage'
    } else if (data.type === 'archive-storage') {
      if (data.archiveStorageConfig?.vendor) return data.archiveStorageConfig.vendor
      return 'Archive Storage'
    } else if (data.type === 'llm-model') {
      if (data.llmModelConfig?.vendor) return data.llmModelConfig.vendor
      return 'LLM Model'
    } else if (data.type === 'ai-agent') {
      if (data.aiAgentConfig?.vendor) return data.aiAgentConfig.vendor
      return 'AI Agent'
    } else if (data.type === 'ml-training') {
      if (data.mlTrainingConfig?.vendor) return data.mlTrainingConfig.vendor
      return 'ML Training'
    } else if (data.type === 'ml-inference') {
      if (data.mlInferenceConfig?.vendor) return data.mlInferenceConfig.vendor
      return 'ML Inference'
    } else if (data.type === 'ml-data-pipeline') {
      if (data.mlDataPipelineConfig?.vendor) return data.mlDataPipelineConfig.vendor
      return 'ML Pipeline'
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
    } else if (data.type === 'cdc-service') {
      if (data.cdcServiceConfig?.vendor) return data.cdcServiceConfig.vendor
      return 'CDC'
    } else if (data.type === 'data-quality') {
      if (data.dataQualityConfig?.vendor) return data.dataQualityConfig.vendor
      return 'Data Quality'
    } else if (data.type === 'data-observability') {
      if (data.dataObservabilityConfig?.vendor) return data.dataObservabilityConfig.vendor
      return 'Observability'
    } else if (data.type === 'metadata-catalog') {
      if (data.metadataCatalogConfig?.vendor) return data.metadataCatalogConfig.vendor
      return 'Metadata'
    } else if (data.type === 'reverse-etl') {
      if (data.reverseEtlConfig?.vendor) return data.reverseEtlConfig.vendor
      return 'Reverse ETL'
    } else if (data.type === 'feature-store') {
      if (data.featureStoreConfig?.vendor) return data.featureStoreConfig.vendor
      return 'Feature Store'
    } else if (data.type === 'lakehouse') {
      if (data.lakehouseConfig?.vendor) return data.lakehouseConfig.vendor
      return 'Lakehouse'
    } else if (data.type === 'business-process') {
      return 'Business Process'
    } else if (data.type === 'dashboard') {
      return 'Dashboard'
    } else if (data.type === 'workflow-engine') {
      if (data.workflowEngineConfig?.vendor) {
        return data.workflowEngineConfig.vendor
      }
      return 'Workflow Engine'
    } else if (data.type === 'scheduler') {
      if (data.schedulerConfig?.vendor) {
        return data.schedulerConfig.vendor
      }
      return 'Scheduler'
    } else if (data.type === 'soc-siem') {
      if (data.socSiemConfig?.vendor) {
        return data.socSiemConfig.vendor
      }
      return 'SOC / SIEM'
    }
    return data.connectionType === 'sync' ? 'Sync' : 'Async'
  }

  // Определяем стили для новых компонентов - более яркое выделение
  const isNew = data.status === 'new'
  const borderColor = selected
    ? color
    : data.status === 'new'
      ? '#40c057' // Более яркий зеленый
      : data.status === 'existing'
        ? '#ffa94d'
        : '#444'
  const borderStyle = data.status === 'new'
    ? 'dashed'
    : data.status === 'existing'
      ? 'double'
      : 'solid'
  const borderWidth = data.status === 'existing' ? '3px' : data.status === 'new' ? '4px' : '2px' // Увеличена толщина для новых

  // Для новых компонентов добавляем очень яркую подсветку
  const boxShadow = isNew
    ? selected
      ? `0 8px 40px ${color}70, 0 0 0 3px ${color}40, 0 0 30px #40c05780, 0 0 60px #40c05740, 0 0 90px #40c05720`
      : `0 4px 20px rgba(0,0,0,0.5), 0 0 25px #40c05770, 0 0 50px #40c05750, 0 0 75px #40c05730`
    : selected
      ? `0 8px 24px ${color}50, 0 0 0 2px ${color}30`
      : '0 4px 12px rgba(0,0,0,0.4)'

  // Для новых компонентов добавляем более яркую зеленую подсветку фона
  const backgroundColor = isNew ? '#1a2e1a' : '#1e1e1e' // Более зеленый фон

  return (
    <div
      style={{
        padding: isExpanded ? '20px' : (isSimple ? '8px' : '16px 20px'),
        borderRadius: '12px',
        background: isSimple && !isExpanded ? color : (isExpanded ? color + '10' : backgroundColor),
        border: `${borderWidth} ${borderStyle} ${selected ? color : isSimple && !isExpanded ? 'transparent' : borderColor}`,
        color: '#f8f9fa',
        width: isExpanded ? '100%' : (isSimple ? '60px' : '240px'),
        height: isExpanded ? '100%' : 'auto',
        minHeight: isSimple ? '60px' : '110px',
        boxShadow: isExpanded ? 'none' : boxShadow,
        transition: isManuallyResized ? 'none' : 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: isExpanded ? 'flex-start' : 'center',
        justifyContent: isSimple ? 'center' : 'flex-start',
        borderLeft: isSimple && !isExpanded ? `none` : `${borderWidth} solid ${color}`,
        overflow: 'visible',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onDoubleClick={handleDoubleClick}
    >
      <NodeResizer
        color={borderColor}
        isVisible={selected}
        minWidth={300}
        minHeight={200}
        onResizeStart={() => {
          setIsManuallyResized(true)
          // Auto-expand when user starts resizing
          if (!isExpanded) {
            setIsExpanded(true)
            const expandEvent = new CustomEvent('nodeDataUpdate', {
              detail: { nodeId: id, data: { ...data, isExpanded: true } }
            })
            window.dispatchEvent(expandEvent)
          }
          const event = new CustomEvent('containerManualResize', {
            detail: { containerId: id, isManuallyResized: true }
          })
          window.dispatchEvent(event)
        }}
      />

      <button
        onClick={toggleExpand}
        style={{
          position: 'absolute',
          top: -12,
          left: -12,
          width: 24,
          height: 24,
          borderRadius: '50%',
          backgroundColor: '#1e1e1e',
          border: `2px solid ${borderColor}`,
          color: borderColor,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          zIndex: 50,
          opacity: isHovered || selected || isExpanded ? 1 : 0,
          pointerEvents: isHovered || selected || isExpanded ? 'auto' : 'none',
          transition: 'all 0.2s'
        }}
        title={isExpanded ? "Свернуть" : "Развернуть как рамку"}
      >
        {isExpanded ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
      </button>

      {/* Child count indicator for expanded view */}
      {isExpanded && childNodes.length > 0 && (
        <div style={{
          position: 'absolute',
          bottom: '8px',
          right: '8px',
          fontSize: '10px',
          color: '#888'
        }}>
          Внутри: {childNodes.length}
        </div>
      )}
      {!isSimple && (
        <div
          style={{
            position: 'absolute',
            top: '8px',
            right: '8px',
            display: 'flex',
            gap: '4px',
            opacity: isHovered ? 1 : 0,
            transition: 'opacity 0.2s',
            zIndex: 100,
          }}
        >
          {/* Link status indicator */}
          {data.link && (
            <div
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: '#51cf66',
                boxShadow: '0 0 5px #51cf66',
                margin: 'auto 4px',
              }}
              title={`Связан с: ${data.link.label || data.link.targetNodeId}`}
            />
          )}

          {/* Status button */}
          {onStatusChange && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                const newStatus = data.status === 'new' ? 'existing' : data.status === 'existing' ? undefined : 'new'
                onStatusChange(id, newStatus as any)
              }}
              style={{
                background: 'rgba(0,0,0,0.5)',
                border: 'none',
                borderRadius: '4px',
                color: data.status === 'new' ? '#51cf66' : data.status === 'existing' ? '#ffd43b' : '#888',
                padding: '4px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              title="Изменить статус"
            >
              {data.status === 'new' ? <Sparkles size={12} /> : data.status === 'existing' ? <CheckCircle size={12} /> : <Settings size={12} />}
            </button>
          )}

          {/* Link buttons */}
          {data.link && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                if (onLinkClick) onLinkClick(data.link!)
              }}
              style={{
                background: 'rgba(0,0,0,0.5)',
                border: 'none',
                borderRadius: '4px',
                color: '#51cf66',
                padding: '4px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              title="Перейти по ссылке"
            >
              <LinkIcon size={12} />
            </button>
          )}

          <button
            onClick={(e) => {
              e.stopPropagation()
              if (onLinkConfigClick) onLinkConfigClick(id)
            }}
            style={{
              background: 'rgba(0,0,0,0.5)',
              border: 'none',
              borderRadius: '4px',
              color: data.link ? '#51cf66' : '#888',
              padding: '4px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            title={data.link ? 'Изменить ссылку' : 'Добавить ссылку'}
          >
            <Link2 size={12} />
          </button>

          <button
            onClick={handleInfoClick}
            style={{
              background: 'rgba(0,0,0,0.5)',
              border: 'none',
              borderRadius: '4px',
              color: color,
              padding: '4px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            title="Инфо"
          >
            <Info size={12} />
          </button>
        </div>
      )}

      {/* Генерируем точки подключения по всему периметру */}
      {([Position.Top, Position.Bottom, Position.Left, Position.Right] as Position[]).map((pos) =>
        [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map((p) => {
          const isHorizontal = pos === Position.Top || pos === Position.Bottom;
          const isCenter = p === 50;
          const targetId = `${pos}-target-${p}`;
          const sourceId = `${pos}-source-${p}`;

          const isTargetConnected = connectedHandleIds.includes(targetId);
          const isSourceConnected = connectedHandleIds.includes(sourceId);

          // ОПТИМИЗАЦИЯ: Всегда рендерим handle в DOM, чтобы ReactFlow мог их измерить,
          // но скрываем визуально и отключаем события, если они не нужны
          const isVisible = isHovered || isConnecting || wasConnecting || isCenter || isTargetConnected || isSourceConnected || selected;

          const style: React.CSSProperties = {
            [isHorizontal ? 'left' : 'top']: `${p}%`,
            [pos]: '-5px',
            opacity: isVisible ? (isCenter ? 0.8 : 0.4) : 0,
            borderRadius: '50%',
            width: isCenter ? '12px' : '8px',
            height: isCenter ? '12px' : '8px',
            background: isCenter ? color : `${color}80`,
            border: isCenter ? `2px solid #fff` : `1px solid ${color}`,
            cursor: 'crosshair',
            transform: isHorizontal ? 'translateX(-50%)' : 'translateY(-50%)',
            zIndex: isCenter ? 30 : 25,
            pointerEvents: isVisible ? 'all' : 'none',
            transition: 'opacity 0.2s',
          };

          return (
            <React.Fragment key={`${pos}-${p}`}>
              <Handle
                type="target"
                position={pos}
                id={targetId}
                style={style}
              />
              <Handle
                type="source"
                position={pos}
                id={sourceId}
                style={style}
              />
            </React.Fragment>
          );
        })
      )}

      {/* BACKWARD COMPATIBILITY: Добавляем handles со старым форматом ID для существующих edges */}
      {([Position.Top, Position.Bottom, Position.Left, Position.Right] as Position[]).map((pos) => {
        const oldTargetId = `${pos}-target`;
        const oldSourceId = `${pos}-source`;

        const isTargetConnected = connectedHandleIds.includes(oldTargetId);
        const isSourceConnected = connectedHandleIds.includes(oldSourceId);

        // Всегда рендерим для стабильности
        const isVisible = isTargetConnected || isSourceConnected || (isHovered && isConnecting) || wasConnecting || selected;

        const isHorizontal = pos === Position.Top || pos === Position.Bottom;
        const style: React.CSSProperties = {
          width: '8px',
          height: '8px',
          background: color,
          border: `2px solid #fff`,
          cursor: 'crosshair',
          transform: isHorizontal ? 'translateX(-50%)' : 'translateY(-50%)',
          zIndex: 30,
          opacity: isVisible ? 1 : 0,
          pointerEvents: isVisible ? 'all' : 'none',
          transition: 'opacity 0.2s',
        };

        return (
          <React.Fragment key={`legacy-${pos}`}>
            <Handle
              type="target"
              position={pos}
              id={oldTargetId}
              style={style}
            />
            <Handle
              type="source"
              position={pos}
              id={oldSourceId}
              style={style}
            />
          </React.Fragment>
        );
      })}

      {!isSimple && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: isMedium ? '4px' : '12px',
            width: '100%',
          }}
        >
          {/* Icon container with gradient background */}
          {(() => {
            const actorShape = getActorShape(data.type, color, isMedium ? 40 : 64);
            if (actorShape) {
              return (
                <div style={{ marginBottom: '8px', transition: 'all 0.3s' }}>
                  {actorShape}
                </div>
              );
            }
            return (
              <div
                style={{
                  width: isMedium ? '40px' : '64px',
                  height: isMedium ? '40px' : '64px',
                  borderRadius: '16px',
                  background: `linear-gradient(135deg, ${color}20 0%, ${color}10 100%)`,
                  border: `1px solid ${color}30`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: color,
                  boxShadow: `0 8px 16px rgba(0,0,0,0.2)`,
                  position: 'relative',
                }}
              >
                {React.isValidElement(icon)
                  ? React.cloneElement(icon as React.ReactElement, { size: isMedium ? 24 : 32 })
                  : icon}

                {/* Status dot */}
                {data.status === 'new' && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '-4px',
                      right: '-4px',
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      backgroundColor: '#ffd43b',
                      border: '2px solid #1e1e1e',
                      boxShadow: '0 0 5px #ffd43b',
                    }}
                    title="Новый компонент"
                  />
                )}
              </div>
            );
          })()}

          {/* Label */}
          <div style={{ textAlign: 'center', width: '100%' }}>
            {isEditing && !isMedium ? (
              <input
                ref={inputRef}
                type="text"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                onBlur={handleBlur}
                onKeyDown={handleKeyDown}
                style={{
                  background: 'transparent',
                  border: `1px solid ${color}`,
                  borderRadius: '4px',
                  padding: '2px 8px',
                  color: '#fff',
                  fontSize: isMedium ? '12px' : '16px',
                  fontWeight: 'bold',
                  textAlign: 'center',
                  outline: 'none',
                  width: '100%',
                }}
                autoFocus
              />
            ) : (
              <div
                style={{
                  color: '#fff',
                  fontSize: isMedium ? '12px' : '16px',
                  fontWeight: 'bold',
                  textAlign: 'center',
                  wordWrap: 'break-word',
                  overflowWrap: 'break-word',
                  whiteSpace: 'pre-wrap',
                  lineHeight: '1.2',
                  maxWidth: '100%',
                }}
              >
                {label}
              </div>
            )}
          </div>

          {/* Subtitle / Type badge - hide in Medium view */}
          {!isMedium && (
            <div
              style={{
                fontSize: '10px',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                color: `${color}cc`,
                backgroundColor: `${color}15`,
                padding: '2px 8px',
                borderRadius: '10px',
                fontWeight: '600',
              }}
            >
              {getSubtitle()}
            </div>
          )}

          {/* Metadata / Config - Hide in Medium view */}
          {!isMedium && (
            <div
              style={{
                marginTop: '8px',
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
              }}
            >
              {/* Database tables / Repository info */}
              {(data.type === 'database' || data.type === 'repository') && (
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
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '2px',
                      maxHeight: '200px',
                      overflowY: 'auto',
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
                          backgroundColor: '#2d2d2d',
                          borderRadius: '4px',
                          marginBottom: '2px',
                          border: `1px solid ${color}20`,
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          {column.primaryKey && <Key size={10} style={{ color: '#ffd43b' }} />}
                          {column.foreignKey && <Link2 size={10} style={{ color: '#4dabf7' }} />}
                          <span style={{ color: '#fff', fontWeight: '500' }}>{column.name}</span>
                        </div>
                        <span style={{ color: '#888', fontSize: '9px' }}>{column.type}</span>
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
                    }}
                  >
                    {data.classConfig.methods.slice(0, 5).map((method, index) => (
                      <div
                        key={index}
                        style={{
                          fontSize: '10px',
                          color: '#ccc',
                          textAlign: 'left',
                          padding: '4px 8px',
                          backgroundColor: '#2d2d2d',
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
                        <span style={{ color: '#fff', fontWeight: '500' }}>
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
    JSON.stringify(prevProps.data) === JSON.stringify(nextProps.data)
  )
})
