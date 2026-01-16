import { Node, Edge } from 'reactflow'
import { ComponentData } from '../types'

// C4 Model стили для draw.io
// C4 использует специфические формы и цвета для разных типов компонентов
const c4Shapes: Record<string, { shape: string; color: string; description?: string; textColor?: string }> = {
  'frontend': {
    shape: 'rounded=1;whiteSpace=wrap;html=1;fillColor=#438DD5;strokeColor=#3C7FC0;strokeWidth=2;arcSize=4;',
    color: '#438DD5',
    description: 'Web Application',
    textColor: '#FFFFFF'
  },
  'service': {
    shape: 'mxgraph.c4.container;lazy=0;whiteSpace=wrap;html=1;fillColor=#438DD5;strokeColor=#3C7FC0;strokeWidth=2;fontColor=#FFFFFF;',
    color: '#438DD5',
    description: '[Container: Application Service]',
    textColor: '#FFFFFF'
  },
  'auth-service': {
    shape: 'mxgraph.c4.container;lazy=0;whiteSpace=wrap;html=1;fillColor=#438DD5;strokeColor=#3C7FC0;strokeWidth=2;fontColor=#FFFFFF;',
    color: '#438DD5',
    description: 'Authentication Service',
    textColor: '#FFFFFF'
  },
  'database': {
    shape: 'shape=cylinder;whiteSpace=wrap;html=1;boundedLbl=1;backgroundOutline=1;fillColor=#438DD5;strokeColor=#3C7FC0;strokeWidth=2;fontColor=#FFFFFF;',
    color: '#438DD5',
    description: '[Container: Database]',
    textColor: '#FFFFFF'
  },
  'data-warehouse': {
    shape: 'mxgraph.c4.database;lazy=0;whiteSpace=wrap;html=1;fillColor=#438DD5;strokeColor=#3C7FC0;strokeWidth=2;fontColor=#FFFFFF;',
    color: '#438DD5',
    description: 'Data Warehouse',
    textColor: '#FFFFFF'
  },
  'message-broker': {
    shape: 'shape=cylinder;whiteSpace=wrap;html=1;boundedLbl=1;backgroundOutline=1;fillColor=#438DD5;strokeColor=#3C7FC0;strokeWidth=2;fontColor=#FFFFFF;',
    color: '#438DD5',
    description: '[Container: Message Broker]',
    textColor: '#FFFFFF'
  },
  'api-gateway': {
    shape: 'mxgraph.c4.container;lazy=0;whiteSpace=wrap;html=1;fillColor=#438DD5;strokeColor=#3C7FC0;strokeWidth=2;fontColor=#FFFFFF;',
    color: '#438DD5',
    description: 'API Gateway',
    textColor: '#FFFFFF'
  },
  'esb': {
    shape: 'mxgraph.c4.container;lazy=0;whiteSpace=wrap;html=1;fillColor=#9c88ff;strokeColor=#8e7ce6;strokeWidth=2;fontColor=#FFFFFF;',
    color: '#9c88ff',
    description: 'ESB',
    textColor: '#FFFFFF'
  },
  'cache': {
    shape: 'mxgraph.c4.database;lazy=0;whiteSpace=wrap;html=1;fillColor=#438DD5;strokeColor=#3C7FC0;strokeWidth=2;fontColor=#FFFFFF;',
    color: '#438DD5',
    description: 'Cache',
    textColor: '#FFFFFF'
  },
  'load-balancer': {
    shape: 'mxgraph.c4.container;lazy=0;whiteSpace=wrap;html=1;fillColor=#438DD5;strokeColor=#3C7FC0;strokeWidth=2;fontColor=#FFFFFF;',
    color: '#438DD5',
    description: 'Load Balancer',
    textColor: '#FFFFFF'
  },
  'cdn': {
    shape: 'mxgraph.c4.container;lazy=0;whiteSpace=wrap;html=1;fillColor=#438DD5;strokeColor=#3C7FC0;strokeWidth=2;fontColor=#FFFFFF;',
    color: '#438DD5',
    description: 'CDN',
    textColor: '#FFFFFF'
  },
  'lambda': {
    shape: 'mxgraph.c4.container;lazy=0;whiteSpace=wrap;html=1;fillColor=#438DD5;strokeColor=#3C7FC0;strokeWidth=2;fontColor=#FFFFFF;',
    color: '#438DD5',
    description: 'Serverless Function',
    textColor: '#FFFFFF'
  },
  'object-storage': {
    shape: 'mxgraph.c4.database;lazy=0;whiteSpace=wrap;html=1;fillColor=#438DD5;strokeColor=#3C7FC0;strokeWidth=2;fontColor=#FFFFFF;',
    color: '#438DD5',
    description: 'Object Storage',
    textColor: '#FFFFFF'
  },
  'firewall': {
    shape: 'mxgraph.c4.container;lazy=0;whiteSpace=wrap;html=1;fillColor=#FF6B6B;strokeColor=#E03131;strokeWidth=2;fontColor=#FFFFFF;',
    color: '#FF6B6B',
    description: 'Firewall',
    textColor: '#FFFFFF'
  },
  'system': {
    shape: 'swimlane;html=1;startSize=30;fillColor=none;strokeColor=#4DABF7;strokeWidth=2;dashed=1;dashPattern=8 8;',
    color: '#4DABF7',
    description: 'System'
  },
  'client': {
    shape: 'mxgraph.c4.person;lazy=0;whiteSpace=wrap;html=1;fillColor=#08427B;strokeColor=#08427B;strokeWidth=2;fontColor=#FFFFFF;',
    color: '#08427B',
    description: '[Person]',
    textColor: '#FFFFFF'
  },
  'external-system': {
    shape: 'swimlane;html=1;startSize=30;fillColor=none;strokeColor=#ffa94d;strokeWidth=2;dashed=1;dashPattern=8 8;',
    color: '#ffa94d',
    description: 'External System'
  },
  'business-domain': {
    shape: 'swimlane;html=1;startSize=30;fillColor=none;strokeColor=#ffa94d;strokeWidth=2;dashed=1;dashPattern=8 8;',
    color: '#ffa94d',
    description: 'Business Domain'
  },
  'controller': {
    shape: 'mxgraph.c4.container;lazy=0;whiteSpace=wrap;html=1;fillColor=#438DD5;strokeColor=#3C7FC0;strokeWidth=2;fontColor=#FFFFFF;',
    color: '#438DD5',
    description: 'Controller',
    textColor: '#FFFFFF'
  },
  'repository': {
    shape: 'mxgraph.c4.database;lazy=0;whiteSpace=wrap;html=1;fillColor=#438DD5;strokeColor=#3C7FC0;strokeWidth=2;fontColor=#FFFFFF;',
    color: '#438DD5',
    description: 'Repository',
    textColor: '#FFFFFF'
  },
  'class': {
    shape: 'mxgraph.c4.container;lazy=0;whiteSpace=wrap;html=1;fillColor=#438DD5;strokeColor=#3C7FC0;strokeWidth=2;fontColor=#FFFFFF;',
    color: '#438DD5',
    description: 'Class',
    textColor: '#FFFFFF'
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

  // Export system containers as swimlanes
  const systemCells = systemNodes.map((node) => {
    const data = node.data as ComponentData
    const width = node.width || 600
    const height = node.height || 400
    const x = node.position.x
    const y = node.position.y
    const parentId = '1'

    const nodeLabel = typeof data.label === 'string' ? data.label : 'System'
    const escapedLabel = escapeXml(String(nodeLabel))

    // Get style
    let config = c4Shapes[data.type] || c4Shapes['system']
    let style = config.shape

    // Apply color if needed (System usually dashed blue/orange)
    if (config.color) {
      if (style.includes('strokeColor=')) {
        style = style.replace(/strokeColor=[^;]+/, `strokeColor=${config.color}`)
      } else {
        style += `strokeColor=${config.color};`
      }
    }

    return `    <mxCell id="${node.id}" value="${escapedLabel}" style="${style}" vertex="1" parent="${parentId}">
      <mxGeometry x="${x}" y="${y}" width="${width}" height="${height}" as="geometry" />
    </mxCell>`
  }).join('\n')

  // Создаем XML для обычных компонентов
  const regularCells = regularNodes.map((node) => {
    const data = node.data as ComponentData

    // FORCE UNIFORM SIZE logic
    // C4 Standard: Containers/Components are typically Uniform.
    // Person: ~100x100
    // Container: ~200x150
    // Table: Dynamic height based on columns, fixed width.

    let width = 200 // Default standard width
    let height = 150 // Default standard height

    // Exception for specific types
    if (data.type === 'client') {
      width = 180
      height = 160
    } else if (data.type === 'table') {
      width = 240 // Slightly wider for tables
      // Height is calculated dynamically later
    } else {
      // Check if user has excessively resized it? 
      // For now, enforce standard size to meet "all components same size" request
      // relative to their type.
      width = 200
      height = 150
    }

    const x = node.position.x
    const y = node.position.y

    const parentId = '1'

    const c4Config = c4Shapes[data.type] || {
      shape: 'mxgraph.c4.container;lazy=0;whiteSpace=wrap;html=1;fillColor=#438DD5;strokeColor=#3C7FC0;strokeWidth=2;fontColor=#FFFFFF;',
      color: '#438DD5',
      description: 'Component',
      textColor: '#FFFFFF'
    }

    // Проверяем статус компонента
    const isNew = data.status === 'new'
    const isExisting = data.status === 'existing'
    const isRefinement = data.status === 'refinement'

    // Use defined color, fallback to Blue #438DD5 (C4 Container color)
    let fillColor = c4Config.color || '#438DD5'
    let strokeColor = c4Config.shape.match(/strokeColor=([^;]+)/)?.[1] || '#3C7FC0'
    let fontColor = c4Config.textColor || '#FFFFFF'

    if (isNew) {
      fillColor = '#82B366' // Green
      strokeColor = '#457c2a'
      fontColor = '#FFFFFF'
    } else if (isExisting) {
      fillColor = '#438DD5' // Blue
      strokeColor = '#3C7FC0'
      fontColor = '#FFFFFF'
    } else if (isRefinement) {
      fillColor = '#FFD966' // Yellow
      strokeColor = '#D6B656'
      fontColor = '#000000'
    }

    let label = ''
    if (data.type === 'frontend') {
      const nodeLabel = typeof node.data.label === 'string' ? node.data.label : 'Клиентское приложение'
      const escapedLabel = escapeXml(String(nodeLabel))

      const frontendBgColor = fillColor
      const frontendTitleColor = strokeColor
      const feTextColor = fontColor

      label = `<div style="width:100%;height:100%;border-radius:4px;overflow:hidden;margin:0;padding:0;"><table cellpadding="0" cellspacing="0" border="0" style="width:100%;height:100%;background-color:${frontendBgColor};border-collapse:collapse;margin:0;padding:0;">
  <tr>
    <td style="background-color:${frontendTitleColor};height:22px;padding:0 12px;vertical-align:middle;text-align:right;line-height:22px;margin:0;border:0;">
      <span style="display:inline-block;width:11px;height:11px;background-color:#E0E0E0;margin-left:6px;vertical-align:middle;border-radius:50%;"></span>
      <span style="display:inline-block;width:11px;height:11px;background-color:#E0E0E0;margin-left:6px;vertical-align:middle;border-radius:50%;"></span>
      <span style="display:inline-block;width:11px;height:11px;background-color:#E0E0E0;margin-left:6px;vertical-align:middle;border-radius:50%;"></span>
    </td>
  </tr>
  <tr>
    <td style="height:100%;vertical-align:top;text-align:center;color:${feTextColor};font-weight:bold;font-size:14px;padding-top:8px;padding-left:8px;padding-right:8px;padding-bottom:8px;border:0;margin:0;">
      ${escapedLabel}
    </td>
  </tr>
</table></div>`

    } else if (data.type === 'client') {
      // KEEPING PERSON SHAPE LOGIC
      // ... same as before but ensure colors match
      const nodeLabel = typeof node.data.label === 'string' ? node.data.label : 'Client'
      const labelContent = `<b>${escapeXml(nodeLabel)}</b><br><span style="color:${fontColor};font-size:12px;">[Person]</span>`

      const parentStyle = 'group;html=1;whiteSpace=wrap;fillColor=none;strokeColor=none;connectable=1;'
      const parentCell = `<mxCell id="${node.id}" value="" style="${parentStyle}" vertex="1" parent="${parentId}">
      <mxGeometry x="${x}" y="${y}" width="${width}" height="${height}" as="geometry" />
    </mxCell>`

      // Head
      const headSize = 50
      const headX = (width - headSize) / 2
      const headStyle = `ellipse;whiteSpace=wrap;html=1;fillColor=${fillColor};strokeColor=${strokeColor};strokeWidth=2;fontColor=${fontColor};`
      const headCell = `<mxCell id="${node.id}_head" value="" style="${headStyle}" vertex="1" parent="${node.id}">
      <mxGeometry x="${headX}" y="0" width="${headSize}" height="${headSize}" as="geometry" />
    </mxCell>`

      // Body
      const bodyStyle = `rounded=1;whiteSpace=wrap;html=1;arcSize=20;fillColor=${fillColor};strokeColor=${strokeColor};strokeWidth=2;align=center;verticalAlign=middle;fontColor=${fontColor};`
      const bodyCell = `<mxCell id="${node.id}_body" value="${escapeXml(labelContent)}" style="${bodyStyle}" vertex="1" parent="${node.id}">
      <mxGeometry x="0" y="${headSize - 5}" width="${width}" height="${height - headSize + 5}" as="geometry" />
    </mxCell>`

      return parentCell + '\n' + headCell + '\n' + bodyCell

    } else if (data.type === 'table' && data.tableConfig?.columns) {
      // Table Config...
      // ... (Keep existing logic but ensure colors are okay) ...
      const nodeLabel = typeof node.data.label === 'string' ? node.data.label : 'Table'

      // Calculate total container height
      const rowCount = data.tableConfig.columns.length
      const headerHeight = 30
      const rowHeight = 32
      const rowSpacing = 4
      const totalHeight = headerHeight + 12 + (rowCount * 32) + (Math.max(0, rowCount - 1) * 4)

      // ... (reuse existing table generation logic mostly) ...

      const parentStyle = 'group;html=1;whiteSpace=wrap;fillColor=none;strokeColor=none;connectable=0;'
      const parentCell = `    <mxCell id="${node.id}" value="" style="${parentStyle}" vertex="1" parent="${parentId}">
       <mxGeometry x="${x}" y="${y}" width="${width}" height="${totalHeight}" as="geometry" />
     </mxCell>`

      const headerId = `${node.id}_header`
      const tableName = escapeXml(String(node.data.label || 'Table'))
      const headerStyle = `text;html=1;strokeColor=${strokeColor};fillColor=${fillColor};align=center;verticalAlign=middle;whiteSpace=wrap;rounded=0;fontColor=${fontColor};fontStyle=1;fontSize=14;`

      const headerCell = `    <mxCell id="${headerId}" value="${tableName}" style="${headerStyle}" vertex="1" parent="${node.id}">
       <mxGeometry x="0" y="0" width="${width}" height="${headerHeight}" as="geometry" />
     </mxCell>`

      const childCells = data.tableConfig.columns.map((column: any, index: number) => {
        const colId = `${node.id}_col_${index}`
        const colY = headerHeight + 6 + (index * (rowHeight + rowSpacing))
        const rowBg = '#25262B'
        const rowBorder = '#2C2E33'
        const textColorPrimary = '#FFFFFF'
        const textColorSecondary = '#909296'
        const columnName = escapeXml(String(column.name || ''))
        const columnType = escapeXml(String(column.type || ''))
        const keyIcon = column.isPrimaryKey
          ? '<span style="color:#FCC419;margin-right:8px;">🔑</span>'
          : '<span style="display:inline-block;width:20px;"></span>'
        const labelContent = `<div style="display:flex;align-items:center;width:100%;height:100%;box-sizing:border-box;padding:0 10px;">
           ${keyIcon}
           <span style="font-weight:bold;margin-right:8px;color:${textColorPrimary};">${columnName}</span>
           <span style="color:${textColorSecondary};margin-left:auto;font-family:monospace;">${columnType}</span>
         </div>`
        const escapedLabel = escapeXml(labelContent)
        const rowStyle = `rounded=1;whiteSpace=wrap;html=1;fillColor=${rowBg};strokeColor=${rowBorder};strokeWidth=1;arcSize=10;align=left;spacingLeft=0;`
        return `    <mxCell id="${colId}" value="${escapedLabel}" style="${rowStyle}" vertex="1" parent="${node.id}">
       <mxGeometry x="0" y="${colY}" width="${width}" height="${rowHeight}" as="geometry" />
     </mxCell>`
      }).join('\n')
      return parentCell + '\n' + headerCell + '\n' + childCells
    } else {
      // STANDARD COMPONENT (Service, Gateway, DB, etc)
      const nodeLabel = typeof node.data.label === 'string' ? node.data.label : data.type
      // Simple label with Bold Text and Technology
      label = `<div style="color:${fontColor};"><b>${escapeXml(String(nodeLabel))}</b>`

      let technology = ''
      if (data.databaseConfig?.vendor) technology = String(data.databaseConfig.vendor)
      else if (data.serviceConfig?.language) technology = String(data.serviceConfig.language)
      // ... (keep technology extraction) ...
      else if (data.messageBrokerConfig?.vendor) technology = String(data.messageBrokerConfig.vendor)
      else if (data.frontendConfig?.framework) technology = String(data.frontendConfig.framework)
      else if (data.apiGatewayConfig?.vendor) technology = String(data.apiGatewayConfig.vendor)

      if (technology) {
        label += `<br/><i style="color:${fontColor};opacity:0.9;">${escapeXml(technology)}</i>`
      }
      if (c4Config.description) {
        label += `<br/><font size="1" color="${fontColor}" style="opacity:0.8;">${escapeXml(c4Config.description)}</font>`
      }
      label += `</div>`
    }

    let escapedLabel: string
    if (data.type === 'frontend' || data.type === 'table') {
      escapedLabel = label
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
    } else {
      escapedLabel = label
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
    }

    let componentStyle = c4Config.shape

    // APPLY COLORS
    if (componentStyle.includes('fillColor=')) {
      componentStyle = componentStyle.replace(/fillColor=[^;]+/, `fillColor=${fillColor}`)
    } else {
      componentStyle += `fillColor=${fillColor};`
    }

    if (componentStyle.includes('strokeColor=')) {
      componentStyle = componentStyle.replace(/strokeColor=[^;]+/, `strokeColor=${strokeColor}`)
    } else {
      componentStyle += `strokeColor=${strokeColor};`
    }

    if (componentStyle.includes('fontColor=')) {
      componentStyle = componentStyle.replace(/fontColor=[^;]+/, `fontColor=${fontColor}`)
    } else {
      componentStyle += `fontColor=${fontColor};`
    }

    // REMOVED THE BLOCK THAT FORCED FILLCOLOR=NONE

    if (data.type === 'table') {
      componentStyle = 'shape=label;html=1;whiteSpace=wrap;fillColor=none;strokeColor=none;align=center;verticalAlign=top;spacingLeft=0;spacingTop=0;'
    }

    return `    <mxCell id="${node.id}" value="${escapedLabel}" style="${componentStyle}" vertex="1" parent="${parentId}">
      <mxGeometry x="${x}" y="${y}" width="${width}" height="${height}" as="geometry" />
    </mxCell>`
  }).join('\n')

  // Calculate Legend Position (Bottom Left of the diagram)
  let maxY = 0
  let minX = Infinity
  regularNodes.forEach(n => {
    if (n.position.y + (n.height || 150) > maxY) maxY = n.position.y + (n.height || 150)
    if (n.position.x < minX) minX = n.position.x
  })
  if (minX === Infinity) minX = 0

  const legendY = maxY + 100
  const legendX = minX

  // Add Legend
  const legendXml = `
    <!-- LEGEND -->
     <mxCell id="legend_bg" value="" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#f5f5f5;strokeColor=#666666;" vertex="1" parent="1">
       <mxGeometry x="${legendX}" y="${legendY}" width="280" height="140" as="geometry" />
     </mxCell>
     <mxCell id="legend_title" value="Component Status Legend" style="text;html=1;strokeColor=none;fillColor=none;align=center;verticalAlign=middle;whiteSpace=wrap;rounded=0;fontStyle=1;fontSize=14;" vertex="1" parent="1">
       <mxGeometry x="${legendX}" y="${legendY + 10}" width="280" height="20" as="geometry" />
     </mxCell>
     
     <!-- New Component -->
     <mxCell id="legend_new_rect" value="" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#82B366;strokeColor=#457c2a;" vertex="1" parent="1">
       <mxGeometry x="${legendX + 20}" y="${legendY + 40}" width="30" height="20" as="geometry" />
     </mxCell>
     <mxCell id="legend_new_text" value="New Component" style="text;html=1;strokeColor=none;fillColor=none;align=left;verticalAlign=middle;whiteSpace=wrap;rounded=0;" vertex="1" parent="1">
       <mxGeometry x="${legendX + 60}" y="${legendY + 40}" width="200" height="20" as="geometry" />
     </mxCell>

     <!-- Existing Component -->
     <mxCell id="legend_existing_rect" value="" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#438DD5;strokeColor=#3C7FC0;" vertex="1" parent="1">
       <mxGeometry x="${legendX + 20}" y="${legendY + 70}" width="30" height="20" as="geometry" />
     </mxCell>
     <mxCell id="legend_existing_text" value="Existing Component" style="text;html=1;strokeColor=none;fillColor=none;align=left;verticalAlign=middle;whiteSpace=wrap;rounded=0;" vertex="1" parent="1">
       <mxGeometry x="${legendX + 60}" y="${legendY + 70}" width="200" height="20" as="geometry" />
     </mxCell>

     <!-- Needs Refinement -->
     <mxCell id="legend_refinement_rect" value="" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#FFD966;strokeColor=#D6B656;" vertex="1" parent="1">
       <mxGeometry x="${legendX + 20}" y="${legendY + 100}" width="30" height="20" as="geometry" />
     </mxCell>
     <mxCell id="legend_refinement_text" value="Requires Refinement" style="text;html=1;strokeColor=none;fillColor=none;align=left;verticalAlign=middle;whiteSpace=wrap;rounded=0;" vertex="1" parent="1">
       <mxGeometry x="${legendX + 60}" y="${legendY + 100}" width="200" height="20" as="geometry" />
     </mxCell>
  `

  const mxGraphModel = systemCells + '\n' + regularCells + '\n' + legendXml

  const mxEdges = edges.map((edge, index) => {
    const sourceNode = nodes.find(n => n.id === edge.source)
    const targetNode = nodes.find(n => n.id === edge.target)

    if (!sourceNode || !targetNode) return ''

    let edgeColor = '#333333'
    let edgeStyle = 'endArrow=block;html=1;rounded=0;strokeWidth=2;fontSize=12;fontColor=#000000;'
    let label = ''

    if (edge.data?.relationshipType) {
      // Table relation
      const relType = edge.data.relationshipType
      edgeColor = '#000000'
      edgeStyle = 'endArrow=none;html=1;rounded=0;strokeWidth=2;fontSize=12;fontColor=#000000;'
      const [startCard, endCard] = relType.split(':')
      const startLabel = (startCard === 'n' || startCard === 'm') ? 'N' : '1'
      const endLabel = (endCard === 'n' || endCard === 'm') ? 'N' : '1'
      label = `${startLabel}:${endLabel}`
      if (edge.data.sourceColumn && edge.data.targetColumn) {
        label = `${edge.data.sourceColumn} → ${edge.data.targetColumn} (${startLabel}:${endLabel})`
      }
    } else if (edge.data?.connectionType === 'rest') {
      edgeColor = '#333333'; edgeStyle += 'dashed=1;'; label = 'REST'
    } else if (edge.data?.connectionType === 'grpc') {
      edgeColor = '#333333'; edgeStyle += 'dashed=1;'; label = 'gRPC'
    } else if (edge.data?.connectionType === 'async') {
      edgeColor = '#333333'; edgeStyle += 'dashed=1;'; label = 'Async'
    } else if (edge.data?.connectionType === 'database-connection') {
      edgeColor = '#333333'; label = 'Reads/Writes'
    } else if (edge.data?.connectionType === 'cache-connection') {
      edgeColor = '#333333'; label = 'Caches'
    } else {
      label = (typeof edge.label === 'string' ? edge.label : 'Uses')
    }

    // Connection Points Logic
    // We only force points for Table Column connections to ensure they attach to the specific row.
    // For standard components, we DROP the explicit points to let Draw.io auto-route comfortably.

    let sourceId = edge.source
    let targetId = edge.target

    // Explicit Points only for tables
    let forcedExitX = null;
    let forcedExitY = null;
    let forcedEntryX = null;
    let forcedEntryY = null;

    if (edge.sourceHandle && sourceNode.data.type === 'table') {
      const handleParts = edge.sourceHandle.split('-')
      let columnIndex = -1
      if (handleParts[0] === 'col' && !isNaN(parseInt(handleParts[1]))) {
        columnIndex = parseInt(handleParts[1], 10)
      }
      if (columnIndex >= 0) {
        sourceId = `${sourceNode.id}_col_${columnIndex}`
        const side = handleParts[handleParts.length - 1]
        // For table rows, connecting to side is good
        forcedExitX = side === 'left' ? 0 : 1
        forcedExitY = 0.5
      }
    }

    if (edge.targetHandle && targetNode.data.type === 'table') {
      const handleParts = edge.targetHandle.split('-')
      let columnIndex = -1
      if (handleParts[0] === 'col' && !isNaN(parseInt(handleParts[1]))) {
        columnIndex = parseInt(handleParts[1], 10)
      }
      if (columnIndex >= 0) {
        targetId = `${targetNode.id}_col_${columnIndex}`
        const side = handleParts[handleParts.length - 1]
        forcedEntryX = side === 'left' ? 0 : 1
        forcedEntryY = 0.5
      }
    }

    // Append standard points ONLY if we have forced ones or specific requirements
    // Otherwise leave them out so draw.io uses perimeter intersections
    let connectionAttrs = ''
    if (forcedExitX !== null) connectionAttrs += `exitX=${forcedExitX};exitY=${forcedExitY};`
    if (forcedEntryX !== null) connectionAttrs += `entryX=${forcedEntryX};entryY=${forcedEntryY};`

    const escapedLabel = escapeXml(String(label))
    return `    <mxCell id="edge_${index}" value="${escapedLabel}" style="${edgeStyle}strokeColor=${edgeColor};${connectionAttrs}" edge="1" parent="1" source="${sourceId}" target="${targetId}">
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
    alert('Диаграмма экспортирована в формате C4 Model с легендой статусов!\n\nПри открытии в draw.io:\n1. Выберите "More Shapes" → "C4 Model"\n2. Легенда объясняет цветовое кодирование статусов.')
  }, 100)
}
