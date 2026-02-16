/* eslint-disable */

const EditorStates = {
  Initializing: { type: 'initializing' },
  Ready: { type: 'ready' },
  ElementSelection: { type: 'element-selection', selectedElements: null },
};

const allowedOrigins = ['http://localhost:3000', 'https://dev.caffeine.ai', 'https://caffeine.ai'];
let parentOrigin = null;

function hashDomTreeString(input) {
  let hash = 5381;
  for (let i = 0; i < input.length; i++) {
    hash = ((hash << 5) + hash) ^ input.charCodeAt(i);
  }
  return 'id-' + (hash >>> 0).toString(36).padStart(6, '0');
}

function ensurePositionedForBadge(el) {
  const style = window.getComputedStyle(el);
  if (style.position === 'static') {
    el.classList.add('editor-selected-badged');
  }
}

function addBadge(el, id) {
  ensurePositionedForBadge(el);
  const badge = document.createElement('span');
  badge.className = 'editor-badge';
  badge.textContent = id;
  badge.setAttribute('data-editor-badge', '1');
  el.appendChild(badge);
}

function removeBadge(el) {
  const badge = el.querySelector('[data-editor-badge="1"]');
  if (badge) badge.remove();
  el.classList.remove('editor-selected-badged');
}

function clearBadges() {
  const badges = document.querySelectorAll('[data-editor-badge="1"]');
  badges.forEach((badge) => {
    const parent = badge.parentElement || null;
    badge.remove();
    if (parent) {
      parent.classList.remove('editor-selected-badged');
    }
  });
}

export class EditCommunicator {
  #toParent(message) {
    if (!parentOrigin) return;
    parent.postMessage(message, parentOrigin);
  }

  #editorState = { type: 'initializing' };
  #selectedElements = new Map();
  #boundMouseOverListener = this.#handleMouseOver.bind(this);
  #boundMouseOutListener = this.#handleMouseOut.bind(this);

  #injectEditorStyles() {
    const style = document.createElement('style');
    style.textContent = `
      .editor-selected { outline: 2px solid #4D99F0 !important; outline-offset: 2px !important; opacity: 1 !important; visibility: visible !important; transition: none !important; transition-property: none !important; transition-duration: 0s !important; transition-delay: 0s !important; clip-path: none !important; clip: unset !important; }
      .editor-hover { outline: 1px dashed #4D99F0 !important; outline-offset: 2px !important; }
      .editor-selected-badged { position: relative !important; }
      .editor-badge { position: absolute !important; top: 0 !important; right: 0 !important; background: #4D99F0 !important; color: #fff !important; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace !important; font-size: 11px !important; line-height: 1 !important; padding: 4px 6px !important; border-radius: 10px !important; box-shadow: 0 1px 3px rgba(0,0,0,0.2) !important; z-index: 2147483647 !important; pointer-events: none !important; user-select: none !important; }
      .editor-element-selection-mode { cursor: crosshair !important; }
      .editor-element-selection-mode * { cursor: crosshair !important; }
    `;
    document.head.appendChild(style);
  }

  #clearAllSelections() {
    const allElements = document.querySelectorAll('.editor-selected');
    allElements.forEach((element) => {
      element.classList.remove('editor-selected');
    });
    this.#selectedElements.clear();
    clearBadges();
  }

  #removeSelection(id) {
    const entry = this.#selectedElements.get(id);
    if (entry) {
      entry.element.classList.remove('editor-selected');
      removeBadge(entry.element);
      this.#selectedElements.delete(id);
      return;
    }
  }

  #addSelection(id, target, domTreeString) {
    target.classList.add('editor-selected');
    addBadge(target, id);
    this.#selectedElements.set(id, { id, element: target, domTreeString });
  }

  #toggleCrosshairCursor(enabled) {
    if (enabled) {
      document.body.classList.add('editor-element-selection-mode');
    } else {
      document.body.classList.remove('editor-element-selection-mode');
    }
  }

  #generateDOMTreeString(element) {
    const path = [];
    let current = element;
    while (current && current !== document.body) {
      path.unshift(current);
      current = current.parentElement;
    }
    const bodyElement = document.body;
    if (!bodyElement) {
      return element.outerHTML;
    }
    const buildTree = (parent, remainingPath) => {
      const clonedParent = parent.cloneNode(false);
      Array.from(parent.children).forEach((child) => {
        const childElement = child;
        if (remainingPath.length > 0 && childElement === remainingPath[0]) {
          if (remainingPath.length === 1) {
            const clonedChild = childElement.cloneNode(true);
            this.#removeArtificialElements(clonedChild);
            clonedChild.setAttribute('data-target', 'this');
            clonedParent.appendChild(clonedChild);
          } else {
            const clonedChild = buildTree(childElement, remainingPath.slice(1));
            clonedParent.appendChild(clonedChild);
          }
        } else {
          const clonedChild = childElement.cloneNode(true);
          this.#removeArtificialElements(clonedChild);
          clonedParent.appendChild(clonedChild);
        }
      });
      this.#removeArtificialElements(clonedParent);
      return clonedParent;
    };
    const tree = buildTree(bodyElement, path);
    return tree.outerHTML;
  }

  #removeArtificialElements(element) {
    const badges = element.querySelectorAll('[data-editor-badge="1"]');
    badges.forEach((badge) => badge.remove());
    element.classList.remove('editor-selected', 'editor-selected-badged', 'editor-hover');
    const children = element.children;
    for (let i = 0; i < children.length; i++) {
      this.#removeArtificialElements(children[i]);
    }
  }

  #handleClickElementSelection(e) {
    const target = e.target;
    const domTreeString = this.#generateDOMTreeString(target);
    const id = hashDomTreeString(domTreeString);
    if (this.#selectedElements.has(id)) {
      this.#removeSelection(id);
    } else {
      this.#addSelection(id, target, domTreeString);
    }
    const selectedElements = Array.from(this.#selectedElements.values()).map(({ id, element, domTreeString }) => ({
      id,
      tagName: element.tagName.toLowerCase(),
      domTreeString,
    }));
    const selectedElementIds = Array.from(this.#selectedElements.keys());
    this.#toParent({
      type: 'element-selection',
      payload: {
        selectedElements,
        selectedElementIds,
        elementId: id,
        elementTree: domTreeString,
      },
    });
  }

  #setupElementClickListeners() {
    const target = document.body ?? document;
    target.addEventListener('click', (e) => {
      if (this.#editorState.type === 'element-selection') {
        e.preventDefault();
        this.#handleClickElementSelection(e);
      }
    });
  }

  #setupElementHoverListeners() {
    this.#removeElementHoverListeners();
    const target = document.body ?? document;
    target.addEventListener('mouseover', this.#boundMouseOverListener);
    target.addEventListener('mouseout', this.#boundMouseOutListener);
  }

  #removeElementHoverListeners() {
    const target = document.body ?? document;
    target.removeEventListener('mouseover', this.#boundMouseOverListener);
    target.removeEventListener('mouseout', this.#boundMouseOutListener);
  }

  #handleMouseOver(e) {
    if (this.#editorState.type !== 'element-selection') return;
    e.stopPropagation();
    const target = e.target;
    const allElements = document.querySelectorAll('.editor-hover');
    allElements.forEach((element) => {
      element.classList.remove('editor-hover');
    });
    target.classList.add('editor-hover');
  }

  #handleMouseOut(e) {
    if (this.#editorState.type !== 'element-selection') return;
    const target = e.target;
    target.classList.remove('editor-hover');
  }

  #rebuildSelection(ids) {
    this.#clearAllSelections();
    if (!Array.isArray(ids) || ids.length === 0) return [];
    const wanted = new Set(ids);
    const matched = [];
    const elements = document.querySelectorAll('*');
    elements.forEach((el) => {
      const domTreeString = this.#generateDOMTreeString(el);
      const id = hashDomTreeString(domTreeString);
      if (wanted.has(id)) {
        this.#addSelection(id, el, domTreeString);
        matched.push(id);
      }
    });
    const selectedElements = Array.from(this.#selectedElements.values()).map(({ id, domTreeString }) => ({
      id,
      domTreeString,
    }));
    const selectedElementIds = Array.from(this.#selectedElements.keys());
    if (selectedElementIds.length > 0) {
      this.#editorState = EditorStates.ElementSelection;
      this.#toggleCrosshairCursor(true);
      this.#toParent({ type: 'status', payload: { status: this.#editorState.type } });
    }
    this.#toParent({
      type: 'selection-rebuilt',
      payload: { selectedElements, selectedElementIds },
    });
    return matched;
  }

  constructor() {
    this.#injectEditorStyles();
    this.#toggleCrosshairCursor(false);
    window.addEventListener('message', (event) => {
      if (!allowedOrigins.includes(event.origin)) {
        this.#toParent({ type: 'error', payload: { msg: `disallowed origin: ${event.origin}` } });
        return;
      }
      parentOrigin = event.origin;
      const { type, payload } = event.data;
      this.#toParent({ type: 'ack', payload: { message: event.data } });
      switch (type) {
        case 'ready':
          this.#clearAllSelections();
          this.#editorState = EditorStates.Ready;
          this.#toggleCrosshairCursor(false);
          this.#toParent({ type: 'status', payload: { status: this.#editorState.type } });
          break;
        case 'tool-element-selection':
          this.#clearAllSelections();
          this.#editorState = EditorStates.ElementSelection;
          this.#toggleCrosshairCursor(true);
          this.#toParent({ type: 'status', payload: { status: this.#editorState.type } });
          break;
        case 'clear-selection':
          this.#toParent({ type: 'status', payload: { status: `clearing selections` } });
          this.#clearAllSelections();
          break;
        case 'remove-selection':
          if (payload?.element) {
            this.#toParent({ type: 'status', payload: { status: `removing ${payload.element}` } });
            this.#removeSelection(payload.element);
          }
          break;
        case 'rebuild-selection': {
          const ids = Array.isArray(payload?.ids) ? payload.ids : [];
          this.#rebuildSelection(ids);
          break;
        }
      }
    });
    this.#setupElementClickListeners();
    this.#setupElementHoverListeners();
    this.#editorState = EditorStates.Ready;
  }
}

let editorInstance = null;
export function initEditor() {
  if (!editorInstance) {
    editorInstance = new EditCommunicator();
  }
  return editorInstance;
}
