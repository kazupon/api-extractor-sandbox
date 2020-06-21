const fs = require('fs').promises
const path = require('path')
// TODO: use @microsoft/api-extractor-model
const apiModel = require('./temp/api-extractor-sandbox.api.json')
console.log('apiModel', apiModel.members)

function createMarkdownGenerator(type) {
  const _context = {
    type,
    content: '',
    indentLevel: 0
  }

  const context = () => _context

  function push(content) {
    _context.content += content
  }

  function _newline(n) {
    push('\n' + `  `.repeat(n))
  }

  function indent() {
    _newline(++_context.indentLevel)
  }

  function deindent(withoutNewLine) {
    if (withoutNewLine) {
      --_context.indentLevel
    } else {
      _newline(--_context.indentLevel)
    }
  }

  function newline() {
    _newline(_context.indentLevel)
  }

  return {
    context,
    push,
    indent,
    deindent,
    newline
  }
}


function generateMarkdown(generators, models) {
  for (const model of models) {
    console.log(model)

    const kind = model.kind
    let generator = generators.get(kind)
    if (!generator) {
      generator = createMarkdownGenerator(kind)
      generator.push(`# ${kind}`)
      generator.newline()
      generator.newline()
      generators.set(kind, generator)
    }

    switch (kind) {
      case 'Function':
        generator.push(`## ${model.name}`)
        generator.newline()
        generator.newline()
        break;
      case 'Interface':
        generateMarkdownInterface(generator, model)
        break;
      case 'Class':
        generateMarkdownClass(generator, model)
        break;
      default:
        break;
    }
  }
}

function generateMarkdownInterface(generator, model) {
  generator.push(`## ${model.name}`)
  generator.newline()
  generator.newline()
  
  for (const member of model.members) {
    switch (member.kind) {
      case 'MethodSignature':
        generator.push(`### ${member.name}`)
        generator.newline()
        generator.newline()
        break;
      default:
        break;
    }
  }
}

function generateMarkdownClass(generator, model) {
  generator.push(`## ${model.name}`)
  generator.newline()
  generator.newline()
  
  for (const member of model.members) {
    switch (member.kind) {
      case 'Constructor':
        generator.push(`### Constructor`)
        generator.newline()
        generator.newline()
        break;
      case 'Method':
        generator.push(`### ${member.name}`)
        generator.newline()
        generator.newline()
        break;
      default:
        break;
    }
  }
}

async function writeContents(generators) {
  for (const [kind, generator] of generators) {
    const content = generator.context().content
    const filePath = path.resolve(__dirname, './vuepress/api/', `${kind.toLowerCase()}.md`)
    console.log('writing ...', kind, content, filePath)
    await fs.writeFile(filePath, content, 'utf-8')
  }
}

function generate(model) {
  const generators = new Map()

  if (!model.members || !model.members[0].members) {
    console.log('not include model')
    return
  }
  const models = model.members[0].members

  generateMarkdown(generators, models)

  writeContents(generators)
}

generate(apiModel)