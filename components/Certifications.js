// components/Certifications.js
import React, { useEffect, useState } from 'react';
import { PencilIcon, TrashIcon, CheckIcon, XIcon, ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/solid';

const Certifications = ({ setCertificationsJson, icon, certificationsJson }) => {
  const [certificationEntries, setCertificationEntries] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingEntryId, setEditingEntryId] = useState(null);
  const [deleteEntryId, setDeleteEntryId] = useState(null);
  const [newEntry, setNewEntry] = useState({
    id: '',
    certification: '',
    provider: '',
    awarded_date: '',
    description: '',
    order: null,
  });

  const updateParentState = (entries) => {
    setCertificationsJson(entries.map(cert => ({
      certification: cert.certification,
      provider: cert.provider,
      date: cert.awarded_date,
      description: cert.description
    })));
  };


  useEffect(() => {
    if (certificationsJson?.length) {
      console.log(certificationsJson);
      let keys = Object.keys(certificationsJson[0]);

      // Create a Set to track existing IDs
      let idSet = new Set();

      certificationsJson.forEach((item, index) => {
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

      setCertificationEntries(certificationsJson);
    }
  }, [certificationsJson])

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewEntry((prev) => ({
      ...prev,
      [name]: value,
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
      certification: '',
      provider: '',
      awarded_date: '',
      description: '',
      order: null,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const entryPayload = {
      id: editingEntryId || Date.now().toString(),
      certification: newEntry.certification,
      provider: newEntry.provider,
      awarded_date: newEntry.awarded_date,
      description: newEntry.description,
      order: newEntry.order || certificationEntries.length + 1,
    };

    let updatedEntries;
    if (editingEntryId) {
      updatedEntries = certificationEntries.map(entry =>
        entry.id === editingEntryId ? entryPayload : entry
      );
    } else {
      updatedEntries = [...certificationEntries, entryPayload];
    }

    setCertificationEntries(updatedEntries);
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
    const updatedEntries = certificationEntries.filter(entry => entry.id !== deleteEntryId);
    setCertificationEntries(updatedEntries);
    updateParentState(updatedEntries);
    setDeleteEntryId(null);
  };

  const moveCertification = (index, direction) => {
    const newEntries = [...certificationEntries];
    const [movedItem] = newEntries.splice(index, 1);
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    newEntries.splice(newIndex, 0, movedItem);

    const updatedEntries = newEntries.map((entry, i) => ({
      ...entry,
      order: i + 1
    }));

    setCertificationEntries(updatedEntries);
    updateParentState(updatedEntries);
  };

  return (
    <div className="collapse collapse-arrow border border-base-300 bg-base-100 rounded-box mb-4">
      <input type="checkbox" className="peer" />
      <div className="collapse-title text-xl font-medium">
        {icon}
        Certifications
      </div>
      <div className="collapse-content">
        {isAdding || editingEntryId ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-700">Certification</label>
              <input
                type="text"
                name="certification"
                value={newEntry.certification}
                onChange={handleChange}
                className="input input-bordered w-full"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700">Provider</label>
              <input
                type="text"
                name="provider"
                value={newEntry.provider}
                onChange={handleChange}
                className="input input-bordered w-full"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700">Awarded Date</label>
              <input
                type="date"
                name="awarded_date"
                value={newEntry.awarded_date}
                onChange={handleChange}
                className="input input-bordered w-full"
                required
              />
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
              + Add Certification
            </button>
            {certificationEntries.length > 0 ? (
              <ul>
                {certificationEntries.map((entry, index) => (
                  <li key={entry.id} className="mb-4 border p-4 rounded relative">
                    <div className="flex justify-between items-start">
                      <div className="flex-grow">
                        <h4 className="text-lg font-semibold">{entry.certification}</h4>
                        <p className="text-gray-700">{entry.provider}</p>
                        <p className="text-gray-500">{entry.awarded_date}</p>
                        <p className="text-gray-700">{entry.description}</p>
                      </div>
                      <div className="flex flex-col space-y-2 ml-4">
                        <button
                          onClick={() => moveCertification(index, 'up')}
                          className="btn btn-sm btn-circle"
                          disabled={index === 0}
                        >
                          <ChevronUpIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => moveCertification(index, 'down')}
                          className="btn btn-sm btn-circle"
                          disabled={index === certificationEntries.length - 1}
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
              <p>No certifications added yet</p>
            )}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteEntryId && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">Confirm Deletion</h3>
            <p className="py-4">Are you sure you want to delete this certification entry?</p>
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

export default Certifications;