const { transform } = require('@svgr/core');
const { pascalCase } = require('change-case');
const fs = require('fs');

const path = `${__dirname}/assets`;
const componentPath = `${__dirname}/components/Icons`;

(async function () {
  const files = fs.readdirSync(path);

  const result = files
    .map((file) => {
      const [name, ext] = file.split('.');
      return { name: name.replace(/icon_|ic_/gi, ''), ext, file };
    })
    .filter((f) => f.ext === 'svg');

  const promises = result.map(async (item) => {
    const svgText = await fs.readFileSync(`${path}/${item.file}`, 'utf8');

    const componentName = `${pascalCase(item.name)}`;
    const componentText = transform.sync(
      svgText,
      {
        icon: true,
        // native: true, // react-native-svg
        // typescript: true,
      },
      { componentName }
    );
    return {
      componentText: componentText, //.replace(/fill="#[0-9a-zA-Z]+"/gi, `fill={props.fill ?? "#212121"}`),
      componentName,
    };
  });

  const svgList = await Promise.all(promises);

  let indexFileText = `export { default as Logo } from './Logo';`;

  const indexTemplate = (componentName) => `export { default as ${componentName} } from './${componentName}';\n`;

  svgList.forEach((svg) => {
    indexFileText += indexTemplate(svg.componentName);
    fs.writeFileSync(`${componentPath}/${svg.componentName}.js`, svg.componentText);
  });

  fs.writeFileSync(`${componentPath}/index.js`, indexFileText);
})();
