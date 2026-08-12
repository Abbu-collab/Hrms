import React from 'react';
import './Card.css';

/**
 * Card Header Component
 */
export const CardHeader = ({
  title,
  subtitle,
  action,
  children,
  clean = false,
  className = ''
}) => {
  return (
    <div className={`hrms-card-header ${clean ? 'hrms-card-header-clean' : ''} ${className}`}>
      {title || subtitle ? (
        <div className="hrms-card-title-group">
          {title && <h3 className="hrms-card-title">{title}</h3>}
          {subtitle && <p className="hrms-card-subtitle">{subtitle}</p>}
        </div>
      ) : (
        children
      )}
      {action && <div className="hrms-card-header-action">{action}</div>}
    </div>
  );
};

/**
 * Card Body Component
 */
export const CardBody = ({ children, className = '' }) => {
  return <div className={`hrms-card-body ${className}`}>{children}</div>;
};

/**
 * Card Footer Component
 */
export const CardFooter = ({ children, className = '' }) => {
  return <div className={`hrms-card-footer ${className}`}>{children}</div>;
};

/**
 * Reusable Enterprise Card Component
 */
const Card = ({
  children,
  title,
  subtitle,
  action,
  hoverable = false,
  animated = true,
  onClick,
  className = '',
  style = {}
}) => {
  const classes = [
    'hrms-card',
    hoverable ? 'hrms-card-hoverable' : '',
    animated ? 'hrms-card-animated' : '',
    className
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classes} onClick={onClick} style={style}>
      {title || subtitle || action ? (
        <CardHeader title={title} subtitle={subtitle} action={action} />
      ) : null}
      <CardBody>{children}</CardBody>
    </div>
  );
};

Card.Header = CardHeader;
Card.Body = CardBody;
Card.Footer = CardFooter;

export default Card;
