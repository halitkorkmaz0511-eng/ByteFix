import { useState, useEffect } from 'react';
import { soundSystem } from '../utils/soundSystem';
import './MiniGame.css';

const allFiles = [
  { id: 1, name: 'OldVideo.mp4', size: '1.2 GB', deletable: true, icon: '🎬' },
  { id: 2, name: 'Cache.tmp', size: '890 MB', deletable: true, icon: '📄' },
  { id: 3, name: 'RandomFile.tmp', size: '450 MB', deletable: true, icon: '📄' },
  { id: 4, name: 'GameInstaller.exe', size: '2.1 GB', deletable: true, icon: '🎮' },
  { id: 5, name: 'ImportantProject.docx', size: '2 MB', deletable: false, icon: '📝' },
  { id: 6, name: 'BrowserCache', size: '500 MB', deletable: true, icon: '🌐' },
  { id: 7, name: 'Taxes2020.pdf', size: '5 MB', deletable: false, icon: '📋' },
  { id: 8, name: 'OldPhotos.zip', size: '800 MB', deletable: true, icon: '📷' },
  { id: 9, name: 'SystemFiles', size: 'N/A', deletable: false, icon: '⚠️' },
  { id: 10, name: 'MusicCollection.mp3', size: '1.5 GB', deletable: true, icon: '🎵' }
];

export function CleanFilesGame({ onComplete, speedMultiplier = 1 }) {
  console.log('CleanFilesGame rendering, speedMultiplier:', speedMultiplier);
  const [files, setFiles] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isComplete, setIsComplete] = useState(false);
  const [storageBefore, setStorageBefore] = useState(91);
  const [storageAfter, setStorageAfter] = useState(91);

  useEffect(() => {
    // Shuffle and pick files
    const shuffled = [...allFiles].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, 8);
    setFiles(selected);
  }, []);

  const toggleFile = (fileId) => {
    const file = files.find(f => f.id === fileId);
    if (!file.deletable) {
      soundSystem.playError();
      return;
    }
    
    soundSystem.playClick();
    
    setSelectedFiles(prev => {
      if (prev.includes(fileId)) {
        return prev.filter(id => id !== fileId);
      }
      return [...prev, fileId];
    });
  };

  const handleConfirm = () => {
    // Calculate space freed
    let spaceFreed = 0;
    let deletedImportant = false;
    
    selectedFiles.forEach(fileId => {
      const file = files.find(f => f.id === fileId);
      if (file.deletable) {
        const size = parseFloat(file.size);
        spaceFreed += isNaN(size) ? 0.5 : size;
      }
    });

    // Check if important files were selected
    const importantFiles = files.filter(f => !f.deletable);
    deletedImportant = importantFiles.some(f => selectedFiles.includes(f.id));

    // Calculate new storage percentage
    const freedPercent = Math.min(50, Math.round(spaceFreed / 10));
    const newStorage = Math.max(15, storageBefore - freedPercent);
    
    setStorageAfter(newStorage);
    setIsComplete(true);
    soundSystem.playSuccess();

    setTimeout(() => {
      onComplete(!deletedImportant);
    }, 2000);
  };

  return (
    <div className="mini-game">
      <div className="mini-game-header">
        <h2>🗑️ CLEAN UNNECESSARY FILES</h2>
        <div className="storage-meter">
          <span>Storage: {storageBefore}%</span>
          <div className="storage-bar">
            <div 
              className="storage-fill" 
              style={{ width: `${storageBefore}%` }}
            ></div>
          </div>
        </div>
        <p className="instruction">
          Select files that can be safely deleted. <br/>
          <strong>Important files (marked with ⚠️) should NOT be deleted!</strong>
        </p>
      </div>

      <div className="files-grid">
        {files.map(file => (
          <div
            key={file.id}
            className={`file-item ${selectedFiles.includes(file.id) ? 'selected' : ''} ${!file.deletable ? 'important' : ''}`}
            onClick={() => toggleFile(file.id)}
          >
            <span className="file-icon">{file.icon}</span>
            <div className="file-info">
              <span className="file-name">{file.name}</span>
              <span className="file-size">{file.size}</span>
            </div>
            {selectedFiles.includes(file.id) && (
              <span className="check-mark">✓</span>
            )}
            {!file.deletable && (
              <span className="warning-badge">⚠️</span>
            )}
          </div>
        ))}
      </div>

      {!isComplete && (
        <button 
          className="confirm-btn"
          onClick={handleConfirm}
          disabled={selectedFiles.length === 0}
        >
          Delete Selected Files ({selectedFiles.length})
        </button>
      )}

      {isComplete && (
        <div className="completion-message">
          <h3>STORAGE CLEANED!</h3>
          <div className="storage-result">
            <span className="storage-old">{storageBefore}%</span>
            <span className="storage-arrow">→</span>
            <span className="storage-new">{storageAfter}%</span>
          </div>
        </div>
      )}
    </div>
  );
}
