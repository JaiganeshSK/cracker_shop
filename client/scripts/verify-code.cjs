/**
 * Automated AST Code Verifier
 * Scans all JSX and JS files in client/src to guarantee that every JSX tag,
 * component, and icon has a valid declaration or import.
 * Prevents runtime ReferenceErrors (such as missing Lucide icon imports).
 */

const fs = require('fs');
const path = require('path');
const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;

const SRC_DIR = path.resolve(__dirname, '../src');

function getAllSourceFiles(dir) {
  let files = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files = files.concat(getAllSourceFiles(fullPath));
    } else if (/\.(jsx|js)$/.test(entry.name)) {
      files.push(fullPath);
    }
  }
  return files;
}

// Built-in standard components or globals that are valid without explicit import
const ALLOWED_GLOBALS = new Set([
  'React',
  'Fragment',
  'Suspense',
  'StrictMode',
  // Standard HTML / SVG are lowercase, but just in case:
  'window',
  'document',
  'console',
]);

function verifyFile(filePath) {
  const code = fs.readFileSync(filePath, 'utf8');
  const relativePath = path.relative(path.resolve(__dirname, '..'), filePath);
  const errors = [];

  let ast;
  try {
    ast = parser.parse(code, {
      sourceType: 'module',
      plugins: ['jsx', 'asyncGenerators', 'dynamicImport', 'classProperties'],
    });
  } catch (err) {
    return [{
      file: relativePath,
      line: err.loc ? err.loc.line : 1,
      column: err.loc ? err.loc.column : 1,
      message: `Syntax error during parse: ${err.message}`,
    }];
  }

  traverse(ast, {
    JSXOpeningElement(jsxPath) {
      const nameNode = jsxPath.node.name;
      let tagName = null;

      if (nameNode.type === 'JSXIdentifier') {
        tagName = nameNode.name;
      } else if (nameNode.type === 'JSXMemberExpression') {
        // e.g. <item.icon ... /> or <motion.div ... />
        let base = nameNode.object;
        while (base.type === 'JSXMemberExpression') {
          base = base.object;
        }
        if (base.type === 'JSXIdentifier') {
          const baseName = base.name;
          if (!ALLOWED_GLOBALS.has(baseName) && !jsxPath.scope.hasBinding(baseName)) {
            errors.push({
              file: relativePath,
              line: base.loc ? base.loc.start.line : 1,
              column: base.loc ? base.loc.start.column : 1,
              message: `JSX member base object '${baseName}' is used but not defined or imported.`,
            });
          }
        }
        return;
      }

      // If it starts with uppercase, it is a React component or Icon
      if (tagName && /^[A-Z]/.test(tagName)) {
        if (!ALLOWED_GLOBALS.has(tagName) && !jsxPath.scope.hasBinding(tagName)) {
          errors.push({
            file: relativePath,
            line: nameNode.loc ? nameNode.loc.start.line : 1,
            column: nameNode.loc ? nameNode.loc.start.column : 1,
            message: `JSX Component '<${tagName} />' is referenced but NOT defined or imported in this file.`,
          });
        }
      }
    },
  });

  return errors;
}

function main() {
  console.log('🔍 Checking all client source files for missing imports & undeclared JSX components...');
  const files = getAllSourceFiles(SRC_DIR);
  const allErrors = [];

  for (const file of files) {
    const fileErrors = verifyFile(file);
    if (fileErrors.length > 0) {
      allErrors.push(...fileErrors);
    }
  }

  if (allErrors.length > 0) {
    console.error('\n❌ VERIFICATION FAILED: Found undeclared JSX components / missing imports:');
    allErrors.forEach((err) => {
      console.error(`  - ${err.file}:${err.line}:${err.column} -> ${err.message}`);
    });
    console.error('\nPlease import or declare these components before committing or building.\n');
    process.exit(1);
  }

  console.log(`✅ All ${files.length} client source files verified successfully! No undeclared JSX components found.\n`);
}

main();
