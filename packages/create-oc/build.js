import fs from 'fs';

const templates = fs
  .readdirSync('./templates', { withFileTypes: true })
  .filter((x) => x.isDirectory)
  .map((x) => x.name);
const cursorRules = fs.readFileSync('./oc-project.mdc', 'utf8');

function tryCreateDir(path) {
  try {
    fs.mkdirSync(path, { recursive: true });
  } catch (e) {
    console.error(e);
  }
}

for (const template of templates) {
  const compilerPkg = JSON.parse(
    fs.readFileSync(`../oc-template-${template}-compiler/package.json`, 'utf8')
  );
  const templatePkg = JSON.parse(
    fs.readFileSync(`./templates/${template}/package.json`, 'utf8')
  );
  const ocServerPkg = JSON.parse(
    fs.readFileSync(`../oc-server/package.json`, 'utf8')
  );

  tryCreateDir(`./templates/${template}/.cursor/rules`);
  fs.writeFileSync(
    `./templates/${template}/.cursor/rules/oc-project.mdc`,
    cursorRules
  );

  templatePkg.devDependencies[
    `oc-template-${template}-compiler`
  ] = `^${compilerPkg.version}`;
  templatePkg.devDependencies['oc-server'] = `^${ocServerPkg.version}`;

  fs.writeFileSync(
    `./templates/${template}/package.json`,
    JSON.stringify(templatePkg, null, 2)
  );

  fs.cpSync(
    `./templates/${template}`,
    `../oc-template-${template}-compiler/scaffold/src`,
    { recursive: true }
  );
}
