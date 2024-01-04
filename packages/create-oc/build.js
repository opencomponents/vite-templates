import fs from 'fs';

const templates = fs
  .readdirSync('./templates', { withFileTypes: true })
  .filter((x) => x.isDirectory)
  .map((x) => x.name);

for (const template of templates) {
  const compilerPkg = JSON.parse(
    fs.readFileSync(`../oc-template-${template}-compiler/package.json`, 'utf8')
  );
  const templatePkg = JSON.parse(
    fs.readFileSync(`./templates/${template}/package.json`, 'utf8')
  );

  templatePkg.devDependencies[
    `oc-template-${template}-compiler`
  ] = `^${compilerPkg.version}`;

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
