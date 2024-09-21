'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/lib/supabaseClient';
import { ChevronDownIcon, ViewGridIcon, ViewListIcon, PlusIcon, ClockIcon, SortAscendingIcon, DocumentIcon } from '@heroicons/react/outline';

const Dashboard = () => {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [view, setView] = useState('grid');
  const [sortOption, setSortOption] = useState('timestamp-desc');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        await loadUserDocuments(session.user.id);
      } else {
        router.push('/login');
      }
    };
    fetchUser();
  }, [router]);

  const loadUserDocuments = async (userId) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_documents')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setDocuments(data);
    } catch (error) {
      console.error('Error fetching user documents:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNewDocument = async () => {
    if (!user) {
      console.error('User is not authenticated');
      return;
    }
  
    const newDocumentId = uuidv4();
    const timestamp = new Date();
    const formattedTimestamp = timestamp.toISOString().replace(/[:\-]/g, '').split('.')[0];
    const documentTitle = `Resume_${formattedTimestamp}`;
  
    try {
      const { error: documentError } = await supabase
        .from('user_documents')
        .insert({
          user_id: user.id,
          document_id: newDocumentId,
          created_at: timestamp,
          updated_at: timestamp,
          document_title: documentTitle
        });
  
      if (documentError) throw documentError;
  
      const { error: settingsError } = await supabase
        .from('document_settings')
        .insert({
          document_id: newDocumentId,
          is_initialised_flag: false,
          initialisation_method: null
        });
  
      if (settingsError) throw settingsError;
  
      await loadUserDocuments(user.id);
      router.push(`/document/${newDocumentId}/edit`);
    } catch (error) {
      console.error('Error creating new document and settings:', error.message);
    }
  };

  const handleDocumentClick = async (doc) => {
    const updatedTimestamp = new Date();

    try {
      const { error } = await supabase
        .from('user_documents')
        .update({ updated_at: updatedTimestamp })
        .eq('id', doc.id);

      if (error) throw error;
      router.push(`/document/${doc.document_id}/edit`);
    } catch (error) {
      console.error('Error updating document timestamp:', error.message);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    }).format(date);
  };

  const handleSortChange = (option) => {
    setSortOption(option);
    let sortedDocuments = [...documents];

    switch (option) {
      case 'alphabetical-asc':
        sortedDocuments.sort((a, b) => a.document_title.localeCompare(b.document_title));
        break;
      case 'alphabetical-desc':
        sortedDocuments.sort((a, b) => b.document_title.localeCompare(a.document_title));
        break;
      case 'timestamp-asc':
        sortedDocuments.sort((a, b) => new Date(a.updated_at) - new Date(b.updated_at));
        break;
      case 'timestamp-desc':
        sortedDocuments.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
        break;
    }

    setDocuments(sortedDocuments);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-primary">My Resumes</h2>
        <button
          onClick={handleCreateNewDocument}
          className="btn btn-primary"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Create New Resume
        </button>
      </div>

      <div className="bg-base-200 rounded-lg p-6 mb-8">
        <div className="flex justify-between items-center mb-4">
          <div className="dropdown dropdown-hover">
            <label tabIndex={0} className="btn btn-outline btn-sm m-1">
              <SortAscendingIcon className="h-5 w-5 mr-2" />
              Sort by
              <ChevronDownIcon className="h-5 w-5 ml-2" />
            </label>
            <ul tabIndex={0} className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52">
              <li><button onClick={() => handleSortChange('alphabetical-asc')}>Alphabetical (A-Z)</button></li>
              <li><button onClick={() => handleSortChange('alphabetical-desc')}>Alphabetical (Z-A)</button></li>
              <li><button onClick={() => handleSortChange('timestamp-asc')}>Oldest first</button></li>
              <li><button onClick={() => handleSortChange('timestamp-desc')}>Newest first</button></li>
            </ul>
          </div>
          <div className="btn-group">
            <button onClick={() => setView('grid')} className={`btn btn-sm ${view === 'grid' ? 'btn-active' : ''}`}>
              <ViewGridIcon className="h-5 w-5" />
            </button>
            <button onClick={() => setView('list')} className={`btn btn-sm ${view === 'list' ? 'btn-active' : ''}`}>
              <ViewListIcon className="h-5 w-5" />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="loading loading-spinner loading-lg text-primary"></div>
          </div>
        ) : documents.length > 0 ? (
          <div className={`${view === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}`}>
            {documents.map(doc => (
              <div 
                key={doc.id} 
                onClick={() => handleDocumentClick(doc)} 
                className={`
                  bg-base-100 p-6 rounded-lg shadow-md cursor-pointer 
                  transition-all duration-300 hover:shadow-lg hover:scale-105
                  ${view === 'list' ? 'flex items-center justify-between' : ''}
                `}
              >
                <div>
                  <h4 className="text-lg font-semibold mb-2 text-primary">{doc.document_title}</h4>
                  <p className="text-sm text-base-content/70 flex items-center">
                    <ClockIcon className="h-4 w-4 mr-1" />
                    {formatDate(doc.updated_at)}
                  </p>
                </div>
                {view === 'list' && (
                  <button className="btn btn-ghost btn-sm">
                    <DocumentIcon className="h-5 w-5" />
                    Edit
                  </button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <DocumentIcon className="h-16 w-16 mx-auto text-base-content/30 mb-4" />
            <p className="text-xl font-semibold mb-2">No resumes yet</p>
            <p className="text-base-content/70 mb-4">Create your first resume to get started</p>
            
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;