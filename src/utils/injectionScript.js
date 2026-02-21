// --- Injected Script for Live Editing ---
export const getInjectionScript = () => `
  <style id="ai-architect-styles">
    .ai-architect-highlight {
      outline: 2px solid #8b5cf6 !important;
      outline-offset: -1px;
      box-shadow: 0 0 0 4px rgba(139, 92, 246, 0.15) !important;
    }
  </style>
  <script id="ai-architect-injected">
    window.interactionMode = 'preview';
    let currentSelected = null;

    const highlight = (el) => { if (el) el.classList.add('ai-architect-highlight'); };
    const unhighlight = (el) => { if (el) el.classList.remove('ai-architect-highlight'); };

    document.body.addEventListener('click', function(e) {
      if (window.interactionMode !== 'design') return;

      e.preventDefault();
      e.stopPropagation();

      unhighlight(currentSelected);

      currentSelected = e.target;
      highlight(currentSelected);

      if (!currentSelected.dataset.aiId) {
        currentSelected.dataset.aiId = 'ai-el-' + Math.random().toString(36).substr(2, 9);
      }

      const rect = currentSelected.getBoundingClientRect();

      let path = [];
      let curr = currentSelected;
      while(curr && curr.tagName && curr.tagName !== 'HTML') {
          let name = curr.tagName.toLowerCase();
          if(curr.id) name += '#' + curr.id;
          else if(curr.className && typeof curr.className === 'string') {
              let cls = curr.className.split(' ').find(c => c && c !== 'ai-architect-highlight');
              if(cls) name += '.' + cls;
          }
          path.unshift(name);
          curr = curr.parentElement;
          if(path.length > 4) { path.unshift('...'); break; }
      }

      const computed = window.getComputedStyle(currentSelected);
      const inline = (prop) => currentSelected.style[prop] || '';
      const comp = (prop) => computed.getPropertyValue(prop) || '';
      const pick = (prop, cssProp) => inline(prop) || comp(cssProp || prop);
      const styles = {
          // Size
          width: inline('width') || (comp('width') !== 'auto' ? comp('width') : ''),
          height: inline('height') || (comp('height') !== 'auto' ? comp('height') : ''),
          minWidth: pick('minWidth', 'min-width'), maxWidth: pick('maxWidth', 'max-width'),
          minHeight: pick('minHeight', 'min-height'), maxHeight: pick('maxHeight', 'max-height'),
          // Spacing
          marginTop: pick('marginTop', 'margin-top'), marginBottom: pick('marginBottom', 'margin-bottom'),
          marginLeft: pick('marginLeft', 'margin-left'), marginRight: pick('marginRight', 'margin-right'),
          paddingTop: pick('paddingTop', 'padding-top'), paddingBottom: pick('paddingBottom', 'padding-bottom'),
          paddingLeft: pick('paddingLeft', 'padding-left'), paddingRight: pick('paddingRight', 'padding-right'),
          // Layout
          display: comp('display'), position: pick('position'),
          top: pick('top'), right: pick('right'), bottom: pick('bottom'), left: pick('left'),
          zIndex: comp('z-index') !== 'auto' ? comp('z-index') : '',
          overflow: comp('overflow'), visibility: comp('visibility'),
          // Flexbox container
          flexDirection: comp('flex-direction'), flexWrap: comp('flex-wrap'),
          justifyContent: comp('justify-content'), alignItems: comp('align-items'), gap: comp('gap'),
          // Flexbox child
          flexGrow: comp('flex-grow'), flexShrink: comp('flex-shrink'),
          flexBasis: comp('flex-basis'), alignSelf: comp('align-self'), order: comp('order'),
          // Typography
          fontFamily: comp('font-family'), fontWeight: comp('font-weight'),
          fontSize: comp('font-size'), lineHeight: comp('line-height'),
          fontStyle: comp('font-style'), textDecoration: comp('text-decoration'),
          textTransform: comp('text-transform'), letterSpacing: comp('letter-spacing'),
          color: comp('color'), textAlign: comp('text-align'),
          // Colors
          backgroundColor: comp('background-color'),
          // Border
          borderRadius: comp('border-radius'),
          borderWidth: comp('border-width') !== '0px' ? comp('border-width') : '',
          borderStyle: comp('border-style') !== 'none' ? comp('border-style') : '',
          borderColor: comp('border-color'),
          // Effects
          opacity: comp('opacity') !== '1' ? comp('opacity') : '',
          boxShadow: comp('box-shadow') !== 'none' ? comp('box-shadow') : '',
          transform: comp('transform') !== 'none' ? comp('transform') : '',
          cursor: comp('cursor') !== 'auto' ? comp('cursor') : '',
          transition: inline('transition') || ''
      };

      window.parent.postMessage({
        type: 'ELEMENT_SELECTED',
        id: currentSelected.dataset.aiId,
        tagName: currentSelected.tagName,
        domId: currentSelected.id || '',
        className: (typeof currentSelected.className === 'string' ? currentSelected.className : '').replace(/\\bai-architect-highlight\\b/g, '').replace(/\\s+/g, ' ').trim(),
        innerHTML: currentSelected.innerHTML,
        innerText: currentSelected.innerText || '',
        src: currentSelected.src || '',
        alt: currentSelected.alt || '',
        outerHTML: currentSelected.outerHTML,
        domPath: path,
        styles: styles,
        rect: { top: rect.top, left: rect.left, width: rect.width, height: rect.height }
      }, '*');
    }, true);

    // Intercept link clicks in preview mode for cross-page navigation
    document.addEventListener('click', function(e) {
      if (window.interactionMode !== 'preview') return;
      const link = e.target.closest('a[href]');
      if (!link) return;
      const href = link.getAttribute('href');
      if (!href || href.startsWith('#') || href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('tel:')) return;
      // Local file link (e.g., "about.page.html", "pricing.html")
      e.preventDefault();
      e.stopPropagation();
      const fileName = href.split('/').pop().split('?')[0].split('#')[0];
      if (fileName && fileName.endsWith('.html')) {
        window.parent.postMessage({ type: 'NAVIGATE_FILE', fileName: fileName }, '*');
      }
    }, true);

    window.addEventListener('message', function(e) {
       if (e.data.type === 'MODE_CHANGE') {
          window.interactionMode = e.data.mode;
          if (e.data.mode === 'preview') {
             unhighlight(currentSelected);
             currentSelected = null;
          }
       }
       if (e.data.type === 'UPDATE_ELEMENT') {
         const el = document.querySelector('[data-ai-id="' + e.data.id + '"]');
         if (el) {
            el.outerHTML = e.data.newHtml;
            const newEl = document.querySelector('[data-ai-id="' + e.data.id + '"]');
            if (newEl) {
               unhighlight(newEl);
               currentSelected = newEl;
               if (window.interactionMode === 'design') highlight(newEl);
            }
            window.parent.postMessage({ type: 'DOCUMENT_UPDATED', html: document.documentElement.outerHTML }, '*');
         }
       }
       if (e.data.type === 'UPDATE_ELEMENT_MANUAL') {
         const el = document.querySelector('[data-ai-id="' + e.data.id + '"]');
         if (el) {
            unhighlight(el);
            if (e.data.className !== undefined) el.className = e.data.className;
            if (e.data.domId !== undefined) el.id = e.data.domId;
            if (e.data.innerHTML !== undefined) el.innerHTML = e.data.innerHTML;
            if (e.data.innerText !== undefined) el.innerText = e.data.innerText;
            if (e.data.src !== undefined) el.src = e.data.src;
            if (e.data.alt !== undefined) el.alt = e.data.alt;
            currentSelected = el;
            if (window.interactionMode === 'design') highlight(el);
            window.parent.postMessage({ type: 'DOCUMENT_UPDATED', html: document.documentElement.outerHTML }, '*');
         }
       }
       if (e.data.type === 'UPDATE_ELEMENT_STYLE') {
         const el = document.querySelector('[data-ai-id="' + e.data.id + '"]');
         if (el) {
            el.style[e.data.property] = e.data.value;
            window.parent.postMessage({ type: 'DOCUMENT_UPDATED', html: document.documentElement.outerHTML }, '*');
         }
       }
       if (e.data.type === 'ACTION_MOVE') {
         const el = document.querySelector('[data-ai-id="' + e.data.id + '"]');
         if (el) {
            if (e.data.direction === 'up' && el.previousElementSibling) el.parentNode.insertBefore(el, el.previousElementSibling);
            if (e.data.direction === 'down' && el.nextElementSibling) el.parentNode.insertBefore(el, el.nextElementSibling.nextSibling);
            window.parent.postMessage({ type: 'DOCUMENT_UPDATED', html: document.documentElement.outerHTML }, '*');
         }
       }
       if (e.data.type === 'ACTION_DELETE') {
         const el = document.querySelector('[data-ai-id="' + e.data.id + '"]');
         if (el) {
            el.remove();
            currentSelected = null;
            window.parent.postMessage({ type: 'DOCUMENT_UPDATED', html: document.documentElement.outerHTML }, '*');
            window.parent.postMessage({ type: 'DESELECT' }, '*');
         }
       }
       if (e.data.type === 'ACTION_DUPLICATE') {
         const el = document.querySelector('[data-ai-id="' + e.data.id + '"]');
         if (el) {
            const clone = el.cloneNode(true);
            clone.dataset.aiId = 'ai-el-' + Math.random().toString(36).substr(2, 9);
            unhighlight(clone);
            el.after(clone);
            window.parent.postMessage({ type: 'DOCUMENT_UPDATED', html: document.documentElement.outerHTML }, '*');
         }
       }
       if (e.data.type === 'ACTION_SELECT_PARENT') {
         const el = document.querySelector('[data-ai-id="' + e.data.id + '"]');
         if (el && el.parentElement && el.parentElement.tagName !== 'HTML') {
            unhighlight(el);
            el.parentElement.click();
         }
       }
       if (e.data.type === 'DESELECT') {
          unhighlight(currentSelected);
          currentSelected = null;
       }
    });
  </script>
`;
