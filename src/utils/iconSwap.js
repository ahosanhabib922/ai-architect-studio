/**
 * iconSwap.js — Client-side icon pack switcher
 * Replaces icon elements across HTML files with Iconify equivalents.
 * Zero AI tokens, zero API calls — pure regex + lookup table.
 */

const ICONIFY_CDN = '<script src="https://cdn.jsdelivr.net/npm/iconify-icon@3.0.0/dist/iconify-icon.min.js"></script>';

// ─── Semantic Icon Map ─────────────────────────────────────────────────────
// Format: 'semantic-key': { packPrefix: 'icon-name-in-that-pack' }
// If a pack is NOT listed, the semantic key itself is used as fallback.
const ICON_MAP = {
  // Navigation
  'home':            { mdi:'home', bi:'house', ph:'house', ri:'home-line', 'material-symbols':'home', carbon:'home', 'fa6-solid':'home' },
  'menu':            { mdi:'menu', bi:'list', ph:'list', ri:'menu-line', carbon:'menu', 'fa6-solid':'bars', 'material-symbols':'menu' },
  'close':           { mdi:'close', bi:'x-lg', ph:'x', ri:'close-line', 'material-symbols':'close', carbon:'close', 'fa6-solid':'xmark' },
  'arrow-right':     { mdi:'arrow-right', bi:'arrow-right', ph:'arrow-right', ri:'arrow-right-line', 'fa6-solid':'arrow-right' },
  'arrow-left':      { mdi:'arrow-left', bi:'arrow-left', ph:'arrow-left', ri:'arrow-left-line', 'fa6-solid':'arrow-left' },
  'arrow-up':        { mdi:'arrow-up', bi:'arrow-up', ph:'arrow-up', ri:'arrow-up-line', 'fa6-solid':'arrow-up' },
  'arrow-down':      { mdi:'arrow-down', bi:'arrow-down', ph:'arrow-down', ri:'arrow-down-line', 'fa6-solid':'arrow-down' },
  'chevron-right':   { mdi:'chevron-right', bi:'chevron-right', ph:'caret-right', ri:'arrow-right-s-line', 'fa6-solid':'chevron-right' },
  'chevron-left':    { mdi:'chevron-left', bi:'chevron-left', ph:'caret-left', ri:'arrow-left-s-line', 'fa6-solid':'chevron-left' },
  'chevron-up':      { mdi:'chevron-up', bi:'chevron-up', ph:'caret-up', ri:'arrow-up-s-line', 'fa6-solid':'chevron-up' },
  'chevron-down':    { mdi:'chevron-down', bi:'chevron-down', ph:'caret-down', ri:'arrow-down-s-line', 'fa6-solid':'chevron-down' },
  'external-link':   { mdi:'open-in-new', bi:'box-arrow-up-right', ph:'arrow-square-out', ri:'external-link-line', 'fa6-solid':'arrow-up-right-from-square', 'material-symbols':'open-in-new' },

  // Actions
  'search':          { mdi:'magnify', bi:'search', ph:'magnifying-glass', ri:'search-line', 'material-symbols':'search', carbon:'search', 'fa6-solid':'magnifying-glass' },
  'filter':          { mdi:'filter', bi:'funnel', ph:'funnel', ri:'filter-line', carbon:'filter', 'fa6-solid':'filter' },
  'sort':            { mdi:'sort', bi:'sort-down', ph:'sort-descending', ri:'sort-desc', 'fa6-solid':'sort' },
  'refresh':         { mdi:'refresh', bi:'arrow-clockwise', ph:'arrow-clockwise', ri:'refresh-line', 'fa6-solid':'rotate-right', 'material-symbols':'refresh' },
  'settings':        { mdi:'cog', bi:'gear', ph:'gear', ri:'settings-3-line', 'material-symbols':'settings', carbon:'settings', solar:'settings-bold', 'fa6-solid':'gear' },
  'edit':            { mdi:'pencil', bi:'pencil', ph:'pencil-simple', ri:'edit-line', 'material-symbols':'edit', carbon:'edit', 'fa6-solid':'pencil' },
  'pencil':          { mdi:'pencil', bi:'pencil', ph:'pencil-simple', ri:'edit-line', 'material-symbols':'edit', 'fa6-solid':'pencil' },
  'trash':           { mdi:'trash-can', bi:'trash3', ph:'trash', ri:'delete-bin-line', 'material-symbols':'delete', carbon:'trash-can', 'fa6-solid':'trash' },
  'delete':          { mdi:'trash-can', bi:'trash3', ph:'trash', ri:'delete-bin-line', 'material-symbols':'delete', 'fa6-solid':'trash' },
  'copy':            { mdi:'content-copy', bi:'clipboard', ph:'copy', ri:'file-copy-line', 'material-symbols':'content-copy', carbon:'copy', 'fa6-solid':'copy' },
  'download':        { mdi:'download', bi:'download', ph:'download-simple', ri:'download-line', 'material-symbols':'download', carbon:'download' },
  'upload':          { mdi:'upload', bi:'upload', ph:'upload-simple', ri:'upload-line', 'material-symbols':'upload', carbon:'upload' },
  'share':           { mdi:'share-variant', bi:'share', ph:'share-network', ri:'share-line', 'material-symbols':'share', carbon:'share' },
  'link':            { mdi:'link', bi:'link-45deg', ph:'link', ri:'link', 'material-symbols':'link', carbon:'link', 'fa6-solid':'link' },
  'plus':            { mdi:'plus', bi:'plus-lg', ph:'plus', ri:'add-line', 'material-symbols':'add', carbon:'add', 'fa6-solid':'plus' },
  'add':             { mdi:'plus', bi:'plus-lg', ph:'plus', ri:'add-line', 'material-symbols':'add', 'fa6-solid':'plus' },
  'minus':           { mdi:'minus', bi:'dash-lg', ph:'minus', ri:'subtract-line', 'material-symbols':'remove', carbon:'subtract', 'fa6-solid':'minus' },
  'check':           { mdi:'check', bi:'check-lg', ph:'check', ri:'check-line', 'material-symbols':'check', carbon:'checkmark', 'fa6-solid':'check' },
  'x':               { mdi:'close', bi:'x-lg', ph:'x', ri:'close-line', 'material-symbols':'close', 'fa6-solid':'xmark' },
  'more':            { mdi:'dots-horizontal', bi:'three-dots', ph:'dots-three', ri:'more-fill', 'material-symbols':'more-horiz', 'fa6-solid':'ellipsis' },
  'more-vertical':   { mdi:'dots-vertical', bi:'three-dots-vertical', ph:'dots-three-vertical', ri:'more-2-fill', 'material-symbols':'more-vert', 'fa6-solid':'ellipsis-vertical' },
  'ellipsis':        { mdi:'dots-horizontal', bi:'three-dots', ph:'dots-three', ri:'more-fill', 'material-symbols':'more-horiz', 'fa6-solid':'ellipsis' },
  'send':            { mdi:'send', bi:'send', ph:'paper-plane-tilt', ri:'send-plane-line', 'material-symbols':'send', carbon:'send-alt', 'fa6-solid':'paper-plane' },
  'save':            { mdi:'content-save', bi:'save', ph:'floppy-disk', ri:'save-line', 'material-symbols':'save', carbon:'save', 'fa6-solid':'floppy-disk' },
  'print':           { mdi:'printer', bi:'printer', ph:'printer', ri:'printer-line', 'material-symbols':'print', carbon:'printer', 'fa6-solid':'print' },

  // Content & Media
  'image':           { mdi:'image', bi:'image', ph:'image', ri:'image-line', 'material-symbols':'image', carbon:'image', 'fa6-solid':'image' },
  'video':           { mdi:'video', bi:'camera-video', ph:'video-camera', ri:'video-line', 'material-symbols':'videocam', 'fa6-solid':'video' },
  'music':           { mdi:'music', bi:'music-note', ph:'music-note', ri:'music-line', 'material-symbols':'music-note', 'fa6-solid':'music' },
  'play':            { mdi:'play', bi:'play', ph:'play', ri:'play-line', 'material-symbols':'play-arrow', 'fa6-solid':'play' },
  'pause':           { mdi:'pause', bi:'pause', ph:'pause', ri:'pause-line', 'material-symbols':'pause', 'fa6-solid':'pause' },
  'stop':            { mdi:'stop', bi:'stop', ph:'stop', ri:'stop-line', 'material-symbols':'stop', 'fa6-solid':'stop' },
  'volume':          { mdi:'volume-high', bi:'volume-up', ph:'speaker-high', ri:'volume-up-line', 'material-symbols':'volume-up', 'fa6-solid':'volume-high' },
  'mute':            { mdi:'volume-off', bi:'volume-mute', ph:'speaker-slash', ri:'volume-mute-line', 'material-symbols':'volume-off', 'fa6-solid':'volume-xmark' },
  'headphones':      { mdi:'headphones', bi:'headphones', ph:'headphones', ri:'headphone-line', 'material-symbols':'headphones', 'fa6-solid':'headphones' },
  'mic':             { mdi:'microphone', bi:'mic', ph:'microphone', ri:'mic-line', 'material-symbols':'mic', carbon:'microphone', 'fa6-solid':'microphone' },
  'camera':          { mdi:'camera', bi:'camera', ph:'camera', ri:'camera-line', 'material-symbols':'photo-camera', carbon:'camera', 'fa6-solid':'camera' },

  // Files & Folders
  'file':            { mdi:'file', bi:'file-earmark', ph:'file', ri:'file-line', 'material-symbols':'description', carbon:'document', 'fa6-solid':'file' },
  'folder':          { mdi:'folder', bi:'folder', ph:'folder', ri:'folder-line', 'material-symbols':'folder', carbon:'folder', 'fa6-solid':'folder' },
  'document':        { mdi:'file-document', bi:'file-text', ph:'file-text', ri:'file-text-line', 'material-symbols':'article', carbon:'document', 'fa6-solid':'file-lines' },
  'pdf':             { mdi:'file-pdf-box', bi:'file-earmark-pdf', ph:'file-pdf', ri:'file-pdf-line', 'material-symbols':'picture-as-pdf', 'fa6-solid':'file-pdf' },

  // Time & Location
  'calendar':        { mdi:'calendar', bi:'calendar', ph:'calendar', ri:'calendar-line', 'material-symbols':'calendar-today', carbon:'calendar', 'fa6-solid':'calendar' },
  'clock':           { mdi:'clock', bi:'clock', ph:'clock', ri:'time-line', 'material-symbols':'schedule', carbon:'time', 'fa6-solid':'clock' },
  'time':            { mdi:'clock', bi:'clock', ph:'clock', ri:'time-line', 'material-symbols':'schedule', 'fa6-solid':'clock' },
  'location':        { mdi:'map-marker', bi:'geo-alt', ph:'map-pin', ri:'map-pin-line', 'material-symbols':'location-on', carbon:'location', 'fa6-solid':'location-dot' },
  'map-pin':         { mdi:'map-marker', bi:'geo-alt', ph:'map-pin', ri:'map-pin-line', 'material-symbols':'location-on', 'fa6-solid':'location-dot' },
  'map':             { mdi:'map', bi:'map', ph:'map', ri:'map-2-line', 'material-symbols':'map', carbon:'map', 'fa6-solid':'map' },

  // Communication
  'phone':           { mdi:'phone', bi:'telephone', ph:'phone', ri:'phone-line', 'material-symbols':'call', carbon:'phone', 'fa6-solid':'phone' },
  'mail':            { mdi:'email', bi:'envelope', ph:'envelope', ri:'mail-line', 'material-symbols':'mail', carbon:'email', 'fa6-solid':'envelope' },
  'email':           { mdi:'email', bi:'envelope', ph:'envelope', ri:'mail-line', 'material-symbols':'mail', 'fa6-solid':'envelope' },
  'envelope':        { mdi:'email', bi:'envelope', ph:'envelope', ri:'mail-line', 'material-symbols':'mail', 'fa6-solid':'envelope' },
  'chat':            { mdi:'chat', bi:'chat', ph:'chat-circle', ri:'chat-1-line', 'material-symbols':'chat', carbon:'chat', 'fa6-solid':'comment' },
  'message':         { mdi:'message', bi:'chat', ph:'chat-circle', ri:'message-line', 'material-symbols':'message', carbon:'message', 'fa6-solid':'message' },
  'comment':         { mdi:'comment', bi:'chat', ph:'chat-circle', ri:'chat-1-line', 'material-symbols':'chat-bubble', 'fa6-solid':'comment' },

  // Notifications & Status
  'bell':            { mdi:'bell', bi:'bell', ph:'bell', ri:'notification-2-line', 'material-symbols':'notifications', carbon:'notification', 'fa6-solid':'bell' },
  'notification':    { mdi:'bell', bi:'bell', ph:'bell', ri:'notification-2-line', 'material-symbols':'notifications', 'fa6-solid':'bell' },
  'warning':         { mdi:'alert', bi:'exclamation-triangle', ph:'warning', ri:'error-warning-line', 'material-symbols':'warning', carbon:'warning', 'fa6-solid':'triangle-exclamation' },
  'alert':           { mdi:'alert', bi:'exclamation-triangle', ph:'warning', ri:'error-warning-line', 'material-symbols':'warning', 'fa6-solid':'triangle-exclamation' },
  'info':            { mdi:'information', bi:'info-circle', ph:'info', ri:'information-line', 'material-symbols':'info', carbon:'information', 'fa6-solid':'circle-info' },
  'error':           { mdi:'alert-circle', bi:'x-circle', ph:'x-circle', ri:'close-circle-line', 'material-symbols':'error', carbon:'error', 'fa6-solid':'circle-xmark' },
  'success':         { mdi:'check-circle', bi:'check-circle', ph:'check-circle', ri:'checkbox-circle-line', 'material-symbols':'check-circle', carbon:'checkmark-filled', 'fa6-solid':'circle-check' },
  'question':        { mdi:'help-circle', bi:'question-circle', ph:'question', ri:'question-line', 'material-symbols':'help', carbon:'help', 'fa6-solid':'circle-question' },
  'help':            { mdi:'help-circle', bi:'question-circle', ph:'question', ri:'question-line', 'material-symbols':'help', 'fa6-solid':'circle-question' },
  'check-circle':    { mdi:'check-circle', bi:'check-circle', ph:'check-circle', ri:'checkbox-circle-line', 'material-symbols':'check-circle', 'fa6-solid':'circle-check' },
  'x-circle':        { mdi:'close-circle', bi:'x-circle', ph:'x-circle', ri:'close-circle-line', 'material-symbols':'cancel', 'fa6-solid':'circle-xmark' },
  'plus-circle':     { mdi:'plus-circle', bi:'plus-circle', ph:'plus-circle', ri:'add-circle-line', 'material-symbols':'add-circle', 'fa6-solid':'circle-plus' },

  // User & Auth
  'user':            { mdi:'account', bi:'person', ph:'user', ri:'user-line', 'material-symbols':'person', carbon:'user', solar:'user-bold', 'fa6-solid':'user' },
  'users':           { mdi:'account-group', bi:'people', ph:'users', ri:'group-line', 'material-symbols':'group', carbon:'group', 'fa6-solid':'users' },
  'person':          { mdi:'account', bi:'person', ph:'user', ri:'user-line', 'material-symbols':'person', 'fa6-solid':'user' },
  'lock':            { mdi:'lock', bi:'lock', ph:'lock', ri:'lock-line', 'material-symbols':'lock', carbon:'locked', 'fa6-solid':'lock' },
  'unlock':          { mdi:'lock-open', bi:'unlock', ph:'lock-open', ri:'lock-unlock-line', 'material-symbols':'lock-open', 'fa6-solid':'lock-open' },
  'key':             { mdi:'key', bi:'key', ph:'key', ri:'key-line', 'material-symbols':'key', carbon:'password', 'fa6-solid':'key' },
  'eye':             { mdi:'eye', bi:'eye', ph:'eye', ri:'eye-line', 'material-symbols':'visibility', carbon:'view', 'fa6-solid':'eye' },
  'eye-off':         { mdi:'eye-off', bi:'eye-slash', ph:'eye-slash', ri:'eye-off-line', 'material-symbols':'visibility-off', 'fa6-solid':'eye-slash' },
  'eye-slash':       { mdi:'eye-off', bi:'eye-slash', ph:'eye-slash', ri:'eye-off-line', 'material-symbols':'visibility-off', 'fa6-solid':'eye-slash' },
  'shield':          { mdi:'shield', bi:'shield', ph:'shield', ri:'shield-line', 'material-symbols':'shield', carbon:'security', 'fa6-solid':'shield' },
  'fingerprint':     { mdi:'fingerprint', bi:'fingerprint', ph:'fingerprint', ri:'fingerprint-line', 'material-symbols':'fingerprint', 'fa6-solid':'fingerprint' },

  // E-commerce
  'cart':            { mdi:'cart', bi:'cart', ph:'shopping-cart', ri:'shopping-cart-line', 'material-symbols':'shopping-cart', carbon:'shopping-cart', 'fa6-solid':'cart-shopping' },
  'shopping-cart':   { mdi:'cart', bi:'cart', ph:'shopping-cart', ri:'shopping-cart-line', 'material-symbols':'shopping-cart', 'fa6-solid':'cart-shopping' },
  'bag':             { mdi:'shopping', bi:'bag', ph:'shopping-bag', ri:'shopping-bag-line', 'material-symbols':'shopping-bag', 'fa6-solid':'bag-shopping' },
  'credit-card':     { mdi:'credit-card', bi:'credit-card', ph:'credit-card', ri:'bank-card-line', 'material-symbols':'credit-card', carbon:'purchase', 'fa6-solid':'credit-card' },
  'package':         { mdi:'package-variant', bi:'box', ph:'package', ri:'box-3-line', 'material-symbols':'inventory-2', carbon:'package', 'fa6-solid':'box' },
  'truck':           { mdi:'truck', bi:'truck', ph:'truck', ri:'truck-line', 'material-symbols':'local-shipping', carbon:'delivery', 'fa6-solid':'truck' },
  'store':           { mdi:'store', bi:'shop', ph:'storefront', ri:'store-2-line', 'material-symbols':'storefront', carbon:'store', 'fa6-solid':'store' },
  'tag':             { mdi:'tag', bi:'tag', ph:'tag', ri:'price-tag-3-line', 'material-symbols':'label', carbon:'tag', 'fa6-solid':'tag' },

  // Social
  'github':          { mdi:'github', bi:'github', ph:'github-logo', ri:'github-line', carbon:'logo-github', 'fa6-solid':'github' },
  'twitter':         { mdi:'twitter', bi:'twitter-x', ph:'x-logo', ri:'twitter-x-line', 'fa6-solid':'x-twitter' },
  'facebook':        { mdi:'facebook', bi:'facebook', ph:'facebook-logo', ri:'facebook-line', 'fa6-solid':'facebook' },
  'instagram':       { mdi:'instagram', bi:'instagram', ph:'instagram-logo', ri:'instagram-line', 'fa6-solid':'instagram' },
  'linkedin':        { mdi:'linkedin', bi:'linkedin', ph:'linkedin-logo', ri:'linkedin-line', 'fa6-solid':'linkedin' },
  'youtube':         { mdi:'youtube', bi:'youtube', ph:'youtube-logo', ri:'youtube-line', 'fa6-solid':'youtube' },
  'discord':         { mdi:'discord', bi:'discord', ph:'discord-logo', ri:'discord-line', 'fa6-solid':'discord' },

  // Reactions
  'star':            { mdi:'star', bi:'star', ph:'star', ri:'star-line', 'material-symbols':'star', carbon:'star', 'fa6-solid':'star' },
  'heart':           { mdi:'heart', bi:'heart', ph:'heart', ri:'heart-line', 'material-symbols':'favorite', carbon:'favorite', 'fa6-solid':'heart' },
  'like':            { mdi:'thumb-up', bi:'hand-thumbs-up', ph:'thumbs-up', ri:'thumb-up-line', 'material-symbols':'thumb-up', 'fa6-solid':'thumbs-up' },
  'thumbs-up':       { mdi:'thumb-up', bi:'hand-thumbs-up', ph:'thumbs-up', ri:'thumb-up-line', 'material-symbols':'thumb-up', 'fa6-solid':'thumbs-up' },
  'thumbs-down':     { mdi:'thumb-down', bi:'hand-thumbs-down', ph:'thumbs-down', ri:'thumb-down-line', 'material-symbols':'thumb-down', 'fa6-solid':'thumbs-down' },
  'bookmark':        { mdi:'bookmark', bi:'bookmark', ph:'bookmark', ri:'bookmark-line', 'material-symbols':'bookmark', carbon:'bookmark', 'fa6-solid':'bookmark' },

  // UI Layout
  'grid':            { mdi:'grid', bi:'grid', ph:'grid-four', ri:'grid-line', 'material-symbols':'grid-view', carbon:'grid', 'fa6-solid':'table-cells' },
  'list-ul':         { mdi:'format-list-bulleted', bi:'list-ul', ph:'list', ri:'list-unordered', 'material-symbols':'format-list-bulleted', 'fa6-solid':'list' },
  'list':            { mdi:'format-list-bulleted', bi:'list-ul', ph:'list', ri:'list-unordered', 'material-symbols':'format-list-bulleted', 'fa6-solid':'list' },
  'table':           { mdi:'table', bi:'table', ph:'table', ri:'table-line', 'material-symbols':'table-chart', carbon:'table', 'fa6-solid':'table' },
  'layout':          { mdi:'view-dashboard-outline', bi:'layout-text-window', ph:'layout', ri:'layout-line', 'material-symbols':'dashboard-customize', 'fa6-solid':'table-cells-large' },
  'sidebar':         { mdi:'view-quilt', bi:'layout-sidebar', ph:'sidebar', ri:'layout-left-line', 'material-symbols':'view-sidebar', 'fa6-solid':'table-columns' },
  'maximize':        { mdi:'fullscreen', bi:'fullscreen', ph:'arrows-out', ri:'fullscreen-line', 'material-symbols':'fullscreen', 'fa6-solid':'expand' },
  'minimize':        { mdi:'fullscreen-exit', bi:'fullscreen-exit', ph:'arrows-in', ri:'fullscreen-exit-line', 'material-symbols':'fullscreen-exit', 'fa6-solid':'compress' },
  'expand':          { mdi:'fullscreen', bi:'fullscreen', ph:'arrows-out', ri:'fullscreen-line', 'material-symbols':'fullscreen', 'fa6-solid':'expand' },
  'compress':        { mdi:'fullscreen-exit', bi:'fullscreen-exit', ph:'arrows-in', ri:'fullscreen-exit-line', 'fa6-solid':'compress' },
  'columns':         { mdi:'view-column', bi:'layout-three-columns', ph:'columns', ri:'layout-column-line', 'material-symbols':'view-column', 'fa6-solid':'columns' },

  // Theme
  'moon':            { mdi:'weather-night', bi:'moon', ph:'moon', ri:'moon-line', 'material-symbols':'dark-mode', carbon:'moon', 'fa6-solid':'moon' },
  'sun':             { mdi:'white-balance-sunny', bi:'sun', ph:'sun', ri:'sun-line', 'material-symbols':'light-mode', carbon:'sun', 'fa6-solid':'sun' },
  'palette':         { mdi:'palette', bi:'palette', ph:'palette', ri:'palette-line', 'material-symbols':'palette', carbon:'color-palette', 'fa6-solid':'palette' },
  'color':           { mdi:'palette', bi:'palette', ph:'palette', ri:'palette-line', 'material-symbols':'palette', 'fa6-solid':'palette' },
  'font':            { mdi:'format-font', bi:'fonts', ph:'text-aa', ri:'font-size', 'material-symbols':'text-fields', 'fa6-solid':'font' },
  'text':            { mdi:'format-text', bi:'type', ph:'text-aa', ri:'text', 'material-symbols':'title', 'fa6-solid':'font' },

  // Tech & Dev
  'code':            { mdi:'code-tags', bi:'code-slash', ph:'code', ri:'code-line', 'material-symbols':'code', carbon:'code', 'fa6-solid':'code' },
  'terminal':        { mdi:'console', bi:'terminal', ph:'terminal-window', ri:'terminal-box-line', 'material-symbols':'terminal', carbon:'terminal', 'fa6-solid':'terminal' },
  'globe':           { mdi:'earth', bi:'globe', ph:'globe', ri:'global-line', 'material-symbols':'language', carbon:'earth', 'fa6-solid':'globe' },
  'wifi':            { mdi:'wifi', bi:'wifi', ph:'wifi-high', ri:'wifi-line', 'material-symbols':'wifi', carbon:'wifi', 'fa6-solid':'wifi' },
  'bluetooth':       { mdi:'bluetooth', bi:'bluetooth', ph:'bluetooth', ri:'bluetooth-line', 'material-symbols':'bluetooth', 'fa6-solid':'bluetooth' },
  'battery':         { mdi:'battery', bi:'battery-half', ph:'battery-half', ri:'battery-line', 'material-symbols':'battery-std', 'fa6-solid':'battery-half' },
  'database':        { mdi:'database', bi:'database', ph:'database', ri:'database-line', 'material-symbols':'storage', carbon:'data-base', 'fa6-solid':'database' },
  'server':          { mdi:'server', bi:'server', ph:'hard-drives', ri:'server-line', 'material-symbols':'dns', carbon:'server', 'fa6-solid':'server' },
  'cloud':           { mdi:'cloud', bi:'cloud', ph:'cloud', ri:'cloud-line', 'material-symbols':'cloud', carbon:'cloud', 'fa6-solid':'cloud' },
  'api':             { mdi:'api', bi:'braces', ph:'code', ri:'code-s-slash-line', 'material-symbols':'api', carbon:'api', 'fa6-solid':'code' },
  'layers':          { mdi:'layers', bi:'layers', ph:'stack', ri:'stack-line', 'material-symbols':'layers', carbon:'layers', 'fa6-solid':'layer-group' },
  'box':             { mdi:'cube-outline', bi:'box', ph:'cube', ri:'box-3-line', 'material-symbols':'deployed-code', carbon:'cube', 'fa6-solid':'cube' },
  'cube':            { mdi:'cube-outline', bi:'box', ph:'cube', ri:'box-3-line', 'material-symbols':'deployed-code', 'fa6-solid':'cube' },

  // Analytics
  'chart':           { mdi:'chart-bar', bi:'bar-chart', ph:'chart-bar', ri:'bar-chart-2-line', 'material-symbols':'bar-chart', carbon:'chart-bar', 'fa6-solid':'chart-bar' },
  'bar-chart':       { mdi:'chart-bar', bi:'bar-chart', ph:'chart-bar', ri:'bar-chart-2-line', 'material-symbols':'bar-chart', 'fa6-solid':'chart-bar' },
  'chart-line':      { mdi:'chart-line', bi:'graph-up', ph:'chart-line', ri:'line-chart-line', 'material-symbols':'show-chart', carbon:'chart-line', 'fa6-solid':'chart-line' },
  'pie-chart':       { mdi:'chart-pie', bi:'pie-chart', ph:'chart-pie-slice', ri:'pie-chart-line', 'material-symbols':'pie-chart', carbon:'chart-pie', 'fa6-solid':'chart-pie' },
  'dashboard':       { mdi:'view-dashboard', bi:'speedometer2', ph:'squares-four', ri:'dashboard-line', 'material-symbols':'dashboard', carbon:'dashboard', 'fa6-solid':'gauge' },
  'trending-up':     { mdi:'trending-up', bi:'graph-up-arrow', ph:'trend-up', ri:'arrow-right-up-line', 'material-symbols':'trending-up', 'fa6-solid':'arrow-trend-up' },

  // Misc
  'sparkles':        { mdi:'auto-fix', bi:'stars', ph:'sparkle', ri:'sparkling-line', 'material-symbols':'auto-awesome', 'fa6-solid':'wand-magic-sparkles' },
  'zap':             { mdi:'lightning-bolt', bi:'lightning', ph:'lightning', ri:'flashlight-line', 'material-symbols':'bolt', carbon:'flash', 'fa6-solid':'bolt' },
  'bolt':            { mdi:'lightning-bolt', bi:'lightning', ph:'lightning', ri:'flashlight-line', 'material-symbols':'bolt', 'fa6-solid':'bolt' },
  'rocket':          { mdi:'rocket', bi:'rocket', ph:'rocket', ri:'rocket-line', 'material-symbols':'rocket-launch', carbon:'rocket', 'fa6-solid':'rocket' },
  'magic':           { mdi:'magic-staff', bi:'magic', ph:'magic-wand', ri:'magic-line', 'material-symbols':'auto-fix-high', 'fa6-solid':'wand-magic-sparkles' },
  'tool':            { mdi:'tools', bi:'tools', ph:'wrench', ri:'tools-line', 'material-symbols':'build', carbon:'tools', 'fa6-solid':'wrench' },
  'award':           { mdi:'trophy', bi:'trophy', ph:'trophy', ri:'trophy-line', 'material-symbols':'emoji-events', carbon:'trophy', 'fa6-solid':'trophy' },
  'trophy':          { mdi:'trophy', bi:'trophy', ph:'trophy', ri:'trophy-line', 'material-symbols':'emoji-events', 'fa6-solid':'trophy' },
  'ai':              { mdi:'robot', bi:'robot', ph:'robot', ri:'robot-line', 'material-symbols':'smart-toy', carbon:'ai', 'fa6-solid':'robot' },
  'robot':           { mdi:'robot', bi:'robot', ph:'robot', ri:'robot-line', 'material-symbols':'smart-toy', 'fa6-solid':'robot' },
  'atom':            { mdi:'atom', bi:'diagram-3', ph:'atom', ri:'reactor-line', 'material-symbols':'science', carbon:'chemistry', 'fa6-solid':'atom' },
};

// ─── Reverse lookup: 'pack:iconName' → semanticKey ─────────────────────────
const REVERSE_MAP = {};
for (const [semantic, packs] of Object.entries(ICON_MAP)) {
  for (const [pack, name] of Object.entries(packs)) {
    const key = `${pack}:${name}`;
    if (!REVERSE_MAP[key]) REVERSE_MAP[key] = semantic;
  }
  // The semantic key itself is a direct lookup for packs that use the same name
  REVERSE_MAP[`lucide:${semantic}`] = REVERSE_MAP[`lucide:${semantic}`] || semantic;
  REVERSE_MAP[`heroicons:${semantic}`] = REVERSE_MAP[`heroicons:${semantic}`] || semantic;
  REVERSE_MAP[`tabler:${semantic}`] = REVERSE_MAP[`tabler:${semantic}`] || semantic;
}

function semanticFromName(iconName, sourcePack) {
  const direct = REVERSE_MAP[`${sourcePack}:${iconName}`];
  if (direct) return direct;
  if (ICON_MAP[iconName]) return iconName; // semantic name matches directly
  return iconName; // best-effort fallback
}

function targetName(semantic, targetPack) {
  const entry = ICON_MAP[semantic];
  if (entry && entry[targetPack]) return entry[targetPack];
  return semantic; // many packs use the same names — this works surprisingly often
}

// ─── CDN Patterns to remove ────────────────────────────────────────────────
const OLD_CDN_PATTERNS = [
  // Font Awesome
  /<link[^>]*(?:font-awesome|fontawesome)[^>]*\/?>/gi,
  /<script[^>]*(?:font-awesome|fontawesome)[^>]*><\/script>/gi,
  // Bootstrap Icons
  /<link[^>]*bootstrap-icons[^>]*\/?>/gi,
  // Material Icons / Symbols
  /<link[^>]*(?:material-icons|material-symbols)[^>]*\/?>/gi,
  // Boxicons
  /<link[^>]*boxicons[^>]*\/?>/gi,
  /<script[^>]*boxicons[^>]*><\/script>/gi,
  // Remix Icon
  /<link[^>]*remixicon[^>]*\/?>/gi,
  // Phosphor
  /<script[^>]*phosphor[^>]*><\/script>/gi,
  // Tabler
  /<link[^>]*tabler[^>]*icons[^>]*\/?>/gi,
  // Lucide CDN + inline createIcons call
  /<script[^>]*lucide[^>]*><\/script>/gi,
  /<script[^>]*>\s*lucide\.createIcons\(\)[;]?\s*<\/script>/gi,
  /<script[^>]*>\s*(?:window\.onload\s*=\s*(?:function\s*)?\(\)\s*=>?\s*\{?)?\s*lucide\.createIcons\(\)[;]?\s*\}?\s*<\/script>/gi,
  // Feather Icons
  /<script[^>]*feather[^>]*><\/script>/gi,
  /<script[^>]*>\s*feather\.replace\(\)[;]?\s*<\/script>/gi,
  // Ionicons
  /<script[^>]*ionicons[^>]*><\/script>/gi,
];

function updateCDNLinks(html) {
  let result = html;
  OLD_CDN_PATTERNS.forEach(p => { result = result.replace(p, ''); });
  // Add Iconify CDN if not already present — check for the script URL, NOT the element tag
  if (!result.includes('iconify-icon.min.js') && !result.includes('iconify-icon@')) {
    result = result.replace(/<\/head>/i, `  ${ICONIFY_CDN}\n</head>`);
  }
  return result;
}

// ─── Style preservation helpers ─────────────────────────────────────────────
function extractAttrs(raw) {
  const style = raw.match(/\bstyle="([^"]*)"/)?.[1] || '';
  const classMatch = raw.match(/\bclass="([^"]*)"/)?.[1] || '';
  // Extract Tailwind size/color classes only (not fa-* or bi-* etc.)
  const keepClasses = classMatch
    .split(/\s+/)
    .filter(c => /^(?:text-|w-|h-|p-|m-|opacity-|rotate-|scale-|shrink-|grow|flex|inline|block|hidden|ml-|mr-|mt-|mb-|fill-|stroke-|size-)/.test(c))
    .join(' ');
  return { style, keepClasses };
}

function buildIconify(prefix, name, style, keepClasses) {
  const styleAttr = style ? ` style="${style}"` : '';
  const classAttr = keepClasses ? ` class="${keepClasses}"` : '';
  return `<iconify-icon icon="${prefix}:${name}"${classAttr}${styleAttr}></iconify-icon>`;
}

// ─── Main swap function ─────────────────────────────────────────────────────
export function swapIconPack(html, targetPrefix) {
  let result = html;
  let count = 0;

  // 1. Existing Iconify icons — just change the prefix
  result = result.replace(
    /<iconify-icon([^>]*)\bicon="([\w-]+):([\w-]+)"([^>]*)><\/iconify-icon>/g,
    (match, pre, srcPrefix, iconName, post) => {
      if (srcPrefix === targetPrefix) return match;
      const semantic = semanticFromName(iconName, srcPrefix);
      const newName = targetName(semantic, targetPrefix);
      count++;
      return `<iconify-icon${pre} icon="${targetPrefix}:${newName}"${post}></iconify-icon>`;
    }
  );

  // 2. Font Awesome (fas/far/fal/fab/fa-solid/fa-regular/fa-brands + fa-ICON)
  result = result.replace(
    /<i([^>]*)\bclass="([^"]*)\b(?:fas|far|fal|fab|fa-solid|fa-regular|fa-light|fa-brands|fa-thin|fa-duotone)\b([^"]*)"([^>]*)(?:\s*\/?>(?:<\/i>)?|><\/i>)/g,
    (match, p1, cls1, cls2, p2) => {
      const allCls = cls1 + ' ' + cls2;
      const iconMatch = allCls.match(/\bfa-([\w-]+)\b/);
      if (!iconMatch) return match;
      // Normalize: "times" → "close", "bars" → "menu" etc.
      const rawName = normalizeFAName(iconMatch[1]);
      const semantic = semanticFromName(rawName, 'fa6-solid');
      const newName = targetName(semantic, targetPrefix);
      const { style, keepClasses } = extractAttrs(match);
      count++;
      return buildIconify(targetPrefix, newName, style, keepClasses);
    }
  );

  // 3. Font Awesome 6 new syntax: <i class="fa-solid fa-home">
  result = result.replace(
    /<i([^>]*)\bclass="([^"]*)\bfa-([\w-]+)\b([^"]*)"([^>]*)(?:\s*\/?>(?:<\/i>)?|><\/i>)/g,
    (match, p1, cls1, iconName, cls2, p2) => {
      // Only if it looks like an icon class (not fa-solid, fa-regular etc.)
      if (/^(solid|regular|light|thin|duotone|brands)$/.test(iconName)) return match;
      const rawName = normalizeFAName(iconName);
      const semantic = semanticFromName(rawName, 'fa6-solid');
      const newName = targetName(semantic, targetPrefix);
      const { style, keepClasses } = extractAttrs(match);
      count++;
      return buildIconify(targetPrefix, newName, style, keepClasses);
    }
  );

  // 4. Material Icons / Material Symbols
  result = result.replace(
    /<(?:span|i)([^>]*)\bclass="([^"]*)\b(?:material-icons(?:-outlined|-round|-sharp|-two-tone)?|material-symbols(?:-outlined|-rounded|-sharp)?)\b([^"]*)"([^>]*)>([\w\s]+)<\/(?:span|i)>/g,
    (match, p1, cls1, cls2, p2, content) => {
      const iconName = content.trim().toLowerCase().replace(/[\s_]+/g, '-');
      const semantic = semanticFromName(iconName, 'material-symbols');
      const newName = targetName(semantic, targetPrefix);
      const { style, keepClasses } = extractAttrs(match);
      count++;
      return buildIconify(targetPrefix, newName, style, keepClasses);
    }
  );

  // 5. Bootstrap Icons: <i class="bi bi-house">
  result = result.replace(
    /<i([^>]*)\bclass="([^"]*)\bbi\s+bi-([\w-]+)\b([^"]*)"([^>]*)(?:\s*\/?>(?:<\/i>)?|><\/i>)/g,
    (match, p1, cls1, iconName, cls2, p2) => {
      const semantic = semanticFromName(iconName, 'bi');
      const newName = targetName(semantic, targetPrefix);
      const { style, keepClasses } = extractAttrs(match);
      count++;
      return buildIconify(targetPrefix, newName, style, keepClasses);
    }
  );

  // 6. Tabler Icons: <i class="ti ti-home">
  result = result.replace(
    /<i([^>]*)\bclass="([^"]*)\bti\s+ti-([\w-]+)\b([^"]*)"([^>]*)(?:\s*\/?>(?:<\/i>)?|><\/i>)/g,
    (match, p1, cls1, iconName, cls2, p2) => {
      const semantic = semanticFromName(iconName, 'tabler');
      const newName = targetName(semantic, targetPrefix);
      const { style, keepClasses } = extractAttrs(match);
      count++;
      return buildIconify(targetPrefix, newName, style, keepClasses);
    }
  );

  // 7. Phosphor Icons: <i class="ph ph-house">
  result = result.replace(
    /<i([^>]*)\bclass="([^"]*)\bph\s+ph-([\w-]+)\b([^"]*)"([^>]*)(?:\s*\/?>(?:<\/i>)?|><\/i>)/g,
    (match, p1, cls1, iconName, cls2, p2) => {
      // Remove weight suffixes: -bold, -fill, -light, -thin, -duotone
      const normalized = iconName.replace(/-(bold|fill|light|thin|duotone|regular)$/, '');
      const semantic = semanticFromName(normalized, 'ph');
      const newName = targetName(semantic, targetPrefix);
      const { style, keepClasses } = extractAttrs(match);
      count++;
      return buildIconify(targetPrefix, newName, style, keepClasses);
    }
  );

  // 8. Remix Icons: <i class="ri ri-home-line">
  result = result.replace(
    /<i([^>]*)\bclass="([^"]*)\bri\s+ri-([\w-]+)\b([^"]*)"([^>]*)(?:\s*\/?>(?:<\/i>)?|><\/i>)/g,
    (match, p1, cls1, iconName, cls2, p2) => {
      const normalized = iconName.replace(/-(line|fill|2-fill|2-line|3-fill|3-line)$/, '');
      const semantic = semanticFromName(normalized, 'ri');
      const newName = targetName(semantic, targetPrefix);
      const { style, keepClasses } = extractAttrs(match);
      count++;
      return buildIconify(targetPrefix, newName, style, keepClasses);
    }
  );

  // 9. Boxicons: <i class="bx bx-home"> or <i class="bx bxs-home">
  result = result.replace(
    /<i([^>]*)\bclass="([^"]*)\bbxs?\s+bxs?-([\w-]+)\b([^"]*)"([^>]*)(?:\s*\/?>(?:<\/i>)?|><\/i>)/g,
    (match, p1, cls1, iconName, cls2, p2) => {
      const semantic = semanticFromName(iconName, 'bx');
      const newName = targetName(semantic, targetPrefix);
      const { style, keepClasses } = extractAttrs(match);
      count++;
      return buildIconify(targetPrefix, newName, style, keepClasses);
    }
  );

  // 10. Lucide CDN: <i data-lucide="home">
  result = result.replace(
    /<i([^>]*)\bdata-lucide="([\w-]+)"([^>]*)(?:\s*\/?>(?:<\/i>)?|><\/i>)/g,
    (match, p1, iconName, p2) => {
      const semantic = semanticFromName(iconName, 'lucide');
      const newName = targetName(semantic, targetPrefix);
      const { style, keepClasses } = extractAttrs(match);
      count++;
      return buildIconify(targetPrefix, newName, style, keepClasses);
    }
  );

  // 11. Feather Icons: <i data-feather="home">
  result = result.replace(
    /<i([^>]*)\bdata-feather="([\w-]+)"([^>]*)(?:\s*\/?>(?:<\/i>)?|><\/i>)/g,
    (match, p1, iconName, p2) => {
      const semantic = semanticFromName(iconName, 'feather');
      const newName = targetName(semantic, targetPrefix);
      const { style, keepClasses } = extractAttrs(match);
      count++;
      return buildIconify(targetPrefix, newName, style, keepClasses);
    }
  );

  // Update CDN links
  result = updateCDNLinks(result);

  return { html: result, replacedCount: count };
}

// ─── Font Awesome name normalization ────────────────────────────────────────
// Maps FA-specific names to semantic names used in ICON_MAP
const FA_NAME_MAP = {
  'times': 'close', 'times-circle': 'x-circle', 'bars': 'menu',
  'cog': 'settings', 'cogs': 'settings', 'gear': 'settings',
  'pencil-alt': 'edit', 'pen': 'edit', 'pen-to-square': 'edit',
  'trash-alt': 'trash', 'trash-can': 'trash',
  'search': 'search', 'magnifying-glass': 'search',
  'circle-xmark': 'x-circle', 'circle-check': 'check-circle',
  'circle-question': 'question', 'circle-info': 'info',
  'circle-exclamation': 'warning', 'triangle-exclamation': 'warning',
  'angle-right': 'chevron-right', 'angle-left': 'chevron-left',
  'angle-up': 'chevron-up', 'angle-down': 'chevron-down',
  'long-arrow-alt-right': 'arrow-right', 'long-arrow-alt-left': 'arrow-left',
  'arrow-alt-circle-right': 'chevron-right',
  'user-circle': 'user', 'user-alt': 'user', 'user-tie': 'user',
  'shopping-bag': 'bag', 'cart-shopping': 'cart',
  'paper-plane': 'send', 'telegram': 'send',
  'ellipsis-h': 'more', 'ellipsis-v': 'more-vertical',
  'sliders-h': 'filter', 'sliders': 'filter',
  'expand': 'maximize', 'compress': 'minimize',
  'expand-alt': 'maximize', 'compress-alt': 'minimize',
  'external-link-alt': 'external-link', 'external-link-square-alt': 'external-link',
  'file-alt': 'document', 'file-text': 'document',
  'map-marker-alt': 'location', 'map-marker': 'location',
  'location-arrow': 'location', 'location-dot': 'location',
  'thumbs-o-up': 'like', 'hand-thumbs-up': 'like',
  'comments': 'chat', 'comment-dots': 'chat',
  'bell-slash': 'notification', 'bell-o': 'bell',
  'sign-in-alt': 'arrow-right', 'sign-out-alt': 'arrow-right',
  'eye-open': 'eye', 'eye-close': 'eye-off',
  'toggle-on': 'check', 'toggle-off': 'minus',
  'spinner': 'refresh', 'sync': 'refresh', 'sync-alt': 'refresh',
  'rotate-right': 'refresh', 'redo': 'refresh',
  'clipboard-list': 'list', 'list-alt': 'list',
  'check-square': 'check', 'check-double': 'check',
  'star-o': 'star', 'star-half': 'star', 'star-half-alt': 'star',
  'heart-o': 'heart', 'heart-broken': 'heart',
  'shield-alt': 'shield', 'shield-check': 'shield',
  'lock-open': 'unlock', 'lock-alt': 'lock',
  'key-alt': 'key', 'passport': 'key',
  'mobile': 'phone', 'mobile-alt': 'phone', 'mobile-screen': 'phone',
  'laptop': 'code', 'desktop': 'code',
  'wand-magic-sparkles': 'sparkles', 'magic': 'sparkles',
  'rotate': 'refresh', 'arrows-rotate': 'refresh',
  'xmark': 'close', 'x': 'close',
  'plus': 'plus', 'minus': 'minus',
  'bars': 'menu', 'hamburger': 'menu',
};

function normalizeFAName(rawName) {
  return FA_NAME_MAP[rawName] || rawName;
}

// ─── Additional exports for multi-mode icon system ───────────────────────────

/**
 * extractIcons(html) — returns all detected icon elements
 * Returns: Array<{ match, prefix, name, semantic, library }>
 */
export function extractIcons(html) {
  const icons = [];
  const seenMatches = new Set();

  function addIcon(match, prefix, name, semantic, library) {
    if (seenMatches.has(match)) return; // deduplicate by exact match string
    seenMatches.add(match);
    icons.push({ match, prefix, name, semantic, library });
  }

  let m;

  // 1. Existing Iconify icons
  const re1 = /<iconify-icon([^>]*)\bicon="([\w-]+):([\w-]+)"([^>]*)><\/iconify-icon>/g;
  while ((m = re1.exec(html)) !== null) {
    const [match, , prefix, name] = m;
    addIcon(match, prefix, name, semanticFromName(name, prefix), 'iconify');
  }

  // 2. Font Awesome (classic)
  const re2 = /<i([^>]*)\bclass="([^"]*)\b(?:fas|far|fal|fab|fa-solid|fa-regular|fa-light|fa-brands|fa-thin|fa-duotone)\b([^"]*)"([^>]*)(?:\s*\/?>(?:<\/i>)?|><\/i>)/g;
  while ((m = re2.exec(html)) !== null) {
    const allCls = m[2] + ' ' + m[3];
    const iconMatch = allCls.match(/\bfa-([\w-]+)\b/);
    if (!iconMatch) continue;
    const rawName = normalizeFAName(iconMatch[1]);
    addIcon(m[0], 'fa6-solid', rawName, semanticFromName(rawName, 'fa6-solid'), 'fontawesome');
  }

  // 3. Bootstrap Icons
  const re3 = /<i([^>]*)\bclass="([^"]*)\bbi\s+bi-([\w-]+)\b([^"]*)"([^>]*)(?:\s*\/?>(?:<\/i>)?|><\/i>)/g;
  while ((m = re3.exec(html)) !== null) {
    addIcon(m[0], 'bi', m[3], semanticFromName(m[3], 'bi'), 'bootstrap');
  }

  // 4. Tabler Icons
  const re4 = /<i([^>]*)\bclass="([^"]*)\bti\s+ti-([\w-]+)\b([^"]*)"([^>]*)(?:\s*\/?>(?:<\/i>)?|><\/i>)/g;
  while ((m = re4.exec(html)) !== null) {
    addIcon(m[0], 'tabler', m[3], semanticFromName(m[3], 'tabler'), 'tabler');
  }

  // 5. Phosphor Icons
  const re5 = /<i([^>]*)\bclass="([^"]*)\bph\s+ph-([\w-]+)\b([^"]*)"([^>]*)(?:\s*\/?>(?:<\/i>)?|><\/i>)/g;
  while ((m = re5.exec(html)) !== null) {
    const raw = m[3].replace(/-(bold|fill|light|thin|duotone|regular)$/, '');
    addIcon(m[0], 'ph', raw, semanticFromName(raw, 'ph'), 'phosphor');
  }

  // 6. Remix Icons
  const re6 = /<i([^>]*)\bclass="([^"]*)\bri\s+ri-([\w-]+)\b([^"]*)"([^>]*)(?:\s*\/?>(?:<\/i>)?|><\/i>)/g;
  while ((m = re6.exec(html)) !== null) {
    const raw = m[3].replace(/-(line|fill|2-fill|2-line|3-fill|3-line)$/, '');
    addIcon(m[0], 'ri', raw, semanticFromName(raw, 'ri'), 'remix');
  }

  // 7. Lucide CDN
  const re7 = /<i([^>]*)\bdata-lucide="([\w-]+)"([^>]*)(?:\s*\/?>(?:<\/i>)?|><\/i>)/g;
  while ((m = re7.exec(html)) !== null) {
    addIcon(m[0], 'lucide', m[2], semanticFromName(m[2], 'lucide'), 'lucide');
  }

  // 8. Feather Icons
  const re8 = /<i([^>]*)\bdata-feather="([\w-]+)"([^>]*)(?:\s*\/?>(?:<\/i>)?|><\/i>)/g;
  while ((m = re8.exec(html)) !== null) {
    addIcon(m[0], 'feather', m[2], semanticFromName(m[2], 'feather'), 'feather');
  }

  return icons;
}

/**
 * patchIconsInHTML(html, replacements)
 * replacements: Array<{ original: string, replacement: string }>
 */
export function patchIconsInHTML(html, replacements) {
  let result = html;
  let patched = 0;
  for (const { original, replacement } of replacements) {
    if (original && result.includes(original)) {
      // Replace ALL occurrences of this exact element
      result = result.split(original).join(replacement);
      patched++;
    }
  }
  return { html: result, patchedCount: patched };
}

/**
 * ensureIconifyCDN(html) — adds Iconify CDN if not already present
 */
export function ensureIconifyCDN(html) {
  if (html.includes('iconify-icon.min.js') || html.includes('iconify-icon@')) return html;
  return html.replace(/<\/head>/i, `  ${ICONIFY_CDN}\n</head>`);
}

/**
 * suggestIcon(semantic, targetPrefix) — returns best icon name in target pack
 */
export function suggestIcon(semantic, targetPrefix) {
  return targetName(semantic, targetPrefix);
}

/**
 * Public extractAttrs for building replacement elements externally
 */
export function extractAttrsFromElement(raw) {
  return extractAttrs(raw);
}

/**
 * buildIconifyElement(prefix, name, style, keepClasses) — builds an iconify-icon element
 */
export function buildIconifyElement(prefix, name, style, keepClasses) {
  return buildIconify(prefix, name, style, keepClasses);
}
