import { BACKEND_URL } from '@/lib/backend';
/**
 * API utility functions
 */

const API_BASE_URL = '/api';

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

interface RequestOptions extends RequestInit {
  token?: string;
}

async function apiFetch<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { token, headers, ...restOptions } = options;

  const config: RequestInit = {
    ...restOptions,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...headers,
    },
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

    let data;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    if (!response.ok) {
      throw new ApiError(
        data.message || `HTTP error! status: ${response.status}`,
        response.status,
        data
      );
    }

    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      error instanceof Error ? error.message : 'Network error occurred',
      0
    );
  }
}

export async function apiGet<T>(endpoint: string, token?: string): Promise<T> {
  return apiFetch<T>(endpoint, {
    method: 'GET',
    token,
  });
}

export async function apiPost<T>(
  endpoint: string,
  data?: any,
  token?: string
): Promise<T> {
  return apiFetch<T>(endpoint, {
    method: 'POST',
    body: JSON.stringify(data),
    token,
  });
}

export async function apiPut<T>(
  endpoint: string,
  data?: any,
  token?: string
): Promise<T> {
  return apiFetch<T>(endpoint, {
    method: 'PUT',
    body: JSON.stringify(data),
    token,
  });
}

export async function apiPatch<T>(
  endpoint: string,
  data?: any,
  token?: string
): Promise<T> {
  return apiFetch<T>(endpoint, {
    method: 'PATCH',
    body: JSON.stringify(data),
    token,
  });
}

export async function apiDelete<T>(
  endpoint: string,
  token?: string
): Promise<T> {
  return apiFetch<T>(endpoint, {
    method: 'DELETE',
    token,
  });
}

export function getAuthToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('authToken');
  }
  return null;
}

export function setAuthToken(token: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('authToken', token);
  }
}

export function removeAuthToken(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('authToken');
  }
}

// Shapefile upload types
export interface ShapefileUploadRequest {
  zip_file: File;
  county: string;
  sub_county: string;
  ward?: string;
  ref_field?: string;
  status?: string;
  owner_username?: string;
  clear_existing?: boolean;
}

export interface ShapefileUploadResponse {
  success: boolean;
  message: string;
  imported_count: number;
  skipped_count: number;
  error_count: number;
  errors: string[];
  shapefile_info?: {
    layer_name: string;
    feature_count: number;
    geometry_type: string;
    srid: number;
    fields: string[];
  };
}

// Upload shapefile with multipart/form-data
export async function uploadShapefile(
  data: ShapefileUploadRequest,
  token: string,
  onProgress?: (progress: number) => void
): Promise<ShapefileUploadResponse> {
  const formData = new FormData();

  formData.append('zip_file', data.zip_file);
  formData.append('county', data.county);
  formData.append('sub_county', data.sub_county);

  if (data.ward) formData.append('ward', data.ward);
  if (data.ref_field) formData.append('ref_field', data.ref_field);
  if (data.status) formData.append('status', data.status);
  if (data.owner_username)
    formData.append('owner_username', data.owner_username);
  if (data.clear_existing !== undefined) {
    formData.append('clear_existing', String(data.clear_existing));
  }

  try {
    const xhr = new XMLHttpRequest();

    return new Promise((resolve, reject) => {
      // Track upload progress
      if (onProgress) {
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            const progress = Math.round((e.loaded / e.total) * 100);
            onProgress(progress);
          }
        });
      }

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText);
            resolve(response);
          } catch (error) {
            reject(new ApiError('Invalid JSON response', xhr.status));
          }
        } else {
          try {
            const errorData = JSON.parse(xhr.responseText);
            reject(
              new ApiError(
                errorData.message || `HTTP error! status: ${xhr.status}`,
                xhr.status,
                errorData
              )
            );
          } catch (error) {
            reject(
              new ApiError(`HTTP error! status: ${xhr.status}`, xhr.status)
            );
          }
        }
      });

      xhr.addEventListener('error', () => {
        reject(new ApiError('Network error occurred', 0));
      });

      xhr.addEventListener('abort', () => {
        reject(new ApiError('Upload cancelled', 0));
      });

      // Use the backend API directly
      xhr.open('POST', `${BACKEND_URL}/api/parcels/upload_shapefile`);
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      xhr.send(formData);
    });
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      error instanceof Error ? error.message : 'Upload failed',
      0
    );
  }
}

export default {
  apiFetch,
  ApiError,
  get: apiGet,
  post: apiPost,
  put: apiPut,
  patch: apiPatch,
  del: apiDelete,
  uploadFile: uploadShapefile,
};
