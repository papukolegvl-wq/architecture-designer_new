import { Node, Edge } from 'reactflow'
import { ComponentData } from '../types'

function escapeXml(unsafe: string): string {
  return String(unsafe)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

// C4 Model стили для draw.io
const c4Shapes: Record<string, { shape: string; color: string; description?: string; textColor?: string }> = {
  'frontend': {
    shape: 'rounded=1;whiteSpace=wrap;html=1;arcSize=10;align=center;verticalAlign=top;spacing=0;spacingTop=0;spacingLeft=0;spacingRight=0;spacingBottom=0;',
    color: '#438DD5',
    description: 'Web Application',
    textColor: '#FFFFFF'
  },
  'service': {
    shape: 'rounded=1;whiteSpace=wrap;html=1;arcSize=10;',
    color: '#438DD5',
    description: '[Container: Application Service]',
    textColor: '#FFFFFF'
  },
  'auth-service': {
    shape: 'rounded=1;whiteSpace=wrap;html=1;arcSize=10;',
    color: '#438DD5',
    description: 'Authentication Service',
    textColor: '#FFFFFF'
  },
  'database': {
    shape: 'shape=cylinder;whiteSpace=wrap;html=1;boundedLbl=1;backgroundOutline=1;labelBackgroundColor=none;fillColor=#438DD5;strokeColor=#3C7FC0;strokeWidth=2;fontColor=#FFFFFF;',
    color: '#438DD5',
    description: '[Container: Database]',
    textColor: '#FFFFFF'
  },
  'data-warehouse': {
    shape: 'shape=cylinder;whiteSpace=wrap;html=1;boundedLbl=1;backgroundOutline=1;labelBackgroundColor=none;fillColor=#438DD5;strokeColor=#3C7FC0;strokeWidth=2;fontColor=#FFFFFF;',
    color: '#438DD5',
    description: '[Container: Data Warehouse]',
    textColor: '#FFFFFF'
  },
  'message-broker': {
    shape: 'shape=cylinder;whiteSpace=wrap;html=1;boundedLbl=1;backgroundOutline=1;labelBackgroundColor=none;fillColor=#438DD5;strokeColor=#3C7FC0;strokeWidth=2;fontColor=#FFFFFF;rotation=90;labelRotation=270;horizontal=0;',
    color: '#438DD5',
    description: '[Container: Message Broker]',
    textColor: '#FFFFFF'
  },
  'queue': {
    shape: 'shape=cylinder;whiteSpace=wrap;html=1;boundedLbl=1;backgroundOutline=1;labelBackgroundColor=none;fillColor=#438DD5;strokeColor=#3C7FC0;strokeWidth=2;fontColor=#FFFFFF;rotation=90;labelRotation=270;horizontal=0;',
    color: '#438DD5',
    description: '[Container: Queue]',
    textColor: '#FFFFFF'
  },
  'api-gateway': {
    shape: 'rounded=1;whiteSpace=wrap;html=1;arcSize=10;',
    color: '#438DD5',
    description: 'API Gateway',
    textColor: '#FFFFFF'
  },
  'esb': {
    shape: 'rounded=1;whiteSpace=wrap;html=1;arcSize=10;',
    color: '#9c88ff',
    description: 'ESB',
    textColor: '#FFFFFF'
  },
  'cache': {
    shape: 'rounded=1;whiteSpace=wrap;html=1;arcSize=10;',
    color: '#438DD5',
    description: 'Cache',
    textColor: '#FFFFFF'
  },
  'load-balancer': {
    shape: 'rounded=1;whiteSpace=wrap;html=1;arcSize=10;',
    color: '#438DD5',
    description: 'Load Balancer',
    textColor: '#FFFFFF'
  },
  'cdn': {
    shape: 'rounded=1;whiteSpace=wrap;html=1;arcSize=10;',
    color: '#438DD5',
    description: 'CDN',
    textColor: '#FFFFFF'
  },
  'lambda': {
    shape: 'rounded=1;whiteSpace=wrap;html=1;arcSize=10;',
    color: '#438DD5',
    description: 'Serverless Function',
    textColor: '#FFFFFF'
  },
  'object-storage': {
    shape: 'rounded=1;whiteSpace=wrap;html=1;arcSize=10;',
    color: '#438DD5',
    description: 'Object Storage',
    textColor: '#FFFFFF'
  },
  'firewall': {
    shape: 'rounded=1;whiteSpace=wrap;html=1;arcSize=10;',
    color: '#FF6B6B',
    description: 'Firewall',
    textColor: '#FFFFFF'
  },
  'system': {
    shape: 'rounded=1;whiteSpace=wrap;html=1;fillColor=none;strokeColor=#1168BD;strokeWidth=2;dashed=1;dashPattern=8 8;align=center;verticalAlign=top;spacingTop=8;fontColor=#1168BD;fontStyle=1;fontSize=14;',
    color: '#1168BD',
    description: '[Software System Boundary]'
  },
  'external-system': {
    shape: 'rounded=1;whiteSpace=wrap;html=1;fillColor=none;strokeColor=#999999;strokeWidth=2;dashed=1;dashPattern=8 8;align=center;verticalAlign=top;spacingTop=8;fontColor=#999999;fontStyle=1;fontSize=14;',
    color: '#999999',
    description: '[External Software System]'
  },
  'business-domain': {
    shape: 'rounded=1;whiteSpace=wrap;html=1;fillColor=none;strokeColor=#ffa94d;strokeWidth=2;dashed=1;dashPattern=8 8;align=center;verticalAlign=top;spacingTop=8;fontColor=#ffa94d;fontStyle=1;fontSize=14;',
    color: '#ffa94d',
    description: '[Business Domain]'
  },
  'vpc': {
    shape: 'rounded=1;whiteSpace=wrap;html=1;fillColor=none;strokeColor=#4dabf7;strokeWidth=2;dashed=1;dashPattern=8 8;align=left;verticalAlign=top;spacingLeft=12;spacingTop=8;fontColor=#4dabf7;fontStyle=1;fontSize=14;',
    color: '#4dabf7',
    description: '[VPC Boundary]'
  },
  'subnet': {
    shape: 'rounded=1;whiteSpace=wrap;html=1;fillColor=none;strokeColor=#51cf66;strokeWidth=2;dashed=1;dashPattern=8 8;align=left;verticalAlign=top;spacingLeft=12;spacingTop=8;fontColor=#51cf66;fontStyle=1;fontSize=14;',
    color: '#51cf66',
    description: '[Subnet Boundary]'
  },
  'client': {
    shape: 'rounded=1;whiteSpace=wrap;html=1;arcSize=50;',
    color: '#08427B',
    description: '[Person]',
    textColor: '#FFFFFF'
  },
  'controller': {
    shape: 'rounded=1;whiteSpace=wrap;html=1;arcSize=10;',
    color: '#438DD5',
    description: 'Controller',
    textColor: '#FFFFFF'
  },
  'repository': {
    shape: 'shape=cylinder;whiteSpace=wrap;html=1;boundedLbl=1;backgroundOutline=1;',
    color: '#438DD5',
    description: 'Repository',
    textColor: '#FFFFFF'
  },
  'class': {
    shape: 'rounded=1;whiteSpace=wrap;html=1;arcSize=10;',
    color: '#438DD5',
    description: 'Class',
    textColor: '#FFFFFF'
  },
  'external-component': {
    shape: 'rounded=1;whiteSpace=wrap;html=1;arcSize=10;fillColor=#999999;strokeColor=#666666;fontColor=#FFFFFF;',
    color: '#999999',
    description: '[External Component]',
    textColor: '#FFFFFF'
  },
}

function deduplicateEdges(edges: Edge[], nodes: Node[]): { uniqueEdges: Edge[], removedCount: number } {
  // Use a Map to keep unique edges based on a strict key
  // We want to allow multiple edges between the same nodes IF they are different types or directions
  const edgeMap = new Map<string, Edge>();
  const totalCount = edges.length;

  edges.forEach(edge => {
    if (edge.hidden) return;

    const sId = String(edge.source).trim();
    const tId = String(edge.target).trim();

    // Filter out self-loops if needed (optional, but good for clean diagrams)
    if (sId === tId) return;



    // Filter out edges connecting to missing nodes (integrity check)
    const sNode = nodes.find(n => n.id === sId);
    const tNode = nodes.find(n => n.id === tId);

    if (!sNode || !tNode) {
      console.warn(`[Export] Dropping orphan edge ${edge.id} (Source: ${sId}, Target: ${tId}) - Node missing`);
      return;
    }

    // STRICT KEY GENERATION
    // 1. Source -> Target (Direction matters!)
    // 2. Connection Type (Distinct types allowed in parallel)
    // 3. Label (Different labels = different logical connections)

    const type = edge.data?.connectionType || 'default';
    const label = (typeof edge.label === 'string' ? edge.label :
      (edge.data?.dataDescription || edge.data?.description || '')).trim();

    // Key format: "SourceID->TargetID|Type|Label"
    // This allows:
    // - A->B (REST)
    // - A->B (Async)
    // - B->A (REST) -- distinct from A->B
    // - A->B (REST) "User Data" -- distinct from A->B (REST) "Logs"
    const key = `${sId}->${tId}|${type}|${label}`;

    // If exact duplicate exists, keep the one with more info or latest one
    if (edgeMap.has(key)) {
      // Ideally we just keep the latest one (overwrite)
      edgeMap.set(key, edge);
    } else {
      edgeMap.set(key, edge);
    }
  });

  const uniqueEdges = Array.from(edgeMap.values());
  const removedCount = totalCount - uniqueEdges.length;

  if (removedCount > 0) {
    console.log(`Deduplication: Removed ${removedCount} exact duplicate or hidden edges.`);
  }

  return { uniqueEdges, removedCount };
}

function generateDiagramContent(nodes: Node[], inputEdges: Edge[]): string {
  // --- 0. DEDUPLICATE EDGES AND FILTER GHOST NODES ---
  const activeNodes = nodes.filter(n => !n.data?.isGhost);
  const { uniqueEdges: edges } = deduplicateEdges(inputEdges, activeNodes);
  const finalNodes = activeNodes;

  // --- 1. PRE-CALCULATE ISOLATED PORT ASSIGNMENTS (GLOBAL OPTIMIZATION) ---

  const nodePorts: Record<string, {
    top: { edgeId: string, otherNodePos: { x: number, y: number } }[],
    bottom: { edgeId: string, otherNodePos: { x: number, y: number } }[],
    left: { edgeId: string, otherNodePos: { x: number, y: number } }[],
    right: { edgeId: string, otherNodePos: { x: number, y: number } }[]
  }> = {}

  nodes.forEach(node => {
    nodePorts[node.id] = { top: [], bottom: [], left: [], right: [] }
  })

  edges.forEach(edge => {
    const sourceNode = nodes.find(n => n.id === edge.source)
    const targetNode = nodes.find(n => n.id === edge.target)
    if (!sourceNode || !targetNode) return

    const sourceIsTableCol = !!(edge.sourceHandle && sourceNode.data?.type === 'table')
    const targetIsTableCol = !!(edge.targetHandle && targetNode.data?.type === 'table')

    const scx = sourceNode.position.x + (sourceNode.width || 0) / 2
    const scy = sourceNode.position.y + (sourceNode.height || 0) / 2
    const tcx = targetNode.position.x + (targetNode.width || 0) / 2
    const tcy = targetNode.position.y + (targetNode.height || 0) / 2

    const dx = tcx - scx
    const dy = tcy - scy

    let exitSide: 'top' | 'bottom' | 'left' | 'right' = 'right'
    if (Math.abs(dy) < 80 && Math.abs(dx) > Math.abs(dy)) {
      exitSide = dx > 0 ? 'right' : 'left'
    } else {
      exitSide = dy > 0 ? 'bottom' : 'top'
    }

    if (!sourceIsTableCol) {
      nodePorts[sourceNode.id][exitSide].push({ edgeId: edge.id, otherNodePos: { x: tcx, y: tcy } })
    }

    let entrySide: 'top' | 'bottom' | 'left' | 'right' = 'left'
    if (Math.abs(dy) < 80 && Math.abs(dx) > Math.abs(dy)) {
      entrySide = dx > 0 ? 'left' : 'right'
    } else {
      entrySide = dy > 0 ? 'top' : 'bottom'
    }

    if (!targetIsTableCol) {
      nodePorts[targetNode.id][entrySide].push({ edgeId: edge.id, otherNodePos: { x: scx, y: scy } })
    }
  })

  const edgePortAssignments: Record<string, {
    exit?: { x: number, y: number, rank: number, side: 'top' | 'bottom' | 'left' | 'right' },
    entry?: { x: number, y: number, rank: number, side: 'top' | 'bottom' | 'left' | 'right' }
  }> = {}

  Object.keys(nodePorts).forEach(nodeId => {
    const sides = nodePorts[nodeId]
    Object.keys(sides).forEach(sideKey => {
      const side = sideKey as 'top' | 'bottom' | 'left' | 'right'
      const requests = sides[side]
      if (requests.length === 0) return

      if (side === 'top' || side === 'bottom') {
        requests.sort((a, b) => {
          const diff = a.otherNodePos.x - b.otherNodePos.x
          return Math.abs(diff) < 1 ? a.edgeId.localeCompare(b.edgeId) : diff
        })
      } else {
        requests.sort((a, b) => {
          const diff = a.otherNodePos.y - b.otherNodePos.y
          return Math.abs(diff) < 1 ? a.edgeId.localeCompare(b.edgeId) : diff
        })
      }

      requests.forEach((req, index) => {
        const safeZone = 0.6
        const start = 0.2
        const step = requests.length > 1 ? safeZone / (requests.length - 1) : 0
        const offset = requests.length === 1 ? 0.5 : start + (step * index)
        const rank = index

        let x = 0, y = 0
        if (side === 'left') { x = 0; y = offset; }
        else if (side === 'right') { x = 1; y = offset; }
        else if (side === 'top') { x = offset; y = 0; }
        else if (side === 'bottom') { x = offset; y = 1; }

        if (!edgePortAssignments[req.edgeId]) edgePortAssignments[req.edgeId] = {}
        const edge = edges.find(e => e.id === req.edgeId)
        if (edge) {
          if (edge.source === nodeId) edgePortAssignments[req.edgeId].exit = { x, y, rank, side }
          if (edge.target === nodeId) edgePortAssignments[req.edgeId].entry = { x, y, rank, side }
        }
      })
    })
  })

  const systemNodes = finalNodes.filter(node => {
    const type = (node.data as ComponentData).type
    return type === 'system' || type === 'external-system' || type === 'business-domain'
  })
  const regularNodes = finalNodes.filter(node => {
    const type = (node.data as ComponentData).type
    return type !== 'system' && type !== 'external-system' && type !== 'business-domain'
  })

  const getAbsPos = (n: Node) => {
    let absX = n.position.x
    let absY = n.position.y
    let currParentId = n.parentNode
    while (currParentId) {
      const parent = finalNodes.find(p => p.id === currParentId)
      if (parent) {
        absX += parent.position.x
        absY += parent.position.y
        currParentId = parent.parentNode
      } else break
    }
    return { x: absX, y: absY }
  }

  const systemCells = systemNodes.map((node) => {
    const data = node.data as ComponentData
    const width = node.width || 600
    const height = node.height || 400
    const absPos = getAbsPos(node)
    const x = absPos.x
    const y = absPos.y
    const parentId = '1'
    const nodeLabel = typeof data.label === 'string' ? data.label : 'System'
    const escapedLabel = escapeXml(String(nodeLabel))
    let config = c4Shapes[data.type] || c4Shapes['system']
    let style = config.shape
    if (config.color) {
      if (style.includes('strokeColor=')) {
        style = style.replace(/strokeColor=[^;]+/, `strokeColor=${config.color}`)
      } else {
        style += `strokeColor=${config.color};`
      }
    }

    if (!style.includes('perimeter=')) style += 'perimeter=rectanglePerimeter;'
    if (!style.includes('pointerEvents=')) style += 'pointerEvents=1;'
    if (!style.includes('backgroundOutline=')) style += 'backgroundOutline=1;'
    if (!style.includes('noEdgeStyle=')) style += 'noEdgeStyle=0;'
    if (!style.includes('container=')) style += 'container=1;'
    if (!style.includes('opaque=')) style += 'opaque=1;'
    if (!style.includes('fillColor=')) style += 'fillColor=#F8F9FA;'

    return `    <mxCell id="${node.id}" value="${escapedLabel}" style="${style}" vertex="1" parent="${parentId}">
      <mxGeometry x="${x}" y="${y}" width="${width}" height="${height}" as="geometry" />
    </mxCell>`
  }).join('\n')

  const regularCells = regularNodes.map((node) => {
    const data = node.data as ComponentData
    let width = 200
    let height = 150
    if (data.type === 'client') { width = 180; height = 160 }
    else if (data.type === 'message-broker' || data.type === 'queue') { width = 130; height = 300 }
    else if (data.type === 'table') {
      width = 240
      const rowCount = data.tableConfig?.columns?.length || 0
      height = 30 + 12 + (rowCount * 32) + (Math.max(0, rowCount - 1) * 4)
    }

    const absPos = getAbsPos(node)
    const x = absPos.x
    const y = absPos.y
    const parentId = '1'

    const c4Config = c4Shapes[data.type] || {
      shape: 'mxgraph.c4.container;lazy=0;whiteSpace=wrap;html=1;fillColor=#438DD5;strokeColor=#3C7FC0;strokeWidth=2;fontColor=#FFFFFF;',
      color: '#438DD5',
      description: 'Component',
      textColor: '#FFFFFF'
    }

    const isNew = data.status === 'new'
    const isExisting = data.status === 'existing'
    const isRefinement = data.status === 'refinement'

    let fillColor = c4Config.color || '#438DD5'
    let strokeMatch = c4Config.shape.match(/strokeColor=([^;]+)/)
    let strokeColor = strokeMatch ? strokeMatch[1] : '#3C7FC0'
    let fontColor = c4Config.textColor || '#FFFFFF'

    if (isNew) { fillColor = '#82B366'; strokeColor = '#457c2a'; fontColor = '#FFFFFF' }
    else if (isExisting) { fillColor = '#438DD5'; strokeColor = '#3C7FC0'; fontColor = '#FFFFFF' }
    else if (isRefinement) { fillColor = '#FFD966'; strokeColor = '#D6B656'; fontColor = '#000000' }

    let label = ''
    if (data.type === 'frontend') {
      const nodeLabel = typeof node.data.label === 'string' ? node.data.label : 'Клиентское приложение'
      const escapedLabelLabel = escapeXml(String(nodeLabel))
      const frontendBgColor = fillColor
      const frontendTitleColor = strokeColor
      const feTextColor = fontColor
      label = `<div style="width:100%;height:100%;border-radius:4px;overflow:hidden;margin:0;padding:0;display:block;"><table cellpadding="0" cellspacing="0" border="0" style="width:100%;height:100%;background-color:${frontendBgColor};border-collapse:collapse;margin:0;padding:0;table-layout:fixed;"><tr><td style="background-color:${frontendTitleColor};height:24px;padding:0 10px;vertical-align:middle;text-align:left;line-height:24px;margin:0;border:0;width:100%;display:table-cell;"><span style="display:inline-block;width:10px;height:10px;background-color:#E0E0E0;margin-right:6px;vertical-align:middle;border-radius:50%;"></span><span style="display:inline-block;width:10px;height:10px;background-color:#E0E0E0;margin-right:6px;vertical-align:middle;border-radius:50%;"></span><span style="display:inline-block;width:10px;height:10px;background-color:#E0E0E0;margin-right:6px;vertical-align:middle;border-radius:50%;"></span></td></tr><tr><td style="height:100%;vertical-align:top;text-align:center;color:${feTextColor};font-weight:bold;font-size:14px;padding:12px 8px;border:0;margin:0;">${escapedLabelLabel}</td></tr></table></div>`
    } else if (data.type === 'client') {
      const nodeLabel = typeof node.data.label === 'string' ? node.data.label : 'Client'
      const labelContent = `<b>${escapeXml(nodeLabel)}</b><br><span style="color:${fontColor};font-size:12px;">[Person]</span>`
      const parentStyle = 'group;html=1;whiteSpace=wrap;fillColor=none;strokeColor=none;connectable=1;'
      return `<mxCell id="${node.id}" value="" style="${parentStyle}" vertex="1" parent="${parentId}"><mxGeometry x="${x}" y="${y}" width="${width}" height="${height}" as="geometry" /></mxCell>\n<mxCell id="${node.id}_head" value="" style="ellipse;whiteSpace=wrap;html=1;fillColor=${fillColor};strokeColor=${strokeColor};strokeWidth=2;fontColor=${fontColor};" vertex="1" parent="${node.id}"><mxGeometry x="${(width - 50) / 2}" y="0" width="50" height="50" as="geometry" /></mxCell>\n<mxCell id="${node.id}_body" value="${escapeXml(labelContent)}" style="rounded=1;whiteSpace=wrap;html=1;arcSize=20;fillColor=${fillColor};strokeColor=${strokeColor};strokeWidth=2;align=center;verticalAlign=middle;fontColor=${fontColor};" vertex="1" parent="${node.id}"><mxGeometry x="0" y="45" width="${width}" height="${height - 45}" as="geometry" /></mxCell>`
    } else if (data.type === 'table' && data.tableConfig?.columns) {
      const nodeLabel = typeof node.data.label === 'string' ? node.data.label : 'Table'
      const rowCount = data.tableConfig.columns.length
      const headerHeight = 30
      const totalHeight = headerHeight + 12 + (rowCount * 32) + (Math.max(0, rowCount - 1) * 4)
      const parentStyle = `rounded=1;whiteSpace=wrap;html=1;fillColor=#25262B;strokeColor=${strokeColor};strokeWidth=2;arcSize=5;connectable=0;`
      const parentCell = `    <mxCell id="${node.id}" value="" style="${parentStyle}" vertex="1" parent="${parentId}"> <mxGeometry x="${x}" y="${y}" width="${width}" height="${totalHeight}" as="geometry" /> </mxCell>`
      const headerCell = `    <mxCell id="${node.id}_header" value="${escapeXml(nodeLabel)}" style="text;html=1;strokeColor=${strokeColor};fillColor=${fillColor};align=center;verticalAlign=middle;whiteSpace=wrap;rounded=0;fontColor=${fontColor};fontStyle=1;fontSize=14;" vertex="1" parent="${node.id}"> <mxGeometry x="0" y="0" width="${width}" height="${headerHeight}" as="geometry" /> </mxCell>`
      const childCells = data.tableConfig.columns.map((column: any, index: number) => {
        const colId = `${node.id}_col_${index}`
        const colY = headerHeight + 6 + (index * (32 + 4))
        const keyIcon = column.isPrimaryKey ? '<span style="color:#FCC419;margin-right:8px;">🔑</span>' : '<span style="display:inline-block;width:20px;"></span>'
        const labelContent = `<div style="display:flex;align-items:center;width:100%;height:100%;box-sizing:border-box;padding:0 10px;">${keyIcon}<span style="font-weight:bold;margin-right:8px;color:#FFFFFF;">${escapeXml(column.name)}</span><span style="color:#909296;margin-left:auto;font-family:monospace;">${escapeXml(column.type)}</span></div>`
        return `    <mxCell id="${colId}" value="${escapeXml(labelContent)}" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#25262B;strokeColor=#2C2E33;strokeWidth=1;arcSize=10;align=left;spacingLeft=0;" vertex="1" parent="${node.id}"> <mxGeometry x="0" y="${colY}" width="${width}" height="32" as="geometry" /> </mxCell>`
      }).join('\n')
      return parentCell + '\n' + headerCell + '\n' + childCells
    } else {
      const nodeLabel = typeof node.data.label === 'string' ? node.data.label : data.type
      label = `<div style="color:${fontColor};"><b>${escapeXml(String(nodeLabel))}</b>`
      let technology = ''
      if (data.databaseConfig?.vendor) technology = String(data.databaseConfig.vendor)
      else if (data.serviceConfig?.language) technology = String(data.serviceConfig.language)
      else if (data.messageBrokerConfig?.vendor) technology = String(data.messageBrokerConfig.vendor)
      else if (data.frontendConfig?.framework) technology = String(data.frontendConfig.framework)
      else if (data.apiGatewayConfig?.vendor) technology = String(data.apiGatewayConfig.vendor)
      if (technology) label += `<br/><i style="color:${fontColor};opacity:0.9;">${escapeXml(technology)}</i>`
      if (c4Config.description) label += `<br/><font size="1" color="${fontColor}" style="opacity:0.8;">${escapeXml(c4Config.description)}</font>`
      label += `</div>`
    }
    const escapedLabelCombined = label.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
    let componentStyle = c4Config.shape
    if (componentStyle.includes('fillColor=')) componentStyle = componentStyle.replace(/fillColor=[^;]+/, `fillColor=${fillColor}`)
    else componentStyle += `fillColor=${fillColor};`
    if (componentStyle.includes('strokeColor=')) componentStyle = componentStyle.replace(/strokeColor=[^;]+/, `strokeColor=${strokeColor}`)
    else componentStyle += `strokeColor=${strokeColor};`
    if (componentStyle.includes('fontColor=')) componentStyle = componentStyle.replace(/fontColor=[^;]+/, `fontColor=${fontColor}`)
    else componentStyle += `fontColor=${fontColor};`
    if (data.type === 'table') componentStyle = 'shape=label;html=1;whiteSpace=wrap;fillColor=none;strokeColor=none;align=center;verticalAlign=top;spacingLeft=0;spacingTop=0;'

    if (!componentStyle.includes('perimeter=')) componentStyle += 'perimeter=rectanglePerimeter;'
    if (!componentStyle.includes('pointerEvents=')) componentStyle += 'pointerEvents=1;'
    if (!componentStyle.includes('backgroundOutline=')) componentStyle += 'backgroundOutline=1;'
    if (!componentStyle.includes('noEdgeStyle=')) componentStyle += 'noEdgeStyle=0;'
    if (!componentStyle.includes('container=')) componentStyle += 'container=0;'
    if (!componentStyle.includes('opaque=')) componentStyle += 'opaque=1;'

    return `    <mxCell id="${node.id}" value="${escapedLabelCombined}" style="${componentStyle}" vertex="1" parent="${parentId}">
      <mxGeometry x="${x}" y="${y}" width="${width}" height="${height}" as="geometry" />
    </mxCell>`
  }).join('\n')

  let maxY = 0
  let minX = Infinity
  regularNodes.forEach(n => {
    const absPos = getAbsPos(n)
    const h = n.height || 150
    if (absPos.y + h > maxY) maxY = absPos.y + h
    if (absPos.x < minX) minX = absPos.x
  })
  if (minX === Infinity) minX = 0
  const legendY = maxY + 100
  const legendX = minX

  const legendXml = `
    <!-- LEGEND -->
     <mxCell id="legend_bg" value="" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#f5f5f5;strokeColor=#666666;" vertex="1" parent="1"> <mxGeometry x="${legendX}" y="${legendY}" width="280" height="140" as="geometry" /> </mxCell>
     <mxCell id="legend_title" value="Component Status Legend" style="text;html=1;strokeColor=none;fillColor=none;align=center;verticalAlign=middle;whiteSpace=wrap;rounded=0;fontStyle=1;fontSize=14;" vertex="1" parent="1"> <mxGeometry x="${legendX}" y="${legendY + 10}" width="280" height="20" as="geometry" /> </mxCell>
     <mxCell id="legend_new_rect" value="" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#82B366;strokeColor=#457c2a;" vertex="1" parent="1"> <mxGeometry x="${legendX + 20}" y="${legendY + 40}" width="30" height="20" as="geometry" /> </mxCell>
     <mxCell id="legend_new_text" value="New Component" style="text;html=1;strokeColor=none;fillColor=none;align=left;verticalAlign=middle;whiteSpace=wrap;rounded=0;" vertex="1" parent="1"> <mxGeometry x="${legendX + 60}" y="${legendY + 40}" width="200" height="20" as="geometry" /> </mxCell>
     <mxCell id="legend_existing_rect" value="" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#438DD5;strokeColor=#3C7FC0;" vertex="1" parent="1"> <mxGeometry x="${legendX + 20}" y="${legendY + 70}" width="30" height="20" as="geometry" /> </mxCell>
     <mxCell id="legend_existing_text" value="Existing Component" style="text;html=1;strokeColor=none;fillColor=none;align=left;verticalAlign=middle;whiteSpace=wrap;rounded=0;" vertex="1" parent="1"> <mxGeometry x="${legendX + 60}" y="${legendY + 70}" width="200" height="20" as="geometry" /> </mxCell>
     <mxCell id="legend_refinement_rect" value="" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#FFD966;strokeColor=#D6B656;" vertex="1" parent="1"> <mxGeometry x="${legendX + 20}" y="${legendY + 100}" width="30" height="20" as="geometry" /> </mxCell>
     <mxCell id="legend_refinement_text" value="Requires Refinement" style="text;html=1;strokeColor=none;fillColor=none;align=left;verticalAlign=middle;whiteSpace=wrap;rounded=0;" vertex="1" parent="1"> <mxGeometry x="${legendX + 60}" y="${legendY + 100}" width="200" height="20" as="geometry" /> </mxCell>
  `

  const mxGraphModel = systemCells + '\n' + regularCells + '\n' + legendXml

  const edgeGroups = new Map<string, Edge[]>()
  edges.forEach(edge => {
    const pairId = [edge.source, edge.target].sort().join('--')
    if (!edgeGroups.has(pairId)) edgeGroups.set(pairId, [])
    edgeGroups.get(pairId)?.push(edge)
  })

  const mxEdges = edges.map((edge, index) => {
    const sourceNode = finalNodes.find(n => n.id === edge.source)
    const targetNode = finalNodes.find(n => n.id === edge.target)
    if (!sourceNode || !targetNode) return ''

    const pairId = [edge.source, edge.target].sort().join('--')
    let labelX = 0
    let groupIdx = 0
    if (edgeGroups.has(pairId)) {
      const group = edgeGroups.get(pairId)!
      groupIdx = group.findIndex(e => e.id === edge.id)
      const count = group.length
      if (count > 1) {
        labelX = ((groupIdx / (count - 1)) - 0.5) * 1.6
        if (isNaN(labelX)) labelX = 0
      }
    }

    let exitConstraint = ''
    let entryConstraint = ''
    if (edgePortAssignments[edge.id]?.exit?.side) {
      const s = edgePortAssignments[edge.id].exit!.side
      const dir = s === 'top' ? 'north' : s === 'bottom' ? 'south' : s === 'left' ? 'west' : 'east'
      exitConstraint = `exitConstraint=${dir};`
    }
    if (edgePortAssignments[edge.id]?.entry?.side) {
      const s = edgePortAssignments[edge.id].entry!.side
      const dir = s === 'top' ? 'north' : s === 'bottom' ? 'south' : s === 'left' ? 'west' : 'east'
      entryConstraint = `entryConstraint=${dir};`
    }

    let edgeStyle = `edgeStyle=orthogonalEdgeStyle;avoidObstacle=1;rounded=1;curved=0;jumpStyle=arc;jumpSize=10;orthogonalLoop=1;jettySize=auto;sourcePerimeterSpacing=12;targetPerimeterSpacing=12;html=1;strokeWidth=2;fontSize=11;fontColor=#000000;labelBackgroundColor=#FFFFFF;labelBorderColor=none;align=center;endArrow=block;${exitConstraint}${entryConstraint}`

    const getConnectionTypeLabel = (type: string): string => {
      switch (type) {
        case 'rest': return 'REST';
        case 'grpc': return 'gRPC';
        case 'async': return 'Async';
        case 'async-bidirectional': return 'Async (Bidirectional)';
        case 'database-connection': return 'Reads/Writes';
        case 'database-replication': return 'Replication';
        case 'cache-connection': return 'Caches';
        case 'dependency': return 'Зависимость';
        case 'composition': return 'Композиция';
        case 'aggregation': return 'Агрегация';
        case 'method-call': return 'Вызов метода';
        case 'inheritance': return 'Наследование';
        case 'oidc': return 'OpenID Connect';
        case 'oauth2': return 'OAuth 2.0';
        case 'saml': return 'SAML';
        case 'ws': return 'WebSocket';
        case 'wss': return 'WSS';
        case 'graphql': return 'GraphQL';
        default: return type.toUpperCase();
      }
    }

    const getEdgeLineColor = (edgeData: any): string => {
      if (edgeData?.customColor) return edgeData.customColor;
      switch (edgeData?.connectionType) {
        case 'async':
        case 'async-bidirectional': return '#ffd43b';
        case 'database-connection': return '#51cf66';
        case 'database-replication': return '#20c997';
        case 'cache-connection': return '#845ef7';
        case 'ws':
        case 'wss': return '#339af0';
        case 'graphql': return '#e64980';
        case 'dependency': return '#9c88ff';
        case 'composition': return '#ff6b6b';
        case 'aggregation': return '#ff8787';
        case 'method-call': return '#51cf66';
        case 'inheritance': return '#4dabf7';
        case 'related': return '#adb5bd';
        default: return '#333333';
      }
    }

    const edgeColor = getEdgeLineColor(edge.data);

    if (
      edge.data?.connectionType === 'async' ||
      edge.data?.connectionType === 'async-bidirectional' ||
      edge.data?.connectionType === 'ws' ||
      edge.data?.connectionType === 'wss' ||
      edge.data?.connectionType === 'database-replication'
    ) {
      edgeStyle += 'dashed=1;dashPattern=8 4;';
    } else if (edge.data?.connectionType === 'inheritance') {
      edgeStyle += 'dashed=1;dashPattern=5 5;';
    }

    if (
      edge.data?.connectionType === 'async-bidirectional' ||
      edge.data?.connectionType === 'bidirectional'
    ) {
      edgeStyle += 'startArrow=block;';
    }

    let edgeLabel = ''
    const customLabel = (typeof edge.label === 'string' && edge.label.trim())
      ? edge.label.trim()
      : (typeof edge.data?.dataDescription === 'string' && edge.data.dataDescription.trim())
        ? edge.data.dataDescription.trim()
        : (typeof edge.data?.description === 'string' && edge.data.description.trim())
          ? edge.data.description.trim()
          : '';

    if (customLabel) {
      edgeLabel = customLabel;
    } else if (edge.data?.relationshipType) {
      const relType = edge.data.relationshipType
      edgeStyle = 'endArrow=none;html=1;rounded=0;strokeWidth=2;fontSize=11;fontColor=#000000;labelBackgroundColor=#FFFFFF;'
      const [startCard, endCard] = relType.split(':')
      const startLabel = (startCard === 'n' || startCard === 'm') ? 'N' : '1'
      const endLabel = (endCard === 'n' || endCard === 'm') ? 'N' : '1'
      edgeLabel = `${startLabel}:${endLabel}`
    } else {
      const typeLabel = edge.data?.connectionType ? getConnectionTypeLabel(edge.data.connectionType) : '';
      edgeLabel = typeLabel;
    }

    // Strip Sync/Async prefix if present
    edgeLabel = edgeLabel.replace(/^(Sync|Async):\s*/i, '');

    // Helper to format text for Draw.io
    // 1. Preserves existing newlines by converting \n to &#10;
    // 2. Auto-wraps long single-line text to prevent massive width
    const formatLabelForDrawIO = (text: string, maxLength: number = 25): string => {
      if (!text) return text;

      // Detect if there are already manual line breaks
      const hasNewlines = text.includes('\n');

      if (hasNewlines) {
        // If user manually formatted it, respect it!
        // Just convert JS newlines to Draw.io XML newlines
        return text.replace(/\n/g, '&#10;');
      }

      // If it's a single long line, wrap it algorithmically
      if (text.length <= maxLength) return text;

      const words = text.split(' ');
      let currentLine = '';
      let result = '';

      words.forEach(word => {
        if ((currentLine + word).length > maxLength) {
          result += (currentLine.trim() + '&#10;');
          currentLine = word + ' ';
        } else {
          currentLine += word + ' ';
        }
      });
      result += currentLine.trim();
      return result;
    };

    // Apply formatting
    edgeLabel = formatLabelForDrawIO(edgeLabel);

    let sourceId = edge.source
    let targetId = edge.target
    let forcedExitX = null;
    let forcedExitY = null;
    let forcedEntryX = null;
    let forcedEntryY = null;

    if (edge.sourceHandle && sourceNode.data?.type === 'table') {
      const handleParts = edge.sourceHandle.split('-')
      let columnIndex = -1
      if (handleParts[0] === 'col' && !isNaN(parseInt(handleParts[1]))) {
        columnIndex = parseInt(handleParts[1], 10)
      }
      if (columnIndex >= 0) {
        sourceId = `${sourceNode.id}_col_${columnIndex}`
        const side = handleParts[handleParts.length - 1]
        forcedExitX = side === 'left' ? 0 : 1
        forcedExitY = 0.5
      }
    } else {
      const assignment = edgePortAssignments[edge.id]?.exit
      if (assignment) {
        forcedExitX = assignment.x
        forcedExitY = assignment.y
      }
    }

    if (edge.targetHandle && targetNode.data?.type === 'table') {
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
    } else {
      const assignment = edgePortAssignments[edge.id]?.entry
      if (assignment) {
        forcedEntryX = assignment.x
        forcedEntryY = assignment.y
      }
    }

    let connectionAttrs = ''
    if (forcedExitX !== null) connectionAttrs += `exitX=${forcedExitX};exitY=${forcedExitY};`
    if (forcedEntryX !== null) connectionAttrs += `entryX=${forcedEntryX};entryY=${forcedEntryY};`

    const exitAss = edgePortAssignments[edge.id]?.exit
    const entryAss = edgePortAssignments[edge.id]?.entry
    const stubLen = 40 + (groupIdx * 15)

    if (exitAss) {
      if (exitAss.side === 'left') connectionAttrs += `exitDx=-${stubLen};`
      else if (exitAss.side === 'right') connectionAttrs += `exitDx=${stubLen};`
      else if (exitAss.side === 'top') connectionAttrs += `exitDy=-${stubLen};`
      else if (exitAss.side === 'bottom') connectionAttrs += `exitDy=${stubLen};`
    }
    if (entryAss) {
      if (entryAss.side === 'left') connectionAttrs += `entryDx=-${stubLen};`
      else if (entryAss.side === 'right') connectionAttrs += `entryDx=${stubLen};`
      else if (entryAss.side === 'top') connectionAttrs += `entryDy=-${stubLen};`
      else if (entryAss.side === 'bottom') connectionAttrs += `entryDy=${stubLen};`
    }

    const labelY = (groupIdx % 2 === 0) ? -15 : 15
    const geometryXml = `<mxGeometry x="${labelX}" y="${labelY}" relative="1" as="geometry" />`
    const escapedLabelValue = escapeXml(String(edgeLabel))

    return `    <mxCell id="edge_${index}" value="${escapedLabelValue}" style="${edgeStyle}strokeColor=${edgeColor};${connectionAttrs}" edge="1" parent="1" source="${sourceId}" target="${targetId}">
      ${geometryXml}
    </mxCell>`
  }).filter(e => e).join('\n')

  return mxGraphModel + '\n' + mxEdges
}

export function exportToDrawIO(nodes: Node[], edges: Edge[], workspaces?: { id: string, name: string, nodes: Node[], edges: Edge[] }[]): string {
  // Use workspaces if available, otherwise fallback to single page
  const dataToExport = (workspaces && workspaces.length > 0)
    ? workspaces
    : [{ id: 'default', name: 'C4 Architecture Diagram', nodes, edges }];

  const pagesXml = dataToExport.map((ws, index) => {
    const content = generateDiagramContent(ws.nodes, ws.edges);
    return `  <diagram id="${ws.id}" name="${escapeXml(ws.name)}">
    <mxGraphModel dx="1422" dy="794" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="4000" pageHeight="3000" math="0" shadow="0" connectable="1" metaEdit="1">
      <root>
        <mxCell id="0" />
        <mxCell id="1" parent="0" />
${content}
      </root>
    </mxGraphModel>
  </diagram>`;
  }).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<mxfile host="app.diagrams.net" modified="${new Date().toISOString()}" agent="Architecture Designer" version="21.0.0" etag="" type="device" pages="${dataToExport.length}">
${pagesXml}
</mxfile>`;
}

export function saveToDrawIOFile(nodes: Node[], edges: Edge[], workspaces?: { id: string, name: string, nodes: Node[], edges: Edge[] }[]): void {
  // exportToDrawIO now handles multi-page logic
  const xml = exportToDrawIO(nodes, edges, workspaces)

  const blob = new Blob([xml], { type: 'application/xml' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `c4-architecture-diagram-${new Date().toISOString().split('T')[0]}.drawio`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)

  setTimeout(() => {
    const pageCount = (workspaces && workspaces.length > 0) ? workspaces.length : 1
    // Calculate total stats
    let totalEdges = 0
    if (workspaces && workspaces.length > 0) {
      workspaces.forEach(ws => totalEdges += deduplicateEdges(ws.edges, ws.nodes).uniqueEdges.length)
    } else {
      totalEdges = deduplicateEdges(edges, nodes).uniqueEdges.length
    }

    alert(`Диаграмма экспортирована в формате C4 Model!\n\nВсего страниц: ${pageCount}\n\nПри открытии в draw.io:\n1. Выберите "More Shapes" → "C4 Model"\n2. Легенда объясняет цветовое кодирование статусов.`)
  }, 100)
}
