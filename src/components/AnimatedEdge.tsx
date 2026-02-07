import { EdgeProps, getStraightPath, getSmoothStepPath, EdgeLabelRenderer, useReactFlow, Position, useStore } from 'reactflow'
import { useState, useEffect, useRef, memo, useMemo } from 'react'
import { X, TrendingUp, AlertTriangle, Tag } from 'lucide-react'
import React from 'react'
import { renderFormattedText } from '../utils/textUtils'
import { EdgePathType } from '../types'

function AnimatedEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  data,
  label,
  labelStyle,
  selected,
}: EdgeProps) {
  // Получаем узлы для определения их типов
  const { setEdges, getViewport, screenToFlowPosition } = useReactFlow()
  const zoom = useStore((s) => s.transform[2])
  const [, setTick] = useState(0)
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

  // Force update on mount to ensure coordinates are correctly resolved
  useEffect(() => {
    const timer = setTimeout(() => setTick(t => t + 1), 50);
    return () => clearTimeout(timer);
  }, []);

  // Safety check: if coordinates are not valid, render an empty group to keep the component mounted
  if (isNaN(sourceX) || isNaN(sourceY) || isNaN(targetX) || isNaN(targetY)) {
    console.log(`[AnimatedEdge ${id}] NaN coordinates:`, { sourceX, sourceY, targetX, targetY });
    return <g className="react-flow__edge animated-edge-loading" id={id} />;
  }

  // Инициализируем refs ДО их использования
  // Поддержка массива waypoints для множественных точек изгиба
  // Инициализируем waypointsRef сразу из data, чтобы избежать "скачков" при первом рендере
  const waypointsRef = useRef<Array<{ x: number; y: number; id: string }>>(
    (data?.waypoints && Array.isArray(data.waypoints))
      ? data.waypoints.map((wp: any, index: number) => ({
        x: wp.x,
        y: wp.y,
        id: wp.id || `waypoint-${id}-${index}`,
      }))
      : (data?.waypointX !== undefined && data?.waypointY !== undefined)
        ? [{ x: data.waypointX, y: data.waypointY, id: `waypoint-${id}-0` }]
        : []
  )
  // State for vertical segment position - crucial for triggering re-renders
  // Инициализируем сразу из data
  const [verticalSegmentX, setVerticalSegmentX] = useState<number | null>(() => data?.verticalSegmentX ?? null)

  // Состояние для отслеживания перетаскивания конкретного waypoint
  const [draggedWaypointId, setDraggedWaypointId] = useState<string | null>(null)
  // Состояние для отслеживания перетаскивания метки (label)
  const [isDraggingLabel, setIsDraggingLabel] = useState(false)
  // Состояние для отслеживания перетаскивания индикаторов (delete, load, incorrect)
  const [draggedIndicator, setDraggedIndicator] = useState<string | null>(null)

  // Определяем тип пути из данных edge (по умолчанию - прямая линия)
  const pathType: EdgePathType = (data?.pathType as EdgePathType) || 'straight'

  // Вычисляем путь в зависимости от типа
  // Если задан verticalSegmentX, используем его для построения прямоугольного пути
  const pathResult = useMemo(() => {
    if (pathType === 'step' || pathType === 'smoothstep') {
      // Calculate effective X: use state or default to midpoint
      // Используем вертикальный сегмент из стейта или из данных
      const effectiveX = verticalSegmentX ?? data?.verticalSegmentX ?? (sourceX + targetX) / 2

      // If we have state OR we are in a step/smoothstep mode without waypoints, we should render the custom path
      if (waypointsRef.current.length === 0) {
        // Определяем среднюю Y-координату для вертикального сегмента
        const midY = (sourceY + targetY) / 2

        // Строим прямоугольный путь: source -> (effectiveX, sourceY) -> (effectiveX, targetY) -> target
        const customPath = `M ${sourceX} ${sourceY} L ${effectiveX} ${sourceY} L ${effectiveX} ${targetY} L ${targetX} ${targetY}`
        return [customPath, (sourceX + targetX) / 2, midY] as [string, number, number]
      }

      // Прямоугольная линия (со скруглением или без)
      return getSmoothStepPath({
        sourceX,
        sourceY,
        targetX,
        targetY,
        sourcePosition,
        targetPosition,
        borderRadius: pathType === 'smoothstep' ? 10 : 0, // Без скругления для 'step', со скруглением для 'smoothstep'
      })
    } else {
      // Прямая линия
      return getStraightPath({
        sourceX,
        sourceY,
        targetX,
        targetY,
      })
    }
  }, [sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, pathType, verticalSegmentX, data?.waypoints])

  const [edgePath, labelX, labelY] = pathResult;
  console.log(`[AnimatedEdge ${id}] pathResult:`, { edgePath, labelX, labelY, pathType });

  // Направление потока данных всегда от source к target (как направлена стрелка)
  // Точка должна двигаться от компонента source к компоненту target

  // Функция для вычисления ближайшего handle на узле с учетом направления

  const [isDragging, setIsDragging] = useState(false)
  const [isDraggingVerticalSegment, setIsDraggingVerticalSegment] = useState(false)
  const dragStartRef = useRef<{ x: number; y: number } | null>(null)
  const dragOffsetRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 })

  // Загружаем waypoints из edge data при монтировании и при изменении data
  // Поддерживаем как новый формат (массив waypoints), так и старый (waypointX, waypointY)
  useEffect(() => {
    if (data?.waypoints && Array.isArray(data.waypoints) && data.waypoints.length > 0) {
      // Новый формат: массив waypoints
      const newWaypoints = data.waypoints.map((wp: { x: number; y: number; id?: string }, index: number) => ({
        x: wp.x,
        y: wp.y,
        id: wp.id || `waypoint-${id}-${index}`,
      }))

      // Обновляем только если waypoints изменились
      const hasChanged = waypointsRef.current.length !== newWaypoints.length ||
        waypointsRef.current.some((wp, i) =>
          !newWaypoints[i] ||
          Math.abs(wp.x - newWaypoints[i].x) > 0.01 ||
          Math.abs(wp.y - newWaypoints[i].y) > 0.01
        )

      if (hasChanged) {
        waypointsRef.current = newWaypoints
        console.log('📂 Загружены waypoints для edge:', id, newWaypoints)
      }
    } else if (data?.waypointX !== undefined && data?.waypointY !== undefined) {
      // Старый формат: одиночный waypoint (обратная совместимость)
      const singleWaypoint = {
        x: data.waypointX,
        y: data.waypointY,
        id: `waypoint-${id}-0`,
      }

      if (waypointsRef.current.length !== 1 ||
        Math.abs(waypointsRef.current[0].x - singleWaypoint.x) > 0.01 ||
        Math.abs(waypointsRef.current[0].y - singleWaypoint.y) > 0.01) {
        waypointsRef.current = [singleWaypoint]
        console.log('📂 Загружен одиночный waypoint (старый формат) для edge:', id, singleWaypoint)
      }
    } else {
      // Если waypoints не найдены в data, очищаем их
      if (waypointsRef.current.length > 0) {
        console.log('🗑️ Очистка waypoints для edge:', id)
        waypointsRef.current = []
      }
    }
  }, [id, data?.waypoints, data?.waypointX, data?.waypointY])

  // Загружаем verticalSegmentX из data при инициализации
  // Загружаем verticalSegmentX из data при инициализации
  useEffect(() => {
    if (data?.verticalSegmentX !== undefined) {
      if (verticalSegmentX !== data.verticalSegmentX) {
        setVerticalSegmentX(data.verticalSegmentX)
      }
    } else {
      if (verticalSegmentX !== null) {
        setVerticalSegmentX(null)
      }
    }
  }, [id, data?.verticalSegmentX])

  // Force re-render on mount to ensure path is calculated after handles are positioned
  const [, forceUpdate] = useState({})
  React.useLayoutEffect(() => {
    forceUpdate({})
  }, [])

  // Мемоизируем вычисление цвета на основе типа соединения
  const edgeColor = React.useMemo(() => {
    const connectionType = data?.connectionType
    const customColor = data?.customColor

    if (customColor) return customColor

    switch (connectionType) {
      case 'async':
      case 'async-bidirectional':
        return '#fcc419' // Muted yellow (Amber)
      case 'database-connection':
        return '#40c057' // Muted green
      case 'database-replication':
        return '#12b886' // Muted teal
      case 'cache-connection':
        return '#7048e8' // Muted violet
      case 'ws':
      case 'wss':
        return '#339af0' // Muted blue
      case 'graphql':
        return '#d6336c' // Muted pink
      case 'dependency':
        return '#8c7ae6' // Muted purple
      case 'composition':
        return '#fa5252' // Muted red
      case 'aggregation':
        return '#ff8787'
      case 'method-call':
        return '#40c057'
      case 'inheritance':
        return '#339af0'
      case 'etl':
        return '#be4bdb'
      case 'jdbc':
        return '#0ca678'
      case 'kafka':
        return '#e67e22' // Muted orange
      case 'related':
        return '#adb5bd' // Grey
      default:
        return '#339af0' // Business blue
    }
  }, [data?.connectionType, data?.customColor])

  // Мемоизируем стиль линии
  const edgeStyle = React.useMemo(() => {
    const connectionType = data?.connectionType
    const isAsync = connectionType === 'async' || connectionType === 'async-bidirectional' || connectionType === 'ws' || connectionType === 'wss' || connectionType === 'database-replication'
    const isAsyncBidirectional = connectionType === 'async-bidirectional'
    const isRelated = connectionType === 'related'

    const isToBeDeleted = data?.toBeDeleted
    const isIncreasedLoad = data?.increasedLoad

    // Линия подсвечена, если она выделена, если у нее стоит флаг highlighted (авто) или accented (вручную)
    const isHighlighted = selected || data?.highlighted || data?.accented

    // Для асинхронной двухсторонней стрелки цвет остаётся жёлтым даже при выделении
    // Для related линии цвет серый, если не выделена
    // Если есть customColor, он имеет приоритет
    // Если линия в фоне, приглушаем её
    // Если линия подсвечена вручную (accented), используем розовый цвет акцента или highlightColor
    // Если она подсвечена автоматически (highlighted), используем highlightColor или стандартный синий
    let strokeColor = data?.isBackground
      ? (isDarkMode ? '#666' : '#bbb')
      : (isHighlighted && !isAsyncBidirectional && !isRelated && !data?.customColor)
        ? (data?.accented ? (data?.highlightColor || '#e64980') : (data?.highlightColor || '#4dabf7'))
        : (isAsyncBidirectional && !data?.customColor ? '#ffd43b' : edgeColor)

    if (isToBeDeleted && !data?.customColor) {
      strokeColor = '#dc3545'
    }

    // Определяем ширину линии: фон (2), акцент (8), обычная подсветка (4) или стандарт (2.5)
    let strokeWidth = data?.isBackground ? 2 : (data?.accented ? 8 : (isHighlighted ? 4 : 2.5))
    if (isIncreasedLoad) {
      strokeWidth += 3
    }

    if (data?.hasIncorrectData && !data?.customColor) {
      strokeColor = '#ff0000'
      strokeWidth = Math.max(strokeWidth, 3)
    }

    return {
      ...style,
      stroke: strokeColor,
      strokeWidth: strokeWidth,
      strokeDasharray: (isAsync || connectionType === 'async-bidirectional') ? '8 4' : style?.strokeDasharray,
      opacity: data?.isBackground ? 0.55 : 1,
      filter: 'none', // Убрано свечение (glow) для всех состояний по просьбе пользователя
    }
  }, [selected, data?.highlighted, data?.accented, data?.isBackground, data?.toBeDeleted, data?.increasedLoad, edgeColor, style, data?.connectionType, data?.highlightColor, data?.customColor, isDarkMode, data?.hasIncorrectData])

  // Вычисляем угол наклона линии для поворота иконок
  const edgeAngle = useMemo(() => {
    const dy = targetY - sourceY
    const dx = targetX - sourceX
    return Math.atan2(dy, dx) * (180 / Math.PI)
  }, [sourceX, sourceY, targetX, targetY])

  // Определяем тип соединения для отображения стрелок
  const connectionType = (data?.connectionType as string) || 'default'

  // Список типов, для которых в ConnectionMarkers.tsx определены специфические маркеры
  const wellKnownTypes = [
    'async',
    'async-bidirectional',
    'database-connection',
    'database-replication',
    'cache-connection',
    'dependency',
    'composition',
    'aggregation',
    'method-call',
    'inheritance',
    'rest',
    'grpc',
    'bidirectional',
    'ws',
    'wss',
    'graphql',
    'default'
  ]

  const isWellKnown = wellKnownTypes.includes(connectionType)

  // Определяем маркеры (стрелки)
  const isHighlighted = selected || data?.highlighted || data?.accented

  // Determine markers based on connection type or relationship type
  let markerStartId = isWellKnown
    ? `arrowhead-start-${connectionType}${isHighlighted ? '-selected' : ''}`
    : `arrowhead-start-dynamic${isHighlighted ? '-selected' : ''}`
  let markerEndId = isWellKnown
    ? `arrowhead-${connectionType}${isHighlighted ? '-selected' : ''}`
    : `arrowhead-dynamic${isHighlighted ? '-selected' : ''}`

  // Если используется кастомный цвет, используем динамические маркеры, которые наследуют цвет линии
  if (data?.customColor) {
    markerStartId = `arrowhead-start-dynamic${isHighlighted ? '-selected' : ''}`
    markerEndId = `arrowhead-dynamic${isHighlighted ? '-selected' : ''}`
  }


  // For 'related' connection type, we don't want any markers
  if (connectionType === 'related') {
    markerStartId = ''
    markerEndId = ''
  }

  // Override for database table relationships
  if (data?.relationshipType) {
    const [startRel, endRel] = data.relationshipType.split(':')

    // Map start relationship to marker (reversed as it's the start)
    if (startRel === '1') {
      markerStartId = `crows-foot-one-start${isHighlighted ? '-selected' : ''}`
    } else if (startRel === 'n') {
      markerStartId = `crows-foot-many-start${isHighlighted ? '-selected' : ''}`
    }

    // Map end relationship to marker
    if (endRel === '1') {
      markerEndId = `crows-foot-one${isHighlighted ? '-selected' : ''}`
    } else if (endRel === 'n') {
      markerEndId = `crows-foot-many${isHighlighted ? '-selected' : ''}`
    }
  }

  const isBidirectional = connectionType === 'bidirectional' || connectionType === 'async-bidirectional' || !!data?.relationshipType
  const isAsyncBidirectional = connectionType === 'async-bidirectional'

  // УБРАНО: Не нужно преобразовывать waypoint координаты через viewport
  // Waypoint координаты уже в системе координат flow и должны загружаться напрямую из edge.data

  const handleMouseDown = (e: React.MouseEvent) => {
    // Обрабатываем клики на линии для управления waypoints
    // Вершины изгиба можно добавлять только когда линия выделена
    if (!selected) {
      // Если линия не выделена, позволяем ReactFlow обработать клик для выделения
      // НЕ останавливаем распространение события
      return
    }

    // Если линия выделена, обрабатываем клик для добавления вершин изгиба
    // Останавливаем распространение только при обработке клика на waypoint или добавлении нового
    // e.stopPropagation() будет вызван позже, если нужно

    // Получаем viewport для преобразования координат
    const viewport = getViewport()
    const screenPos = {
      x: e.clientX,
      y: e.clientY,
    }
    const flowPos = screenToFlowPosition(screenPos)

    // Объявляем threshold один раз для всей функции
    // Увеличиваем порог для более удобного добавления waypoints
    const threshold = 30 / viewport.zoom // Порог в координатах flow (увеличен с 20 до 30)

    // Проверяем, кликнули ли мы близко к существующему waypoint (в пределах 20px в координатах flow)
    const waypoints = waypointsRef.current

    for (const wp of waypoints) {
      const distanceToWaypoint = Math.sqrt(
        Math.pow(flowPos.x - wp.x, 2) +
        Math.pow(flowPos.y - wp.y, 2)
      )

      if (distanceToWaypoint < threshold) {
        // Кликнули на существующий waypoint - начинаем его перетаскивание
        e.stopPropagation()
        e.preventDefault()
        setDraggedWaypointId(wp.id)
        setIsDragging(true)
        dragStartRef.current = { x: e.clientX, y: e.clientY }
        dragOffsetRef.current = { x: 0, y: 0 }
        return
      }
    }

    // Проверяем двойной клик для удаления waypoint
    if (e.detail === 2) {
      // Двойной клик - удаляем ближайший waypoint
      let closestWaypoint: { x: number; y: number; id: string } | null = null
      let minDistance = threshold

      for (const wp of waypoints) {
        const distance = Math.sqrt(
          Math.pow(flowPos.x - wp.x, 2) +
          Math.pow(flowPos.y - wp.y, 2)
        )
        if (distance < minDistance) {
          minDistance = distance
          closestWaypoint = wp
        }
      }

      if (closestWaypoint) {
        // Удаляем waypoint
        const updatedWaypoints = waypoints.filter(wp => wp.id !== closestWaypoint!.id)
        waypointsRef.current = updatedWaypoints

        setEdges((eds) => {
          return eds.map((edge) => {
            if (edge.id === id) {
              const updatedEdge = {
                ...edge,
                data: {
                  ...edge.data,
                  waypoints: updatedWaypoints.map(wp => ({ x: wp.x, y: wp.y, id: wp.id })),
                },
              }
              console.log('🗑️ Удален waypoint для edge:', id, closestWaypoint)
              return updatedEdge
            }
            return edge
          })
        })
        return
      }
    }

    // Вычисляем расстояние от точки клика до линии (в координатах flow)
    const clickPoint = { x: flowPos.x, y: flowPos.y }
    const startPoint = { x: sourceX, y: sourceY }
    const endPoint = { x: targetX, y: targetY }

    // Для прямоугольных линий проверяем расстояние до ближайшего сегмента
    let minDistance = Infinity
    let isOnLine = false

    if (pathType === 'step' || pathType === 'smoothstep') {
      // Определяем X-координату вертикального сегмента
      // Если задан verticalSegmentX, используем его, иначе вычисляем среднюю точку
      const currentVerticalX = verticalSegmentX !== null
        ? verticalSegmentX
        : (startPoint.x + endPoint.x) / 2

      // Определяем Y-координаты для вертикального сегмента
      const verticalStartY = Math.min(startPoint.y, endPoint.y)
      const verticalEndY = Math.max(startPoint.y, endPoint.y)

      // Проверяем, кликнули ли мы на вертикальный сегмент
      if (clickPoint.y >= verticalStartY && clickPoint.y <= verticalEndY) {
        const distToVertical = Math.abs(clickPoint.x - currentVerticalX)
        if (distToVertical < threshold) {
          // Кликнули на вертикальный сегмент - начинаем его перетаскивание
          e.stopPropagation()
          e.preventDefault()
          setIsDraggingVerticalSegment(true)
          dragStartRef.current = { x: e.clientX, y: e.clientY }
          dragOffsetRef.current = { x: 0, y: 0 }
          return
        }
      }

      // Для прямоугольных линий вычисляем путь через getSmoothStepPath
      // Определяем среднюю точку для прямоугольного пути
      const midX = currentVerticalX

      // Проверяем расстояние до каждого сегмента прямоугольного пути
      // Увеличиваем порог для более удобного добавления waypoints
      const segmentThreshold = threshold * 2

      // Сегмент 1: от source до (midX, sourceY) - горизонтальный
      if (clickPoint.x >= Math.min(startPoint.x, midX) - segmentThreshold && clickPoint.x <= Math.max(startPoint.x, midX) + segmentThreshold) {
        const dist = Math.abs(clickPoint.y - startPoint.y)
        if (dist < segmentThreshold && dist < minDistance) {
          minDistance = dist
          isOnLine = true
        }
      }

      // Сегмент 2: от (midX, sourceY) до (midX, targetY) - вертикальный (уже обработан выше)

      // Сегмент 3: от (midX, targetY) до (targetX, targetY) - горизонтальный
      if (clickPoint.x >= Math.min(midX, endPoint.x) - segmentThreshold && clickPoint.x <= Math.max(midX, endPoint.x) + segmentThreshold) {
        const dist = Math.abs(clickPoint.y - endPoint.y)
        if (dist < segmentThreshold && dist < minDistance) {
          minDistance = dist
          isOnLine = true
        }
      }
    } else {
      // Для прямых линий используем стандартную логику
      const dx = endPoint.x - startPoint.x
      const dy = endPoint.y - startPoint.y
      const lengthSquared = dx * dx + dy * dy

      if (lengthSquared > 0) {
        const t = Math.max(0, Math.min(1, ((clickPoint.x - startPoint.x) * dx + (clickPoint.y - startPoint.y) * dy) / lengthSquared))
        const projectionX = startPoint.x + t * dx
        const projectionY = startPoint.y + t * dy
        minDistance = Math.sqrt(Math.pow(clickPoint.x - projectionX, 2) + Math.pow(clickPoint.y - projectionY, 2))
        // Убираем ограничение на t > 0.2 && t < 0.8 для более свободного добавления waypoints
        isOnLine = minDistance < threshold * 2
      } else {
        // Если длина линии равна 0, считаем что клик на линии
        minDistance = Math.sqrt(Math.pow(clickPoint.x - startPoint.x, 2) + Math.pow(clickPoint.y - startPoint.y, 2))
        isOnLine = minDistance < threshold * 2
      }
    }

    // Если клик близко к линии (но не на существующий waypoint), создаем новую вершину изгиба
    // Увеличиваем порог для более удобного добавления waypoints
    const clickThreshold = threshold * 2 // Увеличиваем область клика в 2 раза
    const isCloseToLine = isOnLine || minDistance < clickThreshold

    console.log('🔍 Проверка клика на линии:', {
      selected,
      isOnLine,
      minDistance,
      clickThreshold,
      isCloseToLine,
      detail: e.detail,
      flowPos,
    })

    if (isCloseToLine && e.detail === 1) {
      // Проверяем, что клик не был на существующем waypoint (уже обработано выше)
      // Создаем новую вершину изгиба
      console.log('✅ Создаем новую вершину изгиба')
      const newWaypointId = `waypoint-${id}-${Date.now()}`
      const newWaypoint = {
        x: flowPos.x,
        y: flowPos.y,
        id: newWaypointId,
      }

      // Добавляем новую вершину в массив
      const updatedWaypoints = [...waypoints, newWaypoint]
      waypointsRef.current = updatedWaypoints

      // Сохраняем вершины в edge data
      setEdges((eds) => {
        return eds.map((edge) => {
          if (edge.id === id) {
            const updatedEdge = {
              ...edge,
              data: {
                ...edge.data,
                waypoints: updatedWaypoints.map(wp => ({ x: wp.x, y: wp.y, id: wp.id })),
              },
            }
            console.log('➕ Добавлена новая вершина изгиба для edge:', id, newWaypoint, 'Всего waypoints:', updatedWaypoints.length)
            return updatedEdge
          }
          return edge
        })
      })

      // Начинаем перетаскивание новой вершины
      setDraggedWaypointId(newWaypointId)
      setIsDragging(true)
      dragStartRef.current = { x: e.clientX, y: e.clientY }
      dragOffsetRef.current = { x: 0, y: 0 }

      // Останавливаем распространение, чтобы не выделять линию при добавлении вершины
      e.stopPropagation()
      e.preventDefault()
    } else {
      console.log('❌ Условие не выполнено для добавления waypoint:', {
        isCloseToLine,
        detail: e.detail,
        isOnLine,
        minDistance,
        clickThreshold,
      })
    }
  }

  const handleIndicatorMouseDown = (e: React.MouseEvent, type: string) => {
    e.stopPropagation()
    e.preventDefault()
    setDraggedIndicator(type)
    dragStartRef.current = { x: e.clientX, y: e.clientY }
    dragOffsetRef.current = { x: 0, y: 0 }
  }

  const handleMouseMove = (e: MouseEvent) => {
    const SNAP_DISTANCE = 15;

    if (isDraggingVerticalSegment && dragStartRef.current) {
      // Перетаскивание вертикального сегмента - обновляем только X-координату
      const screenPos = {
        x: e.clientX,
        y: e.clientY,
      }
      const flowPos = screenToFlowPosition(screenPos)
      let snappedX = flowPos.x;

      // Привязка к X координатам источника, цели или вершин
      if (Math.abs(snappedX - sourceX) < SNAP_DISTANCE) snappedX = sourceX;
      else if (Math.abs(snappedX - targetX) < SNAP_DISTANCE) snappedX = targetX;
      else {
        for (const wp of waypointsRef.current) {
          if (Math.abs(snappedX - wp.x) < SNAP_DISTANCE) {
            snappedX = wp.x;
            break;
          }
        }
      }

      // verticalSegmentXRef.current = snappedX // Удалено, так как используем state/props

      // Check for vertical drag to convert to waypoint
      const verticalDragDistance = Math.abs(flowPos.y - dragStartRef.current.y)
      const VERTICAL_DRAG_THRESHOLD = 20

      if (verticalDragDistance > VERTICAL_DRAG_THRESHOLD) {
        // Convert to waypoint mode
        console.log('🔄 Converting vertical segment to waypoint due to vertical drag')

        const newWaypointId = `waypoint-${id}-${Date.now()}`
        const newWaypoint = { x: snappedX, y: flowPos.y, id: newWaypointId }

        // 1. Update edges: clear verticalSegmentX, add waypoint
        setEdges((eds) => {
          return eds.map((edge) => {
            if (edge.id === id) {
              return {
                ...edge,
                data: {
                  ...edge.data,
                  verticalSegmentX: undefined, // Clear vertical segment constraint
                  waypoints: [newWaypoint], // Add the new waypoint
                },
              }
            }
            return edge
          })
        })

        // 2. Update local state to switch mode immediately
        setIsDraggingVerticalSegment(false)
        setIsDragging(true)
        setDraggedWaypointId(newWaypointId)

        // 3. Update refs to ensure continuity
        waypointsRef.current = [newWaypoint]
        setVerticalSegmentX(null) // Clear local state

        // 4. Update drag start ref to avoid jump
        // We don't need to reset dragStartRef.current because we want natural movement
      } else {
        // Standard horizontal drag behavior (existing logic)
        // Update local state immediately for responsiveness
        setVerticalSegmentX(snappedX)

        setEdges((eds) => {
          return eds.map((edge) => {
            if (edge.id === id) {
              const updatedEdge = {
                ...edge,
                data: {
                  ...edge.data,
                  verticalSegmentX: snappedX,
                },
              }
              return updatedEdge
            }
            return edge
          })
        })
      }
    } else if (isDraggingLabel && dragStartRef.current) {
      // Перетаскивание метки (label)
      const screenPos = {
        x: e.clientX,
        y: e.clientY,
      }
      const flowPos = screenToFlowPosition(screenPos)

      // Обновляем позицию метки в данных edge
      setEdges((eds) => {
        return eds.map((edge) => {
          if (edge.id === id) {
            return {
              ...edge,
              data: {
                ...edge.data,
                labelPosition: {
                  x: flowPos.x,
                  y: flowPos.y,
                },
              },
            }
          }
          return edge
        })
      })
    } else if (isDragging && dragStartRef.current && draggedWaypointId) {
      const screenPos = {
        x: e.clientX,
        y: e.clientY,
      }
      const flowPos = screenToFlowPosition(screenPos)
      let snappedX = flowPos.x;
      let snappedY = flowPos.y;

      // Привязка к координатам источника, цели или других вершин
      const snapTargets = [
        { x: sourceX, y: sourceY },
        { x: targetX, y: targetY },
        ...waypointsRef.current
          .filter(wp => wp.id !== draggedWaypointId)
          .map(wp => ({ x: wp.x, y: wp.y }))
      ];

      for (const target of snapTargets) {
        if (Math.abs(snappedX - target.x) < SNAP_DISTANCE) {
          snappedX = target.x;
        }
        if (Math.abs(snappedY - target.y) < SNAP_DISTANCE) {
          snappedY = target.y;
        }
      }

      // Обновляем позицию перетаскиваемого waypoint
      const updatedWaypoints = waypointsRef.current.map(wp =>
        wp.id === draggedWaypointId
          ? { ...wp, x: snappedX, y: snappedY }
          : wp
      )
      waypointsRef.current = updatedWaypoints

      // Сохраняем waypoints в edge data при перемещении
      setEdges((eds) => {
        return eds.map((edge) => {
          if (edge.id === id) {
            const updatedEdge = {
              ...edge,
              data: {
                ...edge.data,
                waypoints: updatedWaypoints.map(wp => ({ x: wp.x, y: wp.y, id: wp.id })),
              },
            }
            return updatedEdge
          }
          return edge
        })
      })
    } else if (draggedIndicator && dragStartRef.current) {
      const screenPos = {
        x: e.clientX,
        y: e.clientY,
      }
      const flowPos = screenToFlowPosition(screenPos)

      const positionKey = `${draggedIndicator}Position` // e.g., toBeDeletedPosition, increasedLoadPosition

      setEdges((eds) => {
        return eds.map((edge) => {
          if (edge.id === id) {
            return {
              ...edge,
              data: {
                ...edge.data,
                [positionKey]: {
                  x: flowPos.x,
                  y: flowPos.y,
                },
              },
            }
          }
          return edge
        })
      })
    }
  }

  const handleMouseUp = () => {
    if (isDraggingVerticalSegment) {
      setIsDraggingVerticalSegment(false)
      dragStartRef.current = null
      dragOffsetRef.current = { x: 0, y: 0 }
    } else if (isDraggingLabel) {
      setIsDraggingLabel(false)
      dragStartRef.current = null
      dragOffsetRef.current = { x: 0, y: 0 }
    } else if (isDragging) {
      setIsDragging(false)
      setDraggedWaypointId(null)
      dragStartRef.current = null
      dragOffsetRef.current = { x: 0, y: 0 }
    } else if (draggedIndicator) {
      setDraggedIndicator(null)
      dragStartRef.current = null
      dragOffsetRef.current = { x: 0, y: 0 }
    }
  }

  useEffect(() => {
    if (isDragging || isDraggingVerticalSegment || isDraggingLabel || draggedIndicator) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)

      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [isDragging, isDraggingVerticalSegment, isDraggingLabel, draggedIndicator, sourceX, sourceY, targetX, targetY])

  // Вычисляем путь с waypoints (массив точек изгиба)
  // Направление всегда от source к target через все waypoints
  // ВАЖНО: Последний сегмент пути должен идти точно к target, чтобы стрелка указывала правильно
  const finalPath = React.useMemo(() => {
    const waypoints = waypointsRef.current
    const offset = 20; // Оффсет для обеспечения перпендикулярного входа/выхода

    if (waypoints.length > 0) {
      // Строим путь через все waypoints
      let path = `M ${sourceX} ${sourceY} `
      let currentX = sourceX
      let currentY = sourceY

      // Начальный сегмент с учетом sourcePosition
      // Task 5: Учитываем sourceAngle если он задан
      let effectiveSourcePos = sourcePosition
      if (data?.sourceAngle !== undefined) {
        const angle = data.sourceAngle
        if (angle === 0) effectiveSourcePos = Position.Right
        else if (angle === 90) effectiveSourcePos = Position.Bottom
        else if (angle === 180) effectiveSourcePos = Position.Left
        else if (angle === 270) effectiveSourcePos = Position.Top
      }

      let effectiveTargetPos = targetPosition
      if (data?.targetAngle !== undefined) {
        const angle = data.targetAngle
        if (angle === 0) effectiveTargetPos = Position.Right
        else if (angle === 90) effectiveTargetPos = Position.Bottom
        else if (angle === 180) effectiveTargetPos = Position.Left
        else if (angle === 270) effectiveTargetPos = Position.Top
      }

      if (pathType === 'step' || pathType === 'smoothstep') {
        if (effectiveSourcePos === Position.Left) currentX -= offset
        else if (effectiveSourcePos === Position.Right) currentX += offset
        else if (effectiveSourcePos === Position.Top) currentY -= offset
        else if (effectiveSourcePos === Position.Bottom) currentY += offset

        path += `L ${currentX} ${currentY} `
      }

      // Для каждого waypoint добавляем сегмент пути
      for (let i = 0; i < waypoints.length; i++) {
        const wp = waypoints[i]
        const prevX = currentX
        const prevY = currentY

        if (pathType === 'step' || pathType === 'smoothstep') {
          // Прямоугольный путь с углами 90°
          const dx = Math.abs(wp.x - prevX)
          const dy = Math.abs(wp.y - prevY)
          const horizontalFirst = dx > dy

          if (horizontalFirst) {
            path += `L ${wp.x} ${prevY} L ${wp.x} ${wp.y} `
          } else {
            path += `L ${prevX} ${wp.y} L ${wp.x} ${wp.y} `
          }
        } else {
          // Прямая линия
          path += `L ${wp.x} ${wp.y} `
        }
        currentX = wp.x
        currentY = wp.y
      }

      // Финальные сегменты к target с учетом targetPosition для правильной ориентации стрелки
      if (pathType === 'step' || pathType === 'smoothstep') {
        if (effectiveTargetPos === Position.Left) {
          path += `L ${targetX - offset} ${currentY} L ${targetX - offset} ${targetY} L ${targetX} ${targetY}`
        } else if (effectiveTargetPos === Position.Right) {
          path += `L ${targetX + offset} ${currentY} L ${targetX + offset} ${targetY} L ${targetX} ${targetY}`
        } else if (effectiveTargetPos === Position.Top) {
          path += `L ${currentX} ${targetY - offset} L ${targetX} ${targetY - offset} L ${targetX} ${targetY}`
        } else if (effectiveTargetPos === Position.Bottom) {
          path += `L ${currentX} ${targetY + offset} L ${targetX} ${targetY + offset} L ${targetX} ${targetY}`
        }
      } else {
        path += `L ${targetX} ${targetY}`
      }

      return path
    }

    // Для обычного пути без waypoints
    if (pathType === 'step' || pathType === 'smoothstep') {
      // Пытаемся использовать verticalSegmentX (из стейта или из данных)
      const currentVerticalX = verticalSegmentX ?? data?.verticalSegmentX ?? null

      // Если verticalSegmentX задан, строим кастомный прямоугольный путь
      if (currentVerticalX !== null) {
        let path = `M ${sourceX} ${sourceY} `
        const offset = 20

        // Исходный оффсет
        let effectiveSourcePos = sourcePosition
        if (data?.sourceAngle !== undefined) {
          const angle = data.sourceAngle
          if (angle === 0) effectiveSourcePos = Position.Right
          else if (angle === 90) effectiveSourcePos = Position.Bottom
          else if (angle === 180) effectiveSourcePos = Position.Left
          else if (angle === 270) effectiveSourcePos = Position.Top
        }

        let effectiveTargetPos = targetPosition
        if (data?.targetAngle !== undefined) {
          const angle = data.targetAngle
          if (angle === 0) effectiveTargetPos = Position.Right
          else if (angle === 90) effectiveTargetPos = Position.Bottom
          else if (angle === 180) effectiveTargetPos = Position.Left
          else if (angle === 270) effectiveTargetPos = Position.Top
        }

        if (effectiveSourcePos === Position.Left) path += `L ${sourceX - offset} ${sourceY} `
        else if (effectiveSourcePos === Position.Right) path += `L ${sourceX + offset} ${sourceY} `
        else if (effectiveSourcePos === Position.Top) path += `L ${sourceX} ${sourceY - offset} `
        else if (effectiveSourcePos === Position.Bottom) path += `L ${sourceX} ${sourceY + offset} `

        // Вертикальный сегмент
        path += `L ${currentVerticalX} ${sourceY} L ${currentVerticalX} ${targetY} `

        // Финальный оффсет и вход
        if (effectiveTargetPos === Position.Left) path += `L ${targetX - offset} ${targetY} L ${targetX} ${targetY}`
        else if (effectiveTargetPos === Position.Right) path += `L ${targetX + offset} ${targetY} L ${targetX} ${targetY}`
        else if (effectiveTargetPos === Position.Top) path += `L ${targetX} ${targetY - offset} L ${targetX} ${targetY}`
        else if (effectiveTargetPos === Position.Bottom) path += `L ${targetX} ${targetY + offset} L ${targetX} ${targetY}`
        else path += `L ${targetX} ${targetY}`

        return path
      }

      // Если verticalSegmentX НЕ задан, используем стандартный SmoothStepPath
      const [stepPath] = getSmoothStepPath({
        sourceX,
        sourceY,
        targetX,
        targetY,
        sourcePosition,
        targetPosition,
        borderRadius: pathType === 'smoothstep' ? 16 : 0,
      });
      return stepPath || edgePath;
    }

    return edgePath || '';
  }, [edgePath, sourceX, sourceY, targetX, targetY, pathType, sourcePosition, targetPosition, verticalSegmentX, data?.sourceAngle, data?.targetAngle, data?.waypoints])

  // Вычисляем позицию label с учетом сохраненной позиции или waypoints
  const finalLabelX = React.useMemo(() => {
    // Если есть сохраненная позиция метки, используем её
    if (data?.labelPosition?.x !== undefined) {
      return data.labelPosition.x
    }
    // Иначе используем средний waypoint или стандартную позицию
    const waypoints = waypointsRef.current
    if (waypoints.length > 0) {
      const midIndex = Math.floor(waypoints.length / 2)
      return waypoints[midIndex].x
    }
    return labelX
  }, [labelX, waypointsRef.current, data?.labelPosition?.x])

  const finalLabelY = React.useMemo(() => {
    // Если есть сохраненная позиция метки, используем её
    if (data?.labelPosition?.y !== undefined) {
      return data.labelPosition.y
    }
    // Иначе используем средний waypoint или стандартную позицию
    const waypoints = waypointsRef.current
    if (waypoints.length > 0) {
      const midIndex = Math.floor(waypoints.length / 2)
      return waypoints[midIndex].y
    }
    return labelY
  }, [labelY, waypointsRef.current, data?.labelPosition?.y])




  return (
    <>
      <g
        className="react-flow__edge-container"
        style={{ cursor: 'pointer' }}
      >
        <path
          id={id}
          style={{
            ...edgeStyle,
            pointerEvents: 'none',
            strokeWidth: edgeStyle.strokeWidth || 3,
            strokeLinecap: 'round',
            strokeLinejoin: 'round',
          }}
          d={finalPath}
          fill="none"
          markerEnd={`url(#${markerEndId})`}
          markerStart={isBidirectional ? `url(#${markerStartId})` : undefined}
        />

        {/* Hit area path - placed AFTER main path to be on top */}
        <path
          className="react-flow__edge-interaction"
          d={finalPath}
          fill="none"
          stroke="transparent"
          strokeWidth={selected ? 12 : 14}
          style={{
            cursor: selected ? 'crosshair' : 'pointer',
            pointerEvents: 'stroke',
          }}
          onMouseDown={(e) => {
            if (!selected) return // Allow propagation for selection
            e.stopPropagation()
            e.preventDefault()
            handleMouseDown(e)
          }}
          onClick={(e) => {
            if (!selected) return // Allow propagation for selection
            e.stopPropagation()
            e.preventDefault()
            if (e.detail === 1) handleMouseDown(e as any)
          }}
        />

        {/* Отображение меток кардинальности (1, N) для связей таблиц */}
        {data?.relationshipType && (
          <EdgeLabelRenderer>
            {(() => {
              const [start, end] = data.relationshipType.split(':');
              const startLabel = start === 'n' || start === 'm' ? 'N' : '1';
              const endLabel = end === 'n' || end === 'm' ? 'N' : '1';

              const startOffsetX = sourcePosition === Position.Left ? -20 : sourcePosition === Position.Right ? 20 : 0;
              const startOffsetY = sourcePosition === Position.Top ? -20 : sourcePosition === Position.Bottom ? 20 : -15;

              const endOffsetX = targetPosition === Position.Left ? -20 : targetPosition === Position.Right ? 20 : 0;
              const endOffsetY = targetPosition === Position.Top ? -20 : targetPosition === Position.Bottom ? 20 : -15;

              return (
                <>
                  <div
                    style={{
                      position: 'absolute',
                      transform: `translate(-50%, -50%) translate(${sourceX + startOffsetX}px, ${sourceY + startOffsetY}px)`,
                      fontSize: '12px',
                      fontWeight: '800',
                      color: edgeColor,
                      background: '#1e1e1e',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      border: `1px solid ${edgeColor}`,
                      pointerEvents: 'none',
                      zIndex: 10,
                      boxShadow: '0 2px 4px rgba(0,0,0,0.5)',
                    }}
                  >
                    {startLabel}
                  </div>
                  <div
                    style={{
                      position: 'absolute',
                      transform: `translate(-50%, -50%) translate(${targetX + endOffsetX}px, ${targetY + endOffsetY}px)`,
                      fontSize: '12px',
                      fontWeight: '800',
                      color: edgeColor,
                      background: '#1e1e1e',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      border: `1px solid ${edgeColor}`,
                      pointerEvents: 'none',
                      zIndex: 10,
                      boxShadow: '0 2px 4px rgba(0,0,0,0.5)',
                    }}
                  >
                    {endLabel}
                  </div>
                </>
              );
            })()}
          </EdgeLabelRenderer>
        )}
        {/* Подсказка при наведении на линию */}
        <title>{selected ? 'Кликните на линию для добавления вершины изгиба. Перетащите вершины для изменения траектории.' : 'Кликните на линию для выделения и редактирования вершин изгиба.'}</title>

        {/* Вершины изгиба линии - видны только при выделении линии и зуме */}
        {selected && zoom > 0.4 && waypointsRef.current.map((wp) => (
          <g key={wp.id}>
            {/* Внешний круг для лучшей видимости */}
            <circle
              cx={wp.x}
              cy={wp.y}
              r="14"
              fill="rgba(77, 171, 247, 0.4)"
              stroke="#4dabf7"
              strokeWidth="3"
              style={{ cursor: 'move', pointerEvents: 'all' }}
              onMouseDown={(e) => {
                e.stopPropagation()
                e.preventDefault()
                setDraggedWaypointId(wp.id)
                setIsDragging(true)
                dragStartRef.current = { x: e.clientX, y: e.clientY }
                dragOffsetRef.current = { x: 0, y: 0 }
              }}
              onDoubleClick={(e) => {
                e.stopPropagation()
                e.preventDefault()
                // Удаляем вершину
                const updatedWaypoints = waypointsRef.current.filter(w => w.id !== wp.id)
                waypointsRef.current = updatedWaypoints

                setEdges((eds) => {
                  return eds.map((edge) => {
                    if (edge.id === id) {
                      const updatedEdge = {
                        ...edge,
                        data: {
                          ...edge.data,
                          waypoints: updatedWaypoints.map(w => ({ x: w.x, y: w.y, id: w.id })),
                        },
                      }
                      console.log('🗑️ Удалена вершина изгиба для edge:', id, wp)
                      return updatedEdge
                    }
                    return edge
                  })
                })
              }}
            />
            {/* Внутренний круг */}
            <circle
              cx={wp.x}
              cy={wp.y}
              r="8"
              fill="#4dabf7"
              stroke="#fff"
              strokeWidth="2"
              style={{ cursor: 'move', pointerEvents: 'all' }}
              onMouseDown={(e) => {
                e.stopPropagation()
                e.preventDefault()
                setDraggedWaypointId(wp.id)
                setIsDragging(true)
                dragStartRef.current = { x: e.clientX, y: e.clientY }
                dragOffsetRef.current = { x: 0, y: 0 }
              }}
              onDoubleClick={(e) => {
                e.stopPropagation()
                e.preventDefault()
                // Удаляем вершину
                const updatedWaypoints = waypointsRef.current.filter(w => w.id !== wp.id)
                waypointsRef.current = updatedWaypoints

                setEdges((eds) => {
                  return eds.map((edge) => {
                    if (edge.id === id) {
                      const updatedEdge = {
                        ...edge,
                        data: {
                          ...edge.data,
                          waypoints: updatedWaypoints.map(w => ({ x: w.x, y: w.y, id: w.id })),
                        },
                      }
                      console.log('🗑️ Удалена вершина изгиба для edge:', id, wp)
                      return updatedEdge
                    }
                    return edge
                  })
                })
              }}
            />
            {/* Подсказка */}
            <title>Вершина изгиба: Перетащите для перемещения. Двойной клик для удаления.</title>
          </g>
        ))}

        {/* Узлы редактирования на концах линии (source и target) - только при выделении и достаточном зуме */}
        {selected && zoom > 0.4 && (
          <>

            {/* Узлы редактирования на концах линии (source и target) - всегда видимые при выделении */}
            <g>
              {/* Узел на source */}
              <circle
                cx={sourceX}
                cy={sourceY}
                r="10"
                fill="rgba(77, 171, 247, 0.4)"
                stroke="#4dabf7"
                strokeWidth="3"
                style={{ cursor: 'move', pointerEvents: 'all' }}
              />
              <circle
                cx={sourceX}
                cy={sourceY}
                r="6"
                fill="#4dabf7"
                stroke="#fff"
                strokeWidth="2"
                style={{ cursor: 'move', pointerEvents: 'all' }}
              />

              {/* Узел на target */}
              <circle
                cx={targetX}
                cy={targetY}
                r="10"
                fill="rgba(77, 171, 247, 0.4)"
                stroke="#4dabf7"
                strokeWidth="3"
                style={{ cursor: 'move', pointerEvents: 'all' }}
              />
              <circle
                cx={targetX}
                cy={targetY}
                r="6"
                fill="#4dabf7"
                stroke="#fff"
                strokeWidth="2"
                style={{ cursor: 'move', pointerEvents: 'all' }}
              />
            </g>
          </>
        )}
        {/* Анимированная точка, показывающая поток данных (только при достаточном зуме) */}
        {zoom >= 0.6 && (
          <>
            <path
              className="edge-animation-path"
              d="M -10,-5 L 0,0 L -10,5 Z"
              fill={isAsyncBidirectional ? '#ffd43b' : edgeColor}
              opacity="0.8"
              style={{ pointerEvents: 'none', cursor: 'default' }}
            >
              <animateMotion
                dur={data?.increasedLoad ? "0.6s" : "2s"}
                repeatCount="indefinite"
                path={finalPath}
                rotate="auto"
              />
            </path>
            {/* Вторая анимированная точка для двусторонней стрелки - движется в обратном направлении */}
            {(isBidirectional || isAsyncBidirectional) && (
              <path
                className="edge-animation-path"
                d="M -10,-5 L 0,0 L -10,5 Z"
                fill={isAsyncBidirectional ? '#ffd43b' : edgeColor}
                opacity="0.8"
                style={{ pointerEvents: 'none', cursor: 'default' }}
              >
                <animateMotion
                  dur={data?.increasedLoad ? "0.6s" : "2s"}
                  repeatCount="indefinite"
                  path={finalPath}
                  keyPoints="1;0"
                  keyTimes="0;1"
                  rotate="auto-reverse"
                  calcMode="linear"
                />
              </path>
            )}
          </>
        )}
        {/* Визуальный индикатор вертикального сегмента для прямоугольных линий без waypoint */}
        {selected && waypointsRef.current.length === 0 && (pathType === 'step' || pathType === 'smoothstep') && verticalSegmentX !== null && (
          <>
            {/* Индикатор в середине вертикального сегмента */}
            <circle
              cx={verticalSegmentX}
              cy={(sourceY + targetY) / 2}
              r={6}
              fill="#4dabf7"
              stroke="#fff"
              strokeWidth={2}
              style={{ cursor: 'ew-resize', pointerEvents: 'auto' }}
              onMouseDown={(e) => {
                e.stopPropagation()
                setIsDraggingVerticalSegment(true)
                dragStartRef.current = { x: e.clientX, y: e.clientY }
                dragOffsetRef.current = { x: 0, y: 0 }
              }}
            />
            {/* Линия-индикатор вертикального сегмента */}
            <line
              x1={verticalSegmentX}
              y1={Math.min(sourceY, targetY)}
              x2={verticalSegmentX}
              y2={Math.max(sourceY, targetY)}
              stroke="#4dabf7"
              strokeWidth={2}
              strokeDasharray="4 4"
              opacity={0.5}
              style={{ pointerEvents: 'none' }}
            />
          </>
        )}
      </g>
      {label && (
        <EdgeLabelRenderer>
          <div
            className="edge-label"
            style={{
              ...labelStyle,
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${finalLabelX}px,${finalLabelY}px)`,
              // pointerEvents: 'all' только для самой метки, чтобы можно было её перетаскивать
              // Но не блокируем события для линии под меткой
              pointerEvents: 'auto',
              cursor: isDraggingLabel ? 'grabbing' : 'grab',
              userSelect: 'text',
              zIndex: (data?.accented || data?.highlighted || selected) ? 25 : 11, // Метка должна быть поверх линии
              borderWidth: '1px',
              borderStyle: 'solid',
              padding: '4px 10px',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: 500,
              opacity: 1, // Always 1 to ensure background masks the line
              backgroundColor: data?.isBackground
                ? (isDarkMode ? '#2d2d2d' : '#ffffff')
                : (['etl', 'jdbc', 'kafka', 'rest'].includes(connectionType) && !data?.customColor
                  ? edgeColor
                  : (isDarkMode ? '#1a1a1a' : '#ffffff')),
              color: data?.isBackground
                ? (isDarkMode ? '#888' : '#999')
                : (['etl', 'jdbc', 'kafka', 'rest'].includes(connectionType) && !data?.customColor
                  ? '#ffffff'
                  : (labelStyle?.color || edgeColor)),
              borderColor: data?.isBackground
                ? (isDarkMode ? '#888' : '#bbb')
                : edgeColor,
              boxShadow: (data?.accented || data?.highlighted || selected)
                ? `0 0 12px ${edgeColor}80`
                : '0 2px 4px rgba(0,0,0,0.1)',
              textAlign: 'left',
              filter: data?.isBackground ? 'grayscale(0.5)' : 'none',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              whiteSpace: 'pre-wrap',
              width: 'auto',
              maxWidth: '450px',
              display: 'block',
              lineHeight: '1.4',
              wordBreak: 'break-word',
              overflowWrap: 'break-word',
              boxSizing: 'border-box',
            }}
            onMouseDown={(e) => {
              // Останавливаем распространение, чтобы не обрабатывать клик на линии
              e.stopPropagation()
              e.preventDefault()
              // Начинаем перетаскивание метки только если это не двойной клик
              if (e.detail === 1) {
                setIsDraggingLabel(true)
                dragStartRef.current = { x: e.clientX, y: e.clientY }
                dragOffsetRef.current = { x: 0, y: 0 }
              }
            }}
            onMouseEnter={(e) => {
              // При наведении на метку останавливаем распространение, чтобы не выделять линию
              e.stopPropagation()
            }}
          >
            <div style={{ opacity: data?.isBackground ? 0.5 : 1, width: '100%' }}>
              {renderFormattedText(label.toString().replace(/^(Sync|Async):\s*/i, ''))}
            </div>
          </div>
        </EdgeLabelRenderer >
      )
      }
      {data?.toBeDeleted && (() => {
        const storedPos = data?.toBeDeletedPosition;
        let x, y;

        if (storedPos) {
          x = storedPos.x;
          y = storedPos.y;
        } else {
          const offsetDist = 45;
          const angleRad = (edgeAngle - 90) * (Math.PI / 180);
          const dx = Math.cos(angleRad) * offsetDist;
          const dy = Math.sin(angleRad) * offsetDist;
          x = labelX + dx;
          y = labelY + dy;
        }

        return (
          <EdgeLabelRenderer>
            <div
              onMouseDown={(e) => handleIndicatorMouseDown(e, 'toBeDeleted')}
              style={{
                position: 'absolute',
                transform: `translate(-50%, -50%) translate(${x}px, ${y}px)`,
                pointerEvents: 'all',
                cursor: 'grab',
                zIndex: 11,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <div style={{
                color: '#dc3545',
                backgroundColor: isDarkMode ? '#1a1a1a' : '#fff',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2.5px solid #dc3545',
                boxShadow: '0 3px 6px rgba(0,0,0,0.4)',
              }}>
                <X size={22} strokeWidth={3.5} />
              </div>
              {data?.toBeDeletedComment && (
                <div style={{
                  backgroundColor: '#dc3545',
                  color: 'white',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontSize: '11px',
                  fontWeight: 'bold',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
                  maxWidth: '200px',
                  textAlign: 'center',
                }}>
                  {data.toBeDeletedComment}
                </div>
              )}
            </div>
          </EdgeLabelRenderer>
        )
      })()}
      {data?.increasedLoad && (() => {
        const storedPos = data?.increasedLoadPosition;
        let x, y;

        if (storedPos) {
          x = storedPos.x;
          y = storedPos.y;
        } else {
          const offsetDist = 65; // Сдвигаем дальше по линии
          const angleRad = edgeAngle * (Math.PI / 180);
          const dx = Math.cos(angleRad) * offsetDist;
          const dy = Math.sin(angleRad) * offsetDist;
          x = labelX + dx;
          y = labelY + dy;
        }

        return (
          <EdgeLabelRenderer>
            <div
              onMouseDown={(e) => handleIndicatorMouseDown(e, 'increasedLoad')}
              style={{
                position: 'absolute',
                transform: `translate(-50%, -50%) translate(${x}px, ${y}px) ${!storedPos ? `rotate(${edgeAngle + 45}deg)` : ''}`,
                pointerEvents: 'all',
                cursor: 'grab',
                zIndex: 11,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <div style={{
                color: '#fab005',
                backgroundColor: isDarkMode ? '#1a1a1a' : '#fff',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2.5px solid #fab005',
                boxShadow: '0 3px 6px rgba(0,0,0,0.4)',
              }}>
                <TrendingUp size={22} strokeWidth={3} />
              </div>
              {data?.increasedLoadComment && (
                <div style={{
                  backgroundColor: '#fab005',
                  color: 'white',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontSize: '11px',
                  fontWeight: 'bold',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
                  maxWidth: '200px',
                  textAlign: 'center',
                  transform: !storedPos ? `rotate(-${edgeAngle + 45}deg)` : 'none', // Counter-rotate text if parent is rotated
                }}>
                  {data.increasedLoadComment}
                </div>
              )}
            </div>
          </EdgeLabelRenderer>
        )
      })()}
      {data?.hasIncorrectData && (() => {
        const storedPos = data?.incorrectDataPosition;
        let x, y;

        if (storedPos) {
          x = storedPos.x;
          y = storedPos.y;
        } else {
          const offsetDist = 45;
          const angleRad = (edgeAngle + 90) * (Math.PI / 180);
          const dx = Math.cos(angleRad) * offsetDist;
          const dy = Math.sin(angleRad) * offsetDist;
          x = labelX + dx;
          y = labelY + dy;
        }

        return (
          <EdgeLabelRenderer>
            <div
              onMouseDown={(e) => handleIndicatorMouseDown(e, 'incorrectData')}
              style={{
                position: 'absolute',
                transform: `translate(-50%, -50%) translate(${x}px, ${y}px)`,
                pointerEvents: 'all',
                cursor: 'grab',
                zIndex: 11,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <div style={{
                color: '#ff0000',
                backgroundColor: isDarkMode ? '#1a1a1a' : '#fff',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2.5px solid #ff0000',
                boxShadow: '0 3px 6px rgba(0,0,0,0.4)',
              }}>
                <AlertTriangle size={22} strokeWidth={3} />
              </div>
              {data?.incorrectDataComment && (
                <div style={{
                  backgroundColor: '#ff0000',
                  color: 'white',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontSize: '11px',
                  fontWeight: 'bold',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
                  maxWidth: '200px',
                  textAlign: 'center',
                }}>
                  {data.incorrectDataComment}
                </div>
              )}
            </div>
          </EdgeLabelRenderer>
        )
      })()}
      {data?.showProtocolBadge && (() => {
        const storedPos = data?.protocolBadgePosition;
        let x, y;

        if (storedPos) {
          x = storedPos.x;
          y = storedPos.y;
        } else {
          // Позиция по умолчанию - чуть ниже или выше основной метки
          const offsetDist = 55;
          const angleRad = (edgeAngle - 90) * (Math.PI / 180);
          const dx = Math.cos(angleRad) * offsetDist;
          const dy = Math.sin(angleRad) * offsetDist;
          x = labelX + dx;
          y = labelY + dy;
        }

        const getProtocolText = (type: string): string => {
          switch (type) {
            case 'etl': return 'ETL Flow'
            case 'jdbc': return 'JDBC'
            case 'kafka': return 'Kafka'
            case 'rest': return 'REST'
            case 'grpc': return 'gRPC'
            case 'ws': return 'WebSocket'
            case 'wss': return 'WSS'
            case 'graphql': return 'GraphQL'
            case 'database-connection': return 'DB Connection'
            case 'database-replication': return 'Replication'
            case 'cache-connection': return 'Cache'
            default: return (type || '').toUpperCase()
          }
        }

        const isBackground = data?.isBackground;
        const color = isBackground
          ? (isDarkMode ? '#333' : '#e5e5e5')
          : edgeColor;

        return (
          <EdgeLabelRenderer>
            <div
              onMouseDown={(e) => handleIndicatorMouseDown(e, 'protocolBadge')}
              style={{
                position: 'absolute',
                transform: `translate(-50%, -50%) translate(${x}px, ${y}px)`,
                pointerEvents: 'all',
                cursor: 'grab',
                zIndex: isBackground ? 5 : 11,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <div style={{
                backgroundColor: color,
                color: isBackground ? (isDarkMode ? '#777' : '#888') : 'white',
                padding: '2px 8px',
                borderRadius: '4px',
                fontSize: '10px',
                fontWeight: '600',
                boxShadow: isBackground ? 'none' : '0 1px 3px rgba(0,0,0,0.2)',
                display: 'flex',
                alignItems: 'center',
                whiteSpace: 'nowrap',
                opacity: 1, // Full opacity for all states
                filter: isBackground ? 'grayscale(1) brightness(0.75)' : 'saturate(0.1) brightness(0.85)',
                border: isBackground ? `1px solid ${isDarkMode ? '#444' : '#d5d5d5'}` : 'none',
              }}>
                {getProtocolText(data?.connectionType)}
              </div>
            </div>
          </EdgeLabelRenderer>
        )
      })()}
    </>
  )
}

// Мемоизируем компонент для оптимизации производительности
// НЕ мемоизируем слишком строго, чтобы анимация работала
// Export directly without memo to ensure updates are not blocked
// Export directly without memo to ensure updates are not blocked on initial render
export default memo(AnimatedEdge)
