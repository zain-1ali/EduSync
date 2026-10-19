export function getApiError(error, fallback = 'Something went wrong. Please try again.') {
  const apiError = error?.response?.data?.error;
  const details = Array.isArray(apiError?.details) ? apiError.details : [];
  const detailText = details
    .map((item) => (typeof item === 'string' ? item : item?.message))
    .filter(Boolean)
    .join(' ');
  if (detailText) return detailText;
  return apiError?.message || error?.response?.data?.message || error?.message || fallback;
}
