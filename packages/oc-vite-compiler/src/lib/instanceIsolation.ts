import MagicString from 'magic-string';
import type { Plugin } from 'oc-vite';

const FACTORY = '__$$oc_instance__';

type Node = {
  type: string;
  start: number;
  end: number;
  [key: string]: unknown;
};

type Name = { type: string; name?: string; value?: unknown };

const FUNCTION_TYPES = new Set([
  'FunctionDeclaration',
  'FunctionExpression',
  'ArrowFunctionExpression',
]);

function hasTopLevelAwait(node: unknown): boolean {
  if (!node || typeof node !== 'object') return false;
  if (Array.isArray(node)) return node.some(hasTopLevelAwait);
  const n = node as Node;
  if (FUNCTION_TYPES.has(n.type)) return false;
  if (n.type === 'AwaitExpression') return true;
  if (n.type === 'ForOfStatement' && n['await']) return true;
  for (const key in n) {
    if (key === 'type' || key === 'start' || key === 'end') continue;
    if (hasTopLevelAwait(n[key])) return true;
  }
  return false;
}

const nameOf = (node: Name) =>
  node.type === 'Identifier' ? node.name! : String(node.value);

/**
 * Evaluates the component's code once per mounted instance, like the
 * function-based templates (react, es6, solid, ...) do.
 *
 * An ES module is evaluated once per page, so without this every instance of
 * the same component version shares one module scope: the
 * `__$$oc_initialData__` / `__$$oc_Settings__` values `mount` assigns (read by
 * `getInitialData()`, `getSettings()` and `serverClient`) are always the
 * last-mounted instance's. Here the entry chunk's body (everything but its
 * hoisted `import`s) moves into a factory that declares its own copies of
 * those two variables, and the exported `mount` creates a fresh instance per
 * call. Module-level state of the component is per instance as a result.
 *
 * Leaves the chunk unchanged, with a warning, when it cannot wrap it safely:
 * code-split chunks, top-level `await`, re-exports, or exports other than
 * `mount`.
 */
export default function instanceIsolationPlugin(): Plugin {
  return {
    name: 'OcInstanceIsolation',
    apply: 'build',
    renderChunk: {
      order: 'post',
      handler(code, chunk, _outputOptions, meta) {
        if (!chunk.isEntry) return null;
        const skip = (reason: string) => {
          this.warn(
            `${chunk.fileName} is not isolated per instance (${reason}); ` +
              "getInitialData()/getSettings() return the last-mounted instance's " +
              'values when a page mounts this component more than once.'
          );
          return null;
        };

        const chunks = (meta as { chunks?: Record<string, unknown> }).chunks;
        const internal = [...chunk.imports, ...chunk.dynamicImports].filter(
          (id) => (chunks ? id in chunks : !/^[a-z@]/i.test(id))
        );
        if (internal.length > 0) {
          return skip(`it imports other chunks: ${internal.join(', ')}`);
        }

        const program = this.parse(code) as unknown as { body: Node[] };
        const s = new MagicString(code);
        const exports: { local: string; exported: string }[] = [];
        let firstStatement: Node | undefined;

        for (const node of program.body) {
          switch (node.type) {
            case 'ImportDeclaration':
              if (firstStatement) s.move(node.start, node.end, 0);
              continue;
            case 'ExportAllDeclaration':
              return skip('it re-exports another module');
            case 'ExportNamedDeclaration': {
              if (node['source']) return skip('it re-exports another module');
              const declaration = node['declaration'] as Node | null;
              if (declaration) {
                const id = declaration['id'] as { name: string } | undefined;
                if (!id) return skip('it exports a destructured declaration');
                exports.push({ local: id.name, exported: id.name });
                s.remove(node.start, declaration.start);
              } else {
                for (const spec of node['specifiers'] as {
                  local: Name;
                  exported: Name;
                }[]) {
                  exports.push({
                    local: nameOf(spec.local),
                    exported: nameOf(spec.exported),
                  });
                }
                s.remove(node.start, node.end);
              }
              break;
            }
            case 'ExportDefaultDeclaration':
              return skip('it has a default export');
          }
          firstStatement ??= node;
        }

        if (exports.length !== 1 || exports[0].exported !== 'mount') {
          return skip(
            `it exports ${
              exports.map((e) => e.exported).join(', ') || 'nothing'
            } instead of only mount`
          );
        }
        if (hasTopLevelAwait(program.body)) {
          return skip('it uses top-level await');
        }

        s.appendLeft(
          firstStatement?.start ?? code.length,
          `function ${FACTORY}(){var __$$oc_initialData__,__$$oc_Settings__;`
        );
        s.append(
          `\nreturn ${exports[0].local}}\nexport function mount(element,props,ctx){return ${FACTORY}()(element,props,ctx)}\n`
        );
        return { code: s.toString(), map: s.generateMap({ hires: true }) };
      },
    },
  };
}
