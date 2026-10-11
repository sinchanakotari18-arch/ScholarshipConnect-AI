import React, { useState, useEffect, useRef } from 'react';
import { api } from './api.js';

// Identify any previous mock/sample placeholder documents so new wallets remain cleanly empty
const isMockSampleDoc = (d) => {
  if (!d) return false;
  return Boolean(
    d.id === 'doc_aadhaar_01' ||
    d.id === 'doc_marksheet10_02' ||
    d.id === 'doc_income_03' ||
    d.fileName === 'Aadhaar_Card_Verified.svg' ||
    d.fileName === 'Class_10_Marksheet.svg' ||
    d.fileName === 'Income_Certificate_2026.svg' ||
    d.docNumber === 'XXXX-XXXX-9842' ||
    d.docNumber === 'CBSE/2022/SS-98124' ||
    d.docNumber === 'REV/KA/2026/INC-7731' ||
    d.source === 'UIDAI DigiLocker' ||
    d.source === 'DigiLocker' ||
    d.source === 'State Revenue Dept' ||
    (typeof d.dataUrl === 'string' && d.dataUrl.includes('data:image/svg+xml;utf8,%3Csvg') && (d.title === 'Aadhaar Card' || d.title === 'Class 10 Marksheet' || d.title === 'Family Income Certificate'))
  );
};

const sanitizeDocs = (docList) => {
  if (!Array.isArray(docList)) return [];
  return docList.filter(d => !isMockSampleDoc(d));
};

function DocumentWallet({ user, save, onSelect, setPage }) {
  const featuredScholarships = [
    { provider:'Reliance', title:'Reliance Foundation Scholarships 2026-27', deadline:'05-Oct-2026', logoClass:'dwReliance' },
    { provider:'OakNorth', title:'OakNorth Scholarship and Mentorship Programme 2026-27', deadline:'30-Sep-2026', logoClass:'dwOakNorth' },
    { provider:'INFOCEPTS', subtitle:'FOUNDATION', title:'Infocepts Innovate for Impact Scholarship 2026-27', deadline:'30-Oct-2026', logoClass:'dwInfocepts' },
    { provider:'sml', subtitle:'mahindra', title:'SML Mahindra Scholarship Program 2026-27', deadline:'21-Oct-2026', logoClass:'dwMahindra' }
  ];

  const profileName = `${user?.firstName || 'Sinchana'} ${user?.lastName || 'kotari'}`;
  const initials = `${user?.firstName?.[0] || 'S'}${user?.lastName?.[0] || 'K'}`.toUpperCase();
  const storageKey = `sc_wallet_docs_${user?.studentId || user?.email || 'default'}`;

  // Document state initialized from persistent storage - completely empty by default until user adds documents
  const [documents, setDocuments] = useState(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored !== null) {
        const parsed = JSON.parse(stored);
        const cleaned = sanitizeDocs(parsed);
        if (cleaned.length !== (Array.isArray(parsed) ? parsed.length : 0)) {
          localStorage.setItem(storageKey, JSON.stringify(cleaned));
          try {
            localStorage.setItem('sc_wallet_docs_global', JSON.stringify(cleaned));
          } catch (e) {}
        }
        return cleaned;
      }
      if (user?.documents && Array.isArray(user.documents)) {
        const cleaned = sanitizeDocs(user.documents);
        localStorage.setItem(storageKey, JSON.stringify(cleaned));
        return cleaned;
      }
      return [];
    } catch (e) {
      return [];
    }
  });

  // Filter and search state
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addMode, setAddMode] = useState('file'); // 'file' or 'camera'
  const [previewDoc, setPreviewDoc] = useState(null);
  const [docToDelete, setDocToDelete] = useState(null);
  const [showContactCard, setShowContactCard] = useState(false);

  // Toast notification state
  const [toast, setToast] = useState(null);
  const toastTimeoutRef = useRef(null);

  const showToast = (message, type = 'success') => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToast({ message, type });
    toastTimeoutRef.current = setTimeout(() => {
      setToast(null);
    }, 3800);
  };

  // Form state for adding document
  const [newDoc, setNewDoc] = useState({
    title: '',
    category: 'Identity Proof',
    docNumber: '',
    fileName: '',
    fileType: '',
    fileSize: '',
    fileData: ''
  });
  const [isDragging, setIsDragging] = useState(false);

  // Camera capture states
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraLoading, setCameraLoading] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [capturedPhoto, setCapturedPhoto] = useState(null);

  const fileInputRef = useRef(null);
  const fallbackCameraInputRef = useRef(null);

  // Sync documents to storage, database, and user object
  const persistDocuments = (newDocList, newlyAddedDoc = null) => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(newDocList));
      localStorage.setItem('sc_wallet_docs_global', JSON.stringify(newDocList));
      if (save && user) {
        save({ ...user, documents: newDocList });
      }
      if (newlyAddedDoc) {
        api.post('/documents', {
          ...newlyAddedDoc,
          studentId: user?.studentId || 'SC-2026-5OAP',
          studentEmail: user?.email || '',
        }).catch(console.warn);
      }
    } catch (err) {
      console.error('Failed to persist documents:', err);
    }
  };

  // Sync documents on account switch, storage change, or backend load
  useEffect(() => {
    // 1. Initial load from local cache
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored !== null) {
        const parsed = JSON.parse(stored);
        const cleaned = sanitizeDocs(parsed);
        setDocuments(cleaned);
        if (cleaned.length !== (Array.isArray(parsed) ? parsed.length : 0)) {
          localStorage.setItem(storageKey, JSON.stringify(cleaned));
        }
      } else if (user?.documents && Array.isArray(user.documents)) {
        const cleaned = sanitizeDocs(user.documents);
        setDocuments(cleaned);
        localStorage.setItem(storageKey, JSON.stringify(cleaned));
      } else {
        setDocuments([]);
      }
    } catch (e) {
      setDocuments([]);
    }

    // 2. Fetch from backend MongoDB
    const studentId = user?.studentId || 'SC-2026-5OAP';
    api.get('/documents', { studentId }).then((res) => {
      if (res && res.success && Array.isArray(res.data) && res.data.length > 0) {
        const cleaned = sanitizeDocs(res.data);
        setDocuments(cleaned);
        localStorage.setItem(storageKey, JSON.stringify(cleaned));
      }
    }).catch(() => {});

    // Clean user.documents if it contains legacy sample docs
    if (user?.documents && Array.isArray(user.documents)) {
      const cleanedUserDocs = sanitizeDocs(user.documents);
      if (cleanedUserDocs.length !== user.documents.length && save) {
        save({ ...user, documents: cleanedUserDocs });
      }
    }

    // Clean global storage key if it holds legacy sample docs
    try {
      const globalDocs = localStorage.getItem('sc_wallet_docs_global');
      if (globalDocs) {
        const parsedGlobal = JSON.parse(globalDocs);
        const cleanedGlobal = sanitizeDocs(parsedGlobal);
        if (cleanedGlobal.length !== (Array.isArray(parsedGlobal) ? parsedGlobal.length : 0)) {
          localStorage.setItem('sc_wallet_docs_global', JSON.stringify(cleanedGlobal));
        }
      }
    } catch (e) {}
  }, [storageKey, user?.studentId, user?.email]);

  // Cleanup camera stream whenever modal closes or mode changes
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        try {
          track.stop();
        } catch (e) {}
      });
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
    setCameraLoading(false);
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // Start live webcam feed
  const startCamera = async () => {
    setCameraError('');
    setCameraLoading(true);
    setCapturedPhoto(null);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera is not supported on this browser or connection.');
      }

      stopCamera();

      const constraints = {
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setIsCameraActive(true);
    } catch (err) {
      console.warn('Camera access failed:', err);
      let errMsg = 'Unable to access camera.';
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        errMsg = 'Camera permission was denied. Please allow camera access in your browser or use "Upload from File Explorer".';
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        errMsg = 'No camera device found on this system. You can easily upload photos or documents from File Explorer.';
      } else {
        errMsg = `${err.message || 'Camera unavailable'}. Please use File Explorer upload instead.`;
      }
      setCameraError(errMsg);
      setIsCameraActive(false);
    } finally {
      setCameraLoading(false);
    }
  };

  // Handle switching tabs inside Add modal
  const handleTabChange = (mode) => {
    setAddMode(mode);
    if (mode === 'camera') {
      if (!capturedPhoto && !isCameraActive) {
        startCamera();
      }
    } else {
      stopCamera();
    }
  };

  // Snapshot current frame from video to canvas
  const handleCaptureSnapshot = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
    setCapturedPhoto(dataUrl);

    const now = new Date();
    const timeTag = `${now.getFullYear()}${(now.getMonth()+1).toString().padStart(2,'0')}${now.getDate().toString().padStart(2,'0')}_${now.getHours()}${now.getMinutes()}`;
    const generatedName = `Camera_Scan_${timeTag}.jpg`;
    const sizeEst = `${Math.round((dataUrl.length * 3 / 4) / 1024)} KB`;

    setNewDoc(prev => ({
      ...prev,
      fileData: dataUrl,
      fileName: generatedName,
      fileType: 'image/jpeg',
      fileSize: sizeEst,
      title: prev.title || 'Camera Document Scan'
    }));

    stopCamera();
    showToast('Photo captured successfully! Review and save below.', 'info');
  };

  // Retake photo
  const handleRetakePhoto = () => {
    setCapturedPhoto(null);
    setNewDoc(prev => ({
      ...prev,
      fileData: '',
      fileName: '',
      fileType: '',
      fileSize: ''
    }));
    startCamera();
  };

  // Process chosen or dropped file
  const processSelectedFile = (file) => {
    if (!file) return;

    // Check size (15MB limit)
    if (file.size > 15 * 1024 * 1024) {
      showToast('File exceeds 15MB limit. Please upload a smaller file.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target.result;
      const formattedSize = file.size > 1024 * 1024
        ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
        : `${Math.round(file.size / 1024)} KB`;

      // Clean default title suggestion from file name
      const suggestedTitle = file.name
        .replace(/\.[^/.]+$/, '')
        .replace(/[-_]/g, ' ')
        .replace(/\b\w/g, c => c.toUpperCase());

      setNewDoc(prev => ({
        ...prev,
        fileData: dataUrl,
        fileName: file.name,
        fileType: file.type || 'application/octet-stream',
        fileSize: formattedSize,
        title: prev.title || suggestedTitle
      }));

      showToast(`Selected "${file.name}"`, 'info');
    };
    reader.readAsDataURL(file);
  };

  // File input change
  const handleFileInputChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      processSelectedFile(file);
    }
  };

  // Drag and drop handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processSelectedFile(e.dataTransfer.files[0]);
    }
  };

  // Open Add modal with optional prefill
  const openAddModal = (presetTitle = '', presetCategory = 'Identity Proof') => {
    setNewDoc({
      title: presetTitle,
      category: presetCategory,
      docNumber: '',
      fileName: '',
      fileType: '',
      fileSize: '',
      fileData: ''
    });
    setCapturedPhoto(null);
    setCameraError('');
    setAddMode('file');
    setIsAddModalOpen(true);
  };

  const closeAddModal = () => {
    stopCamera();
    setIsAddModalOpen(false);
  };

  // Save document to wallet
  const handleSaveDocument = (e) => {
    e?.preventDefault();

    if (!newDoc.title.trim()) {
      showToast('Please provide a document title.', 'error');
      return;
    }

    if (!newDoc.fileData) {
      showToast('Please upload a file or capture a photo first.', 'error');
      return;
    }

    const newDocItem = {
      id: `doc_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      title: newDoc.title.trim(),
      category: newDoc.category || 'Other Documents',
      docNumber: newDoc.docNumber?.trim() || '',
      fileName: newDoc.fileName || `document_${Date.now()}.jpg`,
      fileType: newDoc.fileType || 'image/jpeg',
      fileSize: newDoc.fileSize || '500 KB',
      dataUrl: newDoc.fileData,
      uploadedAt: new Date().toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      }),
      status: 'Verified',
      source: addMode === 'camera' ? 'Camera Capture' : 'File Explorer'
    };

    const updated = [newDocItem, ...documents];
    setDocuments(updated);
    persistDocuments(updated, newDocItem);

    showToast(`"${newDocItem.title}" saved to your Document Wallet! 🎉`, 'success');
    closeAddModal();
  };

  // Delete document
  const confirmDelete = (doc) => {
    setDocToDelete(doc);
  };

  const executeDelete = () => {
    if (!docToDelete) return;
    const updated = documents.filter(d => d.id !== docToDelete.id);
    setDocuments(updated);
    persistDocuments(updated);
    api.delete(`/documents/${docToDelete.id}`).catch(console.warn);
    showToast(`"${docToDelete.title}" deleted from wallet.`, 'info');
    setDocToDelete(null);
    if (previewDoc?.id === docToDelete.id) {
      setPreviewDoc(null);
    }
  };

  // Download document
  const handleDownload = (doc) => {
    const a = document.createElement('a');
    a.href = doc.dataUrl;
    a.download = doc.fileName || `${doc.title.replace(/\s+/g, '_')}.jpg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showToast(`Downloading "${doc.title}"...`, 'info');
  };

  // Filtered documents
  const filteredDocuments = documents.filter(doc => {
    const matchesCategory = activeCategory === 'All' || doc.category === activeCategory;
    const matchesQuery = !searchQuery || 
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (doc.docNumber && doc.docNumber.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesQuery;
  });

  // Category counts
  const categories = [
    'All',
    'Identity Proof',
    'Academic Records',
    'Income & Caste',
    'College & Bonafide',
    'Other Documents'
  ];

  // Essential scholarship documents checklist
  const essentialChecklist = [
    { name: 'Aadhaar Card', category: 'Identity Proof', icon: '🪪' },
    { name: 'Class 10 / 12 Marksheet', category: 'Academic Records', icon: '📜' },
    { name: 'Family Income Certificate', category: 'Income & Caste', icon: '💰' },
    { name: 'College ID / Admission Letter', category: 'College & Bonafide', icon: '🏫' }
  ];

  const hasDocForChecklist = (item) => {
    if (!documents || documents.length === 0) return false;
    const lowerItem = (item.name || '').toLowerCase();
    return documents.some(d => {
      const title = (d.title || '').toLowerCase();
      if (lowerItem.includes('aadhaar')) {
        return title.includes('aadhaar') || title.includes('aadhar') || title.includes('uidai');
      }
      if (lowerItem.includes('marksheet')) {
        return (
          title.includes('marksheet') ||
          title.includes('10th') ||
          title.includes('12th') ||
          title.includes('class 10') ||
          title.includes('class 12') ||
          title.includes('scorecard') ||
          title.includes('cbse') ||
          title.includes('icse') ||
          title.includes('state board')
        );
      }
      if (lowerItem.includes('income')) {
        return (
          title.includes('income') ||
          title.includes('salary') ||
          title.includes('revenue') ||
          title.includes('tahasildar')
        );
      }
      if (lowerItem.includes('college')) {
        return (
          title.includes('college') ||
          title.includes('admission') ||
          title.includes('bonafide') ||
          title.includes('student id') ||
          title.includes('university') ||
          title.includes('campus')
        );
      }
      return title.includes(lowerItem);
    });
  };

  return (
    <main className="documentWalletPage">

      {/* ================= TOAST NOTIFICATION ================= */}
      {toast && (
        <div className={`docToast docToast-${toast.type}`}>
          <span>{toast.type === 'error' ? '⚠️' : toast.type === 'info' ? 'ℹ️' : '✓'}</span>
          <p>{toast.message}</p>
          <button type="button" onClick={() => setToast(null)}>✕</button>
        </div>
      )}

      {/* ================= LEFT SIDEBAR ================= */}
      <aside className="documentWalletSide">
        <div className="documentWalletProfile">
          <div className="documentWalletPhoto">
            {user?.profilePhoto ? (
              <img src={user.profilePhoto} alt="Profile" />
            ) : (
              <span>{initials || 'SK'}</span>
            )}
          </div>

          <h2>{profileName}</h2>

          <button
            type="button"
            className="documentContactCard"
            onClick={() => setShowContactCard(true)}
          >
            <span>▣</span>
            Generate Contact Card
          </button>

          <div className="documentAadhaar">
            <span>{user?.aadhaarVerified ? "Aadhaar Verified" : "Aadhaar Pending"}</span>
            <b>{user?.aadhaarVerified ? "✓" : "⚠"}</b>
          </div>
        </div>

        <nav className="documentWalletNavigation">
          <button type="button" onClick={() => setPage?.('profile')}>
            <span className="documentNavIcon">♙</span>
            <span>My Profile</span>
          </button>

          <button type="button" className="documentNavActive">
            <span className="documentNavIcon documentNavActiveIcon">📁</span>
            <span>My Document Wallet</span>
          </button>

          <button type="button" onClick={() => setPage?.('scholarships')}>
            <span className="documentNavIcon">🎓</span>
            <span>Matched Scholarships</span>
          </button>

          <button type="button" onClick={() => setPage?.('applied')}>
            <span className="documentNavIcon">▤</span>
            <span>Applied Scholarships</span>
          </button>

          <button type="button" onClick={() => setPage?.('stream-selector')}>
            <span className="documentNavIcon">⌾</span>
            <span>My Stream Selector</span>
          </button>

          <button type="button" onClick={() => setPage?.('settings')}>
            <span className="documentNavIcon">⚙️</span>
            <span>Settings</span>
          </button>
        </nav>
      </aside>

      {/* ================= CENTER MAIN CONTENT ================= */}
      <section className="documentWalletMain">

        {/* HEADER BAR */}
        <div className="documentWalletHeader">
          <div className="documentWalletHeaderTitleGroup">
            <h1>My Documents</h1>
            <span className="documentWalletCountBadge">
              🔒 {documents.length} Saved {documents.length === 1 ? 'Document' : 'Documents'}
            </span>
          </div>

          <button
            type="button"
            className="documentWalletAdd"
            onClick={() => openAddModal()}
            id="btn-add-document"
          >
            <span>+</span>
            Add
          </button>
        </div>

        {/* SUMMARY STATS OVERVIEW */}
        <div className="docStatsGrid">
          <div className="docStatCard">
            <div className="docStatIcon docStatBlue">📁</div>
            <div className="docStatInfo">
              <span className="docStatLabel">Total Documents</span>
              <span className="docStatValue">{documents.length}</span>
            </div>
          </div>

          <div className="docStatCard">
            <div className="docStatIcon docStatGreen">🛡️</div>
            <div className="docStatInfo">
              <span className="docStatLabel">Verified Status</span>
              <span className="docStatValue">
                {documents.filter(d => d.status === 'Verified').length} Verified
              </span>
            </div>
          </div>

          <div className="docStatCard">
            <div className="docStatIcon docStatAmber">🎯</div>
            <div className="docStatInfo">
              <span className="docStatLabel">Application Ready</span>
              <span className="docStatValue">
                {Math.round((essentialChecklist.filter(hasDocForChecklist).length / essentialChecklist.length) * 100)}% Ready
              </span>
            </div>
          </div>

          <div className="docStatCard">
            <div className="docStatIcon docStatPurple">🔐</div>
            <div className="docStatInfo">
              <span className="docStatLabel">Security Storage</span>
              <span className="docStatValue">Browser Locker</span>
            </div>
          </div>
        </div>

        {/* ESSENTIAL SCHOLARSHIP CHECKLIST BAR */}
        <div className="docChecklistBanner">
          <div className="docChecklistHeader">
            <span className="docChecklistIcon">⚡</span>
            <div>
              <strong>Scholarship Application Readiness Checklist</strong>
              <p>Keep these standard 4 documents updated to qualify for instant single-click scholarship applications.</p>
            </div>
          </div>

          <div className="docChecklistChips">
            {essentialChecklist.map((item) => {
              const uploaded = hasDocForChecklist(item);
              return (
                <div
                  key={item.name}
                  className={`docChecklistChip ${uploaded ? 'docChecklistChipDone' : 'docChecklistChipMissing'}`}
                  onClick={() => !uploaded && openAddModal(item.name, item.category)}
                  title={uploaded ? 'Document verified in wallet' : `Click to upload ${item.name}`}
                >
                  <span className="docChipIcon">{item.icon}</span>
                  <span className="docChipName">{item.name}</span>
                  {uploaded ? (
                    <span className="docChipStatusDone">✓ Done</span>
                  ) : (
                    <span className="docChipStatusAction">+ Upload</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* SEARCH AND CATEGORY FILTER TABS */}
        <div className="docFilterContainer">
          <div className="docSearchBar">
            <span className="docSearchIcon">🔍</span>
            <input
              type="text"
              placeholder="Search document by name, category, or ID number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                type="button"
                className="docSearchClear"
                onClick={() => setSearchQuery('')}
              >
                ✕
              </button>
            )}
          </div>

          <div className="docCategoryPills">
            {categories.map((cat) => {
              const count = cat === 'All' 
                ? documents.length 
                : documents.filter(d => d.category === cat).length;
              return (
                <button
                  type="button"
                  key={cat}
                  className={`docCategoryPill ${activeCategory === cat ? 'docCategoryPillActive' : ''}`}
                  onClick={() => setActiveCategory(cat)}
                >
                  {cat}
                  <span className="docPillCount">{count}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ================= DOCUMENT CARDS GRID ================= */}
        {filteredDocuments.length > 0 ? (
          <div className="docCardGrid">
            {filteredDocuments.map((doc) => {
              const isSvgOrImg = doc.fileType?.includes('image') || doc.fileType?.includes('svg') || doc.dataUrl?.startsWith('data:image');
              const isPdf = doc.fileType?.includes('pdf') || doc.dataUrl?.startsWith('data:application/pdf') || doc.fileName?.toLowerCase().endsWith('.pdf');

              return (
                <div className="docCard" key={doc.id}>
                  {/* Top Bar: Category & Verified Badge */}
                  <div className="docCardHeader">
                    <span className="docCategoryBadge">
                      {doc.category}
                    </span>
                    <span className="docVerifiedBadge">
                      ✓ {doc.status || 'Verified'}
                    </span>
                  </div>

                  {/* Document Thumbnail Preview */}
                  <div className="docCardThumbnail" onClick={() => setPreviewDoc(doc)}>
                    {isSvgOrImg ? (
                      <img
                        src={doc.dataUrl}
                        alt={doc.title}
                        className="docThumbImg"
                        loading="lazy"
                      />
                    ) : (
                      <div className="docPdfPlaceholder">
                        <span className="docPdfIcon">📄</span>
                        <span className="docPdfText">PDF Document</span>
                        <span className="docPdfName">{doc.fileName}</span>
                      </div>
                    )}
                    <div className="docThumbOverlay">
                      <span>👁️ Click to View</span>
                    </div>
                  </div>

                  {/* Document Info Body */}
                  <div className="docCardBody">
                    <h3 className="docTitle" title={doc.title}>
                      {doc.title}
                    </h3>

                    {doc.docNumber && (
                      <div className="docIdNumber">
                        <span>ID / No:</span> <strong>{doc.docNumber}</strong>
                      </div>
                    )}

                    <div className="docMetaRow">
                      <span className="docFileBadge">
                        {isPdf ? 'PDF' : isSvgOrImg ? 'PHOTO / IMG' : 'FILE'}
                      </span>
                      <span className="docFileSize">{doc.fileSize || '500 KB'}</span>
                      <span className="docUploadDate">📅 {doc.uploadedAt}</span>
                    </div>
                  </div>

                  {/* Document Action Buttons Footer */}
                  <div className="docCardFooter">
                    <button
                      type="button"
                      className="docActionBtn docBtnView"
                      onClick={() => setPreviewDoc(doc)}
                      title="View Document"
                    >
                      <span>👁️</span>
                      View
                    </button>

                    <button
                      type="button"
                      className="docActionBtn docBtnDownload"
                      onClick={() => handleDownload(doc)}
                      title="Download Document"
                    >
                      <span>⬇️</span>
                      Download
                    </button>

                    <button
                      type="button"
                      className="docActionBtn docBtnDelete"
                      onClick={() => confirmDelete(doc)}
                      title="Delete Document"
                    >
                      <span>🗑️</span>
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* ================= EMPTY STATE ================= */
          <div className="docEmptyState">
            <div className="docEmptyIcon">📁</div>
            <h3>
              {searchQuery || activeCategory !== 'All' 
                ? 'No documents match your filter' 
                : 'Your Document Wallet is Empty'}
            </h3>
            <p>
              {searchQuery || activeCategory !== 'All'
                ? 'Try clearing your search term or select another category.'
                : "You haven't added any documents to your wallet yet. Upload and securely store your academic marksheets, Aadhaar card, income certificates, and student ID for instant scholarship applications."}
            </p>

            <div className="docEmptyActions">
              <button
                type="button"
                className="docBtnPrimary"
                onClick={() => {
                  setActiveCategory('All');
                  setSearchQuery('');
                  openAddModal();
                }}
              >
                <span>📁</span>
                Upload from File Explorer
              </button>

              <button
                type="button"
                className="docBtnSecondary"
                onClick={() => {
                  setActiveCategory('All');
                  setSearchQuery('');
                  openAddModal();
                  handleTabChange('camera');
                }}
              >
                <span>📷</span>
                Capture Photo with Camera
              </button>
            </div>
          </div>
        )}

      </section>

      {/* ================= RIGHT SIDEBAR ================= */}
      <aside className="documentWalletFeatured">
        <div className="documentFeaturedHeader">
          Featured Scholarships
        </div>

        <div className="documentFeaturedList">
          {featuredScholarships.map(item => (
            <button
              type="button"
              className="documentFeaturedCard"
              key={item.title}
              onClick={() => onSelect?.({
                title: item.title,
                provider: item.provider,
                deadline: item.deadline
              })}
            >
              <div className={`documentFeaturedLogo ${item.logoClass}`}>
                {item.logoClass === 'dwInfocepts' ? (
                  <>
                    <span className="infoceptsMark">i</span>
                    <span>
                      INFOCEPTS
                      <small>FOUNDATION</small>
                    </span>
                  </>
                ) : item.logoClass === 'dwMahindra' ? (
                  <>
                    <span>sml</span>
                    <small>mahindra</small>
                  </>
                ) : (
                  item.provider
                )}
              </div>

              <h3>{item.title}</h3>

              <p>
                Deadline Date: <strong>{item.deadline}</strong>
              </p>
            </button>
          ))}
        </div>
      </aside>

      {/* ================= MODAL: ADD / UPLOAD DOCUMENT ================= */}
      {isAddModalOpen && (
        <div className="docModalBackdrop" onClick={closeAddModal}>
          <div className="docModalContainer" onClick={(e) => e.stopPropagation()}>
            <div className="docModalHeader">
              <div className="docModalHeaderTitle">
                <span className="docModalHeaderIcon">📤</span>
                <div>
                  <h2>Add Document to Wallet</h2>
                  <p>Choose file explorer to upload documents or use your camera to take a photo.</p>
                </div>
              </div>
              <button
                type="button"
                className="docModalCloseBtn"
                onClick={closeAddModal}
                title="Close"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveDocument} className="docModalForm">
              
              {/* QUICK DOCUMENT PRESET SELECTORS */}
              <div className="docFormGroup">
                <label className="docFormLabel">Quick Select Common Document:</label>
                <div className="docPresetButtons">
                  {[
                    ['Aadhaar Card', 'Identity Proof'],
                    ['Class 10 Marksheet', 'Academic Records'],
                    ['Class 12 Marksheet', 'Academic Records'],
                    ['Family Income Certificate', 'Income & Caste'],
                    ['Caste Certificate', 'Income & Caste'],
                    ['College ID Card', 'College & Bonafide'],
                    ['Bonafide Certificate', 'College & Bonafide'],
                    ['Bank Passbook', 'Other Documents'],
                    ['Passport Size Photo', 'Identity Proof']
                  ].map(([pTitle, pCat]) => (
                    <button
                      type="button"
                      key={pTitle}
                      className={`docPresetBtn ${newDoc.title === pTitle ? 'docPresetBtnActive' : ''}`}
                      onClick={() => setNewDoc(prev => ({ ...prev, title: pTitle, category: pCat }))}
                    >
                      {pTitle}
                    </button>
                  ))}
                </div>
              </div>

              {/* DOCUMENT TITLE AND CATEGORY INPUTS */}
              <div className="docFormRow">
                <div className="docFormGroup docFormCol">
                  <label className="docFormLabel">
                    Document Title <span className="docRequired">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Aadhaar Card, 10th Standard Marksheet"
                    className="docInput"
                    value={newDoc.title}
                    onChange={(e) => setNewDoc({ ...newDoc, title: e.target.value })}
                  />
                </div>

                <div className="docFormGroup docFormCol">
                  <label className="docFormLabel">Document Category</label>
                  <select
                    className="docSelect"
                    value={newDoc.category}
                    onChange={(e) => setNewDoc({ ...newDoc, category: e.target.value })}
                  >
                    <option value="Identity Proof">Identity Proof</option>
                    <option value="Academic Records">Academic Records</option>
                    <option value="Income & Caste">Income & Caste</option>
                    <option value="College & Bonafide">College & Bonafide</option>
                    <option value="Other Documents">Other Documents</option>
                  </select>
                </div>
              </div>

              {/* OPTIONAL DOCUMENT NUMBER */}
              <div className="docFormGroup">
                <label className="docFormLabel">
                  Document / Certificate Number <span className="docOptional">(Optional)</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Aadhaar No, Roll No, or Certificate Reference"
                  className="docInput"
                  value={newDoc.docNumber}
                  onChange={(e) => setNewDoc({ ...newDoc, docNumber: e.target.value })}
                />
              </div>

              {/* UPLOAD METHOD TABS */}
              <div className="docUploadTabs">
                <button
                  type="button"
                  className={`docUploadTabBtn ${addMode === 'file' ? 'docUploadTabActive' : ''}`}
                  onClick={() => handleTabChange('file')}
                >
                  <span>📁</span>
                  Upload from File Explorer
                </button>

                <button
                  type="button"
                  className={`docUploadTabBtn ${addMode === 'camera' ? 'docUploadTabActive' : ''}`}
                  onClick={() => handleTabChange('camera')}
                >
                  <span>📷</span>
                  Capture with Camera
                </button>
              </div>

              {/* TAB 1: FILE EXPLORER UPLOAD */}
              {addMode === 'file' && (
                <div className="docFileExplorerSection">
                  <input
                    type="file"
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                    accept="image/png,image/jpeg,image/webp,image/svg+xml,application/pdf"
                    onChange={handleFileInputChange}
                  />

                  {!newDoc.fileData ? (
                    <div
                      className={`docDropzone ${isDragging ? 'docDropzoneActive' : ''}`}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <div className="docDropIcon">📂</div>
                      <h4>Drag & Drop your document here</h4>
                      <p>or click to browse files from your computer</p>
                      <div className="docDropFormats">
                        Supports: <strong>JPG, PNG, WEBP, PDF</strong> (Max 15MB)
                      </div>
                      <button
                        type="button"
                        className="docDropBrowseBtn"
                        onClick={(e) => {
                          e.stopPropagation();
                          fileInputRef.current?.click();
                        }}
                      >
                        Browse File Explorer
                      </button>
                    </div>
                  ) : (
                    <div className="docSelectedFilePreview">
                      <div className="docPreviewThumb">
                        {newDoc.fileType?.includes('pdf') ? (
                          <div className="docPdfBox">
                            <span>📄</span>
                            <small>PDF</small>
                          </div>
                        ) : (
                          <img
                            src={newDoc.fileData}
                            alt="Selected preview"
                            className="docPreviewImg"
                          />
                        )}
                      </div>

                      <div className="docPreviewDetails">
                        <div className="docPreviewName" title={newDoc.fileName}>
                          {newDoc.fileName}
                        </div>
                        <div className="docPreviewMeta">
                          <span>Size: <strong>{newDoc.fileSize}</strong></span>
                          <span>Format: <strong>{newDoc.fileType}</strong></span>
                        </div>
                        <div className="docPreviewBadge">✓ Ready to save</div>
                      </div>

                      <button
                        type="button"
                        className="docChangeFileBtn"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        Change File
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: CAMERA CAPTURE */}
              {addMode === 'camera' && (
                <div className="docCameraSection">
                  {cameraLoading && (
                    <div className="docCameraLoading">
                      <div className="docCameraSpinner" />
                      <p>Initializing camera...</p>
                    </div>
                  )}

                  {cameraError && (
                    <div className="docCameraErrorBox">
                      <span className="docCameraErrorIcon">⚠️</span>
                      <h4>Camera Access Notice</h4>
                      <p>{cameraError}</p>
                      
                      <div className="docCameraErrorActions">
                        <button
                          type="button"
                          className="docBtnPrimary"
                          onClick={() => handleTabChange('file')}
                        >
                          📁 Switch to File Explorer Upload
                        </button>

                        <button
                          type="button"
                          className="docBtnSecondary"
                          onClick={() => fallbackCameraInputRef.current?.click()}
                        >
                          📱 Open Device Camera Picker
                        </button>
                      </div>

                      <input
                        type="file"
                        ref={fallbackCameraInputRef}
                        accept="image/*"
                        capture="environment"
                        style={{ display: 'none' }}
                        onChange={handleFileInputChange}
                      />
                    </div>
                  )}

                  {/* ACTIVE LIVE CAMERA FEED */}
                  {!capturedPhoto && isCameraActive && (
                    <div className="docCameraViewport">
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="docCameraVideo"
                      />

                      {/* Viewfinder Overlay Guides */}
                      <div className="docCameraGuides">
                        <div className="docGuideCorner docGuideTL" />
                        <div className="docGuideCorner docGuideTR" />
                        <div className="docGuideCorner docGuideBL" />
                        <div className="docGuideCorner docGuideBR" />
                        <span className="docGuideText">Align document inside the frame</span>
                      </div>

                      <div className="docCameraControls">
                        <button
                          type="button"
                          className="docShutterBtn"
                          onClick={handleCaptureSnapshot}
                          title="Capture Photo"
                        >
                          <span className="docShutterInner">📸</span>
                          Capture Photo
                        </button>
                      </div>
                    </div>
                  )}

                  {/* CAPTURED PHOTO PREVIEW */}
                  {capturedPhoto && (
                    <div className="docCapturedBox">
                      <div className="docCapturedImgWrapper">
                        <img
                          src={capturedPhoto}
                          alt="Captured Document"
                          className="docCapturedImg"
                        />
                        <span className="docCapturedBadge">✓ Photo Snapped</span>
                      </div>

                      <div className="docCapturedActions">
                        <button
                          type="button"
                          className="docBtnRetake"
                          onClick={handleRetakePhoto}
                        >
                          🔄 Retake Photo
                        </button>

                        <span className="docCapturedSuccessText">
                          ✓ Photo captured ({newDoc.fileSize})
                        </span>
                      </div>
                    </div>
                  )}

                  {!isCameraActive && !capturedPhoto && !cameraLoading && !cameraError && (
                    <div className="docCameraStartPrompt">
                      <span className="docCameraPromptIcon">📷</span>
                      <h4>Ready to capture your document?</h4>
                      <p>Click below to open your camera and take a crisp snapshot.</p>
                      <button
                        type="button"
                        className="docBtnPrimary"
                        onClick={startCamera}
                      >
                        📷 Launch Camera Feed
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* MODAL FOOTER */}
              <div className="docModalFooter">
                <button
                  type="button"
                  className="docBtnCancel"
                  onClick={closeAddModal}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="docBtnSave"
                  disabled={!newDoc.fileData || !newDoc.title.trim()}
                >
                  <span>💾</span>
                  Save Document to Wallet
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: VIEW / LIGHTBOX ================= */}
      {previewDoc && (
        <div className="docModalBackdrop" onClick={() => setPreviewDoc(null)}>
          <div className="docLightboxContainer" onClick={(e) => e.stopPropagation()}>
            <div className="docLightboxHeader">
              <div className="docLightboxTitle">
                <span className="docCategoryBadge">{previewDoc.category}</span>
                <h2>{previewDoc.title}</h2>
                <span className="docVerifiedBadge">✓ {previewDoc.status}</span>
              </div>
              
              <div className="docLightboxActions">
                <button
                  type="button"
                  className="docActionBtn docBtnDownload"
                  onClick={() => handleDownload(previewDoc)}
                >
                  <span>⬇️</span> Download
                </button>
                <button
                  type="button"
                  className="docActionBtn docBtnDelete"
                  onClick={() => {
                    const doc = previewDoc;
                    setPreviewDoc(null);
                    confirmDelete(doc);
                  }}
                >
                  <span>🗑️</span> Delete
                </button>
                <button
                  type="button"
                  className="docModalCloseBtn"
                  onClick={() => setPreviewDoc(null)}
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="docLightboxBody">
              {previewDoc.fileType?.includes('pdf') || previewDoc.dataUrl?.startsWith('data:application/pdf') ? (
                <div className="docPdfViewer">
                  <iframe
                    src={previewDoc.dataUrl}
                    title={previewDoc.title}
                    className="docPdfIframe"
                  />
                  <div className="docPdfFallbackBar">
                    <span>PDF Document: {previewDoc.fileName}</span>
                    <button
                      type="button"
                      className="docBtnPrimary"
                      onClick={() => handleDownload(previewDoc)}
                    >
                      ⬇️ Download PDF to Read
                    </button>
                  </div>
                </div>
              ) : (
                <div className="docLightboxImgWrapper">
                  <img
                    src={previewDoc.dataUrl}
                    alt={previewDoc.title}
                    className="docLightboxImg"
                  />
                </div>
              )}
            </div>

            <div className="docLightboxFooter">
              <div className="docLightboxMetaItem">
                <span>File Name:</span> <strong>{previewDoc.fileName}</strong>
              </div>
              {previewDoc.docNumber && (
                <div className="docLightboxMetaItem">
                  <span>Document No:</span> <strong>{previewDoc.docNumber}</strong>
                </div>
              )}
              <div className="docLightboxMetaItem">
                <span>File Size:</span> <strong>{previewDoc.fileSize}</strong>
              </div>
              <div className="docLightboxMetaItem">
                <span>Uploaded On:</span> <strong>{previewDoc.uploadedAt}</strong>
              </div>
              <div className="docLightboxMetaItem">
                <span>Source:</span> <strong>{previewDoc.source || 'Wallet'}</strong>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: DELETE CONFIRMATION ================= */}
      {docToDelete && (
        <div className="docModalBackdrop" onClick={() => setDocToDelete(null)}>
          <div className="docDeleteModalContainer" onClick={(e) => e.stopPropagation()}>
            <div className="docDeleteIcon">🗑️</div>
            <h3>Delete Document?</h3>
            <p>
              Are you sure you want to permanently delete <strong>"{docToDelete.title}"</strong> from your Document Wallet?
            </p>
            <p className="docDeleteWarning">
              This action cannot be undone. Scholarship applications may require this document to be re-uploaded.
            </p>

            <div className="docDeleteModalActions">
              <button
                type="button"
                className="docBtnCancel"
                onClick={() => setDocToDelete(null)}
              >
                Cancel
              </button>

              <button
                type="button"
                className="docBtnDeletePermanent"
                onClick={executeDelete}
              >
                Yes, Delete Document
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: GENERATE CONTACT CARD ================= */}
      {showContactCard && (
        <div className="docModalBackdrop" onClick={() => setShowContactCard(false)}>
          <div className="docContactCardModal" onClick={(e) => e.stopPropagation()}>
            <div className="docContactCardHeader">
              <span>ScholarshipConnect AI • Digital Scholar ID</span>
              <button
                type="button"
                className="docModalCloseBtn"
                onClick={() => setShowContactCard(false)}
              >
                ✕
              </button>
            </div>

            <div className="docContactCardBody">
              <div className="docContactCardAvatar">
                <span>{initials}</span>
              </div>

              <h3>{profileName}</h3>
              <p className="docContactStudentId">
                Student ID: <strong>{user?.studentId || 'SC-2026-SK8924'}</strong>
              </p>

              <div className="docContactDetailsList">
                <div className="docContactDetail">
                  <span>📧 Email:</span>
                  <strong>{user?.email || 'sinchana.kotari@example.com'}</strong>
                </div>
                <div className="docContactDetail">
                  <span>📱 Phone:</span>
                  <strong>{user?.phone || '+91 98765 43210'}</strong>
                </div>
                <div className="docContactDetail">
                  <span>🎂 Date of Birth:</span>
                  <strong>{user?.dateOfBirth || '12 Aug 2005'}</strong>
                </div>
                <div className="docContactDetail">
                  <span>🛡️ Aadhaar Status:</span>
                  <strong style={{ color: user?.aadhaarVerified ? '#10b981' : '#f59e0b' }}>
                    {user?.aadhaarVerified ? '✓ UIDAI Verified' : '⚠ Aadhaar Pending'}
                  </strong>
                </div>
                <div className="docContactDetail">
                  <span>📁 Documents in Wallet:</span>
                  <strong>{documents.length} {documents.length === 1 ? 'Saved Document' : 'Saved Documents'}</strong>
                </div>
              </div>

              <div className="docContactCardQrMock">
                <div className="docQrBox">
                  <div className="docQrSquare" />
                  <div className="docQrSquare" />
                  <div className="docQrSquare" />
                </div>
                <span>Official Digital Credential • Scannable QR ID</span>
              </div>
            </div>

            <div className="docContactCardFooter">
              <button
                type="button"
                className="docBtnPrimary"
                onClick={() => {
                  showToast('Contact Card exported successfully!', 'success');
                  setShowContactCard(false);
                }}
              >
                Download / Print ID Card
              </button>
            </div>
          </div>
        </div>
      )}

    </main>
  );
}

export default DocumentWallet;
