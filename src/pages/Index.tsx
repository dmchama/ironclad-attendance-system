
import { useState } from 'react';
import LoginTypeSelector from '@/components/LoginTypeSelector';
import AuthComponent from '@/components/AuthComponent';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const [selectedType, setSelectedType] = useState<'admin' | 'member' | 'super_admin' | null>(null);
  const navigate = useNavigate();

  const handleSelectType = (type: 'admin' | 'member' | 'super_admin') => {
    if (type === 'member') {
      navigate('/member');
    } else if (type === 'super_admin') {
      navigate('/super-admin');
    } else {
      setSelectedType(type);
    }
  };

  if (!selectedType) {
    return <LoginTypeSelector onSelectType={handleSelectType} />;
  }

  return <AuthComponent />;
};

export default Index;
