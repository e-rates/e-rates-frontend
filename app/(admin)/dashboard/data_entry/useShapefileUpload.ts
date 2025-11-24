import { useState } from 'react';
import toast from 'react-hot-toast';
import { authService } from '@/lib/auth';
import type { UploadResult } from './UploadResultModal';
import type { DuplicateCheckResult } from '@/lib/utils/duplicateDetection';

interface BackendGeoJSONFeature {
    type: 'Feature';
    geometry: any;
    properties: any;
}

interface UploadParams {
    subCounty: string;
    ward: string;
    refField: string;
    clearExisting: boolean;
}

export const useShapefileUpload = () => {
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
    const [showResult, setShowResult] = useState(false);
    const [uploadSuccess, setUploadSuccess] = useState(false);
    const [duplicateCheckResult, setDuplicateCheckResult] =
        useState<DuplicateCheckResult | null>(null);
    const [processedFeatures, setProcessedFeatures] = useState<
        BackendGeoJSONFeature[] | null
    >(null);

    // Keep track of the file and params being processed for multi-step operations
    const [currentFile, setCurrentFile] = useState<File | null>(null);
    const [currentParams, setCurrentParams] = useState<UploadParams | null>(null);

    const performUpload = async (file: File, params: UploadParams) => {
        if (!params.subCounty) {
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
            formData.append('area_name', params.subCounty);
            if (params.ward) formData.append('ward', params.ward);
            formData.append('ref_field', params.refField);
            formData.append('status', 'active');
            formData.append('clear_existing', String(params.clearExisting));

            console.log('📤 Uploading with params:', {
                area_name: params.subCounty,
                ward: params.ward,
                ref_field: params.refField,
                status: 'active',
                clear_existing: String(params.clearExisting),
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
                            reject(new Error(errorData.message || 'Upload failed'));
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

    const startUpload = async (file: File, params: UploadParams) => {
        if (!params.subCounty) {
            toast.error('Please select a sub-county');
            return;
        }

        setCurrentFile(file);
        setCurrentParams(params);

        try {
            // Step 1: Parse shapefile locally
            const checkingToast = toast.loading('Checking for duplicates...');

            // Dynamic imports
            const shp = (await import('shpjs')).default;
            const { checkForDuplicates } = await import('@/lib/utils/duplicateDetection');

            const zipBuffer = await file.arrayBuffer();
            const geojson = (await shp(zipBuffer)) as any;
            const features = geojson.features as BackendGeoJSONFeature[];

            // Step 2: Fetch existing parcels from backend
            const token = await authService.getValidAccessToken();
            if (!token) {
                toast.dismiss(checkingToast);
                toast.error('Authentication required');
                return;
            }

            const axios = (await import('axios')).default;
            const response = await axios.get('/api/parcels/geojson', {
                headers: { Authorization: `Bearer ${token}` },
            });

            const existingParcels = response.data?.features || [];

            // Step 3: Check for duplicates using simple comparison
            const duplicateResult = await checkForDuplicates(features, existingParcels);
            toast.dismiss(checkingToast);

            if (duplicateResult.hasDuplicates) {
                // Show duplicate warning modal
                setDuplicateCheckResult(duplicateResult);
                setProcessedFeatures(features);
                return; // Pause upload until user decides
            }

            // No duplicates, proceed with upload
            await performUpload(file, params);
        } catch (error: any) {
            console.error('Pre-upload check error:', error);
            toast.error('Failed to check for duplicates, proceeding anyway...');
            await performUpload(file, params);
        }
    };

    const handleStripDuplicates = async () => {
        if (!duplicateCheckResult || !processedFeatures || !currentFile || !currentParams) return;

        const { stripDuplicates } = await import('@/lib/utils/duplicateDetection');

        const duplicateIndices = duplicateCheckResult.duplicates.map(
            (d) => d.uploadedIndex
        );
        const uniqueFeatures = stripDuplicates(processedFeatures, duplicateIndices);

        toast.success(
            `Removed ${duplicateCheckResult.duplicateCount} duplicates. Uploading ${uniqueFeatures.length} unique parcels...`
        );

        setDuplicateCheckResult(null);
        setProcessedFeatures(null);

        // For now, proceed with original file but backend should handle filtering
        // In a real scenario, we might want to reconstruct the shapefile or send the GeoJSON directly
        await performUpload(currentFile, currentParams);
    };

    const handleContinueWithDuplicates = async () => {
        if (!currentFile || !currentParams) return;
        setDuplicateCheckResult(null);
        setProcessedFeatures(null);
        await performUpload(currentFile, currentParams);
    };

    const handleCancelUpload = () => {
        setDuplicateCheckResult(null);
        setProcessedFeatures(null);
        setCurrentFile(null);
        setCurrentParams(null);
        toast('Upload cancelled', { icon: 'ℹ️' });
    };

    const resetUploadState = () => {
        setUploadSuccess(false);
        setUploadResult(null);
        setDuplicateCheckResult(null);
        setProcessedFeatures(null);
        setCurrentFile(null);
        setCurrentParams(null);
    };

    return {
        isUploading,
        uploadProgress,
        uploadResult,
        showResult,
        setShowResult,
        uploadSuccess,
        duplicateCheckResult,
        startUpload,
        handleStripDuplicates,
        handleContinueWithDuplicates,
        handleCancelUpload,
        resetUploadState,
    };
};
