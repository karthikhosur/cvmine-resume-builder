// components/Education.js
import React, { useEffect, useState } from 'react';
import { PencilIcon, TrashIcon, CheckIcon, XIcon, ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/solid';

const Education = ({ setEducationJson, icon, educationJson }) => {
  const [educationEntries, setEducationEntries] = useState(educationJson || []);
  const [isAdding, setIsAdding] = useState(false);
  const [editingEntryId, setEditingEntryId] = useState(null);
  const [deleteEntryId, setDeleteEntryId] = useState(null);
  const [newEntry, setNewEntry] = useState({
    id: '',
    school: '',
    location: '',
    gpa: '',
    degree: '',
    field_of_study: '',
    start_date: '',
    end_date: '',
    description: '',
    is_current: false,
    order: null,
  });

  const updateParentState = (entries) => {
    const formattedEntries = entries.map((entry) => ({
      school: entry.school,
      degree: entry.degree,
      field_of_study: entry.field_of_study,
      start_date: entry.start_date,
      end_date: entry.end_date,
      is_current: entry.is_current,
      description: entry.description,
      location: entry.location,
      gpa: entry.gpa,
    }));
    setEducationJson(formattedEntries);
  };


  useEffect(() => {
    if (educationJson?.length) {
      let keys = Object.keys(educationJson[0]);

      // Create a Set to track existing IDs
      let idSet = new Set();

      educationJson.forEach((item, index) => {
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

      setEducationEntries(educationJson);
    }

  }, [educationJson])
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewEntry((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleAddEntry = () => {
    setIsAdding(true);
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingEntryId(null);
    setNewEntry({
      id: '',
      school: '',
      location: '',
      gpa: '',
      degree: '',
      field_of_study: '',
      start_date: '',
      end_date: '',
      description: '',
      is_current: false,
      order: null,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const entryPayload = {
      id: editingEntryId || Date.now().toString(),
      school: newEntry.school,
      location: newEntry.location || null,
      gpa: newEntry.gpa || null,
      degree: newEntry.degree,
      field_of_study: newEntry.field_of_study,
      start_date: newEntry.start_date,
      end_date: newEntry.is_current ? null : newEntry.end_date,
      description: newEntry.description || null,
      is_current: newEntry.is_current,
      order: newEntry.order || educationEntries.length + 1,
    };

    let updatedEntries;
    if (editingEntryId) {
      updatedEntries = educationEntries.map(entry =>
        entry.id === editingEntryId ? entryPayload : entry
      );
    } else {
      updatedEntries = [...educationEntries, entryPayload];
    }

    setEducationEntries(updatedEntries);
    updateParentState(updatedEntries);
    handleCancel();
  };

  const handleEdit = (entry) => {
    setEditingEntryId(entry.id);
    setNewEntry({
      ...entry,
      is_current: !entry.end_date,
    });
  };

  const handleDelete = () => {
    const updatedEntries = educationEntries.filter(entry => entry.id !== deleteEntryId);
    setEducationEntries(updatedEntries);
    updateParentState(updatedEntries);
    setDeleteEntryId(null);
  };

  const moveEducation = (index, direction) => {
    const newEntries = [...educationEntries];
    const [movedItem] = newEntries.splice(index, 1);
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    newEntries.splice(newIndex, 0, movedItem);

    const updatedEntries = newEntries.map((entry, i) => ({
      ...entry,
      order: i + 1
    }));

    setEducationEntries(updatedEntries);
    updateParentState(updatedEntries);
  };

  return (
    <div className="collapse collapse-arrow border border-base-300 bg-base-100 rounded-box mb-4">
      <input type="checkbox" className="peer" />
      <div className="collapse-title text-xl font-medium">
        {icon}
        Education
      </div>
      <div className="collapse-content">
        {isAdding || editingEntryId ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-700">School</label>
              <input
                type="text"
                name="school"
                value={newEntry.school}
                onChange={handleChange}
                className="input input-bordered w-full"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700">Location</label>
              <input
                type="text"
                name="location"
                value={newEntry.location}
                onChange={handleChange}
                className="input input-bordered w-full"
              />
            </div>
            <div>
              <label className="block text-gray-700">GPA</label>
              <input
                type="text"
                name="gpa"
                value={newEntry.gpa}
                onChange={handleChange}
                className="input input-bordered w-full"
              />
            </div>
            <div>
              <label className="block text-gray-700">Degree</label>
              <input
                type="text"
                name="degree"
                value={newEntry.degree}
                onChange={handleChange}
                className="input input-bordered w-full"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700">Field of Study</label>
              <input
                type="text"
                name="field_of_study"
                value={newEntry.field_of_study}
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
                  required
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
                  disabled={newEntry.is_current}
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="is_current"
                  checked={newEntry.is_current}
                  onChange={handleChange}
                  className="checkbox checkbox-primary"
                />
                <label className="ml-2 text-gray-700">I am currently in this program</label>
              </div>
            </div>
            <div>
              <label className="block text-gray-700">Description</label>
              <textarea
                name="description"
                value={newEntry.description}
                onChange={handleChange}
                className="textarea textarea-bordered w-full"
              />
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
              + Add Education
            </button>
            {educationEntries.length > 0 ? (
              <ul>
                {educationEntries.map((entry, index) => (
                  <li key={entry.id} className="mb-4 border p-4 rounded relative">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-lg font-semibold">{entry.degree} in {entry.field_of_study}</h4>
                        <p className="text-gray-700">{entry.school}, {entry.location}</p>
                        <p className="text-gray-500">{entry.start_date} to {entry.end_date || 'Present'}</p>
                        <p className="text-gray-700">{entry.description}</p>
                      </div>
                      <div className="flex flex-col space-y-2">
                        <button
                          onClick={() => moveEducation(index, 'up')}
                          className="btn btn-sm btn-circle"
                          disabled={index === 0}
                        >
                          <ChevronUpIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => moveEducation(index, 'down')}
                          className="btn btn-sm btn-circle"
                          disabled={index === educationEntries.length - 1}
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
              <p>No education added yet</p>
            )}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteEntryId && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">Confirm Deletion</h3>
            <p className="py-4">Are you sure you want to delete this education entry?</p>
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

export default Education;