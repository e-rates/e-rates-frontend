'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Search, User, MapPin, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { authService } from '@/lib/auth';
import axios from 'axios';

export const AllocateParcel = () => {
  const [parcelSearch, setParcelSearch] = useState('');
  const [userSearch, setUserSearch] = useState('');
  const [selectedParcel, setSelectedParcel] = useState<any>(null);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [parcels, setParcels] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [isSearchingParcels, setIsSearchingParcels] = useState(false);
  const [isSearchingUsers, setIsSearchingUsers] = useState(false);
  const [isAllocating, setIsAllocating] = useState(false);
  const [showParcelDropdown, setShowParcelDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  const searchParcels = useCallback(async (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setParcels([]);
      setShowParcelDropdown(false);
      return;
    }

    console.log('🔍 Searching for parcels:', searchTerm);
    setIsSearchingParcels(true);
    try {
      const token = await authService.getValidAccessToken();
      console.log('🔑 Got token:', token ? 'yes' : 'no');
      
      const response = await axios.get(
        `/api/admin/parcels/available_for_allocation?search=${searchTerm}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log('✅ Parcel response:', response.data);
      setParcels(response.data.parcels || response.data || []);
      setShowParcelDropdown(true);
    } catch (error: any) {
      console.error('❌ Parcel search error:', error);
      console.error('Error details:', error.response?.data);
      setParcels([]);
      setShowParcelDropdown(false);
    } finally {
      setIsSearchingParcels(false);
    }
  }, []);

  const searchUsers = useCallback(async (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setUsers([]);
      setShowUserDropdown(false);
      return;
    }

    console.log('🔍 Searching for users:', searchTerm);
    setIsSearchingUsers(true);
    try {
      const token = await authService.getValidAccessToken();
      console.log('🔑 Got token:', token ? 'yes' : 'no');
      
      const response = await axios.get(
        `/api/admin/parcels/available_users?search=${searchTerm}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log('✅ User response:', response.data);
      setUsers(response.data.users || response.data || []);
      setShowUserDropdown(true);
    } catch (error: any) {
      console.error('❌ User search error:', error);
      console.error('Error details:', error.response?.data);
      setUsers([]);
      setShowUserDropdown(false);
    } finally {
      setIsSearchingUsers(false);
    }
  }, []);

  // Debounce parcel search - only search with 3+ characters
  useEffect(() => {
    if (parcelSearch.length < 3) {
      setParcels([]);
      setIsSearchingParcels(false);
      setShowParcelDropdown(false);
      return;
    }

    const timer = setTimeout(() => {
      searchParcels(parcelSearch);
    }, 500);

    return () => clearTimeout(timer);
  }, [parcelSearch, searchParcels]);

  // Debounce user search - only search with 3+ characters
  useEffect(() => {
    if (userSearch.length < 3) {
      setUsers([]);
      setIsSearchingUsers(false);
      setShowUserDropdown(false);
      return;
    }

    const timer = setTimeout(() => {
      searchUsers(userSearch);
    }, 500);

    return () => clearTimeout(timer);
  }, [userSearch, searchUsers]);

  const handleSelectParcel = (parcel: any) => {
    setSelectedParcel(parcel);
    setParcelSearch(parcel.parcel_ref || parcel.parcel_number);
    setShowParcelDropdown(false);
  };

  const handleSelectUser = (user: any) => {
    setSelectedUser(user);
    setUserSearch(user.username || user.phone_number);
    setShowUserDropdown(false);
  };

  const handleAllocate = async () => {
    if (!selectedParcel) {
      toast.error('Please select a parcel');
      return;
    }

    if (!selectedUser) {
      toast.error('Please select a user');
      return;
    }

    setIsAllocating(true);
    try {
      const token = await authService.getValidAccessToken();
      await axios.post(
        `/api/admin/parcels/allocate_parcel`,
        {
          parcel_id: selectedParcel.parcel_id || selectedParcel.id,
          user_id: selectedUser.user_id || selectedUser.id,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast.success(
        `Parcel ${selectedParcel.parcel_ref || selectedParcel.parcel_number} allocated to ${selectedUser.username || selectedUser.phone_number}`
      );

      // Sync local database to update with new allocation
      console.log('🔄 Syncing local database...');
      try {
        const { syncService } = await import('@/lib/db/sync');
        await syncService.syncParcels(true); // Force sync
        console.log('✅ Local database synced');
      } catch (syncError) {
        console.error('⚠️ Failed to sync local database:', syncError);
        // Don't block the UI, just log the error
      }

      // Reset form
      setSelectedParcel(null);
      setSelectedUser(null);
      setParcels([]);
      setUsers([]);
      setParcelSearch('');
      setUserSearch('');
    } catch (error: any) {
      console.error('Allocation error:', error);
      toast.error(
        error.response?.data?.error || error.response?.data?.message || 'Failed to allocate parcel'
      );
    } finally {
      setIsAllocating(false);
    }
  };

  return (
    <div className="h-full w-full overflow-y-auto bg-background p-6">
      <div className="mx-auto max-w-4xl space-y-6">
        <div>
          <h2 className="text-2xl font-bold">Allocate Parcel to User</h2>
          <p className="text-muted-foreground">
            Search for a parcel and assign it to a registered user
          </p>
        </div>

        {/* Parcel Search */}
        <div className="space-y-4 rounded-lg border p-6">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">Select Parcel</h3>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            {isSearchingParcels && (
              <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-primary" />
            )}
            <input
              type="text"
              placeholder="Enter parcel number (min 3 characters)..."
              value={parcelSearch}
              onChange={(e) => {
                setParcelSearch(e.target.value);
                setSelectedParcel(null);
              }}
              onFocus={() => parcels.length > 0 && setShowParcelDropdown(true)}
              className="w-full rounded-md border bg-background px-10 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
            />

            {/* Autocomplete Dropdown */}
            {showParcelDropdown && parcels.length > 0 && (
              <div className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md border bg-background shadow-lg">
                {parcels.map((parcel, index) => (
                  <div
                    key={parcel.parcel_id || index}
                    onClick={() => handleSelectParcel(parcel)}
                    className="cursor-pointer border-b px-4 py-3 hover:bg-accent last:border-b-0"
                  >
                    <p className="font-semibold">
                      {parcel.parcel_ref || parcel.parcel_number}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {parcel.area_name || parcel.zone || parcel.ward || 'No area'} • Available
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Search hints */}
          {parcelSearch.length > 0 && parcelSearch.length < 3 && (
            <p className="text-sm text-muted-foreground">
              Type at least 3 characters to search...
            </p>
          )}
          {parcelSearch.length >= 3 && !isSearchingParcels && parcels.length === 0 && (
            <p className="text-sm text-yellow-600">
              No available parcels found matching "{parcelSearch}"
            </p>
          )}

          {selectedParcel && (
            <div className="rounded-md bg-primary/10 p-3">
              <p className="text-sm font-medium text-primary">
                Selected: {selectedParcel.parcel_ref || selectedParcel.parcel_number}
              </p>
            </div>
          )}
        </div>

        {/* User Search */}
        <div className="space-y-4 rounded-lg border p-6">
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">Select User</h3>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            {isSearchingUsers && (
              <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-primary" />
            )}
            <input
              type="text"
              placeholder="Enter name or phone (min 3 characters)..."
              value={userSearch}
              onChange={(e) => {
                setUserSearch(e.target.value);
                setSelectedUser(null);
              }}
              onFocus={() => users.length > 0 && setShowUserDropdown(true)}
              className="w-full rounded-md border bg-background px-10 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
            />

            {/* Autocomplete Dropdown */}
            {showUserDropdown && users.length > 0 && (
              <div className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md border bg-background shadow-lg">
                {users.map((user) => (
                  <div
                    key={user.id}
                    onClick={() => handleSelectUser(user)}
                    className="cursor-pointer border-b px-4 py-3 hover:bg-accent last:border-b-0"
                  >
                    <p className="font-semibold">
                      {user.username || 'No username'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {user.phone_number || user.email}
                    </p>
                    {user.national_id && (
                      <p className="text-xs text-muted-foreground">
                        ID: {user.national_id}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Search hints */}
          {userSearch.length > 0 && userSearch.length < 3 && (
            <p className="text-sm text-muted-foreground">
              Type at least 3 characters to search...
            </p>
          )}
          {userSearch.length >= 3 && !isSearchingUsers && users.length === 0 && (
            <p className="text-sm text-yellow-600">
              No users found matching "{userSearch}"
            </p>
          )}

          {selectedUser && (
            <div className="rounded-md bg-primary/10 p-3">
              <p className="text-sm font-medium text-primary">
                Selected: {selectedUser.username || selectedUser.phone_number}
              </p>
            </div>
          )}
        </div>

        {/* Allocate Button */}
        <div className="flex justify-end">
          <button
            onClick={handleAllocate}
            disabled={!selectedParcel || !selectedUser || isAllocating}
            className="rounded-md bg-primary px-6 py-3 font-semibold text-white hover:bg-primary/90 disabled:opacity-50"
          >
            {isAllocating ? 'Allocating...' : 'Allocate Parcel'}
          </button>
        </div>
      </div>
    </div>
  );
};
