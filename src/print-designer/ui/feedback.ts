const MESSAGE_DURATION = 2600
function ensureMessageRoot() {
  if (typeof document === 'undefined') {
    return null
  }
  let root = document.querySelector('.pd-message-root')
  if (!root) {
    root = document.createElement('div')
    root.className = 'pd-message-root'
    document.body.appendChild(root)
  }
  return root
}
function showMessage(type, message) {
  const text = String(message || '')
  const root = ensureMessageRoot()
  if (!root) {
    if (type === 'error') {
      console.error(text)
    }
    return
  }
  const node = document.createElement('div')
  node.className = `pd-message pd-message--${type}`
  node.textContent = text
  root.appendChild(node)
  window.setTimeout(() => {
    node.remove()
  }, MESSAGE_DURATION)
}
export const PdMessage = {
  success(message) { showMessage('success', message) },
  warning(message) { showMessage('warning', message) },
  error(message) { showMessage('error', message) },
  info(message) { showMessage('info', message) },
}
function createDialog({ title, message, type = 'info', prompt = false, inputValue = '', inputPattern = null, inputErrorMessage = '' }) {
  return new Promise((resolve, reject) => {
    if (typeof document === 'undefined') {
      reject('cancel')
      return
    }
    const host = document.createElement('div')
    host.className = 'pd-message-box'
    host.innerHTML = `
      <section class="pd-message-box__panel pd-message-box__panel--${type}" role="dialog" aria-modal="true">
        <h2 class="pd-message-box__title"></h2>
        <p class="pd-message-box__message"></p>
        ${prompt ? '<input class="pd-message-box__input" />' : ''}
        <p class="pd-message-box__error"></p>
        <div class="pd-message-box__actions">
          <button type="button" class="pd-message-box__cancel">取消</button>
          <button type="button" class="pd-message-box__confirm">确认</button>
        </div>
      </section>
    `
    document.body.appendChild(host)
    const titleNode = host.querySelector('.pd-message-box__title')
    const messageNode = host.querySelector('.pd-message-box__message')
    const inputNode = host.querySelector('.pd-message-box__input')
    const errorNode = host.querySelector('.pd-message-box__error')
    titleNode.textContent = title || '确认'
    messageNode.textContent = message || ''
    if (inputNode) {
      inputNode.value = inputValue || ''
      inputNode.focus()
    }
    const close = () => {
      host.remove()
      window.removeEventListener('keydown', onKeyDown)
    }
    const cancel = () => {
      close()
      reject('cancel')
    }
    const confirm = () => {
      if (inputNode && inputPattern && !inputPattern.test(inputNode.value)) {
        errorNode.textContent = inputErrorMessage || '输入内容无效'
        return
      }
      const value = inputNode ? { value: inputNode.value } : undefined
      close()
      resolve(value)
    }
    function onKeyDown(event) {
      if (event.key === 'Escape') {
        cancel()
      }
      if (event.key === 'Enter') {
        confirm()
      }
    }
    host.querySelector('.pd-message-box__cancel').addEventListener('click', cancel)
    host.querySelector('.pd-message-box__confirm').addEventListener('click', confirm)
    window.addEventListener('keydown', onKeyDown)
  })
}
export const PdMessageBox = {
  confirm(message, title, options = {}) {
    return createDialog({ title, message, type: options.type || 'warning' })
  },
  prompt(message, title, options = {}) {
    return createDialog({
      title,
      message,
      type: options.type || 'info',
      prompt: true,
      inputValue: options.inputValue,
      inputPattern: options.inputPattern,
      inputErrorMessage: options.inputErrorMessage,
    })
  },
}
