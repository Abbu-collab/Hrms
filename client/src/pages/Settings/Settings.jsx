import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
  FiUser, FiLock, FiBell, FiSliders, FiShield,
  FiSave, FiCheckCircle, FiAlertCircle, FiLoader,
  FiMail, FiPhone, FiBriefcase, FiEdit2
} from 'react-icons/fi';
import { getProfile, updateProfile } from '../../services/api';
import './Settings.css';

/* -----------------------------------------------------------------------
   localStorage helpers for UI-only preferences
----------------------------------------------------------------------- */
const UI_PREFS_KEY = 'hrms_ui_prefs';

const loadUIPrefs = () => {
  try {
    const saved = localStorage.getItem(UI_PREFS_KEY);
    return saved ? JSON.parse(saved) : {};
  } catch {
    return {};
  }
};

const saveUIPrefs = (prefs) => {
  try {
    localStorage.setItem(UI_PREFS_KEY, JSON.stringify(prefs));
  } catch {}
};

export default function Settings() {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState('profile');
  const canEditDepartment = user?.role === 'Admin' || user?.role === 'HR';

  // ── Profile State ──────────────────────────────────────────────────
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    department: user?.department || '',
  });
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileSaving, setProfileSaving] = useState(false);

  // ── Notification Preferences (UI-only, localStorage) ───────────────
  const savedPrefs = loadUIPrefs();
  const [notifPrefs, setNotifPrefs] = useState({
    emailNotifications: savedPrefs.emailNotifications ?? true,
    payrollUpdates: savedPrefs.payrollUpdates ?? true,
    smsAlerts: savedPrefs.smsAlerts ?? false,
  });
  const [notifSaving, setNotifSaving] = useState(false);

  // ── Load profile on mount ──────────────────────────────────────────
  useEffect(() => {
    const fetchProfile = async () => {
      setProfileLoading(true);
      try {
        const data = await getProfile();
        const u = data.user || {};
        setProfileForm({
          name: u.name || user?.name || '',
          email: u.email || user?.email || '',
          phone: u.phone || '',
          department: u.department || '',
        });
        if (updateUser && u.name) {
          updateUser(u);
        }
      } catch (err) {
        showToast('error', err.message || 'Failed to load profile.');
      } finally {
        setProfileLoading(false);
      }
    };
    fetchProfile();
  }, []);

  // ── Profile save ───────────────────────────────────────────────────
  const handleSaveProfile = async () => {
    if (!profileForm.name.trim()) {
      showToast('error', 'Name cannot be empty.');
      return;
    }
    setProfileSaving(true);
    try {
      const payload = {
        name: profileForm.name,
        phone: profileForm.phone,
      };
      if (canEditDepartment) {
        payload.department = profileForm.department;
      }
      const data = await updateProfile(payload);
      const updated = data.user || {};
      setProfileForm((prev) => ({
        ...prev,
        name: updated.name || prev.name,
        phone: updated.phone !== undefined ? updated.phone : prev.phone,
        department: updated.department || prev.department,
      }));
      
      if (updateUser) {
        updateUser(updated);
      }

      showToast('success', 'Profile updated successfully.');
    } catch (err) {
      showToast('error', err.message || 'Failed to save profile.');
    } finally {
      setProfileSaving(false);
    }
  };

  // ── Notification prefs save (localStorage) ─────────────────────────
  const handleSaveNotifications = () => {
    setNotifSaving(true);
    setTimeout(() => {
      saveUIPrefs({ ...loadUIPrefs(), ...notifPrefs });
      setNotifSaving(false);
      showToast('success', 'Notification preferences saved locally.');
    }, 400);
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: FiUser },
    { id: 'notifications', label: 'Notifications', icon: FiBell },
    { id: 'security', label: 'Security', icon: FiShield },
  ];

  return (
    <div className="settings-page">
      {/* Page Header */}
      <div className="page-header">
        <div className="page-title-box">
          <h1 className="page-title">Settings</h1>
          <p className="page-subtitle">Manage your profile, preferences, and security options.</p>
        </div>
      </div>

      {/* Tab Pills */}
      <div className="settings-nav-pills">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              className={`settings-pill ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <Icon size={15} /> {tab.label}
            </button>
          );
        })}
      </div>

      {/* ── PROFILE TAB ─────────────────────────────────────────────── */}
      {activeTab === 'profile' && (
        <div className="settings-section-card">
          <div className="card-header">
            <h3 className="card-title"><FiUser size={18} /> Personal Information</h3>
            <span className="settings-backend-badge">Saved to Server</span>
          </div>


          {profileLoading ? (
            <div className="settings-loading-state">
              <div className="settings-spinner" />
              Loading your profile...
            </div>
          ) : (
            <div className="settings-profile-grid">
              <div className="settings-form-group">
                <label className="settings-form-label">
                  <FiUser size={13} /> Full Name <span className="required">*</span>
                </label>
                <input
                  type="text"
                  className="settings-form-input"
                  value={profileForm.name}
                  onChange={(e) => setProfileForm((p) => ({ ...p, name: e.target.value }))}
                  placeholder="Enter your full name"
                />
              </div>

              <div className="settings-form-group">
                <label className="settings-form-label">
                  <FiMail size={13} /> Email Address
                </label>
                <input
                  type="email"
                  className="settings-form-input disabled"
                  value={profileForm.email}
                  disabled
                  title="Email cannot be changed"
                />
                <span className="settings-field-hint">Email address cannot be changed.</span>
              </div>

              <div className="settings-form-group">
                <label className="settings-form-label">
                  <FiPhone size={13} /> Phone Number
                </label>
                <input
                  type="text"
                  className="settings-form-input"
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm((p) => ({ ...p, phone: e.target.value }))}
                  placeholder="e.g. +91 9876543210"
                />
              </div>

              <div className="settings-form-group">
                <label className="settings-form-label">
                  <FiBriefcase size={13} /> Department {!canEditDepartment && '(Read-Only)'}
                </label>
                <input
                  type="text"
                  className={`settings-form-input ${!canEditDepartment ? 'disabled' : ''}`}
                  value={profileForm.department}
                  onChange={(e) => setProfileForm((p) => ({ ...p, department: e.target.value }))}
                  disabled={!canEditDepartment}
                  placeholder="e.g. Engineering"
                />
                {!canEditDepartment && (
                  <span className="settings-field-hint">Department can only be modified by Admin or HR.</span>
                )}
              </div>
            </div>
          )}

          <div className="settings-form-actions">
            <button
              className="btn-primary"
              onClick={handleSaveProfile}
              disabled={profileSaving || profileLoading}
            >
              {profileSaving ? (
                <><div className="settings-spinner-sm" /> Saving...</>
              ) : (
                <><FiSave size={15} /> Save Profile</>
              )}
            </button>
          </div>
        </div>
      )}

      {/* ── NOTIFICATIONS TAB ───────────────────────────────────────── */}
      {activeTab === 'notifications' && (
        <div className="settings-section-card">
          <div className="card-header">
            <h3 className="card-title"><FiBell size={18} /> Notification Preferences</h3>
            <span className="settings-local-badge">Saved Locally</span>
          </div>

          <div className="settings-info-banner">
            <FiAlertCircle size={15} />
            These preferences are saved in your browser. They control UI notifications only — server-side email delivery is managed by your administrator.
          </div>

          <div className="settings-item-row">
            <div className="settings-item-info">
              <h4>Email Notifications</h4>
              <p>Show in-app alerts for leave approvals, rejections, and system updates.</p>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={notifPrefs.emailNotifications}
                onChange={() => setNotifPrefs((p) => ({ ...p, emailNotifications: !p.emailNotifications }))}
              />
              <span className="toggle-slider" />
            </label>
          </div>

          <div className="settings-item-row">
            <div className="settings-item-info">
              <h4>Payroll & Salary Alerts</h4>
              <p>Display a banner when a new payslip is available in the Payroll section.</p>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={notifPrefs.payrollUpdates}
                onChange={() => setNotifPrefs((p) => ({ ...p, payrollUpdates: !p.payrollUpdates }))}
              />
              <span className="toggle-slider" />
            </label>
          </div>

          <div className="settings-item-row">
            <div className="settings-item-info">
              <h4>SMS Notifications</h4>
              <p>SMS delivery is configured server-side. This toggle is for future integration.</p>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={notifPrefs.smsAlerts}
                onChange={() => setNotifPrefs((p) => ({ ...p, smsAlerts: !p.smsAlerts }))}
              />
              <span className="toggle-slider" />
            </label>
          </div>

          <div className="settings-form-actions">
            <button className="btn-primary" onClick={handleSaveNotifications} disabled={notifSaving}>
              {notifSaving ? <><div className="settings-spinner-sm" /> Saving...</> : <><FiSave size={15} /> Save Preferences</>}
            </button>
          </div>
        </div>
      )}

      {/* ── SECURITY TAB ─────────────────────────────────────────────── */}
      {activeTab === 'security' && (
        <div className="settings-section-card">
          <div className="card-header">
            <h3 className="card-title"><FiShield size={18} /> Security & Access</h3>
          </div>

          <div className="settings-item-row">
            <div className="settings-item-info">
              <h4>Account Password</h4>
              <p>Update your password regularly to protect your HRMS account.</p>
            </div>
            <button className="btn-secondary" onClick={() => navigate('/change-password')}>
              <FiLock size={14} /> Change Password
            </button>
          </div>

          <div className="settings-item-row">
            <div className="settings-item-info">
              <h4>Active Session</h4>
              <p>
                Signed in as <strong>{user?.name || 'User'}</strong> ({user?.email || '—'}).
                Role: <strong>{user?.role || 'Employee'}</strong>.
              </p>
            </div>
            <button className="btn-outline" onClick={() => navigate('/profile')}>
              <FiUser size={14} /> View Profile
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
