import React from 'react';
import './Loader.css';

/**
 * Spinner Component
 */
export const Spinner = ({ size = 'md', className = '' }) => (
  <span className={`hrms-spinner hrms-spinner-${size} ${className}`} aria-label="Loading" />
);

/**
 * Section Loader Component
 */
export const SectionLoader = ({ text = 'Loading data...', size = 'md', className = '' }) => (
  <div className={`hrms-loader-section ${className}`}>
    <Spinner size={size} />
    {text && <span>{text}</span>}
  </div>
);

/**
 * Page Loader Component
 */
export const PageLoader = ({ text = 'Loading HRMS System...', className = '' }) => (
  <div className={`hrms-loader-page ${className}`}>
    <div className="hrms-loader-page-content">
      <Spinner size="lg" />
      {text && <span className="hrms-loader-page-text">{text}</span>}
    </div>
  </div>
);

/**
 * Skeleton Loader Component
 */
export const SkeletonLoader = ({ type = 'text', rows = 3, className = '' }) => {
  if (type === 'avatar') {
    return <div className={`hrms-skeleton hrms-skeleton-avatar ${className}`} />;
  }

  if (type === 'title') {
    return <div className={`hrms-skeleton hrms-skeleton-title ${className}`} />;
  }

  if (type === 'card') {
    return <div className={`hrms-skeleton hrms-skeleton-card ${className}`} />;
  }

  return (
    <div className={className}>
      {Array.from({ length: rows }).map((_, idx) => (
        <div key={idx} className="hrms-skeleton hrms-skeleton-text" style={{ width: `${100 - idx * 10}%` }} />
      ))}
    </div>
  );
};

/**
 * Unified Loader Router Component
 */
const Loader = ({ type = 'section', size = 'md', text = 'Loading...', rows = 3, className = '' }) => {
  switch (type) {
    case 'page':
      return <PageLoader text={text} className={className} />;
    case 'spinner':
      return <Spinner size={size} className={className} />;
    case 'skeleton':
      return <SkeletonLoader rows={rows} className={className} />;
    case 'section':
    default:
      return <SectionLoader text={text} size={size} className={className} />;
  }
};

Loader.Spinner = Spinner;
Loader.Section = SectionLoader;
Loader.Page = PageLoader;
Loader.Skeleton = SkeletonLoader;

export default Loader;
