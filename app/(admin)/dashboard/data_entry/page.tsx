'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { authService, userService } from '@/lib/auth';
import { backendJson } from '@/lib/backend';
import toast from 'react-hot-toast';
import { LocationSelector, LocationOption } from './LocationSelector';
import { FileUploadZone } from './FileUploadZone';
import { AdvancedOptions } from './AdvancedOptions';
import { UploadProgress } from './UploadProgress';
import { UploadResultModal, UploadResult } from './UploadResultModal';
import { AlertModal } from './AlertModal';
import { UploadSuccessView } from './UploadSuccessView';
import { useRouter } from 'next/navigation';
import { DuplicateWarningModal } from '../../components/DuplicateWarningModal';
import {
  checkForDuplicates,
  stripDuplicates,
  DuplicateCheckResult,
} from '@/lib/ml/duplicateDetection';
import { BackendGeoJSONFeature } from '@/lib/db/normalize';
import {
  getCountyLocations,
  saveCountyLocations,
  SubCountyRecord,
  WardRecord,
} from './locationsData';
import { WardsManager } from './WardsManager';

const COUNTY_LOGOS: Record<string, string> = {
  nairobi: '/NRB-logo.png',
};

const DataEntry = () => {
  const router = useRouter();
  const [files, setFiles] = useState<File[]>([]);
  const [showAlert, setShowAlert] = useState(false);

  // Dynamic county detection
  const [county, setCounty] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('countyName') || 'Nyeri';
    }
    return 'Nyeri';
  });

  const [countyLogo, setCountyLogo] = useState<string | null>(null);
  const [countyInitials, setCountyInitials] = useState<string>('NY');

  // Locations state (subcounties and wards for current county)
  const [subCounties, setSubCounties] = useState<SubCountyRecord[]>([]);
  const [wards, setWards] = useState<WardRecord[]>([]);

  // Selected values
  const [subCounty, setSubCounty] = useState('');
  const [ward, setWard] = useState('');
  const [refField, setRefField] = useState('PARCEL_ID');
  const [clearExisting, setClearExisting] = useState(false);

  // Upload state
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [duplicateCheckResult, setDuplicateCheckResult] =
    useState<DuplicateCheckResult | null>(null);
  const [processedFeatures, setProcessedFeatures] = useState<
    BackendGeoJSONFeature[] | null
  >(null);

  // Detect active county on mount
  useEffect(() => {
    const detectCounty = async () => {
      try {
        // Try profile first
        const profile = await userService.getProfile().catch(() => null);
        const profileCounty = profile?.data?.county || profile?.county || profile?.county_name;

        // Try county mine
        const countyData = await backendJson<{ county: { name: string; logo_url: string | null } | null }>('/api/counties/mine/').catch(() => null);
        const mineCounty = countyData?.county?.name;

        const resolved = mineCounty || profileCounty || localStorage.getItem('countyName') || 'Nyeri';
        const cleanName = resolved.trim();

        setCounty(cleanName);
        localStorage.setItem('countyName', cleanName);

        // Logo
        const customLogo = countyData?.county?.logo_url || COUNTY_LOGOS[cleanName.toLowerCase()];
        setCountyLogo(customLogo || null);
        setCountyInitials(cleanName.slice(0, 2).toUpperCase());
      } catch (err) {
        console.error('Error detecting county:', err);
      }
    };

    detectCounty();
  }, []);

  // Load locations when county changes
  useEffect(() => {
    if (!county) return;
    const locs = getCountyLocations(county);
    setSubCounties(locs.subCounties);
    setWards(locs.wards);
    setSubCounty('');
    setWard('');
  }, [county]);

  // Options for sub-county dropdown
  const subCountiesOptions: LocationOption[] = useMemo(() => {
    return subCounties.map((sc) => ({
      value: sc.name,
      label: sc.name,
    }));
  }, [subCounties]);

  // Options for ward dropdown (filters by selected sub-county)
  const wardsOptions: LocationOption[] = useMemo(() => {
    const pool = subCounty
      ? wards.filter((w) => w.subCountyName.toLowerCase() === subCounty.toLowerCase())
      : wards;
    return pool.map((w) => ({
      value: w.name,
      label: w.name,
    }));
  }, [wards, subCounty]);

  const handleFilesChange = (newFiles: File[]) => {
    setFiles(newFiles);
    setUploadResult(null);
    setShowResult(false);
  };

  const handleInvalidFile = () => {
    setShowAlert(true);
    setTimeout(() => setShowAlert(false), 3000);
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      toast.error('Please select a ZIP file to upload');
      return;
    }

    if (!subCounty) {
      toast.error('Please select a sub-county');
      return;
    }

    try {
      // Step 1: Parse shapefile locally
      const checkingToast = toast.loading('Checking for duplicates...');
      const zipBuffer = await files[0].arrayBuffer();

      const shp = (await import('shpjs')).default;
      const geojson = await shp(zipBuffer);

      let features: any[] = [];
      if (Array.isArray(geojson)) {
        features = geojson.flatMap((fc) => fc.features);
      } else if (geojson && geojson.features) {
        features = geojson.features;
      }

      // Step 2: Check for duplicates
      const duplicateResult = await checkForDuplicates(features);
      toast.dismiss(checkingToast);

      if (duplicateResult.hasDuplicates) {
        setDuplicateCheckResult(duplicateResult);
        setProcessedFeatures(features);
        return;
      }

      await performUpload(files[0]);
    } catch (error: any) {
      console.error('Pre-upload check error:', error);
      toast.error('Proceeding with upload...');
      await performUpload(files[0]);
    }
  };

  const performUpload = async (file: File) => {
    if (!subCounty) {
      toast.error('Please select a sub-county');
      return;
    }

    try {
      setIsUploading(true);
      setUploadProgress(0);
      setUploadResult(null);

      const token = await authService.getValidAccessToken();
      if (!token) {
        toast.error('Authentication required. Please log in again.');
        return;
      }

      const formData = new FormData();
      formData.append('zip_file', file);
      formData.append('county', county);
      formData.append('sub_county', subCounty);
      if (ward) formData.append('ward', ward);
      formData.append('ref_field', refField);
      formData.append('status', 'active');
      formData.append('clear_existing', String(clearExisting));

      const loadingToast = toast.loading('Uploading shapefile...');
      const xhr = new XMLHttpRequest();

      const result = await new Promise<UploadResult>((resolve, reject) => {
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            const progress = Math.round((e.loaded / e.total) * 100);
            setUploadProgress(progress);
          }
        });

        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const response = JSON.parse(xhr.responseText);
              resolve(response);
            } catch (error) {
              resolve({
                success: false,
                message: 'Invalid JSON response from server',
                errors: ['Invalid server response'],
                error_count: 1,
                imported_count: 0,
                skipped_count: 0,
              });
            }
          } else {
            try {
              const errorData = JSON.parse(xhr.responseText);
              resolve({
                success: false,
                message: errorData.message || 'Upload failed',
                errors: errorData.errors || [errorData.message || 'Upload failed'],
                error_count: errorData.error_count || 1,
                imported_count: 0,
                skipped_count: 0,
              });
            } catch (error) {
              resolve({
                success: false,
                message: `Upload failed (HTTP ${xhr.status})`,
                errors: [`HTTP error ${xhr.status}`],
                error_count: 1,
                imported_count: 0,
                skipped_count: 0,
              });
            }
          }
        });

        xhr.addEventListener('error', () => {
          resolve({
            success: false,
            message: 'Network error occurred during upload',
            errors: ['Network connection error'],
            error_count: 1,
            imported_count: 0,
            skipped_count: 0,
          });
        });

        xhr.addEventListener('abort', () => {
          reject(new Error('Upload cancelled'));
        });

        xhr.open('POST', '/api/admin/parcels/upload_shapefile');
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
        xhr.send(formData);
      });

      toast.dismiss(loadingToast);

      if (result.success) {
        setUploadResult(result);
        setUploadSuccess(true);
        toast.success(result.message);
      } else {
        setUploadResult(result);
        setShowResult(true);
        toast.error(result.message);
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error.message || 'Failed to upload shapefile');
      setUploadResult({
        success: false,
        message: error.message || 'Upload failed',
        imported_count: 0,
        skipped_count: 0,
        error_count: 1,
        errors: [error.message || 'Unknown error occurred'],
      });
      setShowResult(true);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleUploadAnother = () => {
    setUploadSuccess(false);
    setUploadResult(null);
    setFiles([]);
    setSubCounty('');
    setWard('');
    setRefField('PARCEL_ID');
    setClearExisting(false);
  };

  const handleAssignOwners = () => {
    router.push('/dashboard/allocations');
  };

  const handleSkip = () => {
    router.push('/dashboard/home');
  };

  const handleStripDuplicates = async () => {
    if (!duplicateCheckResult || !processedFeatures) return;
    const duplicateIndices = duplicateCheckResult.duplicates.map((d) => d.uploadedIndex);
    const uniqueFeatures = stripDuplicates(processedFeatures, duplicateIndices);

    toast.success(
      `Removed ${duplicateCheckResult.duplicateCount} duplicates. Uploading ${uniqueFeatures.length} unique parcels...`
    );

    setDuplicateCheckResult(null);
    setProcessedFeatures(null);
    await performUpload(files[0]);
  };

  const handleContinueWithDuplicates = async () => {
    setDuplicateCheckResult(null);
    setProcessedFeatures(null);
    await performUpload(files[0]);
  };

  const handleCancelUpload = () => {
    setDuplicateCheckResult(null);
    setProcessedFeatures(null);
    toast('Upload cancelled', { icon: 'ℹ️' });
  };

  return (
    <div className="h-full w-full overflow-y-auto">
      <AlertModal
        isOpen={showAlert}
        message="Please upload only ZIP files"
        onClose={() => setShowAlert(false)}
      />

      {duplicateCheckResult && (
        <DuplicateWarningModal
          result={duplicateCheckResult}
          onContinueWithDuplicates={handleContinueWithDuplicates}
          onStripDuplicates={handleStripDuplicates}
          onCancel={handleCancelUpload}
        />
      )}

      <UploadResultModal
        isOpen={showResult}
        result={uploadResult}
        onClose={() => setShowResult(false)}
      />

      {uploadSuccess && uploadResult ? (
        <UploadSuccessView
          result={uploadResult}
          onUploadAnother={handleUploadAnother}
          onAssignOwners={handleAssignOwners}
          onSkip={handleSkip}
        />
      ) : (
        /* Divided into 2 columns on desktop: Shapefile upload left, Wards & Sub-Counties right */
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-0 items-start pb-8">
          {/* Left Column: Shapefile Upload — compact horizontal layout */}
          <div className="xl:col-span-4 bg-card-bg border-r border-border-default p-4 flex flex-col gap-3">
            {/* Selectors row */}
            <LocationSelector
              county={county}
              countyLogo={countyLogo}
              countyInitials={countyInitials}
              subCounty={subCounty}
              ward={ward}
              subCounties={subCountiesOptions}
              wards={wardsOptions}
              onSubCountyChange={setSubCounty}
              onWardChange={setWard}
              disabled={isUploading}
            />

            {/* File upload */}
            <FileUploadZone
              files={files}
              onFilesChange={handleFilesChange}
              onInvalidFile={handleInvalidFile}
              disabled={isUploading}
            />

            {/* Advanced Options + Continue in one row */}
            <div className="flex items-start gap-3">
              <div className="flex-1">
                <AdvancedOptions
                  isOpen={showAdvanced}
                  onOpenChange={setShowAdvanced}
                  refField={refField}
                  onRefFieldChange={setRefField}
                  clearExisting={clearExisting}
                  onClearExistingChange={setClearExisting}
                  disabled={isUploading}
                />
              </div>
              <UploadProgress
                isUploading={isUploading}
                progress={uploadProgress}
                onUpload={handleUpload}
                disabled={files.length === 0 || !subCounty}
              />
            </div>
          </div>

          {/* Right Column: Sub-Counties & Wards Manager — wider */}
          <div className="xl:col-span-8 h-full">
            <WardsManager
              county={county}
              subCounties={subCounties}
              wards={wards}
              onLocationsChange={(newSc, newW) => {
                setSubCounties(newSc);
                setWards(newW);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default DataEntry;
