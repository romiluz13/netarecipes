import { useState } from 'react';

function Login() {
  const [isLoading, setIsLoading] = useState(false);
  
  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // ... existing login logic
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/');
    } catch (error) {
      console.error(error);
      // Handle error appropriately
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      {/* ... existing JSX */}
      <button 
        type="submit" 
        disabled={isLoading}
      >
        {isLoading ? 'מתחבר...' : 'התחבר'}
      </button>
      {/* ... */}
    </div>
  );
} 