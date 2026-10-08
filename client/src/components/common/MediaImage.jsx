import { useState } from 'react';
import { User } from 'lucide-react';

const MediaImage = ({ src, alt, style, className }) => {
  const [error, setError] = useState(false);

  const getDirectImageUrl = (url) => {
    if (!url) return '';
    if (url.includes('drive.google.com/file/d/')) {
      const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
      if (match && match[1]) {
        return `https://drive.google.com/uc?export=view&id=${match[1]}`;
      }
    }
    return url;
  };

  const finalSrc = getDirectImageUrl(src);

  // Premium fallback state using Lucide User icon
  if (!src || error) {
    return (
      <div 
        style={{ 
          ...style, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          backgroundColor: 'var(--bg-secondary)', 
          color: 'var(--text-secondary)',
          border: '1px solid var(--border-color)'
        }} 
        className={className}
      >
        <User size={style.width ? parseInt(style.width) / 2 : 24} opacity={0.5} />
      </div>
    );
  }

  return (
    <img 
      src={finalSrc} 
      alt={alt} 
      style={{ objectFit: 'cover', ...style }} 
      className={className}
      onError={() => setError(true)}
    />
  );
};

export default MediaImage;