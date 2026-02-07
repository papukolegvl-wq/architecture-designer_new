#!/bin/bash

# Скрипт для установки ярлыка на рабочий стол
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
DESKTOP_FILE="$SCRIPT_DIR/Architecture-Designer.desktop"
DESKTOP_DIR="$HOME/Desktop"

echo "📋 Установка ярлыка Architecture Designer на рабочий стол..."

# Проверяем существование файла .desktop
if [ ! -f "$DESKTOP_FILE" ]; then
    echo "❌ Ошибка: файл $DESKTOP_FILE не найден!"
    exit 1
fi

# Создаем директорию Desktop, если её нет
if [ ! -d "$DESKTOP_DIR" ]; then
    echo "📁 Создание директории Desktop..."
    mkdir -p "$DESKTOP_DIR"
fi

# Копируем файл на рабочий стол
TARGET_FILE="$DESKTOP_DIR/Architecture-Designer.desktop"
cp "$DESKTOP_FILE" "$TARGET_FILE"

# Делаем файл исполняемым
chmod +x "$TARGET_FILE"

# Обновляем кэш desktop файлов (для некоторых DE)
if command -v update-desktop-database > /dev/null 2>&1; then
    update-desktop-database "$DESKTOP_DIR" 2>/dev/null
fi

# Для KDE
if command -v kbuildsycoca4 > /dev/null 2>&1; then
    kbuildsycoca4 2>/dev/null
fi

# Для GNOME
if command -v gio > /dev/null 2>&1; then
    gio set "$TARGET_FILE" metadata::trusted true 2>/dev/null
fi

echo "✅ Ярлык успешно установлен на рабочий стол!"
echo "📍 Расположение: $TARGET_FILE"
echo ""
echo "Теперь вы можете запустить приложение двойным кликом по ярлыку на рабочем столе."


