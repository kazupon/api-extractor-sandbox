const fs = require('fs').promises
const path = require('path')
const { ApiModel } = require('@microsoft/api-extractor-model')
const apiModel = new ApiModel()
const apiPackage = apiModel.loadPackage('./temp/api-extractor-sandbox.api.json')

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

  function pushline(content) {
    push(content)
    newline()
  }

  return {
    context,
    push,
    indent,
    deindent,
    newline,
    pushline
  }
}


function generateMarkdown(generators, models) {
  for (const model of models) {
    const kind = model.kind
    let generator = generators.get(kind)
    if (!generator) {
      generator = createMarkdownGenerator(kind)
      generator.pushline(`# ${kind}`)
      generator.newline()
      generators.set(kind, generator)
    }

    switch (kind) {
      case 'Function':
        generateMarkdownFunction(generator, model)
        break
      case 'Enum':
        generateMarkdownEnum(generator, model)
        break
      case 'Interface':
        generateMarkdownInterface(generator, model)
        break
      case 'Class':
        generateMarkdownClass(generator, model)
        break
      case 'TypeAlias':
        generateMarkdownTypeAlias(generator, model)
        break
      case 'Variable':
        generateMarkdownVariable(generator, model)
      default:
        break
    }
  }
}

function generateMarkdownFunction(generator, model) {
  generator.pushline(`## ${model.name}`)
  generator.newline()
  const docs = model.tsdocComment
  // console.log('model ->', model)
  // console.log('tsdocComment->', docs)
  // console.log('params ->', docs.params)
  // console.log('params ->', model.parameters)
  // console.log('typeParams ->', docs.typeParams)
  if (docs.summarySection) {
    for (const n of docs.summarySection.nodes) {
      let text = ''
      for (const p of n.nodes) {
        if (p.kind === 'PlainText') {
          text += p.text
        } else if (p.kind === 'CodeSpan') {
          text += `\`${p.code}\``
        }
      }
      generator.pushline(text)
      generator.newline()
    }
  }

  if (model.excerptTokens) {
    generator.pushline(`**Signature:**`)
    generator.pushline('```typescript')
    generator.pushline(model.excerptTokens.map(token => token.text).join(''))
    generator.pushline('```')
    generator.newline()
  }

  const getParamText = (content) => {
    let ret = ''
    for (const n of content.nodes) {
      for (const p of n.nodes) {
        if (p.kind === 'PlainText') {
          ret += p.text
        } else if (p.kind === 'CodeSpan') {
          ret += `\`${p.code}\``
        }
      }
    }
    return ret
  }

  if (model.parameters) {
    generator.pushline(`### Parameters`)
    generator.newline()
    generator.pushline(`| Parameter | Type | Description |`)
    generator.pushline(`| --- | --- | --- |`)
    for (const p of model.parameters) {
      generator.pushline(`| ${p.name} | ${p.parameterTypeExcerpt.text.trim()} | ${getParamText(p.tsdocParamBlock.content)} `)
    }
    generator.newline()
  }


  const getReturnsText = (content) => {
    let ret = ''
    for (const n of content.nodes) {
      for (const p of n.nodes) {
        if (p.kind === 'PlainText') {
          ret += p.text
        } else if (p.kind === 'CodeSpan') {
          ret += `\`${p.code}\``
        }
      }
    }
    return ret
  }

  if (docs.returnsBlock) {
    generator.pushline(`### Returns`)
    generator.newline()
    generator.pushline(getReturnsText(docs.returnsBlock.content))
    generator.newline()
  }

  const getThrowsTags = (customBlocks) => customBlocks.filter(x => x.blockTag.tagName === '@throws')
  const getThrowsText = (content) => {
    let ret = ''
    for (const n of content.nodes) {
      for (const p of n.nodes) {
        if (p.kind === 'PlainText') {
          ret += p.text
        } else if (p.kind === 'CodeSpan') {
          ret += `\`${p.code}\``
        }
      }
    }
    return ret
  }

  const throws = getThrowsTags(docs.customBlocks)
  if (throws.length > 0) {
    generator.pushline(`### Throws`)
    generator.newline()
    for (const t of throws) {
      let text = `${getThrowsText(t.content)}`
      if (throws.length > 1) {
        text = `- ` + text
      }
      generator.pushline(text)
    }
    generator.newline()
  }

  const getRemarksText = (content) => {
    let ret = ''
    for (const n of content.nodes) {
      for (const p of n.nodes) {
        if (p.kind === 'PlainText') {
          ret += p.text
        } else if (p.kind === 'CodeSpan') {
          ret += `\`${p.code}\``
        } else if (p.kind === 'LinkTag') {
          // console.log('nnn', p.linkText, p.urlDestination)
          // if (p.codeDestination) {
          //   const c = p.codeDestination
          //   console.log('sss', c.packageName, c.importPath, c.memberReferences, c.emitAsTsdoc())
          // }
        }
      }
    }
    return ret
  }

  if (docs.remarksBlock) {
    generator.pushline(`### Remarks`)
    generator.newline()
    generator.pushline(getRemarksText(docs.remarksBlock.content))
    generator.newline()
  }

  const getExampleTags = (customBlocks) => customBlocks.filter(x => x.blockTag.tagName === '@example')
  const getExampleText = (content) => {
    let ret = ''
    for (const n of content.nodes) {
      if (n.kind === 'Paragraph') {
        for (const p of n.nodes) {
          if (p.kind === 'PlainText') {
            ret += p.text
          } else if (p.kind === 'CodeSpan') {
            ret += `\`${p.code}\``
          }
        }
      } else if (n.kind === 'FencedCode') {
        ret += `\n`
        ret += `\`\`\`${n.language}\n`
        ret += n.code
        ret += `\`\`\``
      }
    }
    return ret
  }

  const examples = getExampleTags(docs.customBlocks)
  if (examples.length > 0) {
    generator.pushline(`### Examples`)
    generator.newline()
    let count = 1
    for (const e of examples) {
      if (examples.length > 1) {
        generator.pushline(`#### Example ${count}`)
      }
      generator.pushline(`${getExampleText(e.content)}`)
      generator.newline()
      count++
    }
    generator.newline()
  }
}

function generateMarkdownEnum(generator, model) {
  generator.pushline(`## ${model.name}`)
  generator.newline()

  const docs = model.tsdocComment
  if (docs.summarySection) {
    for (const n of docs.summarySection.nodes) {
      let text = ''
      for (const p of n.nodes) {
        if (p.kind === 'PlainText') {
          text += p.text
        } else if (p.kind === 'CodeSpan') {
          text += `\`${p.code}\``
        }
      }
      generator.pushline(text)
      generator.newline()
    }
  }

  if (model.excerptTokens) {
    generator.pushline(`**Signature:**`)
    generator.pushline('```typescript')
    generator.pushline(model.excerptTokens.map(token => token.text).join(''))
    generator.pushline('```')
    generator.newline()
  }

  const getMemberText = (content) => {
    let ret = ''
    for (const n of content.nodes) {
      for (const p of n.nodes) {
        if (p.kind === 'PlainText') {
          ret += p.text
        } else if (p.kind === 'CodeSpan') {
          ret += `\`${p.code}\``
        }
      }
    }
    return ret
  }

  if (model.members) {
    generator.pushline(`### Members`)
    generator.newline()
    generator.pushline(`| Member | Value| Description |`)
    generator.pushline(`| --- | --- | --- |`)
    for (const m of model.members) {
      generator.pushline(`| ${m.name} | ${m.initializerExcerpt.text} | ${getMemberText(m.tsdocComment.summarySection)} `)
    }
    generator.newline()
  }

  const getRemarksText = (content) => {
    let ret = ''
    for (const n of content.nodes) {
      for (const p of n.nodes) {
        if (p.kind === 'PlainText') {
          ret += p.text
        } else if (p.kind === 'CodeSpan') {
          ret += `\`${p.code}\``
        }
      }
    }
    return ret
  }

  if (docs.remarksBlock) {
    generator.pushline(`### Remarks`)
    generator.newline()
    generator.pushline(getRemarksText(docs.remarksBlock.content))
    generator.newline()
  }

  const getExampleTags = (customBlocks) => customBlocks.filter(x => x.blockTag.tagName === '@example')
  const getExampleText = (content) => {
    let ret = ''
    for (const n of content.nodes) {
      if (n.kind === 'Paragraph') {
        for (const p of n.nodes) {
          if (p.kind === 'PlainText') {
            ret += p.text
          } else if (p.kind === 'CodeSpan') {
            ret += `\`${p.code}\``
          }
        }
      } else if (n.kind === 'FencedCode') {
        ret += `\n`
        ret += `\`\`\`${n.language}\n`
        ret += n.code
        ret += `\`\`\``
      }
    }
    return ret
  }

  const examples = getExampleTags(docs.customBlocks)
  if (examples.length > 0) {
    generator.pushline(`### Examples`)
    generator.newline()
    let count = 1
    for (const e of examples) {
      if (examples.length > 1) {
        generator.pushline(`#### Example ${count}`)
      }
      generator.pushline(`${getExampleText(e.content)}`)
      generator.newline()
      count++
    }
    generator.newline()
  }
}

function generateMarkdownInterface(generator, model) {
  generator.pushline(`## ${model.name}`)
  generator.newline()
  generateClassGeneral(generator, model, 'interface')
  generator.newline()
  
  const methods = model.members.filter(m => m.kind === 'MethodSignature')
  generator.pushline(`### Methods`)
  generator.newline() 
  for (const method of methods) {
    generator.pushline(`#### ${method.name}`)
    generator.newline() 
    generateClassGeneral(generator, method, 'method')
  }
  generator.newline()

  const properties = model.members.filter(m => m.kind === 'PropertySignature')
  generator.pushline(`### Properties`)
  generator.newline() 
  for (const property of properties) {
    generator.pushline(`#### ${property.name}`)
    generator.newline() 
    generateClassGeneral(generator, property, 'property')
  }
  generator.newline()
}

function generateMarkdownClass(generator, model) {
  generator.pushline(`## ${model.name}`)
  generator.newline()
  generateClassGeneral(generator, model, 'class')
  generator.newline()

  //console.log('methods', model)
  const [ctor] = model.members.filter(m => m.kind === 'Constructor')
  generator.pushline(`### Constructor`)
  generator.newline() 
  generateClassGeneral(generator, ctor, 'constructor')
  generator.newline()

  const methods = model.members.filter(m => m.kind === 'Method')
  generator.pushline(`### Methods`)
  generator.newline() 
  for (const method of methods) {
    generator.pushline(`#### ${method.name}`)
    generator.newline() 
    generateClassGeneral(generator, method, 'method')
  }
  generator.newline()

  const properties = model.members.filter(m => m.kind === 'Property')
  generator.pushline(`### Properties`)
  generator.newline() 
  for (const property of properties) {
    generator.pushline(`#### ${property.name}`)
    generator.newline() 
    generateClassGeneral(generator, property, 'property')
  }
  generator.newline()
}

function generateClassGeneral(generator, model, type) {
  const docs = model.tsdocComment
  if (docs.summarySection) {
    for (const n of docs.summarySection.nodes) {
      let text = ''
      for (const p of n.nodes) {
        if (p.kind === 'PlainText') {
          text += p.text
        } else if (p.kind === 'CodeSpan') {
          text += `\`${p.code}\``
        }
      }
      generator.pushline(text)
      generator.newline()
    }
  }

  if (model.excerptTokens) {
    generator.pushline(`**Signature:**`)
    generator.pushline('```typescript')
    generator.pushline(model.excerptTokens.map(token => token.text).join(''))
    generator.pushline('```')
    generator.newline()
  }

  const getParamText = (content) => {
    let ret = ''
    for (const n of content.nodes) {
      for (const p of n.nodes) {
        if (p.kind === 'PlainText') {
          ret += p.text
        } else if (p.kind === 'CodeSpan') {
          ret += `\`${p.code}\``
        }
      }
    }
    return ret
  }

  if ((type === 'constrcutor' || type === 'method') && model.parameters) {
    generator.pushline(`*Parameters*`)
    generator.newline()
    generator.pushline(`| Parameter | Type | Description |`)
    generator.pushline(`| --- | --- | --- |`)
    for (const p of model.parameters) {
      generator.pushline(`| ${p.name} | ${p.parameterTypeExcerpt.text.trim()} | ${getParamText(p.tsdocParamBlock.content)} `)
    }
    generator.newline()
  }


  const getReturnsText = (content) => {
    let ret = ''
    for (const n of content.nodes) {
      for (const p of n.nodes) {
        if (p.kind === 'PlainText') {
          ret += p.text
        } else if (p.kind === 'CodeSpan') {
          ret += `\`${p.code}\``
        }
      }
    }
    return ret
  }

  if (type === 'method' && docs.returnsBlock) {
    generator.pushline(`#### Returns`)
    generator.newline()
    generator.pushline(getReturnsText(docs.returnsBlock.content))
    generator.newline()
  }

  const getThrowsTags = (customBlocks) => customBlocks.filter(x => x.blockTag.tagName === '@throws')
  const getThrowsText = (content) => {
    let ret = ''
    for (const n of content.nodes) {
      for (const p of n.nodes) {
        if (p.kind === 'PlainText') {
          ret += p.text
        } else if (p.kind === 'CodeSpan') {
          ret += `\`${p.code}\``
        }
      }
    }
    return ret
  }

  const throws = getThrowsTags(docs.customBlocks)
  if ((type === 'constructor' || type === 'method') && throws.length > 0) {
    generator.pushline(`### Throws`)
    generator.newline()
    for (const t of throws) {
      let text = `${getThrowsText(t.content)}`
      if (throws.length > 1) {
        text = `- ` + text
      }
      generator.pushline(text)
    }
    generator.newline()
  }

  const getRemarksText = (content) => {
    let ret = ''
    for (const n of content.nodes) {
      for (const p of n.nodes) {
        if (p.kind === 'PlainText') {
          ret += p.text
        } else if (p.kind === 'CodeSpan') {
          ret += `\`${p.code}\``
        }
      }
    }
    return ret
  }

  if (docs.remarksBlock) {
    generator.pushline(`### Remarks`)
    generator.newline()
    generator.pushline(getRemarksText(docs.remarksBlock.content))
    generator.newline()
  }

  const getExampleTags = (customBlocks) => customBlocks.filter(x => x.blockTag.tagName === '@example')
  const getExampleText = (content) => {
    let ret = ''
    for (const n of content.nodes) {
      if (n.kind === 'Paragraph') {
        for (const p of n.nodes) {
          if (p.kind === 'PlainText') {
            ret += p.text
          } else if (p.kind === 'CodeSpan') {
            ret += `\`${p.code}\``
          }
        }
      } else if (n.kind === 'FencedCode') {
        ret += `\n`
        ret += `\`\`\`${n.language}\n`
        ret += n.code
        ret += `\`\`\``
      }
    }
    return ret
  }

  const examples = getExampleTags(docs.customBlocks)
  if (examples.length > 0) {
    generator.pushline(`### Examples`)
    generator.newline()
    let count = 1
    for (const e of examples) {
      if (examples.length > 1) {
        generator.pushline(`#### Example ${count}`)
      }
      generator.pushline(`${getExampleText(e.content)}`)
      generator.newline()
      count++
    }
    generator.newline()
  }
}

function generateMarkdownTypeAlias(generator, model) {
  generator.pushline(`## ${model.name}`)
  generator.newline()

  const docs = model.tsdocComment
  if (docs.summarySection) {
    for (const n of docs.summarySection.nodes) {
      let text = ''
      for (const p of n.nodes) {
        if (p.kind === 'PlainText') {
          text += p.text
        } else if (p.kind === 'CodeSpan') {
          text += `\`${p.code}\``
        }
      }
      generator.pushline(text)
      generator.newline()
    }
  }

  if (model.excerptTokens) {
    generator.pushline(`**Signature:**`)
    generator.pushline('```typescript')
    generator.pushline(model.excerptTokens.map(token => token.text).join(''))
    generator.pushline('```')
    generator.newline()
  }

  const getRemarksText = (content) => {
    let ret = ''
    for (const n of content.nodes) {
      for (const p of n.nodes) {
        if (p.kind === 'PlainText') {
          ret += p.text
        } else if (p.kind === 'CodeSpan') {
          ret += `\`${p.code}\``
        }
      }
    }
    return ret
  }

  if (docs.remarksBlock) {
    generator.pushline(`### Remarks`)
    generator.newline()
    generator.pushline(getRemarksText(docs.remarksBlock.content))
    generator.newline()
  }
  
  const getExampleTags = (customBlocks) => customBlocks.filter(x => x.blockTag.tagName === '@example')
  const getExampleText = (content) => {
    let ret = ''
    for (const n of content.nodes) {
      if (n.kind === 'Paragraph') {
        for (const p of n.nodes) {
          if (p.kind === 'PlainText') {
            ret += p.text
          } else if (p.kind === 'CodeSpan') {
            ret += `\`${p.code}\``
          }
        }
      } else if (n.kind === 'FencedCode') {
        ret += `\n`
        ret += `\`\`\`${n.language}\n`
        ret += n.code
        ret += `\`\`\``
      }
    }
    return ret
  }

  const examples = getExampleTags(docs.customBlocks)
  if (examples.length > 0) {
    generator.pushline(`### Examples`)
    generator.newline()
    let count = 1
    for (const e of examples) {
      if (examples.length > 1) {
        generator.pushline(`#### Example ${count}`)
      }
      generator.pushline(`${getExampleText(e.content)}`)
      generator.newline()
      count++
    }
    generator.newline()
  }
}

function generateMarkdownVariable(generator, model) {
  generator.pushline(`## ${model.name}`)
  generator.newline()

  const docs = model.tsdocComment
  if (docs.summarySection) {
    for (const n of docs.summarySection.nodes) {
      let text = ''
      for (const p of n.nodes) {
        if (p.kind === 'PlainText') {
          text += p.text
        } else if (p.kind === 'CodeSpan') {
          text += `\`${p.code}\``
        }
      }
      generator.pushline(text)
      generator.newline()
    }
  }

  if (model.excerptTokens) {
    generator.pushline(`**Signature:**`)
    generator.pushline('```typescript')
    generator.pushline(model.excerptTokens.map(token => token.text).join(''))
    generator.pushline('```')
    generator.newline()
  }

  const getRemarksText = (content) => {
    let ret = ''
    for (const n of content.nodes) {
      for (const p of n.nodes) {
        if (p.kind === 'PlainText') {
          ret += p.text
        } else if (p.kind === 'CodeSpan') {
          ret += `\`${p.code}\``
        }
      }
    }
    return ret
  }

  if (docs.remarksBlock) {
    generator.pushline(`### Remarks`)
    generator.newline()
    generator.pushline(getRemarksText(docs.remarksBlock.content))
    generator.newline()
  }
  
  const getExampleTags = (customBlocks) => customBlocks.filter(x => x.blockTag.tagName === '@example')
  const getExampleText = (content) => {
    let ret = ''
    for (const n of content.nodes) {
      if (n.kind === 'Paragraph') {
        for (const p of n.nodes) {
          if (p.kind === 'PlainText') {
            ret += p.text
          } else if (p.kind === 'CodeSpan') {
            ret += `\`${p.code}\``
          }
        }
      } else if (n.kind === 'FencedCode') {
        ret += `\n`
        ret += `\`\`\`${n.language}\n`
        ret += n.code
        ret += `\`\`\``
      }
    }
    return ret
  }

  const examples = getExampleTags(docs.customBlocks)
  if (examples.length > 0) {
    generator.pushline(`### Examples`)
    generator.newline()
    let count = 1
    for (const e of examples) {
      if (examples.length > 1) {
        generator.pushline(`#### Example ${count}`)
      }
      generator.pushline(`${getExampleText(e.content)}`)
      generator.newline()
      count++
    }
    generator.newline()
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

generate(apiPackage)