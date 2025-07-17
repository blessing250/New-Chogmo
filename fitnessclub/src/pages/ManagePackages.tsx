import React, { useState, useEffect } from 'react';
import { apiFetch } from '../api';

interface ServicePackage {
  _id: string;
  name: string;
  description: string;
  price: number;
  sessionsIncluded: number;
  type: 'sauna' | 'gym' | 'massage';
  duration: string;
}

const ManagePackages = () => {
  const [packages, setPackages] = useState<ServicePackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [sessionsIncluded, setSessionsIncluded] = useState("");
  const [type, setType] = useState<'sauna' | 'gym' | 'massage'>('gym');
  const [duration, setDuration] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingPackageId, setEditingPackageId] = useState<string | null>(null);

  const fetchPackages = async () => {
    try {
      setLoading(true);
      const data = await apiFetch("/packages");
      setPackages(data);
    } catch (err: any) {
      setError(err.message || "Failed to fetch packages");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPackages();
  }, []);

  const handleEditClick = (pkg: ServicePackage) => {
    setEditingPackageId(pkg._id);
    setName(pkg.name);
    setDescription(pkg.description);
    setPrice(String(pkg.price));
    setSessionsIncluded(String(pkg.sessionsIncluded));
    setType(pkg.type);
    setDuration(pkg.duration);
  };

  const handleCancelEdit = () => {
    setEditingPackageId(null);
    setName("");
    setDescription("");
    setPrice("");
    setSessionsIncluded("");
    setType('gym');
    setDuration("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const packageData = {
      name,
      description,
      price: Number(price),
      sessionsIncluded: Number(sessionsIncluded),
      type,
      duration,
    };

    try {
      if (editingPackageId) {
        // Update existing package
        const updatedPackage = await apiFetch(`/packages/${editingPackageId}`, {
          method: 'PUT',
          body: JSON.stringify(packageData),
        });
        setPackages(
          packages.map((p) => (p._id === editingPackageId ? updatedPackage : p))
        );
      } else {
        // Create new package
        const newPackage = await apiFetch('/packages', {
          method: 'POST',
          body: JSON.stringify(packageData),
        });
        setPackages([newPackage, ...packages]);
      }
      
      // Reset form and editing state
      handleCancelEdit();

    } catch (err: any) {
      setError(err.message || 'Failed to save package.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (packageId: string) => {
    if (window.confirm("Are you sure you want to delete this package?")) {
      try {
        await apiFetch(`/packages/${packageId}`, { method: "DELETE" });
        setPackages(packages.filter((pkg) => pkg._id !== packageId));
      } catch (err: any) {
        setError(err.message || "Failed to delete package.");
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">
        Loading Packages...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-orange-500 mb-8">Manage Service Packages</h1>

        {error && (
          <div className="bg-red-500/20 text-red-300 p-3 rounded-md mb-4">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Column 1: Add/Edit Package Form */}
          <div className="bg-black border border-gray-800 p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold text-white mb-4">
              {editingPackageId ? 'Edit Package' : 'Add New Package'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="name" className="block text-sm font-medium text-gray-300">Package Name</label>
                <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} className="mt-1 block w-full bg-gray-900 border border-gray-700 rounded-md shadow-sm text-white p-3 focus:ring-orange-500 focus:border-orange-500" required />
              </div>
              <div className="mb-4">
                <label htmlFor="description" className="block text-sm font-medium text-gray-300">Description</label>
                <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="mt-1 block w-full bg-gray-900 border border-gray-700 rounded-md shadow-sm text-white p-3 focus:ring-orange-500 focus:border-orange-500" required />
              </div>
              <div className="mb-4">
                <label htmlFor="price" className="block text-sm font-medium text-gray-300">Price (RWF)</label>
                <input type="number" id="price" value={price} onChange={(e) => setPrice(e.target.value)} className="mt-1 block w-full bg-gray-900 border border-gray-700 rounded-md shadow-sm text-white p-3 focus:ring-orange-500 focus:border-orange-500" required />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label htmlFor="type" className="block text-sm font-medium text-gray-300">Type</label>
                  <select id="type" value={type} onChange={(e) => setType(e.target.value as any)} className="mt-1 block w-full bg-gray-900 border border-gray-700 rounded-md shadow-sm text-white p-3 focus:ring-orange-500 focus:border-orange-500" required>
                    <option value="gym">Gym</option>
                    <option value="sauna">Sauna</option>
                    <option value="massage">Massage</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="duration" className="block text-sm font-medium text-gray-300">Duration</label>
                  <input type="text" id="duration" value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="e.g., Monthly, 30 Days" className="mt-1 block w-full bg-gray-900 border border-gray-700 rounded-md shadow-sm text-white p-3 focus:ring-orange-500 focus:border-orange-500" required />
                </div>
              </div>
              <div className="mb-4">
                <label htmlFor="sessionsIncluded" className="block text-sm font-medium text-gray-300">Number of Sessions</label>
                <input type="number" id="sessionsIncluded" value={sessionsIncluded} onChange={(e) => setSessionsIncluded(e.target.value)} className="mt-1 block w-full bg-gray-900 border border-gray-700 rounded-md shadow-sm text-white p-3 focus:ring-orange-500 focus:border-orange-500" required />
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <button type="submit" disabled={isSubmitting} className="w-full bg-orange-600 text-white py-2 px-4 rounded-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:bg-gray-500">
                  {isSubmitting ? (editingPackageId ? 'Updating...' : 'Adding...') : (editingPackageId ? 'Update Package' : 'Add Package')}
                </button>
                {editingPackageId && (
                  <button type="button" onClick={handleCancelEdit} className="w-full bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500">
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Column 2: Existing Packages */}
          <div className="md:col-span-2 bg-black border border-gray-800 p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold text-white mb-4">Existing Packages</h2>
            <div className="space-y-4">
              {packages.map((pkg) => (
                <div key={pkg._id} className="bg-gray-900 border border-gray-800 p-4 rounded-lg flex justify-between items-center">
                  <div className="flex-grow">
                    <h3 className="font-semibold text-lg text-white">{pkg.name}</h3>
                    <p className="text-sm text-gray-400">{pkg.description}</p>
                    <div className="text-sm text-gray-300 mt-1">
                      <span className="font-bold">{pkg.price} RWF</span> / <span>{pkg.duration}</span>
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      <span className="font-semibold">Type:</span> {pkg.type} | <span className="font-semibold">Sessions:</span> {pkg.sessionsIncluded}
                    </div>
                  </div>
                  <div className="flex-shrink-0 flex items-center space-x-2">
                    <button onClick={() => handleEditClick(pkg)} className="text-blue-400 hover:text-blue-300">Edit</button>
                    <button onClick={() => handleDelete(pkg._id)} className="text-red-500 hover:text-red-400">Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagePackages;
