import fs from 'fs';

const templates = fs
  .readdirSync('./templates', { withFileTypes: true })
  .filter((x) => x.isDirectory)
  .map((x) => x.name);

for (const template of templates) {
  fs.cpSync(
    `./templates/${template}`,
    `../oc-template-${template}-compiler/scaffold/src`,
    { recursive: true }
  );
}
