import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Sparkles, Layout, Code,
  Smartphone, Monitor, Download, Copy,
  ChevronRight, Box, Check,
  AtSign, Paperclip, ArrowUp, X, ChevronDown,
  FileText, Image as ImageIcon, File, Maximize, Minimize,
  Edit2, Bot, AlignLeft, AlignCenter, AlignRight, AlignJustify,
  MoreHorizontal, ArrowDown, CopyPlus, CornerLeftUp, Trash, Eye, Undo, Redo, Square,
  Menu, PlusCircle, MessageSquare, Trash2, Clock, Plus, FolderDown, FileCode, Search, Zap,
  Globe, Link, ExternalLink, Unlink
} from 'lucide-react';

import { TEMPLATES } from '../config/templates';
import { DEFAULT_MESSAGES, generateChatId } from '../config/constants';
import { SYSTEM_INSTRUCTION, unsplashKey } from '../config/api';
import { getImageCatalogInstruction, searchHostedImages, getCategories, matchCollection, fetchCollectionImages } from '../config/imageAssets';
import { publishSite, unpublishSite, getPublishInfo } from '../utils/publishSite';
import { loadInstructionsFromFirestore } from '../utils/firestoreAdmin';
import { loadJSZip } from '../utils/loadJSZip';
import { generateAIResponse, generateAIResponseStream } from '../utils/generateAIResponse';
import { getInjectionScript } from '../utils/injectionScript';
import { replaceImagesInFiles } from '../utils/replaceImages';
import { GOOGLE_FONTS } from '../config/fonts';
import { useAuth } from '../contexts/AuthContext';
import { loadSessionsFromFirestore, saveSessionToFirestore, deleteSessionFromFirestore } from '../utils/firestoreSessions';
import { trackTokenUsage, getUserTokenInfo } from '../utils/tokenTracker';
import PlanSelector from './PlanSelector';
import Accordion from './ui/Accordion';
import Field from './ui/Field';
import Input from './ui/Input';
import Select from './ui/Select';

const createEmptySession = (id) => ({
  id, title: 'New Design', messages: DEFAULT_MESSAGES, generatedFiles: {}, activeFileName: '', history: [], historyIndex: -1, createdAt: Date.now()
});

// ==========================================
// COMPONENT: Studio Workspace
// ==========================================
const StudioWorkspace = () => {
  const { chatId } = useParams();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // Session State — loaded from Firestore
  const [chatSessions, setChatSessions] = useState({});
  const [sessionsLoaded, setSessionsLoaded] = useState(false);
  const [activeSessionId, setActiveSessionId] = useState(chatId || null);
  const activeSessionRef = useRef(chatId || null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Active Workspace Data
  const [messages, setMessages] = useState(DEFAULT_MESSAGES);
  const [input, setInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStatus, setGenerationStatus] = useState('');
  const [generatingFiles, setGeneratingFiles] = useState([]); // Array of tracked files during live generation
  const [isExportingReact, setIsExportingReact] = useState(false);
  const [isExportingFlutter, setIsExportingFlutter] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishInfo, setPublishInfo] = useState(null); // { slug, url }
  const [showPublishToast, setShowPublishToast] = useState(false);

  // Multi-file Structure
  const [generatedFiles, setGeneratedFiles] = useState({}); // { "index.html": "...", "button.html": "..." }
  const [activeFileName, setActiveFileName] = useState('');
  const activeFileNameRef = useRef(''); // used during progressive rendering

  // History State (Undo/Redo now stores full generatedFiles object)
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const isUndoingRef = useRef(false);
  const historyTimeoutRef = useRef(null);

  // Refs that always hold the latest state (for reliable Firestore sync)
  const messagesRef = useRef(messages);
  const generatedFilesRef = useRef(generatedFiles);
  const activeFileNameStateRef = useRef(activeFileName);
  const historyRef = useRef(history);
  const historyIndexRef = useRef(historyIndex);
  useEffect(() => { messagesRef.current = messages; }, [messages]);
  useEffect(() => { generatedFilesRef.current = generatedFiles; }, [generatedFiles]);
  useEffect(() => { activeFileNameStateRef.current = activeFileName; }, [activeFileName]);
  useEffect(() => { historyRef.current = history; }, [history]);
  useEffect(() => { historyIndexRef.current = historyIndex; }, [historyIndex]);

  // View & App Modes
  const [deviceMode, setDeviceMode] = useState('desktop');
  const [workspaceMode, setWorkspaceMode] = useState('preview');
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Floating Editor States
  const [selectedElement, setSelectedElement] = useState(null);
  const [editorTab, setEditorTab] = useState('manual');
  const [elementPrompt, setElementPrompt] = useState('');
  const [isEditingElement, setIsEditingElement] = useState(false);
  const [showElementMenu, setShowElementMenu] = useState(false);

  const [manualClasses, setManualClasses] = useState('');
  const [manualId, setManualId] = useState('');
  const [manualHtml, setManualHtml] = useState('');
  const [manualText, setManualText] = useState('');
  const [manualSrc, setManualSrc] = useState('');
  const [manualAlt, setManualAlt] = useState('');
  const [manualStyles, setManualStyles] = useState({});

  const [selectedTemplateId, setSelectedTemplateId] = useState(null);
  const [templateDNA, setTemplateDNA] = useState('');
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [templateSearch, setTemplateSearch] = useState('');
  const [templatePreviewId, setTemplatePreviewId] = useState(null);
  const [fontSearch, setFontSearch] = useState('');
  const [showFontPicker, setShowFontPicker] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showComponentsModal, setShowComponentsModal] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const [previewItem, setPreviewItem] = useState(null);

  const [codeEditValue, setCodeEditValue] = useState(null); // local buffer for code editor (null = use generatedFiles)
  const codeEditValueRef = useRef(null);
  useEffect(() => { codeEditValueRef.current = codeEditValue; }, [codeEditValue]);
  const [liveSystemInstruction, setLiveSystemInstruction] = useState(null);
  const [tokenLimit, setTokenLimit] = useState(0); // 0 = unlimited
  const [userTokensUsed, setUserTokensUsed] = useState(0);
  const [userPlanId, setUserPlanId] = useState(null);
  const [showPlanSelector, setShowPlanSelector] = useState(false);

  const [unsplashQuery, setUnsplashQuery] = useState('');
  const [unsplashResults, setUnsplashResults] = useState([]);
  const [isSearchingUnsplash, setIsSearchingUnsplash] = useState(false);
  const [hostedQuery, setHostedQuery] = useState('');
  const [hostedResults, setHostedResults] = useState([]);
  const [hostedCategory, setHostedCategory] = useState('');

  const iframeRef = useRef(null);
  const endOfChatRef = useRef(null);
  const fileInputRef = useRef(null);

  // --- Load live instructions from Firestore ---
  useEffect(() => {
    loadInstructionsFromFirestore().then(data => {
      if (data?.systemInstruction) setLiveSystemInstruction(data.systemInstruction);
    }).catch(() => { });
  }, []);

  // --- Load user's token usage + per-user limit ---
  useEffect(() => {
    if (!user) return;
    getUserTokenInfo(user.uid).then(({ used, limit, planId }) => {
      setUserTokensUsed(used);
      setTokenLimit(limit);
      setUserPlanId(planId);
    }).catch(() => { });
  }, [user]);

  // --- Fetch Template DNA when selected ---
  useEffect(() => {
    if (!selectedTemplateId) return;
    const template = TEMPLATES.find(t => t.id === selectedTemplateId);
    if (!template?.file) return;
    fetch(`/templates/${template.file}`)
      .then(res => res.ok ? res.text() : '')
      .then(html => setTemplateDNA(html))
      .catch(() => setTemplateDNA(''));
  }, [selectedTemplateId]);

  // --- Load all sessions from Firestore on mount ---
  useEffect(() => {
    if (!user) return;
    loadSessionsFromFirestore(user.uid).then(sessions => {
      setChatSessions(sessions);
      if (chatId && sessions[chatId]) {
        const target = sessions[chatId];
        setMessages(target.messages || DEFAULT_MESSAGES);
        setGeneratedFiles(target.generatedFiles || {});
        setActiveFileName(target.activeFileName || '');
        activeFileNameRef.current = target.activeFileName || '';
        setHistory(target.history || []);
        setHistoryIndex(target.historyIndex ?? -1);
      }
      // No chatId = fresh new chat, just keep default state (no Firestore save yet)
      setSessionsLoaded(true);
    });
  }, [user]);

  // --- Session Syncing & Management (debounced, persists to Firestore) ---
  // Flush function reads from refs to always get the latest state (avoids stale closures)
  const flushSessionToFirestore = useCallback((sessionId) => {
    const uid = user?.uid;
    if (!uid || !sessionId) return;
    const latestMessages = messagesRef.current;
    const latestFiles = generatedFilesRef.current;
    const latestFileName = activeFileNameStateRef.current;
    const latestHistory = historyRef.current;
    const latestHistoryIndex = historyIndexRef.current;

    setChatSessions(prev => {
      if (!prev[sessionId]) return prev;
      const currentTitle = prev[sessionId].title;
      let newTitle = currentTitle;
      if (currentTitle === 'New Design' && latestMessages.length > 1) {
        const firstUserMsg = latestMessages.find(m => m.role === 'user');
        if (firstUserMsg) newTitle = firstUserMsg.content.substring(0, 25) + '...';
      }
      // Strip base64 data from attachments before saving (Firestore 1MB limit)
      const cleanMessages = latestMessages.map(m => {
        if (!m.attachments?.length) return m;
        return { ...m, attachments: m.attachments.map(({ data, content, ...rest }) => rest) };
      });
      const updatedSession = { ...prev[sessionId], messages: latestMessages, generatedFiles: latestFiles, activeFileName: latestFileName, history: latestHistory, historyIndex: latestHistoryIndex, title: newTitle };
      // Persist to Firestore with cleaned messages
      saveSessionToFirestore(uid, sessionId, { ...updatedSession, messages: cleanMessages });
      return { ...prev, [sessionId]: updatedSession };
    });
  }, [user]);

  useEffect(() => {
    if (!user || !sessionsLoaded || !activeSessionId) return;
    activeSessionRef.current = activeSessionId;
    clearTimeout(sessionSyncTimerRef.current);
    sessionSyncTimerRef.current = setTimeout(() => flushSessionToFirestore(activeSessionId), 500);
    return () => clearTimeout(sessionSyncTimerRef.current);
  }, [messages, generatedFiles, activeFileName, history, historyIndex, activeSessionId, user, sessionsLoaded, flushSessionToFirestore]);

  // Flush pending saves before page unload (prevents data loss on reload)
  useEffect(() => {
    const handleBeforeUnload = () => {
      clearTimeout(sessionSyncTimerRef.current);
      // Flush pending code editor changes into generatedFiles ref
      if (codeEditTimerRef.current) {
        clearTimeout(codeEditTimerRef.current);
        codeEditTimerRef.current = null;
      }
      if (codeEditValueRef.current !== null && activeFileNameStateRef.current) {
        generatedFilesRef.current = { ...generatedFilesRef.current, [activeFileNameStateRef.current]: codeEditValueRef.current };
      }
      if (activeSessionRef.current) {
        flushSessionToFirestore(activeSessionRef.current);
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [flushSessionToFirestore]);

  // --- Sync URL chatId with activeSessionId ---
  useEffect(() => {
    if (!user || !sessionsLoaded) return;
    // /studio (no chatId) = fresh state, no session created yet
    if (!chatId) {
      setActiveSessionId(null);
      activeSessionRef.current = null;
      setMessages(DEFAULT_MESSAGES);
      setGeneratedFiles({});
      setActiveFileName('');
      activeFileNameRef.current = '';
      setHistory([]);
      setHistoryIndex(-1);
      return;
    }
    if (chatId !== activeSessionId) {
      if (chatSessions[chatId]) {
        const target = chatSessions[chatId];
        setActiveSessionId(chatId);
        setMessages(target.messages || DEFAULT_MESSAGES);
        setGeneratedFiles(target.generatedFiles || {});
        setActiveFileName(target.activeFileName || '');
        activeFileNameRef.current = target.activeFileName || '';
        setHistory(target.history || []);
        setHistoryIndex(target.historyIndex ?? -1);
      } else {
        const newSession = createEmptySession(chatId);
        setChatSessions(prev => ({ ...prev, [chatId]: newSession }));
        setActiveSessionId(chatId);
        setMessages(newSession.messages);
        setGeneratedFiles(newSession.generatedFiles);
        setActiveFileName(newSession.activeFileName);
        activeFileNameRef.current = '';
        setHistory(newSession.history);
        setHistoryIndex(newSession.historyIndex);
        saveSessionToFirestore(user.uid, chatId, newSession);
      }
    }
  }, [chatId, sessionsLoaded]);

  const handleSwitchChat = (id) => {
    if (id === activeSessionId) { setIsSidebarOpen(false); return; }
    navigate(`/studio/${id}`);
    const target = chatSessions[id];
    setActiveSessionId(id);
    setMessages(target.messages || DEFAULT_MESSAGES);
    setGeneratedFiles(target.generatedFiles || {});
    setActiveFileName(target.activeFileName || '');
    activeFileNameRef.current = target.activeFileName || '';
    setHistory(target.history || []);
    setHistoryIndex(target.historyIndex ?? -1);
    setIsSidebarOpen(false);
    closeFloatingEditor();
  };

  const handleNewChat = () => {
    setActiveSessionId(null);
    activeSessionRef.current = null;
    setMessages(DEFAULT_MESSAGES);
    setGeneratedFiles({});
    setActiveFileName('');
    activeFileNameRef.current = '';
    setHistory([]);
    setHistoryIndex(-1);
    setIsSidebarOpen(false);
    closeFloatingEditor();
    navigate('/studio');
  };

  const handleDeleteChat = (id, e) => {
    e.stopPropagation();
    const remainingIds = Object.keys(chatSessions).filter(k => k !== id);
    if (remainingIds.length === 0) {
      handleNewChat();
      setChatSessions(prev => { const { [id]: _, ...rest } = prev; return rest; });
      if (user) deleteSessionFromFirestore(user.uid, id);
      return;
    }
    if (activeSessionId === id) handleSwitchChat(remainingIds[0]);
    setChatSessions(prev => { const { [id]: _, ...rest } = prev; return rest; });
    if (user) deleteSessionFromFirestore(user.uid, id);
  };

  useEffect(() => {
    endOfChatRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, generatingFiles]);

  // --- History (Undo/Redo) Effect & Handlers ---
  useEffect(() => {
    if (Object.keys(generatedFiles).length === 0) return;
    if (isUndoingRef.current) {
      isUndoingRef.current = false;
      return;
    }

    clearTimeout(historyTimeoutRef.current);
    historyTimeoutRef.current = setTimeout(() => {
      setHistory(prev => {
        const currentH = prev.slice(0, historyIndex + 1);
        const latestStateStr = JSON.stringify(currentH[currentH.length - 1]);
        const newStateStr = JSON.stringify(generatedFiles);
        if (latestStateStr === newStateStr) return prev;

        const nextH = [...currentH, generatedFiles].slice(-50);
        setHistoryIndex(nextH.length - 1);
        return nextH;
      });
    }, 400);
  }, [generatedFiles, historyIndex]);

  const handleUndo = useCallback(() => {
    setHistoryIndex(prev => {
      if (prev > 0) {
        isUndoingRef.current = true;
        const newIndex = prev - 1;
        const restoredFiles = history[newIndex];
        setGeneratedFiles(restoredFiles);
        if (!restoredFiles[activeFileName]) {
          const firstKey = Object.keys(restoredFiles)[0] || '';
          setActiveFileName(firstKey);
          activeFileNameRef.current = firstKey;
        }
        return newIndex;
      }
      return prev;
    });
  }, [history, activeFileName]);

  const handleRedo = useCallback(() => {
    setHistoryIndex(prev => {
      if (prev < history.length - 1) {
        isUndoingRef.current = true;
        const newIndex = prev + 1;
        const restoredFiles = history[newIndex];
        setGeneratedFiles(restoredFiles);
        if (!restoredFiles[activeFileName]) {
          const firstKey = Object.keys(restoredFiles)[0] || '';
          setActiveFileName(firstKey);
          activeFileNameRef.current = firstKey;
        }
        return newIndex;
      }
      return prev;
    });
  }, [history, activeFileName]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) handleRedo(); else handleUndo();
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault(); handleRedo();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo, handleRedo]);

  const lastWrittenRef = useRef('');
  const iframeWriteTimerRef = useRef(null);
  const pendingIframeSourceRef = useRef('');
  const skipNextIframeWriteRef = useRef(false);
  const manualChangeTimerRef = useRef(null);
  const codeEditTimerRef = useRef(null);
  const sessionSyncTimerRef = useRef(null);
  const abortControllerRef = useRef(null);

  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data?.type === 'ELEMENT_SELECTED') {
        setSelectedElement(event.data);
        setManualClasses(event.data.className || '');
        setManualId(event.data.domId || '');
        setManualHtml(event.data.innerHTML || '');
        setManualText(event.data.innerText || '');
        setManualSrc(event.data.src || '');
        setManualAlt(event.data.alt || '');
        setManualStyles(event.data.styles || {});
        setEditorTab('manual');
        setShowElementMenu(false);
      }
      if (event.data?.type === 'DOCUMENT_UPDATED') {
        let html = event.data.html;
        // Strip injected style + script tags
        html = html.replace(/<style id="ai-architect-styles">[\s\S]*?<\/style>\s*/, '');
        html = html.replace(/<script id="ai-architect-injected">[\s\S]*?<\/script>/, '');
        // Remove highlight class from any element (not the whole class attr)
        html = html.replace(/\bai-architect-highlight\b\s*/g, '');
        // Clean up leftover empty class attributes
        html = html.replace(/\s*class="\s*"/g, '');
        // Skip iframe rewrite — the iframe DOM already has this change
        skipNextIframeWriteRef.current = true;
        setGeneratedFiles(prev => ({ ...prev, [activeFileNameRef.current]: html }));
      }
      if (event.data?.type === 'ELEMENT_RESIZED') {
        setManualStyles(prev => ({ ...prev, width: event.data.width, height: event.data.height }));
      }
      if (event.data?.type === 'DESELECT') {
        setSelectedElement(null);
      }
      if (event.data?.type === 'NAVIGATE_FILE') {
        const target = event.data.fileName;
        setGeneratedFiles(prev => {
          // Exact match
          if (prev[target]) {
            setActiveFileName(target);
            activeFileNameRef.current = target;
            return prev;
          }
          // Fuzzy match: strip tier suffix (e.g., "about.page.html" → try "about.html" and vice versa)
          const baseName = target.replace(/\.(page|organism|molecule|atom)\.html$/, '');
          const match = Object.keys(prev).find(f => {
            const fBase = f.replace(/\.(page|organism|molecule|atom)\.html$/, '');
            return fBase === baseName || f === target;
          });
          if (match) {
            setActiveFileName(match);
            activeFileNameRef.current = match;
          }
          return prev;
        });
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const closeFloatingEditor = () => {
    setSelectedElement(null);
    sendToIframe({ type: 'DESELECT' });
  };

  const handleUnsplashSearch = async (query) => {
    if (!query.trim() || !unsplashKey) return;
    setIsSearchingUnsplash(true);
    try {
      const res = await fetch(`https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=12&client_id=${unsplashKey}`);
      const data = await res.json();
      setUnsplashResults(data.results || []);
    } catch { setUnsplashResults([]); }
    finally { setIsSearchingUnsplash(false); }
  };

  const handleUnsplashSelect = (photo) => {
    const url = photo.urls.regular;
    setManualSrc(url);
    handleManualChange('src', url);
    setManualAlt(photo.alt_description || photo.description || '');
    handleManualChange('alt', photo.alt_description || photo.description || '');
  };

  const handleElementAction = (action) => {
    setShowElementMenu(false);
    if (!selectedElement) return;
    if (action === 'move-up') sendToIframe({ type: 'ACTION_MOVE', id: selectedElement.id, direction: 'up' });
    else if (action === 'move-down') sendToIframe({ type: 'ACTION_MOVE', id: selectedElement.id, direction: 'down' });
    else if (action === 'delete') { sendToIframe({ type: 'ACTION_DELETE', id: selectedElement.id }); setSelectedElement(null); }
    else if (action === 'duplicate') sendToIframe({ type: 'ACTION_DUPLICATE', id: selectedElement.id });
    else if (action === 'select-parent') sendToIframe({ type: 'ACTION_SELECT_PARENT', id: selectedElement.id });
  };

  const sendToIframe = useCallback((payload) => {
    if (iframeRef.current?.contentWindow) iframeRef.current.contentWindow.postMessage(payload, '*');
  }, []);

  const injectFontIntoIframe = useCallback((fontName) => {
    try {
      const doc = iframeRef.current?.contentDocument;
      if (!doc) return;
      const id = `gfont-${fontName.replace(/\s/g, '-')}`;
      if (doc.getElementById(id)) return;
      const link = doc.createElement('link');
      link.id = id;
      link.rel = 'stylesheet';
      link.href = `https://fonts.googleapis.com/css2?family=${fontName.replace(/ /g, '+')}&display=swap`;
      doc.head.appendChild(link);
    } catch { }
  }, []);

  const handleFontSelect = (fontName) => {
    setFontSearch('');
    setShowFontPicker(false);
    if (!fontName) {
      handleStyleChange('fontFamily', '');
      return;
    }
    injectFontIntoIframe(fontName);
    handleStyleChange('fontFamily', `"${fontName}", sans-serif`);
  };

  const handleManualChange = (field, value) => {
    // Update local state immediately for responsive UI
    if (field === 'class') setManualClasses(value);
    if (field === 'id') setManualId(value);
    if (field === 'html') setManualHtml(value);
    if (field === 'text') setManualText(value);
    if (field === 'src') setManualSrc(value);
    if (field === 'alt') setManualAlt(value);

    // Debounce the actual iframe update
    clearTimeout(manualChangeTimerRef.current);
    manualChangeTimerRef.current = setTimeout(() => {
      const payload = { type: 'UPDATE_ELEMENT_MANUAL', id: selectedElement?.id };
      if (field === 'class') payload.className = value;
      if (field === 'id') payload.domId = value;
      if (field === 'html') payload.innerHTML = value;
      if (field === 'text') payload.innerText = value;
      if (field === 'src') payload.src = value;
      if (field === 'alt') payload.alt = value;
      sendToIframe(payload);
    }, 300);
  };

  const handleStyleChange = (property, value) => {
    setManualStyles(prev => ({ ...prev, [property]: value }));
    clearTimeout(manualChangeTimerRef.current);
    manualChangeTimerRef.current = setTimeout(() => {
      sendToIframe({ type: 'UPDATE_ELEMENT_STYLE', id: selectedElement?.id, property, value });
    }, 200);
  };

  const handleElementAIEdit = async () => {
    if (!elementPrompt.trim() || isEditingElement) return;
    if (isTokenLimitReached) { alert('Token limit reached. Contact admin to reset.'); return; }
    setIsEditingElement(true);
    const prompt = `You are an expert HTML/Tailwind CSS editor. Edit the following HTML element based on this instruction: "${elementPrompt}". CURRENT ELEMENT HTML: ${selectedElement.outerHTML} RULES: Return ONLY the modified HTML for this specific element. Keep the exact same 'data-ai-id="${selectedElement.id}"' attribute intact. Do NOT wrap your response in markdown fences.`;

    try {
      const { text, usage } = await generateAIResponse(prompt, "You are a specialized HTML element editor.");
      if (user && usage) { trackTokenUsage(user.uid, usage); setUserTokensUsed(prev => prev + (usage.totalTokens || 0)); }
      let cleanHTML = text.replace(/^```html\n?/, '').replace(/\n?```$/, '').trim();
      sendToIframe({ type: 'UPDATE_ELEMENT', id: selectedElement.id, newHtml: cleanHTML });
      setElementPrompt('');
    } catch (e) {
      setMessages(prev => [...prev, { role: 'model', type: 'error', content: "Failed to edit element: " + e.message }]);
    } finally {
      setIsEditingElement(false);
    }
  };

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files);
    const newAttachments = [];
    for (const file of files) {
      if (file.type.startsWith('text/') || file.name.endsWith('.md')) {
        const text = await file.text();
        newAttachments.push({ name: file.name, type: file.type || 'text/markdown', isText: true, content: text });
      } else if (file.type.startsWith('image/') || file.type === 'application/pdf') {
        const reader = new FileReader();
        const dataUrl = await new Promise((resolve) => {
          reader.onload = (e) => resolve(e.target.result);
          reader.readAsDataURL(file);
        });
        newAttachments.push({ name: file.name, type: file.type, isText: false, data: dataUrl });
      }
    }
    setAttachments(prev => [...prev, ...newAttachments]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handlePaste = async (e) => {
    const files = Array.from(e.clipboardData?.files || []);
    if (files.length > 0) {
      const newAttachments = [];
      for (const file of files) {
        if (file.type.startsWith('image/')) {
          const reader = new FileReader();
          const dataUrl = await new Promise((resolve) => {
            reader.onload = (ev) => resolve(ev.target.result);
            reader.readAsDataURL(file);
          });
          const fileName = file.name === 'image.png' ? `pasted-image-${Date.now()}.png` : file.name;
          newAttachments.push({ name: fileName, type: file.type, isText: false, data: dataUrl });
        } else if (file.type.startsWith('text/') || file.name.endsWith('.md')) {
          const text = await file.text();
          newAttachments.push({ name: file.name || `pasted-file-${Date.now()}.txt`, type: file.type || 'text/plain', isText: true, content: text });
        }
      }
      if (newAttachments.length > 0) {
        setAttachments(prev => [...prev, ...newAttachments]);
      }
    }
  };

  const removeAttachment = (index) => setAttachments(prev => prev.filter((_, i) => i !== index));

  const isTokenLimitReached = tokenLimit > 0 && userTokensUsed >= tokenLimit;

  const formatTokens = (n) => {
    if (!n) return '0';
    if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
    if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
    return n.toString();
  };
  const tokenUsagePercent = tokenLimit > 0 ? Math.min((userTokensUsed / tokenLimit) * 100, 100) : 0;

  const handleSend = async () => {
    if (!input.trim() && attachments.length === 0 || isGenerating) return;

    // Check token limit before generation
    if (isTokenLimitReached) {
      setMessages(prev => [...prev, {
        role: 'model', type: 'error',
        content: 'You have reached your token usage limit. Please upgrade your plan to continue.'
      }]);
      return;
    }

    const userPrompt = input;
    const currentAttachments = [...attachments];

    // Lazy chat creation — generate ID on first message
    let currentSessionId = activeSessionId;
    if (!currentSessionId) {
      const newId = generateChatId();
      const newSession = createEmptySession(newId);
      setChatSessions(prev => ({ ...prev, [newId]: newSession }));
      setActiveSessionId(newId);
      activeSessionRef.current = newId;
      currentSessionId = newId;
      navigate(`/studio/${newId}`, { replace: true });
      if (user) saveSessionToFirestore(user.uid, newId, newSession);
    }

    setInput('');
    setAttachments([]);
    setGeneratingFiles([]); // Reset to-do list progress

    const selectedTemplate = TEMPLATES.find(t => t.id === selectedTemplateId);

    setMessages(prev => [...prev, {
      role: 'user',
      type: 'text',
      content: userPrompt,
      attachments: currentAttachments.map(a => ({ name: a.name, type: a.type, isText: a.isText, data: a.data, content: a.content })),
      template: selectedTemplate ? { name: selectedTemplate.name, color: selectedTemplate.color } : null
    }]);
    setSelectedTemplateId(null); // Hide chip after send, DNA persists
    setIsGenerating(true);
    setGenerationStatus('Analyzing request & planning structure...');
    closeFloatingEditor();

    // Detect context
    const hasImageAttachment = currentAttachments.some(a => !a.isText);
    const isFirstGeneration = Object.keys(generatedFiles).length === 0;

    // --- FAST PATH: Surgical edits get a lean prompt (no catalog, no collection, no style) ---
    const isSurgicalEdit = Object.keys(generatedFiles).length > 0;

    let collectionAttachments = [];
    let collectionKey = null;
    let styleDirective = '';
    let allAttachments = currentAttachments;
    let fullPrompt = userPrompt;
    let sysInstruction;

    if (isSurgicalEdit) {
      // EDIT MODE: Minimal system instruction — just core rules + surgical edit context
      sysInstruction = liveSystemInstruction || SYSTEM_INSTRUCTION;

      let filesContext = Object.entries(generatedFiles).map(([name, code]) => `[FILE: ${name}]\n${code}`).join('\n\n');
      fullPrompt = `SURGICAL EDIT REQUEST: "${userPrompt}"

EXISTING WORKSPACE FILES (THESE ARE THE SOURCE OF TRUTH):
${filesContext}

RULES FOR THIS EDIT:
1. ONLY return files that need to change based on the request above.
2. For each returned file, keep 99% of the existing HTML IDENTICAL — only modify what was specifically requested.
3. Do NOT redesign, restyle, rearrange, or "improve" anything the user did not ask to change.
4. Do NOT return unchanged files.
5. Each returned file must be COMPLETE standalone HTML (full file, not a snippet).`;

    } else {
      // FIRST GENERATION: Full system instruction with catalog, style, and collection

      // Auto-fetch collection images (1 image only for speed)
      if (!hasImageAttachment && !templateDNA) {
        collectionKey = matchCollection(userPrompt);
        if (collectionKey) {
          setGenerationStatus('Loading design inspiration...');
          collectionAttachments = await fetchCollectionImages(collectionKey);
        }
      }
      allAttachments = [...currentAttachments, ...collectionAttachments];
      const hasCollectionImages = collectionAttachments.length > 0;

      // Random layout style
      if (!templateDNA && !hasImageAttachment) {
        const styles = [
          '\n\n██ MANDATORY STYLE: 🅰 MODERN CLEAN ██\nUse Modern Clean layout. Clean grids, gradient CTAs, glassmorphic navbar, soft shadows, vibrant primary color.',
          '\n\n██ MANDATORY STYLE: 🅱 EDITORIAL ██\nUse Editorial layout. Asymmetric grids, oversized serif headlines, elegant overlaps, warm cream palette.',
          '\n\n██ MANDATORY STYLE: 🅲 MINIMAL ██\nUse Minimal layout. Maximum whitespace, soft shadows, restrained muted palette, gentle fade-in animations.',
          '\n\n██ MANDATORY STYLE: 🅳 3D / GLASSMORPHISM ██\nUse 3D/Glassmorphism layout. Glass panels with backdrop-blur, dark gradient mesh, glowing orbs, CSS 3D transforms.',
          '\n\n██ MANDATORY STYLE: 🅴 PARALLAX / ANIMATED ██\nUse Parallax/Animated layout. Scroll-triggered reveals, parallax layers, staggered fade-ins, cinematic pacing.',
          '\n\n██ MANDATORY STYLE: 🅵 DARK PREMIUM ██\nUse Dark Premium layout. Dark backgrounds (#09090B), subtle glows, noise texture, one signature accent color.'
        ];
        styleDirective = styles[Math.floor(Math.random() * 6)];
      }

      sysInstruction = (liveSystemInstruction || SYSTEM_INSTRUCTION) + getImageCatalogInstruction() + (templateDNA ? `\n\nSTYLE DNA (MANDATORY):\n${templateDNA}` : '') + styleDirective;

      // Prompt enrichment for first generation
      if (hasCollectionImages) {
        fullPrompt = `██ DESIGN INSPIRATION IMAGES PROVIDED ██
Use attached images as VISUAL INSPIRATION for a "${collectionKey}" project. Create an ORIGINAL design inspired by them — do NOT pixel-copy. Apply the user's requirements on top.

USER REQUEST: ${userPrompt}`;
      } else if (hasImageAttachment) {
        fullPrompt = `██ IMAGE REFERENCE — PHASE 0 ACTIVE ██
MATCH the provided image EXACTLY: layout, colors, spacing, typography. Do NOT apply random layout styles.

USER REQUEST: ${userPrompt}`;
      }

      // PRD detection
      const isPRD = userPrompt.length > 500 || /features?:|requirements?:|user stor|pages?:|screens?:|specification|overview:/i.test(userPrompt);
      if (isPRD && !hasImageAttachment) {
        fullPrompt = `██ PRD DETECTED ██\nAnalyze ALL requirements. Build ALL mentioned pages/screens. Extract colors, fonts, branding.\n\n${userPrompt}`;
      }
    }

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    try {
      // --- Real-time Streaming Engine ---
      const parseAndUpdateFiles = (currentText) => {
        if (activeSessionRef.current !== currentSessionId) return;

        // Extract Roadmap for Status Updates
        const roadmapMatch = currentText.match(/ROADMAP:([\s\S]*?)(?=FILE:|$)/);
        if (roadmapMatch) {
          setGenerationStatus(`Structuring...\n${roadmapMatch[1].trim().split('\n')[0]}`);
        }

        // Parse File Tracking
        const fileRegex = /FILE:\s*([\w.-]+)\s*/g;
        let fileMatch;
        const trackedFiles = [];
        const newFiles = {};

        while ((fileMatch = fileRegex.exec(currentText)) !== null) {
          const fn = fileMatch[1].trim();
          if (!trackedFiles.includes(fn)) trackedFiles.push(fn);
        }

        if (trackedFiles.length === 0 && currentText.includes('<html')) {
          trackedFiles.push('index.html');
        }

        setGeneratingFiles(trackedFiles);

        // Parse actual HTML content for live preview
        const fileContentRegex = /FILE:\s*([\w.-]+)\s*([\s\S]*?)(?=FILE:|$)/g;
        let contentMatch;
        let lastParsedFile = trackedFiles[trackedFiles.length - 1];

        while ((contentMatch = fileContentRegex.exec(currentText)) !== null) {
          let fn = contentMatch[1].trim();
          let fc = contentMatch[2].trim();
          fc = fc.replace(/^```\w*\n?/g, '').replace(/\n?```$/, '').trim();
          const tagMatch = fc.match(/<(?:!DOCTYPE|html|div|nav|header|footer)[\s\S]*/i);
          if (tagMatch) fc = tagMatch[0];
          if (fc) newFiles[fn] = fc;
        }

        if (trackedFiles.length === 0 && currentText.includes('<html')) {
          let fc = currentText.replace(/^```\w*\n?/g, '').replace(/\n?```$/, '').trim();
          const tagMatch = fc.match(/<(?:!DOCTYPE|html)[\s\S]*/i);
          if (tagMatch) newFiles['index.html'] = tagMatch[0];
        }

        if (Object.keys(newFiles).length > 0) {
          setGeneratedFiles(prev => {
            const merged = { ...prev, ...newFiles };
            // Prefer showing a page file over a component file in the preview
            const allKeys = Object.keys(merged);
            const pageKeys = allKeys.filter(f => !/\.(atom|molecule|organism)\.html$/i.test(f));
            const isCurrentComponent = activeFileNameRef.current && /\.(atom|molecule|organism)\.html$/i.test(activeFileNameRef.current);
            if (pageKeys.length > 0 && (!activeFileNameRef.current || isCurrentComponent)) {
              const target = pageKeys[pageKeys.length - 1];
              setActiveFileName(target);
              activeFileNameRef.current = target;
            } else if (!activeFileNameRef.current || !merged[activeFileNameRef.current]) {
              const target = lastParsedFile || allKeys[0];
              setActiveFileName(target);
              activeFileNameRef.current = target;
            }
            return merged;
          });
        }
      };

      const streamResult = await generateAIResponseStream(
        fullPrompt, sysInstruction, allAttachments,
        'gemini-3-pro-preview',
        parseAndUpdateFiles,
        abortController.signal
      );

      // Track token usage
      if (user && streamResult.usage) { trackTokenUsage(user.uid, streamResult.usage); setUserTokensUsed(prev => prev + (streamResult.usage.totalTokens || 0)); }

      // Post-process: replace placeholder images with real Unsplash photos
      setGenerationStatus('Enhancing images...');
      setGeneratedFiles(prev => {
        replaceImagesInFiles(prev).then(updated => {
          if (activeSessionRef.current === currentSessionId) {
            setGeneratedFiles(updated);
          }
        });
        return prev;
      });

      // Mark generation complete
      setGeneratingFiles(prev => {
        setMessages(msgs => [...msgs, {
          role: 'model',
          type: 'files-complete',
          files: prev.length > 0 ? prev : ['index.html']
        }]);
        return [];
      });

    } catch (error) {
      if (error.name === 'AbortError') {
        // User stopped generation — keep partial output, add info message
        setGeneratingFiles(prev => {
          if (prev.length > 0) {
            setMessages(msgs => [...msgs, { role: 'model', type: 'files-complete', files: prev }]);
          }
          return [];
        });
      } else {
        setMessages(prev => [...prev, { role: 'model', type: 'error', content: `Error: ${error.message}. Please try again.` }]);
      }
    } finally {
      abortControllerRef.current = null;
      if (activeSessionRef.current === currentSessionId) {
        setIsGenerating(false);
        setGenerationStatus('');
        setGeneratingFiles([]);
      }
    }
  };

  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  const handleExport = async (format) => {
    const currentHTML = generatedFiles[activeFileName];
    if (!currentHTML && format !== 'zip') return;

    if (format === 'html') {
      const blob = new Blob([currentHTML], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = activeFileName || 'prototype.html';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setShowExportMenu(false);

    } else if (format === 'zip') {
      setShowExportMenu(false);
      setIsExportingReact(true);
      try {
        const JSZip = await loadJSZip();
        const zip = new JSZip();
        Object.entries(generatedFiles).forEach(([name, content]) => {
          // Strip injected script before zipping
          let clean = content.replace(/<script id="ai-architect-injected">[\s\S]*?<\/script>/, '');
          zip.file(name, clean);
        });
        const blob = await zip.generateAsync({ type: "blob" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'Architect_Project.zip';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } catch (err) {
        setMessages(prev => [...prev, { role: 'model', type: 'error', content: `ZIP Export Error: ${err.message}` }]);
      } finally {
        setIsExportingReact(false);
      }

    } else if (format === 'react') {
      if (isTokenLimitReached) { alert('Token limit reached. Contact admin to reset.'); setShowExportMenu(false); return; }
      setShowExportMenu(false);
      setIsExportingReact(true);

      const parser = new DOMParser();
      const doc = parser.parseFromString(currentHTML, 'text/html');
      doc.querySelectorAll('script').forEach(s => s.remove());
      const cleanHTMLForAI = doc.body.innerHTML;

      try {
        const prompt = `Convert the following HTML into a clean, valid functional React component using Tailwind CSS.
        Rules:
        1. Export default a functional component named '${activeFileName.replace(/\..+$/, '').replace(/^\w/, c => c.toUpperCase())}'. Include import React.
        2. Convert all 'class' attributes to 'className'.
        3. Convert SVG attributes to camelCase JSX equivalents.
        4. Fix self-closing tags.
        5. Return ONLY the raw file string. Do NOT wrap in \`\`\`jsx.

        HTML TO CONVERT:
        ${cleanHTMLForAI}`;

        const { text: response, usage } = await generateAIResponse(prompt, "You are an expert React developer specializing in HTML-to-JSX conversion.");
        if (user && usage) { trackTokenUsage(user.uid, usage); setUserTokensUsed(prev => prev + (usage.totalTokens || 0)); }
        let content = response.replace(/^```(jsx|react|javascript|js)?\n?/, '').replace(/\n?```$/, '').trim();

        const blob = new Blob([content], { type: 'text/javascript' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${activeFileName.replace(/\..+$/, '')}.jsx`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } catch (error) {
        setMessages(prev => [...prev, { role: 'model', type: 'error', content: `React Export Error: ${error.message}` }]);
      } finally {
        setIsExportingReact(false);
      }

    } else if (format === 'flutter') {
      if (isTokenLimitReached) { alert('Token limit reached. Contact admin to reset.'); setShowExportMenu(false); return; }
      setShowExportMenu(false);
      setIsExportingFlutter(true);

      const parser = new DOMParser();
      const doc = parser.parseFromString(currentHTML, 'text/html');
      doc.querySelectorAll('script').forEach(s => s.remove());
      const cleanHTMLForAI = doc.body.innerHTML;

      try {
        const widgetName = activeFileName.replace(/\..+$/, '').replace(/(^|[_\-. ])(\w)/g, (_, _s, c) => c.toUpperCase());

        const prompt = `Convert the following HTML into a single-file Flutter widget using Material Design.
        Rules:
        1. Create a StatelessWidget named '${widgetName}'.
        2. Include all necessary imports (material.dart only).
        3. Include a main() function with runApp() that wraps the widget in MaterialApp(home: Scaffold(body: ${widgetName}())).
        4. Convert all CSS styles to Flutter equivalents (Container, Padding, Row, Column, Text, etc.).
        5. Use const constructors where possible.
        6. Convert colors from hex to Color(0xFF______) format. NEVER use Tailwind/CSS color names like Colors.emerald, Colors.slate, Colors.zinc etc. Only use valid Flutter Colors.* constants (e.g. Colors.green, Colors.teal, Colors.blue, Colors.red, Colors.grey, Colors.orange, Colors.purple, Colors.cyan, Colors.amber, Colors.indigo, Colors.pink, Colors.yellow, Colors.brown, Colors.lime). For custom colors always use Color(0xFF______).
        7. Convert font sizes, padding, margin to double values.
        8. Use ListView for scrollable content.
        9. Handle images with Image.network() or placeholder Icon widgets.
        10. Return ONLY the raw Dart code. Do NOT wrap in \`\`\`dart.
        11. Code MUST compile without errors in DartPad. Do not use any non-existent classes, methods or properties.

        HTML TO CONVERT:
        ${cleanHTMLForAI}`;

        const { text: response, usage } = await generateAIResponse(prompt, "You are an expert Flutter/Dart developer specializing in HTML-to-Flutter conversion. You write clean, single-file Dart code compatible with DartPad.");
        if (user && usage) { trackTokenUsage(user.uid, usage); setUserTokensUsed(prev => prev + (usage.totalTokens || 0)); }
        let content = response.replace(/^```(dart|flutter)?\n?/, '').replace(/\n?```$/, '').trim();

        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${activeFileName.replace(/\..+$/, '')}.dart`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } catch (error) {
        setMessages(prev => [...prev, { role: 'model', type: 'error', content: `Flutter Export Error: ${error.message}` }]);
      } finally {
        setIsExportingFlutter(false);
      }
    }
  };

  // --- Publish / Unpublish ---
  useEffect(() => {
    if (!activeSessionId) { setPublishInfo(null); return; }
    getPublishInfo(activeSessionId).then(info => setPublishInfo(info)).catch(() => setPublishInfo(null));
  }, [activeSessionId]);

  const handlePublish = async () => {
    if (!user || !activeSessionId || Object.keys(generatedFiles).length === 0) return;
    setIsPublishing(true);
    try {
      const title = chatSessions[activeSessionId]?.title || 'Untitled';
      const result = await publishSite(user.uid, activeSessionId, generatedFiles, title);
      setPublishInfo(result);
      setShowPublishToast(true);
      navigator.clipboard.writeText(result.url).catch(() => { });
      setTimeout(() => setShowPublishToast(false), 4000);
    } catch (e) {
      console.error('Publish failed:', e);
      setMessages(prev => [...prev, { role: 'model', type: 'error', content: `Publish failed: ${e.message}` }]);
    }
    setIsPublishing(false);
    setShowExportMenu(false);
  };

  const handleUnpublish = async () => {
    if (!activeSessionId) return;
    setIsPublishing(true);
    try {
      await unpublishSite(activeSessionId);
      setPublishInfo(null);
    } catch (e) {
      console.error('Unpublish failed:', e);
    }
    setIsPublishing(false);
  };

  const currentPreviewHTML = generatedFiles[activeFileName] || '';
  const codeViewValue = codeEditValue !== null ? codeEditValue : currentPreviewHTML;
  const iframeSource = currentPreviewHTML ? currentPreviewHTML.replace('</body>', `${getInjectionScript()}</body>`) : '';

  // Reset code edit buffer when file changes or generation updates files externally
  useEffect(() => { setCodeEditValue(null); }, [activeFileName]);
  useEffect(() => {
    if (codeEditTimerRef.current) return; // don't reset during active typing
    setCodeEditValue(null);
  }, [generatedFiles]);

  // Write to iframe using srcdoc (browser auto-closes incomplete tags gracefully)
  const writeToIframe = useCallback((html) => {
    const iframe = iframeRef.current;
    if (!iframe || !html) return;
    iframe.srcdoc = html;
    lastWrittenRef.current = html;
    // Post mode message after iframe loads new content
    const onLoad = () => {
      iframe.removeEventListener('load', onLoad);
      try {
        if (iframe.contentWindow) {
          iframe.contentWindow.postMessage({ type: 'MODE_CHANGE', mode: workspaceMode }, '*');
        }
      } catch { /* cross-origin */ }
    };
    iframe.addEventListener('load', onLoad);
  }, [workspaceMode]);

  // When active file changes, force a fresh write
  const prevActiveFileRef = useRef(activeFileName);
  useEffect(() => {
    if (activeFileName !== prevActiveFileRef.current) {
      prevActiveFileRef.current = activeFileName;
      lastWrittenRef.current = '';
    }
  }, [activeFileName]);

  useEffect(() => {
    if (!iframeSource || iframeSource === lastWrittenRef.current) return;
    pendingIframeSourceRef.current = iframeSource;

    // Skip rewrite when the change came from within the iframe (manual edit)
    if (skipNextIframeWriteRef.current) {
      skipNextIframeWriteRef.current = false;
      lastWrittenRef.current = iframeSource;
      return;
    }

    if (isGenerating) {
      if (!iframeWriteTimerRef.current) {
        iframeWriteTimerRef.current = setTimeout(() => {
          iframeWriteTimerRef.current = null;
          const pending = pendingIframeSourceRef.current;
          if (pending && pending !== lastWrittenRef.current) {
            writeToIframe(pending);
          }
        }, 800);
      }
    } else {
      clearTimeout(iframeWriteTimerRef.current);
      iframeWriteTimerRef.current = null;
      writeToIframe(iframeSource);
    }
  }, [iframeSource, isGenerating, writeToIframe]);

  // Force final render when generation completes
  useEffect(() => {
    if (!isGenerating) {
      const timer = setTimeout(() => {
        const finalSource = pendingIframeSourceRef.current || iframeSource;
        if (finalSource && finalSource !== lastWrittenRef.current) {
          clearTimeout(iframeWriteTimerRef.current);
          iframeWriteTimerRef.current = null;
          writeToIframe(finalSource);
        }
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [isGenerating, writeToIframe, iframeSource]);

  // Cleanup on unmount
  useEffect(() => {
    return () => clearTimeout(iframeWriteTimerRef.current);
  }, []);

  // When leaving code mode: flush pending code edits and force iframe re-render
  const prevModeRef = useRef(workspaceMode);
  useEffect(() => {
    const wasCode = prevModeRef.current === 'code';
    prevModeRef.current = workspaceMode;
    if (wasCode && workspaceMode !== 'code') {
      // Flush any pending code edit
      if (codeEditTimerRef.current) {
        clearTimeout(codeEditTimerRef.current);
        codeEditTimerRef.current = null;
        if (codeEditValue !== null) {
          setGeneratedFiles(prev => ({ ...prev, [activeFileName]: codeEditValue }));
        }
      }
      setCodeEditValue(null);
      // Reset so the new iframe gets written to
      lastWrittenRef.current = '';
    }
    sendToIframe({ type: 'MODE_CHANGE', mode: workspaceMode });
  }, [workspaceMode]);

  if (!sessionsLoaded) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-[#A78BFA] border-t-transparent rounded-full animate-spin" />
        <span className="text-sm text-slate-500">Loading sessions...</span>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">

      {!isFullscreen && (
        <div className="w-[380px] flex flex-col bg-white border-r border-slate-200 shadow-sm z-10 flex-shrink-0 transition-all duration-300 relative overflow-hidden">

          {/* Chat History Sidebar Overlay */}
          <div className={`absolute top-0 left-0 w-full h-full bg-white z-[60] flex flex-col transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
            <div className="h-16 border-b border-slate-100 flex items-center justify-between px-4 shrink-0 bg-slate-50/50">
              <div className="flex items-center gap-2 font-semibold text-slate-800">
                <Clock className="w-5 h-5 text-slate-500" />
                Chat History
              </div>
              <button onClick={() => setIsSidebarOpen(false)} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-md transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-slate-50/30 custom-scrollbar">
              {Object.values(chatSessions).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)).map(chat => (
                <div
                  key={chat.id}
                  onClick={() => handleSwitchChat(chat.id)}
                  className={`group p-3 rounded-xl cursor-pointer border transition-all ${activeSessionId === chat.id ? 'bg-white border-[#A78BFA] shadow-sm' : 'bg-transparent border-slate-200 hover:bg-white hover:shadow-sm'}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <MessageSquare className={`w-4 h-4 shrink-0 ${activeSessionId === chat.id ? 'text-[#A78BFA]' : 'text-slate-400'}`} />
                      <span className="text-sm font-medium text-slate-700 truncate">{chat.title}</span>
                    </div>
                    <button
                      onClick={(e) => handleDeleteChat(chat.id, e)}
                      className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-2 ml-6 flex items-center gap-2">
                    <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-[9px]">{chat.id}</span>
                    {chat.createdAt && new Date(chat.createdAt).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 border-t border-slate-100 bg-white shrink-0 space-y-3">
              <button onClick={handleNewChat} className="w-full flex items-center justify-center gap-2 bg-[#A78BFA] hover:bg-[#9061F9] text-white py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-sm">
                <PlusCircle className="w-4 h-4" /> Start New Design
              </button>
              {user && (
                <div className="px-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      <img src={user.photoURL} alt="" className="w-7 h-7 rounded-full border border-slate-200 shrink-0" referrerPolicy="no-referrer" />
                      <span className="text-xs text-slate-600 truncate">{user.displayName || user.email}</span>
                    </div>
                    <button onClick={() => { logout(); navigate('/'); }} className="text-xs text-slate-400 hover:text-red-500 transition-colors shrink-0" title="Sign Out">
                      Sign Out
                    </button>
                  </div>
                  {tokenLimit > 0 && (
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <Zap className={`w-3 h-3 ${isTokenLimitReached ? 'text-red-500' : 'text-amber-500'}`} />
                          <span className={`text-[10px] font-medium ${isTokenLimitReached ? 'text-red-600' : 'text-slate-500'}`}>
                            {formatTokens(userTokensUsed)} / {formatTokens(tokenLimit)}
                          </span>
                        </div>
                        <span className={`text-[10px] ${isTokenLimitReached ? 'text-red-500 font-semibold' : 'text-slate-400'}`}>
                          {isTokenLimitReached ? 'Limit reached' : `${Math.round(tokenUsagePercent)}%`}
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${isTokenLimitReached ? 'bg-red-500' : tokenUsagePercent > 80 ? 'bg-amber-500' : 'bg-[#A78BFA]'}`}
                          style={{ width: `${tokenUsagePercent}%` }}
                        />
                      </div>
                      {isTokenLimitReached && (
                        <button
                          onClick={() => setShowPlanSelector(true)}
                          className="w-full py-1.5 text-[10px] font-semibold text-white bg-[#A78BFA] hover:bg-[#9061F9] rounded-lg transition-colors"
                        >
                          Upgrade Plan
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="h-16 border-b border-slate-100 flex items-center justify-between px-4 shrink-0 relative">
            <div className="flex items-center gap-2 font-semibold text-slate-800">
              <button onClick={() => setIsSidebarOpen(true)} className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded mr-1">
                <Menu className="w-5 h-5" />
              </button>
              <Box className="w-5 h-5 text-[#A78BFA]" /> AI Architect
            </div>
            <div className="flex items-center gap-2">
              <button onClick={handleNewChat} className="p-1.5 text-slate-500 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 rounded-md transition-colors" title="New Chat">
                <Plus className="w-4 h-4" />
              </button>
              <button onClick={() => navigate('/')} className="text-xs font-medium text-slate-500 hover:text-slate-900 bg-slate-100 px-3 py-1.5 rounded-md transition-colors">Exit</button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50 custom-scrollbar">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm whitespace-pre-wrap ${msg.role === 'user' ? 'bg-[#A78BFA] text-white rounded-br-none' : msg.type === 'error' ? 'bg-red-50 border border-red-100 text-red-700 rounded-bl-none' : 'bg-white border border-slate-100 text-slate-700 rounded-bl-none'}`}>
                  {msg.type === 'status' ? (
                    <div className="flex items-center gap-2 font-medium text-emerald-600"><Check className="w-4 h-4" /> {msg.content}</div>
                  ) : msg.type === 'files-complete' ? (
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2 font-medium text-emerald-600">
                        <Check className="w-4 h-4" /> Generation Complete
                      </div>
                      <div className="flex flex-col gap-1.5 mt-1">
                        {msg.files?.map(f => (
                          <div key={f} className="text-xs text-slate-600 flex items-center gap-2 bg-slate-50 p-1.5 rounded-md border border-slate-100">
                            <FileCode className="w-3.5 h-3.5 text-[#A78BFA]" /> {f}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2">
                      {msg.content}
                      {msg.attachments?.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-1">
                          {msg.attachments.map((att, i) => (
                            att.type?.startsWith('image/') ? (
                              <img key={i} src={att.data} alt={att.name} onClick={() => setPreviewItem({ kind: 'image', data: att.data, name: att.name })} className="w-16 h-16 object-cover rounded-lg border border-white/20 cursor-pointer hover:opacity-80 transition-opacity" />
                            ) : (
                              <button key={i} onClick={() => setPreviewItem({ kind: att.type === 'application/pdf' ? 'pdf' : 'text', data: att.data, content: att.content, name: att.name, type: att.type })} className="flex items-center gap-1.5 bg-white/10 border border-white/15 rounded-lg px-2.5 py-1.5 hover:bg-white/20 transition-colors">
                                {att.type === 'application/pdf' ? <File className="w-3.5 h-3.5 text-red-300" /> : <FileText className="w-3.5 h-3.5 text-blue-300" />}
                                <span className="text-[11px] text-white/80 truncate max-w-[100px]">{att.name}</span>
                              </button>
                            )
                          ))}
                        </div>
                      )}
                      {msg.template && (
                        <button onClick={() => { const t = TEMPLATES.find(tp => tp.name === msg.template.name); if (t?.source === 'firestore') { const cached = templateHtmlCache[t.id]; if (cached) setPreviewItem({ kind: 'srcdoc', html: cached, name: t.name, color: t.color }); else fetchTemplateHtml(t.id).then(html => { setTemplateHtmlCache(prev => ({ ...prev, [t.id]: html })); setPreviewItem({ kind: 'srcdoc', html, name: t.name, color: t.color }); }); } else if (t?.file) setPreviewItem({ kind: 'html', file: `/templates/${t.file}`, name: t.name, color: t.color }); }} className="flex items-center gap-2 bg-white/10 border border-white/15 rounded-lg px-2.5 py-1.5 mt-1 w-max hover:bg-white/20 transition-colors">
                          <div className={`w-5 h-5 rounded ${msg.template.color} border border-white/20 shrink-0`}></div>
                          <span className="text-[11px] text-white/80">{msg.template.name}</span>
                          <Eye className="w-3 h-3 text-white/50" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Live Progress To-Do List Tracker */}
            {isGenerating && (
              <div className="flex justify-start">
                <div className="bg-white border border-slate-100 rounded-2xl rounded-bl-none px-4 py-3 shadow-sm flex flex-col gap-3 min-w-[200px]">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full border-2 border-[#A78BFA] border-t-transparent animate-spin shrink-0"></div>
                    <span className="text-sm text-slate-700 font-medium">Architecting...</span>
                  </div>

                  {generatingFiles.length > 0 && (
                    <div className="flex flex-col gap-2 pl-7 border-l-2 border-slate-100 ml-1.5 mt-1">
                      {generatingFiles.map((file, i) => {
                        const isLast = i === generatingFiles.length - 1;
                        return (
                          <div key={file} className="flex items-center gap-2 text-xs animate-fade-in">
                            {isLast ? (
                              <div className="w-3 h-3 rounded-full border-2 border-[#A78BFA] border-t-transparent animate-spin shrink-0"></div>
                            ) : (
                              <Check className="w-3 h-3 text-emerald-500 shrink-0" />
                            )}
                            <span className={isLast ? "text-[#A78BFA] font-medium" : "text-slate-500"}>
                              {file}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <div className="text-[10px] text-slate-400 pl-7">{generationStatus}</div>
                </div>
              </div>
            )}
            <div ref={endOfChatRef} />
          </div>

          <div className="p-4 bg-white border-t border-slate-100 flex flex-col gap-3 relative shrink-0">
            {showTemplateModal && (() => {
              const filtered = TEMPLATES.filter(t =>
                t.name.toLowerCase().includes(templateSearch.toLowerCase()) ||
                t.desc.toLowerCase().includes(templateSearch.toLowerCase())
              );
              const previewTemplate = TEMPLATES.find(t => t.id === templatePreviewId);
              return (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-6" onClick={() => { setShowTemplateModal(false); setTemplateSearch(''); setTemplatePreviewId(null); }}>
                  <div className="bg-[#141414] border border-[#2a2a2a] rounded-2xl shadow-2xl w-full max-w-4xl h-[520px] flex overflow-hidden" onClick={e => e.stopPropagation()}>

                    {/* Left Panel — Search + List */}
                    <div className="w-[320px] flex flex-col border-r border-[#2a2a2a] shrink-0">
                      <div className="px-4 py-3 border-b border-[#2a2a2a] flex items-center justify-between">
                        <span className="text-sm font-semibold text-zinc-300">Design DNA Templates</span>
                        <button onClick={() => { setShowTemplateModal(false); setTemplateSearch(''); setTemplatePreviewId(null); }} className="p-1 text-zinc-500 hover:text-white rounded-md transition-colors"><X className="w-4 h-4" /></button>
                      </div>
                      <div className="px-3 py-2 border-b border-[#2a2a2a]">
                        <div className="flex items-center gap-2 bg-[#1c1c1c] border border-[#333] rounded-lg px-3 py-2">
                          <Search className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                          <input
                            type="text"
                            value={templateSearch}
                            onChange={e => setTemplateSearch(e.target.value)}
                            placeholder="Search templates..."
                            className="bg-transparent text-sm text-white placeholder:text-zinc-600 outline-none w-full"
                            autoFocus
                          />
                          {templateSearch && <button onClick={() => setTemplateSearch('')} className="text-zinc-500 hover:text-white"><X className="w-3 h-3" /></button>}
                        </div>
                      </div>
                      <div className="flex-1 overflow-y-auto p-2 space-y-0.5 custom-scrollbar">
                        {filtered.length === 0 && <div className="text-center text-zinc-600 text-xs py-8">No templates found</div>}
                        {filtered.map(t => (
                          <button
                            key={t.id}
                            onMouseEnter={() => setTemplatePreviewId(t.id)}
                            onClick={() => { setSelectedTemplateId(t.id); setShowTemplateModal(false); setTemplateSearch(''); setTemplatePreviewId(null); }}
                            className={`w-full flex items-center gap-3 p-2.5 rounded-xl text-left transition-all ${templatePreviewId === t.id ? 'bg-white/10 ring-1 ring-[#A78BFA]/40' : 'hover:bg-white/5'} ${selectedTemplateId === t.id ? 'ring-1 ring-[#A78BFA]' : ''}`}
                          >
                            <div className={`w-9 h-9 rounded-lg ${t.color} flex-shrink-0 border border-white/10 shadow-sm`}></div>
                            <div className="min-w-0">
                              <div className="text-white text-sm font-medium leading-tight truncate">{t.name}</div>
                              <div className="text-zinc-500 text-[11px] mt-0.5 truncate">{t.desc}</div>
                            </div>
                            {selectedTemplateId === t.id && <Check className="w-4 h-4 text-[#A78BFA] shrink-0 ml-auto" />}
                          </button>
                        ))}
                      </div>
                      <div className="px-3 py-2 border-t border-[#2a2a2a] text-[10px] text-zinc-600 text-center">{TEMPLATES.length} templates available</div>
                    </div>

                    {/* Right Panel — Live Preview */}
                    <div className="flex-1 flex flex-col bg-[#0a0a0a]">
                      {previewTemplate ? (
                        <>
                          <div className="px-4 py-3 border-b border-[#2a2a2a] flex items-center justify-between">
                            <div>
                              <div className="text-sm font-semibold text-white">{previewTemplate.name}</div>
                              <div className="text-[11px] text-zinc-500 mt-0.5">{previewTemplate.desc}</div>
                            </div>
                            <button
                              onClick={() => { setSelectedTemplateId(previewTemplate.id); setShowTemplateModal(false); setTemplateSearch(''); setTemplatePreviewId(null); }}
                              className="px-4 py-1.5 bg-[#A78BFA] hover:bg-[#9061F9] text-white text-xs font-semibold rounded-lg transition-colors shadow-sm"
                            >
                              Use Template
                            </button>
                          </div>
                          <div className="flex-1 relative overflow-hidden rounded-br-2xl">
                            <iframe
                              key={previewTemplate.id}
                              src={`/templates/${previewTemplate.file}`}
                              className="absolute inset-0 w-[200%] h-[200%] origin-top-left border-0"
                              style={{ transform: 'scale(0.5)' }}
                              sandbox="allow-scripts"
                              title={previewTemplate.name}
                            />
                          </div>
                        </>
                      ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-zinc-600 gap-3">
                          <Eye className="w-10 h-10 text-zinc-700" />
                          <div className="text-sm font-medium">Hover a template to preview</div>
                          <div className="text-xs text-zinc-700">Click to select as Design DNA</div>
                        </div>
                      )}
                    </div>

                  </div>
                </div>
              );
            })()}

            <div className="bg-[#111111] rounded-2xl p-3 flex flex-col shadow-md border border-zinc-800">
              {selectedTemplateId && (
                <div className="flex items-center gap-3 bg-[#0d1610] border border-[#1b3120] rounded-xl p-2 pr-10 relative w-max mb-3 shadow-sm">
                  <div className={`w-14 h-10 ${TEMPLATES.find(t => t.id === selectedTemplateId)?.color} rounded-lg border border-white/10`}></div>
                  <div className="flex flex-col">
                    <span className="text-white font-semibold text-sm leading-tight">{TEMPLATES.find(t => t.id === selectedTemplateId)?.name} Preview</span>
                    <span className="text-zinc-400 text-xs leading-tight mt-0.5">Template</span>
                  </div>
                  <button onClick={() => { setSelectedTemplateId(null); setTemplateDNA(''); }} className="absolute top-2 right-2 p-1 text-zinc-500 hover:text-white rounded-md transition-colors"><X className="w-3.5 h-3.5" /></button>
                </div>
              )}

              {attachments.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {attachments.map((att, idx) => (
                    <div key={idx} className="relative group bg-[#1c1c1c] border border-zinc-800 rounded-lg p-1.5 pr-8 flex items-center gap-2 max-w-[150px]">
                      {att.type.startsWith('image/') ? <img src={att.data} alt="preview" className="w-6 h-6 object-cover rounded" /> : att.type === 'application/pdf' ? <File className="w-5 h-5 text-red-400 ml-1" /> : <FileText className="w-5 h-5 text-blue-400 ml-1" />}
                      <span className="text-xs text-zinc-300 truncate">{att.name}</span>
                      <button onClick={() => removeAttachment(idx)} className="absolute right-1 top-1/2 -translate-y-1/2 p-1 bg-black/50 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity"><X className="w-3 h-3" /></button>
                    </div>
                  ))}
                </div>
              )}

              {isTokenLimitReached && (
                <div className="flex items-center justify-between bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2 mb-2">
                  <span className="text-xs text-red-400">Token limit reached.</span>
                  <button onClick={() => setShowPlanSelector(true)} className="text-xs font-semibold text-[#A78BFA] hover:text-white transition-colors">
                    Upgrade Plan
                  </button>
                </div>
              )}

              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                onPaste={handlePaste}
                placeholder={isTokenLimitReached ? "Token limit reached..." : "Describe your architecture or paste an image..."}
                className="bg-transparent text-white placeholder:text-zinc-500 w-full resize-none outline-none text-sm px-1 min-h-[50px] dark-scrollbar"
                disabled={isTokenLimitReached}
              />

              <div className="flex items-center justify-between mt-2 pt-1">
                <div className="flex items-center gap-2">
                  <button onClick={() => setShowTemplateModal(!showTemplateModal)} className={`flex items-center justify-center text-zinc-300 hover:text-white hover:bg-white/10 w-8 h-8 rounded-lg border transition-colors ${showTemplateModal || selectedTemplateId ? 'bg-white/10 border-white/20' : 'bg-transparent border-transparent'}`} title="Design DNA Templates"><AtSign className="w-4 h-4" /></button>
                  <input type="file" multiple accept="image/*,.pdf,.md,.txt" className="hidden" ref={fileInputRef} onChange={handleFileChange} />
                  <button onClick={() => fileInputRef.current?.click()} className="flex items-center justify-center text-zinc-300 hover:text-white bg-transparent hover:bg-white/10 w-8 h-8 rounded-lg border border-transparent transition-colors" title="Attach Files"><Paperclip className="w-4 h-4" /></button>
                </div>
                {isGenerating ? (
                  <button onClick={handleStop} className="flex items-center justify-center bg-red-500 hover:bg-red-600 text-white w-8 h-8 rounded-lg transition-colors shadow-sm animate-pulse" title="Stop generating"><Square className="w-3.5 h-3.5 fill-current" /></button>
                ) : (
                  <button onClick={handleSend} disabled={!input.trim() && attachments.length === 0} className="flex items-center justify-center bg-[#A78BFA] hover:bg-[#9061F9] text-white w-8 h-8 rounded-lg transition-colors disabled:opacity-50 disabled:hover:bg-[#A78BFA] shadow-sm"><ArrowUp className="w-4 h-4" /></button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col bg-slate-200/50 transition-all duration-300 min-w-0 relative">
        <div className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shadow-sm z-10 shrink-0">

          {/* Layout Controls & Undo/Redo */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
              <button onClick={() => setDeviceMode('desktop')} className={`p-1.5 rounded-md transition-all ${deviceMode === 'desktop' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`} title="Desktop View"><Monitor className="w-4 h-4" /></button>
              <button onClick={() => setDeviceMode('mobile')} className={`p-1.5 rounded-md transition-all ${deviceMode === 'mobile' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`} title="Mobile View"><Smartphone className="w-4 h-4" /></button>
            </div>

            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
              <button
                onClick={handleUndo}
                disabled={historyIndex <= 0}
                className="p-1.5 rounded-md text-slate-500 hover:text-slate-900 hover:bg-white disabled:opacity-40 disabled:hover:bg-transparent transition-all"
                title="Undo (Ctrl+Z)"
              ><Undo className="w-4 h-4" /></button>
              <button
                onClick={handleRedo}
                disabled={historyIndex >= history.length - 1}
                className="p-1.5 rounded-md text-slate-500 hover:text-slate-900 hover:bg-white disabled:opacity-40 disabled:hover:bg-transparent transition-all"
                title="Redo (Ctrl+Y)"
              ><Redo className="w-4 h-4" /></button>
            </div>
          </div>

          {/* Mode Toggle (Preview vs Design vs Code) */}
          {Object.keys(generatedFiles).length > 0 && (
            <div className="flex bg-slate-100 p-1 rounded-lg absolute left-1/2 -translate-x-1/2 shadow-sm border border-slate-200">
              <button
                onClick={() => { setWorkspaceMode('preview'); closeFloatingEditor(); }}
                className={`px-4 py-1.5 rounded-md transition-all text-xs font-semibold flex items-center gap-1.5 ${workspaceMode === 'preview' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <Eye className="w-3.5 h-3.5" /> Preview
              </button>
              <button
                onClick={() => setWorkspaceMode('design')}
                className={`px-4 py-1.5 rounded-md transition-all text-xs font-semibold flex items-center gap-1.5 ${workspaceMode === 'design' ? 'bg-[#A78BFA] shadow-sm text-white' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <Edit2 className="w-3.5 h-3.5" /> Design
              </button>
              <button
                onClick={() => { setWorkspaceMode('code'); closeFloatingEditor(); }}
                className={`px-4 py-1.5 rounded-md transition-all text-xs font-semibold flex items-center gap-1.5 ${workspaceMode === 'code' ? 'bg-slate-800 shadow-sm text-white' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <Code className="w-3.5 h-3.5" /> Code
              </button>
            </div>
          )}

          {/* Export Controls */}
          <div className="flex items-center gap-4 justify-end">
            {publishInfo && (
              <button onClick={() => window.open(`/view/${publishInfo.slug}`, '_blank')} className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[10px] font-semibold hover:bg-emerald-100 transition-colors">
                <Globe className="w-3 h-3" /> Live
              </button>
            )}
            {Object.keys(generatedFiles).some(f => /\.(atom|molecule|organism)\.html$/i.test(f)) && (
              <button onClick={() => setShowComponentsModal(true)} className="flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-[#A78BFA] transition-colors">
                <Box className="w-4 h-4" /> Components
              </button>
            )}
            <div className="relative border-r border-slate-200 pr-4">
              <button onClick={() => setShowExportMenu(!showExportMenu)} disabled={Object.keys(generatedFiles).length === 0 || isExportingReact || isExportingFlutter} className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 disabled:opacity-50">
                {(isExportingReact || isExportingFlutter) ? (
                  <><div className="w-4 h-4 rounded-full border-2 border-slate-400 border-t-transparent animate-spin"></div> Exporting...</>
                ) : (
                  <><Download className="w-4 h-4" /> Export <ChevronDown className={`w-3 h-3 transition-transform ${showExportMenu ? 'rotate-180' : ''}`} /></>
                )}
              </button>
              {showExportMenu && !isExportingReact && !isExportingFlutter && (
                <div className="absolute right-4 top-full mt-3 w-56 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden z-50 animate-fade-in">
                  <button onClick={() => handleExport('html')} className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2 border-b border-slate-100 transition-colors">
                    <Code className="w-4 h-4 text-[#A78BFA]" />
                    <div className="flex flex-col"><span className="leading-tight">Current HTML</span><span className="text-[10px] text-slate-400 leading-tight">({activeFileName})</span></div>
                  </button>
                  <button onClick={() => handleExport('react')} className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2 border-b border-slate-100 transition-colors">
                    <Layout className="w-4 h-4 text-blue-500" />
                    <div className="flex flex-col"><span className="leading-tight">AI Export React</span><span className="text-[10px] text-slate-400 leading-tight">Convert current tab to JSX</span></div>
                  </button>
                  <button onClick={() => handleExport('flutter')} className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2 border-b border-slate-100 transition-colors">
                    <Smartphone className="w-4 h-4 text-cyan-500" />
                    <div className="flex flex-col"><span className="leading-tight">AI Export Flutter</span><span className="text-[10px] text-slate-400 leading-tight">Convert current tab to Dart</span></div>
                  </button>
                  <button onClick={() => handleExport('zip')} className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2 border-b border-slate-100 transition-colors">
                    <FolderDown className="w-4 h-4 text-emerald-500" />
                    <div className="flex flex-col"><span className="leading-tight">Download All HTML</span><span className="text-[10px] text-slate-400 leading-tight">ZIP Archive ({Object.keys(generatedFiles).length} files)</span></div>
                  </button>
                  <button onClick={handlePublish} disabled={isPublishing} className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition-colors">
                    {isPublishing ? (
                      <div className="w-4 h-4 rounded-full border-2 border-[#A78BFA] border-t-transparent animate-spin" />
                    ) : (
                      <Globe className="w-4 h-4 text-orange-500" />
                    )}
                    <div className="flex flex-col">
                      <span className="leading-tight">{publishInfo ? 'Update & Publish' : 'Publish Site'}</span>
                      <span className="text-[10px] text-slate-400 leading-tight">{publishInfo ? 'Update live site' : 'Get a shareable link'}</span>
                    </div>
                  </button>
                  {publishInfo && (
                    <>
                      <button onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/view/${publishInfo.slug}`); setShowExportMenu(false); }} className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2 border-t border-slate-100 transition-colors">
                        <Link className="w-4 h-4 text-[#A78BFA]" />
                        <div className="flex flex-col"><span className="leading-tight">Copy Link</span><span className="text-[10px] text-slate-400 leading-tight truncate max-w-[160px]">/view/{publishInfo.slug}</span></div>
                      </button>
                      <button onClick={() => window.open(`/view/${publishInfo.slug}`, '_blank')} className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition-colors">
                        <ExternalLink className="w-4 h-4 text-blue-500" />
                        <span className="leading-tight">Open Live Site</span>
                      </button>
                      <button onClick={handleUnpublish} disabled={isPublishing} className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 flex items-center gap-2 border-t border-slate-100 transition-colors">
                        <Unlink className="w-4 h-4" />
                        <span className="leading-tight">Unpublish</span>
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
            <button onClick={() => setIsFullscreen(!isFullscreen)} className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">
              {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Multi-File Tab Bar — Only shows pages (hides atoms/molecules/organisms) */}
        {Object.keys(generatedFiles).length > 0 && (() => {
          const allFiles = Object.keys(generatedFiles);
          const isComponentFile = (f) => /\.(atom|molecule|organism)\.html$/i.test(f);
          const pageFiles = allFiles.filter(f => !isComponentFile(f));
          const componentFiles = allFiles.filter(f => isComponentFile(f));
          const displayFiles = pageFiles.length > 0 ? pageFiles : allFiles;
          return (
            <div className="flex items-center gap-1 px-4 py-2 bg-slate-50 border-b border-slate-200 overflow-x-auto custom-scrollbar shrink-0 shadow-[inset_0_-2px_4px_rgba(0,0,0,0.02)]">
              {displayFiles.map(fileName => (
                <button
                  key={fileName}
                  onClick={() => { setActiveFileName(fileName); activeFileNameRef.current = fileName; closeFloatingEditor(); }}
                  className={`px-3 py-1.5 text-[11px] font-semibold rounded-md transition-all whitespace-nowrap border ${activeFileName === fileName ? 'bg-white border-slate-200 shadow-sm text-[#A78BFA]' : 'bg-transparent border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-100'}`}
                >
                  {fileName}
                </button>
              ))}
              {componentFiles.length > 0 && (
                <button
                  onClick={() => setShowComponentsModal(true)}
                  className="px-3 py-1.5 text-[11px] font-semibold rounded-md transition-all whitespace-nowrap border bg-transparent border-dashed border-slate-300 text-slate-400 hover:text-[#A78BFA] hover:border-[#A78BFA] hover:bg-purple-50 ml-1"
                >
                  <span className="flex items-center gap-1"><Box className="w-3 h-3" /> {componentFiles.length} Components</span>
                </button>
              )}
            </div>
          );
        })()}

        <div className={`flex-1 relative flex justify-center items-start ${deviceMode === 'mobile' && workspaceMode !== 'code' ? 'p-4 md:p-8 overflow-y-auto' : 'overflow-hidden'}`}>

          {selectedElement && workspaceMode === 'design' && (
            <div className="absolute top-4 right-4 w-[300px] max-h-[calc(100vh-100px)] bg-[#1c1c1c] border border-[#2e2e2e] rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] flex flex-col z-50 animate-fade-in overflow-hidden">

              {/* Toolbar & Context Menu Header */}
              <div className="flex items-center justify-between px-3 py-2 bg-[#252525] border-b border-[#2e2e2e] shrink-0 relative">
                <div className="flex items-center gap-2">
                  <div className="flex items-center bg-blue-600 text-white rounded text-[10px] font-bold tracking-wider overflow-hidden shadow-sm">
                    <span className="px-2 py-1 uppercase">{selectedElement.tagName}</span>
                    <button onClick={() => handleElementAction('move-up')} className="px-1.5 py-1 hover:bg-blue-700 border-l border-blue-500 transition-colors"><ArrowUp className="w-3 h-3" /></button>
                    <button onClick={() => handleElementAction('move-down')} className="px-1.5 py-1 hover:bg-blue-700 border-l border-blue-500 transition-colors"><ArrowDown className="w-3 h-3" /></button>
                  </div>
                </div>
                <div className="flex items-center gap-1 relative">
                  <button onClick={() => setShowElementMenu(!showElementMenu)} className="p-1 text-zinc-400 hover:text-white hover:bg-white/10 rounded transition-colors flex items-center justify-center">
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                  <button onClick={closeFloatingEditor} className="p-1 text-zinc-400 hover:text-white hover:bg-white/10 rounded transition-colors flex items-center justify-center">
                    <X className="w-4 h-4" />
                  </button>

                  {/* Dropdown Menu */}
                  {showElementMenu && (
                    <div className="absolute top-full right-0 mt-2 w-48 bg-[#1c1c1c] border border-[#2e2e2e] rounded-lg shadow-xl py-1 z-50 animate-fade-in">
                      <button onClick={() => { const t = document.createElement('textarea'); t.value = selectedElement.outerHTML; document.body.appendChild(t); t.select(); document.execCommand('copy'); document.body.removeChild(t); setShowElementMenu(false); }} className="w-full text-left px-3 py-1.5 text-xs text-zinc-300 hover:bg-white/10 flex items-center gap-2 transition-colors">
                        <Copy className="w-3 h-3" /> Copy Code
                      </button>
                      <button onClick={() => handleElementAction('duplicate')} className="w-full text-left px-3 py-1.5 text-xs text-zinc-300 hover:bg-white/10 flex items-center gap-2 transition-colors">
                        <CopyPlus className="w-3 h-3" /> Duplicate
                      </button>
                      <button onClick={() => handleElementAction('select-parent')} className="w-full text-left px-3 py-1.5 text-xs text-zinc-300 hover:bg-white/10 flex items-center gap-2 border-b border-[#2e2e2e] pb-2 mb-1 transition-colors">
                        <CornerLeftUp className="w-3 h-3" /> Select Parent
                      </button>
                      <button onClick={() => { setEditorTab('ai'); setShowElementMenu(false); }} className="w-full text-left px-3 py-1.5 text-xs text-[#A78BFA] hover:bg-white/10 flex items-center gap-2 transition-colors">
                        <Bot className="w-3 h-3" /> Edit with AI
                      </button>
                      <button onClick={() => handleElementAction('delete')} className="w-full text-left px-3 py-1.5 text-xs text-red-400 hover:bg-white/10 flex items-center gap-2 transition-colors">
                        <Trash className="w-3 h-3" /> Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="px-3 py-2 border-b border-[#2e2e2e] bg-[#111111] overflow-x-auto custom-scrollbar flex items-center gap-1.5 whitespace-nowrap shrink-0">
                {selectedElement.domPath?.map((node, i) => (
                  <React.Fragment key={i}>
                    <span className={`text-[10px] ${i === selectedElement.domPath.length - 1 ? 'text-[#A78BFA] font-semibold' : 'text-zinc-500'}`}>{node}</span>
                    {i < selectedElement.domPath.length - 1 && <ChevronRight className="w-3 h-3 text-zinc-700" />}
                  </React.Fragment>
                ))}
              </div>

              <div className="flex bg-[#1c1c1c] border-b border-[#2e2e2e] shrink-0">
                <button onClick={() => setEditorTab('manual')} className={`flex-1 py-2.5 text-xs font-semibold transition-colors ${editorTab === 'manual' ? 'text-white border-b-2 border-[#A78BFA] bg-white/5' : 'text-zinc-500 hover:text-zinc-300'}`}>Design</button>
                <button onClick={() => setEditorTab('ai')} className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold transition-colors ${editorTab === 'ai' ? 'text-[#A78BFA] border-b-2 border-[#A78BFA] bg-purple-900/10' : 'text-zinc-500 hover:text-zinc-300'}`}><Bot className="w-3.5 h-3.5" /> AI Magic</button>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar bg-[#111111]">
                {editorTab === 'manual' ? (
                  <div className="pb-4">
                    <Accordion title="Structure & ID" defaultOpen={true}>
                      <div className="space-y-3">
                        <Field label="ID"><Input value={manualId} onChange={e => handleManualChange('id', e.target.value)} placeholder="e.g. hero-section" /></Field>
                        <div>
                          <label className="block text-[10px] text-zinc-500 mb-1">Tailwind Classes</label>
                          <textarea value={manualClasses} onChange={(e) => handleManualChange('class', e.target.value)} className="w-full bg-[#1c1c1c] border border-[#2e2e2e] rounded text-white text-xs p-2 h-16 resize-none outline-none focus:border-[#A78BFA] custom-scrollbar" spellCheck={false} />
                        </div>
                      </div>
                    </Accordion>

                    <Accordion title="Content" defaultOpen={true}>
                      <div className="space-y-3">
                        {selectedElement?.tagName.toLowerCase() === 'img' ? (
                          <>
                            <Field label="Image URL"><Input value={manualSrc} onChange={(e) => handleManualChange('src', e.target.value)} placeholder="https://..." /></Field>
                            <Field label="Alt Text"><Input value={manualAlt} onChange={(e) => handleManualChange('alt', e.target.value)} placeholder="Image description" /></Field>
                            <div className="pt-2 border-t border-[#2e2e2e]">
                              <label className="block text-[10px] text-zinc-500 mb-1.5">Unsplash Search</label>
                              <div className="flex gap-1.5">
                                <Input value={unsplashQuery} onChange={(e) => setUnsplashQuery(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') handleUnsplashSearch(unsplashQuery); }} placeholder="Search photos..." />
                                <button onClick={() => handleUnsplashSearch(unsplashQuery)} disabled={isSearchingUnsplash || !unsplashQuery.trim()} className="p-1.5 bg-[#A78BFA] hover:bg-[#9061F9] text-white rounded disabled:opacity-50 transition-colors shrink-0">
                                  {isSearchingUnsplash ? <div className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin"></div> : <Search className="w-3.5 h-3.5" />}
                                </button>
                              </div>
                              {unsplashResults.length > 0 && (
                                <div className="grid grid-cols-3 gap-1.5 mt-2 max-h-[180px] overflow-y-auto custom-scrollbar">
                                  {unsplashResults.map(photo => (
                                    <button key={photo.id} onClick={() => handleUnsplashSelect(photo)} className="relative group rounded-md overflow-hidden aspect-square border border-[#2e2e2e] hover:border-[#A78BFA] transition-colors">
                                      <img src={photo.urls.thumb} alt={photo.alt_description || ''} className="w-full h-full object-cover" />
                                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                                        <Check className="w-4 h-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                                      </div>
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                            <div className="pt-2 border-t border-[#2e2e2e]">
                              <label className="block text-[10px] text-zinc-500 mb-1.5">Hosted Images (PNG)</label>
                              <div className="flex gap-1.5 mb-2">
                                <Input value={hostedQuery} onChange={(e) => { setHostedQuery(e.target.value); setHostedResults(searchHostedImages(e.target.value)); }} placeholder="Search by tag..." />
                                <select value={hostedCategory} onChange={(e) => { setHostedCategory(e.target.value); setHostedResults(e.target.value ? searchHostedImages(e.target.value) : searchHostedImages(hostedQuery)); }} className="bg-[#1c1c1c] border border-[#2e2e2e] rounded text-zinc-300 text-[10px] px-1.5 outline-none focus:border-[#A78BFA] shrink-0">
                                  <option value="">All</option>
                                  {getCategories().map(cat => <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>)}
                                </select>
                              </div>
                              <div className="grid grid-cols-3 gap-1.5 max-h-[180px] overflow-y-auto custom-scrollbar">
                                {(hostedResults.length > 0 ? hostedResults : (!hostedQuery && !hostedCategory) ? searchHostedImages('') : []).map((img, i) => (
                                  <button key={i} onClick={() => { setManualSrc(img.url); handleManualChange('src', img.url); }} className="relative group rounded-md overflow-hidden aspect-square border border-[#2e2e2e] hover:border-[#A78BFA] transition-colors bg-[#1c1c1c]">
                                    <img src={img.url} alt={img.tags[0]} className="w-full h-full object-contain p-1" />
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                                      <Check className="w-4 h-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                    <div className="absolute bottom-0 left-0 right-0 bg-black/70 px-1 py-0.5 text-[8px] text-zinc-300 truncate opacity-0 group-hover:opacity-100 transition-opacity">{img.tags.slice(0, 3).join(', ')}</div>
                                  </button>
                                ))}
                              </div>
                            </div>
                          </>
                        ) : (
                          <>
                            <div>
                              <label className="block text-[10px] text-zinc-500 mb-1">Text Content</label>
                              <textarea value={manualText} onChange={(e) => handleManualChange('text', e.target.value)} placeholder="Enter text content..." className="w-full bg-[#1c1c1c] border border-[#2e2e2e] rounded text-white text-xs p-2 h-16 resize-none outline-none focus:border-[#A78BFA] custom-scrollbar" spellCheck={false} />
                            </div>
                            <div>
                              <label className="block text-[10px] text-zinc-500 mb-1">Inner HTML</label>
                              <textarea value={manualHtml} onChange={(e) => handleManualChange('html', e.target.value)} placeholder="<span>HTML markup...</span>" className="w-full bg-[#1c1c1c] border border-[#2e2e2e] rounded text-green-300 text-xs p-2 h-20 resize-none outline-none focus:border-[#A78BFA] font-mono custom-scrollbar" spellCheck={false} />
                            </div>
                          </>
                        )}
                      </div>
                    </Accordion>

                    {/* ─── TYPOGRAPHY ─── */}
                    <Accordion title="Typography">
                      <div className="space-y-3">
                        <Field label="Font Family">
                          <div className="relative">
                            <input
                              value={showFontPicker ? fontSearch : (manualStyles.fontFamily || '').replace(/"/g, '').split(',')[0].trim() || 'Inherit'}
                              onFocus={() => { setShowFontPicker(true); setFontSearch(''); }}
                              onChange={(e) => setFontSearch(e.target.value)}
                              placeholder="Search fonts..."
                              className="w-full bg-[#1c1c1c] border border-[#2e2e2e] rounded text-white text-xs px-2 py-1.5 outline-none focus:border-[#A78BFA]"
                            />
                            {showFontPicker && (
                              <>
                                <div className="fixed inset-0 z-10" onClick={() => setShowFontPicker(false)} />
                                <div className="absolute z-20 mt-1 w-full max-h-48 overflow-y-auto bg-[#1c1c1c] border border-[#2e2e2e] rounded shadow-xl custom-scrollbar">
                                  <button onClick={() => handleFontSelect('')} className="w-full text-left px-2 py-1.5 text-xs text-zinc-400 hover:bg-white/10 hover:text-white transition-colors">Inherit</button>
                                  {GOOGLE_FONTS.filter(f => f.toLowerCase().includes(fontSearch.toLowerCase())).map(f => (
                                    <button key={f} onClick={() => handleFontSelect(f)} className="w-full text-left px-2 py-1.5 text-xs text-white hover:bg-[#A78BFA]/30 transition-colors truncate">{f}</button>
                                  ))}
                                </div>
                              </>
                            )}
                          </div>
                        </Field>
                        <div className="grid grid-cols-2 gap-3">
                          <Field label="Size"><Input placeholder="16px" value={manualStyles.fontSize || ''} onChange={e => handleStyleChange('fontSize', e.target.value)} /></Field>
                          <Field label="Line Height"><Input placeholder="24" value={manualStyles.lineHeight || ''} onChange={e => handleStyleChange('lineHeight', e.target.value)} /></Field>
                        </div>
                        <Field label="Alignment">
                          <div className="flex bg-[#1c1c1c] border border-[#2e2e2e] rounded">
                            {[['left', <AlignLeft className="w-3.5 h-3.5" />], ['center', <AlignCenter className="w-3.5 h-3.5" />], ['right', <AlignRight className="w-3.5 h-3.5" />], ['justify', <AlignJustify className="w-3.5 h-3.5" />]].map(([val, icon]) => (
                              <button key={val} onClick={() => handleStyleChange('textAlign', val)} className={`flex-1 p-1.5 flex justify-center transition-colors ${manualStyles.textAlign === val ? 'text-white bg-white/10' : 'text-zinc-500 hover:text-white'}`}>{icon}</button>
                            ))}
                          </div>
                        </Field>
                        <div className="grid grid-cols-2 gap-3">
                          <Field label="Weight"><Select options={[{ label: 'Normal', value: 'normal' }, { label: '300', value: '300' }, { label: '400', value: '400' }, { label: '500', value: '500' }, { label: '600', value: '600' }, { label: '700', value: '700' }, { label: '800', value: '800' }, { label: '900', value: '900' }]} value={manualStyles.fontWeight || 'normal'} onChange={e => handleStyleChange('fontWeight', e.target.value)} /></Field>
                          <Field label="Style"><Select options={[{ label: 'Normal', value: 'normal' }, { label: 'Italic', value: 'italic' }]} value={manualStyles.fontStyle || 'normal'} onChange={e => handleStyleChange('fontStyle', e.target.value)} /></Field>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <Field label="Decoration"><Select options={[{ label: 'None', value: 'none' }, { label: 'Underline', value: 'underline' }, { label: 'Line-through', value: 'line-through' }, { label: 'Overline', value: 'overline' }]} value={(manualStyles.textDecoration || 'none').split(' ')[0]} onChange={e => handleStyleChange('textDecoration', e.target.value)} /></Field>
                          <Field label="Transform"><Select options={[{ label: 'None', value: 'none' }, { label: 'Uppercase', value: 'uppercase' }, { label: 'Lowercase', value: 'lowercase' }, { label: 'Capitalize', value: 'capitalize' }]} value={manualStyles.textTransform || 'none'} onChange={e => handleStyleChange('textTransform', e.target.value)} /></Field>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <Field label="Letter Spacing"><Input placeholder="0" value={manualStyles.letterSpacing || ''} onChange={e => handleStyleChange('letterSpacing', e.target.value)} /></Field>
                        </div>
                      </div>
                    </Accordion>

                    {/* ─── COLORS ─── */}
                    <Accordion title="Colors">
                      <div className="space-y-3">
                        <Field label="Text Color">
                          <div className="flex items-center gap-2 border border-[#2e2e2e] rounded bg-[#1c1c1c] p-1.5">
                            <div className="w-6 h-6 rounded border border-zinc-700 shrink-0 relative overflow-hidden" style={{ backgroundColor: manualStyles.color || '#000000' }}>
                              <input type="color" className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" value={manualStyles.color && manualStyles.color.startsWith('#') ? manualStyles.color : '#000000'} onChange={e => handleStyleChange('color', e.target.value)} />
                            </div>
                            <input className="bg-transparent flex-1 text-xs text-white outline-none font-mono" placeholder="#000000" value={manualStyles.color || ''} onChange={e => handleStyleChange('color', e.target.value)} />
                          </div>
                        </Field>
                        <Field label="Background">
                          <div className="flex items-center gap-2 border border-[#2e2e2e] rounded bg-[#1c1c1c] p-1.5">
                            <div className="w-6 h-6 rounded border border-zinc-700 shrink-0 relative overflow-hidden" style={{ backgroundColor: manualStyles.backgroundColor || 'transparent' }}>
                              {!manualStyles.backgroundColor && <div className="absolute inset-0 bg-red-500 w-px h-[150%] rotate-45 left-1/2 -top-1"></div>}
                              <input type="color" className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" value={manualStyles.backgroundColor && manualStyles.backgroundColor.startsWith('#') ? manualStyles.backgroundColor : '#ffffff'} onChange={e => handleStyleChange('backgroundColor', e.target.value)} />
                            </div>
                            <input className="bg-transparent flex-1 text-xs text-white outline-none font-mono" placeholder="transparent" value={manualStyles.backgroundColor || ''} onChange={e => handleStyleChange('backgroundColor', e.target.value)} />
                          </div>
                        </Field>
                      </div>
                    </Accordion>

                    {/* ─── BORDER ─── */}
                    <Accordion title="Border">
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <Field label="Width"><Input placeholder="0px" value={manualStyles.borderWidth || ''} onChange={e => handleStyleChange('borderWidth', e.target.value)} /></Field>
                          <Field label="Style"><Select options={[{ label: 'None', value: 'none' }, { label: 'Solid', value: 'solid' }, { label: 'Dashed', value: 'dashed' }, { label: 'Dotted', value: 'dotted' }, { label: 'Double', value: 'double' }]} value={manualStyles.borderStyle || 'none'} onChange={e => handleStyleChange('borderStyle', e.target.value)} /></Field>
                        </div>
                        <Field label="Color">
                          <div className="flex items-center gap-2 border border-[#2e2e2e] rounded bg-[#1c1c1c] p-1.5">
                            <div className="w-6 h-6 rounded border border-zinc-700 shrink-0 relative overflow-hidden" style={{ backgroundColor: manualStyles.borderColor || 'transparent' }}>
                              <input type="color" className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" value={manualStyles.borderColor && manualStyles.borderColor.startsWith('#') ? manualStyles.borderColor : '#000000'} onChange={e => handleStyleChange('borderColor', e.target.value)} />
                            </div>
                            <input className="bg-transparent flex-1 text-xs text-white outline-none font-mono" placeholder="#ffffff" value={manualStyles.borderColor || ''} onChange={e => handleStyleChange('borderColor', e.target.value)} />
                          </div>
                        </Field>
                        <Field label="Radius"><Input placeholder="0px" value={manualStyles.borderRadius || ''} onChange={e => handleStyleChange('borderRadius', e.target.value)} /></Field>
                      </div>
                    </Accordion>

                    {/* ─── SPACING ─── */}
                    <Accordion title="Spacing">
                      <div className="space-y-3">
                        <div className="bg-[#1c1c1c] border border-[#2e2e2e] rounded-lg p-2 relative text-[9px] text-zinc-500 text-center flex flex-col items-center justify-center aspect-square">
                          <span className="absolute top-1 pointer-events-none">Margin</span>
                          <div className="w-[80%] h-[80%] border border-zinc-700 bg-[#252525] relative flex flex-col items-center justify-center mt-3">
                            <span className="absolute top-1 pointer-events-none">Padding</span>
                            <div className="w-[60%] h-[60%] border border-zinc-600 bg-[#333] flex items-center justify-center mt-2 pointer-events-none"><span className="text-zinc-300">Content</span></div>
                            <input className="absolute top-4 w-8 bg-transparent text-center text-white outline-none text-[10px]" placeholder="0" value={manualStyles.paddingTop || ''} onChange={e => handleStyleChange('paddingTop', e.target.value)} />
                            <input className="absolute bottom-1 w-8 bg-transparent text-center text-white outline-none text-[10px]" placeholder="0" value={manualStyles.paddingBottom || ''} onChange={e => handleStyleChange('paddingBottom', e.target.value)} />
                            <input className="absolute left-1 w-8 bg-transparent text-center text-white outline-none text-[10px]" placeholder="0" value={manualStyles.paddingLeft || ''} onChange={e => handleStyleChange('paddingLeft', e.target.value)} />
                            <input className="absolute right-1 w-8 bg-transparent text-center text-white outline-none text-[10px]" placeholder="0" value={manualStyles.paddingRight || ''} onChange={e => handleStyleChange('paddingRight', e.target.value)} />
                          </div>
                          <input className="absolute top-5 w-8 bg-transparent text-center text-white outline-none text-[10px]" placeholder="0" value={manualStyles.marginTop || ''} onChange={e => handleStyleChange('marginTop', e.target.value)} />
                          <input className="absolute bottom-1 w-8 bg-transparent text-center text-white outline-none text-[10px]" placeholder="0" value={manualStyles.marginBottom || ''} onChange={e => handleStyleChange('marginBottom', e.target.value)} />
                          <input className="absolute left-1 w-8 bg-transparent text-center text-white outline-none text-[10px]" placeholder="0" value={manualStyles.marginLeft || ''} onChange={e => handleStyleChange('marginLeft', e.target.value)} />
                          <input className="absolute right-1 w-8 bg-transparent text-center text-white outline-none text-[10px]" placeholder="0" value={manualStyles.marginRight || ''} onChange={e => handleStyleChange('marginRight', e.target.value)} />
                        </div>
                      </div>
                    </Accordion>

                    {/* ─── SIZE ─── */}
                    <Accordion title="Size">
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <Field label="Width"><Input placeholder="auto" value={manualStyles.width || ''} onChange={e => handleStyleChange('width', e.target.value)} /></Field>
                          <Field label="Height"><Input placeholder="auto" value={manualStyles.height || ''} onChange={e => handleStyleChange('height', e.target.value)} /></Field>
                          <Field label="Min W"><Input placeholder="0px" value={manualStyles.minWidth || ''} onChange={e => handleStyleChange('minWidth', e.target.value)} /></Field>
                          <Field label="Max W"><Input placeholder="none" value={manualStyles.maxWidth || ''} onChange={e => handleStyleChange('maxWidth', e.target.value)} /></Field>
                          <Field label="Min H"><Input placeholder="0px" value={manualStyles.minHeight || ''} onChange={e => handleStyleChange('minHeight', e.target.value)} /></Field>
                          <Field label="Max H"><Input placeholder="none" value={manualStyles.maxHeight || ''} onChange={e => handleStyleChange('maxHeight', e.target.value)} /></Field>
                        </div>
                      </div>
                    </Accordion>

                    {/* ─── LAYOUT ─── */}
                    <Accordion title="Layout">
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <Field label="Display"><Select options={[{ label: 'Block', value: 'block' }, { label: 'Flex', value: 'flex' }, { label: 'Grid', value: 'grid' }, { label: 'Inline', value: 'inline' }, { label: 'Inline-Block', value: 'inline-block' }, { label: 'Inline-Flex', value: 'inline-flex' }, { label: 'None', value: 'none' }]} value={manualStyles.display || 'block'} onChange={e => handleStyleChange('display', e.target.value)} /></Field>
                          <Field label="Position"><Select options={[{ label: 'Static', value: 'static' }, { label: 'Relative', value: 'relative' }, { label: 'Absolute', value: 'absolute' }, { label: 'Fixed', value: 'fixed' }, { label: 'Sticky', value: 'sticky' }]} value={manualStyles.position || 'static'} onChange={e => handleStyleChange('position', e.target.value)} /></Field>
                        </div>
                        <div className="grid grid-cols-4 gap-2">
                          <Field label="T"><Input placeholder="auto" value={manualStyles.top || ''} onChange={e => handleStyleChange('top', e.target.value)} /></Field>
                          <Field label="R"><Input placeholder="auto" value={manualStyles.right || ''} onChange={e => handleStyleChange('right', e.target.value)} /></Field>
                          <Field label="B"><Input placeholder="auto" value={manualStyles.bottom || ''} onChange={e => handleStyleChange('bottom', e.target.value)} /></Field>
                          <Field label="L"><Input placeholder="auto" value={manualStyles.left || ''} onChange={e => handleStyleChange('left', e.target.value)} /></Field>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <Field label="Z-Index"><Input placeholder="auto" value={manualStyles.zIndex || ''} onChange={e => handleStyleChange('zIndex', e.target.value)} /></Field>
                          <Field label="Overflow"><Select options={[{ label: 'Visible', value: 'visible' }, { label: 'Hidden', value: 'hidden' }, { label: 'Scroll', value: 'scroll' }, { label: 'Auto', value: 'auto' }]} value={manualStyles.overflow || 'visible'} onChange={e => handleStyleChange('overflow', e.target.value)} /></Field>
                        </div>
                        <Field label="Visibility"><Select options={[{ label: 'Visible', value: 'visible' }, { label: 'Hidden', value: 'hidden' }, { label: 'Collapse', value: 'collapse' }]} value={manualStyles.visibility || 'visible'} onChange={e => handleStyleChange('visibility', e.target.value)} /></Field>
                      </div>
                    </Accordion>

                    {/* ─── FLEXBOX ─── */}
                    <Accordion title="Flexbox">
                      <div className="space-y-3">
                        <span className="text-[9px] text-zinc-500 italic">Container props (apply when display is flex/grid)</span>
                        <div className="grid grid-cols-2 gap-3">
                          <Field label="Direction"><Select options={[{ label: 'Row', value: 'row' }, { label: 'Row Reverse', value: 'row-reverse' }, { label: 'Column', value: 'column' }, { label: 'Col Reverse', value: 'column-reverse' }]} value={manualStyles.flexDirection || 'row'} onChange={e => handleStyleChange('flexDirection', e.target.value)} /></Field>
                          <Field label="Wrap"><Select options={[{ label: 'No Wrap', value: 'nowrap' }, { label: 'Wrap', value: 'wrap' }, { label: 'Wrap Reverse', value: 'wrap-reverse' }]} value={manualStyles.flexWrap || 'nowrap'} onChange={e => handleStyleChange('flexWrap', e.target.value)} /></Field>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <Field label="Justify"><Select options={[{ label: 'Start', value: 'flex-start' }, { label: 'Center', value: 'center' }, { label: 'End', value: 'flex-end' }, { label: 'Between', value: 'space-between' }, { label: 'Around', value: 'space-around' }, { label: 'Evenly', value: 'space-evenly' }]} value={manualStyles.justifyContent || 'flex-start'} onChange={e => handleStyleChange('justifyContent', e.target.value)} /></Field>
                          <Field label="Align Items"><Select options={[{ label: 'Stretch', value: 'stretch' }, { label: 'Start', value: 'flex-start' }, { label: 'Center', value: 'center' }, { label: 'End', value: 'flex-end' }, { label: 'Baseline', value: 'baseline' }]} value={manualStyles.alignItems || 'stretch'} onChange={e => handleStyleChange('alignItems', e.target.value)} /></Field>
                        </div>
                        <Field label="Gap"><Input placeholder="normal" value={manualStyles.gap || ''} onChange={e => handleStyleChange('gap', e.target.value)} /></Field>
                        <div className="pt-2 border-t border-[#2e2e2e]">
                          <span className="text-[9px] text-zinc-500 italic">Child props (this element as flex child)</span>
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                          <Field label="Grow"><Input placeholder="0" value={manualStyles.flexGrow || ''} onChange={e => handleStyleChange('flexGrow', e.target.value)} /></Field>
                          <Field label="Shrink"><Input placeholder="1" value={manualStyles.flexShrink || ''} onChange={e => handleStyleChange('flexShrink', e.target.value)} /></Field>
                          <Field label="Basis"><Input placeholder="auto" value={manualStyles.flexBasis || ''} onChange={e => handleStyleChange('flexBasis', e.target.value)} /></Field>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <Field label="Align Self"><Select options={[{ label: 'Auto', value: 'auto' }, { label: 'Start', value: 'flex-start' }, { label: 'Center', value: 'center' }, { label: 'End', value: 'flex-end' }, { label: 'Stretch', value: 'stretch' }, { label: 'Baseline', value: 'baseline' }]} value={manualStyles.alignSelf || 'auto'} onChange={e => handleStyleChange('alignSelf', e.target.value)} /></Field>
                          <Field label="Order"><Input placeholder="0" value={manualStyles.order || ''} onChange={e => handleStyleChange('order', e.target.value)} /></Field>
                        </div>
                      </div>
                    </Accordion>

                    {/* ─── EFFECTS ─── */}
                    <Accordion title="Effects">
                      <div className="space-y-3">
                        <Field label={`Opacity — ${Math.round((parseFloat(manualStyles.opacity) || 1) * 100)}%`}>
                          <input type="range" min="0" max="1" step="0.01" value={manualStyles.opacity || '1'} onChange={e => handleStyleChange('opacity', e.target.value)} className="w-full h-1.5 bg-[#2e2e2e] rounded-full appearance-none cursor-pointer accent-[#A78BFA]" />
                        </Field>
                        <Field label="Box Shadow">
                          <Input placeholder="none" value={manualStyles.boxShadow || ''} onChange={e => handleStyleChange('boxShadow', e.target.value)} />
                          <div className="flex gap-1 mt-1.5">
                            {[['None', 'none'], ['SM', '0 1px 2px rgba(0,0,0,0.05)'], ['MD', '0 4px 6px -1px rgba(0,0,0,0.1)'], ['LG', '0 10px 15px -3px rgba(0,0,0,0.1)'], ['XL', '0 20px 25px -5px rgba(0,0,0,0.1)']].map(([label, val]) => (
                              <button key={label} onClick={() => handleStyleChange('boxShadow', val)} className={`flex-1 text-[9px] py-1 rounded border transition-colors ${(manualStyles.boxShadow || 'none') === val ? 'bg-[#A78BFA]/20 border-[#A78BFA] text-white' : 'border-[#2e2e2e] text-zinc-500 hover:text-white hover:border-zinc-600'}`}>{label}</button>
                            ))}
                          </div>
                        </Field>
                        <Field label="Transform">
                          <Input placeholder="none" value={manualStyles.transform || ''} onChange={e => handleStyleChange('transform', e.target.value)} />
                          <div className="flex gap-1 mt-1.5">
                            {[['None', 'none'], ['45\u00B0', 'rotate(45deg)'], ['90\u00B0', 'rotate(90deg)'], ['Scale+', 'scale(1.1)'], ['Scale-', 'scale(0.9)']].map(([label, val]) => (
                              <button key={label} onClick={() => handleStyleChange('transform', val)} className={`flex-1 text-[9px] py-1 rounded border transition-colors ${(manualStyles.transform || 'none') === val ? 'bg-[#A78BFA]/20 border-[#A78BFA] text-white' : 'border-[#2e2e2e] text-zinc-500 hover:text-white hover:border-zinc-600'}`}>{label}</button>
                            ))}
                          </div>
                        </Field>
                        <Field label="Cursor"><Select options={[{ label: 'Default', value: 'default' }, { label: 'Pointer', value: 'pointer' }, { label: 'Move', value: 'move' }, { label: 'Text', value: 'text' }, { label: 'Not Allowed', value: 'not-allowed' }, { label: 'Grab', value: 'grab' }, { label: 'Crosshair', value: 'crosshair' }]} value={manualStyles.cursor || 'default'} onChange={e => handleStyleChange('cursor', e.target.value)} /></Field>
                        <Field label="Transition">
                          <Input placeholder="all" value={manualStyles.transition || ''} onChange={e => handleStyleChange('transition', e.target.value)} />
                          <div className="flex gap-1 mt-1.5">
                            {[['None', 'none'], ['Fast', 'all 0.15s ease'], ['Normal', 'all 0.3s ease'], ['Slow', 'all 0.5s ease']].map(([label, val]) => (
                              <button key={label} onClick={() => handleStyleChange('transition', val)} className={`flex-1 text-[9px] py-1 rounded border transition-colors ${(manualStyles.transition || '') === val ? 'bg-[#A78BFA]/20 border-[#A78BFA] text-white' : 'border-[#2e2e2e] text-zinc-500 hover:text-white hover:border-zinc-600'}`}>{label}</button>
                            ))}
                          </div>
                        </Field>
                      </div>
                    </Accordion>

                  </div>
                ) : (
                  <div className="p-4 flex flex-col gap-3 h-full">
                    <p className="text-xs text-zinc-400 mb-2">Use natural language to intelligently update styles, classes, or content without breaking the layout.</p>
                    <div className="relative flex-1">
                      <textarea
                        value={elementPrompt}
                        onChange={(e) => setElementPrompt(e.target.value)}
                        placeholder="e.g. Make this a primary button with rounded corners and a purple gradient..."
                        className="w-full bg-[#1c1c1c] border border-[#2e2e2e] rounded-lg text-white text-xs p-3 pr-10 h-32 resize-none outline-none focus:border-[#A78BFA] custom-scrollbar dark-scrollbar"
                      />
                      <button
                        onClick={handleElementAIEdit}
                        disabled={isEditingElement || !elementPrompt.trim()}
                        className="absolute right-3 bottom-3 p-1.5 bg-[#A78BFA] hover:bg-[#9061F9] text-white rounded-md disabled:opacity-50 disabled:hover:bg-[#A78BFA] transition-colors"
                      >
                        {isEditingElement ? <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin"></div> : <Sparkles className="w-4 h-4" />}
                      </button>
                    </div>
                    {isEditingElement && <p className="text-[10px] text-[#A78BFA] text-center animate-pulse">Applying AI changes...</p>}
                  </div>
                )}
              </div>
            </div>
          )}

          {workspaceMode === 'code' ? (
            <div className="w-full h-full bg-[#1e1e1e] flex flex-col">
              <div className="bg-[#2d2d2d] px-4 py-2 border-b border-slate-700 flex justify-between items-center text-slate-300 text-xs font-mono shrink-0">
                <span>{activeFileName || 'Output Code'}</span>
                <button onClick={() => { const t = document.createElement('textarea'); t.value = currentPreviewHTML; document.body.appendChild(t); t.select(); document.execCommand('copy'); document.body.removeChild(t); }} className="hover:text-white flex items-center gap-1"><Copy className="w-3 h-3" /> Copy</button>
              </div>
              <textarea value={codeViewValue} onChange={(e) => {
                const val = e.target.value;
                setCodeEditValue(val);
                clearTimeout(codeEditTimerRef.current);
                codeEditTimerRef.current = setTimeout(() => {
                  codeEditTimerRef.current = null;
                  skipNextIframeWriteRef.current = true;
                  setGeneratedFiles(prev => ({ ...prev, [activeFileName]: val }));
                }, 600);
              }} className="flex-1 w-full bg-transparent text-slate-300 font-mono text-sm p-4 outline-none resize-none custom-scrollbar dark-scrollbar" spellCheck={false} />
            </div>
          ) : (
            <div className={`transition-all duration-300 ease-in-out bg-white flex flex-col ${deviceMode === 'mobile' ? 'w-[375px] h-[812px] rounded-[2.5rem] shadow-2xl border-[8px] border-slate-900 overflow-hidden shrink-0' : 'w-full h-full'}`}>
              {!currentPreviewHTML ? (
                isGenerating ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8 text-center bg-white">
                    <div className="w-16 h-16 mb-6 relative">
                      <div className="absolute inset-0 border-4 border-slate-100 rounded-full"></div>
                      <div className="absolute inset-0 border-4 border-[#A78BFA] rounded-full border-t-transparent animate-spin"></div>
                      <Box className="w-6 h-6 text-[#A78BFA] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                    </div>
                    <h3 className="text-xl font-medium text-slate-600 mb-2 whitespace-pre-wrap">{generationStatus}</h3>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center bg-slate-50/50 p-8">
                    <div className="max-w-2xl w-full">
                      <div className="text-center mb-10">
                        <div className="w-16 h-16 bg-white border border-slate-200 shadow-sm rounded-2xl flex items-center justify-center mx-auto mb-6">
                          <Sparkles className="w-8 h-8 text-[#A78BFA]" />
                        </div>
                        <h2 className="text-3xl font-semibold text-slate-800 mb-3">Welcome to your Workspace</h2>
                        <p className="text-slate-500 text-sm">Describe what you want to build in the chat, or start with a template below.</p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <button onClick={() => setInput("Create a modern SaaS landing page with a hero section, feature grid, and pricing table.")} className="text-left p-5 bg-white border border-slate-200 rounded-2xl hover:border-[#A78BFA] hover:shadow-md transition-all group">
                          <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <Layout className="w-5 h-5 text-blue-500" />
                          </div>
                          <h4 className="font-semibold text-slate-800 mb-1">SaaS Landing Page</h4>
                          <p className="text-xs text-slate-500 leading-relaxed">High-converting landing page with hero, features, and pricing sections.</p>
                        </button>

                        <button onClick={() => setInput("Design a comprehensive admin dashboard with a sidebar navigation, header, stat cards, and a recent activity table.")} className="text-left p-5 bg-white border border-slate-200 rounded-2xl hover:border-[#A78BFA] hover:shadow-md transition-all group">
                          <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <Monitor className="w-5 h-5 text-purple-500" />
                          </div>
                          <h4 className="font-semibold text-slate-800 mb-1">Admin Dashboard</h4>
                          <p className="text-xs text-slate-500 leading-relaxed">Complete dashboard layout with sidebar, metrics, and data tables.</p>
                        </button>

                        <button onClick={() => setInput("Build an e-commerce product page with an image gallery, product details, size selector, and 'Add to Cart' button.")} className="text-left p-5 bg-white border border-slate-200 rounded-2xl hover:border-[#A78BFA] hover:shadow-md transition-all group">
                          <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <Smartphone className="w-5 h-5 text-emerald-500" />
                          </div>
                          <h4 className="font-semibold text-slate-800 mb-1">E-Commerce Product</h4>
                          <p className="text-xs text-slate-500 leading-relaxed">Beautiful product display with image gallery and purchasing controls.</p>
                        </button>

                        <button onClick={() => setInput("Create a multi-step user authentication flow including Login, Register, and Forgot Password screens.")} className="text-left p-5 bg-white border border-slate-200 rounded-2xl hover:border-[#A78BFA] hover:shadow-md transition-all group">
                          <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <Box className="w-5 h-5 text-orange-500" />
                          </div>
                          <h4 className="font-semibold text-slate-800 mb-1">Authentication Flow</h4>
                          <p className="text-xs text-slate-500 leading-relaxed">Secure and stylish login, registration, and password recovery pages.</p>
                        </button>
                      </div>
                    </div>
                  </div>
                )
              ) : (
                <iframe
                  ref={iframeRef}
                  title="Preview"
                  className={`w-full h-full border-0 bg-white ${workspaceMode === 'design' ? 'cursor-crosshair' : ''}`}
                  sandbox="allow-scripts allow-same-origin"
                />
              )}
            </div>
          )}
        </div>
      </div>

      {/* Attachment / Template Preview Modal */}
      {previewItem && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={() => setPreviewItem(null)}>
          <div className="relative w-full h-full bg-[#1c1c1c] flex flex-col overflow-hidden animate-fade-in" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-3 border-b border-[#2e2e2e] bg-[#252525] shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                {previewItem.kind === 'image' && <ImageIcon className="w-4 h-4 text-emerald-400 shrink-0" />}
                {previewItem.kind === 'pdf' && <File className="w-4 h-4 text-red-400 shrink-0" />}
                {previewItem.kind === 'text' && <FileText className="w-4 h-4 text-blue-400 shrink-0" />}
                {previewItem.kind === 'html' && <Layout className="w-4 h-4 text-[#A78BFA] shrink-0" />}
                <span className="text-sm font-medium text-white truncate">{previewItem.name}</span>
              </div>
              <button onClick={() => setPreviewItem(null)} className="p-1.5 text-zinc-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors shrink-0">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-auto">
              {previewItem.kind === 'image' && (
                <div className="flex items-center justify-center h-full p-6 bg-[#111]">
                  <img src={previewItem.data} alt={previewItem.name} className="max-w-full max-h-full object-contain rounded-lg" />
                </div>
              )}
              {previewItem.kind === 'pdf' && (
                <iframe src={previewItem.data} title={previewItem.name} className="w-full h-full border-0 bg-white" />
              )}
              {previewItem.kind === 'text' && (
                <pre className="p-6 text-sm text-zinc-300 font-mono whitespace-pre-wrap break-words custom-scrollbar">{previewItem.content || ''}</pre>
              )}
              {previewItem.kind === 'html' && (
                <iframe src={previewItem.file} title={previewItem.name} className="w-full h-full border-0 bg-white" sandbox="allow-scripts allow-same-origin" />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Plan Selector Modal */}
      {showPlanSelector && (
        <PlanSelector
          user={user}
          currentPlanId={userPlanId}
          onClose={() => setShowPlanSelector(false)}
          onPlanChanged={(plan) => {
            setUserPlanId(plan.id);
            setTokenLimit(plan.tokenLimit);
            setShowPlanSelector(false);
          }}
        />
      )}

      {/* Publish Toast */}
      {/* Components Modal — Full page view of atoms/molecules/organisms */}
      {showComponentsModal && (() => {
        const allFiles = Object.keys(generatedFiles);
        const atoms = allFiles.filter(f => /\.atom\.html$/i.test(f));
        const molecules = allFiles.filter(f => /\.molecule\.html$/i.test(f));
        const organisms = allFiles.filter(f => /\.organism\.html$/i.test(f));
        const tierGroups = [
          { label: 'Organisms', icon: '🧩', files: organisms, badge: 'bg-purple-50 text-purple-600' },
          { label: 'Molecules', icon: '🔗', files: molecules, badge: 'bg-blue-50 text-blue-600' },
          { label: 'Atoms', icon: '⚛️', files: atoms, badge: 'bg-emerald-50 text-emerald-600' },
        ].filter(g => g.files.length > 0);

        return (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fade-in" onClick={() => setShowComponentsModal(false)}>
            <div className="w-full max-w-5xl max-h-[90vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-purple-50 rounded-xl flex items-center justify-center">
                    <Box className="w-5 h-5 text-[#A78BFA]" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-800">Design Components</h2>
                    <p className="text-xs text-slate-400">{atoms.length + molecules.length + organisms.length} components generated</p>
                  </div>
                </div>
                <button onClick={() => setShowComponentsModal(false)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-8">
                {tierGroups.map(group => (
                  <div key={group.label}>
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-lg">{group.icon}</span>
                      <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">{group.label}</h3>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${group.badge}`}>{group.files.length}</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {group.files.map(fileName => (
                        <div key={fileName} className="border border-slate-200 rounded-xl overflow-hidden hover:shadow-lg hover:border-[#A78BFA]/30 transition-all group/card">
                          {/* Preview */}
                          <div className="h-48 bg-slate-50 relative overflow-hidden">
                            <iframe
                              srcDoc={generatedFiles[fileName]}
                              title={fileName}
                              sandbox="allow-scripts"
                              className="w-[200%] h-[200%] origin-top-left scale-50 pointer-events-none border-0"
                            />
                          </div>
                          {/* Info Bar */}
                          <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-slate-100">
                            <div className="min-w-0">
                              <p className="text-xs font-semibold text-slate-700 truncate">{fileName}</p>
                              <p className="text-[10px] text-slate-400 mt-0.5">{group.label.slice(0, -1)}</p>
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                onClick={() => { setActiveFileName(fileName); activeFileNameRef.current = fileName; setShowComponentsModal(false); }}
                                className="px-3 py-1.5 text-[11px] font-semibold text-[#A78BFA] hover:bg-purple-50 rounded-lg transition-colors"
                              >
                                View
                              </button>
                              <button
                                onClick={() => { navigator.clipboard.writeText(generatedFiles[fileName]); }}
                                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                              >
                                <Copy className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      })()}

      {showPublishToast && publishInfo && (
        <div className="fixed bottom-6 right-6 bg-white border border-slate-200 rounded-2xl shadow-2xl p-4 z-50 animate-fade-in max-w-sm">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 bg-emerald-50 rounded-xl flex items-center justify-center shrink-0">
              <Globe className="w-5 h-5 text-emerald-500" />
            </div>
            <div className="min-w-0">
              <div className="text-sm font-semibold text-slate-800">Site Published!</div>
              <p className="text-xs text-slate-500 mt-0.5">Link copied to clipboard</p>
              <button onClick={() => window.open(`/view/${publishInfo.slug}`, '_blank')} className="mt-2 text-xs font-medium text-[#A78BFA] hover:text-[#9061F9] flex items-center gap-1 transition-colors">
                <ExternalLink className="w-3 h-3" /> Open live site
              </button>
            </div>
            <button onClick={() => setShowPublishToast(false)} className="p-1 text-slate-300 hover:text-slate-500 transition-colors shrink-0">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudioWorkspace;
