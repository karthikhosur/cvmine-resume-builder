// app/page.js
'use client';

import React, { useState, useEffect } from 'react';
import { decrypt } from '../utils/decrypt';
import { encrypt, generateHash } from '../utils/encrypt';
import { v4 as uuidv4 } from 'uuid';
import Split from 'react-split';
import { useDropzone } from 'react-dropzone';
import ContactInformation from '@/components/ContactInformation';
import ProfessionalSummary from '@/components/ProfessionalSummary';
import WorkExperience from '@/components/WorkExperience';
import Education from '@/components/Education';
import Skills from '@/components/Skills';
import Projects from '@/components/Projects';
import Certifications from '@/components/Certifications';
import PdfViewer from '@/components/PdfViewer';
import MetricsSection from '@/components/MetricsSection';

import {
  PencilIcon,
  RefreshIcon,
  ChartBarIcon,
  DocumentIcon,
  UserIcon,
  BriefcaseIcon,
  AcademicCapIcon,
  LightningBoltIcon,
  ClipboardListIcon,
  BadgeCheckIcon,
  DocumentTextIcon,
  UploadIcon,
  SaveIcon,
  CheckCircleIcon
} from '@heroicons/react/outline';
import { fetchWrapper } from '@/utils/request-interceptor';
import { checkSession, getSession } from '@/utils/sessionService';
import { jsonDeepParse } from '@/lib/supabaseClient';

const EditDocument = () => {
  // const searchParams = useSearchParams();
  const [decryptedData, setDecryptedData] = useState(null);
  const [rawDecryptedData, setRawDecryptedData] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [debugInfo, setDebugInfo] = useState('');
  const [data, setData] = useState('');
  const [parsedData, setParsedData] = useState({});
  const [initialContactInfo, setInitialContactInfo] = useState(null);
  const [decryptionError, setDecryptionError] = useState(null);
  const [activeTab, setActiveTab] = useState('content');
  const [rightPanelTab, setRightPanelTab] = useState('preview');
  const [documentTitle, setDocumentTitle] = useState('My Resume');
  const [pdfUrl, setPdfUrl] = useState('');
  const [contactJson, setContactJson] = useState(null);
  const [summaryJson, setSummaryJson] = useState(null);
  const [workExperienceJson, setWorkExperienceJson] = useState([]);
  const [educationJson, setEducationJson] = useState([]);
  const [skillsJson, setSkillsJson] = useState([]);
  const [projectsJson, setProjectsJson] = useState([]);
  const [certificationsJson, setCertificationsJson] = useState([]);
  const [loadingPdf, setLoadingPdf] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [templateType, setTemplateType] = useState(4);
  const [componentRefreshKey, setComponentRefreshKey] = useState(Date.now());

  const [userData, setUserData] = useState(null);
  const [saveId, setSaveId] = useState(0);
  const [cvPath, setCvPath] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [overwriteConfirmation, setOverwriteConfirmation] = useState(false);
  const [currentDocumentFile, setCurrentDocumentFile] = useState();



  useEffect(() => {
    const fetchUserData = async () => {
      setIsLoading(true);
      try {
        // Replace with your actual method of fetching encrypted user data
        // const encryptedData = "..."; // Placeholder for encrypted user data
        // console.log(encryptedData)
        // const decryptedData = decrypt(encryptedData);
        // setUserData(decryptedData);
        // Removed unused code
        console.log(saveId)
      } catch (error) {
        console.error('Error fetching user data:', error);
        setErrorMessage('Failed to load user data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    // fetchUserData();
    setCvPath(`${uuidv4()}.pdf`);
  }, [saveId, templateType]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      console.log('Init')
      if (checkSession()) {
        const data = getSession()
        console.log(data)
        setSaveId(data.cvBuilderId)
        setParsedData(data);
        setUserData(data)
        setInitialContactInfo(data);
        loadCVData(data.cvBuilderId)
      }
      else {
        console.log('Full URL:', window.location.href);

        const fullPath = window.location.pathname + window.location.search;
        console.log('Full path:', fullPath);

        let rawData = '';
        if (fullPath.includes('&data=')) {
          rawData = fullPath.split('&data=')[1];
        } else if (fullPath.includes('?data=')) {
          rawData = fullPath.split('?data=')[1];
        }

        console.log('Raw data:', rawData);
        setDebugInfo(prevInfo => prevInfo + `Raw data: ${rawData}\n`);

        if (rawData) {
          setData(rawData);
          try {
            const decodedData = decodeURIComponent(rawData);
            console.log('Decoded data:', decodedData);
            setDebugInfo(prevInfo => prevInfo + `Decoded data: ${decodedData}\n`);

            const decryptedData = decrypt(decodedData);
            console.log('Decrypted data:', decryptedData);
            setDebugInfo(prevInfo => prevInfo + `Decrypted data: ${JSON.stringify(decryptedData)}\n`);
            if (decryptedData && typeof decryptedData === 'object') {
              localStorage.setItem('user', JSON.stringify(decryptedData))
              setParsedData(decryptedData);
              setSaveId(decryptedData.cvBuilderId)
              setInitialContactInfo({
                firstName: decryptedData.firstName || '',
                lastName: decryptedData.lastName || '',
                emailId: decryptedData.emailId || '',
                mobileNumber: decryptedData.mobileNumber || '',
              });

              loadCVData(decryptedData.cvBuilderId)
            } else {
              setDecryptionError('Failed to decrypt data or invalid decrypted data');
            }
          } catch (error) {
            console.error('Error processing data:', error);
            setDecryptionError(error.message);
            setDebugInfo(prevInfo => prevInfo + `Error: ${error.message}\n`);
          }
        } else {
          console.log('No data parameter found in URL');
          setDebugInfo(prevInfo => prevInfo + 'No data parameter found in URL\n');
        }
      }



    }
  }, []);

  const handleRefresh = async () => {
    if (!contactJson && !summaryJson && workExperienceJson.length === 0 &&
      educationJson.length === 0 && skillsJson.length === 0 &&
      projectsJson.length === 0 && certificationsJson.length === 0) {
      console.error('No resume data available');
      return;
    }
    console.log(templateType)
    const apiPayload = {
      templateType,
      resumeData: {
        ...contactJson,
        ...summaryJson,
        workExperience: workExperienceJson,
        education: educationJson,
        skills: skillsJson,
        certifications: certificationsJson,
        projects: projectsJson
      }
    };
    console.log(apiPayload)
    setLoadingPdf(true);
    let formData = new FormData(); // Create a new FormData instance
    try {
      const response = await fetch('/api/generate-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiPayload),
      });

      if (!response.ok) throw new Error('Network response was not ok');

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const fileName = userData.firstName ? `${userData.firstName.toLowerCase()}-cv.pdf` : `cv-${timestamp}.pdf`;
      const file = makeBlobToFile(blob, fileName)
      formData.append('attachment', file, fileName);
      setCurrentDocumentFile(formData)
      console.log(url)
      setPdfUrl(url);
    } catch (error) {
      console.error('Error generating PDF:', error);
      setErrorMessage('Failed to generate PDF. Please try again.');
    } finally {
      setLoadingPdf(false);
    }

    // ?lngId=1&isCVMine=1
  };

  function makeBlobToFile(blob, filename) {
    try {
      if (blob) {
        // Create a new File object from the Blob with the provided filename
        return new File([blob], filename, { type: blob.type });
      }
    } catch (err) {
      console.error('Error converting Blob to File:', err);
    }
  }

  const uploadAttachment = async (formData) => {
    try {
      console.log(formData);

      // Await the response from the fetchWrapper.post and return it
      const res = await fetchWrapper.post('service_attachment', formData, 1);

      console.log(res); // You can still log the response for debugging
      return res; // Return the response so that the caller can handle it in `.then()`

    } catch (error) {
      console.error('Error uploading attachment:', error);
      setErrorMessage('Failed to upload attachment. Please try again.');

      // Return the error in case the caller wants to handle it
      throw error;
    } finally {
    }
  }

  const loadCVData = async (id) => {
    try {

      console.log({
        "id": id,
      })
      await fetchWrapper.post('icrweb/home/get_cv_builder_data', {
        "id": id,
      }).then(res => {
        if (res && res['data']?.list?.length) {
          if (res['data'].list[0].cvbuilderJSON) {
            res['data'].list[0].cvbuilderJSON = JSON.parse(res['data'].list[0].cvbuilderJSON)
            console.log(res['data'].list[0].cvbuilderJSON)
            mapResumeDataToComponents(res['data'].list[0].cvbuilderJSON)
          }
        }
      }).catch(err => {

      }).finally(final => {

      })

    } catch (error) {
      console.error("Error processing file:", error);
      setErrorMessage('Failed to process uploaded file. Please try again.');
    } finally {
      setUploadingFile(false);
    }
  }

  const handleFileUpload = async (file) => {
    setUploadingFile(true);
    const formData = new FormData();
    formData.append("image", file);

    try {
      const response = await fetch("https://api.parsinga.com/refit-resume-parser/", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Received data from API:', result);

      mapResumeDataToComponents(result);
      refreshAllComponents();

    } catch (error) {
      console.error("Error processing file:", error);
      setErrorMessage('Failed to process uploaded file. Please try again.');
    } finally {
      setUploadingFile(false);
    }
  };

  const refreshAllComponents = () => {
    setComponentRefreshKey(Date.now());
  };

  const mapResumeDataToComponents = (data) => {
    console.log(data)
    setContactJson({ contactInformation: data.contactInformation });
    setSummaryJson({ professionalSummary: data.professionalSummary });
    setWorkExperienceJson(data.workExperience);
    setEducationJson(data.education);
    setSkillsJson(data.skills);
    setProjectsJson(data.projects);
    setCertificationsJson(data.certifications);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => {
      if (acceptedFiles && acceptedFiles.length > 0) {
        handleFileUpload(acceptedFiles[0]);
      }
    },
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    }
  });

  const handleSave = async () => {
    if (!userData) {
      console.error('User data not available');
      setErrorMessage('User data not available. Please try again later.');
      return;
    }

    const timestamp = Date.now();
    const ip = '14.121.432.12'; // Replace with actual IP fetching logic
    const hash = generateHash(timestamp, ip, userData.region || '');

    // Use a default name if firstName is not available
    const fileName = userData.firstName ? `${userData.firstName.toLowerCase()}-cv.pdf` : `cv-${timestamp}.pdf`;

    const payload = {
      id: saveId,
      buildCVFor: 1,
      emailId: userData.emailId || '',
      cvFileName: fileName,
      cvPath: cvPath,
      cvbuilderJSON: {
        ...contactJson,
        ...summaryJson,
        workExperience: workExperienceJson,
        education: educationJson,
        skills: skillsJson,
        certifications: certificationsJson,
        projects: projectsJson,
      }
    };


    fetchWrapper.post('icrweb/home/save_cv_builder_data', payload).then(res => {
      console.log(res)
      if (res && res['status']) {
        console.log('Save successful:', res.message);
        setSaveId(res.data.id);
        // Generate a new UUID for the next save operation
        setCvPath(`${uuidv4()}.pdf`);
        setErrorMessage(null); // Clear any previous error messages
      }
      else {
        console.log('Save successful:', res.message);
      }
      setErrorMessage(res['message']); // Clear any previous error messages

    }).catch(err => {
      setErrorMessage(`An error occurred while saving: ${err.message}`);
    })

  };

  const handleFinish = () => {
    // Implement finish functionality here
    console.log("Finishing document...");
    setOverwriteConfirmation(true)
    // You might want to generate final PDF or navigate to a new page
  };

  const handleOverwrite = () => {
    setOverwriteConfirmation(false);
    const payload = {
      id: saveId,
      buildCVFor: userData.buildCVFor,
      emailId: userData.emailId || '',
      cvFileName: null,
      cvPath: null,
      finalSubmit: 1,
      cvbuilderJSON: {
        ...contactJson,
        ...summaryJson,
        workExperience: workExperienceJson,
        education: educationJson,
        skills: skillsJson,
        certifications: certificationsJson,
        projects: projectsJson,
      }
    };

    if (currentDocumentFile) {

      uploadAttachment(currentDocumentFile).then(file => {
        if (file?.['data']) {
          payload.cvFileName = file.data.a_fn;
          payload.cvPath = file.data.a_url;

          fetchWrapper.post('icrweb/home/save_cv_builder_data', payload).then(res => {
            console.log(res)
            if (res && res['status']) {
              console.log('Save successful:', res.message);
              setSaveId(res.data.id);
              // Generate a new UUID for the next save operation
              setCvPath(`${uuidv4()}.pdf`);
              setErrorMessage(null); // Clear any previous error messages
            }
            else {
              console.log('Save successful:', res.message);
            }
            setErrorMessage(res['message']); // Clear any previous error messages

          }).catch(err => {
            setErrorMessage(`An error occurred while saving: ${err.message}`);
          })
        }
      })
    }


  }

  return (
    <div className="container mx-auto mt-3 max-w-full">
      {errorMessage && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{errorMessage}</span>
        </div>
      )}
      <Split
        sizes={[50, 50]}
        minSize={300}
        expandToMin={false}
        gutterSize={10}
        gutterAlign="center"
        snapOffset={30}
        dragInterval={1}
        direction="horizontal"
        cursor="col-resize"
        className="flex space-x-4"
        gutter={() => {
          const gutter = document.createElement('div');
          gutter.className = `gutter-horizontal bg-base-300 hover:bg-primary transition-colors duration-300`;
          return gutter;
        }}
      >
        <div className="flex flex-col bg-base-100 rounded-lg shadow-lg overflow-hidden">
          <div className="bg-base-200 p-2 flex items-center justify-between">
            <h1 className="text-lg font-bold text-primary">{documentTitle}</h1>
            <div className="tabs tabs-boxed ml-4">
              <button
                className={`tab tab-sm ${activeTab === 'content' ? 'tab-active' : ''}`}
                onClick={() => setActiveTab('content')}
              >
                Content
              </button>
              <button
                className={`tab tab-sm ${activeTab === 'import' ? 'tab-active' : ''}`}
                onClick={() => setActiveTab('import')}
              >
                Import
              </button>
              <button
                className={`tab tab-sm ${activeTab === 'design' ? 'tab-active' : ''}`}
                onClick={() => setActiveTab('design')}
              >
                Templates
              </button>
            </div>
          </div>

          <div className="flex-grow overflow-auto p-4">
            {activeTab === 'content' && (
              <div className="space-y-4">
                <ContactInformation
                  key={`contact-${componentRefreshKey}`}
                  setContactJson={setContactJson} data={contactJson}
                  icon={<UserIcon className="h-5 w-5 inline mr-2" />}
                  initialValues={initialContactInfo}
                />
                <WorkExperience
                  setWorkExperienceJson={setWorkExperienceJson}
                  icon={<BriefcaseIcon className="h-5 w-5 inline mr-2" />}
                  workExperienceJson={workExperienceJson}
                />
                <Education
                  setEducationJson={setEducationJson} educationJson={educationJson}
                  icon={<AcademicCapIcon className="h-5 w-5 inline mr-2" />}
                />
                <Skills
                  setSkillsJson={setSkillsJson} skillsJson={skillsJson}
                  icon={<LightningBoltIcon className="h-5 w-5 inline mr-2" />}
                />
                <Projects
                  setProjectsJson={setProjectsJson} projectsJson={projectsJson}
                  icon={<ClipboardListIcon className="h-5 w-5 inline mr-2" />}
                />
                <Certifications certificationsJson={certificationsJson}
                  setCertificationsJson={setCertificationsJson}
                  icon={<BadgeCheckIcon className="h-5 w-5 inline mr-2" />}
                />
                <ProfessionalSummary summaryJson={summaryJson}
                  setSummaryJson={setSummaryJson}
                  icon={<DocumentTextIcon className="h-5 w-5 inline mr-2" />}
                  apiPayload={{
                    contactInformation: contactJson,
                    workExperience: workExperienceJson,
                    education: educationJson,
                    skills: skillsJson,
                    certifications: certificationsJson,
                    projects: projectsJson,
                  }}
                />
                <div className="flex justify-between mt-6">
                  <button
                    onClick={handleSave}
                    className="btn btn-primary"
                  >
                    <SaveIcon className="h-5 w-5 mr-2" />
                    Save
                  </button>
                  <button
                    onClick={handleFinish}
                    className="btn btn-success"
                  >
                    <CheckCircleIcon className="h-5 w-5 mr-2" />
                    Finish
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'import' && (
              <div className="bg-base-200 p-4 rounded-lg">
                <h3 className="text-lg font-bold mb-2 text-primary">Import from Resume</h3>
                <div {...getRootProps()} className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer">
                  <input {...getInputProps()} />
                  {isDragActive ? (
                    <p>Drop the files here ...</p>
                  ) : (
                    <>
                      <UploadIcon className="mx-auto h-12 w-12 text-gray-400" />
                      <p>Drag and drop some files here, or click to select files</p>
                    </>
                  )}
                </div>
                <p className="mt-2 text-sm text-gray-500">Supported file types: .pdf, .docx</p>
                {uploadingFile && (
                  <div className="mt-4 text-center">
                    <div className="loading loading-spinner loading-md"></div>
                    <p>Uploading and Parsing file...</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'design' && (
              <div className="bg-base-200 p-6 rounded-lg">
                <h3 className="text-2xl font-bold mb-6 text-primary">Choose Your Template Design</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[
                    { id: 4, name: 'Simple', description: 'Clean and straightforward design(Recommended)' },
                    { id: 2, name: 'Classic', description: 'Traditional and elegant layout' },
                    { id: 3, name: 'Modern', description: 'Contemporary and sleek appearance' },
                    { id: 1, name: 'Basic', description: 'Basic Design with easy font' },
                    { id: 5, name: 'Scientific', description: 'Ideal for academic and research-focused resumes' }
                  ].map((template) => (
                    <div
                      key={template.id}
                      className={`bg-base-100 rounded-lg shadow-md transition-all duration-300 cursor-pointer 
                        ${templateType === template.id ? 'ring-2 ring-primary' : 'hover:shadow-lg'}`}
                      onClick={() => setTemplateType(template.id)}
                    >
                      <div className="relative aspect-w-16 aspect-h-9 rounded-t-lg overflow-hidden">
                        <img
                          src={`/type${template.id}.svg`}
                          alt={`${template.name} template preview`}
                          className="object-cover w-full h-full"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-base-300 to-transparent opacity-50"></div>
                      </div>
                      <div className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-lg font-semibold text-base-content">{template.name}</h4>
                          <input
                            type="radio"
                            id={`template-${template.id}`}
                            name="template"
                            value={template.id}
                            checked={templateType === template.id}
                            onChange={() => setTemplateType(template.id)}
                            className="radio radio-primary"
                          />
                        </div>
                        <p className="text-sm text-base-content/70">{template.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right panel */}
        <div className="flex flex-col bg-base-100 rounded-lg shadow-lg overflow-hidden">
          <div className="bg-base-200 p-2 flex items-center justify-between">
            <div className="tabs tabs-boxed">
              <button
                className={`tab tab-sm ${rightPanelTab === 'preview' ? 'tab-active' : ''}`}
                onClick={() => setRightPanelTab('preview')}
              >
                <DocumentIcon className="h-4 w-4 mr-1 inline" />
                Preview
              </button>
              <button
                className={`tab tab-sm ${rightPanelTab === 'metrics' ? 'tab-active' : ''}`}
                onClick={() => setRightPanelTab('metrics')}
              >
                <ChartBarIcon className="h-4 w-4 mr-1 inline" />
                Metrics
              </button>
            </div>
            {rightPanelTab === 'preview' && (
              <button
                className="btn btn-primary btn-sm"
                onClick={handleRefresh}
                disabled={loadingPdf}
              >
                <RefreshIcon className="h-4 w-4 mr-1" />
                Refresh
              </button>
            )}
          </div>
          <div className="flex-grow overflow-auto p-4">
            {rightPanelTab === 'preview' && (
              <div className="h-full flex flex-col">
                {loadingPdf ? (
                  <div className="flex-grow flex items-center justify-center">
                    <div className="loading loading-spinner loading-lg text-primary"></div>
                  </div>
                ) : pdfUrl ? (
                  <PdfViewer fileUrl={pdfUrl} />
                ) : (
                  <div className="flex-grow flex items-center justify-center text-base-content">
                    <p>No PDF to display. Click Refresh to generate.</p>
                  </div>
                )}
              </div>
            )}

            {rightPanelTab === 'metrics' && (
              <MetricsSection
                resumeData={{
                  contactInformation: contactJson,
                  professionalSummary: summaryJson,
                  workExperience: workExperienceJson,
                  education: educationJson,
                  skills: skillsJson,
                  projects: projectsJson,
                  certifications: certificationsJson,
                }}
              />
            )}
          </div>
        </div>
      </Split>

      {/* Delete Confirmation Modal */}
      {overwriteConfirmation && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">Confirm to Replace</h3>
            <p className="py-4">Are you sure to replace existing R+-esume?</p>
            <div className="modal-action">
              <button
                onClick={() => setOverwriteConfirmation(null)}
                className="btn"
              >
                No
              </button>
              <button
                onClick={handleOverwrite}
                className="btn btn-primary"
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditDocument;
