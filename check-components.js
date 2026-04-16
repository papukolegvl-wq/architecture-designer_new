import fs from 'fs';

// Читаем все файлы
const typesContent = fs.readFileSync('src/types.ts', 'utf8');
const customNodeContent = fs.readFileSync('src/components/CustomNode.tsx', 'utf8');
const paletteContent = fs.readFileSync('src/components/ComponentPalette.tsx', 'utf8');
const infoPanelContent = fs.readFileSync('src/components/ComponentInfoPanel.tsx', 'utf8');

// Извлекаем компоненты из types.ts
const componentMatches = typesContent.match(/^\s+\| '([a-z-]+)'/gm);
const components = componentMatches ? componentMatches.map(m => m.match(/'([a-z-]+)'/)[1]) : [];

console.log(`\n=== Проверка компонентов (всего: ${components.length}) ===\n`);

// Проверяем иконки
const iconMatches = customNodeContent.match(/([a-z-]+): <[^>]+>/g);
const icons = iconMatches ? iconMatches.map(m => m.match(/([a-z-]+):/)[1]) : [];

// Проверяем цвета
const colorMatches = customNodeContent.match(/([a-z-]+): '#[0-9a-fA-F]+'/g);
const colors = colorMatches ? colorMatches.map(m => m.match(/([a-z-]+):/)[1]) : [];

// Проверяем палитру
const paletteMatches = paletteContent.match(/type: '([a-z-]+)'/g);
const paletteComponents = paletteMatches ? paletteMatches.map(m => m.match(/'([a-z-]+)'/)[1]) : [];

// Проверяем описания
const descriptionMatches = infoPanelContent.match(/'([a-z-]+)': \{/g);
const descriptions = descriptionMatches ? descriptionMatches.map(m => m.match(/'([a-z-]+)'/)[1]) : [];

// Находим проблемы
const missingIcons = components.filter(c => !icons.includes(c));
const missingColors = components.filter(c => !colors.includes(c));
const missingInPalette = components.filter(c => !paletteComponents.includes(c));
const missingDescriptions = components.filter(c => !descriptions.includes(c));

// Находим лишние (есть в палитре, но нет в типах)
const extraInPalette = paletteComponents.filter(c => !components.includes(c));
const extraIcons = icons.filter(c => !components.includes(c));
const extraColors = colors.filter(c => !components.includes(c));
const extraDescriptions = descriptions.filter(c => !components.includes(c));

console.log('❌ Компоненты без иконок:', missingIcons.length > 0 ? missingIcons : 'нет');
console.log('❌ Компоненты без цветов:', missingColors.length > 0 ? missingColors : 'нет');
console.log('❌ Компоненты не в палитре:', missingInPalette.length > 0 ? missingInPalette : 'нет');
console.log('❌ Компоненты без описаний:', missingDescriptions.length > 0 ? missingDescriptions : 'нет');

if (extraInPalette.length > 0) console.log('⚠️  Лишние в палитре:', extraInPalette);
if (extraIcons.length > 0) console.log('⚠️  Лишние иконки:', extraIcons);
if (extraColors.length > 0) console.log('⚠️  Лишние цвета:', extraColors);
if (extraDescriptions.length > 0) console.log('⚠️  Лишние описания:', extraDescriptions);

// Проверяем соответствие иконок и цветов
console.log('\n=== Проверка соответствия ===\n');

const issues = [];

components.forEach(component => {
  const inPalette = paletteComponents.includes(component);
  const hasIcon = icons.includes(component);
  const hasColor = colors.includes(component);
  const hasDescription = descriptions.includes(component);
  
  if (!inPalette || !hasIcon || !hasColor || !hasDescription) {
    issues.push({
      component,
      inPalette,
      hasIcon,
      hasColor,
      hasDescription
    });
  }
});

if (issues.length > 0) {
  console.log('Проблемы:');
  issues.forEach(issue => {
    console.log(`  ${issue.component}:`, {
      палитра: issue.inPalette ? '✅' : '❌',
      иконка: issue.hasIcon ? '✅' : '❌',
      цвет: issue.hasColor ? '✅' : '❌',
      описание: issue.hasDescription ? '✅' : '❌'
    });
  });
} else {
  console.log('✅ Все компоненты имеют все необходимые характеристики!');
}

console.log(`\n=== Итого ===`);
console.log(`Компонентов в типах: ${components.length}`);
console.log(`Компонентов в палитре: ${paletteComponents.length}`);
console.log(`Иконок: ${icons.length}`);
console.log(`Цветов: ${colors.length}`);
console.log(`Описаний: ${descriptions.length}`);

