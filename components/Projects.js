// components/Projects.js
import React, { useEffect, useState } from 'react';
import { PencilIcon, TrashIcon, CheckIcon, XIcon, ChevronUpIcon, ChevronDownIcon, SparklesIcon } from '@heroicons/react/solid';

const Projects = ({ setProjectsJson, icon, projectsJson }) => {
  const [projectEntries, setProjectEntries] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingEntryId, setEditingEntryId] = useState(null);
  const [deleteEntryId, setDeleteEntryId] = useState(null);
  const [showSuggestion, setShowSuggestion] = useState(false);
  const [suggestion, setSuggestion] = useState('');
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [newEntry, setNewEntry] = useState({
    id: '',
    project_name: '',
    start_date: '',
    end_date: '',
    description: '• ',
    order: null,
  });

  useEffect(() => {
    if (projectsJson?.length) {
      let keys = Object.keys(projectsJson[0]);

      // Create a Set to track existing IDs
      let idSet = new Set();

      projectsJson.forEach((item, index) => {
        // If the item doesn't have an ID or the ID is already used, generate a new one
        if (!item.id || idSet.has(item.id)) {
          item.id = Date.now().toString() + index;
        }

        // Add the ID to the Set to track it
        idSet.add(item.id);

        // Ensure all keys exist and are populated with empty strings if missing
        keys.forEach(k => {
          if (!item[k]) {
            item[k] = '';  // Fix: item['k'] -> item[k]
          }
        });
      });

      setProjectEntries(projectsJson);
    }
  }, [projectsJson])

  const updateParentState = (entries) => {
    setProjectsJson(entries.map(project => ({
      project_name: project.project_name,
      start_date: project.start_date,
      end_date: project.end_date,
      description: project.description
    })));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewEntry((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDescriptionKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const { selectionStart, selectionEnd } = e.target;
      const newValue = newEntry.description.substring(0, selectionStart) + '\n• ' + newEntry.description.substring(selectionEnd);
      setNewEntry((prev) => ({
        ...prev,
        description: newValue,
      }));
    }
  };

  const handleAddEntry = () => {
    setIsAdding(true);
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingEntryId(null);
    setNewEntry({
      id: '',
      project_name: '',
      start_date: '',
      end_date: '',
      description: '• ',
      order: null,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const entryPayload = {
      id: editingEntryId || Date.now().toString(),
      project_name: newEntry.project_name,
      start_date: newEntry.start_date || null,
      end_date: newEntry.end_date || null,
      description: newEntry.description,
      order: newEntry.order || projectEntries.length + 1,
    };

    let updatedEntries;
    if (editingEntryId) {
      updatedEntries = projectEntries.map(entry =>
        entry.id === editingEntryId ? entryPayload : entry
      );
    } else {
      updatedEntries = [...projectEntries, entryPayload];
    }

    setProjectEntries(updatedEntries);
    updateParentState(updatedEntries);
    handleCancel();
  };

  const handleEdit = (entry) => {
    setEditingEntryId(entry.id);
    setNewEntry({
      ...entry,
    });
  };

  const handleDelete = () => {
    const updatedEntries = projectEntries.filter(entry => entry.id !== deleteEntryId);
    setProjectEntries(updatedEntries);
    updateParentState(updatedEntries);
    setDeleteEntryId(null);
  };

  const handleImproveWithAI = async () => {
    setIsGeneratingAI(true);
    try {
      const apiPayload = {
        projectDescriptionText: newEntry.description,
      };

      if (showSuggestion && suggestion.trim() !== '') {
        apiPayload.projectDescriptionText += `\n\nProvided Suggestion:\n${suggestion.trim()}`;
      }

      console.log('JSON request being made:', JSON.stringify(apiPayload, null, 2));

      const response = await fetch('https://api.parsinga.com/generate_project_description/', {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiPayload),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      const improvedDescription = Object.values(data).join('\n• ');
      setNewEntry((prev) => ({
        ...prev,
        description: improvedDescription.startsWith('• ') ? improvedDescription : `• ${improvedDescription}`,
      }));
    } catch (error) {
      console.error('Error improving description with AI:', error);
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const moveProject = (index, direction) => {
    const newEntries = [...projectEntries];
    const [movedItem] = newEntries.splice(index, 1);
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    newEntries.splice(newIndex, 0, movedItem);

    const updatedEntries = newEntries.map((entry, i) => ({
      ...entry,
      order: i + 1
    }));

    setProjectEntries(updatedEntries);
    updateParentState(updatedEntries);
  };

  return (
    <div className="collapse collapse-arrow border border-base-300 bg-base-100 rounded-box mb-4">
      <input type="checkbox" className="peer" />
      <div className="collapse-title text-xl font-medium">
        {icon}
        Projects
      </div>
      <div className="collapse-content">
        {isAdding || editingEntryId ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-700">Project Name</label>
              <input
                type="text"
                name="project_name"
                value={newEntry.project_name}
                onChange={handleChange}
                className="input input-bordered w-full"
                required
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700">Start Date</label>
                <input
                  type="date"
                  name="start_date"
                  value={newEntry.start_date}
                  onChange={handleChange}
                  className="input input-bordered w-full"
                />
              </div>
              <div>
                <label className="block text-gray-700">End Date</label>
                <input
                  type="date"
                  name="end_date"
                  value={newEntry.end_date}
                  onChange={handleChange}
                  className="input input-bordered w-full"
                />
              </div>
            </div>
            <div>
              <label className="block text-gray-700">Description</label>
              <textarea
                name="description"
                value={newEntry.description}
                onChange={handleChange}
                onKeyDown={handleDescriptionKeyDown}
                className="textarea textarea-bordered w-full text-sm"
                required
              />
              <div className="flex items-center mt-2 mb-2">
                <input
                  type="checkbox"
                  checked={showSuggestion}
                  onChange={() => setShowSuggestion(!showSuggestion)}
                  className="toggle toggle-primary mr-2"
                />
                <label className="label-text">Add A Suggestion</label>
              </div>
              {showSuggestion && (
                <textarea
                  value={suggestion}
                  onChange={(e) => setSuggestion(e.target.value)}
                  className="textarea textarea-bordered w-full text-sm"
                  placeholder="Enter your suggestion here..."
                />
              )}
              <button
                type="button"
                onClick={handleImproveWithAI}
                className={`btn btn-secondary mt-2 ${isGeneratingAI ? 'loading' : ''}`}
                disabled={isGeneratingAI}
              >
                {isGeneratingAI ? (
                  <>
                    <span className="loading loading-spinner loading-sm mr-2"></span>
                    GENERATING with AI
                  </>
                ) : (
                  <>
                    <SparklesIcon className="h-5 w-5 mr-2" />
                    Improve with AI
                  </>
                )}
              </button>
            </div>
            <div className="flex justify-end space-x-2 mt-4">
              <button type="button" onClick={handleCancel} className="btn btn-error">
                <XIcon className="h-5 w-5" />
              </button>
              <button type="submit" className="btn btn-success">
                <CheckIcon className="h-5 w-5" />
              </button>
            </div>
          </form>
        ) : (
          <div>
            <button onClick={handleAddEntry} className="btn btn-outline btn-primary mb-4">
              + Add Project
            </button>
            {projectEntries.length > 0 ? (
              <ul>
                {projectEntries.map((entry, index) => (
                  <li key={entry.id} className="mb-4 border p-4 rounded relative">
                    <div className="flex justify-between items-start">
                      <div className="flex-grow">
                        <h4 className="text-lg font-semibold">{entry.project_name}</h4>
                        <p className="text-gray-500">{entry.start_date} - {entry.end_date || 'Present'}</p>
                        {entry.description.split('\n').map((line, lineIndex) => (
                          <p key={lineIndex} className="text-gray-700 text-sm">{line}</p>
                        ))}
                      </div>
                      <div className="flex flex-col space-y-2 ml-4">
                        <button
                          onClick={() => moveProject(index, 'up')}
                          className="btn btn-sm btn-circle"
                          disabled={index === 0}
                        >
                          <ChevronUpIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => moveProject(index, 'down')}
                          className="btn btn-sm btn-circle"
                          disabled={index === projectEntries.length - 1}
                        >
                          <ChevronDownIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                    <div className="flex justify-end space-x-2 mt-4">
                      <button
                        onClick={() => handleEdit(entry)}
                        className="btn btn-sm btn-primary"
                      >
                        <PencilIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => setDeleteEntryId(entry.id)}
                        className="btn btn-sm btn-error"
                      >
                        <TrashIcon className="h-5 w-5 text-white" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No projects added yet</p>
            )}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteEntryId && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">Confirm Deletion</h3>
            <p className="py-4">Are you sure you want to delete this project entry?</p>
            <div className="modal-action">
              <button
                onClick={() => setDeleteEntryId(null)}
                className="btn"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="btn btn-error"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Projects;