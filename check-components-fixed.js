import fs from 'fs';

// Читаем все файлы
const typesContent = fs.readFileSync('src/types.ts', 'utf8');
const customNodeContent = fs.readFileSync('src/components/CustomNode.tsx', 'utf8');
const paletteContent = fs.readFileSync('src/components/ComponentPalette.tsx', 'utf8');
const infoPanelContent = fs.readFileSync('src/components/ComponentInfoPanel.tsx', 'utf8');

// Извлекаем только ComponentType компоненты (до следующего export type)
const componentTypeMatch = typesContent.match(/export type ComponentType =([\s\S]*?)(?=export type|$)/);
if (!componentTypeMatch) {
  console.log('Не найден ComponentType');
  process.exit(1);
}

const componentTypeContent = componentTypeMatch[1];
const componentMatches = componentTypeContent.match(/\| '([a-z-]+)'/g);
const components = componentMatches ? componentMatches.map(m => m.match(/'([a-z-]+)'/)[1]) : [];

console.log(`\n=== Проверка компонентов ComponentType (всего: ${components.length}) ===\n`);

// Извлекаем иконки - ищем паттерн 'component-name': <Icon
const iconMatches = customNodeContent.match(/(['"])([a-z-]+)\1:\s*<[^>]+>/g);
const icons = iconMatches ? iconMatches.map(m => {
  const match = m.match(/(['"])([a-z-]+)\1/);
  return match ? match[2] : null;
}).filter(Boolean) : [];

// Извлекаем цвета - ищем паттерн 'component-name': '#color'
const colorMatches = customNodeContent.match(/(['"])([a-z-]+)\1:\s*'#[0-9a-fA-F]+'/g);
const colors = colorMatches ? colorMatches.map(m => {
  const match = m.match(/(['"])([a-z-]+)\1/);
  return match ? match[2] : null;
}).filter(Boolean) : [];

// Извлекаем компоненты из палитры
const paletteMatches = paletteContent.match(/type:\s*['"]([a-z-]+)['"]/g);
const paletteComponents = paletteMatches ? paletteMatches.map(m => m.match(/['"]([a-z-]+)['"]/)[1]) : [];

// Извлекаем описания
const descriptionMatches = infoPanelContent.match(/(['"])([a-z-]+)\1:\s*\{/g);
const descriptions = descriptionMatches ? descriptionMatches.map(m => {
  const match = m.match(/(['"])([a-z-]+)\1/);
  return match ? match[2] : null;
}).filter(Boolean) : [];

// Находим проблемы
const missingIcons = components.filter(c => !icons.includes(c));
const missingColors = components.filter(c => !colors.includes(c));
const missingInPalette = components.filter(c => !paletteComponents.includes(c));
const missingDescriptions = components.filter(c => !descriptions.includes(c));

console.log('❌ Компоненты без иконок:', missingIcons.length > 0 ? missingIcons : 'нет');
console.log('❌ Компоненты без цветов:', missingColors.length > 0 ? missingColors : 'нет');
console.log('❌ Компоненты не в палитре:', missingInPalette.length > 0 ? missingInPalette : 'нет');
console.log('❌ Компоненты без описаний:', missingDescriptions.length > 0 ? missingDescriptions : 'нет');

// Проверяем соответствие
console.log('\n=== Детальная проверка ===\n');

const issues = [];
const ok = [];

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
  } else {
    ok.push(component);
  }
});

if (issues.length > 0) {
  console.log(`❌ Проблемы найдены (${issues.length} компонентов):\n`);
  issues.forEach(issue => {
    const status = [
      issue.inPalette ? '✅' : '❌ палитра',
      issue.hasIcon ? '✅' : '❌ иконка',
      issue.hasColor ? '✅' : '❌ цвет',
      issue.hasDescription ? '✅' : '❌ описание'
    ].join(' ');
    console.log(`  ${issue.component}: ${status}`);
  });
} else {
  console.log('✅ Все компоненты имеют все необходимые характеристики!');
}

console.log(`\n✅ Корректные компоненты: ${ok.length}`);
console.log(`❌ Проблемные компоненты: ${issues.length}`);

console.log(`\n=== Итого ===`);
console.log(`Компонентов в ComponentType: ${components.length}`);
console.log(`Компонентов в палитре: ${paletteComponents.length}`);
console.log(`Иконок в CustomNode: ${icons.length}`);
console.log(`Цветов в CustomNode: ${colors.length}`);
console.log(`Описаний в ComponentInfoPanel: ${descriptions.length}`);












