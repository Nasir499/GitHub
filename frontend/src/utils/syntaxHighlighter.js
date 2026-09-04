// Robust Client-Side Syntax Colorizer for Web Applications

const ESCAPE_MAP = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#039;'
};

function escapeHtml(text) {
  return text.replace(/[&<>"']/g, (m) => ESCAPE_MAP[m]);
}

const KEYWORDS = new Set([
  'async', 'await', 'break', 'case', 'catch', 'class', 'const', 'continue',
  'debugger', 'default', 'delete', 'do', 'else', 'enum', 'export', 'extends',
  'finally', 'for', 'function', 'if', 'implements', 'import', 'in', 'instanceof',
  'interface', 'let', 'new', 'package', 'private', 'protected', 'public',
  'return', 'static', 'super', 'switch', 'this', 'throw', 'try', 'typeof',
  'var', 'void', 'while', 'with', 'yield', 'def', 'elif', 'lambda', 'pass',
  'raise', 'except', 'from', 'is', 'nonlocal', 'global', 'assert', 'int',
  'double', 'float', 'boolean', 'char', 'long', 'short', 'byte', 'final'
]);

const LITERALS = new Set([
  'true', 'false', 'null', 'undefined', 'NaN', 'Infinity', 'True', 'False', 'None'
]);

export function getHighlightedCodeHtml(code, filename = '') {
  if (!code) return '';

  const ext = (filename.split('.').pop() || '').toLowerCase();

  // Special handler for JSON files
  if (ext === 'json') {
    try {
      const parsed = JSON.parse(code);
      const jsonStr = JSON.stringify(parsed, null, 2);
      return highlightJson(jsonStr);
    } catch {
      // Fallback to text highlight
    }
  }

  return highlightCodeLines(code);
}

function highlightCodeLines(code) {
  const lines = code.split('\n');
  let inBlockComment = false;

  const highlightedLines = lines.map((line) => {
    let result = '';
    let i = 0;

    while (i < line.length) {
      // Block Comment Continuation
      if (inBlockComment) {
        const endIdx = line.indexOf('*/', i);
        if (endIdx !== -1) {
          const commentText = line.slice(i, endIdx + 2);
          result += `<span class="token comment">${escapeHtml(commentText)}</span>`;
          i = endIdx + 2;
          inBlockComment = false;
        } else {
          const commentText = line.slice(i);
          result += `<span class="token comment">${escapeHtml(commentText)}</span>`;
          i = line.length;
        }
        continue;
      }

      // Start of Block Comment /* ... */
      if (line.startsWith('/*', i)) {
        inBlockComment = true;
        const endIdx = line.indexOf('*/', i + 2);
        if (endIdx !== -1) {
          const commentText = line.slice(i, endIdx + 2);
          result += `<span class="token comment">${escapeHtml(commentText)}</span>`;
          i = endIdx + 2;
          inBlockComment = false;
        } else {
          const commentText = line.slice(i);
          result += `<span class="token comment">${escapeHtml(commentText)}</span>`;
          i = line.length;
        }
        continue;
      }

      // Single Line Comment // ... or # ...
      if (line.startsWith('//', i) || (line.startsWith('#', i) && !line.startsWith('#include', i))) {
        const commentText = line.slice(i);
        result += `<span class="token comment">${escapeHtml(commentText)}</span>`;
        i = line.length;
        continue;
      }

      // Strings ("...", '...', `...`)
      const char = line[i];
      if (char === '"' || char === "'" || char === '`') {
        const quote = char;
        let strEnd = i + 1;
        while (strEnd < line.length) {
          if (line[strEnd] === '\\') {
            strEnd += 2;
          } else if (line[strEnd] === quote) {
            strEnd++;
            break;
          } else {
            strEnd++;
          }
        }
        const strText = line.slice(i, strEnd);
        result += `<span class="token string">${escapeHtml(strText)}</span>`;
        i = strEnd;
        continue;
      }

      // Decorators / Annotations (e.g. @Remove_LECTURE, @Override, @ROUTE)
      if (char === '@' && /[a-zA-Z_]/.test(line[i + 1] || '')) {
        let annEnd = i + 1;
        while (annEnd < line.length && /[a-zA-Z0-9_]/.test(line[annEnd])) {
          annEnd++;
        }
        const annText = line.slice(i, annEnd);
        result += `<span class="token function">${escapeHtml(annText)}</span>`;
        i = annEnd;
        continue;
      }

      // Identifiers / Keywords / Numbers
      if (/[a-zA-Z_$]/.test(char)) {
        let idEnd = i;
        while (idEnd < line.length && /[a-zA-Z0-9_$]/.test(line[idEnd])) {
          idEnd++;
        }
        const word = line.slice(i, idEnd);

        // Check if function call (followed by '(')
        let nextCharIdx = idEnd;
        while (nextCharIdx < line.length && /\s/.test(line[nextCharIdx])) {
          nextCharIdx++;
        }
        const isFunc = line[nextCharIdx] === '(';

        if (KEYWORDS.has(word)) {
          result += `<span class="token keyword">${escapeHtml(word)}</span>`;
        } else if (LITERALS.has(word)) {
          result += `<span class="token boolean">${escapeHtml(word)}</span>`;
        } else if (isFunc) {
          result += `<span class="token function">${escapeHtml(word)}</span>`;
        } else if (/^[A-Z][a-zA-Z0-9_$]*$/.test(word)) {
          // Class / Component names starting with Capital letter
          result += `<span class="token class-name">${escapeHtml(word)}</span>`;
        } else {
          result += `<span class="token variable">${escapeHtml(word)}</span>`;
        }

        i = idEnd;
        continue;
      }

      // Numbers
      if (/[0-9]/.test(char)) {
        let numEnd = i;
        while (numEnd < line.length && /[0-9.]/.test(line[numEnd])) {
          numEnd++;
        }
        const numText = line.slice(i, numEnd);
        result += `<span class="token number">${escapeHtml(numText)}</span>`;
        i = numEnd;
        continue;
      }

      // Punctuation & Operators
      result += `<span class="token punctuation">${escapeHtml(char)}</span>`;
      i++;
    }

    return result;
  });

  return highlightedLines.join('\n');
}

function highlightJson(jsonStr) {
  return jsonStr.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, (match) => {
    let cls = 'number';
    if (/^"/.test(match)) {
      if (/:$/.test(match)) {
        cls = 'keyword';
      } else {
        cls = 'string';
      }
    } else if (/true|false/.test(match)) {
      cls = 'boolean';
    } else if (/null/.test(match)) {
      cls = 'boolean';
    }
    return `<span class="token ${cls}">${escapeHtml(match)}</span>`;
  });
}
