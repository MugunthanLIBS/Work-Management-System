import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { loginSuccess } from '../store/authSlice';
import { validateToken } from '../services/authService';

const AuthChecker = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();

  useEffect(() => {
    const checkAuth = async () => {
      console.log('🔍 AuthChecker: Starting authentication check...');
      
      try {
        console.log('🔍 AuthChecker: Calling validateToken API...');
        const response = await validateToken();
        
        console.log('✅ AuthChecker: Full response:', response);
        console.log('👤 User object:', response.user);
        console.log('🆔 User ID:', response.user?.id);
        console.log('📧 User Email:', response.user?.email);
        console.log('👤 User Name:', response.user?.name);
        console.log('🔑 Role:', response.role);
        
        if (response.user && response.role && response.user.id) {
          console.log('✅ AuthChecker: Valid session found with ID, dispatching loginSuccess');
          console.log('✅ Dispatching payload:', {
            user: response.user,
            role: response.role,
          });
          
          dispatch(loginSuccess({
            user: response.user,
            role: response.role,
          }));
          
          console.log('✅ AuthChecker: Redux state updated');
        } else {
          console.log('❌ AuthChecker: Invalid response - missing user.id');
          console.log('❌ Response structure:', JSON.stringify(response, null, 2));
        }
      } catch (err) {
        console.error('❌ AuthChecker: Validation failed:', err);
        console.error('❌ Error details:', err.response?.data);
      } finally {
        console.log('🏁 AuthChecker: Loading complete');
        setLoading(false);
      }
    };

    checkAuth();
  }, [dispatch]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p className="mt-4 text-gray-600 font-semibold">Checking authentication...</p>
        </div>
      </div>
    );
  }

  return children;
};

export default AuthChecker;