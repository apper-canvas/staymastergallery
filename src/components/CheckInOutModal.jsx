import { useState, useEffect } from 'react';
import { getIcon } from '../utils/iconUtils';
import { format } from 'date-fns';

const CheckInOutModal = ({ isOpen, onClose, reservation, mode, onSubmit }) => {
  // Icons
  const XIcon = getIcon('x');
  const UserIcon = getIcon('user');
  const CreditCardIcon = getIcon('credit-card');
  const CheckIcon = getIcon('check');
  const AlertCircleIcon = getIcon('alert-circle');
  const LoaderIcon = getIcon('loader');

  // Form state
  const [formData, setFormData] = useState({
    identificationMethod: 'driverLicense',
    identificationNumber: '',
    creditCardLast4: '',
    signature: false,
    agreeToTerms: false,
    feedbackRating: 5,
    feedbackComment: ''
  });

  // UI state
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when modal opens or mode changes
  useEffect(() => {
    if (isOpen) {
      setFormData({
        identificationMethod: 'driverLicense',
        identificationNumber: '',
        creditCardLast4: '',
        signature: false,
        agreeToTerms: false,
        feedbackRating: 5,
        feedbackComment: ''
      });
      setErrors({});
    }
  }, [isOpen, mode]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Clear error for this field when user types
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (mode === 'check-in') {
      if (!formData.identificationNumber) {
        newErrors.identificationNumber = 'Identification number is required';
      }

      if (!formData.creditCardLast4) {
        newErrors.creditCardLast4 = 'Credit card information is required';
      } else if (!/^\d{4}$/.test(formData.creditCardLast4)) {
        newErrors.creditCardLast4 = 'Please enter the last 4 digits of your credit card';
      }

      if (!formData.signature) {
        newErrors.signature = 'Signature is required';
      }

      if (!formData.agreeToTerms) {
        newErrors.agreeToTerms = 'You must agree to the terms and conditions';
      }
    }

    if (mode === 'check-out' && formData.feedbackRating === 0) {
      newErrors.feedbackRating = 'Please provide a rating';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      let success;
      
      if (mode === 'check-in') {
        success = await onSubmit(reservation.id, {
          identificationMethod: formData.identificationMethod,
          identificationNumber: formData.identificationNumber,
          creditCardVerified: true
        });
      } else {
        success = await onSubmit(reservation.id, {
          feedbackRating: formData.feedbackRating,
          feedbackComment: formData.feedbackComment
        });
      }
      
      if (success) {
        onClose();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-surface-900 bg-opacity-75" onClick={onClose}></div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>

        <div className="inline-block overflow-hidden text-left align-bottom transition-all transform bg-white dark:bg-surface-800 rounded-lg shadow-xl sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium leading-6 text-surface-900 dark:text-white">
                {mode === 'check-in' ? 'Check-In Process' : 'Check-Out Process'}
              </h3>
              <button 
                onClick={onClose}
                className="text-surface-500 hover:text-surface-700 dark:text-surface-400 dark:hover:text-white"
              >
                <XIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-4 p-3 bg-surface-100 dark:bg-surface-700 rounded-lg">
              <p className="text-sm font-medium">
                {reservation.roomType} - Room {reservation.roomNumber}
              </p>
              <p className="text-xs text-surface-600 dark:text-surface-400 mt-1">
                <span className="inline-block bg-surface-200 dark:bg-surface-600 px-2 py-1 rounded text-surface-900 dark:text-white font-medium">{format(new Date(reservation.checkInDate), 'MMM dd, yyyy')}</span> <span className="mx-1">-</span> <span className="inline-block bg-surface-200 dark:bg-surface-600 px-2 py-1 rounded text-surface-900 dark:text-white font-medium">{format(new Date(reservation.checkOutDate), 'MMM dd, yyyy')}</span>
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              {mode === 'check-in' ? (
                <>
                  <div className="mb-4">
                    <label className="label" htmlFor="identificationMethod">
                      Identification Method
                    </label>
                    <select
                      id="identificationMethod"
                      name="identificationMethod"
                      value={formData.identificationMethod}
                      onChange={handleChange}
                      className="input"
                    >
                      <option value="driverLicense">Driver's License</option>
                      <option value="passport">Passport</option>
                      <option value="idCard">ID Card</option>
                    </select>
                  </div>

                  <div className="mb-4">
                    <label className="label" htmlFor="identificationNumber">
                      Identification Number
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <UserIcon className="w-4 h-4 text-surface-500 dark:text-surface-400" />
                      </div>
                      <input
                        type="text"
                        id="identificationNumber"
                        name="identificationNumber"
                        value={formData.identificationNumber}
                        onChange={handleChange}
                        className={`input pl-10 ${errors.identificationNumber ? 'border-red-500' : ''}`}
                        placeholder="Enter identification number"
                      />
                    </div>
                    {errors.identificationNumber && (
                      <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                        {errors.identificationNumber}
                      </p>
                    )}
                  </div>

                  <div className="mb-4">
                    <label className="label" htmlFor="creditCardLast4">
                      Last 4 Digits of Credit Card
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <CreditCardIcon className="w-4 h-4 text-surface-500 dark:text-surface-400" />
                      </div>
                      <input
                        type="text"
                        id="creditCardLast4"
                        name="creditCardLast4"
                        value={formData.creditCardLast4}
                        onChange={handleChange}
                        className={`input pl-10 ${errors.creditCardLast4 ? 'border-red-500' : ''}`}
                        placeholder="XXXX"
                        maxLength={4}
                      />
                    </div>
                    {errors.creditCardLast4 && (
                      <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                        {errors.creditCardLast4}
                      </p>
                    )}
                  </div>

                  <div className="mb-4">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="signature"
                        name="signature"
                        checked={formData.signature}
                        onChange={handleChange}
                        className={`h-4 w-4 rounded border-surface-300 text-primary focus:ring-primary dark:border-surface-600 dark:bg-surface-700 ${errors.signature ? 'border-red-500' : ''}`}
                      />
                      <label htmlFor="signature" className="ml-2 block text-sm text-surface-700 dark:text-surface-300">
                        I confirm that the information provided is accurate
                      </label>
                    </div>
                    {errors.signature && (
                      <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                        {errors.signature}
                      </p>
                    )}
                  </div>

                  <div className="mb-4">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="agreeToTerms"
                        name="agreeToTerms"
                        checked={formData.agreeToTerms}
                        onChange={handleChange}
                        className={`h-4 w-4 rounded border-surface-300 text-primary focus:ring-primary dark:border-surface-600 dark:bg-surface-700 ${errors.agreeToTerms ? 'border-red-500' : ''}`}
                      />
                      <label htmlFor="agreeToTerms" className="ml-2 block text-sm text-surface-700 dark:text-surface-300">
                        I agree to the hotel's terms and conditions
                      </label>
                    </div>
                    {errors.agreeToTerms && (
                      <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                        {errors.agreeToTerms}
                      </p>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <div className="mb-4">
                    <label className="label" htmlFor="feedbackRating">
                      How would you rate your stay? (1-5)
                    </label>
                    <div className="flex space-x-2 my-2">
                      {[1, 2, 3, 4, 5].map((rating) => (
                        <button
                          key={rating}
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, feedbackRating: rating }))}
                          className={`h-10 w-10 rounded-full flex items-center justify-center ${
                            formData.feedbackRating >= rating
                              ? 'bg-primary text-white'
                              : 'bg-surface-200 dark:bg-surface-700 text-surface-600 dark:text-surface-400'
                          }`}
                        >
                          {rating}
                        </button>
                      ))}
                    </div>
                    {errors.feedbackRating && (
                      <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                        {errors.feedbackRating}
                      </p>
                    )}
                  </div>

                  <div className="mb-4">
                    <label className="label" htmlFor="feedbackComment">
                      Comments about your stay (optional)
                    </label>
                    <textarea
                      id="feedbackComment"
                      name="feedbackComment"
                      value={formData.feedbackComment}
                      onChange={handleChange}
                      rows={3}
                      className="input"
                      placeholder="Tell us about your experience..."
                    />
                  </div>
                </>
              )}

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="btn-outline"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`btn ${mode === 'check-in' ? 'btn-primary' : 'btn-secondary'}`}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <LoaderIcon className="w-5 h-5 mr-2 animate-spin" />
                  ) : mode === 'check-in' ? (
                    <CheckIcon className="w-5 h-5 mr-2" />
                  ) : (
                    <AlertCircleIcon className="w-5 h-5 mr-2" />
                  )}
                  {mode === 'check-in' ? 'Complete Check-In' : 'Complete Check-Out'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckInOutModal;