// Custom CSS styles for Events components
export const customStyles = `
  .line-clamp-1 {
    display: -webkit-box;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  
  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  
  .tooltip {
    position: relative;
  }
  
  .tooltip .tooltip-content {
    visibility: hidden;
    opacity: 0;
    position: absolute;
    z-index: 9999;
    bottom: 125%; /* Position above the element */
    left: 50%;
    transform: translateX(-50%);
    background-color: rgba(0, 0, 0, 0.9);
    color: white;
    text-align: center;
    padding: 8px 12px;
    border-radius: 6px;
    font-size: 14px;
    line-height: 1.4;
    min-width: 120px;
    max-width: 250px;
    white-space: normal;
    word-wrap: break-word;
    transition: opacity 0.3s, visibility 0.3s;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    pointer-events: none;
  }
  
  .tooltip .tooltip-content::after {
    content: "";
    position: absolute;
    top: 100%;
    left: 50%;
    margin-left: -5px;
    border-width: 5px;
    border-style: solid;
    border-color: rgba(0, 0, 0, 0.9) transparent transparent transparent;
  }
  
  .tooltip:hover .tooltip-content {
    visibility: visible;
    opacity: 1;
  }
  
  /* Modal fixes - ensure modals appear above navbar */
  .modal-overlay {
    z-index: 1000 !important;
  }
  
  .modal-container {
    z-index: 1001 !important;
  }

  /* Fix tooltip position to avoid cutoff */
  .tooltip .tooltip-content {
    max-width: 300px;
    overflow: visible;
    white-space: normal;
    word-wrap: break-word;
  }
`