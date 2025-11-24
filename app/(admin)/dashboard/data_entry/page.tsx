'use client';

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/app/components/ui/resizable';
import React, { useState } from 'react';
import { nairobiSubCounties } from './subcounties';
import { nairobiWards } from './wards';
import { BlurInLoader } from '@/app/components/blur-in-loader';
import { authService } from '@/lib/auth';
import toast from 'react-hot-toast';
import { LocationSelector } from './LocationSelector';
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
import { EPSGSelector } from './EPSGSelector';
import { Button } from '@/app/components/ui/button';

type ShapefileInfo = NonNullable<UploadResult['shapefile_info']>;

const DataEntry = () => {
  const router = useRouter();
  const [files, setFiles] = useState<File[]>([]);
  const [showAlert, setShowAlert] = useState(false);

  // Form state
  const [county] = useState('Nairobi');
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

  const [sourceEpsg, setSourceEpsg] = useState<number | undefined>(undefined);
  const [shapefileInfo, setShapefileInfo] = useState<ShapefileInfo | null>(null);
  const [epsgSuggestions, setEpsgSuggestions] = useState<Array<{
    epsg: number | null;
    name: string;
    confidence: string;
    reason: string;
  }>>([]);
  const [needsEpsg, setNeedsEpsg] = useState(false);

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

    // Clear previous EPSG error state when retrying with selected EPSG
    if (sourceEpsg && needsEpsg) {
      setNeedsEpsg(false);
      setUploadResult(null);
      setShowResult(false);
    }

    try {
      // Step 1: Parse shapefile locally (dynamic import for performance)
      const checkingToast = toast.loading('Checking for duplicates...');
      const zipBuffer = await files[0].arrayBuffer();

      // Dynamically import shpjs only when needed
      const shp = (await import('shpjs')).default;
      const geojson = (await shp(zipBuffer)) as any;
      const features = geojson.features as BackendGeoJSONFeature[];

      // Step 2: Check for duplicates
      const duplicateResult = await checkForDuplicates(features);
      toast.dismiss(checkingToast);

      if (duplicateResult.hasDuplicates) {
        // Show duplicate warning modal
        setDuplicateCheckResult(duplicateResult);
        setProcessedFeatures(features);
        return; // Pause upload until user decides
      }

      // No duplicates, proceed with upload
      await performUpload(files[0]);
    } catch (error: any) {
      console.error('Pre-upload check error:', error);
      toast.error('Failed to check for duplicates, proceeding anyway...');
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
      formData.append('area_name', subCounty); // Django might expect 'area_name' instead of 'sub_county'
      if (ward) formData.append('ward', ward);
      formData.append('ref_field', refField);
      formData.append('status', 'active');
      formData.append('clear_existing', String(clearExisting));
      formData.append('auto_generate_ref', 'true'); // Enable auto-generation
      if (sourceEpsg) {
        formData.append('source_epsg', String(sourceEpsg)); // Add EPSG
        console.log('🔍 Uploading with source_epsg:', sourceEpsg);
      } else {
        console.log('⚠️ No source_epsg provided');
      }

      // Log what we're sending for debugging
      console.log('📤 Uploading with params:', {
        area_name: subCounty,
        ward: ward,
        ref_field: refField,
        status: 'active',
        clear_existing: String(clearExisting),
      });

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
              reject(new Error('Invalid JSON response'));
            }
          } else {
            try {
              const errorData = JSON.parse(xhr.responseText);
              console.error('❌ Backend error response:', errorData);
              // Create error with full response as JSON string for parsing later
              const error = new Error(errorData.message || 'Upload failed');
              (error as any).fullResponse = errorData;
              reject(error);
            } catch (error) {
              reject(new Error(`HTTP error! status: ${xhr.status}`));
            }
          }
        });

        xhr.addEventListener('error', () => {
          reject(new Error('Network error occurred'));
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
      console.log('sourceEpsg at error time:', sourceEpsg);
      
      // Try to parse error response for EPSG suggestions
      let errorResult: UploadResult | null = null;
      
      // First check if error has fullResponse property from backend
      if (error.fullResponse) {
        errorResult = error.fullResponse;
        console.log('📦 Using fullResponse:', errorResult);
      } else {
        // Fallback: try to parse from error message
        try {
          if (error.message && error.message.includes('{')) {
            const jsonMatch = error.message.match(/\{.*\}/);
            if (jsonMatch) {
              errorResult = JSON.parse(jsonMatch[0]);
            }
          }
        } catch (e) {
          // Couldn't parse error as JSON
        }
      }
      
      // Detect coordinate system errors and extract extent if available
      const errorMsg = error.message || '';
      const isCoordSystemError = 
        errorMsg.includes('coordinate system') || 
        errorMsg.includes('.prj file') ||
        errorMsg.includes('EPSG') ||
        errorMsg.includes('out of valid WGS84 range');
      
      // Extract extent from error message if available
      let detectedExtent: number[] | undefined;
      const extentMatch = errorMsg.match(/extent:\s*([\d.]+),\s*([\d.]+),\s*([\d.]+),\s*([\d.]+)/);
      if (extentMatch) {
        detectedExtent = [
          parseFloat(extentMatch[1]),
          parseFloat(extentMatch[2]),
          parseFloat(extentMatch[3]),
          parseFloat(extentMatch[4])
        ];
      }
      
      // Only show EPSG suggestions if user hasn't already provided an EPSG
      const shouldShowEpsgSuggestions = !sourceEpsg && isCoordSystemError;
      
      // Check if error contains EPSG suggestions from backend
      if (shouldShowEpsgSuggestions && errorResult?.shapefile_info?.epsg_suggestions) {
        setShapefileInfo(errorResult.shapefile_info);
        setEpsgSuggestions(errorResult.shapefile_info.epsg_suggestions);
        setNeedsEpsg(true);
        
        // Auto-select first high-confidence suggestion
        const bestSuggestion = errorResult.shapefile_info.epsg_suggestions.find(
          (s) => s.confidence === 'high'
        );
        if (bestSuggestion?.epsg) {
          setSourceEpsg(bestSuggestion.epsg);
          toast.error(
            `Missing projection detected. Auto-selected EPSG:${bestSuggestion.epsg}. Review and click Upload again.`,
            { duration: 8000 }
          );
        } else {
          toast.error(
            'Coordinate system missing. Please select EPSG code below and upload again.',
            { duration: 6000 }
          );
        }
        
        // Don't show error modal for EPSG issues - let user see the selector
        return;
      } 
      // If no backend suggestions but coordinate system error, create frontend suggestions
      else if (shouldShowEpsgSuggestions && detectedExtent) {
        const [xmin, ymin, xmax, ymax] = detectedExtent;
        
        // Generate suggestions based on extent (Kenya-specific)
        const suggestions = [];
        
        // Check for Kenya UTM Zone 37S (most common)
        if (xmin >= 100000 && xmax <= 900000 && ymin >= 9800000 && ymax <= 10500000) {
          suggestions.push({
            epsg: 21037,
            name: 'Arc 1960 / UTM zone 37S (Kenya)',
            confidence: 'high',
            reason: 'Coordinates match Kenya Arc 1960 UTM 37S range'
          });
          suggestions.push({
            epsg: 32737,
            name: 'WGS 84 / UTM zone 37S',
            confidence: 'medium',
            reason: 'Alternative UTM zone 37S projection'
          });
        }
        // Check for Kenya UTM Zone 36S
        else if (xmin >= 100000 && xmax <= 900000 && ymin >= 9000000 && ymax <= 10500000) {
          suggestions.push({
            epsg: 21036,
            name: 'Arc 1960 / UTM zone 36S (Kenya)',
            confidence: 'high',
            reason: 'Coordinates match Kenya Arc 1960 UTM 36S range (Western Kenya)'
          });
          suggestions.push({
            epsg: 32736,
            name: 'WGS 84 / UTM zone 36S',
            confidence: 'medium',
            reason: 'Alternative UTM zone 36S projection'
          });
        }
        // General projected coordinates
        else if (xmin >= 100000 && ymin >= 1000000) {
          suggestions.push({
            epsg: 21037,
            name: 'Arc 1960 / UTM zone 37S (Try this first)',
            confidence: 'medium',
            reason: 'Most common for Kenya shapefiles'
          });
          suggestions.push({
            epsg: 21036,
            name: 'Arc 1960 / UTM zone 36S',
            confidence: 'medium',
            reason: 'Common for Western Kenya'
          });
        }
        
        if (suggestions.length > 0) {
          setEpsgSuggestions(suggestions);
          setNeedsEpsg(true);
          setShapefileInfo({
            layer_name: '',
            feature_count: 0,
            geometry_type: '',
            srid: null,
            coordinate_system_type: '',
            fields: [],
            extent: detectedExtent,
            needs_manual_epsg: true
          });
          
          // Auto-select the first high-confidence suggestion
          const bestSuggestion = suggestions.find((s) => s.confidence === 'high');
          if (bestSuggestion?.epsg) {
            setSourceEpsg(bestSuggestion.epsg);
            toast.error(
              `Missing .prj file detected. Auto-selected EPSG:${bestSuggestion.epsg}. Review and click Upload again.`,
              { duration: 8000 }
            );
          } else {
            toast.error(
              'Coordinate system missing. Please select EPSG code below and upload again.',
              { duration: 6000 }
            );
          }
          
          // Don't show error modal for EPSG issues - let user see the selector
          return;
        } else {
          setNeedsEpsg(true);
          toast.error(
            'Coordinate system not found. Please manually enter the EPSG code (e.g., 21037) below.',
            { duration: 8000 }
          );
          // Don't show error modal for EPSG issues
          return;
        }
      } else {
        toast.error(error.message || 'Failed to upload shapefile');
      }
      
      setUploadResult(errorResult || {
        success: false,
        message: error.message || 'Upload failed',
        imported_count: 0,
        skipped_count: 0,
        error_count: 1,
        errors: [error.message || 'Unknown error occurred'],
        shapefile_info: detectedExtent ? {
          layer_name: '',
          feature_count: 0,
          geometry_type: '',
          srid: null,
          coordinate_system_type: '',
          fields: [],
          extent: detectedExtent,
          needs_manual_epsg: true
        } : undefined
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
    // Reset EPSG state
    setSourceEpsg(undefined);
    setShapefileInfo(null);
    setEpsgSuggestions([]);
    setNeedsEpsg(false);
  };

  const handleAssignOwners = () => {
    router.push('/dashboard/parcels-map?tab=allocate');
  };

  const handleStripDuplicates = async () => {
    if (!duplicateCheckResult || !processedFeatures) return;

    const duplicateIndices = duplicateCheckResult.duplicates.map(
      (d) => d.uploadedIndex
    );
    const uniqueFeatures = stripDuplicates(processedFeatures, duplicateIndices);

    // Create new file with only unique features
    const uniqueGeoJSON = {
      type: 'FeatureCollection',
      features: uniqueFeatures,
    };

    // Convert back to shapefile (simplified: we'll just send the filtered data)
    toast.success(
      `Removed ${duplicateCheckResult.duplicateCount} duplicates. Uploading ${uniqueFeatures.length} unique parcels...`
    );

    setDuplicateCheckResult(null);
    setProcessedFeatures(null);

    // For now, proceed with original file but backend should handle filtering
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
    toast.error('Upload cancelled');
  };

  return (
    <BlurInLoader isLoading={false}>
      <>
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
          />
        ) : (
          <ResizablePanelGroup
            direction="vertical"
            className="min-w-[600px] py-2"
          >
            <ResizablePanel defaultSize={25} minSize={20} maxSize={35}>
              <LocationSelector
                county={county}
                subCounty={subCounty}
                ward={ward}
                subCounties={nairobiSubCounties}
                wards={nairobiWards}
                onSubCountyChange={setSubCounty}
                onWardChange={setWard}
                disabled={isUploading}
              />
            </ResizablePanel>

            <ResizableHandle />

            <ResizablePanel defaultSize={75}>
              <div className="h-full overflow-y-auto">
                <div className="flex flex-col items-center space-y-4 px-4 py-2">
                  <FileUploadZone
                    files={files}
                    onFilesChange={handleFilesChange}
                    onInvalidFile={handleInvalidFile}
                    disabled={isUploading}
                  />

                  {/* EPSG Selector - Always visible */}
                  <EPSGSelector
                    sourceEpsg={sourceEpsg}
                    onSourceEpsgChange={setSourceEpsg}
                    suggestions={epsgSuggestions}
                    disabled={isUploading}
                    needsEpsg={needsEpsg}
                  />

                  {/* Retry Upload Button - Shows when EPSG is auto-selected */}
                  {needsEpsg && sourceEpsg && files.length > 0 && (
                    <div className="w-full max-w-3xl">
                      <Button
                        onClick={handleUpload}
                        disabled={isUploading || !subCounty}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-6 text-lg"
                      >
                        {isUploading ? 'Uploading...' : `Upload with EPSG:${sourceEpsg}`}
                      </Button>
                    </div>
                  )}

                  {/* Shapefile Info Display */}
                  {shapefileInfo && (
                    <div className="w-full max-w-3xl rounded-lg border border-border bg-card p-4">
                      <h4 className="font-medium mb-2">📊 Shapefile Information</h4>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>Features:</div>
                        <div className="font-mono">{shapefileInfo.feature_count}</div>
                        
                        <div>Geometry:</div>
                        <div className="font-mono">{shapefileInfo.geometry_type}</div>
                        
                        <div>Coordinate System:</div>
                        <div className="font-mono">
                          {shapefileInfo.srid ? (
                            <span className="text-green-600">EPSG:{shapefileInfo.srid}</span>
                          ) : (
                            <span className="text-yellow-600">⚠️ Not defined</span>
                          )}
                        </div>
                        
                        <div>Status:</div>
                        <div>
                          {shapefileInfo.srid === 4326 ? (
                            <span className="text-green-600">✅ WGS84 - Ready</span>
                          ) : shapefileInfo.needs_manual_epsg ? (
                            <span className="text-yellow-600">⚠️ Needs EPSG</span>
                          ) : (
                            <span className="text-blue-600">🔄 Will reproject</span>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  <AdvancedOptions
                    isOpen={showAdvanced}
                    onOpenChange={setShowAdvanced}
                    refField={refField}
                    onRefFieldChange={setRefField}
                    clearExisting={clearExisting}
                    onClearExistingChange={setClearExisting}
                    disabled={isUploading}
                  />

                  <UploadProgress
                    isUploading={isUploading}
                    progress={uploadProgress}
                    onUpload={handleUpload}
                    disabled={files.length === 0 || !subCounty}
                  />
                </div>
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        )}
      </>
    </BlurInLoader>
  );
};

export default DataEntry;
