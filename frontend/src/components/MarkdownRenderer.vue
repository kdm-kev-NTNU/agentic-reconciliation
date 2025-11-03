<template>
  <div class="markdown-body" v-html="html"></div>
  
</template>

<script setup lang="ts">
import { computed } from 'vue'
import MarkdownIt from 'markdown-it'
import DOMPurify from 'dompurify'

const props = defineProps<{
  content: string
}>()

const md = new MarkdownIt({ html: false, linkify: true, breaks: true, typographer: true })

// Open links in new tab safely
const defaultRender = md.renderer.rules.link_open || function(tokens, idx, options, env, self) {
  return self.renderToken(tokens, idx, options)
}
md.renderer.rules.link_open = function(tokens, idx, options, env, self) {
  const t = tokens[idx]
  if (!t) return defaultRender(tokens, idx, options, env, self)
  const setAttr = (name: string, value: string) => {
    const aIdx = t.attrIndex(name)
    if (aIdx < 0) t.attrPush([name, value])
    else if (t.attrs && t.attrs[aIdx]) t.attrs[aIdx][1] = value
  }
  setAttr('target', '_blank')
  setAttr('rel', 'noopener noreferrer')

  return defaultRender(tokens, idx, options, env, self)
}

const html = computed(() => {
  let raw = typeof props.content === 'string' ? props.content : ''
  // If the entire content is wrapped in a markdown code fence, unwrap it for proper rendering
  const m = raw.trim().match(/^```(?:markdown|md)?\n([\s\S]*)\n```$/)
  if (m && m[1]) raw = m[1]
  const rendered = md.render(raw)
  return DOMPurify.sanitize(rendered)
})
</script>

<style scoped>
.markdown-body { max-width: 100%; color: #111827; line-height: 1.7; }
.markdown-body h1 { font-size: 1.75rem; font-weight: 700; margin: 1.25rem 0 .75rem; border-bottom: 1px solid #e5e7eb; padding-bottom: .25rem; }
.markdown-body h2 { font-size: 1.375rem; font-weight: 600; margin: 1rem 0 .5rem; }
.markdown-body h3 { font-size: 1.125rem; font-weight: 600; margin: .75rem 0 .5rem; }
.markdown-body p { margin: .5rem 0; }
.markdown-body ul { margin: .5rem 0; padding-left: 1.25rem; list-style: disc; }
.markdown-body ol { margin: .5rem 0; padding-left: 1.25rem; list-style: decimal; }
.markdown-body li { margin: .25rem 0; }
.markdown-body blockquote { margin: .75rem 0; padding: .25rem .75rem; border-left: 4px solid #e5e7eb; color: #374151; background: #f9fafb; }
.markdown-body hr { border: none; border-top: 1px solid #e5e7eb; margin: 1rem 0; }
.markdown-body table { width: 100%; border-collapse: collapse; margin: .75rem 0; font-size: .95rem; }
.markdown-body th, .markdown-body td { border: 1px solid #e5e7eb; padding: .5rem .625rem; text-align: left; }
.markdown-body thead th { background: #f3f4f6; font-weight: 600; }
.markdown-body pre { background: #f3f4f6; border-radius: .5rem; padding: .75rem; overflow: auto; margin: .75rem 0; }
.markdown-body code { background: #f3f4f6; border-radius: .25rem; padding: .125rem .25rem; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace; }
.markdown-body a { color: #2563eb; text-decoration: underline; }
.markdown-body img { max-width: 100%; height: auto; border-radius: .25rem; }
</style>


