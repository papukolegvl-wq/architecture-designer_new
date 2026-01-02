import { Node, Edge } from 'reactflow'
import { ComponentData } from '../types'

// C4 Model стили для draw.io
// C4 использует специфические формы и цвета для разных типов компонентов
const c4Shapes: Record<string, { shape: string; color: string; description?: string }> = {
  'frontend': { 
    shape: 'rounded=1;whiteSpace=wrap;html=1;fillColor=#438DD5;strokeColor=#ffffff;strokeWidth=2;arcSize=4;', 
    color: '#438DD5',
    description: 'Web Application'
  },
  'service': { 
    shape: 'mxgraph.c4.container;lazy=0;whiteSpace=wrap;html=1;fillColor=#85BBF0;strokeColor=#ffffff;strokeWidth=2;', 
    color: '#85BBF0',
    description: 'Application Service'
  },
  'auth-service': { 
    shape: 'mxgraph.c4.container;lazy=0;whiteSpace=wrap;html=1;fillColor=#85BBF0;strokeColor=#ffffff;strokeWidth=2;', 
    color: '#85BBF0',
    description: 'Authentication Service'
  },
  'database': { 
    shape: 'mxgraph.flowchart.database_2;whiteSpace=wrap;html=1;fillColor=#438DD5;strokeColor=#2E5C8A;strokeWidth=2;', 
    color: '#438DD5',
    description: 'Database'
  },
  'data-warehouse': { 
    shape: 'mxgraph.c4.database;lazy=0;whiteSpace=wrap;html=1;fillColor=#438DD5;strokeColor=#ffffff;strokeWidth=2;', 
    color: '#438DD5',
    description: 'Data Warehouse'
  },
  'message-broker': { 
    shape: 'mxgraph.c4.queue;lazy=0;whiteSpace=wrap;html=1;fillColor=#85BBF0;strokeColor=#ffffff;strokeWidth=2;', 
    color: '#85BBF0',
    description: 'Message Broker'
  },
  'api-gateway': { 
    shape: 'mxgraph.c4.container;lazy=0;whiteSpace=wrap;html=1;fillColor=#85BBF0;strokeColor=#ffffff;strokeWidth=2;', 
    color: '#85BBF0',
    description: 'API Gateway'
  },
  'esb': { 
    shape: 'mxgraph.c4.container;lazy=0;whiteSpace=wrap;html=1;fillColor=#9c88ff;strokeColor=#ffffff;strokeWidth=2;', 
    color: '#9c88ff',
    description: 'ESB'
  },
  'cache': { 
    shape: 'mxgraph.c4.database;lazy=0;whiteSpace=wrap;html=1;fillColor=#85BBF0;strokeColor=#ffffff;strokeWidth=2;', 
    color: '#85BBF0',
    description: 'Cache'
  },
  'load-balancer': { 
    shape: 'mxgraph.c4.container;lazy=0;whiteSpace=wrap;html=1;fillColor=#85BBF0;strokeColor=#ffffff;strokeWidth=2;', 
    color: '#85BBF0',
    description: 'Load Balancer'
  },
  'cdn': { 
    shape: 'mxgraph.c4.container_boundary;lazy=0;whiteSpace=wrap;html=1;fillColor=#85BBF0;strokeColor=#ffffff;strokeWidth=2;', 
    color: '#85BBF0',
    description: 'CDN'
  },
  'lambda': { 
    shape: 'mxgraph.c4.container;lazy=0;whiteSpace=wrap;html=1;fillColor=#85BBF0;strokeColor=#ffffff;strokeWidth=2;', 
    color: '#85BBF0',
    description: 'Serverless Function'
  },
  'object-storage': { 
    shape: 'mxgraph.c4.database;lazy=0;whiteSpace=wrap;html=1;fillColor=#438DD5;strokeColor=#ffffff;strokeWidth=2;', 
    color: '#438DD5',
    description: 'Object Storage'
  },
  'firewall': { 
    shape: 'mxgraph.c4.container;lazy=0;whiteSpace=wrap;html=1;fillColor=#FF6B6B;strokeColor=#ffffff;strokeWidth=2;', 
    color: '#FF6B6B',
    description: 'Firewall'
  },
  'system': { 
    shape: 'swimlane;html=1;startSize=30;fillColor=#E1F5FE;strokeColor=#4DABF7;strokeWidth=2;dashed=1;dashPattern=8 8;', 
    color: '#4DABF7',
    description: 'System'
  },
  'client': { 
    shape: 'mxgraph.c4.container;lazy=0;whiteSpace=wrap;html=1;fillColor=#4dabf7;strokeColor=#2E5C8A;strokeWidth=2;', 
    color: '#4dabf7',
    description: 'Client'
  },
  'external-system': { 
    shape: 'swimlane;html=1;startSize=30;fillColor=#FFF4E6;strokeColor=#ffa94d;strokeWidth=2;dashed=1;dashPattern=8 8;', 
    color: '#ffa94d',
    description: 'External System'
  },
  'business-domain': { 
    shape: 'swimlane;html=1;startSize=30;fillColor=#FFF4E6;strokeColor=#ffa94d;strokeWidth=2;dashed=1;dashPattern=8 8;', 
    color: '#ffa94d',
    description: 'Business Domain'
  },
  'controller': { 
    shape: 'mxgraph.c4.container;lazy=0;whiteSpace=wrap;html=1;fillColor=#85BBF0;strokeColor=#ffffff;strokeWidth=2;', 
    color: '#85BBF0',
    description: 'Controller'
  },
  'repository': { 
    shape: 'mxgraph.c4.database;lazy=0;whiteSpace=wrap;html=1;fillColor=#438DD5;strokeColor=#ffffff;strokeWidth=2;', 
    color: '#438DD5',
    description: 'Repository'
  },
  'class': { 
    shape: 'mxgraph.c4.container;lazy=0;whiteSpace=wrap;html=1;fillColor=#85BBF0;strokeColor=#ffffff;strokeWidth=2;', 
    color: '#85BBF0',
    description: 'Class'
  },
}

export function exportToDrawIO(nodes: Node[], edges: Edge[]): string {
  // Разделяем узлы на системы и обычные компоненты
  const systemNodes = nodes.filter(node => {
    const type = (node.data as ComponentData).type
    return type === 'system' || type === 'external-system' || type === 'business-domain'
  })
  const regularNodes = nodes.filter(node => {
    const type = (node.data as ComponentData).type
    return type !== 'system' && type !== 'external-system' && type !== 'business-domain'
  })
  
  // Создаем карту дочерних узлов для каждой системы
  const systemChildrenMap = new Map<string, Node[]>()
  
  systemNodes.forEach(systemNode => {
    // Находим узлы, которые находятся внутри системы
    const systemX = systemNode.position.x
    const systemY = systemNode.position.y
    const systemWidth = systemNode.width || 400
    const systemHeight = systemNode.height || 300
    
    const children = regularNodes.filter(node => {
      const nodeX = node.position.x
      const nodeY = node.position.y
      const nodeWidth = node.width || 200
      const nodeHeight = node.height || 120
      
      // Проверяем, находится ли узел внутри системы
      const nodeCenterX = nodeX + nodeWidth / 2
      const nodeCenterY = nodeY + nodeHeight / 2
      
      return (
        nodeCenterX >= systemX &&
        nodeCenterY >= systemY &&
        nodeCenterX <= systemX + systemWidth &&
        nodeCenterY <= systemY + systemHeight
      )
    })
    
    systemChildrenMap.set(systemNode.id, children)
  })
  
  // Создаем XML для систем (контейнеры)
  const systemCells = systemNodes.map((node) => {
    const data = node.data as ComponentData
    const nodeLabel = typeof node.data.label === 'string' ? node.data.label : data.type
    // Не добавляем текстовый префикс статуса - только цветовое обозначение
    const escapedLabel = escapeXml(String(nodeLabel))
    
    const width = node.width || 400
    const height = node.height || 300
    
    // Добавляем черный цвет текста для систем
    // Добавляем визуальное обозначение статуса в стиле системы
    let systemStyle = c4Shapes['system'].shape + 'fontColor=#000000;'
    if (data.status === 'new') {
      // Для новых систем добавляем зеленую пунктирную границу
      systemStyle += 'strokeColor=#51cf66;'
    } else if (data.status === 'existing') {
      // Для существующих систем добавляем оранжевую границу
      systemStyle += 'strokeColor=#ffa94d;'
    }
    return `    <mxCell id="${node.id}" value="${escapedLabel}" style="${systemStyle}" vertex="1" parent="1">
      <mxGeometry x="${node.position.x}" y="${node.position.y}" width="${width}" height="${height}" as="geometry" />
    </mxCell>`
  }).join('\n')
  
  // Создаем XML для обычных компонентов
  const regularCells = regularNodes.map((node) => {
    const data = node.data as ComponentData
    
    // Определяем, в какой системе находится этот узел
    let parentId = '1' // По умолчанию корневой элемент
    for (const [systemId, children] of systemChildrenMap.entries()) {
      if (children.some(child => child.id === node.id)) {
        parentId = systemId
        break
      }
    }
    
    const c4Config = c4Shapes[data.type] || { 
      shape: 'mxgraph.c4.container;lazy=0;whiteSpace=wrap;html=1;fillColor=#85BBF0;strokeColor=#ffffff;strokeWidth=2;', 
      color: '#85BBF0',
      description: 'Component'
    }
    
    // Проверяем статус компонента
    const isNew = data.status === 'new'
    const backgroundColor = isNew ? '#FF9999' : (c4Config.color || '#85BBF0')
    const textColor = isNew ? '#000000' : '#000000'
    
    // Специальный формат для frontend - окно приложения с title bar
    let label = ''
    if (data.type === 'frontend') {
      const nodeLabel = typeof node.data.label === 'string' ? node.data.label : 'Клиентское приложение'
      // Не добавляем текстовый префикс статуса - только цветовое обозначение
      const escapedLabel = escapeXml(String(nodeLabel))
      
      // Создаем HTML для окна приложения с title bar как в браузере
      // Title bar прижат к самому верху - оборачиваем в div с border-radius
      const frontendBgColor = isNew ? '#FF9999' : '#438DD5'
      const frontendTitleColor = isNew ? '#FF9999' : '#85BBF0'
      label = `<div style="width:100%;height:100%;border-radius:4px;overflow:hidden;margin:0;padding:0;"><table cellpadding="0" cellspacing="0" border="0" style="width:100%;height:100%;background-color:${frontendBgColor};border-collapse:collapse;margin:0;padding:0;">
  <tr>
    <td style="background-color:${frontendTitleColor};height:22px;padding:0 12px;vertical-align:middle;text-align:right;line-height:22px;margin:0;border:0;">
      <span style="display:inline-block;width:11px;height:11px;background-color:#2E5C8A;margin-left:6px;vertical-align:middle;"></span>
      <span style="display:inline-block;width:11px;height:11px;background-color:#2E5C8A;margin-left:6px;vertical-align:middle;"></span>
      <span style="display:inline-block;width:11px;height:11px;background-color:#2E5C8A;margin-left:6px;vertical-align:middle;"></span>
    </td>
  </tr>
  <tr>
    <td style="height:100%;vertical-align:top;text-align:center;color:${textColor};font-weight:bold;font-size:14px;padding-top:8px;padding-left:8px;padding-right:8px;padding-bottom:8px;border:0;margin:0;">
      ${escapedLabel}
    </td>
  </tr>
</table></div>`
    } else if (data.type === 'service') {
      // Специальный формат для service - квадрат с двумя горизонтальными прямоугольниками слева
      // Прямоугольники выступают за границы - половина внутри, половина снаружи
      const nodeLabel = typeof node.data.label === 'string' ? node.data.label : 'Сервис'
      // Не добавляем текстовый префикс статуса - только цветовое обозначение
      const escapedLabel = escapeXml(String(nodeLabel))
      
      const serviceBgColor = isNew ? '#FF9999' : '#85BBF0'
      const serviceRectColor = isNew ? '#FF9999' : '#438DD5'
      
      // Создаем HTML для сервера: основной квадрат с двумя горизонтальными прямоугольниками слева
      // Прямоугольники с черной границей, выступают слева в самый край, в два раза больше, расположены параллельно друг другу
      // Сдвинуты максимально влево, чтобы не перекрывать текст по центру
      label = `<div style="width:100%;height:100%;background-color:${serviceBgColor};border-radius:4px;position:relative;margin:0;padding:0;overflow:visible;">
  <div style="position:absolute;left:-60px;top:25%;width:60px;height:24px;background-color:${serviceRectColor};border:1px solid #000000;border-radius:2px;"></div>
  <div style="position:absolute;left:-60px;top:calc(25% + 32px);width:60px;height:24px;background-color:${serviceRectColor};border:1px solid #000000;border-radius:2px;"></div>
  <table cellpadding="0" cellspacing="0" border="0" style="width:100%;height:100%;border-collapse:collapse;margin:0;padding:0;">
    <tr>
      <td style="vertical-align:middle;text-align:center;color:${textColor};font-weight:bold;font-size:14px;padding:8px;margin:0;">
        ${escapedLabel}
      </td>
    </tr>
  </table>
</div>`
    } else if (data.type === 'client') {
      // Специальный формат для client - фигура человека: круг (голова) и округлый прямоугольник (тело)
      const nodeLabel = typeof node.data.label === 'string' ? node.data.label : 'Клиент'
      // Не добавляем текстовый префикс статуса - только цветовое обозначение
      const escapedLabel = escapeXml(String(nodeLabel))
      
      const clientBgColor = isNew ? '#FF9999' : '#4dabf7'
      
      // Создаем HTML для фигуры человека: круг сверху (голова) и округлый прямоугольник снизу (тело)
      // Голова поднята выше, тело с сильно закругленными углами
      label = `<div style="width:100%;height:100%;position:relative;margin:0;padding:0;overflow:visible;">
  <!-- Голова (круг) - поднята еще выше, по центру, увеличенный размер -->
  <div style="position:absolute;top:-115px;left:50%;margin-left:-35px;width:70px;height:70px;background-color:${clientBgColor};border:2px solid #2E5C8A;border-radius:50%;z-index:2;"></div>
  <!-- Тело (прямоугольник с закругленными углами) - начинается под головой -->
  <div style="position:absolute;top:15px;left:0;right:0;bottom:0;background-color:${clientBgColor};border:2px solid #2E5C8A;border-top-left-radius:15px !important;border-top-right-radius:15px !important;border-bottom-left-radius:15px !important;border-bottom-right-radius:15px !important;">
    <table cellpadding="0" cellspacing="0" border="0" style="width:100%;height:100%;border-collapse:collapse;margin:0;padding:0;">
      <tr>
        <td style="vertical-align:middle;text-align:center;color:${textColor};font-weight:bold;font-size:14px;font-family:Arial,sans-serif;padding:8px;margin:0;">
          ${escapedLabel}
        </td>
      </tr>
    </table>
  </div>
</div>`
    } else {
      // Формируем label в формате C4 для остальных компонентов
      const nodeLabel = typeof node.data.label === 'string' ? node.data.label : data.type
      // Не добавляем текстовый префикс статуса - только цветовое обозначение
      label = `<div style="color:${textColor};"><b>${escapeXml(String(nodeLabel))}</b>`
      
      // Добавляем описание/технологию
      let technology = ''
      if (data.databaseConfig?.vendor) {
        technology = String(data.databaseConfig.vendor)
      } else if (data.serviceConfig?.language) {
        technology = String(data.serviceConfig.language)
      } else if (data.messageBrokerConfig?.vendor) {
        technology = String(data.messageBrokerConfig.vendor)
      } else if (data.dataWarehouseConfig?.vendor) {
        technology = String(data.dataWarehouseConfig.vendor)
      } else if (data.cacheConfig?.cacheType) {
        technology = data.cacheConfig.cacheType === 'distributed' ? 'Distributed Cache' : 'In-Memory Cache'
      } else if (data.frontendConfig?.framework) {
        technology = String(data.frontendConfig.framework)
      } else if (data.apiGatewayConfig?.vendor) {
        technology = String(data.apiGatewayConfig.vendor)
      } else if (data.esbConfig?.vendor) {
        technology = String(data.esbConfig.vendor)
      }
      
      if (technology) {
        label += `<br/><i style="color:${textColor};">${escapeXml(technology)}</i>`
      }
      
      // Добавляем описание типа компонента
      if (c4Config.description) {
        label += `<br/><font size="1" color="${textColor}">${escapeXml(c4Config.description)}</font>`
      }
      label += `</div>`
    }

    const width = node.width || 200
    const height = node.height || 120

    // Если узел находится в системе, позиционируем относительно системы
    let x = node.position.x
    let y = node.position.y
    
    if (parentId !== '1') {
      const systemNode = systemNodes.find(n => n.id === parentId)
      if (systemNode) {
        // Позиция относительно системы
        x = node.position.x - systemNode.position.x
        y = node.position.y - systemNode.position.y
      }
    }

    // Для frontend, service и client используем HTML напрямую (он уже в правильном формате)
    // Для остальных компонентов экранируем как XML
    let escapedLabel: string
    if (data.type === 'frontend' || data.type === 'service' || data.type === 'client') {
      // HTML для frontend, service и client уже готов, экранируем только специальные XML символы
      escapedLabel = label
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
    } else {
      // Обычное экранирование для остальных компонентов
      escapedLabel = label
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
    }
    
    // Добавляем цвет текста и фона в зависимости от статуса
    let componentStyle = c4Config.shape
    if (isNew) {
      // Для новых компонентов: фон #FF9999, текст #000000
      componentStyle = componentStyle.replace(/fillColor=[^;]+/, `fillColor=${backgroundColor}`)
      componentStyle += `fontColor=${textColor};`
    } else {
      // Для остальных: черный текст
      componentStyle += `fontColor=${textColor};`
    }
    
    return `    <mxCell id="${node.id}" value="${escapedLabel}" style="${componentStyle}" vertex="1" parent="${parentId}">
      <mxGeometry x="${x}" y="${y}" width="${width}" height="${height}" as="geometry" />
    </mxCell>`
  }).join('\n')
  
  const mxGraphModel = systemCells + '\n' + regularCells

  const mxEdges = edges.map((edge, index) => {
    const sourceNode = nodes.find(n => n.id === edge.source)
    const targetNode = nodes.find(n => n.id === edge.target)
    
    if (!sourceNode || !targetNode) return ''
    
    // C4 стили для связей
    let edgeColor = '#333333'
    let edgeStyle = 'endArrow=block;html=1;rounded=0;strokeWidth=2;fontSize=12;fontColor=#000000;'
    
    // Определяем тип связи и стиль в формате C4
    let label = ''
    if (edge.data?.connectionType === 'rest') {
      edgeColor = '#333333'
      edgeStyle += 'dashed=1;'
      label = 'REST'
    } else if (edge.data?.connectionType === 'grpc') {
      edgeColor = '#333333'
      edgeStyle += 'dashed=1;'
      label = 'gRPC'
    } else if (edge.data?.connectionType === 'async') {
      edgeColor = '#333333'
      edgeStyle += 'dashed=1;'
      label = 'Async'
    } else if (edge.data?.connectionType === 'database-connection') {
      edgeColor = '#333333'
      label = 'Reads/Writes'
    } else if (edge.data?.connectionType === 'cache-connection') {
      edgeColor = '#333333'
      label = 'Caches'
    } else if (edge.data?.connectionType === 'database-replication') {
      edgeColor = '#333333'
      edgeStyle += 'dashed=1;'
      label = 'Replicates'
    } else {
      label = (typeof edge.label === 'string' ? edge.label : 'Uses')
    }

    // Для простых текстовых меток используем value атрибут с экранированием
    const escapedLabel = escapeXml(String(label))
    return `    <mxCell id="edge_${index}" value="${escapedLabel}" style="${edgeStyle}strokeColor=${edgeColor};" edge="1" parent="1" source="${edge.source}" target="${edge.target}">
      <mxGeometry relative="1" as="geometry" />
    </mxCell>`
  }).filter(e => e).join('\n')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<mxfile host="app.diagrams.net" modified="${new Date().toISOString()}" agent="Architecture Designer" version="21.0.0" etag="" type="device" pages="1">
  <diagram id="c4-architecture-diagram" name="C4 Architecture Diagram">
    <mxGraphModel dx="1422" dy="794" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="4000" pageHeight="3000" math="0" shadow="0">
      <root>
        <mxCell id="0" />
        <mxCell id="1" parent="0" />
${mxGraphModel}
${mxEdges}
      </root>
    </mxGraphModel>
  </diagram>
</mxfile>`

  return xml
}

function escapeXml(unsafe: string): string {
  return String(unsafe)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}


export function saveToDrawIOFile(nodes: Node[], edges: Edge[]): void {
  const xml = exportToDrawIO(nodes, edges)
  const blob = new Blob([xml], { type: 'application/xml' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `c4-architecture-diagram-${new Date().toISOString().split('T')[0]}.drawio`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
  
  // Показываем подсказку о C4 формате
  setTimeout(() => {
    alert('Диаграмма экспортирована в формате C4 Model!\n\nПри открытии в draw.io:\n1. Выберите "More Shapes" → "C4 Model"\n2. Или используйте встроенные стили C4\n\nКомпоненты будут отображаться в стиле C4 с правильными формами и цветами.')
  }, 100)
}

