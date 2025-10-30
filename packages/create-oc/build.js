import fs from 'fs';

const templates = fs
  .readdirSync('./templates', { withFileTypes: true })
  .filter((x) => x.isDirectory)
  .map((x) => x.name);
const cursorRules = fs.readFileSync('./oc-project.mdc', 'utf8');

for (const template of templates) {
  // Add rules
  fs.mkdirSync(`./templates/${template}/.cursor/rules`, { recursive: true });
  fs.writeFileSync(
    `./templates/${template}/.cursor/rules/oc-project.mdc`,
    cursorRules
  );
  const baseTemplate = template.replace(/\..+$/, '');

  const compilerPkg = JSON.parse(
    fs.readFileSync(
      `../oc-template-${baseTemplate}-compiler/package.json`,
      'utf8'
    )
  );
  const templatePkg = JSON.parse(
    fs.readFileSync(`./templates/${template}/package.json`, 'utf8')
  );
  const ocServerPkg = JSON.parse(
    fs.readFileSync(`../oc-server/package.json`, 'utf8')
  );
  const viteVersion = JSON.parse(
    fs.readFileSync(`../oc-vite/package.json`, 'utf8')
  ).viteVersion;

  // Update dependencies
  templatePkg.devDependencies[
    `oc-template-${baseTemplate}-compiler`
  ] = `^${compilerPkg.version}`;
  templatePkg.devDependencies['oc-server'] = `^${ocServerPkg.version}`;
  templatePkg.devDependencies['vite'] = `^${viteVersion}`;

  // Write and copy
  fs.writeFileSync(
    `./templates/${template}/package.json`,
    JSON.stringify(templatePkg, null, 2)
  );
  fs.cpSync(
    `./templates/${template}`,
    `../oc-template-${baseTemplate}-compiler/scaffold/src`,
    { recursive: true }
  );
}
