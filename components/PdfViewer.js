// components/PdfViewer.js
import React, { useState } from 'react';
import { Worker, Viewer } from '@react-pdf-viewer/core';
import { toolbarPlugin } from '@react-pdf-viewer/toolbar';
import { zoomPlugin } from '@react-pdf-viewer/zoom';
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/toolbar/lib/styles/index.css';
import '@react-pdf-viewer/zoom/lib/styles/index.css';

const PdfViewer = ({ fileUrl }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState(null);

    const toolbarPluginInstance = toolbarPlugin();
    const zoomPluginInstance = zoomPlugin();

    const { Toolbar } = toolbarPluginInstance;

    const handleDocumentLoad = () => {
        setIsLoading(false);
    };

    const handleLoadError = (error) => {
        console.error('Error loading PDF:', error);
        setLoadError('Failed to load PDF. Please try again.');
        setIsLoading(false);
    };

    return (
        <div className="pdf-viewer h-full w-full bg-white rounded shadow-md flex flex-col">
            <Worker workerUrl={`https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js`}>
                {fileUrl ? (
                    <>
                        <div className="p-1 border-b">
                            <Toolbar />
                        </div>
                        <div className="flex-grow relative">
                            {isLoading && (
                                <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-50">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                                </div>
                            )}
                            {loadError && (
                                <div className="absolute inset-0 flex items-center justify-center bg-red-100 text-red-600">
                                    {loadError}
                                </div>
                            )}
                            <Viewer
                                fileUrl={fileUrl}
                                plugins={[toolbarPluginInstance, zoomPluginInstance]}
                                defaultScale="PageWidth"
                                onDocumentLoad={handleDocumentLoad}
                                onError={handleLoadError}
                            />
                        </div>
                    </>
                ) : (
                    <div className="flex items-center justify-center h-full">
                        <p className="text-gray-500">Loading PDF...</p>
                    </div>
                )}
            </Worker>
        </div>
    );
};

export default PdfViewer;