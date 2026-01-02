#!/bin/bash

# Скрипт для запуска Architecture Designer
cd "$(dirname "$0")"

echo "🚀 Запуск Architecture Designer..."
echo "📁 Директория: $(pwd)"

# Проверяем, не запущен ли уже сервер
if netstat -tln 2>/dev/null | grep -q ":5173" || ss -tln 2>/dev/null | grep -q ":5173"; then
    echo "⚠️  Сервер уже запущен на порту 5173"
    echo "🌐 Открываю браузер..."
    if command -v xdg-open > /dev/null; then
        xdg-open http://localhost:5173 2>/dev/null &
    elif command -v gnome-open > /dev/null; then
        gnome-open http://localhost:5173 2>/dev/null &
    fi
    echo "✅ Приложение должно открыться в браузере"
    echo "💡 Если нужно перезапустить сервер, закройте текущий процесс и запустите снова"
    exit 0
fi

# Проверяем, установлены ли зависимости
if [ ! -d "node_modules" ]; then
    echo "📦 Установка зависимостей..."
    npm install
fi

# Запускаем приложение
echo "🌐 Запуск сервера разработки..."
echo "⏳ Ожидание запуска сервера..."

# Запускаем сервер в фоне и ждем его готовности
npm run dev &
DEV_PID=$!

# Ждем, пока сервер запустится (проверяем порт 5173)
MAX_WAIT=30
WAIT_COUNT=0
while [ $WAIT_COUNT -lt $MAX_WAIT ]; do
    if netstat -tln 2>/dev/null | grep -q ":5173" || ss -tln 2>/dev/null | grep -q ":5173"; then
        echo "✅ Сервер запущен на http://localhost:5173"
        sleep 1
        # Пытаемся открыть браузер
        if command -v xdg-open > /dev/null; then
            xdg-open http://localhost:5173 2>/dev/null &
        elif command -v gnome-open > /dev/null; then
            gnome-open http://localhost:5173 2>/dev/null &
        fi
        break
    fi
    sleep 1
    WAIT_COUNT=$((WAIT_COUNT + 1))
done

# Обработка сигналов для корректного завершения
trap "echo '🛑 Остановка сервера...'; kill $DEV_PID 2>/dev/null; exit" INT TERM

# Ждем завершения процесса
wait $DEV_PID














